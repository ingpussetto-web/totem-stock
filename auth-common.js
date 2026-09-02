// ─── AUTENTICACIÓN COMPARTIDA — TOTEM NUBE ─────────────────────────────────
// Incluir en cada módulo así, ANTES de usar cualquier función de esta lista:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="auth-common.js"></script>
//
// Funciones que expone:
//   requireAuth()   -> llamar al arrancar el módulo. Si no hay sesión válida,
//                      redirige a login.html y no devuelve nada usable.
//                      Si hay sesión, devuelve { id, nombre, email, rol, activo }
//                      y lo deja también en window.currentUser.
//   requireAuthServicio(email, password) -> para pantallas SIN una persona
//                      sentada (Dashboard TV, Escaneo QR por celular): loguea
//                      automáticamente con una cuenta de servicio embebida en
//                      el propio módulo, en vez de pedir usuario/clave. No
//                      redirige a login.html si falla — devuelve null y el
//                      módulo decide cómo avisar (no tiene sentido mandar a
//                      un televisor a una pantalla de login).
//   cerrarSesion()  -> cierra sesión y vuelve a login.html.
//   authHeaders()   -> headers listos para usar en fetch() a Supabase
//                      (apikey + Authorization con el token del usuario logueado).
//
// Nota: esta clave "anon" es pública por diseño de Supabase — lo que protege
// los datos de verdad son las políticas de RLS + que el usuario esté logueado,
// no que esta clave esté escondida.

const SUPABASE_URL = 'https://nkkwukcgxyhudprlhjjw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra3d1a2NneHlodWRwcmxoamp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMjAzNTQsImV4cCI6MjA5MzU5NjM1NH0.NGDzPGnChtqYbnjcIZhso1CUozqG_JQ7TyElKSesy5s';

const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.currentUser = null;

// Catálogo de módulos "de trabajo" del sistema — se usa para armar el
// checklist de permisos en usuarios.html y las tarjetas del hub de producción
// (index_produccion.html). Agregar un módulo nuevo acá alcanza para que
// aparezca en ambos lugares.
const MODULOS_CATALOGO = [
  { file: 'produccion.html',                 label: 'Producción',              icon: '🔧', desc: 'Checklist de insumos y escaneo por OP' },
  { file: 'recepcion.html',                  label: 'Recepción',               icon: '📥', desc: 'Ingreso de insumos comprados al stock' },
  { file: 'stock_fase1.html',                label: 'Stock',                   icon: '📦', desc: 'Catálogo, cantidades y unidades físicas' },
  { file: 'conteo_fisico.html',              label: 'Conteo Físico',           icon: '🔢', desc: 'Verificación y ajuste de stock real vs sistema' },
  { file: 'calculador_totem_nube_v16.html',  label: 'Cotizador',               icon: '💰', desc: 'Cotizaciones, costeo y detalle de ventas' },
  { file: 'ops_ventas.html',                 label: 'Órdenes de Producción',   icon: '✅', desc: 'Revisar BOM, confirmar y liberar OPs' },
  { file: 'compras.html',                    label: 'Compras',                 icon: '🛒', desc: 'Órdenes de compra y proveedores' },
  { file: 'inventario_inicial.html',         label: 'Inventario Inicial',      icon: '🏷', desc: 'Etiquetas, UIDs y seteo de stock inicial' },
  { file: 'noticias.html',                   label: 'Noticias',                icon: '📢', desc: 'Breaking news para el dashboard de producción' },
  { file: 'tablero.html',                    label: 'Tablero de Proyectos',    icon: '🗂', desc: 'Kanban interno · seguimiento de OPs' },
  { file: 'bienes_personal.html',            label: 'Bienes y Personal',       icon: '🧰', desc: 'Bienes por área, fallas/service y personal' },
  { file: 'licencias_clientes.html',         label: 'Licencias Clientes',      icon: '🔑', desc: 'Sincronización con Gestor de Licencias' },
  { file: 'tablero_comercial.html',          label: 'Tablero Comercial',       icon: '🤝', desc: 'Pipeline de leads · presupuestos · seguimiento' },
  { file: 'mensajeria_comercial.html',       label: 'Mensajería Comercial',    icon: '📲', desc: 'Encuestas · newsletter · reventa' },
];

// Set por defecto para operadores que todavía no tienen permisos configurados
// a mano en usuarios.html (columna modulos_habilitados) — así ningún usuario
// existente pierde acceso de golpe el día que se activa esta función.
const MODULOS_PRODUCCION_DEFAULT = ['produccion.html', 'recepcion.html', 'stock_fase1.html', 'conteo_fisico.html'];

