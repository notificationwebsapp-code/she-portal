/* theme.js — ธีมตามเทศกาล/วันสำคัญ
   ที่มาของข้อมูล: (1) ตาราง Supabase theme_settings ที่ Super admin ตั้งค่าได้ที่หน้า admin-themes.html (B16)
                   (2) แคชในเบราว์เซอร์ (ใช้ทันทีตอนเปิดหน้า เพื่อไม่ให้กะพริบ) (3) ค่าเริ่มต้นในไฟล์นี้ (ใช้เมื่ออ่านฐานข้อมูลไม่ได้)
   วางเป็น <script src="theme.js"> ใน <head> ก่อน style-v4.css · เวลา Asia/Bangkok (UTC+7) · ไม่แตะสีสถานะ · ไม่มีภาพเคลื่อนไหว
   ทดสอบดูตัวอย่าง: เพิ่ม ?theme=<id> ท้าย URL (ค้างไว้ตลอด tab) · ?theme=none ปิด · ?theme=auto กลับไปตามวัน
   ผู้ใช้ปิดธีมเองได้จากเมนูเฟือง (เก็บในเบราว์เซอร์ของตน) */
(function () {
  "use strict";
  /* รูปแบบข้อมูล: kind "day" (วันเจาะจง) > "range" (ช่วงวันที่) > "month" (ทั้งเดือน, ใช้กับวันที่ไม่แน่นอน) — ระดับสูงชนะ; ระดับเดียวกันช่วงสั้นกว่าชนะ
     from/to = [เดือน, วัน] วนทุกปี (from อยู่หลัง to = ข้ามปี) · years = จำกัดเฉพาะปี ค.ศ. · enabled=false ปิดธีม
     label = ชื่อแสดงผล (วันที่ไม่ใช่สากลต่อท้าย "(ไทย)") · ห้ามใส่วันที่ที่ไม่ได้ยืนยันกับแหล่งทางการ */
  var P = ["index.html", "login.html", ""];
  var DEFAULTS = [
    { id: "newyear", kind: "range", from: [12, 31], to: [1, 2], label: "ปีใหม่ (สากล)", greet: "สวัสดีปีใหม่ — ขอให้ปลอดภัยตลอดปี" },
    { id: "valentine", kind: "day", from: [2, 14], to: [2, 14], label: "วันวาเลนไทน์ (สากล)", greet: "Happy Valentine's Day — ส่งความห่วงใยถึงเพื่อนร่วมงาน ขอให้ปลอดภัยทุกคน" },
    { id: "cny", kind: "month", from: [2, 1], to: [2, 29], years: [2026, 2027], label: "ตรุษจีน", greet: "สุขสันต์เทศกาลตรุษจีน — ขอให้สุขภาพแข็งแรงและปลอดภัย" },
    { id: "safetyday", kind: "day", from: [4, 28], to: [4, 28], label: "วัน Safety and Health at Work สากล (ILO)", greet: "วัน Safety and Health at Work สากล (ILO) — ความปลอดภัยเริ่มที่ทุกคน" },
    { id: "songkran", kind: "range", from: [4, 13], to: [4, 15], label: "สงกรานต์ (ไทย)", greet: "สุขสันต์วันสงกรานต์ (ไทย) — เล่นน้ำอย่างปลอดภัย" },
    { id: "labour", kind: "day", from: [5, 1], to: [5, 1], label: "วันแรงงานสากล", greet: "วันแรงงานสากล — ขอบคุณทุกคนที่ร่วมสร้างที่ทำงานปลอดภัย" },
    { id: "env", kind: "day", from: [6, 5], to: [6, 5], label: "วันสิ่งแวดล้อมโลก (สากล)", greet: "วันสิ่งแวดล้อมโลก (สากล) — ร่วมกันดูแลสิ่งแวดล้อม" },
    { id: "pride", kind: "month", from: [6, 1], to: [6, 30], label: "Pride Month (สากล)", greet: "Pride Month — ที่ทำงานปลอดภัยและเคารพทุกคน" },
    { id: "mother", kind: "day", from: [8, 12], to: [8, 12], label: "วันแม่แห่งชาติ (ไทย)", greet: "สุขสันต์วันแม่แห่งชาติ (ไทย)" },
    { id: "halloween", kind: "month", from: [10, 1], to: [10, 31], label: "Halloween (สากล)", greet: "Happy Halloween — ทำงานอย่างปลอดภัย กลับบ้านอย่างปลอดภัย" },
    { id: "loy", kind: "month", from: [11, 1], to: [11, 30], years: [2026, 2027], label: "ลอยกระทง (ไทย)", greet: "สุขสันต์เทศกาลลอยกระทง (ไทย)" },
    { id: "father", kind: "day", from: [12, 5], to: [12, 5], label: "วันพ่อแห่งชาติ (ไทย)", greet: "สุขสันต์วันพ่อแห่งชาติ (ไทย)" },
    { id: "christmas", kind: "range", from: [12, 20], to: [12, 26], label: "คริสต์มาส (สากล)", greet: "Merry Christmas — ขอให้ปลอดภัยและมีความสุขในช่วงเทศกาล" }
  ];
  var CACHE_KEY = "she-theme-cfg";
  var TIER = { day: 1, range: 2, month: 3 };
  var ID_RE = /^[a-z0-9_]{2,30}$/;
  var BAR_PAGES = ["index.html", "login.html", ""];   // แถบทักทายแสดงเฉพาะหน้าแรกและ Login

  function lget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }

  /* แปลงแถวจากฐานข้อมูล/แคชเป็นรูปแบบภายใน (ตรวจรูปแบบก่อนใช้; ข้อความใช้ผ่าน textContent เท่านั้น) */
  function fromRows(rows) {
    var out = [];
    (Array.isArray(rows) ? rows : []).forEach(function (r) {
      if (!r || !ID_RE.test(String(r.id)) || !TIER[r.kind]) return;
      var nums = [r.from_month, r.from_day, r.to_month, r.to_day];
      for (var i = 0; i < 4; i++) if (typeof nums[i] !== "number") return;
      out.push({
        id: r.id, kind: r.kind, from: [r.from_month, r.from_day], to: [r.to_month, r.to_day],
        years: Array.isArray(r.years) && r.years.length ? r.years : null,
        enabled: r.enabled !== false, label: String(r.label || r.id), greet: String(r.greeting || "")
      });
    });
    return out;
  }
  var THEMES = DEFAULTS;
  try { var f0 = fromRows(JSON.parse(lget(CACHE_KEY) || "null")); if (f0.length) THEMES = f0; } catch (e) {}
  var FIXED = !!(window.SHE_THEME_CONFIG && window.SHE_THEME_CONFIG.length);
  if (FIXED) THEMES = window.SHE_THEME_CONFIG;

  function pick(y, m, d) {
    var best = null, bt = 9, bs = 1e9;
    THEMES.forEach(function (t) {
      if (t.enabled === false) return;
      if (t.years && t.years.indexOf(y) < 0) return;
      var a = t.from[0] * 100 + t.from[1], b = t.to[0] * 100 + t.to[1], x = m * 100 + d;
      var inside = a <= b ? x >= a && x <= b : x >= a || x <= b;
      if (!inside) return;
      var span = a <= b ? b - a : 1200 - a + b, tier = TIER[t.kind] || 2;
      if (tier < bt || (tier === bt && span < bs)) { best = t; bt = tier; bs = span; }
    });
    return best;
  }
  function byId(id) { for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i]; return null; }
  function evaluate() {
    var q = sget("she-theme-preview");
    var now = new Date(Date.now() + 7 * 3600 * 1000);
    return q === "none" ? null : q ? byId(q) : pick(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());
  }

  var qs = (location.search.match(/[?&]theme=([a-z0-9_-]+)/i) || [])[1];
  if (qs) sset("she-theme-preview", qs === "auto" ? null : qs);
  var theme = evaluate();
  var off = lget("she-theme-off") === "1";

  window.SheTheme = {
    active: function () { return theme; },
    isOff: function () { return off; },
    setOff: function (v) { off = !!v; lset("she-theme-off", off ? "1" : null); location.reload(); },
    defaults: function () { return JSON.parse(JSON.stringify(DEFAULTS)); },
    /* หน้า Admin เรียกหลังบันทึก เพื่ออัปเดตแคชของเบราว์เซอร์นี้ทันที */
    refresh: function () { return fetchConfig(); }
  };

  var applied = null;
  function unapply() {
    document.documentElement.removeAttribute("data-theme");
    var ls = document.querySelectorAll("link.she-theme-css");
    for (var i = 0; i < ls.length; i++) ls[i].parentNode.removeChild(ls[i]);
    var b = document.querySelector(".themebar"); if (b && b.parentNode) b.parentNode.removeChild(b);
    applied = null;
  }
  function bar(t) {
    var f = location.pathname.split("/").pop() || "";
    if (BAR_PAGES.indexOf(f) < 0 || document.querySelector(".themebar") || !document.body) return;
    var b = document.createElement("div");
    b.className = "themebar";
    b.setAttribute("role", "note");
    var i1 = document.createElement("i"); i1.setAttribute("aria-hidden", "true");
    var s = document.createElement("span"); s.textContent = t.greet;
    var i2 = document.createElement("i"); i2.setAttribute("aria-hidden", "true");
    var x = document.createElement("button"); x.type = "button"; x.textContent = "ปิดธีมตกแต่ง";
    x.setAttribute("aria-label", "ปิดธีมตกแต่งเทศกาล");
    x.addEventListener("click", function () { window.SheTheme.setOff(true); });
    b.appendChild(i1); b.appendChild(s); b.appendChild(i2); b.appendChild(x);
    document.body.insertBefore(b, document.body.firstChild);
  }
  function apply(t) {
    if (applied === t.id) return;
    if (applied) unapply();
    applied = t.id;
    document.documentElement.setAttribute("data-theme", t.id);
    ["theme-base.css", "theme-" + t.id + ".css"].forEach(function (h) {
      var l = document.createElement("link");
      l.rel = "stylesheet"; l.href = h; l.className = "she-theme-css";
      document.head.appendChild(l);
    });
    if (document.body) bar(t); else document.addEventListener("DOMContentLoaded", function () { if (applied === t.id) bar(t); });
  }
  function sync() {
    theme = evaluate();
    if (off || !theme) { if (applied) unapply(); return; }
    if (applied !== theme.id) apply(theme);
  }
  sync();

  /* อ่านค่าล่าสุดจากฐานข้อมูล (ทุกคนอ่านได้ รวมหน้า Login) แล้วอัปเดตแคช/หน้าจอ; ถ้าอ่านไม่ได้ใช้ค่าเดิมต่อ (fail-safe) */
  function fetchConfig() {
    if (typeof sb === "undefined") return Promise.resolve(false);
    return sb.from("theme_settings").select("id,label,greeting,kind,from_month,from_day,to_month,to_day,years,enabled")
      .then(function (r) {
        if (r.error || !r.data || !r.data.length) return false;
        var f = fromRows(r.data); if (!f.length) return false;
        lset(CACHE_KEY, JSON.stringify(r.data));
        if (!FIXED) THEMES = f;
        sync();
        return true;
      }, function () { return false; });
  }
  function start() {
    var tries = 0;
    (function wait() {
      if (typeof sb !== "undefined") { fetchConfig(); return; }
      if (++tries < 60) setTimeout(wait, 100);
    })();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
