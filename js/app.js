/* DeepStack shared runtime */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  /* ---- progress store ---- */
  const KEY='ds_progress_v1';
  const store={get(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}},
               set(v){localStorage.setItem(KEY,JSON.stringify(v))}};
  window.DS={
    mark(page,id){const s=store.get();s[page]=s[page]||{};s[page][id]=1;store.set(s);},
    seen(page){return Object.keys((store.get()[page])||{}).length;},
    total(page,ids){return this.seen(page)+'/'+ids.length;}
  };

  /* ---- flip cards + FAQs (delegated: cards render after this script) ---- */
  document.addEventListener('click',e=>{
    const fq=e.target.closest('.faq-q');
    if(fq){
      const f=fq.closest('.faq');
      f.classList.toggle('open');
      const a=$('.faq-a',f); a.style.maxHeight=f.classList.contains('open')?a.scrollHeight+'px':'0';
      if(f.dataset.pid && f.dataset.page) DS.mark(f.dataset.page,f.dataset.pid);
      return;
    }
    const c=e.target.closest('.fcard');
    if(c){
      c.classList.toggle('flipped');
      if(c.dataset.pid && c.dataset.page) DS.mark(c.dataset.page,c.dataset.pid);
    }
  });

  /* ---- quiz engine ---- */
  window.renderQuiz=function(el,page,questions){
    let i=0,score=0;
    const box=el; box.classList.add('quiz');
    function draw(){
      if(i>=questions.length){
        DS.mark(page,'quiz-done');
        box.innerHTML=`<div class="q">Done. Score: <span class="score">${score}/${questions.length}</span></div>
        <div class="fb">${score===questions.length?'Perfect. You own this.':score>=questions.length/2?'Solid. Review the ones you missed.':'Worth another pass - tap the cards above again.'}</div>
        <div class="ctr"><button class="btn ghost" id="qre">Restart</button></div>`;
        $('#qre',box).onclick=()=>{i=0;score=0;draw();};
        return;
      }
      const q=questions[i];
      box.innerHTML=`<div class="q">${i+1}. ${q.q}</div>`+
        q.opts.map((o,j)=>`<button class="opt" data-j="${j}">${o}</button>`).join('')+
        `<div class="fb"></div><div class="ctr"><button class="btn ghost" id="qnx" disabled>Next</button></div>`;
      $$('.opt',box).forEach(b=>b.onclick=()=>{
        const j=+b.dataset.j, ok=j===q.a;
        $$('.opt',box).forEach(x=>x.disabled=true);
        b.classList.add(ok?'ok':'no');
        if(!ok) $$('.opt',box)[q.a].classList.add('ok');
        if(ok)score++;
        $('.fb',box).textContent=q.why||(ok?'Correct.':'Not quite.');
        $('#qnx',box).disabled=false;
      });
      $('#qnx',box).onclick=()=>{i++;draw();};
    }
    draw();
  };

  /* ---- home progress rings ---- */
  $$('.ringwrap[data-page]').forEach(w=>{
    const page=w.dataset.page, total=+w.dataset.total;
    const seen=DS.seen(page), pct=total?Math.round(100*seen/total):0;
    const c=2*Math.PI*19;
    $('.fgc',w).style.strokeDasharray=c;
    $('.fgc',w).style.strokeDashoffset=c*(1-pct/100);
    $('.pct',w).textContent=pct+'%';
  });

  /* ---- install ---- */
  let deferred=null;
  window.addEventListener('beforeinstallprompt',e=>{deferred=e;const b=$('#installbtn');if(b)b.style.display='';});
  const ib=$('#installbtn');
  if(ib) ib.onclick=async()=>{ if(deferred){deferred.prompt(); await deferred.userChoice; deferred=null; ib.style.display='none';} else { location.href='install.html'; } };

  /* ---- SW ---- */
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
