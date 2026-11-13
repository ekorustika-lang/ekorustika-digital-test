'use strict';
// Adresa Cloudflare Workera (posrednik prema Gemini API-ju). API kljuc NIJE ovdje - spremljen je kao Secret u Cloudflareu.
const AI_ENDPOINT = '';
const $ = id => document.getElementById(id);
$('year').textContent = String(new Date().getFullYear());
const GREETING = 'Dobro do\u0161li u EKORUSTIKA! Ja sam Data. Trenutno radim u demo na\u010dinu: mogu vam objasniti usluge, cijene i pomo\u0107i odabrati uslugu.';
// Izgovor: na ekranu ostaje EKORUSTIKA, a glas cita fonetski 'Eko rustika' (s padezima).
function spoken(t){return String(t).replace(/\bEKORUSTIK(A|E|I|U|OM)\b/gi,(m,e)=>'Eko rustik'+e.toLowerCase()).replace(/Dobro do\u0161li u Eko rustika/g,'Dobro do\u0161li u Eko rustiku')}
const tts = 'speechSynthesis' in window;
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const idle=()=>aiOn?'SPREMAN':'DEMO NAČIN';
let speaking=false, listening=false, muted=false, inFlight=false, hist=[], aiOn=false;
const setState=(c,l)=>{$('orb').className='dataOrb'+(c?' '+c:'');$('state').textContent=l};
const status=t=>{$('voiceStatus').textContent=t};
function bubble(m,k){const e=document.createElement('div');e.className='bubble '+k;e.textContent=m;$('messages').appendChild(e);$('messages').scrollTop=1e9;return e}
function hrVoice(){const v=speechSynthesis.getVoices();return v.find(x=>/^hr/i.test(x.lang))||v.find(x=>/^(sr|bs|sl)/i.test(x.lang))}
let rec=null;
function stopListening(){if(rec&&listening){try{rec.abort()}catch{}}listening=false;$('microphone').classList.remove('on')}
function say(text){return new Promise(res=>{if(!tts||muted){res();return}stopListening();speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(spoken(text));u.lang='hr-HR';u.rate=0.95;u.pitch=1;const v=hrVoice();if(v)u.voice=v;u.onstart=()=>{speaking=true;setState('speaking','GOVORI')};const end=()=>{speaking=false;setState('',idle());res()};u.onend=end;u.onerror=end;speechSynthesis.speak(u)})}
function stopSpeaking(){if(tts)speechSynthesis.cancel();speaking=false;setState('',idle())}
if(SR){rec=new SR();rec.lang='hr-HR';rec.interimResults=false;rec.maxAlternatives=1;
 rec.onresult=e=>{const t=e.results?.[0]?.[0]?.transcript||'';if(t){$('question').value=t;send()}};
 rec.onerror=e=>status(e.error==='not-allowed'?'Mikrofon nije dopušten. Omogućite ga u postavkama preglednika.':'Nisam vas čuo. Pokušajte ponovno ili upišite pitanje.');
 rec.onend=()=>{listening=false;$('microphone').classList.remove('on');if(!inFlight&&!speaking)setState('',idle())}}
$('microphone').addEventListener('click',()=>{if(!rec){status('Prepoznavanje govora nije podržano u ovom pregledniku. Upišite pitanje.');return}if(listening){stopListening();return}stopSpeaking();try{rec.start();listening=true;$('microphone').classList.add('on');setState('listening','SLUŠA');status('Slušam… govorite na hrvatskom.')}catch{status('Mikrofon trenutno nije dostupan.')}});
$('stopVoice').addEventListener('click',()=>{stopSpeaking();status('Govor je zaustavljen.')});
let greeted=false;
function greet(){greeted=true;muted=false;bubble(GREETING,'system');say(GREETING);$('greet').textContent='🔁 PONOVI POZDRAV'}
$('greet').addEventListener('click',greet);
// Pozdrav se pokrece pri prvom otvaranju razgovora.

