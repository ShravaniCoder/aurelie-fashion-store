
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

import { products } from '../data/products';
import {
  Breadcrumbs,
  PageIntro,
  ProductGrid,
} from '../components/Shared';
import { useSEO } from '../utils/seo';

const JEWELLERY_TYPES = [
  'Earrings',
  'Rings',
  'Bracelets',
  'Necklaces',
];

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const isJewellery = (product) => {
  const category = String(product.category ?? '').toLowerCase();
  const type = String(product.type ?? '').toLowerCase();

  return (
    category.includes('jewellery') ||
    category.includes('jewelry') ||
    JEWELLERY_TYPES.some(
      (item) => item.toLowerCase() === type
    )
  );
};

const getColours = (product) => {
  const explicit =
    product.colors ??
    product.colours ??
    product.color ??
    product.colour;

  if (explicit != null) {
    return (Array.isArray(explicit) ? explicit : [explicit])
      .map((item) =>
        typeof item === 'string'
          ? item
          : item?.name ?? item?.label ?? ''
      )
      .filter(Boolean);
  }

  // Jewellery variants represent colour choices.
  if (isJewellery(product)) {
    const variants = Array.isArray(product.variants)
      ? product.variants
      : [];

    return variants.filter(
      (item) => typeof item === 'string' && item.trim()
    );
  }

  return [];
};

const getSizes = (product) => {
  // Never treat jewellery colour variants as clothing sizes.
  if (isJewellery(product)) return [];

  const value =
    product.sizes ??
    product.availableSizes ??
    product.size ??
    product.variants ??
    [];

  const values = Array.isArray(value) ? value : [value];

  return values
    .map((item) =>
      typeof item === 'string' || typeof item === 'number'
        ? String(item).trim().toUpperCase()
        : String(item?.label ?? item?.name ?? '')
            .trim()
            .toUpperCase()
    )
    .filter((size) => CLOTHING_SIZES.includes(size));
};

const mixCategories = (items) => {
  const jewellery = items.filter(isJewellery);
  const apparel = items.filter((item) => !isJewellery(item));

  // Begin with jewellery, then mix both categories together.
  const result = jewellery.splice(
    0,
    Math.min(4, jewellery.length)
  );

  while (jewellery.length || apparel.length) {
    if (apparel.length) result.push(apparel.shift());
    if (jewellery.length) result.push(jewellery.shift());
  }

  return result;
};

