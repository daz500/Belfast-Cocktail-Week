import {db,fail,memberFromRequest} from '../../../lib/server';
import {VENUES} from '../../../lib/venues';
export async function POST(req:Request){try{
 const member=await memberFromRequest(req);if(!member)return fail('Session expired',401);
 const body=await req.json();if(typeof body.liked!=='boolean'||!VENUES.some(v=>v.id===body.venueId))return fail('Invalid vote');
 const {error}=await db().from('votes').upsert({member_id:member.id,venue_id:body.venueId,liked:body.liked,updated_at:new Date().toISOString()},{onConflict:'member_id,venue_id'});if(error)throw error;
 return Response.json({ok:true});
 }catch(e){console.error('vote',e);return fail('Vote could not be saved',500)}}
