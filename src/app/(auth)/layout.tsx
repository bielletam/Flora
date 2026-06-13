export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="white"/>
              <path d="M14 20 C14 20 6 17 6 10 C6 10 10 11 14 20Z" fill="#4CAF50"/>
              <path d="M14 20 C14 20 22 17 22 10 C22 10 18 11 14 20Z" fill="#FFC107"/>
              <path d="M14 20 C14 20 11 12 14 6 C14 6 17 12 14 20Z" fill="#8BC34A"/>
              <rect x="13" y="20" width="2" height="4" rx="1" fill="#795548"/>
            </svg>
            <span className="font-display font-bold text-lg text-ink tracking-[-0.4px]">MINDBLOOM</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
