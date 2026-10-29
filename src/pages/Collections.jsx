import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Breadcrumbs } from '../components/Shared';
import { products, formatPrice } from '../data/products';
import { useStore } from '../context/StoreContext';
import { useSEO } from '../utils/seo';

const THEMES = [
  'Everyday Style',
  'Modern Minimalism',
  'Evening Elegance',
  'Statement Style',
];

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
  { name: 'Blue', hex: '#526A91' },
  { name: 'Red', hex: '#A83232' },
  { name: 'Green', hex: '#657653' },
  { name: 'Pink', hex: '#E7B8C4' },
  { name: 'Grey', hex: '#888888' },
  { name: 'Yellow', hex: '#E6C65B' },
  { name: 'Espresso', hex: '#30221C' },
  { name: 'Navy Blue', hex: '#263A5B' },
  { name: 'Sky Blue', hex: '#A8CDE0' },
  { name: 'Burgundy', hex: '#722F37' },
  { name: 'Olive Green', hex: '#737747' },
  { name: 'Sage Green', hex: '#A3B18A' },
  { name: 'Blush Pink', hex: '#E8C4C4' },
  { name: 'Mustard Yellow', hex: '#C49A27' },
  { name: 'Orange', hex: '#D98245' },
  { name: 'Lavender', hex: '#B7A5CC' },
  { name: 'Purple', hex: '#8064A2' },
  { name: 'Charcoal Grey', hex: '#454545' },
  { name: 'Taupe', hex: '#A39382' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const collectionSections = [
  {
    id: 'jewellery-edit',
    number: '01',
    label: 'THE JEWELLERY EDIT',
    title: (
      <>
        Little treasures.
        <br />
        <em>Lasting impressions.</em>
      </>
    ),
    description:
      'A considered selection of luminous pearls, sculptural gold tones and delicate finishing touches. Pieces chosen to feel special, from everyday rituals to meaningful occasions.',
    image:
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1500&q=85',
    imageAlt:
      'Elegant gold jewellery styled in a warm neutral editorial setting',
    category: 'Jewellery',
    types: ['Earrings', 'Rings', 'Bracelets', 'Necklaces'],
  },
  {
    id: 'clothing-edit',
    number: '02',
    label: 'THE WOMEN’S CLOTHING EDIT',
    title: (
      <>
        Effortless form.
        <br />
        <em>Everyday elegance.</em>
      </>
    ),
    description:
      'Soft tailoring, graceful dresses and beautifully considered separates. Discover refined silhouettes with comfortable coverage and timeless styling in a palette made to mix and match.',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1500&q=85',
    imageAlt:
      'Women browsing elegant contemporary clothing in a refined boutique',
    category: 'Apparel',
    types: ['Tops', 'Bottoms', 'Dresses', 'Corsets'],
  },
];

const normal = (value) =>
  String(value ?? '').trim().toLowerCase();

function getOptions(value) {
  if (value == null) return [];

  return (Array.isArray(value) ? value : [value])
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return String(item).trim();
      }

      return String(
        item?.colour ??
          item?.color ??
          item?.size ??
          item?.name ??
          item?.label ??
          item?.value ??
          ''
      ).trim();
    })
    .filter(Boolean);
}

function getColours(product, category) {
  const direct =
    product.colours ??
    product.colors ??
    product.colour ??
    product.color;

  if (direct != null) return getOptions(direct);

  if (category === 'Jewellery') {
    return getOptions(product.variants);
  }

  return [];
}

function getSizes(product) {
  return getOptions(
    product.sizes ?? product.availableSizes ?? product.variants
  ).map((value) => value.toUpperCase());
}

function getType(product) {
  const type = normal(product.type);
  const compactType = type.replace(/[\s_-]/g, '');

  if (
    ['cordset', 'cordsets', 'coordset', 'coordsets'].includes(
      compactType
    )
  ) {
    return 'Co-ord Sets';
  }

  if (type === 'bottoms') return 'Bottoms';

  if (
    ['co-ord', 'co-ords', 'co ord sets', 'co-ord sets'].includes(type)
  ) {
    return 'Co-ord Sets';
  }

  return product.type || '';
}

