export type Venue = {id:string;name:string;area?:string;address?:string;lat?:number;lng?:number;food?:boolean;cocktail?:string;cocktailGuidePage?:number;description?:string};
const names = [
'39 Gordon Street','Crimson Cocktail Lounge','Common Market','Char + Mash','Three Sheets','Tipsy Bird',"Happy's",'The Chester','The Stock Exchange','The Lounge at Haymarket','Novelli','The Foundry','The Morning Star','The Watson','The Points',"The Deer's Head",'The Perch Rooftop Bar','The Fitzwilliam Hotel','Liquor XXX','No.4 Bar','HALT Weavers Cross','Malmaison','Revolución de Cuba',"Rita's",'Sweet Afton','The Courtyard at Haymarket','Moxy Belfast City','Granny Annies','Northern Lights',"Hickson's Point","Horatio Todd's",'The Maverick','The Northern Whig','The Phoenix','The Practitioner','The Rusty Saddle'] as const;

export const COCKTAIL_GUIDE_URL = 'https://tinyurl.com/BelfastCW2026NOV';

// Belfast Cocktail Week winter 2026 event guide, pages 10–18.
const cocktails: Record<(typeof names)[number], [name: string, guidePage: number]> = {
  '39 Gordon Street': ['Lavender Haze', 10],
  'Char + Mash': ['Typical Belfast Weather', 10],
  'Common Market': ['Cherry Cola', 10],
  'Crimson Cocktail Lounge': ['Solero Cream', 10],
  'The Chester': ['The Sloe Jam', 11],
  'The Courtyard at Haymarket': ['Berry Fizz', 11],
  "The Deer's Head": ['The Joker', 11],
  'The Fitzwilliam Hotel': ['Honey Paloma', 11],
  'The Foundry': ['Coconut & Mango Margarita', 12],
  'Granny Annies': ['Pornstar Martini', 12],
  'HALT Weavers Cross': ['Off the Rails', 12],
  "Happy's": ['Hubba Bubba Daiquiri', 12],
  "Hickson's Point": ['The Shipyard Fix', 13],
  "Horatio Todd's": ['Wee Autumn Number', 13],
  'Liquor XXX': ['Jammy Joey', 13],
  'The Lounge at Haymarket': ['Sarti Spritz', 13],
  'Malmaison': ['Cherry Bomb', 14],
  'The Maverick': ['CandyLand', 14],
  'Moxy Belfast City': ['Forecast: Boozy', 14],
  'The Morning Star': ['Orchard Bloom', 14],
  'No.4 Bar': ['Monchito Colada', 15],
  'Northern Lights': ['Galway Maid', 15],
  'The Northern Whig': ['Raspberry Sling', 15],
  'Novelli': ['Bradán Feasa', 15],
  'The Perch Rooftop Bar': ['Very Demure', 16],
  'The Phoenix': ['Phoenix Night', 16],
  'The Points': ['Péitseog', 16],
  'The Practitioner': ['Rhubarb Remedy', 16],
  "Rita's": ['Smoke Signal', 17],
  'Revolución de Cuba': ['Mojito Passion', 17],
  'The Rusty Saddle': ['Bramble Spritz', 17],
  'Sweet Afton': ['Louisiana Sunset', 17],
  'The Stock Exchange': ['Coco Breeze', 18],
  'Tipsy Bird': ['Blue Bird', 18],
  'The Watson': ['Temptation', 18],
  'Three Sheets': ['Bring the Heat', 18],
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
export const VENUES:Venue[]=names.map(name=>({id:slug(name),name,...known[name],cocktail:cocktails[name][0],cocktailGuidePage:cocktails[name][1]}));
export const FEATURED=['the-perch-rooftop-bar','rita-s','crimson-cocktail-lounge','the-foundry','malmaison','the-deer-s-head','sweet-afton','the-northern-whig','common-market','the-fitzwilliam-hotel'];
export const mapSearch=(v:Venue)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address||`${v.name}, Belfast`)}`;
