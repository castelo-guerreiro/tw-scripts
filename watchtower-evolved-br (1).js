/*
 * Painel de Torres de Vigia - por CASTELO.GUERREIRO
 *
 * Baseado no "WatchTower Evolved" de RedAlert (mod JawJaw), reescrito para:
 *   - NAO depender do twSDK.js nem do twscripts.dev (nenhum contador de uso, nada enviado para fora)
 *   - ler sozinho o nivel das suas torres (botao "Minhas torres") e desenhar os raios no mapa
 *   - ANALISE ESTRATEGICA: diz em qual das suas aldeias (ex.: o grupo do front) vale mais a pena construir
 *     a proxima torre, com base nas aldeias inimigas da tribo inimiga e nas suas torres atuais
 *
 * Como a analise decide (modelo do proprio jogo: a torre marca o ataque assim que ele entra no raio,
 * qualquer que seja o destino final):
 *   1. Cada "ameaca" e um par: aldeia inimiga -> aldeia sua, a ate X campos de distancia.
 *   2. A torre candidata "cobre" a ameaca se o caminho em linha reta do ataque passa dentro do raio dela
 *      e o aviso chega com pelo menos Y minutos de antecedencia (para a tropa de referencia escolhida).
 *   3. O peso da ameaca cresce com os pontos da sua aldeia e com a proximidade do inimigo.
 *   4. Ganho = peso das ameacas que a nova torre cobre e que as torres atuais NAO cobrem.
 *   5. Para varias torres, escolhe uma por vez (a cada escolha, o que ja foi coberto deixa de contar).
 *
 * Nao considera custo/populacao da torre nem espaco na aldeia. Nada e enviado, so lido.
 *
 * Dependencia externa unica: o MapSdk do Shinko to Kuma / Sass (para desenhar no mapa),
 * carregado de https://shinko-to-kuma.com/scripts/mapSdk.js
 *
 * Roda na tela do MAPA. Se estiver em outra tela, ele te leva para o mapa (clique de novo la).
 */
