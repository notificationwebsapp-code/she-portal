/* SHE Portal — plant.js : ตัวเลือก Plant กลางสำหรับฟอร์มที่ต้องระบุ Plant (checklist, training)
 * ทำไมต้องมี: ผู้ใช้ที่ดูแลหลาย Plant ต้องเลือกเองว่าบันทึกให้ Plant ไหน (my_default_plant() คืนค่าเฉพาะผู้ที่มี Plant เดียว)
 *   ถ้ามี 1 Plant -> แสดงเป็นข้อความ / มีหลาย Plant -> แสดง dropdown (จำค่าล่าสุดไว้ ไม่ใช่ข้อมูลส่วนบุคคล)
 * ความปลอดภัย: ใช้ textContent เท่านั้น; สิทธิ์จริงคุมที่ RLS ฝั่งฐานข้อมูล (ฝั่งหน้าเว็บเป็นเพียง UX)
 */
const ShePlant = (function () {
  const KEY = "she_last_plant";
  let list = [], sel = null, single = null, row = null;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ไม่เป็นไร */ } }
  function label(p) { return p.name ? p.code + " — " + p.name : p.code; }

  async function init(cfg) {
    sel = cfg.select; single = cfg.single; row = cfg.row;
    list = [];
    // อ่านจากตาราง plants ตรง ๆ: RLS (has_plant) คืนเฉพาะ Plant ที่มีสิทธิ์
    // (admin/super_admin = ทุก Plant, role อื่น = ตาม user_plants) จึงไม่ต้องเดาสิทธิ์ฝั่งหน้าเว็บ
    const r = await sb.from("plants").select("id, code, name").eq("active", true).order("code");
    list = (r.data || []).map((x) => ({ id: x.id, code: x.code, name: x.name || "" }));
    if (list.length === 1) {
      single.textContent = "Plant: " + label(list[0]);
      single.hidden = false; row.hidden = true; sel.required = false;
    } else if (list.length > 1) {
      sel.replaceChildren();
      const o0 = document.createElement("option"); o0.value = ""; o0.textContent = "-- เลือก --"; sel.appendChild(o0);
      list.forEach((p) => {
        const o = document.createElement("option"); o.value = p.id; o.textContent = label(p); sel.appendChild(o);
      });
      row.hidden = false; single.hidden = true; sel.required = true;
      const last = lsGet(KEY);
      if (list.some((p) => p.id === last)) sel.value = last;
      sel.addEventListener("change", () => lsSet(KEY, sel.value));
    }
    return list.length;
  }

  function current() {
    if (list.length === 1) return list[0].id;
    return sel ? sel.value : "";
  }
  function set(id) {
    if (list.length > 1 && id && list.some((p) => p.id === id)) sel.value = id;
  }
  return { init, current, set, count: () => list.length };
})();
