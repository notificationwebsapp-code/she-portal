// auth.js — ตัวช่วยเรื่องล็อกอิน ใช้ร่วมกันทุกหน้า
// ต้องโหลดหลัง supabase-js และ config.js

const sb = window.supabase.createClient(
  window.SHE_CONFIG.url,
  window.SHE_CONFIG.key
);

// อัปเดตเมนู: ล็อกอินแล้ว -> แสดงอีเมล + ปุ่มออกจากระบบ
async function setupNav() {
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
