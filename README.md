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
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/rftelecomlb?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
JWT_SECRET="replace-with-a-long-random-secret"
WHATSAPP_ORDER_NUMBER="9611271999"
NEXT_PUBLIC_STORE_WHATSAPP="9611271999"
SITE_URL="http://localhost:3000"
```

4. Set admin accounts:

```bash
ADMIN_EMAIL="admin@rftelecomlb.com"
ADMIN_PASSWORD="admin"
ADMIN_ALI_EMAIL="ali@rftelecomlb.com"
ADMIN_ALI_PASSWORD="admin"
ADMIN_ZAHRAA_EMAIL="zahraa@rftelecomlb.com"
ADMIN_ZAHRAA_PASSWORD="admin"
```

For production, use strong passwords or bcrypt hashes.

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

- `ali` or `ali@rftelecomlb.com`
- `zahraa` or `zahraa@rftelecomlb.com`

## WhatsApp Ordering

The checkout form stores the country code separately from the local number. The local number is formatted as:

```text
XX XXX XXX
```

Orders are sent to:

```text
+961 1 271 999
```

The app also attempts to save each WhatsApp redirect as a `WhatsAppOrder` record for admin tracking.

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
- Uploaded product images are stored under `public/uploads/products`.
- The app can read catalog data from Prisma or Supabase fallback sources.
