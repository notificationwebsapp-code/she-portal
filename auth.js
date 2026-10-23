// auth.js — ตัวช่วยเรื่องล็อกอิน ใช้ร่วมกันทุกหน้า
// ต้องโหลดหลัง supabase-js และ config.js

// "จดจำฉันบนอุปกรณ์นี้": ค่าเริ่มต้น = จำ (เก็บ session ใน localStorage จนกว่าจะกดออกจากระบบ)
// ถ้าผู้ใช้ไม่ติ๊ก (เช่น คอมพิวเตอร์ส่วนกลาง) จะเก็บใน sessionStorage และหายเมื่อปิดแท็บ/เบราว์เซอร์
// หมายเหตุ: token เก็บในเบราว์เซอร์เป็นวิธีมาตรฐานของ supabase-js; ความเสี่ยง XSS ลดด้วยการใช้ textContent ทุกหน้า (OWASP A03)
function rememberMe() {
  try { return localStorage.getItem("she_remember") !== "0"; } catch (e) { return true; }
}
const sessionStore = {
  getItem(k) { try { return sessionStorage.getItem(k) ?? localStorage.getItem(k); } catch (e) { return null; } },
  setItem(k, v) {
    try {
      const keep = rememberMe();
      (keep ? localStorage : sessionStorage).setItem(k, v);
      (keep ? sessionStorage : localStorage).removeItem(k);
    } catch (e) { /* storage ถูกปิด: ใช้งานต่อได้แต่ต้องล็อกอินใหม่ทุกครั้ง */ }
  },
  removeItem(k) { try { sessionStorage.removeItem(k); localStorage.removeItem(k); } catch (e) {} }
};
const sb = window.supabase.createClient(
  window.SHE_CONFIG.url,
  window.SHE_CONFIG.key,
  { auth: { persistSession: true, autoRefreshToken: true, storage: sessionStore } }
);

// โปรไฟล์ของตัวเอง (role/status) — โหลดครั้งเดียวต่อหน้า แล้วใช้ซ้ำ
// ใช้เพื่ออำนวยความสะดวก (แสดงเมนู/ข้อความ) เท่านั้น ความปลอดภัยจริงมาจาก RLS ในฐานข้อมูล
let _profilePromise = null;
function getMyProfile() {
  if (!_profilePromise) {
    _profilePromise = (async () => {
      const { data: s } = await sb.auth.getSession();
      if (!s.session) return null;
      const { data, error } = await sb
        .from("profiles")
        .select("id, role, status, email, reject_reason")
        .eq("id", s.session.user.id)
        .maybeSingle();
      return error ? null : data;
    })();
  }
  return _profilePromise;
}

// บัญชีที่ยังไม่ active (รออนุมัติ/ไม่อนุมัติ/ถูกระงับ): ซ่อนเนื้อหาหลักและแสดงข้อความ
// ยกเว้นหน้า login/reset เพื่อให้ผู้ใช้ยังตั้งรหัสผ่านหรือเปลี่ยนบัญชีได้
function showAccountNotice(p) {
  if (!p || p.status === "active") return;
  if (/\/(login|reset)(\.html)?$/.test(window.location.pathname)) return;
  const main = document.querySelector("main");
  if (!main || document.getElementById("account-notice")) return;
  const div = document.createElement("div");
  div.id = "account-notice";
  div.className = "msg error";
  div.setAttribute("role", "status");
  if (p.status === "pending") {
    div.textContent = "บัญชีของคุณอยู่ระหว่างรอ Admin อนุมัติ จึงยังใช้งานข้อมูลไม่ได้ กรุณารอการแจ้งจาก Admin";
  } else if (p.status === "rejected") {
    // เหตุผลเขียนโดย Admin แสดงด้วย textContent เท่านั้น (OWASP A03)
    div.textContent = "คำขอใช้งานของคุณไม่ได้รับการอนุมัติ" +
      (p.reject_reason ? " — เหตุผล: " + p.reject_reason : "") +
      " หากต้องการสอบถาม กรุณาติดต่อ Admin";
  } else {
    div.textContent = "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อ Admin";
  }
  main.hidden = true;
  main.insertAdjacentElement("beforebegin", div);
}

