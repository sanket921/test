'use client';
import EngineeringJourney from './EngineeringJourney';
import styles from './ClientPrelude.module.css';
export default function ClientPrelude(){return <><section id="clients" className={styles.clients}><span className="section-label">CREATIVE TECHNOLOGY. SHARED AMBITION.</span><div className={styles.title}><h2>In good company.</h2><p>Selected names from our project briefs.<br/>Approved client logo artwork to follow.</p></div><div className={styles.names} aria-label="Client name placeholders">{['Mastercard','Dell','NPCI','Brigade'].map((name,i)=><div key={name}><span className="micro">0{i+1} / CLIENT</span><strong>{name}</strong><small>LOGO ARTWORK PENDING</small></div>)}</div></section><EngineeringJourney/></>}
