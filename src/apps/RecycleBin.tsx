import { Icon } from '../os/icons'

export function RecycleBin() {
  return (
    <div className="window-body flush">
      <div className="empty-state">
        <Icon name="recycle" size={44} />
        <p style={{ margin: 0, fontWeight: 'bold' }}>The Recycle Bin is empty.</p>
        <p style={{ margin: 0 }}>
          Nothing here. Deprecated code goes straight to production instead.
        </p>
      </div>
      <div className="statusbar"><div>0 objects</div></div>
    </div>
  )
}
