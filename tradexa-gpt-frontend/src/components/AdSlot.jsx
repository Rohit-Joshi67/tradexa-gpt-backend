import { useEffect, useRef } from 'react'
import { usePlan } from '../context/PlanContext'

// AdSense is env-gated: set VITE_ADSENSE_CLIENT_ID (ca-pub-...) on Vercel to
// enable. When unset, no script is injected and no slots render — zero errors.
const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID

let scriptInjected = false

export function useAdSenseScript() {
  useEffect(() => {
    if (!CLIENT_ID || scriptInjected) return
    if (document.querySelector('script[data-adsense]')) {
      scriptInjected = true
      return
    }
    const script = document.createElement('script')
    script.async = true
    script.dataset.adsense = 'true'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
    scriptInjected = true
  }, [])
}

function useAdSlot() {
  const { plan, adsEnabled } = usePlan()
  // Pro users are ad-free. Logged-out users fall back to FREE (ads on).
  return Boolean(CLIENT_ID) && plan !== 'PRO' && adsEnabled !== false
}

/**
 * A single AdSense display slot. Renders nothing for Pro users or when
 * AdSense is unconfigured.
 */
export default function AdSlot({ slot, className = '' }) {
  const showAds = useAdSlot()
  const ref = useRef(null)

  useEffect(() => {
    if (!showAds || !slot || !ref.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not ready yet — the slot stays blank rather than crashing.
    }
  }, [showAds, slot])

  if (!showAds || !slot) return null
  return (
    <div className={`ad-slot ${className}`}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
