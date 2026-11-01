/* plant-search.js — ทำ dropdown Plant ให้ "พิมพ์ค้นหาในช่องเดียวกันได้" (combobox) ทุกหน้า (โหลดจาก shell-v4.js)
 * ทำไมทำแบบนี้: <select> ของเบราว์เซอร์พิมพ์กรองไม่ได้ จึงวางช่องพิมพ์ + รายการแบบกำหนดเองทับ
 *   แต่คง <select> เดิมไว้เป็นแหล่งความจริงเดียว (ซ่อนด้วย clip ไม่ใช่ display:none เพื่อให้ required/validate เดิมยังทำงาน)
 *   หน้าเดิมจึงอ่าน select.value / ฟัง change ได้เหมือนเดิม ไม่ต้องแก้โค้ดแต่ละหน้า
 * เงื่อนไข: select ที่ id มีคำว่า "plant" และมีตัวเลือกจริง >= 8 รายการ (น้อยกว่านั้นใช้ dropdown เดิม)
 * ความปลอดภัย: DOM + textContent เท่านั้น; สิทธิ์ Plant ยังคุมที่ RLS (OWASP A01)
 * การเข้าถึง: รูปแบบ ARIA combobox (↑↓ Enter Esc Tab), ช่องสูง >= 44px (WCAG 2.2 SC 2.5.8, 4.1.2) */
(function () {
  "use strict";
  var MIN = 8, uid = 0;
  var HIDE = "position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;clip:rect(0 0 0 0)!important";
  function norm(s) { return String(s || "").toLowerCase(); }
  function isPlantSelect(el) { return el && el.tagName === "SELECT" && !el.multiple && /plant/i.test(el.id || ""); }

  function enhance(sel) {
    if (sel._ps) return; sel._ps = true;
    var id = "ps" + (++uid), rows = [], shown = [], active = -1, open = false, native = sel.style.cssText;

    var wrap = document.createElement("div");
    wrap.style.cssText = "position:relative;display:block;width:100%;max-width:100%";
    var inp = document.createElement("input");
    inp.type = "text"; inp.autocomplete = "off"; inp.spellcheck = false;
    inp.setAttribute("role", "combobox");
    inp.setAttribute("aria-autocomplete", "list");
    inp.setAttribute("aria-expanded", "false");
    inp.setAttribute("aria-controls", id + "-l");
    var lab = (sel.id && document.querySelector('label[for="' + sel.id + '"]')) || sel.closest("label");
    inp.setAttribute("aria-label", "ค้นหา Plant");
    inp.style.cssText = "display:block;width:100%;box-sizing:border-box;min-height:44px;padding:.4rem 2rem .4rem .6rem;font:inherit;border-radius:8px;border:1px solid #8a94a8;background:#fff;color:#111";
    var cs = window.getComputedStyle(sel);
    if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") inp.style.background = cs.backgroundColor;
    if (cs.color) inp.style.color = cs.color;
    var arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true"); arrow.textContent = "▾";
    arrow.style.cssText = "position:absolute;right:.7rem;top:50%;transform:translateY(-50%);pointer-events:none;font-size:.9rem;opacity:.7";
    var ul = document.createElement("ul");
    ul.id = id + "-l"; ul.setAttribute("role", "listbox"); ul.hidden = true;
    ul.style.cssText = "position:absolute;left:0;right:0;top:100%;margin:2px 0 0;padding:0;list-style:none;max-height:280px;overflow:auto;z-index:60;background:#fff;color:#111;border:1px solid #8a94a8;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.18)";
    wrap.appendChild(inp); wrap.appendChild(arrow); wrap.appendChild(ul);
    sel.parentNode.insertBefore(wrap, sel);

    function selText() { var o = sel.options[sel.selectedIndex]; return o && o.value !== "" ? o.textContent : ""; }
    function holder() { var o = sel.options[0]; return o && o.value === "" ? o.textContent : ""; }
    function syncText() { if (document.activeElement !== inp) { inp.value = selText(); inp.placeholder = holder(); } }
    function snapshot() {
      rows = Array.prototype.map.call(sel.options, function (o) { return { value: o.value, text: o.textContent, disabled: o.disabled }; });
      var real = rows.filter(function (o) { return o.value !== ""; }).length, on = real >= MIN;
      wrap.hidden = !on;
      if (on) { sel.style.cssText = native + ";" + HIDE; sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true"); }
      else { sel.style.cssText = native; sel.removeAttribute("tabindex"); sel.removeAttribute("aria-hidden"); }
      syncText();
    }
    function render(q) {
      var toks = norm(q).split(/\s+/).filter(Boolean);
      shown = rows.filter(function (o) {
        if (o.disabled) return false;
        if (!toks.length) return true;
        if (o.value === "") return false;
        var t = norm(o.text); return toks.every(function (k) { return t.indexOf(k) !== -1; });
      });
      ul.replaceChildren();
      if (!shown.length) {
        var e = document.createElement("li"); e.setAttribute("role", "option"); e.setAttribute("aria-disabled", "true");
        e.textContent = "ไม่พบ Plant ที่ตรงกับคำค้น"; e.style.cssText = "padding:.6rem .8rem;opacity:.7"; ul.appendChild(e);
      }
      shown.forEach(function (o, i) {
        var li = document.createElement("li");
        li.id = id + "-o" + i; li.setAttribute("role", "option");
        li.setAttribute("aria-selected", o.value === sel.value ? "true" : "false");
        li.textContent = o.text;
        li.style.cssText = "padding:.6rem .8rem;min-height:44px;box-sizing:border-box;cursor:pointer" + (o.value === sel.value ? ";font-weight:700" : "");
        li.addEventListener("mousedown", function (ev) { ev.preventDefault(); choose(i); });
        li.addEventListener("mousemove", function () { setActive(i); });
        ul.appendChild(li);
      });
      setActive(shown.length ? Math.max(0, shown.findIndex(function (o) { return o.value === sel.value; })) : -1);
      if (toks.length && shown.length) setActive(0);
    }
    function setActive(i) {
      active = i;
      Array.prototype.forEach.call(ul.children, function (li, k) { li.style.background = k === i ? "#dbe6ff" : ""; });
      if (i >= 0 && ul.children[i]) { inp.setAttribute("aria-activedescendant", ul.children[i].id); ul.children[i].scrollIntoView({ block: "nearest" }); }
      else inp.removeAttribute("aria-activedescendant");
    }
    function openList(all) { if (!open) { open = true; ul.hidden = false; inp.setAttribute("aria-expanded", "true"); } render(all ? "" : inp.value); }
    function closeList() { open = false; ul.hidden = true; inp.setAttribute("aria-expanded", "false"); inp.removeAttribute("aria-activedescendant"); }
    function choose(i) {
      var o = shown[i]; if (!o) return;
      var changed = sel.value !== o.value;
      sel.value = o.value; closeList(); inp.value = o.value === "" ? "" : o.text; inp.placeholder = holder();
      if (changed) sel.dispatchEvent(new Event("change", { bubbles: true }));
    }

    inp.addEventListener("focus", function () { inp.select(); openList(true); });
    inp.addEventListener("click", function () { if (!open) { inp.select(); openList(true); } });
    inp.addEventListener("input", function () { openList(false); });
    inp.addEventListener("blur", function () { closeList(); inp.value = selText(); inp.placeholder = holder(); });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (!open) openList(true); else if (shown.length) setActive((active + 1) % shown.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (!open) openList(true); else if (shown.length) setActive((active - 1 + shown.length) % shown.length); }
      else if (e.key === "Enter") { if (open) { e.preventDefault(); if (active >= 0) choose(active); } }
      else if (e.key === "Escape") { if (open) { e.preventDefault(); closeList(); inp.value = selText(); } }
      else if (e.key === "Tab") { closeList(); }
    });
    sel.addEventListener("change", syncText);
    new MutationObserver(function () { snapshot(); }).observe(sel, { childList: true });
    setInterval(syncText, 500); /* หน้าที่ตั้ง select.value ด้วยโค้ด (ไม่มี event) */
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