export default function Shop() {
  useSEO(
    'Shop All',
    'Discover Aurélie fashion jewellery and women’s apparel in one curated catalogue.'
  );

  const [params] = useSearchParams();

  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(8000);
  const [selectedColours, setSelectedColours] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sort, setSort] = useState('featured');

  const [showCategory, setShowCategory] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showColours, setShowColours] = useState(true);
  const [showSizes, setShowSizes] = useState(true);

  const colours = useMemo(
    () =>
      [...new Set(products.flatMap(getColours))].sort(
        (a, b) => a.localeCompare(b)
      ),
    []
  );

  // Keep every clothing size available in the product catalogue.
  const sizes = useMemo(() => {
    const available = new Set(products.flatMap(getSizes));
    return CLOTHING_SIZES.filter((size) => available.has(size));
  }, []);

  const shown = useMemo(() => {
    let result = products.filter((product) => {
      const jewellery = isJewellery(product);
      const productColours = getColours(product);
      const productSizes = getSizes(product);

      const matchesCategory =
        !category ||
        (category === 'Jewellery' && jewellery) ||
        (category === 'Apparel' && !jewellery);

      const searchText = [
        product.name,
        product.type,
        product.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchText.includes(
        query.trim().toLowerCase()
      );

      const price = Number(product.price);

      const matchesPrice =
        Number.isFinite(price) &&
        price >= 0 &&
        price <= maxPrice;

      const matchesColour =
        selectedColours.length === 0 ||
        selectedColours.some((colour) =>
          productColours.some(
            (item) =>
              item.toLowerCase() === colour.toLowerCase()
          )
        );

      const matchesSize =
        selectedSizes.length === 0 ||
        selectedSizes.some((size) =>
          productSizes.includes(size)
        );

      return (
        matchesCategory &&
        matchesSearch &&
        matchesPrice &&
        matchesColour &&
        matchesSize
      );
    });

    if (sort === 'price-low') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'price-high') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === 'newest') {
      result.sort((a, b) => {
        const dateA = new Date(
          a.createdAt ?? a.dateAdded ?? 0
        ).getTime();

        const dateB = new Date(
          b.createdAt ?? b.dateAdded ?? 0
        ).getTime();

        return (
          (Number.isFinite(dateB) ? dateB : 0) -
          (Number.isFinite(dateA) ? dateA : 0)
        );
      });
    } else if (sort === 'bestselling') {
      result.sort(
        (a, b) =>
          Number(b.sales ?? b.soldCount ?? 0) -
          Number(a.sales ?? a.soldCount ?? 0)
      );
    } else {
      result = mixCategories(result);
    }

    return result;
  }, [
    query,
    category,
    maxPrice,
    selectedColours,
    selectedSizes,
    sort,
  ]);

  const toggleOption = (value, selected, setter) => {
    setter(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  const reset = () => {
    setQuery('');
    setCategory('');
    setMaxPrice(8000);
    setSelectedColours([]);
    setSelectedSizes([]);
    setSort('featured');
  };

  const filterPanel = (
    <aside className="filter-panel">
      <div className="filter-title">
        <SlidersHorizontal size={16} />
        <span>Refine your edit</span>

        <button
          type="button"
          className="filter-reset"
          onClick={reset}
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      <label className="filter-label" htmlFor="shop-search">
        Search the collection
      </label>

      <div className="search-field">
        <Search size={16} />
        <input
          id="shop-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pieces…"
        />
      </div>

      {/* Category */}
      <div className="filter-section">
        <button
          type="button"
          className="filter-label filter-accordion"
          aria-expanded={showCategory}
          onClick={() => setShowCategory((value) => !value)}
        >
          Category
          <ChevronDown
            size={15}
            className={showCategory ? 'filter-chevron-open' : ''}
          />
        </button>

        {showCategory && (
          <div className="filter-options">
            {['Jewellery', 'Apparel'].map((option) => (
              <label className="check-row" key={option}>
                <input
                  type="radio"
                  name="shop-category"
                  checked={category === option}
                  onChange={() => setCategory(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="filter-section">
        <button
          type="button"
          className="filter-label filter-accordion"
          aria-expanded={showPrice}
          onClick={() => setShowPrice((value) => !value)}
        >
          Price range
          <ChevronDown
            size={15}
            className={showPrice ? 'filter-chevron-open' : ''}
          />
        </button>

        {showPrice && (
          <div className="filter-options">
            <div className="price-label">
              Up to <b>₹{maxPrice.toLocaleString('en-IN')}</b>
            </div>

            <input
              className="price-range"
              type="range"
              min="0"
              max="8000"
              step="250"
              value={maxPrice}
              aria-label="Maximum price"
              onChange={(event) =>
                setMaxPrice(Number(event.target.value))
              }
            />

            <div className="price-range-labels">
              <span>₹0</span>
              <span>₹8,000</span>
            </div>
          </div>
        )}
      </div>

      {/* Colour */}
      <div className="filter-section">
        <button
          type="button"
          className="filter-label filter-accordion"
          aria-expanded={showColours}
          onClick={() => setShowColours((value) => !value)}
        >
          Colour
          <ChevronDown
            size={15}
            className={showColours ? 'filter-chevron-open' : ''}
          />
        </button>

        {showColours && (
          <div className="filter-options">
            {colours.map((colour) => (
              <label className="check-row" key={colour}>
                <input
                  type="checkbox"
                  checked={selectedColours.includes(colour)}
                  onChange={() =>
                    toggleOption(
                      colour,
                      selectedColours,
                      setSelectedColours
                    )
                  }
                />
                <span>{colour}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clothing sizes — horizontal buttons */}
      <div className="filter-section">
        <button
          type="button"
          className="filter-label filter-accordion"
          aria-expanded={showSizes}
          onClick={() => setShowSizes((value) => !value)}
        >
          Size
          <ChevronDown
            size={15}
            className={showSizes ? 'filter-chevron-open' : ''}
          />
        </button>

        {showSizes && (
          <div className="shop-size-options">
            {sizes.map((size) => {
              const active = selectedSizes.includes(size);

              return (
                <button
                  key={size}
                  type="button"
                  className={`shop-size-option ${
                    active ? 'is-selected' : ''
                  }`}
                  aria-pressed={active}
                  onClick={() =>
                    toggleOption(
                      size,
                      selectedSizes,
                      setSelectedSizes
                    )
                  }
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="page-shell">
     

      {/* Shop All Banner */}
<section className="
  relative
  w-[calc(100%+12%)]
  -ml-[6%]
  -mt-[34px]
  mb-[18px]
  aspect-[2.5/1]
  overflow-hidden

  max-[760px]:w-[calc(100%+10%)]
  max-[760px]:-ml-[5%]
  max-[760px]:-mt-[25px]
  max-[760px]:mb-[14px]
  max-[760px]:aspect-[1.4/1]
">

  {/* Background Image */}
  <img
    src="/images/Banner3.png"
    alt="Shop All Collection"
    className="absolute inset-0 w-full h-full object-cover object-center"
  />

  {/* Left Side Text */}
  <div className="absolute left-[8%] top-1/2 -translate-y-1/2 z-10 flex flex-col items-start text-left text-[#30221c] max-[760px]:left-[4%] max-[760px]:w-[48%]">

    <span className="text-[10px] tracking-[4px] leading-[2] max-[760px]:text-[7px] max-[760px]:tracking-[2px]">
      THE COMPLETE EDIT
    </span>

    <h2 className="mt-[18px] mb-[5px] font-serif italic font-normal text-[clamp(32px,5vw,76px)] leading-none max-[760px]:mt-[10px] max-[760px]:mb-[4px] max-[760px]:text-[clamp(23px,6vw,38px)]">
      Shop All
    </h2>

    <p className="mb-3 text-[13px] tracking-[3px] max-[760px]:mb-2 max-[760px]:text-[9px] max-[760px]:tracking-[1.5px]">
      JEWELLERY &amp; APPAREL
    </p>

    <a
      href="#shop-products"
      className="inline-flex items-center gap-2 border border-[#30221c] px-4 py-2 text-[10px] tracking-[1.5px] text-[#30221c] transition-all duration-300 hover:bg-[#30221c] hover:text-white max-[760px]:gap-1.5 max-[760px]:px-2.5 max-[760px]:py-1.5 max-[760px]:text-[7px]"
    >
      EXPLORE COLLECTION
      <span>→</span>
    </a>

  </div>
</section>

      <PageIntro
        eyebrow="The complete edit"
        title="Shop all"
        description="A considered collection of finishing touches and modern wardrobe favourites. Discover jewellery and clothing together, and find the piece that feels like you."
      />

      <div className="catalog-layout" id="shop-products">
        <div className="desktop-filter-panel">
          {filterPanel}
        </div>

        <div className="catalog-results">
          <div className="catalog-toolbar">
            <span>
              {shown.length}{' '}
              {shown.length === 1
                ? 'considered piece'
                : 'considered pieces'}
            </span>

            <label className="catalog-sort">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="featured">Recommended</option>
                <option value="newest">Newest Arrivals</option>
                <option value="bestselling">Bestselling</option>
                <option value="price-low">Price Low–High</option>
                <option value="price-high">Price High–Low</option>
              </select>
            </label>
          </div>

          {shown.length > 0 ? (
            <ProductGrid products={shown} />
          ) : (
            <div className="catalog-empty">
              <h2>No pieces found</h2>
              <p>
                Try changing your filters to discover more
                of the collection.
              </p>
              <button type="button" onClick={reset}>
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
