import {createContext,useContext,useEffect,useMemo,useState} from 'react';
const StoreContext=createContext(null);
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
export function StoreProvider({children}){
 const [cart,setCart]=useState(()=>read('aurelie-cart',[])); const [wishlist,setWishlist]=useState(()=>read('aurelie-wishlist',[]));
 const [orders,setOrders]=useState(()=>read('aurelie-orders',[])); const [customer,setCustomer]=useState(()=>read('aurelie-customer',null));
 useEffect(()=>localStorage.setItem('aurelie-cart',JSON.stringify(cart)),[cart]); useEffect(()=>localStorage.setItem('aurelie-wishlist',JSON.stringify(wishlist)),[wishlist]); useEffect(()=>localStorage.setItem('aurelie-orders',JSON.stringify(orders)),[orders]); useEffect(()=>localStorage.setItem('aurelie-customer',JSON.stringify(customer)),[customer]);
 const addToCart=(product,variant=product.variants?.[0]||'Standard',quantity=1)=>setCart(prev=>{const key=product.id+':'+variant;const found=prev.find(x=>x.key===key);return found?prev.map(x=>x.key===key?{...x,quantity:Math.min(20,x.quantity+quantity)}:x):[...prev,{key,product,variant,quantity}]});
 const updateQuantity=(key,quantity)=>setCart(prev=>quantity<1?prev.filter(x=>x.key!==key):prev.map(x=>x.key===key?{...x,quantity:Math.min(20,quantity)}:x));
 const removeFromCart=key=>setCart(prev=>prev.filter(x=>x.key!==key)); const toggleWishlist=p=>setWishlist(prev=>prev.some(x=>x.id===p.id)?prev.filter(x=>x.id!==p.id):[...prev,p]);
 const createOrder=details=>{const order={id:'AU'+Date.now().toString().slice(-8),date:new Date().toISOString(),status:'Order received',items:cart,details,total:cart.reduce((s,x)=>s+x.product.price*x.quantity,0)};setOrders(prev=>[order,...prev]);setCart([]);return order;};
 const value=useMemo(()=>({cart,wishlist,orders,customer,setCustomer,addToCart,updateQuantity,removeFromCart,toggleWishlist,createOrder,cartCount:cart.reduce((s,x)=>s+x.quantity,0),subtotal:cart.reduce((s,x)=>s+x.product.price*x.quantity,0)}),[cart,wishlist,orders,customer]);
 return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
export const useStore=()=>useContext(StoreContext);
