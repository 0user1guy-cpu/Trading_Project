import RangeSlider from './RangeSlider'
import FilterSection from './FilterSection'
import './PatternsFilter.css'

/**
 * Filtre Motif (Patterns) façon CSFloat :
 * - chips de motifs (Fade, Doppler, Marble Fade, Case Hardened, Tiger Tooth...)
 * - sliders Fade % et Blue % (dégradé bleu pour fade).
 *
 * Note: les fade%/blue% réels ne sont pas disponibles par item dans openskin
 * (qui agrège par nom) ; les sliders restent fonctionnels côté UI mais le
 * filtrage backend se fait par nom de motif.
 */
const PATTERN_CHIPS = ['Fade', 'Doppler', 'Marble Fade', 'Case Hardened', 'Tiger Tooth']

export default function PatternsFilter({ value, onChange }) {
  const v = value || { chip: null, fadeMin: 0, fadeMax: 100, blueMin: 0, blueMax: 100 }

  const set = (patch) => onChange({ ...v, ...patch })

  return (
    <FilterSection title="Patterns">
      <div className="pattern-chips">
        {PATTERN_CHIPS.map((chip) => (
          <button
            key={chip}
            className={`pattern-chip ${v.chip === chip ? 'active' : ''}`}
            onClick={() => set({ chip: v.chip === chip ? null : chip })}
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="pattern-sub">
        <span className="pattern-sub-label">Fade %</span>
        <RangeSlider
          variant="float"
          min={0} max={100}
          value={[v.fadeMin, v.fadeMax]}
          onChange={([a, b]) => set({ fadeMin: a, fadeMax: b })}
          formatValue={(x) => `${Math.round(x)}%`}
        />
      </div>
      <div className="pattern-sub">
        <span className="pattern-sub-label">Blue %</span>
        <RangeSlider
          variant="float"
          min={0} max={100}
          value={[v.blueMin, v.blueMax]}
          onChange={([a, b]) => set({ blueMin: a, blueMax: b })}
          formatValue={(x) => `${Math.round(x)}%`}
        />
      </div>
    </FilterSection>
  )
}
