(function(global){
  'use strict';

  var observer=null;
  var observedRoot=null;
  var started=false;
  var readyBound=false;

  function readState(){
    try{
      return global.dcDebug&&typeof global.dcDebug.state==='function'
        ?global.dcDebug.state()
        :null;
    }catch(e){
      return null;
    }
  }

  function markStages(){
    document.querySelectorAll('.stage').forEach(function(stage){
      stage.setAttribute('data-feel-ready','true');
    });
  }

  function pressureFor(G,S){
    var active=G.view==='play'||G.view==='why';
    if(!active) return 'idle';
    var seconds=Number(S.secLeft);
    if(G.mode==='race'&&seconds>0&&seconds<=10) return 'critical';
    return 'active';
  }

  function sync(){
    var app=document.querySelector('.app');
    if(!app) return;

    var snapshot=readState()||{};
    var G=snapshot.G||{};
    var S=snapshot.S||{};
    app.setAttribute('data-feel-view',String(G.view||'home'));
    app.setAttribute('data-feel-level',Number.isFinite(Number(G.li))?String(Number(G.li)+1):'0');
    app.setAttribute('data-feel-pressure',pressureFor(G,S));
    markStages();
  }

  function scheduleSync(){
    if(typeof queueMicrotask==='function') queueMicrotask(sync);
    else Promise.resolve().then(sync);
  }

  function onReady(){
    readyBound=false;
    start();
  }

  function start(){
    if(started) return;
    started=true;
    document.addEventListener('click',scheduleSync,true);
    observedRoot=document.querySelector('#game')||document.body;
    if(global.MutationObserver&&observedRoot){
      observer=new MutationObserver(sync);
      observer.observe(observedRoot,{childList:true,subtree:true});
    }
    sync();
  }

  function destroy(){
    if(readyBound){
      document.removeEventListener('DOMContentLoaded',onReady);
      readyBound=false;
    }
    if(!started) return;
    document.removeEventListener('click',scheduleSync,true);
    if(observer) observer.disconnect();
    observer=null;
    observedRoot=null;
    started=false;
  }

  global.DCFeel={start:start,sync:sync,destroy:destroy};
  if(document.readyState==='loading'){
    readyBound=true;
    document.addEventListener('DOMContentLoaded',onReady,{once:true});
  }else start();
})(window);
