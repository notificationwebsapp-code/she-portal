/* SHE Portal — ส่งออก Executive Dashboard เป็น PowerPoint (สไตล์ Thai Union CI)
   - สร้างไฟล์ในเบราว์เซอร์ทั้งหมด (ไม่ส่งข้อมูลออกไปที่ใด) ด้วย PptxGenJS (ไฟล์ pptxgen.bundle.js ใน repo เดียวกัน)
   - ใช้เฉพาะตัวเลขที่หน้า Dashboard แสดงอยู่แล้ว (ค่าน้อยกว่า 3 ยังถูกปิดบังเป็น "<3") ไม่มีชื่อบุคคลหรือรายละเอียดเคส
   - ค่าสีจากโลโก้ Thai Union (Official) ส่วน layout/ฟอนต์เป็นข้อเสนอ (Proposed) ตาม skill thai-union-ci */
(function () {
  "use strict";
  var C = { blue: "284499", indigo: "2E3896", ocean: "017AB6", sky: "00A9EA", sun: "FDD100", orange: "E56C0C", text: "1B1F24", grey: "EEF1F6", mid: "6B7280", white: "FFFFFF" };
  var SEV = { FAT: "7F1D1D", LTI: "DC2626", RWC: "C2410C", MTC: "FB923C", FAC: "FCD34D", PD: "BEF264", NEAR: "86EFAC", UNK: "9CA3AF" };
  var SEV_TXT = { FAT: "FFFFFF", LTI: "FFFFFF", RWC: "FFFFFF", MTC: "431407", FAC: "422006", PD: "1A2E05", NEAR: "052E16", UNK: "FFFFFF" };
  var FONT = "Calibri";
  var W = 13.333, H = 7.5;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (window.PptxGenJS) return res();
      var s = document.createElement("script"); s.src = src;
      s.onload = function () { window.PptxGenJS ? res() : rej(new Error("โหลดตัวสร้าง PowerPoint ไม่สำเร็จ")); };
      s.onerror = function () { rej(new Error("ไม่พบไฟล์ pptxgen.bundle.js (ต้องอัปโหลดไฟล์นี้ขึ้น GitHub ร่วมกับหน้านี้)")); };
      document.head.appendChild(s);
    });
  }
  function toDataUrl(url) {
    return fetch(url, { cache: "force-cache" }).then(function (r) { if (!r.ok) throw new Error("โหลดโลโก้ไม่สำเร็จ"); return r.blob(); }).then(function (b) {
      return new Promise(function (res, rej) { var f = new FileReader(); f.onload = function () { res(f.result); }; f.onerror = rej; f.readAsDataURL(b); });
    });
  }
  function imgSize(u) { return new Promise(function (res) { var i = new Image(); i.onload = function () { res({ w: i.naturalWidth, h: i.naturalHeight }); }; i.onerror = function () { res({ w: 1024, h: 748 }); }; i.src = u; }); }
  function gradient(w, h) {   /* Blue gradient ตามโลโก้: Sky → Ocean → Indigo */
    var c = document.createElement("canvas"); c.width = w; c.height = h; var g = c.getContext("2d");
    var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#00A9EA"); gr.addColorStop(0.45, "#017AB6"); gr.addColorStop(1, "#2E3896");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 3;   /* เส้น wave บาง ๆ มุมขวาล่าง (Proposed) */
    for (var k = 0; k < 4; k++) { g.beginPath(); for (var x = 0; x <= w; x += 8) { var y = h * (0.82 + k * 0.045) + Math.sin(x / w * 6.28 + k) * 14; if (x === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
    return c.toDataURL("image/png");
  }
  var num = function (v) { return v == null ? "<3" : String(v); };
  var nz = function (v) { return v == null ? 1.5 : v; };
  function heatFill(c) {
    if (c.suppressed) return { f: "CBD5E1", t: "334155" };
    var v = c.n || 0;
    if (v === 0) return { f: "F8FAFC", t: "CBD5E1" };
    if (v < 6) return { f: "FDE68A", t: "78350F" };
    if (v < 10) return { f: "FB923C", t: "431407" };
    if (v < 20) return { f: "DC2626", t: "FFFFFF" };
    return { f: "7F1D1D", t: "FFFFFF" };
  }
  function chunk(a, n) { var o = []; for (var i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }

  window.exportDashboardPptx = async function (ctx) {
    var r = ctx.data; if (!r) throw new Error("ยังไม่มีข้อมูลให้ส่งออก — กด \"แสดงผล\" ก่อน");
    await loadScript("pptxgen.bundle.js");
    var logo = await toDataUrl("assets/thai-union-logo.png"), ls = await imgSize(logo);
    var lw = 1.25, lh = lw * ls.h / ls.w;
    var pptx = new window.PptxGenJS(); pptx.layout = "LAYOUT_WIDE"; pptx.title = "SHE Executive Dashboard"; pptx.author = "SHE Portal"; pptx.company = "Thai Union";
    var fmt = ctx.fmt || function (x) { return x; };
    var period = fmt(ctx.range.from) + " – " + fmt(ctx.range.to);
    var today = new Date(), stamp = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);

    pptx.defineSlideMaster({
      title: "TU_CONTENT", background: { color: C.white },
      objects: [
        { rect: { x: 0, y: 0, w: 0.16, h: H, fill: { color: C.blue } } },
        { rect: { x: 0, y: 0, w: 0.16, h: 0.9, fill: { color: C.orange } } },
        { image: { x: W - lw - 0.4, y: 0.25, w: lw, h: lh, data: logo } },
        { line: { x: 0.6, y: H - 0.55, w: W - 1.2, h: 0, line: { color: "D5DAE5", width: 0.75 } } },
        { text: { text: "SHE Portal · Executive Dashboard · " + period, options: { x: 0.6, y: H - 0.5, w: 9, h: 0.35, fontFace: FONT, fontSize: 10, color: C.mid } } }
      ],
      slideNumber: { x: W - 1.0, y: H - 0.5, w: 0.6, h: 0.35, fontFace: FONT, fontSize: 10, color: C.mid, align: "right" }
    });

    function content(title, sub) {
      var s = pptx.addSlide({ masterName: "TU_CONTENT" });
      s.addText(title, { x: 0.6, y: 0.3, w: W - 3.0, h: 0.6, fontFace: FONT, fontSize: 28, bold: true, color: C.blue, valign: "middle" });
      if (sub) s.addText(sub, { x: 0.6, y: 0.9, w: W - 3.0, h: 0.4, fontFace: FONT, fontSize: 13, color: C.mid, valign: "top" });
      return s;
    }

    /* 1 ปก — แผงน้ำเงิน Gradient ซ้าย โลโก้บนพื้นขาวขวาบน (โลโก้เป็นพื้นโปร่งใส ตัวอักษรน้ำเงินจึงวางบนพื้นสว่างเท่านั้น) */
    var cv = pptx.addSlide(); cv.background = { color: C.white };
    cv.addImage({ data: gradient(1600, 900), x: 0, y: 0, w: 8.2, h: H });
    cv.addText("ภาพรวมเหตุการณ์ SHE", { x: 0.7, y: 2.0, w: 7.0, h: 0.9, fontFace: FONT, fontSize: 40, bold: true, color: C.white });
    cv.addText("Executive Dashboard", { x: 0.7, y: 2.9, w: 7.0, h: 0.6, fontFace: FONT, fontSize: 24, color: C.white });
    cv.addShape(pptx.ShapeType.rect, { x: 0.7, y: 3.7, w: 1.1, h: 0.07, fill: { color: C.sun }, line: { color: C.sun, width: 0 } });
    cv.addText("ช่วงข้อมูล " + period, { x: 0.7, y: 3.95, w: 7.0, h: 0.5, fontFace: FONT, fontSize: 16, color: C.white });
    cv.addImage({ data: logo, x: W - lw - 0.5, y: 0.4, w: lw, h: lh });
    var scope = [["ขอบเขต Plant", ctx.scope.plants], ["ประเภทเหตุการณ์", ctx.scope.types], ["ระดับความรุนแรง", ctx.scope.sev], ["ผู้เกี่ยวข้อง", ctx.scope.party], ["สถานะเคส", ctx.scope.phase]];
    var sy = 2.2;
    scope.forEach(function (p) {
      cv.addText([{ text: p[0] + "  ", options: { bold: true, color: C.blue } }, { text: p[1], options: { color: C.text } }], { x: 8.8, y: sy, w: 4.1, h: 0.62, fontFace: FONT, fontSize: 12, valign: "top" }); sy += 0.66;
    });
    cv.addText("จัดทำเมื่อ " + fmt(stamp) + " · ที่มา: SHE Portal", { x: 8.8, y: H - 0.9, w: 4.1, h: 0.4, fontFace: FONT, fontSize: 10, color: C.mid });

    /* 2 สรุปผู้บริหาร */
    var k = r.kpi, py = r.pyramid || {};
    var s2 = content("สรุปสำหรับผู้บริหาร", "จำนวนเคสที่บันทึกในระบบ ช่วง " + period);
    var cards = [["เคสทั้งหมด", String(k.total), "ในช่วงที่เลือก", C.blue], ["เคสรุนแรง (FAT/LTI)", String(k.serious), "เสียชีวิต + หยุดงาน", C.orange], ["LTI", String(k.lti), "บาดเจ็บถึงขั้นหยุดงาน", C.blue],
      ["จำกัดงาน (RWC)", String(py.rwc || 0), "Restricted work case", C.blue], ["Near miss", String(k.near_miss), "เหตุเกือบเกิดอุบัติเหตุ", C.blue],
      ["ปลอดอุบัติเหตุหยุดงาน", k.days_since_lti == null ? "ไม่มีเคส" : String(k.days_since_lti), k.days_since_lti == null ? "ยังไม่มี LTI/เสียชีวิต" : "วัน (นับจากเคสล่าสุด)", C.blue]];
    cards.forEach(function (c, i) {
      var cx = 0.6 + (i % 3) * 4.1, cy = 1.55 + Math.floor(i / 3) * 1.75;
      s2.addShape(pptx.ShapeType.rect, { x: cx, y: cy, w: 3.9, h: 1.6, fill: { color: C.grey }, line: { color: C.grey, width: 0 } });
      s2.addShape(pptx.ShapeType.rect, { x: cx, y: cy, w: 0.09, h: 1.6, fill: { color: c[3] }, line: { color: c[3], width: 0 } });
      s2.addText(c[0], { x: cx + 0.25, y: cy + 0.1, w: 3.5, h: 0.4, fontFace: FONT, fontSize: 13, color: C.mid, bold: true });
      s2.addText(c[1], { x: cx + 0.25, y: cy + 0.5, w: 3.5, h: 0.7, fontFace: FONT, fontSize: 36, bold: true, color: c[3] });
      s2.addText(c[2], { x: cx + 0.25, y: cy + 1.2, w: 3.5, h: 0.35, fontFace: FONT, fontSize: 11, color: C.mid });
    });
    var msg = ["ช่วง " + period + ": บันทึกเคสทั้งหมด " + k.total + " เคส เป็นเคสรุนแรง (FAT/LTI) " + k.serious + " เคส และ Near miss " + k.near_miss + " เคส"];
    if (k.days_since_lti != null) msg.push("ปลอดอุบัติเหตุหยุดงานมาแล้ว " + k.days_since_lti + " วัน นับจากเคส FAT/LTI ล่าสุด");
    msg.push("ตัวเลขเป็นจำนวนเคส ไม่ปรับตามขนาดโรงงานหรือชั่วโมงทำงาน ใช้ดูแนวโน้ม ไม่ใช่คะแนนหรืออันดับ");
    s2.addText(msg.map(function (t) { return { text: t, options: { bullet: true, breakLine: true } }; }), { x: 0.6, y: 5.15, w: W - 1.2, h: 1.6, fontFace: FONT, fontSize: 14, color: C.text, valign: "top", paraSpaceAfter: 6 });

    /* 3 พีระมิดความรุนแรง */
    var s3 = content("พีระมิดความรุนแรง", "ฐานกว้างคือเหตุที่เบากว่าแต่เกิดบ่อยกว่า (Near miss) ใช้ดูว่ามีการรายงานเชิงป้องกันมากพอหรือไม่");
    [["FAT", "เสียชีวิต (FAT)", py.fatal, 30], ["LTI", "หยุดงาน (LTI)", py.lti, 39], ["RWC", "จำกัดงาน (RWC)", py.rwc, 49], ["MTC", "รักษาพยาบาล (MTC)", py.mtc, 59], ["FAC", "ปฐมพยาบาล (FAC)", py.fac, 70], ["PD", "ทรัพย์สินเสียหาย (PD)", py.pd, 84], ["NEAR", "Near miss", py.near_miss, 100]].forEach(function (L, i) {
      var w = 7.2 * L[3] / 100, x = 0.6 + (7.2 - w) / 2, y = 1.5 + i * 0.7;
      s3.addShape(pptx.ShapeType.rect, { x: x, y: y, w: w, h: 0.62, fill: { color: SEV[L[0]] }, line: { color: SEV[L[0]], width: 0 } });
      s3.addText(L[1], { x: x + 0.1, y: y, w: w - 1.0, h: 0.62, fontFace: FONT, fontSize: 13, bold: true, color: SEV_TXT[L[0]], valign: "middle" });
      s3.addText(String(L[2] || 0), { x: x + w - 0.9, y: y, w: 0.8, h: 0.62, fontFace: FONT, fontSize: 16, bold: true, color: SEV_TXT[L[0]], align: "right", valign: "middle" });
    });
    s3.addText([{ text: "วิธีอ่านพีระมิด", options: { bold: true, color: C.blue, breakLine: true } },
      { text: "RWC = Restricted work case · MTC = Medical treatment case · FAC = First aid case · PD = Property damage", options: { bullet: true, breakLine: true } },
      { text: "ไม่รวมอัคคีภัย PSM และสิ่งแวดล้อม (ตามนิยามของหน้า Dashboard)", options: { bullet: true, breakLine: true } },
      { text: "สีของแต่ละระดับใช้ชุดเดียวกับหน้าเว็บเพื่อให้เทียบกันได้", options: { bullet: true } }],
      { x: 8.4, y: 1.5, w: 4.4, h: 4.2, fontFace: FONT, fontSize: 13, color: C.text, valign: "top", paraSpaceAfter: 8 });

    /* 4 แนวโน้มรายเดือน (กราฟแท่งจริง แก้ไขสีและตัวเลขต่อใน PowerPoint ได้) */
    var MON = ctx.MON || ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    var s4 = content("แนวโน้มรายเดือน", "จำนวนเคสแยกตามความรุนแรง");
    if (r.trend && r.trend.length) {
      var lab = r.trend.map(function (m) { var p = m.month.split("-"); return MON[Number(p[1]) - 1] + " " + String(Number(p[0]) + 543).slice(2); });
      s4.addChart(pptx.charts.BAR, [{ name: "เคสรุนแรง (FAT/LTI)", labels: lab, values: r.trend.map(function (m) { return m.serious; }) }, { name: "เคสอื่น ๆ", labels: lab, values: r.trend.map(function (m) { return m.other; }) }, { name: "Near miss", labels: lab, values: r.trend.map(function (m) { return m.near_miss; }) }],
        { x: 0.6, y: 1.45, w: W - 1.2, h: 5.2, barDir: "col", barGrouping: "stacked", chartColors: [C.orange, C.blue, C.sky], showLegend: true, legendPos: "b", legendFontFace: FONT, legendFontSize: 12, showValue: true, dataLabelColor: "FFFFFF", dataLabelFontSize: 11, catAxisLabelFontFace: FONT, catAxisLabelFontSize: 12, valAxisLabelFontFace: FONT, valAxisLabelFontSize: 11, valGridLine: { color: "E5E7EB", size: 0.5 }, catGridLine: { style: "none" } });
    } else s4.addText("ไม่มีข้อมูลในช่วงที่เลือก", { x: 0.6, y: 2, w: 6, h: 0.5, fontFace: FONT, fontSize: 16, color: C.mid });

    /* กราฟแท่งแนวนอนจาก list ที่มี name_th / n / suppressed */
    function hbar(slide, title, arr, x, w, colorFn) {
      slide.addText(title, { x: x, y: 1.45, w: w, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: C.blue });
      arr = arr || [];
      if (!arr.length) { slide.addText("ไม่มีข้อมูลในช่วงที่เลือก", { x: x, y: 2.1, w: w, h: 0.4, fontFace: FONT, fontSize: 13, color: C.mid }); return; }
      var rev = arr.slice().reverse(), labels = rev.map(function (c) { return c.name_th + (c.suppressed ? " (<3)" : ""); });
      slide.addChart(pptx.charts.BAR, [{ name: title, labels: labels, values: rev.map(function (c) { return c.n || 0; }) }],
        { x: x, y: 1.9, w: w, h: 4.7, barDir: "bar", chartColors: colorFn ? rev.map(colorFn) : [C.blue], showLegend: false, showValue: true, dataLabelFontFace: FONT, dataLabelFontSize: 11, catAxisLabelFontFace: FONT, catAxisLabelFontSize: 11, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" } });
    }
    /* 5 ประเภทเหตุการณ์ + ผู้เกี่ยวข้อง */
    var s5 = content("ประเภทเหตุการณ์และผู้เกี่ยวข้อง", "ประเภทหลัก (รวมประเภทย่อย) · เคสเก่าที่ยังไม่จัดประเภทใหม่แสดงเป็น \"ไม่ระบุ\" · \"(<3)\" = ปิดบังค่าน้อย");
    hbar(s5, "หมวดเหตุการณ์", r.by_category, 0.6, 6.0);
    hbar(s5, "ผู้เกี่ยวข้อง", r.by_party, 6.9, 5.8, function () { return C.ocean; });
    /* 6 ระดับความรุนแรง + ช่วงเวลา */
    var s6 = content("ระดับความรุนแรงและช่วงเวลาที่เกิดเหตุ", "ช่วงเวลาแบ่งทุก 6 ชั่วโมงตามเวลาท้องถิ่นของ Plant");
    hbar(s6, "ระดับความรุนแรง", r.by_severity, 0.6, 6.4, function (c) { return SEV[c.code] || SEV.UNK; });
    var TL = { "00-05": "00:00–05:59", "06-11": "06:00–11:59", "12-17": "12:00–17:59", "18-23": "18:00–23:59", unknown: "ไม่ระบุเวลา" };
    (r.by_time || []).forEach(function (t, i) {
      var y = 1.9 + i * 0.95;
      s6.addShape(pptx.ShapeType.rect, { x: 7.4, y: y, w: 5.3, h: 0.85, fill: { color: C.grey }, line: { color: C.grey, width: 0 } });
      s6.addText(TL[t.bucket] || t.bucket, { x: 7.6, y: y, w: 2.6, h: 0.85, fontFace: FONT, fontSize: 14, color: C.text, valign: "middle" });
      s6.addText(num(t.n), { x: 10.2, y: y, w: 1.0, h: 0.85, fontFace: FONT, fontSize: 24, bold: true, color: C.blue, align: "right", valign: "middle" });
      s6.addText(t.n != null && k.total ? Math.round(t.n / k.total * 100) + "%" : "", { x: 11.3, y: y, w: 1.2, h: 0.85, fontFace: FONT, fontSize: 13, color: C.mid, valign: "middle" });
    });
    /* 7 ตำแหน่งที่บาดเจ็บ */
    var s7 = content("ตำแหน่งที่บาดเจ็บ", "จำนวนผู้บาดเจ็บแยกตามส่วนของร่างกาย (ซ้าย/ขวาตามตัวผู้บาดเจ็บ)");
    var bp = (r.body_parts || []).slice(0, 12);
    hbar(s7, "ส่วนของร่างกาย", bp, 0.6, 8.0, function () { return C.orange; });
    var ip = r.injured_persons || { n: 0 };
    s7.addText([{ text: "ผู้บาดเจ็บทั้งหมด", options: { color: C.mid, fontSize: 14, breakLine: true } }, { text: num(ip.n), options: { color: C.blue, bold: true, fontSize: 44 } }], { x: 9.2, y: 2.0, w: 3.5, h: 1.6, fontFace: FONT, valign: "top" });

    /* 8 Heatmap Plant × ไตรมาส — เฉพาะ Plant ที่มีเหตุการณ์ (Plant ที่เป็น 0 สรุปเป็นข้อความท้ายตาราง) */
    var hm = r.heatmap || { quarters: [], plants: [], cells: [] }, cell = {}, tot = {};
    hm.cells.forEach(function (c) { cell[c.plant_id + "|" + c.quarter] = c; tot[c.plant_id] = (tot[c.plant_id] || 0) + (c.suppressed ? 1.5 : (c.n || 0)); });
    var hp = hm.plants.slice().sort(function (a, b) { return (tot[b.id] || 0) - (tot[a.id] || 0) || String(a.code).localeCompare(String(b.code)); });
    var hact = hp.filter(function (p) { return (tot[p.id] || 0) > 0; }), hzero = hp.length - hact.length;
    var pages = chunk(hact, 32); if (!pages.length) pages = [[]];
    pages.forEach(function (pg, pi) {
      var s8 = content("Plant × ไตรมาส (Heatmap)" + (pages.length > 1 ? " — " + (pi + 1) + "/" + pages.length : ""), "จำนวนเคสต่อไตรมาส เรียงจากมากไปน้อย · สีเข้ม = เคสมาก · \"<3\" = ปิดบังค่าน้อย" + (hzero ? " · อีก " + hzero + " Plant ไม่มีเหตุการณ์ในช่วงนี้" : ""));
      if (!pg.length) { s8.addText("ไม่มีเหตุการณ์ในช่วงที่เลือก (Plant ทั้งหมด " + hp.length + " แห่งเป็น 0)", { x: 0.6, y: 2, w: 9, h: 0.5, fontFace: FONT, fontSize: 16, color: C.mid }); return; }
      chunk(pg, 16).forEach(function (blk, bi) {
        var rows = [[{ text: "Plant", options: { bold: true, color: C.white, fill: { color: C.blue }, fontFace: FONT, fontSize: 11 } }].concat(hm.quarters.map(function (q) { return { text: q.replace("-", " "), options: { bold: true, color: C.white, fill: { color: C.blue }, align: "center", fontFace: FONT, fontSize: 11 } }; }))];
        blk.forEach(function (p) {
          rows.push([{ text: p.code, options: { fontFace: FONT, fontSize: 11, color: C.text, fill: { color: "FFFFFF" } } }].concat(hm.quarters.map(function (q) {
            var c = cell[p.id + "|" + q] || { n: 0 }, h = heatFill(c); return { text: c.n === 0 ? "·" : num(c.n), options: { align: "center", bold: true, fontFace: FONT, fontSize: 11, color: h.t, fill: { color: h.f } } };
          })));
        });
        var tw = pg.length > 16 ? 5.9 : 8.0;
        s8.addTable(rows, { x: 0.6 + bi * 6.2, y: 1.5, w: tw, colW: [1.6].concat(hm.quarters.map(function () { return (tw - 1.6) / Math.max(1, hm.quarters.length); })), rowH: 0.3, border: { type: "solid", color: "FFFFFF", pt: 1 } });
      });
    });

    /* 9 เปรียบเทียบแต่ละ Plant */
    var bpl = (r.by_plant || []).slice().sort(function (a, b) { return nz(b.total) - nz(a.total) || nz(b.serious) - nz(a.serious) || String(a.code).localeCompare(String(b.code)); });
    var bact = bpl.filter(function (p) { return nz(p.total) > 0; }), bzero = bpl.length - bact.length;
    var bpages = chunk(bact, 14); if (!bpages.length) bpages = [[]];
    bpages.forEach(function (pg, pi) {
      var s9 = content("เปรียบเทียบแต่ละ Plant" + (bpages.length > 1 ? " — " + (pi + 1) + "/" + bpages.length : ""), "ใช้เรียนรู้จาก Plant อื่นและปรับปรุง Plant ของตนเอง (จำนวนเคส ไม่ปรับตามขนาดโรงงาน)" + (bzero ? " · อีก " + bzero + " Plant เป็น 0" : ""));
      if (!pg.length) { s9.addText("ไม่มีเหตุการณ์ในช่วงที่เลือก", { x: 0.6, y: 2, w: 9, h: 0.5, fontFace: FONT, fontSize: 16, color: C.mid }); return; }
      var hd = function (t, al) { return { text: t, options: { bold: true, color: C.white, fill: { color: C.blue }, fontFace: FONT, fontSize: 12, align: al || "right" } }; };
      var rows = [[hd("Plant", "left"), hd("ทั้งหมด"), hd("รุนแรง"), hd("LTI"), hd("Near miss")]];
      pg.forEach(function (p, i) {
        var f = { color: i % 2 ? "F8FAFC" : "FFFFFF" }, cl = function (v) { return { text: num(v), options: { align: "right", fontFace: FONT, fontSize: 12, bold: v !== 0, color: v === 0 ? "9CA3AF" : C.blue, fill: f } }; };
        rows.push([{ text: p.code + " " + p.name, options: { fontFace: FONT, fontSize: 12, color: C.text, fill: f } }, cl(p.total), cl(p.serious), cl(p.lti), cl(p.near_miss)]);
      });
      s9.addTable(rows, { x: 0.6, y: 1.5, w: W - 1.2, colW: [6.5, 1.5, 1.5, 1.5, 1.13], rowH: 0.34, border: { type: "solid", color: "E5E7EB", pt: 0.5 } });
    });

    /* 10 เหตุการณ์ล่าสุด (ไม่แสดงรายละเอียดเคสและข้อมูลระบุตัวตน) */
    var s10 = content("เหตุการณ์ล่าสุด", "เคสล่าสุดตามตัวกรอง (ไม่แสดงรายละเอียดและข้อมูลระบุตัวตน)");
    var PH = ctx.PHASE || {}, lat = (r.latest || []).slice(0, 12);
    var hh = function (t) { return { text: t, options: { bold: true, color: C.white, fill: { color: C.blue }, fontFace: FONT, fontSize: 12 } }; };
    var lrows = [[hh("วันที่"), hh("Plant"), hh("ประเภท"), hh("ความรุนแรง"), hh("สถานะ")]];
    lat.forEach(function (x, i) {
      var f = { color: i % 2 ? "F8FAFC" : "FFFFFF" }, code = SEV[x.severity_code] ? x.severity_code : "UNK", t = function (v) { return { text: String(v == null ? "" : v), options: { fontFace: FONT, fontSize: 12, color: C.text, fill: f } }; };
      lrows.push([t(fmt(x.occurred_on)), t(x.plant_code), t(x.type_name), { text: x.severity_name || (x.is_serious ? "รุนแรง" : "ทั่วไป"), options: { fontFace: FONT, fontSize: 12, bold: true, color: SEV_TXT[code], fill: { color: SEV[code] } } }, t(PH[x.phase] || x.phase)]);
    });
    if (lat.length) s10.addTable(lrows, { x: 0.6, y: 1.5, w: W - 1.2, colW: [1.9, 1.7, 3.2, 3.3, 2.03], rowH: 0.36, border: { type: "solid", color: "E5E7EB", pt: 0.5 } });
    else s10.addText("ไม่มีเคสในช่วงที่เลือก", { x: 0.6, y: 2, w: 6, h: 0.5, fontFace: FONT, fontSize: 16, color: C.mid });

    /* 11 หมายเหตุและนิยาม */
    var s11 = content("หมายเหตุและนิยามข้อมูล", "อ่านก่อนนำตัวเลขไปใช้ตัดสินใจ");
    s11.addText([
      { text: "ตัวเลขทั้งหมดเป็นจำนวนเคสที่บันทึกในระบบ ยังไม่ปรับตามขนาดโรงงาน/ชั่วโมงทำงาน จึงใช้เปรียบเทียบเชิงแนวโน้มเท่านั้น (ไม่ใช่คะแนนหรืออันดับ)", options: { bullet: true, breakLine: true } },
      { text: "ค่าที่น้อยกว่า 3 เคสถูกปิดบังเป็น \"<3\" เพื่อลดความเสี่ยงการระบุตัวบุคคลจากกลุ่มเล็ก", options: { bullet: true, breakLine: true } },
      { text: "จำนวน Near miss ที่สูงมักสะท้อนวัฒนธรรมการรายงานที่ดี ไม่ได้หมายถึง Plant ที่อันตรายกว่า", options: { bullet: true, breakLine: true } },
      { text: "ระดับความรุนแรง: FAT เสียชีวิต · LTI บาดเจ็บถึงขั้นหยุดงาน · RWC จำกัดงาน · MTC รักษาพยาบาล · FAC ปฐมพยาบาล · PD ทรัพย์สินเสียหาย · NEAR เหตุเกือบเกิดอุบัติเหตุ", options: { bullet: true, breakLine: true } },
      { text: "เคสเก่าที่ยังไม่ได้ระบุประเภท/ความรุนแรง/ผู้เกี่ยวข้องตามโครงสร้างใหม่ แสดงเป็น \"ไม่ระบุ\"", options: { bullet: true, breakLine: true } },
      { text: "แนวคิดการติดตามและวิเคราะห์ผลด้านความปลอดภัยสอดคล้องกับ ISO 45001:2018 ข้อ 9.1 (Monitoring, measurement, analysis and performance evaluation)", options: { bullet: true } }],
      { x: 0.6, y: 1.5, w: W - 1.2, h: 5.0, fontFace: FONT, fontSize: 14, color: C.text, valign: "top", paraSpaceAfter: 10 });

    await pptx.writeFile({ fileName: "SHE-Executive-Dashboard_" + stamp + ".pptx" });
    return pptx;
  };
})();
