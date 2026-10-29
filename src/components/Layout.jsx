import {useState} from 'react';import {Link,NavLink,Outlet,useNavigate} from 'react-router-dom';import {Menu,Search,Heart,ShoppingBag,UserRound,X,ArrowUpRight} from 'lucide-react';import {useStore} from '../context/StoreContext';
const nav=[['Home','/'],['Shop All','/shop'],['Collections','/collections'],['Jewellery','/jewellery'],["Women’s Apparel",'/apparel']];
export function Header(){const [open,setOpen]=useState(false),[search,setSearch]=useState(false),[query,setQuery]=useState('');const {cartCount,wishlist}=useStore();const navigate=useNavigate();const submit=e=>{e.preventDefault();navigate('/shop?q='+encodeURIComponent(query));setSearch(false);setOpen(false)};return <><div className="announcement">A considered wardrobe, delivered with care <span>Complimentary shipping on orders over ₹3,500</span></div><header className="site-header"><button className="icon-button mobile-only" aria-label="Open menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><Link to="/" className="wordmark">AURÉLIE<span>TIMELESS ELEGANCE</span></Link><nav className="desktop-nav">{nav.map(([label,path])=><NavLink key={path} to={path} end={path==='/'}>{label}</NavLink>)}</nav><div className="header-actions"><button className="icon-button" aria-label="Search" onClick={()=>setSearch(!search)}><Search size={18}/></button><Link className="icon-button" aria-label="Wishlist" to="/wishlist"><Heart size={18}/><i>{wishlist.length}</i></Link><Link className="icon-button" aria-label="My account" to="/account"><UserRound size={18}/></Link><Link className="icon-button" aria-label="Shopping bag" to="/cart"><ShoppingBag size={18}/><i>{cartCount}</i></Link></div></header>{search&&<form className="search-drawer" onSubmit={submit}><Search size={18}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search jewellery, apparel, occasion…" aria-label="Search products"/><button className="text-link">Search <ArrowUpRight size={14}/></button></form>}{open&&<nav className="mobile-nav">{nav.map(([label,path])=><Link key={path} to={path} onClick={()=>setOpen(false)}>{label}</Link>)}<Link to="/about" onClick={()=>setOpen(false)}>About Us</Link><Link to="/contact" onClick={()=>setOpen(false)}>Contact</Link></nav>}</>}


export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="wordmark footer-mark">
            AURÉLIE
            <span>TIMELESS ELEGANCE</span>
          </Link>
          <p>Timeless pieces. Effortless elegance.</p>
        </div>

        <div className="footer-link-group">
          <h4>Explore</h4>
          <Link to="/shop">Shop All</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/jewellery">Jewellery</Link>
          <Link to="/apparel">Women’s Apparel</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-link-group">
          <h4>Support</h4>
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/track-order">Track Order</Link>
          <Link to="/shipping-policy">Shipping & Delivery</Link>
          <Link to="/returns-refunds">Returns & Refunds</Link>
        </div>

        <div className="footer-link-group footer-news">
          <h4>Stay in the know</h4>
          <p>New arrivals and thoughtful styling, occasionally.</p>

          <form
            className="newsletter"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Please connect your email service to activate subscriptions.");
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              aria-label="Your email address"
            />
            <button type="submit" aria-label="Subscribe">
              <ArrowUpRight size={15} />
            </button>
          </form>

          <div className="footer-legal">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-and-conditions">Terms</Link>
            <Link to="/cancellation-policy">Cancellations</Link>
            <Link to="/payment-policy">Payments</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Aurélie Studio</span>
        <span>Designed with intention · India</span>
      </div>
    </footer>
  );
}

export default function Layout(){return <><Header/><main><Outlet/></main><Footer/></>}
