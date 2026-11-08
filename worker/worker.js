// EKORUSTIKA DATA — Cloudflare Worker (posrednik prema Google Gemini API-ju)
// Tajne/varijable (postavljaju se u Cloudflareu, NE u kodu):
//   GEMINI_API_KEY  (Secret)   – ključ iz Google AI Studija
//   AI_ENABLED      ("true"/"false") – glavni prekidač za uključivanje/isključivanje AI-ja
//   DAILY_LIMIT     (npr. "300")  – najviše AI upita ukupno dnevno
//   PER_IP_LIMIT    (npr. "20")   – najviše upita po korisniku (IP) dnevno
//   ALLOWED_ORIGINS – dopuštene stranice, odvojene zarezom
// KV namespace binding: LIMITS (brojači)
const MODEL='gemini-2.0-flash';
const SYSTEM=`Ti si Data, digitalni AI asistent tvrtke EKORUSTIKA DIGITALNI ALATI. Uvijek odgovaraj na hrvatskom, kratko (najviše 4-5 rečenica), prijateljski i jasno jer se odgovor čita naglas.
Usluge: osobni AI asistenti, web stranice, mini aplikacije, kalkulatori i krojne liste, pomoćna AR mjerenja (mjere se uvijek ručno potvrđuju), automatizacije.
Možeš pomoći s organizacijom zadataka, pisanjem ponuda i poruka te predložiti odgovarajuću aplikaciju ili automatizaciju.
Povezivanje e-maila, kalendara i podsjetnika samo je MOGUĆNOST koja se dogovara – nikad ne tvrdi da je već aktivno.
Nikad ne obećavaj cijene, rokove ni termine – za to uputi na Roberta: WhatsApp 091 518 1266 ili ekorustika@gmail.com.
Ako posjetitelj želi ponudu, uz njegov pristanak zamoli ime, kontakt i kratak opis, pa ga uputi da upit pošalje gumbom WhatsApp ili e-mail na stranici. Ne izmišljaj podatke.`;
const json=(d,s,h)=>new Response(JSON.stringify(d),{status:s||200,headers:{'Content-Type':'application/json',...h}});
export default{async fetch(req,env){
  const origin=req.headers.get('Origin')||'';
  const allowed=(env.ALLOWED_ORIGINS||'https://ekorustika-lang.github.io').split(',').map(s=>s.trim());
  const ok=allowed.includes(origin);
  const cors={'Access-Control-Allow-Origin':ok?origin:allowed[0],'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};
  if(req.method==='OPTIONS')return new Response(null,{headers:cors});
  const url=new URL(req.url);const enabled=env.AI_ENABLED==='true'&&!!env.GEMINI_API_KEY;
  if(url.pathname==='/status')return json({enabled},200,cors);
  if(url.pathname!=='/chat'||req.method!=='POST')return json({error:'not found'},404,cors);
  if(!ok)return json({error:'origin'},403,cors);
  if(!enabled)return json({error:'disabled'},503,cors);
  let body;try{body=await req.json()}catch{return json({error:'bad'},400,cors)}
  const msg=String(body.message||'').trim().slice(0,1000);if(!msg)return json({error:'empty'},400,cors);
  // Ograničenja (zaštita od zloupotrebe i troška)
  const day=new Date().toISOString().slice(0,10);const ip=req.headers.get('CF-Connecting-IP')||'x';
  const dl=+env.DAILY_LIMIT||300, il=+env.PER_IP_LIMIT||20;
  const kT='t:'+day,kI='i:'+day+':'+ip;
  const [t,i]=await Promise.all([env.LIMITS.get(kT),env.LIMITS.get(kI)]);
  if((+t||0)>=dl||(+i||0)>=il)return json({error:'limit'},429,cors);
  await Promise.all([env.LIMITS.put(kT,String((+t||0)+1),{expirationTtl:172800}),env.LIMITS.put(kI,String((+i||0)+1),{expirationTtl:172800})]);
  const hist=Array.isArray(body.history)?body.history.slice(-8):[];
  const contents=hist.filter(h=>h&&(h.role==='user'||h.role==='model')).map(h=>({role:h.role,parts:[{text:String(h.text||'').slice(0,1500)}]}));
  contents.push({role:'user',parts:[{text:msg}]});
  try{
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
      body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM}]},contents,generationConfig:{maxOutputTokens:400,temperature:0.6}})});
    if(!r.ok)return json({error:'upstream'},502,cors);
    const d=await r.json();const reply=d?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('').trim();
    if(!reply)return json({error:'upstream'},502,cors);
    return json({reply},200,cors);
  }catch{return json({error:'upstream'},502,cors)}
}};