function getThemes(product) {
  return [
    product.theme,
    product.themes,
    product.collection,
    product.collections,
    product.style,
    product.styles,
    product.tags,
  ]
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean)
    .map(String);
}

function CuratedProduct({ product }) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const add = () => {
    addToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const buyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <article className="curated-product collection-shop-card">
      <div className="curated-product-image">
        <Link
          to={`/product/${product.id}`}
          aria-label={`View details for ${product.name}`}
          className="collection-product-image-link"
        >
          <img
            loading="lazy"
            src={product.image}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/images/editorial-hero.png';
            }}
          />
        </Link>

        {product.tag && (
          <span className="product-tag">{product.tag}</span>
        )}

        <span className="collection-product-category">
          {getType(product)}
        </span>
      </div>

      <div className="curated-product-meta">
        <div>
          <Link
            to={`/product/${product.id}`}
            className="product-name collection-product-name"
          >
            {product.name}
          </Link>

          <span className="product-type">
            {product.category === 'Jewellery'
              ? 'Fashion Jewellery'
              : 'Women’s Clothing'}
          </span>
        </div>

        <span className="product-price">
          {formatPrice(product.price)}
        </span>
      </div>

      <p className="curated-product-description">
        {product.description}
      </p>

      <div className="curated-product-actions">
        <button className="button button-dark" onClick={add}>
          <ShoppingBag size={14} />

          {added ? (
            <>
              <Check size={13} /> Added
            </>
          ) : (
            'Add to Cart'
          )}
        </button>

        <button className="button button-light" onClick={buyNow}>
          Buy Now <ArrowUpRight size={14} />
        </button>
      </div>
    </article>
  );
}

