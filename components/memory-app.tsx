'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, CalendarDays, Camera, Check, Gift, Heart, ImagePlus, LoaderCircle, LockKeyhole, MapPin, Plus, Sparkles, Star, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Memory = { id: string; title: string; description: string; category: 'viaje' | 'momento'; date: string; location?: string; mediaUrl?: string; mediaType?: string };
const demos: Memory[] = [
  { id: 'demo-1', title: 'El comienzo de todo', description: 'Ese instante en el que empezó nuestra aventura favorita.', category: 'momento', date: 'Nuestro primer capítulo', location: 'Donde todo cambió' },
  { id: 'demo-2', title: 'Perdernos juntos', description: 'Un mapa, mil risas y la certeza de que cualquier lugar es casa contigo.', category: 'viaje', date: 'Una escapada inolvidable', location: 'Nuestro rincón del mundo' },
  { id: 'demo-3', title: 'La magia de lo cotidiano', description: 'Porque contigo hasta un martes cualquiera merece guardarse para siempre.', category: 'momento', date: 'Un día bonito', location: 'A tu lado' },
];

export default function MemoryApp() {
  const [memories, setMemories] = useState<Memory[]>(demos);
  const [filter, setFilter] = useState<'todos' | 'viaje' | 'momento'>('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [surprise, setSurprise] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { fetch('/api/memories').then((r) => r.ok ? r.json() : []).then((items: Memory[]) => { if (items.length) setMemories(items); }).catch(() => {}); }, []);
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: 'create_memory', title: 'Guardar un recuerdo', description: 'Crea y guarda un recuerdo de Maxime sin archivo multimedia.',
      inputSchema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, category: { type: 'string', enum: ['viaje','momento'] }, date: { type: 'string' }, location: { type: 'string' } }, required: ['title','description','category','date'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input: unknown) => { const value = input as Record<string,string>; if (!value.title || !value.description || !['viaje','momento'].includes(value.category) || !value.date) throw new Error('Recuerdo no válido'); const data = new FormData(); Object.entries(value).forEach(([key,val]) => data.set(key,val)); const response = await fetch('/api/memories',{method:'POST',body:data}); if (!response.ok) throw new Error('No se pudo guardar'); const memory = await response.json() as Memory; setMemories((current) => [memory,...current.filter((item) => !item.id.startsWith('demo-'))]); return { id: memory.id, status: 'guardado', title: memory.title }; },
    };
    try { void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(() => {}); } catch {}
    return () => lifecycle.abort();
  }, []);
  const visible = useMemo(() => filter === 'todos' ? memories : memories.filter((m) => m.category === filter), [filter, memories]);

  async function createMemory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setSaved(false); const form = event.currentTarget;
    try { const response = await fetch('/api/memories', { method: 'POST', body: new FormData(form) }); if (!response.ok) throw new Error(); const memory = await response.json() as Memory; setMemories((current) => [memory, ...current.filter((item) => !item.id.startsWith('demo-'))]); setSaved(true); form.reset(); setTimeout(() => { setFormOpen(false); setSaved(false); }, 900); }
    catch { alert('No hemos podido guardar el recuerdo. Prueba de nuevo en un momento.'); } finally { setSaving(false); }
  }

  return <main className="birthday-page">
    <section className="hero" id="inicio">
      <nav className="nav" aria-label="Navegación principal"><a className="brand" href="#inicio">M<span className="brand-heart">♥</span>J</a><div className="nav-links"><a href="#historia">Nuestra historia</a><a href="#recuerdos">Recuerdos</a><a className="nav-surprise" href="#sorpresas"><Sparkles size={15}/> Sorpresas</a></div></nav>
      <div className="hero-glow" aria-hidden="true"/><div className="hero-content"><p className="eyebrow"><span/> 21 vueltas al sol <span/></p><p className="small-script">Para la persona que hace mi mundo más bonito</p><h1>Feliz cumpleaños,<br/><em>Maxime</em></h1><p className="hero-copy">Hoy celebramos tus 21 años, pero yo celebro cada día la suerte de compartir la vida contigo.</p><div className="hero-actions"><a className="primary-button" href="#historia">Descubre tu sorpresa <ArrowDown size={17}/></a><span className="made-with"><Heart size={14} fill="currentColor"/> Hecho con todo mi amor</span></div></div>
      <div className="memory-preview left" aria-hidden="true"><div className="preview-sky"><Heart fill="currentColor"/></div><p>Nuestra aventura</p><span>El comienzo de todo</span></div><div className="memory-preview right" aria-hidden="true"><div className="preview-sky moon"><Sparkles/></div><p>Siempre tú</p><span>Mi lugar favorito</span></div><div className="scroll-cue" aria-hidden="true"><span>Desliza para descubrir</span><ArrowDown size={17}/></div>
    </section>
    <section className="story-intro" id="historia"><p className="section-kicker">Nuestro pequeño universo</p><h2>Una historia que seguimos escribiendo</h2><p>Aquí viven los viajes, las risas inesperadas y esos días normales que contigo se convierten en recuerdos para siempre.</p><div className="love-note"><Sparkles size={18}/><p>“Maxime, eres la persona que más quiero en este mundo. Esta página no es solo un regalo: es un lugar para todo lo que aún nos queda por vivir.”</p><span>— Siempre contigo</span></div></section>
    <section className="memories-section" id="recuerdos"><div className="section-heading"><div><p className="section-kicker">Nuestra cápsula del tiempo</p><h2>Recuerdos para siempre</h2><p>Los grandes viajes y los pequeños instantes, todos tienen un lugar aquí.</p></div><button className="add-memory" onClick={() => setFormOpen(true)}><Plus size={17}/> Nuevo recuerdo</button></div>
      <div className="filters" aria-label="Filtrar recuerdos">{(['todos','viaje','momento'] as const).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item === 'todos' ? <Camera size={15}/> : item === 'viaje' ? <MapPin size={15}/> : <Star size={15}/>} {item === 'todos' ? 'Todos' : item === 'viaje' ? 'Viajes' : 'Momentos'}</button>)}</div>
      <div className="memory-grid">{visible.map((memory,index) => <article className={`memory-card card-${index%3}`} key={memory.id}><div className="memory-media">{memory.mediaUrl ? (memory.mediaType?.startsWith('video') ? <video src={memory.mediaUrl} controls preload="metadata"/> : <img src={memory.mediaUrl} alt={memory.title}/>) : <div className="media-placeholder"><span>{memory.category === 'viaje' ? <MapPin/> : <Heart fill="currentColor"/>}</span><small>Añade vuestra foto</small></div>}<span className="memory-type">{memory.category === 'viaje' ? <><MapPin size={12}/> Viaje</> : <><Sparkles size={12}/> Momento</>}</span></div><div className="memory-body"><p className="memory-date"><CalendarDays size={13}/> {memory.date}</p><h3>{memory.title}</h3><p>{memory.description}</p>{memory.location && <span className="memory-location"><MapPin size={12}/>{memory.location}</span>}</div></article>)}<button className="empty-memory" onClick={() => setFormOpen(true)}><span><ImagePlus/></span><strong>El próximo recuerdo</strong><small>Está esperando a ser vivido</small><em><Plus size={14}/> Añadir</em></button></div>
    </section>
    <section className="surprises-section" id="sorpresas"><div className="surprise-head"><p className="section-kicker">Todavía queda magia</p><h2>Tres sorpresas para ti</h2><p>Algunas se pueden abrir hoy. Otras, cuando llegue su momento.</p></div><div className="surprise-grid"><button onClick={() => setSurprise('carta')}><span className="gift-icon"><Heart/></span><small>Sorpresa nº 1</small><strong>Una carta para ti</strong><em>Toca para abrir</em></button><button onClick={() => setSurprise('cita')}><span className="gift-icon"><Gift/></span><small>Sorpresa nº 2</small><strong>Nuestra próxima cita</strong><em>Toca para descubrir</em></button><button className="locked"><span className="gift-icon"><LockKeyhole/></span><small>Sorpresa nº 3</small><strong>Próximamente…</strong><em>Se abrirá en el momento perfecto</em></button></div></section>
    <footer><span className="footer-mark">M<span>♥</span>J</span><p>Que este sea solo el capítulo 21 de una historia infinita.</p><small>Hecho con amor, para Maxime.</small></footer>
    <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent className="memory-dialog"><DialogHeader><DialogTitle>Guardar un nuevo recuerdo</DialogTitle><DialogDescription>Una foto, un vídeo, un lugar… todo lo que no queréis olvidar.</DialogDescription></DialogHeader><form onSubmit={createMemory} className="memory-form"><label>Título<Input name="title" required placeholder="Nuestro día en…"/></label><label>La historia<Textarea name="description" required placeholder="¿Qué hizo especial este momento?"/></label><div className="form-row"><label>Tipo<select name="category" defaultValue="momento"><option value="momento">Momento</option><option value="viaje">Viaje</option></select></label><label>Fecha<Input name="date" type="date" required/></label></div><label>Lugar<Input name="location" placeholder="Barcelona, aquel café…"/></label><label className="upload-field"><Upload/><span><strong>Sube una foto o vídeo</strong><small>JPG, PNG, WebP o vídeo</small></span><Input name="media" type="file" accept="image/*,video/*"/></label><button className="save-memory" disabled={saving||saved}>{saving ? <><LoaderCircle className="spin"/> Guardando…</> : saved ? <><Check/> Guardado</> : <><Heart/> Guardar para siempre</>}</button></form></DialogContent></Dialog>
    <Dialog open={!!surprise} onOpenChange={(open) => !open && setSurprise(null)}><DialogContent className="surprise-dialog"><button className="modal-x" onClick={() => setSurprise(null)} aria-label="Cerrar"><X/></button><span className="big-gift">{surprise === 'carta' ? <Heart fill="currentColor"/> : <Gift/>}</span><DialogTitle>{surprise === 'carta' ? 'Para ti, Maxime' : 'Vale por una cita sorpresa'}</DialogTitle><DialogDescription>{surprise === 'carta' ? 'Gracias por ser mi calma, mi aventura y mi persona favorita. Si pudiera elegir otra vez, te elegiría en cada vida. Feliz 21, mi amor.' : 'Un día pensado solo para ti: sin prisas, sin planes que tengas que organizar y con un final que no te voy a contar todavía.'}</DialogDescription><span className="modal-sign">Con todo mi amor ♥</span></DialogContent></Dialog>
  </main>;
}
