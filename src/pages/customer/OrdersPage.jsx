import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../../services/orderService'
import './OrdersPage.css'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await getMyOrders()

        setOrders(Array.isArray(response) ? response : [])
        setError('')
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          'Unable to load your orders.'

        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="orders-page">
        <div className="section-container">
          <div className="section-state">
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="section-container">
          <div className="section-state">
            <p className="section-eyebrow">
              MY ORDERS
            </p>

            <h1>Unable to load orders</h1>

            <p>{error}</p>

            <Link
              to="/products"
              className="orders__primary-link"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="section-container">
          <div className="orders__empty">
            <p className="section-eyebrow">
              MY ORDERS
            </p>

            <h1>No orders yet</h1>

            <p>
              Your completed purchases will appear here.
            </p>

            <Link
              to="/products"
              className="orders__primary-link"
            >
              Start shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="section-container">
        <div className="orders__header">
          <div>
            <p className="section-eyebrow">
              MY ORDERS
            </p>

            <h1>Your orders</h1>

            <p>
              View your previous purchases and their
              current status.
            </p>
          </div>

          <Link
            to="/products"
            className="orders__header-link"
          >
            Continue shopping
          </Link>
        </div>

        <div className="orders__list">
          {orders.map((order) => {
            const formattedDate = order.orderDate
              ? new Date(
                  order.orderDate
                ).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '—'

            const itemCount = (order.items || []).reduce(
              (total, item) =>
                total + Number(item.quantity || 0),
              0
            )

            return (
              <article
                className="orders__card"
                key={order.orderId}
              >
                <div className="orders__card-main">
                  <div>
                    <p className="orders__label">
                      ORDER NUMBER
                    </p>

                    <h2>{order.orderNumber}</h2>
                  </div>

                  <span className="orders__status">
                    {order.status}
                  </span>
                </div>

                <div className="orders__card-details">
                  <div>
                    <span>Date</span>

                    <strong>{formattedDate}</strong>
                  </div>

                  <div>
                    <span>Items</span>

                    <strong>{itemCount}</strong>
                  </div>

                  <div>
                    <span>Total</span>

                    <strong>
                      &#8377;
                      {Number(
                        order.totalAmount || 0
                      ).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="orders__card-action">
                  <Link
                    to={`/orders/${order.orderId}`}
                    className="orders__view-link"
                  >
                    View order
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OrdersPage
