export type Venue = {id:string;name:string;area?:string;address?:string;lat?:number;lng?:number;food?:boolean;cocktail?:string;description?:string};
const names = [
'39 Gordon Street','Crimson Cocktail Lounge','Common Market','Char + Mash','Three Sheets','Tipsy Bird',"Happy's",'The Chester','The Stock Exchange','The Lounge at Haymarket','Novelli','The Foundry','The Morning Star','The Watson','The Points',"The Deer's Head",'The Perch Rooftop Bar','The Fitzwilliam Hotel','Liquor XXX','No.4 Bar','HALT Weavers Cross','Malmaison','Revolución de Cuba',"Rita's",'Sweet Afton','The Courtyard at Haymarket','Moxy Belfast City','Granny Annies','Northern Lights',"Hickson's Point","Horatio Todd's",'The Maverick','The Northern Whig','The Phoenix','The Practitioner','The Rusty Saddle'];
const known:Record<string,Partial<Venue>> = {
  'The Perch Rooftop Bar':{area:'Linen Quarter',address:'42 Franklin Street, Belfast',description:'Rooftop bar'},
  "Rita's":{area:'Linen Quarter',address:'44 Franklin Street, Belfast',description:'Cocktail den'},
  'Sweet Afton':{area:'Linen Quarter',address:'12 Brunswick Street, Belfast',food:true,description:'Bar and kitchen'},
  'The Fitzwilliam Hotel':{area:'Linen Quarter',address:'Great Victoria Street, Belfast',description:'Hotel bar'},
  'Malmaison':{area:'City centre',address:'34–38 Victoria Street, Belfast',cocktail:'Cherry Bomb',description:'Hotel bar'},
  'Crimson Cocktail Lounge':{area:'City centre',address:'Haymarket, 84 Royal Avenue, Belfast',description:'Cocktail lounge'},
  'The Northern Whig':{area:'Cathedral Quarter',address:'2–10 Bridge Street, Belfast',description:'Grand bar'},
  "The Deer's Head":{area:'Cathedral Quarter',address:'1–3 Lower Garfield Street, Belfast',description:'Historic bar'},
  'Common Market':{area:'Cathedral Quarter',address:'16–20 Dunbar Street, Belfast',food:true,description:'Street food and bars'},
  'HALT Weavers Cross':{area:'Weavers Cross',address:'Glengall Street, Belfast',food:true},
  'The Foundry':{cocktail:'Coconut & Mango Margarita'},
  'Liquor XXX':{cocktail:'Jammy Joey'},
  'The Chester':{cocktail:'The Sloe Jam'},
  'Moxy Belfast City':{cocktail:'Forecast: Boozy'},
  'Granny Annies':{food:true},
  'The Morning Star':{food:true}
};
const slug=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const VENUES:Venue[]=names.map(name=>({id:slug(name),name,...(known[name]||{})}));
export const FEATURED=['the-perch-rooftop-bar','rita-s','crimson-cocktail-lounge','the-foundry','malmaison','the-deer-s-head','sweet-afton','the-northern-whig','common-market','the-fitzwilliam-hotel'];
export const mapSearch=(v:Venue)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address||`${v.name}, Belfast`)}`;
