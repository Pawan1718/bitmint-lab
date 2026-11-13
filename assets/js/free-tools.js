/* Local-only tools: no form data is sent to Bitmint Lab. */
(function(){
 "use strict";
 const linkForm=document.getElementById("wa-link-form");
 if(linkForm){
   const output=document.getElementById("wa-link-output"),urlText=document.getElementById("wa-link-url"),visit=document.getElementById("wa-link-visit"),status=document.getElementById("wa-link-status");
   let generated="";
   linkForm.addEventListener("submit",function(e){
     e.preventDefault();status.textContent="";
     const digits=document.getElementById("wa-phone").value.replace(/[^0-9]/g,"");
     if(digits.length<8||digits.length>15){status.textContent="Enter a valid country code and phone number (8–15 digits).";output.hidden=true;return;}
     const msg=document.getElementById("wa-message").value.trim();
     generated="https://wa.me/"+digits+(msg?"?text="+encodeURIComponent(msg):"");
     urlText.textContent=generated;visit.href=generated;output.hidden=false;status.textContent="Link generated. Check the number before sharing.";
   });
   document.getElementById("wa-copy").addEventListener("click",async function(){
     if(!generated)return;
     try{await navigator.clipboard.writeText(generated);status.textContent="Link copied.";}catch{status.textContent="Please select and copy the displayed link manually.";}
   });
 }
 const calc=document.getElementById("wa-cost-form");
 if(calc){
   const ids=["marketing","utility","authentication"],fmt=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
   const result=document.getElementById("wa-cost-output"),tbody=document.getElementById("wa-cost-rows"),total=document.getElementById("wa-cost-total");
   calc.addEventListener("submit",function(e){e.preventDefault();tbody.replaceChildren();let sum=0;for(const id of ids){
     const count=Number(document.getElementById("wa-"+id+"-count").value),rate=Number(document.getElementById("wa-"+id+"-rate").value);
     if(!Number.isFinite(count)||!Number.isFinite(rate)||count<0||rate<0)return;
     const cost=count*rate;sum+=cost;
     const tr=document.createElement("tr"),name=document.createElement("th"),value=document.createElement("td");name.scope="row";name.textContent=id[0].toUpperCase()+id.slice(1)+" ("+count.toLocaleString("en-IN")+" × "+fmt.format(rate)+")";value.textContent=fmt.format(cost);tr.append(name,value);tbody.append(tr);
   }
   const fee=Number(document.getElementById("wa-platform-fee").value);
   if(!Number.isFinite(fee)||fee<0)return;
   sum+=fee;
   const tr=document.createElement("tr"),td1=document.createElement("th"),td2=document.createElement("td");td1.scope="row";td1.textContent="Software fee";td2.textContent=fmt.format(fee);tr.append(td1,td2);tbody.append(tr);
   total.textContent=fmt.format(sum);result.hidden=false;
   });
 }
})();