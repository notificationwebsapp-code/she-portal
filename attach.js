/* attach.js — ไฟล์แนบกลาง (B10b-2)
 * ใช้ร่วมกันทุกหน้า: Attach.queue(el)  = เลือกไฟล์ไว้ก่อน แล้วอัปโหลดหลังส่งรายงาน (หน้า incident)
 *                    Attach.panel(el, opts) = รายการไฟล์ + เพิ่ม/เปิดดู/ลบ ของรายงานที่ส่งแล้ว (หน้า records)
 * ความปลอดภัย: ทุกสิทธิ์ตัดสินที่ฐานข้อมูล (RPC + RLS + Storage policy) หน้านี้เป็นเพียงตัวช่วยใช้งาน
 *   - ชื่อไฟล์/ชื่อผู้อัปโหลดแสดงด้วย textContent เท่านั้น
 *   - รูปถูกวาดใหม่เป็น JPEG ในเบราว์เซอร์ => ลบ EXIF/พิกัด GPS และย่อขนาด
 *   - เปิดไฟล์ผ่าน signed URL อายุ 60 วินาที (ฐานข้อมูลบันทึก audit "view" ทุกครั้ง)
 * ต้องโหลดหลัง auth.js (ใช้ตัวแปร sb) และหลัง i18n.js
 */
