import { ArrowRight, Check, FileJson, Timer } from 'lucide-react'

export function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <section className="landing-page" aria-labelledby="landing-title">
      <div className="landing-hero">
        <div className="landing-copy">
          <h1 id="landing-title">
            Bawa soal dari AI.
            <br />
            Kerjakan seperti ujian.
          </h1>
          <p>
            Drillio mengubah paket soal JSON menjadi sesi latihan yang fokus—
            lengkap dengan timer dan mode layar penuh saat kamu membutuhkannya.
          </p>
          <div className="landing-actions">
            <button className="landing-cta" type="button" onClick={onStart}>
              Mulai buat latihan <ArrowRight size={18} />
            </button>
            <a className="landing-secondary" href="#landing-features">
              <FileJson size={17} /> Lihat cara kerja
            </a>
          </div>
          <div className="landing-trust">
            <span>
              <Check size={16} /> Tanpa akun. Berjalan langsung di browser.
            </span>
            <small>Gunakan AI favoritmu untuk membuat soal.</small>
          </div>
        </div>
        <section
          className="session-preview"
          aria-label="Contoh tampilan sesi latihan"
        >
          <div className="preview-topline">
            <span>Biologi</span>
            <span>03 / 10</span>
          </div>
          <div className="preview-progress">
            <span />
          </div>
          <p className="preview-label">Pilih jawaban terbaik</p>
          <h2>Bagian sel yang mengatur aktivitas sel adalah…</h2>
          <div className="preview-option">
            <b>A</b>
            <span>Membran sel</span>
          </div>
          <div className="preview-option active">
            <b>B</b>
            <span>Nukleus</span>
            <Check size={17} />
          </div>
          <div className="preview-option">
            <b>C</b>
            <span>Ribosom</span>
          </div>
          <div className="preview-footer">
            <span>
              <Timer size={16} /> 24:38
            </span>
            <span>Mode fokus</span>
          </div>
        </section>
      </div>
      <section
        className="landing-points"
        id="landing-features"
        aria-label="Fitur utama Drillio"
      >
        <article>
          <h2>Buat soal di AI pilihanmu</h2>
          <p>
            Isi topik dan kebutuhanmu. Drillio menyiapkan instruksi JSON yang
            siap disalin.
          </p>
        </article>
        <article>
          <h2>Tempel, lalu mulai</h2>
          <p>
            Masukkan hasil JSON tanpa memindahkan soal satu per satu ke formulir
            lain.
          </p>
        </article>
        <article>
          <h2>Jaga ritme belajarmu</h2>
          <p>
            Atur timer sendiri atau masuk layar penuh saat ingin berlatih tanpa
            distraksi.
          </p>
        </article>
      </section>
    </section>
  )
}
