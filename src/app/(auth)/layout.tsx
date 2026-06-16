export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const bars = [42, 58, 47, 65, 53, 70, 74, 90]

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F3F3F0' }}>
      <div
        className="w-full max-w-3xl flex rounded-2xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid #E8E8E2', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        {/* Left panel */}
        <div
          className="hidden md:flex flex-col p-8 w-[340px] flex-shrink-0"
          style={{ background: '#FAFAF8', borderRight: '1px solid #E8E8E2' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: '#F3F3F0' }}>
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <path d="M14 20 C14 20 6 17 6 10 C6 10 10 11 14 20Z" fill="#4CAF50" />
                <path d="M14 20 C14 20 22 17 22 10 C22 10 18 11 14 20Z" fill="#FFC107" />
                <path d="M14 20 C14 20 11 12 14 6 C14 6 17 12 14 20Z" fill="#8BC34A" />
                <rect x="13" y="20" width="2" height="4" rx="1" fill="#795548" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px', color: '#1A1A2E' }}>
              Flora
            </span>
          </div>

          {/* Headline */}
          <p style={{ fontSize: '26px', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.2, marginBottom: '12px' }}>
            Track habits.<br />Understand<br />
            <span style={{ color: '#3EC9A7' }}>yourself.</span>
          </p>

          {/* Subtitle */}
          <p style={{ fontSize: '12.5px', color: '#9EA5B3', lineHeight: 1.6, marginBottom: '24px' }}>
            A personal analytics platform that turns your{' '}
            <span style={{ color: '#3EC9A7' }}>daily habits</span>{' '}
            into meaningful data.
          </p>

          {/* Chart label */}
          <p style={{ fontSize: '10px', color: '#C4C4BC', marginBottom: '8px', letterSpacing: '0.2px' }}>
            Weekly completion — last 8 weeks
          </p>

          {/* Bar chart */}
          <div className="flex items-end gap-1.5 mb-4" style={{ height: '52px' }}>
            {bars.map((pct, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${pct}%`,
                  background:
                    i === bars.length - 1
                      ? '#3EC9A7'
                      : `rgba(62,201,167,${0.15 + (pct / 100) * 0.25})`,
                }}
              />
            ))}
          </div>

          {/* Stats */}
          <div
            className="flex rounded-xl overflow-hidden mb-5"
            style={{ border: '1px solid #E8E8E2' }}
          >
            {[
              { value: '82%', label: 'avg completion' },
              { value: '14', label: 'day streak' },
              { value: '4.2', label: 'mood avg', accent: true },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center py-2.5"
                style={{ borderRight: i < 2 ? '1px solid #E8E8E2' : undefined }}
              >
                <span
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: stat.accent ? '#3EC9A7' : '#1A1A2E',
                  }}
                >
                  {stat.value}
                </span>
                <span style={{ fontSize: '9.5px', color: '#9EA5B3', marginTop: '3px' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div
            style={{
              background: '#F3F3F0',
              borderRadius: '8px',
              borderLeft: '3px solid #E8E8E2',
              padding: '12px 14px',
            }}
          >
            <p style={{ fontSize: '11.5px', color: '#9EA5B3', fontStyle: 'italic', marginBottom: '4px' }}>
              &ldquo;What gets measured, gets managed.&rdquo;
            </p>
            <p style={{ fontSize: '10px', color: '#C4C4BC' }}>— Peter Drucker</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 p-8 flex flex-col justify-center min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
