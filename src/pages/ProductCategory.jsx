
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



const JEWELLERY_COLOURS = [
  { name: 'Gold', hex: '#C6A15B' },
  { name: 'Rose Gold', hex: '#C58D83' },
  { name: 'Silver', hex: '#C7C9CC' },
];




const APPAREL_COLOURS = [
  { name: 'Black', hex: '#202020' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Ivory', hex: '#F8F4ED' },
  { name: 'Beige', hex: '#D9C8B4' },
  { name: 'Brown', hex: '#795548' },
  { name: 'Espresso', hex: '#30221C' },
  { name: 'Blue', hex: '#526A91' },
  { name: 'Navy Blue', hex: '#263A5B' },
  { name: 'Sky Blue', hex: '#A8CDE0' },
  { name: 'Red', hex: '#A83232' },
  { name: 'Burgundy', hex: '#722F37' },
  { name: 'Green', hex: '#657653' },
  { name: 'Olive Green', hex: '#737747' },
  { name: 'Sage Green', hex: '#A3B18A' },
  { name: 'Pink', hex: '#E7B8C4' },
  { name: 'Blush Pink', hex: '#E8C4C4' },
  { name: 'Yellow', hex: '#E6C65B' },
  { name: 'Mustard Yellow', hex: '#C49A27' },
  { name: 'Orange', hex: '#D98245' },
  { name: 'Lavender', hex: '#B7A5CC' },
  { name: 'Purple', hex: '#8064A2' },
 
];


const normalize = (value) =>
  String(value ?? '').trim().toLowerCase();

function getType(product, isJewellery) {
  const type = normalize(product.type);

  if (!isJewellery && type === 'bottoms') {
    return 'Trousers';
  }

  if (
    !isJewellery &&
    ['co-ord', 'co-ords', 'co ord sets', 'co-ord sets'].includes(type)
  ) {
    return 'Co-ord Sets';
  }

  const order = isJewellery ? JEWELLERY_ORDER : APPAREL_ORDER;

  return order.find((item) => normalize(item) === type) || '';
}

function extractOptionNames(value) {
  if (value == null) return [];

  const values = Array.isArray(value) ? value : [value];

  return values
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return String(item).trim();
      }

      if (item && typeof item === 'object') {
        return String(
          item.colour ??
          item.color ??
          item.colourName ??
          item.colorName ??
          item.size ??
          item.name ??
          item.label ??
          item.value ??
          ''
        ).trim();
      }

      return '';
    })
    .filter(Boolean);
}

function getColours(product, isJewellery) {
  const direct =
    product.colours ??
    product.colors ??
    product.colour ??
    product.color;

  if (direct != null) {
    return extractOptionNames(direct);
  }

  // Jewellery variants may contain Gold, Rose Gold and Silver.
  if (isJewellery) {
    return extractOptionNames(product.variants);
  }

  // Do not interpret apparel sizes as colours.
  return [];
}

function getSizes(product) {
  const raw =
    product.sizes ??
    product.availableSizes ??
    product.variants ??
    [];

  return [
    ...new Set(
      extractOptionNames(raw)
        .map((item) => item.toUpperCase())
        .filter((item) => SIZES.includes(item))
    ),
  ];
}

