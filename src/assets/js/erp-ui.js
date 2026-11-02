/* WebD ERP — UI helpers for the Aurora theme
   1) Busy-lock: any button/link whose text becomes "Processing..." / "Uploading..."
      is disabled until the server responds (text changes back). Safety unlock after 30s.
   2) Mobile card tables: copies <th> text into each <td data-label="..."> so
      tables can stack as cards on phones.
*/
(function () {
  'use strict';

  var BUSY_RE = /^\s*(processing|uploading|please wait|saving)\.*\s*$/i;

  function syncBusy(el) {
    if (!el || !el.classList) return;
    var busy = BUSY_RE.test(el.textContent || '');
    if (busy && !el.classList.contains('is-busy')) {
      el.classList.add('is-busy');
      el.setAttribute('aria-busy', 'true');
      if (el.tagName === 'BUTTON') el.disabled = true;
      clearTimeout(el.__erpBusyT);
      el.__erpBusyT = setTimeout(function () { unlock(el); }, 30000);
    } else if (!busy && el.classList.contains('is-busy')) {
      unlock(el);
    }
  }
  function unlock(el) {
    clearTimeout(el.__erpBusyT);
    el.classList.remove('is-busy');
    el.removeAttribute('aria-busy');
    if (el.tagName === 'BUTTON') el.disabled = false;
  }

  function labelTable(table) {
    var heads = table.querySelectorAll('thead');
    if (!heads.length) return;
    var ths = heads[heads.length - 1].querySelectorAll('th');
    if (!ths.length) return;
    var labels = Array.prototype.map.call(ths, function (th) { return (th.textContent || '').trim(); });
    var rows = table.querySelectorAll('tbody > tr');
    for (var r = 0; r < rows.length; r++) {
      var cells = rows[r].children;
      for (var c = 0; c < cells.length; c++) {
        if (cells[c].getAttribute('colspan')) continue;
        var l = labels[c] || '';
        if (cells[c].getAttribute('data-label') !== l) cells[c].setAttribute('data-label', l);
      }
    }
  }

  var queued = false;
  function scan() {
    queued = false;
    var tables = document.querySelectorAll('table.table-cards');
    for (var i = 0; i < tables.length; i++) labelTable(tables[i]);
  }
  function queueScan() {
    if (queued) return;
    queued = true;
    (window.requestAnimationFrame || setTimeout)(scan);
  }

  function onMutations(muts) {
    for (var i = 0; i < muts.length; i++) {
      var t = muts[i].target;
      var el = t.nodeType === 3 ? t.parentElement : t;
      if (el && el.closest) {
        var btn = el.closest('button, .btn');
        if (btn) syncBusy(btn);
      }
    }
    queueScan();
  }

  function start() {
    var obs = new MutationObserver(onMutations);
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    queueScan();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
