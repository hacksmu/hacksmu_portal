// pages/index.tsx
export default function Home() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg,#7e22ce,#1d4ed8,#000)',
        color: '#fff',
        fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial',
        textAlign: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>✅ Index is rendering</div>
        <div style={{ fontSize: 14 }}>
          Try <a href="/api/__ping" style={{ color: '#fff', textDecoration: 'underline' }}>/api/__ping</a>
        </div>
      </div>
    </div>
  );
}
