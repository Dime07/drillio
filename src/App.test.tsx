import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

beforeEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('practice flow', () => {
  it('moves from configuration through import, practice, review, and reset', async () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Bawa soal dari AI. Kerjakan seperti ujian.',
      }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mulai buat latihan' }))
    expect(window.location.pathname).toBe('/setup')

    fireEvent.change(screen.getByLabelText('Materi atau topik'), {
      target: { value: 'Biologi' },
    })
    fireEvent.change(screen.getByLabelText('Jumlah pertanyaan'), {
      target: { value: '7' },
    })
    fireEvent.change(screen.getByLabelText('Tingkat kesulitan'), {
      target: { value: '3' },
    })
    fireEvent.change(screen.getByLabelText('Bahasa pertanyaan'), {
      target: { value: 'English' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Pilihan ganda/ }))
    fireEvent.click(screen.getByRole('button', { name: /Benar \/ Salah/ }))
    fireEvent.click(screen.getByRole('button', { name: /Campuran/ }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Buat instruksi untuk AI' }),
    )

    expect(
      screen.getByText('Bawa hasilnya kembali ke sini.'),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/import')
    fireEvent.click(screen.getByRole('button', { name: 'Ubah konfigurasi' }))
    expect(screen.getByText('Rancang paket soalmu.')).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Buat instruksi untuk AI' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Salin instruksi' }))
    await screen.findByText('Instruksi tersalin')
    fireEvent.click(screen.getByRole('button', { name: 'Lihat contoh' }))
    fireEvent.click(screen.getByRole('button', { name: 'Buka sesi latihan' }))

    expect(
      await screen.findByText(
        'Di organel manakah fotosintesis terutama berlangsung?',
      ),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/practice')
    fireEvent.click(screen.getByRole('button', { name: /Kloroplas/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Lihat hasil' }))

    expect(
      await screen.findByText('Pemahamanmu sudah kuat.'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Buat paket baru' }))
    expect(
      screen.getByRole('heading', {
        name: 'Bawa soal dari AI. Kerjakan seperti ujian.',
      }),
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Kembali ke beranda Drillio' }),
    )
  })

  it('explains an invalid JSON import', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Mulai buat latihan' }))
    fireEvent.change(screen.getByLabelText('Materi atau topik'), {
      target: { value: 'Biologi' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Buat instruksi untuk AI' }),
    )
    fireEvent.change(screen.getByLabelText('JSON dari AI'), {
      target: { value: '{bukan json}' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Buka sesi latihan' }))

    expect(
      await screen.findByText('Format JSON belum cocok.'),
    ).toBeInTheDocument()
  })

  it('lets users set a timer and exposes exam controls during practice', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Mulai buat latihan' }))
    fireEvent.change(screen.getByLabelText('Materi atau topik'), {
      target: { value: 'Biologi' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Aktifkan timer' }))
    fireEvent.change(screen.getByLabelText('Durasi timer dalam menit'), {
      target: { value: '45' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Buat instruksi untuk AI' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Lihat contoh' }))
    fireEvent.click(screen.getByRole('button', { name: 'Buka sesi latihan' }))

    expect(await screen.findByText('45:00')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Layar penuh' }))
    expect(
      screen.getByText('Layar penuh belum didukung oleh browser ini.'),
    ).toBeInTheDocument()
  })

  it('requires a numeric question count between 1 and 50', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Mulai buat latihan' }))
    fireEvent.change(screen.getByLabelText('Materi atau topik'), {
      target: { value: 'Biologi' },
    })
    fireEvent.change(screen.getByLabelText('Jumlah pertanyaan'), {
      target: { value: 'banyak' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Buat instruksi untuk AI' }),
    )

    expect(
      screen.getByText('Masukkan jumlah antara 1 dan 50.'),
    ).toBeInTheDocument()
  })
})
