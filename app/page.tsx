'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ChevronDown,Clipboard,Heart,MapPin,Martini,RefreshCw,Share2,Sparkles,Trophy,Users,X} from 'lucide-react';
import {COCKTAIL_GUIDE_URL,VENUES,FEATURED,mapSearch,Venue} from '../lib/venues';
type Summary=Record<string,{likes:number;dislikes:number}>;
type GroupState={me:{id:string;name:string};joined:number;summary:Summary;mine:Record<string,boolean>;trail:null|{venue_ids:string[];explanation:string;generated_by_ai:boolean;created_at:string}};
const featured=FEATURED.map(id=>VENUES.find(v=>v.id===id)!).filter(Boolean);
const all=(v:Venue)=>v.address?v.address:v.area||'Belfast';
const cocktailLabel=(v:Venue)=>v.cocktail||'Cocktail details unavailable';
async function api(url:string,token:string,body?:unknown,method=body===undefined?'GET':'POST'){const r=await fetch(url,{method,headers:{'Content-Type':'application/json','x-member-token':token},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});const data=await r.json();if(!r.ok)throw new Error(data.error||'Something went wrong');return data}
export default function Home(){
 const [token,setToken]=useState('');const [invite,setInvite]=useState('');const [name,setName]=useState('');const [style,setStyle]=useState('mixed');const [food,setFood]=useState(false);
 const [state,setState]=useState<GroupState|null>(null);const [screen,setScreen]=useState<'welcome'|'vote'|'results'|'trail'>('welcome');const [index,setIndex]=useState(0);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [showAll,setShowAll]=useState(false);const [admin,setAdmin]=useState('');
 const voteRevision = useRef(0);
 useEffect(()=>{const params=new URLSearchParams(window.location.search);setInvite(params.get('invite')||'');setToken(localStorage.getItem('bcc-member-token')||'')},[]);
 const refresh = useCallback(async (t: string, quiet = false) => {
  if (!t) return;
  const revision = voteRevision.current;
  try {
   const data = await api('/api/state', t);
   if (revision !== voteRevision.current) return;
   setState(data);
   if (!quiet) setError('');
  } catch (e) {
   if (revision !== voteRevision.current) return;
   const message = (e as Error).message;
   if (!quiet) setError(message);
   if (message.includes('Session expired')) {
    setToken('');
    localStorage.removeItem('bcc-member-token');
   }
  }
 }, []);
 useEffect(()=>{if(!token)return;refresh(token);const id=setInterval(()=>refresh(token,true),8000);return()=>clearInterval(id)},[token,refresh]);
 const join=async()=>{setError('');setBusy(true);try{const data=await api('/api/join','',{code:invite,name:name.trim(),style,wantsFood:food});localStorage.setItem('bcc-member-token',data.token);setToken(data.token);await refresh(data.token);setScreen('vote')}catch(e){setError((e as Error).message)}finally{setBusy(false)}};
 const saveVote=async(venueId:string,liked:boolean)=>{if(!state||busy)return;setBusy(true);setError('');try{await api('/api/vote',token,{venueId,liked});await refresh(token,true);if(index===featured.length-1)setScreen('results');else setIndex(i=>i+1)}catch(e){setError((e as Error).message)}finally{setBusy(false)}};
 const resetVotes = async () => {
  if (!state || busy || !window.confirm('Clear all your votes and start again? Your place in the group is kept.')) return;
  setBusy(true);
  setError('');
  setNotice('');
  try {
   await api('/api/vote', token, undefined, 'DELETE');
   voteRevision.current++;
   setState(current => current ? { ...current, mine: {} } : current);
   setIndex(0);
   setScreen('vote');
   setNotice('Your votes were reset. You can start again.');
   await refresh(token, true);
  } catch (e) {
   setError((e as Error).message);
  } finally {
   setBusy(false);
  }
 };
 const publish=async()=>{setBusy(true);setError('');try{const result=await api('/api/trail',token,{adminCode:admin});setNotice(result.generatedByAi?'AI trail published for the group.':'Vote-based trail published for the group.');await refresh(token);setScreen('trail')}catch(e){setError((e as Error).message)}finally{setBusy(false)}};
 const rows=useMemo(()=>[...VENUES].sort((a,b)=>(state?.summary[b.id]?.likes||0)-(state?.summary[a.id]?.likes||0)||a.name.localeCompare(b.name)),[state]);
 const voted=Object.entries(state?.mine||{}).length;const liked=Object.values(state?.mine||{}).filter(Boolean).length;
 const trail=(state?.trail?.venue_ids||[]).map(id=>VENUES.find(v=>v.id===id)).filter(Boolean) as Venue[];
 const share=async()=>{const link=typeof window!=='undefined'?window.location.origin+'/?invite='+encodeURIComponent(invite):'';try{if(navigator.share)await navigator.share({title:'Belfast Cocktail Club',text:'🍸 Vote for our Belfast Cocktail Week bars!',url:link});else{await navigator.clipboard.writeText(link);setNotice('Group invitation link copied')}}catch{setNotice('Sharing cancelled')}};
 const shareTrail=async()=>{const text='🍸 Belfast Cocktail Week — group trail\n'+trail.map((v,i)=>`${i+1}. ${v.name}`).join('\n')+'\nPlease confirm opening hours, offers and space for 14 before visiting.';try{if(navigator.share)await navigator.share({text});else{await navigator.clipboard.writeText(text);setNotice('Trail copied')}}catch{setNotice('Sharing cancelled')}};
 const maps=()=>{if(!trail.length)return;const q=(v:Venue)=>encodeURIComponent(v.address||`${v.name}, Belfast`);const first=trail[0],last=trail.at(-1)!;const path=`https://www.google.com/maps/dir/?api=1&origin=${q(first)}&destination=${q(last)}&travelmode=walking&waypoints=${trail.slice(1,-1).map(q).join('%7C')}`;window.open(path,'_blank','noopener,noreferrer')};
 return <main className="shell"><div className="phone">
 <header className="header"><div className="logo"><span className="logo-icon"><Martini size={22}/></span><span><small>BELFAST COCKTAIL WEEK</small><strong>Project Prime Edition</strong></span></div><div className="members"><Users size={13}/> {state?.joined??0}/14</div></header>
 {error&&<div className="error" role="alert">{error}<button onClick={()=>setError('')}>×</button></div>}
 {notice&&<div className="notice">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
 {!state?<section className="body"><div className="hero"><span className="eyebrow">NOVEMBER 6—15 · 2026</span><div className="hero-glass">🍸</div><h1>One city.<br/>14 friends.<br/><em>One great night.</em></h1><p>Pick your favourite participating bars. The group decides the rest.</p></div><div className="panel"><label>YOUR FIRST NAME<input maxLength={32} placeholder="e.g. Darren" value={name} onChange={e=>setName(e.target.value)}/></label><p className="label">YOUR KIND OF EVENING</p><div className="chips">{[['mixed','A bit of both'],['lively','Lively'],['relaxed','Relaxed']].map(([v,t])=><button className={style===v?'active':''} key={v} onClick={()=>setStyle(v)}>{t}</button>)}</div><label className="check"><input type="checkbox" checked={food} onChange={e=>setFood(e.target.checked)}/> Include a food stop</label><button className="primary" disabled={!name.trim()||!invite||busy} onClick={join}>{busy?'Joining…':'Join the cocktail trail'} <ArrowRight size={18}/></button>{!invite&&<p className="hint">Open the private link from your WhatsApp organiser to join.</p>}<p className="hint">No account or app download · Around 2 minutes</p></div></section>:
 <>
 {screen==='welcome'&&<section className="body"><div className="hero compact"><span className="eyebrow">YOUR GROUP IS READY</span><h1>Welcome back,<br/><em>{state.me.name}.</em></h1><p>{state.joined} of 14 joined · {voted} bars rated</p></div><div className="panel stack"><button className="primary" onClick={()=>setScreen('vote')}>Explore cocktail bars <ArrowRight size={18}/></button><button className="secondary" onClick={()=>setScreen('results')}>See group results <Trophy size={18}/></button><button className="secondary" onClick={()=>setScreen('trail')}>Our cocktail trail <MapPin size={18}/></button><button className="secondary" onClick={share}>Share invitation <Share2 size={18}/></button></div></section>}
 {screen==='vote'&&<section className="body"><div className="section-head"><div><span className="eyebrow">QUICK PICKS</span><h2>Would you go?</h2></div><span className="counter">{index+1} / {featured.length}</span></div><div className="progress">{featured.map((v,i)=><div key={v.id} className={i<=index?'on':''}/>)}</div><div className="venue-card"><div className="venue-art"><span className="art-glass">{['🍸','🍹','🥂','🍋','🍒','🍺','🍽️','🥃','🍔','✨'][index]}</span><span className="art-label">BELFAST COCKTAIL WEEK</span></div><div className="venue-content"><span className="eyebrow">{all(featured[index])}</span><h2>{featured[index].name}</h2><p>{featured[index].description||'Official participating venue'}</p><div className="offer"><span>COCKTAIL WEEK</span><strong>{cocktailLabel(featured[index])}</strong><small>Show your wristband to redeem the event offer.</small></div></div></div><div className="vote-actions"><button className="secondary" disabled={busy} onClick={()=>saveVote(featured[index].id,false)}><X size={18}/> Skip</button><button className="primary" disabled={busy} onClick={()=>saveVote(featured[index].id,true)}><Heart size={18}/> Interested</button></div><div className="footer-actions">{index>0&&<button onClick={()=>setIndex(i=>i-1)}><ArrowLeft size={14}/> Previous</button>}<button onClick={()=>setScreen('results')}>See leaderboard <ArrowRight size={14}/></button></div></section>}
 {screen==='results'&&<section className="body"><div className="section-head"><div><span className="eyebrow">THE GROUP DECIDES</span><h2>Top cocktail bars</h2></div><button className="refresh" onClick={()=>refresh(token)} aria-label="Refresh results"><RefreshCw size={19}/></button></div><div className="stats"><div><strong>{state.joined}<small> / 14</small></strong><span>Members joined</span></div><div><strong>{voted}</strong><span>Your ratings</span></div><div><strong>{liked}</strong><span>Your favourites</span></div></div><p className="hint">Real votes · Automatically refreshes every 8 seconds</p><button className="secondary" disabled={busy || voted === 0} onClick={resetVotes}>Reset my votes</button><div className="rankings">{rows.slice(0,showAll?36:10).map((v,i)=><div key={v.id} className="rank"><div className="rank-top"><span className="rank-num">{String(i+1).padStart(2,'0')}</span><span className="rank-name">{v.name}{state.mine[v.id]===true&&<Heart size={12} fill="currentColor"/>}</span><span className="rank-count">{state.summary[v.id]?.likes||0} <small>likes</small></span></div><small className="rank-cocktail">{cocktailLabel(v)}</small><div className="bar"><div style={{width:`${(state.summary[v.id]?.likes||0)/14*100}%`}}/></div></div>)}</div><button className="secondary" onClick={()=>setShowAll(!showAll)}>{showAll?'Show fewer':'See all 36 venues'} <ChevronDown size={17}/></button><button className="primary" onClick={()=>setScreen('trail')}><Sparkles size={18}/> View group trail</button></section>}
 {screen==='trail'&&<section className="body"><div className="section-head"><div><span className="eyebrow">GROUP ITINERARY</span><h2>The cocktail trail</h2></div><MapPin color="#f8afcd"/></div>{trail.length?<><div className="trail-intro"><span className="eyebrow">{state.trail?.generated_by_ai?'AI-RECOMMENDED':'VOTE-BASED'} · 5 STOPS</span><p>{state.trail?.explanation}</p></div><div className="stops">{trail.map((v,i)=><div className="stop" key={v.id}><div className="stop-number">{i+1}</div><div className="stop-body"><strong>{v.name}</strong><small>{all(v)}</small><span>{cocktailLabel(v)}</span></div><a target="_blank" rel="noopener noreferrer" href={mapSearch(v)} aria-label={`Map for ${v.name}`}><MapPin size={18}/></a></div>)}</div><button className="primary" onClick={maps}><MapPin size={18}/> Open walking directions</button><button className="secondary" onClick={shareTrail}><Share2 size={18}/> Share trail to WhatsApp</button></>:<div className="empty"><span>🗺️</span><h3>No trail published yet</h3><p>Your organiser can generate one using the group's real votes. You can still browse the leaderboard.</p><button className="secondary" onClick={()=>setScreen('results')}>View leaderboard</button></div>}<div className="organiser"><details><summary>Organiser controls</summary><p>Enter your private organiser code to publish a new five-stop shortlist. Members will see it automatically.</p><input type="password" placeholder="Organiser code" value={admin} onChange={e=>setAdmin(e.target.value)}/><button className="primary" disabled={!admin||busy} onClick={publish}>{busy?'Generating…':'Generate / republish trail'} <Sparkles size={17}/></button></details></div><p className="hint">Confirm opening times, wristband deals, table capacity for 14 and walking route before visiting. This app does not make reservations.</p></section>}
 <nav className="bottom-nav">{[{id:'welcome' as const,label:'Home',icon:<Martini size={19}/>},{id:'vote' as const,label:'Pick',icon:<Heart size={19}/>},{id:'results' as const,label:'Results',icon:<Trophy size={19}/>},{id:'trail' as const,label:'Trail',icon:<MapPin size={19}/>}].map(t=><button key={t.id} className={screen===t.id?'selected':''} onClick={()=>setScreen(t.id)}>{t.icon}<span>{t.label}</span></button>)}</nav>
 </>}
 <footer>Unofficial group planner · <a href={COCKTAIL_GUIDE_URL} target="_blank" rel="noopener noreferrer">Official event guide</a></footer>
 </div></main>
}
