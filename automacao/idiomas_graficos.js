/* Chart windows receive only the display language from their existing opener. */
(()=>{
 'use strict';
 let language='pt-BR',observer,scheduled=false;
 const records=new WeakMap(),attributeRecords=new WeakMap();
 const parentApi=()=>{try{return window.opener&&!window.opener.closed?window.opener.PFI18n:null;}catch(_){return null;}};
 const originalText=node=>{if(!node)return '';if(node.nodeType===3){const saved=records.get(node);return saved&&node.data===saved.last?saved.source:node.data;}return [...(node.childNodes||[])].map(originalText).join('');};
 window.PFI18n={getLanguage:()=>language,canonical:value=>parentApi()?.canonical(value)||value,originalText,translate:(value,target=language)=>parentApi()?.translate(value,target)||value};
 const translate=value=>parentApi()?.translate(value,language)||value;
 const skip=element=>!element||!!element.closest('script,style,.analysis-bars,.pfce-alt,.pfce-bars,.pfce-detail tbody,.pfce-points,svg text,tbody,input,textarea');
 function observe(){observer.observe(document.body,{subtree:true,childList:true,characterData:true});}
 function apply(){scheduled=false;observer?.disconnect();let changed=false;try{const previousLanguage=language;language=parentApi()?.getLanguage()||'pt-BR';changed=language!==previousLanguage;document.documentElement.lang=language;const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){const parent=node.parentElement;if(skip(parent)||!node.data.trim())continue;const previous=records.get(node),source=previous&&node.data===previous.last?previous.source:parentApi()?.canonical(node.data)||node.data;if(parent.tagName==='OPTION'&&!parent.hasAttribute('value'))parent.setAttribute('value',parent.value);const next=translate(source);if(node.data!==next){parent.dataset.pfceUi='true';node.data=next;}records.set(node,{source,last:next});}for(const element of document.querySelectorAll('[title],[aria-label]')){if(skip(element))continue;let saved=attributeRecords.get(element);if(!saved){saved={};attributeRecords.set(element,saved);}for(const name of ['title','aria-label']){const value=element.getAttribute(name);if(!value)continue;const previous=saved[name],source=previous&&value===previous.last?previous.source:value,next=translate(source);if(value!==next)element.setAttribute(name,next);saved[name]={source,last:next};}}}finally{observe();}if(changed)window.PFChartExplorer?.refresh?.();}
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
 function install(){observer=new MutationObserver(schedule);apply();try{if(window.opener){window.opener.addEventListener('pf-language-change',schedule);window.addEventListener('pagehide',()=>{try{window.opener.removeEventListener('pf-language-change',schedule);}catch(_){}},{once:true});}}catch(_){} }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
