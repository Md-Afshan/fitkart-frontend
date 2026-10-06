import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProductById } from '../../services/productService'
import { getProductImages } from '../../services/productImageService'
import { addCartItem } from '../../services/cartService'
import { API_BASE_URL } from '../../config/api'
import { useAuth } from '../../context/AuthContext.js'
import './ProductDetailsPage.css'

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '')

const ProductDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)

  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [error, setError] = useState('')
  const [cartMessage, setCartMessage] = useState('')

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError('')
        setCartMessage('')

        const productResponse = await getProductById(id)
        setProduct(productResponse)

        const imageResponse = await getProductImages(id)

        const productImages = Array.isArray(imageResponse)
          ? imageResponse
          : imageResponse?.value || []

        const imageUrls = productImages
          .filter((image) => image?.imagePath)
          .map((image) => ({
            id: image.id,
            isPrimary: image.isPrimary,
            url: image.imagePath.startsWith('http')
              ? image.imagePath
              : BACKEND_BASE_URL + image.imagePath,
          }))

        setImages(imageUrls)

        const primaryImage =
          imageUrls.find((image) => image.isPrimary) ||
          imageUrls[0]

        setSelectedImage(primaryImage?.url || '')
      } catch {
        setProduct(null)
        setImages([])
        setSelectedImage('')
        setError('Unable to load this product.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const isOutOfStock = product
    ? product.stockQuantity <= 0
    : false

  const increaseQuantity = () => {
    if (!product || quantity >= product.stockQuantity) {
      return
    }

    setQuantity((currentQuantity) => currentQuantity + 1)
  }

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity - 1)
    )
  }

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) {
      return
    }

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: `/products/${product.id}`,
        },
      })

      return
    }

    try {
      setAddingToCart(true)
      setCartMessage('')

      await addCartItem({
        productId: product.id,
        quantity,
      })

      setCartMessage('Added to cart.')
      window.dispatchEvent(new Event('fitkart-cart-updated'))
    } catch {
      setCartMessage(
        'Unable to add this product to your cart.'
      )
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="section-container">
          <div className="product-details-loading">
            <div className="product-details-loading__image" />
            <div className="product-details-loading__content" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="section-container">
          <div className="section-state">
            <h1>Product unavailable</h1>
            <p>
              {error || 'This product could not be found.'}
            </p>

            <Link
              to="/products"
              className="product-details-state__link"
            >
            <span aria-hidden="true">&lt;</span> Back to products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="product-details-page">
      <div className="section-container">
        <div className="product-details__back">
          <Link to="/products">
            <span aria-hidden="true">&lt;</span> Back to products
          </Link>
        </div>

        <div className="product-details">
          <div className="product-details__gallery">
            <div className="product-details__main-image">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                />
              ) : (
                <div className="product-details__image-placeholder">
                  No image available
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-details__thumbnails">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    className={
                      image.url === selectedImage
                        ? 'product-details__thumbnail product-details__thumbnail--active'
                        : 'product-details__thumbnail'
                    }
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <img
                      src={image.url}
                      alt=""
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-details__content">
            <p className="section-eyebrow">
              {product.categoryName}
            </p>

            <h1>{product.name}</h1>

            {product.brand && (
              <p className="product-details__brand">
                {product.brand}
              </p>
            )}

            <p className="product-details__price">
              {String.fromCharCode(8377)}{Number(product.price).toLocaleString('en-IN')}
            </p>

            <div className="product-details__availability">
              {isOutOfStock ? (
                <span className="product-details__out-of-stock">
                  Out of stock
                </span>
              ) : (
                <span className="product-details__in-stock">
                  In stock
                </span>
              )}
            </div>

            {product.description && (
              <div className="product-details__description">
                <h2>About this product</h2>
                <p>{product.description}</p>
              </div>
            )}

            {!isOutOfStock && (
              <div className="product-details__purchase">
                <div className="product-details__quantity">
                  <span>Quantity</span>

                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={
                        quantity >= product.stockQuantity
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="product-details__add"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart
                    ? 'Adding...'
                    : 'Add to cart'}
                </button>

                {cartMessage && (
                  <p
                    className={
                      cartMessage === 'Added to cart.'
                        ? 'product-details__cart-message product-details__cart-message--success'
                        : 'product-details__cart-message'
                    }
                  >
                    {cartMessage}
                  </p>
                )}
              </div>
            )}

            {isOutOfStock && (
              <div className="product-details__unavailable">
                This product is currently unavailable for purchase.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage
