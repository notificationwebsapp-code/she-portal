/* shell-v4.js — ปุ่มแจ้งเตือน / ภาษา / ตั้งค่า ในแถบหัว (ตามแบบ Stitch). ใช้ DOM + textContent เท่านั้น
   สถานะ: กระดิ่ง = ยังไม่มีระบบแจ้งเตือน (backlog), ภาษา = เลือก EN ยังไม่ได้ (รอแปลทั้งระบบ), ตั้งค่า = ขนาดตัวอักษร (ใช้งานได้จริง) */
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
  var open=null,adminBox=null,mgrBox=null;
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
  (async function(){try{
    if(typeof sb==="undefined"||!bellBox)return;var ss=await sb.auth.getSession();if(!ss.data.session){bellBox.replaceChildren(el("p","tpnote","เข้าสู่ระบบเพื่อดูการแจ้งเตือน"));return}
    var r=await sb.from("incident_edit_requests").select("id",{count:"exact",head:true}).eq("status","pending");
    var o=await sb.from("incident_reports").select("id",{count:"exact",head:true}).neq("phase","closed").is("deleted_at",null);
    if(r.error||o.error){bellBox.replaceChildren(el("p","tpnote","โหลดการแจ้งเตือนไม่สำเร็จ"));return}
    bellBox.replaceChildren();var rc=r.count||0,oc=o.count||0;
    if(rc)bellBox.appendChild(bellItem(rc,"คำขอแก้ไขที่รอดำเนินการ","records.html"));
    if(oc)bellBox.appendChild(bellItem(oc,"รายงานอุบัติเหตุที่ยังไม่ปิดเคส","records.html"));
    if(!rc&&!oc)bellBox.appendChild(el("p","tpnote","ไม่มีรายการค้าง"));
    if(rc){var d=el("span","belldot",rc>99?"99+":String(rc));d.setAttribute("aria-hidden","true");bellBtn.appendChild(d);bellBtn.setAttribute("aria-label","การแจ้งเตือน มี "+rc+" รายการรอดำเนินการ")}
  }catch(e){if(bellBox)bellBox.replaceChildren(el("p","tpnote","ไม่มีข้อมูลการแจ้งเตือน"))}})();
  /* ตัวสลับภาษาแบบ segmented (ตามแบบ Stitch): ไทย ใช้งานได้ / EN, မြန်မာ ยังไม่เปิด (รอแปลทั้งระบบ) */
  var langseg=null;(function(){var g=el("div","langseg");langseg=g;g.setAttribute("role","group");g.setAttribute("aria-label","ภาษา / Language");
    [["ไทย",true,"ภาษาไทย (ใช้งานอยู่)"],["EN",false,"English — เร็ว ๆ นี้"],["မြန်မာ",false,"မြန်မာ — เร็ว ๆ นี้"]].forEach(function(o){
      var b=el("button",o[1]?"on":"off",o[0]);b.type="button";b.title=o[2];b.setAttribute("aria-label",o[2]);
      if(o[1])b.setAttribute("aria-pressed","true");else{b.setAttribute("aria-disabled","true");b.addEventListener("click",function(e){e.preventDefault()})}
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
  /* ลิงก์จัดการประกาศ (เฉพาะ SHE/Admin): เห็นในเมนูเฟือง */
  (async function(){try{
    if(typeof getMyProfile!=="function"||!mgrBox)return;var p=await getMyProfile();
    if(p&&p.status==="active"&&["she","admin","super_admin"].indexOf(p.role)>-1){var l=el("a","tplink","ประกาศสำคัญ");l.href="admin-announcements.html";if((location.pathname.split("/").pop()||"")==="admin-announcements.html")l.setAttribute("aria-current","page");mgrBox.appendChild(l);mgrBox.hidden=false}
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
    if(window.SheTheme&&window.SheTheme.active()){p.appendChild(el("p","tpnote small","ธีมเทศกาล: "+window.SheTheme.active().label));
      var tb=el("button","tpbtn",window.SheTheme.isOff()?"เปิดธีมตกแต่ง":"ปิดธีมตกแต่ง");tb.type="button";tb.addEventListener("click",function(){window.SheTheme.setOff(!window.SheTheme.isOff())});p.appendChild(tb)}
    adminBox=el("div","tpadmin");adminBox.hidden=true;adminBox.appendChild(el("p","tpnote small","ผู้ดูแลระบบ"));p.appendChild(adminBox);mgrBox=el("div","tpadmin");mgrBox.hidden=true;mgrBox.appendChild(el("p","tpnote small","การจัดการเนื้อหา"));p.appendChild(mgrBox)});
  function apply(v){document.documentElement.style.fontSize=v==="l"?"112.5%":v==="xl"?"125%":""}
  try{apply(localStorage.getItem("she-fs")||"n")}catch(e){}
  document.addEventListener("click",function(e){if(open&&!open.pop.contains(e.target))close()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&open){var b=open.btn;close();b.focus()}});

  /* ไอคอนเมนู (inline SVG เส้นบาง) + Footer */
  var NAVIC={"index.html":"M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z","incident.html":"M12 3 2.5 20h19L12 3zM12 10v4.5M12 17.2v.1","checklist.html":"M5 4h14v16H5zM8.5 9l1.6 1.6L13 7.7M9 15h6","training.html":"M2.5 9.5 12 4.5l9.5 5-9.5 5zM6.5 12v4.5c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5V12","records.html":"M4 5h16v14H4zM4 10h16M9.5 10v9","admin-users.html":"M16 11a4 4 0 10-8 0M4 21a8 8 0 0116 0","admin-permissions.html":"M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5zM9 12l2 2 4-4","admin-master.html":"M4 6h16M4 12h16M4 18h10"};
  function decorateNav(){document.querySelectorAll("header nav a").forEach(function(a){
    if(a.querySelector("svg.ni"))return;var k=(a.getAttribute("href")||"").split("/").pop();var d=NAVIC[k];if(!d)return;
    var s=document.createElementNS(NS,"svg");s.setAttribute("class","ni");s.setAttribute("viewBox","0 0 24 24");s.setAttribute("aria-hidden","true");
    var p=document.createElementNS(NS,"path");p.setAttribute("d",d.replace(/(\d)\.500/g,"$1.5"));s.appendChild(p);a.insertBefore(s,a.firstChild)})}
  function relocate(){var n=document.querySelector("header nav");if(!n)return;
    var b=document.getElementById("role-badge");if(b&&b.parentNode!==tools)tools.insertBefore(b,tools.firstChild);
    var u=n.querySelector('a[href="#"],a[href="login.html"]');if(u&&u.parentNode!==tools){u.classList.add("userlink");tools.appendChild(u)}}
  /* เมนูหลักชุดเดียวกันทุกหน้า (ตามแบบ Stitch): หน้าแรก · รายงาน · เช็กลิสต์ · อบรม · ดูข้อมูล · Executive Dashboard (เร็ว ๆ นี้) · ผู้ดูแลระบบ (เฉพาะ Admin) */
  var ORDER=["index.html","incident.html","checklist.html","training.html","records.html"];
  var ADM=["admin-users.html","admin-master.html","admin-permissions.html","admin-themes.html"];var hasTh=false;
  var obs=null;
  function normalizeNav(){var n=document.querySelector("header nav");if(!n)return;if(obs)obs.disconnect();
    var f=(location.pathname.split("/").pop()||"index.html");var by={};
    document.querySelectorAll("header a").forEach(function(a){if(a.closest(".tpadmin"))return;var k=(a.getAttribute("href")||"").split("/").pop();if(n.contains(a)||ADM.indexOf(k)>-1)by[k]=by[k]||a});
    ORDER.forEach(function(k){if(by[k])n.appendChild(by[k])});
    var soon=n.querySelector(".navsoon");if(!soon){soon=el("span","navsoon","Executive Dashboard");soon.setAttribute("aria-disabled","true");soon.title="เร็ว ๆ นี้ (อยู่ในแผนพัฒนา)"}
    if(by["index.html"])n.appendChild(soon);
    if(by["admin-themes.html"])hasTh=true;if(hasTh){var st=document.querySelector("nav.subtabs");if(st&&!st.querySelector('a[href="admin-themes.html"]')){var ta=el("a",null,"ธีมเทศกาล");ta.href="admin-themes.html";if(f==="admin-themes.html")ta.setAttribute("aria-current","page");st.appendChild(ta)}}var isAdmin=!!(by[ADM[0]]||by[ADM[1]]||by[ADM[2]]);
    ADM.slice(1).forEach(function(k){if(by[k]&&by[k].parentNode)by[k].parentNode.removeChild(by[k])});
    if(adminBox){var labs={"admin-users.html":"จัดการผู้ใช้","admin-master.html":"ข้อมูลหลัก","admin-permissions.html":"สิทธิ์การใช้งาน","admin-themes.html":"ธีมเทศกาล"};
      adminBox.querySelectorAll("a").forEach(function(x){x.remove()});
      ADM.forEach(function(k){if(k==="admin-themes.html"?(by[k]||hasTh||f===k):(by[k]||isAdmin)){var l=el("a","tplink",labs[k]);l.href=k;if(k===f)l.setAttribute("aria-current","page");adminBox.appendChild(l)}});
      adminBox.hidden=!isAdmin}
    if(by[ADM[0]]){var a=by[ADM[0]];a.textContent="ผู้ดูแลระบบ";n.appendChild(a)}
    n.querySelectorAll("a").forEach(function(a){var k=(a.getAttribute("href")||"").split("/").pop();
      var cur=(k===f)||(ADM.indexOf(f)>-1&&k===ADM[0]);if(cur)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
    decorateNav();relocate();
    if(obs)obs.observe(document.querySelector("header"),{childList:true,subtree:true})}
  decorateNav();
  var nv=document.querySelector("header nav");if(nv){obs=new MutationObserver(normalizeNav);normalizeNav()}
  if(!document.querySelector(".sitefoot")){
    var f=el("footer","sitefoot"),l=el("span");var b=el("b",null,"SHE Portal");l.appendChild(b);l.appendChild(document.createTextNode(" · ระบบบันทึกข้อมูลความปลอดภัย อาชีวอนามัย และสิ่งแวดล้อม"));
    var r=el("span");var d=el("span","dot");d.setAttribute("aria-hidden","true");r.appendChild(d);r.appendChild(document.createTextNode("ระยะทดสอบ — ใช้ข้อมูลทดสอบเท่านั้น"));
    f.appendChild(l);f.appendChild(r);document.body.appendChild(f)}

  /* แถบเมนูย่อยของส่วนผู้ดูแล (ตามแบบ Stitch: Pending Users / Master Lists / Permissions) */
  (function(){var f=(location.pathname.split("/").pop()||"");var T=[["admin-users.html","ผู้ใช้รออนุมัติ"],["admin-master.html","ข้อมูลหลัก"],["admin-permissions.html","สิทธิ์การใช้งาน"]];if(hasTh||f==="admin-themes.html")T.push(["admin-themes.html","ธีมเทศกาล"]);
    if(!T.some(function(t){return t[0]===f}))return;var m=document.querySelector("main");if(!m)return;
    var n=el("nav","subtabs");n.setAttribute("aria-label","เมนูผู้ดูแลระบบ");
    T.forEach(function(t){var a=el("a",null,t[1]);a.href=t[0];if(t[0]===f)a.setAttribute("aria-current","page");n.appendChild(a)});m.insertBefore(n,m.firstChild)})();
  (function(){var f=(location.pathname.split("/").pop()||""),m=document.querySelector("main");
    if(m&&["checklist.html","training.html","reset.html"].indexOf(f)>-1&&!m.classList.contains("narrow")&&!m.classList.contains("authsplit"))m.classList.add("formcard")})();
  var h=document.querySelector("header");if(h)h.appendChild(tools);relocate();
})();
