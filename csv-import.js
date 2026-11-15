/* csv-import.js — ตัวกลางนำเข้า/ส่งออก CSV ที่ใช้ร่วมทุกหน้า (หลักการ: ทุกรายการหลักต้องมี Template + Import)
   ใช้: SHEImport.mount(element, config)  — ดู config ท้ายไฟล์ (ตัวอย่างการเรียกอยู่ในแต่ละหน้า)
   ความปลอดภัย: สร้าง DOM ด้วย textContent เท่านั้น (OWASP A03); ไฟล์ถูกอ่านในเบราว์เซอร์แล้วส่งเป็น JSON ให้ RPC ตรวจซ้ำฝั่งฐานข้อมูล
   (สิทธิ์จริงบังคับที่ RPC/RLS — หน้านี้เป็นเพียงหน้าจอ); กัน CSV/Formula injection ทั้งขาออก (prefix ') และขาเข้า (RPC ปฏิเสธ = + - @) */
(function () {
  "use strict";
  var EN = !!(window.I18N && window.I18N.lang === "en");
  function t(x) { return Array.isArray(x) ? (EN ? x[1] : x[0]) : (x || ""); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function nd(e) { e.setAttribute("data-no-i18n", ""); return e; }

  var css = ".imp{background:#fff;border:1px solid #D5DCEF;border-radius:18px;padding:1rem 1.1rem;margin:1rem 0}" +
    ".imp h3{margin:.1rem 0 .4rem;color:var(--navy,#1F3A8A)}" +
    ".imp .guide{background:#F4F7FF;border:1px solid #C9D5F5;border-radius:14px;padding:.7rem .9rem;margin:.6rem 0}" +
    ".imp .guide summary{cursor:pointer;font-weight:700;color:var(--navy,#1F3A8A)}" +
    ".imp .guide ol{margin:.3rem 0 .3rem 1.2rem;padding:0}.imp .guide li{margin:.2rem 0}" +
    ".imp .cols{overflow-x:auto}.imp table.ct{border-collapse:collapse;width:100%;min-width:560px;background:#fff}" +
    ".imp table.ct th,.imp table.ct td{border:1px solid #D5DCEF;padding:.4rem .55rem;text-align:left;vertical-align:top;font-size:.92rem}" +
    ".imp table.ct th{background:#E8EEFB}.imp .req{color:#8C1D18;font-weight:700}.imp .opt{color:#6B7280}" +
    ".imp .acts{display:flex;flex-wrap:wrap;gap:.6rem;margin:.7rem 0}.imp .acts button{min-height:44px}" +
    ".imp .frm{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:.7rem .9rem;align-items:end;margin:.7rem 0}" +
    ".imp .frm label{display:flex;flex-direction:column;gap:.25rem;font-weight:700;font-size:.95rem}" +
    ".imp .frm input{min-height:46px;font:inherit;font-weight:400}.imp .wide{grid-column:1/-1}" +
    ".imp .fh{font-weight:400;font-size:.85rem;color:#4B5563}" +
    ".imp .sum{display:flex;flex-wrap:wrap;gap:.5rem;margin:.6rem 0}" +
    ".imp .tg{display:inline-block;border-radius:999px;padding:.1rem .65rem;font-size:.85rem;font-weight:700;background:#EEE;color:#333}" +
    ".imp .tg.ok{background:#E3F6E8;color:#14532D}.imp .tg.bad{background:#FDECEA;color:#8C1D18}" +
    ".imp .errs{margin:.4rem 0 .4rem 1.2rem;padding:0}.imp .res[hidden],.imp [hidden]{display:none!important}" +
    ".imp .m{padding:.55rem .8rem;border-radius:12px;margin:.6rem 0}.imp .m.ok{background:#E3F6E8;color:#14532D}.imp .m.err{background:#FDECEA;color:#8C1D18}";
  var styled = false;
  function ensureStyle() { if (styled) return; styled = true; document.head.appendChild(el("style", null, css)); }

  function csvCell(v) {
    var s = v == null ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function download(name, text) {
    var blob = new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function parseCsv(text) {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    var rows = [], row = [], f = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
      else if (c === "\r") { /* ข้าม */ }
      else f += c;
    }
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (x) { return x.trim() !== ""; }); });
  }

  function errText(e) {
    var c = e && e.code, m = (e && e.message) || "";
    if (c === "42501") return t(["คุณไม่มีสิทธิ์ทำรายการนี้ (Admin เท่านั้น)", "You do not have permission (Admin only)"]);
    if (c === "22023") return /reason/i.test(m) ? t(["กรุณาระบุเหตุผล 5–200 ตัวอักษร", "Please enter a reason of 5–200 characters"]) : /items/i.test(m) ? t(["จำนวนแถวเกินที่อนุญาต", "Too many rows"]) : t(["ข้อมูลไม่ถูกต้อง", "Invalid data"]);
    return t(["ทำรายการไม่สำเร็จ กรุณาติดต่อ Admin", "Action failed. Please contact Admin"]);
  }

  /* cfg: { title:[th,en], what:[th,en], rpc, exportRpc, filename, maxRows, exampleKey, columns:[{key, req, th:[th,en], help:[th,en], ex}], examples:[{...}],
            onDone:function(){}, extraNote:[th,en] } */
  function mount(host, cfg) {
    ensureStyle(); host.replaceChildren();
    var cols = cfg.columns.map(function (c) { return c.key; });
    var maxRows = cfg.maxRows || 500;
    var box = nd(el("section", "imp")); host.appendChild(box);
    box.appendChild(el("h3", null, t(cfg.title)));
    box.appendChild(el("p", null, t(cfg.what)));

    var g = el("details", "guide"); g.open = false;
    g.appendChild(el("summary", null, t(["วิธีใช้และความหมายของแต่ละคอลัมน์ (อ่านก่อนนำเข้า)", "How to use, and what each column means (read before importing)"])));
    var ol = el("ol");
    [["กด \"ดาวน์โหลดไฟล์ตัวอย่าง\" จะได้ไฟล์ CSV ที่มีหัวคอลัมน์และแถวตัวอย่าง (รหัสขึ้นต้นด้วย EXAMPLE)", "Press \"Download example file\" to get a CSV with the header row and example rows (codes start with EXAMPLE)."],
     ["เปิดด้วย Excel กรอกข้อมูลจริงของคุณ ลบแถวตัวอย่างออก แล้วบันทึกเป็น CSV UTF-8 (Save As → CSV UTF-8) อย่าเพิ่ม ลบ หรือสลับคอลัมน์", "Open it in Excel, enter your real data, delete the example rows, and save as CSV UTF-8 (Save As → CSV UTF-8). Do not add, remove or reorder columns."],
     ["เลือกไฟล์ แล้วกด \"ตรวจไฟล์ (Dry-run)\" ระบบจะแสดงผลว่าจะเพิ่ม/แก้กี่แถว และแถวไหนผิด โดยยังไม่บันทึกอะไร", "Choose the file and press \"Check file (Dry-run)\". The system shows how many rows will be added/updated and which rows are wrong, without saving anything."],
     ["ถ้าไม่มีแถวผิด พิมพ์เหตุผล แล้วกด \"ยืนยันนำเข้า\" ถ้ามีแถวผิดแม้แถวเดียวจะไม่บันทึกเลย (แก้ไฟล์แล้วตรวจใหม่)", "If no rows are wrong, type a reason and press \"Confirm import\". If even one row is wrong nothing is saved (fix the file and check again)."],
     ["รหัสที่มีอยู่แล้วจะถูกอัปเดตชื่อ/สถานะ ไม่มีอะไรถูกลบ หากต้องการเลิกใช้ ให้ใส่ active = false", "A code that already exists is updated (name/status). Nothing is deleted; to retire an item set active = false."]
    ].forEach(function (s) { ol.appendChild(el("li", null, t(s))); });
    g.appendChild(ol);
    if (cfg.extraNote) g.appendChild(el("p", null, t(cfg.extraNote)));
    var cw = el("div", "cols"), tb = el("table", "ct");
    var hr = el("tr");
    [["คอลัมน์", "Column"], ["ต้องกรอก?", "Required?"], ["ความหมาย", "Meaning"], ["ตัวอย่าง", "Example"]].forEach(function (h) { hr.appendChild(el("th", null, t(h))); });
    var th = el("thead"); th.appendChild(hr); tb.appendChild(th);
    var tbd = el("tbody");
    cfg.columns.forEach(function (c) {
      var r = el("tr");
      r.appendChild(nd(el("td", null, c.key)));
      r.appendChild(el("td", c.req ? "req" : "opt", c.req ? t(["ต้องกรอก", "Required"]) : t(["ไม่บังคับ", "Optional"])));
      r.appendChild(el("td", null, t(c.help)));
      r.appendChild(nd(el("td", null, c.ex == null ? "" : String(c.ex))));
      tbd.appendChild(r);
    });
    tb.appendChild(tbd); cw.appendChild(tb); g.appendChild(cw); box.appendChild(g);

    var msg = el("div", "m"); msg.hidden = true; msg.setAttribute("role", "status"); box.appendChild(msg);
    function show(text, ok) { msg.hidden = false; msg.className = "m " + (ok ? "ok" : "err"); msg.textContent = text; }

    var acts = el("div", "acts"); box.appendChild(acts);
    function btn(label, cls) { var b = el("button", cls || "secondary", t(label)); b.type = "button"; acts.appendChild(b); return b; }
    var bEx = btn(["ดาวน์โหลดไฟล์ตัวอย่าง (มีแถวตัวอย่าง)", "Download example file (with example rows)"]);
    var bTp = btn(["ดาวน์โหลดไฟล์เปล่า (หัวคอลัมน์อย่างเดียว)", "Download blank file (header only)"]);
    var bEp = cfg.exportRpc ? btn(["ส่งออกข้อมูลปัจจุบัน (CSV)", "Export current data (CSV)"]) : null;

    bEx.addEventListener("click", function () {
      var lines = [cols.join(",")].concat((cfg.examples || []).map(function (r) { return cols.map(function (k) { return csvCell(r[k]); }).join(","); }));
      download(cfg.filename + "-example.csv", lines.join("\r\n") + "\r\n");
    });
    bTp.addEventListener("click", function () { download(cfg.filename + "-template.csv", cols.join(",") + "\r\n"); });
    if (bEp) bEp.addEventListener("click", async function () {
      var r = await sb.rpc(cfg.exportRpc);
      if (r.error) { show(errText(r.error), false); return; }
      var rows = r.data || [];
      if (!rows.length) { show(t(["ยังไม่มีข้อมูลให้ส่งออก ให้ดาวน์โหลดไฟล์ตัวอย่างไปกรอกก่อน", "Nothing to export yet. Download the example file and fill it in first."]), false); return; }
      var lines = [cols.join(",")].concat(rows.map(function (x) { return cols.map(function (k) { return csvCell(x[k]); }).join(","); }));
      download(cfg.filename + "-export.csv", lines.join("\r\n") + "\r\n");
    });

    var frm = el("div", "frm"); box.appendChild(frm);
    var lf = el("label", "wide"); lf.appendChild(document.createTextNode(t(["ไฟล์ CSV (สูงสุด " + maxRows + " แถว)", "CSV file (max " + maxRows + " rows)"])));
    var file = el("input"); file.type = "file"; file.accept = ".csv,text/csv"; lf.appendChild(file);
    lf.appendChild(el("span", "fh", t(["ต้องเป็น CSV UTF-8 ที่มีหัวคอลัมน์ตรงกับไฟล์ตัวอย่างทุกคอลัมน์", "Must be CSV UTF-8 whose header matches the example file exactly."])));
    frm.appendChild(lf);
    var lr = el("label", "wide"); lr.appendChild(document.createTextNode(t(["เหตุผล (5–200 ตัวอักษร ใช้เมื่อยืนยันนำเข้า)", "Reason (5–200 characters, used when you confirm)"])));
    var reason = el("input"); reason.type = "text"; reason.maxLength = 200; reason.autocomplete = "off"; lr.appendChild(reason);
    lr.appendChild(el("span", "fh", t(["เก็บใน Audit log เช่น \"นำเข้ารายชื่อพื้นที่ตามไฟล์ของโรงงาน\" (ตัวอย่าง)", "Kept in the Audit log, e.g. \"Imported area list from the plant file\" (example)."])));
    frm.appendChild(lr);

    var prev = el("div", "prev"); prev.hidden = true; box.appendChild(prev);
    var acts2 = el("div", "acts"); box.appendChild(acts2);
    var bDry = el("button", "secondary", t(["ตรวจไฟล์ (Dry-run)", "Check file (Dry-run)"])); bDry.type = "button"; acts2.appendChild(bDry);
    var bApply = el("button", "btn-ok", t(["ยืนยันนำเข้า", "Confirm import"])); bApply.type = "button"; bApply.disabled = true; acts2.appendChild(bApply);

    var res = el("div", "res"); res.hidden = true; box.appendChild(res);
    var sum = el("div", "sum"), errs = el("ul", "errs"); res.appendChild(sum); res.appendChild(errs);

    var parsed = null, dryOk = false;
    var EDIT_MAX = 300, errLines = {};
    function touch() { dryOk = false; bApply.disabled = true; res.hidden = true; errLines = {}; }
    function renderPrev() {
      prev.replaceChildren(); prev.hidden = !parsed;
      if (!parsed) return;
      prev.appendChild(el("p", "fh", t(["ตรวจและแก้ไขข้อมูลในตารางได้ก่อนกด Dry-run (การแก้ไขนี้ยังไม่ถูกบันทึก และไม่แก้ไฟล์ต้นฉบับ) ทั้งหมด ", "Review and edit the data below before the Dry-run (edits are not saved and do not change your original file). Total rows: "]) + parsed.length + t([" แถว", ""])));
      if (parsed.length > EDIT_MAX) prev.appendChild(el("p", "fh", t(["แสดงให้แก้ไข " + EDIT_MAX + " แถวแรก แถวที่เหลือส่งตามไฟล์เดิม (แก้ในไฟล์ได้)", "Showing the first " + EDIT_MAX + " rows for editing; the rest are sent as in the file (edit them in the file)."])));
      var wrap = el("div", "tablewrap"), tb = el("table"), hd = el("tr");
      hd.appendChild(el("th", null, "#"));
      cols.forEach(function (c) { hd.appendChild(el("th", null, c)); });
      hd.appendChild(el("th", null, ""));
      var th = el("thead"); th.appendChild(hd); tb.appendChild(th);
      var body = el("tbody");
      parsed.slice(0, EDIT_MAX).forEach(function (row, idx) {
        var tr = el("tr");
        if (errLines[idx + 1]) tr.style.background = "#FEE2E2";
        tr.appendChild(el("td", null, String(idx + 1)));
        cols.forEach(function (c) {
          var td = el("td"), inp = el("input"); inp.type = "text"; inp.maxLength = 300; inp.value = row[c] || ""; inp.setAttribute("aria-label", c + " " + (idx + 1));
          inp.style.minWidth = "7rem";
          inp.addEventListener("input", function () { row[c] = inp.value; touch(); });
          td.appendChild(inp); tr.appendChild(td);
        });
        var tdx = el("td"), del = el("button", "secondary small", "✕"); del.type = "button"; del.setAttribute("aria-label", t(["ลบแถว ", "Delete row "]) + (idx + 1));
        del.addEventListener("click", function () { parsed.splice(idx, 1); touch(); renderPrev(); });
        tdx.appendChild(del); tr.appendChild(tdx);
        body.appendChild(tr);
      });
      tb.appendChild(body); wrap.appendChild(tb); nd(wrap); prev.appendChild(wrap);
      var add = el("button", "secondary small", t(["+ เพิ่มแถว", "+ Add row"])); add.type = "button";
      add.addEventListener("click", function () { if (parsed.length >= maxRows) return; var o = {}; cols.forEach(function (c) { o[c] = ""; }); parsed.push(o); touch(); renderPrev(); });
      prev.appendChild(add);
    }
    file.addEventListener("change", async function () {
      touch(); parsed = null; renderPrev();
      if (!file.files[0]) return;
      try { parsed = await readRows(); renderPrev(); show(t(["อ่านไฟล์แล้ว ยังไม่บันทึกอะไร ตรวจ/แก้ไขในตารางแล้วกด \"ตรวจไฟล์ (Dry-run)\"", "File read. Nothing saved. Review/edit the table, then press \"Check file (Dry-run)\"."]), true); }
      catch (e) { show(e.message, false); }
    });

    function readRows() {
      return new Promise(function (resolve, reject) {
        var f = file.files[0];
        if (!f) return reject(new Error(t(["กรุณาเลือกไฟล์ CSV", "Please choose a CSV file"])));
        if (f.size > 2 * 1024 * 1024) return reject(new Error(t(["ไฟล์ใหญ่เกิน 2 MB", "File is larger than 2 MB"])));
        var rd = new FileReader();
        rd.onload = function () {
          var rows = parseCsv(String(rd.result));
          if (rows.length < 2) return reject(new Error(t(["ไฟล์ไม่มีข้อมูล (ต้องมีหัวคอลัมน์และอย่างน้อย 1 แถว)", "The file has no data (needs a header row and at least 1 data row)"])));
          var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
          var missing = cols.filter(function (c) { return head.indexOf(c) < 0; });
          var extra = head.filter(function (h) { return cols.indexOf(h) < 0; });
          if (missing.length || extra.length) {
            return reject(new Error(t(["หัวคอลัมน์ไม่ตรงกับไฟล์ตัวอย่าง", "Header does not match the example file"]) +
              (missing.length ? " | " + t(["ขาด: ", "Missing: "]) + missing.join(", ") : "") + (extra.length ? " | " + t(["เกิน: ", "Unexpected: "]) + extra.join(", ") : "")));
          }
          if (rows.length - 1 > maxRows) return reject(new Error(t(["ไฟล์มีมากกว่า " + maxRows + " แถว (แบ่งไฟล์)", "More than " + maxRows + " rows (split the file)"])));
          resolve(rows.slice(1).map(function (r) { var o = {}; cols.forEach(function (c) { o[c] = (r[head.indexOf(c)] || "").trim(); }); return o; }));
        };
        rd.onerror = function () { reject(new Error(t(["อ่านไฟล์ไม่สำเร็จ", "Could not read the file"]))); };
        rd.readAsText(f, "utf-8");
      });
    }
    function showResult(r) {
      res.hidden = false; sum.replaceChildren();
      [[t(["เพิ่มใหม่", "Added"]), r.added, "ok"], [t(["แก้ไข", "Updated"]), r.updated, "ok"], [t(["ไม่เปลี่ยน", "Unchanged"]), r.unchanged, ""],
       [t(["แถวผิดพลาด", "Rows with errors"]), (r.errors || []).length, (r.errors || []).length ? "bad" : "ok"]]
        .forEach(function (x) { sum.appendChild(el("span", "tg " + x[2], x[0] + ": " + (x[1] || 0))); });
      errs.replaceChildren();
      (r.errors || []).slice(0, 200).forEach(function (e) { errs.appendChild(nd(el("li", null, t(["แถว ", "Row "]) + e.line + (e.code ? " (" + e.code + ")" : "") + ": " + e.message))); });
    }
    async function run(dry) {
      var why = reason.value.trim();
      if (!dry && (why.length < 5 || why.length > 200)) { show(t(["กรุณาระบุเหตุผล 5–200 ตัวอักษร", "Please enter a reason of 5–200 characters"]), false); reason.focus(); return; }
      if (!parsed || !parsed.length) { show(t(["กรุณาเลือกไฟล์ CSV ก่อน", "Please choose a CSV file first"]), false); return; }
      var ek = cfg.exampleKey;
      if (ek && parsed.some(function (r) { return /^EXAMPLE/i.test(r[ek] || ""); })) {
        show(t(["ไฟล์ยังมีแถวตัวอย่าง (รหัสขึ้นต้นด้วย EXAMPLE) กรุณาลบแถวตัวอย่างและใส่ข้อมูลจริงก่อน", "The file still has example rows (codes starting with EXAMPLE). Delete them and enter real data first."]), false); return;
      }
      var r = await sb.rpc(cfg.rpc, { p_rows: parsed, p_dry_run: dry, p_reason: why || null });
      if (r.error) { show(errText(r.error), false); return; }
      var data = r.data; showResult(data);
      errLines = {}; (data.errors || []).forEach(function (e) { errLines[e.line] = true; }); renderPrev();
      var bad = (data.errors || []).length > 0;
      if (dry) { dryOk = !bad; bApply.disabled = bad; show(bad ? t(["พบแถวผิดพลาด (แถวสีแดงในตาราง) แก้ไขในตารางแล้วตรวจใหม่ (ยังไม่ได้บันทึกอะไร)", "Errors found (red rows in the table). Edit them in the table and check again (nothing was saved)."]) : t(["ตรวจไฟล์ผ่าน ยังไม่บันทึก กรอกเหตุผลแล้วกด \"ยืนยันนำเข้า\"", "File is valid. Nothing saved yet. Enter a reason and press \"Confirm import\"."]), !bad); }
      else if (data.applied) { show(t(["นำเข้าเรียบร้อย", "Import completed"]), true); file.value = ""; parsed = null; renderPrev(); dryOk = false; bApply.disabled = true; if (cfg.onDone) cfg.onDone(); }
      else show(t(["ไม่ได้บันทึก เนื่องจากมีแถวผิดพลาด", "Not saved because some rows have errors"]), false);
    }
    bDry.addEventListener("click", function () { run(true); });
    bApply.addEventListener("click", function () {
      if (dryOk && window.confirm(t(["ยืนยันนำเข้าข้อมูลตามไฟล์นี้?", "Confirm importing the data in this file?"]))) run(false);
    });
  }
  window.SHEImport = { mount: mount, parseCsv: parseCsv, csvCell: csvCell };
})();
