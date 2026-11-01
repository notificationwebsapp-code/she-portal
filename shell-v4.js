/* shell-v4.js — ปุ่มแจ้งเตือน / ภาษา / ตั้งค่า ในแถบหัว (ตามแบบ Stitch). ใช้ DOM + textContent เท่านั้น
   สถานะ: กระดิ่ง = ยังไม่มีระบบแจ้งเตือน (backlog), ภาษา = ไทย/EN ใช้งานได้ (i18n.js), မြန်မာ ยังไม่เปิด, ตั้งค่า = ขนาดตัวอักษร (ใช้งานได้จริง) */
(function(){
  var NS="http://www.w3.org/2000/svg";
  var ICONS={
    pin:"M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12zm0-9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
    bell:"M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z",
    globe:"M12 2a10 10 0 100 20 10 10 0 000-20zm6.9 9h-3a15 15 0 00-1.2-5A8 8 0 0118.9 11zM12 4c.8 1 1.6 3 1.9 7h-3.8C10.4 7 11.2 5 12 4zM4.1 13h3a15 15 0 001.2 5A8 8 0 014.1 13zm3-2h-3A8 8 0 018.3 6a15 15 0 00-1.2 5zM12 20c-.8-1-1.6-3-1.9-7h3.8c-.3 4-1.1 6-1.9 7zm3.7-2a15 15 0 001.2-5h3a8 8 0 01-4.2 5z",
    gear:"M19.4 13a7.7 7.7 0 000-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 00-1.7-1L15 3.3h-4L10.7 6a7.6 7.6 0 00-1.7 1l-2.5-1-2 3.5L6.6 11a7.7 7.7 0 000 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 001.7 1l.3 2.7h4l.3-2.7a7.6 7.6 0 001.7-1l2.5 1 2-3.5L19.4 13zM12.5 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"
  };
  function icon(n){var s=document.createElementNS(NS,"svg");s.setAttribute("viewBox","0 0 24 24");s.setAttribute("aria-hidden","true");s.setAttribute("focusable","false");var p=document.createElementNS(NS,"path");p.setAttribute("d",ICONS[n]);s.appendChild(p);return s}
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
  var tools=el("div","tools");tools.setAttribute("role","group");tools.setAttribute("aria-label","เครื่องมือ");
  var open=null,adminBox=null,mgrBox=null,themeBox=null;
  function close(){if(open){open.btn.setAttribute("aria-expanded","false");open.pop.hidden=true;open=null}}
  function make(name,label,short,build){
    var w=el("div","toolwrap"),b=el("button","toolbtn");b.type="button";b.setAttribute("aria-label",label);b.setAttribute("aria-haspopup","true");b.setAttribute("aria-expanded","false");b.title=label;
    b.appendChild(icon(name));if(short)b.appendChild(el("span","tl",short));
    var pop=el("div","toolpop");pop.hidden=true;build(pop);w.appendChild(b);w.appendChild(pop);
    b.addEventListener("click",function(e){e.stopPropagation();var was=open&&open.btn===b;close();if(!was){pop.hidden=false;b.setAttribute("aria-expanded","true");open={btn:b,pop:pop}}});
    tools.appendChild(w);return b;
  }
  var bellBox;
  var bellBtn=make("bell","การแจ้งเตือน","",function(p){p.appendChild(el("strong",null,"การแจ้งเตือน"));bellBox=el("div","bellbox");bellBox.appendChild(el("p","tpnote","กำลังโหลด…"));p.appendChild(bellBox);p.appendChild(el("p","tpnote small","นับจากข้อมูลที่คุณมีสิทธิ์เห็นเท่านั้น (ระบบแจ้งเตือนทางอีเมล/มือถืออยู่ระหว่างพัฒนา)"))});
  function bellItem(n,t,href){var a=el("a","bellitem");a.href=href;var b=el("b",null,String(n));a.appendChild(b);a.appendChild(el("span",null,t));return a}
  /* ข้อความแจ้งเตือน CAPA: ส่วนคงที่แปลได้ (i18n) ส่วนที่ผู้ใช้พิมพ์/ชื่อเรื่องใส่ด้วย textContent และกันไม่ให้แปล (OWASP A03) */
  var CST={open:"เปิดใหม่",in_progress:"กำลังดำเนินการ",returned:"ส่งกลับให้แก้",closed:"รอตรวจสอบ",verified:"ตรวจสอบแล้ว",cancelled:"ยกเลิก"};
  var CEV={capa_assigned:"มอบหมาย Action ให้คุณ",capa_due_soon:"ใกล้ครบกำหนด",capa_overdue:"เกินกำหนดแล้ว",capa_status:"เปลี่ยนสถานะ",capa_due_changed:"เลื่อนกำหนดเสร็จ",capa_comment:"ความคิดเห็นใหม่"};
  function noData(t){var s=el("span",null,t);s.setAttribute("data-no-i18n","true");return s}
  /* รูปแบบการ์ดแจ้งเตือน: ใส่ผ่าน <style> ในไฟล์นี้ เพื่อไม่ต้องแก้ style-v4.css เพิ่ม; สีป้ายทุกสีตัวอักษรขาวบนพื้นเข้ม (WCAG 2.2 ข้อ 1.4.3 ≥ 4.5:1) */
  (function(){var st=document.createElement("style");st.textContent=
   ".bellbox{max-height:min(65vh,30rem);overflow-y:auto}"+
   ".nsec{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin:.6rem 0 .35rem;padding-top:.5rem;border-top:1px solid var(--line,#d9dee7);font-size:.8rem;font-weight:700;letter-spacing:.02em;color:#4b5565;text-transform:uppercase}"+
   ".nsec button{min-height:32px;padding:.15rem .7rem;font-size:.8rem;border-radius:999px;border:1px solid var(--brand,#1b3a8a);background:#fff;color:var(--brand,#1b3a8a);cursor:pointer;font-weight:600;text-transform:none;letter-spacing:0}"+
   ".nsec button:hover{background:var(--brand,#1b3a8a);color:#fff}"+
   ".ncard{display:block;position:relative;margin:.4rem 0;padding:.55rem .7rem .55rem .85rem;border:1px solid var(--line,#d9dee7);border-left:6px solid var(--nc,#6b7385);border-radius:10px;background:#fff;color:#1b2430;text-decoration:none}"+
   ".ncard:hover,.ncard:focus-visible{outline:2px solid var(--nc,#1b3a8a);outline-offset:1px;background:#f6f8fc}"+
   ".ncard.unread{background:#eef4ff;border-color:var(--nc,#6b7385);box-shadow:0 1px 4px rgba(0,0,0,.12)}"+
   ".ncard.unread::after{content:'';position:absolute;top:.6rem;right:.6rem;width:10px;height:10px;border-radius:50%;background:#c62828}"+
   ".ncard:not(.unread){opacity:.78}"+
   ".npill{display:inline-block;padding:.1rem .6rem;border-radius:999px;background:var(--nc,#6b7385);color:#fff;font-size:.78rem;font-weight:700}"+
   ".ncode{display:block;margin-top:.3rem;font-size:.8rem;font-weight:700;color:#4b5565}"+
   ".nttl{display:block;font-size:.95rem;font-weight:700;overflow-wrap:anywhere}"+
   ".nnote{display:block;margin-top:.3rem;padding:.3rem .5rem;border-left:3px solid #b8c2d6;border-radius:4px;background:#f1f3f7;font-size:.85rem;font-weight:400;overflow-wrap:anywhere}"+
   ".nmeta{display:block;margin-top:.3rem;font-size:.76rem;font-weight:400;color:#4b5565}"+
   ".ncard.t-assigned{--nc:#0d47a1}.ncard.t-due_soon{--nc:#8a5a00}.ncard.t-overdue{--nc:#b71c1c}.ncard.t-status{--nc:#6a2c91}.ncard.t-due_changed{--nc:#a64b00}.ncard.t-comment{--nc:#00695c}";
   document.head.appendChild(st)})();
  function notifItem(n){
    var tp=(n.event_type||"").replace("capa_","");
    var a=el("a","ncard t-"+tp+(n.read_at?"":" unread"));a.href="capa.html?id="+encodeURIComponent(n.entity_id);
    var pill=el("span","npill",CEV[n.event_type]||"แจ้งเตือน");
    if(n.event_type==="capa_status"&&n.code){pill.appendChild(document.createTextNode(" → "));pill.appendChild(el("span",null,CST[n.code]||n.code))}
    else if(n.code&&(n.event_type==="capa_due_changed"||n.event_type==="capa_due_soon"||n.event_type==="capa_overdue")){pill.appendChild(noData(" · "+n.code))}
    a.appendChild(pill);
    var ti=String(n.title||""),sp=ti.indexOf(" "),no=sp>0?ti.slice(0,sp):"",nm=sp>0?ti.slice(sp+1):ti;
    if(no){var c=noData(no);c.className="ncode";a.appendChild(c)}
    var t=noData(nm);t.className="nttl";a.appendChild(t);
    if(n.note){var nt=noData(n.note);nt.className="nnote";a.appendChild(nt)}
    var meta=noData((n.actor_name?n.actor_name+" · ":"")+new Date(n.created_at).toLocaleString((window.I18N&&I18N.lang==="en")?"en-GB":"th-TH"));meta.className="nmeta";a.appendChild(meta);
    a.addEventListener("click",function(){if(!n.read_at){try{sb.rpc("notification_mark_read",{p_id:n.id})}catch(e){}}});
    return a}
  async function loadBell(){try{
    if(typeof sb==="undefined"||!bellBox)return;var ss=await sb.auth.getSession();if(!ss.data.session){bellBox.replaceChildren(el("p","tpnote","เข้าสู่ระบบเพื่อดูการแจ้งเตือน"));return}
    var r=await sb.from("incident_edit_requests").select("id",{count:"exact",head:true}).eq("status","pending");
    var o=await sb.from("incident_reports").select("id",{count:"exact",head:true}).neq("phase","closed").is("deleted_at",null);
    if(r.error||o.error){bellBox.replaceChildren(el("p","tpnote","โหลดการแจ้งเตือนไม่สำเร็จ"));return}
    /* แจ้งเตือน Action (CAPA): ถ้ายังไม่ได้รัน migration B24a-4 จะข้ามส่วนนี้ ไม่กระทบรายการเดิม */
    var nl=[],uc=0;
    try{await sb.rpc("notifications_refresh");var l=await sb.rpc("notifications_list",{p_unread_only:false,p_limit:20});if(!l.error&&Array.isArray(l.data))nl=l.data;var c=await sb.rpc("notifications_unread_count");if(!c.error&&typeof c.data==="number")uc=c.data}catch(e){}
    bellBox.replaceChildren();var rc=r.count||0,oc=o.count||0;
    if(rc)bellBox.appendChild(bellItem(rc,"คำขอแก้ไขที่รอดำเนินการ","records.html"));
    if(oc)bellBox.appendChild(bellItem(oc,"รายงานอุบัติเหตุที่ยังไม่ปิดเคส","records.html"));
    if(nl.length){
      var hd=el("div","nsec");hd.appendChild(el("span",null,"แจ้งเตือน Action (CAPA)"));
      if(uc){var mb=el("button",null,"อ่านทั้งหมด");mb.type="button";mb.addEventListener("click",async function(ev){ev.stopPropagation();var x=await sb.rpc("notifications_mark_all_read");if(!x.error){await loadBell()}});hd.appendChild(mb)}
      bellBox.appendChild(hd);
      nl.forEach(function(n){bellBox.appendChild(notifItem(n))});
    }
    if(!rc&&!oc&&!nl.length)bellBox.appendChild(el("p","tpnote","ไม่มีรายการค้าง"));
    bellBtn.querySelectorAll(".belldot").forEach(function(d){d.remove()});
    var tot=rc+uc;
    if(tot){var d=el("span","belldot",tot>99?"99+":String(tot));d.setAttribute("aria-hidden","true");bellBtn.appendChild(d);bellBtn.setAttribute("aria-label","การแจ้งเตือน มี "+tot+" รายการรอดำเนินการ")}
  }catch(e){if(bellBox)bellBox.replaceChildren(el("p","tpnote","ไม่มีข้อมูลการแจ้งเตือน"))}}
  loadBell();
  /* ตัวสลับภาษาแบบ segmented (ตามแบบ Stitch): ไทย ใช้งานได้ / EN, မြန်မာ ยังไม่เปิด (รอแปลทั้งระบบ) */
  var langseg=null;(function(){var g=el("div","langseg");langseg=g;g.setAttribute("role","group");g.setAttribute("aria-label","ภาษา / Language");
    var cur=(window.I18N&&window.I18N.lang)||"th";g.setAttribute("data-no-i18n","");
    [["ไทย","th","ภาษาไทย / Thai"],["EN","en","English"],["မြန်မာ",null,"မြန်မာ — เร็ว ๆ นี้"]].forEach(function(o){
      var on=o[1]===cur;var b=el("button",on?"on":(o[1]?"":"off"),o[0]);b.type="button";b.title=o[2];b.setAttribute("aria-label",o[2]);
      if(o[1]){b.setAttribute("aria-pressed",on?"true":"false");if(!on)b.addEventListener("click",function(){if(window.I18N)window.I18N.set(o[1])})}
      else{b.setAttribute("aria-disabled","true");b.addEventListener("click",function(e){e.preventDefault()})}
      g.appendChild(b)});tools.appendChild(g)})();
  /* ตัวเลือก Plant ที่หัวเว็บ (ตามแบบ Stitch): เก็บค่าที่เลือกไว้ใน localStorage (แค่ตัวกรองหน้าจอ; สิทธิ์จริงคุมด้วย RLS) */
  var PKEY="she-plant";
  function pget(){try{return localStorage.getItem(PKEY)||"all"}catch(e){return "all"}}
  window.ShePlantFilter={get:function(){return null}};
  (async function(){try{
    if(typeof sb==="undefined")return;var ss=await sb.auth.getSession();if(!ss.data.session)return;
    var r=await sb.from("plants").select("id,code,name").eq("active",true).order("code");
    var list=r.data||[];if(r.error||!list.length)return;
    var cur=pget();if(cur!=="all"&&!list.some(function(p){return p.id===cur}))cur="all";
    window.ShePlantFilter.get=function(){return list.length<2||cur==="all"?null:cur};
    function lab(){if(list.length===1)return list[0].code;if(cur==="all")return "ทุก Plant";var p=list.filter(function(x){return x.id===cur})[0];return p?p.code:"ทุก Plant"}
    var btn=make("pin","เลือก Plant","",function(pp){
      pp.appendChild(el("strong",null,"เลือก Plant"));
      var box=el("div","plantlist-pop");pp.appendChild(box);
      function opt(id,text){var b=el("button","tpitem pick",text);b.type="button";b.setAttribute("aria-pressed",String(cur===id));
        b.addEventListener("click",function(){cur=id;try{localStorage.setItem(PKEY,id)}catch(e){}
          box.querySelectorAll("button").forEach(function(x){x.setAttribute("aria-pressed","false")});b.setAttribute("aria-pressed","true");
          tl.textContent=lab();close();document.dispatchEvent(new CustomEvent("she-plant-change",{detail:{plantId:id==="all"?null:id}}))});box.appendChild(b)}
      if(list.length>1)opt("all","ทุก Plant ที่ฉันเข้าถึงได้");
      list.forEach(function(p){opt(p.id,p.code+" — "+p.name)});
      pp.appendChild(el("p","tpnote small","ใช้กรองข้อมูลที่แสดงบนหน้าแรก สิทธิ์การเข้าถึงจริงถูกควบคุมที่ฐานข้อมูล"))});
    var tl=el("span","tl",lab());btn.appendChild(tl);btn.classList.add("plantbtn");
    var w=btn.parentNode;if(langseg)tools.insertBefore(w,langseg);
    if(list.length===1){btn.setAttribute("aria-haspopup","false")}
    document.dispatchEvent(new CustomEvent("she-plant-ready"));
  }catch(e){}})();
  /* ปุ่มปิด/เปิดธีมตกแต่ง: เฉพาะ Super admin (ผู้อื่นปิดเองไม่ได้ — ปรับธีมทั้งระบบที่หน้า "ธีมเทศกาล") */
  function fillTheme(){if(!themeBox)return;themeBox.replaceChildren();var T=window.SheTheme;
    if(T&&T.isSuper&&T.isSuper()&&(T.active()||T.isOff())){
      themeBox.appendChild(el("p","tpnote small","ธีมเทศกาล: "+(T.active()?T.active().label:"ปิดอยู่ (เฉพาะคุณ)")));
      var tb=el("button","tpbtn",T.isOff()?"เปิดธีมตกแต่ง":"ปิดธีมตกแต่ง");tb.type="button";tb.addEventListener("click",function(){T.setOff(!T.isOff())});themeBox.appendChild(tb);themeBox.hidden=false}
    else themeBox.hidden=true}
  /* ลิงก์จัดการประกาศ (เฉพาะ SHE/Admin): เห็นในเมนูเฟือง */
  (async function(){try{
    if(typeof getMyProfile!=="function"||!mgrBox)return;var p=await getMyProfile();
    if(p&&p.status==="active"&&["she","admin","super_admin"].indexOf(p.role)>-1){var l=el("a","tplink","ประกาศสำคัญ");l.href="admin-announcements.html";if((location.pathname.split("/").pop()||"")==="admin-announcements.html")l.setAttribute("aria-current","page");mgrBox.appendChild(l);var l2=el("a","tplink","แจ้งเตือน Action (CAPA)");l2.href="admin-notifications.html";if((location.pathname.split("/").pop()||"")==="admin-notifications.html")l2.setAttribute("aria-current","page");mgrBox.appendChild(l2);mgrBox.hidden=false}
  }catch(e){}})();
  make("gear","ตั้งค่า","",function(p){
    p.appendChild(el("strong",null,"ตั้งค่าการแสดงผล"));
    p.appendChild(el("p","tpnote small","ขนาดตัวอักษร"));
    var row=el("div","tprow"),cur="n";try{cur=localStorage.getItem("she-fs")||"n"}catch(e){}
    [["n","ปกติ"],["l","ใหญ่"],["xl","ใหญ่มาก"]].forEach(function(o){
      var x=el("button","tpbtn",o[1]);x.type="button";x.setAttribute("aria-pressed",String(cur===o[0]));
      x.addEventListener("click",function(){apply(o[0]);try{localStorage.setItem("she-fs",o[0])}catch(e){}
        row.querySelectorAll("button").forEach(function(y){y.setAttribute("aria-pressed","false")});x.setAttribute("aria-pressed","true")});
      row.appendChild(x)});
    p.appendChild(row);
    themeBox=el("div");themeBox.hidden=true;p.appendChild(themeBox);fillTheme();
    adminBox=el("div","tpadmin");adminBox.hidden=true;adminBox.appendChild(el("p","tpnote small","ผู้ดูแลระบบ"));p.appendChild(adminBox);mgrBox=el("div","tpadmin");mgrBox.hidden=true;mgrBox.appendChild(el("p","tpnote small","การจัดการเนื้อหา"));p.appendChild(mgrBox)});
  /* ยืนยันบทบาทจริง: ไม่ใช่ Super admin (หรือยังไม่ล็อกอิน) = ล้างสิทธิ์ปิดธีมที่จำไว้ในเบราว์เซอร์ */
  (function(){var tries=0;(function wait(){if(typeof getMyProfile!=="function"||!window.SheTheme||!window.SheTheme.setSuper){if(++tries<60)setTimeout(wait,100);return}
    Promise.resolve(getMyProfile()).then(function(p){window.SheTheme.setSuper(!!(p&&p.status==="active"&&p.role==="super_admin"));fillTheme()},function(){window.SheTheme.setSuper(false);fillTheme()})})()})();
  function apply(v){document.documentElement.style.fontSize=v==="l"?"112.5%":v==="xl"?"125%":""}
  try{apply(localStorage.getItem("she-fs")||"n")}catch(e){}
  document.addEventListener("click",function(e){if(open&&!open.pop.contains(e.target))close()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&open){var b=open.btn;close();b.focus()}});

  /* ไอคอนเมนู (inline SVG เส้นบาง) + Footer */
  var NAVIC={"index.html":"M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z","incident.html":"M12 3 2.5 20h19L12 3zM12 10v4.5M12 17.2v.1","checklist.html":"M5 4h14v16H5zM8.5 9l1.6 1.6L13 7.7M9 15h6","training.html":"M2.5 9.5 12 4.5l9.5 5-9.5 5zM6.5 12v4.5c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5V12","records.html":"M4 5h16v14H4zM4 10h16M9.5 10v9","capa.html":"M12 3a9 9 0 100 18 9 9 0 000-18zM8 12.5l2.7 2.7L16.5 9.5","admin-users.html":"M16 11a4 4 0 10-8 0M4 21a8 8 0 0116 0","admin-permissions.html":"M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5zM9 12l2 2 4-4","admin-master.html":"M4 6h16M4 12h16M4 18h10","executive-dashboard.html":"M4 20V10M10 20V4M16 20v-7M22 20H2"};
  function decorateNav(){document.querySelectorAll("header nav a").forEach(function(a){
    if(a.querySelector("svg.ni"))return;var k=(a.getAttribute("href")||"").split("/").pop();var d=NAVIC[k];if(!d)return;
    var s=document.createElementNS(NS,"svg");s.setAttribute("class","ni");s.setAttribute("viewBox","0 0 24 24");s.setAttribute("aria-hidden","true");
    var p=document.createElementNS(NS,"path");p.setAttribute("d",d.replace(/(\d)\.500/g,"$1.5"));s.appendChild(p);a.insertBefore(s,a.firstChild)})}
  function relocate(){var n=document.querySelector("header nav");if(!n)return;
    var b=document.getElementById("role-badge");if(b&&b.parentNode!==tools)tools.insertBefore(b,tools.firstChild);
    var u=n.querySelector('a[href="#"],a[href="login.html"]');if(u&&u.parentNode!==tools){u.classList.add("userlink");tools.appendChild(u)}}
  /* เมนูหลักชุดเดียวกันทุกหน้า (ตามแบบ Stitch): หน้าแรก · รายงาน · เช็กลิสต์ · อบรม · ดูข้อมูล · Executive Dashboard (เร็ว ๆ นี้) · ผู้ดูแลระบบ (เฉพาะ Admin) */
  var ORDER=["index.html","incident.html","checklist.html","training.html","records.html","capa.html"];var capaOn=false;
  var ADM=["admin-users.html","admin-master.html","admin-permissions.html","admin-grants.html","admin-offboarding.html","admin-themes.html"];var hasTh=false,dashMode=null;
  var obs=null;
  function normalizeNav(){var n=document.querySelector("header nav");if(!n)return;if(obs)obs.disconnect();
    var f=(location.pathname.split("/").pop()||"index.html");var by={};
    document.querySelectorAll("header a").forEach(function(a){if(a.closest(".tpadmin"))return;var k=(a.getAttribute("href")||"").split("/").pop();if(n.contains(a)||ADM.indexOf(k)>-1)by[k]=by[k]||a});
    if(capaOn&&!by["capa.html"]){var cl=el("a",null,"Action (CAPA)");cl.href="capa.html";by["capa.html"]=cl}
    ORDER.forEach(function(k){if(by[k])n.appendChild(by[k])});
    var dl=n.querySelector("a.navdash");if(!dl&&dashMode==="yes"){dl=el("a","navdash","Executive Dashboard");dl.href="executive-dashboard.html"}
    if(dl&&by["index.html"])n.appendChild(dl);
    if(by["admin-themes.html"])hasTh=true;if(hasTh){var st=document.querySelector("nav.subtabs");if(st&&!st.querySelector('a[href="admin-themes.html"]')){var ta=el("a",null,"ธีมเทศกาล");ta.href="admin-themes.html";if(f==="admin-themes.html")ta.setAttribute("aria-current","page");st.appendChild(ta)}}var isAdmin=!!(by[ADM[0]]||by[ADM[1]]||by[ADM[2]]);
    ADM.slice(1).forEach(function(k){if(by[k]&&by[k].parentNode)by[k].parentNode.removeChild(by[k])});
    if(adminBox){var labs={"admin-users.html":"จัดการผู้ใช้","admin-master.html":"ข้อมูลหลัก","admin-permissions.html":"สิทธิ์การใช้งาน","admin-grants.html":"สิทธิ์รายบุคคล","admin-offboarding.html":"ผู้ใช้ที่ลาออก / ทบทวนสิทธิ์","admin-themes.html":"ธีมเทศกาล"};
      adminBox.querySelectorAll("a").forEach(function(x){x.remove()});
      ADM.forEach(function(k){if(k==="admin-themes.html"?(by[k]||hasTh||f===k):(by[k]||isAdmin)){var l=el("a","tplink",labs[k]);l.href=k;if(k===f)l.setAttribute("aria-current","page");adminBox.appendChild(l)}});
      adminBox.hidden=!isAdmin}
    if(by[ADM[0]]){var a=by[ADM[0]];a.textContent="ผู้ดูแลระบบ";n.appendChild(a)}
    n.querySelectorAll("a").forEach(function(a){var k=(a.getAttribute("href")||"").split("/").pop();
      var cur=(k===f)||(ADM.indexOf(f)>-1&&k===ADM[0]);if(cur)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
    decorateNav();relocate();
    if(obs)obs.observe(document.querySelector("header"),{childList:true,subtree:true})}
  /* เมนู Executive Dashboard: แสดงเฉพาะผู้มีสิทธิ์ dashboard.view (ซ่อนหน้าจอเท่านั้น สิทธิ์จริงบังคับที่ฐานข้อมูล) */
  (function(){var tries=0;(function wait(){if(typeof sb==="undefined"||!sb.auth){if(++tries<60)setTimeout(wait,100);return}
    sb.auth.getSession().then(function(r){if(!r||!r.data||!r.data.session){return}capaOn=true;normalizeNav();
      return sb.rpc("my_permissions").then(function(p){if(!p.error&&Array.isArray(p.data)&&p.data.indexOf("dashboard.view")>-1){dashMode="yes";normalizeNav()}})}).catch(function(){})})()})();
  /* บันทึก "เข้าใช้ล่าสุด" วันละไม่เกิน 1 ครั้งต่อเบราว์เซอร์ (ฐานข้อมูลจำกัดซ้ำอีกชั้น) ใช้ตรวจบัญชีที่ไม่ได้ใช้งานเกินกำหนด */
  (function(){var tries=0;(function wait(){if(typeof sb==="undefined"||!sb.auth){if(++tries<60)setTimeout(wait,100);return}
    sb.auth.getSession().then(function(r){if(!r||!r.data||!r.data.session)return;var uid=r.data.session.user.id,day=new Date().toISOString().slice(0,10),key="she_seen_"+uid;
      try{if(localStorage.getItem(key)===day)return}catch(e){}
      return sb.rpc("touch_last_seen").then(function(x){if(!x.error){try{localStorage.setItem(key,day)}catch(e){}}})}).catch(function(){})})()})();
  decorateNav();
  var nv=document.querySelector("header nav");if(nv){obs=new MutationObserver(normalizeNav);normalizeNav()}
  if(!document.querySelector(".sitefoot")){
    var f=el("footer","sitefoot"),l=el("span");var b=el("b",null,"SHE Portal");l.appendChild(b);l.appendChild(document.createTextNode(" · ระบบบันทึกข้อมูลความปลอดภัย อาชีวอนามัย และสิ่งแวดล้อม"));
    var r=el("span");var d=el("span","dot");d.setAttribute("aria-hidden","true");r.appendChild(d);r.appendChild(document.createTextNode("ระยะทดสอบ — ใช้ข้อมูลทดสอบเท่านั้น"));
    f.appendChild(l);f.appendChild(r);document.body.appendChild(f)}

  /* แถบเมนูย่อยของส่วนผู้ดูแล (ตามแบบ Stitch: Pending Users / Master Lists / Permissions) */
  (function(){var f=(location.pathname.split("/").pop()||"");var T=[["admin-users.html","ผู้ใช้รออนุมัติ"],["admin-master.html","ข้อมูลหลัก"],["admin-permissions.html","สิทธิ์การใช้งาน"],["admin-grants.html","สิทธิ์รายบุคคล"],["admin-offboarding.html","ลาออก / ทบทวนสิทธิ์"]];if(hasTh||f==="admin-themes.html")T.push(["admin-themes.html","ธีมเทศกาล"]);
    if(!T.some(function(t){return t[0]===f}))return;var m=document.querySelector("main");if(!m)return;
    var n=el("nav","subtabs");n.setAttribute("aria-label","เมนูผู้ดูแลระบบ");
    T.forEach(function(t){var a=el("a",null,t[1]);a.href=t[0];if(t[0]===f)a.setAttribute("aria-current","page");n.appendChild(a)});m.insertBefore(n,m.firstChild)})();
  (function(){var f=(location.pathname.split("/").pop()||""),m=document.querySelector("main");
    if(m&&["checklist.html","training.html","reset.html"].indexOf(f)>-1&&!m.classList.contains("narrow")&&!m.classList.contains("authsplit")){m.classList.add("formcard");
      /* เช็กลิสต์/บันทึกอบรมเป็นฟอร์มทำงานบนจอกว้าง → เต็มหน้าจอเหมือนหน้าอื่น (reset.html คงเป็นการ์ดแคบ) */
      if(f!=="reset.html")m.classList.add("fullw")}})();
  (function(){var st=document.createElement("style");st.textContent="@media(min-width:1100px){main.formcard.fullw{max-width:none;margin:1.5rem 2rem}main.wide form{max-width:none}}";document.head.appendChild(st)})();
  var h=document.querySelector("header");if(h)h.appendChild(tools);relocate();
})();
