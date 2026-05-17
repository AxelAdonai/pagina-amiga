// CONTROLADOR CENTRAL DEL STATE DE LA APLICACIÓN
let carrito = JSON.parse(localStorage.getItem('alma_miga_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  inicializarNavegacionDinámica();
  actualizarInterfazCarrito();
  setupCarritoListeners();
});

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

  const cantidadTotal = carrito.reduce((acc, item) => acc + item.quantity, 0);
  badgeContador.innerText = cantidadTotal;

  if (carrito.length === 0) {
    contenedorItems.innerHTML = '<div class="text-center py-4 text-muted"><i class="fa-solid fa-basket-shopping fs-3 mb-2"></i><p class="mb-0">Tu carrito está vacío.</p></div>';
    labelTotal.innerText = '$0.00';
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

  labelTotal.innerText = `$${totalAcumulado.toFixed(2)}`;
}