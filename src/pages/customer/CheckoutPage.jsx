import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCart } from '../../services/cartService'
import { placeOrder } from '../../services/orderService'
import './CheckoutPage.css'

const CheckoutPage = () => {

  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        const response = await getCart()
        setCart(response)
        setError('')
      } catch {
        setError('Unable to load your cart.')
      } finally {
        setLoading(false)
      }
    }

    loadCheckout()
  }, [])

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true)
      setError('')

      const response = await placeOrder()

      setOrder(response)

      window.dispatchEvent(
        new Event('fitkart-cart-updated')
      )
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        'Unable to place your order. Please try again.'

      setError(message)
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="section-container">
          <div className="section-state">
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !cart) {
    return (
      <div className="checkout-page">
        <div className="section-container">
          <div className="section-state">
            <h1>Unable to load checkout</h1>
            <p>{error}</p>

            <Link
              to="/cart"
              className="checkout-state__link"
            >
              Return to cart
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (order) {
    return (
      <div className="checkout-page">
        <div className="section-container">
          <div className="checkout-success">
            <p className="section-eyebrow">
              ORDER CONFIRMED
            </p>

            <div className="checkout-success__icon">
              {'\u2713'}
            </div>

            <h1>Order placed successfully</h1>

            <p>
              Thank you for shopping with FITKART.
              Your order has been created successfully.
            </p>

            <div className="checkout-success__details">
              <div>
                <span>Order number</span>
                <strong>{order.orderNumber}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{order.status}</strong>
              </div>

              <div>
                <span>Total</span>
                <strong>
                  &#8377;
                  {Number(order.totalAmount).toLocaleString(
                    'en-IN'
                  )}
                </strong>
              </div>
            </div>

            <div className="checkout-success__actions">
              <Link
                to={`/orders/${order.orderId}`}
                className="checkout-success__primary"
              >
                View order
              </Link>

              <Link
                to="/products"
                className="checkout-success__secondary"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const items = cart?.items || []

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="section-container">
          <div className="checkout-empty">
            <p className="section-eyebrow">
              CHECKOUT
            </p>

            <h1>Your cart is empty</h1>

            <p>
              Add a fitness product to your cart before
              proceeding to checkout.
            </p>

            <Link
              to="/products"
              className="checkout-state__link"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="section-container">
        <div className="checkout-header">
          <div>
            <p className="section-eyebrow">
              CHECKOUT
            </p>

            <h1>Review your order</h1>

            <p>
              Check your items and total before placing
              your order.
            </p>
          </div>

          <Link
            to="/cart"
            className="checkout-header__back"
          >
            Back to cart
          </Link>
        </div>

        {error && (
          <div
            className="checkout-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="checkout-layout">
          <section className="checkout-items">
            <div className="checkout-card">
              <div className="checkout-card__header">
                <h2>Your items</h2>

                <span>
                  {items.length}{' '}
                  {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="checkout-item-list">
                {items.map((item) => (
                  <article
                    className="checkout-item"
                    key={item.id}
                  >
                    <div className="checkout-item__info">
                      <h3>{item.productName}</h3>

                      <p>
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <strong>
                      &#8377;
                      {Number(item.subtotal).toLocaleString(
                        'en-IN'
                      )}
                    </strong>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <aside className="checkout-summary">
            <p className="section-eyebrow">
              ORDER SUMMARY
            </p>

            <div className="checkout-summary__row">
              <span>Items</span>

              <strong>
                {items.reduce(
                  (total, item) =>
                    total + Number(item.quantity || 0),
                  0
                )}
              </strong>
            </div>

            <div className="checkout-summary__row">
              <span>Subtotal</span>

              <strong>
                &#8377;
                {Number(cart?.total || 0).toLocaleString(
                  'en-IN'
                )}
              </strong>
            </div>

            <div className="checkout-summary__divider" />

            <div className="checkout-summary__total">
              <span>Total</span>

              <strong>
                &#8377;
                {Number(cart?.total || 0).toLocaleString(
                  'en-IN'
                )}
              </strong>
            </div>

            <button
              type="button"
              className="checkout-summary__button"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder
                ? 'Placing order...'
                : 'Place order'}
            </button>

            <p className="checkout-summary__note">
              Your order will be processed using the
              current cart and available stock.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

