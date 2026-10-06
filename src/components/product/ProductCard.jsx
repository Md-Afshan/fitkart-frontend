import { Link } from 'react-router-dom'

const ProductCard = ({ product, image }) => {
  const isOutOfStock = product.stockQuantity <= 0

  return (
    <article className="product-card">
      <Link
        to={`/products/${product.id}`}
        className="product-card__image-link"
      >
        <div className="product-card__image">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <div className="product-card__image-placeholder">
              No image
            </div>
          )}

          {isOutOfStock && (
            <span className="product-card__stock">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      <div className="product-card__content">
        <p className="product-card__category">
          {product.categoryName}
        </p>

        <Link
          to={`/products/${product.id}`}
          className="product-card__name"
        >
          {product.name}
        </Link>

        {product.brand && (
          <p className="product-card__brand">
            {product.brand}
          </p>
        )}

        <div className="product-card__footer">
          <span className="product-card__price">
            ?{Number(product.price).toLocaleString('en-IN')}
          </span>

          {!isOutOfStock && (
            <Link
              to={`/products/${product.id}`}
              className="product-card__action"
            >
              View
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
