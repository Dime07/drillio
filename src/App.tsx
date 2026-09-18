import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clipboard, FileJson2, Lightbulb, RotateCcw, XCircle } from 'lucide-react'
import { calculateScore, parseQuizSet, type Difficulty, type QuizSet } from './quiz'
import { createPrompt } from './prompt'

type Screen = 'configure' | 'import' | 'practice' | 'result'

const letters = ['A', 'B', 'C', 'D']

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
  const [screen, setScreen] = useState<Screen>('configure')
  const [topic, setTopic] = useState('')
  const [countInput, setCountInput] = useState('10')
  const [countError, setCountError] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState(2)
  const [language, setLanguage] = useState('Indonesia')
  const [questionFormat, setQuestionFormat] = useState<'Pilihan ganda' | 'Benar / Salah' | 'Campuran'>('Campuran')
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

  function moveToImport() {
    if (!/^\d+$/.test(countInput) || count < 1 || count > 50) {
      setCountError('Masukkan jumlah antara 1 dan 50.')
      return
    }
    setCountError('')
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
      setIsImporting(false)
      setScreen('practice')
    }, 120)
  }

  function resetApp() {
    setScreen('configure')
    setRawJson('')
    setImportErrors([])
    setQuiz(null)
    setAnswers({})
    setActiveQuestion(0)
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={resetApp} aria-label="Kembali ke beranda Latih">
          <span>latih<span className="brand-stop">.</span></span>
        </button>
        <span className="header-note">ruang latihan mandiri</span>
      </header>

      {screen === 'configure' && (
        <section className="configure-page" aria-labelledby="page-title">
          <div className="intro-copy">
            <h1 id="page-title">Bawa soal dari AI.<br />Belajar dengan caramu.</h1>
            <p className="lede">Pilih topik dan bentuk pertanyaannya. Kami siapkan instruksi yang dapat dipakai di AI mana pun.</p>
            <p className="workflow-note">Tidak perlu akun. Tempel JSON hasil AI, lalu kerjakan soalnya dalam satu sesi yang tenang.</p>
          </div>

          <form className="config-panel" onSubmit={(event) => { event.preventDefault(); moveToImport() }}>
            <div className="panel-heading"><span>Rancang sesi latihan</span><span className="step-tag">Konfigurasi</span></div>
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
            <label className="field full-width">Bahasa pertanyaan
              <select value={language} onChange={(event) => setLanguage(event.target.value)}><option>Indonesia</option><option>English</option></select>
            </label>
            <fieldset className="format-field"><legend>Jenis pertanyaan</legend><div className="format-options">{(['Pilihan ganda', 'Benar / Salah', 'Campuran'] as const).map((format) => <button key={format} type="button" className={questionFormat === format ? 'format-option selected' : 'format-option'} onClick={() => setQuestionFormat(format)}><span>{format}</span><small>{format === 'Pilihan ganda' ? 'Empat opsi per soal' : format === 'Benar / Salah' ? 'Dua pilihan ringkas' : 'Gabungkan keduanya'}</small></button>)}</div></fieldset>
            <label className="field full-width">Instruksi tambahan <span>Opsional</span>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contoh: fokus pada konsep dasar, jangan gunakan soal hitungan." rows={3} />
            </label>
            <button className="primary-button" type="submit">Siapkan instruksi</button>
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
          <div className="practice-meta"><span>{quiz.topic}</span><span>{activeQuestion + 1} / {quiz.questions.length}</span></div>
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
