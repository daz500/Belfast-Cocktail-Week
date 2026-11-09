import {db,fail,memberFromRequest} from '../../../lib/server';
import {VENUES} from '../../../lib/venues';
export async function POST(req:Request){try{
 if(process.env.VERCEL_ENV==='preview')return fail('Preview mode is read-only',403);
 const member=await memberFromRequest(req);if(!member)return fail('Session expired',401);
 const body=await req.json();if(typeof body.liked!=='boolean'||!VENUES.some(v=>v.id===body.venueId))return fail('Invalid vote');
 const {error}=await db().from('votes').upsert({member_id:member.id,venue_id:body.venueId,liked:body.liked,updated_at:new Date().toISOString()},{onConflict:'member_id,venue_id'});if(error)throw error;
 return Response.json({ok:true});
 }catch(e){console.error('vote',e);return fail('Vote could not be saved',500)}}

export async function DELETE(req: Request) {
  try {
    if(process.env.VERCEL_ENV==='preview')return fail('Preview mode is read-only',403);
    const member = await memberFromRequest(req);
    if (!member) return fail('Session expired', 401);

    const { error } = await db().from('votes').delete().eq('member_id', member.id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (error) {
    console.error('reset votes', error);
    return fail('Your votes could not be reset. Please try again.', 500);
  }
}
