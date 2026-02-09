'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'
import { getProfile, getBalance, updateProfile, type User, type BalanceResponse } from '@/lib/api'
import styles from './dashboard.module.css'

function formatCurrency(amount: string, currency: string): string {
  const numAmount = parseFloat(amount)
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
  }).format(numAmount)
}

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter()
  const { user: authUser, token, isLoading: authLoading, logout } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState<BalanceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [editError, setEditError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login')
    }
  }, [token, authLoading, router])

  // Fetch user data and balance
  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [userData, balanceData] = await Promise.all([
          getProfile(),
          getBalance(),
        ])
        setUser(userData)
        setBalance(balanceData)
        setEditForm({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nie udało się pobrać danych')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEditError('')

    if (!editForm.firstName || !editForm.lastName || !editForm.email) {
      setEditError('Wszystkie pola są wymagane')
      return
    }

    setIsSaving(true)

    try {
      const updatedUser = await updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
      })
      setUser(updatedUser)
      setIsEditing(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Nie udało się zapisać zmian')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })
    }
    setEditError('')
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Show loading while checking auth
  if (authLoading || (!token && !authUser)) {
    return (
      <div className={styles.page}>
        <main className={`container ${styles.main}`}>
          <div className="card">
            <p className="text-center" role="status" aria-live="polite">Ładowanie...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <a href="#main-content" className={styles.skipLink}>
        Przejdź do głównej treści
      </a>

      <nav className={styles.navbar} aria-label="Nawigacja główna">
        <div className={`container ${styles.navContent}`}>
          <Link href="/" className={styles.navLogo}>
            <span className={styles.navLogoIcon}>CB</span>
            CDV Banking
          </Link>
          <div className={styles.navLinks}>
            <Link href="/dashboard" className={styles.navLink} aria-current="page">
              Dashboard
            </Link>
            <Link href="/users" className={styles.navLink}>
              Klienci
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={styles.navButton}
            >
              Wyloguj
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content" className={`container ${styles.main}`}>
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>
              Witaj, {user?.firstName || authUser?.firstName || 'użytkowniku'}!
            </p>
          </div>
        </header>

        {error && (
          <div className={styles.errorAlert} role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="card">
            <p className="text-center" role="status" aria-live="polite">Ładowanie danych...</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* Balance Card */}
            <section className={`card ${styles.balanceCard}`} aria-labelledby="balance-title">
              <h2 id="balance-title" className={styles.cardTitle}>Dostępne środki</h2>
              {balance ? (
                <>
                  <p className={styles.balanceAmount}>
                    {formatCurrency(balance.accountBalance, balance.currency)}
                  </p>
                  <p className={styles.balanceLabel}>Saldo konta głównego</p>
                </>
              ) : (
                <p className={styles.noData}>Brak danych o saldzie</p>
              )}
            </section>

            {/* Profile Card */}
            <section className={`card ${styles.profileCard}`} aria-labelledby="profile-title">
              <div className={styles.cardHeader}>
                <h2 id="profile-title" className={styles.cardTitle}>Twój profil</h2>
                {!isEditing && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edytuj
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleEditSubmit} noValidate>
                  {editError && (
                    <div id="edit-error" className={styles.errorMessage} role="alert">
                      {editError}
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      Imię
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-input"
                      value={editForm.firstName}
                      onChange={handleEditChange}
                      autoComplete="given-name"
                      required
                      disabled={isSaving}
                      aria-invalid={editError ? 'true' : undefined}
                      aria-describedby={editError ? 'edit-error' : undefined}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Nazwisko
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-input"
                      value={editForm.lastName}
                      onChange={handleEditChange}
                      autoComplete="family-name"
                      required
                      disabled={isSaving}
                      aria-invalid={editError ? 'true' : undefined}
                      aria-describedby={editError ? 'edit-error' : undefined}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      value={editForm.email}
                      onChange={handleEditChange}
                      autoComplete="email"
                      required
                      disabled={isSaving}
                      aria-invalid={editError ? 'true' : undefined}
                      aria-describedby={editError ? 'edit-error' : undefined}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </button>
                  </div>
                </form>
              ) : user ? (
                <dl className={styles.profileList}>
                  <div className={styles.profileItem}>
                    <dt>Imię</dt>
                    <dd>{user.firstName}</dd>
                  </div>
                  <div className={styles.profileItem}>
                    <dt>Nazwisko</dt>
                    <dd>{user.lastName}</dd>
                  </div>
                  <div className={styles.profileItem}>
                    <dt>E-mail</dt>
                    <dd>{user.email}</dd>
                  </div>
                  <div className={styles.profileItem}>
                    <dt>Data rejestracji</dt>
                    <dd>{new Date(user.createdAt).toLocaleDateString('pl-PL')}</dd>
                  </div>
                </dl>
              ) : (
                <p className={styles.noData}>Brak danych użytkownika</p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
