import {db,fail,memberFromRequest} from '../../../../lib/server';
import {dbTasteProfile,EMPTY_TASTE_PROFILE,normaliseTasteProfile} from '../../../../lib/taste-profile';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 try{
  const member=await memberFromRequest(req);
  if(!member)return fail('Sign in to save taste preferences',401);
  const {data,error}=await db().from('member_taste_profiles')
   .select('liked_spirits,avoided_spirits,liked_flavours,avoided_ingredients')
   .eq('member_id',member.id).maybeSingle();
  if(error)throw error;
  return Response.json({profile:data?dbTasteProfile(data):EMPTY_TASTE_PROFILE},
   {headers:{'Cache-Control':'private, no-store'}});
 }catch(error){console.error('taste profile read',error);return fail('Unable to load taste preferences',500)}
}
export async function PUT(req:Request){
 if(process.env.VERCEL_ENV==='preview')return fail('Preview is read-only',403);
 try{
  const member=await memberFromRequest(req);
  if(!member)return fail('Sign in to save taste preferences',401);
  const raw=await req.text();
  if(raw.length>3000)return fail('Too many preference details',413);
  let profile;
  try{profile=normaliseTasteProfile(JSON.parse(raw))}catch(e){
   return fail(e instanceof Error?e.message:'Invalid preferences');
  }
  const {error}=await db().from('member_taste_profiles').upsert({
   member_id:member.id,
   liked_spirits:profile.likedSpirits,
   avoided_spirits:profile.avoidedSpirits,
   liked_flavours:profile.likedFlavours,
   avoided_ingredients:profile.avoidedIngredients,
   updated_at:new Date().toISOString()
  },{onConflict:'member_id'});
  if(error)throw error;
  return Response.json({profile,saved:true},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){console.error('taste profile save',error);return fail('Unable to save taste preferences',500)}
}
