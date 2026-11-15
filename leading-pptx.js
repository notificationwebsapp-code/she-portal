/* SHE Portal — ส่งออกหน้า Leading Indicator เป็น PowerPoint (Thai Union CI)
   สร้างในเบราว์เซอร์ทั้งหมดด้วย PptxGenJS (pptxgen.bundle.js) ใช้เฉพาะตัวเลขที่หน้าเว็บแสดงอยู่ ไม่มีชื่อบุคคล
   สี = Official จากโลโก้; layout/ฟอนต์ = Proposed (ตาม skill thai-union-ci) */
(function () {
  "use strict";
  var C = { blue: "284499", orange: "E56C0C", sun: "FDD100", text: "1B1F24", grey: "EEF1F6", mid: "6B7280", white: "FFFFFF" };
  var FONT = "Calibri", W = 13.333, H = 7.5;
  function loadScript(src) { return new Promise(function (res, rej) { if (window.PptxGenJS) return res(); var s = document.createElement("script"); s.src = src; s.onload = function () { window.PptxGenJS ? res() : rej(new Error("โหลดตัวสร้าง PowerPoint ไม่สำเร็จ")); }; s.onerror = function () { rej(new Error("ไม่พบไฟล์ pptxgen.bundle.js")); }; document.head.appendChild(s); }); }
  function toDataUrl(url) { return fetch(url, { cache: "force-cache" }).then(function (r) { if (!r.ok) throw new Error("โหลดโลโก้ไม่สำเร็จ"); return r.blob(); }).then(function (b) { return new Promise(function (res, rej) { var f = new FileReader(); f.onload = function () { res(f.result); }; f.onerror = rej; f.readAsDataURL(b); }); }); }
  function imgSize(u) { return new Promise(function (res) { var i = new Image(); i.onload = function () { res({ w: i.naturalWidth, h: i.naturalHeight }); }; i.onerror = function () { res({ w: 1024, h: 748 }); }; i.src = u; }); }
  function gradient(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; var g = c.getContext("2d"); var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#00A9EA"); gr.addColorStop(0.45, "#017AB6"); gr.addColorStop(1, "#2E3896"); g.fillStyle = gr; g.fillRect(0, 0, w, h); return c.toDataURL("image/png"); }
  function chunk(a, n) { var o = []; for (var i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }
  var hd = function (t, al) { return { text: t, options: { bold: true, color: C.white, fill: { color: C.blue }, align: al || "left", valign: "middle" } }; };
  var cl = function (t, al, o) { return { text: String(t == null ? "" : t), options: Object.assign({ color: C.text, align: al || "left", valign: "middle" }, o || {}) }; };

  window.exportLeadingPptx = async function (ctx) {
    var d = ctx.data; if (!d) throw new Error("ยังไม่มีข้อมูลให้ส่งออก — กด \"แสดงผล\" ก่อน");
    await loadScript("pptxgen.bundle.js");
    var logo = await toDataUrl("assets/thai-union-logo.png"), ls = await imgSize(logo), lw = 1.25, lh = lw * ls.h / ls.w;
    var pptx = new window.PptxGenJS(); pptx.layout = "LAYOUT_WIDE"; pptx.title = "SHE Leading Indicator"; pptx.author = "SHE Portal"; pptx.company = "Thai Union";
    var period = d.range.from + " ถึง " + d.range.to;
    var today = new Date(), stamp = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
    pptx.defineSlideMaster({ title: "TU_CONTENT", background: { color: C.white }, objects: [
      { rect: { x: 0, y: 0, w: 0.16, h: H, fill: { color: C.blue } } }, { rect: { x: 0, y: 0, w: 0.16, h: 0.9, fill: { color: C.orange } } },
      { image: { x: W - lw - 0.4, y: 0.25, w: lw, h: lh, data: logo } }, { line: { x: 0.6, y: H - 0.55, w: W - 1.2, h: 0, line: { color: "D5DAE5", width: 0.75 } } },
      { text: { text: "SHE Portal · Leading Indicator · " + d.scope + " · " + period, options: { x: 0.6, y: H - 0.5, w: 10, h: 0.35, fontFace: FONT, fontSize: 10, color: C.mid } } }],
      slideNumber: { x: W - 1.0, y: H - 0.5, w: 0.6, h: 0.35, fontFace: FONT, fontSize: 10, color: C.mid, align: "right" } });
    function content(title, sub) { var s = pptx.addSlide({ masterName: "TU_CONTENT" });
      s.addText(title, { x: 0.6, y: 0.3, w: W - 3.0, h: 0.6, fontFace: FONT, fontSize: 28, bold: true, color: C.blue, valign: "middle" });
      if (sub) s.addText(sub, { x: 0.6, y: 0.9, w: W - 3.0, h: 0.4, fontFace: FONT, fontSize: 13, color: C.mid, valign: "top" }); return s; }
    function table(s, head, rows, x, y, w, colW, fs) {
      s.addTable([head].concat(rows), { x: x, y: y, w: w, colW: colW, fontFace: FONT, fontSize: fs || 11, border: { type: "solid", pt: 0.5, color: "D5DAE5" }, rowH: 0.3, autoPage: false }); }
    function bars(s, title, items, x, y, w, fmt, flag) {
      s.addText(title, { x: x, y: y, w: w, h: 0.35, fontFace: FONT, fontSize: 14, bold: true, color: C.blue });
      var rows = items.slice().sort(function (a, b) { return b.v - a.v; }).slice(0, 10);
      if (!rows.length) { s.addText("ไม่มีข้อมูลในช่วงที่เลือก", { x: x, y: y + 0.45, w: w, h: 0.4, fontFace: FONT, fontSize: 12, color: C.mid }); return; }
      var mx = Math.max.apply(null, rows.map(function (r) { return r.v; })) || 1;
      rows.forEach(function (r, i) { var top = flag && r.v > 0 && r.v === mx, yy = y + 0.45 + i * 0.34, bw = (w - 2.6) * r.v / mx;
        s.addText(r.label, { x: x, y: yy, w: 1.1, h: 0.3, fontFace: FONT, fontSize: 11, color: C.text, valign: "middle" });
        s.addShape(pptx.ShapeType.rect, { x: x + 1.15, y: yy + 0.04, w: Math.max(0.03, bw), h: 0.22, fill: { color: top ? C.orange : C.blue }, line: { color: top ? C.orange : C.blue, width: 0 } });
        s.addText(fmt(r.v) + (top ? " สูงสุด" : ""), { x: x + 1.2 + Math.max(0.03, bw), y: yy, w: 1.4, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: C.text, valign: "middle" }); }); }

    var cv = pptx.addSlide(); cv.background = { color: C.white };
    cv.addImage({ data: gradient(1600, 900), x: 0, y: 0, w: 8.2, h: H });
    cv.addText("Leading Indicator", { x: 0.7, y: 2.0, w: 7.0, h: 0.9, fontFace: FONT, fontSize: 40, bold: true, color: C.white });
    cv.addText("และเหตุการณ์เกิดซ้ำ", { x: 0.7, y: 2.9, w: 7.0, h: 0.6, fontFace: FONT, fontSize: 24, color: C.white });
    cv.addShape(pptx.ShapeType.rect, { x: 0.7, y: 3.7, w: 1.1, h: 0.07, fill: { color: C.sun }, line: { color: C.sun, width: 0 } });
    cv.addText("ช่วงข้อมูล " + period, { x: 0.7, y: 3.95, w: 7.0, h: 0.5, fontFace: FONT, fontSize: 16, color: C.white });
    cv.addImage({ data: logo, x: W - lw - 0.5, y: 0.4, w: lw, h: lh });
    cv.addText([{ text: "มุมมอง  ", options: { bold: true, color: C.blue } }, { text: d.scope, options: { color: C.text } }], { x: 8.8, y: 2.2, w: 4.1, h: 0.6, fontFace: FONT, fontSize: 13, valign: "top" });
    cv.addText("จัดทำเมื่อ " + stamp + " · ที่มา: SHE Portal · อ้างอิง ISO 45001:2018 ข้อ 9.1 และ 10.2", { x: 8.8, y: H - 1.1, w: 4.1, h: 0.7, fontFace: FONT, fontSize: 10, color: C.mid, valign: "top" });

    var k = d.kpi, s2 = content("สรุปสำหรับผู้บริหาร", "เปรียบเทียบ Plant ช่วง " + period);
    [["SLA ที่พลาดทั้งหมด", String(k.miss), "ครั้ง", C.orange], ["Action เกินกำหนดที่ยังเปิด", String(k.over), "รายการ", C.orange], ["ปิด Action ทันเวลา", k.closed ? Math.round(100 * k.on / k.closed) + "%" : "–", k.closed ? k.on + " จาก " + k.closed + " รายการ" : "ยังไม่มี Action ที่ปิดแล้ว", C.blue], ["Repeat case", String(k.rep), "เคสที่เกิดซ้ำ", C.orange]].forEach(function (c, i) {
      var cx = 0.6 + i * 3.1, cy = 1.55; s2.addShape(pptx.ShapeType.rect, { x: cx, y: cy, w: 2.95, h: 1.6, fill: { color: C.grey }, line: { color: C.grey, width: 0 } });
      s2.addShape(pptx.ShapeType.rect, { x: cx, y: cy, w: 0.09, h: 1.6, fill: { color: c[3] }, line: { color: c[3], width: 0 } });
      s2.addText(c[0], { x: cx + 0.25, y: cy + 0.1, w: 2.6, h: 0.4, fontFace: FONT, fontSize: 12, color: C.mid, bold: true });
      s2.addText(c[1], { x: cx + 0.25, y: cy + 0.5, w: 2.6, h: 0.7, fontFace: FONT, fontSize: 34, bold: true, color: c[3] });
      s2.addText(c[2], { x: cx + 0.25, y: cy + 1.2, w: 2.6, h: 0.35, fontFace: FONT, fontSize: 11, color: C.mid }); });
    s2.addText([{ text: "ตัวเลขนับตามเกณฑ์ SLA และกฎ Repeat ที่ Admin ตั้งไว้ ไม่ปรับตามขนาดโรงงานหรือชั่วโมงทำงาน ใช้ดูแนวโน้มและเปรียบเทียบ ไม่ใช่คะแนนตัดสินผล", options: { bullet: true, breakLine: true } },
      { text: "แถบสีส้มพร้อมคำว่า \"สูงสุด\" = Plant ที่พลาดหรือเกิดซ้ำมากที่สุดในช่วงที่เลือก", options: { bullet: true } }], { x: 0.6, y: 3.5, w: W - 1.2, h: 1.2, fontFace: FONT, fontSize: 14, color: C.text, valign: "top", paraSpaceAfter: 6 });

    var s3 = content("เปรียบเทียบแยกตาม Plant", "จำนวนครั้ง และร้อยละ แยกตาม Plant");
    bars(s3, "SLA ที่พลาด (ครั้ง)", Object.keys(d.miss).map(function (c) { return { label: c, v: d.miss[c] }; }), 0.6, 1.5, 6.0, String, true);
    bars(s3, "Repeat case (เคส)", d.rs.map(function (r) { return { label: r.plant_code, v: r.repeat_case || 0 }; }).filter(function (x) { return x.v > 0; }), 6.9, 1.5, 6.0, String, true);
    var s3b = content("ปิด Action ทันเวลา", "ร้อยละของ Action ที่ปิดแล้วและปิดทันกำหนด (ยิ่งสูงยิ่งดี)");
    bars(s3b, "ปิดทันเวลา (ร้อยละ)", d.li.filter(function (r) { return r.capa_closed_total > 0; }).map(function (r) { return { label: r.plant_code, v: Math.round(100 * r.capa_closed_on_time / r.capa_closed_total) }; }), 0.6, 1.5, 6.0, function (v) { return v + "%"; }, false);
    var mo = {}; d.mt.forEach(function (r) { var m = String(r.month).slice(0, 7); mo[m] = (mo[m] || 0) + (r.cases || 0); });
    bars(s3b, "แนวโน้ม Repeat รายเดือน (เคส)", Object.keys(mo).sort().map(function (m) { return { label: m, v: mo[m] }; }), 6.9, 1.5, 6.0, String, false);

    /* ตาราง SLA ตาม Plant × ขั้นตอน */
    var by = {}; d.sla.forEach(function (r) { (by[r.plant_code] = by[r.plant_code] || {})[r.stage] = r; });
    var plants = Object.keys(by).sort(), st = ctx.STAGE_ORDER;
    chunk(plants, 14).forEach(function (grp, gi) {
      var s = content("SLA ที่พลาด แยกตาม Plant และขั้นตอน" + (gi ? " (ต่อ)" : ""), "ตัวเลข = พลาดเกณฑ์ (ปิดแล้วเกินเวลา + ยังเปิดเกินเวลา) · ไม่มีเกณฑ์ = ยังไม่ตั้งเกณฑ์ จึงไม่นับว่าพลาด");
      var rows = grp.map(function (p) { var nr = 0; var c = [cl(p)]; st.forEach(function (x) { var r = by[p][x]; if (r) nr += r.no_rule || 0; var m = r ? r.miss_total : 0; c.push(cl(r ? m : "–", "right", m > 0 ? { bold: true, color: "8C1D18" } : {})); }); c.push(cl(nr, "right")); return c; });
      table(s, [hd("Plant")].concat(st.map(function (x) { return hd(ctx.STAGE_TH[x], "right"); })).concat([hd("ไม่มีเกณฑ์", "right")]), rows, 0.6, 1.45, W - 1.2, [1.7].concat(st.map(function () { return 1.7; })).concat([1.7]).map(function (v, i, a) { return (W - 1.2) / a.length; }), 11);
    });
    /* ตัวชี้วัดเชิงรุก + Repeat */
    chunk(d.li, 12).forEach(function (grp, gi) {
      var s = content("ตัวชี้วัดเชิงรุกอื่น" + (gi ? " (ต่อ)" : ""), "ISO 45001:2018 ข้อ 10.2 ประสิทธิผลของ Action");
      table(s, [hd("Plant"), hd("Action เกินกำหนดที่ยังเปิด", "right"), hd("Action ปิดแล้ว", "right"), hd("ปิดทันเวลา", "right"), hd("เลื่อนกำหนด 2 ครั้งขึ้นไป", "right"), hd("Serious potential ที่ไม่มี Action", "right")],
        grp.map(function (r) { return [cl(r.plant_code), cl(r.capa_overdue_open, "right"), cl(r.capa_closed_total, "right"), cl(r.capa_closed_on_time, "right"), cl(r.capa_due_shifted_2plus, "right"), cl(r.serious_potential_no_action, "right")]; }), 0.6, 1.45, W - 1.2, [2, 2.1, 1.9, 1.9, 2.1, 2.13], 12);
    });
    chunk(d.rs, 12).forEach(function (grp, gi) {
      var s = content("เหตุการณ์เกิดซ้ำ (Repeat) แยกตาม Plant" + (gi ? " (ต่อ)" : ""), "นับตามกฎ N/K ที่ Admin ตั้งไว้");
      table(s, [hd("Plant"), hd("เคสทั้งหมด", "right"), hd("Repeat root cause", "right"), hd("Repeat case", "right"), hd("Repeat after closure", "right"), hd("ผู้สอบสวนยืนยัน", "right"), hd("กฎที่เปิด")],
        grp.map(function (r) { return [cl(r.plant_code), cl(r.cases_total, "right"), cl(r.repeat_root_cause, "right"), cl(r.repeat_case, "right"), cl(r.repeat_after_closure, "right"), cl(r.confirmed_total, "right"), cl(r.rules_enabled ? "เปิด" : "ยังไม่เปิด")]; }), 0.6, 1.45, W - 1.2, [2, 1.8, 1.9, 1.8, 2.0, 1.8, 0.93], 12);
    });
    if (d.hm.length) {
      var rcs = [], nm = {}; d.hm.forEach(function (r) { if (rcs.indexOf(r.root_cause_code) < 0) rcs.push(r.root_cause_code); nm[r.root_cause_code] = r.root_cause_name_th || r.root_cause_code; });
      var pls = []; d.hm.forEach(function (r) { if (pls.indexOf(r.plant_code) < 0) pls.push(r.plant_code); }); pls = pls.sort().slice(0, 10);
      var mx = Math.max.apply(null, d.hm.map(function (r) { return r.repeat_cases; })) || 1;
      chunk(rcs, 10).forEach(function (grp, gi) {
        var s = content("Root cause ที่เกิดซ้ำ (Plant × Root cause)" + (gi ? " (ต่อ)" : ""), "จำนวนเคสที่เกิดซ้ำ · สีเข้มขึ้น = มากขึ้น (ตัวเลขกำกับทุกช่อง)");
        var cw = 10.5 / Math.max(1, pls.length);
        table(s, [hd("Root cause")].concat(pls.map(function (x) { return hd(x, "center"); })), grp.map(function (rc) { return [cl(nm[rc])].concat(pls.map(function (pl) { var f = d.hm.filter(function (x) { return x.root_cause_code === rc && x.plant_code === pl; })[0], v = f ? f.repeat_cases : 0; return cl(v || "·", "center", v ? { bold: true, color: v / mx > 0.5 ? C.white : C.text, fill: { color: v / mx > 0.5 ? "284499" : "C7D2EE" } } : {}); })); }), 0.6, 1.45, W - 1.2, [W - 1.2 - 10.5 + 0].slice(0, 1).concat(pls.map(function () { return cw; })).map(function (v, i) { return i === 0 ? (W - 1.2) - cw * pls.length : v; }), 11);
      });
    }
    if (d.lsr.length) chunk(d.lsr, 12).forEach(function (grp, gi) {
      var s = content("Life Saving Rules (จำนวนเคสต่อข้อ)" + (gi ? " (ต่อ)" : ""), "เฉพาะข้อที่มีเคสผูกอยู่");
      table(s, [hd("Plant"), hd("รหัส"), hd("เคส", "right")], grp.map(function (r) { return [cl(r.plant_code), cl(r.item_code), cl(r.cases, "right")]; }), 0.6, 1.45, 7, [2, 3.5, 1.5], 12);
    });
    await pptx.writeFile({ fileName: "SHE-Leading-Indicator_" + d.range.from + "_" + d.range.to + ".pptx" });
  };
})();
