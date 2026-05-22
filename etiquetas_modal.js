// ─── ETIQUETAS MODAL — Totem Nube ─────────────────────────────────────────────
// Reutilizable desde stock_fase1.html y recepcion.html
// Uso: abrirModalEtiquetas(etiquetas, callbackImprimir)

(function(){

  // ─── ESTILOS ───────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #tn-etiq-overlay{
      position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9000;
      display:flex;align-items:center;justify-content:center;
    }
    #tn-etiq-modal{
      background:#0d1117;border:1px solid rgba(255,255,255,0.12);border-radius:14px;
      padding:24px;width:680px;max-width:96vw;max-height:92vh;overflow-y:auto;
      font-family:'DM Sans',sans-serif;color:#e8eaf0;
    }
    #tn-etiq-modal h3{font-size:15px;font-weight:700;margin:0 0 4px;}
    .etiq-sub{font-size:12px;color:#7a8099;margin-bottom:16px;font-family:'DM Mono',monospace;}
    .etiq-paso{font-size:9px;color:#3a4055;text-transform:uppercase;letter-spacing:0.15em;font-family:'DM Mono',monospace;margin-bottom:10px;}
    .etiq-paso span{color:#00e5a0;}

    /* PASO 1 — lista */
    .etiq-lista{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;max-height:300px;overflow-y:auto;}
    .etiq-item{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#111620;border:1px solid rgba(255,255,255,0.06);border-radius:8px;cursor:pointer;transition:all 0.15s;}
    .etiq-item:hover{border-color:rgba(0,229,160,0.3);}
    .etiq-item.sel{border-color:rgba(0,229,160,0.5);background:rgba(0,229,160,0.06);}
    .etiq-item-check{width:16px;height:16px;border:1.5px solid rgba(255,255,255,0.2);border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;}
    .etiq-item.sel .etiq-item-check{background:#00e5a0;border-color:#00e5a0;color:#000;font-size:10px;}
    .etiq-item-nombre{font-size:12px;font-weight:600;flex:1;}
    .etiq-item-var{font-size:11px;color:#ffb340;font-family:'DM Mono',monospace;}
    .etiq-item-uid{font-size:10px;color:#3a4055;font-family:'DM Mono',monospace;}
    .etiq-sel-actions{display:flex;gap:8px;margin-bottom:16px;}
    .etiq-link{font-size:11px;color:#4d9fff;cursor:pointer;font-family:'DM Mono',monospace;}
    .etiq-link:hover{text-decoration:underline;}

    /* PASO 2 — grilla */
    .etiq-grilla-wrap{background:#111620;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;margin-bottom:16px;}
    .etiq-grilla{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
    .etiq-celda{height:80px;border:1.5px dashed rgba(255,255,255,0.08);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;position:relative;overflow:hidden;}
    .etiq-celda:hover{border-color:rgba(77,159,255,0.5);background:rgba(77,159,255,0.04);}
    .etiq-celda.asignada{border:1.5px solid rgba(0,229,160,0.5);background:rgba(0,229,160,0.08);cursor:pointer;}
    .etiq-celda.asignada:hover{background:rgba(229,57,53,0.08);border-color:rgba(229,57,53,0.4);}
    .etiq-celda-num{position:absolute;top:4px;right:7px;font-size:9px;color:rgba(255,255,255,0.15);font-family:'DM Mono',monospace;}
    .etiq-celda-empty{font-size:11px;color:#3a4055;font-family:'DM Mono',monospace;}
    .etiq-celda-content{text-align:center;padding:4px 8px;}
    .etiq-celda-cnombre{font-size:10px;font-weight:600;color:#00e5a0;line-height:1.2;}
    .etiq-celda-cvar{font-size:9px;color:#ffb340;margin-top:2px;}
    .etiq-celda-cremove{font-size:9px;color:rgba(229,57,53,0.7);margin-top:3px;}

    /* picker */
    #tn-etiq-picker{
      position:fixed;background:#0d1117;border:1px solid rgba(255,255,255,0.15);border-radius:10px;
      padding:10px;z-index:9100;min-width:220px;max-height:280px;overflow-y:auto;
      box-shadow:0 8px 32px rgba(0,0,0,0.5);
    }
    .picker-title{font-size:10px;color:#7a8099;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;}
    .picker-item{padding:8px 10px;border-radius:6px;cursor:pointer;transition:background 0.1s;}
    .picker-item:hover{background:rgba(0,229,160,0.1);}
    .picker-nombre{font-size:12px;font-weight:600;color:#e8eaf0;}
    .picker-var{font-size:10px;color:#ffb340;font-family:'DM Mono',monospace;}
    .picker-cancel{padding:8px 10px;border-radius:6px;cursor:pointer;border-top:1px solid rgba(255,255,255,0.06);margin-top:4px;font-size:11px;color:#7a8099;text-align:center;}
    .picker-cancel:hover{background:rgba(255,255,255,0.05);}

    /* acciones */
    .etiq-actions{display:flex;gap:8px;margin-top:4px;}
    .etiq-btn{flex:1;padding:10px;border-radius:8px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
    .etiq-btn-back{background:transparent;color:#7a8099;border:1px solid rgba(255,255,255,0.1);}
    .etiq-btn-back:hover{background:rgba(255,255,255,0.05);}
    .etiq-btn-print{background:#00e5a0;color:#000;}
    .etiq-btn-print:hover{background:#00c896;}
    .etiq-btn-print:disabled{background:#1a2a20;color:#3a5040;cursor:default;}
    .etiq-btn-cancel{background:transparent;color:#7a8099;border:1px solid rgba(255,255,255,0.1);}
    .etiq-btn-cancel:hover{background:rgba(255,255,255,0.05);}
    .etiq-aviso{font-size:11px;color:#ffb340;margin-top:8px;text-align:center;font-family:'DM Mono',monospace;min-height:16px;}
  `;
  document.head.appendChild(style);

  // ─── ESTADO ────────────────────────────────────────────────────────────────
  let _etiquetas = [];       // todas las disponibles
  let _seleccionadas = new Set(); // indices seleccionados en paso 1
  let _grilla = {};          // posicion → etiquetaIdx  {0: 2, 3: 5, ...}
  let _celdaActiva = null;
  let _callback = null;
  let _paso = 1;

  // ─── ABRIR MODAL ───────────────────────────────────────────────────────────
  window.abrirModalEtiquetas = function(etiquetas, callback){
    _etiquetas = etiquetas;
    _callback = callback;
    _seleccionadas = new Set(etiquetas.map((_,i)=>i)); // todas preseleccionadas
    _grilla = {};
    _paso = 1;

    renderModal();
  };

  function renderModal(){
    const existing = document.getElementById('tn-etiq-overlay');
    if(existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'tn-etiq-overlay';
    overlay.innerHTML = `<div id="tn-etiq-modal">
      <h3>🏷 Imprimir etiquetas</h3>
      <div class="etiq-sub">Hoja 2 × 4</div>
      <div id="tn-etiq-body"></div>
    </div>`;
    document.body.appendChild(overlay);

    renderPaso();
  }

  function renderPaso(){
    const body = document.getElementById('tn-etiq-body');
    if(_paso === 1) body.innerHTML = renderPaso1();
    else body.innerHTML = renderPaso2();
  }

  // ─── PASO 1: seleccionar etiquetas ─────────────────────────────────────────
  function renderPaso1(){
    const items = _etiquetas.map((et,i)=>{
      const sel = _seleccionadas.has(i);
      return `<div class="etiq-item ${sel?'sel':''}" onclick="tnToggleItem(${i})">
        <div class="etiq-item-check">${sel?'✓':''}</div>
        <div style="flex:1;">
          <div class="etiq-item-nombre">${et.nombre}</div>
          ${et.variante?`<div class="etiq-item-var">● ${et.variante}</div>`:''}
          <div class="etiq-item-uid">${et.uid}</div>
        </div>
      </div>`;
    }).join('');

    const nSel = _seleccionadas.size;
    return `
      <div class="etiq-paso">Paso <span>1 de 2</span> — Seleccioná las etiquetas a imprimir</div>
      <div class="etiq-sel-actions">
        <span class="etiq-link" onclick="tnSelectAll(true)">✓ Todas</span>
        &nbsp;·&nbsp;
        <span class="etiq-link" onclick="tnSelectAll(false)">✗ Ninguna</span>
      </div>
      <div class="etiq-lista">${items}</div>
      <div class="etiq-actions">
        <button class="etiq-btn etiq-btn-cancel" onclick="cerrarModalEtiquetas()">Cancelar</button>
        <button class="etiq-btn etiq-btn-print" ${nSel===0?'disabled':''} onclick="tnIrPaso2()">
          Continuar (${nSel} etiqueta${nSel!==1?'s':''}) →
        </button>
      </div>`;
  }

  // ─── PASO 2: asignar posiciones ────────────────────────────────────────────
  function renderPaso2(){
    const total = _seleccionadas.size;
    const totalHojas = Math.max(1, Math.ceil(total / 8));
    let hojasHTML = '';
    for(let h=0;h<totalHojas;h++){
      let celdasHTML = '';
      for(let p=0;p<8;p++){
        const posGlobal = h*8 + p;
        const asignada = Object.entries(_grilla).find(([idx,pos])=>pos===posGlobal);
        if(asignada){
          const et = _etiquetas[parseInt(asignada[0])];
          celdasHTML += `<div class="etiq-celda asignada" onclick="tnClickCelda(${posGlobal})" title="Click para quitar">
            <span class="etiq-celda-num">${posGlobal+1}</span>
            <div class="etiq-celda-content">
              <div class="etiq-celda-cnombre">${et.nombre.length>20?et.nombre.substring(0,18)+'…':et.nombre}</div>
              ${et.variante?`<div class="etiq-celda-cvar">● ${et.variante}</div>`:''}
              <div class="etiq-celda-cremove">✕ quitar</div>
            </div>
          </div>`;
        } else {
          celdasHTML += `<div class="etiq-celda" onclick="tnClickCelda(${posGlobal})">
            <span class="etiq-celda-num">${posGlobal+1}</span>
            <span class="etiq-celda-empty">+ asignar</span>
          </div>`;
        }
      }
      hojasHTML += `<div style="margin-bottom:${h<totalHojas-1?'12px':'0'};">
        ${totalHojas>1?`<div style="font-size:9px;color:#3a4055;font-family:'DM Mono',monospace;text-transform:uppercase;margin-bottom:6px;">Hoja ${h+1} de ${totalHojas}</div>`:''}
        <div class="etiq-grilla">${celdasHTML}</div>
      </div>`;
    }

    const asignadas = Object.keys(_grilla).length;
    const sinAsignar = total - asignadas;

    return `
      <div class="etiq-paso" style="display:flex;justify-content:space-between;align-items:center;">
        <span>Paso <span style="color:#00e5a0;">2 de 2</span> — Asigná cada etiqueta a una posición</span>
        <button onclick="tnAsignarTodas()" style="font-size:11px;padding:4px 12px;background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.3);color:#00e5a0;border-radius:6px;cursor:pointer;font-family:'DM Mono',monospace;">✓ Asignar todas</button>
      </div>
      <div class="etiq-grilla-wrap">${hojasHTML}</div>
      <div class="etiq-aviso">${sinAsignar>0?`⚠ ${sinAsignar} etiqueta${sinAsignar!==1?'s':''} sin posición`:''}</div>
      <div class="etiq-actions">
        <button class="etiq-btn etiq-btn-back" onclick="tnVolverPaso1()">← Volver</button>
        <button class="etiq-btn etiq-btn-print" ${asignadas===0?'disabled':''} onclick="tnConfirmarImpresion()">
          🖨 Imprimir (${asignadas} posicionada${asignadas!==1?'s':''})
        </button>
      </div>`;
  }

  // ─── HANDLERS PASO 1 ───────────────────────────────────────────────────────
  window.tnToggleItem = function(idx){
    if(_seleccionadas.has(idx)) _seleccionadas.delete(idx);
    else _seleccionadas.add(idx);
    renderPaso();
  };

  window.tnSelectAll = function(sel){
    if(sel) _etiquetas.forEach((_,i)=>_seleccionadas.add(i));
    else _seleccionadas.clear();
    renderPaso();
  };

  window.tnIrPaso2 = function(){
    _grilla = {};
    _paso = 2;
    renderPaso();
  };

  window.tnVolverPaso1 = function(){
    _paso = 1;
    renderPaso();
  };

  // ─── HANDLERS PASO 2 ───────────────────────────────────────────────────────
  window.tnAsignarTodas = function(){
    _grilla = {};
    const selArray = [..._seleccionadas];
    const totalHojas = Math.ceil(selArray.length / 8);
    selArray.forEach((etiqIdx, i) => {
      _grilla[etiqIdx] = i; // posición global (hoja * 8 + pos)
    });
    renderPaso();
  };

  window.tnClickCelda = function(pos){
    cerrarPicker();

    // Si la celda ya tiene etiqueta → quitar
    const asignada = Object.entries(_grilla).find(([idx,p])=>p===pos);
    if(asignada){
      delete _grilla[asignada[0]];
      renderPaso();
      return;
    }

    // Etiquetas seleccionadas sin posición asignada
    const sinPosicion = [..._seleccionadas].filter(idx=>!Object.keys(_grilla).map(Number).includes(idx));
    if(!sinPosicion.length) return;

    // Mostrar picker
    const celda = document.querySelectorAll('.etiq-celda')[pos];
    if(!celda) return;

    const picker = document.createElement('div');
    picker.id = 'tn-etiq-picker';
    picker.innerHTML = `<div class="picker-title">Asignar a posición ${pos+1}</div>` +
      sinPosicion.map(idx=>{
        const et = _etiquetas[idx];
        return `<div class="picker-item" onclick="tnAsignar(${idx},${pos})">
          <div class="picker-nombre">${et.nombre}</div>
          ${et.variante?`<div class="picker-var">● ${et.variante}</div>`:''}
        </div>`;
      }).join('') +
      `<div class="picker-cancel" onclick="cerrarPicker()">Cancelar</div>`;

    // Posicionar picker cerca de la celda
    const rect = celda.getBoundingClientRect();
    picker.style.top = (rect.bottom + 6) + 'px';
    picker.style.left = rect.left + 'px';
    document.body.appendChild(picker);

    // Cerrar al click fuera
    setTimeout(()=>document.addEventListener('click', cerrarPickerFuera), 10);
  };

  window.tnAsignar = function(etiqIdx, pos){
    _grilla[etiqIdx] = pos;
    cerrarPicker();
    renderPaso();
  };

  function cerrarPicker(){
    const p = document.getElementById('tn-etiq-picker');
    if(p) p.remove();
    document.removeEventListener('click', cerrarPickerFuera);
  }

  function cerrarPickerFuera(e){
    const picker = document.getElementById('tn-etiq-picker');
    if(picker && !picker.contains(e.target)) cerrarPicker();
  }

  // ─── CONFIRMAR ─────────────────────────────────────────────────────────────
  window.tnConfirmarImpresion = function(){
    const etiquetasConPos = Object.entries(_grilla).map(([idx,pos])=>({
      ..._etiquetas[parseInt(idx)],
      _pos: pos % 8,
      _hoja: Math.floor(pos / 8)
    }));
    cerrarModalEtiquetas();
    if(_callback) _callback(etiquetasConPos);
  };

  // ─── CERRAR ────────────────────────────────────────────────────────────────
  window.cerrarModalEtiquetas = function(){
    cerrarPicker();
    const overlay = document.getElementById('tn-etiq-overlay');
    if(overlay) overlay.remove();
  };

  // ─── IMPRIMIR (función compartida) ────────────────────────────────────────
  window.tnImprimirEtiquetas = function(etiquetas){
    const fecha = new Date().toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'2-digit'});
    const baseUrl = 'https://ingpussetto-web.github.io/totem-stock/scan.html?uid=';

    const maxHoja = Math.max(...etiquetas.map(e=>e._hoja||0));
    let sheetsHTML = '';
    let qrScripts = '';

    for(let h=0;h<=maxHoja;h++){
      let celdasHTML = '';
      for(let p=0;p<8;p++){
        const et = etiquetas.find(e=>(e._hoja||0)===h && e._pos===p);
        if(et){
          const safeId = et.uid.replace(/[^a-z0-9]/gi,'_');
          celdasHTML += `<div class="label">
            <div class="label-header">
              <div class="label-brand">Totem Nube</div>
              <div class="label-estado">EN STOCK</div>
            </div>
            <div class="label-nombre">${et.nombre}</div>
            ${et.variante?`<div class="label-variante">● ${et.variante}</div>`:''}
            <div class="label-body">
              <div id="qrlabel-${safeId}"></div>
              <div class="label-uid-wrap">
                <div class="label-uid-label">UID</div>
                <div class="label-uid">${et.uid}</div>
              </div>
            </div>
            <div class="label-footer">
              <span>Impreso: ${fecha}</span>
              <span>#${String(et.num||p+1).padStart(4,'0')}</span>
            </div>
          </div>`;
          qrScripts += `new QRCode(document.getElementById('qrlabel-${safeId}'),{text:'${baseUrl}'+encodeURIComponent('${et.uid}'),width:72,height:72,colorDark:'#000',colorLight:'#fff',correctLevel:QRCode.CorrectLevel.M});\n`;
        } else {
          celdasHTML += `<div class="label-vacia"></div>`;
        }
      }
      sheetsHTML += `<div class="label-sheet" style="${h<maxHoja?'page-break-after:always;':''}">${celdasHTML}</div>`;
    }

    const win = window.open('','_blank','width=900,height=700');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Etiquetas Totem Nube</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
      <style>
        body{margin:0;padding:0;font-family:Arial,sans-serif;}
        .label-sheet{width:210mm;display:grid;grid-template-columns:repeat(2,1fr);gap:0;row-gap:0;}
        .label{width:105mm;height:74mm;border:0.5pt solid #ddd;padding:3mm 3mm 2mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;page-break-inside:avoid;box-sizing:border-box;overflow:hidden;text-align:center;}
        .label-vacia{width:105mm;height:74mm;box-sizing:border-box;}
        .label-header{width:100%;display:flex;justify-content:space-between;align-items:center;margin-bottom:1mm;}
        .label-brand{font-size:7pt;font-weight:700;color:#666;letter-spacing:0.08em;text-transform:uppercase;}
        .label-estado{font-size:6pt;background:#e8f5e9;color:#2e7d32;border:0.5pt solid #a5d6a7;border-radius:2mm;padding:0.5mm 2mm;font-weight:700;}
        .label-nombre{font-size:10pt;font-weight:700;color:#111;line-height:1.2;margin:0 0 1mm;}
        .label-variante{font-size:8pt;color:#555;font-weight:600;margin-bottom:1mm;}
        .label-body{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:2mm;}
        .label-uid-wrap{text-align:center;}
        .label-uid-label{font-size:5pt;color:#aaa;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1mm;}
        .label-uid{font-size:6.5pt;font-family:'Courier New',monospace;color:#444;word-break:break-all;line-height:1.2;}
        .label-footer{width:100%;display:flex;justify-content:space-between;border-top:0.5pt solid #eee;padding-top:1mm;font-size:5pt;color:#aaa;}
        @media print{body{padding:0;margin:0;}@page{size:A4;margin:0;}}
      </style>
    </head><body>
      ${sheetsHTML}
      <script>${qrScripts}setTimeout(()=>window.print(),1000);<\/script>
    </body></html>`);
    win.document.close();
  };

})();
