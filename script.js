// CONTROLADOR CENTRAL DEL STATE DE LA APLICACIÓN
let carrito = JSON.parse(localStorage.getItem('alma_miga_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  verificarEdad();
  inicializarNavegacionDinámica();
  inicializarHistoriaDinamica();
  inicializarMundialInteracciones();
  inicializarAtajosTeclado();
  actualizarInterfazCarrito();
  setupCarritoListeners();
});

// VALIDACIÓN DE EDAD (REQUISITO LEGAL)
function verificarEdad() {
  const ageModal = new bootstrap.Modal(document.getElementById('ageVerificationModal'), { keyboard: false, backdrop: 'static' });
  ageModal.show();

  document.getElementById('btn-age-confirm').addEventListener('click', () => {
    const ageModalInstance = bootstrap.Modal.getInstance(document.getElementById('ageVerificationModal'));
    ageModalInstance.hide();
  });

  document.getElementById('btn-age-decline').addEventListener('click', () => {
    alert('Lo sentimos, debes ser mayor de 18 años para acceder. Redirigiéndote...');
    window.location.href = 'https://www.google.com';
  });
}

// 1. SISTEMA DE NAVEGACIÓN EXCLUSIVA (PANTALLA COMPLETA)
function inicializarNavegacionDinámica() {
  const navLinks = document.querySelectorAll('#main-nav .nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSectionId = link.getAttribute('data-target');

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      navegarA(targetSectionId);

      const navbarToggler = document.querySelector('.navbar-toggler');
      const navbarCollapse = document.querySelector('.navbar-collapse');
      if (navbarCollapse.classList.contains('show')) {
        navbarToggler.click();
      }
    });
  });
}

function navegarA(sectionId) {
  const sections = document.querySelectorAll('.app-section');
  const targetSection = document.getElementById(sectionId);

  if (!targetSection) return;

  // Ocultar de inmediato las vistas inactivas
  sections.forEach(section => {
    section.classList.remove('active-section');
  });

  // Activar sección objetivo centrada
  targetSection.classList.add('active-section');

  // Forzar el scroll arriba de la ventana por sanidad visual
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function inicializarHistoriaDinamica() {
  const buttons = document.querySelectorAll('.story-tab-btn');
  const panels = document.querySelectorAll('.story-panel');
  const imageTitle = document.getElementById('story-image-title');
  const imageText = document.getElementById('story-image-text');

  if (!buttons.length || !panels.length || !imageTitle || !imageText) return;

  const storyData = {
    cerveza: {
      title: 'Migo y la cerveza de segunda oportunidad',
      text: 'La imagen de Migo refuerza el espíritu de nuestra marca: creatividad, cariño por el oficio y el valor de dar una segunda oportunidad a lo que parecía perdido.',
    },
    mascota: {
      title: 'Migo, el símbolo de nuestra historia',
      text: 'La mascota muestra cómo una idea simple puede convertirse en un emblema: pan reutilizado, pasión cervecera y una historia que inspira a valorar cada segunda oportunidad.',
    }
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const story = button.getAttribute('data-story');
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      panels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `story-${story}`);
      });

      if (storyData[story]) {
        imageTitle.textContent = storyData[story].title;
        imageText.textContent = storyData[story].text;
      }
    });
  });

  const conoceMigoBtn = document.getElementById('btn-conoce-migo');
  if (conoceMigoBtn) {
    conoceMigoBtn.addEventListener('click', () => {
      const mascotaBtn = document.querySelector('.story-tab-btn[data-story="mascota"]');
      if (mascotaBtn) mascotaBtn.click();
      conoceMigoBtn.classList.add('btn-outline-light-custom');
      setTimeout(() => conoceMigoBtn.classList.remove('btn-outline-light-custom'), 600);
    });
  }
}

function inicializarMundialInteracciones() {
  const mundialBtn = document.getElementById('btn-mundial-logo');
  const revealArea = document.getElementById('mundial-reveal');
  const actionAnchor = document.getElementById('mundial-action-anchor');
  if (!mundialBtn || !revealArea || !actionAnchor) return;

  mundialBtn.addEventListener('click', () => {
    if (revealArea.classList.contains('d-none')) {
      revealArea.classList.remove('d-none');
    }
    actionAnchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    actionAnchor.classList.add('highlight-glow');
    setTimeout(() => actionAnchor.classList.remove('highlight-glow'), 900);
  });
}

