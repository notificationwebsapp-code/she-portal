/* SHE Portal — แบบทวนข้อมูลรายเคส (B32)
   ใช้ร่วมกันระหว่างหน้า incident.html (หลังส่ง Flash Report) และ records.html (หน้ารายละเอียดเคส)
   - คำตอบเก็บเป็นโครงสร้าง (ใช่ / ไม่ใช่ / ยังไม่ทราบ / ไม่เกี่ยวข้อง) ผ่าน RPC incident_answer_set (สิทธิ์ตรวจที่ฐานข้อมูล)
   - แสดงข้อมูลด้วย textContent เท่านั้น (OWASP A03) | ถ้ายังไม่ได้รัน migration-B32 จะไม่แสดงอะไร (ไม่กระทบหน้าเดิม) */
(function () {
  "use strict";
  var ANS = [["yes", "ใช่"], ["no", "ไม่ใช่"], ["unknown", "ยังไม่ทราบ"], ["na", "ไม่เกี่ยวข้อง"]];
  var ANS_TH = {}; ANS.forEach(function (a) { ANS_TH[a[0]] = a[1]; });
  var STAGE_TH = { reporter_submit: "ตอนส่งรายงาน", investigation_start: "ตอนเริ่มสอบสวน", investigation_done: "ก่อนปิดการสอบสวน" };
  var cache = {};

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function nm(o, f) { return typeof window.dbName === "function" ? window.dbName(o, f) : (o[f + "_th"] || ""); }
  function errText(e) {
    var c = e && e.code, m = (e && e.message) || "";
    if (c === "42501") return "คุณไม่มีสิทธิ์ตอบข้อนี้ในเคสนี้";
    if (c === "22023" && /closed/i.test(m)) return "เคสนี้ปิดแล้ว แก้คำตอบไม่ได้ (ต้องเปิดเคสใหม่ก่อน)";
    if (c === "22023" && /Item is required/i.test(m)) return "กรุณาเลือกข้อที่เกี่ยวข้อง";
    if (c === "22023") return "ข้อมูลที่ส่งไม่ถูกต้อง";
    return "บันทึกไม่สำเร็จ";
  }
  function injectCss() {
    if (document.getElementById("rv-css")) return;
    var s = document.createElement("style"); s.id = "rv-css";
    s.textContent =
      ".rvbox{background:#fff;border:1px solid #d9dee8;border-radius:16px;padding:1rem 1.1rem;margin:1rem 0}" +
      ".rvbox h4{margin:0 0 .25rem}.rvbox .rvintro{margin:.1rem 0 .7rem;font-size:.92rem;color:#394150}" +
      ".rvq{border-top:1px solid #e6e9f0;padding:.7rem 0}.rvq:first-of-type{border-top:0}" +
      ".rvq .rvt{font-weight:600;margin:0 0 .15rem}.rvq .rvh{margin:0 0 .4rem;font-size:.88rem;color:#4b5565}" +
      ".rvq .rvopts{display:flex;flex-wrap:wrap;gap:.4rem .6rem;margin:.2rem 0}" +
      ".rvq .rvopts label{display:inline-flex;align-items:center;gap:.35rem;min-height:44px;padding:0 .8rem;border-radius:12px;background:#F0F0F3;cursor:pointer;font-weight:500}" +
      ".rvq .rvopts input{margin:0}.rvq .rvopts label.on{background:#284499;color:#fff}" +
      ".rvq select,.rvq input[type=text]{width:100%;min-height:44px;margin-top:.35rem}" +
      ".rvq .rvst{display:inline-block;margin:.2rem .4rem .2rem 0;padding:.1rem .6rem;border-radius:999px;font-size:.82rem;font-weight:600;background:#eef1f6;color:#1d2433}" +
      ".rvq .rvst.need{background:#7f1d1d;color:#fff}.rvq .rvst.done{background:#1b7a3d;color:#fff}" +
      ".rvq .rverr{color:#8a1010;font-size:.88rem;margin:.2rem 0 0}" +
      ".rvbar{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-top:.7rem}.rvmsg{font-size:.92rem;margin:0}" +
      ".rvhist{margin-top:.6rem;font-size:.88rem}.rvhist table{width:100%}";
    document.head.appendChild(s);
  }
  async function items(listKey) {
    if (cache[listKey]) return cache[listKey];
    var r = await sb.rpc("master_list_items_get", { p_list: listKey, p_include_inactive: false });
    cache[listKey] = r.data || []; return cache[listKey];
  }

  /* host: element | incidentId | opts { stages: [..]|null, title, intro, saveLabel, onSaved } → true ถ้าแสดงแบบทวนได้ */
  async function mount(host, incidentId, opts) {
    opts = opts || {}; injectCss(); host.replaceChildren();
    var r = await sb.rpc("incident_answers_get", { p_incident: incidentId });
    if (r.error || !Array.isArray(r.data)) return false;
    var qs = r.data.filter(function (q) { return !opts.stages || opts.stages.indexOf(q.ask_stage) >= 0; });
    if (!qs.length) return false;
    var box = el("section", "rvbox"); box.setAttribute("aria-label", opts.title || "แบบทวนข้อมูลเคส");
    box.appendChild(el("h4", null, opts.title || "แบบทวนข้อมูลเคส"));
    box.appendChild(el("p", "rvintro", opts.intro || "ตอบเพื่อให้ข้อมูลของเคสครบ ใช้ทำรายงานและ Dashboard · ตอบ \"ยังไม่ทราบ\" ได้ และกลับมาแก้คำตอบได้ตลอดจนกว่าเคสจะปิด"));
    var rows = [], anyEdit = false;
    for (var i = 0; i < qs.length; i++) rows.push(await buildRow(box, qs[i], incidentId, r.data.indexOf(qs[i])));
    rows.forEach(function (x) { if (x.canEdit) anyEdit = true; });
    var bar = el("div", "rvbar"), msg = el("p", "rvmsg"); msg.setAttribute("role", "status");
    if (anyEdit) {
      var sv = el("button", null, opts.saveLabel || "บันทึกคำตอบ"); sv.type = "button";
      sv.addEventListener("click", async function () {
        sv.disabled = true; msg.textContent = "กำลังบันทึก…"; var okN = 0, bad = 0;
        for (var k = 0; k < rows.length; k++) { var res = await rows[k].save(); if (res === true) okN++; else if (res === false) bad++; }
        sv.disabled = false;
        msg.textContent = bad ? "บันทึกแล้ว " + okN + " ข้อ · มี " + bad + " ข้อที่บันทึกไม่ได้ (ดูข้อความใต้ข้อนั้น)" : okN ? "บันทึกแล้ว " + okN + " ข้อ — กลับมาแก้ไขได้ที่หน้ารายละเอียดเคส" : "ยังไม่มีคำตอบใหม่ให้บันทึก";
        if (okN && typeof opts.onSaved === "function") opts.onSaved();
      });
      bar.appendChild(sv);
    }
    var hb = el("button", "secondary", "ดูประวัติการตอบ"); hb.type = "button"; var hh = el("div", "rvhist"); hh.hidden = true;
    hb.addEventListener("click", async function () {
      if (!hh.hidden) { hh.hidden = true; return; }
      hh.replaceChildren(el("p", null, "กำลังโหลด…")); hh.hidden = false;
      var h = await sb.rpc("incident_answer_history_get", { p_incident: incidentId });
      hh.replaceChildren();
      if (h.error || !h.data || !h.data.length) { hh.appendChild(el("p", null, "ยังไม่มีประวัติการตอบ")); return; }
      var t = el("table"), th = el("tr");
      ["เวลา", "ข้อ", "คำตอบ", "หมายเหตุ / เหตุผลการแก้"].forEach(function (x) { th.appendChild(el("th", null, x)); }); t.appendChild(th);
      h.data.forEach(function (x) { var tr = el("tr"), c;
        c = el("td", null, new Date(x.changed_at).toLocaleString("th-TH")); c.setAttribute("data-no-i18n", ""); tr.appendChild(c);
        c = el("td", null, x.code); c.setAttribute("data-no-i18n", ""); tr.appendChild(c);
        c = el("td", null, (ANS_TH[x.answer] || x.answer) + (x.item_code ? " · " + x.item_code : "")); c.setAttribute("data-no-i18n", ""); tr.appendChild(c);
        c = el("td", null, [x.note, x.reason].filter(Boolean).join(" / ") || "-"); c.setAttribute("data-no-i18n", ""); tr.appendChild(c); t.appendChild(tr); });
      hh.appendChild(t);
    });
    bar.appendChild(hb); bar.appendChild(msg); box.appendChild(bar); box.appendChild(hh);
    host.appendChild(box); return true;
  }

  async function buildRow(box, q, incidentId, idx) {
    var wrap = el("div", "rvq"), name = "rv-" + incidentId.slice(0, 8) + "-" + idx;
    var t = el("p", "rvt", nm(q, "text")); t.setAttribute("data-no-i18n", ""); wrap.appendChild(t);
    if (q.help_th) { var hp = el("p", "rvh", q.help_th); hp.setAttribute("data-no-i18n", ""); wrap.appendChild(hp); }
    var st = el("span", "rvst " + (q.answer ? "done" : (q.required_by ? "need" : "")), q.answer ? "ตอบแล้ว" : (q.required_by ? "ต้องตอบก่อนปิดการสอบสวน" : "ยังไม่ตอบ"));
    wrap.appendChild(st); wrap.appendChild(el("span", "rvst", "ถามช่วง: " + (STAGE_TH[q.ask_stage] || q.ask_stage)));
    var opts = el("div", "rvopts"); opts.setAttribute("role", "radiogroup"); opts.setAttribute("aria-label", nm(q, "text"));
    var sel = el("select"), note = el("input"), err = el("p", "rverr"); err.setAttribute("role", "alert");
    var cur = q.answer || "", curItem = q.item_id || "", curNote = q.note || "";
    ANS.forEach(function (a) {
      var lb = el("label"), rd = el("input"); rd.type = "radio"; rd.name = name; rd.value = a[0]; rd.checked = cur === a[0]; rd.disabled = !q.can_edit;
      if (rd.checked) lb.className = "on"; lb.appendChild(rd); lb.appendChild(document.createTextNode(a[0] === "yes" ? "ใช่" : a[1]));
      rd.addEventListener("change", function () { Array.prototype.forEach.call(opts.children, function (x) { x.className = x.firstChild.checked ? "on" : ""; }); syncItem(); });
      opts.appendChild(lb);
    });
    wrap.appendChild(opts);
    function val() { var c = opts.querySelector("input:checked"); return c ? c.value : ""; }
    var withItem = q.kind === "yes_no_item";
    if (withItem) {
      sel.setAttribute("aria-label", "เลือกข้อที่เกี่ยวข้อง"); sel.disabled = !q.can_edit;
      var o0 = el("option", null, "-- เลือกข้อที่เกี่ยวข้อง --"); o0.value = ""; sel.appendChild(o0);
      var its = await items(q.list_key);
      its.forEach(function (x) { var o = el("option", null, x.code + " — " + nm(x, "name")); o.value = x.id; o.setAttribute("data-no-i18n", ""); sel.appendChild(o); });
      if (curItem && !its.some(function (x) { return x.id === curItem; })) { var oc = el("option", null, (q.item_code || "") + " — " + (q.item_name_th || "")); oc.value = curItem; sel.appendChild(oc); }
      sel.value = curItem; wrap.appendChild(sel);
    }
    function syncItem() { if (withItem) sel.hidden = val() !== "yes"; }
    syncItem();
    note.type = "text"; note.maxLength = 500; note.placeholder = "หมายเหตุ (ไม่บังคับ)"; note.setAttribute("aria-label", "หมายเหตุ"); note.value = curNote; note.disabled = !q.can_edit; wrap.appendChild(note);
    wrap.appendChild(err); box.appendChild(wrap);
    return {
      canEdit: !!q.can_edit,
      async save() {
        if (!q.can_edit) return null; err.textContent = "";
        var a = val(); if (!a) return null;
        var item = withItem && a === "yes" ? (sel.value || null) : null, nt = note.value.trim();
        if (a === cur && (item || "") === curItem && nt === curNote) return null;
        if (withItem && a === "yes" && !item) { err.textContent = "กรุณาเลือกข้อที่เกี่ยวข้อง"; return false; }
        var reason = q.answer ? "แก้คำตอบจากหน้าเว็บ" : null;
        var r = await sb.rpc("incident_answer_set", { p_incident: incidentId, p_code: q.code, p_answer: a, p_item: item, p_note: nt || null, p_reason: reason });
        if (r.error) { err.textContent = errText(r.error); return false; }
        cur = a; curItem = item || ""; curNote = nt; st.className = "rvst done"; st.textContent = "ตอบแล้ว"; return true;
      }
    };
  }

  /* รายการที่ยังค้างก่อนปิดการสอบสวน (คำถามบังคับ + เหตุซ้ำที่ยังไม่พิจารณา) */
  async function missing(incidentId) {
    var r = await sb.rpc("incident_review_missing", { p_incident: incidentId });
    return r.error || !Array.isArray(r.data) ? [] : r.data;
  }
  window.Review = { mount: mount, missing: missing, ANS_TH: ANS_TH };
})();
