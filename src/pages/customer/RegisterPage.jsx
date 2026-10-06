import { useState } from 'react'
import { CircleAlert, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../../services/authService'

const RegisterPage = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    const fullName = form.fullName.trim()
    const email = form.email.trim()
    const phone = form.phone.trim()
    const password = form.password

    if (!fullName) {
      setError('Full name is required.')
      return
    }

    if (!email) {
      setError('Email address is required.')
      return
    }

    if (!phone) {
      setError('Phone number is required.')
      return
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(
        'Phone number must be 10 digits and start with 6-9.'
      )
      return
    }

    if (!password) {
      setError('Password is required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    try {
      setSaving(true)

      await registerUser({
        fullName,
        email,
        phone,
        password,
      })

      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          email,
        },
      })
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Unable to create your account.'

      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <section className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <UserPlus size={20} aria-hidden="true" />
            </div>

            <p className="section-eyebrow">FITKART ACCOUNT</p>

            <h1>Create your account</h1>

            <p>
              Create your customer account to shop fitness equipment,
              manage your cart, and track your orders.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Full name</span>

              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Enter your full name"
              />
            </label>

            <label className="auth-field">
              <span>Email address</span>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="Enter your email"
              />
            </label>

            <label className="auth-field">
              <span>Phone number</span>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                placeholder="10-digit phone number"
              />
            </label>

            <label className="auth-field">
              <span>Password</span>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Create a password"
              />
            </label>

            {error && (
              <div className="auth-message auth-message--error">
                <CircleAlert size={18} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="auth-primary-button"
              disabled={saving}
            >
              {saving ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>

            <Link to="/login">
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

export default RegisterPage
