type StartupErrorScreenProps = {
  title?: string
  message: string
}

export function StartupErrorScreen({
  title = '앱 초기화에 실패했습니다.',
  message,
}: StartupErrorScreenProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background:
          'linear-gradient(135deg, rgb(248 250 252), rgb(226 232 240))',
        color: '#0f172a',
      }}
    >
      <div
        style={{
          width: 'min(560px, 100%)',
          padding: '32px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.92)',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#b91c1c' }}>
          Startup Error
        </p>
        <h1 style={{ margin: '10px 0 12px', fontSize: '28px' }}>{title}</h1>
        <p style={{ margin: 0, lineHeight: 1.6 }}>{message}</p>
      </div>
    </div>
  )
}
