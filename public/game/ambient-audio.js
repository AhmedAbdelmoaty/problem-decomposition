(function(global){
  'use strict';

  var DIR='audio/ambient/';
  var MIX={
    cityBed:{file:'freesound_community-night-ambience-17064.mp3',volume:.12},
    cityCrickets:{file:'schorsch1964-night-atmosphere-with-crickets-374652.mp3',volume:.055},
    shop:{file:'alex_jauk-supermarket-ambience-sounds-518582.mp3',volume:.105}
  };
  var EVENTS={
    bats:[
      {file:'bat_01.flac',volume:.13},
      {file:'bat_03.flac',volume:.12}
    ],
    dogs:[
      {file:'dragon-studio-distant-dog-barking-472373.mp3',volume:.16,weight:4},
      {file:'dbsound-dog-barking-in-distant-502553.mp3',volume:.055,weight:1}
    ],
    power:{file:'killconfirmed.wav',volume:.14}
  };

  var unlocked=false;
  var scene='silent';
  var lastView='home';
  var lastLevel=-1;
  var loops={};
  var timers={bats:0,dogs:0};
  var mixTimer=0;
  var syncTimer=0;
  var eventAudio=[];

  Object.keys(MIX).forEach(function(key){
    var audio=new Audio(DIR+MIX[key].file);
    audio.loop=true;
    audio.preload='auto';
    audio.volume=0;
    audio.dataset.target='0';
    loops[key]=audio;
  });

  function soundOn(){
    try{return localStorage.getItem('dc_sound')!=='0';}catch(e){return true;}
  }

  function state(){
    try{return global.dcDebug&&global.dcDebug.state?global.dcDebug.state():null;}catch(e){return null;}
  }

  function voicePlaying(){
    var app=document.getElementById('app');
    return !!(app&&app.getAttribute('data-voice-playing')==='true');
  }

  function playLoop(key){
    var audio=loops[key];
    if(!audio||!audio.paused) return;
    if(!Number.isFinite(audio.currentTime)||audio.currentTime===0){
      try{audio.currentTime=Math.random()*25;}catch(e){}
    }
    var p=audio.play();
    if(p&&p.catch) p.catch(function(){});
  }

  function target(key,value){
    loops[key].dataset.target=String(Math.max(0,value));
    if(value>0&&unlocked&&soundOn()) playLoop(key);
  }

  function fadeMix(){
    Object.keys(loops).forEach(function(key){
      var audio=loops[key];
      var wanted=Number(audio.dataset.target)||0;
      if(!soundOn()||document.hidden) wanted=0;
      var delta=wanted-audio.volume;
      if(Math.abs(delta)<.004) audio.volume=wanted;
      else audio.volume=Math.max(0,Math.min(1,audio.volume+delta*.18));
      if(wanted===0&&audio.volume<.004&&!audio.paused){audio.pause();audio.volume=0;}
    });
  }

  function stopEvents(){
    clearTimeout(timers.bats);clearTimeout(timers.dogs);
    timers.bats=0;timers.dogs=0;
    eventAudio.forEach(function(audio){try{audio.pause();audio.currentTime=0;}catch(e){}});
    eventAudio=[];
  }

  function playEvent(item){
    if(!unlocked||!soundOn()||document.hidden||scene!=='city'||voicePlaying()) return;
    try{
      var audio=new Audio(DIR+item.file);
      audio.volume=item.volume;
      eventAudio.push(audio);
      audio.addEventListener('ended',function(){eventAudio=eventAudio.filter(function(x){return x!==audio;});},{once:true});
      var p=audio.play();if(p&&p.catch) p.catch(function(){});
    }catch(e){}
  }

  function weighted(items){
    var bag=[];
    items.forEach(function(item){for(var i=0;i<(item.weight||1);i++) bag.push(item);});
    return bag[Math.floor(Math.random()*bag.length)];
  }

  function scheduleBats(){
    clearTimeout(timers.bats);
    if(scene!=='city') return;
    timers.bats=setTimeout(function(){
      if(!voicePlaying()) playEvent(EVENTS.bats[Math.floor(Math.random()*EVENTS.bats.length)]);
      scheduleBats();
    },24000+Math.random()*28000);
  }

  function scheduleDogs(){
    clearTimeout(timers.dogs);
    if(scene!=='city') return;
    timers.dogs=setTimeout(function(){
      if(!voicePlaying()) playEvent(weighted(EVENTS.dogs));
      scheduleDogs();
    },38000+Math.random()*52000);
  }

  function powerReturn(){
    if(!unlocked||!soundOn()) return;
    try{
      var audio=new Audio(DIR+EVENTS.power.file);
      audio.volume=EVENTS.power.volume;
      eventAudio.push(audio);
      audio.addEventListener('ended',function(){eventAudio=eventAudio.filter(function(x){return x!==audio;});},{once:true});
      setTimeout(function(){var p=audio.play();if(p&&p.catch)p.catch(function(){});},120);
    }catch(e){}
  }

  function setScene(next){
    if(next===scene) return;
    scene=next;
    stopEvents();
    if(scene==='city'){scheduleBats();scheduleDogs();}
  }

  function sync(){
    var snapshot=state();
    var G=snapshot&&snapshot.G||{};
    var L=snapshot&&snapshot.L;
    var view=String(G.view||'home');
    var active=view==='play'||view==='why'||view==='lost';
    var next=active&&L?(L.city?'city':'shop'):'silent';
    var winNow=view==='won'&&lastView!=='won';
    if(winNow&&L&&L.city) powerReturn();
    setScene(next);

    var duck=voicePlaying()?.32:1;
    var lost=view==='lost'?.62:1;
    target('cityBed',scene==='city'?MIX.cityBed.volume*duck*lost:0);
    target('cityCrickets',scene==='city'?MIX.cityCrickets.volume*duck*lost:0);
    target('shop',scene==='shop'?MIX.shop.volume*duck*lost:0);

    if(Number(G.li)!==lastLevel){
      lastLevel=Number(G.li);
      if(scene==='city'){scheduleBats();scheduleDogs();}
    }
    lastView=view;
  }

  function unlock(){
    if(unlocked) return;
    unlocked=true;
    sync();
  }

  function destroy(){
    clearInterval(syncTimer);clearInterval(mixTimer);stopEvents();
    Object.keys(loops).forEach(function(key){loops[key].pause();});
    document.removeEventListener('pointerdown',unlock,true);
    document.removeEventListener('keydown',unlock,true);
  }

  document.addEventListener('pointerdown',unlock,true);
  document.addEventListener('keydown',unlock,true);
  document.addEventListener('visibilitychange',sync);
  syncTimer=setInterval(sync,350);
  mixTimer=setInterval(fadeMix,90);
  sync();

  global.DCAmbience={sync:sync,destroy:destroy,state:function(){return {scene:scene,unlocked:unlocked};}};
})(window);
