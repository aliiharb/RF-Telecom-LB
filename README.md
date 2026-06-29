# RF Telecom LB

Full-stack storefront and admin dashboard for RF Telecom LB. Shoppers browse telecom and electronics products, add items to a local cart, enter order details, and send the order to WhatsApp. Admins manage catalog data, categories, brands, visitor analytics, and WhatsApp order records.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- PostgreSQL with Prisma ORM
- Admin JWT cookie auth with bcrypt
- Supabase fallback/catalog integration
- Local product image uploads in `public/uploads/products`

## Project Structure

```text
app/              Next.js routes, layouts, route handlers
components/       Reusable UI and admin components
lib/              Server/client utilities, catalog, auth, SEO, Prisma
prisma/           Schema, migrations, seed script
public/           Static assets and uploaded product images
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```powershell
Copy-Item .env.example .env
```

3. Update `.env`:

```bash
DATABASE_URL=
WHATSAPP_ORDER_NUMBER=
NEXT_PUBLIC_STORE_WHATSAPP=
SITE_URL=
```

Supabase-backed admin catalog pages also require these server-side values:

```bash
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

On Netlify, add both under Site configuration > Environment variables for the production deploy context, then trigger a new deploy. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; do not expose it with a `NEXT_PUBLIC_` or `VITE_` prefix.

4. Set admin accounts:

```bash

```

Plaintext admin passwords are for local development only. In production, set bcrypt hashes instead:

```bash
ADMIN_PASSWORD_HASH="$2b$..."
ADMIN_ALI_PASSWORD_HASH="$2b$..."
ADMIN_ZAHRAA_PASSWORD_HASH="$2b$..."
```

Generate a hash with:

```bash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync(process.argv[1], 12));" "your-password"
```

Production also requires `DATABASE_URL` and either `AUTH_SECRET` or `JWT_SECRET`; the app will fail fast if they are missing.

5. Apply and seed the database:

```bash
npm run prisma:migrate
npm run prisma:seed
```

6. Start development:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Admin

- Login: `/admin/login`
- Dashboard: `/admin`
- Products: `/admin/products`
- Add product: `/admin/products/new`
- Categories: `/admin/categories`
- Brands: `/admin/brands`
- Visitors: `/admin/visitors`
- WhatsApp orders: `/admin/orders`

Configured admin shortcuts:

- `user-one` or `user-one@example.com`
- `user-two` or `user-two@example.com`

## WhatsApp Ordering

The checkout form stores the country code separately from the local number. The local number is formatted as:

```text
XX XXX XXX
```

Orders are sent to:

```text
Your configured WhatsApp order number
```

The app also attempts to save each WhatsApp redirect as a `WhatsAppOrder` record for admin tracking.

Order submissions are size-limited before the WhatsApp URL is generated: up to 25 line items, bounded customer fields, and bounded notes.

## Common Commands

```bash
npm run dev
npm run lint
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Notes

- Do not commit `.env`.
- Admin uploads accept up to 10 files at a time. Images must be JPG, PNG, or WebP and 5 MB or smaller; PDF spec sheets must be 20 MB or smaller.
- The app can read catalog data from Prisma or Supabase fallback sources.
