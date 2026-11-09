import {db,digest,fail,GROUP_ID,secret,secureCompare} from '../../../lib/server';
export const runtime='nodejs';
export async function POST(req:Request){try{
 if(process.env.VERCEL_ENV==='preview')return fail('Preview mode is read-only',403);
 const body=await req.json();const code=String(body.code||'');const expected=process.env.GROUP_INVITE_CODE||'';
 if(!expected||!secureCompare(code,expected))return fail('Invalid invitation link',403);
 const name=String(body.name||'').trim().slice(0,32);if(!name)return fail('Enter a first name');
 const style=['lively','relaxed','mixed'].includes(body.style)?body.style:'mixed';
 const client=db();const {count,error:countError}=await client.from('members').select('id',{count:'exact',head:true}).eq('group_id',GROUP_ID);
 if(countError)throw countError;if((count||0)>=14)return fail('This group already has 14 members. Ask the organiser to remove an unused registration.',409);
 const token=secret();const {data,error}=await client.from('members').insert({group_id:GROUP_ID,name,style,wants_food:!!body.wantsFood,token_hash:digest(token)}).select('id,name').single();
 if(error)throw error;return Response.json({token,member:data},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('join',e);return fail('Unable to join. Check database configuration.',500)}}
