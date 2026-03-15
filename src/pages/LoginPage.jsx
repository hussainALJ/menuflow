import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UtensilsCrossed, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, loading, user } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  // Already logged in
  if (user) {
    const home = { Admin: '/admin', Chef: '/chef', Cashier: '/cashier', Waiter: '/cashier' }
    navigate(home[user.role] || '/login', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const u = await login(form.username, form.password)
      toast.success(`Welcome back, ${u.username}`)
      const home = { Admin: '/admin', Chef: '/chef', Cashier: '/cashier', Waiter: '/cashier' }
      navigate(home[u.role] || '/admin')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-surface-950 via-surface-900 to-brand-950 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #d97320 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #d97320 0%, transparent 50%)`
          }}
        />
        <div className="absolute top-20 right-20 w-64 h-64 border border-brand-800/30 rounded-full" />
        <div className="absolute top-32 right-32 w-40 h-40 border border-brand-700/20 rounded-full" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-warm">
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          <span className="font-display text-2xl text-white">Sufra</span>
        </div>

        {/* Tagline */}
        <div className="relative">
          <h1 className="font-display text-5xl text-white leading-tight mb-4">
            The dining<br />
            <span className="text-brand-400 italic">experience,</span><br />
            reimagined.
          </h1>
          <p className="text-surface-400 text-base leading-relaxed max-w-sm">
            QR ordering, real-time kitchen display, and smart billing — all in one place.
          </p>
        </div>

        {/* Bottom note */}
        <p className="relative text-surface-600 text-xs">
          Staff portal — please sign in with your credentials
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <UtensilsCrossed size={14} className="text-white" />
            </div>
            <span className="font-display text-xl text-white">Sufra</span>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-1">Sign in</h2>
          <p className="text-surface-500 text-sm mb-8">Enter your staff credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="your_username"
                className="w-full px-4 py-3 bg-surface-900 border border-surface-700
                           rounded-xl text-sm text-white placeholder-surface-600
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-surface-900 border border-surface-700
                             rounded-xl text-sm text-white placeholder-surface-600
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                             transition-all duration-200 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700
                         text-white font-medium text-sm rounded-xl
                         transition-all duration-200 shadow-warm hover:shadow-warm-lg
                         disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
