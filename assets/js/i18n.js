/**
 * 多语言切换逻辑（原生 JS，无依赖）
 * - 语言包在 assets/js/lang/ 下单独维护
 * - 切换时遍历 [data-i18n] 元素替换文本
 * - 用户选择记忆在 localStorage
 * - 默认中文（HTML 内即为中文，利于 SEO）
 */
(function () {
  var STORAGE_KEY = 'yfs_lang';
  var packs = {
    'zh-CN': window.LANG_ZH_CN || {},
    'en': window.LANG_EN_US || {}
  };

  /* 当前语言：优先用内部状态，避免 localStorage 不可用（如某些 file:// 环境）时切换失灵 */
  var current = null;

  function getLang() {
    if (current) return current;
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    return packs[saved] ? saved : 'zh-CN';
  }

  function applyLang(lang) {
    try {
      var pack = packs[lang] || {};
      var nodes = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < nodes.length; i++) {
        var key = nodes[i].getAttribute('data-i18n');
        if (pack[key] !== undefined) {
          nodes[i].textContent = pack[key];
        }
      }
      document.documentElement.setAttribute('lang', lang);
      document.title = pack['page.title'] || document.title;
      current = lang;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}

      /* 切换按钮显示“目标语言” */
      var btnText = document.getElementById('langToggleText');
      if (btnText) btnText.textContent = (lang === 'zh-CN') ? 'EN' : '中文';

      document.documentElement.setAttribute('data-current-lang', lang);
    } catch (err) {
      /* 出错时保留 HTML 中默认文案，页面照常可用 */
      if (window.console) console.warn('[i18n]', err);
    }
  }

  /* 尽早应用已保存语言，减少闪烁（语言包脚本在 body 末尾同步加载） */
  applyLang(getLang());

  /* 暴露给 main.js 绑定按钮 */
  window.YFS_I18N = {
    toggle: function () {
      var next = getLang() === 'zh-CN' ? 'en' : 'zh-CN';
      applyLang(next);
    },
    apply: applyLang,
    current: getLang
  };
})();
