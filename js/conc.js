(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

/* ---------- concept deck ---------- */
const CONC=[
 {i:'🏭',h:'Process vs thread',s:'Separate houses vs roommates.',b:'Processes each get their own memory - safe but expensive to talk across. Threads share one memory - cheap to talk, easy to trip over each other. Every concurrency bug is a shared-memory story.',d:'Day to day: Chrome tabs are processes; your app\'s workers are threads.'},
 {i:'🏁',h:'Race condition',s:'Two writers, one value, wrong result.',b:'count++ is really three steps: read, add, write. Two threads interleave them and one update silently vanishes. The bug appears once in a million runs - always in production, never in your test.',d:'Deep idea: if it is not atomic or locked, assume it interleaves.'},
 {i:'🔒',h:'Mutex / lock',s:'The bathroom key.',b:'One holder at a time; everyone else waits at the door. Locks make shared state safe by making it temporarily serial. Hold them for the shortest possible span.',d:'Deep idea: a lock turns "simultaneous" back into "one at a time" - that is both the fix and the cost.'},
 {i:'☠️',h:'Deadlock',s:'Everyone waiting on everyone.',b:'A holds lock 1, wants 2. B holds 2, wants 1. Neither ever moves. Prevention is boring and reliable: always take locks in the same global order.',d:'Deep idea: deadlock needs four conditions at once - break any one and it dies.'},
 {i:'⚡',h:'Async / await',s:'Don\'t stand at the microwave.',b:'Async is not parallel - it is cooperative. A task hits I/O, says "wake me when done", and the thread does other work meanwhile. One thread juggles thousands of waiting tasks.',d:'Deep idea: async wins on I/O-bound work; threads win on CPU-bound work.'},
 {i:'🧵',h:'Thread pool',s:'A fixed crew, not a hiring spree.',b:'Creating a thread per task explodes memory and scheduler time. A pool keeps N workers; tasks queue up and get served as workers free up. Bounded resources, predictable load.',d:'Day to day: this is what your web server and executor service already do.'},
 {i:'🚦',h:'Semaphore',s:'N keys, not one.',b:'A mutex allows one; a semaphore allows N. Connection pools, rate limiters, "max 10 concurrent uploads" - all semaphores underneath.',d:'Deep idea: semaphore with N=1 is a mutex; count your capacity honestly.'},
 {i:'📬',h:'Producer-consumer',s:'The kitchen ticket rail.',b:'Producers drop work on a queue; consumers take it when ready. Neither needs to know the other exists. Backpressure - a full queue slowing producers - is the hidden superpower.',d:'Deep idea: queues between stages are how systems survive uneven speeds.'},
 {i:'⚛️',h:'Atomic operations',s:'Indivisible by hardware.',b:'Compare-and-swap does read-modify-write in one uninterruptible step. All the fancy lock-free structures are CAS loops with good manners.',d:'Day to day: AtomicInteger.incrementAndGet() has no race - count++ does.'},
 {i:'👀',h:'Visibility & happens-before',s:'Your change, their cache.',b:'Each core caches memory; a write on one core may be invisible to another for ages. volatile/atomics/locks create "happens-before" edges that flush the truth across cores.',d:'Deep idea: a variable can be "set" and still unread by another thread - the most confusing bug class there is.'}
];
$('#concepts').innerHTML=CONC.map((c,i)=>`
 <div class="fcard" data-page="conc" data-pid="c${i}"><span class="tap">flip</span><div class="inner">
  <div class="face"><span class="ic">${c.i}</span><span class="h">${c.h}</span><span class="s">${c.s}</span><span class="deep">tap for the deep idea →</span></div>
  <div class="face back"><span class="tag">deep idea</span><span class="b">${c.b}</span><span class="deep2">${c.d}</span></div>
 </div></div>`).join('');

/* ---------- race condition demo ---------- */
let raceTimer=null;
function raceRun(locked){
  clearInterval(raceTimer);
  let a=0,b=0,count=0,lost=0;
  $('#fa').style.width='0%';$('#fb').style.width='0%';$('#cnt').textContent='0';
  $('#ha').textContent='';$('#hb').textContent='';
  $('#racecap').innerHTML=locked?'Lock on: threads take turns. Nobody overwrites anybody.':'No lock: both threads read the same value and one update gets lost...';
  raceTimer=setInterval(()=>{
    if(a>=100&&b>=100){
      clearInterval(raceTimer);
      $('#racecap').innerHTML=locked?`Finished: <b>count = ${count}</b>. Perfect 200, as promised. The lock forced turn-taking - slower, correct.`:`Finished: <b>count = ${count}</b> - expected 200, lost ${lost} updates to interleaving. Multiply this by a bank balance and you see the problem.`;
      DS.mark('conc','race'); return;
    }
    let who=Math.random()<.5?'a':'b';
    if(who==='a'&&a>=100)who='b'; if(who==='b'&&b>=100)who='a';
    if((who==='a'&&a>=100)||(who==='b'&&b>=100)){/* both done; loop ends next tick */}
    else if(locked){
      if(who==='a'){a++;count++;$('#ha').innerHTML='<span class="lockchip" style="background:#facc15">🔒 holds lock, +1</span>';$('#hb').textContent=b>=100?'done ✅':'waiting...';}
      else{b++;count++;$('#hb').innerHTML='<span class="lockchip" style="background:#facc15">🔒 holds lock, +1</span>';$('#ha').textContent=a>=100?'done ✅':'waiting...';}
    } else {
      const read=count; // both may read the same value before either writes
      if(who==='a'){a++; if(Math.random()<0.06){lost++; count=read; $('#ha').innerHTML='read '+read+', got preempted, wrote stale value 💥';} else {count=read+1;$('#ha').textContent='+1';}
      } else {b++; if(Math.random()<0.06){lost++; count=read; $('#hb').innerHTML='read '+read+', got preempted, wrote stale value 💥';} else {count=read+1;$('#hb').textContent='+1';}}
    }
    $('#fa').style.width=a+'%';$('#fb').style.width=b+'%';$('#cnt').textContent=count;
  },40);
}
$('#runbad').onclick=()=>raceRun(false);
$('#rungood').onclick=()=>raceRun(true);

/* ---------- sync vs async demo ---------- */
let tTimer=null;
function taskRun(asyncMode){
  clearInterval(tTimer);
  let t=0,p1=0,p2=0,p3=0;
  ['t1','t2','t3'].forEach(id=>document.getElementById(id).style.width='0%');
  $('#clock').textContent='0s';
  $('#synccap').innerHTML=asyncMode?'Async: the slow I/O tasks are started and parked; the quick task finishes first, and nothing sits idle.':'Sync: download blocks everything. Then cooking blocks everything. The quick reply waits for no reason.';
  tTimer=setInterval(()=>{
    t++;
    if(asyncMode){
      if(t<=10)p1=t*10;          // download takes 10s wall time but doesn't block
      if(t<=8)p2=t*12.5;         // pasta 8s wall time
      if(t<=2)p3=t*50;           // reply done by 2s
    } else {
      if(t<=10){p1=t*10;}        // download first, 10s
      else if(t<=18){p1=100;p2=(t-10)*12.5;}  // then pasta, 8s
      else{p1=100;p2=100;p3=Math.min(100,(t-18)*50);} // then reply
      if(p3>=100){clearInterval(tTimer);$('#synccap').innerHTML=`Sync took <b>${t}s</b>. Try async and compare.`;DS.mark('conc','syncdemo');}
    }
    if(asyncMode&&p1>=100&&p2>=100&&p3>=100){clearInterval(tTimer);$('#synccap').innerHTML=`Async took <b>${t}s</b> - the longest task, not the sum. That is the whole trick: waiting is free.`;DS.mark('conc','syncdemo');}
    $('#t1').style.width=p1+'%';$('#t2').style.width=p2+'%';$('#t3').style.width=p3+'%';
    $('#clock').textContent=t+'s';
  },400);
}
$('#runsync').onclick=()=>taskRun(false);
$('#runasync').onclick=()=>taskRun(true);

/* ---------- deadlock demo ---------- */
let dlStep=0,dlMode='bad';
const DL_BAD=[
 ['A takes Lock 1.','holds: 🔒 Lock 1','holds: nothing','A1','free2'],
 ['B takes Lock 2.','holds: 🔒 Lock 1','holds: 🔒 Lock 2','A1','B2'],
 ['A wants Lock 2... it is held by B. A waits.','holds: 🔒 Lock 1 · wants Lock 2 ⏳','holds: 🔒 Lock 2','A1','B2'],
 ['B wants Lock 1... it is held by A. B waits.','holds: 🔒 Lock 1 · wants Lock 2 ⏳','holds: 🔒 Lock 2 · wants Lock 1 ⏳','A1','B2'],
 ['☠️ DEADLOCK. Each waits for the other. Forever. No timeout, no error, just silence.','STUCK ⏳','STUCK ⏳','A1','B2']
];
const DL_FIX=[
 ['The fix: EVERYONE takes locks in the same order - always Lock 1, then Lock 2.','holds: nothing','holds: nothing','free1','free2'],
 ['A takes Lock 1.','holds: 🔒 Lock 1','holds: nothing','A1','free2'],
 ['B wants Lock 1 (order rule!) - it waits politely.','holds: 🔒 Lock 1','wants Lock 1 ⏳ (ordered wait)','A1','free2'],
 ['A takes Lock 2, does its work, releases both.','done ✅','wants Lock 1 ⏳','free1','free2'],
 ['B takes Lock 1 then Lock 2, finishes. No cycle, no freeze.','done ✅','done ✅','free1','free2']
];
function dlDraw(){
  const S=dlMode==='bad'?DL_BAD:DL_FIX;
  const st=S[Math.min(dlStep,S.length-1)];
  $('#dlcap').innerHTML=`<b>Step ${Math.min(dlStep,S.length-1)+1}/${S.length}:</b> ${st[0]}`;
  $('#dla').textContent=st[1]; $('#dlb').textContent=st[2];
  const L1={free1:['🔓 Lock 1 free','#34d399'],A1:['🔒 Lock 1 held by A','#f43f5e']}[st[3]];
  const L2={free2:['🔓 Lock 2 free','#34d399'],B2:['🔒 Lock 2 held by B','#f43f5e']}[st[4]];
  $('#lk1').textContent=L1[0];$('#lk1').style.background=L1[1];
  $('#lk2').textContent=L2[0];$('#lk2').style.background=L2[1];
  if(dlStep>=S.length-1){ if(dlMode==='bad')DS.mark('conc','deadlock'); else DS.mark('conc','deadlockfix'); }
}
$('#dlstep').onclick=()=>{const S=dlMode==='bad'?DL_BAD:DL_FIX; if(dlStep<S.length-1){dlStep++;dlDraw();}};
$('#dlfix').onclick=()=>{dlMode='fix';dlStep=0;dlDraw();};
$('#dlreset').onclick=()=>{dlMode='bad';dlStep=0;dlDraw();};
dlDraw();

/* ---------- quiz ---------- */
renderQuiz($('#quiz'),'conc',[
 {q:'count++ in two threads gives wrong totals. Why?',opts:['The CPU is broken','count++ is read-add-write in three steps, and they interleave','Integers are not thread-safe types'],a:1,why:'Three invisible steps. Two threads read the same value, both write it back - one update vanishes.'},
 {q:'Which one runs truly in parallel on multiple CPU cores?',opts:['async/await tasks','Threads','setTimeout callbacks'],a:1,why:'Async juggles waiting on ONE thread; threads run simultaneously on several cores. Different tools.'},
 {q:'Your service handles 10,000 slow API calls a minute. Threads or async?',opts:['10,000 threads','Async I/O on a small thread pool','One thread, one call at a time'],a:1,why:'I/O-bound work is waiting, not computing - async was built exactly for this.'},
 {q:'Deadlock needs four conditions. The easiest to break?',opts:['Mutual exclusion','Hold-and-wait via lock ordering','Circular wait via a global lock order'],a:2,why:'Impose one global order on locks and circular wait becomes impossible. Boring, bulletproof.'},
 {q:'A teammate set a shared flag but another thread never sees it. The cause?',opts:['The flag is in CPU cache; no happens-before edge flushed it','The compiler deleted it','Bad luck'],a:0,why:'Visibility: without volatile/atomic/lock, each core can keep its own stale copy.'}
]);

/* ---------- FAQs ---------- */
const FAQS=[
 {q:'Threads vs async - how do I choose in 10 seconds?',a:'Waiting on I/O (network, DB, files) → async. Burning CPU (parsing, image work, crypto) → threads/processes. Mixed → thread pool feeding async pipelines. The question is always: is the task waiting or working?',u:'At work: this one question settles most "why is the server slow" debates.'},
 {q:'What does "thread-safe" actually mean?',a:'The code gives correct results no matter how threads interleave: shared mutable state is guarded (locks, atomics) or eliminated (immutability, thread-local). Read-only shared data is always safe; mutation is where it bites.',u:'At work: "is this shared and mutable?" is the only audit question you need first.'},
 {q:'How do I prevent deadlocks?',a:'Best: one global lock ordering everyone follows. Also: timeouts with retry (tryLock), keeping lock spans tiny, and never calling unknown code while holding a lock. Detection exists (watchdogs), prevention is cheaper.',u:'At work: write the lock order in a comment where the locks live.'},
 {q:'Is async always faster?',a:'No - async adds overhead and complexity. It wins when tasks wait a lot (I/O). For CPU work it can be slower than just doing the work. Measure before converting; async-all-the-things is a religion, not engineering.',u:'At work: profile first; the slow endpoint is usually one blocking DB call, not a missing async rewrite.'},
 {q:'What is a semaphore for, really?',a:'Bounded concurrency: at most N of something at once - DB connections, uploads, API calls against a rate limit. A mutex is just N=1. If you have ever written a worker pool with a limit, you reinvented one.',u:'At work: "max 5 concurrent exports" is a semaphore, not an if-statement.'},
 {q:'How do I debug a race condition that happens once a month?',a:'You do not catch it live - you corner it. Add logging with thread IDs around shared state, stress-test with way more threads than cores, and reason from happens-before: which write must be visible where. Then make the critical section tiny and provable.',u:'At work: intermittent corruption + no stack trace = think races, not logic.'}
];
$('#faqs').innerHTML=FAQS.map((f,i)=>`
 <div class="faq" data-page="conc" data-pid="faq${i}">
   <button class="faq-q"><span class="qn">Q${i+1}</span>${f.q}<span class="pm">+</span></button>
   <div class="faq-a"><div class="in">${f.a}<div class="use">▸ ${f.u}</div></div></div>
 </div>`).join('');
})();
