import { useCallback, useEffect, useState } from 'react'
import {
  ClipboardList,
  LogOut,
  Search,
  ShoppingBag,
  UserRound,
} from 'lucide-react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { getCategories } from '../../services/categoryService'
import { getCart } from '../../services/cartService'
import FitKartLogo from '../common/FitKartLogo.jsx'
import { useAuth } from '../../hooks/useAuth'
import './StorefrontHeader.css'

const StorefrontHeader = () => {
  const [categories, setCategories] = useState([])
  const [cartItemCount, setCartItemCount] = useState(0)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isCustomer = user?.role === 'CUSTOMER'

  const loadCartCount = useCallback(async () => {
    if (!isCustomer) {
      setCartItemCount(0)
      return
    }

    try {
      const cart = await getCart()

      const count = (cart?.items || []).reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      )

      setCartItemCount(count)
    } catch {
      setCartItemCount(0)
    }
  }, [isCustomer])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const categoryData = await getCategories()
        setCategories(categoryData)
      } catch {
        setCategories([])
      }

      await loadCartCount()
    }

    loadInitialData()

    const handleCartUpdated = () => {
      loadCartCount()
    }

    window.addEventListener(
      'fitkart-cart-updated',
      handleCartUpdated
    )

    return () => {
      window.removeEventListener(
        'fitkart-cart-updated',
        handleCartUpdated
      )
    }
  }, [loadCartCount])

  const searchParams = new URLSearchParams(location.search)
  const activeCategoryId = searchParams.get('categoryId')

  const isAllProductsActive =
    location.pathname === '/products' && !activeCategoryId

  const isCategoryActive = (categoryId) =>
    location.pathname === '/products' &&
    activeCategoryId === String(categoryId)

  return (
    <header className="storefront-header">
      <div className="storefront-header__main">
        <Link
          to="/"
          className="storefront-header__logo"
          aria-label="FITKART home"
        >
          <FitKartLogo />
        </Link>

        <div className="storefront-header__search">
          <Search
            size={20}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search products"
            aria-label="Search products"
          />
        </div>

        <nav
          className="storefront-header__actions"
          aria-label="Account navigation"
        >
          {user?.role === 'CUSTOMER' ? (
            <>
              <Link
                to="/profile"
                className="storefront-header__action"
              >
                <UserRound
                  size={20}
                  aria-hidden="true"
                />
                <span>Account</span>
              </Link>

              <Link
                to="/orders"
                className="storefront-header__action"
              >
                <ClipboardList
                  size={20}
                  aria-hidden="true"
                />
                <span>My Orders</span>
              </Link>

              <Link
                to="/cart"
                className="storefront-header__action"
              >
                <ShoppingBag
                  size={20}
                  aria-hidden="true"
                />
                <span>Cart</span>

                {cartItemCount > 0 && (
                  <span className="storefront-header__cart-count">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                className="storefront-header__signout"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                <LogOut
                  size={16}
                  aria-hidden="true"
                />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="storefront-header__action"
              >
                <UserRound
                  size={20}
                  aria-hidden="true"
                />
                <span>Login</span>
              </Link>

              <Link
                to="/register"
                className="storefront-header__action"
              >
                <span>Register</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="storefront-header__categories">
        <nav aria-label="Product categories">
          <Link
            to="/products"
            className={isAllProductsActive ? 'is-active' : ''}
          >
            All Products
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?categoryId=${category.id}`}
              className={
                isCategoryActive(category.id)
                  ? 'is-active'
                  : ''
              }
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default StorefrontHeader
