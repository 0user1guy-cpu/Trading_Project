import RangeSlider from './RangeSlider'
import FilterSection from './FilterSection'
import { useLanguage } from '../contexts/LanguageContext'
import './PatternsFilter.css'

/**
 * Filtre Motif (Patterns) façon CSFloat :
 * - chips de motifs (Fade, Doppler, Marble Fade, Case Hardened, Tiger Tooth...)
 * - sliders Fade % et Blue % (dégradé bleu pour fade).
 *
 * Dégradés de barre :
 *  - Fade % : linear-gradient(to right, #E2B383 0%, #EFA050 25%, #E55C65 50%, #AC4CB0 75%, #6068D3 100%)
 *  - Blue % : couleur de fond unie #2B7FFF
 *
 * Note: les fade%/blue% réels ne sont pas disponibles par item dans openskin
 * (qui agrège par nom) ; les sliders restent fonctionnels côté UI mais le
 * filtrage backend se fait par nom de motif.
 */
const PATTERN_CHIPS = [
  { label: 'Fade', tKey: 'pattern.fade' },
  { label: 'Doppler', tKey: 'pattern.doppler' },
  { label: 'Marble Fade', tKey: 'pattern.marbleFade' },
  { label: 'Case Hardened', tKey: 'pattern.caseHardened' },
  { label: 'Tiger Tooth', tKey: 'pattern.tigerTooth' },
]

export default function PatternsFilter({ value, onChange }) {
  const { t } = useLanguage()
  const v = value || { chip: null, fadeMin: 0, fadeMax: 100, blueMin: 0, blueMax: 100 }

  const set = (patch) => onChange({ ...v, ...patch })

  return (
    <FilterSection title={t('filter.patterns')}>
      <div className="pattern-chips">
        {PATTERN_CHIPS.map((chip) => (
          <button
            key={chip.label}
            className={`pattern-chip ${v.chip === chip.label ? 'active' : ''}`}
            onClick={() => set({ chip: v.chip === chip.label ? null : chip.label })}
          >
            {t(chip.tKey)}
          </button>
        ))}
      </div>
      <div className="pattern-sub">
        <span className="pattern-sub-label">{t('pattern.fadePercent')}</span>
        <RangeSlider
          variant="fade"
          min={0} max={100}
          value={[v.fadeMin, v.fadeMax]}
          onChange={([a, b]) => set({ fadeMin: a, fadeMax: b })}
          formatValue={(x) => `${Math.round(x)}%`}
        />
      </div>
      <div className="pattern-sub">
        <span className="pattern-sub-label">{t('pattern.bluePercent')}</span>
        <RangeSlider
          variant="blue"
          min={0} max={100}
          value={[v.blueMin, v.blueMax]}
          onChange={([a, b]) => set({ blueMin: a, blueMax: b })}
          formatValue={(x) => `${Math.round(x)}%`}
        />
      </div>
    </FilterSection>
  )
}
