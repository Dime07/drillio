import { ArrowLeft, Check, Clipboard, FileJson2, XCircle } from 'lucide-react'

type Props = {
  prompt: string
  promptCopied: boolean
  rawJson: string
  errors: string[]
  isImporting: boolean
  onBack: () => void
  onCopy: () => void
  onRawJsonChange: (value: string) => void
  onExample: () => void
  onImport: () => void
}

export function ImportPage({
  prompt,
  promptCopied,
  rawJson,
  errors,
  isImporting,
  onBack,
  onCopy,
  onRawJsonChange,
  onExample,
  onImport,
}: Props) {
  return (
    <section className="import-page" aria-labelledby="import-title">
      <button className="quiet-back" type="button" onClick={onBack}>
        <ArrowLeft size={17} /> Ubah konfigurasi
      </button>
      <div className="import-heading">
        <h1 id="import-title">Bawa hasilnya kembali ke sini.</h1>
        <p>
          Salin instruksi ini ke AI pilihanmu. Saat JSON siap, tempelkan di
          kolom sebelahnya.
        </p>
      </div>
      <div className="import-grid">
        <article className="prompt-card">
          <div className="card-topline">
            <span>Instruksi untuk AI</span>
            <button
              className="copy-button"
              type="button"
              onClick={onCopy}
              aria-live="polite"
            >
              {promptCopied ? (
                <>
                  <Check size={16} /> Instruksi tersalin
                </>
              ) : (
                <>
                  <Clipboard size={16} /> Salin instruksi
                </>
              )}
            </button>
          </div>
          <p className="copy-hint">
            AI akan diminta mengirim objek JSON saja, tanpa Markdown atau teks
            pembuka.
          </p>
          <pre>{prompt}</pre>
        </article>
        <article className="json-card">
          <div className="card-topline">
            <span>
              <FileJson2 size={16} /> Jawaban JSON
            </span>
            <button className="text-button" type="button" onClick={onExample}>
              Lihat contoh
            </button>
          </div>
          {!rawJson && !isImporting && (
            <p className="empty-import">
              Belum ada JSON. Jalankan instruksi di AI pilihanmu, lalu tempel
              hasilnya di sini.
            </p>
          )}
          <textarea
            aria-label="JSON dari AI"
            value={rawJson}
            onChange={(event) => onRawJsonChange(event.target.value)}
            placeholder={
              'Tempel objek JSON dari AI di sini…\n\nTidak perlu mengubah apa pun bila formatnya sudah sesuai.'
            }
          />
          {isImporting && (
            <p className="loading-state" role="status">
              Memeriksa struktur paket soal…
            </p>
          )}
          {errors.length > 0 && (
            <div className="error-box" role="alert">
              <XCircle size={18} />
              <div>
                <b>Format JSON belum cocok.</b>
                {errors.map((error) => (
                  <span key={error}>{error}</span>
                ))}
              </div>
            </div>
          )}
          <button
            className="primary-button"
            type="button"
            onClick={onImport}
            disabled={!rawJson.trim() || isImporting}
          >
            {isImporting ? 'Memeriksa paket…' : 'Buka sesi latihan'}
          </button>
        </article>
      </div>
    </section>
  )
}
