
import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { products } from '../data/products';
import {
  Breadcrumbs,
  PageIntro,
  ProductGrid,
} from '../components/Shared';
import { useSEO } from '../utils/seo';

const JEWELLERY_ORDER = [
  'Earrings',
  'Necklaces',
  'Rings',
  'Bracelets',
];

const APPAREL_ORDER = [
  'Tops',
  'Shirts',
  'Dresses',
  'Trousers',
  'Co-ord Sets',
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const normal = (value) =>
  String(value ?? '').trim().toLowerCase();

function canonicalType(product, jewellery) {
  const type = normal(product.type);

  if (!jewellery && type === 'bottoms') return 'Trousers';
  if (!jewellery && ['co-ord sets', 'co ord sets', 'co-ords', 'co-ord'].includes(type)) {
    return 'Co-ord Sets';
  }

  return (jewellery ? JEWELLERY_ORDER : APPAREL_ORDER)
    .find((item) => normal(item) === type) || '';
}

function coloursOf(product, jewellery) {
  const direct =
    product.colours ??
    product.colors ??
    product.colour ??
    product.color;

  if (direct != null) {
    const values = Array.isArray(direct) ? direct : [direct];

    return values
      .map((value) =>
        typeof value === 'string'
          ? value
          : value?.name ?? value?.label ?? ''
      )
      .filter(Boolean);
  }

  // Jewellery variants are colours; apparel variants are sizes.
  if (jewellery && Array.isArray(product.variants)) {
    return product.variants.filter(
      (value) => typeof value === 'string'
    );
  }

  return [];
}

function materialsOf(product) {
  return [product.material, product.materials]
    .flatMap((value) =>
      Array.isArray(value) ? value : [value]
    )
    .filter(Boolean)
    .map(String);
}

function sizesOf(product) {
  const raw =
    product.sizes ??
    product.availableSizes ??
    product.variants ??
    [];

  return (Array.isArray(raw) ? raw : [raw])
    .map((value) =>
      typeof value === 'string'
        ? value.toUpperCase().trim()
        : String(value?.label ?? value?.name ?? '').toUpperCase()
    )
    .filter((value) => SIZES.includes(value));
}

function fitOf(product) {
  return String(product.fit ?? product.fitType ?? '').trim();
}

export default function ProductCategory({ kind }) {
  const jewellery = kind === 'Jewellery';

  const title = jewellery ? 'Jewellery' : 'Women’s Apparel';
  const types = jewellery ? JEWELLERY_ORDER : APPAREL_ORDER;

  const categoryProducts = useMemo(() => {
    return products
      .filter((product) => {
        const category = normal(product.category);

        const correctCategory = jewellery
          ? ['jewellery', 'jewelry'].includes(category)
          : ['apparel', 'women’s apparel', "women's apparel"].includes(category);

        return correctCategory && Boolean(canonicalType(product, jewellery));
      })
      .sort(
        (a, b) =>
          types.indexOf(canonicalType(a, jewellery)) -
          types.indexOf(canonicalType(b, jewellery))
      );
  }, [jewellery, types]);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [maxPrice, setMaxPrice] = useState(8000);
  const [colour, setColour] = useState('');
  const [material, setMaterial] = useState('');
  const [size, setSize] = useState('');
  const [fit, setFit] = useState('');
  const [sort, setSort] = useState('newest');

  useSEO(
    `${title} | Aurélie`,
    jewellery
      ? 'Discover earrings, necklaces, rings and bracelets from the Aurélie jewellery collection.'
      : 'Explore tops, shirts, dresses, trousers and co-ord sets from Aurélie.'
  );

  const colours = useMemo(
    () =>
      [...new Set(
        categoryProducts.flatMap((product) =>
          coloursOf(product, jewellery)
        )
      )].sort(),
    [categoryProducts, jewellery]
  );

  const materials = useMemo(
    () =>
      [...new Set(categoryProducts.flatMap(materialsOf))].sort(),
    [categoryProducts]
  );

  const availableSizes = useMemo(() => {
    const available = new Set(categoryProducts.flatMap(sizesOf));
    return SIZES.filter((value) => available.has(value));
  }, [categoryProducts]);

  const fits = useMemo(
    () =>
      [...new Set(
        categoryProducts.map(fitOf).filter(Boolean)
      )].sort(),
    [categoryProducts]
  );

  const shown = useMemo(() => {
    const result = categoryProducts.filter((product) => {
      const productType = canonicalType(product, jewellery);
      const productColours = coloursOf(product, jewellery);
      const productMaterials = materialsOf(product);
      const productSizes = sizesOf(product);
      const productFit = fitOf(product);

      const searchText = [
        product.name,
        product.type,
        product.category,
        ...productColours,
        ...productMaterials,
        productFit,
      ].filter(Boolean).join(' ').toLowerCase();

      return (
        (!type || productType === type) &&
        Number(product.price) <= maxPrice &&
        (!colour || productColours.some(
          (value) => normal(value) === normal(colour)
        )) &&
        (!jewellery || !material || productMaterials.some(
          (value) => normal(value) === normal(material)
        )) &&
        (jewellery || !size || productSizes.includes(size)) &&
        (jewellery || !fit || normal(productFit) === normal(fit)) &&
        searchText.includes(query.trim().toLowerCase())
      );
    });

    if (sort === 'price-low') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === 'price-high') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sort === 'newest') {
      result.sort((a, b) => {
        const dateA = new Date(
          a.createdAt ?? a.dateAdded ?? 0
        ).getTime();

        const dateB = new Date(
          b.createdAt ?? b.dateAdded ?? 0
        ).getTime();

        return (Number.isFinite(dateB) ? dateB : 0) -
          (Number.isFinite(dateA) ? dateA : 0);
      });
    }

    if (sort === 'bestselling') {
      result.sort(
        (a, b) =>
          Number(b.sales ?? b.soldCount ?? b.sold ?? 0) -
          Number(a.sales ?? a.soldCount ?? a.sold ?? 0)
      );
    }

    return result;
  }, [
    categoryProducts,
    jewellery,
    type,
    maxPrice,
    colour,
    material,
    size,
    fit,
    query,
    sort,
  ]);

  const reset = () => {
    setQuery('');
    setType('');
    setMaxPrice(8000);
    setColour('');
    setMaterial('');
    setSize('');
    setFit('');
    setSort('newest');
  };

  return (
    <main className="page-shell product-category-catalog">
      <Breadcrumbs items={[{ label: title }]} />

      <PageIntro
        eyebrow={jewellery ? 'The jewellery edit' : 'The modern wardrobe'}
        title={title}
        description={
          jewellery
            ? 'Earrings, necklaces, rings and bracelets. Thoughtful finishing touches for every occasion.'
            : 'Tops, shirts, dresses, trousers and co-ord sets. Considered silhouettes for a modern wardrobe.'
        }
      />

      <div className="catalog-layout">
        <aside className="filter-panel">
          <div className="filter-title">
            <SlidersHorizontal size={16} />
            <span>Refine your edit</span>
            <button type="button" onClick={reset}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <label className="filter-label" htmlFor={`${kind}-search`}>
            Search collection
          </label>

          <div className="search-field">
            <Search size={15} />
            <input
              id={`${kind}-search`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pieces…"
            />
          </div>

          <div className="filter-section">
            <label className="filter-label" htmlFor={`${kind}-type`}>
              {jewellery ? 'Jewellery Type' : 'Clothing Type'}
            </label>
            <select
              id={`${kind}-type`}
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="">All types</option>
              {types.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          {!jewellery && (
            <div className="filter-section">
              <span className="filter-label">Size</span>
              <div className="shop-size-options">
                {SIZES.map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={`shop-size-option ${size === value ? 'is-selected' : ''}`}
                    onClick={() => setSize(size === value ? '' : value)}
                    aria-pressed={size === value}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="filter-section">
            <label className="filter-label" htmlFor={`${kind}-colour`}>
              Colour
            </label>
            <select
              id={`${kind}-colour`}
              value={colour}
              onChange={(event) => setColour(event.target.value)}
            >
              <option value="">All colours</option>
              {colours.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          {jewellery ? (
            <div className="filter-section">
              <label className="filter-label" htmlFor="jewellery-material">
                Material
              </label>
              <select
                id="jewellery-material"
                value={material}
                onChange={(event) => setMaterial(event.target.value)}
              >
                <option value="">All materials</option>
                {materials.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="filter-section">
              <label className="filter-label" htmlFor="apparel-fit">
                Fit
              </label>
              <select
                id="apparel-fit"
                value={fit}
                onChange={(event) => setFit(event.target.value)}
              >
                <option value="">All fits</option>
                {fits.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-section">
            <label className="filter-label" htmlFor={`${kind}-price`}>
              <span>Price</span>
              <b>₹{maxPrice.toLocaleString('en-IN')}</b>
            </label>
            <input
              id={`${kind}-price`}
              className="price-range"
              type="range"
              min="0"
              max="8000"
              step="250"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
            />
            <div className="price-range-labels">
              <span>₹0</span>
              <span>₹8,000</span>
            </div>
          </div>
        </aside>

        <div className="catalog-results">
          <div className="catalog-toolbar">
            <span>
              {shown.length} {shown.length === 1 ? 'piece' : 'pieces'}
            </span>

            <label>
              Sort by{' '}
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="bestselling">Bestselling</option>
                <option value="price-low">Price Low–High</option>
                <option value="price-high">Price High–Low</option>
              </select>
            </label>
          </div>

          {shown.length ? (
            <ProductGrid products={shown} />
          ) : (
            <div className="empty-state">
              <p>No pieces found. Try adjusting your filters.</p>
              <button type="button" onClick={reset}>Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
