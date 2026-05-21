// ─── ETIQUETAS MODAL — Totem Nube ─────────────────────────────────────────────
// Reutilizable desde stock_fase1.html y recepcion.html
// Uso: abrirModalEtiquetas(etiquetas, callbackImprimir)
// etiquetas: [{uid, nombre, variante, num}]
// callbackImprimir: function(etiquetasSeleccionadas, posiciones) → genera la impresión

(function(){

  // ─── ESTILOS ───────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #tn-etiq-overlay{
      position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9000;
      display:flex;align-items:center;justify-content:center;
    }
    #tn-etiq-modal{
      background:#0d1117;border:1px solid rgba(255,255,255,0.12);border-radius:14px;
      padding:24px;width:520px;max-width:95vw;max-height:90vh;overflow-y:auto;
      font-family:'DM Sans',sans-serif;color:#e8eaf0;
    }
    #tn-etiq-modal h3{
      font-size:15px;font-weight:700;margin:0 0 4px;
    }
    #tn-etiq-modal .etiq-sub{
      font-size:12px;color:#7a8099;margin-bottom:20px;font-family:'DM Mono',monospace;
    }
    .etiq-contador{
      display:inline-block;background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.3);
      color:#00e5a0;font-family:'DM Mono',monospace;font-size:12px;
      padding:4px 12px;border-radius:20px;margin-bottom:16px;
    }
    .etiq-hoja{
      display:grid;grid-template-columns:repeat(2,1fr);gap:6px;
      background:#111620;border:1px solid rgba(255,255,255,0.06);
      border-radius:8px;padding:12px;margin-bottom:12px;
    }
    .etiq-celda{
      height:72px;border:1.5px dashed rgba(255,255,255,0.1);border-radius:6px;
      display:flex;align-items:center;justify-content:center;cursor:pointer;
      transition:all 0.15s;position:relative;overflow:hidden;
      font-size:10px;color:#3a4055;font-family:'DM Mono',monospace;
      user-select:none;
    }
    .etiq-celda:hover{border-color:rgba(0,229,160,0.4);background:rgba(0,229,160,0.04);}
    .etiq-celda.ocupada{
      border:1.5px solid rgba(0,229,160,0.5);background:rgba(0,229,160,0.08);
      color:#00e5a0;cursor:default;
    }
    .etiq-celda.ocupada:hover{border-color:rgba(0,229,160,0.5);background:rgba(0,229,160,0.08);}
    .etiq-celda.seleccionada{
      border:1.5px solid #00e5a0;background:rgba(0,229,160,0.15);color:#00e5a0;cursor:pointer;
    }
    .etiq-celda.seleccionada:hover{background:rgba(0,229,160,0.2);}
    .etiq-celda-num{font-size:9px;color:rgba(255,255,255,0.15);position:absolute;top:4px;right:6px;}
    .etiq-celda-label{text-align:center;padding:4px;line-height:1.3;}
    .etiq-celda-nombre{font-size:9px;font-weight:600;color:inherit;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .etiq-celda-var{font-size:8px;color:#ffb340;margin-top:1px;}
    .etiq-actions{display:flex;gap:8px;margin-top:16px;}
    .etiq-btn{flex:1;padding:10px;border-radius:8px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
    .etiq-btn-print{background:#00e5a0;color:#000;}
    .etiq-btn-print:hover{background:#00c896;}
    .etiq-btn-print:disabled{background:#1a2a20;color:#3a5040;cursor:default;}
    .etiq-btn-cancel{background:transparent;color:#7a8099;border:1px solid rgba(255,255,255,0.1);}
    .etiq-btn-cancel:hover{background:rgba(255,255,255,0.05);}
    .etiq-aviso{font-size:11px;color:#7a8099;margin-top:8px;text-align:center;font-family:'DM Mono',monospace;}
  `;
  document.head.appendChild(style);

  // ─── ESTADO GLOBAL ─────────────────────────────────────────────────────────
  let _etiquetas = [];
  let _posiciones = []; // [{hoja, pos, etiquetaIdx}]
  let _callback = null;

  // ─── ABRIR MODAL ───────────────────────────────────────────────────────────
  window.abrirModalEtiquetas = function(etiquetas, callback){
    _etiquetas = etiquetas;
    _callback = callback;
    _posiciones = [];

    // Calcular hojas necesarias (8 por hoja)
    const totalHojas = Math.ceil(etiquetas.length / 8);

    // Construir HTML del modal
    let hojasHTML = '';
    for(let h=0;h<totalHojas;h++){
      let celdasHTML = '';
      for(let p=0;p<8;p++){
        const etiqIdx = h*8 + p;
        const ocupada = etiqIdx < etiquetas.length;
        const et = ocupada ? etiquetas[etiqIdx] : null;
        celdasHTML += `<div class="etiq-celda ${ocupada?'seleccionada':''}"
          data-hoja="${h}" data-pos="${p}" data-etiq-idx="${etiqIdx}"
          onclick="tnToggleCelda(this)">
          <span class="etiq-celda-num">${p+1}</span>
          ${ocupada ? `<div class="etiq-celda-label">
            <div class="etiq-celda-nombre">${et.nombre}</div>
            ${et.variante?`<div class="etiq-celda-var">● ${et.variante}</div>`:''}
          </div>` : '<span style="font-size:18px;opacity:0.15;">+</span>'}
        </div>`;
      }
      hojasHTML += `<div style="margin-bottom:8px;">
        ${totalHojas>1?`<div style="font-size:10px;color:#3a4055;font-family:'DM Mono',monospace;margin-bottom:6px;">HOJA ${h+1}</div>`:''}
        <div class="etiq-hoja">${celdasHTML}</div>
      </div>`;
    }

    const overlay = document.createElement('div');
    overlay.id = 'tn-etiq-overlay';
    overlay.innerHTML = `
      <div id="tn-etiq-modal">
        <h3>🏷 Seleccionar posiciones</h3>
        <div class="etiq-sub">Hoja de etiquetas 2 × 4</div>
        <div class="etiq-contador" id="tn-etiq-contador">${etiquetas.length} etiqueta${etiquetas.length!==1?'s':''} a imprimir</div>
        <div id="tn-etiq-hojas">${hojasHTML}</div>
        <div class="etiq-aviso" id="tn-etiq-aviso"></div>
        <div class="etiq-actions">
          <button class="etiq-btn etiq-btn-cancel" onclick="cerrarModalEtiquetas()">Cancelar</button>
          <button class="etiq-btn etiq-btn-print" id="tn-etiq-btn-print" onclick="tnConfirmarImpresion()">
            🖨 Imprimir (${etiquetas.length} seleccionadas)
          </button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    // Inicializar posiciones con las celdas preseleccionadas
    _posiciones = etiquetas.map((et,i)=>({hoja:Math.floor(i/8), pos:i%8, etiquetaIdx:i}));
    actualizarContador();
  };

  // ─── TOGGLE CELDA ──────────────────────────────────────────────────────────
  window.tnToggleCelda = function(el){
    const hoja = parseInt(el.dataset.hoja);
    const pos = parseInt(el.dataset.pos);
    const etiqIdx = parseInt(el.dataset.etiqIdx);

    // Celda con etiqueta asignada — toggle selección
    if(etiqIdx < _etiquetas.length){
      const existeIdx = _posiciones.findIndex(p=>p.etiquetaIdx===etiqIdx);
      if(existeIdx>=0){
        _posiciones.splice(existeIdx,1);
        el.classList.remove('seleccionada');
        el.classList.add('etiq-celda');
      } else {
        _posiciones.push({hoja, pos, etiquetaIdx});
        el.classList.add('seleccionada');
      }
    } else {
      // Celda vacía — no hacer nada por ahora
      return;
    }
    actualizarContador();
  };

  // ─── ACTUALIZAR CONTADOR ───────────────────────────────────────────────────
  function actualizarContador(){
    const sel = _posiciones.length;
    const total = _etiquetas.length;
    const btn = document.getElementById('tn-etiq-btn-print');
    const aviso = document.getElementById('tn-etiq-aviso');
    if(btn){
      btn.textContent = `🖨 Imprimir (${sel} seleccionadas)`;
      btn.disabled = sel === 0;
    }
    if(aviso){
      if(sel < total){
        aviso.textContent = `⚠ ${total-sel} etiqueta${total-sel!==1?'s':''} sin posición asignada`;
        aviso.style.color = '#ffb340';
      } else {
        aviso.textContent = '';
      }
    }
  }

  // ─── CONFIRMAR IMPRESIÓN ───────────────────────────────────────────────────
  window.tnConfirmarImpresion = function(){
    if(!_posiciones.length) return;
    // Ordenar por hoja y posición
    const ordenadas = [..._posiciones].sort((a,b)=>a.hoja!==b.hoja?a.hoja-b.hoja:a.pos-b.pos);
    const etiquetasAImprimir = ordenadas.map(p=>({..._etiquetas[p.etiquetaIdx], _pos:p.pos, _hoja:p.hoja}));
    cerrarModalEtiquetas();
    if(_callback) _callback(etiquetasAImprimir);
  };

  // ─── CERRAR MODAL ──────────────────────────────────────────────────────────
  window.cerrarModalEtiquetas = function(){
    const overlay = document.getElementById('tn-etiq-overlay');
    if(overlay) overlay.remove();
  };

  // ─── IMPRIMIR ETIQUETAS (función compartida) ───────────────────────────────
  window.tnImprimirEtiquetas = function(etiquetas){
    const fecha = new Date().toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'2-digit'});
    const baseUrl = 'https://ingpussetto-web.github.io/totem-stock/scan.html?uid=';

    // Agrupar por hoja según _pos y _hoja
    const maxHoja = Math.max(...etiquetas.map(e=>e._hoja||0));
    let hojasHTML = '';
    let qrScripts = '';

    for(let h=0;h<=maxHoja;h++){
      const etiqHoja = etiquetas.filter(e=>(e._hoja||0)===h);
      if(!etiqHoja.length) continue;

      // Crear grilla de 8 posiciones, algunas vacías
      let celdasHTML = '';
      for(let p=0;p<8;p++){
        const et = etiqHoja.find(e=>e._pos===p);
        if(et){
          const safeId = et.uid.replace(/[^a-z0-9]/gi,'_');
          celdasHTML += `<div class="label">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div class="label-brand">Totem Nube</div>
                <div class="label-estado">EN STOCK</div>
              </div>
              <div class="label-nombre">${et.nombre}</div>
              ${et.variante?`<div class="label-variante">Color: ${et.variante}</div>`:''}
            </div>
            <div class="label-body">
              <div id="qrlabel-${safeId}"></div>
              <div style="flex:1;">
                <div class="label-uid-label">UID</div>
                <div class="label-uid">${et.uid}</div>
              </div>
            </div>
            <div class="label-footer">
              <span>Impreso: ${fecha}</span>
              <span>#${String(et.num||p+1).padStart(4,'0')}</span>
            </div>
          </div>`;
          qrScripts += `new QRCode(document.getElementById('qrlabel-${safeId}'),{text:'${baseUrl}'+encodeURIComponent('${et.uid}'),width:80,height:80,colorDark:'#000',colorLight:'#fff',correctLevel:QRCode.CorrectLevel.M});\n`;
        } else {
          celdasHTML += `<div class="label label-vacia"></div>`;
        }
      }
      hojasHTML += `<div class="label-sheet" style="${h<maxHoja?'page-break-after:always;':''}">${celdasHTML}</div>`;
    }

    const win = window.open('','_blank','width=900,height=700');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Etiquetas Totem Nube</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
      <style>
        body{font-family:Arial,sans-serif;background:#fff;margin:0;padding:8mm;}
        .label-sheet{width:200mm;display:grid;grid-template-columns:repeat(2,1fr);gap:0;row-gap:0;}
        .label{width:100mm;height:71.75mm;border:0.5pt solid #ccc;border-radius:2mm;padding:3mm;display:flex;flex-direction:column;justify-content:space-between;page-break-inside:avoid;}
        .label-vacia{width:100mm;height:71.75mm;page-break-inside:avoid;}
        .label-brand{font-size:7pt;font-weight:700;color:#555;letter-spacing:0.05em;text-transform:uppercase;}
        .label-nombre{font-size:9pt;font-weight:700;color:#111;line-height:1.2;margin:2mm 0 1mm;}
        .label-variante{font-size:8pt;color:#444;margin-bottom:1mm;}
        .label-body{display:flex;align-items:center;gap:3mm;flex:1;}
        .label-uid-label{font-size:5.5pt;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5mm;}
        .label-uid{font-size:7pt;font-family:'Courier New',monospace;color:#333;word-break:break-all;line-height:1.3;}
        .label-footer{display:flex;justify-content:space-between;border-top:0.5pt solid #eee;padding-top:1mm;margin-top:1mm;font-size:5.5pt;color:#888;}
        .label-estado{font-size:6pt;background:#e8f5e9;color:#2e7d32;border:0.5pt solid #a5d6a7;border-radius:2mm;padding:1mm 2mm;font-weight:600;}
        @media print{body{padding:0;margin:0;}}
      </style>
    </head><body>
      ${hojasHTML}
      <script>${qrScripts}setTimeout(()=>window.print(),1000);<\/script>
    </body></html>`);
    win.document.close();
  };

})();
