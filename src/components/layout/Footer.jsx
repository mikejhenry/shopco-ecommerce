import { Link } from 'react-router-dom'
import { Package, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Package size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">ShopCo</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Quality products delivered to your door. Shop with confidence and enjoy a seamless experience.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <a href="mailto:support@shopco.com" className="hover:text-white transition-colors">
                  support@shopco.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <span>1-800-SHOPCO</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} ShopCo. All rights reserved.</span>
          <span>Payments secured by PayPal</span>
        </div>
      </div>
    </footer>
  )
}
