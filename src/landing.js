import {createLoading,prepareArtwork} from './loading.js';
const $=id=>document.getElementById(id);
const hotspot=document.querySelector('.hotspot');
hotspot.addEventListener('click',()=>hotspot.setAttribute('aria-expanded',String(hotspot.getAttribute('aria-expanded')!=='true')));
hotspot.addEventListener('keydown',event=>{if(event.key==='Escape')hotspot.setAttribute('aria-expanded','false');});
const loading=createLoading({screen:$('loading-screen'),game:$('landing-site'),text:$('loading-text'),progress:$('loading-progress'),empty:$('loading-empty'),full:$('loading-full'),announcement:$('loading-announcement'),reload:$('loading-reload')});
function scale(){ $('loading-stage').style.transform=`translate(-50%, -50%) scale(${Math.min(innerWidth/1672,innerHeight/941)})`; }
addEventListener('resize',scale);scale();
async function boot(){
  const token=loading.show('boot','正在准备故事');
  try {
    await prepareArtwork(['assets/landing/hero.png','assets/landing/river.png','assets/loading/loading_background.png','assets/loading/progress_bar_empty.png','assets/loading/progress_bar_full.png']);
    await loading.timed(token,2000);await loading.finish(token);
  } catch { loading.fail(token,'故事还没准备好，请重新加载。'); }
}
$('loading-reload').addEventListener('click',boot);boot();
