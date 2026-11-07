import {db,fail,GROUP_ID,memberFromRequest} from '../../../lib/server';
import {VENUES} from '../../../lib/venues';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{
 const member=await memberFromRequest(req);if(!member)return fail('Session expired. Rejoin using your invite link.',401);
 const client=db();const [members,votes,trails]=await Promise.all([
 client.from('members').select('id,name,style,wants_food').eq('group_id',GROUP_ID),
 client.from('votes').select('member_id,venue_id,liked'),
 client.from('trails').select('venue_ids,explanation,generated_by_ai,created_at').eq('group_id',GROUP_ID).order('created_at',{ascending:false}).limit(1)
 ]);
 if(members.error||votes.error||trails.error)throw members.error||votes.error||trails.error;
 const ids=new Set((members.data||[]).map(m=>m.id));const summary=Object.fromEntries(VENUES.map(v=>[v.id,{likes:0,dislikes:0}]));const mine:Record<string,boolean>={};
 for(const v of votes.data||[]){if(!ids.has(v.member_id)||!summary[v.venue_id])continue; if(v.liked)summary[v.venue_id].likes++;else summary[v.venue_id].dislikes++;if(v.member_id===member.id)mine[v.venue_id]=v.liked;}
 return Response.json({me:member,joined:ids.size,summary,mine,trail:trails.data?.[0]||null},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('state',e);return fail('Cannot fetch results',500)}}
