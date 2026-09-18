import { describe, expect, it } from 'vitest'
import { createPrompt } from './prompt'

describe('createPrompt', () => {
  it('includes the chosen configuration and strict JSON instruction', () => {
    const prompt = createPrompt({
      topic: 'Sejarah Indonesia',
      count: 5,
      difficulty: 'Mudah',
      language: 'Indonesia',
      questionFormat: 'Campuran',
      notes: 'Fokus kronologi.',
    })
    expect(prompt).toContain('Sejarah Indonesia')
    expect(prompt).toContain('Jumlah soal: 5')
    expect(prompt).toContain('Kembalikan HANYA objek JSON valid')
    expect(prompt).toContain('Fokus kronologi.')
  })
})
