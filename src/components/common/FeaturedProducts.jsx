import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import { getProductImages } from '../../services/productImageService'
import { API_BASE_URL } from '../../config/api'
import ProductCard from '../product/ProductCard.jsx'

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '')

const FeaturedProducts = () => {
  const [products, setProducts] = useState([])
  const [images, setImages] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getProducts()

        const productList = Array.isArray(response)
          ? response
          : response?.value || []

        setProducts(productList)

        const imageEntries = await Promise.all(
          productList.map(async (product) => {
            try {
              const response = await getProductImages(product.id)

              const productImages = Array.isArray(response)
                ? response
                : response?.value || []

              if (!productImages.length) {
                return [product.id, null]
              }

              const primaryImage =
                productImages.find((image) => image.isPrimary) ||
                productImages[0]

              if (!primaryImage?.imagePath) {
                return [product.id, null]
              }

              const imageUrl = primaryImage.imagePath.startsWith('http')
                ? primaryImage.imagePath
                : BACKEND_BASE_URL + primaryImage.imagePath

              return [product.id, imageUrl]
            } catch {
              return [product.id, null]
            }
          })
        )

        setImages(Object.fromEntries(imageEntries))
      } catch {
        setError('Unable to load products right now.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (loading) {
    return (
      <section className="featured-products">
        <div className="section-container">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">Shop FitKart</p>
              <h2>Featured equipment</h2>
            </div>
          </div>

          <div className="product-grid">
            <div className="product-card product-card--loading" />
            <div className="product-card product-card--loading" />
            <div className="product-card product-card--loading" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="featured-products">
        <div className="section-container">
          <div className="section-state">
            <h2>Featured equipment</h2>
            <p>{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (!products.length) {
    return (
      <section className="featured-products">
        <div className="section-container">
          <div className="section-state">
            <h2>Featured equipment</h2>
            <p>No products are available right now.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="featured-products">
      <div className="section-container">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">Shop FitKart</p>
            <h2>Featured equipment</h2>
          </div>

          <Link
            to="/products"
            className="section-link"
          >
            View all products
          </Link>
        </div>

        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              image={images[product.id]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
