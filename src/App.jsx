import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import VendorLayout from './components/layout/VendorLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import VendorRoute from './routes/VendorRoute'

// Customer pages
import Home from './pages/customer/Home'
import Shop from './pages/customer/Shop'
import ProductDetail from './pages/customer/ProductDetail'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import Login from './pages/customer/Login'
import Register from './pages/customer/Register'
import Profile from './pages/customer/Profile'
import MyOrders from './pages/customer/MyOrders'
import OrderDetail from './pages/customer/OrderDetail'
import Messages from './pages/customer/Messages'

// Vendor pages
import Dashboard from './pages/vendor/Dashboard'
import VendorProducts from './pages/vendor/VendorProducts'
import VendorOrders from './pages/vendor/VendorOrders'
import VendorMessages from './pages/vendor/VendorMessages'
import VendorTransactions from './pages/vendor/VendorTransactions'

export default function App() {
  return (
    <Routes>
      {/* ─── Public / Customer routes ─── */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Auth-required customer routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="profile" element={<Profile />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="my-orders/:id" element={<OrderDetail />} />
          <Route path="messages" element={<Messages />} />
        </Route>
      </Route>

      {/* ─── Vendor routes ─── */}
      <Route element={<VendorRoute />}>
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="messages" element={<VendorMessages />} />
          <Route path="transactions" element={<VendorTransactions />} />
        </Route>
      </Route>
    </Routes>
  )
}
