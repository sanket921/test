import type { Metadata } from 'next';
import BackgroundSound from '../components/BackgroundSound';
import './globals.css';
import './fonts.css';
import './cinematic.css';
import './refinements.css';
import './hero-editorial.css';
import './work-contact.css';
import './hero-particles.css';
export const metadata: Metadata = {title:'Craftech360 — Technology, made experiential.',description:'Creative thinking. Precise engineering. Extraordinary experiences. Explore the world of Craftech360.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}<BackgroundSound/></body></html>}
