import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../assets/js/analytics.js', import.meta.url), 'utf8');
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.style = {}; this.listeners = {}; this.value = ''; }
  setAttribute(k,v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k]; }
  appendChild(e) { this.children.push(e); return e; }
  addEventListener(k,fn) { this.listeners[k] = fn; }
  querySelector(selector) {
    const name = selector.match(/name="([^"]+)"/)?.[1];
    return this.children.find(e => name ? e.name === name : selector.includes('data-tv-form-status') ? 'data-tv-form-status' in e.attrs : e.tag === selector) || null;
  }
  querySelectorAll() { return this.children.filter(e => e.type === 'submit'); }
  focus() {}
}
class Form extends Element {
  constructor() { super('form'); this.attrs.name = 'journey-enquiry'; this.valid = true; const b = new Element('button'); b.type = 'submit'; this.appendChild(b); }
  reportValidity() { return this.valid; }
}
const storage = initial => ({ values: {...initial}, getItem(k) { return this.values[k] ?? null; }, setItem(k,v) { this.values[k] = v; } });
function setup({id='G-TEST123', consent='granted', pathname='/tours/varanasi/', search='', session=storage(), blocked=false, fetchImpl=async()=>({ok:true})}={}) {
  const form = new Form(), calls = [], redirects = [], listeners = {};
  const document = { readyState:'complete', referrer:'https://example.com/?private=secret', head:new Element('head'), body:new Element('body'), createElement:t=>new Element(t), querySelector:()=>null, querySelectorAll:()=>[form], addEventListener:(k,fn)=>{listeners[k]=fn;} };
  const window = { TV_ANALYTICS_CONFIG:{measurementId:id}, location:{origin:'https://www.tourvaranasi.com',pathname,search,assign:p=>redirects.push(p),reload(){}}, localStorage:storage({'tv.analytics-consent.v1':consent}), sessionStorage:session, fetch:async(...args)=>{calls.push(args);return fetchImpl(...args);} };
  if (blocked) for (const key of ['localStorage','sessionStorage']) Object.defineProperty(window,key,{get(){throw Error('blocked');}});
  class FormData extends Map { constructor(f){super(f.children.filter(e=>e.name).map(e=>[e.name,e.value]));} }
  vm.runInNewContext(source,{window,document,URL,URLSearchParams,HTMLFormElement:Form,FormData,Date,Set,WeakSet});
  const submit = () => listeners.submit({target:form,defaultPrevented:false,preventDefault(){}});
  const events = () => (window.dataLayer || []).filter(x=>x[0]==='event').map(x=>({name:x[1],data:x[2]}));
  return {window,document,form,calls,redirects,listeners,submit,events};
}
test('accepted submission counts once, includes source, and redirects',async()=>{
  const x=setup(); await x.submit(); await x.submit();
  assert.equal(x.calls.length,1); assert.equal(x.events().filter(e=>e.name==='generate_lead').length,1);
  assert.deepEqual(x.redirects,['/thank-you/']);
  assert.equal(new URLSearchParams(x.calls[0][1].body).get('source_page'),'/tours/varanasi/');
  assert.ok(!JSON.stringify(x.events()).includes('private=secret'));
});
test('HTTP and network failures retain form and never count a lead',async()=>{
  for (const fetchImpl of [async()=>({ok:false}),async()=>{throw Error('offline');}]) {
    const x=setup({fetchImpl}); await x.submit();
    assert.equal(x.events().filter(e=>e.name==='generate_lead').length,0); assert.equal(x.redirects.length,0);
    assert.equal(x.form.children[0].disabled,false); assert.match(x.form.querySelector('[data-tv-form-status]').textContent,/could not confirm/);
  }
});
test('invalid forms and honeypots do not submit',async()=>{
  const x=setup(); x.form.valid=false; await x.submit(); assert.equal(x.calls.length,0);
  x.form.valid=true; const trap=new Element('input'); trap.name='company-website'; trap.value='bot';x.form.appendChild(trap);
  await x.submit(); assert.equal(x.calls.length,0);
});
test('pending double submissions create one request',async()=>{
  let resolve; const x=setup({fetchImpl:()=>new Promise(r=>{resolve=r;})});
  const pending=x.submit(); await x.submit(); assert.equal(x.calls.length,1); resolve({ok:true}); await pending;
});
test('WhatsApp is a click only and carries a query-free source',()=>{
  const x=setup({search:'?email=private@example.com'});
  const link={href:'https://wa.me/917457905011?text=Hello',closest:s=>s==='a'?link:null};
  x.listeners.click({target:link}); x.listeners.click({target:link});
  assert.equal(x.events().filter(e=>e.name==='whatsapp_click').length,2);
  assert.equal(x.events().filter(e=>e.name==='generate_lead').length,0);
  const message=new URL(link.href).searchParams.get('text'); assert.equal(message.split('Page:').length,2); assert.ok(!message.includes('email='));
});
test('thank-you visits cannot produce leads',()=>{
  const x=setup({pathname:'/thank-you/'}); assert.deepEqual(Array.from(x.events(),e=>e.name),['page_view']);
});
test('missing ID, denied consent and blocked storage do not load Google; forms still work',async()=>{
  for(const options of [{id:''},{consent:'denied'},{blocked:true}]) {
    const x=setup(options); assert.equal(x.document.head.children.length,0); await x.submit();
    assert.equal(x.events().length,0); assert.deepEqual(x.redirects,['/thank-you/']);
  }
});
test('landing and previous content page survive navigation to enquiry page',async()=>{
  const session=storage(); setup({session,pathname:'/blogs/guide/',search:'?utm_source=partner&utm_medium=referral'});
  setup({session,pathname:'/tours/varanasi/'});
  const x=setup({session,pathname:'/plan-my-journey/'}); await x.submit();
  const body=new URLSearchParams(x.calls[0][1].body);
  assert.equal(body.get('landing_page'),'/blogs/guide/'); assert.equal(body.get('enquiry_origin_page'),'/tours/varanasi/'); assert.equal(body.get('utm_source'),'partner');
});
test('analytics exception does not block accepted form redirect',async()=>{
  const x=setup(); x.window.gtag=()=>{throw Error('analytics failed');}; await x.submit(); assert.deepEqual(x.redirects,['/thank-you/']);
});
