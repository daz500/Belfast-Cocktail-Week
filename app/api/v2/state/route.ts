import {db,fail,GROUP_ID,memberFromRequest} from '../../../../lib/server';
import {VENUES} from '../../../../lib/venues';

export const runtime='nodejs';
export const dynamic='force-dynamic';

// A verified member can inspect the group's explicitly shared voting preferences.
// No session hashes, invitation codes or administrator credentials leave this route.
export async function GET(req:Request){
 try{
  const me=await memberFromRequest(req);
  if(!me)return fail('Session expired. Open your original group invitation to rejoin.',401);
  const client=db();
  const [members,votes,trails]=await Promise.all([
   client.from('members').select('id,name,style,wants_food').eq('group_id',GROUP_ID),
   client.from('votes').select('member_id,venue_id,liked'),
   client.from('trails').select('venue_ids,explanation,created_at,generated_by_ai').eq('group_id',GROUP_ID).order('created_at',{ascending:false}).limit(30)
  ]);
  if(members.error||votes.error||trails.error)throw members.error||votes.error||trails.error;
  const people=members.data||[];
  const counts=new Map<string,number>();
  for(const p of people)counts.set(p.name.toLowerCase(),(counts.get(p.name.toLowerCase())||0)+1);
  const keyById=new Map(people.map(p=>[p.id,counts.get(p.name.toLowerCase())!>1?p.name+' ('+p.id.slice(0,4)+')':p.name]));
  const validVenueIds=new Set(VENUES.map(v=>v.id));
  const voteMatrix:Record<string,Record<string,boolean>>={};
  for(const key of keyById.values())voteMatrix[key]={};
  for(const v of votes.data||[]){
   const key=keyById.get(v.member_id);
   if(!key||!validVenueIds.has(v.venue_id))continue;
   voteMatrix[key][v.venue_id]=v.liked;
  }
  return Response.json({
   meKey:keyById.get(me.id),
   me:{name:me.name,id:me.id},
   people:[...keyById.entries()].map(([id,key])=>({key,name:people.find(p=>p.id===id)?.name||key})),
   votes:voteMatrix,
   trails:trails.data||[],
   joined:people.length,
   capturedAt:new Date().toISOString()
  },{headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch(error){console.error('v2 state',error);return fail('Unable to load the group votes',500)}
}
