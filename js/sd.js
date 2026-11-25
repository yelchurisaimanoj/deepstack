(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

/* ---------- scale stepper ---------- */
const STAGES=[
 {n:'100 users',on:[],cap:'One server, one database. It fits in your head because it fits on one machine. Enjoy it while it lasts.'},
 {n:'10,000 users',on:[],cap:'Traffic is fine, but one machine is one point of failure. Split the app server and the database so each can grow and fail on its own.'},
 {n:'1 million users',on:['n-lb'],cap:'One app server is melting. Put a <b>load balancer</b> in front and run three app servers - stateless, so any of them can serve any request. Rule: state lives in the DB, never in the app tier.'},
 {n:'10 million users',on:['n-cache'],cap:'The database is the new bottleneck, and 90% of reads are the same 10% of data. Add a <b>cache</b>: read it first, miss goes to the DB. Reads get 100x cheaper.'},
 {n:'100 million users',on:['n-queue','n-work','n-cdn','a-q'],cap:'Two new pains. Slow work (emails, thumbnails, notifications) moves to a <b>queue + workers</b> so requests return instantly. Static files move to a <b>CDN</b> near the user.'},
 {n:'1 billion users',on:['n-repl'],cap:'One database cannot hold the write load. <b>Read replicas</b> absorb reads; <b>sharding</b> splits writes by user. Every piece is now a fleet. Nothing here was invented - it was added, one pain at a time.'}
];
let stage=0;
function drawStage(){
  const s=STAGES[stage];
  $('#usern').textContent=s.n;
  ['n-lb','n-cache','n-queue','n-work','n-cdn','n-repl','a-q'].forEach(id=>{
    const el=document.getElementById(id);
    const on=STAGES.slice(0,stage+1).some(x=>x.on.includes(id));
    el.classList.toggle('off',!on);
    if(id.startsWith('n-')) el.classList.toggle('on',on);
    else el.classList.toggle('on',on);
  });
  // mark newest
  s.on.forEach(id=>{const el=document.getElementById(id);el.classList.remove('new');void el.offsetWidth;el.classList.add('new');});
  $('#scalecap').innerHTML=s.cap;
  $('#scalebtn').textContent=stage>=STAGES.length-1?'🪐 Planet scale reached':'📈 10x the users';
  $('#scalebtn').disabled=stage>=STAGES.length-1;
}
$('#scalebtn').onclick=()=>{ if(stage<STAGES.length-1){stage++;drawStage(); if(stage===STAGES.length-1)DS.mark('sd','scaled');} };
$('#scalereset').onclick=()=>{stage=0;drawStage();};
drawStage();

/* ---------- building blocks ---------- */
const BLOCKS=[
 {i:'⚖️',h:'Load balancer',s:'The traffic cop at the door.',b:'Spreads requests across identical app servers (round robin, least connections). Also the bouncer: health checks kick out dead servers before users notice.',d:'Deep idea: it works because app servers are stateless. Keep state out of them.'},
 {i:'⚡',h:'Cache',s:'The answer you memorized.',b:'Redis/Memcached hold hot data in RAM (~microseconds vs milliseconds). Cache-aside is the common dance: check cache → miss → read DB → write cache. Decide what staleness you can tolerate.',d:'Deep idea: every cache is a bet that slightly-stale is good enough.'},
 {i:'📮',h:'Queue',s:'The shock absorber.',b:'Kafka/SQS decouple "accepted" from "done". Producer drops a job, workers consume at their own pace. Spikes smooth out; slow consumers stop breaking fast producers.',d:'Deep idea: queues convert bursts into flow. Also: retries and dead-letter queues are where reliability lives.'},
 {i:'🗄',h:'Sharding',s:'Cut the database into slices.',b:'Split rows by a key (user_id % N). Each shard is small and fast. The cost: joins across shards and rebalancing get hard. Pick the shard key like your life depends on it.',d:'Deep idea: a bad shard key is a migration you will never finish.'},
 {i:'🌍',h:'CDN',s:'Move content to the user\'s doorstep.',b:'Static files and media are copied to edge servers worldwide. A user in Chennai downloads from Chennai, not Virginia. Latency drops; your origin shrugs off load.',d:'Deep idea: most of the internet\'s speed is geography, not bandwidth.'},
 {i:'📚',h:'Replication',s:'Copies for reads and for survival.',b:'Primary handles writes; replicas stream the changes and serve reads. If the primary dies, promote a replica. The tension: replication lag means a user can read their own write... or not.',d:'Deep idea: consistency is a dial, not a switch.'}
];
$('#blocks').innerHTML=BLOCKS.map((c,i)=>`
 <div class="fcard" data-page="sd" data-pid="blk${i}"><span class="tap">flip</span><div class="inner">
  <div class="face"><span class="ic">${c.i}</span><span class="h">${c.h}</span><span class="s">${c.s}</span><span class="deep">tap for the deep idea →</span></div>
  <div class="face back"><span class="tag">deep idea</span><span class="b">${c.b}</span><span class="deep2">${c.d}</span></div>
 </div></div>`).join('');

/* ---------- scenario walkthroughs ---------- */
const SC={
 wa:{t:"One message's journey",steps:[
   ['📱 Sender app','Your phone holds a persistent connection to a chat gateway - no polling, no HTTP per message.'],
   ['🚪 Gateway','Receives "hi" for @mom, stamps it with an ID, acks your phone: one grey tick.'],
   ['📮 Queue + store','The message lands in a durable queue, then the message store. Two grey ticks: it survives restarts now.'],
   ['🔔 Push path','Mom is online → pushed down her gateway connection. Offline → a push notification (FCM/APNs) wakes her app.'],
   ['✅ Delivered + read','Her app acks; ticks turn blue. End-to-end encryption means every server above carried ciphertext it could not read.']]},
 url:{t:'A redirect in 50 milliseconds',steps:[
   ['✂️ Shorten','POST long URL → generate a short code (base62 of a counter, or hash + collision check) → store code → URL.'],
   ['🗄 The store','Billions of rows, but each is tiny and keyed by the code. A simple key-value store beats a relational join party.'],
   ['⚡ The hot path','GET /x9K2 → check cache → 301/302 redirect. 302 if you want analytics; 301 if you want browsers to cache it forever.'],
   ['📈 Scale','Read-heavy: 100:1. Cache the top codes, replicate the store, shard by code prefix. The hard part was never the redirect.'],
   ['🎯 The real product','Click analytics, expiring links, custom aliases, abuse scanning. The CRUD was the easy 5%.']]},
 food:{t:'🛵 An order races the clock',steps:[
   ['🛒 Order placed','Cart → order service → payment. Only after payment confirms does the restaurant see it. Idempotency keys stop double-charges on retry.'],
   ['🍳 Restaurant accepts','A queue fans out: notify restaurant, start prep timer, update the user. All async, all retriable.'],
   ['🛵 Rider matching','Nearby riders ranked by distance, direction, current orders. Geospatial index (think geohash) makes "nearby" cheap.'],
   ['📍 Live tracking','Rider\'s phone pings GPS every few seconds → location service → websocket to your map. Fire-and-forget: stale dots are fine, lost dots are not.'],
   ['✅ Delivered','Events close the loop: ratings, payout, order history. Every step above emitted events you can replay when something goes wrong.']]}
};
let scCur='wa', scStep=0;
function drawSc(){
  const s=SC[scCur];
  $('#sctitle').textContent=s.t;
  $('#scflow').innerHTML=s.steps.map((st,i)=>{
    const on=i<=scStep;
    return `<div class="tier"><div class="node ${on?'on':''} ${i===scStep?'new':''}" style="opacity:${on?1:.18}">${st[0]}</div></div>`+
      (i<s.steps.length-1?`<div class="arrow ${on?'on':''}">↓</div>`:'');
  }).join('');
  $('#sccap').innerHTML=`<b>Step ${scStep+1}/${s.steps.length}:</b> ${s.steps[scStep][1]}`;
  $('#scnext').textContent=scStep>=s.steps.length-1?'Journey complete ✓':'Next step →';
  $('#scnext').disabled=scStep>=s.steps.length-1;
  if(scStep>=s.steps.length-1)DS.mark('sd','scen-'+scCur);
}
$('#scnext').onclick=()=>{ if(scStep<SC[scCur].steps.length-1){scStep++;drawSc();} };
$('#screset').onclick=()=>{scStep=0;drawSc();};
$$('#scen .chip').forEach(c=>c.onclick=()=>{scCur=c.dataset.s;scStep=0;$$('#scen .chip').forEach(x=>x.classList.toggle('on',x===c));drawSc();});
drawSc();

/* ---------- quiz ---------- */
renderQuiz($('#quiz'),'sd',[
 {q:'Reads are 95% of traffic and the DB is gasping. First move?',opts:['Shard the database','Add a cache for hot reads','Add more app servers'],a:1,why:'Cache first: cheapest, biggest read win. Sharding is the last resort, not the first.'},
 {q:'Users complain "I posted but my friend cannot see it for a minute." What did you tune?',opts:['The load balancer algorithm','Replication lag / read-your-writes consistency','The CDN TTL'],a:1,why:'Reads hitting a lagging replica miss fresh writes. Route "my own data" reads to the primary.'},
 {q:'Black Friday: 50x traffic for 2 hours. What absorbs the spike?',opts:['A queue between intake and processing','A bigger single database','Disabling the cache'],a:0,why:'Queues smooth bursts into a survivable rate. Autoscaling handles the rest.'},
 {q:'Your app servers each keep user sessions in local memory. What breaks when you scale out?',opts:['Nothing, it is faster','The load balancer sends a user to a different server and they are logged out','The database'],a:1,why:'State in app servers pins users to machines. Move sessions to Redis/JWT and servers become interchangeable.'},
 {q:'"Design for X users" - what do you do first in the interview?',opts:['Draw Kubernetes immediately','Ask: how many reads/writes per second, how much data, how fast it grows','Pick NoSQL because scale'],a:1,why:'Back-of-envelope numbers decide everything after. Design without numbers is decoration.'}
]);

/* ---------- FAQs ---------- */
const FAQS=[
 {q:'How do I structure any system design answer?',a:'(1) Clarify: who uses it, how many, what must it do. (2) Estimate: QPS, storage, bandwidth on the back of an envelope. (3) Draw the boring version. (4) Find the bottleneck and add one block at a time. (5) Talk trade-offs out loud.',u:'At work: this is exactly how a design doc review goes.'},
 {q:'SQL vs NoSQL, the honest 30-second version?',a:'SQL when relationships, transactions and unknown future queries matter (money, orders). NoSQL when access patterns are known, scale is huge and the shape is document/key-value (feeds, sessions, events). Most big systems run both.',u:'At work: choose per service, not per company religion.'},
 {q:'What is back-of-envelope estimation, really?',a:'Knowing that 1M users × 5 actions/day ≈ 60 writes/sec, a tweet is ~300 bytes, a day has ~100K seconds. It turns "will it scale?" into arithmetic. Interviewers test whether your design follows numbers or vibes.',u:'At work: capacity planning and cost estimates are the same arithmetic.'},
 {q:'CAP theorem in one line?',a:'During a network partition you choose: refuse to answer (consistency) or answer possibly-stale (availability). And when there is no partition, the real trade-off is latency vs consistency anyway (PACELC).',u:'At work: it is why "eventual consistency" appears in every distributed system doc.'},
 {q:'How deep should I go in an interview?',a:'One level deeper than the interviewer pushes, on one or two components - usually the data model and the hottest path. Breadth-first sketch, then drill where they point. Never hand-wave the hot path.',u:'At work: same skill - knowing which 10% of the design carries 90% of the risk.'},
 {q:'The most common system design mistake?',a:'Designing the final architecture up front. Real systems earn each component from a measured pain. Interviewers (and teams) trust the person who grows the design step by step over the one who draws Netflix on day one.',u:'At work: over-engineering kills more startups than scaling ever will.'}
];
$('#faqs').innerHTML=FAQS.map((f,i)=>`
 <div class="faq" data-page="sd" data-pid="faq${i}">
   <button class="faq-q"><span class="qn">Q${i+1}</span>${f.q}<span class="pm">+</span></button>
   <div class="faq-a"><div class="in">${f.a}<div class="use">▸ ${f.u}</div></div></div>
 </div>`).join('');
})();
