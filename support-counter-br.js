/*
 * Contador de Apoios - versão PT-BR (CASTELO.GUERREIRO)
 * Baseado no "Support Counter Evolved" (RedAlert / mod JawJaw). Reescrito e ampliado.
 *
 * Novidades:
 *  - Filtro por GRUPO de aldeias (visão geral, mapa).
 *  - Na tela de uma aldeia: várias formas de retirar o apoio (porcentagem, tudo, quantidade,
 *    deixar X na aldeia, por população) + escolha de quais origens retiram primeiro.
 *
 * Segurança: o script NUNCA envia nada sozinho. Ele só marca/preenche os campos do próprio jogo;
 * quem clica no botão de retirar do jogo é você. Só faz requisições ao servidor do jogo.
 *
 * Uso na barra de acesso rápido:
 *   javascript:var HC_AMOUNT=4;$.getScript('https://cdn.jsdelivr.net/gh/castelo-guerreiro/tw-scripts@main/support-counter-br.js');void 0;
 *   (HC_AMOUNT = população que a cavalaria pesada ocupa no seu mundo; padrão 6)
 */
(function () {
  'use strict';
  var $ = window.jQuery;
  var AUTOR = 'CASTELO.GUERREIRO';
  var BANNER = 'data:image/jpeg;base64,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';
  var PREF = 'supportCounterBR';
  var FARM = { spear: 1, sword: 1, axe: 1, archer: 1, spy: 2, light: 4, marcher: 5, heavy: 6, ram: 5, catapult: 8, knight: 10, snob: 100, militia: 0 };
  var HC_POP = Number(window.HC_AMOUNT) > 0 ? Number(window.HC_AMOUNT) : FARM.heavy;
  FARM.heavy = HC_POP;
  var NOMES = { spear: 'Lanceiro', sword: 'Espadachim', axe: 'Machado', archer: 'Arqueiro', spy: 'Explorador', light: 'Cav. leve', marcher: 'Arq. a cavalo', heavy: 'Cav. pesada', ram: 'Ariete', catapult: 'Catapulta', knight: 'Paladino', snob: 'Nobre' };
  var DEFENSIVAS = ['spear', 'sword', 'archer', 'heavy'];

  window.__scIrPara = window.__scIrPara || function (u) { window.location.href = u; };

  // ---------------- utilidades ----------------
  function salvar(k, v) { try { localStorage.setItem(game_data.world + PREF + k, JSON.stringify(v)); } catch (e) {} }
  function ler(k, padrao) {
    try { var v = localStorage.getItem(game_data.world + PREF + k); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function curto(n) {
    if (n < 1000) return String(Math.round(n));
    if (n < 1e6) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return (n / 1e6).toFixed(2).replace(/0$/, '').replace(/\.0$/, '') + 'M';
  }
  function parametro(nome) { var m = new RegExp('[?&]' + nome + '=([^&#]*)').exec(window.location.search); return m ? decodeURIComponent(m[1]) : null; }
  function unidades() { return game_data.units.filter(function (u) { return u !== 'militia'; }); }
  function popDe(units) { var t = 0; Object.keys(units).forEach(function (u) { t += (units[u] || 0) * (FARM[u] || 0); }); return t; }
  function coord(texto) { var m = String(texto).match(/(\d{1,3})\|(\d{1,3})/g); if (!m) return null; var p = m[m.length - 1].split('|'); return [+p[0], +p[1]]; }
  function urlApoios(grupo) { return game_data.link_base_pure + 'overview_villages&mode=units&type=away_detail&group=' + (grupo || 0) + '&page=-1&filter_villages=1'; }
  function grupoSalvo() { var g = ler('_group', null); return g === null ? (parametro('group') || game_data.group_id || 0) : g; }

  // ---------------- painel ----------------
  var CSS = '' +
    '.sc{font-family:Verdana,Arial,sans-serif;font-size:12px;color:#2b2b2b;background:#f6efdc;border:2px solid #1f3b63;border-radius:6px;box-shadow:0 3px 14px rgba(0,0,0,.35);}' +
    '.sc *{box-sizing:border-box}' +
    '.sc .sc-h{display:flex;align-items:center;gap:8px;background:linear-gradient(#1f3b63,#16294a);color:#f0d27a;padding:6px 8px;cursor:move;border-radius:4px 4px 0 0}' +
    '.sc .sc-h img{height:34px;border-radius:3px;border:1px solid #f0d27a}' +
    '.sc .sc-h b{font-size:13px;display:block;color:#f0d27a}.sc .sc-h small{color:#d7dfee;font-size:10px}' +
    '.sc .sc-h .sc-bt{margin-left:auto;display:flex;gap:4px}' +
    '.sc .sc-x{background:#f0d27a;color:#16294a;border:0;border-radius:3px;width:22px;height:22px;cursor:pointer;font-weight:bold}' +
    '.sc .sc-b{padding:8px;max-height:75vh;overflow:auto}' +
    '.sc .sc-blk{background:#fffaf0;border:1px solid #c9b27a;border-radius:4px;padding:7px;margin-bottom:8px}' +
    '.sc .sc-blk h4{margin:0 0 5px;font-size:12px;color:#1f3b63}' +
    '.sc .sc-n{display:inline-block;background:#1f3b63;color:#f0d27a;border-radius:50%;width:18px;height:18px;text-align:center;line-height:18px;margin-right:5px;font-size:11px}' +
    '.sc .sc-dica{color:#6b6250;font-size:11px;margin:3px 0}' +
    '.sc table.sc-t{border-collapse:collapse;width:100%}' +
    '.sc table.sc-t th{background:#1f3b63 !important;color:#f0d27a !important;padding:3px 5px;font-size:11px;text-align:center}' +
    '.sc table.sc-t td{padding:3px 5px;border-bottom:1px solid #e3d6b0;text-align:center}' +
    '.sc table.sc-t td.l{text-align:left}' +
    '.sc table.sc-t tr:nth-child(even) td{background:#f4ead0}' +
    '.sc .sc-btn{background:#1f3b63;color:#f0d27a;border:0;border-radius:4px;padding:5px 10px;cursor:pointer;font-weight:bold;font-size:12px}' +
    '.sc .sc-btn.s{padding:2px 6px;font-size:11px}.sc .sc-btn.v{background:#9a2b2b;color:#fff}.sc .sc-btn.c{background:#7b6a3a;color:#fff}' +
    '.sc select,.sc input[type=text]{font-size:12px;padding:3px;border:1px solid #9c8a55;border-radius:3px;background:#fff}' +
    '.sc input[type=text]{width:70px}' +
    '.sc .sc-box>.sc-bh{background:#e3d1a1;padding:4px 6px;cursor:pointer;font-weight:bold;border:1px solid #c9b27a}' +
    '.sc .sc-box>.sc-bc{display:none;padding:5px;border:1px solid #c9b27a;border-top:0}' +
    '.sc .sc-box{margin-bottom:5px}' +
    '.sc .sc-u{display:inline-block;margin:2px 6px 2px 0;white-space:nowrap}' +
    '.sc .sc-mod label{display:block;margin:3px 0;cursor:pointer}' +
    '.sc .sc-ok{background:#e4f2dc;border:1px solid #8bb97a;border-radius:4px;padding:5px;margin-top:6px}' +
    '.sc .sc-destaque{outline:3px solid #e0a800;animation:scp 1s 4}@keyframes scp{50%{outline-color:#c0392b}}';

  function montarPainel(titulo, corpo, tipo) {
    $('#scPainel').remove();
    if (!$('#scCss').length) $('head').append('<style id="scCss">' + CSS + '</style>');
    var h = '<div id="scPainel" class="sc" style="' + (tipo === 'fixo' ? 'position:fixed;top:60px;right:10px;width:640px;max-width:96vw;z-index:12000' : 'margin:8px 0;width:100%') + '">' +
      '<div class="sc-h" id="scCab"><img src="' + BANNER + '" alt=""><div><b>' + esc(titulo) + '</b><small>por ' + AUTOR + '</small></div>' +
      '<div class="sc-bt"><button class="sc-x" id="scMin" title="Minimizar">–</button><button class="sc-x" id="scFechar" title="Fechar">✕</button></div></div>' +
      '<div class="sc-b" id="scCorpo">' + corpo + '</div></div>';
    if (tipo === 'fixo') $('body').append(h); else $('#content_value').prepend(h);
    $('#scFechar').on('click', function () { $('#scPainel').remove(); });
    $('#scMin').on('click', function () { $('#scCorpo').toggle(); });
    if (tipo === 'fixo') {
      var arr = false, ox = 0, oy = 0;
      $('#scCab').on('mousedown', function (e) { if ($(e.target).closest('button').length) return; arr = true; var p = $('#scPainel').offset(); ox = e.pageX - p.left; oy = e.pageY - p.top; e.preventDefault(); });
      $(document).on('mousemove.sc', function (e) { if (arr) $('#scPainel').css({ left: e.pageX - ox - $(window).scrollLeft(), top: e.pageY - oy - $(window).scrollTop(), right: 'auto' }); });
      $(document).on('mouseup.sc', function () { arr = false; });
    }
  }

  // ---------------- grupos ----------------
  function carregarGrupos(seletor, atual, aoMudar) {
    var $s = $(seletor);
    function preencher(lista) {
      var vistos = {}, html = '';
      lista.unshift({ id: 0, nome: 'Todas as aldeias' });
      lista.forEach(function (g) { if (vistos[g.id]) return; vistos[g.id] = 1; html += '<option value="' + g.id + '"' + (String(g.id) === String(atual) ? ' selected' : '') + '>' + esc(g.nome) + '</option>'; });
      $s.html(html);
    }
    preencher([]);
    $.get(game_data.link_base_pure + 'groups&mode=overview&ajax=load_group_menu', function (r) {
      try {
        var j = typeof r === 'string' ? JSON.parse(r) : r;
        var l = (j.result || []).filter(function (g) { return g.group_id !== undefined && g.name; }).map(function (g) { return { id: g.group_id, nome: g.name }; });
        preencher(l);
      } catch (e) {}
    });
    $s.on('change', function () { var g = $(this).val(); salvar('_group', g); aoMudar(g); });
  }

  // ---------------- cálculo dos apoios (tabela away_detail) ----------------
  function lerLinhaAldeia($cel) {
    if (!$cel.length) return {};
    var a = $cel.find('span.village_anchor > a').first();
    var cb = $cel.find('input[type=checkbox]').attr('name') || '';
    var mid = cb.match(/\d+/);
    var links = mid ? $cel.find('#label_text_' + mid[0] + ' > a').toArray() : [];
    return { texto: $cel.text(), jogador: $(links[0]).text(), tribo: $(links[1]).text(), url: a.attr('href'), nome: a.text().trim() };
  }
  function calcularApoio($tabela) {
    var jog = { pop: 0, tribos: {} }, barb = { pop: 0, aldeias: {} }, meu = { pop: 0, aldeias: {} };
    var us = game_data.units;
    $tabela.find('tbody tr').each(function () {
      var $r = $(this);
      if ($r.hasClass('units_away')) return;
      var tds = $r.find('td').toArray();
      var info = lerLinhaAldeia($(tds.shift()));
      if (!info.nome) return;
      var alvo;
      if (!info.jogador) alvo = info.texto.indexOf('(---)') !== -1 ? barb : meu;
      else {
        var t = jog.tribos[info.tribo] = jog.tribos[info.tribo] || { pop: 0, jogadores: {} };
        alvo = t.jogadores[info.jogador] = t.jogadores[info.jogador] || { pop: 0, aldeias: {} };
        alvo._tribo = t;
      }
      var v = alvo.aldeias[info.nome] = alvo.aldeias[info.nome] || { units: {}, pop: 0, url: info.url };
      for (var i = 1; i < tds.length - 1; i++) {
        var un = us[i - 1]; if (!un || un === 'militia') continue;
        var c = parseInt($(tds[i]).text(), 10) || 0;
        var p = c * (FARM[un] || 0);
        v.units[un] = (v.units[un] || 0) + c; v.pop += p; alvo.pop += p;
        if (alvo._tribo) { alvo._tribo.pop += p; jog.pop += p; }
      }
    });
    Object.keys(jog.tribos).forEach(function (t) { Object.keys(jog.tribos[t].jogadores).forEach(function (j) { delete jog.tribos[t].jogadores[j]._tribo; }); });
    return { jog: jog, barb: barb, meu: meu };
  }

  // ---------------- 1) visão geral dos apoios ----------------
  function tabelaAldeias(aldeias) {
    var nomes = Object.keys(aldeias).sort(function (a, b) { return aldeias[b].pop - aldeias[a].pop; });
    var us = unidades().filter(function (u) { return nomes.some(function (n) { return aldeias[n].units[u] > 0; }); });
    var h = '<table class="sc-t"><thead><tr><th>Aldeia</th>' + us.map(function (u) { return '<th>' + NOMES[u] + '</th>'; }).join('') + '<th>Pop.</th><th>Retirar</th></tr></thead><tbody>';
    nomes.forEach(function (n) {
      var v = aldeias[n];
      h += '<tr data-nome="' + esc(n) + '"><td class="l"><a href="' + esc(v.url || '#') + '">' + esc(n) + '</a></td>' +
        us.map(function (u) { return '<td>' + (v.units[u] ? num(v.units[u]) : '-') + '</td>'; }).join('') + '<td><b>' + num(v.pop) + '</b></td>' +
        '<td><button class="sc-btn s v sc-ret" title="Marca todo o apoio dessa aldeia na tabela do jogo">Marcar tudo</button> ' +
        '<a class="sc-btn s c" href="' + esc(v.url || '#') + '" title="Abre a aldeia para escolher QUAIS tropas e QUANTAS retirar">Escolher tropas</a></td></tr>';
    });
    return h + '</tbody></table><p style="text-align:right;margin:4px 0"><button class="sc-btn s v sc-ret-todas">Marcar todas desta lista</button></p>';
  }
  function caixa(titulo, pop, conteudo) {
    return '<div class="sc-box"><div class="sc-bh"><span class="sc-seta">▸</span> ' + titulo + ' <span style="float:right">' + num(pop) + ' pop.</span></div><div class="sc-bc">' + conteudo + '</div></div>';
  }
  function marcar(nomes) {
    var achou = 0;
    $('.village_anchor a').each(function () {
      if (nomes.indexOf($(this).text().trim()) === -1) return;
      var $r = $(this).closest('tr');
      var $c = $r.find('.village_checkbox, input[type=checkbox]').first();
      if ($c.length) { $c.prop('checked', true).trigger('change'); achou++; }
    });
    if (!achou) { UI.ErrorMessage('Não encontrei essas aldeias na tabela do jogo.'); return; }
    UI.SuccessMessage(achou + ' apoio(s) marcado(s). Agora clique no botão de retirar do jogo (abaixo da tabela).');
    var $b = $('form#overview_form input[type=submit], form#overview_form button[type=submit]').last();
    $('.sc-destaque').removeClass('sc-destaque');
    if ($b.length) { $b.addClass('sc-destaque'); $('html,body').animate({ scrollTop: $b.offset().top - 150 }, 300); }
  }
  function iniciarVisaoGeral() {
    var tabela = $('#units_table');
    if (!tabela.length) { UI.ErrorMessage('Tabela de apoios não encontrada. Talvez não haja apoio nesse grupo.'); }
    var ap = calcularApoio(tabela);
    var corpo = '<div class="sc-blk"><h4><span class="sc-n">1</span>Grupo de aldeias</h4>' +
      'Ver apoios das aldeias do grupo: <select id="scGrupo"></select>' +
      '<div class="sc-dica">Ao trocar o grupo, a página recarrega e você clica no script de novo.</div></div>';
    corpo += '<div class="sc-blk"><h4><span class="sc-n">2</span>Onde estão seus apoios (total: ' + num(ap.jog.pop + ap.barb.pop + ap.meu.pop) + ' pop.)</h4>';
    var itens = [];
    if (ap.meu.pop) itens.push({ pop: ap.meu.pop, h: caixa('Em aldeias minhas', ap.meu.pop, tabelaAldeias(ap.meu.aldeias)) });
    if (ap.barb.pop) itens.push({ pop: ap.barb.pop, h: caixa('Em aldeias bárbaras', ap.barb.pop, tabelaAldeias(ap.barb.aldeias)) });
    Object.keys(ap.jog.tribos).forEach(function (t) {
      var tr = ap.jog.tribos[t]; if (!tr.pop) return;
      var inner = '';
      Object.keys(tr.jogadores).sort(function (a, b) { return tr.jogadores[b].pop - tr.jogadores[a].pop; }).forEach(function (j) {
        inner += caixa(esc(j), tr.jogadores[j].pop, tabelaAldeias(tr.jogadores[j].aldeias));
      });
      itens.push({ pop: tr.pop, h: caixa('Tribo: ' + esc(t || 'sem tribo'), tr.pop, inner) });
    });
    itens.sort(function (a, b) { return b.pop - a.pop; });
    corpo += itens.length ? itens.map(function (i) { return i.h; }).join('') : '<p>Nenhum apoio enviado neste grupo.</p>';
    corpo += '<div class="sc-dica">"Marcar tudo" só marca a caixinha na tabela do jogo — quem confirma é você, no botão do jogo. ' +
      'Para retirar só alguns tipos de tropa ou uma parte, use "Escolher tropas".</div></div>';
    montarPainel('Contador de Apoios', corpo, 'inline');
    carregarGrupos('#scGrupo', grupoSalvo(), function (g) { window.__scIrPara(urlApoios(g)); });
    $('#scPainel').on('click', '.sc-bh', function () {
      var $c = $(this).next('.sc-bc'); $c.toggle(); $(this).find('.sc-seta').first().text($c.css('display') !== 'none' ? '▾' : '▸');
    });
    $('#scPainel').on('click', '.sc-ret', function () { marcar([$(this).closest('tr').data('nome')]); });
    $('#scPainel').on('click', '.sc-ret-todas', function () {
      var nomes = []; $(this).closest('.sc-bc').find('tbody tr').each(function () { nomes.push($(this).data('nome')); }); marcar(nomes);
    });
  }

  // ---------------- 2) mapa ----------------
  var mapaAldeias = [];
  function atualizarMapa(lista) {
    mapaAldeias = lista;
    if (!window.TWMap || !TWMap.mapHandler) return;
    var h = TWMap.mapHandler;
    if (!h._scOriginal) h._scOriginal = h.spawnSector;
    h.spawnSector = function (data, sector) {
      h._scOriginal.call(h, data, sector);
      var bx = sector.x - data.x, by = sector.y - data.y, f = TWMap.mapSubSectorSize || 5;
      for (var x in data.tiles) {
        x = parseInt(x, 10); if (x < bx || x >= bx + f) continue;
        for (var y in data.tiles[x]) {
          y = parseInt(y, 10); if (y < by || y >= by + f) continue;
          var v = TWMap.villages[(data.x + x) * 1000 + (data.y + y)]; if (!v) continue;
          var s = '' + v.xy, c = s.slice(0, 3) + '|' + s.slice(3, 6);
          var it = mapaAldeias.filter(function (a) { return a.coord === c; })[0]; if (!it) continue;
          var el = $('<div></div>').css({ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(31,59,99,.8)', color: '#f0d27a', width: '50px', height: '35px', zIndex: 10, fontSize: '10px', fontWeight: 'bold' }).attr('id', 'scm' + v.id).text(curto(it.pop));
          sector.appendElement(el[0], data.x + x - sector.x, data.y + y - sector.y);
        }
      }
    };
    if (TWMap.reload) TWMap.reload();
  }
  function listaDoMapa(ap) {
    var l = [];
    function add(al) { Object.keys(al).forEach(function (n) { var c = coord(n); if (c) l.push({ coord: c[0] + '|' + c[1], pop: al[n].pop, nome: n }); }); }
    add(ap.meu.aldeias); add(ap.barb.aldeias);
    Object.keys(ap.jog.tribos).forEach(function (t) { Object.keys(ap.jog.tribos[t].jogadores).forEach(function (j) { add(ap.jog.tribos[t].jogadores[j].aldeias); }); });
    l.sort(function (a, b) { return b.pop - a.pop; });
    return l;
  }
  function iniciarMapa() {
    var corpo = '<div class="sc-blk"><h4><span class="sc-n">1</span>Grupo</h4><select id="scGrupo"></select> <span class="sc-dica" id="scSt"></span></div>' +
      '<div class="sc-blk"><h4><span class="sc-n">2</span>Aldeias com seu apoio (população mostrada no mapa)</h4><div id="scLista" style="max-height:300px;overflow:auto"></div></div>';
    montarPainel('Contador de Apoios - Mapa', corpo, 'fixo');
    function carregar(g) {
      $('#scSt').text('Carregando...');
      $.get(urlApoios(g)).then(function (resp) {
        var doc = new DOMParser().parseFromString(resp, 'text/html');
        var ap = calcularApoio($(doc).find('#units_table'));
        var l = listaDoMapa(ap);
        var h = '<table class="sc-t"><thead><tr><th>Aldeia</th><th>Pop.</th></tr></thead><tbody>';
        l.forEach(function (a) { h += '<tr><td class="l"><a href="#" class="sc-foco" data-c="' + a.coord + '">' + esc(a.nome) + '</a></td><td>' + num(a.pop) + '</td></tr>'; });
        $('#scLista').html(h + '</tbody></table>');
        $('#scSt').text(l.length + ' aldeia(s)');
        atualizarMapa(l);
      }, function () { $('#scSt').text(''); UI.ErrorMessage('Erro ao buscar os apoios.'); });
    }
    $('#scPainel').on('click', '.sc-foco', function (e) { e.preventDefault(); var c = $(this).data('c').split('|'); if (window.TWMap && TWMap.focus) TWMap.focus(+c[0], +c[1]); });
    carregarGrupos('#scGrupo', grupoSalvo(), carregar);
    carregar(grupoSalvo());
  }

  // ---------------- 3) tela de uma aldeia: retirar apoio ----------------
  // distribui "alvo" unidades entre linhas com disponibilidade disp[], conforme a prioridade
  function distribuir(disp, alvo, prio, dist) {
    var n = disp.length, res = [], i, soma = 0;
    for (i = 0; i < n; i++) { res.push(0); soma += disp[i]; }
    alvo = Math.max(0, Math.min(Math.floor(alvo), soma));
    if (!alvo) return res;
    if (prio === 'igual') {
      var rest = alvo, ativos = disp.map(function (d, k) { return k; }).filter(function (k) { return disp[k] > 0; });
      while (rest > 0 && ativos.length) {
        var cota = Math.floor(rest / ativos.length), dado = 0;
        if (cota === 0) {
          ativos.sort(function (a, b) { return (disp[b] - res[b]) - (disp[a] - res[a]); });
          for (i = 0; i < ativos.length && rest > 0; i++) { res[ativos[i]]++; rest--; }
          break;
        }
        ativos.forEach(function (k) { var t = Math.min(cota, disp[k] - res[k]); res[k] += t; dado += t; });
        rest -= dado;
        ativos = ativos.filter(function (k) { return res[k] < disp[k]; });
      }
      return res;
    }
    var ordem = disp.map(function (d, k) { return k; });
    ordem.sort(function (a, b) {
      if (prio === 'longe') return dist[b] - dist[a];
      if (prio === 'perto') return dist[a] - dist[b];
      return disp[b] - disp[a];
    });
    var r = alvo;
    ordem.forEach(function (k) { var t = Math.min(disp[k], r); res[k] = t; r -= t; });
    return res;
  }

  // linhas: [{disp:{unit:n}, dist:n}]; retorna [{unit:n}] por linha
  function planejar(linhas, escolhidas, cfg) {
    var out = linhas.map(function () { return {}; });
    var tot = {}, popEsc = 0;
    escolhidas.forEach(function (u) { tot[u] = 0; linhas.forEach(function (l) { tot[u] += l.disp[u] || 0; }); popEsc += tot[u] * (FARM[u] || 0); });
    var v = Math.max(0, Number(cfg.valor) || 0);
    var frac = 1;
    if (cfg.modo === 'pop') frac = popEsc > 0 ? Math.min(1, v / popEsc) : 0;
    escolhidas.forEach(function (u) {
      var disp = linhas.map(function (l) { return l.disp[u] || 0; });
      var dist = linhas.map(function (l) { return l.dist || 0; });
      var res;
      if (cfg.modo === 'pct') res = disp.map(function (d) { return Math.floor(d * Math.min(v, 100) / 100); });
      else if (cfg.modo === 'tudo') res = disp.slice();
      else {
        var alvo;
        if (cfg.modo === 'qtd') alvo = v;
        else if (cfg.modo === 'deixar') alvo = tot[u] - v;
        else alvo = Math.floor(tot[u] * frac);
        res = distribuir(disp, alvo, cfg.prio, dist);
      }
      res.forEach(function (q, i) { out[i][u] = q; });
    });
    return out;
  }

  function iniciarTelaAldeia() {
    var $tab = $('#withdraw_selected_units_village_info');
    if (!$tab.length) { UI.ErrorMessage('Você não tem apoio nessa aldeia.'); return; }
    var alvoC = coord($('#content_value h2').first().text()) || coord($('#content_value').text());
    var $linhas = $tab.find('tr').filter(function () { return $(this).find('.troop-request-selector[name^="withdraw_unit"]').length > 0; });
    if (!$linhas.length) $linhas = $tab.find('tr').filter(function () { return $(this).find('.troop-request-selector').length && !$(this).find('.troop-request-selector[name^="send_back"]').length && $(this).find('td').eq(0).find('a').length; });
    if (!$linhas.length) { UI.ErrorMessage('Não achei linhas de apoio seu nessa aldeia.'); return; }

    var us = unidades();
    var linhas = [];
    $linhas.each(function () {
      var $r = $(this), disp = {};
      $r.find('td.has-input').each(function () {
        var $td = $(this), u = $td.attr('id'), $b = $td.find('.call-unit-box');
        if ($td.data('scDisp') === undefined) {
          var d = parseInt($td.text(), 10);
          if (isNaN(d)) d = parseInt($b.attr('max'), 10);
          if (isNaN(d)) d = parseInt($b.val(), 10) || 0;
          $td.data('scDisp', d);
        }
        disp[u] = $td.data('scDisp');
      });
      var oc = coord($r.find('td').eq(0).text());
      var dist = (oc && alvoC) ? Math.sqrt(Math.pow(oc[0] - alvoC[0], 2) + Math.pow(oc[1] - alvoC[1], 2)) : 0;
      linhas.push({ $r: $r, disp: disp, dist: dist });
    });
    var totais = {};
    us.forEach(function (u) { totais[u] = 0; linhas.forEach(function (l) { totais[u] += l.disp[u] || 0; }); });
    var presentes = us.filter(function (u) { return totais[u] > 0; });

    var cfg = ler('_withdraw_cfg', { modo: 'pct', valor: 50, prio: 'igual' });
    var salvas = ler('_chosen_units', ['spear', 'sword']);
    var escolhidasIni = presentes.filter(function (u) { return salvas.indexOf(u) !== -1; });

    var corpo = '<div class="sc-blk"><h4><span class="sc-n">1</span>Quais tropas retirar?</h4><div id="scUn">' +
      presentes.map(function (u) { return '<label class="sc-u"><input type="checkbox" class="sc-un" value="' + u + '"' + (escolhidasIni.indexOf(u) !== -1 ? ' checked' : '') + '> ' + NOMES[u] + ' (' + num(totais[u]) + ')</label>'; }).join('') + '</div>' +
      '<div><button class="sc-btn s c" id="scDef">Só defensivas</button> <button class="sc-btn s c" id="scTodas">Todas</button> <button class="sc-btn s c" id="scNenhuma">Nenhuma</button></div></div>' +
      '<div class="sc-blk sc-mod"><h4><span class="sc-n">2</span>Quanto retirar?</h4>' +
      '<label><input type="radio" name="scModo" value="pct"> <b>Porcentagem</b> de cada tropa escolhida <span class="sc-dica">(ex.: 50 = metade de tudo)</span></label>' +
      '<label><input type="radio" name="scModo" value="tudo"> <b>Tudo</b> das tropas escolhidas</label>' +
      '<label><input type="radio" name="scModo" value="qtd"> <b>Quantidade</b> total de cada tropa escolhida <span class="sc-dica">(ex.: 2000 lanceiros no total)</span></label>' +
      '<label><input type="radio" name="scModo" value="deixar"> <b>Deixar</b> X de cada tropa na aldeia <span class="sc-dica">(retira o resto)</span></label>' +
      '<label><input type="radio" name="scModo" value="pop"> Retirar por <b>população</b> <span class="sc-dica">(ex.: 5000 = o equivalente a 5.000 de pop., na mesma proporção das tropas escolhidas)</span></label>' +
      '<div style="margin-top:4px">Valor: <input type="text" id="scValor" value="' + esc(cfg.valor) + '"></div></div>' +
      '<div class="sc-blk"><h4><span class="sc-n">3</span>De quais origens retirar primeiro?</h4>' +
      '<select id="scPrio"><option value="igual">Dividir igualmente entre as origens</option><option value="longe">Das mais longes primeiro</option><option value="perto">Das mais perto primeiro</option><option value="maior">Das que têm mais tropas primeiro</option></select>' +
      '<div class="sc-dica">Vale para "Quantidade", "Deixar" e "População". Porcentagem e Tudo atingem todas as origens igualmente.</div></div>' +
      '<div><button class="sc-btn" id="scAplicar">Calcular e preencher</button> <button class="sc-btn c" id="scLimpar">Limpar seleção</button></div>' +
      '<div class="sc-ok" id="scResumo">O script só preenche os campos. Depois confira e clique no botão de retirar do jogo.</div>' +
      '<div id="scTot" style="margin-top:6px"></div>';
    montarPainel('Contador de Apoios - Retirar apoio', corpo, 'fixo');
    $('input[name=scModo][value=' + cfg.modo + ']').prop('checked', true);
    $('#scPrio').val(cfg.prio);

    function escolhidas() { return $('.sc-un:checked').map(function () { return this.value; }).get(); }
    function selecionadoAgora() {
      var s = {}; us.forEach(function (u) { s[u] = 0; });
      linhas.forEach(function (l) {
        if (!l.$r.find('.troop-request-selector').first().prop('checked')) return;
        l.$r.find('td.has-input').each(function () { var u = $(this).attr('id'); s[u] += parseInt($(this).find('.call-unit-box').val(), 10) || 0; });
      });
      return s;
    }
    function mostrarTotais() {
      var sel = selecionadoAgora(), h = '<table class="sc-t"><thead><tr><th></th>' + presentes.map(function (u) { return '<th>' + NOMES[u] + '</th>'; }).join('') + '<th>Pop.</th></tr></thead><tbody>';
      function lin(t, o) { return '<tr><td class="l"><b>' + t + '</b></td>' + presentes.map(function (u) { return '<td>' + num(o[u] || 0) + '</td>'; }).join('') + '<td><b>' + num(popDe(o)) + '</b></td></tr>'; }
      var resta = {}; us.forEach(function (u) { resta[u] = totais[u] - sel[u]; });
      $('#scTot').html(h + lin('Total lá', totais) + lin('Retirando', sel) + lin('Vai ficar', resta) + '</tbody></table>');
    }
    function aplicar() {
      var esc_ = escolhidas();
      if (!esc_.length) { UI.ErrorMessage('Escolha pelo menos uma tropa.'); return; }
      var modo = $('input[name=scModo]:checked').val() || 'pct';
      var valor = parseFloat(String($('#scValor').val()).replace(/\./g, '').replace(',', '.'));
      if (!(valor >= 0) || (modo === 'pct' && (valor <= 0 || valor > 100)) || ((modo === 'qtd' || modo === 'pop') && valor <= 0)) { UI.ErrorMessage('Valor inválido para esse modo.'); return; }
      var c = { modo: modo, valor: valor, prio: $('#scPrio').val() };
      salvar('_withdraw_cfg', c); salvar('_chosen_units', esc_);
      var plano = planejar(linhas.map(function (l) { return { disp: l.disp, dist: l.dist }; }), esc_, c);
      linhas.forEach(function (l, i) {
        var algum = false;
        l.$r.find('td.has-input').each(function () {
          var u = $(this).attr('id'), q = esc_.indexOf(u) !== -1 ? (plano[i][u] || 0) : 0;
          if (q > 0) algum = true;
          $(this).find('.call-unit-box').val(q);
        });
        var $cb = l.$r.find('.troop-request-selector').first();
        $cb.prop('checked', algum).trigger('change');
        // o jogo pode ter resetado os campos ao marcar: reaplica
        l.$r.find('td.has-input').each(function () {
          var u = $(this).attr('id'), q = esc_.indexOf(u) !== -1 ? (plano[i][u] || 0) : 0;
          $(this).find('.call-unit-box').val(q);
        });
      });
      mostrarTotais();
      var sel = selecionadoAgora();
      $('#scResumo').html('Preenchido: <b>' + num(popDe(sel)) + '</b> de população em ' + linhas.filter(function (l) { return l.$r.find('.troop-request-selector').first().prop('checked'); }).length + ' origem(ns). <b>Agora clique no botão de retirar do jogo.</b>');
      var $b = $('#withdraw_selected_units_village_info input[type=submit], #withdraw_selected_units_village_info button[type=submit]').last();
      $('.sc-destaque').removeClass('sc-destaque'); if ($b.length) $b.addClass('sc-destaque');
    }
    $('#scAplicar').on('click', aplicar);
    $('#scLimpar').on('click', function () {
      linhas.forEach(function (l) { l.$r.find('.troop-request-selector').first().prop('checked', false).trigger('change'); });
      mostrarTotais(); $('#scResumo').text('Seleção limpa.');
    });
    $('#scDef').on('click', function () { $('.sc-un').each(function () { $(this).prop('checked', DEFENSIVAS.indexOf(this.value) !== -1); }); });
    $('#scTodas').on('click', function () { $('.sc-un').prop('checked', true); });
    $('#scNenhuma').on('click', function () { $('.sc-un').prop('checked', false); });
    $tab.on('change input', '.troop-request-selector, .call-unit-box', mostrarTotais);
    mostrarTotais();
  }

  // ---------------- entrada ----------------
  var tela = parametro('screen'), modo = parametro('mode'), tipo = parametro('type'), id = parametro('id');
  if (tela === 'overview_villages' && modo === 'units' && tipo === 'away_detail') iniciarVisaoGeral();
  else if (tela === 'map') iniciarMapa();
  else if (tela === 'info_village' && id) iniciarTelaAldeia();
  else { UI.InfoMessage('Indo para a lista de apoios. Clique no script de novo lá.'); setTimeout(function () { window.__scIrPara(urlApoios(grupoSalvo())); }, 600); }

  // exposto para testes
  window.__scTeste = { distribuir: distribuir, planejar: planejar, calcularApoio: calcularApoio };
})();
