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
const productLabels=[['all','All Products'],['notiq','NOTIQ'],['mintiq','MintIQ (K-RAG)'],['shala','School ERP'],['crm','CRM'],['hr-lab','HR-Lab'],['lms','LMS'],['business-erp','Business ERP'],['paper-trading','Paper Trading']];
let activeCategory='all',activeProduct='all';
function addPill(container,value,label,kind){
 const button=document.createElement('button');button.type='button';button.className='na-filter-pill';button.textContent=label;button.dataset.value=value;
 button.setAttribute('aria-pressed',String(value==='all'));
 button.addEventListener('click',()=>{if(kind==='category')activeCategory=value;else activeProduct=value;apply()});
 container.append(button);
}
addPill(category,'all','All','category');
categories.forEach(value=>addPill(category,normalize(value),value,'category'));
productLabels.forEach(([value,label])=>addPill(product,value,label,'product'));
function syncPills(){
 category.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value===activeCategory)));
 product.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value===activeProduct)));
}
function apply(){
 const q=normalize(search.value);
 let visible=0;
 items.forEach(item=>{
  const match=(!q||item.searchText.includes(q))&&(activeCategory==='all'||item.categoryId===activeCategory)&&(activeProduct==='all'||item.productId===activeProduct);
  item.card.hidden=!match;if(match)visible++;
 });
 count.textContent=visible+' '+(visible===1?'article':'articles')+' found';
 empty.hidden=visible!==0;
 syncPills();
}
function reset(){search.value='';activeCategory='all';activeProduct='all';apply();search.focus()}
search.addEventListener('input',apply);
document.getElementById('na-blog-reset')?.addEventListener('click',reset);
document.getElementById('na-blog-clear-empty')?.addEventListener('click',reset);
apply();
})();