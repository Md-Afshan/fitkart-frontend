import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import AdminRoute from './AdminRoute.jsx'
import StorefrontLayout from '../components/layout/StorefrontLayout.jsx'
import HomePage from '../pages/customer/HomePage.jsx'
import ProductsPage from '../pages/customer/ProductsPage.jsx'
import ProductDetailsPage from '../pages/customer/ProductDetailsPage.jsx'
import CartPage from '../pages/customer/CartPage.jsx'
import CheckoutPage from '../pages/customer/CheckoutPage.jsx'
import OrderDetailsPage from '../pages/customer/OrderDetailsPage.jsx'
import OrdersPage from '../pages/customer/OrdersPage.jsx'
import LoginPage from '../pages/customer/LoginPage.jsx'
import RegisterPage from '../pages/customer/RegisterPage.jsx'
import ProfilePage from '../pages/customer/ProfilePage.jsx'
import AdminLayout from '../components/admin/AdminLayout.jsx'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx'
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage.jsx'
import AdminProductsPage from '../pages/admin/AdminProductsPage.jsx'
import AdminProductFormPage from '../pages/admin/AdminProductFormPage.jsx'
import AdminInventoryPage from '../pages/admin/AdminInventoryPage.jsx'
import AdminOrdersPage from '../pages/admin/AdminOrdersPage.jsx'
import AdminCustomersPage from '../pages/admin/AdminCustomersPage.jsx'

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<StorefrontLayout />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
  <Route element={<AdminLayout />}>
    <Route path="/admin" element={<AdminDashboardPage />} />
    <Route
      path="/admin/dashboard"
      element={<AdminDashboardPage />}
    />
    <Route path="/admin/categories" element={<AdminCategoriesPage />} />
    <Route path="/admin/products/new" element={<AdminProductFormPage />} />
    <Route path="/admin/products/edit/:id" element={<AdminProductFormPage />} />
      <Route
      path="/admin/products"
      element={<AdminProductsPage />}
    />
    <Route
      path="/admin/inventory"
      element={<AdminInventoryPage />}
    />
    <Route
      path="/admin/orders"
      element={<AdminOrdersPage />}
    />
    <Route
      path="/admin/customers"
      element={<AdminCustomersPage />}
    />
  </Route>
</Route>
    </Routes>
  </BrowserRouter>
)

export default AppRoutes















