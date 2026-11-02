/* notice.js — ป๊อปอัปแจ้งข้อผิดพลาดกลางจอ (ใช้ร่วมทุกหน้า โหลดผ่าน shell-v4.js)
   เหตุผล: ข้อความ error ที่แสดงบนหัวหน้าเว็บอาจอยู่นอกจอเมื่อผู้ใช้เลื่อนลงมา ทำให้ไม่รู้ว่ามีอะไรผิด
   วิธีทำ: เฝ้าดู #msg (class error) และ .errtxt ในฟอร์ม แล้วเด้ง <dialog> modal ให้กด "เข้าใจแล้ว"
   - ข้อความสำเร็จ (ok) ไม่เด้ง · ใช้ textContent เท่านั้น (OWASP A03) · โฟกัสที่ปุ่ม + role=alertdialog (WCAG 2.2: 4.1.3, 2.4.3) */
(function () {
  "use strict";
  var dlg = null, last = "", lastAt = 0;
  function build() {
    dlg = document.createElement("dialog");
    dlg.setAttribute("role", "alertdialog");
    dlg.setAttribute("aria-labelledby", "sn-t");
    dlg.setAttribute("aria-describedby", "sn-m");
    dlg.style.cssText = "max-width:min(520px,92vw);width:100%;border:2px solid #DC2626;border-radius:12px;padding:0;box-shadow:0 12px 40px rgba(11,59,96,.35);font-family:inherit";
    var box = document.createElement("div"); box.style.cssText = "padding:1.25rem 1.25rem 1rem";
    var t = document.createElement("h3"); t.id = "sn-t"; t.style.cssText = "margin:0 0 .6rem;color:#991B1B;font-size:1.15rem;display:flex;gap:.5rem;align-items:center";
    t.textContent = "⚠ ไม่สามารถดำเนินการได้";
    var m = document.createElement("p"); m.id = "sn-m"; m.style.cssText = "margin:0 0 1.1rem;color:#0B3B60;font-size:1.02rem;line-height:1.55;white-space:pre-line";
    var b = document.createElement("button"); b.type = "button"; b.id = "sn-ok"; b.textContent = "เข้าใจแล้ว";
    b.style.cssText = "min-height:48px;min-width:140px;padding:.6rem 1.4rem;background:#005A9C;color:#fff;border:2px solid #0B3B60;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer";
    b.addEventListener("click", function () { dlg.close(); });
    var row = document.createElement("div"); row.style.cssText = "display:flex;justify-content:flex-end";
    row.appendChild(b); box.append(t, m, row); dlg.appendChild(box);
    dlg.addEventListener("close", function () { if (dlg.returnTo && dlg.returnTo.focus) { try { dlg.returnTo.focus(); } catch (e) {} } });
    document.body.appendChild(dlg);
  }
  function show(text) {
    text = String(text || "").trim();
    if (!text) return;
    var now = Date.now();
    if (text === last && now - lastAt < 1500) return;      // กันเด้งซ้ำจากการเปลี่ยน attribute หลายครั้ง
    last = text; lastAt = now;
    if (!dlg) build();
    dlg.returnTo = document.activeElement;
    var m = dlg.querySelector("#sn-m"); m.textContent = text;
    if (!dlg.open) dlg.showModal();
    dlg.querySelector("#sn-ok").focus();
  }
  function check(el) {
    if (!el || !el.classList) return;
    var txt = (el.textContent || "").trim();
    if (!txt || el.hidden) return;
    if (el.id === "msg") { if (el.classList.contains("error") || el.classList.contains("err")) show(txt); return; }
    if (el.classList.contains("errtxt")) show(txt);
  }
  function start() {
    var msg = document.getElementById("msg");
    var obs = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        var el = m.target.nodeType === 3 ? m.target.parentElement : m.target;
        if (el && el.closest) { var c = el.closest("#msg, .errtxt"); if (c) check(c); }
        if (m.type === "childList") m.addedNodes.forEach(function (n) { if (n.nodeType === 1 && n.classList && n.classList.contains("errtxt")) check(n); });
      });
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "hidden"] });
    window.SheNotice = { show: show };
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
