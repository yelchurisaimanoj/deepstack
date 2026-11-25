(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const CATN={ai:'AI coding',ship:'Ship & run',watch:'Watch & debug',team:'Team flow'};
const TOOLS=[
 {c:'ai',i:'🧑‍✈️',h:'Claude Code / Codex CLI',s:'Agents that edit your repo from the terminal.',b:'Not autocomplete: they read the codebase, run tests, make commits. Senior skill = writing the brief and reviewing the diff like a PR from a fast junior.'},
 {c:'ai',i:'⌨️',h:'Cursor',s:'The AI-first IDE fork of VS Code.',b:'Chat with your whole repo, multi-file edits, inline refactors. Whatever IDE you keep, repo-aware AI editing is the new baseline - learn its review workflow, not just its autocomplete.'},
 {c:'ai',i:'🐙',h:'GitHub Copilot',s:'The incumbent, now with agents and reviews.',b:'Where it wins: it is already inside your company\'s GitHub. Autocomplete, chat, PR summaries, code review agents. Boring, approved, everywhere.'},
 {c:'ai',i:'🎨',h:'v0 & friends',s:'Prompt-to-UI generators.',b:'Describe the screen, get React + Tailwind. Best use: prototypes and internal tools, not your core product. A senior uses it to skip the blank page, then rewrites the output properly.'},
 {c:'ship',i:'🐳',h:'Docker & Kubernetes',s:'Package once, run anywhere; orchestrate fleets.',b:'Containers killed "works on my machine". K8s schedules, heals and scales those containers. You do not need to be an operator - you need to read a pod log and a deployment spec.'},
 {c:'ship',i:'🏗',h:'Terraform',s:'Infrastructure as code, reviewed like code.',b:'Your VPC, databases and queues become reviewable, repeatable files. The senior habit: no console clicks in production - every change is a PR with a plan.'},
 {c:'ship',i:'⚙️',h:'GitHub Actions / CI',s:'Every push, checked automatically.',b:'Tests, lint, build, deploy on every commit. CI is the team\'s immune system: cheap checks that catch disease before production. A flaky suite is a page-one bug.'},
 {c:'ship',i:'▲',h:'Vercel / Netlify',s:'Push to deploy, preview per PR.',b:'Frontend and serverless backends with a URL per pull request. The preview-link workflow changed how teams review - you click the change instead of imagining it.'},
 {c:'watch',i:'📊',h:'Grafana + Prometheus',s:'Metrics and dashboards for everything.',b:'Numbers over time: latency, error rates, saturation. Senior move: the four golden signals on one dashboard before launch, not after the first incident.'},
 {c:'watch',i:'🐞',h:'Sentry',s:'Every crash, with the story attached.',b:'Exceptions arrive grouped, with stack traces, release versions and the exact user action. You fix the top issue, not the loudest complaint.'},
 {c:'watch',i:'📮',h:'Postman / Bruno',s:'APIs you can poke, save and share.',b:'Collections turn "did the endpoint break?" into one click. Save the requests you used in the incident - they become tomorrow\'s smoke tests.'},
 {c:'team',i:'📐',h:'Linear',s:'Issue tracking that stays out of the way.',b:'Fast, keyboard-first, cycle-based. The lesson is not the tool: it is that small, well-groomed issues ship faster than epics that rot.'},
 {c:'team',i:'📓',h:'Notion / wiki docs',s:'Decisions need a home that is not chat.',b:'Design docs and decision records outlive Slack threads. Senior engineers write the one-pager; juniors discover this during the third re-explanation.'},
 {c:'team',i:'🔀',h:'Trunk-based + feature flags',s:'Merge small, hide unfinished work behind flags.',b:'Long-lived branches are where merges go to die. Flags decouple deploy from release: ship dark, turn on gradually, kill switch when it hurts.'}
];
function draw(cat){
  $('#tools').innerHTML=TOOLS.map((c,i)=>({c,i})).filter(x=>cat==='all'||x.c.c===cat).map(({c,i})=>`
   <div class="fcard" data-page="tools" data-pid="t${i}"><span class="tap">flip</span><div class="inner">
    <div class="face"><span class="ic">${c.i}</span><span class="h">${c.h}</span><span class="tag">${CATN[c.c]}</span><span class="s">${c.s}</span><span class="deep">tap: when to reach for it →</span></div>
    <div class="face back"><span class="tag">${CATN[c.c]}</span><span class="b">${c.b}</span></div>
   </div></div>`).join('');
}
$$('#cats .chip').forEach(b=>b.onclick=()=>{$$('#cats .chip').forEach(x=>x.classList.toggle('on',x===b));draw(b.dataset.c);});
draw('all');

renderQuiz($('#quiz'),'tools',[
 {q:'A junior asks "should we add Kubernetes?" Your first question back?',opts:['How many servers and how many deploys a week?','Do you know YAML?','Which cloud?'],a:0,why:'Tools are earned by pain. Tiny fleet, rare deploys = the orchestrator is the complexity.'},
 {q:'"It worked locally, broke in prod." The class of fix?',opts:['Containers + CI: same artifact everywhere, checked on every push','More meetings','A bigger laptop'],a:0,why:'Environment drift is a build problem. Package once, verify automatically, deploy that exact thing.'},
 {q:'Best moment to add monitoring dashboards?',opts:['After the first big outage','Before launch - golden signals from day one','When customers complain'],a:1,why:'You cannot debug what you cannot see. Observability is a launch requirement, not a retro action item.'},
 {q:'AI agent edited 14 files. What makes that safe?',opts:['Trust the model','Small diffs, strong tests, and a human reviewing like it is a PR','Commit directly to main'],a:1,why:'The workflow is the safety: brief well, diff small, test hard, review everything.'}
]);

const FAQS=[
 {q:'How do I pick tools without chasing every new thing?',a:'One per category, learned deeply, replaced only when pain is proven twice. Evaluate on: does it remove a recurring pain, will it exist in three years, can the team learn it in a week?',u:'At work: a boring, mastered stack beats a thrilling, shallow one.'},
 {q:'Interviewers ask "what is in your toolbox" - what do they want?',a:'Not a list - a story. One tool per job (build, ship, watch, fix), why you chose it, and one time it saved you. Trade-off awareness is the senior signal.',u:'At work: keep that story current; it is also your mentoring material.'},
 {q:'AI coding tools: what is the actual senior workflow?',a:'You write the brief and the tests, the tool writes the first draft, you review the diff like a PR. Never let it commit unseen. Speed comes from skipping the blank page, not from skipping review.',u:'At work: model your workflow for juniors; they are copying you.'},
 {q:'How much DevOps should a senior engineer really know?',a:'Enough to deploy your own service, read its logs and roll it back. Deep operations can be a team - ownership of your code\'s life cannot be outsourced.',u:'At work: "I can ship and unship my change" is the minimum bar.'},
 {q:'Terminal, IDE, or GUI tools - does it matter?',a:'Pick whichever you will actually master, then learn its keyboard. Ten tool-switching minutes a day is a week a year. Depth in one interface beats tourism in five.',u:'At work: watch your own screen recording once; the inefficiency will horrify you into shortcuts.'}
];
$('#faqs').innerHTML=FAQS.map((f,i)=>`
 <div class="faq" data-page="tools" data-pid="faq${i}">
   <button class="faq-q"><span class="qn">Q${i+1}</span>${f.q}<span class="pm">+</span></button>
   <div class="faq-a"><div class="in">${f.a}<div class="use">▸ ${f.u}</div></div></div>
 </div>`).join('');
})();
