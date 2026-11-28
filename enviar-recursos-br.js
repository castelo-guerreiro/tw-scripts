/*
 * Enviar Recursos para Cunhagem - versão PT-BR (CASTELO.GUERREIRO / OND / BR143)
 * Baseado em "Resource sender for flag boost minting" (Sophie "Shinko to Kuma"). Reescrito.
 *
 * O que melhora em relação ao original:
 *  - Lê a tabela de produção linha por linha (o original assumia que todas as colunas tinham o mesmo
 *    tamanho; quando uma aldeia fugia do padrão, tudo desalinhava e aldeias sumiam / vinham com comerciantes errados).
 *  - Mostra TODAS as aldeias do grupo escolhido; as que ficaram de fora aparecem numa lista com o motivo.
 *  - Não deixa comerciante parado: depois de montar a proporção de cunhagem, a SOBRA de capacidade
 *    é preenchida com o que ainda existe no armazém (opção marcada por padrão).
 *  - Filtro por grupo sem trocar de página, reserva (%) do armazém, mínimo por envio e ordenação.
 *
 * Segurança: o script NUNCA envia sozinho. Cada envio acontece quando VOCÊ clica em "Enviar" de uma aldeia
 * (um clique = um envio, como no original). Só fala com o servidor do jogo.
 *
 * Barra de acesso rápido:
 *   javascript:$.getScript('https://cdn.jsdelivr.net/gh/castelo-guerreiro/tw-scripts@main/enviar-recursos-br.js');void 0;
 */
