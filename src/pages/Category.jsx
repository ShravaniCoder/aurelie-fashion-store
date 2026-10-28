import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { products } from '../data/products';
import { Breadcrumbs, ProductGrid } from '../components/Shared';
import { useSEO } from '../utils/seo';

export default function Category({ kind }) {
  const jewellery = kind === 'Jewellery';
  const category = jewellery ? 'Jewellery' : 'Apparel';
  const options = jewellery
    ? ['Earrings', 'Rings', 'Bracelets', 'Necklaces']
    : ['Tops', 'Bottoms', 'Dresses', 'Corsets'];
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedType = searchParams.get('type');
  const [sort, setSort] = useState('featured');
  const type = options.includes(requestedType) ? requestedType : 'All';

  useEffect(() => {
    // Keep invalid/old query values from leaving the page in a confusing state.
    if (requestedType && !options.includes(requestedType)) {
      const next = new URLSearchParams(searchParams);
      next.delete('type');
      setSearchParams(next, { replace: true });
    }
  }, [kind, requestedType, searchParams, setSearchParams]);

  useSEO(
    jewellery ? 'Fashion Jewellery | Aurélie' : 'Women’s Clothing | Aurélie',
    `Explore Aurélie ${category.toLowerCase()}${type !== 'All' ? ` — ${type.toLowerCase()}` : ''}. Considered designs, elevated details and modern classics.`
  );

  const list = useMemo(() => {
    const filtered = products.filter(product =>
      product.category === category && (type === 'All' || product.type === type)
    );
    if (sort === 'low') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [category, type, sort]);

  const chooseType = value => {
    const next = new URLSearchParams(searchParams);
    if (value === 'All') next.delete('type');
    else next.set('type', value);
    setSearchParams(next);
  };

  return (
    <main className="page-shell category-page category-page-polished">
      <Breadcrumbs items={[{ label: category, to: `/${jewellery ? 'jewellery' : 'apparel'}` }, ...(type !== 'All' ? [{ label: type }] : [])]} />
      <section className="category-hero category-hero-polished">
        <img
          src={jewellery
            ? 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=85'
            : 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85'}
          alt={`${category} editorial`}
          onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/editorial-hero.png'; }}
        />
        <div className="category-hero-shade" />
        <div className="category-hero-copy">
          <span className="eyebrow">{jewellery ? 'THE FINISHING TOUCH' : 'THE MODERN WARDROBE'}</span>
          <h1>{jewellery ? 'Fashion Jewellery' : 'Women’s Clothing'}</h1>
          <p>{jewellery
            ? 'Sculptural silhouettes and delicate details that make the everyday feel special.'
            : 'Effortless shapes, considered details and timeless pieces for the way you live.'}</p>
          <span className="category-hero-note">THE AURÉLIE SELECTION · {String(list.length).padStart(2, '0')} PIECES</span>
        </div>
      </section>

      <section className="category-results" aria-label="Category products">
        <div className="category-results-heading">
          <div>
            <span className="eyebrow">SHOP THE EDIT</span>
            <h2>{type === 'All' ? (jewellery ? 'Jewellery, considered.' : 'Clothing, thoughtfully chosen.') : type}</h2>
            <p>{list.length} {list.length === 1 ? 'piece' : 'pieces'} selected for you</p>
          </div>
          <label className="category-sort"><SlidersHorizontal size={14} /> Sort by
            <select value={sort} onChange={event => setSort(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>
        <nav className="category-filter-row category-filter-row-polished" aria-label={`Filter ${category} by type`}>
          <button type="button" className={`category-filter-chip ${type === 'All' ? 'active' : ''}`} onClick={() => chooseType('All')} aria-pressed={type === 'All'}>All pieces</button>
          {options.map(option => (
            <button key={option} type="button" className={`category-filter-chip ${type === option ? 'active' : ''}`} onClick={() => chooseType(option)} aria-pressed={type === option}>{option}</button>
          ))}
        </nav>
        <div key={`${category}-${type}-${sort}`} className="category-results-grid-wrap">
          <ProductGrid products={list} />
        </div>
        <div className="category-back-link"><Link to="/collections">Back to all collections <ArrowUpRight size={14} /></Link></div>
      </section>
    </main>
  );
}
