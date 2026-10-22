/* SHE Portal — draft.js : ระบบ "บันทึกร่าง" กลางสำหรับทุกฟอร์ม (HANDOFF หลักการข้อ 11)
 * ใช้คู่กับตาราง drafts (Migration B8): เห็น/แก้/ลบได้เฉพาะเจ้าของร่าง (RLS)
 *
 * วิธีใช้ในหน้าฟอร์ม:
 *   SheDraft.init({
 *     formType: "incident",            // a-z 0-9 _ - ไม่เกิน 40 ตัวอักษร
 *     form: formElement,               // ใช้ฟังเหตุการณ์ input/change และแทรกแถบร่างไว้ก่อนฟอร์ม
 *     getState: () => ({...}),         // อ่านค่าทั้งฟอร์มเป็น object (JSON)
 *     setState: async (obj) => {...},  // เติมค่ากลับเข้าฟอร์ม
 *     getTitle: () => "ข้อความสั้น ๆ", // ชื่อร่างที่เห็นในรายการ (ไม่เกิน 100 ตัวอักษร)
 *     getPlantId: () => "uuid หรือ ''",
 *     actionsEl: element           // (ไม่บังคับ) แถวปุ่มท้ายฟอร์ม: ปุ่ม "บันทึกร่าง" + สถานะจะวางข้างปุ่มส่ง
 *   });
 *   หลังส่งฟอร์มสำเร็จ: await SheDraft.clear();
 *   ถ้าเปลี่ยนค่าฟอร์มด้วยโค้ด (เช่น เพิ่ม/ลบแถว): SheDraft.markDirty();
 *
 * ความปลอดภัย: แสดงข้อมูลด้วย textContent เท่านั้น (OWASP A03); ไม่เก็บเนื้อหาร่างใน localStorage
 * (ร่างอาจมีข้อมูลส่วนบุคคล — OWASP A02); ร่างไม่ใช่การรายงานจริง และแจ้งผู้ใช้ชัดเจน
 */
