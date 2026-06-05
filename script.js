let carrito = JSON.parse(localStorage.getItem('alma_miga_cart')) || [];
let golesActuales = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Modal de edad
  const ageModal = new bootstrap.Modal(document.getElementById('ageVerificationModal'), { keyboard: false, backdrop: 'static' });
  ageModal.show();

  document.getElementById('btn-age-confirm').addEventListener('click', () => {
    bootstrap.Modal.getInstance(document.getElementById('ageVerificationModal')).hide();
  });

  document.getElementById('btn-age-decline').addEventListener('click', () => {
    alert('Lo sentimos, debes ser mayor de 18 años para acceder.');
    window.location.href = 'https://www.google.com';
  });

  inicializarNavegacion();
  inicializarMundial();
  actualizarCarrito();
  setupCarrito();
  iniciarFlipCards();
  iniciarTooltip();
  iniciarCalculadoraImpacto();

  if (!document.querySelector('.app-section.active-section')) {
    navegarA('hero');
  }
});

function inicializarNavegacion() {
  document.querySelectorAll('#main-nav .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      document.querySelectorAll('#main-nav .nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      navegarA(target);
      const toggler = document.querySelector('.navbar-toggler');
      const collapse = document.querySelector('.navbar-collapse');
      if (collapse.classList.contains('show')) toggler.click();
    });
  });
}

function navegarA(sectionId) {
  const sections = document.querySelectorAll('.app-section');
  const target = document.getElementById(sectionId);
  if (!target) return;
  sections.forEach(s => s.classList.remove('active-section'));
  target.classList.add('active-section');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function inicializarMundial() {
  const mug = document.getElementById('beer-mug-interactive');
  if (mug) {
    mug.addEventListener('click', () => registrarGol());
  }
}

function registrarGol() {
  if (golesActuales < 5) {
    golesActuales++;
    document.getElementById('goal-count').textContent = golesActuales;

    // Actualizar marcador
    document.getElementById('score-mex').textContent = golesActuales;

    // Actualizar progreso del tarro (cada gol = 20% de llenado)
    const porcentaje = Math.min(golesActuales * 20, 100);
    const fillDiv = document.getElementById('beer-fill');

    if (fillDiv) {
      fillDiv.style.height = porcentaje + '%';
    }

    document.getElementById('fill-percentage').textContent = porcentaje + '%';

    let statusText = '';
    if (porcentaje === 20) statusText = '¡Primer gol! 10% descuento';
    else if (porcentaje === 40) statusText = '¡Segundo gol! 20% descuento';
    else if (porcentaje === 60) statusText = '¡Tercer gol! 30% descuento';
    else if (porcentaje === 80) statusText = '¡Cuarto gol! 40% descuento';
    else if (porcentaje === 100) {
      statusText = '¡PROMO ACTIVADA! 50% DESCUENTO';
      alert('🎉 ¡Gol de México! Has acumulado 50% de descuento en tu próxima orden.');
    } else {
      statusText = 'Esperando más goles...';
    }

    document.getElementById('fill-status').textContent = statusText;
  }
}

function resetGoles() {
  golesActuales = 0;
  document.getElementById('goal-count').textContent = 0;
  document.getElementById('score-mex').textContent = 0;
  document.getElementById('score-opp').textContent = 0;

  const fillDiv = document.getElementById('beer-fill');
  if (fillDiv) fillDiv.style.height = '0%';

  document.getElementById('fill-percentage').textContent = '0%';
  document.getElementById('fill-status').textContent = 'Esperando goles...';
}

function setupCarrito() {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));

      const existente = carrito.find(item => item.id === id);
      if (existente) existente.quantity++;
      else carrito.push({ id, name, price, quantity: 1 });

      guardarCarrito();

      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-circle-check me-2"></i>¡Agregado!';
      setTimeout(() => btn.innerHTML = original, 1200);
    });
  });

  document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
    carrito = [];
    guardarCarrito();
  });

  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('¡Mensaje enviado con éxito! Te contactaremos pronto.');
    e.target.reset();
  });

  document.getElementById('btn-checkout')?.addEventListener('click', () => {
    if (carrito.length === 0) {
      alert('Carrito vacío');
      return;
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (modal) modal.hide();

    let msg = '¡Hola Alma de Miga! 🍺 Mi pedido:\n\n';
    let total = 0;
    carrito.forEach(item => {
      const sub = item.price * item.quantity;
      msg += `${item.quantity}x ${item.name} — $${sub.toFixed(2)}\n`;
      total += sub;
    });
    msg += `\n*Total: $${total.toFixed(2)}*\n\nGracias por darle una segunda oportunidad al pan.`;
    window.open(`https://wa.me/521234567890?text=${encodeURIComponent(msg)}`, '_blank');
  });
}

