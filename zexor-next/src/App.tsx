import { useState } from 'react'
import { ArrowDownLeft, ArrowLeft, ArrowUpLeft, Heart, Menu, Search, ShoppingBag, X, Globe2, Sparkles } from 'lucide-react'

type Lang = 'ar' | 'en'
const worlds = [
  { id:'01', key:'link', en:'ZEXOR LINK', ar:'الهوية الرقمية', subEn:'Make every connection count', subAr:'اترك انطباعًا يبدأ من لمسة', image:'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=85', tone:'dark' },
  { id:'02', key:'fashion', en:'ZEXOR FASHION', ar:'الأزياء', subEn:'A considered point of view', subAr:'تفاصيل تعبّر عنك', image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85', tone:'light' },
  { id:'03', key:'studio', en:'ZEXOR STUDIO', ar:'التصميم والبرمجة', subEn:'Ideas, thoughtfully built', subAr:'أفكار تتحول إلى تجارب رقمية', image:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=85', tone:'light' },
  { id:'04', key:'motors', en:'ZEXOR MOTORS', ar:'تأجير السيارات', subEn:'The road, on your terms', subAr:'رحلتك تبدأ باختيارك', image:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85', tone:'dark' },
  { id:'05', key:'estates', en:'ZEXOR ESTATES', ar:'العقارات', subEn:'Find your kind of place', subAr:'مساحات تشبه طموحك', image:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85', tone:'light' },
  { id:'06', key:'market', en:'ZEXOR MARKET', ar:'القطع المختارة', subEn:'Objects with a story', subAr:'قطع مختارة لها حكاية', image:'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=85', tone:'dark' },
]
const copy = {
  ar: { note:'عالم من الاختيارات المصممة بعناية', nav:'اكتشف العوالم', story:'حكاية ZEXOR', journal:'مختاراتنا', search:'ابحث عن شيء مميز', eyebrow:'أكثر من مجرد علامة تجارية', headline:'مساحة واحدة.\nعوالم بلا حدود.', intro:'من القطع التي تختارها، إلى التجارب التي تصنعها — اكتشف عوالم مختلفة يجمعها ذوق واحد.', explore:'اكتشف ZEXOR', scroll:'اكتشف العوالم', edit:'مختارات صُممت لتبقى', editText:'نؤمن أن التفاصيل الصغيرة تصنع فرقًا كبيرًا. كل عالم في ZEXOR له شخصيته، لكن يجمعهم الاهتمام بالجودة والتجربة.', footer:'اختيارات مدروسة. تجربة مختلفة.', language:'English' },
  en: { note:'A universe of considered choices', nav:'Explore worlds', story:'Our story', journal:'Curated for you', search:'Search for something special', eyebrow:'More than a brand', headline:'One space.\nInfinite worlds.', intro:'From the pieces you choose to the experiences you create — discover distinct worlds, connected by one point of view.', explore:'Discover ZEXOR', scroll:'Explore the worlds', edit:'Considered, never ordinary', editText:'We believe the smallest details make the biggest difference. Every ZEXOR world has its own character, connected by a shared care for quality and experience.', footer:'Thoughtful choices. A different experience.', language:'العربية' }
}
export default function App() {
  const [lang,setLang] = useState<Lang>('ar')
  const [menu,setMenu] = useState(false)
  const [search,setSearch] = useState(false)
  const [favorites,setFavorites] = useState<string[]>([])
  const t = copy[lang]
  const rtl = lang === 'ar'
  const toggleFavorite = (id:string) => setFavorites(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])
  return <main dir={rtl?'rtl':'ltr'} lang={lang}>
    <div className="announcement"><span className="announcement-dot" />{t.note}<span className="announcement-right">EST. 2026 · ZEXOR</span></div>
    <header className="header">
      <button className="icon-button mobile-menu" aria-label="Menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
      <a className="wordmark" href="#top" aria-label="ZEXOR home">ZEXOR<span className="wordmark-dot">.</span></a>
      <nav className="desktop-nav"><a href="#worlds">{t.nav}</a><a href="#story">{t.story}</a><a href="#journal">{t.journal}</a></nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search" onClick={()=>setSearch(!search)}><Search size={19}/></button>
        <button className="icon-button language" onClick={()=>setLang(rtl?'en':'ar')} aria-label="Change language"><Globe2 size={17}/><span>{t.language}</span></button>
        <button className="icon-button bag" aria-label="Shopping bag"><ShoppingBag size={19}/><span className="bag-count">0</span></button>
      </div>
    </header>
    {search&&<div className="search-panel"><Search size={18}/><input autoFocus placeholder={t.search}/><button onClick={()=>setSearch(false)} aria-label="Close search"><X size={18}/></button></div>}
    {menu&&<nav className="mobile-nav">{worlds.map(w=><a key={w.id} href={'#'+w.key} onClick={()=>setMenu(false)}>{rtl?w.ar:w.en}<ArrowLeft size={15}/></a>)}<a href="#story" onClick={()=>setMenu(false)}>{t.story}</a></nav>}
    <section className="hero" id="top">
      <div className="hero-copy"><p className="eyebrow"><span />{t.eyebrow}</p><h1>{t.headline.split('\n').map((line,i)=><span key={i}>{line}</span>)}</h1><p className="hero-intro">{t.intro}</p><a className="primary-link" href="#worlds">{t.explore}<span><ArrowUpLeft size={18}/></span></a><div className="hero-index"><span>01</span><i/><span>06</span><small>{t.scroll}</small></div></div>
      <div className="hero-art" aria-label="ZEXOR abstract emblem"><div className="art-grid"></div><div className="orb orb-one"/><div className="orb orb-two"/><div className="emblem"><span>Z</span><i/></div><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="art-label"><Sparkles size={14}/><span>DESIGNED TO BE DIFFERENT</span></div><span className="art-number">ZX—001</span></div>
      <div className="hero-bottom"><span>01 / 06</span><span>DESIGN · OBJECTS · EXPERIENCES</span><span>SCROLL TO DISCOVER ↓</span></div>
    </section>
    <section className="worlds-section" id="worlds">
      <div className="section-heading"><div><p className="eyebrow"><span/>THE ZEXOR UNIVERSE</p><h2>{rtl?'ستة عوالم، رؤية واحدة':'Six worlds, one vision'}</h2></div><p>{rtl?'كل عالم تجربة مستقلة، وكلها تحمل توقيع ZEXOR.':'Distinct experiences, each with its own character. All unmistakably ZEXOR.'}</p></div>
      <div className="world-grid">{worlds.map((w,i)=><a className={'world-card '+(i===0||i===3?'world-wide':'')} id={w.key} href="#journal" key={w.id}>
        <img src={w.image} alt={rtl?w.ar:w.en} loading={i<2?'eager':'lazy'}/><div className="image-shade"/><span className="world-number">{w.id} / 06</span><div className="world-info"><div><span className="world-kicker">{w.en}</span><h3>{rtl?w.ar:w.en}</h3><p>{rtl?w.subAr:w.subEn}</p></div><span className="round-arrow"><ArrowDownLeft size={20}/></span></div>
      </a>)}</div>
    </section>
    <section className="manifesto" id="story"><div className="manifesto-mark">Z<span>.</span></div><div className="manifesto-copy"><p className="eyebrow"><span/>{rtl?'فلسفتنا':'OUR PHILOSOPHY'}</p><h2>{t.edit}</h2><p>{t.editText}</p><a className="text-link" href="#journal">{rtl?'تعرف على رؤيتنا':'Discover our point of view'} <ArrowLeft size={17}/></a></div><div className="manifesto-side">ZEXOR / 2026</div></section>
    <section className="journal" id="journal"><div><p className="eyebrow"><span/>{rtl?'قريبًا':'COMING INTO FOCUS'}</p><h2>{rtl?'كل يوم، شيء يستحق الاكتشاف.':'Every day, something worth discovering.'}</h2><p>{rtl?'نعمل على إعداد مجموعة مختارة بعناية. كن أول من يعرف عند انطلاق التجربة.':'A considered collection is taking shape. Be the first to know when the next chapter begins.'}</p></div><form className="newsletter" onSubmit={e=>{e.preventDefault(); alert(rtl?'شكرًا لاهتمامك — سيتم تفعيل الاشتراك عند الإطلاق.':'Thank you — newsletter sign-up will be enabled at launch.')}}><label htmlFor="email">{rtl?'بريدك الإلكتروني':'YOUR EMAIL ADDRESS'}</label><div><input id="email" type="email" required placeholder={rtl?'name@example.com':'name@example.com'}/><button aria-label="Subscribe"><ArrowLeft size={20}/></button></div><small>{rtl?'بالاشتراك، أنت توافق على تلقي تحديثات ZEXOR.':'By subscribing, you agree to receive updates from ZEXOR.'}</small></form></section>
    <footer className="footer"><a className="wordmark" href="#top">ZEXOR<span className="wordmark-dot">.</span></a><span>{t.footer}</span><div><a href="#worlds">INSTAGRAM</a><a href="#worlds">CONTACT</a><span>© ZEXOR 2026</span></div></footer>
  </main>
}
