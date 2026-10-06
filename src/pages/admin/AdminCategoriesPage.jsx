import { useEffect, useState } from 'react'
import {
  Check,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../services/categoryService'
import './AdminCategoriesPage.css'

const emptyForm = {
  name: '',
  description: '',
}

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  )
}

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadCategories = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getCategories()
      setCategories(Array.isArray(response) ? response : [])
    } catch (loadError) {
      setError(
        getErrorMessage(
          loadError,
          'Unable to load categories. Please try again.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadInitialCategories = async () => {
      try {
        const response = await getCategories()

        if (!cancelled) {
          setCategories(
            Array.isArray(response) ? response : []
          )
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              loadError,
              'Unable to load categories. Please try again.'
            )
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInitialCategories()

    return () => {
      cancelled = true
    }
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setError('')
    setSuccess('')
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const name = form.name.trim()
    const description = form.description.trim()

    if (!name) {
      setError('Category name is required.')
      return
    }

    if (name.length > 100) {
      setError('Category name must not exceed 100 characters.')
      return
    }

    if (description.length > 255) {
      setError(
        'Category description must not exceed 255 characters.'
      )
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        await updateCategory(editingId, {
          name,
          description,
        })

        setSuccess('Category updated successfully.')
      } else {
        await createCategory({
          name,
          description,
        })

        setSuccess('Category created successfully.')
      }

      resetForm()
      await loadCategories()
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          editingId
            ? 'Unable to update the category.'
            : 'Unable to create the category.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id)

    setForm({
      name: category.name || '',
      description: category.description || '',
    })

    setError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setDeletingId(category.id)
    setError('')
    setSuccess('')

    try {
      await deleteCategory(category.id)

      if (editingId === category.id) {
        resetForm()
      }

      setSuccess('Category deleted successfully.')
      await loadCategories()
    } catch (deleteError) {
      setError(
        getErrorMessage(
          deleteError,
          'Unable to delete the category.'
        )
      )
    } finally {
      setDeletingId(null)
    }
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

  return (
    <section className="admin-categories-page">
      <div className="admin-page-heading admin-categories-heading">
        <div>
          <p className="section-eyebrow">CATALOG</p>

          <h2>Categories</h2>

          <p>
            Create and maintain the product categories used
            throughout FITKART.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() => {
            resetForm()
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            })
          }}
        >
          <Plus size={18} aria-hidden="true" />
          <span>Add category</span>
        </button>
      </div>

      {(error || success) && (
        <div
          className={`admin-feedback ${
            error
              ? 'admin-feedback--error'
              : 'admin-feedback--success'
          }`}
          role="status"
        >
          {error ? (
            <X size={17} aria-hidden="true" />
          ) : (
            <Check size={17} aria-hidden="true" />
          )}

          <span>{error || success}</span>
        </div>
      )}

      <div className="admin-category-form-card">
        <div className="admin-section-header">
          <div>
            <p className="admin-section-label">
              {editingId ? 'EDIT CATEGORY' : 'NEW CATEGORY'}
            </p>

            <h3>
              {editingId
                ? 'Update category'
                : 'Add a category'}
            </h3>
          </div>

          {editingId && (
            <button
              type="button"
              className="admin-text-button"
              onClick={resetForm}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Cancel edit
            </button>
          )}
        </div>

        <form
          className="admin-category-form"
          onSubmit={handleSubmit}
        >
          <div className="admin-form-field">
            <label htmlFor="category-name">
              Category name
            </label>

            <input
              id="category-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleInputChange}
              maxLength={100}
              placeholder="e.g. Dumbbells"
              disabled={saving}
            />

            <span>
              {form.name.length}/100
            </span>
          </div>

          <div className="admin-form-field">
            <label htmlFor="category-description">
              Description
            </label>

            <input
              id="category-description"
              name="description"
              type="text"
              value={form.description}
              onChange={handleInputChange}
              maxLength={255}
              placeholder="Optional category description"
              disabled={saving}
            />

            <span>
              {form.description.length}/255
            </span>
          </div>

          <button
            type="submit"
            className="admin-primary-button"
            disabled={saving}
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check size={18} aria-hidden="true" />
                <span>
                  {editingId
                    ? 'Save changes'
                    : 'Create category'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="admin-category-list-card">
        <div className="admin-section-header">
          <div>
            <p className="admin-section-label">
              CATEGORY LIST
            </p>

            <h3>
              {categories.length} categor
              {categories.length === 1 ? 'y' : 'ies'}
            </h3>
          </div>

          <button
            type="button"
            className="admin-icon-button"
            onClick={loadCategories}
            disabled={loading}
            aria-label="Refresh categories"
            title="Refresh categories"
          >
            <RotateCcw
              size={17}
              aria-hidden="true"
            />
          </button>
        </div>

        {loading ? (
          <div className="admin-category-loading">
            <div />
            <div />
            <div />
          </div>
        ) : categories.length === 0 ? (
          <div className="admin-category-empty">
            <div className="admin-category-empty__icon">
              <Plus size={22} aria-hidden="true" />
            </div>

            <h3>No categories yet</h3>

            <p>
              Create the first product category to start
              organizing the FITKART catalog.
            </p>

            <button
              type="button"
              className="admin-primary-button"
              onClick={() => {
                resetForm()

                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              }}
            >
              <Plus size={18} aria-hidden="true" />
              <span>Add category</span>
            </button>
          </div>
        ) : (
          <div className="admin-category-table-wrapper">
            <table className="admin-category-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th className="admin-category-table__actions">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                    </td>

                    <td>
                      <span className="admin-category-description">
                        {category.description || '—'}
                      </span>
                    </td>

                    <td>
                      {formatDate(category.createdAt)}
                    </td>

                    <td>
                      {formatDate(category.updatedAt)}
                    </td>

                    <td>
                      <div className="admin-category-actions">
                        <button
                          type="button"
                          className="admin-table-action"
                          onClick={() =>
                            handleEdit(category)
                          }
                          disabled={
                            saving ||
                            deletingId === category.id
                          }
                          aria-label={`Edit ${category.name}`}
                          title={`Edit ${category.name}`}
                        >
                          <Pencil
                            size={16}
                            aria-hidden="true"
                          />
                        </button>

                        <button
                          type="button"
                          className="admin-table-action admin-table-action--danger"
                          onClick={() =>
                            handleDelete(category)
                          }
                          disabled={
                            saving ||
                            deletingId === category.id
                          }
                          aria-label={`Delete ${category.name}`}
                          title={`Delete ${category.name}`}
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

export default AdminCategoriesPage

