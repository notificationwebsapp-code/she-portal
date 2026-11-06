/* SHE Portal — date-hint.js : ลดความเสี่ยงกรอกวัน/เดือนสลับกัน
 * ปัญหา: ช่องวันที่ของเบราว์เซอร์แสดงเป็น mm/dd/yyyy หรือ dd/mm/yyyy ตามภาษาของเครื่อง หน้าเว็บบังคับเปลี่ยนไม่ได้
 * วิธีแก้: แสดงวันที่ที่เลือกเป็นตัวอักษร (ชื่อเดือนไทย + อังกฤษ) ใต้ช่องทันที พร้อมบอกลำดับที่ช่องใช้ และเตือนเมื่อวันที่ผิดปกติ
 *
 * ใช้: ใส่ attribute บน <input type="date"> หรือ "datetime-local"
 *   data-datehint            เปิดใช้ (ช่องที่มี required เปิดให้อัตโนมัติ)
 *   data-datehint="off"      ปิด (เช่นช่องกรองในหน้ารายการ)
 *   data-date-min / data-date-max   "today" หรือ "today+N" / "today-N" (วัน) — จำกัดช่วงที่เลือกได้ (ฐานข้อมูลยังเป็นผู้ตัดสินสุดท้าย)
 *   data-date-warn="future|past"    เตือน (ไม่บล็อก) เมื่อวันที่อยู่ในอนาคต/อดีต
 * ความปลอดภัย: สร้างข้อความด้วย textContent เท่านั้น (OWASP A03)
 */
