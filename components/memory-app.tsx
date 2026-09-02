'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  CalendarDays,
  Camera,
  Check,
  Gift,
  Heart,
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Upload,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type Memory = {
  id: string;
  title: string;
  description: string;
  category: 'viaje' | 'momento';
  date: string;
  location?: string;
  mediaUrl?: string;
  mediaType?: string;
};
type SiteContent = {
  hero_eyebrow: string;
  hero_pretitle: string;
  hero_title: string;
  hero_name: string;
  hero_description: string;
  hero_media_url?: string;
  hero_left_media_url?: string;
  hero_right_media_url?: string;
  story_kicker: string;
  story_title: string;
  story_description: string;
  love_note: string;
  footer_text: string;
};
type CmsSurprise = {
  id: string;
  position: number;
  label: string;
  title: string;
  description: string;
  locked: boolean;
  unlock_at?: string | null;
};
const defaultContent: SiteContent = {
  hero_eyebrow: '21 vueltas al sol',
  hero_pretitle: 'Para la persona que hace mi mundo más bonito',
  hero_title: 'Feliz cumpleaños,',
  hero_name: 'Maxime',
  hero_description:
    'Hoy celebramos tus 21 años, pero yo celebro cada día la suerte de compartir la vida contigo.',
  story_kicker: 'Nuestro pequeño universo',
  story_title: 'Una historia que seguimos escribiendo',
  story_description:
    'Aquí viven los viajes, las risas inesperadas y esos días normales que contigo se convierten en recuerdos para siempre.',
  love_note:
    'Maxime, eres la persona que más quiero en este mundo. Esta página no es solo un regalo: es un lugar para todo lo que aún nos queda por vivir.',
  footer_text: 'Que este sea solo el capítulo 21 de una historia infinita.',
};
const demos: Memory[] = [
  {
    id: 'demo-1',
    title: 'El comienzo de todo',
    description: 'Ese instante en el que empezó nuestra aventura favorita.',
    category: 'momento',
    date: '2025-02-14',
    location: 'Donde todo cambió',
  },
  {
    id: 'demo-2',
    title: 'Perdernos juntos',
    description:
      'Un mapa, mil risas y la certeza de que cualquier lugar es casa contigo.',
    category: 'viaje',
    date: '2025-07-21',
    location: 'Nuestro rincón del mundo',
  },
  {
    id: 'demo-3',
    title: 'La magia de lo cotidiano',
    description:
      'Porque contigo hasta un martes cualquiera merece guardarse para siempre.',
    category: 'momento',
    date: '2026-04-06',
    location: 'A tu lado',
  },
];

