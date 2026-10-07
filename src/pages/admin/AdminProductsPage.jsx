import { useEffect, useState } from 'react'
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../../services/categoryService'
import { deleteProduct, getProducts } from '../../services/productService'
import './AdminProductsPage.css'

const AdminProductsPage = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const loadProducts = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getProducts({
        search: search.trim() || undefined,
        categoryId: categoryId || undefined,
      })

      setProducts(Array.isArray(response) ? response : [])
    } catch {
      setError('Unable to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories()
        setCategories(Array.isArray(response) ? response : [])
      } catch {
        setCategories([])
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadCategoryProducts = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await getProducts({
          categoryId: categoryId || undefined,
        })

        if (!cancelled) {
          setProducts(
            Array.isArray(response) ? response : []
          )
        }
      } catch {
        if (!cancelled) {
          setError(
            'Unable to load products. Please try again.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadCategoryProducts()

    return () => {
      cancelled = true
    }
  }, [categoryId])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    loadProducts()
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${product.name}"?`
    )

    if (!confirmed) {
      return
    }

    setDeletingId(product.id)
    setError('')
    setSuccess('')

    try {
      await deleteProduct(product.id)

      setSuccess(
        `"${product.name}" was deactivated successfully.`
      )

      await loadProducts()
    } catch (deleteError) {
      setError(
        deleteError?.response?.data?.message ||
        deleteError?.response?.data?.error ||
        'Unable to delete the product. Please try again.'
      )
    } finally {
      setDeletingId(null)
    }
  }
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(price || 0))
  }

  const formatDate = (value) => {
    if (!value) {
      return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'admin-product-status--active'
      case 'OUT_OF_STOCK':
        return 'admin-product-status--out'
      case 'INACTIVE':
        return 'admin-product-status--inactive'
      case 'DISCONTINUED':
        return 'admin-product-status--discontinued'
      default:
        return ''
    }
  }

  return (
    <section className="admin-products-page">
      <div className="admin-page-heading admin-products-heading">
        <div>
          <p className="section-eyebrow">CATALOG</p>

          <h2>Products</h2>

          <p>
            Manage FITKART products, pricing, inventory,
            categories, and availability.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() => navigate('/admin/products/new')}
        >
          <Plus size={18} aria-hidden="true" />
          <span>Add product</span>
        </button>
      </div>

      <div className="admin-product-toolbar">
        <form
          className="admin-product-search"
          onSubmit={handleSearchSubmit}
        >
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products..."
            aria-label="Search products"
          />

          <button type="submit">
            Search
          </button>
        </form>

        <select
          value={categoryId}
          onChange={(event) =>
            setCategoryId(event.target.value)
          }
          aria-label="Filter by category"
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
          onClick={loadProducts}
          disabled={loading}
          aria-label="Refresh products"
          title="Refresh products"
        >
          <RefreshCw
            size={17}
            aria-hidden="true"
          />
        </button>
      </div>

      {(error || success) && (
        <div className="admin-feedback admin-feedback--error">
          {error || success}
        </div>
      )}

      <div className="admin-product-list-card">
        {loading ? (
          <div className="admin-product-loading">
            <div />
            <div />
            <div />
          </div>
        ) : products.length === 0 ? (
          <div className="admin-product-empty">
            <h3>No products found</h3>

            <p>
              There are no products matching the current
              search or category filter.
            </p>
          </div>
        ) : (
          <div className="admin-product-table-wrapper">
            <table className="admin-product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="admin-product-table__actions">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>{product.brand}</td>

                    <td>
                      {product.categoryName || '—'}
                    </td>

                    <td>
                      {formatPrice(product.price)}
                    </td>

                    <td>{product.stockQuantity}</td>

                    <td>
                      <span
                        className={`admin-product-status ${getStatusClass(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td>
                      {formatDate(product.updatedAt)}
                    </td>

                    <td>
                      <div className="admin-product-actions">
                        <button
                          type="button"
                          className="admin-table-action"
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          aria-label={`Edit ${product.name}`}
                          title={`Edit ${product.name}`}
                        >
                          <Pencil
                            size={16}
                            aria-hidden="true"
                          />
                        </button>

                        <button
                          type="button"
                          className="admin-table-action admin-table-action--danger"
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                          aria-label={`Delete ${product.name}`}
                          title={`Delete ${product.name}`}
                        >
                          <Trash2
                            size={16}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
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

export default AdminProductsPage






