import {db,fail,GROUP_ID,memberFromRequest,secureCompare} from '../../../lib/server';
import {VENUES,Venue} from '../../../lib/venues';
export const runtime='nodejs';
const stopCount=5;
const place=(id:string)=>VENUES.find(v=>v.id===id);
function fallback(sorted:Venue[],food:boolean){const result=sorted.slice(0,stopCount);if(food&&!result.some(v=>v.food)){const f=sorted.find(v=>v.food);if(f&&!result.includes(f)){result.pop();result.push(f)}}return result.map(v=>v.id)}
export async function POST(req:Request){try{
 const member=await memberFromRequest(req);if(!member)return fail('Session expired',401);
 const body=await req.json();const admin=String(body.adminCode||'');const expected=process.env.ADMIN_CODE||'';
 if(!expected||!secureCompare(admin,expected))return fail('Only the organiser can manage the group trail',403);

 if (body.action === 'publish') {
  const ids: unknown = body.venueIds;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > VENUES.length ||
      new Set(ids).size !== ids.length || !ids.every(id => typeof id === 'string' && place(id))) {
   return fail('Choose at least one venue and include each venue only once.');
  }

  const { data, error } = await db().from('trails').insert({
   group_id: GROUP_ID,
   venue_ids: ids,
   explanation: 'Selected and ordered by the group organiser.',
   generated_by_ai: false,
  }).select('venue_ids,explanation,generated_by_ai,created_at').single();
  if (error) throw error;
  return Response.json({ trail: data });
 }

 if (body.action !== 'generate') return fail('Refresh the app to use the trail editor.');

 const client=db();const [members,votes]=await Promise.all([client.from('members').select('id,style,wants_food').eq('group_id',GROUP_ID),client.from('votes').select('member_id,venue_id,liked')]);
 if(members.error||votes.error)throw members.error||votes.error;
 const membersData=members.data||[],valid=new Set(membersData.map(m=>m.id));const scores=new Map(VENUES.map(v=>[v.id,0]));
 for(const v of votes.data||[]){if(valid.has(v.member_id)&&scores.has(v.venue_id))scores.set(v.venue_id,(scores.get(v.venue_id)||0)+(v.liked?1:0));}
 const sorted=[...VENUES].sort((a,b)=>(scores.get(b.id)||0)-(scores.get(a.id)||0));
 const hasFood=membersData.filter(m=>m.wants_food).length>=Math.ceil(membersData.length/2);let venueIds=fallback(sorted,hasFood);let explanation='Based on the group’s positive votes'+(hasFood?', including a venue with a known food option':'')+'. The route has not been verified for walking distance or group availability.';let generatedByAi=false;
 const key=process.env.OPENAI_API_KEY;
 if(key){try{
 const candidates=sorted.slice(0,15).map(v=>({id:v.id,name:v.name,area:v.area||null,address:v.address||null,food:!!v.food,likes:scores.get(v.id)||0}));
 const reply=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',temperature:0.3,response_format:{type:'json_object'},messages:[{role:'system',content:'Plan a Belfast Cocktail Week bar shortlist. Return JSON with venue_ids (exactly five unique IDs from the supplied candidates, highest voted preferred) and explanation (under 450 characters). Respect food preference. Only use supplied information. Never claim opening hours, capacity, discounts, precise walking time or verified route order.'},{role:'user',content:JSON.stringify({candidates,foodPreferred:hasFood,desiredStops:stopCount})}]})});
 if(!reply.ok)throw new Error(`OpenAI ${reply.status}`);const output=await reply.json();const parsed=JSON.parse(output.choices?.[0]?.message?.content||'{}');const ids=parsed.venue_ids;
 if(Array.isArray(ids)&&ids.length===5&&new Set(ids).size===5&&ids.every((id:unknown)=>typeof id==='string'&&candidates.some(v=>v.id===id))){venueIds=ids;explanation=String(parsed.explanation||explanation).slice(0,450);generatedByAi=true;}
 }catch(e){console.error('AI route failed, fallback used',e)}}
 return Response.json({venueIds,explanation,generatedByAi});
 }catch(e){console.error('trail',e);return fail('Unable to update the trail. Please try again.',500)}}
