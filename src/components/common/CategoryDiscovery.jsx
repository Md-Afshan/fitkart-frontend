import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../../services/categoryService'

const CategoryDiscovery = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getCategories()

        const categoryList = Array.isArray(response)
          ? response
          : response?.value || []

        setCategories(categoryList)
      } catch {
        setError('Unable to load categories right now.')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (loading) {
    return (
      <section className="category-discovery">
        <div className="section-container">
          <div className="category-discovery__heading">
            <div>
              <p className="section-eyebrow">Explore FitKart</p>
              <h2>Shop by category</h2>
            </div>
          </div>

          <div className="category-grid">
            <div className="category-card category-card--loading" />
            <div className="category-card category-card--loading" />
            <div className="category-card category-card--loading" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="category-discovery">
        <div className="section-container">
          <div className="section-state">
            <h2>Shop by category</h2>
            <p>{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (!categories.length) {
    return (
      <section className="category-discovery">
        <div className="section-container">
          <div className="section-state">
            <h2>Shop by category</h2>
            <p>No categories are available right now.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="category-discovery">
      <div className="section-container">
        <div className="category-discovery__heading">
          <div>
            <p className="section-eyebrow">Explore FitKart</p>
            <h2>Shop by category</h2>
          </div>

          <Link
            to="/products"
            className="section-link"
          >
            Browse all equipment
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?categoryId=${category.id}`}
              className="category-card"
            >
              <div className="category-card__content">
                <span className="category-card__number">
                  {String(category.id).padStart(2, '0')}
                </span>

                <div>
                  <h3>{category.name}</h3>

                  {category.description && (
                    <p>{category.description}</p>
                  )}
                </div>
              </div>

              <span className="category-card__arrow" aria-hidden="true">
                ?
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoryDiscovery
