import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.js'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter your email and password.')
      return
    }

    try {
      setSubmitting(true)

      const profile = await login({
        email: formData.email.trim(),
        password: formData.password,
      })

      const requestedPath = location.state?.from

      if (requestedPath) {
        navigate(requestedPath, { replace: true })
        return
      }

      if (profile?.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
        return
      }

      navigate('/', { replace: true })
    } catch (loginError) {
      const message =
        loginError?.response?.data?.message ||
        'Invalid email or password. Please try again.'

      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-card__header">
          <p className="auth-card__eyebrow">Welcome back</p>

          <h1 id="login-title">Sign in to FITKART</h1>

          <p>
            Access your account, cart, and orders.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {error && (
            <div
              className="auth-form__error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="auth-form__field">
            <label htmlFor="login-email">
              Email address
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={submitting}
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="auth-form__submit"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-card__footer">
          <span>Don't have an account?</span>

          <Link to="/register">
            Create an account
          </Link>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
