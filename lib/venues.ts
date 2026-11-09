export type Venue = {id:string;name:string;area?:string;address?:string;lat?:number;lng?:number;food?:boolean;cocktail?:string;cocktailIngredients?:string[];cocktailPhoto?:string;description?:string};
const names = [
'39 Gordon Street','Crimson Cocktail Lounge','Common Market','Char + Mash','Three Sheets','Tipsy Bird',"Happy's",'The Chester','The Stock Exchange','The Lounge at Haymarket','Novelli','The Foundry','The Morning Star','The Watson','The Points',"The Deer's Head",'The Perch Rooftop Bar','The Fitzwilliam Hotel','Liquor XXX','No.4 Bar','HALT Weavers Cross','Malmaison','Revolución de Cuba',"Rita's",'Sweet Afton','The Courtyard at Haymarket','Moxy Belfast City','Granny Annies','Northern Lights',"Hickson's Point","Horatio Todd's",'The Maverick','The Northern Whig','The Phoenix','The Practitioner','The Rusty Saddle'] as const;

export const COCKTAIL_GUIDE_URL = 'https://tinyurl.com/BelfastCW2026NOV';

// Belfast Cocktail Week winter 2026 event guide, pages 10–18.
const cocktails: Record<(typeof names)[number], [name: string, ingredients: string, format?: 'png']> = {
  '39 Gordon Street': ['Lavender Haze', "Gordon’s Gin | Giffard crème de violette | Lavender syrup | Rhubarb syrup | Lemon juice | Lime juice | Fancy foamer"],
  'Char + Mash': ['Typical Belfast Weather', "Kraken | Lime | Fever-Tree ginger beer"],
  'Common Market': ['Cherry Cola', "Kadoo spiced rum | Falernum | Cherry liqueur | Cinnamon | Lime | Maine Raspberry Soda"],
  'Crimson Cocktail Lounge': ['Solero Cream', "Absolut Vanilla Vodka | Limoncello | Pineapple juice | Double cream | Passionfruit syrup | Mango syrup"],
  'The Chester': ['The Sloe Jam', "Boatyard Sloe Gin | Regal Rogue Bold Vermouth | Chambord | Strawberry jam | Egg white | Cherry bitters | Lime"],
  'The Courtyard at Haymarket': ['Berry Fizz', "Sloe boat gin | Blackberry | Orgeat syrup | Lemonade"],
  "The Deer's Head": ['The Joker', "Captain Morgan Spiced Rum | Vanilla syrup | Lime juice | Orange juice"],
  'The Fitzwilliam Hotel': ['Honey Paloma', "Cazcabel Honey Tequila | Lime juice | Agave syrup | Grapefruit soda | Fresh grapefruit"],
  'The Foundry': ['Coconut & Mango Margarita', "Cazcabel Coconut Tequila | Triple Sec | Lime juice | Mango purée | Coconut syrup"],
  'Granny Annies': ['Pornstar Martini', "Absolut Vanilla Vodka | Passoã | Pineapple juice | Passionfruit | Lime juice | Fresh passion fruit", 'png'],
  'HALT Weavers Cross': ['Off the Rails', "Gordon’s Gin | Lime | Coconut | Grapefruit soda"],
  "Happy's": ['Hubba Bubba Daiquiri', "Banana Kadoo Rum | Monin Bubblegum syrup | Lime | Strawberry foam"],
  "Hickson's Point": ['The Shipyard Fix', "McConnell’s whiskey | Muscovado sugar syrup | Lime juice | Brown lemonade | Orange"],
  "Horatio Todd's": ['Wee Autumn Number', "Absolut Vodka | Disaronno | Lemon juice | Caramel syrup | Magners | Apple juice | Dehydrated lemon wheel"],
  'Liquor XXX': ['Jammy Joey', "Bacardi Coconut | Chambord | Coconut syrup | Vanilla syrup | Lime juice | Raspberry syrup"],
  'The Lounge at Haymarket': ['Sarti Spritz', "Sarti | Mango syrup | Prosecco | Schweppes pink grapefruit soda"],
  'Malmaison': ['Cherry Bomb', "Tanqueray Gin | Heering Cherry Liqueur | Lemon juice | Sugar syrup", 'png'],
  'The Maverick': ['CandyLand', "Malibu | Disaronno | Lime juice | Apple juice | Cotton candy", 'png'],
  'Moxy Belfast City': ['Forecast: Boozy', "Captain Morgans | Bushmills | Cranberry juice | Fresh lime juice | Orange juice | Ginger syrup | Ginger beer | Dehydrated orange wheel"],
  'The Morning Star': ['Orchard Bloom', "Morning Star whiskey | Elderflower liqueur | Rhubarb purée | Apple juice | Crumlin honey", 'png'],
  'No.4 Bar': ['Monchito Colada', "Bacardi Carta Blanca | Malibu | Pineapple juice | Double cream | Coconut syrup | Coco Real | Pineapple wedge and leaf"],
  'Northern Lights': ['Galway Maid', "Bushmills Black Bush | Elderflower cordial | Lime juice | Sparkling apple | Cucumber twirl | Mint sprig"],
  'The Northern Whig': ['Raspberry Sling', "Absolut Vodka | Crème de cassis | Lemon juice | Teisseire cane syrup | Apple juice | Pineapple juice | Fresh raspberries"],
  'Novelli': ['Bradán Feasa', "Born Irish Whiskey | Irish Mist | Fever-Tree Ginger Ale | Lime juice | Guinness", 'png'],
  'The Perch Rooftop Bar': ['Very Demure', "Sloe gin | Crème de mûre | Fresh lime juice | Blackberry syrup | Ginger ale"],
  'The Phoenix': ['Phoenix Night', "Light rum | Dark rum | Crème de mûre | Cranberry | Pineapple | Lime | Sugar"],
  'The Points': ['Péitseog', "Bushmills | Peach liqueur | Lime juice | Ginger beer top"],
  'The Practitioner': ['Rhubarb Remedy', "Jawbox Small Batch Gin | Rhubarb syrup | Vanilla syrup | Fresh lemon juice | Clarified with Clandeboye Madagascan Vanilla Yoghurt | Cream soda", 'png'],
  "Rita's": ['Smoke Signal', "Mezcal | Fresh lime juice | Three Cents Mandarin & Bergamot Soda"],
  'Revolución de Cuba': ['Mojito Passion', "Havana Club 7 Year | Havana Club 3 Year | Bottega Millesimato Prosecco | Caster sugar | Lime wedges | Mint | Passionfruit juice", 'png'],
  'The Rusty Saddle': ['Bramble Spritz', "Jawbox Classic Dry | Crème de mûre | Cranberry juice | Lemon juice | Prosecco", 'png'],
  'Sweet Afton': ['Louisiana Sunset', "Disaronno | Southern Comfort | Orange juice | Pineapple juice | Grenadine"],
  'The Stock Exchange': ['Coco Breeze', "Malibu | Blue Curaçao | Fanta Lemon | Coconut syrup"],
  'Tipsy Bird': ['Blue Bird', "Absolut Vodka | Volare Blue Curacao | Monin Orgeat | Fresh lime juice | Fresh pineapple juice"],
  'The Watson': ['Temptation', "Havana 3 | Espresso | Demerara syrup | Chocolate powder"],
  'Three Sheets': ['Bring the Heat', "Jose Cuervo Silver Tequila | Triple Sec | Pineapple Verdita | Lime | Agave"],
};

