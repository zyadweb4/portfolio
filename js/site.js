/* Zyad Mohamed Abdelfattah portfolio: language, nav, carousel, lightbox, contact form */
(function () {
  "use strict";
  var KEY = "zyad-lang";
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function getStored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setStored(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage unavailable */ } }

  /* ---------------- language ---------------- */
  var lang = getStored() === "en" ? "en" : "ar";
  var ATTRS = ["placeholder", "aria-label", "alt", "title", "content"];

  // cache the Arabic (default) values once
  $$("[data-en]").forEach(function (el) { el.__ar = el.textContent; });
  $$("[data-en-html]").forEach(function (el) { el.__arh = el.innerHTML; });
  ATTRS.forEach(function (a) {
    $$("[data-en-" + a + "]").forEach(function (el) {
      el["__ar_" + a] = el.getAttribute(a) || "";
    });
  });

  function applyLang(l) {
    lang = l;
    var en = l === "en";
    root.lang = en ? "en" : "ar";
    root.dir = en ? "ltr" : "rtl";
    $$("[data-en]").forEach(function (el) { el.textContent = en ? el.getAttribute("data-en") : el.__ar; });
    $$("[data-en-html]").forEach(function (el) { el.innerHTML = en ? el.getAttribute("data-en-html") : el.__arh; });
    ATTRS.forEach(function (a) {
      $$("[data-en-" + a + "]").forEach(function (el) {
        el.setAttribute(a, en ? el.getAttribute("data-en-" + a) : el["__ar_" + a]);
      });
    });
    var btn = $("#lang-toggle");
    if (btn) {
      var lbl = $(".lang-label", btn);
      if (lbl) lbl.textContent = en ? "عربي" : "English";
      btn.setAttribute("lang", en ? "ar" : "en");
      btn.setAttribute("aria-label", en ? "التبديل إلى العربية" : "Switch to English");
    }
    restartTyping();
    updateCarousel();
  }

  var toggle = $("#lang-toggle");
  if (toggle) toggle.addEventListener("click", function () {
    var next = lang === "ar" ? "en" : "ar";
    setStored(next);
    applyLang(next);
  });

  /* ---------------- typed role line ---------------- */
  var typedEl = $("#typed");
  var ROLES = {
    ar: ["مختبر جودة برمجيات (ويب وموبايل)", "نظم معلومات جغرافية وCAD", "إدخال بيانات بالعربية والإنجليزية", "أبني أدواتي بالذكاء الاصطناعي"],
    en: ["QA Tester (Web & Mobile)", "GIS & CAD: ArcGIS Pro, QGIS, Civil 3D", "Data entry in Arabic & English", "Building my own tools with AI"]
  };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tTimer = null, tRole = 0, tChar = 0, tDeleting = false;
  function tick() {
    var list = ROLES[lang], word = list[tRole];
    if (reduce) {
      typedEl.textContent = word;
      tRole = (tRole + 1) % list.length;
      tTimer = setTimeout(tick, 3200);
      return;
    }
    if (!tDeleting) {
      tChar++;
      typedEl.textContent = word.slice(0, tChar);
      if (tChar >= word.length) { tDeleting = true; tTimer = setTimeout(tick, 2000); return; }
      tTimer = setTimeout(tick, 55);
    } else {
      tChar--;
      typedEl.textContent = word.slice(0, tChar);
      if (tChar <= 0) { tDeleting = false; tRole = (tRole + 1) % list.length; tTimer = setTimeout(tick, 350); return; }
      tTimer = setTimeout(tick, 28);
    }
  }
  function restartTyping() {
    if (!typedEl) return;
    clearTimeout(tTimer);
    tRole = 0; tChar = 0; tDeleting = false;
    typedEl.textContent = ROLES[lang][0];
    tChar = ROLES[lang][0].length; tDeleting = true;
    tTimer = setTimeout(tick, 2400);
  }

  /* ---------------- header + menu ---------------- */
  var bar = $(".topbar");
  function onScroll() { if (bar) bar.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = $(".menu-btn"), nav = $("#site-nav");
  function closeMenu() { if (!nav) return; nav.classList.remove("open"); if (menuBtn) menuBtn.setAttribute("aria-expanded", "false"); }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { closeMenu(); menuBtn.focus(); } });
    document.addEventListener("click", function (e) { if (nav.classList.contains("open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) closeMenu(); });
  }

  /* ---------------- scrollspy (home page) ---------------- */
  var spyLinks = $$("[data-spy]");
  if (spyLinks.length && "IntersectionObserver" in window) {
    var map = {};
    spyLinks.forEach(function (a) { map[a.getAttribute("data-spy")] = a; });
    var sections = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = null;
      for (var i = 0; i < sections.length; i++) { if (visible[sections[i].id]) { current = sections[i].id; break; } }
      if (!current) return;
      spyLinks.forEach(function (a) {
        var on = a.getAttribute("data-spy") === current;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------------- carousel ---------------- */
  var track = $("#car-track");
  var prevB = $("#car-prev"), nextB = $("#car-next"), countEl = $("#car-count"), progEl = $("#car-progress");
  function step() {
    var item = track && track.firstElementChild;
    if (!item) return 0;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return item.getBoundingClientRect().width + gap;
  }
  function updateCarousel() {
    if (!track) return;
    var total = track.children.length;
    var max = track.scrollWidth - track.clientWidth;
    var pos = Math.abs(track.scrollLeft);
    var s = step() || 1;
    var perView = Math.max(1, Math.round(track.clientWidth / s));
    var idx = Math.min(total, Math.round(pos / s) + 1);
    var last = Math.min(total, idx + perView - 1);
    if (countEl) countEl.textContent = String(idx).padStart(2, "0") + (perView > 1 ? "–" + String(last).padStart(2, "0") : "") + " / " + String(total).padStart(2, "0");
    if (progEl) progEl.style.width = (max > 0 ? Math.max(8, (pos / max) * 100) : 100) + "%";
    if (prevB) prevB.disabled = pos <= 2;
    if (nextB) nextB.disabled = pos >= max - 2;
  }
  function move(dir) {
    var rtl = getComputedStyle(track).direction === "rtl";
    track.scrollBy({ left: dir * step() * (rtl ? -1 : 1), behavior: reduce ? "auto" : "smooth" });
  }
  if (track) {
    if (prevB) prevB.addEventListener("click", function () { move(-1); });
    if (nextB) nextB.addEventListener("click", function () { move(1); });
    var raf = 0;
    track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(updateCarousel); }, { passive: true });
    window.addEventListener("resize", updateCarousel);
    track.addEventListener("keydown", function (e) {
      if (e.target !== track) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var rtl = getComputedStyle(track).direction === "rtl";
        var forward = (e.key === "ArrowRight") !== rtl;
        move(forward ? 1 : -1);
      }
    });
  }

  /* ---------------- lightbox ---------------- */
  var lb = $("#lightbox");
  var lbImgs = [], lbI = 0, lbFrom = null;
  function lbShow() {
    var img = $("#lb-img");
    img.src = lbImgs[lbI];
    img.alt = $("#lb-title").textContent;
    $("#lb-count").textContent = lbImgs.length > 1 ? (lbI + 1) + " / " + lbImgs.length : "";
    $("#lb-prev").hidden = $("#lb-next").hidden = lbImgs.length < 2;
  }
  function lbOpen(trigger) {
    lbImgs = (trigger.getAttribute("data-images") || "").split(",").filter(Boolean);
    if (!lbImgs.length || !lb) return;
    lbI = 0; lbFrom = trigger;
    var t = trigger.querySelector("[data-lb-title]"), d = trigger.querySelector("[data-lb-desc]");
    $("#lb-title").textContent = t ? t.textContent : "";
    $("#lb-desc").textContent = d ? d.textContent : "";
    lbShow();
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }
  function lbClose() {
    if (!lb) return;
    if (typeof lb.close === "function" && lb.open) lb.close(); else lb.removeAttribute("open");
  }
  if (lb) {
    lb.addEventListener("close", function () { document.body.style.overflow = ""; if (lbFrom) lbFrom.focus(); });
    $("#lb-close").addEventListener("click", lbClose);
    $("#lb-prev").addEventListener("click", function () { lbI = (lbI - 1 + lbImgs.length) % lbImgs.length; lbShow(); });
    $("#lb-next").addEventListener("click", function () { lbI = (lbI + 1) % lbImgs.length; lbShow(); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });
    lb.addEventListener("keydown", function (e) {
      if (lbImgs.length < 2) return;
      var rtl = root.dir === "rtl";
      if (e.key === "ArrowRight") { lbI = (lbI + (rtl ? -1 : 1) + lbImgs.length) % lbImgs.length; lbShow(); }
      if (e.key === "ArrowLeft") { lbI = (lbI + (rtl ? 1 : -1) + lbImgs.length) % lbImgs.length; lbShow(); }
    });
    $$("[data-images]").forEach(function (b) { b.addEventListener("click", function () { lbOpen(b); }); });
  }

  /* ---------------- copy email ---------------- */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var label = $(".copy-label", btn);
      var done = function () {
        if (!label) return;
        var old = label.textContent;
        label.textContent = lang === "en" ? "Copied" : "تم النسخ";
        setTimeout(function () { label.textContent = old; }, 1600);
      };
      var fallback = function () {
        var code = btn.parentElement && btn.parentElement.querySelector("code");
        if (code && window.getSelection) {
          var r = document.createRange(); r.selectNodeContents(code);
          var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        }
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
        else fallback();
      } catch (e) { fallback(); }
    });
  });

  /* ---------------- contact form -> mailto ---------------- */
  var form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $("#form-status");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var name = $("#cf-name").value.trim();
      var email = $("#cf-email").value.trim();
      var msg = $("#cf-message").value.trim();
      var topicEl = form.querySelector("input[name=topic]:checked");
      var topic = topicEl ? topicEl.parentElement.querySelector("span").textContent : "";
      var subject = (topic ? topic + " | " : "") + (lang === "en" ? "Message from " : "رسالة من ") + name;
      var body = msg + "\n\n" + name + "\n" + email;
      var href = "mailto:z7887008@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      window.location.href = href;
      if (status) {
        status.classList.remove("err");
        status.textContent = lang === "en"
          ? "Your email app should open with the message ready. If it doesn't, write to z7887008@gmail.com."
          : "سيفتح تطبيق البريد برسالتك جاهزة. إن لم يفتح، راسلني على z7887008@gmail.com.";
      }
    });
  }


  /* =====================================================================
     v2 motion layer. Everything below respects prefers-reduced-motion:
     html.motion is only set when motion is allowed.
     ===================================================================== */
  var motion = root.classList.contains("motion");
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var hasIO = "IntersectionObserver" in window;

  /* visibility helper: calls on(true/false) when element enters/leaves view or tab hides */
  function watch(el, on, threshold) {
    var inView = false;
    var fire = function () { on(inView && !document.hidden); };
    if (hasIO) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; fire(); }, { threshold: threshold || 0.15 }).observe(el);
    } else { inView = true; fire(); }
    document.addEventListener("visibilitychange", fire);
  }

  /* ---------------- page transitions ---------------- */
  if (motion) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:|data:)/i.test(href) || !/\.html(#.*)?$/.test(href)) return;
      e.preventDefault();
      document.body.classList.add("leaving");
      setTimeout(function () { window.location.href = a.href; }, 200);
    });
    window.addEventListener("pageshow", function () { document.body.classList.remove("leaving"); });
  }

  /* ---------------- scroll progress + timeline draw ---------------- */
  var progEl2 = $("#scroll-progress");
  var timelines = $$("[data-tl]");
  var sTick = false;
  function onScrollFx() {
    sTick = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progEl2) progEl2.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
    if (motion) timelines.forEach(function (tl) {
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      tl.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    });
  }
  window.addEventListener("scroll", function () { if (!sTick) { sTick = true; requestAnimationFrame(onScrollFx); } }, { passive: true });
  window.addEventListener("resize", onScrollFx);
  onScrollFx();

  /* ---------------- cursor glow (desktop only) ---------------- */
  var glow = $("#cursor-glow");
  if (glow && motion && finePointer) {
    var gx = 0, gy = 0, tx = 0, ty = 0, gRaf = 0;
    var gLoop = function () {
      gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14;
      glow.style.transform = "translate3d(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px,0)";
      gRaf = (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) ? requestAnimationFrame(gLoop) : 0;
    };
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX; ty = e.clientY;
      if (!root.classList.contains("has-glow")) { gx = tx; gy = ty; root.classList.add("has-glow"); }
      if (!gRaf) gRaf = requestAnimationFrame(gLoop);
    }, { passive: true });
    document.addEventListener("pointerleave", function () { root.classList.remove("has-glow"); });
  }

  /* ---------------- scroll reveal ---------------- */
  $$("[data-reveal-group]").forEach(function (g) {
    var type = g.getAttribute("data-reveal-group");
    Array.prototype.forEach.call(g.children, function (c, i) {
      if (!c.hasAttribute("data-reveal")) c.setAttribute("data-reveal", type);
      c.style.setProperty("--i", Math.min(i, 8));
    });
  });
  function settle(el) {
    var i = parseFloat(getComputedStyle(el).getPropertyValue("--i")) || 0;
    setTimeout(function () { el.removeAttribute("data-reveal"); }, 1100 + i * 75);
  }
  var revealEls = $$("[data-reveal]");
  var pendingReveal = [];
  function reveal(el) {
    if (el.classList.contains("in")) return;
    el.classList.add("in"); settle(el);
    var k = pendingReveal.indexOf(el); if (k > -1) pendingReveal.splice(k, 1);
  }
  /* catch-up on scroll: anything whose top has entered the viewport is revealed
     (also covers clip-path reveals, which IntersectionObserver reports as zero-area) */
  function revealCheck() {
    if (!pendingReveal.length) return;
    var vh = window.innerHeight * 0.94;
    pendingReveal.slice().forEach(function (el) {
      var r = (el.getAttribute("data-reveal") === "heading" || el.getAttribute("data-reveal") === "clip") ? el.parentElement.getBoundingClientRect() : el.getBoundingClientRect();
      if (r.top < vh) reveal(el);
    });
  }
  if (!motion || !hasIO) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    pendingReveal = revealEls.slice();
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { reveal(en.target); rio.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { rio.observe(el); });
    window.addEventListener("scroll", function () { requestAnimationFrame(revealCheck); }, { passive: true });
    requestAnimationFrame(revealCheck);
  }

  /* ---------------- count-up numbers ---------------- */
  $$("[data-count]").forEach(function (el) {
    var m = /^([^0-9]*)([0-9]+)(.*)$/.exec(el.getAttribute("data-count"));
    if (!m || !motion || !hasIO) return;
    var pre = m[1], n = parseInt(m[2], 10), suf = m[3];
    if (n >= 1000) return; // years stay as they are
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) { /* in view at load: count right away */ }
    el.textContent = pre + "0" + suf;
    var cio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      cio.disconnect();
      var t0 = performance.now(), dur = 1300 + Math.min(n, 70) * 6;
      var step = function (t) {
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + Math.round(n * e) + suf;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    cio.observe(el);
  });

  /* ---------------- spotlight + 3D tilt ---------------- */
  $$(".pcard, .tcard, .cert, .reach-tile, [data-tilt], .tl-item, .kpi").forEach(function (el) {
    el.classList.add("spot");
    var max = el.classList.contains("tcard") ? 4 : 6;
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty("--mx", x + "px"); el.style.setProperty("--my", y + "px");
      if (!motion || !finePointer || e.pointerType !== "mouse") return;
      var rx = (0.5 - y / r.height) * max, ry = (x / r.width - 0.5) * max;
      el.classList.add("tilting");
      el.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-3px)";
    });
    el.addEventListener("pointerleave", function () {
      el.classList.remove("tilting");
      el.style.transform = "";
    });
  });

  /* ---------------- magnetic buttons ---------------- */
  if (motion && finePointer) $$(".magnetic").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.style.transition = "transform .15s ease-out";
      b.style.transform = "translate(" + (dx * 0.22).toFixed(1) + "px," + (dy * 0.32).toFixed(1) + "px)";
    });
    b.addEventListener("pointerleave", function () {
      b.style.transition = "transform .45s cubic-bezier(.3,1.6,.5,1)";
      b.style.transform = "";
    });
  });

  /* ---------------- hero constellation ---------------- */
  var cv = $("#hero-canvas");
  if (cv && cv.getContext) (function () {
    var ctx = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0, pts = [], raf = 0, running = false;
    var par = { x: 0, y: 0, tx: 0, ty: 0 }, mouse = { x: -9999, y: -9999 };
    var COLORS = ["196,181,253", "147,197,253", "125,211,252", "255,255,255", "244,114,182"];
    function seed() {
      var n = Math.round(Math.max(26, Math.min(80, (W * H) / 13000)));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        r: 0.6 + Math.random() * 1.5, z: 0.25 + Math.random() * 0.75,
        c: COLORS[(Math.random() * COLORS.length) | 0], ph: Math.random() * 6.28
      });
    }
    function resize() {
      var r = cv.getBoundingClientRect();
      if (!r.width) return;
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(); draw(0, false);
    }
    function draw(t, move) {
      ctx.clearRect(0, 0, W, H);
      par.x += (par.tx - par.x) * 0.05; par.y += (par.ty - par.y) * 0.05;
      var P = [], i, j, p;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        if (move) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
          if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
        }
        P.push({ x: p.x - par.x * 40 * p.z, y: p.y - par.y * 30 * p.z, p: p });
      }
      ctx.lineWidth = 0.7;
      for (i = 0; i < P.length; i++) for (j = i + 1; j < P.length; j++) {
        var dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d2 = dx * dx + dy * dy;
        if (d2 < 12100) {
          ctx.strokeStyle = "rgba(167,139,250," + ((1 - d2 / 12100) * 0.28 * Math.min(P[i].p.z, P[j].p.z)).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.stroke();
        }
      }
      for (i = 0; i < P.length; i++) {
        var q = P[i], mx = q.x - mouse.x, my = q.y - mouse.y, md = mx * mx + my * my;
        if (md < 25000) {
          ctx.strokeStyle = "rgba(125,211,252," + ((1 - md / 25000) * 0.45).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        var tw = 0.55 + 0.45 * Math.sin(t * 0.0018 + q.p.ph);
        ctx.fillStyle = "rgba(" + q.p.c + "," + (0.35 + 0.6 * tw * q.p.z).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(q.x, q.y, q.p.r * (0.8 + q.p.z * 0.6), 0, 6.283); ctx.fill();
      }
    }
    function loop(t) { if (!running) return; draw(t, true); raf = requestAnimationFrame(loop); }
    function setRun(on) {
      if (!motion) return;
      if (on && !running) { running = true; raf = requestAnimationFrame(loop); }
      else if (!on && running) { running = false; cancelAnimationFrame(raf); }
    }
    resize();
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    if (motion) {
      window.addEventListener("pointermove", function (e) {
        if (!running) return;
        var r = cv.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        par.tx = mouse.x / W - 0.5; par.ty = mouse.y / H - 0.5;
      }, { passive: true });
      watch(cv, setRun, 0.01);
    }
  })();

  /* ---------------- track signature visuals ---------------- */
  function runner(fig, api) {
    if (!fig) return;
    if (!motion) return; // static final state is already in the markup
    var token = { v: 0 };
    watch(fig, function (on) {
      token.v++;
      if (on) api.run(token, token.v); else api.final();
    }, 0.25);
  }
  var alive = function (tok, v) { return tok.v === v; };

  // QA: mini test runner
  (function () {
    var fig = $(".sig-qa"); if (!fig) return;
    var lines = $$(".ql", fig), texts = lines.map(function (l) { return $(".qt", l).textContent; });
    var badges = lines.map(function (l) { return $(".qs", l); });
    var prog = $(".qa-prog i", fig), sum = $(".qa-sum", fig);
    var total = badges.filter(Boolean).length;
    function final() {
      lines.forEach(function (l, i) { $(".qt", l).textContent = texts[i]; l.classList.remove("typing"); if (badges[i]) badges[i].classList.remove("hide"); });
      prog.style.width = "100%"; sum.textContent = total + " / " + total;
    }
    async function run(tok, v) {
      while (alive(tok, v)) {
        lines.forEach(function (l, i) { $(".qt", l).textContent = ""; if (badges[i]) badges[i].classList.add("hide"); });
        prog.style.width = "0%"; sum.textContent = "0 / " + total;
        var done = 0;
        for (var i = 0; i < lines.length; i++) {
          var l = lines[i], q = $(".qt", l); l.classList.add("typing");
          for (var k = 1; k <= texts[i].length; k++) { if (!alive(tok, v)) return; q.textContent = texts[i].slice(0, k); await wait(i === 0 ? 34 : 17); }
          l.classList.remove("typing");
          if (badges[i]) { await wait(230); if (!alive(tok, v)) return; badges[i].classList.remove("hide"); done++; prog.style.width = (done / total * 100) + "%"; sum.textContent = done + " / " + total; }
          await wait(160);
        }
        await wait(3600);
      }
    }
    runner(fig, { run: run, final: final });
  })();

  // GIS: contour draw + live coordinate readout
  (function () {
    var fig = $(".sig-gis"); if (!fig) return;
    var svg = $("svg", fig), xh = $("#gis-xhair"), eE = $("#g-e"), eN = $("#g-n"), eZ = $("#g-z");
    var PEAKS = [{ x: 140, y: 118, h: 120, R: 150, a: .12, pa: .6, b: .06, pb: 1.3 }, { x: 305, y: 165, h: 80, R: 110, a: .10, pa: 2.0, b: .07, pb: .4 }];
    function elev(x, y) {
      var z = 0;
      PEAKS.forEach(function (p) {
        var dx = x - p.x, dy = y - p.y, d = Math.sqrt(dx * dx + dy * dy), th = Math.atan2(dy, dx);
        var w = 1 + p.a * Math.sin(3 * th + p.pa) + p.b * Math.sin(5 * th + p.pb);
        z = Math.max(z, p.h * (1 - d / (w * p.R)));
      });
      return Math.max(0, z);
    }
    var fmt = function (n) { return Math.round(n).toLocaleString("en-US"); };
    function setPos(x, y) {
      xh.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
      eE.textContent = fmt(590700 + x * 1.375);
      eN.textContent = fmt(2981800 - y * 1.375);
      eZ.textContent = Math.round(elev(x, y)) + " m";
    }
    var ptr = null, raf = 0, frame = 0;
    svg.addEventListener("pointermove", function (e) {
      var r = svg.getBoundingClientRect();
      ptr = { x: (e.clientX - r.left) / r.width * 400, y: (e.clientY - r.top) / r.height * 260 };
      if (!motion) setPos(ptr.x, ptr.y);
    });
    svg.addEventListener("pointerleave", function () { ptr = null; });
    var cur = { x: 200, y: 130 };
    function loop(t) {
      var tx = ptr ? ptr.x : 200 + 150 * Math.sin(t * 0.00031), ty = ptr ? ptr.y : 128 + 92 * Math.sin(t * 0.00047 + 1);
      cur.x += (tx - cur.x) * (ptr ? 0.35 : 1); cur.y += (ty - cur.y) * (ptr ? 0.35 : 1);
      if ((frame++ & 1) === 0) setPos(cur.x, cur.y);
      raf = requestAnimationFrame(loop);
    }
    runner(fig, {
      run: function () { fig.classList.remove("play"); void fig.offsetWidth; fig.classList.add("play"); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
      final: function () { cancelAnimationFrame(raf); }
    });
  })();

  // Web: code types, then the layout renders
  (function () {
    var fig = $(".sig-web"); if (!fig) return;
    var wl = $$(".wl", fig), texts = wl.map(function (l) { return l.textContent; }), wr = $$(".wr", fig);
    var lastOfStep = {};
    wl.forEach(function (l, i) { lastOfStep[l.getAttribute("data-step")] = i; });
    function final() { wl.forEach(function (l, i) { l.textContent = texts[i]; l.classList.remove("typing"); }); wr.forEach(function (w) { w.classList.remove("off"); }); }
    async function run(tok, v) {
      while (alive(tok, v)) {
        wl.forEach(function (l) { l.textContent = ""; }); wr.forEach(function (w) { w.classList.add("off"); });
        await wait(300);
        for (var i = 0; i < wl.length; i++) {
          wl[i].classList.add("typing");
          for (var k = 1; k <= texts[i].length; k++) { if (!alive(tok, v)) return; wl[i].textContent = texts[i].slice(0, k); await wait(24); }
          wl[i].classList.remove("typing");
          var st = wl[i].getAttribute("data-step");
          if (lastOfStep[st] === i) { var w = fig.querySelector('.wr[data-step="' + st + '"]'); if (w) w.classList.remove("off"); }
          await wait(200);
        }
        await wait(3400);
      }
    }
    runner(fig, { run: run, final: final });
  })();

  // Data: spreadsheet rows fill in; a duplicate is flagged then fixed
  (function () {
    var fig = $(".sig-data"); if (!fig) return;
    var rows = $$(".sh-row[data-row]", fig), rowEl = $(".ss-row", fig), msg = $(".ss-msg", fig);
    var finalMsg = msg.textContent;
    function final() {
      rows.forEach(function (r) { r.classList.remove("active", "flag"); if (r.classList.contains("dup")) r.classList.add("fixed"); $$(".sh-c", r).forEach(function (c) { c.classList.remove("e"); }); });
      rowEl.textContent = "rows " + rows.length + " / " + rows.length; msg.textContent = finalMsg; msg.classList.remove("warn");
    }
    async function run(tok, v) {
      while (alive(tok, v)) {
        rows.forEach(function (r) { r.classList.remove("active", "flag", "fixed"); $$(".sh-c", r).forEach(function (c) { c.classList.add("e"); }); });
        msg.textContent = "entering records…"; msg.classList.remove("warn");
        await wait(400);
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i]; r.classList.add("active");
          var cells = $$(".sh-c", r);
          for (var c = 0; c < cells.length; c++) { if (!alive(tok, v)) return; cells[c].classList.remove("e"); await wait(95); }
          r.classList.remove("active");
          rowEl.textContent = "rows " + (i + 1) + " / " + rows.length;
          if (r.classList.contains("dup")) {
            r.classList.add("flag"); msg.textContent = "⚠ duplicate of row 2 found"; msg.classList.add("warn");
            await wait(1100); if (!alive(tok, v)) return;
            r.classList.remove("flag"); r.classList.add("fixed"); msg.textContent = "✓ duplicate fixed"; msg.classList.remove("warn");
          }
          await wait(160);
        }
        msg.textContent = finalMsg;
        await wait(3400);
      }
    }
    runner(fig, { run: run, final: final });
  })();

  /* ---------------- init ---------------- */
  applyLang(lang);
  if (!typedEl) restartTyping();
})();