// Páginas que cualquier usuario logueado puede abrir sin importar sus permisos
// (no son "módulos de trabajo" en sí, son puntos de entrada/navegación).
const PAGINAS_SIEMPRE_PERMITIDAS = ['index_produccion.html'];

async function requireAuth(){
  try{
    const { data: { session } } = await _sb.auth.getSession();
    if(!session){
      irALogin();
      return null;
    }
    const { data: perfil, error } = await _sb
      .from('usuarios')
      .select('id,nombre,email,rol,activo,modulos_habilitados')
      .eq('id', session.user.id)
      .single();

    if(error || !perfil){
      // Sesión válida en Supabase Auth pero sin fila en usuarios (raro, pero por
      // las dudas no lo dejamos pasar en silencio).
      await _sb.auth.signOut();
      irALogin('sin_perfil');
      return null;
    }
    if(!perfil.activo){
      await _sb.auth.signOut();
      irALogin('inactivo');
      return null;
    }
    if(perfil.rol === 'operador'){
      const permitidos = (Array.isArray(perfil.modulos_habilitados) && perfil.modulos_habilitados.length)
        ? perfil.modulos_habilitados
        : MODULOS_PRODUCCION_DEFAULT;
      window._modulosPermitidos = permitidos;
      const pagina = location.pathname.split('/').pop();
      if(!PAGINAS_SIEMPRE_PERMITIDAS.includes(pagina) && !permitidos.includes(pagina)){
        location.href = 'index_produccion.html';
        return null;
      }
    } else {
      window._modulosPermitidos = null; // null = gerencia, sin restricción
    }
    window.currentUser = perfil;
    window._authToken = session.access_token;
    return perfil;
  }catch(e){
    console.error('[auth] Error verificando sesión:', e);
    irALogin();
    return null;
  }
}

async function requireAuthServicio(email, password){
  try{
    const { data, error } = await _sb.auth.signInWithPassword({ email, password });
    if(error || !data?.session){
      console.error('[auth] No se pudo autenticar la cuenta de servicio:', error?.message);
      return null;
    }
    const { data: perfil, error: errPerfil } = await _sb
      .from('usuarios')
      .select('id,nombre,email,rol,activo')
      .eq('id', data.user.id)
      .single();
    if(errPerfil || !perfil || !perfil.activo){
      console.error('[auth] Cuenta de servicio sin perfil activo en la tabla usuarios.');
      return null;
    }
    window.currentUser = perfil;
    window._authToken = data.session.access_token;
    return perfil;
  }catch(e){
    console.error('[auth] Error autenticando cuenta de servicio:', e);
    return null;
  }
}

// Oculta de la barra de accesos rápidos (.gernav-btn / .prodnav-btn) los
// módulos a los que este usuario no tiene acceso, y manda el link "Inicio" a
// su hub de producción en vez del hub general. Llamar después de
// requireAuth(), pasándole el usuario que devuelve. Gerencia no se filtra.
function filtrarNavPorRol(usuario){
  if(!usuario || usuario.rol !== 'operador') return;
  const permitidos = window._modulosPermitidos || MODULOS_PRODUCCION_DEFAULT;
  document.querySelectorAll('.gernav-btn, .prodnav-btn').forEach(a => {
    const href = a.getAttribute('href') || '';
    const pagina = href.split('/').pop().split('?')[0];
    if(pagina === 'index.html'){
      a.setAttribute('href', 'index_produccion.html');
      return;
    }
    if(!pagina || pagina === '#') return;
    if(!permitidos.includes(pagina)) a.style.display = 'none';
  });
}

function irALogin(motivo){
  const redirect = encodeURIComponent(location.pathname.split('/').pop() + location.search);
  let url = 'login.html?redirect=' + redirect;
  if(motivo) url += '&motivo=' + motivo;
  location.href = url;
}

async function cerrarSesion(){
  await _sb.auth.signOut();
  location.href = 'login.html';
}

function authHeaders(extra){
  return Object.assign({
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + (window._authToken || SUPABASE_ANON_KEY),
    'Content-Type': 'application/json'
  }, extra||{});
}

// Si Supabase Auth cierra la sesión en otra pestaña (o expira el token), volvemos
// al login automáticamente en vez de dejar la pantalla mostrando datos viejos.
// Excepción: las pantallas de cuenta de servicio (TV, celular de escaneo) definen
// window._onAuthSignedOutServicio para reautenticarse solas en vez de terminar
// mostrando una pantalla de login que nadie va a completar.
_sb.auth.onAuthStateChange((event)=>{
  if(event === 'SIGNED_OUT'){
    if(typeof window._onAuthSignedOutServicio === 'function') window._onAuthSignedOutServicio();
    else irALogin();
  }
});
