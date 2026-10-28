import {useEffect} from 'react';
const base='Aurélie — Timeless Elegance';
export function useSEO(title,description='Discover considered fashion jewellery and modern women’s apparel at Aurélie.'){
 useEffect(()=>{document.title=`${title} | ${base}`;let meta=document.querySelector('meta[name="description"]');if(!meta){meta=document.createElement('meta');meta.name='description';document.head.appendChild(meta)}meta.content=description;let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)}canonical.href=window.location.origin+window.location.pathname;},[title,description]);
}
