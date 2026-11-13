/* Reader enhancements: safe link handoff; AI summary prompts run on external services. */
(function(){
'use strict';
const article=document.querySelector('main > article.na-article');if(!article)return;
const main=article.parentElement;if(!main)return;
const back=Array.from(main.children).find(x=>x.classList.contains('na-back'));
const layout=document.createElement('div');layout.className='na-reader-layout';
const left=document.createElement('aside');left.className='na-reader-left';left.setAttribute('aria-label','NOTIQ signup');
const card=document.createElement('div');card.className='na-reader-card na-signup-card';
card.innerHTML='<span class="na-reader-eyebrow">NOTIQ · BUSINESS MESSAGING</span><h2>Start with NOTIQ</h2><p>Create a workspace for customer conversations, campaigns and automation.</p><form class="na-signup-form"><label for="na-signup-email">Business email</label><input id="na-signup-email" type="email" name="email" placeholder="you@company.com" autocomplete="email" maxlength="250" required><button type="submit">Continue to NOTIQ →</button></form><small>Registration takes place on the NOTIQ website. No details are submitted or stored on this blog.</small><a class="na-signup-demo" href="https://notiq.bitmintlab.in/book-demo">Prefer a demo? Book one →</a>';
left.append(card);const center=document.createElement('div');center.className='na-reader-center';const right=document.createElement('aside');right.className='na-reader-right';right.setAttribute('aria-label','Article contents');
const toc=document.createElement('nav');toc.className='na-reader-card';toc.setAttribute('aria-label','On this page');const tocHeading=document.createElement('div');tocHeading.className='na-toc-heading';tocHeading.textContent='ON THIS PAGE';const list=document.createElement('ol');list.className='na-toc-list';toc.append(tocHeading,list);right.append(toc);
main.insertBefore(layout,article);layout.append(left,center,right);center.append(article);if(back)center.append(back);
card.querySelector('form').addEventListener('submit',function(e){e.preventDefault();if(!this.reportValidity())return;const url=new URL('https://notiq.bitmintlab.in/register');url.searchParams.set('email',this.elements.email.value.trim());window.location.assign(url.href)});
const headings=Array.from(article.querySelectorAll('section > h2,section > h3'));
headings.forEach((h,i)=>{const section=h.closest('section');if(!section)return;if(!section.id)section.id='blog-section-'+(i+1);const li=document.createElement('li');if(h.tagName==='H3')li.className='na-toc-subitem';const a=document.createElement('a');a.href='#'+section.id;a.textContent=h.textContent.trim();li.append(a);list.append(li)});
if(!list.children.length)right.hidden=true;
else {const links=Array.from(list.querySelectorAll('a'));function update(){let selected=links[0];links.forEach(link=>{const el=document.getElementById(link.hash.slice(1));if(el&&el.getBoundingClientRect().top<175)selected=link});links.forEach(link=>{if(link===selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}window.addEventListener('scroll',update,{passive:true});update()}
const box=document.createElement('div');box.className='na-ai-summary';const heading=document.createElement('strong');heading.textContent='Summarize this article with AI';const note=document.createElement('p');note.textContent='Open this article with your chosen AI tool. Article text is included in the prompt; review the result for accuracy.';const actions=document.createElement('div');actions.className='na-ai-actions';const state=document.createElement('span');state.className='na-ai-state';state.setAttribute('role','status');state.setAttribute('aria-live','polite');
function getPrompt(){const title=article.querySelector('h1')?.textContent.trim()||document.title;const text=Array.from(article.querySelectorAll('.na-lead,section h2,section h3,section p,section li')).map(x=>x.textContent.trim()).filter(Boolean).join('\n').slice(0,10500);return 'Summarize this article into five concise key takeaways and practical steps. Identify important caveats. Use only the supplied source and do not invent facts.\nArticle: '+title+'\nSource: '+location.href.split('#')[0]+'\n\n'+text}
const providers=[
{label:'ChatGPT',icon:'openai',url:p=>'https://chatgpt.com/?q='+encodeURIComponent(p)},
{label:'Perplexity',icon:'perplexity',url:p=>'https://www.perplexity.ai/search?q='+encodeURIComponent(p)},
{label:'Gemini',icon:'googlegemini',url:()=> 'https://gemini.google.com/app'},
{label:'Claude',icon:'claude',url:()=> 'https://claude.ai/new'}
];
const copyText=async text=>{try{await navigator.clipboard.writeText(text);return true}catch{return false}};
providers.forEach(provider=>{
const a=document.createElement('a');a.className='na-ai-service';a.target='_blank';a.rel='noopener noreferrer';a.href=provider.url(getPrompt());a.setAttribute('aria-label','Summarize with '+provider.label+' (new tab)');
const icon=document.createElement('img');icon.src='https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/'+provider.icon+'.svg';icon.alt='';icon.width=19;icon.height=19;icon.loading='lazy';icon.onerror=()=>{icon.style.display='none'};a.append(icon,document.createTextNode(provider.label));a.addEventListener('click',async()=>{a.href=provider.url(getPrompt());if(provider.label==='Gemini'||provider.label==='Claude'){const ok=await copyText(getPrompt());state.textContent=ok?'Prompt copied. Paste it into '+provider.label+'.':'Copy the prompt manually to use '+provider.label+'.';}});actions.append(a);
});
function getMarkdown(){
 const lines=['# '+(article.querySelector('h1')?.textContent.trim()||document.title),'','Source: '+location.href.split('#')[0],''];
 const source=article.querySelectorAll('.na-lead,section h2,section h3,section p,section ul li,section ol li');
 source.forEach(el=>{const value=el.textContent.replace(/\s+/g,' ').trim();if(!value)return;
 if(el.matches('h2'))lines.push('## '+value,'');
 else if(el.matches('h3'))lines.push('### '+value,'');
 else if(el.matches('li'))lines.push('- '+value);
 else lines.push(value,'');
 });
 return lines.join('\n');
}
const makeCopy=(label,content,success)=>{
 const button=document.createElement('button');button.className='na-ai-copy';button.type='button';button.textContent=label;button.addEventListener('click',async()=>{const ok=await copyText(content());state.textContent=ok?success:'Copy unavailable. Please allow clipboard access.'});actions.append(button);
};
makeCopy('Copy Prompt',getPrompt,'AI summary prompt copied.');
makeCopy('Copy Markdown',getMarkdown,'Article Markdown copied.');
box.append(heading,note,actions,state);const insertAfter=article.querySelector('.na-lead')||article.querySelector('.na-article-hero')||article.querySelector('h1');insertAfter?.insertAdjacentElement('afterend',box);
})();
