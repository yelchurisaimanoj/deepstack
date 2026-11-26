# ◧ DeepStack - grow past senior, visually

A progressive web app for senior software engineers who want to keep growing but have no patience for walls of text. Deep concepts, shown not told - every idea is a card you flip, a demo you play with, or a system you watch scale.

**Live:** https://yelchurisaimanoj.github.io/deepstack/

## Tracks

| Track | What is inside |
| --- | --- |
| ⟠ **DSA & Problem Solving** | Animated pattern player (sliding window, two pointers, binary search), the pattern wardrobe, mindset cards, pattern-radar quiz |
| ▣ **LLD & Design Patterns** | SOLID as five tiny stories, live demos (Observer, Strategy, Decorator), the classic pattern deck, spot-the-pattern quiz |
| ⛁ **System Design** | Tap-to-scale stepper from 100 users to 1 billion, six building blocks, real walkthroughs (WhatsApp message, URL shortener, food delivery) |
| ✦ **AI & Forward Engineering** | Tokens/embeddings/RAG/agents/evals/guardrails cards, a tokenizer toy, a step-by-step RAG pipeline, the forward-deployed engineer mindset |
| 🧵 **Concurrency & Async** | Threads vs processes, race-condition demo (run it unlocked, then locked), sync-vs-async timeline, deadlock stepper with the fix, semaphores, producer-consumer, happens-before |
| 🧵 **Concurrency & Async** | Threads vs processes, race-condition demo (run unlocked, then locked), sync-vs-async timeline, deadlock stepper with the one-rule fix, semaphores, producer-consumer, happens-before |
| ⚒ **Tools Radar** | The modern toolbox (AI coding, ship & run, watch & debug, team flow), filtered to what matters |

Every track ends with **critical questions** - the ones interviews keep asking, each with a "use it at work" note, because this is for day-to-day engineering, not just interview prep.

## Daily engagement

- **Today's pick** - one fresh idea every day, rotating across all tracks
- **Deep idea of the day** - a rotating one-liner worth a sticky note
- **Streak counter** - consecutive days, kept on the device
- **Progress rings** - per-track completion on the home page

## Built as a PWA

- Installable (Add to Home Screen), works offline after first load
- No backend, no login, no tracking - progress lives in `localStorage`
- Plain HTML/CSS/JS, zero build step, zero dependencies

## Run locally

Any static server works:

```bash
npx serve .        # or: python3 -m http.server
```

## License

MIT
