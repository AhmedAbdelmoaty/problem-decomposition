/* Decorative scenes use the player's visible path only. Never read fault, reveal or solution data. */
(function(){
  'use strict';
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function label(s,y){return '<rect x="9" y="'+(y-17)+'" width="342" height="23" rx="9" fill="#171936" opacity=".88"/><text x="180" y="'+y+'" text-anchor="middle" class="scene-label">'+esc(s)+'</text>';}
  function sky(city){
    var s='<defs><linearGradient id="scene-night" x2="0" y2="1"><stop stop-color="#111638"/><stop offset="1" stop-color="#4b406e"/></linearGradient><linearGradient id="scene-evening" x2="0" y2="1"><stop stop-color="#3c346e"/><stop offset="1" stop-color="#c67d75"/></linearGradient></defs>';
    s+='<rect width="360" height="250" fill="url(#'+(city?'scene-night':'scene-evening')+')"/>';
    if(city) s+='<circle class="scene-moon" cx="60" cy="45" r="25" fill="#e2e9ff"/><circle cx="54" cy="41" r="3" fill="#b5c2ec"/><circle cx="69" cy="51" r="2" fill="#b5c2ec"/><path class="scene-cloud" d="M8 70q30-11 71-2t57 1q-30 9-67 8T8 70Z" fill="#11152f" opacity=".7"/>';
    else s+='<circle cx="64" cy="50" r="28" fill="#f8d9aa" opacity=".8"/>';
    for(var i=0;i<15;i++) s+='<circle cx="'+(17+(i*71)%329)+'" cy="'+(17+(i*43)%106)+'" r="1" fill="#ccd8ff" opacity=".5"/>';
    return s;
  }
  function road(){
    return '<path d="M0 210h360v40H0Z" fill="#262c50"/><path d="M0 232h360" stroke="#d3bd97" stroke-width="2" stroke-dasharray="18 13"/>'+
      '<path d="M23 212v-35q0-8 8-8h5M323 212v-33q0-8 8-8h5" fill="none" stroke="#a9a6c4" stroke-width="3"/>'+
      '<circle class="scene-lamp" cx="37" cy="169" r="4" fill="#efda96"/><circle class="scene-lamp offset" cx="337" cy="171" r="4" fill="#efda96"/>'+
      '<ellipse cx="37" cy="205" rx="19" ry="5" fill="#e5c37b" opacity=".12"/><ellipse cx="337" cy="205" rx="19" ry="5" fill="#e5c37b" opacity=".12"/>';
  }
  function house(x,y,w,h,kind){
    var color=kind==='factory'?'#344068':kind==='shop'?'#45527d':'#343e74';
    var s='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="2" fill="'+color+'" stroke="#8790b5" stroke-width="2"/>';
    if(kind==='factory') s+='<path d="M'+x+' '+y+'l16-14 12 14 15-14 13 14" fill="#46527c" stroke="#8790b5" stroke-width="2"/><rect x="'+(x+w-13)+'" y="'+(y-30)+'" width="9" height="30" fill="#4b527c"/>';
    else if(kind==='shop') s+='<path d="M'+(x-2)+' '+(y+21)+'h'+(w+4)+'v10h-'+(w+4)+'Z" fill="#a86d80"/><rect x="'+(x+8)+'" y="'+(y+37)+'" width="'+(w-16)+'" height="'+(h-42)+'" fill="#243a62" stroke="#8795ac" stroke-width="2"/>';
    else s+='<path d="M'+(x-4)+' '+y+'L'+(x+w/2)+' '+(y-12)+'L'+(x+w+4)+' '+y+'Z" fill="#555588" stroke="#9799c5" stroke-width="2"/>';
    if(kind!=='shop') for(var yy=y+12;yy<y+h-15;yy+=16) for(var xx=x+10;xx<x+w-7;xx+=16) s+='<rect class="scene-window" x="'+xx+'" y="'+yy+'" width="7" height="9" fill="#7385aa" opacity=".52"/>';
    return s;
  }
  function factoryYard(name,depth){
    var s=sky(true)+'<path d="M0 149l56-25 44 24 40-38 52 36 44-22 61 19 63-21v88H0Z" fill="#272f57"/>';
    s+=house(18,126,91,83,'factory')+house(128,112,97,97,'factory')+house(245,132,94,77,'factory');
    s+='<rect x="144" y="164" width="57" height="45" fill="#20294a" stroke="#8790b5" stroke-width="2"/><path d="M151 207v-37h42v37" fill="none" stroke="#64749b" stroke-width="2"/>';
    s+='<path d="M0 202h360" stroke="#8290aa" stroke-width="3"/>'+road();
    s+='<path d="M78 208v-18h32M240 208v-22h28" stroke="#8992ad" stroke-width="3" fill="none"/>';
    if(depth>=2) s+='<rect x="213" y="184" width="30" height="24" fill="#786887" stroke="#a6a6bf"/><circle cx="219" cy="209" r="4" fill="#171b37"/><circle cx="238" cy="209" r="4" fill="#171b37"/>';
    return s+label(name,108);
  }
  function neighborhood(name,depth,district){
    var context=district||name;
    var factory=/مصانع|صناعي/.test(context), market=/وسط|سوق|محطة|بريد/.test(context), harbor=/ميناء|بحر/.test(context);
    if(factory) return factoryYard(name,depth);
    var s=sky(true);
    if(harbor) s+='<path d="M0 181h360v29H0Z" fill="#344c74"/><path d="M0 188q15-5 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0" stroke="#819ab8" fill="none"/><path d="M285 175v-77m0 5 35 15h-35" stroke="#8190ad" stroke-width="3" fill="none"/>';
    s+=house(12,102,66,108,market?'shop':'home')+house(84,80,72,130,'home')+house(160,118,66,92,market?'shop':'home')+house(234,90,104,120,market?'shop':'home');
    if(!market) s+='<circle cx="50" cy="195" r="20" fill="#344e5b"/><path d="M50 211v12" stroke="#5c6b76" stroke-width="4"/>';
    if(depth>=2) s+='<path d="M115 211v-34h13M255 211v-26h13" stroke="#a6a8c4" stroke-width="3" fill="none"/>';
    s+=road();
    if(depth>=2) s+='<g class="scene-car-one"><path d="M90 223h47l-8-11H99Z" fill="#de8d80" stroke="#262b52" stroke-width="2"/><circle cx="102" cy="224" r="4" fill="#151b38"/><circle cx="127" cy="224" r="4" fill="#151b38"/></g>'+
      '<g class="scene-car-two"><path d="M196 224h45l-7-10h-29Z" fill="#88b9bd" stroke="#262b52" stroke-width="2"/><circle cx="208" cy="225" r="4" fill="#151b38"/><circle cx="231" cy="225" r="4" fill="#151b38"/></g>'+
      '<path class="scene-bump-star" d="M170 208l3-8 4 7 8-4-4 9 8 4-10 1-1 9-6-7-7 4 3-9-8-3Z" fill="#ffd58d"/>';
    return s+label(name,79);
  }
  function streetScene(name,district,showBump){
    var factory=/مصانع|صناعي/.test(district||''), harbor=/ميناء/.test(district||'');
    var kind=factory?'factory':/وسط|سوق/.test(district||'')?'shop':'home';
    var s=sky(true)+'<path d="M0 181L132 112h96l132 69v69H0Z" fill="#2a315a"/>';
    if(harbor) s+='<path d="M139 176h82" stroke="#6d89a9" stroke-width="4"/>';
    s+=house(-7,91,98,120,kind)+house(258,91,109,120,kind);
    s+=house(99,124,47,76,kind)+house(214,124,47,76,kind);
    s+='<path d="M150 162h60l150 88H0Z" fill="#252a4e" stroke="#7581a6" stroke-width="3"/>'+
      '<path d="M180 170v80" stroke="#d0ba92" stroke-width="2" stroke-dasharray="14 13"/>'+
      '<path d="M130 220v-47q0-5 7-5h3M224 220v-47q0-5 7-5h3" stroke="#b1b3cc" stroke-width="3" fill="none"/>'+
      '<circle class="scene-lamp" cx="140" cy="168" r="4" fill="#efd59a"/><circle class="scene-lamp offset" cx="234" cy="168" r="4" fill="#efd59a"/>';
    if(/مدرسة/.test(name)) s+='<rect x="7" y="126" width="70" height="16" rx="2" fill="#e5d3b2"/><text x="42" y="138" text-anchor="middle" font-size="8" fill="#2c3156" font-weight="bold">مدرسة</text>';
    else if(/سوق/.test(name)) s+='<path d="M0 144h102v12q-10 8-20 0-10 8-20 0-10 8-20 0-10 8-20 0-10 8-22 0Z" fill="#cb8b91"/><path d="M259 144h101v12q-10 8-20 0-10 8-20 0-10 8-20 0-10 8-20 0-10 8-21 0Z" fill="#cba785"/>';
    else if(/حديقة/.test(name)) s+='<path d="M77 197v-30m210 30v-30" stroke="#77898b" stroke-width="4"/><circle cx="77" cy="158" r="20" fill="#3d655c"/><circle cx="287" cy="158" r="20" fill="#3d655c"/>';
    else if(/محطة/.test(name)) s+='<path d="M3 193v-34h65v34m-65-32h65" stroke="#9aa9c7" stroke-width="3" fill="none"/><rect x="14" y="166" width="43" height="10" rx="2" fill="#d9b98d"/>';
    else if(/نيل|بحر/.test(name)) s+='<path d="M142 158h76m-76 5h76" stroke="#75a9bc" stroke-width="3" opacity=".7"/>';
    else if(/ورشة/.test(name)) s+='<rect x="8" y="152" width="85" height="53" fill="#313c65" stroke="#94a2b9" stroke-width="3"/><path d="M12 164h77m-77 10h77m-77 10h77" stroke="#6d7d9b" stroke-width="2"/>';
    else if(/ساعة/.test(name)) s+='<circle cx="180" cy="136" r="11" fill="#d5cbbf" stroke="#323958" stroke-width="3"/><path d="M180 136v-6m0 6 5 3" stroke="#323958" stroke-width="2"/>';
    else if(/بريد/.test(name)) s+='<rect x="56" y="167" width="20" height="34" rx="3" fill="#946a82" stroke="#ded0ba" stroke-width="2"/><path d="M60 179h12" stroke="#e8d7c3" stroke-width="2"/>';
    if(factory) s+='<rect x="0" y="192" width="70" height="8" fill="#69759a"/><rect x="285" y="193" width="75" height="8" fill="#69759a"/>';
    if(showBump&&!factory) s+='<g class="scene-car-one"><path d="M115 226h53l-8-13h-34Z" fill="#de8d80" stroke="#262b52" stroke-width="2"/><circle cx="130" cy="226" r="4" fill="#171b38"/><circle cx="156" cy="226" r="4" fill="#171b38"/></g>'+
      '<g class="scene-car-two"><path d="M191 226h52l-8-13h-33Z" fill="#88b9bd" stroke="#262b52" stroke-width="2"/><circle cx="205" cy="226" r="4" fill="#171b38"/><circle cx="232" cy="226" r="4" fill="#171b38"/></g>'+
      '<path class="scene-bump-star" d="M179 208l3-8 4 7 8-4-4 9 8 4-10 1-1 9-6-7-7 4 3-9-8-3Z" fill="#ffd58d"/>';
    return s+label(name,75);
  }
  function building(name,parent){
    var factory=/مصانع|ورشة/.test(parent), shop=/سوق|وسط|محل/.test(parent);
    var kind=factory?'factory':shop?'shop':'home';
    var s=sky(true)+'<path d="M0 180l56-26 53 20 40-30 51 23 55-23 58 27 47-22v61H0Z" fill="#27305b"/>';
    s+=house(7,150,70,60,kind)+house(92,56,175,153,kind)+house(281,146,72,63,kind);
    s+='<rect x="157" y="161" width="44" height="48" fill="#202647" stroke="#9fa3bd" stroke-width="3"/>';
    if(kind==='factory') s+='<rect x="103" y="62" width="154" height="17" fill="#6e6f91"/><text x="180" y="75" class="scene-small" text-anchor="middle">الورشة</text>';
    return s+road()+label(name,49);
  }
  function clockFace(name,inner){
    var s=sky(true)+house(14,134,67,75,'home')+house(276,131,69,78,'shop')+road();
    s+='<circle cx="180" cy="127" r="68" fill="#30365e" stroke="#bfc1de" stroke-width="6"/><circle cx="180" cy="127" r="52" fill="#4a4b79" stroke="#747db2" stroke-width="2"/>';
    for(var i=0;i<12;i++){var a=i*Math.PI/6;s+='<circle cx="'+(180+43*Math.sin(a)).toFixed(1)+'" cy="'+(127-43*Math.cos(a)).toFixed(1)+'" r="2" fill="#ddd5bb"/>';}
    s+='<path d="M180 127v-27m0 27 22 12" stroke="#ffdb91" stroke-width="5" stroke-linecap="round"/><circle cx="180" cy="127" r="5" fill="#ffdb91"/>';
    if(inner) s+='<path d="M111 185h138" stroke="#c7b4a7" stroke-width="3" stroke-dasharray="6 6"/>';
    return s+label(name,47);
  }
  function typeScene(name,inner){
    var kind=/مصانع|غزل|حديد|بلاستيك|أغذية/.test(name)?'factory':/محل|مول|مطعم|سوبر|ورش/.test(name)?'shop':'home';
    var s=sky(true)+house(18,125,72,84,kind)+house(111,75,137,134,kind)+house(270,127,72,82,kind)+road();
    if(/مستشفى/.test(name)) s+='<rect x="145" y="84" width="70" height="17" rx="3" fill="#e5f1e7"/><text x="180" y="96" text-anchor="middle" fill="#244a52" font-size="10" font-weight="bold">مستشفى</text>';
    if(inner) s+='<path d="M139 209v-48h82v48" fill="none" stroke="#aab0c9" stroke-width="2"/>';
    return s+label(name,56);
  }
  function shopShell(name){
    return sky(false)+'<path d="M0 186h360v64H0Z" fill="#555079"/><rect x="30" y="72" width="300" height="140" rx="5" fill="#5e658f" stroke="#343762" stroke-width="7"/>'+
      '<path d="M25 104h310v26q-16 13-31 0-16 13-31 0-16 13-31 0-16 13-31 0-16 13-31 0-16 13-31 0-16 13-31 0-16 13-31 0-16 13-31 0-16 13-31 0Z" fill="#f1ba87" stroke="#373868" stroke-width="4"/>'+
      '<rect x="48" y="146" width="92" height="55" fill="#3d547e" stroke="#a8bbd0" stroke-width="4"/><rect x="218" y="146" width="92" height="55" fill="#3d547e" stroke="#a8bbd0" stroke-width="4"/>'+
      '<rect x="157" y="143" width="46" height="68" fill="#34395f" stroke="#b9bbd3" stroke-width="4"/>'+label(name,91);
  }
  function shopFloor(name){
    var s=sky(false)+'<rect x="0" y="101" width="360" height="149" fill="#a38eaa"/><path d="M0 183h360v67H0Z" fill="#746888"/>';
    for(var i=0;i<3;i++){var x=20+i*113;s+='<rect x="'+x+'" y="91" width="93" height="104" rx="4" fill="#4a5280" stroke="#d4c0ae" stroke-width="4"/><path d="M'+(x+4)+' 130h85m-85 31h85" stroke="#d4b6a5" stroke-width="4"/>';
      for(var j=0;j<3;j++) s+='<rect x="'+(x+11+j*25)+'" y="106" width="15" height="20" fill="'+(['#efb884','#8dd0c2','#d0a1be'][j])+'"/><rect x="'+(x+11+j*25)+'" y="138" width="15" height="20" fill="'+(['#8dd0c2','#d0a1be','#efb884'][j])+'"/>';}
    s+='<path d="M0 205h360" stroke="#e4c5af" stroke-width="5"/>';
    return s+label(name,64);
  }
  function productScene(name,inner){
    var s=shopFloor(name);
    if(inner) s+='<rect x="78" y="148" width="204" height="60" rx="5" fill="#3e4777" stroke="#e2c4ad" stroke-width="4"/><rect x="105" y="159" width="45" height="38" fill="#a5b4c9"/><rect x="157" y="159" width="45" height="38" fill="#8ebbb9"/><rect x="209" y="159" width="45" height="38" fill="#d5a7a3"/>';
    return s;
  }
  function productSymbol(category){
    var s='<g fill="none" stroke="#eee2c8" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">';
    if(/لابتوب/.test(category)) s+='<rect x="153" y="141" width="54" height="35" rx="3"/><path d="M145 183h70l-8-7h-54Z"/>';
    else if(/موبايل/.test(category)) s+='<rect x="167" y="137" width="26" height="51" rx="5"/><circle cx="180" cy="181" r="2" fill="#eee2c8"/>';
    else if(/شاش/.test(category)) s+='<rect x="148" y="139" width="64" height="40" rx="3"/><path d="M180 179v11m-20 0h40"/>';
    else if(/إكسسوار/.test(category)) s+='<path d="M155 168v-13q0-25 25-25t25 25v13"/><rect x="150" y="160" width="12" height="25" rx="4"/><rect x="198" y="160" width="12" height="25" rx="4"/>';
    else s+='<rect x="153" y="148" width="54" height="38" rx="5"/>';
    return s+'</g>';
  }
  function paymentScene(name,inner){
    var s=sky(false)+'<rect y="92" width="360" height="158" fill="#8d7b9e"/><path d="M0 187h360v63H0Z" fill="#6b6084"/>';
    s+='<rect x="40" y="135" width="280" height="75" rx="8" fill="#e4b68f" stroke="#353a6b" stroke-width="5"/><rect x="67" y="101" width="71" height="39" rx="4" fill="#343a65" stroke="#cfb5a7" stroke-width="4"/><rect x="79" y="111" width="47" height="20" fill="#8caabc"/>';
    s+='<rect x="213" y="109" width="61" height="32" rx="3" fill="#515b85" stroke="#d6b7a2" stroke-width="3"/><path d="M221 123h45" stroke="#e9c79a" stroke-width="3"/>';
    if(inner) s+='<rect x="151" y="149" width="59" height="44" rx="4" fill="#f5d5a4" stroke="#343a65" stroke-width="3"/>';
    return s+label(name,76);
  }
  function paymentSymbol(method){
    var s='<g fill="none" stroke="#fff0d2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">';
    if(/كاش/.test(method)) s+='<rect x="153" y="153" width="54" height="33" rx="3"/><circle cx="180" cy="169" r="8"/>';
    else if(/بطاق/.test(method)) s+='<rect x="148" y="154" width="64" height="40" rx="5"/><path d="M151 166h58m-52 18h16"/>';
    else if(/تقسيط/.test(method)) s+='<rect x="153" y="148" width="54" height="48" rx="4"/><path d="M162 160h36m-36 10h36m-36 10h22"/>';
    else if(/محفظ/.test(method)) s+='<rect x="153" y="149" width="54" height="42" rx="6"/><path d="M168 149v-9h28v9m-1 21h15"/>';
    else s+='<rect x="153" y="151" width="54" height="38" rx="4"/>';
    return s+'</g>';
  }
  window.renderMysteryScene=function(state){
    var path=state.path||[], name=path[path.length-1]||'', parent=path[path.length-2]||'', axis=state.axis||'';
    if(state.city){
      if(axis==='time') return clockFace(name,path.length>1);
      if(axis==='type') return typeScene(name,path.length>1);
      if(path.length>=3) return building(name,path[0]);
      if(path.length===2) return streetScene(name,path[0],state.level===0);
      return neighborhood(name,1);
    }
    if(axis==='branch') return path.length>=2?shopFloor(name):shopShell(name||'الفروع');
    if(axis==='product') return productScene(name||'الأصناف',path.length>=2)+productSymbol(path[0]||'');
    if(axis==='pay') return paymentScene(name||'طرق الدفع',path.length>=2)+paymentSymbol(path[0]||'');
    return shopShell(parent||name);
  };
})();
