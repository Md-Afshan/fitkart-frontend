import { useEffect, useState } from 'react'
import {
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserRound,
} from 'lucide-react'
import { getCustomers } from '../../services/adminCustomerService'
import './AdminCustomersPage.css'

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  )
}

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCustomers = async (searchValue = '') => {
    setLoading(true)
    setError('')

    try {
      const response = await getCustomers({
        search: searchValue.trim() || undefined,
      })

      setCustomers(Array.isArray(response) ? response : [])
    } catch (loadError) {
      setError(
        getErrorMessage(
          loadError,
          'Unable to load customers.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadInitialCustomers = async () => {
      try {
        const response = await getCustomers()

        if (!cancelled) {
          setCustomers(Array.isArray(response) ? response : [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              loadError,
              'Unable to load customers.'
            )
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInitialCustomers()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    loadCustomers(search)
  }

  const handleRefresh = () => {
    loadCustomers(search)
  }

  return (
    <section className="admin-customers-page">
      <div className="admin-customers-heading">
        <div>
          <p className="section-eyebrow">CUSTOMER MANAGEMENT</p>
          <h2>Customers</h2>
          <p>
            View registered FITKART customers and their account details.
          </p>
        </div>
      </div>

      {error && (
        <div
          className="admin-feedback admin-feedback--error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="admin-customers-toolbar">
        <form
          className="admin-customers-search"
          onSubmit={handleSearchSubmit}
        >
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers..."
            aria-label="Search customers"
          />

          <button type="submit">
            <Search size={16} aria-hidden="true" />
            <span>Search</span>
          </button>
        </form>

        <button
          type="button"
          className="admin-icon-button"
          onClick={handleRefresh}
          aria-label="Refresh customers"
          title="Refresh customers"
        >
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="admin-customers-list-card">
        {loading ? (
          <div className="admin-customers-loading">
            <div />
            <div />
            <div />
            <div />
          </div>
        ) : customers.length === 0 ? (
          <div className="admin-customers-empty">
            <UserRound size={28} aria-hidden="true" />
            <h3>No customers found</h3>
            <p>
              Try changing your search or check again later.
            </p>
          </div>
        ) : (
          <div className="admin-customers-table-wrapper">
            <table className="admin-customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="admin-customer-identity">
                        <div className="admin-customer-avatar">
                          <UserRound
                            size={15}
                            aria-hidden="true"
                          />
                        </div>

                        <div>
                          <strong>{customer.fullName}</strong>
                          <span>Customer #{customer.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-customer-contact">
                        <Mail size={14} aria-hidden="true" />
                        {customer.email}
                      </span>
                    </td>

                    <td>
                      <span className="admin-customer-contact">
                        <Phone size={14} aria-hidden="true" />
                        {customer.phone}
                      </span>
                    </td>

                    <td>
                      <span className="admin-customer-role">
                        {customer.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminCustomersPage
