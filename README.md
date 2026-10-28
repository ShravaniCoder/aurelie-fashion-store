# Aurélie — Premium Fashion E-commerce Starter

A responsive React + Tailwind CSS storefront inspired by the supplied luxury editorial reference. It includes 14 separate page experiences, reusable UI, demo product data, local cart/wishlist/account/order state, search and filters, product variants, checkout form validation, tracking lookup, page-level SEO metadata, sitemap and robots files.

## Pages
1. Home `/`
2. Shop All `/shop` — searchable, filterable, sortable full catalogue
3. Collections `/collections` — curated visual discovery only; deliberately separate from Shop All
4. Jewellery `/jewellery`
5. Women’s Apparel `/apparel`
6. Product Details `/product/:id`
7. Wishlist `/wishlist`
8. Shopping Cart `/cart`
9. Checkout `/checkout`
10. My Account `/account`
11. About Us `/about`
12. Contact Us `/contact`
13. FAQ & Policies `/faq`
14. Track Order `/track-order`

## Run locally
Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. For a production bundle:

```bash
npm run build
npm run preview
```

## What works in this starter
- Responsive desktop/tablet/mobile layout with mobile navigation.
- Shop All search (including `?q=`), category and product-type filters, price slider and sorting.
- Jewellery filters: Earrings, Rings, Bracelets, Necklaces.
- Apparel filters: Tops, Bottoms, Dresses, Corsets.
- Product details, variants, quantity selection, stock labels, Add to Bag, Buy Now, wishlist toggles.
- Cart quantity management and remove actions.
- Checkout field validation and a local demo order confirmation; order references can be looked up on Track Order.
- Account profile, wishlist and demo order list persisted to browser localStorage.
- Contact/newsletter demo interactions clearly explain that a backend/email provider is not connected.
- Page-specific title/description and canonical URL are set client-side. Update `public/sitemap.xml` and `public/robots.txt` with your real domain before deployment.

## Important before launch
- **Payments are intentionally not processed.** The checkout lets you test the user flow but does not fake a successful transaction or charge a customer. Integrate Razorpay/Stripe or another provider through a secure server-side endpoint, verify payment signatures/webhooks on the backend, and only then mark an order paid. Never put secret keys in `VITE_*` variables.
- Orders, wishlist, cart and account demo data live in this browser only. Add a backend/database, authentication, stock reservation, shipping/courier APIs, transactional email and server-side order validation for production.
- Replace placeholder contact details (`care@example.com`, phone number), sample policies, delivery estimates and domain in SEO files.
- Product images use remote Unsplash image URLs for demo purposes; the hero visual at `public/images/editorial-hero.png` is an original generated visual. For production, host optimized, licensed assets locally or through your image CDN and configure responsive image sizes.
- This is a front-end starter, not a fully production-ready commerce backend. Review privacy, returns, consumer-protection, GST/tax and accessibility requirements before launch.

## Stack
React, Vite, React Router, Tailwind CSS, Lucide React. CSS is also provided for precise editorial styling and responsive layouts.
