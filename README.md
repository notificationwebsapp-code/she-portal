# SHE Portal

เว็บแอปสำหรับบันทึกข้อมูลด้าน SHE (Safety, Health, Environment) — personal project เพื่อการเรียนรู้
**ข้อมูลทั้งหมดในระบบเป็นข้อมูลจำลอง (mock data) ไม่มีข้อมูลจริงขององค์กรหรือพนักงาน**

Live demo: [https://notificationwebsapp-code.github.io/she-portal/](https://shewebapp.com)

## Problem

การรายงานอุบัติเหตุ การตรวจ checklist และการบันทึกการอบรม มักกระจายอยู่ในหลายไฟล์/หลายช่องทาง
โปรเจกต์นี้รวมเป็นเว็บเดียว มี login และแยกสิทธิ์ตามบทบาท (employee / SHE team)

## Features

- สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ (Supabase Auth, ยืนยันอีเมล)
- ฟอร์มรายงานอุบัติเหตุ (employee ทุกคนส่งได้)
- ฟอร์มเช็กลิสต์ตรวจ และบันทึกการอบรม (เฉพาะ SHE team)
- หน้า "ดูข้อมูล": แสดงเฉพาะข้อมูลที่ผู้ใช้มีสิทธิ์เห็น
  - employee เห็นเฉพาะรายงานของตนเอง
  - SHE / admin เห็นทั้งหมด

## Tech Stack

- Front-end: HTML, CSS, JavaScript (static, ไม่ใช้ framework)
- Backend: Supabase (Auth + PostgreSQL + Row Level Security)
- Library: supabase-js 2.45.4 (UMD)
- Hosting: GitHub Pages

## Project Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าแรก |
| `login.html` | สมัคร / เข้าสู่ระบบ |
| `incident.html` | ฟอร์มรายงานอุบัติเหตุ |
| `checklist.html` | ฟอร์มเช็กลิสต์ตรวจ |
| `training.html` | ฟอร์มบันทึกการอบรม |
| `records.html` | ดูข้อมูล |
| `auth.js` | session, requireLogin, ปุ่ม logout |
| `config.js` | Supabase project URL + publishable key |
| `style.css` | สไตล์ทั้งเว็บ |
| `schema.sql` | สร้างตาราง, trigger, RLS policy, GRANT |

## How to Run

1. สร้างโปรเจกต์ใน Supabase แล้วรัน `schema.sql` ใน SQL Editor
2. ใส่ Project URL และ **publishable key** ใน `config.js`
3. เปิดไฟล์ `index.html` หรืออัปโหลดขึ้น GitHub Pages
4. Authentication → URL Configuration: ตั้ง Site URL และเพิ่ม Redirect URL ของเว็บ
5. ยกระดับผู้ใช้เป็น SHE ผ่าน SQL Editor เท่านั้น:
   `update public.profiles set role = 'she' where id = '<user id>';`

## Security Notes

อ้างอิง OWASP Top 10 (2021)

- **A01 Broken Access Control:** ใช้ Row Level Security ทุกตาราง (default-deny) + GRANT เฉพาะที่จำเป็น
  ไม่ส่ง `reporter_id` จาก client — database ใส่ `auth.uid()` เอง
  `requireLogin()` ใน front-end เป็นเพียงความสะดวก ความปลอดภัยจริงอยู่ที่ RLS
- **A03 Injection (XSS):** แสดงข้อมูลด้วย `textContent` / `createElement` ไม่ใช้ `innerHTML`
- **A07 Authentication Failures:** ไม่เขียนระบบ auth เอง ใช้ Supabase Auth
- **Secrets:** repo นี้มีเฉพาะ publishable key (ออกแบบให้อยู่ฝั่ง client ได้ เมื่อเปิด RLS)
  ไม่มี secret key / service_role key / database password

## Known Limitations

- ใช้ email service ในตัวของ Supabase ซึ่งมี rate limit ต่ำ (โปรเจกต์นี้ตั้งไว้ 2 emails/ชั่วโมง)
  ก่อนใช้งานจริงควรตั้ง custom SMTP
- ยังไม่มีหน้าแก้ไข/ลบข้อมูล, ค้นหา/กรอง และหน้า admin จัดการ role
- เป็น personal project สำหรับเรียนรู้ ยังไม่ผ่านการ security review อย่างเป็นทางการ

## Screenshots

_(เพิ่มภาพหน้า login, ฟอร์ม, และหน้าดูข้อมูลที่นี่)_
