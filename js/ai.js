(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

/* ---------- concept cards ---------- */
const CONC=[
 {i:'🧱',h:'Tokens',s:'The atoms of every prompt.',b:'Models read chunks, not characters: "unbelievable" might be 3 tokens, "the" is 1. Pricing, speed and memory are all measured in tokens. Rough rule: 100 tokens ≈ 75 words.',d:'Deep idea: your prompt, the docs you retrieved and the answer all share one context budget.'},
 {i:'🧭',h:'Embeddings',s:'Meaning as coordinates.',b:'An embedding turns text into a point in space where similar meanings sit close together. "Refund policy" lands near "money back" even with zero shared words. That is what semantic search is.',d:'Deep idea: distance in this space IS the search algorithm.'},
 {i:'📚',h:'RAG',s:'Open-book exam for an LLM.',b:'Instead of hoping the model memorized your docs, retrieve the relevant chunks and paste them into the prompt. Fresh, private, citable knowledge - no retraining needed.',d:'Deep idea: most "AI features" in production are RAG wearing a nicer name.'},
 {i:'🔁',h:'Agents',s:'A loop, not a miracle.',b:'Observe → think → act with a tool → observe the result → repeat. The magic is the loop plus good tools: search, code execution, APIs. Guardrails and step limits keep the loop honest.',d:'Deep idea: you design the tools and the loop; the model supplies judgment.'},
 {i:'🎛',h:'Prompt vs fine-tune',s:'Steering vs rewiring.',b:'Prompting changes what the model does this conversation - cheap, instant, reversible. Fine-tuning changes the model itself - for tone, format or niche skill, at real cost. Try prompting for weeks first.',d:'Deep idea: fine-tuning is for form, RAG is for facts.'},
 {i:'📏',h:'Evals',s:'Unit tests for behavior you cannot assert.',b:'You cannot == a paragraph, so you build graded test sets: golden questions, rubric scoring, sometimes an LLM as judge. Without evals every prompt tweak is a coin flip.',d:'Deep idea: teams that ship AI reliably are teams with evals, not better prompts.'},
 {i:'🕳',h:'Hallucination',s:'Fluent, confident, wrong.',b:'The model is a next-token engine, not a database. It will invent APIs, citations and facts with a straight face. Fight it with retrieval, citations and verification - never with trust.',d:'Deep idea: design so that a wrong answer is caught, not so that it never happens.'},
 {i:'🛡',h:'Guardrails',s:'Seatbelts around the model.',b:'Input filters, output validators, allow-listed tools, human approval for risky actions. The model suggests; deterministic code decides what actually runs.',d:'Deep idea: never let a probabilistic system make an irreversible call alone.'}
];
$('#concepts').innerHTML=CONC.map((c,i)=>`
 <div class="fcard" data-page="ai" data-pid="c${i}"><span class="tap">flip</span><div class="inner">
  <div class="face"><span class="ic">${c.i}</span><span class="h">${c.h}</span><span class="s">${c.s}</span><span class="deep">tap for the deep idea →</span></div>
  <div class="face back"><span class="tag">deep idea</span><span class="b">${c.b}</span><span class="deep2">${c.d}</span></div>
 </div></div>`).join('');

/* ---------- tokenizer toy ---------- */
const PALETTE=['#22d3ee','#f472b6','#facc15','#34d399','#c084fc','#fb7185','#818cf8'];
const LIMIT=32;
function tokify(){
  const t=$('#tokin').value;
  const toks=t.match(/\S+\s*|[.,!?;:]\s*/g)||[];
  $('#tokout').innerHTML=toks.map((w,i)=>`<span class="tok" style="background:${PALETTE[i%PALETTE.length]}">${w.replace(/</g,'&lt;')||' '}</span>`).join('')||'<span style="color:var(--dim)">tokens appear here…</span>';
  const n=toks.length, pct=Math.min(100,Math.round(n/LIMIT*100));
  $('#ctxfill').style.width=pct+'%';
  $('#ctxlabel').innerHTML=n===0?'':`${n} tokens · ${pct}% of this toy window. `+(n>LIMIT?'<b style="color:#fb7185">Overflow - the oldest tokens fall out. That is what "the model forgot" means.</b>':'Everything inside the window is all the model can see.');
}
$('#tokin').addEventListener('input',tokify); tokify();

/* ---------- RAG stepper ---------- */
const RAG=[
 ['❓ Question','"What is our refund policy for annual plans?" arrives. The model has never seen your policy docs.'],
 ['🧭 Embed','The question becomes a vector - a point in meaning-space.'],
 ['🔍 Retrieve','Search the vector DB for nearby chunks: the closest is your actual refund policy, page 3. Keyword search would miss it; meaning search does not.'],
 ['📝 Augment','The prompt becomes: system rules + retrieved policy chunks + the question. This is the "augmented" part.'],
 ['💬 Generate','The model answers from the pasted context and cites the source. Fresh docs tomorrow? Re-index - no retraining, no new model.']
];
let ragStep=0;
function drawRag(){
  $('#ragflow').innerHTML=RAG.map((s,i)=>{
    const on=i<=ragStep;
    return `<div class="tier"><div class="node ${on?'on':''} ${i===ragStep?'new':''}" style="opacity:${on?1:.18};border-color:${on?'var(--ai1)':'var(--line)'}">${s[0]}</div></div>`+
      (i<RAG.length-1?`<div class="arrow ${on?'on':''}">↓</div>`:'');
  }).join('');
  $('#ragcap').innerHTML=`<b>Step ${ragStep+1}/${RAG.length}:</b> ${RAG[ragStep][1]}`;
  $('#ragnext').textContent=ragStep>=RAG.length-1?'Pipeline complete ✓':'Next step →';
  $('#ragnext').disabled=ragStep>=RAG.length-1;
  if(ragStep>=RAG.length-1)DS.mark('ai','rag');
}
$('#ragnext').onclick=()=>{ if(ragStep<RAG.length-1){ragStep++;drawRag();} };
$('#ragreset').onclick=()=>{ragStep=0;drawRag();};
drawRag();

/* ---------- FDE ---------- */
const FDE=[
 {i:'🪖',h:'Embed with the customer',s:'Special forces, not back office.',b:'A forward-deployed engineer sits inside the customer\'s world - their data, their chaos, their Monday-morning meeting. The product gets built where it will be used, not where it was imagined.',d:'Skill: turning messy reality into a running system in days.'},
 {i:'⚡',h:'Ship in days, not quarters',s:'Momentum is the product strategy.',b:'FDEs prototype on real data immediately: a thin end-to-end slice in week one, then harden. Every week the customer sees something new working in their own environment.',d:'Skill: ruthless scoping - the thinnest slice that proves value.'},
 {i:'🎯',h:'Own the outcome, not the ticket',s:'"Login page done" is not the job. "Their team actually uses it" is.',b:'Success is measured in the customer\'s metrics: hours saved, errors caught, adoption. An FDE who ships fast but moves nothing has not finished.',d:'Skill: saying no to features that do not move the outcome.'},
 {i:'🔁',h:'Be the feedback loop',s:'Every deployment teaches the product.',b:'What breaks at one customer becomes a platform feature for all. FDEs carry field truth back to the core team - the best product roadmap is written in production.',d:'Skill: generalizing one customer\'s pain into everyone\'s feature.'}
];
$('#fde').innerHTML=FDE.map((c,i)=>`
 <div class="fcard" data-page="ai" data-pid="fde${i}"><span class="tap">flip</span><div class="inner">
  <div class="face"><span class="ic">${c.i}</span><span class="h">${c.h}</span><span class="s">${c.s}</span><span class="deep">tap for the skill →</span></div>
  <div class="face back"><span class="tag">the role</span><span class="b">${c.b}</span><span class="deep2">${c.d}</span></div>
 </div></div>`).join('');

/* ---------- quiz ---------- */
renderQuiz($('#quiz'),'ai',[
 {q:'"Chat with our company handbook" - what architecture?',opts:['Fine-tune a model on the handbook','RAG: retrieve the right chunks, put them in the prompt','A very long system prompt'],a:1,why:'Facts change, models are expensive to retrain. Retrieve fresh facts at question time.'},
 {q:'The AI feature worked in the demo, degrades after every prompt tweak. What is missing?',opts:['A bigger model','Evals: a graded test set that scores every change','Longer prompts'],a:1,why:'Without evals you cannot tell improvement from luck. Evals are CI for behavior.'},
 {q:'Support bot invents a refund policy that does not exist. Root cause thinking?',opts:['The model is broken','Hallucination: it generates plausible text, not verified fact - add retrieval + citations','Users ask wrong questions'],a:1,why:'Fluency is not truth. Ground answers in retrieved sources and verify before acting.'},
 {q:'Your agent keeps looping forever calling tools. The fix pattern?',opts:['Step limits + clear done-conditions + guardrails','More GPUs','Remove all tools'],a:0,why:'Agents are loops; every loop in software needs a stop condition and a budget.'},
 {q:'Legal asks "can the AI approve refunds by itself?" The guardrail answer?',opts:['Yes if the prompt says be careful','Probabilistic suggestions, deterministic decisions: model proposes, rules code approves, humans above a threshold','Yes, add a confirmation popup'],a:1,why:'Irreversible actions never rest on a probability alone.'}
]);

/* ---------- FAQs ---------- */
const FAQS=[
 {q:'Will AI replace senior engineers?',a:'It replaces tasks, not judgment. Boilerplate, tests, first drafts - automated. Knowing what to build, catching the wrong answer, owning the system at 2 AM - more valuable than ever. The market is splitting into engineers who direct AI and engineers who compete with it.',u:'At work: be the one who reviews AI output like a senior, not the one who types like a junior.'},
 {q:'Do I need the math (linear algebra, backprop)?',a:'To build products on models: no. To push model capability itself: yes. A senior engineer needs the mental models - tokens, context, embeddings, evals - not the derivations. Learn the math later if the pull comes.',u:'At work: you can ship a great RAG feature this month with zero calculus.'},
 {q:'Prompting, RAG or fine-tuning - how do I choose?',a:'In order: prompt first (free, instant). Add RAG when it lacks knowledge. Fine-tune only when it lacks skill or format that examples cannot teach - and you have evals to prove the gain. Most teams never need step three.',u:'At work: this ordering saves quarters of wasted effort.'},
 {q:'How do I add an AI feature safely to an existing product?',a:'Start read-only: suggest, do not act. Add citations so answers are checkable. Log everything for evals. Add actions last, behind allow-lists and human approval for anything irreversible.',u:'At work: "suggest first, act later" gets AI features past every risk review.'},
 {q:'What exactly is an "AI agent" in 2026?',a:'An LLM in a loop with tools: it plans, calls APIs, reads results, adjusts. The engineering is 90% classic - tool design, state, retries, limits - and 10% prompt. That is why senior engineers are good at this.',u:'At work: treat agent projects as systems projects, not magic projects.'},
 {q:'How do I stay current without drowning in AI news?',a:'Pick one hands-on project per quarter (build a small agent, add RAG to something). News fades; the muscle stays. Read release notes of one major model family and skip the daily firehose.',u:'At work: one shipped experiment teaches more than fifty threads.'}
];
$('#faqs').innerHTML=FAQS.map((f,i)=>`
 <div class="faq" data-page="ai" data-pid="faq${i}">
   <button class="faq-q"><span class="qn">Q${i+1}</span>${f.q}<span class="pm">+</span></button>
   <div class="faq-a"><div class="in">${f.a}<div class="use">▸ ${f.u}</div></div></div>
 </div>`).join('');
})();
