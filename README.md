# ShopCo — Full-Stack Ecommerce Store

A single-vendor ecommerce storefront built for Netlify. One vendor sells to many customers. Features a full vendor dashboard, PayPal checkout, real-time messaging, and complete account management.

---

## Account Credentials You Need to Provide

Before this site will work, you must supply credentials from **three services**. All are free tiers unless noted.

### 1. Supabase (Database, Auth, Storage)

**Sign up at:** https://supabase.com

1. Create a new project (free tier is sufficient).
2. Go to **Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret — server-side only)*
3. Go to **SQL Editor → New Query**, paste the entire contents of `supabase/schema.sql`, and click **Run**.
4. Go to **Storage → New bucket**, name it `product-images`, and toggle **Public** ON.

### 2. PayPal (Payments)

**Sign up at:** https://developer.paypal.com

1. Log in and go to **Apps & Credentials**.
2. Make sure you're in **Sandbox** mode for development.
3. Click **Create App** → give it a name → select **Merchant**.
4. Copy:
   - `Client ID` → `VITE_PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_ID`
   - `Secret` → `PAYPAL_CLIENT_SECRET`
5. For **production**, flip to Live mode, create a separate app, and change `PAYPAL_BASE_URL` to `https://api-m.paypal.com`.

### 3. Netlify (Hosting & Serverless Functions)

**Sign up at:** https://netlify.com

1. Push this project to a GitHub/GitLab repo.
2. In Netlify, click **Add new site → Import an existing project** and connect your repo.
3. Netlify will auto-detect `netlify.toml` — no build settings needed.
4. Go to **Site settings → Environment variables** and add every key from `.env.example`.

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env file and fill in your credentials
cp .env.example .env

# 3. Start the dev server (standard Vite)
npm run dev

# 4. OR start with Netlify Dev (runs Functions locally too — recommended)
npm install -g netlify-cli
netlify dev
```

> **Note:** PayPal functions require `netlify dev` to work locally. `npm run dev` alone will not proxy the `/.netlify/functions/` routes.

---

## Setting Up the Vendor Account

The system has one vendor. After deployment:

1. Register a normal account through the app at `/register`.
2. Open your Supabase dashboard → **SQL Editor** → run:

```sql
UPDATE profiles
  SET role = 'vendor'
  WHERE email = 'your-vendor-email@example.com';
