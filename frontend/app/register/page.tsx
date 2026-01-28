'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'
import styles from './register.module.css'

export default function RegisterPage(): React.JSX.Element {
  const router = useRouter()
  const { register, token, isLoading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && token) {
      router.push('/dashboard')
    }
  }, [token, authLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const { firstName, lastName, email, password } = formData

    if (!firstName || !lastName || !email || !password) {
      setError('Proszę wypełnić wszystkie pola')
      return
    }

    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    setIsSubmitting(true)

    try {
      await register({ firstName, lastName, email, password })
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd rejestracji')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <main className={styles.registerPage}>
        <div className={styles.registerContainer}>
          <div className={styles.registerCard}>
            <div className={styles.registerForm}>
              <p className="text-center" role="status" aria-live="polite">Ładowanie...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <div className={styles.registerCard}>
          <header className={styles.registerHeader}>
            <h1 className={styles.logo}>Bank CDV</h1>
            <p className={styles.subtitle}>System zarządzania klientami</p>
          </header>

          <form onSubmit={handleSubmit} className={styles.registerForm} noValidate>
            <h2 className={styles.formTitle}>Rejestracja</h2>

            {error && (
              <div id="register-error" className={styles.errorMessage} role="alert">
                {error}
              </div>
            )}

            <div className={styles.formRow}>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  Imię
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jan"
                  autoComplete="given-name"
                  required
                  disabled={isSubmitting}
                  aria-invalid={error ? 'true' : undefined}
                  aria-describedby={error ? 'register-error' : undefined}
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
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Kowalski"
                  autoComplete="family-name"
                  required
                  disabled={isSubmitting}
                  aria-invalid={error ? 'true' : undefined}
                  aria-describedby={error ? 'register-error' : undefined}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adres e-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="jan.kowalski@example.com"
                autoComplete="email"
                required
                disabled={isSubmitting}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'register-error' : undefined}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Hasło
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 znaków"
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'register-error' : undefined}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Rejestracja...' : 'Zarejestruj się'}
            </button>
          </form>

          <footer className={styles.registerFooter}>
            <p>
              Masz już konto?{' '}
              <Link href="/login">Zaloguj się</Link>
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}
