import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from '../../services/cartService'
import { getProductImages } from '../../services/productImageService'
import { API_BASE_URL } from '../../config/api'
import './CartPage.css'

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '')

const CartPage = () => {
  const [cart, setCart] = useState(null)
  const [productImages, setProductImages] = useState({})
  const [loading, setLoading] = useState(true)
  const [updatingItem, setUpdatingItem] = useState(null)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const loadCart = async () => {
    try {
      const response = await getCart()
      const items = response?.items || []

      const imageEntries = await Promise.all(
        items.map(async (item) => {
          try {
            const imageResponse = await getProductImages(item.productId)

            const images = Array.isArray(imageResponse)
              ? imageResponse
              : imageResponse?.value || []

            const primaryImage =
              images.find((image) => image?.isPrimary) ||
              images[0]

            if (!primaryImage?.imagePath) {
              return [item.productId, '']
            }

            const imageUrl = primaryImage.imagePath.startsWith('http')
              ? primaryImage.imagePath
              : BACKEND_BASE_URL + primaryImage.imagePath

            return [item.productId, imageUrl]
          } catch {
            return [item.productId, '']
          }
        })
      )

      setCart(response)
      setProductImages(Object.fromEntries(imageEntries))
      setError('')
    } catch {
      setError('Unable to load your cart.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadInitialCart = async () => {
      try {
        const response = await getCart()
        const items = response?.items || []

        const imageEntries = await Promise.all(
          items.map(async (item) => {
            try {
              const imageResponse = await getProductImages(
                item.productId
              )

              const images = Array.isArray(imageResponse)
                ? imageResponse
                : imageResponse?.value || []

              const primaryImage =
                images.find((image) => image?.isPrimary) ||
                images[0]

              if (!primaryImage?.imagePath) {
                return [item.productId, '']
              }

              const imageUrl =
                primaryImage.imagePath.startsWith('http')
                  ? primaryImage.imagePath
                  : BACKEND_BASE_URL + primaryImage.imagePath

              return [item.productId, imageUrl]
            } catch {
              return [item.productId, '']
            }
          })
        )

        setCart(response)
        setProductImages(Object.fromEntries(imageEntries))
        setError('')
      } catch {
        setError('Unable to load your cart.')
      } finally {
        setLoading(false)
      }
    }

    loadInitialCart()
  }, [])

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) {
      return
    }

    try {
      setUpdatingItem(item.id)
      setActionError('')

      const updatedCart = await updateCartItem(item.id, {
        quantity: newQuantity,
      })

      setCart(updatedCart)
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        'Unable to update this quantity.'

      setActionError(message)
    } finally {
      setUpdatingItem(null)
    }
  }

  const handleRemove = async (item) => {
    try {
      setUpdatingItem(item.id)
      setActionError('')

      await removeCartItem(item.id)

      const updatedCart = await getCart()
      setCart(updatedCart)

      setProductImages((currentImages) => {
        const nextImages = { ...currentImages }
        delete nextImages[item.productId]
        return nextImages
      })
    } catch {
      setActionError('Unable to remove this item from your cart.')
    } finally {
      setUpdatingItem(null)
    }
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="section-container">
          <div className="section-state">
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="section-container">
          <div className="section-state">
            <h1>Unable to load cart</h1>
            <p>{error}</p>

            <button
              type="button"
              className="cart-state__button"
              onClick={() => {
                setLoading(true)
                loadCart()
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const items = cart?.items || []

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="section-container">
          <div className="cart-empty">
            <p className="section-eyebrow">YOUR CART</p>

            <h1>Your cart is empty</h1>

            <p>
              Browse our fitness equipment and add something to your cart.
            </p>

            <Link
              to="/products"
              className="cart-empty__link"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="section-container">
        <div className="cart-header">
          <div>
            <p className="section-eyebrow">YOUR CART</p>

            <h1>Shopping Cart</h1>
          </div>

          <p className="cart-header__count">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {actionError && (
          <div
            className="cart-action-error"
            role="alert"
          >
            {actionError}
          </div>
        )}

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => {
              const isUpdating = updatingItem === item.id
              const imageUrl = productImages[item.productId]

              return (
                <article
                  className="cart-item"
                  key={item.id}
                >
                  <Link
                    to={`/products/${item.productId}`}
                    className="cart-item__image"
                    aria-label={`View ${item.productName}`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.productName}
                      />
                    ) : (
                      <span>No image</span>
                    )}
                  </Link>

                  <div className="cart-item__details">
                    <p className="cart-item__category">
                      FITKART
                    </p>

                    <Link
                      to={`/products/${item.productId}`}
                      className="cart-item__name"
                    >
                      {item.productName}
                    </Link>

                    <p className="cart-item__price">
                      &#8377;
                      {Number(item.price).toLocaleString('en-IN')}
                    </p>

                    <div className="cart-item__controls">
                      <div className="cart-item__quantity">
                        <span>Quantity</span>

                        <div className="cart-item__quantity-control">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              isUpdating ||
                              item.quantity <= 1
                            }
                            aria-label={`Decrease quantity of ${item.productName}`}
                          >
                            -
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                item.quantity + 1
                              )
                            }
                            disabled={isUpdating}
                            aria-label={`Increase quantity of ${item.productName}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="cart-item__remove"
                        onClick={() => handleRemove(item)}
                        disabled={isUpdating}
                      >
                        {isUpdating
                          ? 'Updating...'
                          : 'Remove'}
                      </button>
                    </div>
                  </div>

                  <div className="cart-item__subtotal">
                    <span>Subtotal</span>

                    <strong>
                      &#8377;
                      {Number(item.subtotal).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="cart-summary">
            <p className="section-eyebrow">
              ORDER SUMMARY
            </p>

            <div className="cart-summary__row">
              <span>Subtotal</span>

              <strong>
                &#8377;
                {Number(cart?.total || 0).toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="cart-summary__divider" />

            <div className="cart-summary__total">
              <span>Total</span>

              <strong>
                &#8377;
                {Number(cart?.total || 0).toLocaleString('en-IN')}
              </strong>
            </div>

            <Link
              to="/checkout"
              className="cart-summary__checkout"
            >
              Proceed to checkout
            </Link>

            <Link
              to="/products"
              className="cart-summary__continue"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CartPage