(function () {
  // ข้อความสองภาษาเลือกตามภาษาที่ผู้ใช้เลือก (I18N.lang) — ไม่ผ่านตารางแปลคำเดี่ยว กันชนกับคำอื่นในระบบ
  const EN_UI = () => !!(window.I18N && window.I18N.lang === "en");
  const M = {
    bad: ["วันที่ไม่ถูกต้อง", "Invalid date"],
    order: ["ช่องนี้เรียงลำดับ", "This field's order is"],
    after: ["เมื่อเลือกแล้วระบบจะแสดงวันที่เป็นตัวอักษรให้ตรวจ", "the date will be shown in words once selected so you can check it"],
    today: ["วันนี้", "today"],
    inN: ["อีก {0} วัน", "in {0} days"],
    agoN: ["ผ่านมาแล้ว {0} วัน", "{0} days ago"],
    future: ["วันที่นี้อยู่ในอนาคต กรุณาตรวจสอบว่าไม่ได้กรอกวัน/เดือนสลับกัน", "This date is in the future — please check that day and month were not swapped"],
    past: ["วันที่นี้ผ่านมาแล้ว กรุณาตรวจสอบว่าไม่ได้กรอกวัน/เดือนสลับกัน", "This date is in the past — please check that day and month were not swapped"],
    far: ["ห่างจากวันนี้เกิน 2 ปี กรุณาตรวจสอบอีกครั้ง", "More than 2 years from today — please check again"],
    range: ["อยู่นอกช่วงที่เลือกได้", "Outside the allowed range"]
  };
  const T = (k, n) => { const v = M[k][EN_UI() ? 1 : 0]; return n === undefined ? v : v.replace("{0}", n); };
  const MS_DAY = 86400000;
  const TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function rel(spec) {                         // "today" | "today+30" | "today-7" -> yyyy-mm-dd
    const m = /^today([+-]\d+)?$/.exec(spec || ""); if (!m) return null;
    const d = today(); d.setDate(d.getDate() + (m[1] ? parseInt(m[1], 10) : 0)); return iso(d);
  }
  // ลำดับที่ช่องของเบราว์เซอร์ใช้ เช่น "เดือน/วัน/ปี"
  function orderText() {
    try {
      const names = EN_UI() ? { month: "month", day: "day", year: "year" } : { month: "เดือน", day: "วัน", year: "ปี" };
      const parts = new Intl.DateTimeFormat(navigator.language || "en-US").formatToParts(new Date(2026, 10, 15))
        .filter((p) => names[p.type]).map((p) => names[p.type]);
      return parts.length === 3 ? parts.join("/") : "";
    } catch (e) { return ""; }
  }
  function parse(v) {                          // "yyyy-mm-dd" หรือ "yyyy-mm-ddThh:mm"
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(v || ""); if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    const dt = new Date(y, mo - 1, d); if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return { date: dt, y: y, mo: mo, d: d, time: m[4] ? m[4] + ":" + m[5] : "" };
  }
  function injectStyle() {
    if (document.getElementById("datehint-style")) return;
    const s = document.createElement("style"); s.id = "datehint-style";
    s.textContent = ".datehint{display:block;margin:.3rem 0 0;font-size:.9rem;color:var(--muted,#475569)}" +
      ".datehint.ok{color:var(--ok,#166534);font-weight:600}" +
      ".datehint.warn{color:#8a4b00;font-weight:600}.datehint.bad{color:var(--danger,#b42318);font-weight:600}";
    document.head.appendChild(s);
  }

  function attach(inp) {
    if (inp.__dh) return; inp.__dh = true;
    injectStyle();
    const ds = inp.dataset, isDt = inp.type === "datetime-local";
    const mn = rel(ds.dateMin), mx = rel(ds.dateMax);
    if (mn) inp.min = isDt ? mn + "T00:00" : mn;
    if (mx) inp.max = isDt ? mx + "T23:59" : mx;
    const hint = document.createElement("small");
    hint.className = "datehint"; hint.setAttribute("role", "status"); hint.setAttribute("aria-live", "polite");
    hint.setAttribute("data-no-i18n", "");
    inp.insertAdjacentElement("afterend", hint);
    const ord = orderText();

    function render() {
      const p = parse(inp.value);
      let cls = "datehint", txt;
      if (!p) {
        txt = inp.value ? T("bad") : (T("order") + (ord ? " " + ord : "") + " — " + T("after"));
        if (inp.value) cls += " bad";
      } else {
        const be = p.y + 543;
        txt = (EN_UI() ? p.d + " " + EN[p.mo - 1] + " " + p.y : p.d + " " + TH[p.mo - 1] + " " + be + " (" + p.d + " " + EN[p.mo - 1] + " " + p.y + ")") + (p.time ? " " + p.time : "");
        const diff = Math.round((p.date - today()) / MS_DAY);
        let note = "";
        if (diff === 0) note = T("today"); else if (diff > 0) note = T("inN", diff); else note = T("agoN", -diff);
        txt += " · " + note; cls += " ok";
        if (ds.dateWarn === "future" && diff > 0) { cls = "datehint warn"; txt += " — " + T("future"); }
        else if (ds.dateWarn === "past" && diff < 0) { cls = "datehint warn"; txt += " — " + T("past"); }
        else if (Math.abs(diff) > 730) { cls = "datehint warn"; txt += " — " + T("far"); }
        if ((mn && inp.value < inp.min) || (mx && inp.value > inp.max)) { cls = "datehint bad"; txt += " — " + T("range"); }
      }
      hint.className = cls; hint.textContent = txt;
    }
    inp.addEventListener("input", render); inp.addEventListener("change", render);
    // ค่าที่ถูกเติมด้วยโค้ด (เช่น ทำต่อจากร่าง) ไม่ยิง event — ตรวจค่าเป็นระยะเบา ๆ
    let last = inp.value; setInterval(() => { if (inp.value !== last) { last = inp.value; render(); } }, 700);
    render();
  }

  function scan(root) {
    (root || document).querySelectorAll('input[type="date"],input[type="datetime-local"]').forEach((i) => {
      const flag = i.dataset.datehint;
      if (flag === "off") return;
      if (flag !== undefined || i.required) attach(i);
    });
  }
  function start() {
    scan(document);
    new MutationObserver((ms) => { ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) scan(n.matches && n.matches("input") ? n.parentNode : n); })); })
      .observe(document.body, { childList: true, subtree: true });
  }
  window.SheDateHint = { attach: attach };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
