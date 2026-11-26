/* Daily pick: one fresh idea every day, rotating across tracks */
(function(){
const PICKS=[
 {k:'ai',i:'🔁',t:'Agents are loops',s:'Today: open the AI track and watch the RAG pipeline move. Five steps between a question and a trustworthy answer.',p:'ai.html'},
 {k:'dsa',i:'🪟',t:'One pattern, five minutes',s:'Today: press play on the sliding window and watch the edges do all the work. That is O(n) you can see.',p:'dsa.html'},
 {k:'sd',i:'📈',t:'Scale one app to a billion',s:'Today: tap through the scale stepper. Every famous architecture was just pains being answered in order.',p:'sd.html'},
 {k:'lld',i:'☕',t:'Build a coffee with code',s:'Today: play with the Decorator demo. Wrapping beats subclassing, and now your hands know why.',p:'lld.html'},
 {k:'tools',i:'⚒',t:'One tool, one story',s:'Today: flip three cards on the radar and learn the "when to reach for it" line. That line is the senior signal.',p:'tools.html'},
 {k:'ai',i:'📏',t:'Evals are the new unit tests',s:'Today: the evals card. Teams shipping AI reliably are not smarter - they are measured.',p:'ai.html'},
 {k:'dsa',i:'🗜',t:'Binary search the answer',s:'Today: when the question says "minimum that works", the answer space is the array. Flip the card, see the costume.',p:'dsa.html'},
 {k:'sd',i:'📮',t:'Queues are shock absorbers',s:'Today: one card on why Black Friday does not kill well-built systems. Bursts become flow.',p:'sd.html'},
 {k:'lld',i:'🔔',t:'Drop a video, notify everyone',s:'Today: run the Observer demo. Loose coupling stops being a phrase and starts being a feeling.',p:'lld.html'},
 {k:'ai',i:'🧭',t:'Meaning has coordinates',s:'Today: the embeddings card. "Refund" sits near "money back" with zero shared letters - that is semantic search.',p:'ai.html'},
 {k:'tools',i:'🚩',t:'Feature flags > big branches',s:'Today: the trunk-based card on the radar. Ship dark, release gradually, sleep well.',p:'tools.html'},
 {k:'sd',i:'⚡',t:'Every system is a cache',s:'Today: the cache card. Ask of anything fast: what truth is it caching, and how stale may it be?',p:'sd.html'},
 {k:'dsa',i:'👂',t:'Problems leak their patterns',s:'Today: the mindset cards. "Sorted" whispers binary search; train the ear before the hands.',p:'dsa.html'},
 {k:'ai',i:'🪖',t:'The FDE mindset',s:'Today: flip the forward-deployed cards. Embed, ship in days, own the outcome, be the feedback loop.',p:'ai.html'},
 {k:'lld',i:'🪿',t:'The square that broke the rectangle',s:'Today: the Liskov card. One wrong inheritance explains half the legacy pain you have ever felt.',p:'lld.html'},
 {k:'tools',i:'📊',t:'Dashboards before launch',s:'Today: the Grafana card. You cannot debug what you cannot see; observability is a launch feature.',p:'tools.html'},
 {k:'sd',i:'🛵',t:'Race a food order',s:'Today: step through the delivery walkthrough. Geohashes, websockets, idempotency - real systems, real choices.',p:'sd.html'},
 {k:'ai',i:'🛡',t:'Guardrails are the product',s:'Today: the guardrails card. Probabilistic suggests, deterministic decides. Write that on a sticky note.',p:'ai.html'},
 {k:'dsa',i:'🪆',t:'Cache the subproblem',s:'Today: the DP card. Same question twice = remember it. Half of dynamic programming is that sentence.',p:'dsa.html'},
 {k:'lld',i:'🍱',h:'',t:'Assemble the thali',s:'Today: the Builder card. Twelve-argument constructors are a cry for help; build step by step.',p:'lld.html'},
 {k:'sd',i:'🔗',t:'50 milliseconds to redirect',s:'Today: the URL shortener walkthrough. The CRUD is 5%; analytics and abuse are the real product.',p:'sd.html'},
 {k:'conc',i:'🏁',t:'Lose an update on purpose',s:'Today: run the race-condition demo unlocked. Watch count miss 200, then flip the lock and watch it behave.',p:'concurrency.html'},
 {k:'conc',i:'☠️',t:'Step into a deadlock',s:'Today: the deadlock stepper. Two locks, two threads, one frozen trap - and the one ordering rule that kills it.',p:'concurrency.html'},
 {k:'conc',i:'⚡',t:'Waiting is free',s:'Today: run sync vs async and compare the clocks. Async does not make tasks faster; it makes waiting useful.',p:'concurrency.html'}
];
const d=new Date();
const idx=(d.getFullYear()*372+d.getMonth()*31+d.getDate())%PICKS.length;
const pk=PICKS[idx];

/* streak */
const SK='ds_streak_v1';
let st={days:0,last:''};
try{st=JSON.parse(localStorage.getItem(SK))||st;}catch(e){}
const today=d.toISOString().slice(0,10);
if(st.last!==today){
  const y=new Date(d-864e5).toISOString().slice(0,10);
  st.days=(st.last===y)?st.days+1:1; st.last=today;
  localStorage.setItem(SK,JSON.stringify(st));
}
const el=document.getElementById('dailypick');
if(el){
  el.innerHTML=`
   <div class="k">Today's pick · day ${st.days} ${st.days>2?'🔥':''}</div>
   <a class="tcard" style="--g1:#facc15;--g2:#fb7185;margin-top:10px" href="${pk.p}">
     <span class="glyph">${pk.i}</span>
     <span><span class="tt">${pk.t}</span><div class="ds" style="display:block">${pk.s}</div></span>
     <span class="meta"><div class="go" style="font-size:13px">open →</div></span>
   </a>`;
}
})();
