import type {Venue} from './venues';

/**
 * Curated coordinates for Belfast venues we could substantiate from published
 * place or street-location references. All are APPROXIMATE geographic points,
 * not surveyed entrance positions or route-network walking distances.
 * Other venues remain available in votes and manual route planning, but are
 * deliberately omitted from distance ranking until their coordinates are verified.
 */
export type VenuePoint={lat:number;lng:number;source:string;precision:'venue'|'nearby'};
export const VENUE_POINTS:Record<string,VenuePoint>={
 '39-gordon-street':{lat:54.60225,lng:-5.92623,precision:'venue',source:'https://mapcarta.com/W422423675'},
 'common-market':{lat:54.60243,lng:-5.92618,precision:'venue',source:'https://mapcarta.com/W267256602'},
 'the-perch-rooftop-bar':{lat:54.595,lng:-5.93247,precision:'venue',source:'https://mapcarta.com/N4385115358'},
 'the-fitzwilliam-hotel':{lat:54.595715,lng:-5.935105,precision:'venue',source:'https://www.ospreyholidays.com/northern-ireland-belfast-city-breaks/map'},
 'the-northern-whig':{lat:54.6005211,lng:-5.9277506,precision:'venue',source:'https://www.fun.ie/the-northern-whig-restaurant'},
 'the-morning-star':{lat:54.59942,lng:-5.92628,precision:'venue',source:'https://www.thewrennreport.co.uk/building/N13000004-2b8639a0-8649-4eb2-8836-f8cf52533647/the-morning-star-17-19-pottinger-s-entry-belfast-co-antrim-bt1-4dt'},
 'granny-annies':{lat:54.59738,lng:-5.92417,precision:'venue',source:'https://mapcarta.com/N3932720468'},
 // Nearby street/building points; explicitly identified as less precise in UI.
 'rita-s':{lat:54.5950957,lng:-5.9325163,precision:'nearby',source:'https://linenquarter.org/places/tutti-frutti/'},
 'sweet-afton':{lat:54.5952,lng:-5.9328,precision:'nearby',source:'https://gb.checkmypostcode.uk/bt27gg'},
};

export function straightLineMetres(lat1:number,lon1:number,lat2:number,lon2:number):number{
 const radians=(v:number)=>v*Math.PI/180;
 const a=radians(lat2-lat1);
 const b=radians(lon2-lon1);
 const h=Math.sin(a/2)**2+Math.cos(radians(lat1))*Math.cos(radians(lat2))*Math.sin(b/2)**2;
 return 12742000*Math.asin(Math.min(1,Math.sqrt(h)));
}

const SPIRIT_MATCHES:Record<string,RegExp>={
 Gin:/\b(?:gin|gordon.s|tanqueray|jawbox|boatyard|sloe gin)\b/i,
 Rum:/\b(?:rum|kraken|bacardi|malibu|captain morgan|havana|kadoo)\b/i,
 Vodka:/\b(?:vodka|absolut)\b/i,
 Tequila:/\b(?:tequila|cazcabel|jose cuervo)\b/i,
 Whiskey:/\b(?:whiskey|whisky|bushmills|mcconnell.s|southern comfort)\b/i,
 Mezcal:/\bmezcal\b/i,
 Brandy:/\bbrandy\b/i,
 Prosecco:/\bprosecco\b/i
};
const FLAVOUR_MATCHES:Record<string,RegExp>={
 Sweet:/\b(?:syrup|honey|sugar|grenadine|liqueur|jam|caramel)\b/i,
 Fruity:/\b(?:pineapple|apple|passionfruit|passion fruit|mango|peach|berry|raspberry|blackberry|cherry|orange|grapefruit|cranberry|strawberry|rhubarb)\b/i,
 Citrus:/\b(?:lemon|lime|grapefruit|orange|mandarin)\b/i,
 Sour:/\b(?:lime|lemon|grapefruit)\b/i,
 Creamy:/\b(?:cream|yoghurt|coconut|colada)\b/i,
 Refreshing:/\b(?:soda|ginger beer|ginger ale|tonic|lemonade|lime|mint)\b/i,
 Herbal:/\b(?:mint|lavender|elderflower|rhubarb|herbal)\b/i,
 Spicy:/\b(?:ginger|cinnamon|spiced|chilli|verdita)\b/i,
 Bitter:/\b(?:bitters|vermouth|grapefruit|aperitif)\b/i,
 Smoky:/\b(?:mezcal|smoke)\b/i
};
export function cocktailTaste(v:Venue,profile:{
 likedSpirits:string[];avoidedSpirits:string[];
 likedFlavours:string[];avoidedIngredients:string[]
}):{matches:string[];avoidHits:string[];score:number}{
 const ingredients=(v.cocktailIngredients||[]).join(' | ');
 const matches=[
 ...profile.likedSpirits.filter(s=>SPIRIT_MATCHES[s]?.test(ingredients)),
 ...profile.likedFlavours.filter(s=>FLAVOUR_MATCHES[s]?.test(ingredients))
 ];
 const avoidHits=[
 ...profile.avoidedSpirits.filter(s=>SPIRIT_MATCHES[s]?.test(ingredients)),
 ...profile.avoidedIngredients.filter(i=>ingredients.toLowerCase().includes(i.toLowerCase()))
 ];
 return {matches,avoidHits,score:matches.length*1.5-avoidHits.length*9};
}
