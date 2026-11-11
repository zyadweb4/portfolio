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
    splitName();
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
    ar: ["مطوّر GIS \u200f(ArcGIS Pro · ArcPy)", "أتمتة التحليل المكاني بـ Python", "مختبر جودة برمجيات (ويب وموبايل)", "AutoCAD وCivil 3D والمساحة", "أبني أدواتي بالذكاء الاصطناعي"],
    en: ["GIS Developer (ArcGIS Pro · ArcPy)", "Automating spatial analysis with Python", "QA Engineer (Web & Mobile)", "AutoCAD, Civil 3D & surveying", "Building my own tools with AI"]
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
  function visibleItems() { return track ? Array.prototype.filter.call(track.children, function (li) { return !li.hidden; }) : []; }
  function step() {
    var item = visibleItems()[0];
    if (!item) return 0;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return item.getBoundingClientRect().width + gap;
  }
  function updateCarousel() {
    if (!track) return;
    var total = visibleItems().length;
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
    $$(".pfilter button").forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-f");
        $$(".pfilter button").forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        Array.prototype.forEach.call(track.children, function (li, i) {
          var show = f === "all" || li.getAttribute("data-cat") === f;
          li.hidden = !show;
          if (show && motion) { li.classList.remove("pop"); void li.offsetWidth; li.style.setProperty("--d", (i % 6) * 55 + "ms"); li.classList.add("pop"); }
        });
        track.scrollLeft = 0;
        updateCarousel();
      });
    });
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
    lbI = Math.min(parseInt(trigger.getAttribute("data-start"), 10) || 0, lbImgs.length - 1); lbFrom = trigger;
    var t = trigger.querySelector("[data-lb-title]"), d = trigger.querySelector("[data-lb-desc]");
    if (!t && trigger.classList.contains("gp-shot")) t = { textContent: "GeoPilot" };
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

  /* ---------------- hero: live topographic field (marching squares) ---------------- */
  var cv = $("#hero-canvas");
  if (cv && cv.getContext) (function () {
    var ctx = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0, raf = 0, running = false, CELL = 16, cols = 0, rows = 0, field = null;
    var mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999 }, frame = 0;
    var hE = $("#hud-e"), hN = $("#hud-n"), hZ = $("#hud-z"), hS = $("#hud-s");
    var LEVELS = 11;
    function h(x, y, t) {
      var v = 0.5
        + 0.22 * Math.sin(x * 0.0042 + t * 0.00011) * Math.cos(y * 0.0051 - t * 0.00009)
        + 0.16 * Math.sin((x + y) * 0.0031 + 1.7 + t * 0.00007)
        + 0.10 * Math.cos(x * 0.0093 - y * 0.0061 + t * 0.00013)
        + 0.05 * Math.sin(x * 0.019 + y * 0.017 - t * 0.0002);
      var dx = x - mouse.sx, dy = y - mouse.sy;
      v += 0.17 * Math.exp(-(dx * dx + dy * dy) / 26000);
      return v;
    }
    function resize() {
      var r = cv.getBoundingClientRect();
      if (!r.width) return;
      W = r.width; H = r.height;
      CELL = W < 700 ? 20 : 16;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CELL) + 1; rows = Math.ceil(H / CELL) + 1;
      field = new Float32Array(cols * rows);
      draw(performance.now());
    }
    function lerp(a, b, l) { return (l - a) / (b - a); }
    function draw(t) {
      var i, j, k;
      for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) field[j * cols + i] = h(i * CELL, j * CELL, t);
      ctx.clearRect(0, 0, W, H);
      for (k = 1; k <= LEVELS; k++) {
        var lv = 0.08 + k * 0.075, index = k % 5 === 0;
        ctx.beginPath();
        for (j = 0; j < rows - 1; j++) for (i = 0; i < cols - 1; i++) {
          var a = field[j * cols + i], b = field[j * cols + i + 1], c = field[(j + 1) * cols + i + 1], d = field[(j + 1) * cols + i];
          var idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (d > lv ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          var x = i * CELL, y = j * CELL;
          var T = [x + CELL * lerp(a, b, lv), y], R = [x + CELL, y + CELL * lerp(b, c, lv)],
              B = [x + CELL * lerp(d, c, lv), y + CELL], L = [x, y + CELL * lerp(a, d, lv)];
          var segs;
          switch (idx) {
            case 1: case 14: segs = [L, B]; break;
            case 2: case 13: segs = [B, R]; break;
            case 3: case 12: segs = [L, R]; break;
            case 4: case 11: segs = [T, R]; break;
            case 5: segs = [L, T, B, R]; break;
            case 6: case 9: segs = [T, B]; break;
            case 7: case 8: segs = [L, T]; break;
            case 10: segs = [L, B, T, R]; break;
          }
          for (var s2 = 0; s2 < segs.length; s2 += 2) { ctx.moveTo(segs[s2][0], segs[s2][1]); ctx.lineTo(segs[s2 + 1][0], segs[s2 + 1][1]); }
        }
        var hue = k / LEVELS;
        ctx.strokeStyle = index ? "rgba(125,211,252,.42)" : "rgba(" + Math.round(139 + 30 * hue) + "," + Math.round(120 + 60 * hue) + ",250," + (0.10 + 0.10 * hue).toFixed(3) + ")";
        ctx.lineWidth = index ? 1.25 : 0.8;
        ctx.stroke();
      }
      if (mouse.x > -999) {
        var mx = mouse.x, my = mouse.y;
        ctx.strokeStyle = "rgba(125,211,252,.35)"; ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, H); ctx.moveTo(0, my); ctx.lineTo(W, my); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(125,211,252,.9)";
        ctx.beginPath(); ctx.arc(mx, my, 7, 0, 6.283); ctx.stroke();
        ctx.beginPath(); ctx.arc(mx, my, 1.8, 0, 6.283); ctx.fillStyle = "#7dd3fc"; ctx.fill();
        if ((frame & 3) === 0 && hE) {
          hE.textContent = Math.round(590700 + mx * 1.6).toLocaleString("en-US");
          hN.textContent = Math.round(2981800 - my * 1.6).toLocaleString("en-US");
          hZ.textContent = Math.round(h(mx, my, t) * 180);
        }
      }
    }
    function loop(t) {
      if (!running) return;
      frame++;
      mouse.sx += (mouse.x - mouse.sx) * 0.08; mouse.sy += (mouse.y - mouse.sy) * 0.08;
      if (frame & 1) draw(t);
      raf = requestAnimationFrame(loop);
    }
    function setRun(on) {
      if (!motion) return;
      if (on && !running) { running = true; raf = requestAnimationFrame(loop); }
      else if (!on && running) { running = false; cancelAnimationFrame(raf); }
    }
    resize();
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    if (motion) {
      var hero = $(".hero");
      hero.addEventListener("pointermove", function (e) {
        var r = cv.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        if (mouse.sx < -999) { mouse.sx = mouse.x; mouse.sy = mouse.y; }
      }, { passive: true });
      hero.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });
      window.addEventListener("scroll", function () {
        if (hS) hS.textContent = (25000 + Math.round(window.scrollY * 12 / 500) * 500).toLocaleString("en-US");
      }, { passive: true });
      watch(cv, setRun, 0.01);
    }
  })();

  /* ---------------- intro curtain ---------------- */
  (function () {
    var intro = $("#intro");
    if (!intro) return;
    var seen = false; try { seen = sessionStorage.getItem("zyad-intro") === "1"; } catch (e) { /* ignore */ }
    if (!motion || seen) { intro.remove(); return; }
    try { sessionStorage.setItem("zyad-intro", "1"); } catch (e) { /* ignore */ }
    root.classList.add("intro-on");
    setTimeout(function () { intro.classList.add("out"); root.classList.remove("intro-on"); }, 1250);
    setTimeout(function () { intro.remove(); }, 2100);
  })();

  /* ---------------- hero name: word-by-word reveal ---------------- */
  function splitName() {
    var el = $(".split-name");
    if (!el || !motion) return;
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map(function (w, i) { return '<span class="w" aria-hidden="true"><span style="--wi:' + i + '">' + w + "</span></span>"; }).join(" ");
  }

  /* ---------------- portrait + section parallax ---------------- */
  if (motion && !reduce) (function () {
    var par = $$("[data-parallax]");
    var tickP = false;
    function up() {
      tickP = false;
      var y = window.scrollY;
      par.forEach(function (el) { el.style.transform = "translate3d(0," + (y * -0.12).toFixed(1) + "px,0)"; });
    }
    window.addEventListener("scroll", function () { if (!tickP) { tickP = true; requestAnimationFrame(up); } }, { passive: true });
  })();

  /* ---------------- GeoPilot live demo ---------------- */
  (function () {
    var box = $("#geopilot"); if (!box) return;
    var svg = $("#gp-svg"), cG = $("#gp-contours"), lay = $("#gp-layer"), stepsEl = $("#gp-steps"), codeEl = $("#gp-code"),
        prog = $("#gp-prog"), pct = $("#gp-pct"), legT = $("#gp-leg-t"), leg = $("#gp-leg");
    var NS = "http://www.w3.org/2000/svg";
    function el(n, at) { var e = document.createElementNS(NS, n); for (var k in at) e.setAttribute(k, at[k]); return e; }
    // static terrain contours
    (function () {
      var peaks = [[170, 130, 1], [420, 250, .8], [470, 90, .6]];
      for (var p = 0; p < peaks.length; p++) for (var r = 1; r <= 6; r++) {
        var pts = [], R = r * 26 * peaks[p][2] + 8;
        for (var a = 0; a <= 64; a++) {
          var th = a / 64 * 6.283, w = 1 + .14 * Math.sin(3 * th + p) + .08 * Math.sin(5 * th + r);
          pts.push((peaks[p][0] + Math.cos(th) * R * w * 1.25).toFixed(1) + "," + (peaks[p][1] + Math.sin(th) * R * w).toFixed(1));
        }
        cG.appendChild(el("polyline", { points: pts.join(" "), "stroke-width": r % 5 === 0 ? 1.4 : .8 }));
      }
    })();
    var PK = {
      hydro: {
        leg: "Stream order", sw: [["#38bdf8", "1"], ["#3b82f6", "2"], ["#6366f1", "3"], ["#a78bfa", "4"]],
        steps: ["Fill sinks", "Flow direction (D8)", "Flow accumulation", "Stream threshold > 5000", "Stream order (Strahler)", "Watersheds from outlets", "Symbolize + legend"],
        code: 'from arcpy.sa import *\nfilled = Fill("DEM_30m")\nfdir = FlowDirection(filled)\nfacc = FlowAccumulation(fdir)\nstr_ = Con(facc > 5000, 1)\nStreamToFeature(StreamOrder(str_, fdir),\n                fdir, "streams")',
        draw: function () {
          var paths = [["M60 40 C110 90 130 150 210 190 S330 250 380 330", 4, "#a78bfa"], ["M150 20 C160 80 190 130 210 190", 2.4, "#6366f1"], ["M300 60 C290 130 330 200 330 250", 2.4, "#6366f1"], ["M560 40 C500 90 470 160 420 220 S390 300 380 330", 3, "#3b82f6"], ["M520 180 C480 200 450 210 420 220", 1.6, "#38bdf8"], ["M250 300 C300 290 340 300 370 320", 1.4, "#38bdf8"], ["M90 160 C130 170 170 180 210 190", 1.4, "#38bdf8"]];
          return paths.map(function (d) { return el("path", { d: d[0], stroke: d[2], "stroke-width": d[1], "stroke-linecap": "round", pathLength: 1, class: "gp-draw" }); });
        }
      },
      net: {
        leg: "Drive time", sw: [["#34d399", "5 min"], ["#fbbf24", "10 min"], ["#f472b6", "15 min"]],
        steps: ["Load road network dataset", "Add facilities (hospitals)", "Service area 5 / 10 / 15 min", "Dissolve overlapping polygons", "Coverage % per district", "Symbolize + legend"],
        code: 'import arcpy\nsa = arcpy.nax.ServiceArea("Roads_ND")\nsa.defaultImpedanceCutoffs = [5, 10, 15]\nsa.load(arcpy.nax.ServiceAreaInputDataType.Facilities,\n        "Hospitals")\nres = sa.solve()\nres.export(arcpy.nax.ServiceAreaOutputDataType.Polygons,\n           "SA_Polygons")',
        draw: function () {
          var o = [];
          [[300, 190, 150, "#f472b6"], [300, 190, 100, "#fbbf24"], [300, 190, 55, "#34d399"]].forEach(function (c) {
            o.push(el("ellipse", { cx: c[0], cy: c[1], rx: c[2] * 1.3, ry: c[2], fill: c[3], "fill-opacity": .14, stroke: c[3], "stroke-opacity": .7, class: "gp-grow" }));
          });
          ["M0 190H600", "M300 0V380", "M80 40L520 340", "M100 330L500 60"].forEach(function (d) { o.push(el("path", { d: d, stroke: "#e2e8f0", "stroke-opacity": .35, "stroke-width": 1.2, pathLength: 1, class: "gp-draw" })); });
          o.push(el("circle", { cx: 300, cy: 190, r: 6, fill: "#fff", class: "gp-grow" }));
          return o;
        }
      },
      topo: {
        leg: "Cut / fill (m)", sw: [["#f87171", "cut"], ["#e2e8f0", "0"], ["#34d399", "fill"]],
        steps: ["TIN from survey points", "DEM 1 m + hillshade", "Slope + aspect", "Design surface (+2.5 m)", "Cut / fill volumes", "Profile along alignment", "Report to table"],
        code: 'from arcpy.sa import *\nslope = Slope("DEM_1m", "DEGREE")\nhs = Hillshade("DEM_1m", 315, 45)\narcpy.ddd.CutFill("DEM_1m",\n    "Design_Surface", "CutFill")\n# volumes -> attribute table',
        draw: function () {
          var o = [];
          for (var i = 0; i < 12; i++) for (var j = 0; j < 8; j++) {
            var v = Math.sin(i * .7) * Math.cos(j * .9);
            o.push(el("rect", { x: 60 + i * 40, y: 30 + j * 40, width: 38, height: 38, rx: 4, fill: v > .2 ? "#f87171" : v < -.2 ? "#34d399" : "#e2e8f0", "fill-opacity": .08 + Math.abs(v) * .32, class: "gp-grow", style: "transition-delay:" + ((i + j) * 25) + "ms" }));
          }
          o.push(el("path", { d: "M40 300 C150 250 260 330 360 260 S520 200 580 240", stroke: "#fbbf24", "stroke-width": 2.5, pathLength: 1, class: "gp-draw" }));
          return o;
        }
      },
      util: {
        leg: "Network check", sw: [["#34d399", "valid"], ["#fbbf24", "slope"], ["#f87171", "gap"]],
        steps: ["Load water + sewer lines", "Snap tolerance 0.05 m", "Find dangles + gaps", "Check slope per pipe", "Manhole depth rules", "Write flags to attributes"],
        code: 'import arcpy\nfor row in arcpy.da.SearchCursor(\n        "Sewer_Lines", ["OID@", "SLOPE"]):\n    if row[1] < 0.004:\n        flag(row[0], "slope < 0.4%")\narcpy.management.Integrate("Sewer_Lines",\n                           "0.05 Meters")',
        draw: function () {
          var o = [], nodes = [[90, 80], [220, 90], [340, 110], [470, 90], [220, 210], [340, 230], [470, 220], [340, 330]];
          var edges = [[0, 1, "#34d399"], [1, 2, "#34d399"], [2, 3, "#fbbf24"], [1, 4, "#34d399"], [4, 5, "#34d399"], [5, 6, "#34d399"], [2, 5, "#34d399"], [5, 7, "#f87171"]];
          edges.forEach(function (e) { var a = nodes[e[0]], b = nodes[e[1]]; o.push(el("path", { d: "M" + a + "L" + b, stroke: e[2], "stroke-width": 3, pathLength: 1, class: "gp-draw" })); });
          nodes.forEach(function (n, i) { o.push(el("circle", { cx: n[0], cy: n[1], r: 6, fill: "#0b0b26", stroke: i === 7 ? "#f87171" : "#7dd3fc", "stroke-width": 2, class: "gp-grow" })); });
          return o;
        }
      }
    };
    var cur = "hydro", token = 0, auto = true;
    function setLegend(pk) {
      legT.textContent = pk.leg;
      leg.innerHTML = pk.sw.map(function (s) { return '<span><i style="background:' + s[0] + '"></i>' + s[1] + "</span>"; }).join("");
    }
    function final(name) {
      var pk = PK[name];
      setLegend(pk);
      stepsEl.innerHTML = pk.steps.map(function (s) { return '<li class="ok"><b>✓</b>' + s + "</li>"; }).join("");
      codeEl.textContent = pk.code;
      lay.innerHTML = ""; pk.draw().forEach(function (n) { lay.appendChild(n); });
      $$(".gp-draw,.gp-grow", lay).forEach(function (n) { n.classList.add("on"); });
      prog.style.width = "100%"; pct.textContent = "100%";
    }
    async function run(name, my) {
      var pk = PK[name];
      setLegend(pk);
      lay.innerHTML = ""; codeEl.textContent = "";
      stepsEl.innerHTML = pk.steps.map(function (s) { return "<li><b>·</b>" + s + "</li>"; }).join("");
      prog.style.width = "0%"; pct.textContent = "0%";
      var lis = $$("li", stepsEl);
      for (var i = 0; i < lis.length; i++) {
        if (my !== token) return;
        lis[i].classList.add("run"); $("b", lis[i]).textContent = "◌";
        await wait(420);
        if (my !== token) return;
        lis[i].classList.remove("run"); lis[i].classList.add("ok"); $("b", lis[i]).textContent = "✓";
        var p = Math.round((i + 1) / lis.length * 100); prog.style.width = p + "%"; pct.textContent = p + "%";
      }
      var nodes = pk.draw(); nodes.forEach(function (n) { lay.appendChild(n); });
      requestAnimationFrame(function () { requestAnimationFrame(function () { nodes.forEach(function (n) { n.classList.add("on"); }); }); });
      for (var c = 1; c <= pk.code.length; c++) { if (my !== token) return; codeEl.textContent = pk.code.slice(0, c); if (c % 2 === 0) await wait(12); }
      await wait(3800);
      if (my !== token || !auto) return;
      var keys = Object.keys(PK); select(keys[(keys.indexOf(name) + 1) % keys.length], false);
    }
    function select(name, user) {
      cur = name; if (user) auto = false;
      $$(".gp-pk", box).forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-pk") === name); });
      token++;
      if (motion && inView) run(name, token); else final(name);
    }
    $$(".gp-pk", box).forEach(function (b) { b.addEventListener("click", function () { select(b.getAttribute("data-pk"), true); }); });
    var inView = false;
    final(cur);
    if (motion) watch(box, function (on) { inView = on; token++; if (on) run(cur, token); else final(cur); }, 0.3);
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
