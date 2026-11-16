const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync('frontend/script.js', 'utf8');
function element() {
  const classes = new Set(['rj-hidden']);
  return { style: {}, disabled: false, value: '', textContent: '', innerHTML: '',
    classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x), toggle(x, yes) { if(yes) classes.add(x); else classes.delete(x); } },
    addEventListener() {}, querySelector: () => element(), querySelectorAll: () => [],
    appendChild() {}, scrollIntoView() {}, remove() {}, contains: () => false,
  };
}
async function check(fail) {
  const nodes = new Map();
  const get = name => { if(!nodes.has(name)) nodes.set(name, element()); return nodes.get(name); };
  const calls = [];
  const context = vm.createContext({
    window: { addEventListener() {} }, location: {protocol:'http:', origin:'http://localhost:5050'},
    document: {getElementById:get, querySelector:get, querySelectorAll:()=>[], addEventListener(){}, createElement:element, body:element()},
    IntersectionObserver: class {observe() {}}, FormData: class {append() {}},
    setTimeout: cb => { cb(); return 1; }, setInterval: () => 1, clearInterval() {}, console,
    fetch: async url => { calls.push(url); if(fail) throw new Error('Offline'); return {ok:true, json:async()=>({score:45, category:'Data Science', skills:['python'], feedback:'Rule-based feedback'})}; },
  });
  vm.runInContext(source, context);
  await vm.runInContext("selectFile({name:'resume.pdf', type:'application/pdf', size:100}); startAnalysis()", context);
  assert.equal(calls[0], 'http://localhost:5050/analyze');
  assert.equal(get('resultState').classList.contains('rj-hidden'), fail);
  assert.equal(get('analyzeBtn').disabled, false);
  assert.equal(get('loadingState').classList.contains('rj-hidden'), true);
}
(async()=> { await check(false); await check(true); console.log('Frontend success/error regression checks passed'); })().catch(e=>{ console.error(e); process.exitCode=1; });
