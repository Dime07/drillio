export type Difficulty = 'Mudah' | 'Menengah' | 'Menantang'
export type QuestionType = 'multiple_choice' | 'true_false'

export interface Question {
  id: string
  type: QuestionType
  question: string
  options: string[]
  correctAnswerIndex: number
  explanation: string
}

export interface QuizSet {
  title: string
  topic: string
  questions: Question[]
}

export type ParseResult = { quiz: QuizSet; errors: [] } | { quiz: null; errors: string[] }

const requiredText = (value: unknown, label: string, errors: string[]) => {
  if (typeof value !== 'string' || value.trim().length === 0) errors.push(`${label} wajib berupa teks.`)
}

export function parseQuizSet(raw: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { quiz: null, errors: ['JSON belum valid. Pastikan tidak ada teks atau tanda koma tambahan.'] }
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { quiz: null, errors: ['JSON harus berupa satu objek paket soal.'] }
  }

  const candidate = data as Record<string, unknown>
  const errors: string[] = []
  requiredText(candidate.title, 'title', errors)
  requiredText(candidate.topic, 'topic', errors)

  if (!Array.isArray(candidate.questions) || candidate.questions.length === 0) {
    errors.push('questions harus berisi minimal satu soal.')
  } else {
    candidate.questions.forEach((item, position) => {
      const label = `Soal ${position + 1}`
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        errors.push(`${label} harus berupa objek.`)
        return
      }
      const question = item as Record<string, unknown>
      requiredText(question.question, `${label}: question`, errors)
      requiredText(question.explanation, `${label}: explanation`, errors)
      const type = question.type === undefined ? 'multiple_choice' : question.type
      if (type !== 'multiple_choice' && type !== 'true_false') {
        errors.push(`${label}: type harus bernilai multiple_choice atau true_false.`)
      }
      const optionCount = type === 'true_false' ? 2 : 4
      if (!Array.isArray(question.options) || question.options.length !== optionCount || question.options.some((option) => typeof option !== 'string' || !option.trim())) {
        errors.push(`${label} harus memiliki tepat ${optionCount} options berupa teks.`)
      }
      if (!Number.isInteger(question.correctAnswerIndex) || (question.correctAnswerIndex as number) < 0 || (question.correctAnswerIndex as number) >= optionCount) {
        errors.push(`${label}: correctAnswerIndex harus sesuai indeks opsi yang tersedia.`)
      }
    })
  }

  if (errors.length) return { quiz: null, errors }

  return {
    errors: [],
    quiz: {
      title: candidate.title as string,
      topic: candidate.topic as string,
      questions: (candidate.questions as Array<Record<string, unknown>>).map((question, index) => ({
        id: typeof question.id === 'string' && question.id.trim() ? question.id : String(index + 1),
        type: question.type === 'true_false' ? 'true_false' : 'multiple_choice',
        question: question.question as string,
        options: question.options as string[],
        correctAnswerIndex: question.correctAnswerIndex as number,
        explanation: question.explanation as string,
      })),
    },
  }
}

export function calculateScore(quiz: QuizSet, answers: Record<string, number | undefined>) {
  return quiz.questions.reduce((total, question) => total + Number(answers[question.id] === question.correctAnswerIndex), 0)
}
