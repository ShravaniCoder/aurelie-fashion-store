import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { Breadcrumbs, PageIntro } from '../components/Shared';
import { products, formatPrice } from '../data/products';
import { useStore } from '../context/StoreContext';
import { useSEO } from '../utils/seo';

// Collections is a self-contained curated shopping destination. It features only
// Jewellery and Women's Clothing; it does not link to either catalogue page.
const collectionSections = [
  {
    id: 'jewellery-edit',
    number: '01',
    label: 'THE JEWELLERY EDIT',
    title: <>Little treasures.<br /><em>Lasting impressions.</em></>,
    description: 'A considered selection of luminous pearls, sculptural gold tones and delicate finishing touches. Pieces chosen to feel special, from everyday rituals to meaningful occasions.',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Elegant gold jewellery styled in a warm neutral editorial setting',
    category: 'Jewellery',
    types: ['Earrings', 'Rings', 'Bracelets', 'Necklaces'],
  },
  {
    id: 'clothing-edit',
    number: '02',
    label: 'THE WOMEN’S CLOTHING EDIT',
    title: <>Effortless form.<br /><em>Everyday elegance.</em></>,
    description: 'Soft tailoring, graceful dresses and beautifully considered separates. Discover refined silhouettes with comfortable coverage and timeless styling in a palette made to mix and match.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Women browsing elegant contemporary clothing in a refined boutique',
    category: 'Apparel',
    types: ['Tops', 'Bottoms', 'Dresses', 'Corsets'],
  },
];

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
        <Link to={`/product/${product.id}`} aria-label={`View details for ${product.name}`} className="collection-product-image-link">
          <img loading="lazy" src={product.image} alt={product.name} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/editorial-hero.png'; }} />
        </Link>
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <span className="collection-product-category">{product.type}</span>
      </div>
      <div className="curated-product-meta">
        <div><Link to={`/product/${product.id}`} className="product-name collection-product-name">{product.name}</Link><span className="product-type">{product.category === 'Jewellery' ? 'Fashion Jewellery' : 'Women’s Clothing'}</span></div>
        <span className="product-price">{formatPrice(product.price)}</span>
      </div>
      <p className="curated-product-description">{product.description}</p>
      <div className="curated-product-actions">
        <button className="button button-dark" onClick={add}><ShoppingBag size={14} /> {added ? <><Check size={13} /> Added</> : 'Add to Cart'}</button>
        <button className="button button-light" onClick={buyNow}>Buy Now <ArrowUpRight size={14} /></button>
      </div>
    </article>
  );
}

export default function Collections() {
  useSEO('Curated Collections | Aurélie', 'Explore Aurélie’s curated Fashion Jewellery and Women’s Clothing edits. Shop elegant earrings, rings, bracelets, necklaces, tops, bottoms, dresses and corsets.');
  return (
    <div id="top" className="page-shell collections-page collections-redesigned">
      <Breadcrumbs items={[{ label: 'Collections' }]} />
      <header className="collections-masthead">
        <span className="eyebrow"><Sparkles size={13} /> CURATED BY AURÉLIE</span>
        <h1>Our Collections</h1>
        <p>Two considered worlds. One distinct point of view. Explore our curated edits of fashion jewellery and women’s clothing, with selected pieces to shop directly on this page.</p>
        <div className="collections-jump-links" aria-label="Explore collection categories">
          <a href="#jewellery-edit">01 <span>Fashion Jewellery</span><ArrowDown size={14} /></a>
          <a href="#clothing-edit">02 <span>Women’s Clothing</span><ArrowDown size={14} /></a>
        </div>
      </header>

      {collectionSections.map((section, sectionIndex) => {
        const sectionProducts = products.filter(product => product.category === section.category && section.types.includes(product.type));
        return (
          <section id={section.id} className={`collection-category-section ${sectionIndex % 2 ? 'collection-category-reverse' : ''}`} key={section.id}>
            <div className="collection-category-hero">
              <img src={section.image} alt={section.imageAlt} loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/editorial-hero.png'; }} />
              <div className="collection-category-overlay" />
              <div className="collection-category-copy">
                <span className="collection-number">COLLECTION {section.number}</span>
                <span className="eyebrow">{section.label}</span>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
                <a className="collection-scroll-link" href={`#${section.id}-products`}>Explore the edit <ArrowDown size={14} /></a>
              </div>
            </div>
            <div className="collection-category-details">
              <div className="collection-section-heading">
                <div><span className="eyebrow">THE AURÉLIE SELECTION</span><h3>{section.category === 'Jewellery' ? 'Fashion Jewellery' : 'Women’s Clothing'}</h3></div>
                <span className="collection-count">{sectionProducts.length} selected pieces</span>
              </div>
              <div className="collection-type-pills" aria-label={`${section.category} categories`}>
                {section.types.map(type => <span key={type}>{type}</span>)}
              </div>
              <div id={`${section.id}-products`} className="collection-shop-grid">
                {sectionProducts.map(product => <CuratedProduct key={product.id} product={product} />)}
              </div>
            </div>
          </section>
        );
      })}
      <footer className="collection-endnote collection-endnote-new">
        <span className="eyebrow">A MORE CONSIDERED WARDROBE</span>
        <h2>Find the pieces<br /><em>that feel like you.</em></h2>
        <p>Explore the two Aurélie collection edits above. Every featured item can be added to your bag or purchased directly from this page.</p>
        <a href="#top" className="text-link">Back to the beginning <ArrowUpRight size={15} /></a>
      </footer>
    </div>
  );
}