export default function ProductCategory({ kind }) {
  const isJewellery = kind === 'Jewellery';
  const title = isJewellery ? 'Jewellery' : 'Women’s Apparel';
  const types = isJewellery ? JEWELLERY_ORDER : APPAREL_ORDER;
  const colours = isJewellery
    ? JEWELLERY_COLOURS
    : APPAREL_COLOURS;

  useSEO(
    `${title} | Aurélie`,
    isJewellery
      ? 'Discover earrings, necklaces, rings and bracelets from the Aurélie jewellery collection.'
      : 'Explore tops, shirts, dresses, trousers and co-ord sets from Aurélie.'
  );

  const categoryProducts = useMemo(() => {
    return products
      .filter((product) => {
        const category = normalize(product.category);

        const correctCategory = isJewellery
          ? ['jewellery', 'jewelry'].includes(category)
          : [
              'apparel',
              'women’s apparel',
              "women's apparel",
              'clothing',
              'women apparel',
            ].includes(category);

        return correctCategory && Boolean(getType(product, isJewellery));
      })
      .sort(
        (a, b) =>
          types.indexOf(getType(a, isJewellery)) -
          types.indexOf(getType(b, isJewellery))
      );
  }, [isJewellery, types]);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [maxPrice, setMaxPrice] = useState(8000);
  const [colour, setColour] = useState('');
  const [size, setSize] = useState('');
  const [sort, setSort] = useState('newest');

  const shown = useMemo(() => {
    const result = categoryProducts.filter((product) => {
      const productColours = getColours(product, isJewellery);
      const productSizes = getSizes(product);

      const searchableText = [
        product.name,
        product.type,
        product.category,
        ...productColours,
        ...productSizes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!type || getType(product, isJewellery) === type) &&
        Number(product.price) <= maxPrice &&
        (
          !colour ||
          productColours.some(
            (value) => normalize(value) === normalize(colour)
          )
        ) &&
        (isJewellery || !size || productSizes.includes(size)) &&
        searchableText.includes(query.trim().toLowerCase())
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

        return (
          (Number.isFinite(dateB) ? dateB : 0) -
          (Number.isFinite(dateA) ? dateA : 0)
        );
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
    isJewellery,
    type,
    maxPrice,
    colour,
    size,
    query,
    sort,
  ]);

  const reset = () => {
    setQuery('');
    setType('');
    setMaxPrice(8000);
    setColour('');
    setSize('');
    setSort('newest');
  };

  return (
    <main className="page-shell product-category-catalog">
      <Breadcrumbs items={[{ label: title }]} />

      <PageIntro
        eyebrow={isJewellery ? 'The jewellery edit' : 'The modern wardrobe'}
        title={title}
        description={
          isJewellery
            ? 'Earrings, necklaces, rings and bracelets. Thoughtful finishing touches for every occasion.'
            : 'Tops, shirts, dresses, trousers and co-ord sets for a modern wardrobe.'
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

          {/* Type */}
          <div className="filter-section">
            <label className="filter-label" htmlFor={`${kind}-type`}>
              {isJewellery ? 'Jewellery Type' : 'Clothing Type'}
            </label>

            <select
              id={`${kind}-type`}
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="">All types</option>
              {types.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
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
              onChange={(event) =>
                setMaxPrice(Number(event.target.value))
              }
            />

            <div className="price-range-labels">
              <span>₹0</span>
              <span>₹8,000</span>
            </div>
          </div>

          {/* Colour circles */}
          <div className="filter-section">
            <span className="filter-label">Colour</span>

            <div className="colour-swatches">
              {colours.map((swatch) => {
                const selected =
                  normalize(colour) === normalize(swatch.name);

                return (
                  <button
                    key={swatch.name}
                    type="button"
                    className={`colour-swatch ${
                      selected ? 'is-selected' : ''
                    }`}
                    style={{ '--swatch-colour': swatch.hex }}
                    onClick={() =>
                      setColour(selected ? '' : swatch.name)
                    }
                    title={swatch.name}
                    aria-label={swatch.name}
                    aria-pressed={selected}
                  >
                    <span className="colour-swatch-dot" />
                  </button>
                );
              })}
            </div>

            {colour && (
              <button
                type="button"
                className="clear-colour"
                onClick={() => setColour('')}
              >
                Clear colour · {colour}
              </button>
            )}
          </div>

          {/* Apparel sizes only */}
          {!isJewellery && (
            <div className="filter-section">
              <span className="filter-label">Size</span>

              <div className="shop-size-options">
                {SIZES.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`shop-size-option ${
                      size === item ? 'is-selected' : ''
                    }`}
                    onClick={() =>
                      setSize(size === item ? '' : item)
                    }
                    aria-pressed={size === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
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

          {shown.length > 0 ? (
            <ProductGrid products={shown} />
          ) : (
            <div className="empty-state">
              <p>No pieces found. Try adjusting your filters.</p>
              <button type="button" onClick={reset}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
