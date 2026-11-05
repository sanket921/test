import type { Metadata } from 'next';
import BackgroundSound from '../components/BackgroundSound';
import './globals.css';
import './fonts.css';
import './cinematic.css';
import './refinements.css';
import './hero-editorial.css';
import './work-contact.css';
import './hero-particles.css';
import './v9.css';
import './v10.css';
import './v11.css';
export const metadata: Metadata = {title:'Craftech360 — Technology, made experiential.',description:'Creative thinking. Precise engineering. Extraordinary experiences. Explore the world of Craftech360.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><head><link rel="preload" href="/assets/fonts/polysans-trial-median.otf" as="font" type="font/otf" crossOrigin="anonymous"/></head><body>{children}<BackgroundSound/></body></html>}