(function () {
  "use strict";
  var BUCKET = "she-attachments";
  var MAX_SIDE = 2000;                       // ด้านยาวสุดของรูปหลังย่อ (พิกเซล)
  var URL_TTL = 60;                          // อายุ signed URL (วินาที)
  var EXT = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", heif: "image/heic",
              pdf: "application/pdf",
              docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
  var DEFAULTS = { max_size_mb: 10, max_files_per_entity: 10,
                   allowed_mime: ["image/jpeg", "image/png", "image/webp", "application/pdf", EXT.docx, EXT.xlsx] };

  // ---------- ตัวช่วย ----------
  function el(tag, attrs) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x) n.append(x); });
      else n.append(c);
    }
    return n;
  }
  function noI18n(n) { n.setAttribute("data-no-i18n", ""); return n; }   // ข้อมูลที่ผู้ใช้พิมพ์/ชื่อไฟล์ ไม่ต้องแปล
  function fmtSize(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB"; }
  function fmtTime(v) { try { return new Date(v).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }); } catch (e) { return ""; } }
  function extOf(name) { var m = /\.([A-Za-z0-9]+)$/.exec(name || ""); return m ? m[1].toLowerCase() : ""; }
  function isImage(m) { return m === "image/jpeg" || m === "image/png" || m === "image/webp" || m === "image/heic"; }
  function icon(m) { return m === "application/pdf" ? "📄" : isImage(m) ? "🖼" : m === EXT.docx ? "📝" : m === EXT.xlsx ? "📊" : "📎"; }

  function css() {
    if (document.getElementById("attach-css")) return;
    var s = document.createElement("style"); s.id = "attach-css";
    s.textContent =
      ".att{margin:.4rem 0}.att *{box-sizing:border-box}" +
      ".att .drop{border:2px dashed var(--line,#c9d0e0);border-radius:12px;padding:1rem;text-align:center;background:#fafbfe}" +
      ".att .drop.over{border-color:var(--brand,#e60012);background:#fff5f5}" +
      ".att .drop p{margin:.2rem 0}" +
      ".att button{min-height:44px;cursor:pointer}" +
      ".att .btns{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin:.5rem 0}" +
      ".att .hint{font-size:.88rem;color:var(--muted,#5b6577);margin:.4rem 0}" +
      ".att .warn{font-size:.88rem;background:#fff8e1;border:1px solid #f1d58a;border-radius:8px;padding:.5rem .7rem;margin:.5rem 0}" +
      ".att ul{list-style:none;margin:.6rem 0;padding:0}" +
      ".att li.it{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;border:1px solid var(--line,#dfe3ee);border-radius:10px;padding:.5rem .6rem;margin:.4rem 0;background:#fff}" +
      ".att li.it img.th{width:56px;height:56px;object-fit:cover;border-radius:8px;flex:none;background:#eee}" +
      ".att li.it .ic{width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex:none}" +
      ".att li.it .nm{flex:1 1 12rem;min-width:0;overflow-wrap:anywhere}" +
      ".att li.it .nm small{display:block;color:var(--muted,#5b6577)}" +
      ".att li.it label.chk{display:flex;gap:.4rem;align-items:center;font-size:.9rem;min-height:44px}" +
      ".att li.it .err{color:#b00020;font-size:.9rem;flex-basis:100%}" +
      ".att .badge2{display:inline-block;font-size:.78rem;border-radius:999px;padding:.05rem .55rem;margin-left:.3rem;background:#eef;color:#334}" +
      ".att .badge2.pii{background:#fde8ea;color:#8a0010}.att .badge2.del{background:#eee;color:#555}" +
      ".att .delbox{flex-basis:100%;display:flex;flex-wrap:wrap;gap:.4rem;align-items:center}" +
      ".att .delbox input{flex:1 1 14rem;min-height:44px}" +
      ".att .status{min-height:1.4rem;font-size:.92rem}.att .status.bad{color:#b00020}.att .status.ok{color:#0a6b2d}" +
      "@media (max-width:640px){.att li.it .nm{flex-basis:100%}}";
    document.head.appendChild(s);
  }

  // ---------- ตั้งค่า / สิทธิ์ ----------
  var cfgP = null, permP = null, meP = null;
  function loadCfg() {
    if (!cfgP) cfgP = sb.from("attachment_settings").select("max_size_mb,max_files_per_entity,allowed_mime").maybeSingle()
      .then(function (r) { return r && r.data ? r.data : DEFAULTS; }, function () { return DEFAULTS; });
    return cfgP;
  }
  function loadPerms() {
    if (!permP) permP = sb.rpc("my_permissions").then(function (r) { return Array.isArray(r.data) ? r.data : []; }, function () { return []; });
    return permP;
  }
  function loadMe() {
    if (!meP) meP = sb.auth.getSession().then(function (r) { return r && r.data && r.data.session ? r.data.session.user.id : null; }, function () { return null; });
    return meP;
  }

  // ---------- ข้อความผิดพลาด (ภาษาไทยเป็นต้นฉบับ; i18n.js แปลให้เมื่อเปิดโหมด EN) ----------
  function errText(e) {
    var c = e && (e.code || e.statusCode), m = (e && e.message) || "";
    if (c === "42501" || c === "403" || c === 403 || /row-level security|not authorized|permission denied/i.test(m)) return "ไม่มีสิทธิ์ดำเนินการกับไฟล์นี้ (หรือรายงานถูกปิดแล้ว)";
    if (c === "22023") return "ไฟล์ไม่ผ่านเงื่อนไข (ชนิด/ขนาดไฟล์) หรือหมดเวลาอัปโหลด กรุณาเลือกไฟล์ใหม่";
    if (c === "54000") return "แนบไฟล์ครบจำนวนที่กำหนดแล้ว หรือมีไฟล์ค้างอัปโหลดมากเกินไป กรุณารอสักครู่แล้วลองใหม่";
    if (c === "P0002") return "อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่";
    if (e && e._th) return e._th;
    return "ดำเนินการไม่สำเร็จ กรุณาลองใหม่";
  }
  function thErr(msg) { var e = new Error(msg); e._th = msg; return e; }

  // ---------- เตรียมไฟล์ก่อนอัปโหลด ----------
  function readHead(file, n) {
    return new Promise(function (res) {
      var r = new FileReader();
      r.onload = function () { res(new Uint8Array(r.result)); };
      r.onerror = function () { res(new Uint8Array(0)); };
      r.readAsArrayBuffer(file.slice(0, n));
    });
  }
  function loadHeic2any() {
    if (window.heic2any) return Promise.resolve(window.heic2any);
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
      s.onload = function () { window.heic2any ? res(window.heic2any) : rej(new Error("heic")); };
      s.onerror = function () { rej(new Error("heic")); };
      document.head.appendChild(s);
    });
  }
  function drawImage(blob) {
    return (window.createImageBitmap
      ? createImageBitmap(blob, { imageOrientation: "from-image" }).catch(function () { return createImageBitmap(blob); })
      : Promise.reject(new Error("no-bitmap")))
      .catch(function () {
        return new Promise(function (res, rej) {          // สำรอง: <img> (เบราว์เซอร์รุ่นใหม่หมุนภาพตาม EXIF ให้เอง)
          var u = URL.createObjectURL(blob), im = new Image();
          im.onload = function () { URL.revokeObjectURL(u); res(im); };
          im.onerror = function () { URL.revokeObjectURL(u); rej(thErr("เปิดไฟล์รูปไม่ได้ (ไฟล์อาจเสียหาย)")); };
          im.src = u;
        });
      });
  }
  function toJpeg(blob, maxBytes) {
    return drawImage(blob).then(function (bmp) {
      var w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight;
      var k = Math.min(1, MAX_SIDE / Math.max(w, h));
      var c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
      var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(bmp, 0, 0, c.width, c.height);
      if (bmp.close) bmp.close();
      var qs = [0.85, 0.7, 0.55, 0.4];
      function attempt(i) {
        return new Promise(function (res, rej) {
          c.toBlob(function (b) { b ? res(b) : rej(thErr("แปลงรูปไม่สำเร็จ")); }, "image/jpeg", qs[i]);
        }).then(function (b) { return (b.size > maxBytes && i < qs.length - 1) ? attempt(i + 1) : b; });
      }
      return attempt(0);
    });
  }
  // คืน {blob,name,mime,size,thumb}
  function prepare(file, cfg) {
    var ext = extOf(file.name), mime = EXT[ext] || (file.type || "").toLowerCase();
    if (mime === "image/heif") mime = "image/heic";
    var maxBytes = cfg.max_size_mb * 1048576;
    var base = (file.name || "file").replace(/^.*[\\\/]/, "").replace(/\.[^.]*$/, "") || "file";
    var okType = isImage(mime) || cfg.allowed_mime.indexOf(mime) >= 0;
    if (!okType) return Promise.reject(thErr("ชนิดไฟล์นี้ไม่รองรับ (รองรับรูป JPG/PNG/WebP, PDF, Word .docx, Excel .xlsx)"));
    if (isImage(mime)) {
      if (cfg.allowed_mime.indexOf("image/jpeg") < 0) return Promise.reject(thErr("ระบบไม่เปิดให้แนบรูปภาพ"));
      var src = mime === "image/heic"
        ? loadHeic2any().then(function (f) { return f({ blob: file, toType: "image/jpeg", quality: 0.9 }); })
            .then(function (b) { return Array.isArray(b) ? b[0] : b; })
            .catch(function () { throw thErr("แปลงไฟล์ HEIC ไม่สำเร็จ กรุณาตั้งค่ากล้องเป็น JPEG หรือเลือกรูปอื่น"); })
        : Promise.resolve(file);
      return src.then(function (b) { return toJpeg(b, maxBytes); }).then(function (jb) {
        if (jb.size > maxBytes) throw thErr("รูปมีขนาดใหญ่เกินกำหนด (ไม่เกิน " + cfg.max_size_mb + " MB)");
        return { blob: jb, name: base + ".jpg", mime: "image/jpeg", size: jb.size, thumb: URL.createObjectURL(jb) };
      });
    }
    if (file.size > maxBytes) return Promise.reject(thErr("ไฟล์มีขนาดใหญ่เกินกำหนด (ไม่เกิน " + cfg.max_size_mb + " MB)"));
    return readHead(file, 4).then(function (u) {
      var pdf = u.length >= 4 && u[0] === 0x25 && u[1] === 0x50 && u[2] === 0x44 && u[3] === 0x46;
      var zip = u.length >= 4 && u[0] === 0x50 && u[1] === 0x4b && u[2] === 0x03 && u[3] === 0x04;
      if ((mime === "application/pdf" && !pdf) || ((mime === EXT.docx || mime === EXT.xlsx) && !zip))
        throw thErr("เนื้อหาไฟล์ไม่ตรงกับนามสกุลไฟล์");
      return { blob: file, name: (file.name || "file").replace(/^.*[\\\/]/, ""), mime: mime, size: file.size, thumb: null };
    });
  }

  // ---------- อัปโหลด 1 ไฟล์: register -> upload -> confirm ----------
  function uploadOne(entityType, entityId, p, person) {
    var id = null;
    return sb.rpc("attachment_register", { p_entity_type: entityType, p_entity_id: entityId, p_name: p.name, p_mime: p.mime, p_size: p.size, p_contains_person: !!person })
      .then(function (r) {
        if (r.error) throw r.error;
        var row = Array.isArray(r.data) ? r.data[0] : r.data;
        if (!row || !row.out_id) throw thErr("ลงทะเบียนไฟล์ไม่สำเร็จ");
        id = row.out_id;
        return sb.storage.from(BUCKET).upload(row.out_path, p.blob, { contentType: p.mime, upsert: false });
      })
      .then(function (u) { if (u.error) throw u.error; return sb.rpc("attachment_confirm", { p_id: id }); })
      .then(function (c) { if (c.error) throw c.error; return id; })
      .catch(function (e) {
        if (id) { sb.rpc("attachment_delete", { p_id: id, p_reason: "อัปโหลดไม่สำเร็จ (ยกเลิกอัตโนมัติ)" }).then(function () {}, function () {}); }
        throw e;
      });
  }

  // ---------- ตัวเลือกไฟล์ (Stager) ----------
  function stager(root, cfg, opts) {
    var items = [], onChange = (opts && opts.onChange) || function () {};
    var status = el("div", { class: "status", role: "status", "aria-live": "polite" });
    var list = el("ul", { "aria-label": "ไฟล์ที่เลือกไว้" });
    var accept = "image/jpeg,image/png,image/webp,application/pdf,.docx,.xlsx,.heic,.heif";
    var inFile = el("input", { type: "file", multiple: true, accept: accept, hidden: true });
    var inCam = el("input", { type: "file", accept: "image/*", capture: "environment", hidden: true });
    var drop = el("div", { class: "drop", role: "group", "aria-label": "เพิ่มไฟล์แนบ" });
    function say(t, cls) { status.textContent = t || ""; status.className = "status" + (cls ? " " + cls : ""); }

    var btnPick = el("button", { type: "button", class: "secondary", text: "📎 เลือกไฟล์", onclick: function () { inFile.click(); } });
    var btns = el("div", { class: "btns" }, btnPick);
    if (window.matchMedia && matchMedia("(pointer:coarse)").matches) {
      btns.append(el("button", { type: "button", class: "secondary", text: "📷 ถ่ายรูป", onclick: function () { inCam.click(); } }));
    }
    drop.append(
      el("p", { text: "ลากไฟล์มาวางที่นี่ หรือกดปุ่มด้านล่าง" }), btns,
      el("p", { class: "hint", text: "รองรับรูป (JPG, PNG, WebP), PDF, Word (.docx), Excel (.xlsx) ขนาดไม่เกิน " + cfg.max_size_mb + " MB ต่อไฟล์ · แนบได้สูงสุด " + cfg.max_files_per_entity + " ไฟล์ต่อรายงาน" }),
      el("p", { class: "hint", text: "รูปถูกย่อขนาดอัตโนมัติและลบพิกัด GPS/ข้อมูลกล้องออกก่อนอัปโหลด" }));
    var warn = el("div", { class: "warn", text: "แนบเฉพาะภาพ/เอกสารที่จำเป็นต่อเหตุการณ์ หลีกเลี่ยงการถ่ายติดใบหน้าบุคคลโดยไม่จำเป็น หากภาพมีบุคคลปรากฏให้ติ๊ก \"มีบุคคลปรากฏ\" (ไฟล์นั้นจะเห็นได้เฉพาะผู้รายงานและ SHE/Admin ของ Plant)" });
    root.append(drop, warn, list, status, inFile, inCam);

    function render() {
      list.replaceChildren();
      items.forEach(function (it) {
        var li = el("li", { class: "it" });
        li.append(it.p.thumb ? el("img", { class: "th", src: it.p.thumb, alt: "" }) : el("span", { class: "ic", "aria-hidden": "true", text: icon(it.p.mime) }));
        li.append(el("div", { class: "nm" }, noI18n(el("span", { text: it.p.name })), el("small", { text: fmtSize(it.p.size) })));
        if (isImage(it.p.mime)) {
          var cb = el("input", { type: "checkbox" }); cb.checked = !!it.person;
          cb.addEventListener("change", function () { it.person = cb.checked; });
          li.append(el("label", { class: "chk" }, cb, el("span", { text: "มีบุคคลปรากฏ" })));
        }
        li.append(el("button", { type: "button", class: "secondary small", text: "เอาออก", "aria-label": "เอาไฟล์นี้ออก", disabled: !!it.busy, onclick: function () { remove(it); } }));
        if (it.err) li.append(el("div", { class: "err", role: "alert", text: it.err }));
        list.append(li);
      });
    }
    function remove(it) { var i = items.indexOf(it); if (i >= 0) items.splice(i, 1); if (it.p.thumb) URL.revokeObjectURL(it.p.thumb); render(); onChange(); }
    function add(fileList, room) {
      var files = Array.prototype.slice.call(fileList || []);
      if (!files.length) return Promise.resolve();
      var left = (room === undefined ? cfg.max_files_per_entity : room) - items.length;
      if (files.length > left) { say("เลือกได้อีกไม่เกิน " + Math.max(0, left) + " ไฟล์ (ส่วนที่เกินถูกข้าม)", "bad"); files = files.slice(0, Math.max(0, left)); }
      if (!files.length) return Promise.resolve();
      say("กำลังเตรียมไฟล์…");
      var bad = [];
      return files.reduce(function (pr, f) {
        return pr.then(function () {
          return prepare(f, cfg).then(function (p) { items.push({ p: p, person: false }); },
            function (e) { bad.push({ n: f.name || "file", m: errText(e) }); });
        });
      }, Promise.resolve()).then(function () {
        render(); onChange();
        if (bad.length) { say("", ""); bad.forEach(function (b) { status.append(el("div", { class: "err", role: "alert" }, noI18n(el("span", { text: b.n })), " — ", el("span", { text: b.m }))); }); status.className = "status bad"; }
        else say("");
      });
    }
    inFile.addEventListener("change", function () { add(inFile.files, opts && opts.room); inFile.value = ""; });
    inCam.addEventListener("change", function () { add(inCam.files, opts && opts.room); inCam.value = ""; });
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
    drop.addEventListener("drop", function (e) { add(e.dataTransfer && e.dataTransfer.files, opts && opts.room); });

    // อัปโหลดทั้งหมด (ทีละไฟล์) => {ok:n, failed:n}
    function uploadAll(entityType, entityId) {
      var ok = 0, failed = 0, todo = items.slice();
      return todo.reduce(function (pr, it) {
        return pr.then(function () {
          it.busy = true; it.err = ""; render(); say("กำลังอัปโหลด " + it.p.name + " …");
          return uploadOne(entityType, entityId, it.p, it.person).then(function () {
            ok++; var i = items.indexOf(it); if (i >= 0) items.splice(i, 1); if (it.p.thumb) URL.revokeObjectURL(it.p.thumb);
          }, function (e) { failed++; it.busy = false; it.err = errText(e); });
        });
      }, Promise.resolve()).then(function () { render(); onChange(); say(""); return { ok: ok, failed: failed }; });
    }
    function clear() { items.forEach(function (it) { if (it.p.thumb) URL.revokeObjectURL(it.p.thumb); }); items = []; render(); say(""); onChange(); }
    return { add: add, uploadAll: uploadAll, clear: clear, count: function () { return items.length; }, say: say };
  }

  // ---------- Attach.queue: เลือกไว้ก่อน อัปโหลดหลังส่งรายงาน ----------
  function queue(root, opts) {
    css();
    var box = el("div", { class: "att" }); root.append(box);
    var api = { count: function () { return 0; }, flush: function () { return Promise.resolve({ ok: 0, failed: 0 }); }, clear: function () {} };
    box.hidden = true;
    Promise.all([loadCfg(), loadPerms()]).then(function (r) {
      var cfg = r[0], perms = r[1];
      if (perms.indexOf("attachment.upload") < 0) return;          // ไม่มีสิทธิ์แนบ: ซ่อนทั้งส่วน
      box.hidden = false;
      if (opts && opts.onReady) opts.onReady();
      var st = stager(box, cfg, { onChange: opts && opts.onChange });
      box.append(el("p", { class: "hint", text: "ไฟล์ที่เลือกไว้จะอัปโหลดหลังกดส่งรายงาน และไม่ถูกบันทึกในร่าง หากเปิดร่างภายหลังต้องเลือกไฟล์ใหม่ (หรือเพิ่มไฟล์ทีหลังได้ที่หน้า \"ดูข้อมูล\")" }));
      api.count = st.count;
      api.flush = function (entityId) { return st.count() ? st.uploadAll(opts && opts.entityType || "incident", entityId) : Promise.resolve({ ok: 0, failed: 0 }); };
      api.clear = st.clear;
    });
    return api;
  }

  // ---------- Attach.panel: รายการไฟล์ของรายงานที่ส่งแล้ว ----------
  function panel(root, o) {
    css();
    var box = el("div", { class: "att" }); root.replaceChildren(box);
    var listBox = el("div"), upBox = el("div"), msg = el("div", { class: "status", role: "status", "aria-live": "polite" });
    box.append(listBox, msg, upBox);
    function say(t, cls) { msg.textContent = t || ""; msg.className = "status" + (cls ? " " + cls : ""); }

    function refresh() {
      return Promise.all([
        sb.from("attachments").select("id,original_name,mime_type,size_bytes,contains_person,status,uploaded_by,uploaded_at,deleted_at,delete_reason")
          .eq("entity_type", o.entityType).eq("entity_id", o.entityId).order("uploaded_at"),
        sb.rpc("attachment_list", { p_entity_type: o.entityType, p_entity_id: o.entityId }),
        loadPerms(), loadMe(), loadCfg()
      ]).then(function (r) {
        var rows = (r[0] && r[0].data) || [], names = {};
        ((r[1] && r[1].data) || []).forEach(function (x) { names[x.attachment_id] = x.uploaded_by_name; });
        draw(rows, names, r[2], r[3], r[4]);
      }, function () { listBox.replaceChildren(el("p", { class: "status bad", text: "โหลดรายการไฟล์แนบไม่สำเร็จ" })); });
    }

    function openFile(row) {
      var w = window.open("", "_blank");                         // เปิดหน้าต่างก่อน (กัน popup blocker) แล้วค่อยกำหนด URL
      if (w) { try { w.opener = null; } catch (e) {} }
      say("กำลังเปิดไฟล์…");
      sb.rpc("attachment_open", { p_id: row.id }).then(function (r) {
        if (r.error) throw r.error;
        return sb.storage.from(BUCKET).createSignedUrl(r.data, URL_TTL);
      }).then(function (u) {
        if (u.error || !u.data) throw (u.error || thErr("ขอลิงก์ไฟล์ไม่สำเร็จ"));
        say("");
        if (w) w.location.href = u.data.signedUrl; else window.location.href = u.data.signedUrl;
      }).catch(function (e) { if (w) w.close(); say(errText(e), "bad"); });
    }

    function deleteForm(row, li) {
      var reason = el("input", { type: "text", maxlength: "500", placeholder: "เหตุผลที่ลบ (อย่างน้อย 5 ตัวอักษร)", "aria-label": "เหตุผลที่ลบ" });
      var wrap = el("div", { class: "delbox" }, reason,
        el("button", { type: "button", text: "ยืนยันลบ", onclick: function () {
          var rs = reason.value.trim();
          if (rs.length < 5) { say("กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร", "bad"); reason.focus(); return; }
          sb.rpc("attachment_delete", { p_id: row.id, p_reason: rs }).then(function (r) {
            if (r.error) throw r.error;
            say("ลบไฟล์แล้ว", "ok"); refresh(); if (o.onChange) o.onChange();
          }).catch(function (e) { say(errText(e), "bad"); });
        } }),
        el("button", { type: "button", class: "secondary", text: "ยกเลิก", onclick: function () { wrap.remove(); } }));
      li.append(wrap); reason.focus();
    }

    function draw(rows, names, perms, me, cfg) {
      listBox.replaceChildren();
      var live = rows.filter(function (x) { return !x.deleted_at; });
      var canDelAll = perms.indexOf("attachment.delete") >= 0;
      if (!rows.length) listBox.append(el("p", { text: "ยังไม่มีไฟล์แนบ" }));
      var ul = el("ul", { "aria-label": "ไฟล์แนบ" });
      rows.forEach(function (row) {
        var li = el("li", { class: "it" });
        li.append(el("span", { class: "ic", "aria-hidden": "true", text: icon(row.mime_type) }));
        var nm = el("div", { class: "nm" }, noI18n(el("span", { text: row.original_name })));
        if (row.contains_person) nm.append(el("span", { class: "badge2 pii", text: "มีบุคคลปรากฏ" }));
        if (row.status !== "ready") nm.append(el("span", { class: "badge2", text: "รอยืนยัน" }));
        if (row.deleted_at) nm.append(el("span", { class: "badge2 del", text: "ถูกลบ" }));
        var sub = el("small"); sub.append(document.createTextNode(fmtSize(row.size_bytes) + " · "), noI18n(el("span", { text: names[row.id] || "" })), document.createTextNode(" · " + fmtTime(row.uploaded_at)));
        nm.append(sub);
        if (row.deleted_at && row.delete_reason) nm.append(el("small", {}, el("span", { text: "เหตุผลที่ลบ:" }), " ", noI18n(el("span", { text: row.delete_reason }))));
        li.append(nm);
        if (row.status === "ready" && !row.deleted_at) {
          li.append(el("button", { type: "button", class: "secondary small", text: "เปิดดู", onclick: function () { openFile(row); } }));
          var mine = me && row.uploaded_by === me && Date.now() - new Date(row.uploaded_at).getTime() < 86400000 && !o.closed;
          if (canDelAll || mine) li.append(el("button", { type: "button", class: "secondary small", text: "ลบ", onclick: function () { if (!li.querySelector(".delbox")) deleteForm(row, li); } }));
        }
        ul.append(li);
      });
      listBox.append(ul);

      upBox.replaceChildren();
      if (o.closed) { upBox.append(el("p", { class: "hint", text: "รายงานนี้ปิดเคสแล้ว จึงเพิ่มไฟล์ไม่ได้ (ต้องให้ Admin เปิดเคสใหม่ก่อน)" })); return; }
      if (!o.canUpload || perms.indexOf("attachment.upload") < 0) return;
      var room = Math.max(0, cfg.max_files_per_entity - live.length);
      if (room <= 0) { upBox.append(el("p", { class: "hint", text: "แนบไฟล์ครบจำนวนที่กำหนดแล้ว" })); return; }
      var btnUp = el("button", { type: "button", text: "อัปโหลดไฟล์ที่เลือก", disabled: true });
      var st = stager(upBox, cfg, { room: room, onChange: function () { btnUp.disabled = st.count() === 0; } });
      btnUp.addEventListener("click", function () {
        btnUp.disabled = true;
        st.uploadAll(o.entityType, o.entityId).then(function (r) {
          if (r.ok) { say("อัปโหลดแล้ว " + r.ok + " ไฟล์" + (r.failed ? " (ไม่สำเร็จ " + r.failed + " ไฟล์)" : ""), r.failed ? "bad" : "ok"); if (o.onChange) o.onChange(); }
          if (!r.failed) refresh(); else btnUp.disabled = false;
        });
      });
      upBox.append(btnUp);
    }
    refresh();
    return { refresh: refresh };
  }

  window.Attach = { queue: queue, panel: panel, _prepare: prepare, _errText: errText };
})();
