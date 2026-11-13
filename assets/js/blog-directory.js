/* Blog directory: filter existing real articles, never invent product content. */
(function(){
'use strict';
const root=document.querySelector('.na-blog');if(!root)return;
const cards=Array.from(root.querySelectorAll('.na-article-list > .na-article-card'));
const search=document.getElementById('na-blog-search'),category=document.getElementById('na-blog-category'),product=document.getElementById('na-blog-product');
const count=document.getElementById('na-blog-count'),empty=document.getElementById('na-blog-empty');
if(!search||!category||!product||!count||!empty)return;
function normalize(s){return (s||'').toLowerCase().trim().replace(/\s+/g,' ')}
function categoryName(raw){return (raw||'General').split(' · ')[0].trim()}
const items=cards.map(card=>{
 const title=card.querySelector('h2')?.textContent||'',desc=card.querySelector('p')?.textContent||'';
 const slug=card.querySelector('a[href]')?.getAttribute('href')||'';
 const categoryLabel=categoryName(card.querySelector('.na-category')?.textContent);
 // Product mapping based on content, rather than inferring every blog is for all Bitmint products.
 const productId=slug.includes('ai-assistants-and-business-knowledge')?'mintiq':'notiq';
 const searchText=normalize([title,desc,categoryLabel,productId].join(' '));
 card.dataset.category=categoryLabel;card.dataset.product=productId;
 return{card,categoryLabel,categoryId:normalize(categoryLabel),productId,searchText};
});
const categories=Array.from(new Set(items.map(x=>x.categoryLabel))).sort((a,b)=>a.localeCompare(b));
categories.forEach(value=>{const option=document.createElement('option');option.value=normalize(value);option.textContent=value;category.append(option)});
function apply(){
 const q=normalize(search.value),cat=category.value,prod=product.value;
 let visible=0;
 items.forEach(item=>{
  const match=(!q||item.searchText.includes(q))&&(cat==='all'||item.categoryId===cat)&&(prod==='all'||item.productId===prod);
  item.card.hidden=!match;if(match)visible++;
 });
 count.textContent=visible+' '+(visible===1?'article':'articles')+' found';
 empty.hidden=visible!==0;
}
function reset(){search.value='';category.value='all';product.value='all';apply();search.focus()}
for(const control of [search,category,product])control.addEventListener(control===search?'input':'change',apply);
document.getElementById('na-blog-reset')?.addEventListener('click',reset);
document.getElementById('na-blog-clear-empty')?.addEventListener('click',reset);
apply();
})();