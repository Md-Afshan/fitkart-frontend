import { Outlet } from 'react-router-dom'
import StorefrontHeader from './StorefrontHeader.jsx'

const StorefrontLayout = () => {
  return (
    <div className="storefront-layout">
      <StorefrontHeader />

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default StorefrontLayout