export default function MemoryApp() {
  const [memories, setMemories] = useState<Memory[]>(demos);
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultContent);
  const [cmsSurprises, setCmsSurprises] = useState<CmsSurprise[]>([]);
  const [filter, setFilter] = useState<'todos' | 'viaje' | 'momento'>('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [surprise, setSurprise] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch('/api/memories')
      .then((r) => (r.ok ? r.json() : []))
      .then((items: Memory[]) => {
        if (items.length) setMemories(items);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    fetch('/api/content')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.content) setSiteContent(data.content);
        if (data?.surprises) setCmsSurprises(data.surprises);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options?: { signal?: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: 'create_memory',
      title: 'Guardar un recuerdo',
      description:
        'Crea y guarda un recuerdo de Maxime sin archivo multimedia.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string', enum: ['viaje', 'momento'] },
          date: { type: 'string' },
          location: { type: 'string' },
        },
        required: ['title', 'description', 'category', 'date'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input: unknown) => {
        const value = input as Record<string, string>;
        if (
          !value.title ||
          !value.description ||
          !['viaje', 'momento'].includes(value.category) ||
          !value.date
        )
          throw new Error('Recuerdo no válido');
        const data = new FormData();
        Object.entries(value).forEach(([key, val]) => data.set(key, val));
        const response = await fetch('/api/memories', {
          method: 'POST',
          body: data,
        });
        if (!response.ok) throw new Error('No se pudo guardar');
        const memory = (await response.json()) as Memory;
        setMemories((current) => [
          memory,
          ...current.filter((item) => !item.id.startsWith('demo-')),
        ]);
        return { id: memory.id, status: 'guardado', title: memory.title };
      },
    };
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);
  const visible = useMemo(
    () =>
      memories.filter(
        (m) =>
          (filter === 'todos' || m.category === filter) &&
          (!dateFrom || m.date >= dateFrom) &&
          (!dateTo || m.date <= dateTo),
      ),
    [filter, memories, dateFrom, dateTo],
  );
  const selectedCmsSurprise = cmsSurprises.find((item) => item.id === surprise);

  async function withAccess(action: () => void) {
    const response = await fetch('/api/access');
    const result = (await response.json()) as { authenticated: boolean };
    if (result.authenticated) action();
    else {
      setAccessError('');
      setAccessOpen(true);
    }
  }
  function openNewMemory() {
    setEditing(null);
    void withAccess(() => setFormOpen(true));
  }
  function openEditMemory(memory: Memory) {
    if (memory.id.startsWith('demo-')) {
      alert(
        'Este es un recuerdo de ejemplo. Añade uno real para poder editarlo.',
      );
      return;
    }
    setEditing(memory);
    void withAccess(() => setFormOpen(true));
  }
  async function unlock(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch('/api/access', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ date: data.get('date') }),
    });
    if (!response.ok) {
      setAccessError('Esa no es nuestra fecha. Inténtalo otra vez.');
      return;
    }
    setAccessOpen(false);
    setFormOpen(true);
  }
  const prettyDate = (date: string) =>
    new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`));

  async function saveMemory(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    const form = event.currentTarget;
    try {
      const body = new FormData(form);
      const file = body.get('media');
      body.delete('media');
      if (file instanceof File && file.size) {
        const ticketResponse = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            size: file.size,
          }),
        });
        if (!ticketResponse.ok) throw new Error();
        const ticket = (await ticketResponse.json()) as {
          path: string;
          token: string;
        };
        const { error } = await getSupabaseBrowser()
          .storage.from('memories')
          .uploadToSignedUrl(ticket.path, ticket.token, file, {
            contentType: file.type,
          });
        if (error) throw error;
        body.set('mediaPath', ticket.path);
        body.set('mediaType', file.type);
      }
      if (editing) body.set('id', editing.id);
      const response = await fetch('/api/memories', {
        method: editing ? 'PATCH' : 'POST',
        body,
      });
      if (!response.ok) throw new Error();
      const memory = (await response.json()) as Memory;
      setMemories((current) =>
        editing
          ? current.map((item) => (item.id === memory.id ? memory : item))
          : [memory, ...current.filter((item) => !item.id.startsWith('demo-'))],
      );
      setSaved(true);
      if (!editing) form.reset();
      setTimeout(() => {
        setFormOpen(false);
        setEditing(null);
        setSaved(false);
      }, 900);
    } catch {
      alert(
        'No hemos podido guardar el recuerdo o subir el archivo. Prueba de nuevo en un momento.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="birthday-page">
      <section className="hero" id="inicio">
        <nav className="nav" aria-label="Navegación principal">
          <a className="brand" href="#inicio">
            M<span className="brand-heart">♥</span>J
          </a>
          <div className="nav-links">
            <a href="#historia">Nuestra historia</a>
            <a href="#recuerdos">Recuerdos</a>
            <a className="nav-surprise" href="#sorpresas">
              <Sparkles size={15} /> Sorpresas
            </a>
          </div>
        </nav>
        {siteContent.hero_media_url && (
          <div
            className="hero-photo"
            style={{
              backgroundImage: `linear-gradient(rgba(3,20,46,.55),rgba(3,20,46,.72)),url(${siteContent.hero_media_url})`,
            }}
          />
        )}
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">
            <span /> {siteContent.hero_eyebrow} <span />
          </p>
          <p className="small-script">{siteContent.hero_pretitle}</p>
          <h1>
            {siteContent.hero_title}
            <br />
            <em>{siteContent.hero_name}</em>
          </h1>
          <p className="hero-copy">{siteContent.hero_description}</p>
          <div className="hero-actions">
            <a className="primary-button" href="#historia">
              Descubre tu sorpresa <ArrowDown size={17} />
            </a>
            <span className="made-with">
              <Heart size={14} fill="currentColor" /> Hecho con todo mi amor
            </span>
          </div>
        </div>
        <div className="memory-preview left" aria-hidden="true">
          <div className="preview-sky">
            {siteContent.hero_left_media_url ? (
              <img src={siteContent.hero_left_media_url} alt="" />
            ) : (
              <Heart fill="currentColor" />
            )}
          </div>
          <p>Nuestra aventura</p>
          <span>El comienzo de todo</span>
        </div>
        <div className="memory-preview right" aria-hidden="true">
          <div className="preview-sky moon">
            {siteContent.hero_right_media_url ? (
              <img src={siteContent.hero_right_media_url} alt="" />
            ) : (
              <Sparkles />
            )}
          </div>
          <p>Siempre tú</p>
          <span>Mi lugar favorito</span>
        </div>
        <div className="scroll-cue" aria-hidden="true">
          <span>Desliza para descubrir</span>
          <ArrowDown size={17} />
        </div>
      </section>
      <section className="story-intro" id="historia">
        <p className="section-kicker">{siteContent.story_kicker}</p>
        <h2>{siteContent.story_title}</h2>
        <p>{siteContent.story_description}</p>
        <div className="love-note">
          <Sparkles size={18} />
          <p>“{siteContent.love_note}”</p>
          <span>— Siempre contigo</span>
        </div>
      </section>
      <section className="memories-section" id="recuerdos">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Nuestra cápsula del tiempo</p>
            <h2>Recuerdos para siempre</h2>
            <p>
              Los grandes viajes y los pequeños instantes, todos tienen un lugar
              aquí.
            </p>
          </div>
          <button className="add-memory" onClick={openNewMemory}>
            <Plus size={17} /> Nuevo recuerdo
          </button>
        </div>
        <div className="filters" aria-label="Filtrar recuerdos">
          {(['todos', 'viaje', 'momento'] as const).map((item) => (
            <button
              key={item}
              className={filter === item ? 'active' : ''}
              onClick={() => setFilter(item)}
            >
              {item === 'todos' ? (
                <Camera size={15} />
              ) : item === 'viaje' ? (
                <MapPin size={15} />
              ) : (
                <Star size={15} />
              )}{' '}
              {item === 'todos'
                ? 'Todos'
                : item === 'viaje'
                  ? 'Viajes'
                  : 'Momentos'}
            </button>
          ))}
        </div>
        <div className="date-filters">
          <span>
            <CalendarDays size={15} /> Buscar por fecha
          </span>
          <label>
            Desde
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>
          <label>
            Hasta
            <Input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
            >
              <X size={14} /> Limpiar fechas
            </button>
          )}
          <small>
            {visible.length}{' '}
            {visible.length === 1
              ? 'recuerdo encontrado'
              : 'recuerdos encontrados'}
          </small>
        </div>
        <div className="memory-grid">
          {visible.map((memory, index) => (
            <article
              className={`memory-card card-${index % 3}`}
              key={memory.id}
            >
              <div className="memory-media">
                {memory.mediaUrl ? (
                  memory.mediaType?.startsWith('video') ? (
                    <video src={memory.mediaUrl} controls preload="metadata" />
                  ) : (
                    <img src={memory.mediaUrl} alt={memory.title} />
                  )
                ) : (
                  <div className="media-placeholder">
                    <span>
                      {memory.category === 'viaje' ? (
                        <MapPin />
                      ) : (
                        <Heart fill="currentColor" />
                      )}
                    </span>
                    <small>Añade vuestra foto</small>
                  </div>
                )}
                <span className="memory-type">
                  {memory.category === 'viaje' ? (
                    <>
                      <MapPin size={12} /> Viaje
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} /> Momento
                    </>
                  )}
                </span>
                {!memory.id.startsWith('demo-') && (
                  <button
                    className="edit-memory"
                    onClick={() => openEditMemory(memory)}
                    aria-label={`Editar ${memory.title}`}
                  >
                    <Pencil size={14} /> Editar
                  </button>
                )}
              </div>
              <div className="memory-body">
                <p className="memory-date">
                  <CalendarDays size={13} /> {prettyDate(memory.date)}
                </p>
                <h3>{memory.title}</h3>
                <p>{memory.description}</p>
                {memory.location && (
                  <span className="memory-location">
                    <MapPin size={12} />
                    {memory.location}
                  </span>
                )}
                {!memory.id.startsWith('demo-') && (
                  <button
                    className="edit-memory-action"
                    onClick={() => openEditMemory(memory)}
                  >
                    <Pencil size={14} /> Editar recuerdo
                  </button>
                )}
              </div>
            </article>
          ))}
          {visible.length === 0 && (
            <div className="no-results">
              <CalendarDays />
              <strong>No hay recuerdos en esas fechas</strong>
              <span>Prueba con otro rango o limpia los filtros.</span>
            </div>
          )}
          <button className="empty-memory" onClick={openNewMemory}>
            <span>
              <ImagePlus />
            </span>
            <strong>El próximo recuerdo</strong>
            <small>Está esperando a ser vivido</small>
            <em>
              <Plus size={14} /> Añadir
            </em>
          </button>
        </div>
      </section>
      <section className="surprises-section" id="sorpresas">
        <div className="surprise-head">
          <p className="section-kicker">Todavía queda magia</p>
          <h2>Sorpresas para ti</h2>
          <p>Algunas se pueden abrir hoy. Otras, cuando llegue su momento.</p>
        </div>
        <div className="surprise-grid">
          {cmsSurprises.length ? (
            cmsSurprises.map((item) => (
              <button
                key={item.id}
                className={item.locked ? 'locked' : ''}
                onClick={() => !item.locked && setSurprise(item.id)}
              >
                <span className="gift-icon">
                  {item.locked ? <LockKeyhole /> : <Gift />}
                </span>
                <small>{item.label}</small>
                <strong>{item.title}</strong>
                <em>
                  {item.locked
                    ? 'Se abrirá en el momento perfecto'
                    : 'Toca para descubrir'}
                </em>
              </button>
            ))
          ) : (
            <>
              <button onClick={() => setSurprise('carta')}>
                <span className="gift-icon">
                  <Heart />
                </span>
                <small>Sorpresa nº 1</small>
                <strong>Una carta para ti</strong>
                <em>Toca para abrir</em>
              </button>
              <button onClick={() => setSurprise('cita')}>
                <span className="gift-icon">
                  <Gift />
                </span>
                <small>Sorpresa nº 2</small>
                <strong>Nuestra próxima cita</strong>
                <em>Toca para descubrir</em>
              </button>
              <button className="locked">
                <span className="gift-icon">
                  <LockKeyhole />
                </span>
                <small>Sorpresa nº 3</small>
                <strong>Próximamente…</strong>
                <em>Se abrirá en el momento perfecto</em>
              </button>
            </>
          )}
        </div>
      </section>
      <footer>
        <span className="footer-mark">
          M<span>♥</span>J
        </span>
        <p>{siteContent.footer_text}</p>
        <small>Hecho con amor, para Maxime.</small>
      </footer>
      <Dialog
        open={formOpen || accessOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setAccessOpen(false);
            setEditing(null);
          }
        }}
      >
        {accessOpen ? (
          <DialogContent className="access-dialog">
            <DialogHeader>
              <DialogTitle>Solo nosotros sabemos la respuesta</DialogTitle>
              <DialogDescription>
                ¿Qué día empezó nuestra historia?
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={unlock}>
              <Input name="date" type="date" required autoFocus />
              <button type="submit">
                <Heart size={16} /> Entrar
              </button>
              {accessError && <p role="alert">{accessError}</p>}
            </form>
          </DialogContent>
        ) : (
          <DialogContent className="memory-dialog">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? 'Editar este recuerdo'
                  : 'Guardar un nuevo recuerdo'}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? 'Corrige lo que necesites. El recuerdo nunca se podrá borrar.'
                  : 'Una foto, un vídeo, un lugar… todo lo que no queréis olvidar.'}
              </DialogDescription>
            </DialogHeader>
            <form
              key={editing?.id ?? 'new'}
              onSubmit={saveMemory}
              className="memory-form"
            >
            <label>
              Título
              <Input
                name="title"
                required
                defaultValue={editing?.title}
                placeholder="Nuestro día en…"
              />
            </label>
            <label>
              La historia
              <Textarea
                name="description"
                required
                defaultValue={editing?.description}
                placeholder="¿Qué hizo especial este momento?"
              />
            </label>
            <div className="form-row">
              <label>
                Tipo
                <select
                  name="category"
                  defaultValue={editing?.category ?? 'momento'}
                >
                  <option value="momento">Momento</option>
                  <option value="viaje">Viaje</option>
                </select>
              </label>
              <label>
                Fecha
                <Input
                  name="date"
                  type="date"
                  required
                  defaultValue={editing?.date}
                />
              </label>
            </div>
            <label>
              Lugar
              <Input
                name="location"
                defaultValue={editing?.location}
                placeholder="Barcelona, aquel café…"
              />
            </label>
            <label className="upload-field">
              <Upload />
              <span>
                <strong>
                  {editing?.mediaUrl
                    ? 'Cambiar foto o vídeo'
                    : 'Sube una foto o vídeo'}
                </strong>
                <small>
                  {editing?.mediaUrl
                    ? 'Déjalo vacío para conservar el actual'
                    : 'JPG, PNG, WebP o vídeo · máx. 50 MB'}
                </small>
              </span>
              <Input name="media" type="file" accept="image/*,video/*" />
            </label>
            <button className="save-memory" disabled={saving || saved}>
              {saving ? (
                <>
                  <LoaderCircle className="spin" /> Guardando…
                </>
              ) : saved ? (
                <>
                  <Check /> Guardado
                </>
              ) : editing ? (
                <>
                  <Pencil /> Guardar cambios
                </>
              ) : (
                <>
                  <Heart /> Guardar para siempre
                </>
              )}
            </button>
            </form>
          </DialogContent>
        )}
      </Dialog>
      <Dialog
        open={!!surprise}
        onOpenChange={(open) => !open && setSurprise(null)}
      >
        <DialogContent className="surprise-dialog">
          <button
            className="modal-x"
            onClick={() => setSurprise(null)}
            aria-label="Cerrar"
          >
            <X />
          </button>
          <span className="big-gift">
            {surprise === 'carta' ? <Heart fill="currentColor" /> : <Gift />}
          </span>
          <DialogTitle>
            {selectedCmsSurprise?.title ??
              (surprise === 'carta'
                ? 'Para ti, Maxime'
                : 'Vale por una cita sorpresa')}
          </DialogTitle>
          <DialogDescription>
            {selectedCmsSurprise?.description ??
              (surprise === 'carta'
                ? 'Gracias por ser mi calma, mi aventura y mi persona favorita. Si pudiera elegir otra vez, te elegiría en cada vida. Feliz 21, mi amor.'
                : 'Un día pensado solo para ti: sin prisas, sin planes que tengas que organizar y con un final que no te voy a contar todavía.')}
          </DialogDescription>
          <span className="modal-sign">Con todo mi amor ♥</span>
        </DialogContent>
      </Dialog>
    </main>
  );
}
