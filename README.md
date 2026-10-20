# SHE Portal

เว็บแอปสำหรับบันทึกข้อมูลด้าน SHE (Safety, Health, Environment) — personal project เพื่อการเรียนรู้
**ข้อมูลทั้งหมดในระบบเป็นข้อมูลจำลอง (mock data) ไม่มีข้อมูลจริงขององค์กรหรือพนักงาน**

Live demo: [https://shewebapp.com](https://shewebapp.com) (ใช้บัญชีและข้อมูลสมมติเท่านั้น)

## Problem

การรายงานอุบัติเหตุ การตรวจ checklist และการบันทึกการอบรม มักกระจายอยู่ในหลายไฟล์/หลายช่องทาง
โปรเจกต์นี้รวมเป็นเว็บเดียว มี login และแยกสิทธิ์ตามบทบาท (employee / SHE team)

## Features

- สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ (Supabase Auth, ยืนยันอีเมล)
- ลืมรหัสผ่าน: กดปุ่มในหน้า login → รับลิงก์ทางอีเมล → ตั้งรหัสใหม่ที่ `reset.html` (ข้อความตอบกลับเหมือนกันทุกกรณี ไม่เปิดเผยว่าอีเมลใดมีบัญชี)
- ปุ่ม "แสดงรหัสผ่าน" ในหน้า login และ reset เพื่อลดการพิมพ์ผิด
- ฟอร์มรายงานอุบัติเหตุ (employee ทุกคนส่งได้)
- ฟอร์มเช็กลิสต์ตรวจ และบันทึกการอบรม (เฉพาะ SHE team)
- หน้า "ดูข้อมูล": แสดงเฉพาะข้อมูลที่ผู้ใช้มีสิทธิ์เห็น
  - employee เห็นเฉพาะรายงานของตนเอง
  - SHE / admin เห็นทั้งหมด

## Tech Stack

- Front-end: HTML, CSS, JavaScript (static, ไม่ใช้ framework)
- Backend: Supabase (Auth + PostgreSQL + Row Level Security)
- Library: supabase-js 2.45.4 (UMD)
- Email: custom SMTP (Resend) บนโดเมนของโปรเจกต์
- Hosting: GitHub Pages + custom domain (HTTPS)

## Project Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าแรก |
| `login.html` | สมัคร / เข้าสู่ระบบ / ขอลิงก์ลืมรหัสผ่าน |
| `reset.html` | ตั้งรหัสผ่านใหม่ (เปิดจากลิงก์ในอีเมล) |
| `incident.html` | ฟอร์มรายงานอุบัติเหตุ |
| `checklist.html` | ฟอร์มเช็กลิสต์ตรวจ |
| `training.html` | ฟอร์มบันทึกการอบรม |
| `records.html` | ดูข้อมูล |
| `auth.js` | session, requireLogin, ปุ่ม logout, ปุ่มแสดงรหัสผ่าน |
| `config.js` | Supabase project URL + publishable key |
| `style.css` | สไตล์ทั้งเว็บ |
| `schema.sql` | สร้างตาราง, trigger, RLS policy, GRANT |

## How to Run

1. สร้างโปรเจกต์ใน Supabase แล้วรัน `schema.sql` ใน SQL Editor
2. ใส่ Project URL และ **publishable key** ใน `config.js`
3. เปิดไฟล์ `index.html` หรืออัปโหลดขึ้น GitHub Pages
4. Authentication → URL Configuration: ตั้ง Site URL และเพิ่ม Redirect URL ของเว็บ รวมถึง `login.html` และ `reset.html` (ต้องตรงตัว ไม่ใช้ wildcard)
5. ยกระดับผู้ใช้เป็น SHE ผ่าน SQL Editor เท่านั้น:
   `update public.profiles set role = 'she' where id = '<user id>';`

## Security Notes

อ้างอิง OWASP Top 10 (2021)

- **A01 Broken Access Control:** ใช้ Row Level Security ทุกตาราง (default-deny) + GRANT เฉพาะที่จำเป็น
  ไม่ส่ง `reporter_id` จาก client — database ใส่ `auth.uid()` เอง
  `requireLogin()` ใน front-end เป็นเพียงความสะดวก ความปลอดภัยจริงอยู่ที่ RLS
- **A03 Injection (XSS):** แสดงข้อมูลด้วย `textContent` / `createElement` ไม่ใช้ `innerHTML`
- **A07 Authentication Failures:** ไม่เขียนระบบ auth เอง ใช้ Supabase Auth; flow ลืมรหัสผ่านตอบข้อความเดียวกันทุกกรณีเพื่อกัน user enumeration และตั้งรหัสใหม่ผ่านลิงก์อีเมลเท่านั้น (อ้างอิง NIST SP 800-63B) ผู้ดูแลไม่ต้องรู้รหัสผ่านของผู้ใช้
- **Secrets:** repo นี้มีเฉพาะ publishable key (ออกแบบให้อยู่ฝั่ง client ได้ เมื่อเปิด RLS)
  ไม่มี secret key / service_role key / database password

## Known Limitations

- อีเมลยืนยัน/รีเซ็ตส่งผ่าน custom SMTP (Resend) แต่ Supabase ยังจำกัดความถี่การขออีเมลต่อผู้ใช้
- ยังไม่มีหน้าแก้ไข/ลบข้อมูล, ค้นหา/กรอง และหน้า admin จัดการ role
- เป็น personal project สำหรับเรียนรู้ ยังไม่ผ่านการ security review อย่างเป็นทางการ

## Screenshots

_(เพิ่มภาพหน้า login, ฟอร์ม, และหน้าดูข้อมูลที่นี่)_