(function () {
  'use strict';
  var $ = window.jQuery;
  var AUTOR = 'CASTELO.GUERREIRO';
  var TRIBO = 'Os Nômades';
  var SIGLA = 'OND';
  var MUNDO = String(game_data.world || 'br143').toUpperCase();
  var BANNER = 'data:image/jpeg;base64,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';
  var PREF = 'enviarRecursosBR';

  function salvar(k, v) { try { localStorage.setItem(game_data.world + PREF + k, JSON.stringify(v)); } catch (e) {} }
  function ler(k, padrao) {
    try { var v = localStorage.getItem(game_data.world + PREF + k); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
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

  function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function dig(x) { var n = parseInt(String(x === undefined || x === null ? '' : x).replace(/[^\d]/g, ''), 10); return isNaN(n) ? 0 : n; }
  function coordTxt(x) { var m = String(x).match(/\d{1,3}\|\d{1,3}/g); return m ? m[m.length - 1] : null; }
  function urlProd(g) { return game_data.link_base_pure + 'overview_villages&mode=prod&group=' + (g || 0) + '&page=-1'; }
  function urlAlvo(c) {
    var pre = (game_data.player && game_data.player.sitter > 0) ? 'game.php?t=' + game_data.player.id + '&' : 'game.php?&';
    return pre + 'screen=api&ajax=target_selection&input=' + c + '&type=coord';
  }

  // ---------- leitura da tabela de produção (linha por linha) ----------
  function lerProducao(doc) {
    var $d = $(doc), lista = [], semDados = [];
    $d.find('tr').each(function () {
      var $tr = $(this), $vn = $tr.find('.quickedit-vn').first();
      if (!$vn.length) return;
      var nome = $vn.text().trim(), c = coordTxt(nome), id = $vn.attr('data-id') || $vn.closest('[data-id]').attr('data-id');
      var $w = $tr.find('span.res.wood, span.warn_90.wood, span.warn.wood').first();
      var $s = $tr.find('span.res.stone, span.warn_90.stone, span.warn.stone').first();
      var $i = $tr.find('span.res.iron, span.warn_90.iron, span.warn.iron').first();
      if (!$w.length) { $w = $tr.find('.res.wood, .warn_90.wood, .warn.wood').first(); $s = $tr.find('.res.stone, .warn_90.stone, .warn.stone').first(); $i = $tr.find('.res.iron, .warn_90.iron, .warn.iron').first(); }
      if (!id || !c || !$w.length) { semDados.push(nome || '(linha sem nome)'); return; }
      var $tdRes = $w.closest('td'), armazem = dig($tdRes.next('td').text());
      var m = null, $mk = $tr.find('a[href*="market"]').first();
      if ($mk.length) m = $mk.text().match(/(\d+)\s*\/\s*(\d+)/);
      if (!m) m = $tdRes.next('td').next('td').text().match(/(\d+)\s*\/\s*(\d+)/);
      lista.push({
        id: id, nome: nome, coord: c, url: $vn.find('a').first().attr('href'),
        wood: dig($w.text()), stone: dig($s.text()), iron: dig($i.text()),
        armazem: armazem, merc: m ? +m[1] : 0, mercTotal: m ? +m[2] : 0
      });
    });
    return { aldeias: lista, semDados: semDados };
  }

  // ---------- cálculo do que cada aldeia envia ----------
  // reparte "total" unidades entre os recursos, proporcional ao que sobra (rem), sem passar do que existe
  function repartirSobra(base, disp, total) {
    var ks = ['wood', 'stone', 'iron'], rem = {}, sum = 0, ext = {}, usado = 0;
    ks.forEach(function (k) { rem[k] = Math.max(0, disp[k] - base[k]); sum += rem[k]; });
    var da = Math.min(total, sum);
    if (da <= 0) return base;
    ks.forEach(function (k) { ext[k] = Math.floor(da * rem[k] / sum); usado += ext[k]; });
    var falta = da - usado;
    while (falta > 0) {
      var melhor = null;
      ks.forEach(function (k) { if (rem[k] - ext[k] > 0 && (melhor === null || rem[k] - ext[k] > rem[melhor] - ext[melhor])) melhor = k; });
      if (melhor === null) break;
      ext[melhor]++; falta--;
    }
    var r = {}; ks.forEach(function (k) { r[k] = base[k] + ext[k]; });
    return r;
  }
  function calcular(v, cfg) {
    var cap = v.merc * cfg.capMerc;
    if (cap <= 0) return { motivo: 'sem comerciantes livres' };
    var res = Math.floor(v.armazem * cfg.reserva / 100);
    var disp = { wood: Math.max(0, v.wood - res), stone: Math.max(0, v.stone - res), iron: Math.max(0, v.iron - res) };
    if (disp.wood + disp.stone + disp.iron <= 0) return { motivo: cfg.reserva > 0 ? 'só tem recurso dentro da reserva' : 'sem recursos' };
    var base = { wood: 0, stone: 0, iron: 0 };
    if (cfg.modo === 'cunhagem') {
      var soma = cfg.r.wood + cfg.r.stone + cfg.r.iron;
      var esc_ = 1;
      ['wood', 'stone', 'iron'].forEach(function (k) {
        var q = cap * cfg.r[k] / soma;
        if (q > 0) esc_ = Math.min(esc_, disp[k] / q);
      });
      ['wood', 'stone', 'iron'].forEach(function (k) { base[k] = Math.floor(cap * cfg.r[k] / soma * esc_); });
      var tb = base.wood + base.stone + base.iron;
      if (cfg.completar && tb < cap) base = repartirSobra(base, disp, cap - tb);
    } else {
      base = repartirSobra(base, disp, cap);
    }
    var total = base.wood + base.stone + base.iron;
    if (total <= 0) return { motivo: 'nada a enviar' };
    if (total < cfg.minimo) return { motivo: 'abaixo do mínimo (' + num(total) + ')' };
    return { wood: base.wood, stone: base.stone, iron: base.iron, total: total, mercUsados: Math.ceil(total / cfg.capMerc) };
  }

  // ---------- interface ----------
  var dados = null, alvo = null, envios = [], ignoradas = [], somaEnv = { wood: 0, stone: 0, iron: 0 };

  function cfgAtual() {
    var r = { wood: dig($('#erW').val()), stone: dig($('#erS').val()), iron: dig($('#erI').val()) };
    if (r.wood + r.stone + r.iron <= 0) r = { wood: 28000, stone: 30000, iron: 25000 };
    var c = {
      modo: $('#erModo').val(), r: r, completar: $('#erCompletar').prop('checked'),
      reserva: Math.min(100, Math.max(0, parseFloat($('#erReserva').val().replace(',', '.')) || 0)),
      capMerc: Math.max(1, dig($('#erCap').val()) || 1000), minimo: dig($('#erMin').val()), ordem: $('#erOrdem').val()
    };
    salvar('_cfg', { modo: c.modo, r: r, completar: c.completar, reserva: c.reserva, capMerc: c.capMerc, minimo: c.minimo, ordem: c.ordem });
    return c;
  }
  function distancia(c) {
    if (!alvo) return 0;
    var p = c.split('|'); return Math.round(Math.hypot(+p[0] - alvo.x, +p[1] - alvo.y) * 100) / 100;
  }
  function montarLista() {
    if (!dados) return;
    var cfg = cfgAtual();
    envios = []; ignoradas = [];
    dados.aldeias.forEach(function (v) {
      if (alvo && String(v.id) === String(alvo.id)) { ignoradas.push({ v: v, motivo: 'é a aldeia de destino' }); return; }
      var r = calcular(v, cfg);
      if (r.motivo) ignoradas.push({ v: v, motivo: r.motivo }); else envios.push({ v: v, r: r, dist: distancia(v.coord) });
    });
    dados.semDados.forEach(function (n) { ignoradas.push({ v: { nome: n }, motivo: 'não consegui ler a linha' }); });
    envios.sort(function (a, b) { return cfg.ordem === 'longe' ? b.dist - a.dist : cfg.ordem === 'carga' ? b.r.total - a.r.total : a.dist - b.dist; });
    desenhar();
  }
  function desenhar() {
    var tw = 0, ts = 0, ti = 0, mu = 0, mt = 0;
    envios.forEach(function (e) { tw += e.r.wood; ts += e.r.stone; ti += e.r.iron; mu += e.r.mercUsados; });
    dados.aldeias.forEach(function (v) { mt += v.merc; });
    var h = '<div class="sc-ok"><b>' + envios.length + '</b> aldeia(s) com envio de <b>' + dados.aldeias.length + '</b> lidas &bull; total a enviar: ' +
      '<b>' + num(tw) + '</b> madeira, <b>' + num(ts) + '</b> argila, <b>' + num(ti) + '</b> ferro &bull; comerciantes: <b>' + mu + '</b> de ' + mt + ' livres' +
      '<br>Já enviado nesta sessão: ' + num(somaEnv.wood) + ' / ' + num(somaEnv.stone) + ' / ' + num(somaEnv.iron) + '</div>';
    h += '<table class="sc-t" id="erTab"><thead><tr><th>Aldeia</th><th>Dist.</th><th>Madeira</th><th>Argila</th><th>Ferro</th><th>Comerc.</th><th></th></tr></thead><tbody>';
    envios.forEach(function (e, i) {
      h += '<tr data-i="' + i + '"><td class="l"><a href="' + esc(e.v.url || '#') + '">' + esc(e.v.nome) + '</a></td><td>' + e.dist + '</td><td>' + num(e.r.wood) + '</td><td>' + num(e.r.stone) + '</td><td>' + num(e.r.iron) + '</td><td>' + e.r.mercUsados + '/' + e.v.merc + '</td>' +
        '<td><button class="sc-btn s er-env">Enviar</button></td></tr>';
    });
    h += '</tbody></table>';
    if (!envios.length) h += '<p class="sc-dica">Nenhuma aldeia com algo a enviar com essas regras.</p>';
    if (ignoradas.length) {
      h += '<div class="sc-box"><div class="sc-bh"><span class="sc-seta">▸</span> Aldeias que ficaram de fora (' + ignoradas.length + ')</div><div class="sc-bc"><table class="sc-t"><thead><tr><th>Aldeia</th><th>Motivo</th></tr></thead><tbody>' +
        ignoradas.map(function (x) { return '<tr><td class="l">' + esc(x.v.nome) + '</td><td class="l">' + esc(x.motivo) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    }
    $('#erLista').html(h);
    $('#erLista .er-env:first').trigger('focus');
  }

  function enviar(i, $btn) {
    var e = envios[i]; if (!e || !alvo) return;
    $('.er-env').prop('disabled', true);
    setTimeout(function () { $('.er-env').prop('disabled', false); var $n = $('#erTab .er-env').first(); if ($n.length) $n.trigger('focus'); }, 250);
    TribalWars.post('market', { ajaxaction: 'map_send', village: e.v.id }, { target_id: alvo.id, wood: e.r.wood, stone: e.r.stone, iron: e.r.iron }, function (r) {
      try { UI.SuccessMessage(r.message); } catch (x) {}
      somaEnv.wood += e.r.wood; somaEnv.stone += e.r.stone; somaEnv.iron += e.r.iron;
      e.feito = true;
      $btn.closest('tr').remove();
      envios[i] = null;
      var vivos = envios.filter(Boolean);
      var tw = 0, ts = 0, ti = 0; vivos.forEach(function (x) { tw += x.r.wood; ts += x.r.stone; ti += x.r.iron; });
      $('#erLista .sc-ok').first().html('<b>' + vivos.length + '</b> aldeia(s) restantes &bull; falta enviar: <b>' + num(tw) + '</b> / <b>' + num(ts) + '</b> / <b>' + num(ti) + '</b><br>Já enviado nesta sessão: ' + num(somaEnv.wood) + ' / ' + num(somaEnv.stone) + ' / ' + num(somaEnv.iron));
      if (!vivos.length) UI.SuccessMessage('Terminou! Clique em "Atualizar dados" para recalcular com os comerciantes que voltarem.');
    }, false);
  }

  function carregarAlvo(cb) {
    var c = coordTxt($('#erCoord').val());
    if (!c) { UI.ErrorMessage('Digite a coordenada de destino (ex.: 500|500).'); return; }
    salvar('_alvo', c);
    $.get(urlAlvo(c)).then(function (r) {
      var j = r; try { if (typeof r === 'string') j = JSON.parse(r); } catch (x) {}
      var a = j && j.villages && j.villages[0];
      if (!a) { alvo = null; $('#erAlvoInfo').text('Coordenada não encontrada.'); UI.ErrorMessage('Coordenada não encontrada.'); return; }
      alvo = { id: a.id, nome: a.name, x: +a.x, y: +a.y, jogador: a.player_name, pontos: a.points };
      $('#erAlvoInfo').html('Destino: <b>' + esc(a.name) + '</b> (' + a.x + '|' + a.y + ') &bull; ' + esc(a.player_name || 'bárbara') + ' &bull; ' + esc(a.points) + ' pts');
      if (cb) cb();
    }, function () { UI.ErrorMessage('Erro ao procurar a coordenada.'); });
  }
  function carregarDados(g, cb) {
    $('#erSt').text('Lendo as aldeias...');
    $.get(urlProd(g)).then(function (resp) {
      var doc = new DOMParser().parseFromString(resp, 'text/html');
      dados = lerProducao(doc);
      $('#erSt').text(dados.aldeias.length + ' aldeia(s) lida(s).');
      if (!dados.aldeias.length) UI.ErrorMessage('Não consegui ler a tabela de produção (talvez o jogo esteja no modo celular).');
      if (cb) cb();
    }, function () { $('#erSt').text(''); UI.ErrorMessage('Erro ao buscar a visão geral de produção.'); });
  }
  function grupoAtual() { return $('#erGrupo').val() || 0; }
  function tudo() {
    carregarAlvo(function () { carregarDados(grupoAtual(), montarLista); });
  }

  function iniciar() {
    var cfg = ler('_cfg', { modo: 'cunhagem', r: { wood: 28000, stone: 30000, iron: 25000 }, completar: true, reserva: 0, capMerc: 1000, minimo: 0, ordem: 'perto' });
    var corpo =
      '<div class="sc-blk"><h4><span class="sc-n">1</span>Para onde enviar?</h4>Coordenada: <input type="text" id="erCoord" style="width:90px" placeholder="500|500" value="' + esc(ler('_alvo', '')) + '"> ' +
      '<span class="sc-dica" id="erAlvoInfo"></span></div>' +
      '<div class="sc-blk"><h4><span class="sc-n">2</span>De quais aldeias?</h4>Grupo: <select id="erGrupo"></select> <span class="sc-dica" id="erSt"></span>' +
      '<div class="sc-dica">Todas as aldeias do grupo entram na conta. As que não enviam aparecem em "ficaram de fora", com o motivo.</div></div>' +
      '<div class="sc-blk"><h4><span class="sc-n">3</span>Como montar o envio?</h4>' +
      '<div><select id="erModo"><option value="cunhagem">Proporção de cunhagem (madeira : argila : ferro)</option><option value="estoque">Livre: proporcional ao que a aldeia tem</option></select> ' +
      '<span id="erProp">Proporção: <input type="text" id="erW" style="width:55px" value="' + cfg.r.wood + '"> : <input type="text" id="erS" style="width:55px" value="' + cfg.r.stone + '"> : <input type="text" id="erI" style="width:55px" value="' + cfg.r.iron + '"></span></div>' +
      '<label class="sc-u"><input type="checkbox" id="erCompletar"' + (cfg.completar ? ' checked' : '') + '> <b>Não deixar comerciante parado</b> (preenche a sobra com o recurso que ainda tiver)</label>' +
      '<div style="margin-top:4px">Manter no armazém: <input type="text" id="erReserva" style="width:45px" value="' + cfg.reserva + '">% &nbsp; ' +
      'Capacidade por comerciante: <input type="text" id="erCap" style="width:55px" value="' + cfg.capMerc + '"> &nbsp; ' +
      'Ignorar envios menores que: <input type="text" id="erMin" style="width:55px" value="' + cfg.minimo + '"> &nbsp; ' +
      'Ordem: <select id="erOrdem"><option value="perto">mais perto primeiro</option><option value="longe">mais longe primeiro</option><option value="carga">maior carga primeiro</option></select></div>' +
      '<div class="sc-dica">Para usar tudo, deixe "Manter no armazém" em 0%.</div></div>' +
      '<div><button class="sc-btn" id="erCalc">Calcular lista</button> <button class="sc-btn c" id="erAtual">Atualizar dados</button></div>' +
      '<div class="sc-blk" style="margin-top:8px"><h4><span class="sc-n">4</span>Envios (clique em "Enviar" em cada aldeia)</h4><div id="erLista"><p class="sc-dica">Clique em "Calcular lista".</p></div></div>';
    montarPainel('Enviar Recursos - Cunhagem', corpo, 'fixo');
    $('#scPainel').css({ width: '860px', top: '40px' });
    $('#erModo').val(cfg.modo); $('#erOrdem').val(cfg.ordem);
    function modoVis() { $('#erProp').toggle($('#erModo').val() === 'cunhagem'); }
    modoVis(); $('#erModo').on('change', function () { modoVis(); montarLista(); });
    $('#erCompletar,#erOrdem').on('change', montarLista);
    $('#erReserva,#erCap,#erMin,#erW,#erS,#erI').on('change', montarLista);
    $('#erCalc').on('click', tudo);
    $('#erAtual').on('click', tudo);
    $('#scPainel').on('click', '.er-env', function () { enviar($(this).closest('tr').data('i'), $(this)); });
    $('#scPainel').on('click', '.sc-bh', function () { var $c = $(this).next('.sc-bc'); $c.toggle(); $(this).find('.sc-seta').first().text($c.css('display') !== 'none' ? '▾' : '▸'); });
    carregarGrupos('#erGrupo', ler('_grupo', 0), function (g) { salvar('_grupo', g); if (dados) carregarDados(g, montarLista); }, true);
    if (ler('_alvo', '')) tudo();
  }

  iniciar();
  window.__erTeste = { calcular: calcular, lerProducao: lerProducao, repartirSobra: repartirSobra };
})();
