import { env } from 'cloudflare:workers';
type Row = { id: string; title: string; description: string; category: string; date: string; location: string|null; media_key: string|null; media_type: string|null };
const present = (row: Row) => ({ id: row.id, title: row.title, description: row.description, category: row.category, date: row.date, location: row.location ?? undefined, mediaUrl: row.media_key ? `/api/media/${row.media_key}` : undefined, mediaType: row.media_type ?? undefined });
export async function GET() { const result = await env.DB.prepare('SELECT id, title, description, category, date, location, media_key, media_type FROM memories ORDER BY created_at DESC').all<Row>(); return Response.json(result.results.map(present)); }
export async function POST(request: Request) {
  const data = await request.formData(); const title = String(data.get('title') ?? '').trim(); const description = String(data.get('description') ?? '').trim(); const category = String(data.get('category') ?? 'momento'); const date = String(data.get('date') ?? '').trim(); const location = String(data.get('location') ?? '').trim(); const media = data.get('media');
  if (!title || !description || !date || !['viaje','momento'].includes(category)) return Response.json({ error: 'Datos incompletos' }, { status: 400 });
  const id = crypto.randomUUID(); let mediaKey: string|null = null; let mediaType: string|null = null;
  if (media instanceof File && media.size > 0) { if (media.size > 25*1024*1024 || (!media.type.startsWith('image/') && !media.type.startsWith('video/'))) return Response.json({ error: 'Archivo no válido' }, { status: 400 }); mediaKey = crypto.randomUUID(); mediaType = media.type; await env.FILES.put(mediaKey, media.stream(), { httpMetadata: { contentType: media.type }, customMetadata: { name: media.name } }); }
  await env.DB.prepare('INSERT INTO memories (id, title, description, category, date, location, media_key, media_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id,title,description,category,date,location||null,mediaKey,mediaType,Date.now()).run();
  return Response.json(present({ id,title,description,category,date,location:location||null,media_key:mediaKey,media_type:mediaType }), { status: 201 });
}
