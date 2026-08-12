import { useRef, useCallback, useEffect } from 'react'
import './FloatSlider.css'

/**
 * Slider à double curseur pour filtrer le float (wear), style CSFloat.
 * Barre avec dégradé rouge (Bas float = neuf) -> vert... non : en CS2 le
 * dégradé officiel va de bleu (FN) à rouge (BS). On reproduit ce dégradé.
 * Deux curseurs (min/max) qu'on peut glisser pour un tri précis.
 *
 * Props :
 *   min, max    : valeur absolues (0 et 1)
 *   value       : [low, high] plage sélectionnée
 *   onChange     : ([low, high]) => void
 */
const COLORS = [
  '#4b69ff', // 0.00 (FN, bleu)
  '#4b69ff',
  '#8847ff', // 0.10-0.20 (violet)
  '#8847ff',
  '#d32ce6', // 0.20-0.30 (magenta)
  '#d32ce6',
  '#ffd700', // 0.30-0.40 (jaune)
  '#ffd700',
  '#ff4500', // 0.40-0.50 (orange)
  '#ff4500',
  '#eb4b4b', // 0.50-1.00 (rouge, BS)
]

export default function FloatSlider({ min = 0, max = 1, value = [0, 1], onChange }) {
  const trackRef = useRef(null)
  const [low, high] = value

  const pct = (v) => `${((v - min) / (max - min)) * 100}%`

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

  const setFromClientX = useCallback((clientX, which) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    const v = min + ratio * (max - min)
    if (which === 'low') {
      onChange([clamp(v, min, high - 0.01), high])
    } else {
      onChange([low, clamp(v, low + 0.01, max)])
    }
  }, [min, max, low, high, onChange])

  const startDrag = useCallback((which) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    const move = (ev) => setFromClientX(ev.touches ? ev.touches[0].clientX : ev.clientX, which)
    const up = () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
      document.removeEventListener('touchmove', move)
      document.removeEventListener('touchend', up)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
    document.addEventListener('touchmove', move, { passive: false })
    document.addEventListener('touchend', up)
  }, [setFromClientX])

  // clic sur la piste → déplace le curseur le plus proche
  const onTrackClick = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    const v = min + ratio * (max - min)
    const dLow = Math.abs(v - low)
    const dHigh = Math.abs(v - high)
    setFromClientX(clientX, dLow <= dHigh ? 'low' : 'high')
  }

  return (
    <div className="float-slider">
      <div className="float-slider-bar" ref={trackRef} onMouseDown={onTrackClick}>
        {/* Segments colorés (dégradé officiel CS2) */}
        {COLORS.map((c, i) => (
          <div
            key={i}
            className="float-slider-segment"
            style={{ background: c, left: `${(i / COLORS.length) * 100}%`, width: `${100 / COLORS.length}%` }}
          />
        ))}
        {/* Plage sélectionnée (assombrie hors sélection) */}
        <div className="float-slider-dim left" style={{ width: pct(low) }} />
        <div className="float-slider-dim right" style={{ width: `${100 - parseFloat(pct(high))}%` }} />

        {/* Curseurs */}
        <div className="float-slider-thumb" style={{ left: pct(low) }} onMouseDown={startDrag('low')}>
          <div className="float-slider-thumb-handle" />
        </div>
        <div className="float-slider-thumb" style={{ left: pct(high) }} onMouseDown={startDrag('high')}>
          <div className="float-slider-thumb-handle" />
        </div>
      </div>
      <div className="float-slider-labels">
        <span>0.00</span>
        <span className="float-slider-value">{low.toFixed(2)} – {high.toFixed(2)}</span>
        <span>1.00</span>
      </div>
    </div>
  )
}
