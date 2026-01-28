'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import styles from './users.module.css'

interface BankUser {
  id: number
  firstName: string
  lastName: string
  email: string
  balance: number
}

// Mock data for demonstration
const initialUsers: BankUser[] = [
  { id: 1, firstName: 'Jan', lastName: 'Kowalski', email: 'jan.kowalski@example.com', balance: 15420.50 },
  { id: 2, firstName: 'Anna', lastName: 'Nowak', email: 'anna.nowak@example.com', balance: 8750.00 },
  { id: 3, firstName: 'Piotr', lastName: 'Wiśniewski', email: 'piotr.wisniewski@example.com', balance: 23100.75 },
  { id: 4, firstName: 'Maria', lastName: 'Dąbrowska', email: 'maria.dabrowska@example.com', balance: 450.20 },
  { id: 5, firstName: 'Krzysztof', lastName: 'Lewandowski', email: 'k.lewandowski@example.com', balance: 67890.00 },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(amount)
}

function getBalanceBadgeClass(balance: number): string {
  if (balance >= 10000) return 'badge badge-success'
  if (balance >= 1000) return 'badge badge-warning'
  return 'badge badge-danger'
}

export default function UsersPage() {
  const [users, setUsers] = useState<BankUser[]>(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<BankUser | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    balance: '',
  })

  const modalRef = useRef<HTMLDialogElement>(null)
  const triggerButtonRef = useRef<HTMLButtonElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isModalOpen && firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [isModalOpen])

  const openAddModal = () => {
    setEditingUser(null)
    setFormData({ firstName: '', lastName: '', email: '', password: '', balance: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (user: BankUser) => {
    setEditingUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      balance: user.balance.toString(),
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    triggerButtonRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUser) {
      // Update existing user
      setUsers(users.map(u =>
        u.id === editingUser.id
          ? { ...u, firstName: formData.firstName, lastName: formData.lastName, email: formData.email, balance: parseFloat(formData.balance) || 0 }
          : u
      ))
    } else {
      // Add new user
      const newUser: BankUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        balance: parseFloat(formData.balance) || 0,
      }
      setUsers([...users, newUser])
    }

    closeModal()
  }

  const handleDelete = (userId: number) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  return (
    <div className={styles.page}>
      <a href="#main-content" className={styles.skipLink}>
        Przejdź do głównej treści
      </a>
      <nav className={styles.navbar} aria-label="Nawigacja główna">
        <div className={`container ${styles.navContent}`}>
          <Link href="/" className={styles.navLogo}>
            Bank CDV
          </Link>
          <div className={styles.navLinks}>
            <Link href="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            <Link href="/users" className={styles.navLink} aria-current="page">
              Użytkownicy (demo)
            </Link>
            <Link href="/login" className={styles.navLink}>
              Logowanie
            </Link>
            <Link href="/register" className={styles.navLink}>
              Rejestracja
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content" className={`container ${styles.main}`}>
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Zarządzanie klientami</h1>
            <p className={styles.pageSubtitle}>Lista wszystkich klientów banku</p>
          </div>
          <button
            ref={triggerButtonRef}
            type="button"
            className="btn btn-primary"
            onClick={openAddModal}
            aria-haspopup="dialog"
          >
            + Dodaj klienta
          </button>
        </header>

        <section className="card" aria-label="Lista klientów banku">
          <div className="table-container">
            <table className="table">
              <caption className="sr-only">Lista klientów banku z możliwością edycji i usuwania</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Imię</th>
                  <th scope="col">Nazwisko</th>
                  <th scope="col">E-mail</th>
                  <th scope="col">Stan konta</th>
                  <th scope="col">
                    <span className="sr-only">Akcje</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getBalanceBadgeClass(user.balance)}>
                        {formatCurrency(user.balance)}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(user)}
                          aria-label={`Edytuj ${user.firstName} ${user.lastName}`}
                        >
                          Edytuj
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(user.id)}
                          aria-label={`Usuń ${user.firstName} ${user.lastName}`}
                        >
                          Usuń
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <p className={styles.emptyState}>Brak klientów do wyświetlenia</p>
          )}
        </section>
      </main>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={closeModal}
          aria-hidden="true"
        >
          <dialog
            ref={modalRef}
            className={styles.modal}
            open
            aria-labelledby="modal-title"
            aria-modal="true"
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <h2 id="modal-title" className={styles.modalTitle}>
                {editingUser ? 'Edytuj klienta' : 'Dodaj nowego klienta'}
              </h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Zamknij modal"
              >
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  Imię
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Nazwisko
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="userEmail" className="form-label">
                  E-mail
                </label>
                <input
                  type="email"
                  id="userEmail"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="userPassword" className="form-label">
                  {editingUser ? 'Nowe hasło (opcjonalne)' : 'Hasło'}
                </label>
                <input
                  type="password"
                  id="userPassword"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="balance" className="form-label">
                  Stan konta (PLN)
                </label>
                <input
                  type="number"
                  id="balance"
                  className="form-input"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Anuluj
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Zapisz zmiany' : 'Dodaj klienta'}
                </button>
              </div>
            </form>
          </dialog>
        </div>
      )}
    </div>
  )
}
