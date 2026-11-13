/* Shared navigation: close on Escape/outside click, identify current page and homepage section. */
(function(){
 "use strict";
 const header=document.querySelector(".unav-header");
 if(!header)return;
 const details=Array.from(header.querySelectorAll("details"));
 const normalize=p=>p.replace(/\/index\.html$/,"/").replace(/\.html$/,"").replace(/\/$/,"/")||"/";
 const current=normalize(window.location.pathname);
 const anchors=Array.from(header.querySelectorAll('a[href]'));
 anchors.forEach(a=>{
   const u=new URL(a.getAttribute("href"),window.location.href);
   if(u.origin!==window.location.origin)return;
   const target=normalize(u.pathname);
   if(u.hash)return;
   if(current===target&&(a.closest(".unav-desktop,.unav-mobile")||a.closest(".unav-submenu"))){
     a.setAttribute("aria-current","page");
   }
 });
 // Keep the Products control highlighted on the product detail and catalogue pages.
 if(window.location.pathname.indexOf("/products/")>=0){
   header.querySelectorAll(".unav-products>summary").forEach(s=>s.classList.add("unav-selected"));
 }
 if(window.location.pathname.indexOf("/blog/")>=0){
   header.querySelectorAll('a[href]').forEach(a=>{
     const u=new URL(a.getAttribute("href"),window.location.href);
     if(normalize(u.pathname)==="/blog/"&&!a.hasAttribute("aria-current"))a.setAttribute("aria-current","location");
   });
 }
 function closeAll(){details.forEach(d=>{d.open=false})}
 document.addEventListener("keydown",e=>{if(e.key==="Escape"){const active=details.filter(d=>d.open&&d.contains(document.activeElement)).at(-1);closeAll();if(active)active.querySelector(":scope > summary")?.focus();}});
 document.addEventListener("click",e=>{if(!header.contains(e.target))closeAll()});
 details.forEach(d=>d.addEventListener("toggle",()=>{
   if(!d.open)return;
   if(d.classList.contains("unav-mobile")){
     header.querySelectorAll(".unav-desktop details").forEach(other=>other.open=false);
   }else if(d.closest(".unav-desktop")){
     header.querySelectorAll(".unav-mobile").forEach(other=>other.open=false);
   }
 }));
 header.querySelectorAll(".unav-mobile>nav a").forEach(a=>a.addEventListener("click",closeAll));
 if(document.body.querySelector("#home")){
   const ids=["home","custom-solutions","process","about","contact"];
   const links=anchors.filter(a=>{try{const u=new URL(a.href);return normalize(u.pathname)===current&&ids.includes(u.hash.slice(1))}catch{return false}});
   function update(){
     let id="home";for(const name of ids){const el=document.getElementById(name);if(el&&el.getBoundingClientRect().top<=160)id=name;}
     links.forEach(a=>{a.removeAttribute("aria-current");if(a.hash==="#"+id)a.setAttribute("aria-current","location")});
   }
   window.addEventListener("scroll",update,{passive:true});update();
 }
})();
