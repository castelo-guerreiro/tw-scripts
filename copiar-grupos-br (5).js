/* Copiar Grupos BR | CASTELO.GUERREIRO
   Copia os nomes dos grupos manuais e os filtros dos grupos dinamicos de uma conta
   e recria em outra. So PREENCHE campos: quem clica em "Criar" e "Salvar grupo" e voce. */
(function () {
  'use strict';
  if (typeof game_data === 'undefined' || !window.jQuery) { alert('Abra o jogo e clique no script de novo.'); return; }
  var $ = window.jQuery, W = game_data.world, VID = game_data.village.id, KEY = W + '_copiar_grupos_br';
  var old = document.getElementById('cgbr'); if (old) old.remove();

  /* ---------- utilidades ---------- */
  function U(q) { return '/game.php?village=' + VID + '&' + q; }
  function dec(s) { s = String(s == null ? '' : s); if (s.indexOf('&') < 0) return s; var t = document.createElement('textarea'); t.innerHTML = s; return t.value; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function onDyn() { return /type=dynamic/.test(location.search); }
  function curGroup() { var m = /[?&]group=(\d+)/.exec(location.search); return m ? m[1] : ''; }

  /* ---------- ler grupos (manuais e dinamicos) ---------- */
  function getGroups() {
    return Promise.all([
      $.ajax({ url: U('screen=groups&mode=overview&ajax=load_group_menu'), dataType: 'json' }),
      $.get(U('screen=overview_villages&mode=groups&type=dynamic'))
    ]).then(function (r) {
      var menu = (r[0] && r[0].result) || [], dyn = {}, man = [], din = [];
      var doc = new DOMParser().parseFromString(r[1], 'text/html');
      each(doc.querySelectorAll('a[href*="type=dynamic"][href*="group="]'), function (a) {
        var m = /[?&]group=(\d+)/.exec(a.getAttribute('href')); if (m) dyn[m[1]] = 1;
      });
      var temLinks = Object.keys(dyn).length > 0;
      menu.forEach(function (g) {
        var id = String(g.group_id); if (id === '0') return;
        var o = { id: id, name: dec(g.name).trim() };
        var d = temLinks ? !!dyn[id] : /dynamic/i.test(g.type || '');
        (d ? din : man).push(o);
      });
      return { man: man, din: din };
    });
  }

  /* ---------- ler / preencher o formulario de filtro ---------- */
  function isSave(el) { return /salvar/i.test(el.value || el.textContent || ''); }
  function findBox(root) {
    var f = Array.prototype.find.call(root.querySelectorAll('form'), function (f) {
      return Array.prototype.some.call(f.querySelectorAll('input[type=submit],input[type=button],button'), isSave);
    });
    if (f) return f;
    return Array.prototype.find.call(root.querySelectorAll('table'), function (t) {
      return /Configura..es gerais/.test(t.textContent) && !t.querySelector('table');
    }) || null;
  }
  function fields(tr) {
    return Array.prototype.filter.call(tr.querySelectorAll('input,select'), function (e) {
      return ['hidden', 'submit', 'button', 'image'].indexOf(e.type) < 0;
    });
  }
  function lbl(tr) { return (tr.cells && tr.cells[0] ? tr.cells[0] : tr).textContent.replace(/\s+/g, ' ').trim(); }
  function ser(e) {
    if (e.tagName === 'SELECT') { var o = e.options[e.selectedIndex]; return { t: 's', v: e.value, x: o ? o.text.trim() : '' }; }
    if (e.type === 'checkbox') return { t: 'c', c: e.checked };
    if (e.type === 'radio') return { t: 'r', v: e.value, c: e.checked };
    return { t: 'i', v: e.value };
  }
  function readRows(box) {
    var rows = [];
    each(box.querySelectorAll('tr'), function (tr) {
      if (tr.querySelector('tr')) return;
      var f = fields(tr); if (!f.length) return;
      rows.push({ l: lbl(tr), f: f.map(ser) });
    });
    return rows;
  }
  function ativa(r) { return r.f[0] && r.f[0].t === 'c' && r.f[0].c; }
  function fire(e) { e.dispatchEvent(new Event('change', { bubbles: true })); }

  function fillRows(box, saved) {
    var live = [], warn = [], cnt = {};
    each(box.querySelectorAll('tr'), function (tr) {
      if (tr.querySelector('tr')) return;
      var f = fields(tr); if (f.length) live.push({ l: lbl(tr), f: f });
    });
    saved.forEach(function (r) {
      var n = cnt[r.l] || 0; cnt[r.l] = n + 1;
      var m = live.filter(function (x) { return x.l === r.l; })[n];
      if (!m) { if (ativa(r)) warn.push('Linha não encontrada: ' + r.l); return; }
      if (/dist[âa]ncia/i.test(r.l)) { if (ativa(r)) warn.push('"' + r.l + '" usa a aldeia da conta de origem. Configure essa linha na mão.'); return; }
      r.f.forEach(function (s, i) { var e = m.f[i]; if (e && s.t === 'c' && e.checked !== s.c) e.click(); });
      r.f.forEach(function (s, i) { var e = m.f[i]; if (e && s.t === 'r' && s.c && !e.checked) e.click(); });
      r.f.forEach(function (s, i) {
        var e = m.f[i]; if (!e) return;
        if (s.t === 's') {
          var k = -1, j;
          for (j = 0; j < e.options.length; j++) if (e.options[j].text.trim() === s.x) { k = j; break; }
          if (k < 0 && !s.x) for (j = 0; j < e.options.length; j++) if (e.options[j].value === s.v) { k = j; break; }
          if (k < 0) { if (ativa(r)) warn.push('Não achei "' + s.x + '" em "' + r.l + '" (o grupo existe nesta conta?)'); return; }
          e.selectedIndex = k; fire(e);
        } else if (s.t === 'i') { e.value = s.v; fire(e); }
      });
    });
    return warn;
  }

  /* le o filtro de um grupo dinamico abrindo a pagina de verdade num quadro escondido (pega o que o JS do jogo marca) */
  function lerFiltro(id) {
    return new Promise(function (res) {
      var f = document.createElement('iframe'), feito = false;
      f.style.cssText = 'position:fixed;left:-9999px;top:0;width:1300px;height:900px;border:0;visibility:hidden';
      function fim(r) { if (feito) return; feito = true; try { f.remove(); } catch (e) {} res(r); }
      f.onload = function () {
        setTimeout(function () {
          try {
            var d = f.contentDocument, box = findBox(d);
            if (!box) return fim(null);
            var m = /Para o grupo:[^\n]*/.exec(d.body.textContent || '');
            fim({
              rows: readRows(box), para: m ? m[0] : '',
              cb: box.querySelectorAll('input[type=checkbox]').length,
              on: box.querySelectorAll('input[type=checkbox]:checked').length
            });
          } catch (e) { fim(null); }
        }, 1500);
      };
      f.src = U('screen=overview_villages&mode=groups&type=dynamic&group=' + id);
      document.body.appendChild(f);
      setTimeout(function () { fim(null); }, 15000);
    });
  }

  /* ---------- campo "Criar grupo" ---------- */
  function findCreate() {
    var TXT = 'input:not([type]),input[type=text]';
    var pn = document.getElementById('cgbr');
    var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false), nd, alvo = null;
    while ((nd = tw.nextNode())) {
      if (/Criar grupo/i.test(nd.nodeValue) && !(pn && pn.contains(nd))) { alvo = nd; break; }
    }
    if (alvo) {
      var ins = document.querySelectorAll(TXT), ii;
      for (ii = 0; ii < ins.length; ii++) {
        if (pn && pn.contains(ins[ii])) continue;
        if (alvo.compareDocumentPosition(ins[ii]) & Node.DOCUMENT_POSITION_FOLLOWING) return ins[ii];
      }
    }
    /* 1) campo de texto cujo trecho da pagina tem o rotulo "Criar grupo" (pega o trecho mais curto) */
    var best = null, bl = 1e9;
    each(document.querySelectorAll(TXT), function (i) {
      if (i.disabled || (document.getElementById('cgbr') && document.getElementById('cgbr').contains(i))) return;
      var t = i.parentNode ? i.parentNode.textContent : '';
      if (/Criar grupo/i.test(t) && t.length < bl) { best = i; bl = t.length; }
    });
    if (best) return best;
    /* 2) campo de texto no mesmo bloco do botao "Criar" */
    var b = Array.prototype.find.call(document.querySelectorAll('input[type=submit],input[type=button],button,a.btn'), function (x) {
      return /^criar$/i.test((x.value || x.textContent || '').trim());
    });
    if (!b) return null;
    var n = b.parentNode, k = 0, c;
    while (n && k < 4) { c = n.querySelector(TXT); if (c) return c; n = n.parentNode; k++; }
    return null;
  }
  function diag() {
    var l = [];
    each(document.querySelectorAll('input'), function (i) {
      if (document.getElementById('cgbr').contains(i) || i.type === 'hidden') return;
      l.push((i.type || 'sem-type') + '/' + (i.name || '-') + '/' + (i.id || '-'));
    });
    return 'Campos na página: ' + (l.join(' | ') || 'nenhum');
  }
  function linkAba(txt) {
    return Array.prototype.find.call(document.querySelectorAll('a'), function (a) { return a.textContent.trim() === txt; });
  }

  /* ---------- painel ---------- */
  var css = '#cgbr{position:fixed;top:60px;right:20px;width:400px;max-height:85vh;overflow:auto;z-index:99999;background:#0c2250;color:#f3e6b3;border:2px solid #d4a72c;border-radius:8px;font:13px Arial,sans-serif;box-shadow:0 4px 18px #000a}' +
    '#cgbr *{box-sizing:border-box}#cgbr h3{margin:0;padding:8px 10px;background:linear-gradient(#1b3f8f,#0c2250);color:#ffd45c;font-size:14px;border-bottom:2px solid #d4a72c;cursor:move}' +
    '#cgbr .x{float:right;cursor:pointer}#cgbr .tabs{display:flex}#cgbr .tabs b{flex:1;text-align:center;padding:6px;cursor:pointer;background:#16316e}' +
    '#cgbr .tabs b.on{background:#d4a72c;color:#0c2250}#cgbr .bd{padding:10px}#cgbr button{background:#d4a72c;color:#0c2250;border:0;border-radius:4px;padding:6px 10px;font-weight:bold;cursor:pointer;margin:3px 3px 3px 0}' +
    '#cgbr textarea{width:100%;height:110px;font-size:11px}#cgbr .lst{max-height:170px;overflow:auto;background:#10306f;padding:6px;margin:4px 0;border-radius:4px}' +
    '#cgbr .lst label{display:block}#cgbr .st{margin:6px 0;color:#fff}#cgbr .w{color:#ffb4a8;margin:3px 0}#cgbr small{color:#b9c6e6}';
  var P = document.createElement('div'); P.id = 'cgbr';
  P.innerHTML = '<style>' + css + '</style><h3><span class="x" id="cg_x">✕</span>CASTELO.GUERREIRO · Copiar grupos · v6</h3>' +
    '<div class="tabs"><b id="t1" class="on">Copiar (esta conta)</b><b id="t2">Colar (outra conta)</b></div>' +
    '<div class="bd" id="b1"><button id="c_ler">1. Ler meus grupos</button><div id="c_area"></div></div>' +
    '<div class="bd" id="b2" style="display:none"><div>Cole aqui o texto copiado da outra conta:</div><textarea id="p_txt"></textarea>' +
    '<button id="p_load">Carregar texto</button><button id="p_reset">Recomeçar</button><div id="p_area"></div></div>' +
    '<div class="bd"><small>O script só preenche campos. Você clica em Criar e Salvar grupo.</small></div>';
  document.body.appendChild(P);
  function q(id) { return document.getElementById(id); }
  q('cg_x').onclick = function () { P.remove(); };
  q('t1').onclick = function () { tab(1); }; q('t2').onclick = function () { tab(2); };
  function tab(n) { q('b1').style.display = n === 1 ? '' : 'none'; q('b2').style.display = n === 2 ? '' : 'none'; q('t1').className = n === 1 ? 'on' : ''; q('t2').className = n === 2 ? 'on' : ''; }
  (function drag() { var h = P.querySelector('h3'), dx, dy, mv = false;
    h.onmousedown = function (e) { mv = true; dx = e.clientX - P.offsetLeft; dy = e.clientY - P.offsetTop; e.preventDefault(); };
    document.addEventListener('mousemove', function (e) { if (mv) { P.style.left = (e.clientX - dx) + 'px'; P.style.top = (e.clientY - dy) + 'px'; P.style.right = 'auto'; } });
    document.addEventListener('mouseup', function () { mv = false; }); })();

  /* ---------- aba COPIAR ---------- */
  var G = null;
  q('c_ler').onclick = function () {
    q('c_area').innerHTML = '<div class="st">Lendo grupos...</div>';
    getGroups().then(function (g) {
      G = g;
      function lista(arr, nome) {
        return '<b>' + nome + ' (' + arr.length + ')</b> <a href="#" data-all="' + nome + '" style="color:#ffd45c">marcar/desmarcar todos</a><div class="lst">' +
          arr.map(function (x) { return '<label><input type="checkbox" class="ck_' + nome + '" value="' + x.id + '" checked> ' + esc(x.name) + '</label>'; }).join('') + '</div>';
      }
      q('c_area').innerHTML = '<button id="c_on">Marcar todas</button><button id="c_off">Desmarcar todas</button><br>' + lista(g.man, 'man') + lista(g.din, 'din') +
        '<button id="c_gen">2. Gerar texto</button><div id="c_out"></div>';
      each(q('c_area').querySelectorAll('a[data-all]'), function (a) {
        a.onclick = function (e) { e.preventDefault(); var cs = q('c_area').querySelectorAll('.ck_' + a.dataset.all), on = !cs[0] || !cs[0].checked; each(cs, function (c) { c.checked = on; }); };
      });
      q('c_gen').onclick = gerar;
      function todas(on) { each(q('c_area').querySelectorAll('input[type=checkbox]'), function (c) { c.checked = on; }); }
      q('c_on').onclick = function () { todas(true); };
      q('c_off').onclick = function () { todas(false); };
    }).catch(function () { q('c_area').innerHTML = '<div class="w">Não consegui ler os grupos.</div>'; });
  };
  function marcados(nome) { var o = {}; each(q('c_area').querySelectorAll('.ck_' + nome), function (c) { if (c.checked) o[c.value] = 1; }); return o; }

  async function gerar() {
    var sm = marcados('man'), sd = marcados('din'), out = { v: 1, w: W, man: [], din: [] }, needM = {}, resumo = [], av = [];
    var o = q('c_out');
    for (var i = 0; i < G.din.length; i++) {
      var g = G.din[i]; if (!sd[g.id]) continue;
      o.innerHTML = '<div class="st">Lendo filtro: ' + esc(g.name) + ' (' + (i + 1) + '/' + G.din.length + ')</div>';
      try {
        var lido = await lerFiltro(g.id), rows, info = '';
        if (lido) {
          rows = lido.rows; info = ' [linhas: ' + rows.length + ', caixinhas: ' + lido.cb + ', marcadas: ' + lido.on + ']';
          if (lido.para && lido.para.indexOf(g.name) < 0) av.push(g.name + ': a página aberta mostrou outro grupo (' + lido.para + ')');
        } else {
          var html = await $.get(U('screen=overview_villages&mode=groups&type=dynamic&group=' + g.id));
          var box = findBox(new DOMParser().parseFromString(html, 'text/html'));
          if (!box) { av.push('Não achei o filtro de: ' + g.name); continue; }
          rows = readRows(box); info = ' [leitura simples]';
        }
        var n = rows.filter(ativa).length;
        rows.forEach(function (r) { if (ativa(r)) r.f.forEach(function (s) { if (s.t === 's' && s.x) needM[s.x] = 1; }); });
        out.din.push({ n: g.name, rows: rows });
        resumo.push(esc(g.name) + ': ' + n + ' filtro(s) ativo(s)');
        if (!n) av.push(g.name + ': nenhum filtro ativo foi lido' + info);
        if (rows.some(function (r) { return /dist[âa]ncia/i.test(r.l) && ativa(r); })) av.push(g.name + ': usa "Distância" a partir de uma aldeia; na outra conta configure na mão.');
      } catch (e) { av.push('Falhou ao ler: ' + g.name); }
      await sleep(200);
    }
    G.man.forEach(function (m) { if (sm[m.id] || needM[m.name]) out.man.push(m.name); });
    var txt = JSON.stringify(out);
    o.innerHTML = '<div class="st">Pronto: ' + out.man.length + ' manuais e ' + out.din.length + ' dinâmicos.</div>' +
      '<div class="st"><small>' + resumo.join('<br>') + '</small></div>' + av.map(function (a) { return '<div class="w">' + esc(a) + '</div>'; }).join('') +
      '<textarea id="c_txt" readonly></textarea><button id="c_cp">Copiar texto</button>';
    q('c_txt').value = txt;
    q('c_cp').onclick = function () {
      var t = q('c_txt'); t.select();
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).catch(function () { document.execCommand('copy'); });
      q('c_cp').textContent = 'Copiado!';
    };
  }

  /* ---------- aba COLAR ---------- */
  q('p_load').onclick = function () {
    try {
      var d = JSON.parse(q('p_txt').value.trim());
      if (!d || d.v !== 1 || !Array.isArray(d.man) || !Array.isArray(d.din)) throw 0;
      save({ data: d, filled: [] }); q('p_txt').value = ''; passo();
    } catch (e) { q('p_area').innerHTML = '<div class="w">Esse texto não é de um backup deste script.</div>'; }
  };
  q('p_reset').onclick = function () { try { localStorage.removeItem(KEY); } catch (e) {} q('p_area').innerHTML = '<div class="st">Limpo.</div>'; };

  async function passo() {
    var st = load(), A = q('p_area');
    if (!st) { A.innerHTML = '<div class="st">Cole o texto e clique em Carregar.</div>'; return; }
    A.innerHTML = '<div class="st">Conferindo seus grupos...</div>';
    var g;
    try { g = await getGroups(); } catch (e) { A.innerHTML = '<div class="w">Não consegui ler os grupos desta conta.</div>'; return; }
    var hm = {}, hd = {}; g.man.forEach(function (x) { hm[x.name] = x; }); g.din.forEach(function (x) { hd[x.name] = x; });
    var D = st.data, pm = D.man.filter(function (n) { return !hm[n.trim()]; });
    var dc = D.din.filter(function (d) { return !hd[d.n.trim()]; });
    var df = D.din.filter(function (d) { return hd[d.n.trim()] && st.filled.indexOf(d.n) < 0; });
    var act = null, k;
    if (pm.length) act = { t: 'man', name: pm[0] };
    else for (k = 0; k < D.din.length; k++) {
      var dd = D.din[k], ex = hd[dd.n.trim()];
      if (!ex) { act = { t: 'dcreate', name: dd.n }; break; }
      if (st.filled.indexOf(dd.n) < 0) { act = { t: 'dfill', d: dd, id: ex.id }; break; }
    }
    var info = '<div class="st">Manuais: ' + (D.man.length - pm.length) + '/' + D.man.length + ' criados<br>Dinâmicos: ' + (D.din.length - dc.length) + '/' + D.din.length +
      ' criados, ' + (D.din.length - dc.length - df.length) + ' com filtro preenchido</div>';
    if (!act) { A.innerHTML = info + '<div class="st">✔ Tudo feito. Confira os filtros dos dinâmicos no jogo.</div>'; return; }
    var msg = { man: 'Criar grupo manual: <b>' + esc(act.name) + '</b>', dcreate: 'Criar grupo dinâmico: <b>' + esc(act.name) + '</b>', dfill: 'Preencher o filtro de: <b>' + esc(act.d && act.d.n) + '</b>' }[act.t];
    A.innerHTML = info + '<div class="st">Próximo: ' + msg + '</div><button id="p_go">PRÓXIMO PASSO</button><div id="p_msg"></div>';
    q('p_go').onclick = function () { fazer(act, st); };
  }
  function fazer(act, st) {
    var M = q('p_msg'), el;
    if (act.t === 'man') {
      if (onDyn()) { var a = linkAba('Grupos manuais'); M.innerHTML = '<div class="st">Abrindo a aba Grupos manuais... Quando carregar, clique no script de novo.</div>'; location.href = a ? a.href : U('screen=overview_villages&mode=groups&type=static'); return; }
      el = findCreate(); if (!el) { M.innerHTML = '<div class="w">Não achei o campo Criar grupo. ' + esc(diag()) + '</div>'; return; }
      el.value = act.name; el.focus(); M.innerHTML = '<div class="st">Nome preenchido. Clique em <b>Criar</b> do jogo e depois clique no script de novo.</div>'; return;
    }
    if (!onDyn()) { M.innerHTML = '<div class="st">Abrindo a aba Grupos dinâmicos... Quando carregar, clique no script de novo.</div>'; location.href = U('screen=overview_villages&mode=groups&type=dynamic' + (act.id ? '&group=' + act.id : '')); return; }
    if (act.t === 'dcreate') {
      el = findCreate(); if (!el) { M.innerHTML = '<div class="w">Não achei o campo Criar grupo. ' + esc(diag()) + '</div>'; return; }
      el.value = act.name; el.focus(); M.innerHTML = '<div class="st">Nome preenchido. Clique em <b>Criar</b> do jogo e depois clique no script de novo.</div>'; return;
    }
    if (curGroup() !== act.id) { location.href = U('screen=overview_villages&mode=groups&type=dynamic&group=' + act.id); return; }
    var box = findBox(document); if (!box) { M.innerHTML = '<div class="w">Não achei o formulário de filtro nesta página.</div>'; return; }
    var nAt = act.d.rows.filter(ativa).length;
    var w = fillRows(box, act.d.rows); st.filled.push(act.d.n); save(st);
    if (!nAt) w.unshift('O texto copiado tem 0 filtros ativos para este grupo. O filtro do original estava vazio ou não foi lido.');
    else w.unshift(nAt + ' filtro(s) ativo(s) vieram no texto e foram marcados aqui.');
    M.innerHTML = '<div class="st">Filtro preenchido. <b>Confira e clique em Salvar grupo</b>; depois clique no script de novo.</div>' + w.map(function (x) { return '<div class="w">' + esc(x) + '</div>'; }).join('');
  }

  if (load()) { tab(2); passo(); }
})();