function CollectionFilters({
  section,
  filters,
  onChange,
  selectedType,
  onTypeChange,
}) {
  const isJewellery = section.category === 'Jewellery';

  const colours = isJewellery
    ? JEWELLERY_COLOURS
    : APPAREL_COLOURS;

  const update = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <aside className="filter-panel collection-filter-panel">
      <div className="filter-title">
        <span>Refine your edit</span>

        <button
          type="button"
          onClick={() =>
            onChange({
              theme: '',
              maxPrice: 8000,
              colour: '',
              size: '',
              sort: 'featured',
            })
          }
        >
          Reset
        </button>
      </div>

      {/* Category buttons inside the filter box; no All pieces option */}
      <div
        className="collection-type-pills collection-type-pills-in-filter"
        aria-label={`Filter ${section.category} products`}
      >
        {section.types.map((type) => {
          const displayType =
            ['cordset', 'cord set', 'cordsets', 'cord sets'].includes(
              normal(type)
            )
              ? 'Co-ord Sets'
              : type;

          return (
            <button
              key={type}
              type="button"
              className={`collection-type-pill ${
                selectedType === type ? 'is-selected' : ''
              }`}
              aria-pressed={selectedType === type}
              onClick={() => onTypeChange(type)}
            >
              {displayType}
              <ArrowUpRight size={12} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="filter-section">
        <label
          className="filter-label"
          htmlFor={`${section.id}-theme`}
        >
          Choose Theme
        </label>

        <select
          id={`${section.id}-theme`}
          value={filters.theme}
          onChange={(event) => update('theme', event.target.value)}
        >
          <option value="">All themes</option>

          {THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label
          className="filter-label"
          htmlFor={`${section.id}-price`}
        >
          <span>Price</span>
          <b>₹{filters.maxPrice.toLocaleString('en-IN')}</b>
        </label>

        <input
          id={`${section.id}-price`}
          className="price-range"
          type="range"
          min="0"
          max="8000"
          step="250"
          value={filters.maxPrice}
          onChange={(event) =>
            update('maxPrice', Number(event.target.value))
          }
        />

        <div className="price-range-labels">
          <span>₹0</span>
          <span>₹8,000</span>
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-label">Colour</span>

        <div className="colour-swatches">
          {colours.map((item) => {
            const selected =
              normal(filters.colour) === normal(item.name);

            return (
              <button
                key={item.name}
                type="button"
                className={`colour-swatch ${
                  selected ? 'is-selected' : ''
                }`}
                style={{ '--swatch-colour': item.hex }}
                title={item.name}
                aria-label={item.name}
                aria-pressed={selected}
                onClick={() =>
                  update('colour', selected ? '' : item.name)
                }
              >
                <span className="colour-swatch-dot" />
              </button>
            );
          })}
        </div>

        {filters.colour && (
          <button
            type="button"
            className="clear-colour"
            onClick={() => update('colour', '')}
          >
            Clear colour · {filters.colour}
          </button>
        )}
      </div>

      {!isJewellery && (
        <div className="filter-section">
          <span className="filter-label">Size</span>

          <div className="shop-size-options">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={`shop-size-option ${
                  filters.size === size ? 'is-selected' : ''
                }`}
                aria-pressed={filters.size === size}
                onClick={() =>
                  update(
                    'size',
                    filters.size === size ? '' : size
                  )
                }
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

const initialFilters = {
  theme: '',
  maxPrice: 8000,
  colour: '',
  size: '',
  sort: 'featured',
};

export default function Collections() {
  const [selectedTypes, setSelectedTypes] = useState({});
  const [sectionFilters, setSectionFilters] = useState({});

  useSEO(
    'Curated Collections | Aurélie',
    'Explore Aurélie’s curated Fashion Jewellery and Women’s Clothing edits.'
  );

  return (
    <div
      id="top"
      className="page-shell collections-page collections-redesigned"
    >
      <Breadcrumbs items={[{ label: 'Collections' }]} />

      <header className="collections-masthead">
        <span className="eyebrow">
          <Sparkles size={13} /> CURATED BY AURÉLIE
        </span>

        <h1>Our Collections</h1>

        <p>
          Two considered worlds. One distinct point of view. Explore
          our curated edits of fashion jewellery and women’s clothing,
          with selected pieces to shop directly on this page.
        </p>

        {/* Non-clickable collection labels */}
        <div
          className="collections-jump-links"
          aria-label="Collection categories"
        >
          <div className="collections-category-label">
            01 <span>Fashion Jewellery</span>
          </div>

          <div className="collections-category-label">
            02 <span>Women’s Clothing</span>
          </div>
        </div>
      </header>

      {collectionSections.map((section, sectionIndex) => {
        const selectedType =
          selectedTypes[section.id] || section.types[0];

        const filters = {
          ...initialFilters,
          ...sectionFilters[section.id],
        };

        let sectionProducts = products.filter((product) => {
          if (product.category !== section.category) return false;

          const productType = normal(getType(product));

          const matchesSectionType = section.types.some(
            (type) =>
              normal(type) === productType ||
              normal(type) === normal(product.type)
          );

          if (!matchesSectionType) return false;

          if (
            productType !== normal(selectedType) &&
            normal(product.type) !== normal(selectedType)
          ) {
            return false;
          }

          if (filters.theme) {
            const themes = getThemes(product);

            if (
              !themes.some(
                (theme) => normal(theme) === normal(filters.theme)
              )
            ) {
              return false;
            }
          }

          if (Number(product.price) > filters.maxPrice) {
            return false;
          }

          if (filters.colour) {
            const productColours = getColours(
              product,
              section.category
            );

            if (
              !productColours.some(
                (colour) =>
                  normal(colour) === normal(filters.colour)
              )
            ) {
              return false;
            }
          }

          if (
            filters.size &&
            !getSizes(product).includes(filters.size)
          ) {
            return false;
          }

          return true;
        });

        if (filters.sort === 'price-low') {
          sectionProducts.sort(
            (a, b) => Number(a.price) - Number(b.price)
          );
        } else if (filters.sort === 'price-high') {
          sectionProducts.sort(
            (a, b) => Number(b.price) - Number(a.price)
          );
        } else if (filters.sort === 'newest') {
          sectionProducts.sort((a, b) => {
            const dateA = new Date(
              a.createdAt ?? a.dateAdded ?? 0
            ).getTime();

            const dateB = new Date(
              b.createdAt ?? b.dateAdded ?? 0
            ).getTime();

            return dateB - dateA;
          });
        }

        return (
          <section
            id={section.id}
            className={`collection-category-section ${
              sectionIndex % 2
                ? 'collection-category-reverse'
                : ''
            }`}
            key={section.id}
          >
            <div className="collection-category-hero">
              <img
                src={section.image}
                alt={section.imageAlt}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/images/editorial-hero.png';
                }}
              />

              <div className="collection-category-overlay" />

              <div className="collection-category-copy">
                <span className="collection-number">
                  COLLECTION {section.number}
                </span>

                <span className="eyebrow">{section.label}</span>

                <h2>{section.title}</h2>

                <p>{section.description}</p>

                <a
                  className="collection-scroll-link"
                  href={`#${section.id}-products`}
                >
                  Explore the edit <ArrowDown size={14} />
                </a>
              </div>
            </div>

            <div className="collection-category-details">
              <div className="collection-section-heading">
                <div>
                  <span className="eyebrow">
                    THE AURÉLIE SELECTION
                  </span>

                  <h3>
                    {section.category === 'Jewellery'
                      ? 'Fashion Jewellery'
                      : 'Women’s Clothing'}
                  </h3>
                </div>

                <span className="collection-count">
                  {sectionProducts.length} selected pieces
                </span>
              </div>

              <div className="collection-products-layout">
                <CollectionFilters
                  section={section}
                  filters={filters}
                  selectedType={selectedType}
                  onTypeChange={(type) =>
                    setSelectedTypes((current) => ({
                      ...current,
                      [section.id]: type,
                    }))
                  }
                  onChange={(nextFilters) =>
                    setSectionFilters((current) => ({
                      ...current,
                      [section.id]: nextFilters,
                    }))
                  }
                />

                <div className="collection-products-main">
                  {/* Count and sorting outside the filter box */}
                  <div className="collection-products-toolbar">
                    <span className="collection-toolbar-count">
                      {sectionProducts.length}{' '}
                      {sectionProducts.length === 1
                        ? 'piece'
                        : 'pieces'}
                    </span>

                    <div className="collection-sort-control">
                      <label htmlFor={`${section.id}-sort`}>
                        Sort by
                      </label>

                      <select
                        id={`${section.id}-sort`}
                        value={filters.sort}
                        onChange={(event) =>
                          setSectionFilters((current) => ({
                            ...current,
                            [section.id]: {
                              ...initialFilters,
                              ...current[section.id],
                              sort: event.target.value,
                            },
                          }))
                        }
                      >
                        
                        <option value="price-low">
                          Price Low–High
                        </option>
                        <option value="price-high">
                          Price High–Low
                        </option>
                      </select>
                    </div>
                  </div>

                  <div
                    id={`${section.id}-products`}
                    className="collection-shop-grid"
                  >
                    {sectionProducts.length ? (
                      sectionProducts.map((product) => (
                        <CuratedProduct
                          key={product.id}
                          product={product}
                        />
                      ))
                    ) : (
                      <p className="collection-empty-state">
                        No pieces match these filters. Please adjust
                        your selection.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <footer className="collection-endnote collection-endnote-new">
        <span className="eyebrow">
          A MORE CONSIDERED WARDROBE
        </span>

        <h2>
          Find the pieces
          <br />
          <em>that feel like you.</em>
        </h2>

        <p>
          Explore the two Aurélie collection edits above. Every
          featured item can be added to your bag or purchased
          directly from this page.
        </p>

        <a href="#top" className="text-link">
          Back to the beginning <ArrowUpRight size={15} />
        </a>
      </footer>
    </div>
  );
}