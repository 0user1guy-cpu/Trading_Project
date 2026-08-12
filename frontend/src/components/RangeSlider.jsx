import { useRef, useCallback } from 'react'
import './RangeSlider.css'

/**
 * Slider à double curseur (range) façon CSFloat.
 * - `variant="float"`  : dégradé officiel CS2 (bleu→rouge), pour le float.
 * - `variant="price"`  : barre sombre style CSFloat, pour le prix.
 * Curseurs = petites flèches triangulaires (SVG) pointant vers le bas,
 * posées sur la barre de graduation, glissables pour un tri précis.
 *
 * Props:
 *   min, max      : bornes absolues (0/1 pour float, 0/maxPrice pour prix)
 *   value         : [low, high]
 *   onChange      : ([low, high]) => void
 *   variant       : "float" | "price"
 *   formatValue   : (v) => string  (affichage sous la barre)
 */
const FLOAT_COLORS = [
  '#4b69ff', '#4b69ff', '#8847ff', '#8847ff', '#d32ce6', '#d32ce6',
  '#ffd700', '#ffd700', '#ff4500', '#ff4500', '#eb4b4b',
]

export default function RangeSlider({
  min = 0, max = 1, value = [0, 1], onChange,
  variant = 'float', formatValue,
}) {
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
      onChange([clamp(v, min, high - (max - min) * 0.001), high])
    } else {
      onChange([low, clamp(v, low + (max - min) * 0.001, max)])
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

  const fmt = formatValue || ((v) => v.toFixed(2))

  return (
    <div className="range-slider">
      <div
        className={`range-slider-track ${variant}`}
        ref={trackRef}
        onMouseDown={onTrackClick}
      >
        {variant === 'float' && FLOAT_COLORS.map((c, i) => (
          <div
            key={i}
            className="range-slider-segment"
            style={{
              background: c,
              left: `${(i / FLOAT_COLORS.length) * 100}%`,
              width: `${100 / FLOAT_COLORS.length}%`,
            }}
          />
        ))}
        {/* Voiles assombris hors sélection */}
        <div className="range-slider-dim left" style={{ width: pct(low) }} />
        <div className="range-slider-dim right" style={{ width: `${100 - parseFloat(pct(high))}%` }} />

        {/* Curseurs flèches */}
        <div className="range-slider-thumb" style={{ left: pct(low) }} onMouseDown={startDrag('low')}>
          <svg className="range-slider-arrow" width="14" height="14" viewBox="0 0 14 14">
            <path d="M7 2 L12 9 L2 9 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="range-slider-thumb" style={{ left: pct(high) }} onMouseDown={startDrag('high')}>
          <svg className="range-slider-arrow" width="14" height="14" viewBox="0 0 14 14">
            <path d="M7 2 L12 9 L2 9 Z" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div className="range-slider-labels">
        <span>{fmt(min)}</span>
        <span className="range-slider-value">{fmt(low)} – {fmt(high)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  )
}
