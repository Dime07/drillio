import type { Difficulty } from './quiz'

export interface PromptConfig {
  topic: string
  count: number
  difficulty: Difficulty
  language: string
  questionFormat: 'Pilihan ganda' | 'Benar / Salah' | 'Campuran'
  notes: string
}

export function createPrompt({ topic, count, difficulty, language, questionFormat, notes }: PromptConfig) {
  const extraInstruction = notes.trim() ? `\nInstruksi tambahan: ${notes.trim()}` : ''
  const formatRule = questionFormat === 'Pilihan ganda'
    ? 'Gunakan type "multiple_choice" untuk semua soal; masing-masing wajib memiliki tepat 4 opsi.'
    : questionFormat === 'Benar / Salah'
      ? 'Gunakan type "true_false" untuk semua soal; masing-masing wajib memiliki tepat 2 opsi: "Benar" dan "Salah".'
      : 'Boleh gabungkan type "multiple_choice" (tepat 4 opsi) dan "true_false" (tepat 2 opsi: "Benar" dan "Salah").'
  return `Buat paket latihan untuk topik: ${topic.trim() || 'topik pilihan saya'}\nJumlah soal: ${count}\nKesulitan: ${difficulty}\nBahasa: ${language}\nFormat: ${questionFormat}\n${formatRule}\nSetiap soal hanya memiliki satu jawaban benar dan satu pembahasan singkat.${extraInstruction}\n\nKembalikan HANYA objek JSON valid. Jangan gunakan Markdown, code block, atau kalimat lain. Salin struktur ini dengan tepat:\n{\n  "title": "Judul paket",\n  "topic": "${topic.trim() || 'Topik'}",\n  "questions": [\n    {\n      "id": "1",\n      "type": "multiple_choice",\n      "question": "Teks pertanyaan",\n      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],\n      "correctAnswerIndex": 0,\n      "explanation": "Pembahasan singkat."\n    }\n  ]\n} \n Pastikan hasil JSON gampang untuk di copy`
}
