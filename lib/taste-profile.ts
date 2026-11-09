export const SPIRIT_OPTIONS = [
 'Gin','Rum','Vodka','Tequila','Whiskey','Mezcal','Brandy','Prosecco'
] as const;
export const FLAVOUR_OPTIONS = [
 'Sweet','Fruity','Citrus','Sour','Creamy','Refreshing','Herbal','Spicy','Bitter','Smoky'
] as const;
export type TasteProfile={
 likedSpirits:string[];
 avoidedSpirits:string[];
 likedFlavours:string[];
 avoidedIngredients:string[];
};
export const EMPTY_TASTE_PROFILE:TasteProfile={
 likedSpirits:[],avoidedSpirits:[],likedFlavours:[],avoidedIngredients:[]
};
function enumList(value:unknown,options:readonly string[],limit:number):string[]{
 if(!Array.isArray(value)||value.length>limit)throw new Error('Invalid taste selections');
 const values=[...new Set(value.map(x=>String(x)))];
 if(values.some(x=>!options.includes(x)))throw new Error('Choose from the available options');
 return values;
}
export function normaliseTasteProfile(input:unknown):TasteProfile{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Invalid preferences');
 const obj=input as Record<string,unknown>;
 const likedSpirits=enumList(obj.likedSpirits,SPIRIT_OPTIONS,8);
 const avoidedSpirits=enumList(obj.avoidedSpirits,SPIRIT_OPTIONS,8);
 const likedFlavours=enumList(obj.likedFlavours,FLAVOUR_OPTIONS,10);
 if(likedSpirits.some(x=>avoidedSpirits.includes(x)))throw new Error('A spirit cannot be both preferred and avoided');
 if(!Array.isArray(obj.avoidedIngredients)||obj.avoidedIngredients.length>12)throw new Error('Enter up to 12 ingredients to avoid');
 const avoidedIngredients=[...new Set(obj.avoidedIngredients.map(value=>{
  if(typeof value!=='string')throw new Error('Invalid ingredient');
  const item=value.trim().replace(/\s+/g,' ');
  if(item.length<1||item.length>48||/[<>\r\n]/.test(item))throw new Error('Ingredient names must be under 48 characters');
  return item;
 }))];
 return {likedSpirits,avoidedSpirits,likedFlavours,avoidedIngredients};
}
export function dbTasteProfile(row:Record<string,unknown>|null|undefined):TasteProfile{
 return {
  likedSpirits:Array.isArray(row?.liked_spirits)?row.liked_spirits.filter((x:unknown)=>typeof x==='string'):[],
  avoidedSpirits:Array.isArray(row?.avoided_spirits)?row.avoided_spirits.filter((x:unknown)=>typeof x==='string'):[],
  likedFlavours:Array.isArray(row?.liked_flavours)?row.liked_flavours.filter((x:unknown)=>typeof x==='string'):[],
  avoidedIngredients:Array.isArray(row?.avoided_ingredients)?row.avoided_ingredients.filter((x:unknown)=>typeof x==='string'):[]
 };
}
