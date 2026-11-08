'use strict';
// Adresa Cloudflare Workera (posrednik prema Gemini API-ju). API kljuc NIJE ovdje - spremljen je kao Secret u Cloudflareu.
const AI_ENDPOINT = '';
const $ = id => document.getElementById(id);
$('year').textContent = String(new Date().getFullYear());
const GREETING = 'Dobro došli u EKORUSTIKA DIGITALNI ALATI! Ja sam Data, vaš digitalni AI asistent. Mogu vam pomoći pronaći digitalno rješenje za posao i svakodnevni život. Slobodno me pitajte što vas zanima.';
const tts = 'speechSynthesis' in window;
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let speaking=false, listening=false, muted=false, inFlight=false, hist=[], aiOn=false;
const setState=(c,l)=>{$('orb').className='dataOrb'+(c?' '+c:'');$('state').textContent=l};
const status=t=>{$('voiceStatus').textContent=t};
function bubble(m,k){const e=document.createElement('div');e.className='bubble '+k;e.textContent=m;$('messages').appendChild(e);$('messages').scrollTop=1e9;return e}
function hrVoice(){const v=speechSynthesis.getVoices();return v.find(x=>/^hr/i.test(x.lang))||v.find(x=>/^(sr|bs|sl)/i.test(x.lang))}
let rec=null;
function stopListening(){if(rec&&listening){try{rec.abort()}catch{}}listening=false;$('microphone').classList.remove('on')}
function say(text){return new Promise(res=>{if(!tts||muted){res();return}stopListening();speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='hr-HR';const v=hrVoice();if(v)u.voice=v;u.onstart=()=>{speaking=true;setState('speaking','GOVORI')};const end=()=>{speaking=false;setState('','SPREMAN');res()};u.onend=end;u.onerror=end;speechSynthesis.speak(u)})}
function stopSpeaking(){if(tts)speechSynthesis.cancel();speaking=false;setState('','SPREMAN')}
if(SR){rec=new SR();rec.lang='hr-HR';rec.interimResults=false;rec.maxAlternatives=1;
 rec.onresult=e=>{const t=e.results?.[0]?.[0]?.transcript||'';if(t){$('question').value=t;send()}};
 rec.onerror=e=>status(e.error==='not-allowed'?'Mikrofon nije dopušten. Omogućite ga u postavkama preglednika.':'Nisam vas čuo. Pokušajte ponovno ili upišite pitanje.');
 rec.onend=()=>{listening=false;$('microphone').classList.remove('on');if(!inFlight&&!speaking)setState('','SPREMAN')}}
$('microphone').addEventListener('click',()=>{if(!rec){status('Prepoznavanje govora nije podržano u ovom pregledniku. Upišite pitanje.');return}if(listening){stopListening();return}stopSpeaking();try{rec.start();listening=true;$('microphone').classList.add('on');setState('listening','SLUŠA');status('Slušam… govorite na hrvatskom.')}catch{status('Mikrofon trenutno nije dostupan.')}});
$('stopVoice').addEventListener('click',()=>{stopSpeaking();status('Govor je zaustavljen.')});
let greeted=false;
function greet(){greeted=true;muted=false;bubble(GREETING,'system');say(GREETING);$('greet').textContent='🔁 PONOVI POZDRAV'}
$('greet').addEventListener('click',greet);
// Automatski pozdrav: preglednici obicno traze dodir prije zvuka, pa pokusavamo i na prvi dodir stranice.
addEventListener('pointerdown',function f(e){removeEventListener('pointerdown',f);if(!greeted&&!e.target.closest('button,a,input,textarea'))greet()});
const offline=()=>{document.body.classList.toggle('offline',!navigator.onLine)};addEventListener('online',offline);addEventListener('offline',offline);offline();
async function checkAI(){const box=$('aiInfo');if(!AI_ENDPOINT){box.innerHTML='<strong>Status AI razgovora:</strong> čeka povezivanje. Glas, mikrofon i upiti već rade, ali Data još ne daje AI odgovore.';return}
 try{const r=await fetch(AI_ENDPOINT+'/status');const d=await r.json();aiOn=!!d.enabled;box.innerHTML=aiOn?'<strong>Status AI razgovora:</strong> ✅ aktivan (Gemini).':'<strong>Status AI razgovora:</strong> trenutno isključen.'}catch{box.innerHTML='<strong>Status AI razgovora:</strong> servis trenutno nije dostupan.'}}
checkAI();
async function send(){const msg=$('question').value.trim();if(!msg||inFlight)return;bubble(msg,'me');$('question').value='';
 const fallback='Za to mi još nije uključen AI razgovor. Javite nam se putem WhatsAppa (091 518 1266) ili e-maila ekorustika@gmail.com, rado ćemo pomoći.';
 if(!navigator.onLine){bubble('Nema internetske veze. AI razgovor nije dostupan.','system');return}
 if(!AI_ENDPOINT){bubble(fallback,'system');say(fallback);return}
 inFlight=true;setState('thinking','RAZMIŠLJA');const b=$('chatForm').querySelector('button');b.disabled=true;
 try{const c=new AbortController();const to=setTimeout(()=>c.abort(),20000);let r;try{r=await fetch(AI_ENDPOINT+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,history:hist.slice(-8)}),signal:c.signal})}finally{clearTimeout(to)}
  const d=await r.json().catch(()=>({}));if(!r.ok||typeof d.reply!=='string')throw Error(d.error||'HTTP '+r.status);
  hist.push({role:'user',text:msg},{role:'model',text:d.reply});bubble(d.reply,'system');setState('','SPREMAN');await say(d.reply)}
 catch(e){const t=String(e.message||'');const m=/limit/i.test(t)?'Dosegnut je dnevni broj AI upita. Pokušajte sutra ili nam pišite na WhatsApp.':/disabled|isklj/i.test(t)?'AI razgovor je trenutno isključen. Javite nam se putem WhatsAppa ili e-maila.':'AI servis trenutno nije dostupan. Pokušajte kasnije ili nam pošaljite upit.';bubble(m,'system');setState('','SPREMAN')}
 finally{inFlight=false;b.disabled=false}}
$('chatForm').addEventListener('submit',e=>{e.preventDefault();send()});
function inquiryText(){const n=$('name').value.trim(),c=$('contact').value.trim(),d=$('description').value.trim();if(!n||!c||!d){$('inquiry').reportValidity();return null}return `Pozdrav, šaljem upit za EKORUSTIKA DIGITALNI ALATI.\n\nIme: ${n}\nKontakt: ${c}\nOpis: ${d}`}
$('inquiry').addEventListener('submit',e=>{e.preventDefault();const m=inquiryText();if(!m)return;window.open('https://wa.me/385915181266?text='+encodeURIComponent(m),'_blank','noopener');$('formStatus').textContent='Otvoren je WhatsApp s pripremljenom porukom. Potvrdite slanje.'});
$('sendEmail').addEventListener('click',()=>{const m=inquiryText();if(!m)return;location.href='mailto:ekorustika@gmail.com?subject='+encodeURIComponent('Upit — EKORUSTIKA DIGITALNI ALATI')+'&body='+encodeURIComponent(m);$('formStatus').textContent='Otvara se e-mail aplikacija. Potvrdite slanje.'});
let deferred=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('installBtn').style.display='inline-flex'});
$('installBtn').addEventListener('click',async()=>{if(!deferred){alert('Chrome: izbornik ⋮ → „Instaliraj aplikaciju” ili „Dodaj na početni zaslon”.');return}deferred.prompt();await deferred.userChoice;deferred=null;$('installBtn').style.display='none'});
