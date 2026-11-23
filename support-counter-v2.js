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
  var TRIBO = 'Os Nômades';
  var SIGLA = 'OND';
  var MUNDO = String(game_data.world || 'br143').toUpperCase();
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
    '.sc{font-family:Verdana,Arial,sans-serif;font-size:12px;color:#2b2b2b;background:#f6efdc;border:2px solid #3a322a;border-radius:6px;box-shadow:0 3px 14px rgba(0,0,0,.35);}' +
    '.sc *{box-sizing:border-box}' +
    '.sc .sc-h{display:flex;align-items:center;gap:8px;background:linear-gradient(#3a322a,#221d18);color:#e6cd94;padding:6px 8px;cursor:move;border-radius:4px 4px 0 0}' +
    '.sc .sc-h img{height:34px;border-radius:3px;border:1px solid #e6cd94}' +
    '.sc .sc-h b{font-size:13px;display:block;color:#e6cd94}.sc .sc-h small{color:#d7dfee;font-size:10px}' +
    '.sc .sc-h .sc-bt{margin-left:auto;display:flex;gap:4px}' +
    '.sc .sc-x{background:#e6cd94;color:#221d18;border:0;border-radius:3px;width:22px;height:22px;cursor:pointer;font-weight:bold}' +
    '.sc .sc-b{padding:8px;max-height:75vh;overflow:auto}' +
    '.sc .sc-blk{background:#fffaf0;border:1px solid #c9b27a;border-radius:4px;padding:7px;margin-bottom:8px}' +
    '.sc .sc-blk h4{margin:0 0 5px;font-size:12px;color:#3a322a}' +
    '.sc .sc-n{display:inline-block;background:#3a322a;color:#e6cd94;border-radius:50%;width:18px;height:18px;text-align:center;line-height:18px;margin-right:5px;font-size:11px}' +
    '.sc .sc-dica{color:#6b6250;font-size:11px;margin:3px 0}' +
    '.sc table.sc-t{border-collapse:collapse;width:100%}' +
    '.sc table.sc-t th{background:#3a322a !important;color:#e6cd94 !important;padding:3px 5px;font-size:11px;text-align:center}' +
    '.sc table.sc-t td{padding:3px 5px;border-bottom:1px solid #e3d6b0;text-align:center}' +
    '.sc table.sc-t td.l{text-align:left}' +
    '.sc table.sc-t tr:nth-child(even) td{background:#f4ead0}' +
    '.sc .sc-btn{background:#3a322a;color:#e6cd94;border:0;border-radius:4px;padding:5px 10px;cursor:pointer;font-weight:bold;font-size:12px}' +
    '.sc .sc-btn.s{padding:2px 6px;font-size:11px}.sc .sc-btn.v{background:#9a2b2b;color:#fff}.sc .sc-btn.c{background:#7b6a3a;color:#fff}' +
    '.sc select,.sc input[type=text]{font-size:12px;padding:3px;border:1px solid #9c8a55;border-radius:3px;background:#fff}' +
    '.sc input[type=text]{width:70px}' +
    '.sc .sc-box>.sc-bh{background:#e3d1a1;padding:4px 6px;cursor:pointer;font-weight:bold;border:1px solid #c9b27a}' +
    '.sc .sc-box>.sc-bc{display:none;padding:5px;border:1px solid #c9b27a;border-top:0}' +
    '.sc .sc-box{margin-bottom:5px}' +
    '.sc .sc-u{display:inline-block;margin:2px 6px 2px 0;white-space:nowrap}' +
    '.sc .sc-mod label{display:block;margin:3px 0;cursor:pointer}' +
    '.sc .sc-ok{background:#e4f2dc;border:1px solid #8bb97a;border-radius:4px;padding:5px;margin-top:6px}' +
    '.sc{border:3px solid #6b5a43;box-shadow:0 0 0 2px #1c1814,0 0 0 4px #a28c5c,0 4px 18px rgba(0,0,0,.45);background:#f4ecd8}' +
    '.sc .sc-h{background:linear-gradient(#4d4236,#221d18);border-bottom:2px solid #a28c5c;padding:7px 10px}' +
    '.sc .sc-h img{height:50px;width:50px;border-radius:50%;border:2px solid #b8a06a;box-shadow:0 0 0 2px #1c1814,0 2px 6px rgba(0,0,0,.6)}' +
    '.sc .sc-h b{font-size:14px;letter-spacing:.3px;text-shadow:0 1px 2px #000}' +
    '.sc .sc-chip{display:inline-block;background:#8b2a22;color:#fff;border-radius:9px;padding:0 8px;font-size:10px;margin-left:8px;vertical-align:middle;border:1px solid #c9a24a}' +
    '.sc .sc-corrente{height:7px;background:repeating-linear-gradient(90deg,#9a9a9a 0 9px,#2d2a27 9px 13px);border-bottom:1px solid #1c1814}' +
    '.sc .sc-rodape{margin-top:2px;padding:5px;text-align:center;font-size:10px;letter-spacing:1px;color:#e6cd94;background:linear-gradient(#3a322a,#221d18);border-radius:3px;border:1px solid #a28c5c}' +
    '.sc .sc-n{background:#8b2a22;color:#fff;border:1px solid #c9a24a}' +
    '.sc .sc-blk{border-left:4px solid #8b2a22}' +
    '.sc .sc-destaque{outline:3px solid #e0a800;animation:scp 1s 4}@keyframes scp{50%{outline-color:#c0392b}}';

  function montarPainel(titulo, corpo, tipo) {
    $('#scPainel').remove();
    if (!$('#scCss').length) $('head').append('<style id="scCss">' + CSS + '</style>');
    var h = '<div id="scPainel" class="sc" style="' + (tipo === 'fixo' ? 'position:fixed;top:60px;right:10px;width:640px;max-width:96vw;z-index:12000' : 'margin:8px 0;width:100%') + '">' +
      '<div class="sc-h" id="scCab"><img src="' + BANNER + '" alt=""><div><b>' + esc(titulo) + '<span class="sc-chip">' + MUNDO + '</span></b><small>' + TRIBO + ' \u2022 ' + SIGLA + ' \u2014 por ' + AUTOR + '</small></div>' +
      '<div class="sc-bt"><button class="sc-x" id="scMin" title="Minimizar">–</button><button class="sc-x" id="scFechar" title="Fechar">✕</button></div></div>' +
      '<div class="sc-corrente"></div><div class="sc-b" id="scCorpo">' + corpo + '<div class="sc-rodape">\u2694 ' + TRIBO.toUpperCase() + ' \u2022 ' + SIGLA + ' \u2694 &nbsp; MUNDO ' + MUNDO + ' &nbsp; \u2022 &nbsp; ' + AUTOR + '</div></div></div>';
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
  function carregarGrupos(seletor, atual, aoMudar, semSalvar) {
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
    $s.on('change', function () { var g = $(this).val(); if (!semSalvar) salvar('_group', g); aoMudar(g); });
  }

  // coordenadas das aldeias de um grupo (para filtrar origens). cb(set|null)
  function coordsDoGrupo(g, cb) {
    function extrair(txt) { var set = {}, m = String(txt).match(/\d{1,3}\|\d{1,3}/g) || []; m.forEach(function (c) { set[c] = 1; }); return m.length ? set : null; }
    function plano2() {
      $.get(game_data.link_base_pure + 'overview_villages&mode=combined&group=' + g + '&page=-1').then(function (r) {
        var d = new DOMParser().parseFromString(r, 'text/html');
        var t = $(d).find('#combined_table, #overview_villages, #production_table').text() || $(d).find('#content_value').text();
        cb(extrair(t));
      }, function () { cb(null); });
    }
    try {
      $.post(game_data.link_base_pure + 'groups&ajax=load_villages_from_group', { group_id: g, h: game_data.csrf }).then(function (r) {
        var html = r; try { var j = typeof r === 'string' ? JSON.parse(r) : r; if (j && j.html) html = j.html; } catch (e) {}
        var st = extrair(html); if (st) cb(st); else plano2();
      }, plano2);
    } catch (e) { plano2(); }
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
          var el = $('<div></div>').css({ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(31,59,99,.8)', color: '#e6cd94', width: '50px', height: '35px', zIndex: 10, fontSize: '10px', fontWeight: 'bold' }).attr('id', 'scm' + v.id).text(curto(it.pop));
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
    // linhas de apoio MEU: seletor na linha e só 1 link na primeira célula (a aldeia de origem; apoio de outro jogador tem 2 links)
    var $linhas = $tab.find('tr').filter(function () { return $(this).find('.troop-request-selector').length > 0 && $(this).find('td').eq(0).find('a').length === 1; });
    if (!$linhas.length) $linhas = $tab.find('tr').filter(function () { return $(this).find('.troop-request-selector[name^="withdraw_unit"]').length > 0; });
    if (!$linhas.length) { UI.ErrorMessage('Não achei linhas de apoio seu nessa aldeia.'); return; }

    var us = unidades();
    var linhas = [];
    function unidadeDaCelula($td, i) {
      var u = $td.attr('id');
      if (u && FARM.hasOwnProperty(u)) return u;
      var m = ($td.attr('class') || '').match(/unit-item-(\w+)/);
      if (m && FARM.hasOwnProperty(m[1])) return m[1];
      u = $td.attr('data-unit'); if (u && FARM.hasOwnProperty(u)) return u;
      var nm = ($td.find('input').attr('name') || '') + ' ' + ($td.find('input').attr('class') || '');
      for (var k = 0; k < us.length; k++) { if (new RegExp('(^|[^a-z])' + us[k] + '([^a-z]|$)').test(nm)) return us[k]; }
      return game_data.units[i - 1] || null;
    }
    function celulaDe($r, idx) { return $r.find('td').eq(idx); }
    function campoDe($r, idx) { var $td = celulaDe($r, idx), $b = $td.find('.call-unit-box').first(); if (!$b.length) $b = $td.find('input[type=number], input[type=text]').first(); return $b; }
    function numeroDe(x) { var n = parseInt(String(x === undefined || x === null ? '' : x).replace(/\./g, '').replace(/[^\d]/g, ''), 10); return isNaN(n) ? null : n; }
    // Lê as quantidades de uma origem. O jogo troca o NÚMERO por um CAMPO quando a linha está marcada,
    // então marcamos/desmarcamos a linha só para ler e devolvemos o estado original.
    function lerLinha($r) {
      var $cb = $r.find('.troop-request-selector').first(), estava = $cb.prop('checked');
      var tds = $r.find('td').toArray(), res = { disp: {}, idx: {} }, porCampo = {}, porTexto = {};
      function colher(alvo, comCampo) {
        $r.find('td').each(function (i) {
          if (i < 1 || i > game_data.units.length) return;
          var $td = $(this), u = unidadeDaCelula($td, i);
          if (!u || u === 'militia') return;
          res.idx[u] = i;
          var v = null;
          if (comCampo) {
            var $b = campoDe($r, i);
            if ($b.length) v = numeroDe($td.attr('data-all-count')) || numeroDe($b.attr('data-all-count')) || numeroDe($b.attr('max')) || numeroDe($b.val());
          } else {
            var $c = $td.clone(); $c.find('input').remove(); v = numeroDe($c.text());
          }
          if (v !== null) alvo[u] = v;
        });
      }
      if (estava) { colher(porCampo, true); $cb.prop('checked', false).trigger('change'); }
      colher(porTexto, false);
      if (!estava) { $cb.prop('checked', true).trigger('change'); colher(porCampo, true); $cb.prop('checked', false).trigger('change'); }
      else $cb.prop('checked', true).trigger('change');
      Object.keys(res.idx).forEach(function (u) {
        var t = porTexto[u], c = porCampo[u];
        res.disp[u] = (t !== undefined && (t > 0 || c === undefined)) ? t : (c || 0);
      });
      return res;
    }
    $linhas.each(function () {
      var $r = $(this), info = lerLinha($r);
      var oc = coord($r.find('td').eq(0).text());
      var dist = (oc && alvoC) ? Math.sqrt(Math.pow(oc[0] - alvoC[0], 2) + Math.pow(oc[1] - alvoC[1], 2)) : 0;
      linhas.push({ $r: $r, disp: info.disp, idx: info.idx, dist: dist, ativa: true });
    });
    function camposDa(l) { return Object.keys(l.idx).map(function (u) { return { u: u, $b: campoDe(l.$r, l.idx[u]) }; }); }
    var totais = {};
    function recalcular() { us.forEach(function (u) { totais[u] = 0; linhas.forEach(function (l) { if (l.ativa) totais[u] += l.disp[u] || 0; }); }); }
    recalcular();
    var presentes = us.filter(function (u) { return totais[u] > 0; });
    if (!presentes.length) { UI.ErrorMessage('Não consegui ler as quantidades de tropas dessa tabela. Me mande um print do F12 (Elements) de uma linha da tabela.'); console.log('[Contador] linhas:', linhas.length, $linhas.first().prop('outerHTML')); }

    var cfg = ler('_withdraw_cfg', { modo: 'pct', valor: 50, prio: 'igual' });
    var salvas = ler('_chosen_units', ['spear', 'sword']);
    var escolhidasIni = presentes.filter(function (u) { return salvas.indexOf(u) !== -1; });
    if (!escolhidasIni.length) escolhidasIni = presentes.filter(function (u) { return DEFENSIVAS.indexOf(u) !== -1; });
    if (!escolhidasIni.length) escolhidasIni = presentes.slice();

    var corpo = '<div class="sc-blk"><h4><span class="sc-n">1</span>Usar tropas de quais aldeias?</h4>' +
      '<select id="scGrupoOrig"></select> <span class="sc-dica" id="scGrupoInfo">Todas as ' + linhas.length + ' origens.</span>' +
      '<div class="sc-dica">Escolha um grupo para retirar só as tropas das aldeias desse grupo (as outras origens ficam de fora).</div></div>' +
      '<div class="sc-blk"><h4><span class="sc-n">2</span>Quais tropas retirar?</h4><div id="scUn">' +
      presentes.map(function (u) { return '<label class="sc-u"><input type="checkbox" class="sc-un" value="' + u + '"' + (escolhidasIni.indexOf(u) !== -1 ? ' checked' : '') + '> ' + NOMES[u] + ' (<span class="sc-q" data-u="' + u + '">' + num(totais[u]) + '</span>)</label>'; }).join('') + '</div>' +
      '<div><button class="sc-btn s c" id="scDef">Só defensivas</button> <button class="sc-btn s c" id="scTodas">Todas</button> <button class="sc-btn s c" id="scNenhuma">Nenhuma</button></div></div>' +
      '<div class="sc-blk sc-mod"><h4><span class="sc-n">3</span>Quanto retirar?</h4>' +
      '<label><input type="radio" name="scModo" value="pct"> <b>Porcentagem</b> de cada tropa escolhida <span class="sc-dica">(ex.: 50 = metade de tudo)</span></label>' +
      '<label><input type="radio" name="scModo" value="tudo"> <b>Tudo</b> das tropas escolhidas</label>' +
      '<label><input type="radio" name="scModo" value="qtd"> <b>Quantidade</b> total de cada tropa escolhida <span class="sc-dica">(ex.: 2000 lanceiros no total)</span></label>' +
      '<label><input type="radio" name="scModo" value="deixar"> <b>Deixar</b> X de cada tropa na aldeia <span class="sc-dica">(retira o resto)</span></label>' +
      '<label><input type="radio" name="scModo" value="pop"> Retirar por <b>população</b> <span class="sc-dica">(ex.: 5000 = o equivalente a 5.000 de pop., na mesma proporção das tropas escolhidas)</span></label>' +
      '<div style="margin-top:4px">Valor: <input type="text" id="scValor" value="' + esc(cfg.valor) + '"></div></div>' +
      '<div class="sc-blk"><h4><span class="sc-n">4</span>De quais origens retirar primeiro?</h4>' +
      '<select id="scPrio"><option value="igual">Dividir igualmente entre as origens</option><option value="longe">Das mais longes primeiro</option><option value="perto">Das mais perto primeiro</option><option value="maior">Das que têm mais tropas primeiro</option></select>' +
      '<div class="sc-dica">Vale para "Quantidade", "Deixar" e "População". Porcentagem e Tudo atingem todas as origens igualmente.</div></div>' +
      '<div><button class="sc-btn" id="scAplicar">Calcular e preencher</button> <button class="sc-btn c" id="scLimpar">Limpar seleção</button></div>' +
      '<div class="sc-ok" id="scResumo">O script só preenche os campos. Depois confira e clique no botão de retirar do jogo.</div>' +
      '<div id="scTot" style="margin-top:6px"></div>';
    montarPainel('Contador de Apoios - Retirar apoio', corpo, 'fixo');
    $('input[name=scModo][value=' + cfg.modo + ']').prop('checked', true);
    $('#scPrio').val(cfg.prio);
    function atualizarAposGrupo(n) {
      recalcular();
      $('.sc-q').each(function () { $(this).text(num(totais[$(this).data('u')] || 0)); });
      $('#scGrupoInfo').text(n === null ? 'Todas as ' + linhas.length + ' origens.' : n + ' de ' + linhas.length + ' origens fazem parte do grupo.');
      linhas.forEach(function (l) { if (!l.ativa) l.$r.find('.troop-request-selector').first().prop('checked', false).trigger('change'); });
      mostrarTotais();
    }
    function aplicarGrupo(g) {
      if (!g || String(g) === '0') { linhas.forEach(function (l) { l.ativa = true; }); atualizarAposGrupo(null); return; }
      $('#scGrupoInfo').text('Carregando o grupo...');
      coordsDoGrupo(g, function (set) {
        if (!set) { $('#scGrupoInfo').text('Não consegui ler esse grupo.'); UI.ErrorMessage('Não consegui ler as aldeias desse grupo.'); return; }
        var n = 0;
        linhas.forEach(function (l) { var c = coord(l.$r.find('td').eq(0).text()); l.ativa = !!(c && set[c[0] + '|' + c[1]]); if (l.ativa) n++; });
        atualizarAposGrupo(n);
      });
    }
    carregarGrupos('#scGrupoOrig', 0, aplicarGrupo, true);

    function escolhidas() { return $('.sc-un:checked').map(function () { return this.value; }).get(); }
    function selecionadoAgora() {
      var s = {}; us.forEach(function (u) { s[u] = 0; });
      linhas.forEach(function (l) {
        if (!l.$r.find('.troop-request-selector').first().prop('checked')) return;
        camposDa(l).forEach(function (c) { s[c.u] += parseInt(c.$b.val(), 10) || 0; });
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
      var plano = planejar(linhas.map(function (l) { return { disp: l.ativa ? l.disp : {}, dist: l.dist }; }), esc_, c);
      linhas.forEach(function (l, i) {
        var algum = false;
        Object.keys(l.idx).forEach(function (u) { if (esc_.indexOf(u) !== -1 && (plano[i][u] || 0) > 0) algum = true; });
        var $cb = l.$r.find('.troop-request-selector').first();
        $cb.prop('checked', algum).trigger('change');
        camposDa(l).forEach(function (c) { c.$b.val(esc_.indexOf(c.u) !== -1 ? (plano[i][c.u] || 0) : 0).trigger('input'); });
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
