import type {Metadata} from 'next';
import './style.css';
export const metadata:Metadata={title:'Belfast Cocktail Club',description:'14 friends. One cocktail trail. Group voting for Belfast Cocktail Week.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
