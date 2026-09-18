import {
  ArrowRight,
  Check,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Timer,
} from 'lucide-react'
import type { Question, QuizSet } from '../quiz'

const letters = ['A', 'B', 'C', 'D']
const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
type Props = {
  quiz: QuizSet
  question: Question
  activeQuestion: number
  answers: Record<string, number | undefined>
  remainingSeconds: number | null
  isFullscreen: boolean
  fullscreenMessage: string
  onToggleFullscreen: () => void
  onAnswer: (questionId: string, answer: number) => void
  onPrevious: () => void
  onNext: () => void
  onFinish: () => void
}

export function PracticePage({
  quiz,
  question,
  activeQuestion,
  answers,
  remainingSeconds,
  isFullscreen,
  fullscreenMessage,
  onToggleFullscreen,
  onAnswer,
  onPrevious,
  onNext,
  onFinish,
}: Props) {
  const answeredCount = Object.values(answers).filter(
    (value) => value !== undefined,
  ).length
  return (
    <section className="practice-page" aria-labelledby="question-title">
      <div className="practice-toolbar">
        <div className="practice-meta">
          <span>{quiz.topic}</span>
          <span>
            {activeQuestion + 1} / {quiz.questions.length}
          </span>
        </div>
        <div className="exam-controls">
          {remainingSeconds !== null && (
            <div
              className={`timer-display ${remainingSeconds < 60 ? 'timer-urgent' : ''}`}
              aria-live="polite"
            >
              <Timer size={17} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>
          )}
          <button
            className="fullscreen-button"
            type="button"
            onClick={onToggleFullscreen}
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            {isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
          </button>
        </div>
      </div>
      {fullscreenMessage && (
        <p className="fullscreen-message" role="status">
          {fullscreenMessage}
        </p>
      )}
      <div className="progress-track">
        <span
          style={{
            width: `${((activeQuestion + 1) / quiz.questions.length) * 100}%`,
          }}
        />
      </div>
      <div className="question-layout">
        <div className="question-copy">
          <p>
            {question.type === 'true_false'
              ? 'Benar atau salah?'
              : 'Pilih jawaban terbaik'}
          </p>
          <h1 id="question-title">{question.question}</h1>
        </div>
        <fieldset className="option-list">
          <legend>
            {question.type === 'true_false'
              ? 'Pilih Benar atau Salah'
              : 'Pilih satu jawaban'}
          </legend>
          {question.options.map((option, index) => {
            const selected = answers[question.id] === index
            return (
              <button
                className={`option ${selected ? 'selected' : ''}`}
                key={option}
                type="button"
                onClick={() => onAnswer(question.id, index)}
              >
                <span className="option-letter">{letters[index]}</span>
                <span>{option}</span>
                {selected && <Check size={19} />}
              </button>
            )
          })}
        </fieldset>
      </div>
      <div className="practice-footer">
        <span>
          {answeredCount} dari {quiz.questions.length} jawaban terisi
        </span>
        <div>
          <button
            className="secondary-button"
            type="button"
            onClick={onPrevious}
            disabled={activeQuestion === 0}
          >
            Sebelumnya
          </button>
          {activeQuestion === quiz.questions.length - 1 ? (
            <button className="primary-button" type="button" onClick={onFinish}>
              Lihat hasil <CheckCircle2 size={18} />
            </button>
          ) : (
            <button className="primary-button" type="button" onClick={onNext}>
              Soal berikutnya <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
