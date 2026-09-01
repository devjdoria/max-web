import { correctDate, grantAccess, hasAccess } from '@/lib/access';
export async function GET() { return Response.json({ authenticated: await hasAccess() }); }
export async function POST(request: Request) { const { date } = await request.json() as {date?:string}; if (!date || !correctDate(date)) return Response.json({error:'Esa no es nuestra fecha'},{status:401}); await grantAccess(); return Response.json({authenticated:true}); }
