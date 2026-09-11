import { useState } from 'react'

export function ImageViewer({ src, caption }: { src: string; caption?: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="window-body flush">
      <div className="image-stage">
        {failed ? (
          <div className="empty-state" style={{ color: '#ddd' }}>
            <p>Image not found.</p>
            <p style={{ fontSize: 10 }}>{src}</p>
          </div>
        ) : (
          <img src={src} alt={caption ?? 'Photo'} onError={() => setFailed(true)} />
        )}
      </div>
      {caption && (
        <div className="statusbar">
          <div>{caption}</div>
        </div>
      )}
    </div>
  )
}
