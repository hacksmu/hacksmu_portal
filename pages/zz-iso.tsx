export default function ZZISO() {
  return (
    <iframe
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, zIndex: 2147483647 }}
      srcDoc={`<!doctype html><html><head><meta charset="utf-8"><title>ZZ ISO</title>
      <style>html,body{height:100%;margin:0}body{display:grid;place-items:center;background:linear-gradient(135deg,#22c55e,#0ea5e9);font:16px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#0b1221}</style>
      </head><body><div style="font-size:28px;font-weight:800;margin-bottom:8px">✅ ZZ ISO is visible</div><div>Global CSS cannot affect this.</div></body></html>`}
    />
  );
}
