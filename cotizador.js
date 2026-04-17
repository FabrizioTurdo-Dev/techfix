/* ══════════════════════════════════════════════════════════
   COTIZADOR TECHFIX – cotizador.js
   ══════════════════════════════════════════════════════════ */

const WA_NUMBER = '5491154922800';


let baseDeDatos = null;

/* ── Carga del JSON ── */
async function cargarDatos() {
  try {
    const res = await fetch('datos.json');
    baseDeDatos = await res.json();
    console.log('Base de datos cargada ✓');
  } catch (e) {
    console.error('Error cargando datos.json', e);
  }
}

/* ── Limpiar campo de búsqueda ── */
function limpiarBusqueda() {
  document.getElementById('modelSearch').value = '';
  document.getElementById('clearBtn').style.display = 'none';
  document.getElementById('resultsList').innerHTML = '';
  document.getElementById('emptyState').style.display = '';
  document.getElementById('modelSearch').focus();
}

/* ── Función principal de búsqueda ── */
/* ── Función principal de búsqueda (Actualizada) ── */
function actualizarBusqueda() {
  if (!baseDeDatos) return;

  const query    = document.getElementById('modelSearch').value.toLowerCase().trim();
  const tipo     = document.querySelector('input[name="tipoRepuesto"]:checked').value;
  const clearBtn = document.getElementById('clearBtn');
  const empty    = document.getElementById('emptyState');

  clearBtn.style.display = query.length > 0 ? '' : 'none';

  if (query.length < 2) {
    document.getElementById('resultsList').innerHTML = '';
    empty.style.display = '';
    return;
  }

  empty.style.display = 'none';

  const categorias = baseDeDatos[tipo];
  const resultados = [];

  for (const marca in categorias) {
    const items = categorias[marca];
    const tokens = query.split(/\s+/);

    items.forEach(item => {
      const modeloLower = item.modelo.toLowerCase();
      const marcaLower  = marca.toLowerCase();
      const haystack = `${marcaLower} ${modeloLower}`;
      const coincide = tokens.every(t => haystack.includes(t));

      if (coincide) {
        // --- NUEVA LÓGICA DE CÁLCULO ---
        const precioRepuesto = Number(item.precio);
        
        // Calculamos la mano de obra como el 150% (precio * 1.5)
        const manoDeObraCalculada = precioRepuesto * 1.5;
        
        // El precio total es Repuesto + Mano de Obra
        const precioTotal = precioRepuesto + manoDeObraCalculada;

        resultados.push({
          marca,
          modelo:  item.modelo,
          tipo:    item.tipo    || null,
          calidad: item.calidad || null,
          marco:   item.marco   || false,
          precioRepuesto: precioRepuesto,
          precioTotal:    precioTotal, // Guardamos el valor calculado
          tipoWidget:     tipo
        });
      }
    });
  }

  renderizar(resultados);
}

/* ── Render de tarjetas ── */
function renderizar(lista) {
  const container = document.getElementById('resultsList');
  container.innerHTML = '';

  if (lista.length === 0) {
    container.innerHTML = `
      <p class="no-results">
        No encontramos ese modelo en nuestra lista.<br>
        <a href="${buildWaLink('Hola TechFix, no encontré mi modelo en el cotizador. ¿Tienen precio para')} mi equipo?" 
           target="_blank" rel="noopener"
           style="color:var(--cyan);text-decoration:underline;font-weight:600;">
          Consultanos directamente →
        </a>
      </p>`;
    return;
  }

  lista.forEach((item, i) => {
    const precioFmt = item.precioTotal.toLocaleString('es-AR');

    // Tipo de pantalla para el badge
    const tipoDisplay = item.tipo || (item.tipoWidget === 'baterias' ? 'Batería' : 'Módulo');
    const tagClass    = tipoDisplay.toLowerCase().replace(/\s/g, '');

    // Emoji de marca
    const brandEmoji = item.marca === 'iphone' ? '🍎' : '📱';
    const brandClass = item.marca === 'iphone' ? 'iphone' : 'samsung';
    const marcaDisplay = item.marca === 'iphone' ? 'iPhone' : item.marca.charAt(0).toUpperCase() + item.marca.slice(1);

    // Badge de marco
    const marcoBadge = item.marco
      ? '<span class="tag-marco">+ Marco incl.</span>'
      : '';

    // Mensaje WhatsApp contextual
    const waMsg = encodeURIComponent(
      `Hola TechFix, vi el cotizador y quiero reparar la ${item.tipoWidget === 'baterias' ? 'batería' : 'pantalla'} de mi ${marcaDisplay} ${item.modelo}. El precio que vi fue $${precioFmt}. ¿Cuándo pueden venir?`
    );
    const waHref = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${i * 0.04}s`;
    card.setAttribute('role', 'listitem');

    card.innerHTML = `
      <div class="result-left">
        <div class="brand-badge ${brandClass}" aria-hidden="true">${brandEmoji}</div>
        <div class="result-info">
          <div class="result-title">${marcaDisplay} ${item.modelo}</div>
          <div class="result-meta">
            <span class="tag-tipo ${tagClass}">${tipoDisplay}</span>
            ${marcoBadge}
          </div>
        </div>
      </div>
      <div class="result-right">
        <div class="price-block">
          <div class="price-label">Repuesto + instalación</div>
          <div class="price-value">$${precioFmt}</div>
        </div>
        <a href="${waHref}" target="_blank" rel="noopener" class="btn-wa-card"
           onclick="trackWaClick('${marcaDisplay} ${item.modelo}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Pedir turno
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

/* ── Link WhatsApp ── */
function buildWaLink(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/* ── GA4: tracking de clicks en botones de WhatsApp del cotizador ── */
function trackWaClick(modelo) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'click_whatsapp_cotizador', {
      event_category: 'Cotizador',
      event_label: modelo
    });
  }
  console.log('WA cotizador click → ' + modelo);
}

/* ── Init ── */
cargarDatos();
