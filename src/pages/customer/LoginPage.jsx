import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAdmin } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.')
      return
    }

    try {
      setLoading(true)
      setError('')

      await login({
        email: form.email.trim(),
        password: form.password,
      })

      const destination = location.state?.from

      if (destination) {
        navigate(destination, { replace: true })
      } else if (isAdmin) {
        navigate('/admin/dashboard', {
          replace: true,
        })
      } else {
        navigate('/', { replace: true })
      }
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Invalid email or password.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-visual">
          <div className="auth-visual__content">
            <Link
              to="/"
              className="auth-visual__logo"
            >
              FITKART
            </Link>

            <div>
              <p className="section-eyebrow">
                TRAIN WITH PURPOSE
              </p>

              <h1>
                Your training.
                <br />
                Your equipment.
                <br />
                Your way.
              </h1>

              <p>
                Sign in to manage your cart, orders,
                and FITKART account.
              </p>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <p className="section-eyebrow">
                WELCOME BACK
              </p>

              <h2>Sign in to FITKART</h2>

              <p>
                Enter your account details to continue.
              </p>
            </div>

            {error && (
              <div
                className="auth-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="auth-field">
                <label htmlFor="login-email">
                  Email address
                </label>

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">
                  Password
                </label>

                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? 'Signing in...'
                  : 'Sign in'}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
