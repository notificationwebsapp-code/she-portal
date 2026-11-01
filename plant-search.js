/* plant-search.js — เพิ่มช่อง "พิมพ์ค้นหา" ให้ dropdown Plant ทุกหน้า (โหลดจาก shell-v4.js)
 * ทำไมทำแบบนี้: หน้าเดิมอ่านค่าจาก <select> (select.value / change event) อยู่แล้ว
 *   จึงคง <select> เป็นแหล่งความจริงเดียว แล้วแค่กรองรายการ option ตามที่พิมพ์ -> ไม่ต้องแก้โค้ดแต่ละหน้า
 * เงื่อนไข: select ที่ id มีคำว่า "plant" และมีตัวเลือกจริง >= 8 รายการ (ถ้าน้อยกว่านั้นไม่แสดงช่องค้นหา)
 * ความปลอดภัย: ใช้ textContent/DOM เท่านั้น ไม่แตะข้อมูลที่เซิร์ฟเวอร์; สิทธิ์ Plant ยังคุมที่ RLS (OWASP A01)
 * การเข้าถึง: ช่องมี aria-label, กด Enter เลือกรายการแรกที่ตรง, Esc ล้างคำค้น, ปุ่มสูง >= 44px (WCAG 2.2 SC 2.5.8) */
(function () {
  "use strict";
  var MIN = 8;
  function norm(s) { return String(s || "").toLowerCase(); }
  function isPlantSelect(el) {
    return el && el.tagName === "SELECT" && !el.multiple && /plant/i.test(el.id || "");
  }

  function enhance(sel) {
    if (sel._ps) return;
    var st = (sel._ps = { all: [], busy: false });
    var inp = document.createElement("input");
    inp.type = "search";
    inp.setAttribute("placeholder", "พิมพ์ค้นหา Plant (รหัสหรือชื่อ)");
    inp.setAttribute("aria-label", "ค้นหา Plant");
    inp.setAttribute("autocomplete", "off");
    inp.hidden = true;
    inp.style.cssText = "display:block;width:100%;box-sizing:border-box;min-height:44px;margin:.25rem 0 .35rem;padding:.4rem .6rem;font:inherit;border-radius:8px;border:1px solid #c8d0e0";
    sel.parentNode.insertBefore(inp, sel);

    function snapshot() {
      st.all = Array.prototype.map.call(sel.options, function (o) {
        return { value: o.value, text: o.textContent, disabled: o.disabled };
      });
      var real = st.all.filter(function (o) { return o.value !== ""; }).length;
      inp.hidden = real < MIN;
    }
    function render(q) {
      var cur = sel.value, toks = norm(q).split(/\s+/).filter(Boolean);
      var rows = st.all.filter(function (o) {
        if (o.value === "" || o.value === cur) return true;
        var t = norm(o.text);
        return toks.every(function (k) { return t.indexOf(k) !== -1; });
      });
      st.busy = true;
      sel.replaceChildren();
      rows.forEach(function (o) {
        var op = document.createElement("option");
        op.value = o.value; op.textContent = o.text; op.disabled = o.disabled;
        sel.appendChild(op);
      });
      sel.value = cur;
      obs.takeRecords(); /* ทิ้งการเปลี่ยนแปลงที่เราสร้างเอง (observer ทำงานแบบ async จึงใช้ busy อย่างเดียวไม่พอ) */
      st.busy = false;
    }
    function reset() { inp.value = ""; render(""); }

    inp.addEventListener("input", function () { render(inp.value); });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); reset(); }
      if (e.key === "Enter") {
        e.preventDefault(); /* กัน submit ฟอร์ม */
        var first = st.all.filter(function (o) {
          if (o.value === "") return false;
          var t = norm(o.text);
          return norm(inp.value).split(/\s+/).filter(Boolean).every(function (k) { return t.indexOf(k) !== -1; });
        })[0];
        if (first && inp.value.trim()) {
          render(inp.value); sel.value = first.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });
    /* เมื่อผู้ใช้เลือกเอง -> คืนรายการเต็ม เพื่อให้โค้ดหน้าที่ตั้ง select.value ภายหลังไม่พลาด */
    sel.addEventListener("change", function () { if (inp.value) reset(); });
    /* หน้าอาจเติม option ทีหลัง (โหลดจาก DB) -> เก็บรายการใหม่ */
    var obs = new MutationObserver(function () {
      if (st.busy) return;
      inp.value = ""; snapshot();
    });
    obs.observe(sel, { childList: true });
    snapshot();
  }

  function scan(root) {
    if (isPlantSelect(root)) enhance(root);
    if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll("select"), function (s) { if (isPlantSelect(s)) enhance(s); });
  }
  function start() {
    scan(document);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); }); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
