/* SHE Portal — draft.js : ระบบ "บันทึกร่าง" กลางสำหรับทุกฟอร์ม (HANDOFF หลักการข้อ 11)
 * ใช้คู่กับตาราง drafts (Migration B8 + B9):
 *   - ร่างของพนักงานทั่วไป: เห็น/แก้/ลบได้เฉพาะเจ้าของ
 *   - ร่างที่ SHE/Admin สร้างและระบุ Plant: SHE/Admin ของ Plant เดียวกันเห็นและทำต่อแทนกันได้ (RLS ฝั่งฐานข้อมูลเป็นผู้ตัดสิน)
 *   - กันแก้ชนกันด้วยคอลัมน์ version (ถ้ามีคนแก้ก่อน จะแจ้งเตือนและไม่เขียนทับ)
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
  let cfg = null, currentId = null, currentVersion = null, currentOwnerId = null, myId = null;
  let dirty = false, saving = false, timer = null;
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
      ".draftlist .dtag{display:inline-block;font-size:.75rem;font-weight:600;padding:.05rem .5rem;border-radius:999px;margin-right:.4rem;background:#e8f0ff;color:var(--brand)}",
      ".draftlist .dtag.team{background:#e6f4ea;color:#14532d}",
      ".draftbar button.secondary{margin-left:0}",
      ".formactions .dstatus{flex-basis:100%;margin:0}",
      ".formactions .dstatus.err{color:var(--danger)}",
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
  const CONFLICT = "ร่างนี้ถูกแก้ไขหรือถูกลบโดยผู้อื่นไปก่อน — ระบบไม่เขียนทับ กรุณาเปิดร่างล่าสุดจากรายการ “ร่างของฉันและทีม” (ข้อมูลที่คุณกรอกยังอยู่ในฟอร์มนี้ ให้คัดลอกส่วนที่ต้องการเก็บไว้ก่อน)";

  function isMine(row) { return !myId || row.owner_id === myId; }

  async function refreshList() {
    const { data, error } = await sb.from("drafts")
      .select("id, title, updated_at, owner_id, owner_name, last_editor_name, team_shared")
      .eq("form_type", cfg.formType).order("updated_at", { ascending: false });
    el.list.replaceChildren();
    const rows = error ? [] : (data || []);
    el.count.textContent = String(rows.length);
    if (!rows.length) {
      el.list.appendChild(mk("li", "", "ยังไม่มีร่างที่บันทึกไว้"));
      return;
    }
    rows.forEach((d) => {
      const mine = isMine(d);
      const li = mk("li");
      const t = mk("div", "dt");
      const line1 = mk("div");
      if (mine) { if (d.team_shared) line1.appendChild(mk("span", "dtag", "ของฉัน · แชร์ทีม")); }
      else line1.appendChild(mk("span", "dtag team", "ของ " + (d.owner_name || "เพื่อนร่วมทีม")));
      line1.appendChild(document.createTextNode(d.title || "(ไม่มีชื่อ)"));
      t.appendChild(line1);
      let meta = "แก้ไขล่าสุด " + fmt(d.updated_at);
      if (d.last_editor_name && (!mine || d.team_shared)) meta += " โดย " + d.last_editor_name;
      if (d.id === currentId) meta += " · กำลังแก้ไข";
      t.appendChild(mk("div", "dm", meta));
      const open = mk("button", "btn-ok-outline small", "ทำต่อ");
      open.type = "button";
      open.addEventListener("click", () => loadDraft(d.id));
      const del = mk("button", "btn-danger-outline small", "ลบ");
      del.type = "button";
      del.addEventListener("click", () => removeDraft(d.id, mine ? "" : (d.owner_name || "เพื่อนร่วมทีม")));
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
    let error = null, conflict = false;
    if (currentId) {
      // เจ้าของเท่านั้นที่เปลี่ยน Plant ของร่างได้ — เพื่อนร่วมทีมไม่ส่ง plant_id
      const patch = { title: title.slice(0, 100), payload: state };
      if (currentOwnerId === myId) patch.plant_id = plant;
      const r = await sb.from("drafts").update(patch)
        .eq("id", currentId).eq("version", currentVersion).select("version");
      error = r.error;
      if (!error) {
        if (r.data && r.data.length) currentVersion = r.data[0].version;
        else conflict = true;        // 0 แถว = เวอร์ชันไม่ตรง หรือร่างถูกลบ/หมดอายุ
      }
    } else {
      const r = await sb.from("drafts").insert({ form_type: cfg.formType, title: title.slice(0, 100), plant_id: plant, payload: state })
        .select("id, version, owner_id").single();
      error = r.error;
      if (!error && r.data) { currentId = r.data.id; currentVersion = r.data.version; currentOwnerId = r.data.owner_id || myId; }
    }
    saving = false; el.btn.disabled = false;
    if (conflict) { status(CONFLICT, "err"); refreshList(); return; }
    if (error) { status(thaiErr(error), "err"); return; }
    dirty = false;
    status((manual ? "บันทึกร่างแล้ว " : "บันทึกร่างอัตโนมัติ ") + fmt(new Date()) + " (ยังไม่ได้ส่งรายงาน)", "ok");
    refreshList();
  }

  async function loadDraft(id) {
    if (dirty && !window.confirm("ฟอร์มที่กำลังกรอกมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการเปิดร่างนี้แทนหรือไม่")) return;
    const { data, error } = await sb.from("drafts").select("id, payload, version, owner_id").eq("id", id).single();
    if (error || !data) { status("เปิดร่างไม่สำเร็จ (ร่างอาจถูกลบหรือหมดอายุ)", "err"); refreshList(); return; }
    await cfg.setState(data.payload || {});
    currentId = data.id; currentVersion = data.version; currentOwnerId = data.owner_id; dirty = false;
    status("เปิดร่างแล้ว — แก้ไขต่อและกดส่งรายงานเมื่อพร้อม", "ok");
    refreshList();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeDraft(id, ownerLabel) {
    const msg = ownerLabel
      ? "ลบร่างของ " + ownerLabel + " ถาวรใช่หรือไม่ (เจ้าของร่างจะไม่เห็นร่างนี้อีก)"
      : "ลบร่างนี้ถาวรใช่หรือไม่";
    if (!window.confirm(msg)) return;
    const { error } = await sb.from("drafts").delete().eq("id", id);
    if (error) { status("ลบร่างไม่สำเร็จ", "err"); return; }
    if (id === currentId) { currentId = null; currentVersion = null; currentOwnerId = null; }
    status("ลบร่างแล้ว", "ok");
    refreshList();
  }

  async function clear() {
    // เรียกหลังส่งฟอร์มสำเร็จ: ลบร่างที่กำลังใช้อยู่ (ถ้ามี) — เพื่อนร่วมทีมที่ทำต่อจากร่างของคนอื่นก็ลบได้
    if (currentId) { await sb.from("drafts").delete().eq("id", currentId); }
    currentId = null; currentVersion = null; currentOwnerId = null; dirty = false;
    status("ส่งรายงานแล้ว ร่างที่เกี่ยวข้องถูกลบ", "ok");
    refreshList();
  }

  function markDirty() { dirty = true; }

  function init(config) {
    cfg = config;
    injectStyle();
    const bar = mk("section", "draftbar");
    bar.setAttribute("aria-label", "ร่างของฉันและทีม");
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
    bar.appendChild(mk("p", "dnote", "ร่างยังไม่ใช่การรายงาน — SHE จะยังไม่เห็นข้อมูลจนกว่าจะกด “ส่งรายงาน” ระบบบันทึกร่างให้อัตโนมัติทุก 30 วินาทีเมื่อมีการแก้ไข ร่างเก็บไว้ 30 วัน ร่างของพนักงานทั่วไปเห็นได้เฉพาะเจ้าของ ส่วนร่างที่ SHE/Admin สร้างและระบุ Plant ไว้ SHE/Admin ของ Plant เดียวกันจะเห็นและทำต่อแทนกันได้"));
    const det = mk("details");
    const sum = mk("summary");
    sum.appendChild(document.createTextNode("ร่างของฉันและทีม ("));
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
    sb.auth.getUser().then((r) => { myId = r && r.data && r.data.user ? r.data.user.id : null; }).finally(refreshList);
  }

  return { init, clear, markDirty, save: () => save(true) };
})();