function simularProgreso(fillPercentage, mexScore, oppScore, statusText, statusLabel) {
  const beerFill = document.getElementById('beer-fill');
  const scoreMex = document.getElementById('score-mex');
  const scoreOpp = document.getElementById('score-opp');
  const matchStatus = document.getElementById('match-status');
  const fillPercentageLabel = document.getElementById('fill-percentage');
  const fillStatus = document.getElementById('fill-status');
  if (!beerFill || !scoreMex || !scoreOpp || !matchStatus || !fillPercentageLabel || !fillStatus) return;

  beerFill.style.height = `${Math.min(Math.max(fillPercentage, 0), 100)}%`;
  scoreMex.textContent = mexScore;
  scoreOpp.textContent = oppScore;
  matchStatus.textContent = statusText;
  fillPercentageLabel.textContent = `${Math.min(Math.max(fillPercentage, 0), 100)}%`;
  fillStatus.textContent = statusLabel;

  if (fillPercentage >= 100) {
    matchStatus.classList.remove('bg-danger');
    matchStatus.classList.add('bg-success');
  } else {
    matchStatus.classList.remove('bg-success');
    matchStatus.classList.add('bg-danger');
  }
}

// 2. LÓGICA E-COMMERCE CON LOCAL STORAGE
function setupCarritoListeners() {
  document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      const price = parseFloat(button.getAttribute('data-price'));

      agregarAlCarrito(id, name, price);

      const textoOriginal = button.innerHTML;
      button.innerHTML = '<i class="fa-solid fa-circle-check me-2"></i>¡Agregado!';
      button.classList.replace('btn-forest', 'btn-success');

      setTimeout(() => {
        button.innerHTML = textoOriginal;
        button.classList.replace('btn-success', 'btn-forest');
      }, 1200);
    });
  });

  document.getElementById('btn-clear-cart').addEventListener('click', () => {
    carrito = [];
    guardarYActualizar();
  });

  document.getElementById('btn-checkout').addEventListener('click', () => {
    if (carrito.length === 0) {
      alert("No tienes artículos en tu carrito de compras.");
      return;
    }

    let stringMensaje = "¡Hola Alma de Miga! 🐻🍺 Me gustaría procesar la siguiente orden de compra:\n\n";
    let granTotal = 0;

    carrito.forEach(item => {
      const subtotal = item.price * item.quantity;
      stringMensaje += `✔ ${item.quantity}x ${item.name} — $${subtotal.toFixed(2)}\n`;
      granTotal += subtotal;
    });

    stringMensaje += `\n*Monto Total Estimado: $${granTotal.toFixed(2)}*`;

    const whatsappUrl = `https://wa.me/521234567890?text=${encodeURIComponent(stringMensaje)}`;
    window.open(whatsappUrl, '_blank');
  });

  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('¡Mensaje enviado con éxito de forma simulada!');
    e.target.reset();
  });
}

function agregarAlCarrito(id, name, price) {
  const productoExistente = carrito.find(item => item.id === id);
  if (productoExistente) {
    productoExistente.quantity += 1;
  } else {
    carrito.push({ id, name, price, quantity: 1 });
  }
  guardarYActualizar();
}

function modificarCantidad(id, factor) {
  const producto = carrito.find(item => item.id === id);
  if (producto) {
    producto.quantity += factor;
    if (producto.quantity <= 0) {
      carrito = carrito.filter(item => item.id !== id);
    }
  }
  guardarYActualizar();
}

// Inicialización automática al cargar el archivo
function guardarYActualizar() {
  localStorage.setItem('alma_miga_cart', JSON.stringify(carrito));
  actualizarInterfazCarrito();
}