```

3. Sign out and sign back in — the vendor dashboard will appear at `/vendor`.

---

## Tech Stack

| Layer | Technology | Docs |
|---|---|---|
| Frontend Framework | React 18 | https://react.dev |
| Build Tool | Vite 5 | https://vitejs.dev |
| Routing | React Router v6 | https://reactrouter.com |
| Styling | Tailwind CSS v3 | https://tailwindcss.com |
| Icons | Lucide React | https://lucide.dev |
| Database & Auth | Supabase | https://supabase.com/docs |
| Realtime Messaging | Supabase Realtime | https://supabase.com/docs/guides/realtime |
| File Storage | Supabase Storage | https://supabase.com/docs/guides/storage |
| Cart State | Zustand (persisted) | https://github.com/pmndrs/zustand |
| Payments | PayPal React JS SDK | https://github.com/paypal/react-paypal-js |
| PayPal Server API | PayPal Orders v2 | https://developer.paypal.com/docs/api/orders/v2 |
| Serverless Backend | Netlify Functions | https://docs.netlify.com/functions/overview |
| Notifications | React Hot Toast | https://react-hot-toast.com |
| Date Formatting | date-fns | https://date-fns.org |
| Hosting | Netlify | https://docs.netlify.com |

---

## Project Structure

```
/
├── netlify/
│   └── functions/
│       ├── create-paypal-order.js   # PayPal Orders API — creates order server-side
│       └── capture-paypal-order.js  # Captures payment + writes order to Supabase
├── supabase/
│   └── schema.sql                   # Full DB schema + RLS policies
├── src/
│   ├── components/
│   │   ├── cart/                    # CartDrawer, CartItem
│   │   ├── layout/                  # Header, Footer, Layout, VendorLayout
│   │   ├── messaging/               # ConversationList, MessageThread
│   │   ├── products/                # ProductCard, ProductForm
│   │   ├── ui/                      # Button, Input, Modal, Badge, Spinner, ConfirmDialog
│   │   └── vendor/                  # StatCard
│   ├── context/
│   │   └── AuthContext.jsx          # Auth state, signIn/signUp/signOut/updateProfile
│   ├── lib/
│   │   └── supabase.js              # Supabase client
│   ├── pages/
│   │   ├── customer/                # Home, Shop, ProductDetail, Cart, Checkout, etc.
│   │   └── vendor/                  # Dashboard, VendorProducts, VendorOrders, etc.
│   ├── routes/
│   │   ├── ProtectedRoute.jsx       # Redirects unauthenticated users to /login
│   │   └── VendorRoute.jsx          # Redirects non-vendor users to /
│   ├── store/
│   │   └── cartStore.js             # Zustand cart (persisted in localStorage)
│   ├── App.jsx                      # Route definitions
│   └── main.jsx                     # App entry + PayPal + Auth providers
├── .env.example                     # Template for environment variables
├── netlify.toml                     # Netlify build config + SPA redirect
├── tailwind.config.js
└── vite.config.js
```

---

## Key Flows

### Customer Checkout (PayPal)
1. Customer fills cart → goes to `/checkout`
2. Fills in shipping address
3. Clicks PayPal button → frontend calls `/.netlify/functions/create-paypal-order`
4. PayPal popup handles payment authorization
5. On approval → frontend calls `/.netlify/functions/capture-paypal-order`
6. Netlify Function captures funds, decrements stock, writes `orders` + `order_items` to Supabase
7. Customer redirected to `/order-confirmation/:id`

### Messaging (Real-time)
- Customers start conversations via `/messages` or from a product detail page
- Messages use Supabase Realtime subscriptions for live updates without polling
- Vendor replies from `/vendor/messages`; customer replies from `/messages`

### Row Level Security (RLS)
All database access is controlled by Supabase RLS policies:
- Customers can only read/write their own data
- Vendor (role = 'vendor') can read all data
- Products are publicly readable when `is_active = true`
- The Netlify Function uses the `service_role` key which bypasses RLS — this key is **never** sent to the browser

---

## Environment Variables Reference

| Variable | Where Used | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase public anon key |
| `VITE_PAYPAL_CLIENT_ID` | Frontend | PayPal client ID for the PayPal button |
| `PAYPAL_CLIENT_ID` | Netlify Function | PayPal client ID (server-side) |
| `PAYPAL_CLIENT_SECRET` | Netlify Function | PayPal secret — **never expose to browser** |
| `PAYPAL_BASE_URL` | Netlify Function | `https://api-m.sandbox.paypal.com` (dev) or `https://api-m.paypal.com` (prod) |
| `SUPABASE_URL` | Netlify Function | Same as `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Netlify Function | Service role key — **never expose to browser** |

---

## Future State Upgrade Suggestions

### High Priority
- **Email Notifications** — Send order confirmations and shipping updates via [Resend](https://resend.com) or [Postmark](https://postmarkapp.com). Add a Netlify Function triggered after `capture-paypal-order`.
- **Supabase Email Confirmation** — Enable email confirmation in Supabase Auth settings so fake accounts can't be created.
- **Shipping Integration** — Integrate [EasyPost](https://www.easypost.com) or [Shippo](https://goshippo.com) for real-time shipping rates at checkout and label printing from the vendor dashboard.
- **Stripe as an Alternative Payment** — Add [Stripe](https://stripe.com) alongside PayPal for broader payment method support (cards, Apple Pay, etc.).

### Medium Priority
- **Product Reviews** — Add a `reviews` table (linked to `order_items` so only purchasers can review). Display star ratings on product cards.
- **Discount Codes / Coupons** — Add a `coupons` table with usage limits and expiry dates. Apply at checkout before calling PayPal.
- **Inventory Alerts** — Notify the vendor (email or in-dashboard) when a product's quantity drops below a threshold.
- **Image Optimization** — Use Supabase Storage's built-in image transformation (`?width=400&quality=80`) for faster page loads.
- **SEO** — Add `react-helmet-async` for per-page meta tags and Open Graph data on product pages.
- **Analytics Dashboard** — Add charts (e.g., with [Recharts](https://recharts.org)) to the vendor dashboard for revenue over time and top-selling products.

### Longer Term
- **Multi-Image Drag-to-Reorder** — Replace the simple image upload with a drag-and-drop gallery using [dnd-kit](https://dndkit.com).
- **Product Variants** — Support sizes, colors, etc. via a `product_variants` table.
- **Wishlists / Saved Items** — Let customers save products to a wishlist stored in Supabase.
- **Admin Audit Log** — Track every vendor action (product edits, order status changes) in an `audit_log` table.
- **PWA / Offline Support** — Add a service worker via [Vite PWA](https://vite-pwa-org.netlify.app) so the store works offline and is installable.
- **Internationalization** — Add multi-currency and multi-language support using [i18next](https://www.i18next.com).
- **Rate Limiting on Functions** — Protect the PayPal Netlify Functions from abuse using [Netlify's built-in rate limiting](https://docs.netlify.com/security/secure-access-to-sites/rate-limiting/) (requires Pro plan).

---

## Important Security Notes

1. **Never commit `.env`** — it's in `.gitignore` by default. Use `.env.example` for reference only.
2. **Service role key** — `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS. Only use it in Netlify Functions, never in frontend code.
3. **RLS is your primary defense** — All tables have RLS enabled. Review `supabase/schema.sql` before adding new tables.
4. **PayPal secret** — `PAYPAL_CLIENT_SECRET` is only in Netlify Functions environment variables, never in any VITE_ prefixed variable.
5. **Validate on the server** — The `capture-paypal-order` function validates the PayPal capture response before writing to the database, so a manipulated frontend total cannot be used to pay less.
6. **Stock is decremented atomically** by the Netlify Function using the service role, so the client cannot skip the decrement step.

---

## Deploying to Production

1. Push to GitHub.
2. In Netlify: **Add new site → Import existing project** → select your repo.
3. Add all environment variables from `.env.example` in **Site settings → Environment variables**.
4. Change `PAYPAL_BASE_URL` to `https://api-m.paypal.com` and use your **Live** PayPal app credentials.
5. Deploy. Done.

For the custom domain, go to **Site settings → Domain management → Add custom domain**.