function modificarCantidad(id, delta) {
  const producto = carrito.find(item => item.id === id);
  if (producto) {
    producto.quantity += delta;
    if (producto.quantity <= 0) {
      carrito = carrito.filter(item => item.id !== id);
    }
  }
  guardarCarrito();
}

function guardarCarrito() {
  localStorage.setItem('alma_miga_cart', JSON.stringify(carrito));
  actualizarCarrito();
}

function actualizarCarrito() {
  const totalItems = carrito.reduce((acc, i) => acc + i.quantity, 0);
  document.getElementById('cart-count').innerText = totalItems;

  const container = document.getElementById('cart-items-container');
  const subtotalSpan = document.getElementById('cart-subtotal');
  const taxSpan = document.getElementById('cart-tax');
  const totalSpan = document.getElementById('cart-total');

  if (carrito.length === 0) {
    if (container) container.innerHTML = '<div class="text-center py-4 text-muted">Carrito vacío</div>';
    if (subtotalSpan) subtotalSpan.innerText = '$0.00';
    if (taxSpan) taxSpan.innerText = '$0.00';
    if (totalSpan) totalSpan.innerText = '$0.00';
    return;
  }

  if (container) {
    container.innerHTML = '';
    let subtotal = 0;
    carrito.forEach(item => {
      const sub = item.price * item.quantity;
      subtotal += sub;
      container.innerHTML += `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
          <div><strong>${item.name}</strong><br><small>$${item.price} c/u</small></div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-dark" onclick="modificarCantidad('${item.id}', -1)">-</button>
            <span>${item.quantity}</span>
            <button class="btn btn-sm btn-outline-dark" onclick="modificarCantidad('${item.id}', 1)">+</button>
            <span class="fw-bold">$${sub.toFixed(2)}</span>
          </div>
        </div>
      `;
    });

    const impuesto = subtotal * 0.16;
    const total = subtotal + impuesto;
    if (subtotalSpan) subtotalSpan.innerText = `$${subtotal.toFixed(2)}`;
    if (taxSpan) taxSpan.innerText = `$${impuesto.toFixed(2)}`;
    if (totalSpan) totalSpan.innerText = `$${total.toFixed(2)}`;
  }
}

// Countdown
(function () {
  const container = document.getElementById('hero-countdown');
  if (!container) return;
  const target = new Date(container.getAttribute('data-target'));
  if (isNaN(target.getTime())) return;

  function update() {
    const diff = target - Date.now();
    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent = '00';
      document.getElementById('cd-secs').textContent = '00';
      return;
    }
    document.getElementById('cd-days').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
})();

// Modo oscuro
(function () {
  const checkbox = document.getElementById('darkModeSwitch');
  if (!checkbox) return;
  const saved = localStorage.getItem('alma_miga_dark_mode');
  if (saved === 'true') {
    document.body.classList.add('dark-mode');
    checkbox.checked = true;
  }
  checkbox.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', checkbox.checked);
    localStorage.setItem('alma_miga_dark_mode', checkbox.checked);
  });
})();

// ============================================================
// DATOS DE INTERÉS - INTERACCIONES DINÁMICAS
// ============================================================

// Flip cards (al hacer clic)
function iniciarFlipCards() {
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', function (e) {
      e.stopPropagation();
      this.classList.toggle('flipped');
    });
  });
}

// Tooltip interactivo
function iniciarTooltip() {
  const tooltipBtn = document.getElementById('curiosityTooltip');
  const tooltipBox = document.getElementById('tooltipBox');
  if (!tooltipBtn || !tooltipBox) return;

  let timeoutId;
  tooltipBtn.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
    tooltipBox.style.display = 'block';
  });
  tooltipBtn.addEventListener('mouseleave', () => {
    timeoutId = setTimeout(() => { tooltipBox.style.display = 'none'; }, 200);
  });
  tooltipBox.addEventListener('mouseenter', () => clearTimeout(timeoutId));
  tooltipBox.addEventListener('mouseleave', () => { tooltipBox.style.display = 'none'; });
}

