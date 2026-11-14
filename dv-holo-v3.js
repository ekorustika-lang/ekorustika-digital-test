// DataVision v3.0 na EKORUSTIKA DIGITALNI ALATI (PROBA v3-i1)
// Jedinstveni izvor: shader i glava ucitavaju se UZIVO iz /datavision-test/ (DataVision v3.0). Ovdje nema kopije glave ni shadera.
(function(){const SRC='/datavision-test/';
function run(FS){
const btn=document.querySelector('.robotBtn');if(!btn)return;const old=btn.querySelector('img');
const fld=document.createElement('div');fld.className='hfield';fld.setAttribute('role','img');fld.setAttribute('aria-label','DataVision hologram - Data, asistent EKORUSTIKA');fld.innerHTML='<i class="hp" style="--x:30%;--y:30%;--d:3.5s;--dl:-0.0s"></i><i class="hp" style="--x:68%;--y:26%;--d:4.8s;--dl:-0.9s"></i><i class="hp" style="--x:22%;--y:55%;--d:6.1s;--dl:-1.8s"></i><i class="hp" style="--x:78%;--y:50%;--d:7.4s;--dl:-2.7s"></i><i class="hp" style="--x:35%;--y:78%;--d:3.5s;--dl:-3.6s"></i><i class="hp" style="--x:64%;--y:80%;--d:4.8s;--dl:-4.5s"></i><i class="hp" style="--x:50%;--y:18%;--d:6.1s;--dl:-5.4s"></i><i class="hp" style="--x:18%;--y:40%;--d:7.4s;--dl:-6.3s"></i><i class="hp" style="--x:82%;--y:68%;--d:3.5s;--dl:-7.2s"></i><i class="hp" style="--x:44%;--y:60%;--d:4.8s;--dl:-8.1s"></i><i class="hp" style="--x:58%;--y:40%;--d:6.1s;--dl:-9.0s"></i>';
const cv=document.createElement('canvas');cv.className='hcv';fld.appendChild(cv);
function fallback(){cv.remove();const im=document.createElement('img');im.className='hcv hstatic';im.src=SRC+'data-head.jpg';im.alt='';fld.appendChild(im);}
if(old)old.replaceWith(fld);else btn.appendChild(fld);
const gl=cv.getContext('webgl');if(!gl){fallback();return;}
try{
const VS='attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0,1);}';
function sh(tp,src){const s=gl.createShader(tp);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const L=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(L);gl.vertexAttribPointer(L,2,gl.FLOAT,false,0,0);
const U={};'t blink mo smile brow lookX lookY glow rot nod sh'.split(' ').forEach(n=>U[n]=gl.getUniformLocation(pr,n));
let ready=false;const img=new Image();img.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);ready=true;};img.src=SRC+'data-head.jpg?v=v3';
function rs(){const r=Math.min(2,devicePixelRatio||1);cv.width=cv.height=Math.round((cv.clientWidth||220)*r);gl.viewport(0,0,cv.width,cv.height);}rs();addEventListener('resize',rs);
if(window.speechSynthesis&&window.SpeechSynthesisUtterance){const sp=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=function(u){try{u.addEventListener('boundary',()=>window.dvSpeechKick&&window.dvSpeechKick());u.addEventListener('start',()=>window.dvEmotion&&window.dvEmotion('greet',2));u.addEventListener('end',()=>window.dvEmotion&&window.dvEmotion('understand',2));}catch(e){}return sp(u);};}
document.querySelectorAll('.dvNone').forEach(b=>b.addEventListener('click',()=>window.dvEmotion&&window.dvEmotion('greet',2.5)));
let now=0,emo='',emoUntil=0,lastKick=-9,kick=0,nodT=-9,surpT=-9,prev='idle',nextBlink=2,blinkT=-9,dbl=false,lookT=0,lookNext=1,vis=true;const t0=performance.now();
window.dvSpeechKick=()=>{kick=1;lastKick=now;};window.dvEmotion=(e,d=2.5)=>{emo=e;emoUntil=now+d;if(e==='greet'||e==='understand')nodT=now;};
document.addEventListener('visibilitychange',()=>{vis=!document.hidden;});
const st=()=>(window.speechSynthesis&&speechSynthesis.speaking)?'speaking':'idle';
const S={mo:0,sm:0,br:0,lx:0,ly:0,gw:0};const lp=(a,b,k)=>a+(b-a)*k;
function f(){requestAnimationFrame(f);if(!vis||!ready)return;now=(performance.now()-t0)/1000;const s=st();
if(s==='listening'&&prev!=='listening')surpT=now;prev=s;
if(now>nextBlink){blinkT=now;if(!dbl&&Math.random()<.18){nextBlink=now+.35;dbl=true;}else{nextBlink=now+2.5+Math.random()*3.5;dbl=false;}}
const bp=(now-blinkT)/.16,blink=bp>=0&&bp<=1?Math.sin(bp*Math.PI):0;
if(now>lookNext){lookT=(Math.random()*2-1)*.8;lookNext=now+1.5+Math.random()*3;}
const em=now<emoUntil?emo:'';let lx=lookT,ly=0;if(s==='listening'||em==='greet')lx=0;if(s==='thinking'){lx=.9;ly=-.8;}
let mo=0;if(s==='speaking'){if(now-lastKick<.35){kick*=.9;mo=.35+.65*kick;}else mo=.25+.55*Math.max(0,Math.sin(now*13))*(.6+.4*Math.sin(now*3.1));}
const sm=['joy','greet','understand'].includes(em)?1:s==='idle'?.15:0;
let br=s==='listening'?.8:s==='thinking'?-.6:em==='greet'?.7:0;const sp=now-surpT;if(sp<1.2)br=Math.max(br,.6+1.4*Math.sin(sp/1.2*Math.PI));
S.mo=lp(S.mo,mo,.35);S.sm=lp(S.sm,sm,.05);S.br=lp(S.br,br,.12);S.lx=lp(S.lx,lx,.06);S.ly=lp(S.ly,ly,.06);S.gw=lp(S.gw,s==='speaking'?1:0,.08);
const calm=(s==='listening'||em==='greet')?.35:1,nd=now-nodT<1.2?Math.sin((now-nodT)/1.2*Math.PI*2):0;
gl.uniform1f(U.t,now);gl.uniform1f(U.blink,blink);gl.uniform1f(U.mo,S.mo);gl.uniform1f(U.smile,S.sm);gl.uniform1f(U.brow,S.br);
gl.uniform1f(U.lookX,S.lx);gl.uniform1f(U.lookY,S.ly);gl.uniform1f(U.glow,S.gw);gl.uniform1f(U.rot,.012*Math.sin(now*.45)*calm+(s==='thinking'?.02:0));
gl.uniform1f(U.nod,nd);gl.uniform2f(U.sh,.004*Math.sin(now*.33)*calm,.003*Math.sin(now*.7));gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const amp=(s==='speaking'?S.mo:0).toFixed(2);if(amp!==fld._a){fld._a=amp;fld.style.setProperty('--amp',amp);}fld.classList.toggle('speaking',s==='speaking');}f();


}catch(e){console.warn('DataVision hologram:',e);fallback();}
}
fetch(SRC+'holo-img.js',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.text();}).then(t=>{const m=t.match(/const FS=("(?:[^"\\]|\\.)*");/);if(!m)throw new Error('FS nije pronaden');run(JSON.parse(m[1]));}).catch(e=>{console.warn('DataVision v3.0 izvor nedostupan:',e);const b=document.querySelector('.robotBtn');const o=b&&b.querySelector('img');if(o){o.src=SRC+'data-head.jpg';o.classList.add('hstatic');}});
})();
