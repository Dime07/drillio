import { describe, expect, it } from 'vitest'
import { calculateScore, parseQuizSet } from './quiz'

const validJson = JSON.stringify({
  title: 'Latihan sains',
  topic: 'Sains',
  questions: [
    {
      id: 'q1',
      question: 'Pertanyaan?',
      options: ['A', 'B', 'C', 'D'],
      correctAnswerIndex: 2,
      explanation: 'Karena C.',
    },
  ],
})

describe('parseQuizSet', () => {
  it('parses a valid quiz set', () => {
    const result = parseQuizSet(validJson)
    expect(result.errors).toEqual([])
    expect(result.quiz?.questions[0].correctAnswerIndex).toBe(2)
  })

  it('explains malformed JSON', () => {
    expect(parseQuizSet('{invalid}').errors[0]).toMatch(/JSON belum valid/)
  })

  it('rejects questions without exactly four options', () => {
    const result = parseQuizSet(
      JSON.stringify({
        title: 'A',
        topic: 'B',
        questions: [
          {
            question: 'Q',
            options: ['A'],
            correctAnswerIndex: 0,
            explanation: 'E',
          },
        ],
      }),
    )
    expect(result.errors.join(' ')).toMatch(/tepat 4/)
  })

  it('accepts a true or false question with two options', () => {
    const result = parseQuizSet(
      JSON.stringify({
        title: 'A',
        topic: 'B',
        questions: [
          {
            type: 'true_false',
            question: 'Q',
            options: ['Benar', 'Salah'],
            correctAnswerIndex: 0,
            explanation: 'E',
          },
        ],
      }),
    )
    expect(result.errors).toEqual([])
    expect(result.quiz?.questions[0].type).toBe('true_false')
  })
})

describe('calculateScore', () => {
  it('counts only correct answers', () => {
    const parsed = parseQuizSet(validJson)
    if (!parsed.quiz) throw new Error('Fixture kuis harus valid.')
    const quiz = parsed.quiz
    expect(calculateScore(quiz, { q1: 2 })).toBe(1)
    expect(calculateScore(quiz, { q1: 1 })).toBe(0)
  })
})
