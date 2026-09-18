import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Difficulty } from '../quiz'

type QuestionFormat = 'Pilihan ganda' | 'Benar / Salah' | 'Campuran'
type Props = {
  topic: string
  countInput: string
  countError: string
  difficulty: Difficulty
  difficultyLevel: number
  language: string
  questionFormat: QuestionFormat
  timerEnabled: boolean
  timerMinutes: string
  timerError: string
  notes: string
  onBack: () => void
  onSubmit: () => void
  setTopic: (value: string) => void
  setCountInput: (value: string) => void
  setDifficultyLevel: (value: number) => void
  setLanguage: (value: string) => void
  setQuestionFormat: (value: QuestionFormat) => void
  setTimerEnabled: (value: boolean) => void
  setTimerMinutes: (value: string) => void
  setNotes: (value: string) => void
  clearCountError: () => void
  clearTimerError: () => void
}

export function ConfigurePage(props: Props) {
  const formats: QuestionFormat[] = [
    'Pilihan ganda',
    'Benar / Salah',
    'Campuran',
  ]
  return (
    <section
      className="configure-page compact-configure"
      aria-labelledby="page-title"
    >
      <div className="config-heading">
        <button className="quiet-back" type="button" onClick={props.onBack}>
          <ArrowLeft size={17} /> Kembali
        </button>
        <h1 id="page-title">Rancang paket soalmu.</h1>
        <p>
          Isi yang penting dulu. Pengaturan lain bisa kamu sesuaikan dalam
          hitungan detik.
        </p>
      </div>
      <form
        className="config-panel"
        onSubmit={(event) => {
          event.preventDefault()
          props.onSubmit()
        }}
      >
        <label className="field full-width">
          Materi atau topik
          <input
            value={props.topic}
            onChange={(event) => props.setTopic(event.target.value)}
            placeholder="Contoh: Sistem tata surya, TOEFL, React…"
            required
          />
        </label>
        <div className="field-grid">
          <label className="field">
            Jumlah pertanyaan
            <input
              type="text"
              value={props.countInput}
              onChange={(event) => {
                props.setCountInput(event.target.value)
                props.clearCountError()
              }}
              inputMode="numeric"
              aria-describedby={props.countError ? 'count-error' : undefined}
            />
            {props.countError && (
              <span className="field-error" id="count-error" role="alert">
                {props.countError}
              </span>
            )}
          </label>
          <div className="field difficulty-field">
            Kesulitan <b>{props.difficulty}</b>
            <input
              aria-label="Tingkat kesulitan"
              type="range"
              min="1"
              max="3"
              step="1"
              value={props.difficultyLevel}
              onChange={(event) =>
                props.setDifficultyLevel(Number(event.target.value))
              }
            />
            <div className="range-labels">
              <span>Mudah</span>
              <span>Menantang</span>
            </div>
          </div>
        </div>
        <div className="field-grid compact-settings">
          <label className="field">
            Bahasa pertanyaan
            <select
              value={props.language}
              onChange={(event) => props.setLanguage(event.target.value)}
            >
              <option>Indonesia</option>
              <option>English</option>
            </select>
          </label>
          <fieldset className="format-field">
            <legend>Jenis pertanyaan</legend>
            <div className="format-options">
              {formats.map((format) => (
                <button
                  key={format}
                  type="button"
                  className={
                    props.questionFormat === format
                      ? 'format-option selected'
                      : 'format-option'
                  }
                  onClick={() => props.setQuestionFormat(format)}
                >
                  <span>{format}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="timer-field compact-timer">
          <label className="timer-choice">
            <input
              type="checkbox"
              checked={props.timerEnabled}
              onChange={(event) => {
                props.setTimerEnabled(event.target.checked)
                props.clearTimerError()
              }}
            />{' '}
            <span>Aktifkan timer</span>
          </label>
          {props.timerEnabled && (
            <label className="timer-input">
              <span>
                <input
                  aria-label="Durasi timer dalam menit"
                  type="text"
                  inputMode="numeric"
                  value={props.timerMinutes}
                  onChange={(event) => {
                    props.setTimerMinutes(event.target.value)
                    props.clearTimerError()
                  }}
                />{' '}
                menit
              </span>
            </label>
          )}
          {!props.timerEnabled && (
            <span className="timer-hint">Latihan tanpa batas waktu</span>
          )}
          {props.timerError && (
            <span className="field-error" role="alert">
              {props.timerError}
            </span>
          )}
        </div>
        <details className="additional-instructions">
          <summary>
            Tambahkan instruksi khusus <span>Opsional</span>
          </summary>
          <label className="field">
            <textarea
              value={props.notes}
              onChange={(event) => props.setNotes(event.target.value)}
              placeholder="Contoh: fokus pada konsep dasar, jangan gunakan soal hitungan."
              rows={2}
            />
          </label>
        </details>
        <button className="primary-button" type="submit">
          Buat instruksi untuk AI <ArrowRight size={18} />
        </button>
      </form>
    </section>
  )
}
