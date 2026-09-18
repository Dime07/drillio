import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clipboard, FileJson2, Lightbulb, Maximize2, Minimize2, RotateCcw, Timer, XCircle } from 'lucide-react'
import { calculateScore, parseQuizSet, type Difficulty, type QuizSet } from './quiz'
import { createPrompt } from './prompt'

type Screen = 'home' | 'configure' | 'import' | 'practice' | 'result'

const letters = ['A', 'B', 'C', 'D']

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const exampleJson = `{
  "title": "Dasar Fotosintesis",
  "topic": "Biologi",
  "questions": [
    {
      "id": "1",
      "question": "Di organel manakah fotosintesis terutama berlangsung?",
      "options": ["Nukleus", "Kloroplas", "Mitokondria", "Ribosom"],
      "correctAnswerIndex": 1,
      "explanation": "Kloroplas mengandung klorofil yang menangkap energi cahaya untuk fotosintesis."
    }
  ]
}`

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [topic, setTopic] = useState('')
  const [countInput, setCountInput] = useState('10')
  const [countError, setCountError] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState(2)
  const [language, setLanguage] = useState('Indonesia')
  const [questionFormat, setQuestionFormat] = useState<'Pilihan ganda' | 'Benar / Salah' | 'Campuran'>('Campuran')
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState('30')
  const [timerError, setTimerError] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenMessage, setFullscreenMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [promptCopied, setPromptCopied] = useState(false)
  const [rawJson, setRawJson] = useState('')
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [quiz, setQuiz] = useState<QuizSet | null>(null)
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})

  const difficulty = (['Mudah', 'Menengah', 'Menantang'] as Difficulty[])[difficultyLevel - 1]
  const count = Number(countInput)
  const prompt = useMemo(() => createPrompt({ topic, count: Number.isInteger(count) && count > 0 ? count : 10, difficulty, language, questionFormat, notes }), [topic, count, difficulty, language, questionFormat, notes])
  const currentQuestion = quiz?.questions[activeQuestion]
  const answeredCount = Object.values(answers).filter((value) => value !== undefined).length

  useEffect(() => {
    const updateFullscreenState = () => setIsFullscreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', updateFullscreenState)
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState)
  }, [])

  useEffect(() => {
    if (screen !== 'practice' || remainingSeconds === null) return
    if (remainingSeconds === 0) {
      setScreen('result')
      return
    }
    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => seconds === null ? null : Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [screen, remainingSeconds])

  function moveToImport() {
    if (!/^\d+$/.test(countInput) || count < 1 || count > 50) {
      setCountError('Masukkan jumlah antara 1 dan 50.')
      return
    }
    if (timerEnabled && (!/^\d+$/.test(timerMinutes) || Number(timerMinutes) < 1 || Number(timerMinutes) > 999)) {
      setTimerError('Masukkan durasi antara 1 dan 999 menit.')
      return
    }
    setCountError('')
    setTimerError('')
    setScreen('import')
    setPromptCopied(false)
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt)
    setPromptCopied(true)
  }

  function importQuiz() {
    setIsImporting(true)
    window.setTimeout(() => {
      const result = parseQuizSet(rawJson)
      if (!result.quiz) {
        setImportErrors(result.errors)
        setIsImporting(false)
        return
      }
      setQuiz(result.quiz)
      setImportErrors([])
      setAnswers({})
      setActiveQuestion(0)
      setRemainingSeconds(timerEnabled ? Number(timerMinutes) * 60 : null)
      setIsImporting(false)
      setScreen('practice')
    }, 120)
  }

  function resetApp() {
    setScreen('home')
    setRawJson('')
    setImportErrors([])
    setQuiz(null)
    setAnswers({})
    setActiveQuestion(0)
    setRemainingSeconds(null)
    setFullscreenMessage('')
  }

  async function toggleFullscreen() {
    if (!document.fullscreenEnabled) {
      setFullscreenMessage('Layar penuh belum didukung oleh browser ini.')
      return
    }
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
      setFullscreenMessage('')
    } catch {
      setFullscreenMessage('Layar penuh tidak dapat diaktifkan. Coba lagi dari browser ini.')
    }
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={resetApp} aria-label="Kembali ke beranda Drillio">
          <span>Drillio<span className="brand-stop">.</span></span>
        </button>
        <span className="header-note">latihan dari soal AI</span>
      </header>

      {screen === 'home' && (
        <section className="landing-page" aria-labelledby="landing-title">
          <div className="landing-hero">
            <div className="landing-copy">
              <h1 id="landing-title">Bawa soal dari AI.<br />Kerjakan seperti ujian.</h1>
              <p>Drillio mengubah paket soal JSON menjadi sesi latihan yang fokus, lengkap dengan timer dan layar penuh saat kamu membutuhkannya.</p>
              <button className="landing-cta" type="button" onClick={() => setScreen('configure')}>Mulai buat latihan <ArrowRight size={18} /></button>
              <span className="landing-note">Tanpa akun. Pakai AI apa pun yang kamu suka.</span>
            </div>
            <div className="session-preview" aria-label="Contoh tampilan sesi latihan">
              <div className="preview-topline"><span>Biologi</span><span>03 / 10</span></div>
              <div className="preview-progress"><span /></div>
              <p className="preview-label">Pilih jawaban terbaik</p>
              <h2>Bagian sel yang mengatur aktivitas sel adalah…</h2>
              <div className="preview-option"><b>A</b><span>Membran sel</span></div>
              <div className="preview-option active"><b>B</b><span>Nukleus</span><Check size={17} /></div>
              <div className="preview-option"><b>C</b><span>Ribosom</span></div>
              <div className="preview-footer"><span><Timer size={16} /> 24:38</span><span>Mode fokus</span></div>
            </div>
          </div>
          <div className="landing-points" aria-label="Fitur utama Drillio">
            <article><h2>Buat soal di AI pilihanmu</h2><p>Isi topik dan kebutuhanmu. Drillio menyiapkan instruksi JSON yang siap disalin.</p></article>
            <article><h2>Tempel, lalu mulai</h2><p>Masukkan hasil JSON tanpa memindahkan soal satu per satu ke formulir lain.</p></article>
            <article><h2>Jaga ritme belajarmu</h2><p>Atur timer sendiri atau masuk layar penuh saat ingin berlatih tanpa distraksi.</p></article>
          </div>
        </section>
      )}

      {screen === 'configure' && (
        <section className="configure-page compact-configure" aria-labelledby="page-title">
          <div className="config-heading">
            <button className="quiet-back" type="button" onClick={() => setScreen('home')}><ArrowLeft size={17} /> Kembali</button>
            <h1 id="page-title">Rancang paket soalmu.</h1>
            <p>Isi yang penting dulu. Pengaturan lain bisa kamu sesuaikan dalam hitungan detik.</p>
          </div>
          <form className="config-panel" onSubmit={(event) => { event.preventDefault(); moveToImport() }}>
            <label className="field full-width">Materi atau topik
              <input autoFocus value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Contoh: Sistem tata surya, TOEFL, React…" required />
            </label>
            <div className="field-grid">
              <label className="field">Jumlah pertanyaan
                <input type="text" value={countInput} onChange={(event) => { setCountInput(event.target.value); setCountError('') }} inputMode="numeric" aria-describedby={countError ? 'count-error' : undefined} />
                {countError && <span className="field-error" id="count-error" role="alert">{countError}</span>}
              </label>
              <div className="field difficulty-field">Kesulitan <b>{difficulty}</b>
                <input aria-label="Tingkat kesulitan" type="range" min="1" max="3" step="1" value={difficultyLevel} onChange={(event) => setDifficultyLevel(Number(event.target.value))} />
                <div className="range-labels"><span>Mudah</span><span>Menantang</span></div>
              </div>
            </div>
            <div className="field-grid compact-settings">
              <label className="field">Bahasa pertanyaan
                <select value={language} onChange={(event) => setLanguage(event.target.value)}><option>Indonesia</option><option>English</option></select>
              </label>
              <fieldset className="format-field"><legend>Jenis pertanyaan</legend><div className="format-options">{(['Pilihan ganda', 'Benar / Salah', 'Campuran'] as const).map((format) => <button key={format} type="button" className={questionFormat === format ? 'format-option selected' : 'format-option'} onClick={() => setQuestionFormat(format)}><span>{format}</span></button>)}</div></fieldset>
            </div>
            <div className="timer-field compact-timer">
              <label className="timer-choice"><input type="checkbox" checked={timerEnabled} onChange={(event) => { setTimerEnabled(event.target.checked); setTimerError('') }} /> <span>Aktifkan timer</span></label>
              {timerEnabled && <label className="timer-input"><span><input aria-label="Durasi timer dalam menit" type="text" inputMode="numeric" value={timerMinutes} onChange={(event) => { setTimerMinutes(event.target.value); setTimerError('') }} /> menit</span></label>}
              {!timerEnabled && <span className="timer-hint">Latihan tanpa batas waktu</span>}
              {timerError && <span className="field-error" role="alert">{timerError}</span>}
            </div>
            <details className="additional-instructions"><summary>Tambahkan instruksi khusus <span>Opsional</span></summary><label className="field"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contoh: fokus pada konsep dasar, jangan gunakan soal hitungan." rows={2} /></label></details>
            <button className="primary-button" type="submit">Buat instruksi untuk AI <ArrowRight size={18} /></button>
          </form>
        </section>
      )}

      {screen === 'import' && (
        <section className="import-page" aria-labelledby="import-title">
          <button className="quiet-back" onClick={() => setScreen('configure')}><ArrowLeft size={17} /> Ubah konfigurasi</button>
          <div className="import-heading"><h1 id="import-title">Bawa hasilnya kembali ke sini.</h1><p>Salin instruksi ini ke AI pilihanmu. Saat JSON siap, tempelkan di kolom sebelahnya.</p></div>
          <div className="import-grid">
            <article className="prompt-card">
              <div className="card-topline"><span>Instruksi untuk AI</span><button className="copy-button" onClick={copyPrompt} aria-live="polite">{promptCopied ? <><Check size={16} /> Instruksi tersalin</> : <><Clipboard size={16} /> Salin instruksi</>}</button></div>
              <p className="copy-hint">AI akan diminta mengirim objek JSON saja, tanpa Markdown atau teks pembuka.</p>
              <pre>{prompt}</pre>
            </article>
            <article className="json-card">
              <div className="card-topline"><span><FileJson2 size={16} /> Jawaban JSON</span><button className="text-button" type="button" onClick={() => setRawJson(exampleJson)}>Lihat contoh</button></div>
              {!rawJson && !isImporting && <p className="empty-import">Belum ada JSON. Jalankan instruksi di AI pilihanmu, lalu tempel hasilnya di sini.</p>}
              <textarea aria-label="JSON dari AI" value={rawJson} onChange={(event) => { setRawJson(event.target.value); setImportErrors([]) }} placeholder={'Tempel objek JSON dari AI di sini…\n\nTidak perlu mengubah apa pun bila formatnya sudah sesuai.'} />
              {isImporting && <p className="loading-state" role="status">Memeriksa struktur paket soal…</p>}
              {importErrors.length > 0 && <div className="error-box" role="alert"><XCircle size={18} /><div><b>Format JSON belum cocok.</b>{importErrors.map((error) => <span key={error}>{error}</span>)}</div></div>}
              <button className="primary-button" onClick={importQuiz} disabled={!rawJson.trim() || isImporting}>{isImporting ? 'Memeriksa paket…' : 'Buka sesi latihan'}</button>
            </article>
          </div>
        </section>
      )}

      {screen === 'practice' && quiz && currentQuestion && (
        <section className="practice-page" aria-labelledby="question-title">
          <div className="practice-toolbar">
            <div className="practice-meta"><span>{quiz.topic}</span><span>{activeQuestion + 1} / {quiz.questions.length}</span></div>
            <div className="exam-controls">
              {remainingSeconds !== null && <div className={`timer-display ${remainingSeconds < 60 ? 'timer-urgent' : ''}`} aria-live="polite"><Timer size={17} /><span>{formatTime(remainingSeconds)}</span></div>}
              <button className="fullscreen-button" type="button" onClick={toggleFullscreen} aria-pressed={isFullscreen}>{isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}{isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}</button>
            </div>
          </div>
          {fullscreenMessage && <p className="fullscreen-message" role="status">{fullscreenMessage}</p>}
          <div className="progress-track"><span style={{ width: `${((activeQuestion + 1) / quiz.questions.length) * 100}%` }} /></div>
          <div className="question-layout">
            <div className="question-copy"><p>{currentQuestion.type === 'true_false' ? 'Benar atau salah?' : 'Pilih jawaban terbaik'}</p><h1 id="question-title">{currentQuestion.question}</h1></div>
            <fieldset className="option-list"><legend>{currentQuestion.type === 'true_false' ? 'Pilih Benar atau Salah' : 'Pilih satu jawaban'}</legend>{currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index
              return <button className={`option ${isSelected ? 'selected' : ''}`} key={option} type="button" onClick={() => setAnswers((previous) => ({ ...previous, [currentQuestion.id]: index }))}><span className="option-letter">{letters[index]}</span><span>{option}</span>{isSelected && <Check size={19} />}</button>
            })}</fieldset>
          </div>
          <div className="practice-footer"><span>{answeredCount} dari {quiz.questions.length} jawaban terisi</span><div><button className="secondary-button" onClick={() => setActiveQuestion((number) => Math.max(0, number - 1))} disabled={activeQuestion === 0}>Sebelumnya</button>{activeQuestion === quiz.questions.length - 1 ? <button className="primary-button" onClick={() => setScreen('result')}>Lihat hasil <CheckCircle2 size={18} /></button> : <button className="primary-button" onClick={() => setActiveQuestion((number) => number + 1)}>Soal berikutnya <ArrowRight size={18} /></button>}</div></div>
        </section>
      )}

      {screen === 'result' && quiz && (
        <Results quiz={quiz} answers={answers} onRestart={resetApp} />
      )}
    </main>
  )
}

