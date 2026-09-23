import { useState } from 'react';

const links = [['home', 'Home'], ['about', 'About Us'], ['whymashar', 'Why Mashar'], ['thobes', 'Our Thobes'], ['manufacturing', 'Manufacturing'], ['quality', 'Quality'], ['gallery', 'Gallery'], ['stores', 'Our Showrooms'], ['customers', 'Customers'], ['contact', 'Contact']];

export default function Header({ language, onLanguageChange }) {
  const [open, setOpen] = useState(false);
  return <header className={`site-header ${window.location.pathname.startsWith("/customers") ? "scrolled" : ""}`} id="siteHeader"><div className="container nav-wrap">
    <a href="/#home" className="brand" aria-label="Mashar Men's Factory"><img src="/images/Logo.png" alt="Mashar Men's Factory" className="brand-logo" /></a>
    <button className="menu-toggle" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /><span /></button>
    <nav className={`main-nav ${open ? 'open' : ''}`}>{links.map(([id, label]) => <a key={id} href={id === "customers" ? "/customers" : `/#${id}`} aria-current={id === "customers" && window.location.pathname.startsWith("/customers") ? "page" : undefined} onClick={() => setOpen(false)}>{language === 'ar' ? id === 'home' ? 'الرئيسية' : id === 'customers' ? 'العملاء' : label : label}</a>)}<button className="language-btn" type="button" onClick={onLanguageChange}>{language === 'en' ? 'العربية' : 'English'}</button></nav>
  </div></header>;
}