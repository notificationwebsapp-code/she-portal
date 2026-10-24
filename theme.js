/* theme.js — ธีมตามเทศกาล/วันสำคัญ (v1: ตารางวันอยู่ในไฟล์นี้; v2 ในแผน: ย้ายไปตาราง Supabase ให้ Admin ตั้งเองบนเว็บ)
   วางเป็น <script src="theme.js"> ใน <head> ก่อน style-v4.css เพื่อให้สีเปลี่ยนก่อนวาดหน้า (ไม่กะพริบ)
   หลักการ: เวลา Asia/Bangkok (UTC+7) · วันที่เจาะจงชนะช่วงสั้น ชนะช่วงยาว · ไม่แตะสีสถานะ · ไม่มีภาพเคลื่อนไหว
   ทดสอบดูตัวอย่าง: เพิ่ม ?theme=halloween ท้าย URL (ค้างไว้ตลอด tab) · ?theme=none ปิด · ?theme=auto กลับไปตามวัน
   ผู้ใช้ปิดธีมเองได้จากเมนูเฟือง (เก็บในเบราว์เซอร์ของตน) */
(function () {
  "use strict";
  /* เพิ่มธีมใหม่: เพิ่มแถวในรายการ + ไฟล์ CSS ชื่อ theme-<id>.css
     from/to = [เดือน, วัน] (วนทุกปี; ถ้า from อยู่หลัง to ถือว่าข้ามปี) · ห้ามใส่วันที่ที่ไม่ได้ยืนยันกับแหล่งทางการ */
  /* รูปแบบข้อมูล (v2 จะอ่านรูปแบบเดียวกันนี้จากตาราง Supabase ที่ Super admin ตั้งค่า — ส่งเข้ามาทาง window.SHE_THEME_CONFIG)
     kind: "day" (วันเจาะจง) > "range" (ช่วงวันที่) > "month" (ทั้งเดือน, ใช้กับวันที่ไม่แน่นอน) — ระดับสูงชนะ; ระดับเดียวกันช่วงสั้นกว่าชนะ
     from/to = [เดือน, วัน] วนทุกปี (from อยู่หลัง to = ข้ามปี) · years = จำกัดเฉพาะปี ค.ศ. ที่ระบุ (วันที่ไม่แน่นอน) · enabled=false ปิดธีม
     label = ชื่อแสดงผล (วันที่ไม่ใช่สากลให้ต่อท้าย "(ไทย)") · ห้ามใส่วันที่ที่ไม่ได้ยืนยันกับแหล่งทางการ */
  var P = ["index.html", "login.html", ""];
  var THEMES = [
    { id: "newyear", kind: "range", from: [12, 31], to: [1, 2], label: "ปีใหม่ (สากล)", greet: "สวัสดีปีใหม่ — ขอให้ปลอดภัยตลอดปี", pages: P },
    { id: "valentine", kind: "day", from: [2, 14], to: [2, 14], label: "วันวาเลนไทน์ (สากล)", greet: "Happy Valentine's Day — ส่งความห่วงใยถึงเพื่อนร่วมงาน ขอให้ปลอดภัยทุกคน", pages: P },
    { id: "cny", kind: "month", from: [2, 1], to: [2, 28], years: [2026, 2027], label: "ตรุษจีน", greet: "สุขสันต์เทศกาลตรุษจีน — ขอให้สุขภาพแข็งแรงและปลอดภัย", pages: P },
    { id: "safetyday", kind: "day", from: [4, 28], to: [4, 28], label: "วัน Safety and Health at Work สากล (ILO)", greet: "วัน Safety and Health at Work สากล (ILO) — ความปลอดภัยเริ่มที่ทุกคน", pages: P },
    { id: "songkran", kind: "range", from: [4, 13], to: [4, 15], label: "สงกรานต์ (ไทย)", greet: "สุขสันต์วันสงกรานต์ (ไทย) — เล่นน้ำอย่างปลอดภัย", pages: P },
    { id: "labour", kind: "day", from: [5, 1], to: [5, 1], label: "วันแรงงานสากล", greet: "วันแรงงานสากล — ขอบคุณทุกคนที่ร่วมสร้างที่ทำงานปลอดภัย", pages: P },
    { id: "env", kind: "day", from: [6, 5], to: [6, 5], label: "วันสิ่งแวดล้อมโลก (สากล)", greet: "วันสิ่งแวดล้อมโลก (สากล) — ร่วมกันดูแลสิ่งแวดล้อม", pages: P },
    { id: "pride", kind: "month", from: [6, 1], to: [6, 30], label: "Pride Month (สากล)", greet: "Pride Month — ที่ทำงานปลอดภัยและเคารพทุกคน", pages: P },
    { id: "mother", kind: "day", from: [8, 12], to: [8, 12], label: "วันแม่แห่งชาติ (ไทย)", greet: "สุขสันต์วันแม่แห่งชาติ (ไทย)", pages: P },
    { id: "halloween", kind: "month", from: [10, 1], to: [10, 31], label: "Halloween (สากล)", greet: "Happy Halloween — ทำงานอย่างปลอดภัย กลับบ้านอย่างปลอดภัย", pages: P },
    { id: "loy", kind: "month", from: [11, 1], to: [11, 30], years: [2026, 2027], label: "ลอยกระทง (ไทย)", greet: "สุขสันต์เทศกาลลอยกระทง (ไทย)", pages: P },
    { id: "father", kind: "day", from: [12, 5], to: [12, 5], label: "วันพ่อแห่งชาติ (ไทย)", greet: "สุขสันต์วันพ่อแห่งชาติ (ไทย)", pages: P },
    { id: "christmas", kind: "range", from: [12, 20], to: [12, 26], label: "คริสต์มาส (สากล)", greet: "Merry Christmas — ขอให้ปลอดภัยและมีความสุขในช่วงเทศกาล", pages: P }
  ];
  if (window.SHE_THEME_CONFIG && window.SHE_THEME_CONFIG.length) THEMES = window.SHE_THEME_CONFIG;
  var TIER = { day: 1, range: 2, month: 3 };

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
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }
  function lget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  var q = (location.search.match(/[?&]theme=([a-z0-9_-]+)/i) || [])[1];
  if (q) sset("she-theme-preview", q === "auto" ? null : q);
  var pv = sget("she-theme-preview");
  var now = new Date(Date.now() + 7 * 3600 * 1000);
  var theme = pv === "none" ? null : pv ? byId(pv) : pick(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());
  var off = lget("she-theme-off") === "1";

  window.SheTheme = {
    active: function () { return theme; },
    isOff: function () { return off; },
    setOff: function (v) { off = !!v; lset("she-theme-off", off ? "1" : null); location.reload(); }
  };
  if (!theme || off) return;

  var root = document.documentElement;
  root.setAttribute("data-theme", theme.id);
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "theme-base.css";
  document.head.appendChild(l);
  l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "theme-" + theme.id + ".css";
  document.head.appendChild(l);

  /* แถบทักทาย: เฉพาะหน้าที่กำหนด (หน้ากรอกข้อมูลไม่แสดง เพื่อไม่รบกวนการกรอก) */
  function bar() {
    var f = location.pathname.split("/").pop() || "";
    if (theme.pages.indexOf(f) < 0 || document.querySelector(".themebar")) return;
    var b = document.createElement("div");
    b.className = "themebar";
    b.setAttribute("role", "note");
    var i1 = document.createElement("i"); i1.setAttribute("aria-hidden", "true");
    var t = document.createElement("span"); t.textContent = theme.greet;
    var i2 = document.createElement("i"); i2.setAttribute("aria-hidden", "true");
    var x = document.createElement("button"); x.type = "button"; x.textContent = "ปิดธีมตกแต่ง";
    x.setAttribute("aria-label", "ปิดธีมตกแต่งเทศกาล");
    x.addEventListener("click", function () { window.SheTheme.setOff(true); });
    b.appendChild(i1); b.appendChild(t); b.appendChild(i2); b.appendChild(x);
    document.body.insertBefore(b, document.body.firstChild);
  }
  if (document.body) bar(); else document.addEventListener("DOMContentLoaded", bar);
})();
