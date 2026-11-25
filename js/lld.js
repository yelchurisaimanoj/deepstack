(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

/* ---------- SOLID ---------- */
const SOLID=[
 {i:'🚪',h:'S - One reason to change',s:'A class should have one job, one boss.',b:'The Report class prints reports. It should not also format dates, fetch data and email results. When the CFO asks for a new format, only one class should hear about it.',d:'Smell: the word "and" in your class description.'},
 {i:'🔌',h:'O - Open for extension, closed for edits',s:'Add behavior by adding code, not by editing working code.',b:'New discount type? Add a new DiscountStrategy class. The checkout that already works stays untouched - and untested-code-stays-unbroken.',d:'Smell: every feature means editing the same switch statement.'},
 {i:'🪿',h:'L - Subtypes must keep the promise',s:'If it looks like a duck, it must quack like one.',b:'The famous trap: Square extends Rectangle. Set width=5, height=10, expect area 50... get 100. The child broke the parent\'s promise. If you must break expectations, it is not a subtype.',d:'Smell: overriding a method to throw "not supported".'},
 {i:'🍽',h:'I - Small menus, not buffets',s:'Many small interfaces beat one fat one.',b:'A Robot should not be forced to implement eat() because Worker has it. Split Worker into Workable and Eatable; everyone implements only what they can actually do.',d:'Smell: classes with several methods that just throw.'},
 {i:'🎛',h:'D - Depend on the socket, not the lamp',s:'High-level code depends on abstractions; details plug in.',b:'NotificationService needs "a way to send". EmailSender, SmsSender, WhatsAppSender all fit the socket. Swap them without opening NotificationService. This is what makes testing (mocks) and change possible.',d:'Smell: "new EmailSender()" deep inside business logic.'}
];
$('#solid').innerHTML=SOLID.map((c,i)=>`
 <div class="fcard" data-page="lld" data-pid="solid${i}"><span class="tap">flip</span><div class="inner">
  <div class="face"><span class="ic">${c.i}</span><span class="h">${c.h}</span><span class="s">${c.s}</span><span class="deep">tap for the story →</span></div>
  <div class="face back"><span class="tag">the story</span><span class="b">${c.b}</span><span class="deep2">${c.d}</span></div>
 </div></div>`).join('');

/* ---------- observer demo ---------- */
const NAMES=['Asha','Ravi','Meena','Arjun'];
let subs=[1,1,1,1];
function drawSubs(){
  $('#subs').innerHTML=NAMES.map((n,i)=>`<button class="sub-chip ${subs[i]?'':'off'}" data-i="${i}">👤 ${n}${subs[i]?'':' (left)'}</button>`).join('');
  $$('#subs .sub-chip').forEach(b=>b.onclick=()=>{subs[+b.dataset.i]^=1;drawSubs();
    $('#obscap').innerHTML=subs[+b.dataset.i]?`<b>${NAMES[+b.dataset.i]}</b> subscribed. The subject just adds them to the list - no other code changes.`:`<b>${NAMES[+b.dataset.i]}</b> unsubscribed. Next video, they hear nothing. That is the whole pattern.`;});
}
$('#dropvid').onclick=()=>{
  drawSubs();
  const chips=$$('#subs .sub-chip');
  let n=0;
  chips.forEach((b,i)=>{ if(subs[i]){ setTimeout(()=>{b.classList.add('buzz');b.textContent=`🔔 ${NAMES[i]} notified`;},250+n*350); n++; }});
  setTimeout(()=>{ $('#obscap').innerHTML=`One <b>notifyAll()</b> call reached ${n} subscribers. The channel never knew or cared who they were - that loose coupling is the point.`; },250+n*350);
  setTimeout(drawSubs, 250+n*350+1800);
};
drawSubs();

/* ---------- strategy demo ---------- */
const STRATS={upi:'checkout.pay(499) → opens UPI intent, verifies in 2s, done. No if-else jungle inside checkout.',
 card:'checkout.pay(499) → 3-D Secure page, OTP, tokenized card saved for next time. Same checkout, different strategy.',
 cod:'checkout.pay(499) → order placed, collect cash at the door, mark paid on delivery. The checkout never changed.'};
let curS='upi';
$$('#strats .chip').forEach(c=>c.onclick=()=>{
  curS=c.dataset.s; $$('#strats .chip').forEach(x=>x.classList.toggle('on',x===c));
  $('#stratout').textContent=STRATS[curS];
});
$('#paybtn').onclick=()=>{
  $('#stratout').innerHTML='Processing…';
  setTimeout(()=>{ $('#stratout').innerHTML='✅ '+STRATS[curS]+'<br><b>The deep idea:</b> behavior lives in interchangeable objects, not in growing if-else chains.'; },600);
};

/* ---------- decorator demo ---------- */
const TOPP={mocha:['Mocha',30],soy:['Soy',15],whip:['Whip',20]};
let active={mocha:0,soy:0,whip:0};
function drawCup(){
  let parts=['Coffee'],price=50;
  for(const t of ['mocha','soy','whip']){
    document.getElementById('l-'+t).classList.toggle('on',!!active[t]);
    if(active[t]){parts.push(TOPP[t][0]);price+=TOPP[t][1];}
  }
  $('#decname').textContent=parts.join(' + '); $('#decprice').textContent='₹'+price;
}
$$('[data-t]').forEach(b=>b.onclick=()=>{const t=b.dataset.t;active[t]^=1;b.classList.toggle('on',!!active[t]);drawCup();});
$('#decreset').onclick=()=>{active={mocha:0,soy:0,whip:0};$$('[data-t]').forEach(b=>b.classList.remove('on'));drawCup();};

/* ---------- pattern deck ---------- */
const DECK=[
 {i:'🏭',h:'Factory',s:'"I need an object; don\'t make me say which class."',b:'The dosa stall: you say "masala dosa", the kitchen decides the class. NotificationFactory.create("email") returns an EmailSender - callers never new-up concrete types.',d:'Use when: creation logic is branchy or changes often.'},
 {i:'🍱',h:'Builder',s:'Construct a complicated thali one item at a time.',b:'new QueryBuilder().select("*").from("users").where("age>18").limit(10).build() - readable, step-by-step, immutable result. No 12-argument constructor.',d:'Use when: constructors with many optional knobs.'},
 {i:'🎫',h:'Singleton',s:'One instance, globally reachable.',b:'The office printer spooler: every floor prints, one queue exists. Powerful and dangerous - it is global state in a trench coat. In modern code, prefer dependency injection.',d:'Use when: exactly one resource truly exists (config, connection pool).'},
 {i:'🔁',h:'Adapter',s:'Translate one interface into another.',b:'The travel plug: your Indian charger in a UK socket. OldPaymentGateway.chargePaise() wrapped as NewGateway.chargeRupees() so the rest of the app never learns the old dialect.',d:'Use when: integrating legacy code or third-party APIs.'},
 {i:'🎭',h:'Facade',s:'One friendly face in front of a messy subsystem.',b:'"Book my trip" hides flights API + seats + payments + emails behind travel.bookTrip(). Callers see one simple door; the maze stays behind it.',d:'Use when: a subsystem\'s complexity leaks into every caller.'},
 {i:'🪆',h:'Composite',s:'Treat one item and a group of items the same way.',b:'A Folder holds Files and Folders; folder.size() works no matter how deep it nests. File trees, UI component trees, org charts - one interface, any depth.',d:'Use when: tree structures with uniform operations.'}
];
$('#deck').innerHTML=DECK.map((c,i)=>`
 <div class="fcard" data-page="lld" data-pid="deck${i}"><span class="tap">flip</span><div class="inner">
  <div class="face"><span class="ic">${c.i}</span><span class="h">${c.h}</span><span class="s">${c.s}</span><span class="deep">tap for the story →</span></div>
  <div class="face back"><span class="tag">the story</span><span class="b">${c.b}</span><span class="deep2">${c.d}</span></div>
 </div></div>`).join('');

/* ---------- quiz ---------- */
renderQuiz($('#quiz'),'lld',[
 {q:'Your notification code has if(type==EMAIL)...else if(SMS)...else if(WHATSAPP) in five places. First pattern to reach for?',opts:['Singleton','Strategy (+ a factory to pick it)','Builder'],a:1,why:'Branchy behavior selection = strategies behind a common interface, chosen by a factory.'},
 {q:'"Design a parking lot" - what is the interviewer really testing?',opts:['If you know the GoF catalog by heart','Class modeling: spotting entities, responsibilities and relationships','How fast you can code'],a:1,why:'LLD rounds grade object modeling: nouns become classes, verbs become methods, patterns appear where change is expected.'},
 {q:'A Duck subclass can fly but RubberDuck cannot. Forcing fly() into the base class breaks which principle?',opts:['Liskov substitution','Single responsibility','Dependency inversion'],a:0,why:'RubberDuck.fly() would have to throw - the subtype broke the parent promise. Split the interfaces instead.'},
 {q:'Unit test needs a fake payment gateway. What made that easy?',opts:['Dependency inversion: depend on an interface, inject the fake','A singleton gateway','Copy-pasting the gateway code into the test'],a:0,why:'High-level code depending on abstractions is exactly what lets tests plug in fakes.'},
 {q:'Request needs 12 optional parameters before it can be sent. The clean fix?',opts:['A 12-arg constructor','Builder pattern','Make them all static globals'],a:1,why:'Builder: readable step-by-step assembly, no telescoping constructors.'},
 {q:'"Composition over inheritance" means...',opts:['Never use inheritance','Build behavior by plugging in objects, not by deepening class trees','Compose functions instead of classes'],a:1,why:'Inheritance locks you into one hierarchy; composed objects can be swapped like Lego bricks.'}
]);

/* ---------- FAQs ---------- */
const FAQS=[
 {q:'Do I need to memorize all 23 GoF patterns?',a:'No. Know six deeply (Strategy, Observer, Factory, Builder, Decorator, Adapter), recognize the rest by name. Interviews reward applying one pattern well, not reciting the catalog.',u:'At work: those six cover the vast majority of "this code is getting messy" moments.'},
 {q:'How do LLD interviews actually run?',a:'A vague prompt ("design a chess game / parking lot / URL shortener data model"). You clarify requirements, name the entities, sketch classes and their relationships, then code the core flows. Patterns are seasoning, not the dish.',u:'At work: this is literally sprint-zero design. Same muscles.'},
 {q:'Inheritance or composition - the 5-second rule?',a:'Reach for composition. Use inheritance only for a true "is-a" with no broken promises (Liskov). Deep hierarchies are the number-one regret in old codebases.',u:'At work: most refactors are untangling someone\'s hierarchy into composed objects.'},
 {q:'What is the difference between a pattern and a principle?',a:'Principles (SOLID, DRY, KISS) are compass directions; patterns are named trails. Principles tell you when the design is drifting; patterns give you a proven shape once you know what is wrong.',u:'At work: principles for code review, patterns for the fix.'},
 {q:'How do I practice LLD without an interviewer?',a:'Pick a real app you use daily (Zomato cart, Google Docs comments) and model it: entities, relationships, three core flows. Then change one requirement and feel where the design creaks - that creak is where a pattern belongs.',u:'At work: volunteer to write the design doc for your next feature. Same exercise, real stakes.'},
 {q:'When is a singleton genuinely fine?',a:'When the resource is truly singular: a config loader, a connection pool, a metrics registry. Even then, hide it behind an interface so tests can substitute it. The sin is not the singleton; it is the hidden global state.',u:'At work: every "mystery test failure when run in parallel" story ends in a mutable singleton.'}
];
$('#faqs').innerHTML=FAQS.map((f,i)=>`
 <div class="faq" data-page="lld" data-pid="faq${i}">
   <button class="faq-q"><span class="qn">Q${i+1}</span>${f.q}<span class="pm">+</span></button>
   <div class="faq-a"><div class="in">${f.a}<div class="use">▸ ${f.u}</div></div></div>
 </div>`).join('');
})();
