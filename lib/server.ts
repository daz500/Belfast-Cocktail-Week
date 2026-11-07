import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
export const GROUP_ID='belfast-cocktail-week-2026';
export function db(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;if(!url||!key)throw new Error('Supabase is not configured');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
export function digest(value:string){return createHash('sha256').update(value).digest('hex')}
export function secret(){return randomBytes(32).toString('hex')}
export function secureCompare(a:string,b:string){const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb)}
export async function memberFromRequest(req:Request){const token=req.headers.get('x-member-token')||'';if(!/^[0-9a-f]{64}$/.test(token))return null;const {data,error}=await db().from('members').select('id,name,style,wants_food').eq('group_id',GROUP_ID).eq('token_hash',digest(token)).maybeSingle();if(error)throw error;return data;}
export const fail=(message:string,status=400)=>Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
