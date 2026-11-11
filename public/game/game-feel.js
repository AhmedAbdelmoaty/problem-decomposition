(function(global){
  'use strict';

  var observer=null;
  var observedRoot=null;
  var started=false;
  var readyBound=false;
  var previous=null;
  var eventSerial=0;
  var eventTimer=null;
  var eventClasses=['feel-wrong','feel-fix','feel-win','feel-loss'];

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

  function summarize(snapshot){
    var G=snapshot.G||{};
    var S=snapshot.S||{};
    return {
      view:String(G.view||'home'),
      level:Number(G.li)||0,
      used:Number(S.used)||0,
      fixed:Array.isArray(S.fixed)?S.fixed.length:0,
      whyMiss:!!S.whyMiss,
      good:!!S.good,
      msg:String(S.msg||'')
    };
  }

  function clearEventClasses(app){
    eventClasses.forEach(function(name){app.classList.remove(name);});
  }

  function emitEvent(app,name){
    if(eventTimer) clearTimeout(eventTimer);
    clearEventClasses(app);
    void app.offsetWidth;
    app.classList.add('feel-'+name);
    app.setAttribute('data-feel-event',name);
    app.setAttribute('data-feel-event-id',String(++eventSerial));
    eventTimer=setTimeout(function(){
      app.classList.remove('feel-'+name);
      eventTimer=null;
    },name==='win'||name==='loss'?1700:780);
  }

  function detectEvent(app,current){
    if(!previous) return;
    if(current.view!==previous.view&&current.view==='won') emitEvent(app,'win');
    else if(current.view!==previous.view&&current.view==='lost') emitEvent(app,'loss');
    else if(current.fixed>previous.fixed) emitEvent(app,'fix');
    else if((current.whyMiss&&!previous.whyMiss)||
      (current.used>previous.used&&!!current.msg&&!current.good)) emitEvent(app,'wrong');
  }

  function sync(){
    var app=document.querySelector('.app');
    if(!app) return;

    var snapshot=readState()||{};
    var G=snapshot.G||{};
    var S=snapshot.S||{};
    var current=summarize(snapshot);
    app.setAttribute('data-feel-view',String(G.view||'home'));
    app.setAttribute('data-feel-level',Number.isFinite(Number(G.li))?String(Number(G.li)+1):'0');
    app.setAttribute('data-feel-pressure',pressureFor(G,S));
    detectEvent(app,current);
    previous=current;
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
    if(eventTimer) clearTimeout(eventTimer);
    observer=null;
    observedRoot=null;
    eventTimer=null;
    previous=null;
    eventSerial=0;
    started=false;
  }

  global.DCFeel={start:start,sync:sync,destroy:destroy};
  if(document.readyState==='loading'){
    readyBound=true;
    document.addEventListener('DOMContentLoaded',onReady,{once:true});
  }else start();
})(window);
