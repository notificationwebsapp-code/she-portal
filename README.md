# SHE Portal

เว็บแอปสำหรับบันทึกข้อมูลด้าน SHE (Safety, Health, Environment) — personal project เพื่อการเรียนรู้
**ข้อมูลทั้งหมดในระบบเป็นข้อมูลจำลอง (mock data) ไม่มีข้อมูลจริงขององค์กรหรือพนักงาน**

Live demo: [https://shewebapp.com](https://shewebapp.com) (ใช้บัญชีและข้อมูลสมมติเท่านั้น)

## Problem

การรายงานอุบัติเหตุ การตรวจ checklist และการบันทึกการอบรม มักกระจายอยู่ในหลายไฟล์/หลายช่องทาง
โปรเจกต์นี้รวมเป็นเว็บเดียว มี login และแยกสิทธิ์ตามบทบาทและ Plant (ออกแบบให้ใช้ได้หลายโรงงานทั่วโลก ไม่ฝังค่าเฉพาะประเทศ)

## Features

- สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ (Supabase Auth, ยืนยันอีเมล) และลืมรหัสผ่าน (ข้อความตอบกลับเหมือนกันทุกกรณี)
- เลือก Plant ตอนสมัคร, ผู้ดูแลอนุมัติ/ปฏิเสธผู้สมัคร, จัดการ Plant/แผนก/ข้อมูลหลัก (master lists) ผ่านหน้าเว็บ
- **รายงานอุบัติเหตุ (Flash Report)** แบบ 5W1H + ผู้เกี่ยวข้อง + ชนิดการบาดเจ็บ/ตำแหน่งร่างกาย, **บันทึกร่าง (draft)** อัตโนมัติ (เห็นเฉพาะเจ้าของ; SHE/Admin ใน Plant เดียวกันทำต่อร่างทีมได้)
- **แก้ไขรายงานแบบมีเหตุผล:** ผู้รายงานส่ง "คำขอแก้ไข", SHE/Admin อนุมัติ/ปฏิเสธ (ผู้อนุมัติต้องไม่ใช่ผู้ขอ) ทุกการแก้ไขมี log ที่ลบ/แก้ไม่ได้; ปิด/เปิดเคสใหม่ (Close/Reopen)
- ฟอร์มเช็กลิสต์ตรวจ และบันทึกการอบรม
- **หน้า "ดูข้อมูล":** แสดงเฉพาะข้อมูลที่ผู้ใช้มีสิทธิ์เห็น (RLS), ตัวกรอง (ค้นหา/ขั้นตอน/วันที่/Plant/ประเภท) + แบ่งหน้า, ไฮไลต์สถานะคำขอแก้ไข, อนุมัติ/ปฏิเสธคำขอจากป๊อปอัปในหน้ารายการ
- **ส่งออก CSV (SHE, Admin, Super admin, MD):** เลือกคอลัมน์ได้ถึงระดับผู้บาดเจ็บ/ตำแหน่งร่างกาย, 2 โหมดไฟล์ (1 แถวต่อเคส / 1 แถวต่อผู้เกี่ยวข้อง), บันทึกชุดที่เลือกไว้ใช้ซ้ำ (Saved presets เห็นเฉพาะเจ้าของ), ข้อมูลระบุตัวตนเลือกได้เฉพาะ SHE/Admin
- CI: Unilever CI (Proposed v1.0) ไม่ใส่โลโก้; ตรวจสีตาม WCAG 2.2 AA

## Tech Stack

- Front-end: HTML, CSS, JavaScript (static, ไม่ใช้ framework)
- Backend: Supabase (Auth + PostgreSQL + Row Level Security) — เปลี่ยนแปลงฐานข้อมูลผ่านไฟล์ `migration-*.sql` พร้อม `test-phase-*.sql` ที่ย้อนกลับข้อมูลทดสอบทุกครั้ง
- Library: supabase-js 2.45.4 (UMD)
- Email: custom SMTP (Resend) บนโดเมนของโปรเจกต์
- Hosting: GitHub Pages + custom domain (HTTPS)

## Project Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าแรก |
| `login.html` / `reset.html` | สมัคร เข้าสู่ระบบ ลืม/ตั้งรหัสผ่านใหม่ |
| `incident.html` | Flash Report + บันทึกร่าง |
| `checklist.html` / `training.html` | เช็กลิสต์ตรวจ / บันทึกการอบรม |
| `records.html` | ดูข้อมูล ตัวกรอง อนุมัติคำขอแก้ไข ส่งออก CSV |
| `admin-users.html` / `admin-master.html` | จัดการผู้ใช้ / Plant แผนก ข้อมูลหลัก |
| `auth.js`, `plant.js`, `draft.js`, `config.js` | session และเมนู, ตัวเลือก Plant, ระบบร่าง, ค่า Supabase (publishable key) |
| `style.css` | สไตล์ทั้งเว็บ (Unilever CI) |
| `schema.sql`, `migration-*.sql`, `test-phase-*.sql` | ตาราง, RLS, GRANT, ชุดทดสอบ |

## How to Run

1. สร้างโปรเจกต์ใน Supabase แล้วรัน `schema.sql` แล้วตามด้วย `migration-A…` ถึง `migration-B12…` ตามลำดับ ใน SQL Editor (รันแต่ละไฟล์ครั้งเดียว)
2. ใส่ Project URL และ **publishable key** ใน `config.js`
3. อัปโหลดขึ้น GitHub Pages
4. Authentication → URL Configuration: ตั้ง Site URL และ Redirect URL ให้ตรงตัว (ไม่ใช้ wildcard)
5. ยกระดับผู้ใช้ผ่านหน้า admin หรือ SQL Editor เท่านั้น (ห้ามแจกสิทธิ์ผ่านหน้าเว็บสาธารณะ)
6. ทดสอบ: รัน `test-phase-*.sql` ทีละไฟล์ — ข้อความ error สีแดงที่ขึ้นต้นด้วย `=== ผลทดสอบ` คือรายงานผล ข้อมูลถูกย้อนกลับ

## Security Notes

อ้างอิง OWASP Top 10 (2021) และ ISO/IEC 27001:2022

- **A01 Broken Access Control:** RLS ทุกตาราง (default-deny) + GRANT เฉพาะที่จำเป็น; การแก้ไขรายงานผ่าน RPC เท่านั้น (เพิกถอน UPDATE ตรง); `reporter_id` ฐานข้อมูลใส่ `auth.uid()` เอง; การซ่อนปุ่มในหน้าเว็บเป็นเพียงความสะดวก ความปลอดภัยจริงอยู่ที่ RLS
- **A03 Injection:** แสดงข้อมูลด้วย `textContent` ไม่ใช้ `innerHTML` กับข้อมูลผู้ใช้; ไฟล์ CSV ที่ส่งออกกัน formula injection (เซลล์ขึ้นต้น `= + - @` จะมี `'` นำหน้า)
- **A07 Authentication Failures:** ใช้ Supabase Auth ไม่เขียนระบบ auth เอง (NIST SP 800-63B)
- **ข้อมูลส่วนบุคคล (ISO/IEC 27001:2022 A.5.34):** ข้อมูลผู้เกี่ยวข้องในเหตุการณ์เห็นได้เฉพาะผู้รายงานและ SHE/Admin ของ Plant; Export ดึงเฉพาะฟิลด์ที่เลือก; **ห้ามใช้ข้อมูลจริงจนกว่าจะได้รับอนุมัติจาก IT/Security และ Legal/DPO**
- **Secrets:** repo มีเฉพาะ publishable key ไม่มี secret key / service_role key / database password

## Known Limitations

- ไฟล์ CSV ตั้งความกว้างคอลัมน์ไม่ได้ (Excel อาจแสดง `########` ในคอลัมน์วันที่ ให้ AutoFit)
- ยังไม่มี: ขั้นตอน Investigation (5 Why/Actions), การแจ้งเตือนทางอีเมล, Dashboard, ไฟล์แนบ, Gap Assessment
- ยังไม่ได้ทดสอบ Export โหมด "1 แถวต่อผู้เกี่ยวข้อง" และสิทธิ์ MD บนระบบจริง
- เป็น personal project สำหรับเรียนรู้ ยังไม่ผ่านการ security review อย่างเป็นทางการ

## Screenshots

หน้า login และหน้าตั้งรหัสผ่านใหม่อยู่ในโฟลเดอร์ `screenshots/` (ยังเป็นเวอร์ชันก่อนเปลี่ยน CI) ภาพหน้าดูข้อมูลและ Export จะเพิ่มภายหลัง
