import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import { getCategories } from '../../services/categoryService'
import { getProductImages } from '../../services/productImageService'
import { API_BASE_URL } from '../../config/api'
import ProductCard from '../../components/product/ProductCard.jsx'

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '')

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const searchFromUrl = searchParams.get('search') || ''
  const categoryFromUrl = searchParams.get('categoryId') || ''

  const [search, setSearch] = useState(searchFromUrl)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [images, setImages] = useState({})
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories()

        const categoryList = Array.isArray(response)
          ? response
          : response?.value || []

        setCategories(categoryList)
      } catch {
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')

        const params = {}

        if (searchFromUrl.trim()) {
          params.search = searchFromUrl.trim()
        }

        if (categoryFromUrl) {
          params.categoryId = categoryFromUrl
        }

        const response = await getProducts(params)

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
        setProducts([])
        setError('Unable to load products right now.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [searchFromUrl, categoryFromUrl])

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    const nextParams = {}

    if (search.trim()) {
      nextParams.search = search.trim()
    }

    if (categoryFromUrl) {
      nextParams.categoryId = categoryFromUrl
    }

    setSearchParams(nextParams)
  }

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value

    const nextParams = {}

    if (search.trim()) {
      nextParams.search = search.trim()
    }

    if (categoryId) {
      nextParams.categoryId = categoryId
    }

    setSearchParams(nextParams)
  }

  const clearFilters = () => {
    setSearch('')
    setSearchParams({})
  }

  const activeCategory = categories.find(
    (category) => String(category.id) === String(categoryFromUrl)
  )

  return (
    <div className="products-page">
      <div className="section-container">
        <header className="products-page__header">
          <div>
            <p className="section-eyebrow">Shop FitKart</p>
            <h1>Fitness equipment</h1>
            <p className="products-page__intro">
              Explore the equipment currently available in FitKart.
            </p>
          </div>
        </header>

        <div className="products-toolbar">
          <form
            className="products-search"
            onSubmit={handleSearchSubmit}
          >
            <label htmlFor="product-search">
              Search products
            </label>

            <div className="products-search__row">
              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search fitness equipment..."
              />

              <button type="submit">
                Search
              </button>
            </div>
          </form>

          <div className="products-filter">
            <label htmlFor="category-filter">
              Category
            </label>

            <select
              id="category-filter"
              value={categoryFromUrl}
              onChange={handleCategoryChange}
              disabled={categoriesLoading}
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="products-results-header">
          <div>
            <p className="products-results-header__count">
              {loading
                ? 'Loading products...'
                : `${products.length} ${
                    products.length === 1 ? 'product' : 'products'
                  }`}
            </p>

            {activeCategory && (
              <p className="products-results-header__filter">
                Category: {activeCategory.name}
              </p>
            )}
          </div>

          {(searchFromUrl || categoryFromUrl) && (
            <button
              type="button"
              className="products-clear"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading && (
          <div className="product-grid products-grid">
            <div className="product-card product-card--loading" />
            <div className="product-card product-card--loading" />
            <div className="product-card product-card--loading" />
            <div className="product-card product-card--loading" />
          </div>
        )}

        {!loading && error && (
          <div className="section-state products-state">
            <h2>Products unavailable</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && !products.length && (
          <div className="section-state products-state">
            <h2>No products found</h2>
            <p>
              Try a different search or category.
            </p>

            {(searchFromUrl || categoryFromUrl) && (
              <button
                type="button"
                className="products-state__action"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="product-grid products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                image={images[product.id]}
              />
            ))}
          </div>
        )}

        <div className="products-page__back">
          <Link to="/">
            <ArrowLeft size={16} aria-hidden="true" /> Back to FitKart home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
