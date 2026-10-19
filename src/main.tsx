import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SiteMediaProvider } from './lib/siteMedia.tsx'

// روابط الكروت الرقمية القادمة من Supabase لها الشكل `#card/<card_id>`.
// نعرض CardView مباشرةً هنا (على مستوى الجذر) بدل الاستيراد داخل `App`، لأن أي
// `return` مبكر قبل تشغيل الـ Hooks في App يخالف قواعد React Hooks ويهدم الشجرة.
// CardView يُحمّل بشكل كسول (lazy) كي لا يتأثر حجم الحزمة الأولية للمتجر.
const isCardLink = window.location.hash.startsWith('#card/')

const Root = isCardLink
  ? (await import('./components/CardView.tsx')).default
  : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteMediaProvider>
      <Root />
    </SiteMediaProvider>
  </StrictMode>,
)
