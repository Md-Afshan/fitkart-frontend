import { useEffect, useState } from 'react'
import { CircleAlert, Check, LockKeyhole, UserRound } from 'lucide-react'
import './ProfilePage.css'
import {
  getProfile,
  updateProfile,
  changePassword,
} from '../../services/userService'

const ProfilePage = () => {
  const [profile, setProfile] = useState(null)

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  })

  const [loading, setLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setProfileError('')

        const data = await getProfile()

        setProfile(data)

        setProfileForm({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
        })
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load your profile.'

        setProfileError(message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleProfileChange = (event) => {
    const { name, value } = event.target

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()

    setProfileMessage('')
    setProfileError('')

    const fullName = profileForm.fullName.trim()
    const phone = profileForm.phone.trim()

    if (!fullName) {
      setProfileError('Full name is required.')
      return
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setProfileError(
        'Phone number must be 10 digits and start with 6-9.'
      )
      return
    }

    try {
      setProfileSaving(true)

      const updatedProfile = await updateProfile({
        fullName,
        phone,
      })

      setProfile(updatedProfile)

      setProfileForm({
        fullName: updatedProfile.fullName || '',
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || '',
      })

      setProfileMessage('Profile updated successfully.')
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Unable to update your profile.'

      setProfileError(message)
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()

    setPasswordMessage('')
    setPasswordError('')

    const currentPassword = passwordForm.currentPassword
    const newPassword = passwordForm.newPassword

    if (!currentPassword) {
      setPasswordError('Current password is required.')
      return
    }

    if (!newPassword) {
      setPasswordError('New password is required.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        'New password must be different from your current password.'
      )
      return
    }

    try {
      setPasswordSaving(true)

      await changePassword({
        currentPassword,
        newPassword,
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
      })

      setPasswordMessage('Password changed successfully.')
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Unable to change your password.'

      setPasswordError(message)
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <div className="profile-skeleton profile-skeleton--title" />
            <div className="profile-skeleton" />
            <div className="profile-skeleton" />
            <div className="profile-skeleton profile-skeleton--large" />
          </div>
        </div>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="profile-page">
        <div className="profile-container">
          <div className="profile-error">
            <CircleAlert size={24} aria-hidden="true" />

            <div>
              <h1>Profile unavailable</h1>
              <p>
                {profileError || 'Unable to load your profile.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <div>
            <p className="section-eyebrow">ACCOUNT</p>

            <h1>Your profile</h1>

            <p>
              Manage your personal information and account security.
            </p>
          </div>

          <div className="profile-role">
            {profile.role}
          </div>
        </header>

        <div className="profile-layout">
          <main className="profile-main">
            <section className="profile-card">
              <div className="profile-card-heading">
                <div className="profile-card-icon">
                  <UserRound size={20} aria-hidden="true" />
                </div>

                <div>
                  <p className="section-eyebrow">
                    PERSONAL INFORMATION
                  </p>

                  <h2>Account details</h2>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="profile-form-grid">
                  <label className="profile-field">
                    <span>Full name</span>

                    <input
                      type="text"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      autoComplete="name"
                    />
                  </label>

                  <label className="profile-field">
                    <span>Email address</span>

                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      disabled
                      readOnly
                    />

                    <small>
                      Email cannot be changed.
                    </small>
                  </label>

                  <label className="profile-field profile-field--full">
                    <span>Phone number</span>

                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                    />
                  </label>
                </div>

                {profileError && (
                  <div className="profile-message profile-message--error">
                    <CircleAlert size={18} aria-hidden="true" />
                    <span>{profileError}</span>
                  </div>
                )}

                {profileMessage && (
                  <div className="profile-message profile-message--success">
                    <Check size={18} aria-hidden="true" />
                    <span>{profileMessage}</span>
                  </div>
                )}

                <div className="profile-form-actions">
                  <button
                    type="submit"
                    className="profile-primary-button"
                    disabled={profileSaving}
                  >
                    {profileSaving ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            </section>

            <section className="profile-card">
              <div className="profile-card-heading">
                <div className="profile-card-icon">
                  <LockKeyhole size={20} aria-hidden="true" />
                </div>

                <div>
                  <p className="section-eyebrow">
                    ACCOUNT SECURITY
                  </p>

                  <h2>Change password</h2>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="profile-form-grid">
                  <label className="profile-field profile-field--full">
                    <span>Current password</span>

                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                    />
                  </label>

                  <label className="profile-field profile-field--full">
                    <span>New password</span>

                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                    />
                  </label>
                </div>

                {passwordError && (
                  <div className="profile-message profile-message--error">
                    <CircleAlert size={18} aria-hidden="true" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordMessage && (
                  <div className="profile-message profile-message--success">
                    <Check size={18} aria-hidden="true" />
                    <span>{passwordMessage}</span>
                  </div>
                )}

                <div className="profile-form-actions">
                  <button
                    type="submit"
                    className="profile-primary-button"
                    disabled={passwordSaving}
                  >
                    {passwordSaving
                      ? 'CHANGING...'
                      : 'CHANGE PASSWORD'}
                  </button>
                </div>
              </form>
            </section>
          </main>

          <aside className="profile-side">
            <div className="profile-side-card">
              <p className="section-eyebrow">ACCOUNT</p>

              <h2>{profile.fullName}</h2>

              <p>{profile.email}</p>

              <div className="profile-side-divider" />

              <div className="profile-side-row">
                <span>Account type</span>
                <strong>{profile.role}</strong>
              </div>

              <div className="profile-side-row">
                <span>Phone</span>
                <strong>
                  {profile.phone || 'Not provided'}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
