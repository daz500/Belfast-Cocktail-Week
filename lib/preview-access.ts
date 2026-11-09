import 'server-only';
import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto';

const cookieName='bcc-v2-preview';
function hmac(payload:string){
 const secret=process.env.GROUP_INVITE_CODE||'';
 if(!secret)throw new Error('Preview access not configured');
 return createHmac('sha256',secret).update(payload).digest('hex');
}
export function previewCookieName(){return cookieName}
export function createPreviewToken(){
 if(process.env.VERCEL_ENV!=='preview')throw new Error('Preview only');
 const payload=String(Date.now()+2*60*60*1000)+'.'+randomBytes(16).toString('hex');
 return payload+'.'+hmac(payload);
}
export function hasPreviewAccess(req:Request){
 if(process.env.VERCEL_ENV!=='preview')return false;
 const match=(req.headers.get('cookie')||'').match(/(?:^|;\s*)bcc-v2-preview=([^;]+)/);
 if(!match)return false;
 const token=decodeURIComponent(match[1]);const parts=token.split('.');
 if(parts.length!==3||!/^\d{13}$/.test(parts[0])||!/^[a-f0-9]{32}$/.test(parts[1])||!/^[a-f0-9]{64}$/.test(parts[2]))return false;
 const expiry=Number(parts[0]);
 if(expiry<=Date.now()||expiry>Date.now()+2*60*60*1000+1000)return false;
 const expected=Buffer.from(hmac(parts[0]+'.'+parts[1]),'hex');
 const actual=Buffer.from(parts[2],'hex');
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
