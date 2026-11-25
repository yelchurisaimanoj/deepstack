(function(){
const $=s=>document.querySelector(s);

/* ---------- mindset cards ---------- */
const MIND=[
 {i:'👂',h:'Listen for hint words',s:'"Sorted" whispers binary search. "Contiguous" whispers sliding window.',b:'Problems leak their pattern through adjectives: sorted, contiguous, at most K, pair, subsequence. Train your ear before your hands.',d:'Day to day: the same words in a perf bug report hint at the fix.'},
 {i:'🥊',h:'Brute force first',s:'Say the O(n²) idea out loud. Then shave it.',b:'A stated brute force is a floor, not a failure. Every optimization is just removing one kind of repeated work from it. Ask: what am I recomputing?',d:'Day to day: ship the simple loop, profile, then optimize the hot path.'},
 {i:'✏️',h:'Draw before you code',s:'Three boxes and an arrow beat thirty minutes of staring.',b:'Pointers, windows, recursion trees - they are shapes. If you cannot draw the state at step 3, you cannot code it.',d:'Day to day: whiteboard the data flow before touching the keyboard.'},
 {i:'⚓',h:'Name the invariant',s:'What stays true after every step?',b:'Loops are invariant maintenance machines. "Window sum is always correct" or "left half is always sorted" - write it as a comment, then protect it.',d:'Day to day: invariants are how you review code and find race conditions.'}
];
$('#mindset').innerHTML=MIND.map((c,i)=>`
 <div class="fcard" data-page="dsa" data-pid="mind${i}"><span class="tap">flip</span><div class="inner">
  <div class="face"><span class="ic">${c.i}</span><span class="h">${c.h}</span><span class="s">${c.s}</span><span class="deep">tap for the deep idea →</span></div>
  <div class="face back"><span class="tag">deep idea</span><span class="b">${c.b}</span><span class="deep2">${c.d}</span></div>
 </div></div>`).join('');

/* ---------- pattern wardrobe ---------- */
const PAT=[
 {i:'🪟',h:'Sliding window',s:'Contiguous subarray/substring problems',b:'Grow right edge, shrink left edge when the rule breaks. Each element is visited twice at most: O(n).',d:'Costumes: longest substring without repeats, max sum of size K, smallest subarray ≥ target.'},
 {i:'👉👈',h:'Two pointers',s:'Sorted data, pairs, in-place compaction',b:'Start at both ends (or both at start) and move with intent. Each step eliminates a whole row or column of possibilities.',d:'Costumes: pair with sum, remove duplicates in place, container with most water, palindrome check.'},
 {i:'🗜',h:'Binary search on answer',s:'"Minimum capacity / speed / days that works"',b:'When the answer itself is monotonic - if X works, everything bigger works too - binary search the answer space and validate with a greedy check.',d:'Costumes: Koko eating bananas, ship packages in D days, split array largest sum.'},
 {i:'🌊',h:'BFS & DFS',s:'Graphs, trees, grids, levels, reachability',b:'BFS ripples outward: shortest path in unweighted graphs. DFS dives: cycles, components, backtracking. Pick by what the question measures.',d:'Costumes: number of islands, course schedule (topo sort), word ladder, level order.'},
 {i:'#️⃣',h:'Hash map',s:'Counting, complements, de-duplication, grouping',b:'Trade memory for time. Anything you would scan twice, remember once: prefix sums, seen values, character counts.',d:'Costumes: two sum, group anagrams, subarray sum equals K, first unique character.'},
 {i:'🪆',h:'DP & memoization',s:'Overlapping choices, optimal counts, ways-to-reach',b:'Same subproblem twice = cache it. Define state as a question ("best from index i?"), answer it once, reuse forever.',d:'Costumes: climb stairs, house robber, coin change, longest increasing subsequence, edit distance.'}
];
$('#patterns').innerHTML=PAT.map((c,i)=>`
 <div class="fcard" data-page="dsa" data-pid="pat${i}"><span class="tap">flip</span><div class="inner">
  <div class="face"><span class="ic">${c.i}</span><span class="h">${c.h}</span><span class="s">${c.s}</span><span class="deep">tap for the deep idea →</span></div>
  <div class="face back"><span class="tag">deep idea</span><span class="b">${c.b}</span><span class="deep2">${c.d}</span></div>
 </div></div>`).join('');

/* ---------- animated pattern player ---------- */
const ARR=[2,5,1,8,2,9,6,3];
const bars=$('#bars'),cap=$('#pcap');
let timer=null, cur='window';
function draw(active=[],hot=[],found=[],ptrs={}){
  bars.innerHTML=ARR.map((v,i)=>{
    let cls='bar'+(active.includes(i)?' in':'')+(hot.includes(i)?' hot':'')+(found.includes(i)?' found':'');
    let p=Object.entries(ptrs).filter(([,pos])=>pos===i).map(([n])=>`<span class="ptr">${n}</span>`).join('');
    return `<div class="${cls}" style="height:${v/9*100}%"><span>${v}</span>${p}</div>`;
  }).join('');
}
const SCRIPTS={
 window:{t:'Sliding window',s:'Find the max sum of any 3 contiguous elements. The window slides; each element enters once, leaves once.',steps:[
   [[0,1,2],[],[],{},'Window = first 3 elements. Sum = 2+5+1 = <b>8</b>. Best so far: 8.'],
   [[1,2,3],[0],[],{},'Slide: drop 2, add 8. Sum = 5+1+8 = <b>14</b>. New best!'],
   [[2,3,4],[1],[],{},'Slide: drop 5, add 2. Sum = 1+8+2 = <b>11</b>. Worse, keep 14.'],
   [[3,4,5],[2],[],{},'Slide: drop 1, add 9. Sum = 8+2+9 = <b>19</b>. New best!'],
   [[4,5,6],[3],[],{},'Slide: drop 8, add 6. Sum = 2+9+6 = <b>17</b>. Keep 19.'],
   [[5,6,7],[4],[],{ },'Slide: drop 2, add 3. Sum = 9+6+3 = <b>18</b>. Keep 19.'],
   [[3,4,5],[],[3,4,5],{},'Done. One pass, no re-adding: <b>O(n)</b>. Answer: 19 (8+2+9). A nested loop would have re-summed the middle K-1 elements every time.']]},
 twoptr:{t:'Two pointers',s:'Sorted array [2,3,5,6,8,9] - find a pair summing to 11. Pointers walk toward each other; every move kills a whole row of pairs.',arr:[2,3,5,6,8,9],steps:[
   [[0,5],[],[],{L:0,R:5},'L=2, R=9. Sum = 11? 2+9 = <b>11</b>. That is it - but watch the logic that would have found it...'],
   [[0,5],[],[0,5],{L:0,R:5},'If the sum is too big, move R left (everything with the old R and a bigger L is even bigger - skip them all). Too small? Move L right. <b>O(n)</b>, one pass, no pair checked twice.']]},
 bsearch:{t:'Binary search',s:'Sorted array - find 8. Each guess throws away half of what remains. 8 elements, at most 3 guesses.',steps:[
   [[0,1,2,3,4,5,6,7],[],[3],{L:0,M:3,R:7},'Guess the middle: arr[3]=8. Found it immediately this time.'],
   [[0,1,2,3,4,5,6,7],[],[3],{L:0,M:3,R:7},'If arr[M] were too small, we would set L=M+1 and forget the whole left half forever. Too big, R=M-1. Halving every step: <b>O(log n)</b> - a billion elements need only ~30 guesses.']]}
};
function play(){
  clearInterval(timer);
  const S=SCRIPTS[cur]; $('#ptitle').textContent=S.t; $('#psub').textContent=S.s;
  if(S.arr){ARR.length=0;S.arr.forEach(v=>ARR.push(v));}
  let i=0;
  const step=()=>{ const s=S.steps[i]; draw(s[0],s[1],s[2],s[3]); cap.innerHTML=s[4]; i++; if(i>=S.steps.length){clearInterval(timer);$('#pplay').textContent='↺ Replay';} };
  step(); $('#pplay').textContent='⏸ Playing…';
  timer=setInterval(step,1900);
}
$('#pplay').onclick=play;
document.querySelectorAll('[data-pat]').forEach(b=>b.onclick=()=>{cur=b.dataset.pat;play();});
draw([0,1,2],[],[],{}); cap.innerHTML='Press <b>Play</b> and watch only the edges move.';

/* ---------- quiz ---------- */
renderQuiz($('#quiz'),'dsa',[
 {q:'"Find the longest substring with no repeating characters." Your first thought?',opts:['Try every substring and check repeats','Sliding window with a set of what is inside','Binary search on length then validate'],a:1,why:'"Contiguous + at most/without a property" is sliding-window costume. (Binary search on answer is a clever backup!)'},
 {q:'"Sorted array, find two numbers that add to target." Fastest approach?',opts:['Hash map of seen values','Nested loops over all pairs','Two pointers from both ends'],a:2,why:'Sorted = two pointers, O(n) time and O(1) space. Hash map works but costs O(n) memory.'},
 {q:'"Minimum boat capacity to ship everything within 5 days." The giveaway words?',opts:['"minimum ... that works" → binary search on the answer','"ship" → graph BFS','"within" → sliding window'],a:0,why:'A monotonic answer (bigger capacity always still works) means binary search the answer space.'},
 {q:'"Number of islands in a grid." Which family?',opts:['Dynamic programming','BFS/DFS flood fill','Two pointers'],a:1,why:'Reachability on a grid = flood fill. Every BFS/DFS visit marks cells so each is processed once.'},
 {q:'Your O(n²) brute force recomputes the same sums every iteration. The general fix?',opts:['Cache the repeated work (hash map / prefix sums / memo)','Use a faster language','Sort the input first'],a:0,why:'Optimization = stop recomputing. Remember once, reuse forever.'}
]);

/* ---------- FAQs ---------- */
const FAQS=[
 {q:'How do I get good without grinding 500 problems?',a:'Grind patterns, not problems. Twenty problems per pattern, solved slowly with the draw-it-first habit, beats five hundred solved in panic mode. Depth per pattern is what transfers.',u:'At work: the same pattern radar tells you when a feature needs a queue, a cache or just a loop.'},
 {q:'What is amortized analysis, in one line?',a:'Some steps are expensive but rare (like an array doubling), so the average cost per step stays tiny. Judge the whole sequence, not the worst single step.',u:'At work: why appending to a dynamic array or resizing a hash map is "O(1) amortized" - and why that is fine.'},
 {q:'How do I estimate time complexity in 10 seconds?',a:'Ask: how does the work grow when input doubles? One pass → O(n). Halving → O(log n). Nested pass → O(n²). Branches that branch (subsets, recursion without memo) → exponential.',u:'At work: this is how you smell N+1 queries and accidental O(n²) loops in code review.'},
 {q:'When is a greedy solution actually correct?',a:'When a local best choice never blocks a global best (matroid-ish structure), e.g. activity selection. If choosing now can hurt later, you need DP or search. Always try to break your greedy with a tiny counterexample.',u:'At work: greedy = the tempting quick heuristic; the counterexample habit is the senior-engineer move.'},
 {q:'Recursion vs iteration - how do I choose?',a:'Recursion when the problem is self-similar and depth is bounded (trees, divide and conquer). Iteration when depth can explode or the state is just a couple of pointers. Any recursion can be flattened with an explicit stack.',u:'At work: know your stack limits; deep recursion on real data has caused real outages.'},
 {q:'I blank out in interviews. What actually fixes that?',a:'Narrate. Say the brute force, the hint words, and the invariant out loud. Speaking keeps the working memory loop full and buys thinking time - silence is what feels like blanking.',u:'At work: the same narration is great pairing and debugging hygiene.'}
];
$('#faqs').innerHTML=FAQS.map((f,i)=>`
 <div class="faq" data-page="dsa" data-pid="faq${i}">
   <button class="faq-q"><span class="qn">Q${i+1}</span>${f.q}<span class="pm">+</span></button>
   <div class="faq-a"><div class="in">${f.a}<div class="use">▸ ${f.u}</div></div></div>
 </div>`).join('');
})();