(function () {
  'use strict';

  // ------------------------- CONFIGURACAO -------------------------

  var AUTOR = 'CASTELO.GUERREIRO';
  var BANNER = 'data:image/jpeg;base64,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';
  var CHAVE = 'watchtowerEvolved_data';              // lista de torres (mesma chave do original)
  var CHAVE_AN = 'watchtowerEvolved_analise';        // parametros da analise
  var ID = 'wtEvolvedWidget';
  var TAG = 'wtEvolved';
  var TAG_PLANO = 'wtPlano';
  var SDK_URL = 'https://shinko-to-kuma.com/scripts/mapSdk.js';
  var COR_PADRAO = '#00bcd4';
  var COR_PLANO = '#ffd54a';
  var OPACIDADE = 0.35;
  var MAX_PARES = 2500000;

  // Raio da torre por nivel (indice = nivel)
  var RAIOS = [0, 1.1, 1.3, 1.5, 1.7, 2, 2.3, 2.6, 3, 3.4, 3.9,
               4.4, 5.1, 5.8, 6.7, 7.6, 8.7, 10, 11.5, 13.1, 15];

  // minutos por campo de cada tropa (mundo com velocidade 1)
  var VEL_BASE = { snob: 35, ram: 30, sword: 22, spear: 18, heavy: 11, light: 10, spy: 9 };
  var NOMES_UN = { snob: 'Nobre', ram: 'Aríete / catapulta', sword: 'Espadachim', spear: 'Lanceiro / machado', heavy: 'Cav. pesada', light: 'Cav. leve', spy: 'Explorador' };

  // ------------------------- ENTRADA -------------------------

  if (typeof game_data === 'undefined' || game_data.screen !== 'map' || typeof TWMap === 'undefined') {
    UI.InfoMessage('Indo para o mapa. Clique no script de novo la.', 2500);
    setTimeout(function () {
      location.href = game_data.link_base_pure + 'map';
    }, 800);
    return;
  }

  var cliqueAtivo = false;
  var analisando = false;
  var grupoViaPlanoB = false;       // true quando o grupo foi lido pela visao de edificios (plano B)
  var ultimoPlano = null;
  // guarda o handler original do jogo uma unica vez, mesmo se o script rodar duas vezes
  if (!window.__wtCliqueOriginal) window.__wtCliqueOriginal = TWMap.map._handleClick;

  function carregarSdk() {
    if (typeof MapSdk !== 'undefined' && MapSdk.circles) {
      return $.Deferred().resolve().promise();
    }
    return $.getScript(SDK_URL);
  }

  carregarSdk()
    .done(function () {
      try {
        iniciar();
      } catch (e) {
        console.error('[WatchTower] erro ao iniciar', e);
        UI.ErrorMessage('Erro ao iniciar o script (veja o console, F12).');
      }
    })
    .fail(function () {
      UI.ErrorMessage('Nao consegui carregar o MapSdk (shinko-to-kuma.com). Ele pode estar fora do ar ou bloqueado.');
    });

  // ------------------------- FUNCOES AUXILIARES -------------------------

  function hexParaRgb(hex) {
    var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
  }

  function coordValida(c) {
    return /^\d{1,3}\|\d{1,3}$/.test(c);
  }

  function normalizar(it) {
    if (!it || typeof it !== 'object') return null;
    var coord = String(it.coord == null ? '' : it.coord).trim();
    var nivel = String(it.wtLevel == null ? '' : it.wtLevel).trim();
    var cor = /^#[0-9a-f]{6}$/i.test(it.wtColor) ? it.wtColor : COR_PADRAO;
    return { coord: coord, wtLevel: nivel, wtColor: cor };
  }

  function carregarSalvos() {
    try {
      var d = localStorage.getItem(CHAVE);
      var arr = d ? JSON.parse(d) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lerLinhas()));
    } catch (e) { /* sem armazenamento, segue sem salvar */ }
  }

  function copiar(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto).catch(function () { copiarAntigo(texto); });
    }
    copiarAntigo(texto);
    return Promise.resolve();
  }

  function copiarAntigo(texto) {
    var ta = document.createElement('textarea');
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignora */ }
    document.body.removeChild(ta);
  }

  function tick() { return new Promise(function (r) { setTimeout(r, 0); }); }

  function pt(n, casas) {
    return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  }

  function pct(f) { return pt(f * 100, 1) + '%'; }

  function dec(s) {
    try { return decodeURIComponent(String(s).replace(/\+/g, ' ')); } catch (e) { return String(s); }
  }

  function pegarTexto(url) { return $.ajax({ url: url, dataType: 'text' }); }

  // ------------------------- INTERFACE -------------------------

  function montarWidget() {
    $('#' + ID).remove();

    var opNivel = '';
    for (var n = 1; n <= 20; n++) opNivel += '<option value="' + n + '"' + (n === 15 ? ' selected' : '') + '>Nível ' + n + ' (raio ' + RAIOS[n] + ')</option>';
    var opQtd = '';
    for (var q = 1; q <= 5; q++) opQtd += '<option value="' + q + '">' + q + '</option>';
    var opUn = '';
    ['snob', 'ram', 'sword', 'spear', 'heavy', 'light', 'spy'].forEach(function (u) {
      opUn += '<option value="' + u + '">' + NOMES_UN[u] + '</option>';
    });

    var css = `
    #${ID}{position:fixed;right:10px;bottom:10px;width:600px;max-width:98vw;max-height:94vh;overflow-y:auto;z-index:13000;
      background:linear-gradient(#10203c,#0a1424);border:2px solid #c9a227;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.6);
      color:#f3ead0;font-size:13px;line-height:1.35;text-align:left}
    #${ID} *{box-sizing:border-box}
    #${ID} .wt-head{display:flex;align-items:center;gap:14px;padding:10px 14px;cursor:move;background:linear-gradient(#1f3d73,#12274d);
      border-bottom:2px solid #c9a227;border-radius:10px 10px 0 0}
    #${ID} .wt-banner{height:60px;width:auto;border:2px solid #c9a227;border-radius:6px;display:block}
    #${ID} .wt-title{flex:1}
    #${ID} .wt-t1{font-size:20px;font-weight:bold;letter-spacing:1.5px;color:#fff}
    #${ID} .wt-t2{font-size:12px;color:#e7c75a;letter-spacing:1px;margin-top:2px}
    #${ID} .wt-ctrl a{display:inline-block;width:30px;height:30px;line-height:28px;text-align:center;margin-left:6px;border:1px solid #c9a227;
      border-radius:6px;color:#f3ead0;cursor:pointer;font-size:16px;text-decoration:none;background:#0d1a33}
    #${ID} .wt-ctrl a:hover{background:#c9a227;color:#1b1303}
    #${ID} .wt-card{margin:10px 12px;padding:10px 12px;background:#142544;border:1px solid #2c4a82;border-radius:10px}
    #${ID} .wt-card h3{margin:0 0 8px 0;font-size:13px;letter-spacing:.5px;color:#e7c75a;text-transform:uppercase;font-weight:bold}
    #${ID} .wt-n{display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;border-radius:50%;background:#c9a227;color:#1b1303;margin-right:6px;font-size:12px}
    #${ID} .wt-lista{max-height:230px;overflow-y:auto;overflow-x:hidden}
    #${ID} table{width:100%;border-collapse:collapse}
    #${ID} th{background:#0f1d38 !important;background-image:none !important;color:#b9c8e6 !important;text-shadow:none !important;font-weight:bold;
      font-size:11px;text-transform:uppercase;padding:6px 4px;text-align:center;border:0 !important;border-bottom:1px solid #2c4a82 !important}
    #${ID} td{padding:3px;text-align:center;border-bottom:1px solid #1f3560}
    #${ID} input[type=text],#${ID} input[type=number],#${ID} select{background:#0a1222;color:#fff;border:1px solid #3a5a9a;border-radius:6px;
      padding:5px 6px;font-size:13px}
    #${ID} .wt-in{width:100%;text-align:center}
    #${ID} input:focus,#${ID} select:focus{outline:none;border-color:#e7c75a}
    #${ID} .wt-cor{width:34px;height:26px;padding:0;border-radius:6px;border:1px solid #3a5a9a;background:#0a1222}
    #${ID} .wt-del{cursor:pointer;color:#ff7b72}
    #${ID} .wt-botoes{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px}
    #${ID} .wt-btn{display:inline-block;padding:6px 12px;border:1px solid #c9a227;border-radius:999px;background:#0d1a33;color:#f3ead0;cursor:pointer;
      font-weight:bold;font-size:12px;text-decoration:none}
    #${ID} .wt-btn:hover{background:#c9a227;color:#1b1303}
    #${ID} .wt-importar{margin-top:8px;display:none}
    #${ID} .wt-importar textarea{width:100%;height:70px;background:#0a1222;color:#fff;border:1px solid #3a5a9a;border-radius:8px;padding:6px}
    #${ID} .wt-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    #${ID} .wt-grid label{display:flex;flex-direction:column;gap:3px;color:#9db0d3;font-size:11.5px}
    #${ID} .wt-grid label.wt-check{flex-direction:row;align-items:center;gap:8px;color:#f3ead0;font-size:12.5px;grid-column:1 / -1}
    #${ID} .wt-grid select,#${ID} .wt-grid input[type=text],#${ID} .wt-grid input[type=number]{width:100%;color:#fff;font-size:13px}
    #${ID} .wt-check input{width:16px;height:16px;accent-color:#c9a227;margin:0}
    #${ID} details.wt-adv{margin-top:10px}
    #${ID} details.wt-adv summary{cursor:pointer;color:#e7c75a;font-weight:bold;font-size:12px}
    #${ID} details.wt-adv .wt-grid{margin-top:8px}
    #${ID} .wt-hint{margin-top:8px;font-size:11.5px;color:#9db0d3}
    #${ID} .wt-actions{display:flex;gap:10px;align-items:center;margin-top:12px;flex-wrap:wrap}
    #${ID} .wt-primary{padding:11px 28px;border:1px solid #fff2b3;border-radius:10px;cursor:pointer;font-size:15px;font-weight:bold;letter-spacing:1px;
      color:#1b1303;background:linear-gradient(#f1d062,#c9a227);box-shadow:0 2px 8px rgba(0,0,0,.5);text-decoration:none}
    #${ID} .wt-primary:hover{background:linear-gradient(#ffe27f,#d9b232)}
    #${ID} .wt-status{margin-top:8px;min-height:18px;font-weight:bold;color:#9db0d3}
    #${ID} .wt-status.erro{color:#ff7b72}
    #${ID} .wt-status.ok{color:#5fd07a}
    #${ID} .wt-res{margin-top:6px}
    #${ID} .wt-base{padding:8px 10px;border:1px solid #2c4a82;border-radius:8px;background:#0d1a33;color:#f3ead0;margin-bottom:8px}
    #${ID} .wt-pick{margin-top:8px;padding:10px 12px;border:1px solid #e7c75a;border-radius:10px;background:#1b2c52}
    #${ID} .wt-pick .t{font-weight:bold;color:#fff;font-size:14px}
    #${ID} .wt-pick .g{color:#5fd07a;font-weight:bold;margin-top:2px}
    #${ID} .wt-pick .d{color:#9db0d3;margin-top:2px;font-size:12px}
    #${ID} .wt-pick .b{margin-top:8px;display:flex;gap:6px;flex-wrap:wrap}
    #${ID} .wt-sub{margin-top:12px;color:#e7c75a;font-weight:bold;font-size:12px;text-transform:uppercase}
    #${ID} table.wt-rank td{padding:5px 4px}
    #${ID} table.wt-rank td.l{text-align:left}
    #${ID} .wt-niv{margin-top:8px;color:#9db0d3;font-size:12px}
    #${ID} .wt-niv b{color:#fff}
    @media (max-width:700px){#${ID}{width:98vw}#${ID} .wt-grid{grid-template-columns:1fr}#${ID} .wt-banner{height:44px}#${ID} .wt-t1{font-size:15px}}
    `;

    var html =
      '<div id="' + ID + '">' +
        '<style>' + css + '</style>' +
        '<div class="wt-head" id="wt_head">' +
          '<img class="wt-banner" src="' + BANNER + '" alt="' + AUTOR + '">' +
          '<div class="wt-title"><div class="wt-t1">TORRES DE VIGIA</div><div class="wt-t2">PAINEL ' + AUTOR + '</div></div>' +
          '<div class="wt-ctrl"><a class="wt-min" title="Recolher / abrir">&#8211;</a><a class="wt-fechar" title="Fechar">&#10005;</a></div>' +
        '</div>' +
        '<div class="wt-corpo">' +

          '<section class="wt-card">' +
            '<h3><span class="wt-n">1</span>Suas torres no mapa</h3>' +
            '<div class="wt-lista"><table><thead><tr><th>Aldeia</th><th>Nível</th><th>Cor</th><th></th></tr></thead><tbody id="wtLinhas"></tbody></table></div>' +
            '<div class="wt-botoes">' +
              '<a class="wt-btn wt-b-minhas">Minhas torres</a>' +
              '<a class="wt-btn wt-b-add">Adicionar</a>' +
              '<a class="wt-btn wt-b-exibir">Exibir</a>' +
              '<a class="wt-btn wt-b-export">Exportar</a>' +
              '<a class="wt-btn wt-b-import">Importar</a>' +
              '<a class="wt-btn wt-b-limpar">Limpar</a>' +
              '<a class="wt-btn wt-b-clique">Clique no mapa: desligado</a>' +
            '</div>' +
            '<div class="wt-importar"><textarea placeholder="Cole aqui o JSON exportado"></textarea>' +
              '<a class="wt-btn wt-b-import-ok" style="margin-top:6px">Importar</a></div>' +
          '</section>' +

          '<section class="wt-card">' +
            '<h3><span class="wt-n">2</span>Onde construir a próxima torre</h3>' +
            '<div class="wt-grid">' +
              '<label>Aldeias candidatas (front)<select id="an_grupo"><option value="0">Todas as minhas aldeias</option></select></label>' +
              '<label>Tribo(s) inimiga(s) — tag<input type="text" id="an_tags" placeholder="ex.: ABC, XYZ"></label>' +
              '<label>Nível da nova torre<select id="an_nivel">' + opNivel + '</select></label>' +
              '<label>Quantas torres novas<select id="an_qtd">' + opQtd + '</select></label>' +
            '</div>' +
            '<details class="wt-adv"><summary>Ajustes da análise</summary>' +
              '<div class="wt-grid">' +
                '<label>Alcance dos inimigos (campos)<input type="number" id="an_dmax" min="5" max="150" value="50"></label>' +
                '<label>Aviso mínimo (minutos)<input type="number" id="an_tmin" min="0" max="1440" value="60"></label>' +
                '<label>Tropa de referência<select id="an_un">' + opUn + '</select></label>' +
                '<label class="wt-check"><input type="checkbox" id="an_pts" checked> Dar mais peso às aldeias minhas com mais pontos</label>' +
              '</div>' +
            '</details>' +
            '<div class="wt-hint">Testa cada aldeia candidata e escolhe a que avisa a maior parte dos ataques inimigos com antecedência, descontando o que as torres atuais já cobrem.</div>' +
            '<div class="wt-actions"><a class="wt-primary" id="an_run">ANALISAR</a><a class="wt-btn" id="an_clear">Limpar plano do mapa</a></div>' +
            '<div class="wt-status" id="an_status"></div>' +
            '<div class="wt-res" id="an_res"></div>' +
          '</section>' +

        '</div>' +
      '</div>';

    $('body').append(html);
    if ($.fn.draggable) $('#' + ID).draggable({ handle: '#wt_head' });
  }

  function adicionarLinha(item) {
    var it = normalizar(item) || { coord: '', wtLevel: '', wtColor: COR_PADRAO };
    var tr = $('<tr>');
    var tdCoord = $('<td>').append($('<input type="text" class="wt-in wt-coord" placeholder="500|500">').val(it.coord));
    var tdNivel = $('<td style="width:56px">').append($('<input type="text" class="wt-in wt-nivel" placeholder="1-20">').val(it.wtLevel));
    var tdCor = $('<td style="width:44px">').append($('<input type="color" class="wt-cor">').val(it.wtColor));
    var tdDel = $('<td style="width:28px">').append($('<a class="wt-del" title="Remover">&#10005;</a>'));
    tr.append(tdCoord, tdNivel, tdCor, tdDel);
    $('#wtLinhas').append(tr);
  }

  function preencher(lista) {
    $('#wtLinhas').empty();
    lista.forEach(adicionarLinha);
  }

  function lerLinhas() {
    var lista = [];
    $('#wtLinhas tr').each(function () {
      lista.push({
        coord: String($(this).find('.wt-coord').val() || '').trim(),
        wtLevel: String($(this).find('.wt-nivel').val() || '').trim(),
        wtColor: $(this).find('.wt-cor').val()
      });
    });
    return lista;
  }

  // ------------------------- DESENHO NO MAPA -------------------------

  function desenhar() {
    var itens = lerLinhas();
    var invalidos = 0;
    var desenhadas = 0;

    MapSdk.circles = MapSdk.circles.filter(function (c) { return c.tag !== TAG; });

    itens.forEach(function (it) {
      var m = /^(\d{1,3})\|(\d{1,3})$/.exec(it.coord);
      var nivel = parseInt(it.wtLevel, 10);
      if (!m || !(nivel >= 1 && nivel <= 20)) { invalidos++; return; }

      var rgb = hexParaRgb(it.wtColor) || { r: 0, g: 188, b: 212 };
      var preenchimento = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + OPACIDADE + ')';

      MapSdk.circles.push({
        tag: TAG,
        x: parseInt(m[1], 10),
        y: parseInt(m[2], 10),
        radius: RAIOS[nivel],
        styling: {
          main: { strokeStyle: '#000000', lineWidth: 2, fillStyle: preenchimento },
          mini: { strokeStyle: '#000000', lineWidth: 2, fillStyle: preenchimento }
        },
        drawOnMini: true,
        drawOnMap: true,
        markCircleOrigin: true
      });
      desenhadas++;
    });

    MapSdk.mapOverlay.reload();
    salvar();

    if (invalidos) {
      UI.ErrorMessage(invalidos + ' linha(s) ignorada(s): confira a coordenada (500|500) e o nível (1 a 20).');
    } else if (desenhadas) {
      UI.SuccessMessage(desenhadas + ' torre(s) no mapa.');
    }
  }

  // circulos dourados do plano sugerido pela analise
  function desenharPlano(picks) {
    MapSdk.circles = MapSdk.circles.filter(function (c) { return c.tag !== TAG_PLANO; });
    var rgb = hexParaRgb(COR_PLANO);
    var fill = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.30)';
    picks.forEach(function (p) {
      var m = /^(\d{1,3})\|(\d{1,3})$/.exec(p.coord);
      if (!m) return;
      MapSdk.circles.push({
        tag: TAG_PLANO,
        x: parseInt(m[1], 10),
        y: parseInt(m[2], 10),
        radius: p.raio,
        styling: {
          main: { strokeStyle: '#ffffff', lineWidth: 3, fillStyle: fill },
          mini: { strokeStyle: '#ffffff', lineWidth: 2, fillStyle: fill }
        },
        drawOnMini: true,
        drawOnMap: true,
        markCircleOrigin: true
      });
    });
    MapSdk.mapOverlay.reload();
  }

  function focarNoMapa(coord) {
    var m = /^(\d{1,3})\|(\d{1,3})$/.exec(coord);
    if (!m) return;
    try { if (TWMap.focus) TWMap.focus(parseInt(m[1], 10), parseInt(m[2], 10)); } catch (e) { /* sem foco */ }
  }

  // ------------------------- LER DADOS DO JOGO -------------------------

  // torres atuais e lista das suas aldeias (pela visao geral de edificios)
  async function lerTorresDoJogo() {
    var html = await $.get(game_data.link_base_pure + 'overview_villages&mode=buildings&group=0&page=-1');
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var torres = [], vilas = [], temColuna = false;

    doc.querySelectorAll('#villages tr').forEach(function (tr) {
      var nome = tr.querySelector('.quickedit-label');
      if (!nome) return;
      var m = nome.textContent.match(/(\d+)\|(\d+)/g);
      if (!m) return;
      var coord = m[m.length - 1];
      vilas.push(coord);
      var cel = tr.querySelector('.upgrade_building.b_watchtower');
      if (cel) {
        temColuna = true;
        var nivel = parseInt(cel.textContent.trim(), 10);
        if (nivel > 0) torres.push({ coord: coord, nivel: Math.min(nivel, 20) });
      }
    });
    return { torres: torres, vilas: vilas, temColuna: temColuna };
  }

  async function importarDoJogo() {
    try {
      var lido = await lerTorresDoJogo();
      var achadas = lido.torres;

      if (!achadas.length) {
        UI.ErrorMessage('Nenhuma torre encontrada nas suas aldeias. Você pode adicionar à mão.');
        return;
      }

      var atuais = lerLinhas();
      achadas.forEach(function (a) {
        var existente = atuais.filter(function (c) { return c.coord === a.coord; })[0];
        if (existente) {
          existente.wtLevel = String(a.nivel);
        } else {
          atuais.push({ coord: a.coord, wtLevel: String(a.nivel), wtColor: COR_PADRAO });
        }
      });

      preencher(atuais);
      desenhar();
    } catch (e) {
      console.error('[WatchTower] erro ao ler as torres', e);
      UI.ErrorMessage('Não consegui ler suas torres (veja o console, F12).');
    }
  }

  // ------------------------- ANALISE ESTRATEGICA -------------------------

  function statusAn(msg, tipo) {
    $('#an_status').removeClass('erro ok').addClass(tipo || '').text(msg || '');
  }

  function lerParametros() {
    var tags = String($('#an_tags').val() || '').split(/[,;\s]+/).map(function (t) { return t.trim(); }).filter(Boolean);
    var vistos = {};
    tags = tags.filter(function (t) { var k = t.toLowerCase(); if (vistos[k]) return false; vistos[k] = 1; return true; });
    var num = function (id, padrao, min, max) {
      var v = parseFloat($(id).val());
      if (Number.isNaN(v)) v = padrao;
      return Math.min(Math.max(v, min), max);
    };
    return {
      tags: tags,
      nivel: Math.round(num('#an_nivel', 15, 1, 20)),
      qtd: Math.round(num('#an_qtd', 1, 1, 5)),
      dmax: num('#an_dmax', 50, 5, 150),
      tmin: num('#an_tmin', 60, 0, 1440),
      un: VEL_BASE[$('#an_un').val()] ? $('#an_un').val() : 'snob',
      pontos: $('#an_pts').is(':checked'),
      grupo: String($('#an_grupo').val() || '0')
    };
  }

  function salvarParametros() {
    var cfg = {};
    $('#' + ID + ' [id^=an_]').each(function () {
      if (!this.id || this.id === 'an_run' || this.id === 'an_clear' || this.id === 'an_status' || this.id === 'an_res') return;
      cfg[this.id] = (this.type === 'checkbox') ? this.checked : this.value;
    });
    try { localStorage.setItem(CHAVE_AN, JSON.stringify(cfg)); } catch (e) { /* ignora */ }
  }

  function lerParametrosSalvos() {
    try { return JSON.parse(localStorage.getItem(CHAVE_AN) || 'null'); } catch (e) { return null; }
  }

  function restaurarParametros() {
    var cfg = lerParametrosSalvos();
    if (!cfg) return;
    $('#' + ID + ' [id^=an_]').each(function () {
      if (!this.id || this.id === 'an_grupo' || !(this.id in cfg)) return;
      if (this.type === 'checkbox') this.checked = !!cfg[this.id];
      else this.value = cfg[this.id];
    });
  }

  // grupos para escolher as aldeias candidatas
  async function carregarGruposAn() {
    var select = $('#an_grupo');
    var vistos = {};
    function add(id, nome) {
      id = String(id);
      if (id === '0' || vistos[id]) return;
      vistos[id] = 1;
      select.append($('<option>').val(id).text(nome));
    }
    try {
      var texto = await $.ajax({ url: game_data.link_base_pure + 'groups&mode=overview&ajax=load_group_menu', dataType: 'text' });
      var json = JSON.parse(texto);
      ((json && json.result) || []).forEach(function (g) {
        if (!g || g.group_id == null || g.type === 'separator') return;
        add(g.group_id, g.name == null ? ('grupo ' + g.group_id) : String(g.name));
      });
    } catch (e) {
      console.warn('[WatchTower] lista de grupos falhou', e);
    }
    if (select.find('option').length < 2) return;

    // grupo salvo da ultima vez; senao, o primeiro que tenha "front" no nome
    var cfg = lerParametrosSalvos();
    var salvo = cfg && cfg.an_grupo;
    var existe = function (v) { return select.find('option').filter(function () { return this.value === String(v); }).length > 0; };
    if (salvo && existe(salvo)) {
      select.val(String(salvo));
    } else {
      var front = select.find('option').filter(function () { return /front/i.test($(this).text()); }).first();
      if (front.length) select.val(front.val());
    }
  }

  function extrairCoords(texto) {
    var m = String(texto || '').match(/\d{1,3}\|\d{1,3}/g);
    return m ? m[m.length - 1] : null;
  }

  // Set de coordenadas do grupo, ou null se nao conseguiu
  async function carregarAldeiasDoGrupo(id) {
    grupoViaPlanoB = false;
    try {
      var texto = await $.ajax({
        url: game_data.link_base_pure + 'groups&ajax=load_villages_from_group',
        type: 'POST',
        data: { h: game_data.csrf, group_id: id },
        dataType: 'text'
      });
      var json = JSON.parse(texto);
      var doc = new DOMParser().parseFromString((json && json.html) || '', 'text/html');
      var set = new Set();
      doc.querySelectorAll('#group_table tr').forEach(function (tr) {
        var c = extrairCoords(tr.textContent);
        if (c) set.add(c);
      });
      if (set.size) return set;
    } catch (e) {
      console.warn('[WatchTower] load_villages_from_group falhou, tentando a visao de edificios', e);
    }
    try {
      var html = await $.get(game_data.link_base_pure + 'overview_villages&mode=buildings&group=' + encodeURIComponent(id) + '&page=-1');
      var doc2 = new DOMParser().parseFromString(html, 'text/html');
      var set2 = new Set();
      doc2.querySelectorAll('#villages tr .quickedit-label').forEach(function (el) {
        var c = extrairCoords(el.textContent);
        if (c) set2.add(c);
      });
      if (set2.size) { grupoViaPlanoB = true; return set2; }
    } catch (e) {
      console.error('[WatchTower] nao consegui ler as aldeias do grupo', e);
    }
    return null;
  }

  async function velocidadeMundo() {
    var chave = game_data.world + 'speedWorld';
    try {
      var c = localStorage.getItem(chave);
      if (c) return JSON.parse(c);
    } catch (e) { /* ignora */ }
    try {
      var txt = await pegarTexto('/interface.php?func=get_config');
      var doc = new DOMParser().parseFromString(txt, 'text/html');
      var obj = {
        worldSpeed: Number(doc.getElementsByTagName('speed')[0].innerHTML),
        unitSpeed: Number(doc.getElementsByTagName('unit_speed')[0].innerHTML)
      };
      if (obj.worldSpeed > 0 && obj.unitSpeed > 0) {
        try { localStorage.setItem(chave, JSON.stringify(obj)); } catch (e) { /* ignora */ }
        return obj;
      }
    } catch (e) {
      console.warn('[WatchTower] nao consegui ler a velocidade do mundo, usando 1x', e);
    }
    return { worldSpeed: 1, unitSpeed: 1 };
  }

  // dados publicos do mundo: suas aldeias e as aldeias das tribos inimigas (cache de 30 min)
  async function carregarMundo(tags) {
    var chaveCache = game_data.world + 'wt_mundo_cache';
    var chave = tags.map(function (t) { return t.toLowerCase(); }).sort().join(',');
    var eu = String(game_data.player && game_data.player.id);
    try {
      var c = JSON.parse(localStorage.getItem(chaveCache) || 'null');
      if (c && c.tags === chave && c.eu === eu && (Date.now() - c.ts) < 30 * 60 * 1000) return c;
    } catch (e) { /* sem cache */ }

    var txts = await Promise.all([pegarTexto('/map/ally.txt'), pegarTexto('/map/player.txt'), pegarTexto('/map/village.txt')]);

    // tribos (tag -> id)
    var queridas = {};
    tags.forEach(function (t) { queridas[t.toLowerCase()] = t.toUpperCase(); });
    var aliados = {}, achadas = [];
    String(txts[0]).split('\n').forEach(function (linha) {
      var p = linha.split(',');
      if (p.length < 3) return;
      var tag = dec(p[2]).toLowerCase();
      if (queridas[tag]) { aliados[p[0]] = true; achadas.push(queridas[tag]); delete queridas[tag]; }
    });
    var faltam = Object.keys(queridas).map(function (k) { return queridas[k]; });

    // jogadores das tribos inimigas
    var inimigos = {}, nJog = 0;
    String(txts[1]).split('\n').forEach(function (linha) {
      var p = linha.split(',');
      if (p.length < 3) return;
      if (aliados[p[2]]) { inimigos[p[0]] = true; nJog++; }
    });

    // aldeias
    var own = [], enemies = [];
    String(txts[2]).split('\n').forEach(function (linha) {
      var p = linha.split(',');
      if (p.length < 6) return;
      var x = parseInt(p[2], 10), y = parseInt(p[3], 10);
      if (Number.isNaN(x) || Number.isNaN(y)) return;
      if (p[4] === eu) own.push([x, y, parseInt(p[5], 10) || 0, dec(p[1])]);
      else if (inimigos[p[4]]) enemies.push([x, y, parseInt(p[5], 10) || 0]);
    });

    var res = { ts: Date.now(), tags: chave, eu: eu, own: own, enemies: enemies, achadas: achadas, faltam: faltam, jogadores: nJog };
    try { localStorage.setItem(chaveCache, JSON.stringify(res)); } catch (e) { /* cache grande demais, segue sem */ }
    return res;
  }

  // campos de aviso para um ataque origem -> alvo, ou -1 se a rota nao passa dentro do raio
  function avisoDe(ex, ey, tx, ty, D, cx, cy, r) {
    var ux = (tx - ex) / D;
    var uy = (ty - ey) / D;
    var wx = ex - cx;
    var wy = ey - cy;
    var b = ux * wx + uy * wy;
    var c = wx * wx + wy * wy - r * r;
    var disc = b * b - c;
    if (disc < 0) return -1;
    var raiz = Math.sqrt(disc);
    var entra = -b - raiz;
    var sai = -b + raiz;
    if (sai < 0 || entra > D) return -1;
    return D - (entra > 0 ? entra : 0);
  }

  // pares inimigo -> aldeia minha a ate dmax campos (arrays tipados; null se passar do limite)
  async function montarPares(own, enemies, dmax, usarPontos) {
    var dmax2 = dmax * dmax;
    var total = 0, i, j;
    for (i = 0; i < own.length; i++) {
      for (j = 0; j < enemies.length; j++) {
        var dx = enemies[j][0] - own[i][0], dy = enemies[j][1] - own[i][1];
        var d2 = dx * dx + dy * dy;
        if (d2 > 0 && d2 <= dmax2) total++;
      }
      if (total > MAX_PARES) return null;
      if ((i & 15) === 0) await tick();
    }
    var P = { n: total, ex: new Float32Array(total), ey: new Float32Array(total), tx: new Float32Array(total),
              ty: new Float32Array(total), d: new Float32Array(total), w: new Float32Array(total), pesoTotal: 0 };
    var k = 0;
    for (i = 0; i < own.length; i++) {
      var t = own[i];
      var wt = usarPontos ? Math.max(t[2], 1) : 1;
      for (j = 0; j < enemies.length; j++) {
        var e = enemies[j];
        var ddx = e[0] - t[0], ddy = e[1] - t[1];
        var dd2 = ddx * ddx + ddy * ddy;
        if (dd2 === 0 || dd2 > dmax2) continue;
        var d = Math.sqrt(dd2);
        P.ex[k] = e[0]; P.ey[k] = e[1]; P.tx[k] = t[0]; P.ty[k] = t[1]; P.d[k] = d;
        P.w[k] = wt * (1 - d / dmax);
        P.pesoTotal += P.w[k];
        k++;
      }
      if ((i & 15) === 0) await tick();
    }
    return P;
  }

  // soma o peso das ameacas AINDA nao cobertas que esta torre cobre com aviso >= need campos
  function ganhoDaTorre(P, cob, cx, cy, r, need) {
    var g = 0;
    for (var p = 0; p < P.n; p++) {
      if (cob[p]) continue;
      var x1 = P.ex[p], y1 = P.ey[p], x2 = P.tx[p], y2 = P.ty[p];
      if (cx + r < (x1 < x2 ? x1 : x2) || cx - r > (x1 > x2 ? x1 : x2) ||
          cy + r < (y1 < y2 ? y1 : y2) || cy - r > (y1 > y2 ? y1 : y2)) continue;
      if (avisoDe(x1, y1, x2, y2, P.d[p], cx, cy, r) >= need) g += P.w[p];
    }
    return g;
  }

  // marca como cobertas as ameacas desta torre; retorna o peso adicionado
  function marcarTorre(P, cob, cx, cy, r, need) {
    var g = 0;
    for (var p = 0; p < P.n; p++) {
      if (cob[p]) continue;
      var x1 = P.ex[p], y1 = P.ey[p], x2 = P.tx[p], y2 = P.ty[p];
      if (cx + r < (x1 < x2 ? x1 : x2) || cx - r > (x1 > x2 ? x1 : x2) ||
          cy + r < (y1 < y2 ? y1 : y2) || cy - r > (y1 > y2 ? y1 : y2)) continue;
      if (avisoDe(x1, y1, x2, y2, P.d[p], cx, cy, r) >= need) { cob[p] = 1; g += P.w[p]; }
    }
    return g;
  }

  function contarNoRaio(lista, cx, cy, r) {
    var n = 0, r2 = r * r;
    for (var i = 0; i < lista.length; i++) {
      var dx = lista[i][0] - cx, dy = lista[i][1] - cy;
      if (dx * dx + dy * dy <= r2) n++;
    }
    return n;
  }

  // nucleo da analise (sem tela): recebe os dados ja lidos e devolve o plano
  async function calcularPlano(dados, par, progresso) {
    var own = dados.own, enemies = dados.enemies;
    var sp = dados.velocidade;
    var minPorCampo = VEL_BASE[par.un] / (sp.worldSpeed * sp.unitSpeed);
    var need = par.tmin / minPorCampo;                  // campos de aviso exigidos
    var raio = RAIOS[par.nivel];

    var P = await montarPares(own, enemies, par.dmax, par.pontos);
    if (!P) return { erro: 'Muitas combinações inimigo × aldeia. Reduza o alcance dos inimigos ou a lista de tribos.' };
    if (!P.n || !(P.pesoTotal > 0)) return { erro: 'Nenhuma aldeia inimiga a até ' + par.dmax + ' campos das suas aldeias. Aumente o alcance ou confira a tag.' };

    var cob = new Uint8Array(P.n);
    var base = 0;
    dados.torres.forEach(function (t) {
      var xy = t.coord.split('|');
      base += marcarTorre(P, cob, parseInt(xy[0], 10), parseInt(xy[1], 10), RAIOS[t.nivel], need);
    });
    var cobBase = cob.slice();
    var cobertoAntes = base / P.pesoTotal;

    var comTorre = {};
    dados.torres.forEach(function (t) { comTorre[t.coord] = true; });
    var cands = dados.candidatas.filter(function (c) { return !comTorre[c[0] + '|' + c[1]]; });
    if (!cands.length) return { erro: 'Nenhuma aldeia candidata sem torre. Escolha outro grupo.' };

    var picks = [], ranking = [];
    var cobAtual = cobertoAntes;
    var usados = {};

    for (var rodada = 0; rodada < par.qtd; rodada++) {
      var melhor = null, lista = [];
      for (var i = 0; i < cands.length; i++) {
        var c = cands[i], coord = c[0] + '|' + c[1];
        if (usados[coord]) continue;
        var g = ganhoDaTorre(P, cob, c[0], c[1], raio, need);
        lista.push({ c: c, coord: coord, ganho: g });
        if (!melhor || g > melhor.ganho) melhor = lista[lista.length - 1];
        if (progresso) progresso((rodada + (i + 1) / cands.length) / par.qtd);
        if ((i & 3) === 0) await tick();
      }
      if (!melhor || !(melhor.ganho > 0)) break;

      if (rodada === 0) {
        lista.sort(function (a, b) { return b.ganho - a.ganho; });
        ranking = lista.slice(0, 8).map(function (it) {
          return {
            coord: it.coord, nome: it.c[3], pts: it.c[2], ganho: it.ganho / P.pesoTotal,
            minhas: contarNoRaio(own, it.c[0], it.c[1], raio), inimigas: contarNoRaio(enemies, it.c[0], it.c[1], raio)
          };
        });
      }

      var add = marcarTorre(P, cob, melhor.c[0], melhor.c[1], raio, need);
      var depois = cobAtual + add / P.pesoTotal;
      picks.push({
        coord: melhor.coord, nome: melhor.c[3], pts: melhor.c[2], nivel: par.nivel, raio: raio,
        ganho: add / P.pesoTotal, antes: cobAtual, depois: depois,
        minhas: contarNoRaio(own, melhor.c[0], melhor.c[1], raio), inimigas: contarNoRaio(enemies, melhor.c[0], melhor.c[1], raio)
      });
      cobAtual = depois;
      usados[melhor.coord] = true;
    }

    // quanto cada nivel renderia para a melhor aldeia (a partir das torres atuais)
    var niveis = [];
    if (picks.length) {
      var xy0 = picks[0].coord.split('|');
      [5, 10, 15, 20].forEach(function (nv) {
        niveis.push({ nivel: nv, ganho: ganhoDaTorre(P, cobBase, parseInt(xy0[0], 10), parseInt(xy0[1], 10), RAIOS[nv], need) / P.pesoTotal });
      });
    }

    return {
      pares: P.n, inimigas: enemies.length, minhas: own.length, candidatas: cands.length,
      cobertoAntes: cobertoAntes, picks: picks, ranking: ranking, niveis: niveis, need: need, minPorCampo: minPorCampo, raio: raio
    };
  }

  function renderizarAnalise(res, par, mundo, torresAtuais) {
    var box = $('#an_res').empty();

    box.append($('<div class="wt-base">').text(
      'Hoje, as suas ' + torresAtuais.length + ' torre(s) avisam com pelo menos ' + par.tmin + ' min de antecedência ' + pct(res.cobertoAntes) +
      ' das ameaças (' + pt(res.pares, 0) + ' combinações de aldeia inimiga → aldeia sua, a até ' + par.dmax + ' campos).'));

    if (!res.picks.length) {
      box.append($('<div class="wt-base">').text('Nenhuma aldeia candidata melhora a cobertura com esses ajustes. Tente um nível maior, menos aviso mínimo ou um alcance maior.'));
      return;
    }

    res.picks.forEach(function (p, i) {
      var card = $('<div class="wt-pick">');
      card.append($('<div class="t">').text((i === 0 ? '★ ' : '') + (i + 1) + 'ª torre: ' + p.coord + (p.nome ? ' — ' + p.nome : '')));
      card.append($('<div class="g">').text('+' + pct(p.ganho) + ' de cobertura (de ' + pct(p.antes) + ' para ' + pct(p.depois) + ')'));
      card.append($('<div class="d">').text('Nível ' + p.nivel + ' (raio ' + p.raio + ') · ' + pt(p.pts, 0) + ' pontos · ' + p.minhas + ' aldeia(s) sua(s) e ' + p.inimigas + ' inimiga(s) dentro do raio'));
      var b = $('<div class="b">');
      b.append($('<a class="wt-btn wt-b-ver">').attr('data-coord', p.coord).text('Ver no mapa'));
      b.append($('<a class="wt-btn wt-b-lista">').attr('data-coord', p.coord).attr('data-nivel', p.nivel).text('Adicionar à lista'));
      card.append(b);
      box.append(card);
    });

    if (res.picks.length > 1) {
      box.append($('<div class="b" style="margin-top:8px">').append($('<a class="wt-btn wt-b-plano">').text('Mostrar o plano todo no mapa')));
    }

    if (res.niveis.length) {
      var linha = $('<div class="wt-niv">').append(document.createTextNode('Ganho da 1ª aldeia por nível: '));
      res.niveis.forEach(function (n, i) {
        if (i) linha.append(document.createTextNode(' · '));
        linha.append($('<span>').text('nível ' + n.nivel + ': ')).append($('<b>').text('+' + pct(n.ganho)));
      });
      box.append(linha);
    }

    if (res.ranking.length) {
      box.append($('<div class="wt-sub">').text('Ranking da 1ª torre'));
      var tb = $('<table class="wt-rank"><thead><tr><th style="text-align:left">Aldeia</th><th>Ganho</th><th>Suas no raio</th><th>Inimigas no raio</th></tr></thead></table>');
      var tbody = $('<tbody>');
      res.ranking.forEach(function (r) {
        var tr = $('<tr>');
        tr.append($('<td class="l">').text(r.coord + (r.nome ? ' — ' + r.nome : '')));
        tr.append($('<td>').text('+' + pct(r.ganho)));
        tr.append($('<td>').text(r.minhas));
        tr.append($('<td>').text(r.inimigas));
        tbody.append(tr);
      });
      tb.append(tbody);
      box.append(tb);
    }

    var nota = 'Tribos: ' + mundo.achadas.join(', ') + ' (' + mundo.jogadores + ' jogadores, ' + pt(res.inimigas, 0) + ' aldeias). ' +
      'Aviso mínimo de ' + par.tmin + ' min = ' + pt(res.need, 1) + ' campos para ' + NOMES_UN[par.un] + '. ' +
      'Dados do mundo atualizados a cada hora pelo jogo.';
    box.append($('<div class="wt-hint">').text(nota));
  }

  async function executarAnalise() {
    if (analisando) return;
    analisando = true;
    $('#an_run').text('ANALISANDO...');
    try {
      var par = lerParametros();
      salvarParametros();
      if (!par.tags.length) { statusAn('Digite a tag da tribo inimiga (ex.: ABC). Pode ser mais de uma, separadas por vírgula.', 'erro'); return; }
      if (!(game_data.player && game_data.player.id)) { statusAn('Não consegui identificar o seu jogador.', 'erro'); return; }

      statusAn('Lendo os dados públicos do mundo...');
      var mundo = await carregarMundo(par.tags);
      if (mundo.faltam.length) {
        if (!mundo.achadas.length) { statusAn('Não achei nenhuma tribo com a(s) tag(s): ' + mundo.faltam.join(', ') + '. Confira a escrita.', 'erro'); return; }
      }
      if (!mundo.enemies.length) { statusAn('As tribos encontradas não têm aldeias no mapa.', 'erro'); return; }

      statusAn('Lendo as suas torres atuais...');
      var lido = await lerTorresDoJogo();

      // suas aldeias: dados do mundo + as que so aparecem na visao de edificios (conquistas recentes)
      var own = mundo.own.slice();
      var conhecidas = {};
      own.forEach(function (o) { conhecidas[o[0] + '|' + o[1]] = true; });
      lido.vilas.forEach(function (c) {
        if (!conhecidas[c]) { var xy = c.split('|'); own.push([parseInt(xy[0], 10), parseInt(xy[1], 10), 0, '']); conhecidas[c] = true; }
      });
      if (!own.length) { statusAn('Não encontrei as suas aldeias.', 'erro'); return; }

      // candidatas: o grupo escolhido (ou todas)
      var candidatas = own;
      if (par.grupo !== '0') {
        statusAn('Lendo as aldeias do grupo...');
        var set = await carregarAldeiasDoGrupo(par.grupo);
        if (!set) { statusAn('Não consegui carregar o grupo escolhido. Nada foi analisado.', 'erro'); return; }
        candidatas = own.filter(function (o) { return set.has(o[0] + '|' + o[1]); });
        if (!candidatas.length) { statusAn('Nenhuma aldeia do grupo foi encontrada.', 'erro'); return; }
      }

      var velocidade = await velocidadeMundo();
      statusAn('Analisando...');
      var res = await calcularPlano(
        { own: own, enemies: mundo.enemies, candidatas: candidatas, torres: lido.torres, velocidade: velocidade },
        par,
        function (f) { statusAn('Analisando... ' + Math.round(f * 100) + '%'); }
      );
      if (res.erro) { statusAn(res.erro, 'erro'); $('#an_res').empty(); return; }

      ultimoPlano = res;
      renderizarAnalise(res, par, mundo, lido.torres);
      var avisoTags = mundo.faltam.length ? ' (tag não encontrada: ' + mundo.faltam.join(', ') + ')' : '';
      var avisoGrupo = (par.grupo !== '0' && grupoViaPlanoB) ? ' Li o grupo pelo plano B (visão de edifícios): confira se as candidatas do ranking são mesmo do seu front.' : '';
      var avisoCol = lido.temColuna ? '' : ' Não achei a coluna da torre na visão de edifícios: considerei que você ainda não tem torres.';
      statusAn(res.picks.length ? ('Pronto: melhor posição ' + res.picks[0].coord + '.' + avisoTags + avisoGrupo + avisoCol) : ('Sem melhora encontrada.' + avisoTags + avisoGrupo + avisoCol), res.picks.length ? 'ok' : '');

      if (res.picks.length) {
        desenharPlano(res.picks);
        focarNoMapa(res.picks[0].coord);
      }
    } catch (e) {
      console.error('[WatchTower] erro na analise', e);
      statusAn('Erro na análise (veja o console, F12). Se o erro for de rede, tente de novo em instantes.', 'erro');
    } finally {
      analisando = false;
      $('#an_run').text('ANALISAR');
    }
  }

  // ------------------------- CLIQUE NO MAPA -------------------------

  function alternarClique() {
    cliqueAtivo = !cliqueAtivo;

    if (cliqueAtivo) {
      TWMap.map._handleClick = function (e) {
        var pos = this.coordByEvent(e);
        var vila = TWMap.villages[pos[0] * 1000 + pos[1]];
        if (vila && vila.id) {
          var coord = pos[0] + '|' + pos[1];
          var existe = lerLinhas().some(function (l) { return l.coord === coord; });
          if (!existe) {
            adicionarLinha({ coord: coord, wtLevel: '', wtColor: COR_PADRAO });
            salvar();
          }
        }
        return false;
      };
    } else {
      TWMap.map._handleClick = window.__wtCliqueOriginal;
    }

    $('#' + ID + ' .wt-b-clique').text('Clique no mapa: ' + (cliqueAtivo ? 'ligado' : 'desligado'));
  }

  // ------------------------- BOTOES -------------------------

  function ligarBotoes() {
    var w = $('#' + ID);

    w.on('click', '.wt-b-minhas', function () { importarDoJogo(); });

    w.on('click', '.wt-b-add', function () { adicionarLinha(null); });

    w.on('click', '.wt-b-exibir', function () { desenhar(); });

    w.on('click', '.wt-del', function () {
      $(this).closest('tr').remove();
      desenhar();
    });

    w.on('click', '.wt-b-limpar', function () {
      $('#wtLinhas').empty();
      desenhar();
    });

    w.on('click', '.wt-b-clique', alternarClique);

    w.on('click', '.wt-b-export', function () {
      copiar(JSON.stringify(lerLinhas())).then(function () {
        UI.SuccessMessage('Lista copiada para a área de transferência.');
      });
    });

    w.on('click', '.wt-b-import', function () {
      w.find('.wt-importar').toggle();
    });

    w.on('click', '.wt-b-import-ok', function () {
      var texto = w.find('.wt-importar textarea').val();
      var dados;
      try {
        dados = JSON.parse(texto);
      } catch (e) {
        UI.ErrorMessage('JSON inválido.');
        return;
      }
      if (!Array.isArray(dados)) {
        UI.ErrorMessage('O JSON precisa ser uma lista.');
        return;
      }

      var atuais = lerLinhas();
      var novos = 0;
      dados.slice(0, 500).forEach(function (bruto) {
        var it = normalizar(bruto);
        if (!it || !coordValida(it.coord)) return;
        if (atuais.some(function (c) { return c.coord === it.coord; })) return;
        atuais.push(it);
        novos++;
      });

      if (!novos) {
        UI.ErrorMessage('Nenhuma aldeia nova para importar.');
        return;
      }
      preencher(atuais);
      w.find('.wt-importar').hide();
      w.find('.wt-importar textarea').val('');
      UI.SuccessMessage(novos + ' aldeia(s) importada(s). Clique em Exibir.');
    });

    // analise
    w.on('click', '#an_run', function () { executarAnalise(); });

    w.on('click', '#an_clear', function () {
      MapSdk.circles = MapSdk.circles.filter(function (c) { return c.tag !== TAG_PLANO; });
      MapSdk.mapOverlay.reload();
    });

    w.on('click', '.wt-b-ver', function () {
      var coord = $(this).attr('data-coord');
      if (!ultimoPlano) return;
      var p = ultimoPlano.picks.filter(function (x) { return x.coord === coord; })[0];
      if (!p) return;
      desenharPlano([p]);
      focarNoMapa(coord);
    });

    w.on('click', '.wt-b-plano', function () {
      if (!ultimoPlano) return;
      desenharPlano(ultimoPlano.picks);
      focarNoMapa(ultimoPlano.picks[0].coord);
    });

    w.on('click', '.wt-b-lista', function () {
      var coord = $(this).attr('data-coord');
      var nivel = $(this).attr('data-nivel');
      var atuais = lerLinhas();
      if (atuais.some(function (l) { return l.coord === coord; })) {
        UI.InfoMessage('Essa aldeia já está na lista.');
        return;
      }
      adicionarLinha({ coord: coord, wtLevel: nivel, wtColor: COR_PLANO });
      desenhar();
    });

    w.on('input change', '[id^=an_]', function () {
      if (this.id === 'an_run' || this.id === 'an_clear') return;
      salvarParametros();
    });

    w.on('click', '.wt-min', function () { w.find('.wt-corpo').toggle(); });

    w.on('click', '.wt-fechar', function () {
      TWMap.map._handleClick = window.__wtCliqueOriginal;
      cliqueAtivo = false;
      w.remove();
    });
  }

  // ------------------------- INICIO -------------------------

  function iniciar() {
    montarWidget();
    var salvos = carregarSalvos().map(normalizar).filter(Boolean);
    preencher(salvos);
    restaurarParametros();
    ligarBotoes();
    carregarGruposAn();

    if (salvos.length) {
      desenhar();
    } else {
      importarDoJogo();
    }
  }
})();
