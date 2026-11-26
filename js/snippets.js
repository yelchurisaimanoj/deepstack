(function(){
const S={};
S.conc=[
{t:'🏁 Race vs lock',note:'Same counter, two threads. The first loses updates; the second is always 200.',langs:{
Python:`import threading

count = 0
lock = threading.Lock()

def unsafe():
    global count
    for _ in range(100_000):
        count += 1          # read, add, write: interleaves

def safe():
    global count
    for _ in range(100_000):
        with lock:          # one thread at a time
            count += 1

# run 2 threads of safe() -> always 200000`,
Java:`class Counter {
    private int n = 0;
    // without 'synchronized' two threads lose updates
    synchronized void inc() { n++; }
    int get() { return n; }
}
// lock-free alternative:
AtomicInteger n = new AtomicInteger();
n.incrementAndGet();   // CAS, no race`}},
{t:'⚡ Async I/O',note:'Three slow calls started together: total time = the slowest, not the sum.',langs:{
Python:`import asyncio

async def fetch(name, secs):
    await asyncio.sleep(secs)   # I/O wait: thread is free
    return name

async def main():
    results = await asyncio.gather(
        fetch("download", 10),
        fetch("pasta", 8),
        fetch("reply", 2),
    )                            # ~10s total, not 20s
    print(results)

asyncio.run(main())`,
JavaScript:`const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchIt(name, secs) {
  await wait(secs * 1000);   // yields; event loop keeps going
  return name;
}

const results = await Promise.all([
  fetchIt("download", 10),
  fetchIt("pasta", 8),
  fetchIt("reply", 2),
]);                          // ~10s total`}},
{t:'☠️ Deadlock fix',note:'Same two locks, one rule: always take lock 1 before lock 2.',langs:{
Python:`import threading
lock1, lock2 = threading.Lock(), threading.Lock()

def bad_b():                 # B takes them in reverse
    with lock2:
        with lock1:          # A holds 1 wants 2 -> stuck
            ...

def good(): # EVERY thread uses the same order
    with lock1:
        with lock2:
            ...`,
Java:`// Deadlock-prone: order depends on arguments
void transfer(Account a, Account b) {
    synchronized (a) { synchronized (b) { ... } }
}
// Fix: impose a global order (e.g. by id)
void transfer(Account a, Account b) {
    Account first  = a.id < b.id ? a : b;
    Account second = a.id < b.id ? b : a;
    synchronized (first) { synchronized (second) { ... } }
}`}},
{t:'🧵 Thread pool',note:'A fixed crew serves a queue of tasks. Never one thread per task.',langs:{
Python:`from concurrent.futures import ThreadPoolExecutor

def resize(img):
    ...

with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(resize, images))
# 10,000 images, only 8 threads alive`,
Java:`ExecutorService pool = Executors.newFixedThreadPool(8);
List<Future<Image>> out = new ArrayList<>();
for (Image img : images) {
    out.add(pool.submit(() -> resize(img)));
}
pool.shutdown();   // finish queued work, accept no more`}},
{t:'🚦 Semaphore',note:'At most N at once: upload limits, connection caps, rate limits.',langs:{
Python:`import asyncio

sem = asyncio.Semaphore(5)      # max 5 at a time

async def upload(f):
    async with sem:             # waits if 5 are running
        await send(f)

await asyncio.gather(*(upload(f) for f in files))`,
Java:`Semaphore sem = new Semaphore(5);

void upload(File f) throws InterruptedException {
    sem.acquire();
    try { send(f); }
    finally { sem.release(); }   // always release
}`}},
{t:'📬 Producer-consumer',note:'A bounded queue decouples speeds and gives you backpressure for free.',langs:{
Python:`import queue, threading

q = queue.Queue(maxsize=100)    # full queue blocks producers

def producer():
    for job in jobs():
        q.put(job)              # waits when full = backpressure

def consumer():
    while True:
        job = q.get()
        handle(job)
        q.task_done()

for _ in range(4):
    threading.Thread(target=consumer, daemon=True).start()`,
Java:`BlockingQueue<Job> q = new ArrayBlockingQueue<>(100);

// producer
q.put(job);            // blocks if full

// consumer
while (true) {
    Job j = q.take();  // blocks if empty
    handle(j);
}`}}
];
S.dsa=[
{t:'🪟 Sliding window',note:'Max sum of any 3 contiguous items. Each element enters once, leaves once: O(n).',langs:{
Python:`def max_window(a, k=3):
    window = sum(a[:k])
    best = window
    for i in range(k, len(a)):
        window += a[i] - a[i - k]   # add new, drop old
        best = max(best, window)
    return best

max_window([2,5,1,8,2,9,6,3])   # 19`,
JavaScript:`function maxWindow(a, k = 3) {
  let w = a.slice(0, k).reduce((x, y) => x + y, 0);
  let best = w;
  for (let i = k; i < a.length; i++) {
    w += a[i] - a[i - k];     // add new, drop old
    best = Math.max(best, w);
  }
  return best;
}`}},
{t:'👉👈 Two pointers',note:'Pair with a target sum in a sorted array. Every step discards a whole row of options.',langs:{
Python:`def pair_sum(a, target):
    l, r = 0, len(a) - 1
    while l < r:
        s = a[l] + a[r]
        if s == target: return (l, r)
        if s < target:  l += 1      # need bigger
        else:           r -= 1      # need smaller
    return None`,
JavaScript:`function pairSum(a, target) {
  let l = 0, r = a.length - 1;
  while (l < r) {
    const s = a[l] + a[r];
    if (s === target) return [l, r];
    if (s < target) l++; else r--;
  }
  return null;
}`}},
{t:'🗜 Binary search',note:'Halve the search space every step: O(log n). Works on any monotonic answer.',langs:{
Python:`def search(a, x):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == x: return mid
        if a[mid] < x:  lo = mid + 1
        else:           hi = mid - 1
    return -1`,
JavaScript:`function search(a, x) {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] === x) return mid;
    a[mid] < x ? lo = mid + 1 : hi = mid - 1;
  }
  return -1;
}`}},
{t:'🪆 DP memo',note:'Same subproblem twice? Cache it. Exponential turns into linear.',langs:{
Python:`from functools import lru_cache

@lru_cache(None)
def stairs(n):               # ways to climb n steps (1 or 2)
    if n <= 2: return n
    return stairs(n - 1) + stairs(n - 2)

stairs(50)   # instant; without the cache: never finishes`,
JavaScript:`const memo = new Map();
function stairs(n) {
  if (n <= 2) return n;
  if (memo.has(n)) return memo.get(n);
  const v = stairs(n - 1) + stairs(n - 2);
  memo.set(n, v);
  return v;
}`}}
];
S.lld=[
{t:'🔔 Observer',note:'Subject keeps a list; notifyAll() reaches everyone without knowing who they are.',langs:{
Python:`class Channel:
    def __init__(self):
        self.subs = []
    def subscribe(self, fn):   self.subs.append(fn)
    def unsubscribe(self, fn): self.subs.remove(fn)
    def upload(self, video):
        for fn in self.subs:   # loose coupling
            fn(video)

ch = Channel()
ch.subscribe(lambda v: print("Asha got", v))
ch.upload("Concurrency 101")`,
Java:`interface Subscriber { void notify(String video); }

class Channel {
    private final List<Subscriber> subs = new ArrayList<>();
    void subscribe(Subscriber s) { subs.add(s); }
    void upload(String video) {
        subs.forEach(s -> s.notify(video));
    }
}`}},
{t:'🔀 Strategy',note:'Swap behavior by swapping objects. No if-else jungle inside checkout.',langs:{
Python:`class Upi:  
    def pay(self, amt): return f"UPI {amt} ok"
class Card: 
    def pay(self, amt): return f"3DS card {amt} ok"
class Cod:  
    def pay(self, amt): return f"cash {amt} on delivery"

class Checkout:
    def __init__(self, strategy): self.strategy = strategy
    def pay(self, amt): return self.strategy.pay(amt)

Checkout(Upi()).pay(499)`,
Java:`interface Payment { String pay(int amt); }
class Upi  implements Payment { public String pay(int a){ return "UPI " + a; } }
class Card implements Payment { public String pay(int a){ return "Card " + a; } }

class Checkout {
    private final Payment p;      // depend on the socket
    Checkout(Payment p) { this.p = p; }
    String pay(int amt) { return p.pay(amt); }
}`}},
{t:'☕ Decorator',note:'Wrap an object to add behavior. Toppings stack without a class per combination.',langs:{
Python:`class Coffee:
    def cost(self): return 50

class Mocha:
    def __init__(self, inner): self.inner = inner
    def cost(self): return self.inner.cost() + 30

class Whip:
    def __init__(self, inner): self.inner = inner
    def cost(self): return self.inner.cost() + 20

Whip(Mocha(Coffee())).cost()   # 100`,
Java:`interface Drink { int cost(); }
class Coffee implements Drink { public int cost(){ return 50; } }

class Mocha implements Drink {
    private final Drink inner;
    Mocha(Drink d) { inner = d; }
    public int cost() { return inner.cost() + 30; }
}
new Mocha(new Coffee()).cost();   // 80`}},
{t:'🎛 DI (the D in SOLID)',note:'Pass the dependency in; swap real for fake in tests.',langs:{
Python:`class Notifier:
    def __init__(self, sender):      # injected, not created inside
        self.sender = sender
    def alert(self, msg):
        self.sender.send(msg)

class Email:  
    def send(self, m): print("mail", m)
class FakeSender:
    def __init__(self): self.sent = []
    def send(self, m): self.sent.append(m)   # easy to test`,
Java:`class Notifier {
    private final Sender sender;      // abstraction
    Notifier(Sender s) { this.sender = s; }
    void alert(String m) { sender.send(m); }
}
// prod: new Notifier(new EmailSender())
// test: new Notifier(new FakeSender())`}}
];
const page=document.body.dataset.page, el=document.getElementById('codeview');
if(el&&S[page]&&window.DS_CODE)DS_CODE(el,S[page]);
})();
