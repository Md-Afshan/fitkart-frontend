import { useEffect, useState } from 'react'
import { Pencil, RefreshCw, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../../services/categoryService'
import { getProducts } from '../../services/productService'
import './AdminInventoryPage.css'

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  )
}

const getStockClass = (stockQuantity) => {
  if (stockQuantity === 0) {
    return 'admin-inventory-stock admin-inventory-stock--out'
  }

  if (stockQuantity <= 5) {
    return 'admin-inventory-stock admin-inventory-stock--low'
  }

  return 'admin-inventory-stock admin-inventory-stock--available'
}

const AdminInventoryPage = () => {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getProducts({
        search: search.trim() || undefined,
        categoryId: categoryId || undefined,
      })

      setProducts(Array.isArray(response) ? response : [])
    } catch (loadError) {
      setError(
        getErrorMessage(
          loadError,
          'Unable to load inventory.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadInitialData = async () => {
      try {
        const [productResponse, categoryResponse] =
          await Promise.all([
            getProducts(),
            getCategories(),
          ])

        if (!cancelled) {
          setProducts(
            Array.isArray(productResponse)
              ? productResponse
              : []
          )

          setCategories(
            Array.isArray(categoryResponse)
              ? categoryResponse
              : []
          )
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              loadError,
              'Unable to load inventory.'
            )
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    loadProducts()
  }

  const handleCategoryChange = (event) => {
    const value = event.target.value
    setCategoryId(value)

    setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const response = await getProducts({
          search: search.trim() || undefined,
          categoryId: value || undefined,
        })

        setProducts(Array.isArray(response) ? response : [])
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            'Unable to load inventory.'
          )
        )
      } finally {
        setLoading(false)
      }
    }, 0)
  }

  const handleRefresh = () => {
    loadProducts()
  }

  return (
    <section className="admin-inventory-page">
      <div className="admin-inventory-heading">
        <div>
          <p className="section-eyebrow">STOCK MANAGEMENT</p>
          <h2>Inventory</h2>
          <p>
            Monitor product stock levels and update inventory
            through product management.
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

      <div className="admin-inventory-toolbar">
        <form
          className="admin-inventory-search"
          onSubmit={handleSearchSubmit}
        >
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />

          <button type="submit" aria-label="Search inventory">
            <Search size={16} aria-hidden="true" />
            <span>Search</span>
          </button>
        </form>

        <select
          value={categoryId}
          onChange={handleCategoryChange}
          aria-label="Filter inventory by category"
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

        <button
          type="button"
          className="admin-icon-button"
          onClick={handleRefresh}
          aria-label="Refresh inventory"
          title="Refresh inventory"
        >
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="admin-inventory-list-card">
        {loading ? (
          <div className="admin-inventory-loading">
            <div />
            <div />
            <div />
            <div />
          </div>
        ) : products.length === 0 ? (
          <div className="admin-inventory-empty">
            <h3>No products found</h3>
            <p>
              Try changing your search or category filter.
            </p>
          </div>
        ) : (
          <div className="admin-inventory-table-wrapper">
            <table className="admin-inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="admin-inventory-table__actions">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <span>{product.brand}</span>
                    </td>

                    <td>
                      {product.categoryName || '—'}
                    </td>

                    <td>
                      ?{Number(product.price).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td>
                      <span className={getStockClass(product.stockQuantity)}>
                        {product.stockQuantity}
                      </span>
                    </td>

                    <td>
                      <span className="admin-inventory-status">
                        {product.status}
                      </span>
                    </td>

                    <td className="admin-inventory-table__actions">
                      <button
                        type="button"
                        className="admin-table-action"
                        onClick={() =>
                          navigate(
                            `/admin/products/edit/${product.id}`
                          )
                        }
                        aria-label={`Edit ${product.name}`}
                        title={`Edit ${product.name}`}
                      >
                        <Pencil
                          size={15}
                          aria-hidden="true"
                        />
                      </button>
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

export default AdminInventoryPage
