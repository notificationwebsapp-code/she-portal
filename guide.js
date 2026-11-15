/* guide.js — กล่อง "คู่มือสำหรับผู้ใช้ใหม่" ใช้ร่วมทุกหน้า (กฎ: ทุกหน้าต้องมีคำอธิบาย ขั้นตอน คำศัพท์ ตัวอย่าง)
   ข้อมูลของแต่ละหน้าอยู่ใน guide-data.js (window.SHE_GUIDE) รูปแบบข้อความคือ [ไทย, English]
   ความปลอดภัย: สร้างทุกองค์ประกอบด้วย textContent เท่านั้น (OWASP A03) ไม่มี innerHTML
   หน้านี้ไม่แตะข้อมูลในฐานข้อมูล ไม่มีสิทธิ์/RLS เพิ่ม */
(function () {
  "use strict";
  var page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "");
  var G = window.SHE_GUIDE && window.SHE_GUIDE[page];
  if (!G) return;
  var en = !!(window.I18N && window.I18N.lang === "en") || document.documentElement.getAttribute("lang") === "en";
  function t(x) { return Array.isArray(x) ? (en ? x[1] : x[0]) : (x || ""); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var KEY = "she_guide_closed_" + page;
  function getClosed() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function setClosed(v) { try { v ? localStorage.setItem(KEY, "1") : localStorage.removeItem(KEY); } catch (e) { /* ใช้ไม่ได้ก็ไม่เป็นไร */ } }

  var css = ".guide{background:#F4F7FF;border:1px solid #C9D5F5;border-radius:18px;padding:.9rem 1.1rem;margin:.9rem 0}" +
    ".guide summary{cursor:pointer;font-weight:700;color:var(--navy,#1F3A8A)}" +
    ".guide h4{margin:.9rem 0 .3rem;color:var(--navy,#1F3A8A)}" +
    ".guide p{margin:.3rem 0}.guide ul,.guide ol{margin:.3rem 0 .3rem 1.2rem;padding:0}.guide li{margin:.2rem 0}" +
    ".guide dl{margin:.3rem 0}.guide dt{font-weight:700;margin-top:.5rem}.guide dd{margin:.1rem 0 0 0}" +
    ".guide .gwarn{background:#FFFBEB;border:1px solid #F3E2A9;border-radius:14px;padding:.6rem .8rem;margin:.6rem 0}" +
    ".guide .gex{background:#fff;border:1px dashed #9DB0E6;border-radius:14px;padding:.6rem .8rem;margin:.6rem 0}" +
    ".guide .gtag{display:inline-block;font-size:.8rem;font-weight:700;background:#E5ECFF;color:#1F3A8A;border-radius:999px;padding:.05rem .6rem;margin-right:.4rem}" +
    ".fhelp{display:block;font-weight:400;font-size:.85rem;color:#4B5563;margin-top:.15rem}";
  var st = el("style", null, css); document.head.appendChild(st);

  function build() {
    var d = el("details", "guide"); d.setAttribute("data-no-i18n", "");
    if (!getClosed()) d.open = true;
    d.addEventListener("toggle", function () { setClosed(!d.open); });
    d.appendChild(el("summary", null, en ? "New here? Read this first (what this page is for, steps, terms, example)" : "มือใหม่? อ่านก่อน (หน้านี้ไว้ทำอะไร / ขั้นตอน / คำศัพท์ / ตัวอย่าง)"));
    function sec(h, node) { d.appendChild(el("h4", null, h)); d.appendChild(node); }
    if (G.purpose) sec(en ? "What this page is for" : "หน้านี้ใช้ทำอะไร", el("p", null, t(G.purpose)));
    if (G.who) sec(en ? "Who can use it" : "ใครใช้ได้", el("p", null, t(G.who)));
    if (G.ifnot) { var w = el("div", "gwarn"); w.appendChild(el("b", null, en ? "If this is not done: " : "ถ้าไม่ทำ/ไม่ตั้งค่า: ")); w.appendChild(document.createTextNode(t(G.ifnot))); d.appendChild(w); }
    if (G.steps && G.steps.length) { var ol = el("ol"); G.steps.forEach(function (s) { ol.appendChild(el("li", null, t(s))); }); sec(en ? "Step by step" : "ขั้นตอน", ol); }
    if (G.glossary && G.glossary.length) { var dl = el("dl"); G.glossary.forEach(function (g) { dl.appendChild(el("dt", null, t(g[0]))); dl.appendChild(el("dd", null, t(g[1]))); }); sec(en ? "Terms used on this page" : "คำศัพท์ในหน้านี้", dl); }
    if (G.example) { var ex = el("div", "gex"); ex.appendChild(el("span", "gtag", en ? "EXAMPLE" : "ตัวอย่าง")); ex.appendChild(document.createTextNode(t(G.example))); d.appendChild(ex); }
    if (G.std) d.appendChild(el("p", null, (en ? "Reference: " : "อ้างอิง: ") + t(G.std)));
    return d;
  }

  function addFieldHelp() {
    var f = G.fields || {};
    Object.keys(f).forEach(function (id) {
      var input = document.getElementById(id); if (!input) return;
      var host = input.closest("label") || input.parentNode;
      if (host.querySelector(".fhelp")) return;
      var s = el("span", "fhelp", t(f[id]));
      if (host.tagName === "LABEL") host.appendChild(s); else host.appendChild(s);
    });
  }

  function mount() {
    if (document.getElementById("she-guide")) return;
    var d = build(); d.id = "she-guide";
    var anchor = document.getElementById("msg");
    var host = anchor && anchor.parentNode;
    if (!host) host = document.getElementById("area") || document.getElementById("adminarea") || document.querySelector("main");
    if (!host) return;
    if (anchor && anchor.parentNode === host) host.insertBefore(d, anchor); else host.insertBefore(d, host.firstChild);
    addFieldHelp(); setTimeout(addFieldHelp, 1500); setTimeout(addFieldHelp, 4000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
