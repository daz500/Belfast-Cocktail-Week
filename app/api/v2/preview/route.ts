import {NextResponse} from 'next/server';
import {secureCompare} from '../../../../lib/server';
import {createPreviewToken,previewCookieName} from '../../../../lib/preview-access';
export const runtime='nodejs';
export async function POST(req:Request){
 if(process.env.VERCEL_ENV!=='preview')return Response.json({error:'Not available on production'},{status:404});
 try{
  const body=await req.json();const provided=String(body.code||'');const expected=process.env.GROUP_INVITE_CODE||'';
  if(!expected||!secureCompare(provided,expected))return Response.json({error:'Invalid invitation code'},{status:403});
  const response=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  response.cookies.set(previewCookieName(),createPreviewToken(),{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:7200});
  return response;
 }catch{return Response.json({error:'Invalid request'},{status:400})}
}
