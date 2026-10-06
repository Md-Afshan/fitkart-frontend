import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const validate = () => {
    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!fullName) {
      return 'Full name is required.';
    }

    if (!email) {
      return 'Email is required.';
    }

    if (!phone) {
      return 'Phone number is required.';
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return 'Enter a valid 10-digit Indian phone number.';
    }

    if (!formData.password) {
      return 'Password is required.';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await registerUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      navigate('/login', {
        state: {
          registered: true,
          email: formData.email.trim(),
        },
      });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-layout">
        <section className="register-visual" aria-hidden="true">
          <div className="register-visual__grid" />

          <div className="register-visual__content">
            <span className="register-visual__eyebrow">
              FITKART / ACCOUNT
            </span>

            <h1>
              Build your
              <span> account.</span>
            </h1>

            <p>
              Create your FITKART account and keep your profile, cart, and
              orders connected in one place.
            </p>

            <div className="register-visual__line" />
          </div>
        </section>

        <section className="register-form-panel">
          <div className="register-form-wrapper">
            <header className="register-form-header">
              <span className="register-form-header__eyebrow">
                NEW CUSTOMER
              </span>

              <h2>Create your account</h2>

              <p>
                Enter your details below to get started.
              </p>
            </header>

            {error && (
              <div
                className="register-message register-message--error"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            <form
              className="register-form"
              onSubmit={handleSubmit}
              noValidate
              aria-busy={saving}
            >
              <div className="register-field">
                <label htmlFor="register-full-name">Full name</label>
                <input
                  id="register-full-name"
                  className="register-field__input"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="register-email">Email address</label>
                <input
                  id="register-email"
                  className="register-field__input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your-email-id@gmail.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="register-phone">Phone number</label>
                <input
                  id="register-phone"
                  className="register-field__input"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  className="register-field__input"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                className="register-submit"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="register-switch">
              <span>Already have an account?</span>
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default RegisterPage;
