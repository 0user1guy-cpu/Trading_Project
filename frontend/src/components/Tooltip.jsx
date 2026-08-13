import { useState, useRef, useId } from 'react'
import './Tooltip.css'

/**
 * Tooltip réutilisable — petit popup centré sous l'élément déclencheur.
 * Remplace les tooltips natifs (title) par une bulle flottante positionnée
 * en bas, centrée horizontalement sur l'élément. À réutiliser pour toute
 * fonctionnalité dont le rôle n'est pas explicite (icônes d'outils, etc.).
 *
 * Ne PAS l'utiliser pour la navigation entre pages (le nom des pages suffit).
 */
export default function Tooltip({ text, children, side = 'bottom', disabled = false }) {
  const [show, setShow] = useState(false)
  const id = useId()
  const triggerRef = useRef(null)

  if (disabled || !text) {
    return children
  }

  const handleEnter = () => setShow(true)
  const handleLeave = () => setShow(false)
  const handleFocus = () => setShow(true)
  const handleBlur = () => setShow(false)

  return (
    <span
      className="tp-tooltip-wrap"
      ref={triggerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      {show && (
        <span className={`tp-tooltip tp-tooltip--${side}`} role="tooltip" id={id}>
          {text}
        </span>
      )}
    </span>
  )
}
