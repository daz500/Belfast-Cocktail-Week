import {db,fail,GROUP_ID,memberFromRequest,secureCompare} from '../../../../lib/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
/**
 * Organiser-only logical backup of application tables.
 * JSON is meant to be downloaded and stored OFF Supabase, alongside the schema SQL.
 * No tokens are returned unless both organiser code and member session validate.
 */
export async function POST(req:Request){
 if(process.env.VERCEL_ENV!=='production')return fail('Database exports are unavailable on preview',403);
 try{
  const member=await memberFromRequest(req);
  if(!member)return fail('Member session required',401);
  const body=await req.json();
  const supplied=String(body.adminCode||'');
  const expected=process.env.ADMIN_CODE||'';
  if(!expected||!secureCompare(supplied,expected))return fail('Organiser verification failed',403);
  const client=db();
  const [members,votes,trails]=await Promise.all([
   client.from('members').select('id,group_id,name,token_hash,style,wants_food,created_at').eq('group_id',GROUP_ID).order('id'),
   client.from('votes').select('member_id,venue_id,liked,updated_at').order('member_id').order('venue_id'),
   client.from('trails').select('id,group_id,venue_ids,explanation,generated_by_ai,created_at').eq('group_id',GROUP_ID).order('id')
  ]);
  if(members.error||votes.error||trails.error)throw members.error||votes.error||trails.error;
  const validIds=new Set((members.data||[]).map(m=>m.id));
  const exportData={format:'bcc-logical-backup-v1',schemaReference:'supabase/schema.sql',
   project:'BelfastCocktailWeek',groupId:GROUP_ID,capturedAt:new Date().toISOString(),
   tables:{members:members.data||[],votes:(votes.data||[]).filter(v=>validIds.has(v.member_id)),trails:trails.data||[]},
   note:'Contains sensitive member token hashes. Store privately; never share publicly. This exports application rows, not the entire PostgreSQL instance.'};
  const filename='belfast-cocktail-club-'+new Date().toISOString().slice(0,10)+'.json';
  return new Response(JSON.stringify(exportData,null,2),{headers:{
   'Content-Type':'application/json; charset=utf-8',
   'Content-Disposition':'attachment; filename="'+filename+'"',
   'Cache-Control':'no-store, private','Pragma':'no-cache','X-Content-Type-Options':'nosniff'
  }});
 }catch(error){console.error('v2 backup',error);return fail('Unable to export application data',500)}
}
