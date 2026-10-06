import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

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

    if (error) {
      setError('')
    }
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

      const profile = await login({
        email: form.email.trim(),
        password: form.password,
      })

      const destination = location.state?.from

      if (destination) {
        navigate(destination, { replace: true })
      } else if (profile?.role === 'ADMIN') {
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
    <main className="login-page">
      <div className="login-layout">
        <section className="login-visual" aria-hidden="true">
          <div className="login-visual__grid" />

          <div className="login-visual__content">
            <Link
              to="/"
              className="login-visual__logo"
              tabIndex={-1}
            >
              FITKART
            </Link>

            <div className="login-visual__copy">
              <span className="login-visual__eyebrow">
                TRAIN WITH PURPOSE
              </span>

              <h1>
                Your training.
                <br />
                Your equipment.
                <br />
                <span>Your way.</span>
              </h1>

              <p>
                Sign in to manage your cart, orders,
                and FITKART account.
              </p>

              <div className="login-visual__line" />
            </div>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="login-form-wrapper">
            <header className="login-form-header">
              <span className="login-form-header__eyebrow">
                WELCOME BACK
              </span>

              <h2>Sign in to FITKART</h2>

              <p>
                Enter your account details to continue.
              </p>
            </header>

            {error && (
              <div
                className="login-message login-message--error"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            <form
              className="login-form"
              onSubmit={handleSubmit}
              noValidate
              aria-busy={loading}
            >
              <div className="login-field">
                <label htmlFor="login-email">
                  Email address
                </label>

                <input
                  id="login-email"
                  className="login-field__input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your-email-id@gmail.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="login-password">
                  Password
                </label>

                <input
                  id="login-password"
                  className="login-field__input"
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
                className="login-submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="login-switch">
              <span>Don't have an account?</span>
              <Link to="/register">
                Create one
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
