# Prompt: Improve Galante's Jewelry Shop Experience

## Role
You are a senior **eCommerce Product Manager, CRO strategist, UI/UX designer, and Odoo + Next.js technical lead**.

You are working on the repository for **Galante's Jewelry**.
Your mission is to improve the **shop experience** so it feels premium, converts better, and stays fully integrated with **Odoo** as the commerce source of truth.

---

## Project context
The current architecture is:
- **Next.js** owns the storefront UX
- **Odoo** owns catalog, pricing, stock, product data, and commerce operations

Relevant repository areas:
- `app/shop/page.tsx`
- `app/shop/[slug]/page.tsx`
- `components/shop/ProductGrid.tsx`
- `components/shop/ProductCard.tsx`
- `lib/odoo/client.ts`
- `odoo/addons/galantes_jewelry/controllers/product_api.py`
- `odoo/addons/galantes_jewelry/models/product_template.py`
- `odoo/addons/galantes_jewelry/views/product_template_views.xml`
- `odoo/addons/galantes_jewelry/data/product_category.xml`

---

## Primary objective
Upgrade the `/shop` section so it includes the expected functionality and UX of a modern premium jewelry store.

The shop must include:
- categories
- search
- filters
- sorting
- pagination
- strong product cards
- a high-converting product detail page
- cleaner product descriptions
- a fluid interface that motivates customers to buy
- complete English-language customer-facing copy

---

## Non-negotiable rules
1. **All customer-facing layout content must be in English.**
2. **Do not duplicate product data in static CMS content.** Odoo remains the source of truth.
3. **Do not break the architecture boundary.** Next.js handles UX; Odoo handles catalog/commercial data.
4. **Avoid exposing irrelevant, internal, technical, or low-value product text to customers.**
5. The final result must feel **premium, clean, persuasive, and conversion-oriented**.

---

## Current problems to solve
Address these issues in the implementation:

1. The shop listing is too basic and does not behave like a full eCommerce listing page.
2. There is no complete customer-facing search/filter/sort/pagination experience.
3. Product descriptions may be pulling from generic fields that are not ideal for conversion.
4. The purchase flow is inconsistent between product cards and product detail pages.
5. Product URLs generated from Odoo may not match the actual storefront routing.
6. The shop needs stronger UX structure to improve discovery and purchase intent.

---

## Required outcomes

### 1. Shop listing page
Improve `/shop` so it includes:
- search bar
- visible category navigation
- material filter
- optional price range filter
- sorting dropdown
- real pagination
- active filter state
- result count
- clear empty state
- strong mobile UX

### 2. Product detail page
Improve `/shop/[slug]` so it includes:
- better information hierarchy
- stronger CTA structure
- trust-building support blocks
- better product descriptions
- related products
- clear availability messaging
- premium visual feel

### 3. Odoo API and data model
Upgrade the Odoo integration so the frontend can request:
- text search
- category filter
- material filter
- price range
- sorting
- pagination
- categories endpoint
- related products endpoint if possible

### 4. Content quality
Clean up and improve product content so it is:
- relevant to the customer
- concise
- persuasive
- premium
- in English only

---

## Functional requirements

### Shop page UX requirements
Use or adapt the following customer-facing copy in English:

- Title: `Shop Fine Jewelry`
- Subtitle: `Discover bridal pieces, nautical-inspired designs, timeless gifts, and custom creations.`
- Search placeholder: `Search by name, style, material, or SKU`
- Sort label: `Sort by`
- Sort options:
  - `Featured`
  - `Newest`
  - `Price: Low to High`
  - `Price: High to Low`
  - `Alphabetical`
- Result counter format:
  - `Showing 1–24 of 128 pieces`
- Empty state title:
  - `No products matched your search`
- Empty state helper text:
  - `Try adjusting your filters or browse another collection.`
- Reset action:
  - `Clear filters`

### Product detail page UX requirements
Recommended sections:
- `About This Piece`
- `Product Details`
- `Shipping & Care`
- `Need a Custom Version?`
- `You May Also Like`
- `Contact a Jewelry Specialist`

### Trust elements
Include trust-oriented content where appropriate:
- `Gift-ready packaging`
- `Secure checkout`
- `Custom orders available`
- `Jewelry concierge support`

---

## Merchandising and taxonomy guidance
Use Odoo-backed categories and keep them customer-friendly.

Suggested categories:
- Rings
- Bridal
- Necklaces
- Bracelets
- Earrings
- Nautical Collection
- Custom Jewelry
- Gifts
- Ready to Ship

Suggested merchandising collections or featured groupings:
- New Arrivals
- Best Sellers
- Bridal Favorites
- Nautical Icons
- Under $500
- Statement Pieces

You may implement featured/curated behavior using Odoo fields, tags, flags, or fallback logic.

---

## Technical implementation guidance

### Update Odoo API
In `odoo/addons/galantes_jewelry/controllers/product_api.py`:
- support `q`
- support `category`
- support `material`
- support `min_price`
- support `max_price`
- support `sort`
- support `page`
- support `page_size`
- keep backward compatibility if needed
- add `/api/categories`
- add related-products endpoint if practical
- ensure response shape is useful for frontend pagination and filtering

### Update frontend Odoo client
In `lib/odoo/client.ts`:
- fix any query parameter mismatch
- add support for combined search/filter/sort queries
- add `getCategories()`
- add related products method if endpoint exists
- keep typed responses clean and consistent

### Update `/shop`
In `app/shop/page.tsx`:
- read all query params
- render search/filter/sort/pagination UI
- show results count
- shorten hero emphasis and prioritize shopping controls + grid
- ensure premium mobile behavior

### Update product cards
In `components/shop/ProductCard.tsx`:
- keep CTA behavior consistent
- do not mix incompatible cart/checkout behaviors
- preserve premium image-first design
- keep availability states clear
- optionally add `Featured` or similar badges if supported

### Update product detail page
In `app/shop/[slug]/page.tsx`:
- improve content hierarchy
- strengthen CTA area
- add trust/support blocks
- add related products
- ensure the purchase path matches the intended commerce flow

### Update Odoo product model and views
In:
- `odoo/addons/galantes_jewelry/models/product_template.py`
- `odoo/addons/galantes_jewelry/views/product_template_views.xml`

Make it easier to manage customer-facing product data in Odoo, especially:
- short description
- long description
- featured state
- website visibility
- sequence / merchandising priority
- storefront URL consistency

---

## Content strategy requirements
Rework any customer-facing product text that is generic, repetitive, internal, or unhelpful.

Each product should ideally support this structure:
1. Product name
2. One-line value proposition
3. Short sales description
4. Key details
5. Styling, gifting, or use-case relevance where appropriate
6. Shipping/service reassurance

Avoid:
- filler copy
- internal notes
- technical ERP-like descriptions
- duplicate short and long descriptions
- mixed-language layout content

---

## Conversion goals
Prioritize these improvements because they most directly affect revenue:
1. Search
2. Category browsing
3. Filters
4. Sorting
5. Pagination
6. Stronger product descriptions
7. Consistent CTA and purchase flow
8. Related products
9. Trust-building content

---

## Expected deliverables
Deliver the work as a structured implementation with:
1. updated code
2. clear UX improvements
3. consistent English copy
4. intact Odoo integration
5. a short summary of what changed and why

If useful, also include:
- brief acceptance criteria
- notes about any migration or data-entry needs in Odoo
- any follow-up recommendations for conversion optimization

---

## Final instruction
Do not give a generic answer.
Work directly against the repository structure and produce a practical, implementation-oriented result that improves the real shop experience for **Galante's Jewelry**.
