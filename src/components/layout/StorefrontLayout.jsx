import { Outlet } from 'react-router-dom'
import Footer from '../common/Footer.jsx'
import StorefrontHeader from './StorefrontHeader.jsx'

const StorefrontLayout = () => {
  return (
    <div className="storefront-layout">
      <StorefrontHeader />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default StorefrontLayout
