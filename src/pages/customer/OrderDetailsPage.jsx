import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Check,
  CircleAlert,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getOrderById } from '../../services/orderService'
import './OrderDetailsPage.css'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0))
}

const formatDate = (date) => {
  if (!date) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

const statusSteps = [
  'PLACED',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
]

const OrderDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getOrderById(id)
        setOrder(data)
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load this order.'

        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  if (loading) {
    return (
      <section className="order-details-page">
        <div className="order-details-container">
          <div className="order-details-loading">
            <div className="order-details-skeleton order-details-skeleton--small" />
            <div className="order-details-skeleton order-details-skeleton--large" />
            <div className="order-details-skeleton" />
            <div className="order-details-skeleton" />
          </div>
        </div>
      </section>
    )
  }

  if (error || !order) {
    return (
      <section className="order-details-page">
        <div className="order-details-container">
          <div className="order-details-error">
            <CircleAlert size={28} aria-hidden="true" />

            <div>
              <h1>Order unavailable</h1>
              <p>
                {error || 'We could not find this order.'}
              </p>
            </div>
          </div>

          <Link
            to="/orders"
            className="order-details-back"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Back to orders
          </Link>
        </div>
      </section>
    )
  }

  const currentStatusIndex =
    statusSteps.indexOf(order.status)

  const isCancelled = order.status === 'CANCELLED'

  const itemCount = (order.items || []).reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  )

  return (
    <section className="order-details-page">
      <div className="order-details-container">
        <button
          type="button"
          className="order-details-back"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back to orders
        </button>

        <header className="order-details-header">
          <div>
            <p className="section-eyebrow">
              ORDER DETAILS
            </p>

            <h1>{order.orderNumber}</h1>

            <p>
              Placed on {formatDate(order.orderDate)}
            </p>
          </div>

          <span
            className={
              'order-details-status order-details-status--' +
              order.status.toLowerCase()
            }
          >
            {order.status}
          </span>
        </header>

        <div className="order-details-layout">
          <main className="order-details-main">
            <section className="order-details-card">
              <div className="order-details-card-header">
                <div>
                  <p className="section-eyebrow">
                    ORDER STATUS
                  </p>

                  <h2>
                    {isCancelled
                      ? 'Order cancelled'
                      : 'Order progress'}
                  </h2>
                </div>
              </div>

              {isCancelled ? (
                <div className="order-details-cancelled">
                  <CircleAlert
                    size={22}
                    aria-hidden="true"
                  />

                  <p>
                    This order has been cancelled.
                  </p>
                </div>
              ) : (
                <div className="order-details-progress">
                  {statusSteps.map((step, index) => {
                    const completed =
                      currentStatusIndex >= index

                    return (
                      <div
                        className="order-details-progress-step"
                        key={step}
                      >
                        <div
                          className={
                            'order-details-progress-marker' +
                            (completed
                              ? ' order-details-progress-marker--completed'
                              : '')
                          }
                        >
                          {completed && (
                            <Check
                              size={14}
                              strokeWidth={3}
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        <span
                          className={
                            completed
                              ? 'order-details-progress-label order-details-progress-label--active'
                              : 'order-details-progress-label'
                          }
                        >
                          {step}
                        </span>

                        {index < statusSteps.length - 1 && (
                          <div
                            className={
                              'order-details-progress-line' +
                              (currentStatusIndex > index
                                ? ' order-details-progress-line--completed'
                                : '')
                            }
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="order-details-card">
              <div className="order-details-card-header">
                <div>
                  <p className="section-eyebrow">
                    PURCHASED ITEMS
                  </p>

                  <h2>
                    {order.items?.length || 0}{' '}
                    {order.items?.length === 1
                      ? 'item'
                      : 'items'}
                  </h2>
                </div>
              </div>

              <div className="order-details-items">
                {(order.items || []).map((item) => (
                  <article
                    className="order-details-item"
                    key={item.productId}
                  >
                    <div className="order-details-item-info">
                      <h3>{item.productName}</h3>

                      <p>
                        Quantity: {item.quantity}
                      </p>

                      <p>
                        Unit price:{' '}
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>

                    <strong>
                      {formatCurrency(item.subtotal)}
                    </strong>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <aside className="order-details-summary">
            <div className="order-details-summary-card">
              <p className="section-eyebrow">
                ORDER SUMMARY
              </p>

              <div className="order-details-summary-row">
                <span>Items</span>
                <span>{itemCount}</span>
              </div>

              <div className="order-details-summary-row">
                <span>Order status</span>
                <span>{order.status}</span>
              </div>

              <div className="order-details-summary-divider" />

              <div className="order-details-summary-total">
                <span>Total</span>

                <strong>
                  {formatCurrency(order.totalAmount)}
                </strong>
              </div>
            </div>

            <Link
              to="/products"
              className="order-details-shop-button"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default OrderDetailsPage