function Results({ quiz, answers, onRestart }: { quiz: QuizSet; answers: Record<string, number | undefined>; onRestart: () => void }) {
  const score = calculateScore(quiz, answers)
  const percentage = Math.round((score / quiz.questions.length) * 100)
  return <section className="results-page" aria-labelledby="result-title">
    <div className="result-hero"><div className="result-label">Paket selesai</div><h1 id="result-title">{percentage >= 70 ? 'Pemahamanmu sudah kuat.' : 'Ini titik terbaik untuk mengulang.'}</h1><p>{quiz.title} · {quiz.topic}</p><div className="score-display"><strong>{score}</strong><span>jawaban benar<br />dari {quiz.questions.length} soal</span><em>{percentage}%</em></div><button className="secondary-button" onClick={onRestart}><RotateCcw size={17} /> Buat paket baru</button></div>
    <div className="review-section"><div><h2>Ulas jawabanmu.</h2></div><div className="review-list">{quiz.questions.map((question, index) => {
      const chosen = answers[question.id]
      const correct = chosen === question.correctAnswerIndex
      return <article className={`review-item ${correct ? 'correct' : 'incorrect'}`} key={question.id}><div className="review-number">{index + 1}</div><div className="review-content"><div className="review-status">{correct ? <><CheckCircle2 size={17} /> Benar</> : <><XCircle size={17} /> {chosen === undefined ? 'Belum dijawab' : 'Perlu diulang'}</>}</div><h3>{question.question}</h3><p className="answer-line">Jawabanmu: <b>{chosen === undefined ? 'Belum diisi' : question.options[chosen]}</b></p>{!correct && <p className="answer-line">Jawaban tepat: <b>{question.options[question.correctAnswerIndex]}</b></p>}<div className="explanation"><Lightbulb size={18} /><span>{question.explanation}</span></div></div></article>
    })}</div></div>
  </section>
}
