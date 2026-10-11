// Full-page loading is reserved for startup and artwork preparation.
export function createLoading({screen,game,text,progress,empty,full,announcement,reload}) {
  let version=0,frame=0,mode="boot",value=-1;
  function fill(amount) {
    const p=Math.max(0,Math.min(1,amount)),edge=8+573*p;
    empty.style.clipPath=p===0?"none":p===1?"inset(0 0 0 100%)":`inset(0 0 0 ${edge}px)`;
    full.style.clipPath=p===0?"inset(0 100% 0 0)":p===1?"none":`inset(0 ${589-edge}px 0 0)`;
    const percentage=Math.round(p*100);
    if(value!==percentage){value=percentage;progress.setAttribute("aria-valuenow",String(percentage));}
  }
  function show(nextMode,label) {
    cancelAnimationFrame(frame);version++;mode=nextMode;value=-1;
    screen.hidden=false;screen.dataset.mode=mode;delete screen.dataset.closing;
    game.inert=true;game.setAttribute("aria-busy","true");
    reload.hidden=true;announcement.textContent=label;
    fill(0);text.textContent="0% 加载中...";
    return version;
  }
  function hide() {
    cancelAnimationFrame(frame);version++;mode="idle";screen.hidden=true;
    delete screen.dataset.closing;game.inert=false;game.setAttribute("aria-busy","false");
  }
  async function finish(token) {
    if(token!==version)return false;
    screen.dataset.mode="complete";fill(1);text.textContent="100% 加载中...";
    await new Promise(resolve=>setTimeout(resolve,100));
    if(token!==version)return false;
    screen.dataset.closing="true";
    await new Promise(resolve=>setTimeout(resolve,matchMedia("(prefers-reduced-motion: reduce)").matches?0:180));
    if(token!==version)return false;
    hide();return true;
  }
  function timed(token,duration=2000) {
    return new Promise(resolve=>{
      let start;
      function tick(now) {
        if(token!==version){resolve(false);return;}
        start??=now;const p=Math.min(1,(now-start)/duration);
        fill(p);text.textContent=Math.round(p*100)+"% 加载中...";
        if(p<1)frame=requestAnimationFrame(tick);else resolve(true);
      }
      frame=requestAnimationFrame(tick);
    });
  }
  function fail(token,message) {
    if(token!==version)return;
    cancelAnimationFrame(frame);screen.dataset.mode="error";text.textContent=message;
    announcement.textContent=message;reload.hidden=false;reload.focus({preventScroll:true});
  }
  return {show,hide,finish,timed,fail};
}

export async function prepareArtwork(urls) {
  await Promise.all(urls.map(async url=>{
    const image=new Image();image.src=url;
    let timer;
    try {await Promise.race([image.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error("artwork timeout")),15000);})]);}
    finally {clearTimeout(timer);}
  }));
}
