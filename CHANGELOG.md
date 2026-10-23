# CHANGELOG — SHE Portal

รูปแบบ: วันที่ → สิ่งที่เปลี่ยน → ไฟล์ที่เกี่ยวข้อง (ข้อมูลทั้งหมดเป็นข้อมูลทดสอบ)

## 2026-10-23 — UI v4.1–v4.3, ประกาศสำคัญ (B14), วันปลอด LTI, Plant selector
- เพิ่ม: ตาราง `announcements` + RLS (SHE ประกาศเฉพาะ Plant ของตน, Admin ทุก Plant; ผู้อ่านเห็นเฉพาะที่เปิดใช้และอยู่ในช่วงเวลา; ไม่มีการลบ; audit log) — `migration-B14-announcements.sql`, ทดสอบ `test-phase-B14-announcements.sql` (57 ข้อ)
- เพิ่ม: หน้า `admin-announcements.html` (SHE/Admin), แบนเนอร์ประกาศหน้าแรก (ปุ่มรับทราบ เก็บในเบราว์เซอร์), การ์ดวันปลอด LTI (เคส LTI/เสียชีวิตล่าสุดที่บันทึกในระบบ), ตัวเลือก Plant ที่หัวเว็บ (ตัวกรองหน้าจอ)
- เพิ่ม: เมนูหลักชุดเดียวกันทุกหน้า (มี Executive Dashboard ป้าย "เร็ว ๆ นี้"), ตัวสลับภาษาแบบ segmented (EN/မြန်မာ ยังปิด), เมนูเฟืองรวมขนาดตัวอักษร + ลิงก์ผู้ดูแล + ประกาศ, เมนูย่อยหน้า Admin, แผง "การแจ้งเตือนล่าสุด"
- ปรับ: การ์ดอนุมัติผู้ใช้แบบกริด ปุ่มอนุมัติ/ปฏิเสธใหญ่ชัด, หน้าต่าง Export, ความกว้างหัวเว็บ/เนื้อหา 1240px, หน้ากรอกข้อมูลเป็นการ์ดกลาง
- แก้: ลิงก์ผู้ดูแลที่ `auth.js` แทรกหลังหัวเว็บถูกย้ายลงเมนูเฟืองด้วย `MutationObserver` ใน `shell-v4.js`
- ไฟล์: `index.html`, `admin-announcements.html`, `shell-v4.js`, `style-v4.css`

## 2026-10-23 — Permission Matrix (B13a–c) + UI v4 (Stitch)
- B13a: ตาราง/ฟังก์ชันสิทธิ์รายบทบาท (`has_perm`, `my_permissions`, `set_role_permission`; Super admin เท่านั้น) — ทดสอบ 70 ข้อ
- B13b: เพิ่มผู้เกี่ยวข้องภายหลัง — 99 ข้อ
- B13c: บังคับสิทธิ์ที่ฐานข้อมูลสำหรับ edit_direct / approve_edit / person_add / close / reopen (SHE เปิดเคสใหม่ไม่ได้, อนุมัติคำขอของตนเองไม่ได้ยังคงเดิม) — 58 ข้อ
- UI v4 ตามดีไซน์ Stitch ทุกหน้า, หน้า `admin-permissions.html`, ฟอนต์ Inter (OFL) โฮสต์เอง

## ก่อนหน้า (สรุป)
- 2026-10-22: B8–B12 ร่าง/ร่างทีม, ข้อมูลหลัก, คำขอแก้ไข, Export presets
- 2026-10-21 และก่อนหน้า: Migration A, B1–B7 (หลาย Plant, อนุมัติผู้ใช้, รหัสพนักงาน, Super admin, Flash report, เขตเวลา)
