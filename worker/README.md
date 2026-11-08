# DATA — aktivacija pravog AI razgovora (Cloudflare Worker + Gemini)

1. Google AI Studio (https://aistudio.google.com) → Get API key → izradi ključ (besplatna razina, BEZ uključivanja naplate).
2. Cloudflare (https://dash.cloudflare.com) → besplatan račun.
3. Workers & Pages → Create → Worker → ime `ekorustika-data` → zalijepi sadržaj `worker.js` → Deploy.
4. Storage → KV → Create namespace `LIMITS` → u Workeru: Settings → Bindings → KV → ime varijable `LIMITS`.
5. Worker → Settings → Variables and Secrets:
   - `GEMINI_API_KEY` = tvoj ključ, vrsta **Secret** (ključ nikad ne ide u HTML ni u chat)
   - `AI_ENABLED` = `true`
   - `DAILY_LIMIT` = `300`, `PER_IP_LIMIT` = `20`
   - `ALLOWED_ORIGINS` = `https://ekorustika-lang.github.io`
6. Adresu Workera (npr. https://ekorustika-data.xxx.workers.dev) upisati u `data-voice.js` → `AI_ENDPOINT`.

**Isključivanje AI-ja:** `AI_ENABLED` = `false` (odmah, bez diranja stranice).