// อัปเดตเมนู: ล็อกอินแล้ว -> แสดงอีเมล + ปุ่มออกจากระบบ (+ เมนู "จัดการผู้ใช้" เฉพาะ Admin)
// ทำเครื่องหมายเมนูของหน้าปัจจุบัน (aria-current) เพื่อให้ผู้ใช้รู้ว่าอยู่หน้าไหน (WCAG 2.2: Info and Relationships)
function markCurrentNav() {
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("nav a").forEach((a) => {
    const target = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (target === here) a.setAttribute("aria-current", "page");
  });
}

async function setupNav() {
  markCurrentNav();
  const link = document.querySelector('nav a[href="login.html"]');
  if (!link) return;
  const { data } = await sb.auth.getSession();
  if (data.session) {
    link.textContent = "ออกจากระบบ (" + data.session.user.email + ")";
    link.href = "#";
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      await sb.auth.signOut();
      window.location.href = "login.html";
    });
    const p = await getMyProfile();
    if (p && p.status === "active" && (p.role === "admin" || p.role === "super_admin")) {
      const a = document.createElement("a");
      a.href = "admin-users.html";
      a.textContent = "จัดการผู้ใช้";
      link.insertAdjacentElement("beforebegin", a);
      const m = document.createElement("a");
      m.href = "admin-master.html";
      m.textContent = "ข้อมูลหลัก";
      link.insertAdjacentElement("beforebegin", m);
      markCurrentNav();
    }
    showRoleBadge(p, data.session.user.id, link);
    showAccountNotice(p);
  }
}

// ป้ายแสดง Role + Plant ของผู้ที่ล็อกอิน (อำนวยความสะดวกเท่านั้น สิทธิ์จริงมาจาก RLS)
const ROLE_LABEL = { super_admin: "SUPER ADMIN", admin: "ADMIN", she: "SHE", md: "MD", ceo: "CEO", employee: "EMPLOYEE" };
async function showRoleBadge(p, uid, link) {
  if (!p || document.getElementById("role-badge")) return;
  let text = p.status === "active" ? (ROLE_LABEL[p.role] || String(p.role || "").toUpperCase()) : "บัญชีไม่ active";
  if (p.status === "active" && p.role !== "super_admin" && p.role !== "admin") {
    try {
      const { data } = await sb.from("user_plants").select("plants(code)").eq("user_id", uid);
      const codes = (data || []).map((r) => r.plants && r.plants.code).filter(Boolean).sort();
      if (codes.length) text += " · " + codes.join(", ");
    } catch (e) { /* ไม่มีข้อมูล Plant ก็แสดงเฉพาะ Role */ }
  } else if (p.status === "active") {
    text += " · ทุก Plant";
  }
  const b = document.createElement("span");
  b.id = "role-badge";
  b.className = "role-badge";
  b.textContent = text;   // textContent เท่านั้น (OWASP A03)
  link.insertAdjacentElement("beforebegin", b);
}

// หน้าที่ต้องล็อกอิน: ถ้ายังไม่ล็อกอิน ส่งไปหน้า login
// หมายเหตุ: นี่คือการอำนวยความสะดวกเท่านั้น ความปลอดภัยจริงมาจาก RLS ในฐานข้อมูล
async function requireLogin() {
  const { data } = await sb.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
  }
  return data.session;
}

setupNav();

// ปุ่ม "แสดงรหัสผ่าน": checkbox ที่มี data-show-pw="id1,id2" สลับ type ของช่องรหัสผ่านระหว่าง password/text
document.addEventListener("change", (e) => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-show-pw]")) return;
  t.dataset.showPw.split(",").forEach((id) => {
    const el = document.getElementById(id.trim());
    if (el) el.type = t.checked ? "text" : "password";
  });
});