const known:Record<string,Partial<Venue>> = {
  // Street addresses checked against the November 2026 Cocktail Week guide,
  // https://cocktailweek.com/belfast (and venue websites for Watson/Cuba).
  '39 Gordon Street':{address:'39 Gordon Street, Belfast BT1 2LG'},
  'Char + Mash':{address:'The O2, 2 Queens Quay, Belfast BT3 9QQ'},
  'Three Sheets':{address:'1 Bankmore Square, Belfast BT7 1DH'},
  'Tipsy Bird':{address:'96–100 Ann Street, Belfast BT1 3HH'},
  "Happy's":{address:'149 Lisburn Road, Belfast BT9 7AJ'},
  'The Chester':{address:'466 Antrim Road, Belfast BT15 5GE'},
  'The Stock Exchange':{address:'Haymarket, 84 Royal Avenue, Belfast BT1 1DJ'},
  'The Lounge at Haymarket':{address:'Haymarket, 84 Royal Avenue, Belfast BT1 1DJ'},
  'Novelli':{address:'AC Hotel, 90 Donegall Quay, Belfast BT1 3FE'},
  'The Foundry':{address:'10–16 Hill Street, Belfast BT1 2LA'},
  'The Watson':{address:'2–14 Little Donegall Street, Belfast BT1 2JD'},
  'The Points':{address:'44 Dublin Road, Belfast BT2 7HD'},
  'Liquor XXX':{address:'2A Ventry Street, Belfast BT2 7JP'},
  'No.4 Bar':{address:'Hilton Belfast, 4 Lanyon Place, Belfast BT1 3LP'},
  'Revolución de Cuba':{address:'25–39 Arthur Street, Belfast BT1 4GQ'},
  'The Courtyard at Haymarket':{address:'Haymarket, 84 Royal Avenue, Belfast BT1 1DJ'},
  'Moxy Belfast City':{address:'4 Clarence Street West, Belfast BT2 7GP'},
  'Northern Lights':{address:'451 Ormeau Road, Belfast BT7 3GQ'},
  "Hickson's Point":{address:"1 Olympic Way, Queen's Road, Belfast BT3 9EP"},
  "Horatio Todd's":{address:'406 Upper Newtownards Road, Belfast BT4 3EZ'},
  'The Maverick':{address:'1 Union Street, Belfast BT1 2JK'},
  'The Phoenix':{address:'179–181 Antrim Road, Belfast BT15 2GW'},
  'The Practitioner':{address:'65–67 University Street, Belfast BT7 1FY'},
  'The Rusty Saddle':{address:'21 Howard Street, Belfast BT1 6NB'},
  'The Perch Rooftop Bar':{area:'Linen Quarter',address:'42 Franklin Street, Belfast BT2 7GE',description:'Rooftop bar'},
  "Rita's":{area:'Linen Quarter',address:'44 Franklin Street, Belfast BT2 7GE',description:'Cocktail den'},
  'Sweet Afton':{area:'Linen Quarter',address:'12 Brunswick Street, Belfast BT2 7GE',food:true,description:'Bar and kitchen'},
  'The Fitzwilliam Hotel':{area:'Linen Quarter',address:'1–3 Great Victoria Street, Belfast BT2 7BQ',description:'Hotel bar'},
  'Malmaison':{area:'City centre',address:'34–38 Victoria Street, Belfast BT1 3GH',description:'Hotel bar'},
  'Crimson Cocktail Lounge':{area:'City centre',address:'Haymarket, 84 Royal Avenue, Belfast BT1 1DJ',description:'Cocktail lounge'},
  'The Northern Whig':{area:'Cathedral Quarter',address:'2–10 Bridge Street, Belfast BT1 1LU',description:'Grand bar'},
  "The Deer's Head":{area:'Cathedral Quarter',address:'1–3 Lower Garfield Street, Belfast BT1 1FP',description:'Historic bar'},
  'Common Market':{area:'Cathedral Quarter',address:'16–20 Dunbar Street, Belfast BT1 2LH',food:true,description:'Street food and bars'},
  'HALT Weavers Cross':{area:'Weavers Cross',address:'Glengall Street, Belfast BT12 5AB',food:true},
  'Granny Annies':{address:'81 Chichester Street, Belfast BT1 4JE',food:true},
  'The Morning Star':{address:'17–19 Pottinger’s Entry, Belfast BT1 4DT',food:true}
};
const slug=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const VENUES: Venue[] = names.map(name => {
  const id = slug(name);
  const [cocktail, ingredients, format = 'jpg'] = cocktails[name];
  return {
    id,
    name,
    ...known[name],
    cocktail,
    cocktailIngredients: ingredients.split(' | '),
    cocktailPhoto: `/cocktails/${id}.${format}`,
  };
});
export const QUICK_PICK_COUNT = 10;

export function drawQuickPicks() {
  const pool = [...VENUES];
  for (let i = 0; i < QUICK_PICK_COUNT; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, QUICK_PICK_COUNT);
}
export const mapSearch=(v:Venue)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address||`${v.name}, Belfast`)}`;
