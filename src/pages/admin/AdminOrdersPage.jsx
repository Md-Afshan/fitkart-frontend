import { useEffect, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Package,
  RefreshCw,
  Search,
} from 'lucide-react'
import { getAllOrders, updateOrderStatus } from '../../services/adminOrderService'
import './AdminOrdersPage.css'


const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  )
}

const getNextStatuses = (status) => {
  if (status === 'PLACED') {
    return ['CONFIRMED', 'CANCELLED']
  }

  if (status === 'CONFIRMED') {
    return ['SHIPPED', 'CANCELLED']
  }

  if (status === 'SHIPPED') {
    return ['DELIVERED']
  }

  return []
}

const formatDate = (date) => {
  if (!date) {
    return '—'
  }

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatPrice = (amount) => {
  return `?${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadOrders = async (searchValue = search) => {
    setLoading(true)
    setError('')

    try {
      const response = await getAllOrders({
        search: searchValue.trim() || undefined,
      })

      setOrders(Array.isArray(response) ? response : [])
    } catch (loadError) {
      setError(
        getErrorMessage(
          loadError,
          'Unable to load orders.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadInitialOrders = async () => {
      try {
        const response = await getAllOrders()

        if (!cancelled) {
          setOrders(Array.isArray(response) ? response : [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              loadError,
              'Unable to load orders.'
            )
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInitialOrders()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    loadOrders()
  }

  const handleRefresh = () => {
    loadOrders()
  }

  const handleToggleOrder = (orderId) => {
    setExpandedOrderId((current) =>
      current === orderId ? null : orderId
    )
  }

  const handleStatusChange = async (order, newStatus) => {
    if (!newStatus || newStatus === order.status) {
      return
    }

    setUpdatingOrderId(order.orderId)
    setError('')
    setSuccess('')

    try {
      const updatedOrder = await updateOrderStatus(
        order.orderId,
        { status: newStatus }
      )

      setOrders((current) =>
        current.map((currentOrder) =>
          currentOrder.orderId === order.orderId
            ? updatedOrder
            : currentOrder
        )
      )

      setSuccess(
        `Order ${order.orderNumber} updated to ${newStatus}.`
      )
    } catch (updateError) {
      setError(
        getErrorMessage(
          updateError,
          'Unable to update the order status.'
        )
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <section className="admin-orders-page">
      <div className="admin-orders-heading">
        <div>
          <p className="section-eyebrow">ORDER MANAGEMENT</p>
          <h2>Orders</h2>
          <p>
            Review customer orders and manage their fulfillment status.
          </p>
        </div>
      </div>

      {error && (
        <div
          className="admin-feedback admin-feedback--error"
          role="alert"
        >
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="admin-feedback admin-feedback--success"
          role="status"
        >
          <span>{success}</span>
        </div>
      )}

      <div className="admin-orders-toolbar">
        <form
          className="admin-orders-search"
          onSubmit={handleSearchSubmit}
        >
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search orders..."
            aria-label="Search orders"
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
          aria-label="Refresh orders"
          title="Refresh orders"
        >
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="admin-orders-list-card">
        {loading ? (
          <div className="admin-orders-loading">
            <div />
            <div />
            <div />
            <div />
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-orders-empty">
            <Package size={28} aria-hidden="true" />
            <h3>No orders found</h3>
            <p>
              Try changing your search or check again later.
            </p>
          </div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="admin-orders-table__actions">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const nextStatuses = getNextStatuses(order.status)
                  const isExpanded =
                    expandedOrderId === order.orderId
                  const isUpdating =
                    updatingOrderId === order.orderId

                  return (
                    <tr
                      key={order.orderId}
                      className={
                        isExpanded
                          ? 'admin-orders-row admin-orders-row--expanded'
                          : 'admin-orders-row'
                      }
                    >
                      <td colSpan={isExpanded ? 6 : 1}>
                        {!isExpanded ? (
                          <div className="admin-orders-main-row">
                            <div className="admin-orders-order">
                              <strong>{order.orderNumber}</strong>
                              <span>#{order.orderId}</span>
                            </div>

                            <div>
                              {formatDate(order.orderDate)}
                            </div>

                            <div>
                              {order.items?.length || 0}
                            </div>

                            <div className="admin-orders-total">
                              {formatPrice(order.totalAmount)}
                            </div>

                            <div>
                              <select
                                value=""
                                onChange={(event) =>
                                  handleStatusChange(
                                    order,
                                    event.target.value
                                  )
                                }
                                disabled={
                                  isUpdating ||
                                  nextStatuses.length === 0
                                }
                                aria-label={`Update status for ${order.orderNumber}`}
                              >
                                <option value="">
                                  {isUpdating
                                    ? 'Updating...'
                                    : order.status}
                                </option>

                                {nextStatuses.map((status) => (
                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="admin-orders-table__actions">
                              <button
                                type="button"
                                className="admin-table-action"
                                onClick={() =>
                                  handleToggleOrder(order.orderId)
                                }
                                aria-label={`View ${order.orderNumber}`}
                                title={`View ${order.orderNumber}`}
                              >
                                <ChevronDown
                                  size={16}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="admin-orders-expanded">
                            <div className="admin-orders-expanded__header">
                              <div>
                                <strong>{order.orderNumber}</strong>
                                <span>
                                  {formatDate(order.orderDate)}
                                </span>
                              </div>

                              <button
                                type="button"
                                className="admin-table-action"
                                onClick={() =>
                                  handleToggleOrder(order.orderId)
                                }
                                aria-label={`Collapse ${order.orderNumber}`}
                                title="Collapse order"
                              >
                                <ChevronUp
                                  size={16}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>

                            <div className="admin-orders-items">
                              {order.items?.map((item) => (
                                <div
                                  key={item.productId}
                                  className="admin-orders-item"
                                >
                                  <div>
                                    <strong>
                                      {item.productName}
                                    </strong>
                                    <span>
                                      Qty: {item.quantity}
                                    </span>
                                  </div>

                                  <div>
                                    <span>
                                      {formatPrice(item.unitPrice)} ×{' '}
                                      {item.quantity}
                                    </span>
                                    <strong>
                                      {formatPrice(item.subtotal)}
                                    </strong>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="admin-orders-expanded__footer">
                              <div>
                                <span>Order total</span>
                                <strong>
                                  {formatPrice(order.totalAmount)}
                                </strong>
                              </div>

                              <div className="admin-orders-expanded__status">
                                <span>Update status</span>

                                <select
                                  value=""
                                  onChange={(event) =>
                                    handleStatusChange(
                                      order,
                                      event.target.value
                                    )
                                  }
                                  disabled={
                                    isUpdating ||
                                    nextStatuses.length === 0
                                  }
                                >
                                  <option value="">
                                    {isUpdating
                                      ? 'Updating...'
                                      : nextStatuses.length === 0
                                        ? order.status
                                        : 'Select status'}
                                  </option>

                                  {nextStatuses.map((status) => (
                                    <option
                                      key={status}
                                      value={status}
                                    >
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {!isExpanded && (
                        <>
                          <td />
                          <td />
                          <td />
                          <td />
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminOrdersPage

