import { useEffect, useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCategories } from '../../services/categoryService'
import {
  createProduct,
  getProductById,
  updateProduct,
} from '../../services/productService'
import {
  addProductImage,
  deleteProductImage,
  getProductImages,
} from '../../services/productImageService'
import './AdminProductFormPage.css'

const initialForm = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  brand: '',
  status: 'ACTIVE',
  categoryId: '',
}

const productStatuses = [
  'ACTIVE',
  'OUT_OF_STOCK',
  'INACTIVE',
  'DISCONTINUED',
]

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  )
}

const AdminProductFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [form, setForm] = useState(initialForm)
  const [categories, setCategories] = useState([])

  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProduct, setLoadingProduct] = useState(isEditMode)
  const [saving, setSaving] = useState(false)

  const [productImages, setProductImages] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [isPrimary, setIsPrimary] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadCategories = async () => {
      try {
        const response = await getCategories()

        if (!cancelled) {
          setCategories(Array.isArray(response) ? response : [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              loadError,
              'Unable to load categories.'
            )
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false)
        }
      }
    }

    loadCategories()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isEditMode) {
      return undefined
    }

    let cancelled = false

    const loadProduct = async () => {
      setLoadingProduct(true)
      setError('')

      try {
        const product = await getProductById(id)

        if (!cancelled) {
          setForm({
            name: product.name || '',
            description: product.description || '',
            price: product.price ?? '',
            stockQuantity: product.stockQuantity ?? '',
            brand: product.brand || '',
            status: product.status || 'ACTIVE',
            categoryId: product.categoryId
              ? String(product.categoryId)
              : '',
          })
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              loadError,
              'Unable to load the product.'
            )
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingProduct(false)
        }
      }
    }

    loadProduct()

    return () => {
      cancelled = true
    }
  }, [id, isEditMode])

  useEffect(() => {
    if (!isEditMode) {
      return undefined
    }

    let cancelled = false

    const loadImages = async () => {
      setLoadingImages(true)

      try {
        const response = await getProductImages(id)

        if (!cancelled) {
          setProductImages(Array.isArray(response) ? response : [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              loadError,
              'Unable to load product images.'
            )
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingImages(false)
        }
      }
    }

    loadImages()

    return () => {
      cancelled = true
    }
  }, [id, isEditMode])
  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setError('')
    setSuccess('')
  }

  const handleImageUpload = async () => {
    if (!selectedFile || !isEditMode) {
      return
    }

    setUploadingImage(true)
    setError('')
    setSuccess('')

    try {
      const image = await addProductImage({
        file: selectedFile,
        productId: id,
        isPrimary,
      })

      setProductImages((current) => [...current, image])
      setSelectedFile(null)
      setIsPrimary(false)
      setSuccess('Product image uploaded successfully.')
    } catch (uploadError) {
      setError(
        getErrorMessage(
          uploadError,
          'Unable to upload the product image.'
        )
      )
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageDelete = async (imageId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product image?'
    )

    if (!confirmed) {
      return
    }

    setDeletingImageId(imageId)
    setError('')
    setSuccess('')

    try {
      await deleteProductImage(imageId)

      setProductImages((current) =>
        current.filter((image) => image.id !== imageId)
      )

      setSuccess('Product image deleted successfully.')
    } catch (deleteError) {
      setError(
        getErrorMessage(
          deleteError,
          'Unable to delete the product image.'
        )
      )
    } finally {
      setDeletingImageId(null)
    }
  }
  const handleSubmit = async (event) => {
    event.preventDefault()

    const name = form.name.trim()
    const description = form.description.trim()
    const brand = form.brand.trim()
    const price = Number(form.price)
    const stockQuantity = Number(form.stockQuantity)
    const categoryId = Number(form.categoryId)

    if (!name) {
      setError('Product name is required.')
      return
    }

    if (name.length > 150) {
      setError(
        'Product name must not exceed 150 characters.'
      )
      return
    }

    if (!description) {
      setError('Product description is required.')
      return
    }

    if (!brand) {
      setError('Product brand is required.')
      return
    }

    if (brand.length > 100) {
      setError(
        'Product brand must not exceed 100 characters.'
      )
      return
    }

    if (
      form.price === '' ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError('Product price must be 0 or greater.')
      return
    }

    if (
      form.stockQuantity === '' ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setError(
        'Stock quantity must be a whole number of 0 or greater.'
      )
      return
    }

    if (!categoryId) {
      setError('Please select a category.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const productData = {
      name,
      description,
      price,
      stockQuantity,
      brand,
      status: form.status,
      categoryId,
    }

    try {
      if (isEditMode) {
        await updateProduct(id, productData)
        setSuccess('Product updated successfully.')
      } else {
        await createProduct(productData)
        setSuccess('Product created successfully.')
      }

      setTimeout(() => {
        navigate('/admin/products')
      }, 500)
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          isEditMode
            ? 'Unable to update the product.'
            : 'Unable to create the product.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  const pageTitle = isEditMode
    ? 'Edit product'
    : 'Add product'

  const pageDescription = isEditMode
    ? 'Update the product details, pricing, inventory, category, and availability.'
    : 'Add a product to the FITKART catalog with its pricing, inventory, category, and availability.'

  const submitLabel = saving
    ? isEditMode
      ? 'Updating...'
      : 'Creating...'
    : isEditMode
      ? 'Update product'
      : 'Create product'

  return (
    <section className="admin-product-form-page">
      <div className="admin-product-form-heading">
        <div>
          <Link
            to="/admin/products"
            className="admin-back-link"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to products</span>
          </Link>

          <p className="section-eyebrow">
            CATALOG
          </p>

          <h2>{pageTitle}</h2>

          <p>{pageDescription}</p>
        </div>
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
          <span>{error || success}</span>
        </div>
      )}

      <form
        className="admin-product-form-card"
        onSubmit={handleSubmit}
      >
        <div className="admin-product-form-section">
          <div className="admin-product-form-section__heading">
            <p>PRODUCT INFORMATION</p>
            <h3>Basic details</h3>
          </div>

          <div className="admin-product-form-grid">
            <div className="admin-product-field admin-product-field--wide">
              <label htmlFor="product-name">
                Product name
              </label>

              <input
                id="product-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                maxLength={150}
                placeholder="e.g. Adjustable Dumbbells Pro"
                disabled={saving || loadingProduct}
              />

              <span>{form.name.length}/150</span>
            </div>

            <div className="admin-product-field">
              <label htmlFor="product-brand">
                Brand
              </label>

              <input
                id="product-brand"
                name="brand"
                type="text"
                value={form.brand}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. FitKart Pro"
                disabled={saving || loadingProduct}
              />

              <span>{form.brand.length}/100</span>
            </div>

            <div className="admin-product-field admin-product-field--wide">
              <label htmlFor="product-description">
                Description
              </label>

              <textarea
                id="product-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the product..."
                disabled={saving || loadingProduct}
              />
            </div>
          </div>
        </div>

        <div className="admin-product-form-section">
          <div className="admin-product-form-section__heading">
            <p>CATALOG & INVENTORY</p>
            <h3>Product settings</h3>
          </div>

          <div className="admin-product-form-grid">
            <div className="admin-product-field">
              <label htmlFor="product-category">
                Category
              </label>

              <select
                id="product-category"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                disabled={
                  saving ||
                  loadingCategories ||
                  loadingProduct
                }
              >
                <option value="">
                  {loadingCategories
                    ? 'Loading categories...'
                    : 'Select category'}
                </option>

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

            <div className="admin-product-field">
              <label htmlFor="product-status">
                Status
              </label>

              <select
                id="product-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={saving || loadingProduct}
              >
                {productStatuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-product-field">
              <label htmlFor="product-price">
                Price
              </label>

              <div className="admin-product-input-prefix">
                <span>{'\u20B9'}</span>

                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  disabled={saving || loadingProduct}
                />
              </div>
            </div>

            <div className="admin-product-field">
              <label htmlFor="product-stock">
                Stock quantity
              </label>

              <input
                id="product-stock"
                name="stockQuantity"
                type="number"
                min="0"
                step="1"
                value={form.stockQuantity}
                onChange={handleChange}
                placeholder="0"
                disabled={saving || loadingProduct}
              />
            </div>
          </div>
        </div>

        {isEditMode && (
          <div className="admin-product-form-section">
            <div className="admin-product-form-section__heading">
              <p>MEDIA</p>
              <h3>Product images</h3>
            </div>

            <div className="admin-product-images">
              {loadingImages ? (
                <div className="admin-product-images__empty">
                  Loading product images...
                </div>
              ) : productImages.length > 0 ? (
                <div className="admin-product-images__grid">
                  {productImages.map((image) => (
                    <div
                      key={image.id}
                      className="admin-product-image-card"
                    >
                      <img
                        src={`http://localhost:8080${image.imageUrl || image.imagePath || image.url}`}
                        alt={`${form.name} product`}
                        className="admin-product-image-card__image"
                      />

                      <div className="admin-product-image-card__footer">
                        <span
                          className={
                            image.isPrimary
                              ? 'admin-product-image-card__primary'
                              : 'admin-product-image-card__secondary'
                          }
                        >
                          {image.isPrimary ? 'Primary image' : 'Product image'}
                        </span>

                        <button
                          type="button"
                          className="admin-product-image-card__delete"
                          onClick={() => handleImageDelete(image.id)}
                          disabled={deletingImageId === image.id}
                        >
                          {deletingImageId === image.id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-product-images__empty">
                  No product images have been uploaded yet.
                </div>
              )}

              <div className="admin-product-image-upload">
                <div className="admin-product-image-upload__field">
                  <label htmlFor="product-image">
                    Upload image
                  </label>

                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      setSelectedFile(event.target.files?.[0] || null)
                    }}
                    disabled={uploadingImage || loadingProduct}
                  />
                </div>

                <label className="admin-product-image-upload__primary">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(event) => setIsPrimary(event.target.checked)}
                    disabled={uploadingImage}
                  />
                  <span>Set as primary image</span>
                </label>

                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={handleImageUpload}
                  disabled={!selectedFile || uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload image'}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="admin-product-form-actions">
          <Link
            to="/admin/products"
            className="admin-secondary-button"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="admin-primary-button"
            disabled={
              saving ||
              loadingCategories ||
              loadingProduct
            }
          >
            <Check size={18} aria-hidden="true" />

            <span>{submitLabel}</span>
          </button>
        </div>
      </form>
    </section>
  )
}

export default AdminProductFormPage




