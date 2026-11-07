export type Venue = {id:string;name:string;area?:string;address?:string;lat?:number;lng?:number;food?:boolean;cocktail?:string;description?:string};
const names = [
'39 Gordon Street','Crimson Cocktail Lounge','Common Market','Char + Mash','Three Sheets','Tipsy Bird',"Happy's",'The Chester','The Stock Exchange','The Lounge at Haymarket','Novelli','The Foundry','The Morning Star','The Watson','The Points',"The Deer's Head",'The Perch Rooftop Bar','The Fitzwilliam Hotel','Liquor XXX','No.4 Bar','HALT Weavers Cross','Malmaison','Revolución de Cuba',"Rita's",'Sweet Afton','The Courtyard at Haymarket','Moxy Belfast City','Granny Annies','Northern Lights',"Hickson's Point","Horatio Todd's",'The Maverick','The Northern Whig','The Phoenix','The Practitioner','The Rusty Saddle'] as const;

export const COCKTAIL_GUIDE_URL = 'https://tinyurl.com/BelfastCW2026NOV';

// Belfast Cocktail Week winter 2026 event guide, pages 10–18.
const cocktails: Record<(typeof names)[number], string> = {
  '39 Gordon Street': 'Lavender Haze',
  'Char + Mash': 'Typical Belfast Weather',
  'Common Market': 'Cherry Cola',
  'Crimson Cocktail Lounge': 'Solero Cream',
  'The Chester': 'The Sloe Jam',
  'The Courtyard at Haymarket': 'Berry Fizz',
  "The Deer's Head": 'The Joker',
  'The Fitzwilliam Hotel': 'Honey Paloma',
  'The Foundry': 'Coconut & Mango Margarita',
  'Granny Annies': 'Pornstar Martini',
  'HALT Weavers Cross': 'Off the Rails',
  "Happy's": 'Hubba Bubba Daiquiri',
  "Hickson's Point": 'The Shipyard Fix',
  "Horatio Todd's": 'Wee Autumn Number',
  'Liquor XXX': 'Jammy Joey',
  'The Lounge at Haymarket': 'Sarti Spritz',
  'Malmaison': 'Cherry Bomb',
  'The Maverick': 'CandyLand',
  'Moxy Belfast City': 'Forecast: Boozy',
  'The Morning Star': 'Orchard Bloom',
  'No.4 Bar': 'Monchito Colada',
  'Northern Lights': 'Galway Maid',
  'The Northern Whig': 'Raspberry Sling',
  'Novelli': 'Bradán Feasa',
  'The Perch Rooftop Bar': 'Very Demure',
  'The Phoenix': 'Phoenix Night',
  'The Points': 'Péitseog',
  'The Practitioner': 'Rhubarb Remedy',
  "Rita's": 'Smoke Signal',
  'Revolución de Cuba': 'Mojito Passion',
  'The Rusty Saddle': 'Bramble Spritz',
  'Sweet Afton': 'Louisiana Sunset',
  'The Stock Exchange': 'Coco Breeze',
  'Tipsy Bird': 'Blue Bird',
  'The Watson': 'Temptation',
  'Three Sheets': 'Bring the Heat',
};

const known:Record<string,Partial<Venue>> = {
  'The Perch Rooftop Bar':{area:'Linen Quarter',address:'42 Franklin Street, Belfast',description:'Rooftop bar'},
  "Rita's":{area:'Linen Quarter',address:'44 Franklin Street, Belfast',description:'Cocktail den'},
  'Sweet Afton':{area:'Linen Quarter',address:'12 Brunswick Street, Belfast',food:true,description:'Bar and kitchen'},
  'The Fitzwilliam Hotel':{area:'Linen Quarter',address:'Great Victoria Street, Belfast',description:'Hotel bar'},
  'Malmaison':{area:'City centre',address:'34–38 Victoria Street, Belfast',description:'Hotel bar'},
  'Crimson Cocktail Lounge':{area:'City centre',address:'Haymarket, 84 Royal Avenue, Belfast',description:'Cocktail lounge'},
  'The Northern Whig':{area:'Cathedral Quarter',address:'2–10 Bridge Street, Belfast',description:'Grand bar'},
  "The Deer's Head":{area:'Cathedral Quarter',address:'1–3 Lower Garfield Street, Belfast',description:'Historic bar'},
  'Common Market':{area:'Cathedral Quarter',address:'16–20 Dunbar Street, Belfast',food:true,description:'Street food and bars'},
  'HALT Weavers Cross':{area:'Weavers Cross',address:'Glengall Street, Belfast',food:true},
  'Granny Annies':{food:true},
  'The Morning Star':{food:true}
};
const slug=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const VENUES:Venue[]=names.map(name=>({id:slug(name),name,...known[name],cocktail:cocktails[name]}));
export const FEATURED=['the-perch-rooftop-bar','rita-s','crimson-cocktail-lounge','the-foundry','malmaison','the-deer-s-head','sweet-afton','the-northern-whig','common-market','the-fitzwilliam-hotel'];
export const mapSearch=(v:Venue)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address||`${v.name}, Belfast`)}`;
