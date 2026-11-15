/* guide-data.js — เนื้อหาคู่มือผู้ใช้ใหม่ ต่อหน้า (รูปแบบข้อความ: [ไทย, English])
   กติกา: ไม่แต่งนโยบาย/ค่า default ของบริษัท; ตัวอย่างต้องติดป้ายว่าเป็นตัวอย่าง; ศัพท์เทคนิคใช้ทับศัพท์ */
window.SHE_GUIDE = {
  "admin-users": {
    purpose: ["อนุมัติหรือไม่อนุมัติผู้สมัครใหม่ กำหนด Role และ Plant ให้ในขั้นตอนเดียว และแก้ข้อมูลผู้ใช้ที่พิมพ์ผิด", "Approve or reject new sign-ups, set their Role and Plant in one step, and correct users' details."],
    who: ["Admin และ Super admin", "Admin and Super admin."],
    ifnot: ["ผู้สมัครจะค้างสถานะ \"รออนุมัติ\" และเข้าใช้งานระบบไม่ได้", "Applicants stay in \"Pending\" and cannot use the portal."],
    steps: [
      ["ดูกล่อง \"รออนุมัติ\" ด้านบน แต่ละแถวคือผู้สมัครหนึ่งคน", "Look at the \"Pending\" box at the top; each row is one applicant."],
      ["ตรวจชื่อ รหัสพนักงาน อีเมล และ Plant ที่ผู้สมัครเลือก ว่าตรงกับบุคคลจริง (เทียบกับรายชื่อจาก HR)", "Check name, employee code, email and chosen Plant against the real person (compare with the HR list)."],
      ["เลือก Role และ Plant อย่างน้อย 1 แห่ง ที่เหมาะสม แล้วกดปุ่มเขียว \"✓ อนุมัติ\" (ระบบจะถามยืนยันอีกครั้ง)", "Choose the right Role and Plant, then press the green Approve button."],
      ["ถ้าไม่อนุมัติ กดปุ่มแดงและใส่เหตุผลให้ชัด ผู้สมัครจะเห็นเหตุผลนั้น", "To reject, press the red button and give a clear reason; the applicant will see it."],
      ["แก้ข้อมูลผู้ใช้เดิมได้ที่ปุ่ม \"แก้ไข\" ในตาราง \"ผู้ใช้ทั้งหมด\" ใช้ตัวกรองด้านบนช่วยค้นหา", "Edit an existing user with the \"Edit\" button in the \"All users\" table; use the filters to find people."]
    ],
    glossary: [
      ["Role", "บทบาทของผู้ใช้ เช่น Employee, SHE, Admin กำหนดว่าเห็นและทำอะไรได้", "A user's job role in the portal (e.g. Employee, SHE, Admin); it decides what they can see and do."],
      ["Plant", "โรงงาน/สถานที่ทำงาน ผู้ใช้เห็นข้อมูลเฉพาะ Plant ที่ได้รับ", "A factory or site. Users only see data for the Plants they are given."],
      ["รหัสพนักงาน", "รหัสเฉพาะของแต่ละคน ห้ามซ้ำกันทั้งระบบ แก้ได้เฉพาะ Admin", "Each person's unique code; it cannot repeat anywhere in the system and only Admin can edit it."],
      ["พักบัญชี (Dormant)", "บัญชีที่ไม่ได้เข้าใช้งานนานเกินกำหนด ระบบพักให้อัตโนมัติ ผู้ใช้กลับมาใช้ได้โดยกด \"ลืมรหัสผ่าน\"", "An account unused for too long is paused automatically; the user returns via \"Forgot password\"."],
      ["ถูกระงับ (Suspended)", "ปิดการเข้าใช้ เช่น กรณีลาออก ดูหน้า \"ลาออก / ทบทวนสิทธิ์\"", "Access closed, e.g. a leaver; see the \"Leavers / access review\" page."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["ผู้สมัครชื่อ \"สมชาย\" เลือก Plant A และพิมพ์แผนก \"ผลิต\" → ตรวจรหัสพนักงานกับรายชื่อ HR ว่าตรง → เลือก Role = Employee, Plant = A → กด \"อนุมัติ\" (ชื่อและค่าเป็นตัวอย่าง ไม่ใช่ข้อมูลจริง)", "Applicant \"Somchai\" picks Plant A and types department \"Production\" → check the employee code against the HR list → set Role = Employee, Plant = A → press Approve (names and values are examples, not real data)."],
    std: ["ISO/IEC 27001:2022 A.5.16 (การบริหารตัวตน) และ A.5.18 (สิทธิ์การเข้าถึง)", "ISO/IEC 27001:2022 A.5.16 (Identity management) and A.5.18 (Access rights)."]
  },

  "admin-master": {
    purpose: ["กำหนดรายการ \"ตัวเลือก\" ที่ใช้ทั้งระบบ ได้แก่ Plant, แผนกมาตรฐาน และรายการ Dropdown ในฟอร์ม (เช่น ชนิดการบาดเจ็บ) โดยไม่ต้องแก้โค้ด", "Maintain the \"choices\" used across the portal: Plants, standard departments and form dropdown lists (e.g. injury types) without code changes."],
    who: ["Admin และ Super admin", "Admin and Super admin."],
    ifnot: ["ผู้สมัครไม่มี Plant ให้เลือกตอนสมัคร, ฟอร์มรายงานไม่มีตัวเลือก, และ Dashboard จัดกลุ่มตามแผนกไม่ได้", "Applicants have no Plant to choose when signing up, report forms have no options, and dashboards cannot group by department."],
    steps: [
      ["ส่วน Plant: กรอกรหัสสั้น ๆ และชื่อ Plant ด้านล่างตาราง แล้วกด \"+ เพิ่ม Plant\"", "Plants: type a short code and a name below the table, then press \"+ Add Plant\"."],
      ["ส่วนแผนก: เพิ่มแผนกมาตรฐานแบบเดียวกัน ระบบใช้จับคู่กับแผนกที่ผู้สมัครพิมพ์เอง", "Departments: add standard departments the same way; the system matches them with what applicants type."],
      ["ส่วนรายการตัวเลือก (Dropdown): เลือกรายการ แล้วเพิ่ม แก้ชื่อ เรียงลำดับ หรือปิดใช้งานได้", "Dropdown lists: choose a list, then add items, rename, reorder or deactivate them."],
      ["ไม่ต้องการแล้ว ให้ \"ปิดใช้งาน\" แทนการลบ ข้อมูลเดิมจะยังอ้างอิงถูกต้อง", "If no longer needed, \"deactivate\" instead of deleting; old records stay correct."]
    ],
    glossary: [
      ["รหัส (Code)", "ตัวย่อภาษาอังกฤษ/ตัวเลขที่ระบบใช้อ้างอิง เมื่อสร้างแล้วแก้ไม่ได้ เพื่อให้ข้อมูลเดิมยังตรง", "A short English/number identifier the system refers to. It cannot be changed after creation so old data stays valid."],
      ["ปิดใช้งาน", "ซ่อนจากตัวเลือกใหม่ แต่ประวัติที่เคยใช้ยังอยู่ ระบบไม่มีการลบข้อมูล", "Hidden from new choices while history that used it remains. Nothing is ever deleted."],
      ["หมวด", "ใช้จัดกลุ่มในรายการเลือก ไม่บังคับ เช่น กลุ่มของชนิดการบาดเจ็บ", "Optional grouping inside a list, e.g. a group of injury types."],
      ["ลำดับ", "ตัวเลข 0–9999 กำหนดลำดับที่แสดง เลขน้อยแสดงก่อน", "A number 0–9999 that sets display order; smaller shows first."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["เพิ่ม Plant: รหัส PLANT-A ชื่อ \"โรงงาน A\" → กด \"+ เพิ่ม Plant\" แล้วผู้สมัครจะเห็น Plant นี้ในหน้าสมัครสมาชิก (ค่าเป็นตัวอย่าง ใช้รหัสและชื่อจริงของ Plant)", "Add a Plant: code PLANT-A, name \"Factory A\" → press \"+ Add Plant\"; applicants then see it on the sign-up page (example values; use your real Plant code and name)."],
    fields: {
      "plants-code": ["ตัวย่อสั้น ๆ ภาษาอังกฤษ/ตัวเลข เช่น PLANT-A (ตัวอย่าง) สร้างแล้วแก้ไม่ได้", "A short English/number code, e.g. PLANT-A (example). Cannot be changed after creation."],
      "plants-name": ["ชื่อที่ผู้ใช้เห็น เช่น \"โรงงาน A\" (ตัวอย่าง)", "The name users see, e.g. \"Factory A\" (example)."],
      "departments-code": ["ตัวย่อสั้น ๆ เช่น PROD (ตัวอย่าง)", "A short code, e.g. PROD (example)."],
      "departments-name": ["ชื่อแผนกมาตรฐาน เช่น \"ผลิต\" (ตัวอย่าง)", "Standard department name, e.g. \"Production\" (example)."]
    }
  },

  "admin-permissions": {
    purpose: ["กำหนดว่าแต่ละ Role ทำอะไรได้บ้าง เช่น ส่งออกข้อมูล แก้ไขรายงาน ดู Dashboard", "Set what each Role may do, e.g. export data, edit reports, view dashboards."],
    who: ["Admin และ Super admin", "Admin and Super admin."],
    ifnot: ["Role จะทำได้ตามสิทธิ์ที่ระบบตั้งไว้เดิม หากสิทธิ์ไม่พอ ผู้ใช้จะเห็นข้อความว่าไม่มีสิทธิ์", "Roles keep the permissions already configured; if a permission is missing the user sees a \"no permission\" message."],
    steps: [
      ["อ่านตาราง: แถว = สิทธิ์ (เช่น ส่งออก CSV) คอลัมน์ = Role", "Read the table: rows = permissions (e.g. CSV export), columns = Roles."],
      ["ติ๊กช่องเพื่อให้สิทธิ์ เลิกติ๊กเพื่อถอนสิทธิ์ ผลมีผลทันที", "Tick a box to grant, untick to revoke; it takes effect immediately."],
      ["สิทธิ์ที่อ่อนไหวจะมีหน้าต่างให้ยืนยันก่อน อ่านข้อความแล้วกดยืนยัน", "Sensitive permissions show a confirmation window; read it, then confirm."],
      ["ต้องการให้สิทธิ์เฉพาะบางคน ไม่ใช่ทั้ง Role ให้ไปที่หน้า \"สิทธิ์รายบุคคล\"", "To give a permission to specific people instead of a whole Role, use the \"Individual permissions\" page."]
    ],
    glossary: [
      ["✓", "Role นี้ได้รับสิทธิ์", "This Role has the permission."],
      ["▢", "Role นี้ไม่ได้รับสิทธิ์", "This Role does not have it."],
      ["● ล็อกถาวร", "ปรับไม่ได้ ระบบกำหนดไว้", "Locked, cannot be changed."],
      ["◐ ไม่ได้อัตโนมัติ", "ต้องให้เป็นรายบุคคลที่หน้า \"สิทธิ์รายบุคคล\"", "Not automatic; grant per person on the \"Individual permissions\" page."],
      ["Plant-scoped", "สิทธิ์ที่ใช้ได้เฉพาะ Plant ที่ผู้ใช้เข้าถึง แม้ได้สิทธิ์ก็ไม่เห็น Plant อื่น", "A permission limited to the user's own Plants, so they never see other Plants."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["ต้องการให้ MD ส่งออก CSV ได้: หาแถว \"ส่งออก\" → ติ๊กช่องคอลัมน์ MD → ยืนยันในหน้าต่างที่ขึ้นมา (เป็นตัวอย่างเพื่อให้เห็นภาพ ไม่ใช่นโยบาย)", "To let MD export CSV: find the Export row → tick the MD column → confirm in the popup (illustration only, not a policy)."],
    std: ["ISO/IEC 27001:2022 A.5.15 (การควบคุมการเข้าถึง) หลักสิทธิ์น้อยที่สุด", "ISO/IEC 27001:2022 A.5.15 (Access control), least privilege."]
  },

  "admin-grants": {
    purpose: ["ให้สิทธิ์เพิ่มแก่ผู้ใช้เป็นรายบุคคล เช่น แต่งตั้ง SHE ให้เป็นผู้ยืนยันผล (SHE Manager) โดยไม่ต้องสร้าง Role ใหม่", "Give extra permissions to individual users, e.g. appoint a SHE person as the verifier (SHE Manager) without creating a new Role."],
    who: ["Admin และ Super admin (ให้สิทธิ์ตัวเองไม่ได้)", "Admin and Super admin (you cannot grant to yourself)."],
    ifnot: ["ขั้นตอนที่ต้องมีผู้ยืนยัน (เช่น Verify การปิด Action) จะไม่มีใครทำได้", "Steps that need a verifier (e.g. verifying a closed Action) cannot be done by anyone."],
    steps: [
      ["เลือก \"ผู้ใช้\" ที่ต้องการให้สิทธิ์", "Pick the \"User\" to receive the permission."],
      ["เลือก \"สิทธิ์\" ที่จะให้ (ในรายการมีป้าย \"SHE ไม่ได้อัตโนมัติ\" บอกสิทธิ์ที่ต้องให้เป็นรายคน)", "Pick the \"Permission\" (the label \"SHE not automatic\" marks permissions that must be given per person)."],
      ["เลือก Plant ที่สิทธิ์นี้ใช้ได้ (ถ้าสิทธินั้นผูกกับ Plant)", "Pick the Plant it applies to (when the permission is Plant-scoped)."],
      ["พิมพ์เหตุผล 5–200 ตัวอักษร แล้วกด \"ให้สิทธิ์\"", "Type a reason (5–200 characters), then press \"Grant\"."],
      ["ถอนสิทธิ์ได้ที่ปุ่มในตารางด้านล่าง ต้องใส่เหตุผลเช่นกัน", "Revoke with the button in the table below; a reason is required too."]
    ],
    glossary: [
      ["สิทธิ์รายบุคคล", "สิทธิ์ที่เพิ่มให้คนใดคนหนึ่ง เพิ่มได้อย่างเดียว ไม่ลดสิทธิ์ที่ Role มีอยู่", "A permission added for one person. It only adds; it never removes what the Role already has."],
      ["SHE Manager", "ไม่ใช่ Role ใหม่ แต่คือผู้ที่ Admin ให้สิทธิ์ยืนยันผลรายบุคคล", "Not a new Role; a person whom Admin has granted the verify permissions individually."],
      ["Audit log", "ประวัติที่ระบบบันทึกทุกการให้/ถอนสิทธิ์ ใครทำ เมื่อไร เพราะอะไร", "The system history of every grant/revoke: who, when and why."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["ผู้ใช้ = \"คุณ A (SHE โรงงาน A)\", สิทธิ์ = ยืนยันผล, Plant = โรงงาน A, เหตุผล = \"ได้รับมอบหมายเป็น SHE Manager ตามประกาศภายใน\" (เป็นตัวอย่าง ไม่ใช่ข้อมูลจริง)", "User = \"Ms A (SHE, Factory A)\", Permission = Verify, Plant = Factory A, Reason = \"Assigned as SHE Manager per internal notice\" (example, not real data)."],
    std: ["ISO/IEC 27001:2022 A.5.18 (สิทธิ์การเข้าถึง) และ A.5.3 (การแบ่งแยกหน้าที่)", "ISO/IEC 27001:2022 A.5.18 (Access rights) and A.5.3 (Segregation of duties)."],
    fields: {
      "g-user": ["คนที่จะได้รับสิทธิ์เพิ่ม เลือกจากรายชื่อผู้ใช้ที่ใช้งานอยู่", "The person who receives the extra permission, chosen from active users."],
      "g-perm": ["สิทธิ์ที่จะให้ เช่น ยืนยันผล (Verify)", "The permission to give, e.g. Verify."],
      "g-plant": ["สิทธิ์นี้ใช้ได้กับ Plant ใด (ต้องเป็น Plant ที่ผู้ใช้เข้าถึงอยู่แล้ว)", "Which Plant it applies to (must be a Plant the user already has access to)."],
      "g-reason": ["เขียนว่าใครอนุมัติหรือเพราะอะไร เช่น \"ได้รับมอบหมายตามประกาศภายใน\" เก็บไว้ใน Audit log", "Say who approved or why, e.g. \"Assigned by internal notice\". Kept in the Audit log."]
    }
  },

  "admin-offboarding": {
    purpose: ["ปิดการเข้าใช้ของผู้ที่ลาออกหรือย้ายงาน และทบทวนว่าใครยังถือสิทธิ์อยู่ รวมถึงตั้งค่าการพักบัญชีอัตโนมัติ", "Close access for leavers and movers, review who still holds permissions, and set automatic dormant-account suspension."],
    who: ["Admin และ Super admin", "Admin and Super admin."],
    ifnot: ["บัญชีของคนที่ออกไปแล้วยังเข้าระบบได้ และสิทธิ์ค้างอยู่ เป็นความเสี่ยงด้านการเข้าถึงข้อมูล", "Leavers' accounts can still log in and keep permissions, which is an access-control risk."],
    steps: [
      ["แท็บ \"ทบทวนผู้ใช้\": ค้นหาหรือกรองผู้ใช้ (เช่น ไม่ได้เข้าใช้ 90 วันขึ้นไป) ติ๊กคนที่ต้องระงับ แล้วกด \"ระงับและถอนสิทธิ์ที่เลือก\"", "\"Review users\" tab: search or filter (e.g. not logged in for 90+ days), tick people to suspend, then press \"Suspend and revoke selected\"."],
      ["แท็บ \"นำเข้ารายชื่อจาก HR\": เลือกไฟล์ CSV หรือวางรายชื่อ 1 บรรทัดต่อ 1 คน (รหัสพนักงานหรืออีเมล)", "\"Import HR list\" tab: choose a CSV or paste one person per line (employee code or email)."],
      ["กด \"ตรวจรายชื่อ\" ระบบจะจับคู่และแสดงผลก่อน ยังไม่ระงับจนกว่าจะเลือกและยืนยัน", "Press \"Check list\"; the system matches and shows the result first. Nothing is suspended until you select and confirm."],
      ["แท็บ \"ตั้งค่าและประวัติ\": ดูหรือตั้งจำนวนวันที่ถือว่าไม่ได้ใช้งาน และดูประวัติที่ผ่านมา", "\"Settings and history\" tab: view or set the inactivity period, and see past history."]
    ],
    glossary: [
      ["ระงับ (Suspend)", "ปิดการเข้าใช้และถอนสิทธิ์รายบุคคลที่ยังใช้งานอยู่ทั้งหมด พร้อมบันทึกใน Audit log", "Closes access and revokes all of the person's active individual permissions, logged in the Audit log."],
      ["Dormant (พักบัญชี)", "บัญชีที่ไม่ได้ล็อกอินเกินกำหนด ระบบพักให้อัตโนมัติ ผู้ใช้กลับมาได้ด้วย \"ลืมรหัสผ่าน\"", "An account with no login past the limit, paused automatically; the user returns via \"Forgot password\"."],
      ["CSV UTF-8", "ไฟล์ตารางที่บันทึกจาก Excel เลือกชนิด CSV UTF-8 เพื่อให้ภาษาไทยไม่เพี้ยน", "A table file saved from Excel as CSV UTF-8 so Thai text is not corrupted."],
      ["CAPA ค้าง", "จำนวน Action แก้ไข/ป้องกันที่ผู้ใช้นั้นยังรับผิดชอบอยู่ ควรโอนงานก่อนระงับ", "Corrective/preventive actions the user still owns; reassign them before suspending."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["ไฟล์จาก HR มีคอลัมน์ \"รหัสพนักงาน\" 3 แถว (เช่น EX001, EX002, EX003) → วางหรือเลือกไฟล์ → \"ตรวจรายชื่อ\" → ระบบแสดงว่าพบกี่คน → เลือกคนที่ยืนยันแล้ว → ระงับ (รหัสเป็นตัวอย่าง ไม่ใช่ข้อมูลจริง)", "An HR file with an \"employee code\" column and 3 rows (e.g. EX001, EX002, EX003) → paste or choose the file → \"Check list\" → the system shows who was found → select those confirmed → suspend (codes are examples, not real data)."],
    std: ["ISO/IEC 27001:2022 A.5.18 (Access rights) และ A.6.5 (หน้าที่หลังสิ้นสุดการจ้างงาน)", "ISO/IEC 27001:2022 A.5.18 (Access rights) and A.6.5 (Responsibilities after termination)."]
  },

  "admin-notifications": {
    purpose: ["กำหนดว่าใครได้รับแจ้งเตือนในกระดิ่งเมื่อ Action (CAPA) มีเหตุการณ์ เช่น เลยกำหนด ถูกส่งกลับ ตอนนี้แจ้งในระบบเท่านั้น ยังไม่ส่งอีเมล", "Decide who gets bell notifications when an Action (CAPA) has an event such as overdue or returned. In-app only for now; no email yet."],
    who: ["Super admin ตั้งกฎส่วนกลางได้ Admin/SHE ตั้งได้เฉพาะ Plant ที่ดูแล", "Super admin sets central rules; Admin/SHE only for the Plants they manage."],
    ifnot: ["ผู้รับผิดชอบและผู้สร้าง Action ยังได้รับแจ้งเสมอ แต่หัวหน้า/ผู้บริหารจะไม่ทราบเมื่อ Action เลยกำหนดหรือถูกส่งกลับ", "The Action's owner and creator are always notified, but managers will not know when an Action is overdue or returned."],
    steps: [
      ["ตั้ง \"จำนวนวันที่ถือว่าใกล้ครบกำหนด\" (0–30) แล้วกด \"บันทึก\"", "Set the \"days counted as due soon\" (0–30), then press Save."],
      ["เลือก Plant ที่ต้องการดูกฎด้านบนตาราง", "Choose the Plant whose rules you want to see above the table."],
      ["เพิ่มกฎใหม่ในฟอร์มด้านล่าง: เลือกวิธีกำหนดผู้รับ (ตาม Role / รายบุคคล) เลือกเหตุการณ์ แล้วบันทึก", "Add a rule in the form below: choose how to pick recipients (by Role / individual), pick events, then save."],
      ["ปิดกฎที่ไม่ใช้แล้วโดยไม่ต้องลบ ทุกการเปลี่ยนแปลงถูกบันทึกใน Audit log", "Turn off a rule you no longer need instead of deleting; every change is logged."]
    ],
    glossary: [
      ["ตาม Role", "ทุกคนที่มี Role นั้นและดู Plant นั้นได้ จะได้รับแจ้ง", "Everyone with that Role who can see that Plant is notified."],
      ["รายบุคคล", "เฉพาะคนที่เลือก ต้องระบุ Plant ด้วย", "Only the chosen person; a Plant is required."],
      ["Escalate", "ปุ่มลัดเลือกเฉพาะ \"เกินกำหนด\" และ \"ส่งกลับ / ยกเลิก\" เหมาะกับผู้บริหารที่ไม่ต้องการแจ้งทุกเรื่อง", "A shortcut that picks only \"overdue\" and \"returned/cancelled\", suited to managers who do not want every notification."],
      ["กฎ \"ทุก Plant\"", "กฎส่วนกลาง ตั้งได้เฉพาะ Super admin", "A central rule that only Super admin can set."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["ผู้อำนวยการโรงงาน A อยากรู้เฉพาะเรื่องที่ต้องตัดสินใจ → Plant = โรงงาน A, ตาม Role = Plant Director, กด Escalate → จะได้แจ้งเฉพาะเมื่อ Action เลยกำหนดหรือถูกส่งกลับ/ยกเลิก (เป็นตัวอย่าง)", "A Factory A director only wants decision items → Plant = Factory A, by Role = Plant Director, press Escalate → notified only when an Action is overdue or returned/cancelled (example)."],
    std: ["ISO/IEC 27001:2022 A.5.15 (สิทธิ์น้อยที่สุด) ISO 45001:2018 ข้อ 10.2", "ISO/IEC 27001:2022 A.5.15 (least privilege); ISO 45001:2018 clause 10.2."],
    fields: { "s-days": ["ถ้าตั้ง 3 = Action ที่เหลือเวลาไม่เกิน 3 วันจะถูกนับว่า \"ใกล้ครบกำหนด\" (3 เป็นเพียงตัวอย่าง)", "If set to 3, an Action with 3 days or fewer left counts as \"due soon\" (3 is only an example)."] }
  },

  "admin-announcements": {
    purpose: ["สร้างประกาศสำคัญที่แสดงเป็นแบนเนอร์บนหน้าแรก และดูว่าใครรับทราบแล้ว", "Create important announcements shown as a banner on the home page and see who has acknowledged them."],
    who: ["Admin ประกาศได้ทุก Plant, SHE ประกาศได้เฉพาะ Plant ที่ดูแล", "Admin can announce to all Plants; SHE only for their own Plants."],
    ifnot: ["ข้อมูลความปลอดภัยเร่งด่วนจะไม่ถึงผู้ใช้ทันที และไม่มีหลักฐานว่าใครรับทราบ", "Urgent safety information will not reach users promptly and there is no record of who acknowledged it."],
    steps: [
      ["เลือก \"ขอบเขต (Plant)\" และ \"ระดับ\" ของประกาศ", "Choose the scope (Plant) and level."],
      ["พิมพ์หัวข้อ (ไม่เกิน 120 ตัวอักษร) และรายละเอียด (ไม่เกิน 1,000 ตัวอักษร)", "Type a title (max 120 characters) and details (max 1,000 characters)."],
      ["ตั้งวัน-เวลา \"เริ่มแสดง\" และ \"สิ้นสุด\" (เว้นว่าง = ไม่กำหนดวันสิ้นสุด)", "Set \"start\" and \"end\" date-time (blank end = no end)."],
      ["กด \"+ สร้างประกาศ\" ประกาศจะขึ้นในช่วงเวลาที่ตั้ง ปิดหรือแก้ได้จากตารางด้านล่าง", "Press \"+ Create\"; it shows during the set period and can be edited or closed in the table below."],
      ["ดูจำนวนผู้รับทราบและรายชื่อได้ในตาราง (ใช้เป็นหลักฐานการสื่อสารเท่านั้น)", "See acknowledgement counts and names in the table (used as communication evidence only)."]
    ],
    glossary: [
      ["ระดับ ทั่วไป / สำคัญ / เร่งด่วน", "General / Important / Urgent — ยิ่งเร่งด่วนยิ่งเด่นบนหน้าแรก", "General / Important / Urgent — the more urgent, the more prominent on the home page."],
      ["รับทราบ", "ผู้ใช้กดยืนยันว่าอ่านประกาศแล้ว ระบบเก็บชื่อและเวลาไว้", "The user confirms they read it; the system records name and time."],
      ["ขอบเขต \"ทุก Plant\"", "ประกาศถึงทุกโรงงาน สร้างได้เฉพาะ Admin", "Announcement for all Plants; only Admin can create it."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["หัวข้อ \"งดเข้าพื้นที่ซ่อมบำรุงโซน B\" ระดับ สำคัญ ขอบเขต โรงงาน A เริ่มพรุ่งนี้ 08:00 สิ้นสุดสิ้นเดือน (เป็นตัวอย่าง ห้ามใส่ข้อมูลส่วนบุคคลหรือความลับในประกาศ)", "Title \"Maintenance Zone B closed\", level Important, scope Factory A, starts tomorrow 08:00, ends end of month (example; never put personal data or secrets in announcements)."],
    std: ["ISO 45001:2018 ข้อ 7.4 (การสื่อสาร)", "ISO 45001:2018 clause 7.4 (Communication)."],
    fields: {
      "a-plant": ["เลือก Plant ที่ต้องการให้เห็นประกาศ (\"ทุก Plant\" เฉพาะ Admin)", "Which Plant should see it (\"All Plants\" is Admin only)."],
      "a-sev": ["ทั่วไป = ข่าวสาร, สำคัญ = ควรอ่าน, เร่งด่วน = ต้องรับทราบทันที", "General = news, Important = should read, Urgent = must acknowledge now."],
      "a-title": ["สั้นและชัด เช่น \"งดเข้าพื้นที่ซ่อมบำรุงโซน B\" (ตัวอย่าง)", "Short and clear, e.g. \"Maintenance Zone B closed\" (example)."],
      "a-body": ["บอกว่าเกิดอะไร ใครต้องทำอะไร และถึงเมื่อไร ห้ามใส่ข้อมูลส่วนบุคคลหรือความลับ", "Say what happened, who must do what and until when. No personal data or secrets."],
      "a-start": ["วัน-เวลาที่ประกาศเริ่มขึ้นบนหน้าแรก", "When the banner starts showing on the home page."],
      "a-end": ["วัน-เวลาที่ประกาศหายไป เว้นว่างถ้าไม่กำหนด", "When the banner stops showing; leave blank for no end."]
    }
  },

  "admin-themes": {
    purpose: ["กำหนดช่วงวันที่ เปิด/ปิด และข้อความทักทายของธีมเทศกาลที่ขึ้นบนหน้าล็อกอินและหน้าแรก", "Set date ranges, on/off and greeting text of the festival themes shown on the login and home pages."],
    who: ["Super admin แก้ได้ Admin ดูได้อย่างเดียว", "Super admin can edit; Admin is view-only."],
    ifnot: ["ระบบใช้ธีมตามที่ตั้งไว้เดิม ธีมเทศกาลอาจขึ้นผิดช่วงหรือไม่ขึ้นตามต้องการ", "The system keeps the existing theme settings; a festival theme may show at the wrong time or not at all."],
    steps: [
      ["หาธีมที่ต้องการในรายการ", "Find the theme in the list."],
      ["ตั้ง \"เมื่อไหร่\" (วันเจาะจง ช่วงวันที่ หรือทั้งเดือน) เปิดหรือปิด และข้อความทักทาย", "Set \"when\" (a specific day, a date range or the whole month), on/off and the greeting."],
      ["กด \"ดูตัวอย่าง\" เพื่อเปิดหน้าแรกด้วยธีมนั้นก่อนบันทึก (ล้างตัวอย่างโดยเติม ?theme=auto ท้าย URL)", "Press \"Preview\" to open the home page with that theme before saving (clear it by adding ?theme=auto to the URL)."],
      ["กด \"บันทึก\" ถ้าต้องการกลับค่าเดิม กด \"รีเซ็ตเป็นค่าเริ่มต้น\"", "Press Save; to go back to the default, press \"Reset to default\"."]
    ],
    glossary: [
      ["ลำดับการเลือกธีม", "วันเจาะจง ชนะ ช่วงวันที่ ชนะ ทั้งเดือน (เวลาประเทศไทย)", "Specific day beats date range beats whole month (Thailand time)."],
      ["ทั้งเดือน", "ใช้กับวันที่ไม่แน่นอน เช่น ตรุษจีน ลอยกระทง ให้ระบุปีที่ใช้ด้วย", "For uncertain dates such as Lunar New Year or Loy Krathong; also state the year."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["ต้องการให้ธีมปีใหม่ขึ้นตั้งแต่ 29 ธ.ค. ถึง 2 ม.ค. → เลือกช่วงวันที่ → ใส่วันเริ่ม/สิ้นสุด → ดูตัวอย่าง → บันทึก (วันที่เป็นตัวอย่าง)", "To show the New Year theme from 29 Dec to 2 Jan → choose a date range → enter start/end → preview → save (dates are examples)."]
  }
};

/* คำศัพท์ภาษาไทย → อังกฤษ สำหรับหัวข้อคำศัพท์ในโหมด EN (คำที่เป็นภาษาอังกฤษอยู่แล้วคงเดิม) */
(function () {
  var T = {
    "รหัสพนักงาน": "Employee code", "พักบัญชี (Dormant)": "Dormant account", "ถูกระงับ (Suspended)": "Suspended",
    "รหัส (Code)": "Code", "ปิดใช้งาน": "Deactivate", "หมวด": "Category", "ลำดับ": "Order",
    "ล็อกถาวร": "Locked", "● ล็อกถาวร": "● Locked", "◐ ไม่ได้อัตโนมัติ": "◐ Not automatic",
    "สิทธิ์รายบุคคล": "Individual permission", "ระงับ (Suspend)": "Suspend", "Dormant (พักบัญชี)": "Dormant account",
    "CAPA ค้าง": "Open CAPA", "ตาม Role": "By Role", "รายบุคคล": "Individual", "กฎ \"ทุก Plant\"": "\"All Plants\" rule",
    "ระดับ ทั่วไป / สำคัญ / เร่งด่วน": "Levels General / Important / Urgent", "รับทราบ": "Acknowledge",
    "ขอบเขต \"ทุก Plant\"": "Scope \"All Plants\"", "ลำดับการเลือกธีม": "Theme priority", "ทั้งเดือน": "Whole month"
  };
  Object.keys(window.SHE_GUIDE).forEach(function (k) {
    (window.SHE_GUIDE[k].glossary || []).forEach(function (g) { if (T[g[0][0]]) g[0][1] = T[g[0][0]]; });
  });
})();
