// auth.js — ตัวช่วยเรื่องล็อกอิน ใช้ร่วมกันทุกหน้า
// ต้องโหลดหลัง supabase-js และ config.js

const sb = window.supabase.createClient(
  window.SHE_CONFIG.url,
  window.SHE_CONFIG.key
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
    if (p && p.status === "active" && p.role === "admin") {
      const a = document.createElement("a");
      a.href = "admin-users.html";
      a.textContent = "จัดการผู้ใช้";
      link.insertAdjacentElement("beforebegin", a);
      markCurrentNav();
    }
    showAccountNotice(p);
  }
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