// Internetska veza: navigator.onLine na nekim mobitelima javlja krivo, pa se prije upozorenja provjeri stvarni dohvat.
let netOk=true;
async function realOnline(){try{const c=new AbortController();const t=setTimeout(()=>c.abort(),5000);const r=await fetch('manifest.webmanifest?ping='+Date.now(),{cache:'no-store',signal:c.signal});clearTimeout(t);return r.ok}catch{return false}}
async function offline(){const ok=navigator.onLine?true:await realOnline();netOk=ok;document.body.classList.toggle('offline',!ok)}
addEventListener('online',offline);addEventListener('offline',()=>setTimeout(offline,1500));offline();
async function checkAI(){const box=$('aiInfo');if(!AI_ENDPOINT){box.innerHTML='<strong>Način rada:</strong> DEMO. Pravi AI servis nije povezan. Data odgovara unaprijed pripremljenim odgovorima o uslugama i cijenama. Glas i mikrofon rade.';return}
 try{const r=await fetch(AI_ENDPOINT+'/status');const d=await r.json();aiOn=!!d.enabled;$('modeTag').textContent=aiOn?'AI':'DEMO';setState('',idle());if($('exNote'))$('exNote').textContent=aiOn?'Primjeri se šalju Dati.':'Primjeri čekaju aktivaciju pravog AI servisa.';box.innerHTML=aiOn?'<strong>Status AI razgovora:</strong> ✅ aktivan (Gemini).':'<strong>Status AI razgovora:</strong> trenutno isključen.'}catch{box.innerHTML='<strong>Status AI razgovora:</strong> servis trenutno nije dostupan.'}}
checkAI();

// DEMO nacin: unaprijed pripremljeni odgovori (nije umjetna inteligencija).
const SVC=[
 {k:/grafi|oglas|vizual|objav|plakat|letak/i,n:'Grafički oglasi',p:'od 15 €',d:'reklamne objave i vizuale za društvene mreže'},
 {k:/video|reel|tiktok|snim|film/i,n:'Video reklame',p:'od 39 €',d:'kratke promotivne videe i Reels'},
 {k:/obraz|forma|narud[žz]b|mjer|upitnik/i,n:'Digitalni obrasci',p:'od 69 €',d:'obrasce za narudžbe, upite i mjere povezane s WhatsAppom'},
 {k:/web|stranic|sajt|site|domen/i,n:'Web stranice',p:'od 149 €',d:'jednostavne moderne web stranice'},
 {k:/aplikac|kalkulat|evidenc|alat|app/i,n:'Poslovne mini aplikacije',p:'od 149 €',d:'kalkulatore cijena, evidencije i slične alate'},
 {k:/\bai\b|asistent|chat|bot|umjetn/i,n:'AI asistenti',p:'cijena prema dogovoru',d:'AI asistente s funkcijama koje su tehnički izvedive i testirane'}];
const NOTE='Cijene su početne i ovise o opsegu projekta.';
function demoReply(q){const t=q.toLowerCase();
 if(/naru[čc]|kupi|kontakt|ponud/i.test(t)&&!SVC.some(s=>s.k.test(t)))return{m:'Naručivanje je jednostavno: ispunite obrazac (ime, kontakt, usluga, opis) i pošaljite ga na WhatsApp ili e-mail. Slanje potvrđujete sami u svojoj aplikaciji.',s:''};
 if(/kupc|instagram|facebook|mre[žz]|promoc|reklam|marketing|vidljiv/i.test(t)&&!/video|oglas|web|obraz/i.test(t))return{m:'Za više kupaca na društvenim mrežama najčešće preporučujemo Grafičke oglase (od 15 €) za redovite objave ili Video reklame (od 39 €) za Reels. '+NOTE,s:'Video reklame'};
 if(/uslug|cijen|ko[šs]t|nud|cjenik/i.test(t)&&!SVC.some(s=>s.k.test(t)))return{m:'Naše usluge i početne cijene:\n• Grafički oglasi – od 15 €\n• Video reklame – od 39 €\n• Digitalni obrasci – od 69 €\n• Web stranice – od 149 €\n• Poslovne mini aplikacije – od 149 €\n• AI asistenti – prema dogovoru\n'+NOTE,s:''};
 const hit=SVC.filter(s=>s.k.test(t));
 if(hit.length){const s=hit[0];return{m:`${s.n} – ${s.p}. Izrađujemo ${s.d}. ${NOTE} Želite li poslati upit?`,s:s.n}}
 if(/salon|frizer|restoran|kafi|majstor|obrt|trgovin|termin/i.test(t))return{m:'Za obrt ili salon dobro rade Digitalni obrasci (od 69 €) za upite i termine preko WhatsAppa, a uz njih Web stranica (od 149 €). '+NOTE,s:'Digitalni obrasci'};
 if(/bok|pozdrav|dobar|hej|zdravo/i.test(t))return{m:'Pozdrav! U demo načinu mogu vam objasniti usluge, cijene i pomoći odabrati uslugu. Što vam treba: oglas, video, obrazac ili web?',s:''};
 return{m:'U demo načinu znam odgovoriti samo o uslugama, cijenama i naručivanju EKORUSTIKE. Napišite npr. „video”, „oglas”, „web” ili „cijene”, ili pošaljite upit preko obrasca.',s:''}}
