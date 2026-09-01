import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { hasAccess } from '@/lib/access';

export const runtime = 'nodejs';
const BUCKET = 'memories';
type Row = { id: string; title: string; description: string; category: 'viaje'|'momento'; memory_date: string; location: string|null; media_path: string|null; media_type: string|null };

function present(row: Row) {
  const supabase = getSupabaseAdmin();
  return { id: row.id, title: row.title, description: row.description, category: row.category, date: row.memory_date, location: row.location ?? undefined, mediaUrl: row.media_path ? supabase.storage.from(BUCKET).getPublicUrl(row.media_path).data.publicUrl : undefined, mediaType: row.media_type ?? undefined };
}

function readFields(data: FormData) {
  return { title: String(data.get('title') ?? '').trim(), description: String(data.get('description') ?? '').trim(), category: String(data.get('category') ?? ''), memory_date: String(data.get('date') ?? '').trim(), location: String(data.get('location') ?? '').trim() || null };
}

function valid(fields: ReturnType<typeof readFields>) {
  return fields.title.length > 0 && fields.description.length > 0 && ['viaje','momento'].includes(fields.category) && /^\d{4}-\d{2}-\d{2}$/.test(fields.memory_date);
}

export async function GET() {
  try { const supabase = getSupabaseAdmin(); const { data, error } = await supabase.from('memories').select('id,title,description,category,memory_date,location,media_path,media_type').order('memory_date',{ascending:false}); if (error) throw error; return Response.json((data as Row[]).map(present)); }
  catch { return Response.json({ error: 'No se pudieron cargar los recuerdos' }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!await hasAccess()) return Response.json({error:'Acceso necesario'},{status:401});
  try { const data = await request.formData(); const fields = readFields(data); if (!valid(fields)) return Response.json({error:'Datos incompletos'},{status:400}); const media_path = String(data.get('mediaPath') ?? '') || null; const media_type = String(data.get('mediaType') ?? '') || null; const supabase = getSupabaseAdmin(); const { data: row, error } = await supabase.from('memories').insert({...fields,category:fields.category as 'viaje'|'momento',media_path,media_type}).select().single(); if (error) throw error; return Response.json(present(row as Row),{status:201}); }
  catch { return Response.json({error:'No se pudo guardar el recuerdo'},{status:500}); }
}

export async function PATCH(request: Request) {
  if (!await hasAccess()) return Response.json({error:'Acceso necesario'},{status:401});
  try { const data = await request.formData(); const id = String(data.get('id') ?? ''); const fields = readFields(data); if (!/^[a-f0-9-]{36}$/.test(id) || !valid(fields)) return Response.json({error:'Datos incompletos'},{status:400}); const mediaPath = String(data.get('mediaPath') ?? ''); const media = mediaPath ? {media_path:mediaPath,media_type:String(data.get('mediaType') ?? '')} : {}; const supabase = getSupabaseAdmin(); const { data: row, error } = await supabase.from('memories').update({...fields,category:fields.category as 'viaje'|'momento',...media,updated_at:new Date().toISOString()}).eq('id',id).select().single(); if (error) throw error; return Response.json(present(row as Row)); }
  catch { return Response.json({error:'No se pudo actualizar el recuerdo'},{status:500}); }
}
