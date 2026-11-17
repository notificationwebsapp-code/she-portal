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

  "exposure": {
    purpose: ["บันทึกชั่วโมงทำงาน จำนวนพนักงาน/ผู้รับเหมา และจำนวน UA/UC ของ Plant ตนเองเดือนละครั้ง เพื่อให้ Dashboard คำนวณอัตราต่อชั่วโมงทำงานและแสดงชั้นล่างของพีระมิดได้ถูกต้อง", "Record each plant's monthly work hours, headcount and UA/UC counts so dashboards can show rates per hours worked and the lower pyramid layers."],
    who: ["SHE ของแต่ละ Plant (กรอกได้เฉพาะ Plant ของตน) และ Admin (ทุก Plant) ส่วนแท็บ \"ชั้นของพีระมิด\" ใช้ได้เฉพาะ Admin", "Each plant's SHE (own plant only) and Admin (all plants). The pyramid layers tab is Admin only."],
    ifnot: ["Dashboard คำนวณอัตราอุบัติเหตุต่อชั่วโมงทำงานไม่ได้ และพีระมิดไม่มีชั้น UA/UC", "Dashboards cannot calculate incident rates per hours worked, and the pyramid has no UA/UC layers."],
    steps: [
      ["เลือก Plant และเดือน (ระบบเลือกเดือนที่แล้วให้ก่อน)", "Choose the plant and month (last month is pre-selected)."],
      ["กรอกชั่วโมงทำงานรวมและจำนวนคน ถ้ายังไม่ทราบค่าไหนให้เว้นว่างได้", "Enter total hours worked and headcount; leave a field blank if you do not know it yet."],
      ["กรอกจำนวนในแต่ละชั้นล่างของพีระมิด เช่น UA และ UC", "Enter the count for each lower pyramid layer, e.g. UA and UC."],
      ["กด \"บันทึกข้อมูลเดือนนี้\" ถ้าเดือนนั้นมีข้อมูลอยู่แล้วจะถูกทับด้วยค่าใหม่", "Press Save; existing values for that month are overwritten."],
      ["ดูตาราง 12 เดือนล่าสุดว่าเดือนไหนยังไม่กรอก (ป้าย \"ยังไม่กรอก\" / \"กรอกบางส่วน\" / \"ครบ\") กด \"แก้ไข\" เพื่อกลับไปกรอกเดือนนั้น", "Check the last 12 months table for months not yet filled; press Edit to go back to that month."],
      ["กรอกย้อนหลังหลายเดือน: ใช้แท็บ \"นำเข้า / ส่งออก\" ดาวน์โหลดไฟล์ตัวอย่าง กรอก ตรวจไฟล์ แก้ในตาราง แล้วยืนยัน (ไม่บันทึกจนกว่าจะยืนยัน)", "For many months: use the import tab, download the example, fill, check, edit in the table, then confirm (nothing is saved until you confirm)."]
    ],
    glossary: [
      ["ชั่วโมงทำงานรวม", "ผลรวมชั่วโมงทำงานของทุกคนในเดือนนั้น ตามนิยามของบริษัท ใช้เป็นตัวหารของอัตราอุบัติเหตุ", "Total hours worked by everyone in the month, per company definition; the denominator of incident rates."],
      ["UA", "การกระทำที่ไม่ปลอดภัย ชื่อและนิยามที่ใช้จริงตามที่ Admin กำหนด", "Unsafe Act. The name and definition actually used are set by Admin."],
      ["UC", "สภาพที่ไม่ปลอดภัย ชื่อและนิยามที่ใช้จริงตามที่ Admin กำหนด", "Unsafe Condition. The name and definition actually used are set by Admin."],
      ["ชั้นล่างของพีระมิด", "ชั้นที่อยู่ใต้ \"เหตุเกือบเกิดอุบัติเหตุ\" บนพีระมิด เช่น UA และ UC Admin เพิ่ม ปิด หรือเรียงลำดับได้", "Layers below near miss in the pyramid, e.g. UA and UC; Admin can add, deactivate or reorder them."],
      ["ตรวจไฟล์", "ตรวจไฟล์นำเข้าว่าผิดตรงไหนโดยยังไม่บันทึกอะไร", "Checks an import file for errors without saving anything."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["ตัวอย่าง: Plant A เดือนตุลาคม พนักงาน 240 คน ทำงานรวม 52,000 ชั่วโมง พบ UA 12 เรื่อง และ UC 30 เรื่อง (ตัวเลขสมมติ) กรอกทั้งหมดในหน้านี้แล้วกดบันทึก", "Example: Plant A, October, 240 employees, 52,000 hours, 12 UA and 30 UC (made-up numbers): enter them here and press Save."],
    std: ["ISO 45001:2018 ข้อ 9.1 (การเฝ้าระวัง วัด วิเคราะห์ และประเมินผล) และ ISO/IEC 27001:2022 A.8.15 (การบันทึกเหตุการณ์ ทุกการแก้ไขมี audit log)", "ISO 45001:2018 cl. 9.1 (monitoring, measurement, analysis and evaluation) and ISO/IEC 27001:2022 A.8.15 (logging; every change is audit-logged)."]
  },

  "admin-incident-types": {
    purpose: ["กำหนดตัวเลือกของรายงานอุบัติเหตุเอง 3 แกน: ประเภทเหตุการณ์ (ต้นไม้หลายระดับ), ความรุนแรง (Pyramid) และผู้เกี่ยวข้อง โดยไม่ต้องแก้โค้ด", "Define the three choices of the incident report yourself: incident type (multi-level tree), severity (Pyramid) and involved party, without code changes."],
    who: ["Admin และ Super admin", "Admin and Super admin."],
    ifnot: ["ฟอร์มรายงานไม่มีตัวเลือกให้เลือก และ Dashboard จัดกลุ่มหรือวาด Pyramid ไม่ได้", "The report form has nothing to choose from, and dashboards cannot group data or draw the Pyramid."],
    steps: [
      ["เลือกแท็บ: ประเภทเหตุการณ์ / ความรุนแรง / ผู้เกี่ยวข้อง", "Pick a tab: incident types / severity / involved parties."],
      ["ประเภท: กด \"+ ลูก\" ที่รายการแม่เพื่อเพิ่มหัวข้อย่อย หรือกรอกฟอร์มด้านล่างเพื่อเพิ่มหัวข้อระดับบนสุด (แนะนำไม่เกิน 4 ระดับ)", "Types: press \"+ child\" on a parent to add a sub-heading, or use the form below for a top-level heading (4 levels or fewer recommended)."],
      ["ความรุนแรง: ใช้ ▲ ▼ จัดลำดับจากรุนแรงที่สุดลงมา แล้วใส่นิยามตามบริษัทในช่อง \"คำอธิบาย\"", "Severity: use ▲ ▼ to order from most severe down, and put your company definition in \"Description\"."],
      ["มีรายการจำนวนมาก: ใช้กล่อง \"นำเข้า\" ใต้แต่ละแท็บ ดาวน์โหลดไฟล์ตัวอย่าง กรอก แล้ว \"ตรวจไฟล์\" → แก้ในตาราง → \"ยืนยันนำเข้า\" (ตรวจก่อนเสมอ ไม่บันทึกทันที)", "Many items: use the \"Import\" box under each tab; download the example file, fill it in, then \"Check file\" → edit in the table → \"Confirm import\" (always checked first, never saved immediately)."],
      ["ไม่ใช้แล้วให้ \"ปิดใช้งาน\" ไม่มีการลบ รายงานเดิมยังอ้างอิงถูกต้อง", "If no longer used, \"deactivate\"; nothing is deleted and old reports stay correct."]
    ],
    glossary: [
      ["ประเภทเหตุการณ์ (Incident type)", "ต้นไม้ของ \"เกิดอะไรขึ้น\" หมวดใหญ่ → หมวดย่อย เช่น ไฟไหม้ → ไฟฟ้า → ตู้ควบคุม", "A tree of \"what happened\": main group → sub group, e.g. Fire → Electrical → Control panel."],
      ["ความรุนแรง (Severity)", "ระดับผลกระทบตาม Pyramid เช่น FAT, LTI, RWC, MTC, FAC, PD, NEAR แยกจากประเภท ตั้งชื่อและนิยามตามบริษัท", "Impact level in the Pyramid, e.g. FAT, LTI, RWC, MTC, FAC, PD, NEAR; separate from the type. Names and definitions are your company's."],
      ["ผู้เกี่ยวข้อง (Involved party)", "เกิดกับใคร เช่น พนักงาน ผู้รับเหมา ซัพพลายเออร์ ใช้กรองและเทียบสถิติ", "Who it happened to, e.g. employee, contractor, supplier; used to filter and compare statistics."],
      ["ผู้รายงานเลือกได้ (Selectable)", "ติ๊ก = เป็นหัวข้อปลายทางที่เลือกในฟอร์มได้ ไม่ติ๊ก = หัวข้อกลุ่มสำหรับจัดหมวด", "Ticked = a final heading reporters can pick; unticked = a group heading used only to organise."],
      ["รหัส (Code)", "ตัวย่อภาษาอังกฤษ/ตัวเลข สร้างแล้วแก้ไม่ได้ เพื่อให้ข้อมูลเดิมยังตรง", "A short English/number identifier that cannot be changed after creation so old data stays valid."],
      ["ระดับ (Depth)", "ชั้นของหัวข้อในต้นไม้ ระดับ 1 = บนสุด ระบบรองรับสูงสุด 10 ระดับ แนะนำไม่เกิน 4", "The layer of a heading in the tree; level 1 = top. The system allows up to 10, 4 or fewer is recommended."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["ตัวอย่าง: เพิ่ม \"ไฟไหม้\" (ระดับ 1, ไม่ติ๊กเลือกได้) → กด \"+ ลูก\" เพิ่ม \"ไฟฟ้า\" (ระดับ 2) → กด \"+ ลูก\" ที่ \"ไฟฟ้า\" เพิ่ม \"ตู้ควบคุม\" (ระดับ 3, ติ๊กเลือกได้) แล้วผู้รายงานจะเลือกไล่ลงมาทีละระดับ (ชื่อเป็นตัวอย่าง ใช้หัวข้อจริงของบริษัท)", "Example: add \"Fire\" (level 1, not selectable) → press \"+ child\" and add \"Electrical\" (level 2) → press \"+ child\" on \"Electrical\" and add \"Control panel\" (level 3, selectable); reporters then pick level by level (names are examples; use your real headings)."],
    std: ["ISO 45001:2018 ข้อ 10.2 (เหตุการณ์ ความไม่สอดคล้อง และการปฏิบัติการแก้ไข) และข้อ 7.5 (ข้อมูลที่เป็นเอกสาร)", "ISO 45001:2018 clause 10.2 (incident, nonconformity and corrective action) and clause 7.5 (documented information)."],
    fields: {
      "ty-code": ["ตัวย่อสั้น ๆ เช่น FIRE-ELEC (ตัวอย่าง) สร้างแล้วแก้ไม่ได้", "A short code, e.g. FIRE-ELEC (example). Cannot be changed after creation."],
      "ty-parent": ["เลือกหัวข้อแม่ ถ้าเว้นว่างจะเป็นหัวข้อระดับบนสุด", "Choose the parent heading; blank means a top-level heading."],
      "ty-th": ["ชื่อที่ผู้รายงานเห็น เช่น \"ไฟฟ้า\" (ตัวอย่าง)", "The name reporters see, e.g. \"Electrical\" (example)."],
      "ty-sort": ["ตัวเลข 0–9999 เลขน้อยแสดงก่อนในกลุ่มเดียวกัน", "A number 0–9999; smaller shows first within the same group."],
      "sv-code": ["ตัวย่อสั้น ๆ เช่น LTI (ตัวอย่าง) สร้างแล้วแก้ไม่ได้", "A short code, e.g. LTI (example). Cannot be changed after creation."],
      "sv-rank": ["1 = รุนแรงที่สุด ถ้าเว้นว่างจะต่อท้ายสุด ใช้ ▲ ▼ ปรับทีหลังได้", "1 = most severe; blank puts it last. You can adjust later with ▲ ▼."],
      "sv-desc": ["นิยามตามบริษัท ผู้รายงานอ่านตอนเลือก เช่น \"บาดเจ็บจนต้องหยุดงานตั้งแต่ 1 วันขึ้นไป\" (ตัวอย่าง ใช้นิยามจริงของบริษัท)", "Your company definition, read by reporters when choosing, e.g. \"injury causing 1 or more lost days\" (example; use your real definition)."],
      "pt-code": ["ตัวย่อสั้น ๆ เช่น visitor (ตัวอย่าง) สร้างแล้วแก้ไม่ได้", "A short code, e.g. visitor (example). Cannot be changed after creation."],
      "pt-th": ["ชื่อที่ผู้รายงานเห็น เช่น \"ผู้มาติดต่อ\" (ตัวอย่าง)", "The name reporters see, e.g. \"Visitor\" (example)."]
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

  "md-brief": {
    purpose: ["ให้ MD เห็นภาพรวมทุก Plant ในหน้าเดียว: เหตุร้ายแรงใหม่ (FAT/LTI และ Serious potential), Plant ที่มี Action เกินกำหนดและรายการที่เกินกำหนด, และตัวชี้วัดเชิงรุก", "Gives the MD one page for all Plants: new serious incidents (FAT/LTI and Serious potential), Plants with overdue Actions and the overdue items, and leading indicators."],
    who: ["MD, CEO, Admin และ Super admin (ไม่ต้องผูก Plant) ผู้ใช้ role อื่นเข้าหน้านี้ไม่ได้", "MD, CEO, Admin and Super admin (no Plant binding needed). Other roles cannot open this page."],
    ifnot: ["ถ้าไม่เปิดดู ผู้บริหารอาจไม่ทราบเหตุร้ายแรงหรือ Plant ที่มี Action ค้างจนเลยกำหนดนาน หน้านี้ไม่แสดงชื่อบุคคลหรือคำอธิบายเหตุการณ์", "If not reviewed, management may miss serious incidents or Plants with long-overdue Actions. This page shows no personal names or incident descriptions."],
    steps: [
      ["เลือกมุมมอง (ทุก Plant / Priority site / Business unit / Plant เดียว) และช่วงเวลา แล้วกด \"แสดงผล\"", "Choose the view (all Plants / Priority sites / Business unit / single Plant) and the period, then press Show."],
      ["ดูตัวเลขสำคัญด้านบน: สีแดง = เหตุร้ายแรง สีส้ม = มี Overdue สีเขียว = ไม่มีรายการค้าง", "Read the key numbers at the top: red = serious incidents, orange = overdue items exist, green = nothing outstanding."],
      ["กดชื่อ Plant ในตาราง \"Plant ที่มี Action เกินกำหนด\" เพื่อดูรายการ Action ที่เกินกำหนดของ Plant นั้น", "Press a Plant name in the \"Plants with overdue Actions\" table to see that Plant's overdue Actions."],
      ["ดู \"เหตุร้ายแรงล่าสุด\" และ Leading indicator ด้านล่าง หากต้องการรายละเอียดเคสให้ไปหน้ารายการรายงาน", "Check \"Latest serious incidents\" and the leading indicators below; for case details go to the Reports page."]
    ],
    glossary: [
      ["FAT/LTI", "เหตุร้ายแรง: เสียชีวิต (FAT) หรือบาดเจ็บถึงขั้นหยุดงาน (LTI)", "Serious incident: fatality (FAT) or lost time injury (LTI)."],
      ["Serious potential", "เหตุที่ผลจริงเบาแต่มีศักยภาพร้ายแรง (เช่น Near miss ที่เกือบเป็น FAT)", "An event with a minor actual outcome but serious potential (e.g. a near miss that almost became a fatality)."],
      ["Overdue", "Action (CAPA) ที่เลยวันครบกำหนดและยังไม่ปิด (เปิดใหม่ / กำลังดำเนินการ / ส่งกลับให้แก้)", "A CAPA Action past its due date and not yet closed (new / in progress / returned)."],
      ["Leading indicator", "ตัวชี้วัดเชิงรุกที่เตือนก่อนเกิดเหตุ เช่น ปิด Action ตรงเวลา", "A proactive measure that warns before incidents happen, such as closing Actions on time."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["ต้องการทราบว่าสัปดาห์นี้ Plant ใดมี Action เกินกำหนด → เลือก \"ทุก Plant\" และ \"7 วันล่าสุด\" → ดูตาราง Plant ที่มี Overdue → กดชื่อ Plant เพื่อดูว่า Action ใดเกินกำหนดและเกินมากี่วัน", "To see which Plants have overdue Actions this week → choose All Plants and Last 7 days → read the Plants table → press a Plant name to see which Actions are overdue and by how many days."],
    std: ["ISO 45001:2018 ข้อ 5.1 (ภาวะผู้นำ), 9.1 (การเฝ้าติดตามและวัดผล), 9.3 (การทบทวนโดยผู้บริหาร) และ ISO/IEC 27001:2022 A.5.15 (สิทธิ์น้อยที่สุด)", "ISO 45001:2018 clauses 5.1 (leadership), 9.1 (monitoring and measurement), 9.3 (management review) and ISO/IEC 27001:2022 A.5.15 (least privilege)."]
  },

  "admin-email": {
    purpose: ["ตั้งค่าและตรวจสอบการส่งอีเมลแจ้งเตือนจากระบบ ได้แก่ อีเมล CAPA (สรุปรายวัน/ส่งทันที) และ Flash Report เมื่อเกิดเหตุร้ายแรง (FAT/LTI) อีเมลมีเพียงหัวข้อและลิงก์เข้าระบบ ไม่มีรายละเอียดเหตุการณ์", "Configure and monitor system email alerts: CAPA emails (daily digest / immediate) and Flash Report for serious incidents (FAT/LTI). Emails contain only a headline and a link into the portal, never incident details."],
    who: ["Super admin แก้ไขการตั้งค่าได้ Admin ดูสถานะและคิวอีเมลได้อย่างเดียว", "Super admin can edit settings; Admin can only view status and the email queue."],
    ifnot: ["ถ้าสวิตช์หลักปิดอยู่ ระบบจะไม่ส่งอีเมลเลย (แจ้งเตือนในกระดิ่งยังทำงานตามปกติ) ถ้าตั้งค่าผิด ผู้รับอาจไม่ได้อีเมลเหตุร้ายแรงทันเวลา", "If the master switch is off, no email is sent (bell notifications still work). Wrong settings may delay serious-incident emails."],
    steps: [
      ["ดูกล่อง \"สถานะการส่ง\": รอส่ง / ส่งแล้ววันนี้ / ส่งไม่สำเร็จ / โควตาต่อวัน", "Check the \"Sending status\" box: pending / sent today / failed / daily quota."],
      ["ตรวจชื่อและอีเมลผู้ส่ง ต้องเป็นโดเมนที่ยืนยันกับผู้ให้บริการส่งอีเมลแล้วเท่านั้น", "Check the sender name and address; it must be a domain verified with the email provider."],
      ["เลือกโหมด CAPA: สรุปรายวัน (08:00 เวลาไทย) ส่งทันที หรือปิดการส่งอีเมล แล้วเลือก Role ที่รับ Flash Report", "Choose the CAPA mode: daily digest (08:00 Thai time), immediate, or off, then pick the Roles that receive Flash Report."],
      ["กด \"บันทึกการตั้งค่า\" เปิดสวิตช์หลักเมื่อพร้อมใช้งานจริงเท่านั้น", "Press Save settings. Turn the master switch on only when ready for real use."],
      ["ถ้าต้องการให้ MD ได้รับสรุปรายวัน ให้ใช้กล่อง \"อีเมลสรุปรายวัน MD Brief\": ติ๊กเปิด เลือก Role ผู้รับ แล้วกดบันทึก (ส่ง 08:00 น. เมื่อสวิตช์หลักเปิดอยู่)", "To send the MD a daily summary, use the \"Daily MD Brief email\" box: tick it on, choose the recipient Roles and save (sent at 08:00 when the main switch is on)."],
      ["เปิดตาราง \"คิวอีเมลล่าสุด\" เพื่อตรวจสถานะรายการ กดรีเฟรชเพื่อโหลดใหม่", "Open the \"Latest email queue\" table to check each item; press Refresh to reload."]
    ],
    glossary: [
      ["สวิตช์หลัก", "เปิด/ปิดการส่งอีเมลทั้งระบบ ปิดอยู่ = ไม่ส่งอีเมลใด ๆ", "Turns all email sending on or off; off means nothing is sent."],
      ["Digest", "สรุปรวมหลายรายการเป็นอีเมลเดียวต่อผู้รับ ส่งวันละครั้ง", "Several items combined into one email per recipient, sent once a day."],
      ["Flash Report", "อีเมลแจ้งเหตุร้ายแรง (FAT/LTI) ถึง Role ที่กำหนดใน Plant ที่เกี่ยวข้อง", "Email alert for serious incidents (FAT/LTI) to the chosen Roles in the relevant Plant."],
      ["โควตาต่อวัน", "จำนวนอีเมลสูงสุดต่อวัน ตามแพ็กเกจของผู้ให้บริการ (นับตามเวลา UTC)", "Maximum emails per day under the provider plan (counted in UTC)."],
      ["Retention", "รายการที่ส่งแล้ว/ล้มเหลว/ข้ามจะถูกลบอัตโนมัติหลัง 90 วัน", "Sent, failed or skipped items are purged automatically after 90 days."]
    ].map(function (g) { return [[g[0], g[0]], [g[1], g[2]]]; }),
    example: ["ต้องการให้ Plant Director ได้รับเฉพาะ Flash Report → ตั้งโหมด CAPA = ปิดการส่งอีเมล, เปิด Flash Report, เลือก Role ที่ต้องการ แล้วบันทึก", "To let Plant Directors receive only Flash Report: set CAPA mode to off, enable Flash Report, tick the Roles, and save."],
    std: ["ISO/IEC 27001:2022 A.5.14 (การถ่ายโอนข้อมูล) และ A.5.15 (สิทธิ์น้อยที่สุด) ISO 45001:2018 ข้อ 7.4 (การสื่อสาร)", "ISO/IEC 27001:2022 A.5.14 (information transfer) and A.5.15 (least privilege); ISO 45001:2018 clause 7.4 (communication)."]
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
      ["Escalate", "ปุ่มลัดเลือกเฉพาะ \"เกินกำหนด\" \"ส่งกลับ / ยกเลิก\" และ \"เหตุร้ายแรงใหม่\" เหมาะกับผู้บริหารที่ไม่ต้องการแจ้งทุกเรื่อง", "A shortcut that picks only \"overdue\", \"returned/cancelled\" and \"new serious incident\", suited to managers who do not want every notification."],
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
