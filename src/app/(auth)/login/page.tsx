"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A2E', marginBottom: '4px' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '13px', color: '#9EA5B3' }}>
          No account?{' '}
          <Link href="/register" style={{ color: '#3EC9A7', fontWeight: 500 }}>
            Sign up free
          </Link>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl p-1 mb-5" style={{ background: '#F3F3F0' }}>
        <div
          className="flex-1 py-2 text-center rounded-lg text-sm font-medium"
          style={{ background: '#fff', color: '#1A1A2E', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          Sign in
        </div>
        <Link
          href="/register"
          className="flex-1 py-2 text-center rounded-lg text-sm font-medium"
          style={{ color: '#9EA5B3' }}
        >
          Create account
        </Link>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl transition-colors mb-4"
        style={{ border: '1px solid #E8E8E2', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#1A1A2E' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: '#E8E8E2' }} />
        <span style={{ fontSize: '11px', color: '#C4C4BC', fontWeight: 500 }}>or</span>
        <div className="flex-1 h-px" style={{ background: '#E8E8E2' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          autoComplete="email"
        />

        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="current-password"
            className="pr-14"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
            style={{ color: '#9EA5B3' }}
          >
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="flex justify-end">
          <Link href="#" style={{ fontSize: '12px', color: '#9EA5B3' }}>
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="text-xs text-coral bg-coral/8 px-3 py-2 rounded-lg">{error}</p>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign in
        </Button>
      </form>

      <p className="text-center mt-5" style={{ fontSize: '11px', color: '#C4C4BC' }}>
        By continuing you agree to our{' '}
        <Link href="#" style={{ color: '#9EA5B3' }}>Terms</Link>
        {' '}and{' '}
        <Link href="#" style={{ color: '#9EA5B3' }}>Privacy Policy</Link>.
      </p>
    </>
  )
}
