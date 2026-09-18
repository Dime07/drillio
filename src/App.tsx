import { useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { ConfigurePage } from './components/ConfigurePage'
import { ImportPage } from './components/ImportPage'
import { LandingPage } from './components/LandingPage'
import { PracticePage } from './components/PracticePage'
import { ResultsPage } from './components/ResultsPage'
import { createPrompt } from './prompt'
import { type Difficulty, parseQuizSet, type QuizSet } from './quiz'

type QuestionFormat = 'Pilihan ganda' | 'Benar / Salah' | 'Campuran'
const exampleJson = `{"title":"Dasar Fotosintesis","topic":"Biologi","questions":[{"id":"1","question":"Di organel manakah fotosintesis terutama berlangsung?","options":["Nukleus","Kloroplas","Mitokondria","Ribosom"],"correctAnswerIndex":1,"explanation":"Kloroplas mengandung klorofil yang menangkap energi cahaya untuk fotosintesis."}]}`

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const [topic, setTopic] = useState('')
  const [countInput, setCountInput] = useState('10')
  const [countError, setCountError] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState(2)
  const [language, setLanguage] = useState('Indonesia')
  const [questionFormat, setQuestionFormat] =
    useState<QuestionFormat>('Campuran')
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
  const difficulty = (['Mudah', 'Menengah', 'Menantang'] as Difficulty[])[
    difficultyLevel - 1
  ]
  const count = Number(countInput)
  const prompt = useMemo(
    () =>
      createPrompt({
        topic,
        count: Number.isInteger(count) && count > 0 ? count : 10,
        difficulty,
        language,
        questionFormat,
        notes,
      }),
    [topic, count, difficulty, language, questionFormat, notes],
  )
  const currentQuestion = quiz?.questions[activeQuestion]
  useEffect(() => {
    const update = () => setIsFullscreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])
  useEffect(() => {
    if (location.pathname !== '/practice' || remainingSeconds === null) return
    if (remainingSeconds === 0) {
      navigate('/results', { replace: true })
      return
    }
    const timer = window.setInterval(
      () =>
        setRemainingSeconds((seconds) =>
          seconds === null ? null : Math.max(0, seconds - 1),
        ),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [location.pathname, navigate, remainingSeconds])
  const moveToImport = () => {
    if (!/^\d+$/.test(countInput) || count < 1 || count > 50)
      return setCountError('Masukkan jumlah antara 1 dan 50.')
    if (
      timerEnabled &&
      (!/^\d+$/.test(timerMinutes) ||
        Number(timerMinutes) < 1 ||
        Number(timerMinutes) > 999)
    )
      return setTimerError('Masukkan durasi antara 1 dan 999 menit.')
    setCountError('')
    setTimerError('')
    setPromptCopied(false)
    navigate('/import')
  }
  const importQuiz = () => {
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
      navigate('/practice')
    }, 120)
  }
  const resetApp = () => {
    navigate('/', { replace: true })
    setRawJson('')
    setImportErrors([])
    setQuiz(null)
    setAnswers({})
    setActiveQuestion(0)
    setRemainingSeconds(null)
    setFullscreenMessage('')
  }
  const toggleFullscreen = async () => {
    if (!document.fullscreenEnabled)
      return setFullscreenMessage(
        'Layar penuh belum didukung oleh browser ini.',
      )
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
      setFullscreenMessage('')
    } catch {
      setFullscreenMessage(
        'Layar penuh tidak dapat diaktifkan. Coba lagi dari browser ini.',
      )
    }
  }
  return (
    <main className="app-shell">
      <header className="site-header">
        <button
          type="button"
          className="brand"
          onClick={resetApp}
          aria-label="Kembali ke beranda Drillio"
        >
          <span>
            Drillio<span className="brand-stop">.</span>
          </span>
        </button>
        <span className="header-note">latihan dari soal AI</span>
      </header>
      <Routes>
        <Route
          path="/"
          element={<LandingPage onStart={() => navigate('/setup')} />}
        />
        <Route
          path="/setup"
          element={
            <ConfigurePage
              {...{
                topic,
                countInput,
                countError,
                difficulty,
                difficultyLevel,
                language,
                questionFormat,
                timerEnabled,
                timerMinutes,
                timerError,
                notes,
                setTopic,
                setCountInput,
                setDifficultyLevel,
                setLanguage,
                setQuestionFormat,
                setTimerEnabled,
                setTimerMinutes,
                setNotes,
              }}
              onBack={() => navigate('/')}
              onSubmit={moveToImport}
              clearCountError={() => setCountError('')}
              clearTimerError={() => setTimerError('')}
            />
          }
        />
        <Route
          path="/import"
          element={
            <ImportPage
              prompt={prompt}
              promptCopied={promptCopied}
              rawJson={rawJson}
              errors={importErrors}
              isImporting={isImporting}
              onBack={() => navigate('/setup')}
              onCopy={async () => {
                await navigator.clipboard.writeText(prompt)
                setPromptCopied(true)
              }}
              onRawJsonChange={(value) => {
                setRawJson(value)
                setImportErrors([])
              }}
              onExample={() => setRawJson(exampleJson)}
              onImport={importQuiz}
            />
          }
        />
        <Route
          path="/practice"
          element={
            quiz && currentQuestion ? (
              <PracticePage
                quiz={quiz}
                question={currentQuestion}
                activeQuestion={activeQuestion}
                answers={answers}
                remainingSeconds={remainingSeconds}
                isFullscreen={isFullscreen}
                fullscreenMessage={fullscreenMessage}
                onToggleFullscreen={toggleFullscreen}
                onAnswer={(questionId, answer) =>
                  setAnswers((previous) => ({
                    ...previous,
                    [questionId]: answer,
                  }))
                }
                onPrevious={() =>
                  setActiveQuestion((value) => Math.max(0, value - 1))
                }
                onNext={() => setActiveQuestion((value) => value + 1)}
                onFinish={() => navigate('/results')}
              />
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />
        <Route
          path="/results"
          element={
            quiz ? (
              <ResultsPage quiz={quiz} answers={answers} onRestart={resetApp} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}
