'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'
import styles from './login.module.css'

export default function LoginPage(): React.JSX.Element {
  const router = useRouter()
  const { login, token, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && token) {
      router.push('/dashboard')
    }
  }, [token, authLoading, router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Proszę wypełnić wszystkie pola')
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd logowania')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <main className={styles.loginPage}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginForm}>
              <p className="text-center" role="status" aria-live="polite">Ładowanie...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <header className={styles.loginHeader}>
            <div className={styles.logoIcon}>CB</div>
            <h1 className={styles.logo}>CDV Banking</h1>
            <p className={styles.subtitle}>System zarządzania klientami</p>
          </header>

          <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
            <h2 className={styles.formTitle}>Zaloguj się do systemu</h2>

            {error && (
              <div id="login-error" className={styles.errorMessage} role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adres e-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan.kowalski@example.com"
                autoComplete="email"
                required
                disabled={isSubmitting}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'login-error' : undefined}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wprowadź hasło"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Autoryzacja...' : 'Zaloguj się'}
            </button>
          </form>

          <footer className={styles.loginFooter}>
            <p className="mb-1">
              Nie masz konta?{' '}
              <Link href="/register">Utwórz konto</Link>
            </p>
            <Link href="/users" className={styles.demoLink}>
              Demo: Panel użytkowników
            </Link>
          </footer>
        </div>

        <p className={styles.securityNote}>
          &#128274; Połączenie szyfrowane SSL/TLS
        </p>
      </div>
    </main>
  )
}
