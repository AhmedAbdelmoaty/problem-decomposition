(function(){
  'use strict';

  var KEY='dc_guided_onboarding_v1', root=null, currentTarget=null, cleanupTarget=null, layoutFrame=0, bubbleTimer=0;
  var STORY=[
    {speaker:'رئيس المدينة',role:'mayor',text:'الحقنا يا أستاذ… المدينة غرقت في الضلمة، الشوارع اتعطلت، والمستشفى شغالة على المولد، ومحدش عارف هيستحمل لحد إمتى.'},
    {speaker:'رئيس المدينة',role:'mayor',text:'شركة الكهربا بتقول إن الرقم الإجمالي مش باين فيه عطل واضح، وفي نفس الوقت شكاوى الناس جاية من كل ناحية… يعني فيه حاجة مستخبية وسط الصورة الكبيرة.'},
    {speaker:'رئيس المدينة',role:'mayor',text:'ما تلفّش على المدينة عشوائي. خد رقم الشركة وكلام الناس، وضيّق الدايرة حتة حتة؛ كل ما فرق يبان لك امشِ وراه، لحد ما تمسك مكان الخلل قبل المولد ما يفصل.'},
    {speaker:'المحلل',role:'analyst',text:'حاضر يا ريس. هلمّ الخيوط وأمشي ورا الفرق لحد ما أوصل للعطل.'}
  ];

  function esc(value){return String(value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
  function state(){return window.dcDebug&&window.dcDebug.state?window.dcDebug.state():null;}
  function bridge(){return window.DCTutorialBridge||null;}
  function waitFor(find,done,tries){
    var item=find();
    if(item){done(item);return;}
    if((tries||0)>40) return;
    setTimeout(function(){waitFor(find,done,(tries||0)+1);},50);
  }
  function ensureRoot(){
    if(root) return root;
    root=document.createElement('div');
    root.className='dc-tutorial-root';
    root.hidden=true;
    root.setAttribute('aria-live','polite');
    document.body.appendChild(root);
    return root;
  }
  function mayorSvg(){
    return '<svg viewBox="0 0 180 360" aria-hidden="true"><ellipse cx="90" cy="344" rx="65" ry="12" fill="#05091f" opacity=".38"/><path d="M26 340q5-126 64-126t64 126" fill="#3f527d" stroke="#262954" stroke-width="8"/><path d="M53 227l37 40 38-40 18 113H35Z" fill="#304165"/><path d="M72 220l18 47 19-47" fill="#fff2d0" stroke="#262954" stroke-width="5"/><path d="M84 258l12 0 9 52-15 18-14-18Z" fill="#c86b50"/><ellipse cx="90" cy="133" rx="56" ry="72" fill="#b97958" stroke="#262954" stroke-width="8"/><path d="M37 112Q40 51 90 49q51 2 54 63-23-24-53-24-31 0-54 24Z" fill="#30314f" stroke="#262954" stroke-width="8"/><path d="M52 130l25 7m28 0 24-7" stroke="#262954" stroke-width="7" stroke-linecap="round"/><ellipse cx="69" cy="148" rx="6" ry="8" fill="#222647"/><ellipse cx="112" cy="148" rx="6" ry="8" fill="#222647"/><path d="M65 186q25-17 51 0" fill="none" stroke="#693b42" stroke-width="7" stroke-linecap="round"/><path d="M64 174q26-13 53 0-27 11-53 0Z" fill="#302d47"/><path class="dc-char-hand" d="M38 253q-26-16-30 2t35 34" fill="#b97958" stroke="#262954" stroke-width="7"/></svg>';
  }
  function analystSvg(){
    return '<svg viewBox="0 0 180 360" aria-hidden="true"><ellipse cx="90" cy="344" rx="65" ry="12" fill="#05091f" opacity=".38"/><path d="M27 340q6-126 63-126t63 126" fill="#5a8a92" stroke="#262954" stroke-width="8"/><path d="M58 220l32 35 33-35" fill="#f5f0de" stroke="#262954" stroke-width="5"/><ellipse cx="90" cy="135" rx="54" ry="70" fill="#c78764" stroke="#262954" stroke-width="8"/><path d="M37 112Q40 51 90 49q51 2 54 63-20-25-54-25-33 0-53 25Z" fill="#292b4b" stroke="#262954" stroke-width="8"/><path d="M54 132h27m18 0h27M81 132h18" stroke="#30345a" stroke-width="6"/><circle cx="68" cy="145" r="19" fill="none" stroke="#30345a" stroke-width="5"/><circle cx="112" cy="145" r="19" fill="none" stroke="#30345a" stroke-width="5"/><ellipse cx="68" cy="146" rx="5" ry="7" fill="#222647"/><ellipse cx="112" cy="146" rx="5" ry="7" fill="#222647"/><path d="M70 184q20 9 40 0" fill="none" stroke="#693b42" stroke-width="6" stroke-linecap="round"/><path d="M113 250l45-18 14 78-47 13Z" fill="#fff5d6" stroke="#262954" stroke-width="7"/><path d="M130 264h22m-19 15h22m-18 15h21" stroke="#b48a59" stroke-width="4"/></svg>';
  }
  function pointerSvg(){
    return '<svg viewBox="0 0 48 56" aria-hidden="true"><path d="M14 4c3 0 5 2 5 5v14l2-1c3-1 5 0 6 2 2-1 5-1 6 2 2-1 6 0 6 3v10c0 8-6 14-14 14h-3c-5 0-8-2-11-6L4 35c-2-3 1-6 4-4l3 3V9c0-3 1-5 3-5z" fill="#fff3d6" stroke="#2a2550" stroke-width="3" stroke-linejoin="round"/><path d="M19 23v8M27 24v7M33 27v5" stroke="#2a2550" stroke-width="2.4" stroke-linecap="round"/><path d="M12 7q2-1 4 0" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/></svg>';
  }
  function openStory(index){
    ensureRoot();closeCoach(false);
    index=index||0;
    var beat=STORY[index], dots=STORY.map(function(_,i){return '<i class="'+(i===index?'active':'')+'"></i>';}).join('');
    root.hidden=false;document.body.classList.add('dc-tutorial-open');
    root.innerHTML='<section class="dc-briefing" role="dialog" aria-modal="true" aria-label="مقدمة المهمة"><div class="dc-briefing-stage">'+
      '<div class="dc-story-character analyst '+(beat.role==='analyst'?'is-speaking':'')+'">'+analystSvg()+'</div>'+
      '<article class="dc-dialogue" data-speaker="'+beat.role+'"><span class="dc-speaker">'+esc(beat.speaker)+'</span><p>'+esc(beat.text)+'</p><div class="dc-dialogue-footer"><span class="dc-story-progress">'+dots+'</span>'+
      (index<STORY.length-1?'<button class="dc-story-next" type="button">كمّل</button>':'<button class="dc-story-start" type="button">ابدأ التحليل</button>')+
      '</div></article><div class="dc-story-character mayor '+(beat.role==='mayor'?'is-speaking':'')+'">'+mayorSvg()+'</div></div></section>';
    var next=root.querySelector(index<STORY.length-1?'.dc-story-next':'.dc-story-start');
    next.focus();
    next.addEventListener('click',function(){
      if(index<STORY.length-1){openStory(index+1);return;}
      startGuided();
    });
  }
  function closeCoach(hideRoot){
    clearTimeout(bubbleTimer);bubbleTimer=0;
    if(cleanupTarget){cleanupTarget();cleanupTarget=null;}
    if(currentTarget){currentTarget.classList.remove('dc-tutorial-target');currentTarget=null;}
    cancelAnimationFrame(layoutFrame);
    if(root&&hideRoot!==false){root.hidden=true;root.innerHTML='';}
    document.body.classList.remove('dc-tutorial-open');
  }
  function coachMarkup(text,interactive){
    return '<div class="dc-coach-shade dc-shade-top"></div><div class="dc-coach-shade dc-shade-right"></div><div class="dc-coach-shade dc-shade-bottom"></div><div class="dc-coach-shade dc-shade-left"></div><div class="dc-coach-cutout"></div><aside class="dc-coach-bubble" role="dialog" aria-live="polite"><span class="dc-coach-tag">🔍 توجيه المحقق</span><p data-full="'+esc(text)+'">'+esc(text)+'</p>'+(interactive?'<span class="dc-coach-hint">👆 اضغط على المكان المضيء</span>':'<button type="button" class="dc-coach-next">فهمت ←</button>')+'</aside><span class="dc-coach-ripple"></span><span class="dc-coach-pointer">'+pointerSvg()+'</span>';
  }
  function readingTime(text){return Math.max(3000,Math.min(6000,1700+String(text).trim().split(/\s+/).length*180));}
  function positionCoach(){
    if(!root||!currentTarget||root.hidden) return;
    var rect=currentTarget.getBoundingClientRect(), pad=8, vw=window.innerWidth, vh=window.innerHeight;
    var cut=root.querySelector('.dc-coach-cutout'), bubble=root.querySelector('.dc-coach-bubble'), pointer=root.querySelector('.dc-coach-pointer');
    if(!cut||!bubble||!pointer) return;
    var top=Math.max(4,rect.top-pad), left=Math.max(4,rect.left-pad), right=Math.min(vw-4,rect.right+pad), bottom=Math.min(vh-4,rect.bottom+pad);
    var shades={top:root.querySelector('.dc-shade-top'),right:root.querySelector('.dc-shade-right'),bottom:root.querySelector('.dc-shade-bottom'),left:root.querySelector('.dc-shade-left')};
    shades.top.style.cssText='left:0;top:0;width:100%;height:'+top+'px';
    shades.bottom.style.cssText='left:0;top:'+bottom+'px;width:100%;height:'+Math.max(0,vh-bottom)+'px';
    shades.left.style.cssText='left:0;top:'+top+'px;width:'+left+'px;height:'+Math.max(0,bottom-top)+'px';
    shades.right.style.cssText='left:'+right+'px;top:'+top+'px;width:'+Math.max(0,vw-right)+'px;height:'+Math.max(0,bottom-top)+'px';
    cut.style.cssText='left:'+left+'px;top:'+top+'px;width:'+Math.max(1,right-left)+'px;height:'+Math.max(1,bottom-top)+'px';
    var bw=bubble.offsetWidth||340, bh=bubble.offsetHeight||120, gap=18, bx=Math.max(8,Math.min(vw-bw-8,left+(right-left-bw)/2)), by;
    if(vh-bottom>bh+gap) by=bottom+gap;
    else if(top>bh+gap) by=top-bh-gap;
    else by=(top>vh-bottom)?8:vh-bh-8;
    by=Math.max(8,Math.min(vh-bh-8,by));
    bubble.style.left=bx+'px';bubble.style.top=by+'px';
    var cx=(left+right)/2, cy=(top+bottom)/2, ripple=root.querySelector('.dc-coach-ripple');
    if(ripple){ripple.style.left=cx+'px';ripple.style.top=cy+'px';}
    var w=right-left, px=w>160?left+Math.min(56,w*.2):cx-10, py=bottom-22;
    pointer.style.left=Math.max(2,Math.min(vw-46,px))+'px';pointer.style.top=Math.max(2,Math.min(vh-54,py))+'px';
    if(ripple){ripple.style.left=(Math.max(2,Math.min(vw-46,px))+12)+'px';ripple.style.top=(bottom-16)+'px';}
    root.classList.add('is-placed');
  }
  function showCoach(target,text,interactive,next){
    ensureRoot();closeCoach(false);
    currentTarget=target;target.classList.add('dc-tutorial-target');
    root.classList.remove('is-placed');root.hidden=false;root.innerHTML=coachMarkup(text,interactive);document.body.classList.add('dc-tutorial-open','dc-tutorial-active');
    var rect=target.getBoundingClientRect();
    if(rect.bottom<0||rect.top>window.innerHeight) target.scrollIntoView({behavior:'smooth',block:'center'});
    positionCoach();setTimeout(function(){positionCoach();requestAnimationFrame(function(){var bubble=root.querySelector('.dc-coach-bubble');if(bubble){bubble.classList.add('is-ready');typeIn(bubble);}});target.focus({preventScroll:true});},260);
    function relayout(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(positionCoach);}
    window.addEventListener('resize',relayout);window.addEventListener('scroll',relayout,true);
    cleanupTarget=function(){window.removeEventListener('resize',relayout);window.removeEventListener('scroll',relayout,true);};
    if(interactive){
      var done=function(){
        var pointer=root.querySelector('.dc-coach-pointer');if(pointer) pointer.classList.add('is-tapping');
        setTimeout(function(){closeCoach(false);next();},180);
      };
      target.addEventListener('click',done,{once:true});
      var oldCleanup=cleanupTarget;cleanupTarget=function(){oldCleanup();target.removeEventListener('click',done);};
    }else{
      var btn=root.querySelector('.dc-coach-next');
      btn.addEventListener('click',function(){
        var bubble=root.querySelector('.dc-coach-bubble'),pp=bubble&&bubble.querySelector('p');
        if(pp&&pp._typing){finishType(pp);return;}
        if(bubble) bubble.classList.add('is-dismissed');
        setTimeout(function(){closeCoach(false);next();},170);
      });
    }
  }
  function finishType(p){clearInterval(p._typing);p._typing=0;p.textContent=p.getAttribute('data-full');}
  function typeIn(bubble){
    var p=bubble.querySelector('p');if(!p) return;var full=p.getAttribute('data-full'),i=0;
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){p.textContent=full;return;}
    p.style.minHeight='';p.textContent=full;var h=p.offsetHeight;p.style.minHeight=h+'px';p.textContent='';positionCoach();
    p._typing=setInterval(function(){i+=2;p.textContent=full.slice(0,i);if(i>=full.length) finishType(p);},22);
  }
  function targetCoach(find,text,interactive,next){waitFor(find,function(target){showCoach(target,text,interactive,next);});}
  function startGuided(){
    var api=bridge();if(!api) return;
    root.innerHTML='';document.body.classList.remove('dc-tutorial-open');
    api.startTutorial();
    var tnum=document.getElementById('tnum'),tlabel=document.getElementById('tlabel');
    if(tnum) tnum.textContent='60ث';if(tlabel) tlabel.textContent='المولّد';
    targetCoach(function(){return document.getElementById('timer');},'ده الوقت الباقي قبل ما المولد يفصل. لازم تخلص المهمة قبل ما يوصل للصفر.',false,guideEnergy);
  }
  function guideEnergy(){targetCoach(function(){return document.getElementById('hudEnergy');},'كل خانة طاقة خضرا فرصة تفكيك. اختار خطواتك على أساس المعلومات اللي معاك.',false,guideMetric);}
  function guideBack(){targetCoach(function(){return document.getElementById('backNav');},'دخلت في طريق مش مفيد؟ ارجع خطوة وجرب اتجاه تاني.',false,guideBreadcrumb);}
  function guideBreadcrumb(){targetCoach(function(){return document.querySelector('.crumbs');},'ده الطريق اللي مشيت فيه. تقدر تضغط على أي خطوة فاتت عشان ترجع لها مباشرة.',false,guidePath);}
  function guideMetric(){targetCoach(function(){return document.querySelector('.gauge-panel');},'قارن الحالي بالمعتاد، بس ما تحكمش من الرقم العام لوحده.',false,guideEvidence);}
  function guideEvidence(){targetCoach(function(){return document.querySelector('.clues');},'اقرأ الأدلة قبل ما تختار؛ هي اللي بتوجّهك لأنسب بُعد تبدأ تفكك منه، وممكن تستبعد لك طريق مش هيوصلك للسبب.',false,guideGuess);}
  function guideGuess(){targetCoach(function(){return document.querySelector('[data-act="guess"][data-g="1"]');},'اختار الحكم اللي يخليك تكمل فحص الصورة بدل ما تكتفي بالرقم العام.',true,function(){
    targetCoach(function(){return document.querySelector('.primary-next,[data-act="tile"]');},'بالظبط. لازم نشوف الرقم متوزع إزاي من جواه. اختار بُعد التفكيك اللي الأدلة بتوجّهك ليه.',true,guideBack);
  });}
  function correctTile(){
    var st=state();if(!st||!st.L||!st.S||!st.S.path) return null;
    var node=st.S.path[st.S.path.length-1], path=st.L.paths&&st.L.paths[0];if(!node||!node.children||!path) return null;
    var next=path[path.indexOf(node)+1], index=node.children.indexOf(next);
    if(index<0) index=node.children.findIndex(function(child){return child.faulty;});
    return index<0?null:document.querySelector('[data-act="tile"][data-i="'+index+'"]');
  }
  function guidePath(){
    var st=state();if(!st) return;
    if(st.G.view==='why'){guideWhy();return;}
    if(st.G.view==='won'){showRecap();return;}
    var depth=st.S.path.length, text=depth===2?'كل خطوة بتقسم الجزء اللي قدامك لتفاصيل أصغر. قارن كل جزء بالمعتاد، وكمّل ورا الاختلاف.':'تمام، كده ضيّقنا نطاق البحث. كمّل بنفس الطريقة.';
    targetCoach(correctTile,text,true,function(){
      var nextState=state();
      if(nextState&&nextState.G.view==='why'){guideWhy();return;}
      guidePath();
    });
  }
  function correctWhy(){
    var st=state();if(!st||!st.S||!st.S.whyLeaf) return null;
    var index=st.S.whyLeaf.why.opts.findIndex(function(option){return option[1];});
    return document.querySelector('[data-act="why"][data-i="'+index+'"]');
  }
  function guideWhy(){targetCoach(correctWhy,'عرفت المشكلة فين. دلوقتي اختار السبب اللي الدليل بيدعمه.',true,showRecap);}
  function showRecap(){
    closeCoach(false);ensureRoot();root.hidden=false;document.body.classList.add('dc-tutorial-open');
    root.innerHTML='<section class="dc-recap" role="dialog" aria-modal="true" aria-label="اكتمل شرح اللعبة"><article class="dc-recap-card"><div class="dc-recap-icon">✓</div><h2>جاهز للتحليل</h2><div class="dc-recap-flow"><span>قارن</span><b>←</b><span>اقرأ</span><b>←</b><span>اختار البُعد</span><b>←</b><span>ضيّق النطاق</span><b>←</b><span>حدّد السبب</span></div><p>كده عرفت طريقة التحقيق. المرة الجاية مفيش أسهم… القرار قرارك.</p><button class="dc-recap-start" type="button">ابدأ التحدي</button></article></section>';
    var button=root.querySelector('.dc-recap-start');button.focus();button.addEventListener('click',function(){
      try{localStorage.setItem(KEY,'1');}catch(e){}
      closeCoach(true);document.body.classList.remove('dc-tutorial-active');var api=bridge();if(api) api.startChallenge();
    });
  }
  function interceptGuidedClicks(event){
    if(!currentTarget||!document.body.classList.contains('dc-tutorial-active')) return;
    if(root&&root.contains(event.target)) return;
    if(currentTarget.contains(event.target)) return;
    var control=event.target.closest&&event.target.closest('[data-act],#backNav,.zone');
    if(!control) return;
    event.preventDefault();event.stopImmediatePropagation();
    var cutout=root&&root.querySelector('.dc-coach-cutout');
    if(cutout){cutout.classList.remove('dc-coach-remind');void cutout.offsetWidth;cutout.classList.add('dc-coach-remind');}
  }
  document.addEventListener('click',interceptGuidedClicks,true);
  document.addEventListener('click',function(event){
    var start=event.target.closest&&event.target.closest('[data-tutorial-start],[data-tutorial-replay]');
    if(start){event.preventDefault();openStory(0);}
  });
  window.addEventListener('load',function(){
    ensureRoot();var done=false;try{done=localStorage.getItem(KEY)==='1';}catch(e){}
    if(!done&&state()&&state().G.view==='home') setTimeout(function(){openStory(0);},420);
  });
})();
