import { useEffect, useState } from 'react'
import {
  Boxes,
  ClipboardList,
  Package,
  RefreshCw,
  Tags,
  Users,
} from 'lucide-react'
import { getCategories } from '../../services/categoryService'
import { getProducts } from '../../services/productService'
import { getAllOrders } from '../../services/adminOrderService'
import { getCustomers } from '../../services/adminCustomerService'
import './AdminDashboardPage.css'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const formatCurrency = (value) => {
  return currencyFormatter.format(Number(value || 0))
}

const formatDate = (value) => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return dateFormatter.format(date)
}

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    'Unable to load dashboard data.'
  )
}

const AdminDashboardPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const [
        productData,
        categoryData,
        customerData,
        orderData,
      ] = await Promise.all([
        getProducts(),
        getCategories(),
        getCustomers(),
        getAllOrders(),
      ])

      setProducts(Array.isArray(productData) ? productData : [])
      setCategories(Array.isArray(categoryData) ? categoryData : [])
      setCustomers(Array.isArray(customerData) ? customerData : [])
      setOrders(Array.isArray(orderData) ? orderData : [])
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadInitialDashboard = async () => {
      try {
        const [
          productData,
          categoryData,
          customerData,
          orderData,
        ] = await Promise.all([
          getProducts(),
          getCategories(),
          getCustomers(),
          getAllOrders(),
        ])

        if (cancelled) {
          return
        }

        setProducts(Array.isArray(productData) ? productData : [])
        setCategories(Array.isArray(categoryData) ? categoryData : [])
        setCustomers(Array.isArray(customerData) ? customerData : [])
      setOrders(Array.isArray(orderData) ? orderData : [])
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInitialDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  const activeProducts = products.filter(
    (product) => product.status === 'ACTIVE'
  ).length

  const outOfStockProducts = products.filter(
    (product) => product.status === 'OUT_OF_STOCK'
  ).length

  const totalInventoryUnits = products.reduce(
    (total, product) =>
      total + Number(product.stockQuantity || 0),
    0
  )

  const recentOrders = orders.slice(0, 5)

  const statCards = [
    {
      label: 'Products',
      value: products.length,
      icon: Package,
    },
    {
      label: 'Categories',
      value: categories.length,
      icon: Tags,
    },
    {
      label: 'Customers',
      value: customers.length,
      icon: Users,
    },
    {
      label: 'Orders',
      value: orders.length,
      icon: ClipboardList,
    },
  ]

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-heading">
        <div>
          <p className="section-eyebrow">OVERVIEW</p>
          <h2>Dashboard</h2>
          <p>
            Monitor FITKART products, inventory, customers,
            and orders from one place.
          </p>
        </div>

        <button
          type="button"
          className="admin-dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw
            size={15}
            aria-hidden="true"
          />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div
          className="admin-dashboard-feedback"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="admin-dashboard-stats">
        {statCards.map((stat) => {
          const Icon = stat.icon

          return (
            <article
              className="admin-dashboard-stat"
              key={stat.label}
            >
              <div className="admin-dashboard-stat__icon">
                <Icon
                  size={17}
                  aria-hidden="true"
                />
              </div>

              <div>
                <p>{stat.label}</p>
                <strong>
                  {loading ? '—' : stat.value}
                </strong>
              </div>
            </article>
          )
        })}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-panel__heading">
            <div>
              <p className="section-eyebrow">
                PRODUCT & INVENTORY
              </p>
              <h3>Store inventory</h3>
            </div>

            <Boxes
              size={18}
              aria-hidden="true"
            />
          </div>

          <div className="admin-dashboard-inventory">
            <div>
              <span>Active products</span>
              <strong>
                {loading ? '—' : activeProducts}
              </strong>
            </div>

            <div>
              <span>Out of stock</span>
              <strong>
                {loading ? '—' : outOfStockProducts}
              </strong>
            </div>

            <div>
              <span>Total units</span>
              <strong>
                {loading ? '—' : totalInventoryUnits}
              </strong>
            </div>
          </div>
        </section>

        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-panel__heading">
            <div>
              <p className="section-eyebrow">
                ORDER ACTIVITY
              </p>
              <h3>Recent orders</h3>
            </div>

            <ClipboardList
              size={18}
              aria-hidden="true"
            />
          </div>

          {loading ? (
            <div className="admin-dashboard-orders-loading">
              <div />
              <div />
              <div />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="admin-dashboard-empty">
              <p>No orders available yet.</p>
            </div>
          ) : (
            <div className="admin-dashboard-orders">
              {recentOrders.map((order) => (
                <div
                  className="admin-dashboard-order"
                  key={order.orderId}
                >
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <span>
                      {formatDate(order.orderDate)}
                    </span>
                  </div>

                  <div className="admin-dashboard-order__amount">
                    <strong>
                      {formatCurrency(order.totalAmount)}
                    </strong>

                    <span
                      className={
                        'admin-dashboard-order__status ' +
                        'admin-dashboard-order__status--' +
                        String(order.status || '')
                          .toLowerCase()
                      }
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default AdminDashboardPage
