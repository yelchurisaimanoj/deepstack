/* shared code viewer: DS_CODE(el, items) ; item {t, note, langs:{Python:'..',Java:'..'}} */
(function(){
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const KW=/\b(def|return|if|else|elif|for|while|in|not|and|or|import|from|class|self|with|as|await|async|try|finally|new|public|private|static|final|void|int|long|var|let|const|function|this|synchronized|extends|implements|interface|throw|true|false|True|False|None|null|lambda|yield|break|continue|go|func|chan|select|defer)\b/g;
function hl(src){
  const out=[];let t=esc(src);
  t=t.replace(/(#.*|\/\/.*)$/gm,m=>{out.push('<span class="c">'+m+'</span>');return '\u0000'+(out.length-1)+'\u0000';});
  t=t.replace(/("[^"\n]*"|'[^'\n]*')/g,m=>{out.push('<span class="s">'+m+'</span>');return '\u0000'+(out.length-1)+'\u0000';});
  t=t.replace(KW,'<span class="k">$1</span>').replace(/\b(\d+)\b/g,'<span class="n">$1</span>');
  return t.replace(/\u0000(\d+)\u0000/g,(_,i)=>out[+i]);
}
window.DS_CODE=function(el,items){
  let cur=0,lang=null;
  function draw(){
    const it=items[cur],ls=Object.keys(it.langs);
    if(!lang||!it.langs[lang])lang=ls[0];
    el.innerHTML=`<div class="chips cchips">${items.map((x,i)=>`<button class="chip ${i===cur?'on':''}" data-i="${i}">${x.t}</button>`).join('')}</div>
    <div class="cnote">${it.note}</div>
    <div class="cbar">${ls.map(l=>`<button class="lang ${l===lang?'on':''}" data-l="${l}">${l}</button>`).join('')}<button class="cpy">copy</button></div>
    <pre class="code"><code>${hl(it.langs[lang])}</code></pre>`;
    el.querySelectorAll('.cchips .chip').forEach(b=>b.onclick=()=>{cur=+b.dataset.i;draw();});
    el.querySelectorAll('.lang').forEach(b=>b.onclick=()=>{lang=b.dataset.l;draw();});
    el.querySelector('.cpy').onclick=e=>{try{navigator.clipboard.writeText(it.langs[lang]);e.target.textContent='copied ✓';}catch(_){e.target.textContent='select & copy';}};
  }
  draw();
};
})();