function orderBtn(svc){const b=document.createElement('a');b.className='btn primary small orderBtn';b.href='#kontakt';b.textContent=svc?'NARUČI: '+svc.toUpperCase():'OTVORI OBRAZAC';b.addEventListener('click',e=>{e.preventDefault();if(window.dataClose)window.dataClose();setTimeout(()=>{const s=$('service');if(s&&svc)s.value=svc;$('kontakt').scrollIntoView({behavior:'smooth'})},80)});const w=document.createElement('div');w.appendChild(b);$('messages').appendChild(w);$('messages').scrollTop=1e9}
function demoAnswer(msg){const r=demoReply(msg);bubble('DEMO · '+r.m,'system');orderBtn(r.s);return say(r.m)}
async function send(){const msg=$('question').value.trim();if(!msg||inFlight)return;bubble(msg,'me');$('question').value='';
 const fallback='Za to mi još nije uključen AI razgovor. Javite nam se putem WhatsAppa (091 518 1266) ili e-maila ekorustika@gmail.com, rado ćemo pomoći.';
 if(!AI_ENDPOINT||!aiOn){demoAnswer(msg);return}
 if(!netOk){bubble('Nema internetske veze, pa AI razgovor nije dostupan. Odgovaram u DEMO načinu.','system');demoAnswer(msg);return}
 inFlight=true;setState('thinking','RAZMIŠLJA');const b=$('chatForm').querySelector('button');b.disabled=true;
 try{const c=new AbortController();const to=setTimeout(()=>c.abort(),20000);let r;try{r=await fetch(AI_ENDPOINT+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,history:hist.slice(-8)}),signal:c.signal})}finally{clearTimeout(to)}
  const d=await r.json().catch(()=>({}));if(!r.ok||typeof d.reply!=='string')throw Error(d.error||'HTTP '+r.status);
  hist.push({role:'user',text:msg},{role:'model',text:d.reply});bubble(d.reply,'system');setState('',idle());await say(d.reply)}
 catch(e){const t=String(e.message||'');const m=/limit/i.test(t)?'Dosegnut je dnevni broj AI upita. Pokušajte sutra ili nam pišite na WhatsApp.':/disabled|isklj/i.test(t)?'AI razgovor je trenutno isključen. Javite nam se putem WhatsAppa ili e-maila.':'AI servis trenutno nije dostupan. Pokušajte kasnije ili nam pošaljite upit.';bubble(m,'system');setState('',idle())}
 finally{inFlight=false;b.disabled=false}}
$('chatForm').addEventListener('submit',e=>{e.preventDefault();send()});
function inquiryText(){const n=$('name').value.trim(),c=$('contact').value.trim(),d=$('description').value.trim(),u=$('service')?$('service').value:'',l=$('link')?$('link').value.trim():'';if(!n||!c||!d||($('service')&&!u)){$('inquiry').reportValidity();return null}return `Pozdrav, šaljem upit za EKORUSTIKA DIGITALNI ALATI.\n\nIme / tvrtka: ${n}\nKontakt: ${c}\nUsluga: ${u}\nOpis: ${d}`+(l?`\nPoveznica: ${l}`:'')}
$('inquiry').addEventListener('submit',e=>{e.preventDefault();const m=inquiryText();if(!m)return;window.open('https://wa.me/385915181266?text='+encodeURIComponent(m),'_blank','noopener');$('formStatus').textContent='Otvoren je WhatsApp s pripremljenom porukom. Potvrdite slanje.'});
$('sendEmail').addEventListener('click',()=>{const m=inquiryText();if(!m)return;location.href='mailto:ekorustika@gmail.com?subject='+encodeURIComponent('Upit — '+(($('service')&&$('service').value)||'EKORUSTIKA DIGITALNI ALATI'))+'&body='+encodeURIComponent(m);$('formStatus').textContent='Otvara se e-mail aplikacija. Potvrdite slanje.'});
let deferred=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('installBtn').style.display='inline-flex'});
$('installBtn').addEventListener('click',async()=>{if(!deferred){alert('Chrome: izbornik ⋮ → „Instaliraj aplikaciju” ili „Dodaj na početni zaslon”.');return}deferred.prompt();await deferred.userChoice;deferred=null;$('installBtn').style.display='none'});
window.dataAsk=function(q){$('question').value=q;send();return;bubble('📝 Primjer je upisan u polje za pitanje. Pravi AI odgovori još čekaju aktivaciju, pa Data zasad ne odgovara na ovakva pitanja. Za pomoć nam se javite na WhatsApp 091 518 1266.','system')};
document.querySelectorAll('.installAny').forEach(b=>b.addEventListener('click',()=>$('installBtn').click()));