const SheDraft = (function () {
  const AUTOSAVE_MS = 30000;
  let cfg = null, currentId = null, dirty = false, saving = false, timer = null;
  let el = {};

  function injectStyle() {
    const css = [
      ".draftbar{border:1px solid var(--line);border-left:5px solid #e0a800;background:#fffdf5;border-radius:10px;padding:.7rem 1rem;margin:0 0 1.1rem}",
      ".draftbar .drow{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1rem}",
      ".draftbar .dnote{color:var(--muted);font-size:.9rem;margin:.4rem 0 0}",
      ".draftbar .dstatus{font-size:.92rem;color:var(--muted)}",
      ".draftbar .dstatus.ok{color:var(--ok)} .draftbar .dstatus.err{color:var(--danger)}",
      ".draftbar details{margin-top:.5rem} .draftbar summary{cursor:pointer;font-weight:600;color:var(--brand)}",
      ".draftlist{list-style:none;padding:0;margin:.5rem 0 0;display:grid;gap:.4rem}",
      ".draftlist li{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .8rem;background:#fff;border:1px solid var(--line);border-radius:8px;padding:.4rem .7rem}",
      ".draftlist .dt{flex:1;min-width:10rem} .draftlist .dm{color:var(--muted);font-size:.85rem}",
      ".draftbar button.secondary{margin-left:0}",
      ".formactions .dstatus{flex-basis:100%;margin:0}",
      ".formactions button.secondary{margin-left:0}"
    ].join("\n");
    const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);
  }

  function mk(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function fmt(v) {
    try {
      return new Date(v).toLocaleString("en-GB", { hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return ""; }
  }
  function status(text, kind) {
    el.status.textContent = text;
    el.status.className = "dstatus" + (kind ? " " + kind : "");
  }
  function thaiErr(error) {
    const c = error && error.code;
    if (c === "42501") return "ไม่มีสิทธิ์บันทึกร่าง (ตรวจสอบสถานะบัญชีหรือ Plant)";
    if (c === "54000") return "มีร่างครบ 50 ฉบับแล้ว กรุณาลบร่างเก่าก่อน";
    if (c === "23514") return "ร่างมีขนาดใหญ่เกินกำหนด";
    return "บันทึกร่างไม่สำเร็จ";
  }

  async function refreshList() {
    const { data, error } = await sb.from("drafts").select("id, title, updated_at")
      .eq("form_type", cfg.formType).order("updated_at", { ascending: false });
    el.list.replaceChildren();
    const rows = error ? [] : (data || []);
    el.count.textContent = String(rows.length);
    if (!rows.length) {
      el.list.appendChild(mk("li", "", "ยังไม่มีร่างที่บันทึกไว้"));
      return;
    }
    rows.forEach((d) => {
      const li = mk("li");
      const t = mk("div", "dt");
      t.appendChild(mk("div", "", d.title || "(ไม่มีชื่อ)"));
      t.appendChild(mk("div", "dm", "แก้ไขล่าสุด " + fmt(d.updated_at) + (d.id === currentId ? " · กำลังแก้ไข" : "")));
      const open = mk("button", "btn-ok-outline small", "ทำต่อ");
      open.type = "button";
      open.addEventListener("click", () => loadDraft(d.id));
      const del = mk("button", "btn-danger-outline small", "ลบ");
      del.type = "button";
      del.addEventListener("click", () => removeDraft(d.id));
      li.appendChild(t); li.appendChild(open); li.appendChild(del);
      el.list.appendChild(li);
    });
  }

  async function save(manual) {
    if (saving) return;
    const state = cfg.getState();
    const json = JSON.stringify(state);
    if (json.length > 95000) { status("ร่างมีขนาดใหญ่เกินกำหนด", "err"); return; }
    saving = true; el.btn.disabled = true;
    const title = (cfg.getTitle ? cfg.getTitle() : "") || ("ร่าง " + fmt(new Date()));
    const plant = (cfg.getPlantId ? cfg.getPlantId() : "") || null;
    let error = null;
    if (currentId) {
      ({ error } = await sb.from("drafts").update({ title: title.slice(0, 100), plant_id: plant, payload: state }).eq("id", currentId));
    } else {
      const r = await sb.from("drafts").insert({ form_type: cfg.formType, title: title.slice(0, 100), plant_id: plant, payload: state }).select("id").single();
      error = r.error;
      if (!error && r.data) currentId = r.data.id;
    }
    saving = false; el.btn.disabled = false;
    if (error) { status(thaiErr(error), "err"); return; }
    dirty = false;
    status((manual ? "บันทึกร่างแล้ว " : "บันทึกร่างอัตโนมัติ ") + fmt(new Date()) + " (ยังไม่ได้ส่งรายงาน)", "ok");
    refreshList();
  }

  async function loadDraft(id) {
    if (dirty && !window.confirm("ฟอร์มที่กำลังกรอกมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการเปิดร่างนี้แทนหรือไม่")) return;
    const { data, error } = await sb.from("drafts").select("id, payload").eq("id", id).single();
    if (error || !data) { status("เปิดร่างไม่สำเร็จ (ร่างอาจถูกลบหรือหมดอายุ)", "err"); refreshList(); return; }
    await cfg.setState(data.payload || {});
    currentId = data.id; dirty = false;
    status("เปิดร่างแล้ว — แก้ไขต่อและกดส่งรายงานเมื่อพร้อม", "ok");
    refreshList();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeDraft(id) {
    if (!window.confirm("ลบร่างนี้ถาวรใช่หรือไม่")) return;
    const { error } = await sb.from("drafts").delete().eq("id", id);
    if (error) { status("ลบร่างไม่สำเร็จ", "err"); return; }
    if (id === currentId) { currentId = null; }
    status("ลบร่างแล้ว", "ok");
    refreshList();
  }

  async function clear() {
    // เรียกหลังส่งฟอร์มสำเร็จ: ลบร่างที่กำลังใช้อยู่ (ถ้ามี)
    if (currentId) { await sb.from("drafts").delete().eq("id", currentId); }
    currentId = null; dirty = false;
    status("ส่งรายงานแล้ว ร่างที่เกี่ยวข้องถูกลบ", "ok");
    refreshList();
  }

  function markDirty() { dirty = true; }

  function init(config) {
    cfg = config;
    injectStyle();
    const bar = mk("section", "draftbar");
    bar.setAttribute("aria-label", "ร่างของฉัน");
    const row = mk("div", "drow");
    el.btn = mk("button", "secondary", "บันทึกร่าง");
    el.btn.type = "button"; el.btn.id = "btn-draft";
    el.btn.addEventListener("click", () => save(true));
    el.status = mk("span", "dstatus", "ยังไม่ได้บันทึกร่าง");
    el.status.setAttribute("role", "status");
    if (cfg.actionsEl) {                       // วางปุ่ม+สถานะไว้ข้างปุ่มส่งรายงาน (ท้ายฟอร์ม)
      cfg.actionsEl.appendChild(el.btn); cfg.actionsEl.appendChild(el.status);
    } else {
      row.appendChild(el.btn); row.appendChild(el.status); bar.appendChild(row);
    }
    bar.appendChild(mk("p", "dnote", "ร่างยังไม่ใช่การรายงาน — SHE จะยังไม่เห็นข้อมูลจนกว่าคุณจะกด “ส่งรายงาน” ระบบบันทึกร่างให้อัตโนมัติทุก 30 วินาทีเมื่อมีการแก้ไข ร่างเก็บไว้ 30 วันและเห็นได้เฉพาะคุณ"));
    const det = mk("details");
    const sum = mk("summary");
    sum.appendChild(document.createTextNode("ร่างของฉัน ("));
    el.count = mk("span", "", "0");
    sum.appendChild(el.count); sum.appendChild(document.createTextNode(")"));
    el.list = mk("ul", "draftlist");
    det.appendChild(sum); det.appendChild(el.list); bar.appendChild(det);
    cfg.form.parentNode.insertBefore(bar, cfg.form);

    cfg.form.addEventListener("input", markDirty);
    cfg.form.addEventListener("change", markDirty);
    timer = setInterval(() => { if (dirty) save(false); }, AUTOSAVE_MS);
    // สลับแอป/แท็บ (เช่น มีงานด่วนเข้า) = บันทึกร่างให้ทันที
    document.addEventListener("visibilitychange", () => { if (document.hidden && dirty) save(false); });
    window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
    refreshList();
  }

  return { init, clear, markDirty, save: () => save(true) };
})();
