/* i18n.js — ตัวสลับภาษา ไทย / English (ออกแบบให้เพิ่มภาษาอื่นได้ภายหลัง เช่น မြန်မာ)
   หลักการ (ข้อ 20): ภาษาไทยคือต้นฉบับ — ถ้า lang = th สคริปต์นี้ "ไม่ทำอะไรเลย" (ไม่กระทบผู้ใช้เดิม)
   ถ้า lang = en: โหลดพจนานุกรม i18n-en.js แล้วแปลข้อความไทยที่ปรากฏใน DOM / ข้อความใน confirm-alert / รูปแบบวันที่-ตัวเลข
   - ข้อความที่ไม่มีในพจนานุกรมจะแสดงเป็นภาษาไทยตามเดิม (fail-safe) และถูกบันทึกใน I18N.missing (เปิดดูด้วย ?i18n=debug)
   - พจนานุกรม 2 แบบ: ตรงทั้งข้อความ  "หน้าแรก": "Home"   และแม่แบบ  "ออกจากระบบ ({0})": "Sign out ({0})"
   - ห้ามใส่ข้อมูลที่ผู้ใช้พิมพ์เอง (ข้อความอิสระ) ในพจนานุกรม; ครอบด้วย data-no-i18n เพื่อไม่ให้แปล
   - ใช้ DOM + textContent เท่านั้น ไม่ใช้ innerHTML (OWASP A03) */
