/* ponys v0.3.4 */let e=document;export default class{static define(r,n,l){if(!n.content){let t=e.createElement('template');t.innerHTML=n,n=t}let o=(n=n.content).querySelector('script')||0;return import('data:text/javascript;base64,'+btoa(o.text)).then((e=>{o&&o.remove();class a extends(e.default||HTMLElement){constructor(){super();let e=this;try{e=e.attachShadow({mode:'open'})}catch{}this.$=t=>e.querySelector(t),this.$$=t=>e.querySelectorAll(t);let r=n.cloneNode(!0);t(this,r),e.append(r)}}return customElements.define(r,a,l),a}))}static defineAll(t=e){return Promise.allSettled([...t.querySelectorAll('template[name]')].map((e=>{let t={};for(let{name:r,value:n}of e.attributes)t[r]=n;return t.src?this.import(t.name,t.src,t):this.define(t.name,e,t)})))}static import(e,t,r){return fetch(t).then((e=>e.ok?e.text():Promise.reject(Error(t)))).then((t=>this.define(e,t,r)))}}function t(e,r){for(let n of r.children)n.host=e,n.$=e.$,n.$$=e.$$,t(e,n)}