function actualizarInterfazCarrito() {
  const badgeContador = document.getElementById('cart-count');
  const contenedorItems = document.getElementById('cart-items-container');
  const labelTotal = document.getElementById('cart-total');
  const labelSubtotal = document.getElementById('cart-subtotal');
  const labelTax = document.getElementById('cart-tax');

  const cantidadTotal = carrito.reduce((acc, item) => acc + item.quantity, 0);
  badgeContador.innerText = cantidadTotal;

  if (carrito.length === 0) {
    contenedorItems.innerHTML = '<div class="text-center py-4 text-muted"><i class="fa-solid fa-basket-shopping fs-3 mb-2"></i><p class="mb-0">Tu carrito está vacío.</p></div>';
    labelTotal.innerText = '$0.00';
    if (labelSubtotal) labelSubtotal.innerText = '$0.00';
    if (labelTax) labelTax.innerText = '$0.00';
    return;
  }

  contenedorItems.innerHTML = '';
  let totalAcumulado = 0;

  carrito.forEach(item => {
    const calculoSubtotal = item.price * item.quantity;
    totalAcumulado += calculoSubtotal;

    const itemRow = document.createElement('div');
    itemRow.className = 'd-flex justify-content-between align-items-center mb-2 p-2 border-bottom';
    itemRow.innerHTML = `
            <div class="pe-2">
                <h6 class="mb-0 fw-bold text-forest text-xs">${item.name}</h6>
                <small class="text-muted">$${item.price.toFixed(2)} c/u</small>
            </div>
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-dark px-2 py-0" onclick="modificarCantidad('${item.id}', -1)">-</button>
                <span class="fw-bold">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-dark px-2 py-0" onclick="modificarCantidad('${item.id}', 1)">+</button>
                <span class="ms-2 fw-bold text-forest text-sm">$${calculoSubtotal.toFixed(2)}</span>
            </div>
        `;
    contenedorItems.appendChild(itemRow);
  });

  const impuesto = totalAcumulado * 0.16;
  const totalConImpuesto = totalAcumulado + impuesto;

  if (labelSubtotal) labelSubtotal.innerText = `$${totalAcumulado.toFixed(2)}`;
  if (labelTax) labelTax.innerText = `$${impuesto.toFixed(2)}`;
  labelTotal.innerText = `$${totalConImpuesto.toFixed(2)}`;
}

// Atajos de teclado: detecta la secuencia rápida 'h' seguido de 'y' para abrir la sección Historia
function inicializarAtajosTeclado() {
  let seq = '';
  let lastTime = 0;
  const TIMEOUT_MS = 3000; // ventana ampliada para teclear la secuencia (3s)

  function handleKey(k, e) {
    // Ignorar cuando el usuario está escribiendo en un input/textarea
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return false;

    const now = Date.now();
    if (now - lastTime > TIMEOUT_MS) seq = '';
    lastTime = now;

    seq += k;
    if (seq.length > 6) seq = seq.slice(-6);
    console.debug('[Atajos] secuencia actual:', seq);

    // Detectar 'h' seguido de 'y' permitiendo pequeñas pausas
    const lastH = seq.lastIndexOf('h');
    const lastY = seq.lastIndexOf('y');
    if (lastH !== -1 && lastY !== -1 && lastH < lastY) {
      abrirHistoriaConFeedback();
      seq = '';
      return true;
    }
    return false;
  }

  // Escuchar keydown y keyup para mejorar compatibilidad
  window.addEventListener('keydown', (e) => {
    // Soporte adicional: Ctrl+H abre Historia
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      abrirHistoriaConFeedback();
      return;
    }
    handleKey(e.key.toLowerCase(), e);
  });

  window.addEventListener('keyup', (e) => {
    handleKey(e.key.toLowerCase(), e);
  });

  function abrirHistoriaConFeedback() {
    console.info('[Atajos] activando Historia');
    const historia = document.getElementById('historia');
    if (historia) {
      navegarA('historia');
      // Mostrar notificación visual breve
      const notif = document.getElementById('ky-notification');
      if (notif) {
        notif.style.display = 'block';
        notif.style.opacity = '1';
        setTimeout(() => {
          notif.style.transition = 'opacity 400ms ease';
          notif.style.opacity = '0';
          setTimeout(() => notif.style.display = 'none', 420);
        }, 700);
      }
      historia.classList.add('highlight-glow');
      setTimeout(() => historia.classList.remove('highlight-glow'), 900);
    } else {
      console.warn('Sección Historia no encontrada');
      // mostrar mensaje en consola y en notificación si existe
      const notif = document.getElementById('ky-notification');
      if (notif) {
        notif.textContent = 'Sección Historia no encontrada';
        notif.style.display = 'block';
        setTimeout(() => { notif.style.display = 'none'; notif.textContent = 'Acceso directo: sección Historia abierta'; }, 1200);
      }
    }
  }
}