'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowDown,ArrowUp,BarChart3,Check,ChevronRight,Heart,LockKeyhole,MapPin,Martini,MessageCircle,RefreshCcw,Route,Send,ShieldCheck,SlidersHorizontal,Sparkles,ThumbsDown,ThumbsUp,Users,Vote,X} from 'lucide-react';
import {COCKTAIL_GUIDE_URL,VENUES,mapSearch,Venue} from '../../lib/venues';
import './v2.css';

type VoteValue = boolean | undefined;
type Votes = Record<string, Record<string, VoteValue>>;
type SavedTrail={venue_ids:string[];explanation:string;created_at:string};
const LIVE=process.env.NEXT_PUBLIC_BCC_V2_LIVE==='true';
const READONLY=process.env.NEXT_PUBLIC_BCC_V2_READONLY==='true';
type Rule = {maxDislikes:number;minLikes:number;minRatings:number;sort:'likes'|'net'|'approval'};
type Override = {action:'include'|'exclude';reason:string};
type Publication = {version:number;date:string;ids:string[];rules:Rule;overrides:Record<string,Override>;scores:Record<string,{likes:number;dislikes:number}>};
type Tab = 'home'|'vote'|'results'|'trail'|'ai'|'organiser';
const people = ['Alex','Sam','Casey','Jordan','Taylor','Morgan'];
const seedCounts:Record<string,[number,number]>={
'sweet-afton':[5,0],'the-fitzwilliam-hotel':[4,0],'the-northern-whig':[4,0],'rita-s':[3,0],'the-lounge-at-haymarket':[3,0],'the-rusty-saddle':[2,0],
'the-perch-rooftop-bar':[4,1],'granny-annies':[3,1],'liquor-xxx':[3,1],'crimson-cocktail-lounge':[2,1],
'common-market':[1,1],'hickson-s-point':[1,1],'malmaison':[1,1],'moxy-belfast-city':[1,1],
'the-courtyard-at-haymarket':[1,1],'the-points':[1,1],'the-watson':[1,1],'tipsy-bird':[1,1],
'the-foundry':[2,2],'no-4-bar':[1,2],'happy-s':[1,2],'horatio-todd-s':[1,2],
'revolucio-n-de-cuba':[1,2],'the-deer-s-head':[1,2],'the-morning-star':[1,2],'three-sheets':[1,2],
'39-gordon-street':[0,2],'char-mash':[0,2],'halt-weavers-cross':[0,2],'novelli':[0,2],
'the-chester':[0,2],'the-maverick':[0,2],'the-phoenix':[0,2],'the-practitioner':[0,2],
'the-stock-exchange':[0,2],'northern-lights':[0,3]
};
function demoVotes():Votes{
 const result:Votes=Object.fromEntries([...people,'You (demo)'].map(p=>[p,{}]));
 VENUES.forEach((v,i)=>{
  const [yes,no]=seedCounts[v.id]||[0,0];
  for(let j=0;j<yes;j++)result[people[(i+j)%people.length]][v.id]=true;
  for(let j=0;j<no;j++)result[people[(i+yes+j)%people.length]][v.id]=false;
 });
 return result;
}
const initialRule:Rule={maxDislikes:0,minLikes:0,minRatings:0,sort:'likes'};
const presetRules:Record<string,Rule>={
 strict:{maxDislikes:0,minLikes:0,minRatings:0,sort:'likes'},
 balanced:{maxDislikes:1,minLikes:2,minRatings:0,sort:'net'},
 popular:{maxDislikes:6,minLikes:0,minRatings:0,sort:'likes'}
};
function rank(a:{likes:number;dislikes:number},b:{likes:number;dislikes:number},sort:Rule['sort']){
 if(sort==='net')return (b.likes-b.dislikes)-(a.likes-a.dislikes)||b.likes-a.likes;
 if(sort==='approval')return b.likes/Math.max(1,b.likes+b.dislikes)-a.likes/Math.max(1,a.likes+a.dislikes)||b.likes-a.likes;
 return b.likes-a.likes||a.dislikes-b.dislikes;
}
function CocktailDetails({venue,onClose}:{venue:Venue;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{dialog.current?.showModal();},[]);
 return <dialog ref={dialog} className="v2-cocktail-dialog" onClose={onClose} aria-labelledby="v2-cocktail-title">
  <div className="v2-cocktail-head">
   <div><span className="v2-kicker">{venue.name}</span><h2 id="v2-cocktail-title">{venue.cocktail}</h2></div>
   <button type="button" aria-label="Close cocktail details" onClick={()=>dialog.current?.close()}><X size={20}/></button>
  </div>
  {venue.cocktailPhoto&&<img className="v2-cocktail-photo" src={venue.cocktailPhoto} alt={venue.cocktail+' cocktail served at '+venue.name}/>}
  <h3>What's in this cocktail?</h3>
  <ul className="v2-ingredients">{venue.cocktailIngredients?.map((ingredient,i)=><li key={i}>{ingredient}</li>)}</ul>
  <a href={COCKTAIL_GUIDE_URL} target="_blank" rel="noopener noreferrer">View official Belfast Cocktail Week guide</a>
 </dialog>;
}
export default function V2Preview(){
 const [tab,setTab]=useState<Tab>('home');
 const [selectedCocktail,setSelectedCocktail]=useState<Venue|null>(null);
 const [votes,setVotes]=useState<Votes>(()=>LIVE?{}:demoVotes());
 const [peopleLive,setPeopleLive]=useState<Array<{key:string;name:string}>>([]);
 const [meKey,setMeKey]=useState('');
 const [token,setToken]=useState('');
 const [invite,setInvite]=useState('');
 const [joiningName,setJoiningName]=useState('');
 const [joining,setJoining]=useState(false);
 const [connected,setConnected]=useState(false);
 const [loadError,setLoadError]=useState('');
 const [voteBusy,setVoteBusy]=useState(false);
 const [adminCode,setAdminCode]=useState('');
 const [savedTrails,setSavedTrails]=useState<SavedTrail[]>([]);
 const [joined,setJoined]=useState(0);
 const [rule,setRule]=useState<Rule>(initialRule);
 const [preset,setPreset]=useState('strict');
 const [selectedPerson,setSelectedPerson]=useState('All participants');
 const [filter,setFilter]=useState('');
 const [overrides,setOverrides]=useState<Record<string,Override>>({});
 const [order,setOrder]=useState<string[]>([]);
 const [publications,setPublications]=useState<Publication[]>([]);
 const [draftNotice,setDraftNotice]=useState('');
 const [question,setQuestion]=useState('');
 const [answer,setAnswer]=useState('');
 const [conversation,setConversation]=useState<Array<{role:'user'|'assistant';content:string;mode?:string}>>([]);
 const [useGenerative,setUseGenerative]=useState(false);
 const [aiBusy,setAiBusy]=useState(false);
 const [aiNotice,setAiNotice]=useState('');
 const [showMatrix,setShowMatrix]=useState(false);
 const [maxVenues,setMaxVenues]=useState(6);
 const voterNames=LIVE?peopleLive.map(p=>p.key):[...people,'You (demo)'];
 const currentVoter=LIVE?meKey:'You (demo)';
 const friendlyName=(key:string)=>LIVE?(peopleLive.find(p=>p.key===key)?.name||key):key;
 const existingTrail=savedTrails[0];
 const officialTrailIds=LIVE?(existingTrail?.venue_ids||[]):undefined;
 const refreshLive=async(t:string)=>{
  const response=await fetch('/api/v2/state',{headers:{'x-member-token':t},cache:'no-store'});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Could not load the live voting records');
  setVotes(data.votes||{});setPeopleLive(data.people||[]);setMeKey(data.meKey||'');
  setSavedTrails(data.trails||[]);setJoined(data.joined||0);setConnected(true);setLoadError('');
 };
 useEffect(()=>{
  if(!LIVE)return;
  const params=new URLSearchParams(window.location.search);
  setInvite(params.get('invite')||'');
  const t=localStorage.getItem('bcc-member-token')||'';
  setToken(t);
  refreshLive(t).catch(e=>{if(t)setLoadError((e as Error).message);setConnected(false)});
 },[]);
 useEffect(()=>{
  if(!LIVE||!connected)return;
  const timer=setInterval(()=>{refreshLive(token).catch(e=>setLoadError((e as Error).message))},10000);
  return()=>clearInterval(timer);
 },[token,connected]);
 const joinGroup=async()=>{
  if(!invite||(!READONLY&&!joiningName.trim())||joining)return;
  setJoining(true);setLoadError('');
  if(READONLY){
   try{
    const response=await fetch('/api/v2/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:invite})});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'Preview access denied');
    await refreshLive('');
   }catch(e){setLoadError((e as Error).message)}finally{setJoining(false)}
   return;
  }
  try{
   const response=await fetch('/api/join',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:invite,name:joiningName.trim(),style:'mixed',wantsFood:false})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'Unable to join group');
   localStorage.setItem('bcc-member-token',data.token);setToken(data.token);
   await refreshLive(data.token);
  }catch(e){setLoadError((e as Error).message)}finally{setJoining(false)}
 };
 const scores=useMemo(()=>Object.fromEntries(VENUES.map(v=>{
  const vals=voterNames.map(p=>votes[p]?.[v.id]);
  return [v.id,{likes:vals.filter(x=>x===true).length,dislikes:vals.filter(x=>x===false).length}];
 })) as Record<string,{likes:number;dislikes:number}>,[votes]);
 const participation=useMemo(()=>voterNames.map(name=>({name,cast:Object.keys(votes[name]||{}).length})),[votes]);
 const active=participation.filter(p=>p.cast>0).length;
 const totalVotes=participation.reduce((a,b)=>a+b.cast,0);
 const counted=VENUES.map(v=>({...v,...scores[v.id],rated:scores[v.id].likes+scores[v.id].dislikes}));
 const eligible=counted.filter(v=>v.dislikes<=rule.maxDislikes&&v.likes>=rule.minLikes&&v.rated>=rule.minRatings).sort((a,b)=>rank(a,b,rule.sort)||a.name.localeCompare(b.name));
 const baseline=new Set(eligible.map(v=>v.id));
 const officialIds=useMemo(()=>{
  const filtered=order.filter(id=>VENUES.some(v=>v.id===id)&&(overrides[id]?.action==='include'||(baseline.has(id)&&overrides[id]?.action!=='exclude')));
  const remainder=eligible.filter(v=>overrides[v.id]?.action!=='exclude').map(v=>v.id);
  const extra=VENUES.filter(v=>overrides[v.id]?.action==='include').map(v=>v.id);
  return [...new Set([...filtered,...remainder,...extra])];
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[order,overrides,rule,votes]);
 const latest=publications[publications.length-1];
 const setPresetRule=(name:string)=>{setPreset(name);setRule({...presetRules[name]});setOrder([]);setOverrides({});setDraftNotice('')};
 const changeRule=(patch:Partial<Rule>)=>{setPreset('custom');setRule(v=>({...v,...patch}));setDraftNotice('')};
 const setVote=async(id:string,liked:boolean)=>{
  if(!LIVE){setVotes(prev=>({...prev,'You (demo)':{...prev['You (demo)'],[id]:liked}}));return;}
  if(READONLY){setLoadError('Preview is read-only; votes can only be changed in production.');return;}
  if(!token||voteBusy)return;
  setVoteBusy(true);setLoadError('');
  try{
   const response=await fetch('/api/vote',{method:'POST',headers:{'Content-Type':'application/json','x-member-token':token},body:JSON.stringify({venueId:id,liked})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'Vote not saved');
   await refreshLive(token);
  }catch(e){setLoadError((e as Error).message)}finally{setVoteBusy(false)}
 };
 const adjust=(id:string,on:boolean)=>{
  const normal=baseline.has(id);
  setOverrides(prev=>{const next={...prev};if(on===normal)delete next[id];else next[id]={action:on?'include':'exclude',reason:prev[id]?.reason||''};return next});
  setDraftNotice('');
 };
 const move=(id:string,dir:number)=>{
  const ids=[...officialIds],i=ids.indexOf(id),j=i+dir;if(i<0||j<0||j>=ids.length)return;
  [ids[i],ids[j]]=[ids[j],ids[i]];setOrder(ids);
 };
 const invalidReasons=Object.entries(overrides).some(([,v])=>!v.reason.trim());
 const publish=async()=>{
  if(!officialIds.length||invalidReasons)return;
  if(LIVE){
   if(READONLY){setDraftNotice('Preview is read-only; publishing is disabled.');return;}
   if(!adminCode.trim()||!token){setDraftNotice('Enter your organiser code before publishing.');return;}
   if(!window.confirm('Publish this shortlist to the whole group? It will replace the currently displayed trail.'))return;
   try{
    const response=await fetch('/api/trail',{method:'POST',headers:{'Content-Type':'application/json','x-member-token':token},body:JSON.stringify({action:'publish',adminCode,venueIds:officialIds,
     rules:rule,overrides})});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'Publishing failed');
    await refreshLive(token);setDraftNotice('Official shortlist published. All group members can now see the update.');
   }catch(e){setDraftNotice((e as Error).message)}
   return;
  }
  const snap:Publication={version:publications.length+1,date:new Date().toLocaleString('en-GB'),ids:[...officialIds],rules:{...rule},overrides:structuredClone(overrides),scores:structuredClone(scores)};
  setPublications(p=>[...p,snap]);setDraftNotice('Demo version '+snap.version+' published in this browser only.');
 };
 const instantAnswer=(input:string):string=>{
  const q=input.trim().toLowerCase();
  const n=q.match(/(?:allow|permit|up to|at most|maximum|with)\s+(one|two|three|four|five|zero|\d+)\s+dislikes?/);
  const numberWord:Record<string,number>={zero:0,one:1,two:2,three:3,four:4,five:5};
  const max=n?(numberWord[n[1]]??Number(n[1])):undefined;
  const venue=counted.find(v=>q.includes(v.name.toLowerCase())||q.includes(v.cocktail?.toLowerCase()||'NO_MATCH_COCKTAIL'));
  const person=voterNames.find(p=>q.includes(p.toLowerCase()));
  const format=(v:typeof counted[number])=>v.name+' ('+v.likes+' likes, '+v.dislikes+' dislikes; '+v.rated+' rated)';
  if(/ingredient|what.s in|made of|contains|recipe/.test(q)&&venue)
   return venue.cocktail+' at '+venue.name+' contains: '+(venue.cocktailIngredients||[]).join(', ')+'. You can open the cocktail photo from the Vote or Results tab.';
  if(venue&&/who|which person|voters/.test(q)&&/like|dislike|vot/.test(q)){
   const yes=voterNames.filter(p=>votes[p]?.[venue.id]===true),no=voterNames.filter(p=>votes[p]?.[venue.id]===false),missing=voterNames.filter(p=>votes[p]?.[venue.id]===undefined);
   return venue.name+': Liked by '+(yes.join(', ')||'nobody')+'. Disliked by '+(no.join(', ')||'nobody')+'. Not yet rated by '+(missing.join(', ')||'nobody')+'.';
  }
  if(venue&&/vote|like|dislike|rating|score|opinion|think|popular|about/.test(q))
   return format(venue)+'. Approval among people who rated it: '+(venue.rated?Math.round(100*venue.likes/venue.rated)+'%':'not available')+'. '+(venue.dislikes===0?'No recorded objections, but not every person necessarily voted for it.':'It has recorded objections.') ;
  if(person&&/vote|like|dislike|prefer|choose|rated|progress|think/.test(q)){
   const likes=counted.filter(v=>votes[person]?.[v.id]===true),dislikes=counted.filter(v=>votes[person]?.[v.id]===false);
   return person+' rated '+(likes.length+dislikes.length)+' of 36 venues. Likes ('+likes.length+'): '+(likes.slice(0,12).map(v=>v.name).join(', ')||'none')+(likes.length>12?' and '+(likes.length-12)+' more':'')+'. Dislikes ('+dislikes.length+'): '+(dislikes.slice(0,12).map(v=>v.name).join(', ')||'none')+(dislikes.length>12?' and '+(dislikes.length-12)+' more':'')+'.';
  }
  if(/who.*(not|hasn.t|haven.t|yet)|no votes|not started|participat|progress|who voted/.test(q)){
   const inactive=participation.filter(p=>p.cast===0);
   return active+' of '+voterNames.length+' demo participants have voted. '+totalVotes+' venue ratings recorded. Not yet started: '+(inactive.map(p=>p.name).join(', ')||'nobody')+'. Ratings by participant: '+participation.map(p=>p.name+' '+p.cast).join(' · ')+'.';
  }
  if(/compare|difference|versus| vs /.test(q)){
   const matches=counted.filter(v=>q.includes(v.name.toLowerCase()));
   if(matches.length>=2)return 'Comparison: '+matches.map(format).join(' versus ')+'. Note that missing votes are not dislikes.';
   return 'To compare venues, include two venue names, for example “Compare Sweet Afton and The Northern Whig”.';
  }
  if(max!==undefined&&/dislike|objection/.test(q)){
   const m=q.match(/(?:at least|minimum|require)\s+(one|two|three|four|five|\d+)\s+likes?/);
   const minimum=m?(numberWord[m[1]]??Number(m[1])):0;
   const chosen=counted.filter(v=>v.dislikes<=max&&v.likes>=minimum).sort((a,b)=>b.likes-a.likes||a.dislikes-b.dislikes);
   return 'Allowing up to '+max+' dislikes'+(minimum?', requiring at least '+minimum+' likes':'')+' produces '+chosen.length+' qualifying venues: '+chosen.slice(0,12).map(format).join('; ')+(chosen.length>12?'; and '+(chosen.length-12)+' more':'')+'. This is a personal scenario only; no votes or official selections changed.';
  }
  if(/unanimous|everyone agree|zero dislike|no dislike|no objection|consensus/.test(q)){
   const zeros=counted.filter(v=>v.dislikes===0&&v.likes>0).sort((a,b)=>b.likes-a.likes);
   return zeros.length+' venues currently have at least one like and no dislikes: '+zeros.slice(0,10).map(format).join('; ')+(zeros.length>10?'; and '+(zeros.length-10)+' more':'')+'. This is no recorded objection, NOT unanimous approval; some participants have not rated them.';
  }
  if(/trail|route|walk|itinerary|five.bar|five bar/.test(q)){
   const stops=officialIds.slice(0,5).map(id=>counted.find(v=>v.id===id)?.name).filter(Boolean);
   return 'The demo shortlist currently starts with '+stops.join(' → ')+'. Open Trail for walking directions, or Organiser Studio to change the order. These are voting-ranked stops, not an optimised walking route.';
  }
  if(/top|best|favourite|popular|most liked|rank|winning|leader/.test(q)){
   const best=counted.slice().sort((a,b)=>b.likes-a.likes||a.dislikes-b.dislikes).slice(0,8);
   return 'Most-liked demo venues: '+best.map(format).join('; ')+'. For a no-objection ranking, use the Strict filter in Results.';
  }
  if(/approval|percentage|rate/.test(q)){
   const ranked=counted.filter(v=>v.rated>0).sort((a,b)=>b.likes/b.rated-a.likes/a.rated||b.rated-a.rated).slice(0,7);
   return 'Highest approval among people who voted: '+ranked.map(v=>v.name+' '+Math.round(100*v.likes/v.rated)+'% ('+v.rated+' ratings)').join('; ')+'. A high percentage from only a few ratings is less conclusive.';
  }
  if(/official|publish|shortlist|rule|filter/.test(q)){
   return 'Your current rules match '+eligible.length+' of 36 venues; '+officialIds.length+' venues are in the proposed shortlist after manual adjustments. The Results filters are personal. Organiser Studio can create a DEMO publication, but cannot modify the real application.';
  }
  return 'I can calculate voting progress, individual preferences, who liked or disliked a named venue, cocktail ingredients, venue comparisons, rankings, consensus and what-if scenarios. Try “Who disliked Sweet Afton?”, “What if we allow one dislike?”, or “What is in the Honey Paloma?”. For fully flexible conversation, use the optional AI Gateway mode once it has been configured.';
 };
 const ask=async(input:string)=>{
  const q=input.trim();if(!q||aiBusy)return;
  setQuestion('');
  setAiNotice('');
  const prior=conversation.slice(-6).map(m=>({role:m.role,content:m.content}));
  setConversation(old=>[...old,{role:'user',content:q}]);
  if(!useGenerative){
   const result=instantAnswer(q);
   setAnswer(result);
   setConversation(old=>[...old,{role:'assistant',content:result,mode:'instant'}]);
   return;
  }
  setAiBusy(true);
  try{
   const response=await fetch('/api/v2/chat',{method:'POST',headers:{'Content-Type':'application/json',...(LIVE?{'x-member-token':token}:{})},
    body:JSON.stringify({question:q,history:prior,
     venues:counted.map(v=>({name:v.name,cocktail:v.cocktail,likes:v.likes,dislikes:v.dislikes})),
     members:participation.map(p=>({name:p.name,ratings:p.cast,
      likes:Object.values(votes[p.name]||{}).filter(Boolean).length,
      dislikes:Object.values(votes[p.name]||{}).filter(x=>x===false).length})),
     rules:rule})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||'AI unavailable');
   const result=String(data.answer);
   setAnswer(result);
   setConversation(old=>[...old,{role:'assistant',content:result,mode:'generative'}]);
  }catch(e){
   const result=instantAnswer(q);
   setAnswer(result);
   setAiNotice((e as Error).message+' Showing instant analysis instead.');
   setConversation(old=>[...old,{role:'assistant',content:result,mode:'instant'}]);
  }finally{setAiBusy(false);}
 };
 const top=counted.slice().sort((a,b)=>b.likes-a.likes).slice(0,5);
 const cocktailLink=(v:Venue)=> <button type="button" className="v2-cocktail-link" onClick={()=>setSelectedCocktail(v)} aria-label={'View photo and ingredients for '+v.cocktail+' at '+v.name}><Martini size={13}/>{v.cocktail||'See cocktail'}</button>;
 const showTab=(next:Tab)=>{setTab(next);window.scrollTo({top:0,behavior:'smooth'})};
 const nav:[Tab,string,typeof Heart][]=[['home','Home',Martini],['vote','Vote',Heart],['results','Results',BarChart3],['trail','Trail',Route],['ai','AI',Sparkles]];
 return <main className="v2-shell"><div className="v2-app">
  <header className="v2-header"><div className="v2-brand"><span className="v2-symbol"><Martini size={24}/></span><div><small>BELFAST COCKTAIL CLUB</small><strong>The social cocktail planner</strong></div></div><span className="v2-preview-pill">V2 TEST</span></header>
  <div className="v2-demo-banner"><LockKeyhole size={15}/> {LIVE?(READONLY?'Read-only preview · Real group data · No writes':'Authenticated group · Live shared votes and official trail'):'Isolated demonstration · Fake participant names · No live votes or database writes'}</div>
  {LIVE&&!connected&&<section className="v2-content"><h1 className="v2-page-title">Welcome to the Cocktail Club</h1><p className="v2-muted">Existing members on this device will sign in automatically. New members can join using the original private invitation link.</p>
   {loadError&&<p role="alert" className="v2-error">{loadError}</p>}
   {(!token||READONLY)&&<div className="v2-panel">{!READONLY&&<label>Your name<input className="v2-input" maxLength={32} value={joiningName} onChange={e=>setJoiningName(e.target.value)} placeholder="Enter your name"/></label>}
    <p className="v2-muted">{invite?'Invitation detected':'Open the invitation link shared in WhatsApp to join.'}</p>
    <button className="v2-main-button" disabled={joining||!invite||(!READONLY&&!joiningName.trim())} onClick={joinGroup}>{joining?'Opening…':READONLY?'View live results (read-only)':'Join group'}</button>
   </div>}
   <button className="v2-outline" onClick={()=>{refreshLive(token).catch(e=>setLoadError((e as Error).message))}}>Retry session</button>
   {token&&<button className="v2-outline" onClick={()=>{localStorage.removeItem('bcc-member-token');setToken('');setLoadError('')}}>Use a new invitation</button>}
  </section>}
  {(!LIVE||connected)&&<>
  {loadError&&<div role="alert" className="v2-error" style={{padding:12}}>{loadError}</div>}
  {tab==='home'&&<section className="v2-content">
   <div className="v2-hero"><span className="v2-kicker">WELCOME TO VERSION 2.0</span><h1>Your people.<br/><em>Your picks.</em><br/>One great night.</h1><p>See the votes, find your favourites and shape the perfect Belfast cocktail trail.</p><button className="v2-main-button" onClick={()=>showTab('results')}>Explore the results <ChevronRight size={18}/></button></div>
   <div className="v2-grid3"><div className="v2-stat"><strong>{active}/{LIVE?joined:7}</strong><span>Active voters</span></div><div className="v2-stat"><strong>{totalVotes}</strong><span>Ratings</span></div><div className="v2-stat"><strong>{counted.filter(v=>v.dislikes===0).length}</strong><span>No dislikes</span></div></div>
   <div className="v2-heading"><h2>Group favourites</h2><button onClick={()=>showTab('results')}>View all <ChevronRight size={15}/></button></div>
   {top.map((v,i)=><div className="v2-line" key={v.id}><span className="v2-rank">{String(i+1).padStart(2,'0')}</span><div><strong>{v.name}</strong>{cocktailLink(v)}</div><span className="v2-positive"><Heart size={14}/> {v.likes}</span></div>)}
   <button className="v2-outline" onClick={()=>showTab('organiser')}><ShieldCheck size={17}/> Open organiser studio</button>
  </section>}
  {tab==='vote'&&<section className="v2-content">
   <span className="v2-kicker">VOTE ON COCKTAIL VENUES</span><h1 className="v2-page-title">Make your picks</h1>
   <p className="v2-muted">{LIVE?(READONLY?'This is a read-only copy of the group results. Voting is disabled here.':'Your votes are saved to the group and update the live results.'):'Votes belong to fictional “You (demo)” and change this preview only.'}</p>
   <input className="v2-input" placeholder="Search 36 venues..." value={filter} onChange={e=>setFilter(e.target.value)}/>
   {VENUES.filter(v=>v.name.toLowerCase().includes(filter.toLowerCase())).map(v=><div className="v2-venue" key={v.id}><div className="v2-venue-heading"><div><strong>{v.name}</strong>{cocktailLink(v)}</div><a href={mapSearch(v)} target="_blank" rel="noreferrer" aria-label={'Map for '+v.name}><MapPin size={16}/></a></div><div className="v2-vote-actions"><button className={votes[currentVoter]?.[v.id]===false?'v2-selected-down':''} disabled={voteBusy||READONLY} onClick={()=>{void setVote(v.id,false)}}><ThumbsDown size={16}/> Not interested</button><button className={votes[currentVoter]?.[v.id]===true?'v2-selected-up':''} disabled={voteBusy||READONLY} onClick={()=>{void setVote(v.id,true)}}><ThumbsUp size={16}/> Interested</button></div></div>)}
  </section>}
  {tab==='results'&&<section className="v2-content">
   <span className="v2-kicker">GROUP VOTING ANALYTICS</span><h1 className="v2-page-title">Explore results</h1>
   <div className="v2-grid3"><div className="v2-stat"><strong>{totalVotes}</strong><span>Votes</span></div><div className="v2-stat"><strong>{active}</strong><span>Active</span></div><div className="v2-stat"><strong>{eligible.length}</strong><span>Matches</span></div></div>
   <div className="v2-panel"><h3><SlidersHorizontal size={17}/> Your shortlist rules</h3><div className="v2-presets">{[['strict','Strict'],['balanced','Balanced'],['popular','Popular']].map(([key,label])=><button key={key} className={preset===key?'active':''} onClick={()=>setPresetRule(key)}>{label}</button>)}</div>
    <div className="v2-rule"><label>Maximum dislikes <strong>{rule.maxDislikes===6?'Any':rule.maxDislikes}</strong></label><input type="range" min="0" max="6" value={rule.maxDislikes} onChange={e=>changeRule({maxDislikes:Number(e.target.value)})}/></div>
    <div className="v2-rule"><label>Minimum likes <strong>{rule.minLikes}</strong></label><input type="range" min="0" max="6" value={rule.minLikes} onChange={e=>changeRule({minLikes:Number(e.target.value)})}/></div>
    <div className="v2-rule"><label>Minimum ratings <strong>{rule.minRatings}</strong></label><input type="range" min="0" max="7" value={rule.minRatings} onChange={e=>changeRule({minRatings:Number(e.target.value)})}/></div>
    <label className="v2-select-label">Rank by <select value={rule.sort} onChange={e=>changeRule({sort:e.target.value as Rule['sort']})}><option value="likes">Most likes</option><option value="net">Likes minus dislikes</option><option value="approval">Approval percentage</option></select></label>
   </div>
   <div className="v2-heading"><h2>{eligible.length} matching venues</h2><button onClick={()=>{setPresetRule('strict')}}><RefreshCcw size={14}/> Reset</button></div>
   {eligible.map((v,i)=><div key={v.id} className="v2-result"><span className="v2-rank">{i+1}</span><div className="v2-result-main"><strong>{v.name}</strong><small>{v.rated} of {LIVE?joined:7} participants rated</small>{cocktailLink(v)}<div className="v2-meter"><span style={{width:(v.likes/Math.max(1,LIVE?joined:7)*100)+'%'}}/></div></div><div className="v2-tallies"><span className="v2-positive"><ThumbsUp size={13}/> {v.likes}</span><span className="v2-negative"><ThumbsDown size={13}/> {v.dislikes}</span></div></div>)}
   {eligible.length===0&&<p className="v2-empty">Nothing matches these rules. Try reducing the minimum likes or ratings.</p>}
   <div className="v2-panel"><h3><Users size={18}/> Individual voting transparency</h3><label className="v2-select-label">Participant <select value={selectedPerson} onChange={e=>setSelectedPerson(e.target.value)}><option>All participants</option>{voterNames.map(p=><option key={p}>{p}</option>)}</select></label>
    {selectedPerson!=='All participants'?<div className="v2-person-summary"><strong>{friendlyName(selectedPerson)}</strong><span>{Object.keys(votes[selectedPerson]||{}).length} venues rated</span>{VENUES.filter(v=>votes[selectedPerson]?.[v.id]!==undefined).map(v=><div key={v.id} className="v2-mini-vote"><span>{v.name}</span>{votes[selectedPerson]?.[v.id]?<ThumbsUp size={16} className="v2-positive"/>:<ThumbsDown size={16} className="v2-negative"/>}</div>)}</div>:<div className="v2-people">{participation.map(p=><button key={p.name} onClick={()=>setSelectedPerson(p.name)}><strong>{friendlyName(p.name)}{LIVE&&p.name!==friendlyName(p.name)?' ('+p.name.slice(-5)+')':''}</strong><small>{p.cast} votes</small></button>)}</div>}
    <button className="v2-outline" onClick={()=>setShowMatrix(!showMatrix)}>{showMatrix?'Hide':'Show'} full voting matrix <ChevronRight size={16}/></button>
    {showMatrix&&<div className="v2-matrix-scroll"><table><thead><tr><th>Venue</th>{voterNames.map(p=><th key={p}>{p}</th>)}</tr></thead><tbody>{VENUES.map(v=><tr key={v.id}><th>{v.name}</th>{voterNames.map(p=><td key={p}>{votes[p]?.[v.id]===true?'✓':votes[p]?.[v.id]===false?'✕':'–'}</td>)}</tr>)}</tbody></table></div>}
   </div>
  </section>}
  {tab==='organiser'&&<section className="v2-content">
   <span className="v2-kicker">ORGANISER STUDIO</span><h1 className="v2-page-title">Official shortlist</h1><p className="v2-muted">Review the results, override individual venues and publish a shortlist. {LIVE?(READONLY?'Preview only: publishing and voting are disabled.':'Publishing requires the organiser code and updates the shared trail.'):'This is a demonstration; no real database records change.'}</p>
   <div className="v2-panel"><h3><SlidersHorizontal size={17}/> Selection rules</h3><p className="v2-muted">Same personal rules as the Results tab. You can change them there.</p><strong>{eligible.length} venues qualify automatically</strong><button className="v2-outline" onClick={()=>showTab('results')}>Change selection rules <ChevronRight size={16}/></button></div>
   <div className="v2-heading"><h2>Manual adjustments</h2><span>{officialIds.length} selected</span></div>
   {counted.slice().sort((a,b)=>rank(a,b,rule.sort)).map(v=>{
    const on=officialIds.includes(v.id),changed=!!overrides[v.id];
    return <div key={v.id} className="v2-adjust"><div className="v2-adjust-title"><label><input type="checkbox" checked={on} onChange={e=>adjust(v.id,e.target.checked)}/><span><strong>{v.name}</strong><small>{v.likes} likes · {v.dislikes} dislikes</small></span></label>{changed&&<span className="v2-override-pill">Override</span>}</div>
    {changed&&<input className="v2-input" placeholder="Required: why did you override this venue?" value={overrides[v.id].reason} onChange={e=>setOverrides(p=>({...p,[v.id]:{...p[v.id],reason:e.target.value}}))}/>}
    {on&&<div className="v2-reorder"><button disabled={officialIds[0]===v.id} onClick={()=>move(v.id,-1)} aria-label={'Move '+v.name+' up'}><ArrowUp size={15}/></button><button disabled={officialIds[officialIds.length-1]===v.id} onClick={()=>move(v.id,1)} aria-label={'Move '+v.name+' down'}><ArrowDown size={15}/></button></div>}
    </div>;
   })}
   {LIVE&&!READONLY&&<div className="v2-panel"><label className="v2-select-label">Organiser code<input className="v2-input" type="password" autoComplete="off" value={adminCode} onChange={e=>setAdminCode(e.target.value)} placeholder="Enter your organiser code"/></label></div>}
   <div className="v2-panel"><h3><ShieldCheck size={18}/> Publication preview</h3><p className="v2-muted">{officialIds.length} selected venues · {Object.keys(overrides).length} manual overrides</p><ol className="v2-preview-list">{officialIds.map(id=><li key={id}>{VENUES.find(v=>v.id===id)?.name}{overrides[id]&&<small> · Manually included</small>}</li>)}</ol>
    {invalidReasons&&<p className="v2-error">Please enter a reason for every manual adjustment.</p>}
    <button className="v2-main-button" disabled={invalidReasons||officialIds.length===0||READONLY||(LIVE&&!adminCode.trim())} onClick={()=>{void publish()}}><Send size={17}/> {LIVE?'Publish official shortlist':'Publish DEMO snapshot'}</button>
    {draftNotice&&<p role="status" className="v2-success">{draftNotice}</p>}
   </div>
   {LIVE&&existingTrail&&<div className="v2-panel"><h3>Current official trail</h3><p className="v2-muted">{existingTrail.created_at}</p><ol className="v2-preview-list">{existingTrail.venue_ids.map(id=><li key={id}>{VENUES.find(v=>v.id===id)?.name||id}</li>)}</ol></div>}
   {latest&&!LIVE&&<div className="v2-panel"><h3><Check size={18}/> Published in this preview · v{latest.version}</h3><p className="v2-muted">{latest.date} · {latest.ids.length} venues, frozen at publication</p><ol className="v2-preview-list">{latest.ids.map(id=><li key={id}>{VENUES.find(v=>v.id===id)?.name}</li>)}</ol><p className="v2-muted">New demo votes do not change this snapshot. Publish again to create a new version.</p></div>}
   {publications.length>1&&<p className="v2-muted">Demo publication history: {publications.map(p=>'v'+p.version).join(' → ')}</p>}
  </section>}
  {tab==='trail'&&<section className="v2-content"><span className="v2-kicker">GROUP ITINERARY</span><h1 className="v2-page-title">Our cocktail trail</h1>
   <p className="v2-muted">Preview walking directions using the {LIVE&&existingTrail?'latest published group trail':latest?'demo shortlist':'current proposed shortlist'}. Stop order is editable in Organiser Studio and has not been optimised for walking distance.</p>
   {(officialTrailIds||latest?.ids||officialIds).slice(0,maxVenues).map((id,i)=>{const v=VENUES.find(x=>x.id===id);return v?<div className="v2-line" key={id}><span className="v2-rank">{i+1}</span><div><strong>{v.name}</strong><small>{v.address||v.area||'Belfast'}</small>{cocktailLink(v)}</div><a href={mapSearch(v)} target="_blank" rel="noreferrer"><MapPin size={17}/></a></div>:null})}
   <div className="v2-panel"><label className="v2-select-label">Stops to include <select value={maxVenues} onChange={e=>setMaxVenues(Number(e.target.value))}>{[3,4,5,6,8,12,36].map(x=><option key={x} value={x}>{x} stops maximum</option>)}</select></label>
    {(()=>{const ids=(officialTrailIds||latest?.ids||officialIds).slice(0,maxVenues);const stops=ids.map(id=>VENUES.find(v=>v.id===id)).filter((v):v is NonNullable<typeof v>=>!!v);if(stops.length<2)return <p className="v2-muted">Choose at least two venues to view directions.</p>;const places=stops.slice(0,5).map(v=>v.address||v.name+', Belfast');const params=new URLSearchParams({api:'1',origin:places[0],destination:places[places.length-1],travelmode:'walking'});if(places.length>2)params.set('waypoints',places.slice(1,-1).join('|'));return <><a className="v2-main-button" href={'https://www.google.com/maps/dir/?'+params.toString()} target="_blank" rel="noreferrer"><MapPin size={17}/> Open walking directions (first {places.length} stops)</a>{stops.length>5&&<p className="v2-muted">More than five stops selected. Open further route sections separately when implemented.</p>}</>;})()}
   </div>
  </section>}
  {tab==='ai'&&<section className="v2-content"><span className="v2-kicker">GROUP ANALYSIS · {LIVE?'LIVE VOTES':'DEMO DATA'}</span><h1 className="v2-page-title">Ask Cocktail Club</h1>
   <div className="v2-panel"><h3><Sparkles size={18}/> Your voting assistant</h3>
    <p className="v2-muted">Ask follow-up questions about votes, objections, cocktails and alternative shortlists. {LIVE?'Answers use the group voting records. The AI only analyses data; it cannot change votes.':'Answers use fictional demo participants and votes, not the live group.'}</p>
    <label className="v2-ai-mode"><input type="checkbox" checked={useGenerative} onChange={e=>setUseGenerative(e.target.checked)}/> Try generative AI when available <small>Requires preview AI Gateway configuration. Instant analysis always works.</small></label>
    <div className="v2-ai-chips">{['Who has not voted yet?','Who disliked Sweet Afton?','What if we allow one dislike?','Compare Sweet Afton and The Northern Whig','What is in the Honey Paloma?','Which venues have zero dislikes?'].map(q=><button className="v2-ai-suggestion" key={q} disabled={aiBusy} onClick={()=>{void ask(q)}}><MessageCircle size={16}/>{q}<ChevronRight size={15}/></button>)}</div>
    <div className="v2-chat-log" aria-live="polite">{conversation.length===0?<p className="v2-muted">Choose a suggestion or ask your own question to begin.</p>:conversation.map((m,i)=><div key={i} className={'v2-chat-bubble '+(m.role==='user'?'user':'assistant')}><small>{m.role==='user'?'You':m.mode==='generative'?'AI assistant':'Instant voting insights'}</small><p>{m.content}</p></div>)}</div>
    {aiNotice&&<p role="status" className="v2-muted">{aiNotice}</p>}
    <form onSubmit={e=>{e.preventDefault();void ask(question)}} className="v2-ask-form"><input className="v2-input" maxLength={900} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask about votes, bars or cocktails..." aria-label="Ask the voting assistant"/><button type="submit" disabled={aiBusy||!question.trim()} className="v2-main-button">{aiBusy?'Analysing…':'Ask'} <Sparkles size={16}/></button></form>
    {conversation.length>0&&<button className="v2-outline" onClick={()=>{setConversation([]);setAnswer('');setAiNotice('')}}>Clear conversation</button>}
   </div>
   <p className="v2-muted">{LIVE?'Answers use your group snapshot. Generative AI checks membership server-side and never edits votes.':'Instant calculations come from demo votes in your browser. Neither mode can edit live votes.'}</p>
  </section>}
  </>}
  <nav className="v2-nav" aria-label="Main navigation">{nav.map(([id,label,Icon])=><button type="button" key={id} className={tab===id?'active':''} onClick={()=>showTab(id)}><Icon size={20}/><span>{label}</span></button>)}</nav>
  {selectedCocktail&&<CocktailDetails venue={selectedCocktail} onClose={()=>setSelectedCocktail(null)}/>}
  <footer className="v2-footer">V2 preview · No production changes · <button onClick={()=>showTab('organiser')}>Organiser Studio</button></footer>
 </div></main>;
}
