'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowDown,ArrowUp,BarChart3,Check,ChevronRight,Heart,LockKeyhole,MapPin,Martini,MessageCircle,RefreshCcw,Route,Send,ShieldCheck,SlidersHorizontal,Sparkles,ThumbsDown,ThumbsUp,Users,Vote,X} from 'lucide-react';
import {COCKTAIL_GUIDE_URL,VENUES,mapSearch,Venue} from '../../lib/venues';
import './v2.css';

type VoteValue = boolean | undefined;
type Votes = Record<string, Record<string, VoteValue>>;
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
 const [votes,setVotes]=useState<Votes>(demoVotes);
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
 const [showMatrix,setShowMatrix]=useState(false);
 const [maxVenues,setMaxVenues]=useState(6);
 const voterNames=[...people,'You (demo)'];
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
 const setVote=(id:string,liked:boolean)=>setVotes(prev=>({...prev,'You (demo)':{...prev['You (demo)'],[id]:liked}}));
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
 const publish=()=>{
  if(!officialIds.length||invalidReasons)return;
  const snap:Publication={version:publications.length+1,date:new Date().toLocaleString('en-GB'),ids:[...officialIds],rules:{...rule},overrides:structuredClone(overrides),scores:structuredClone(scores)};
  setPublications(p=>[...p,snap]);setDraftNotice('Demo version '+snap.version+' published in this browser only. Supabase was not changed.');
 };
 const ask=(input:string)=>{
  const q=input.trim();if(!q)return;setQuestion(q);
  const lower=q.toLowerCase();
  let response='';
  if(/who|participant|voted|progress/.test(lower)){
   response=participation.map(p=>p.name+': '+p.cast+' ratings').join(' · ')+'. There are '+active+' active demo voters.';
  } else if(/dislike|object|zero|agree|consensus/.test(lower)){
   const zeros=counted.filter(v=>v.dislikes===0).sort((a,b)=>b.likes-a.likes);
   response=zeros.length+' venues have no recorded dislikes. Leading: '+zeros.slice(0,6).map(v=>v.name+' ('+v.likes+' likes)').join(', ')+'. Not rated is not the same as approved.';
  } else if(/trail|route|walk/.test(lower)){
   response='The proposed demo shortlist has '+officialIds.length+' stops. Open the Trail tab to build walking directions. Venue ordering is not automatically route-optimised.';
  } else if(/top|best|favourite|popular|like/.test(lower)){
   response=counted.sort((a,b)=>b.likes-a.likes).slice(0,5).map(v=>v.name+': '+v.likes+' likes, '+v.dislikes+' dislikes').join(' · ')+'.';
  } else {
   response='This preview supports questions about voting progress, zero-dislike venues, favourites and the trail. Full natural-language AI will require a server-side AI integration in a later release.';
  }
  setAnswer(response);
 };
 const top=counted.slice().sort((a,b)=>b.likes-a.likes).slice(0,5);
 const cocktailLink=(v:Venue)=> <button type="button" className="v2-cocktail-link" onClick={()=>setSelectedCocktail(v)} aria-label={'View photo and ingredients for '+v.cocktail+' at '+v.name}><Martini size={13}/>{v.cocktail||'See cocktail'}</button>;
 const showTab=(next:Tab)=>{setTab(next);window.scrollTo({top:0,behavior:'smooth'})};
 const nav:[Tab,string,typeof Heart][]=[['home','Home',Martini],['vote','Vote',Heart],['results','Results',BarChart3],['trail','Trail',Route],['ai','AI',Sparkles]];
 return <main className="v2-shell"><div className="v2-app">
  <header className="v2-header"><div className="v2-brand"><span className="v2-symbol"><Martini size={24}/></span><div><small>BELFAST COCKTAIL CLUB</small><strong>The social cocktail planner</strong></div></div><span className="v2-preview-pill">V2 TEST</span></header>
  <div className="v2-demo-banner"><LockKeyhole size={15}/> Isolated demonstration · Fake participant names · No live votes or database writes</div>
  {tab==='home'&&<section className="v2-content">
   <div className="v2-hero"><span className="v2-kicker">WELCOME TO VERSION 2.0</span><h1>Your people.<br/><em>Your picks.</em><br/>One great night.</h1><p>See the votes, find your favourites and shape the perfect Belfast cocktail trail.</p><button className="v2-main-button" onClick={()=>showTab('results')}>Explore the results <ChevronRight size={18}/></button></div>
   <div className="v2-grid3"><div className="v2-stat"><strong>{active}/7</strong><span>Active demo voters</span></div><div className="v2-stat"><strong>{totalVotes}</strong><span>Demo ratings</span></div><div className="v2-stat"><strong>{counted.filter(v=>v.dislikes===0).length}</strong><span>No dislikes</span></div></div>
   <div className="v2-heading"><h2>Group favourites</h2><button onClick={()=>showTab('results')}>View all <ChevronRight size={15}/></button></div>
   {top.map((v,i)=><div className="v2-line" key={v.id}><span className="v2-rank">{String(i+1).padStart(2,'0')}</span><div><strong>{v.name}</strong>{cocktailLink(v)}</div><span className="v2-positive"><Heart size={14}/> {v.likes}</span></div>)}
   <button className="v2-outline" onClick={()=>showTab('organiser')}><ShieldCheck size={17}/> Open organiser studio (demo)</button>
  </section>}
  {tab==='vote'&&<section className="v2-content">
   <span className="v2-kicker">TRY THE VOTING EXPERIENCE</span><h1 className="v2-page-title">Make your picks</h1>
   <p className="v2-muted">Votes below belong to the fictional “You (demo)” account. They change this preview only.</p>
   <input className="v2-input" placeholder="Search 36 venues..." value={filter} onChange={e=>setFilter(e.target.value)}/>
   {VENUES.filter(v=>v.name.toLowerCase().includes(filter.toLowerCase())).map(v=><div className="v2-venue" key={v.id}><div className="v2-venue-heading"><div><strong>{v.name}</strong>{cocktailLink(v)}</div><a href={mapSearch(v)} target="_blank" rel="noreferrer" aria-label={'Map for '+v.name}><MapPin size={16}/></a></div><div className="v2-vote-actions"><button className={votes['You (demo)']?.[v.id]===false?'v2-selected-down':''} onClick={()=>setVote(v.id,false)}><ThumbsDown size={16}/> Not interested</button><button className={votes['You (demo)']?.[v.id]===true?'v2-selected-up':''} onClick={()=>setVote(v.id,true)}><ThumbsUp size={16}/> Interested</button></div></div>)}
  </section>}
  {tab==='results'&&<section className="v2-content">
   <span className="v2-kicker">LIVE-STYLE ANALYTICS · DEMO SNAPSHOT</span><h1 className="v2-page-title">Explore results</h1>
   <div className="v2-grid3"><div className="v2-stat"><strong>{totalVotes}</strong><span>Votes</span></div><div className="v2-stat"><strong>{active}</strong><span>Active</span></div><div className="v2-stat"><strong>{eligible.length}</strong><span>Matches</span></div></div>
   <div className="v2-panel"><h3><SlidersHorizontal size={17}/> Your shortlist rules</h3><div className="v2-presets">{[['strict','Strict'],['balanced','Balanced'],['popular','Popular']].map(([key,label])=><button key={key} className={preset===key?'active':''} onClick={()=>setPresetRule(key)}>{label}</button>)}</div>
    <div className="v2-rule"><label>Maximum dislikes <strong>{rule.maxDislikes===6?'Any':rule.maxDislikes}</strong></label><input type="range" min="0" max="6" value={rule.maxDislikes} onChange={e=>changeRule({maxDislikes:Number(e.target.value)})}/></div>
    <div className="v2-rule"><label>Minimum likes <strong>{rule.minLikes}</strong></label><input type="range" min="0" max="6" value={rule.minLikes} onChange={e=>changeRule({minLikes:Number(e.target.value)})}/></div>
    <div className="v2-rule"><label>Minimum ratings <strong>{rule.minRatings}</strong></label><input type="range" min="0" max="7" value={rule.minRatings} onChange={e=>changeRule({minRatings:Number(e.target.value)})}/></div>
    <label className="v2-select-label">Rank by <select value={rule.sort} onChange={e=>changeRule({sort:e.target.value as Rule['sort']})}><option value="likes">Most likes</option><option value="net">Likes minus dislikes</option><option value="approval">Approval percentage</option></select></label>
   </div>
   <div className="v2-heading"><h2>{eligible.length} matching venues</h2><button onClick={()=>{setPresetRule('strict')}}><RefreshCcw size={14}/> Reset</button></div>
   {eligible.map((v,i)=><div key={v.id} className="v2-result"><span className="v2-rank">{i+1}</span><div className="v2-result-main"><strong>{v.name}</strong><small>{v.rated} of 7 demo participants rated</small>{cocktailLink(v)}<div className="v2-meter"><span style={{width:(v.likes/7*100)+'%'}}/></div></div><div className="v2-tallies"><span className="v2-positive"><ThumbsUp size={13}/> {v.likes}</span><span className="v2-negative"><ThumbsDown size={13}/> {v.dislikes}</span></div></div>)}
   {eligible.length===0&&<p className="v2-empty">Nothing matches these rules. Try reducing the minimum likes or ratings.</p>}
   <div className="v2-panel"><h3><Users size={18}/> Individual voting transparency</h3><label className="v2-select-label">Participant <select value={selectedPerson} onChange={e=>setSelectedPerson(e.target.value)}><option>All participants</option>{voterNames.map(p=><option key={p}>{p}</option>)}</select></label>
    {selectedPerson!=='All participants'?<div className="v2-person-summary"><strong>{selectedPerson}</strong><span>{Object.keys(votes[selectedPerson]||{}).length} venues rated</span>{VENUES.filter(v=>votes[selectedPerson]?.[v.id]!==undefined).map(v=><div key={v.id} className="v2-mini-vote"><span>{v.name}</span>{votes[selectedPerson]?.[v.id]?<ThumbsUp size={16} className="v2-positive"/>:<ThumbsDown size={16} className="v2-negative"/>}</div>)}</div>:<div className="v2-people">{participation.map(p=><button key={p.name} onClick={()=>setSelectedPerson(p.name)}><strong>{p.name}</strong><small>{p.cast} votes</small></button>)}</div>}
    <button className="v2-outline" onClick={()=>setShowMatrix(!showMatrix)}>{showMatrix?'Hide':'Show'} full voting matrix <ChevronRight size={16}/></button>
    {showMatrix&&<div className="v2-matrix-scroll"><table><thead><tr><th>Venue</th>{voterNames.map(p=><th key={p}>{p}</th>)}</tr></thead><tbody>{VENUES.map(v=><tr key={v.id}><th>{v.name}</th>{voterNames.map(p=><td key={p}>{votes[p]?.[v.id]===true?'✓':votes[p]?.[v.id]===false?'✕':'–'}</td>)}</tr>)}</tbody></table></div>}
   </div>
  </section>}
  {tab==='organiser'&&<section className="v2-content">
   <span className="v2-kicker">ORGANISER STUDIO · DEMONSTRATION</span><h1 className="v2-page-title">Official shortlist</h1><p className="v2-muted">Review the results, override individual venues and publish a versioned demo snapshot. No admin credentials or database access are used here.</p>
   <div className="v2-panel"><h3><SlidersHorizontal size={17}/> Selection rules</h3><p className="v2-muted">Same personal rules as the Results tab. You can change them there.</p><strong>{eligible.length} venues qualify automatically</strong><button className="v2-outline" onClick={()=>showTab('results')}>Change selection rules <ChevronRight size={16}/></button></div>
   <div className="v2-heading"><h2>Manual adjustments</h2><span>{officialIds.length} selected</span></div>
   {counted.slice().sort((a,b)=>rank(a,b,rule.sort)).map(v=>{
    const on=officialIds.includes(v.id),changed=!!overrides[v.id];
    return <div key={v.id} className="v2-adjust"><div className="v2-adjust-title"><label><input type="checkbox" checked={on} onChange={e=>adjust(v.id,e.target.checked)}/><span><strong>{v.name}</strong><small>{v.likes} likes · {v.dislikes} dislikes</small></span></label>{changed&&<span className="v2-override-pill">Override</span>}</div>
    {changed&&<input className="v2-input" placeholder="Required: why did you override this venue?" value={overrides[v.id].reason} onChange={e=>setOverrides(p=>({...p,[v.id]:{...p[v.id],reason:e.target.value}}))}/>}
    {on&&<div className="v2-reorder"><button disabled={officialIds[0]===v.id} onClick={()=>move(v.id,-1)} aria-label={'Move '+v.name+' up'}><ArrowUp size={15}/></button><button disabled={officialIds[officialIds.length-1]===v.id} onClick={()=>move(v.id,1)} aria-label={'Move '+v.name+' down'}><ArrowDown size={15}/></button></div>}
    </div>;
   })}
   <div className="v2-panel"><h3><ShieldCheck size={18}/> Publication preview</h3><p className="v2-muted">{officialIds.length} selected venues · {Object.keys(overrides).length} manual overrides</p><ol className="v2-preview-list">{officialIds.map(id=><li key={id}>{VENUES.find(v=>v.id===id)?.name}{overrides[id]&&<small> · Manually included</small>}</li>)}</ol>
    {invalidReasons&&<p className="v2-error">Please enter a reason for every manual adjustment.</p>}
    <button className="v2-main-button" disabled={invalidReasons||officialIds.length===0} onClick={publish}><Send size={17}/> Publish DEMO snapshot</button>
    {draftNotice&&<p role="status" className="v2-success">{draftNotice}</p>}
   </div>
   {latest&&<div className="v2-panel"><h3><Check size={18}/> Published in this preview · v{latest.version}</h3><p className="v2-muted">{latest.date} · {latest.ids.length} venues, frozen at publication</p><ol className="v2-preview-list">{latest.ids.map(id=><li key={id}>{VENUES.find(v=>v.id===id)?.name}</li>)}</ol><p className="v2-muted">New demo votes do not change this snapshot. Publish again to create a new version.</p></div>}
   {publications.length>1&&<p className="v2-muted">Demo publication history: {publications.map(p=>'v'+p.version).join(' → ')}</p>}
  </section>}
  {tab==='trail'&&<section className="v2-content"><span className="v2-kicker">GROUP ITINERARY</span><h1 className="v2-page-title">Our cocktail trail</h1>
   <p className="v2-muted">Preview walking directions using the {latest?'published demo shortlist':'current proposed shortlist'}. Stop order is editable in Organiser Studio and has not been optimised for walking distance.</p>
   {(latest?.ids||officialIds).slice(0,maxVenues).map((id,i)=>{const v=VENUES.find(x=>x.id===id);return v?<div className="v2-line" key={id}><span className="v2-rank">{i+1}</span><div><strong>{v.name}</strong><small>{v.address||v.area||'Belfast'}</small>{cocktailLink(v)}</div><a href={mapSearch(v)} target="_blank" rel="noreferrer"><MapPin size={17}/></a></div>:null})}
   <div className="v2-panel"><label className="v2-select-label">Stops to include <select value={maxVenues} onChange={e=>setMaxVenues(Number(e.target.value))}>{[3,4,5,6,8,12,36].map(x=><option key={x} value={x}>{x} stops maximum</option>)}</select></label>
    {(()=>{const ids=(latest?.ids||officialIds).slice(0,maxVenues);const stops=ids.map(id=>VENUES.find(v=>v.id===id)).filter((v):v is NonNullable<typeof v>=>!!v);if(stops.length<2)return <p className="v2-muted">Choose at least two venues to view directions.</p>;const places=stops.slice(0,5).map(v=>v.address||v.name+', Belfast');const params=new URLSearchParams({api:'1',origin:places[0],destination:places[places.length-1],travelmode:'walking'});if(places.length>2)params.set('waypoints',places.slice(1,-1).join('|'));return <><a className="v2-main-button" href={'https://www.google.com/maps/dir/?'+params.toString()} target="_blank" rel="noreferrer"><MapPin size={17}/> Open walking directions (first {places.length} stops)</a>{stops.length>5&&<p className="v2-muted">More than five stops selected. Open further route sections separately when implemented.</p>}</>;})()}
   </div>
  </section>}
  {tab==='ai'&&<section className="v2-content"><span className="v2-kicker">AI ASSISTANT · CONCEPT PREVIEW</span><h1 className="v2-page-title">Ask Cocktail Club</h1>
   <div className="v2-panel"><h3><Sparkles size={18}/> Ask about the group</h3><p className="v2-muted">This demo uses deterministic answers from the test votes. It is NOT a connected generative AI service, and makes no external AI requests.</p>
    {['Who has voted so far?','Which venues have zero dislikes?','What are our top five venues?','Plan a cocktail trail'].map(q=><button className="v2-ai-suggestion" key={q} onClick={()=>ask(q)}><MessageCircle size={16}/>{q}<ChevronRight size={15}/></button>)}
    <form onSubmit={e=>{e.preventDefault();ask(question)}} className="v2-ask-form"><input className="v2-input" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask about votes, favourites, trails..."/><button type="submit" className="v2-main-button">Ask <Sparkles size={16}/></button></form>
    {answer&&<div className="v2-answer"><strong>Voting insights</strong><p>{answer}</p></div>}
   </div>
   <p className="v2-muted">A real AI assistant in v2.2 will use a secured server-side model integration and the same rules engine as the dashboard.</p>
  </section>}
  <nav className="v2-nav" aria-label="Main navigation">{nav.map(([id,label,Icon])=><button type="button" key={id} className={tab===id?'active':''} onClick={()=>showTab(id)}><Icon size={20}/><span>{label}</span></button>)}</nav>
  {selectedCocktail&&<CocktailDetails venue={selectedCocktail} onClose={()=>setSelectedCocktail(null)}/>}
  <footer className="v2-footer">V2 preview · No production changes · <button onClick={()=>showTab('organiser')}>Organiser Studio</button></footer>
 </div></main>;
}
