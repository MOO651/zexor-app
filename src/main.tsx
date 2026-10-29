import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SiteMediaProvider } from './lib/siteMedia.tsx'

type GuardState = { error: string | null }

// Prevent a startup/render exception from leaving the entire page blank.
// The error is also logged to the browser console so it can be diagnosed.
class StartupGuard extends Component<{ children: ReactNode }, GuardState> {
  state: GuardState = { error: null }

  private onWindowError = (event: ErrorEvent) => {
    const message = event.error instanceof Error
      ? event.error.message
      : event.message
    if (message) this.setState({ error: message })
  }

  private onUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason
    const message = reason instanceof Error ? reason.message : String(reason ?? 'Unknown promise rejection')
    this.setState({ error: message })
  }

  componentDidMount() {
    window.addEventListener('error', this.onWindowError)
    window.addEventListener('unhandledrejection', this.onUnhandledRejection)
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.onWindowError)
    window.removeEventListener('unhandledrejection', this.onUnhandledRejection)
  }

  static getDerivedStateFromError(error: Error): GuardState {
    return { error: error?.message || 'Unknown React startup error' }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ZEXOR startup failure]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <main dir="rtl" lang="ar" style={{
          minHeight: '100vh', display: 'grid', placeItems: 'center',
          padding: '24px', background: '#fbf9f5', color: '#29251f',
          fontFamily: 'Arial, sans-serif',
        }}>
          <section style={{
            width: '100%', maxWidth: '560px', padding: '28px',
            border: '1px solid #e2d8c8', borderRadius: '20px',
            background: '#fffefa', boxShadow: '0 18px 60px -40px #29251f',
          }}>
            <p style={{ margin: '0 0 8px', color: '#806747', fontSize: '12px', letterSpacing: '2px' }}>ZEXOR · STARTUP CHECK</p>
            <h1 style={{ margin: '0 0 12px', fontSize: '24px' }}>حصل خطأ أثناء تشغيل الموقع</h1>
            <p style={{ margin: '0 0 16px', lineHeight: 1.8, color: '#62594e' }}>
              بدل الشاشة البيضاء، ظهر سبب الخطأ. أعد تحميل الصفحة مرة واحدة؛ إذا تكرر، أرسل صورة هذه الرسالة للدعم.
            </p>
            <pre dir="ltr" style={{
              whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: '14px',
              borderRadius: '10px', background: '#f2ede4', color: '#29251f',
              fontSize: '12px', lineHeight: 1.6,
            }}>{this.state.error}</pre>
            <button onClick={() => window.location.reload()} type="button" style={{
              marginTop: '16px', minHeight: '44px', padding: '0 20px',
              border: 0, borderRadius: '10px', background: '#806747',
              color: '#fffefa', fontWeight: 700, cursor: 'pointer',
            }}>إعادة تحميل الموقع</button>
          </section>
        </main>
      )
    }
    return this.props.children
  }
}

// Links to digital cards have the form #card/<card_id>. Keep CardView at the
// root so App's Hooks are always called in the same order.
const isCardLink = window.location.hash.startsWith('#card/')
const Root = isCardLink
  ? (await import('./components/CardView.tsx')).default
  : App

const mount = document.getElementById('root')
if (!mount) {
  document.body.innerHTML = '<main style="padding:24px;font-family:Arial,sans-serif">ZEXOR startup error: root element not found.</main>'
} else {
  createRoot(mount).render(
    <StrictMode>
      <StartupGuard>
        <SiteMediaProvider>
          <Root />
        </SiteMediaProvider>
      </StartupGuard>
    </StrictMode>,
  )
}
