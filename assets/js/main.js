/**
 * 页面交互逻辑（原生 JS，无依赖）
 * 说明：所有动画均为增强效果，任意环节出错都会自动兜底显示内容。
 */
(function () {
  /* ---------- 兜底：强制显示所有内容 ---------- */
  function revealAll() {
    var els = document.querySelectorAll('.reveal');
    for (var i = 0; i < els.length; i++) els[i].classList.add('force-visible');
    var cs = document.querySelectorAll('.counter');
    for (var j = 0; j < cs.length; j++) cs[j].textContent = cs[j].getAttribute('data-target');
  }
  /* 任何脚本错误都保证内容可见 */
  window.addEventListener('error', function () { revealAll(); });
  window.addEventListener('unhandledrejection', function () { revealAll(); });

  /* ---------- 移动端菜单 ---------- */
  var burger = document.getElementById('navBurger');
  var nav = document.getElementById('mainNav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    /* 点击链接后自动收起 */
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 滚动时导航样式 ---------- */
  var header = document.getElementById('siteHeader');
  var backTop = document.getElementById('backTop');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 30);
    if (backTop) backTop.classList.toggle('show', y > 500);
    highlightNav(y);
  }

  /* ---------- 当前分区导航高亮 ---------- */
  var sections = ['home', 'services', 'advantages', 'process', 'about', 'contact'];
  var navLinks = document.querySelectorAll('.nav-link');
  function highlightNav(y) {
    var current = 'home';
    for (var i = 0; i < sections.length; i++) {
      var el = document.getElementById(sections[i]);
      if (el && el.offsetTop - 120 <= y) current = sections[i];
    }
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  /* 变量就绪后再绑定滚动事件（注意：必须在 sections / navLinks 赋值之后调用） */
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 回到顶部 ---------- */
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 数字滚动动画 ---------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = 1500;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- 进入视口时显示动画 ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ioFired = false;
  if (typeof IntersectionObserver !== 'undefined' && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          ioFired = true;
          entry.target.classList.add('visible');
          entry.target.querySelectorAll('.counter').forEach(function (c) {
            if (!c.dataset.done) { c.dataset.done = '1'; animateCounter(c); }
          });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    /* 动画开始前先把数字归零（HTML 中已写好最终值，保证无 JS 时也正确） */
    document.querySelectorAll('.counter').forEach(function (c) { c.textContent = '0'; });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* 2 秒后若观察器一次都没触发，说明环境不支持/被拦截 —— 直接显示全部内容 */
  setTimeout(function () { if (!ioFired) revealAll(); }, 2000);

  /* ---------- 版权年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 语言切换按钮 ---------- */
  var langToggle = document.getElementById('langToggle');
  if (langToggle && window.YFS_I18N) {
    langToggle.addEventListener('click', window.YFS_I18N.toggle);
  }
})();
