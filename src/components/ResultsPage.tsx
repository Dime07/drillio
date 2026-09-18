import { CheckCircle2, Lightbulb, RotateCcw, XCircle } from 'lucide-react'
import { calculateScore, type QuizSet } from '../quiz'

export function ResultsPage({
  quiz,
  answers,
  onRestart,
}: {
  quiz: QuizSet
  answers: Record<string, number | undefined>
  onRestart: () => void
}) {
  const score = calculateScore(quiz, answers)
  const percentage = Math.round((score / quiz.questions.length) * 100)
  return (
    <section className="results-page" aria-labelledby="result-title">
      <div className="result-hero">
        <div className="result-label">Paket selesai</div>
        <h1 id="result-title">
          {percentage >= 70
            ? 'Pemahamanmu sudah kuat.'
            : 'Ini titik terbaik untuk mengulang.'}
        </h1>
        <p>
          {quiz.title} · {quiz.topic}
        </p>
        <div className="score-display">
          <strong>{score}</strong>
          <span>
            jawaban benar
            <br />
            dari {quiz.questions.length} soal
          </span>
          <em>{percentage}%</em>
        </div>
        <button className="secondary-button" type="button" onClick={onRestart}>
          <RotateCcw size={17} /> Buat paket baru
        </button>
      </div>
      <div className="review-section">
        <div>
          <h2>Ulas jawabanmu.</h2>
        </div>
        <div className="review-list">
          {quiz.questions.map((question, index) => {
            const chosen = answers[question.id]
            const correct = chosen === question.correctAnswerIndex
            return (
              <article
                className={`review-item ${correct ? 'correct' : 'incorrect'}`}
                key={question.id}
              >
                <div className="review-number">{index + 1}</div>
                <div className="review-content">
                  <div className="review-status">
                    {correct ? (
                      <>
                        <CheckCircle2 size={17} /> Benar
                      </>
                    ) : (
                      <>
                        <XCircle size={17} />{' '}
                        {chosen === undefined
                          ? 'Belum dijawab'
                          : 'Perlu diulang'}
                      </>
                    )}
                  </div>
                  <h3>{question.question}</h3>
                  <p className="answer-line">
                    Jawabanmu:{' '}
                    <b>
                      {chosen === undefined
                        ? 'Belum diisi'
                        : question.options[chosen]}
                    </b>
                  </p>
                  {!correct && (
                    <p className="answer-line">
                      Jawaban tepat:{' '}
                      <b>{question.options[question.correctAnswerIndex]}</b>
                    </p>
                  )}
                  <div className="explanation">
                    <Lightbulb size={18} />
                    <span>{question.explanation}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
