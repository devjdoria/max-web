import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { name, type, size } = await request.json() as { name?: string; type?: string; size?: number };
    if (!name || !type || !size || size > 200 * 1024 * 1024 || (!type.startsWith('image/') && !type.startsWith('video/'))) return Response.json({error:'Archivo no válido'},{status:400});
    const ext = name.split('.').pop()?.replace(/[^a-z0-9]/gi,'').toLowerCase() || 'bin';
    const path = `${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${ext}`;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from('memories').createSignedUploadUrl(path);
    if (error) throw error;
    return Response.json({ path, token: data.token });
  } catch { return Response.json({error:'No se pudo preparar la subida'},{status:500}); }
}
