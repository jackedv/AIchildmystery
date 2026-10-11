// The first result folds away after two seconds; a result reopened by the player stays open.
export function createResultPanel({panel,button}) {
  let timer, animation, revision=0, available=false;
  function stop() {
    revision++; clearTimeout(timer); timer=undefined;
    animation?.cancel(); animation=undefined;
    panel.inert=false;
  }
  function clear() {
    stop(); available=false; panel.hidden=true; button.hidden=true;
    button.setAttribute("aria-expanded","false");
  }
  function open({automatic=false,focus=false}={}) {
    if(!available) return;
    stop(); panel.hidden=false; button.hidden=false;
    button.setAttribute("aria-expanded","true");
    if(focus) panel.querySelector("button")?.focus({preventScroll:true});
    if(automatic) timer=setTimeout(minimize,2000);
  }
  function minimize() {
    if(!available || panel.hidden) return;
    stop(); const current=revision;
    panel.inert=true; button.setAttribute("aria-expanded","false");
    if(panel.contains(document.activeElement)) button.focus({preventScroll:true});
    const done=()=>{if(current===revision) {panel.hidden=true;animation?.cancel();animation=undefined;panel.inert=false;}};
    if(matchMedia("(prefers-reduced-motion: reduce)").matches) {done();return;}
    const from=panel.getBoundingClientRect(), to=button.getBoundingClientRect();
    const scale=from.width/panel.offsetWidth;
    const x=(to.left+to.width/2-from.left-from.width/2)/scale;
    const y=(to.top+to.height/2-from.top-from.height/2)/scale;
    animation=panel.animate([
      {transform:"translate(0,0) scale(1)",opacity:1,borderRadius:"14px"},
      {transform:`translate(${x}px,${y}px) scale(.04)`,opacity:0,borderRadius:"50%"}
    ],{duration:550,easing:"cubic-bezier(.22,.7,.25,1)",fill:"both"});
    animation.finished.then(done,()=>{});
  }
  button.addEventListener("click",()=>panel.hidden || panel.inert ? open({focus:true}) : minimize());
  // Give a player who starts interacting with the panel time to finish the action.
  panel.addEventListener("pointerdown",()=>clearTimeout(timer));
  panel.addEventListener("keydown",event=>{
    clearTimeout(timer);
    if(event.key==="Escape" && available) {event.preventDefault();minimize();}
  });
  return {clear,show(){available=true;open({automatic:true});}};
}