(function () {
  "use strict";
  var LS = "she_lang";
  var SUPPORTED = { th: 1, en: 1 };
  var TH = /[฀-๿]/;

  function readLang() {
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q && SUPPORTED[q]) { localStorage.setItem(LS, q); return q; }
      var v = localStorage.getItem(LS);
      return SUPPORTED[v] ? v : "th";
    } catch (e) { return "th"; }
  }

  var lang = readLang();
  var norm = function (s) { return String(s).replace(/\s+/g, " ").trim(); };
  var I18N = (window.I18N = {
    lang: lang,
    dict: Object.create(null),
    pats: [],
    missing: Object.create(null),
    add: function (map) {
      for (var k in map) {
        if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
        var key = norm(k);
        if (/\{\d\}/.test(key)) I18N.pats.push({ key: key, out: map[k], re: null });
        else I18N.dict[key] = map[k];
      }
      I18N.cache = Object.create(null); fragRe = null;
    },
    cache: Object.create(null),
    /* t(): ใช้ในโค้ดที่สร้างข้อความเอง (เช่น หัวไฟล์ Export) — th = คืนค่าเดิม */
    t: function (s) { return s; },
    set: function (l) {
      if (!SUPPORTED[l]) return;
      try { localStorage.setItem(LS, l); } catch (e) {}
      location.reload();
    },
    locale: function () { return lang === "en" ? "en-GB" : "th-TH"; },
    report: function () { return Object.keys(I18N.missing); }
  });

  document.documentElement.setAttribute("lang", lang);
  if (lang === "th") return; /* ไทย = ไม่แปลง ไม่แตะอะไร */

  /* ---------- EN mode ---------- */

  /* 1) รูปแบบวันที่/ตัวเลข: เปลี่ยน th-TH → en-GB (ไม่ใช้ปี พ.ศ./ชื่อเดือนไทย) */
  function mapLocale(l) {
    if (Array.isArray(l)) l = l[0];
    return typeof l === "string" && l.indexOf("th") === 0 ? "en-GB" : l;
  }
  ["toLocaleString", "toLocaleDateString", "toLocaleTimeString"].forEach(function (n) {
    var o = Date.prototype[n];
    Date.prototype[n] = function (l, opt) { return o.call(this, mapLocale(l), opt); };
  });
  var oNum = Number.prototype.toLocaleString;
  Number.prototype.toLocaleString = function (l, opt) { return oNum.call(this, mapLocale(l), opt); };
  if (window.Intl && Intl.DisplayNames) {
    var OD = Intl.DisplayNames;
    var ND = function (l, o) { return new OD(Array.isArray(l) && l[0] === "th" ? ["en"] : l, o); };
    ND.prototype = OD.prototype;
    ND.supportedLocalesOf = OD.supportedLocalesOf;
    Intl.DisplayNames = ND;
  }

  /* 2) โหลดพจนานุกรม (เฉพาะโหมด EN) — เขียนแบบ synchronous ใน <head> เพื่อให้พร้อมก่อนแปลหน้า */
  var dictReady = false;
  try {
    if (document.readyState === "loading") {
      document.write('<script src="i18n-en.js"><\/script>');
      dictReady = true;
    }
  } catch (e) {}
  if (!dictReady) {
    var s = document.createElement("script");
    s.src = "i18n-en.js";
    s.onload = function () { applyTree(document.documentElement); };
    document.head.appendChild(s);
  }

  /* 3) ตัวแปล */
  function compile(p) {
    if (p.re) return p.re;
    var esc = p.key.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{\d\}/g, "(.+?)");
    p.re = new RegExp("^" + esc + "$");
    return p.re;
  }
  function translate(core, depth) {
    if (!core) return null;
    var key = norm(core);
    if (Object.prototype.hasOwnProperty.call(I18N.cache, key)) return I18N.cache[key];
    var out = null;
    if (Object.prototype.hasOwnProperty.call(I18N.dict, key)) out = I18N.dict[key];
    else if (!depth) {
      var pats = I18N.pats;
      for (var i = 0; i < pats.length; i++) {
        var m = compile(pats[i]).exec(key);
        if (m) {
          var caps = m.slice(1);
          out = pats[i].out.replace(/\{(\d)\}/g, function (_, n) {
            var c = caps[+n];
            if (c == null) return "";
            var tc = TH.test(c) ? translate(c, 1) : null;
            return tc != null ? tc : c;
          });
          break;
        }
      }
    }
    /* ป้ายสองภาษาจากฐานข้อมูลรูปแบบ "ไทย / English" → แสดงเฉพาะส่วนอังกฤษ */
    if (out == null && !depth) {
      var si = key.lastIndexOf(" / ");
      if (si > 0) {
        var L = key.slice(0, si), R = key.slice(si + 3);
        if (TH.test(L) && R && !TH.test(R)) out = R;
      }
    }
    if (out == null && !depth) out = fragments(key);
    I18N.cache[key] = out;
    return out;
  }
  /* fallback: ข้อความที่ต่อสตริงกับข้อมูลแบบไดนามิก — แทนที่เฉพาะวลีที่ตรงกับพจนานุกรม (ยาวสุดก่อน, ภาษาไทย >= 3 ตัวอักษร)
     ส่วนที่ไม่รู้จัก (เช่น ชื่อ/ข้อมูลที่ผู้ใช้พิมพ์) คงเดิมไม่ถูกแตะ */
  var fragRe = null, fragMap = null;
  function fragments(key) {
    if (!fragRe) {
      fragMap = Object.create(null);
      var ks = [];
      for (var k in I18N.dict) {
        var tk = k.replace(/^["'\s]+|\s+$/g, "");
        var n = (tk.match(/[\u0E00-\u0E7F]/g) || []).length;
        if (n >= 3 && !fragMap[tk]) { fragMap[tk] = I18N.dict[k]; ks.push(tk); }
      }
      ks.sort(function (a, b) { return b.length - a.length; });
      if (!ks.length) return null;
      /* ขอบเขตคำ: ถ้าวลีขึ้นต้น/ลงท้ายด้วยอักษรไทย ต้องไม่ติดกับอักษรไทยอื่น (กันแทนที่กลางคำในข้อความผู้ใช้) */
      var THR = "[\\u0E00-\\u0E7F]";
      fragRe = new RegExp(ks.map(function (x) {
        var e = x.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");
        if (new RegExp("^" + THR).test(x)) e = "(?<!" + THR + ")" + e;
        if (new RegExp(THR + "$").test(x)) e = e + "(?!" + THR + ")";
        return e;
      }).join("|"), "g");
    }
    var hit = false;
    var r = key.replace(fragRe, function (m, off, str) {
      hit = true;
      var e = fragMap[m];
      var pre = off > 0 && /[A-Za-z0-9]/.test(str.charAt(off - 1)) ? " " : "";
      var post = /[A-Za-z0-9]/.test(str.charAt(off + m.length)) ? " " : "";
      return pre + e + post;
    });
    return hit ? r.replace(/ {2,}/g, " ") : null;
  }
  I18N.t = function (s) {
    if (typeof s !== "string" || !TH.test(s)) return s;
    var r = translate(s);
    return r != null ? r : s;
  };

  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, CODE: 1 };
  var ATTRS = ["placeholder", "title", "aria-label", "alt"];

  function textNode(n) {
    var v = n.nodeValue;
    if (!v || !TH.test(v)) return;
    var lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
    var core = v.slice(lead.length, v.length - trail.length);
    var r = translate(core);
    if (r != null) n.nodeValue = lead + r + trail;
    else I18N.missing[norm(core)] = 1;
  }
  function attrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute && el.getAttribute(a);
      if (v && TH.test(v)) {
        var r = translate(v);
        if (r != null) el.setAttribute(a, r); else I18N.missing[norm(v)] = 1;
      }
    }
    if (el.tagName === "INPUT" && /^(submit|button|reset)$/.test(el.type)) {
      var vv = el.getAttribute("value");
      if (vv && TH.test(vv)) { var rr = translate(vv); if (rr != null) el.setAttribute("value", rr); else I18N.missing[norm(vv)] = 1; }
    }
  }
  function skipEl(el) {
    return !el || SKIP[el.tagName] === 1 || (el.hasAttribute && el.hasAttribute("data-no-i18n"));
  }
  function applyTree(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      var p = root.parentNode;
      if (p && p.closest && p.closest("[data-no-i18n]")) return;
      if (p && SKIP[p.tagName] === 1) return;
      textNode(root); return;
    }
    if (root.nodeType !== 1) return;
    if (root.closest && root.closest("[data-no-i18n]")) return;
    if (root.hasAttribute && root.hasAttribute("data-no-i18n")) return;
    attrs(root); /* TEXTAREA: แปล placeholder ได้ แต่ไม่แตะเนื้อหาที่ผู้ใช้พิมพ์ */
    if (SKIP[root.tagName] === 1) return;
    for (var c = root.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) textNode(c);
      else if (c.nodeType === 1 && !skipEl(c)) applyTree(c);
    }
  }

  /* 4) confirm / alert / prompt (ข้อความไม่อยู่ใน DOM) */
  ["confirm", "alert", "prompt"].forEach(function (n) {
    var o = window[n];
    if (typeof o !== "function") return;
    window[n] = function (msg, d) { return o.call(window, I18N.t(String(msg == null ? "" : msg)), d); };
  });

  /* 5) เฝ้าดู DOM ที่ถูกสร้าง/แก้ภายหลัง (ข้อความที่สร้างด้วย JS) */
  var obs = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var m = muts[i];
      if (m.type === "childList") {
        for (var j = 0; j < m.addedNodes.length; j++) applyTree(m.addedNodes[j]);
      } else if (m.type === "characterData") {
        applyTree(m.target);
      } else if (m.type === "attributes") {
        if (!(m.target.hasAttribute && m.target.hasAttribute("data-no-i18n")) && !(m.target.closest && m.target.closest("[data-no-i18n]")) && !(m.target.tagName === "SCRIPT" || m.target.tagName === "STYLE")) attrs(m.target);
      }
    }
  });
  obs.observe(document.documentElement, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ATTRS.concat(["value"])
  });
  document.addEventListener("DOMContentLoaded", function () {
    applyTree(document.documentElement);
    if (/[?&]i18n=debug/.test(location.search)) {
      setTimeout(function () {
        var list = I18N.report();
        console.info("[i18n] ยังไม่มีคำแปล " + list.length + " รายการ", list);
      }, 3000);
    }
  });
})();
