/**
 * Browsers disagree about inline PDF rendering, and iOS Safari refuses it in
 * an iframe outright. The download link is the reliable path and is always
 * visible, so the viewer failing costs nobody the resume.
 */
export function PdfViewer({ src }: { src: string }) {
  return (
    <div className="window-body flush">
      <div className="explorer-toolbar">
        <a href={src} download="Emir_Kardovic_Resume.pdf">
          <button type="button">Download PDF</button>
        </a>
        <a href={src} target="_blank" rel="noreferrer">
          <button type="button">Open in new tab</button>
        </a>
      </div>
      <iframe className="pdf-frame" src={src} title="Resume, PDF" />
    </div>
  )
}