// ============================================================
// CALCULADORA DE IMPACTO PERSONAL
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  // 1. Referencias a los elementos de la interfaz
  const btnMinus = document.getElementById("qty-minus");
  const btnPlus = document.getElementById("qty-plus");
  const qtyValue = document.getElementById("qty-value");
  const resPan = document.getElementById("res-pan");
  const resBolillo = document.getElementById("res-bolillo");

  // 2. Factores de conversión basados en tu receta real
  const GRAMOS_POR_BOTELLA = 9;
  const BOLILLOS_POR_BOTELLA = 0.15;

  // 3. Función que calcula y actualiza los textos en pantalla
  function actualizarCalculadora() {
    let botellas = parseInt(qtyValue.textContent);

    // Operaciones matemáticas sencillas
    let totalGramos = botellas * GRAMOS_POR_BOTELLA;
    let totalBolillos = botellas * BOLILLOS_POR_BOTELLA;

    // Renderizar los resultados con formatos limpios
    resPan.textContent = `${totalGramos} g`;

    // .toFixed(2) asegura estabilidad con decimales flotantes en JS
    // parseFloat quita ceros sobrantes a la derecha para que se vea estético (ej: 0.9 en vez de 0.90)
    resBolillo.textContent = parseFloat(totalBolillos.toFixed(2));
  }

  // 4. Evento para restar botellas (con límite mínimo de 1)
  btnMinus.addEventListener("click", function () {
    let actual = parseInt(qtyValue.textContent);
    if (actual > 1) {
      qtyValue.textContent = actual - 1;
      actualizarCalculadora();
    }
  });

  // 5. Evento para sumar botellas
  btnPlus.addEventListener("click", function () {
    let actual = parseInt(qtyValue.textContent);
    qtyValue.textContent = actual + 1;
    actualizarCalculadora();
  });

  // Ejecución inicial automática para sincronizar el estado
  actualizarCalculadora();
});

// ============================================================
// CARRUSEL DE TIKTOKS — SECCIÓN PROCESO
// ============================================================
(function () {
  function iniciarCarruselTikTok() {
    const slides = document.querySelectorAll('.tiktok-slide');
    const dots = document.querySelectorAll('.tiktok-dot');
    const btnPrev = document.getElementById('tiktok-prev');
    const btnNext = document.getElementById('tiktok-next');
    if (!slides.length || !btnPrev || !btnNext) return;

    let current = 0;

    // Carga el iframe solo cuando el usuario navega a ese slide (lazy)
    function cargarSlide(idx) {
      const slide = slides[idx];
      if (!slide) return;
      const src = slide.getAttribute('data-src');
      if (!src || slide.querySelector('iframe')) return;
      slide.innerHTML = `<iframe src="${src}" allowfullscreen
        allow="encrypted-media" loading="lazy"
        style="width:100%;height:100%;border:none;"></iframe>`;
    }

    function mostrar(idx) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[idx].classList.add('active');
      dots[idx].classList.add('active');
      current = idx;
      cargarSlide(idx);
    }

    btnNext.addEventListener('click', () => mostrar((current + 1) % slides.length));
    btnPrev.addEventListener('click', () => mostrar((current - 1 + slides.length) % slides.length));

    dots.forEach(dot => {
      dot.addEventListener('click', () => mostrar(parseInt(dot.getAttribute('data-index'))));
    });

    // Swipe táctil en móvil
    const track = document.getElementById('tiktok-track');
    if (track) {
      let startX = 0;
      track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          diff > 0
            ? mostrar((current + 1) % slides.length)
            : mostrar((current - 1 + slides.length) % slides.length);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', iniciarCarruselTikTok);
})();

// ============================================================
// COUNTDOWN EN TARJETAS DE EVENTOS
// ============================================================
(function () {
  function iniciarEventoCountdowns() {
    document.querySelectorAll('.evento-countdown').forEach(function (el) {
      const target = new Date(el.getAttribute('data-target'));
      if (isNaN(target.getTime())) return;

      const daysEl = el.querySelector('.ev-days');
      const hoursEl = el.querySelector('.ev-hours');
      const minsEl = el.querySelector('.ev-mins');

      // Labels de las unidades para cambiarlos dinámicamente
      const units = el.querySelectorAll('.evento-cd-unit small');

      function update() {
        const diff = target - Date.now();
        if (diff <= 0) {
          if (daysEl) daysEl.textContent = '00';
          if (hoursEl) hoursEl.textContent = '00';
          if (minsEl) minsEl.textContent = '00';
          return;
        }

        const totalDays = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);

        if (totalDays > 30) {
          // Mostrar meses + días restantes
          const months = Math.floor(totalDays / 30);
          const remDays = totalDays % 30;
          if (daysEl) daysEl.textContent = String(months);
          if (hoursEl) hoursEl.textContent = String(remDays).padStart(2, '0');
          if (minsEl) minsEl.textContent = String(hours).padStart(2, '0');
          if (units[0]) units[0].textContent = months === 1 ? 'mes' : 'meses';
          if (units[1]) units[1].textContent = 'días';
          if (units[2]) units[2].textContent = 'hrs';
        } else {
          // Menos de 30 días: mostrar días/hrs/min normal
          if (daysEl) daysEl.textContent = String(totalDays).padStart(2, '0');
          if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
          if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
          if (units[0]) units[0].textContent = 'días';
          if (units[1]) units[1].textContent = 'hrs';
          if (units[2]) units[2].textContent = 'min';
        }
      }

      update();
      setInterval(update, 60000);
    });
  }

  document.addEventListener('DOMContentLoaded', iniciarEventoCountdowns);
})();
