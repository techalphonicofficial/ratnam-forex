export default function Loading() {
  return (
    <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#f9fafb' }}>
      <div className="container py-5">
        <div style={{
          width: '100%',
          height: '400px',
          background: '#e5e7eb',
          borderRadius: '16px',
          marginBottom: '32px',
          animation: 'pulse 1.5s infinite'
        }} />
        <div className="row">
          <div className="col-lg-8">
            <div style={{
              width: '80%',
              height: '48px',
              background: '#e5e7eb',
              borderRadius: '8px',
              marginBottom: '24px',
              animation: 'pulse 1.5s infinite'
            }} />
            <div style={{
              width: '60%',
              height: '24px',
              background: '#e5e7eb',
              borderRadius: '8px',
              marginBottom: '32px',
              animation: 'pulse 1.5s infinite'
            }} />
            <div style={{
              width: '100%',
              height: '200px',
              background: '#e5e7eb',
              borderRadius: '12px',
              marginBottom: '24px',
              animation: 'pulse 1.5s infinite'
            }} />
          </div>
          <div className="col-lg-4">
            <div style={{
              width: '100%',
              height: '350px',
              background: '#e5e7eb',
              borderRadius: '16px',
              animation: 'pulse 1.5s infinite'
            }} />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
