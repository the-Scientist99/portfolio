export function TextViewer({ body }: { body: string }) {
  return (
    <div className="window-body flush">
      <pre className="text-body selectable" tabIndex={0} data-autofocus>{body}</pre>
    </div>
  )
}
