"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (form.password !== form.confirm) { setError("Passwords do not match"); return }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return }
    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Registration failed")
      setLoading(false)
      return
    }

    await signIn("credentials", { email: form.email, password: form.password, redirect: false })
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E2] p-6 shadow-card">
      <h1 className="font-display font-bold text-xl text-ink mb-1">Create your account</h1>
      <p className="text-[13px] text-muted mb-6">Start your habit journey today</p>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-white hover:bg-surface transition-colors text-[13px] font-medium text-ink mb-4"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#E8E8E2]" />
        <span className="text-[11px] text-ghost font-medium">or</span>
        <div className="flex-1 h-px bg-[#E8E8E2]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input label="Full name" placeholder="Alex Chen" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
        <Input label="Password" type="password" placeholder="At least 8 characters" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="new-password" />
        <Input label="Confirm password" type="password" placeholder="Repeat password" value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
        {error && <p className="text-xs text-coral bg-coral/8 px-3 py-2 rounded-lg">{error}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-[#E8E8E2]">
        <p className="text-[12px] text-muted text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-sage font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
