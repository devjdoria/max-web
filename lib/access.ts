import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'maxime_access';
function signature() { const secret = process.env.ACCESS_COOKIE_SECRET; if (!secret) throw new Error('Falta ACCESS_COOKIE_SECRET'); return createHmac('sha256',secret).update('maxime-admin-v1').digest('hex'); }
export async function hasAccess() { const value = (await cookies()).get(COOKIE)?.value; if (!value) return false; const expected = signature(); return value.length === expected.length && timingSafeEqual(Buffer.from(value),Buffer.from(expected)); }
export async function grantAccess() { (await cookies()).set(COOKIE,signature(),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:60*60*24*30,path:'/'}); }
export function correctDate(value: string) { const expected = process.env.ADMIN_ACCESS_DATE; if (!expected) throw new Error('Falta ADMIN_ACCESS_DATE'); return value === expected; }
