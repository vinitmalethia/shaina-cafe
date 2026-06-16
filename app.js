/* ==========================================================================
   Shaina Cafe Ordering System - Application Script
   ========================================================================== */

// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, onSnapshot } from "firebase/firestore";

// Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyDLIVi4812OaIhfJVsYCrJzoj4FdrexnEA",
  authDomain: "shaina-cafe.firebaseapp.com",
  projectId: "shaina-cafe",
  storageBucket: "shaina-cafe.firebasestorage.app",
  messagingSenderId: "147309891889",
  appId: "1:147309891889:web:77fa45d60d8344f383a010"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// --------------------------------------------------------------------------
// 1. Menu Data Structure
// --------------------------------------------------------------------------
const MENU_DATA = [
  // Pizza
  {
    id: 'pizza-margherita',
    name: 'Margherita Gold Pizza',
    description: 'Classic mozzarella, vine-ripened tomatoes, fresh basil leaves, extra virgin olive oil, and subtle flakes of edible gold dust on a wood-fired crust.',
    price: 16.50,
    category: 'Pizza',
    image: '/public/images/menu-items/pizza.png',
    bestSeller: true
  },
  {
    id: 'pizza-truffle',
    name: 'Truffle Mushroom Pizza',
    description: 'Rich white cream base, wild forest mushrooms, fresh herbs, buffalo mozzarella, drizzled with premium white truffle oil.',
    price: 19.00,
    category: 'Pizza',
    image: '/public/images/menu-items/pizza.png',
    bestSeller: false
  },
  // Coffee
  {
    id: 'coffee-cappuccino',
    name: 'Gold Leaf Cappuccino',
    description: 'Signature rich espresso blend, velvety microfoam steamed milk, topped with a delicate sheet of 24k edible gold leaf.',
    price: 8.50,
    category: 'Coffee',
    image: '/public/images/menu-items/coffee.png',
    bestSeller: true
  },
  {
    id: 'coffee-macchiato',
    name: 'Espresso Macchiato',
    description: 'A double shot of our house-roasted specialty espresso, lightly stained with a dollop of warm, velvety milk foam.',
    price: 4.50,
    category: 'Coffee',
    image: '/public/images/menu-items/coffee.png',
    bestSeller: false
  },
  // Sandwiches
  {
    id: 'sandwich-caprese',
    name: 'Pesto Caprese Panini',
    description: 'Warm toasted focaccia bread stuffed with creamy fresh mozzarella, ripe heirloom tomatoes, wild basil pesto, and a sweet balsamic glaze reduction.',
    price: 12.00,
    category: 'Sandwiches',
    image: '/public/images/menu-items/sandwich.png',
    bestSeller: true
  },
  {
    id: 'sandwich-avocado',
    name: 'Avocado Toast Supreme',
    description: 'Thick sourdough toast, seasoned smashed avocado, organic cherry tomatoes, crumbled greek feta, microgreens, and a squeeze of lime.',
    price: 13.50,
    category: 'Sandwiches',
    image: '/public/images/menu-items/sandwich.png',
    bestSeller: false
  },
  // Pasta
  {
    id: 'pasta-truffle',
    name: 'Truffle Fettuccine',
    description: 'Ribbon fettuccine tossed in a rich, creamy black truffle paste sauce, topped with fresh parsley and freshly grated aged Parmigiano-Reggiano.',
    price: 18.50,
    category: 'Pasta',
    image: '/public/images/menu-items/pasta.png',
    bestSeller: true
  },
  {
    id: 'pasta-arrabiata',
    name: 'Spicy Penne Arrabiata',
    description: 'Penne pasta tossed in our house fiery tomato garlic sauce, loaded with fresh red chilies, extra virgin olive oil, and sweet basil leaves.',
    price: 14.00,
    category: 'Pasta',
    image: '/public/images/menu-items/pasta.png',
    bestSeller: false
  },
  // Shakes
  {
    id: 'shake-espresso',
    name: 'Espresso Cookie Crumble Shake',
    description: 'A double shot of espresso blended with creamy vanilla bean gelato, crushed chocolate cookies, chocolate sauce, topped with rich whipped cream.',
    price: 9.50,
    category: 'Shakes',
    image: '/public/images/menu-items/shake.png',
    bestSeller: true
  },
  {
    id: 'shake-caramel',
    name: 'Salted Caramel Pecan Shake',
    description: 'Velvety vanilla gelato blended with buttery caramel, roasted pecans, sea salt, decorated with caramel drizzle and toasted pecan bits.',
    price: 9.00,
    category: 'Shakes',
    image: '/public/images/menu-items/shake.png',
    bestSeller: false
  },
  // Mocktails
  {
    id: 'mocktail-rose',
    name: 'Rose Quartz Fizz',
    description: 'Organic rose water, exotic lychee nectar, fresh lime juice, sparkling soda water, garnished with a sprig of fresh mint and a gold sugar rim.',
    price: 10.50,
    category: 'Mocktails',
    image: '/public/images/menu-items/mocktail.png',
    bestSeller: true
  },
  {
    id: 'mocktail-golden',
    name: 'Golden Hour Spritz',
    description: 'Tangy passion fruit pulp, blood orange juices, spicy ginger beer, and edible golden glitter sparkles for an immersive visual experience.',
    price: 11.00,
    category: 'Mocktails',
    image: '/public/images/menu-items/mocktail.png',
    bestSeller: false
  },
  // Desserts
  {
    id: 'dessert-tiramisu',
    name: 'Signature Gold Tiramisu',
    description: 'Traditional espresso-soaked savoiardi ladyfingers layered with rich mascarpone zabaglione cream, cocoa powder, and gold leaf highlights.',
    price: 10.00,
    category: 'Desserts',
    image: '/public/images/menu-items/dessert.png',
    bestSeller: true
  },
  {
    id: 'dessert-pistachio',
    name: 'Golden Pistachio Tart',
    description: 'A crisp sweet pastry shell filled with premium Sicilian pistachio ganache, whipped white chocolate mousse, and toasted pistachios.',
    price: 9.50,
    category: 'Desserts',
    image: '/public/images/menu-items/dessert.png',
    bestSeller: false
  }
];

const CATEGORIES = ['All', 'Pizza', 'Coffee', 'Sandwiches', 'Pasta', 'Shakes', 'Mocktails', 'Desserts'];

// --------------------------------------------------------------------------
// 2. Application State
// --------------------------------------------------------------------------
let state = {
  activeCategory: 'All',
  searchQuery: '',
  cart: {}, // Format: { [itemId]: quantity }
  tableNumber: 7, // Default to 7
  activeOrderId: localStorage.getItem('shaina_active_order_id') || null,
  activeOrderListener: null,
  currentView: 'categories', // 'categories' or 'items'
  currentGroup: null // 'Coffee', 'Pastries', 'Brunch', 'Tea' or null
};

// --------------------------------------------------------------------------
// 3. DOM Elements Cache
// --------------------------------------------------------------------------
const categoryListContainer = document.getElementById('category-list');
const menuGrid = document.getElementById('menu-grid');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const currentCategoryTitle = document.getElementById('current-category-title');
const categoryItemCount = document.getElementById('category-item-count');
const emptyState = document.getElementById('empty-state');
const resetFilterBtn = document.getElementById('reset-filter-btn');

// Cart Floating Elements
const floatingCart = document.getElementById('floating-cart');
const cartTotalQty = document.getElementById('cart-total-qty');
const cartTotalPrice = document.getElementById('cart-total-price');
const viewCartBtn = document.getElementById('floating-cart');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const rewardsModal = document.getElementById('rewards-modal');
const ordersModal = document.getElementById('orders-modal');
const cartModal = document.getElementById('cart-modal');
const checkoutFormModal = document.getElementById('checkout-form-modal');
const checkoutSuccessModal = document.getElementById('checkout-success-modal');

// Success Details Elements
const successOrderId = document.getElementById('success-order-id');
const successTableNum = document.getElementById('success-table-num');
const successOrderSummary = document.getElementById('success-order-summary');
const successTotalPrice = document.getElementById('success-total-price');
const successWaitTime = document.getElementById('success-wait-time');
const successTrackBtn = document.getElementById('success-track-btn');
const successBackMenuBtn = document.getElementById('success-back-menu-btn-custom');

// Tracking Details Elements
const trackOrderId = document.getElementById('track-order-id');
const trackStatusBadge = document.getElementById('track-status-badge');
const trackItemsList = document.getElementById('track-items-list');
const trackTimeEst = document.getElementById('track-time-est');
const activeTrackerSection = document.getElementById('active-tracker-section');
const ordersEmptyState = document.getElementById('orders-empty-state');

// Form Inputs
const checkoutForm = document.getElementById('checkout-form');
const checkoutName = document.getElementById('checkout-name');
const checkoutPhone = document.getElementById('checkout-phone');
const checkoutTable = document.getElementById('checkout-table');
const checkoutNotes = document.getElementById('checkout-notes');
const checkoutTotal = document.getElementById('checkout-total');
const cartNotesTextarea = document.getElementById('cart-notes');

// Bottom Tabs Nav
const bottomTabs = document.querySelectorAll('.bottom-nav .nav-tab');

// --------------------------------------------------------------------------
// 4. Initializer
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Detect Table Number
  const urlParams = new URLSearchParams(window.location.search);
  const tableParam = urlParams.get('table');
  if (tableParam) {
    state.tableNumber = parseInt(tableParam, 10) || 7;
  }
  
  updateTableDisplay();
  renderCategories();
  renderMenu();
  switchView('categories');
  setupEventListeners();

  // Resume tracking if active order exists
  if (state.activeOrderId) {
    startOrderTracking(state.activeOrderId);
  }
});

// --------------------------------------------------------------------------
// 5. Table Badge & Input Synchronization
// --------------------------------------------------------------------------
function updateTableDisplay() {
  document.querySelectorAll('.table-text, .welcome-table-badge span').forEach(el => {
    el.textContent = `Table ${state.tableNumber}`;
  });
  if (checkoutTable) {
    checkoutTable.value = `Table ${state.tableNumber}`;
  }
}

// --------------------------------------------------------------------------
// 6. Category Groups and Views Routing
// --------------------------------------------------------------------------
const CATEGORY_GROUPS = {
  Coffee: ['Coffee'],
  Pastries: ['Desserts'],
  Brunch: ['Pizza', 'Sandwiches', 'Pasta'],
  Tea: ['Mocktails', 'Shakes']
};

function switchView(view, group = null) {
  state.currentView = view;
  state.currentGroup = group;

  const categoriesView = document.getElementById('categories-landing-view');
  const menuItemsView = document.getElementById('menu-items-view');
  const categorySection = document.getElementById('horizontal-category-section');
  const bottomTabs = document.querySelectorAll('.bottom-nav .nav-tab');

  if (view === 'categories') {
    state.activeCategory = 'All';
    
    if (bottomTabs.length > 0) {
      bottomTabs.forEach(t => t.classList.remove('active'));
      const discoverTab = document.querySelector('.bottom-nav [data-tab="menu"]');
      if (discoverTab) discoverTab.classList.add('active');
    }
    
    if (categoriesView) {
      categoriesView.classList.remove('hidden-view');
      categoriesView.classList.remove('hidden');
    }
    if (menuItemsView) {
      menuItemsView.classList.add('hidden-view');
    }
    if (categorySection) {
      categorySection.classList.add('hidden');
      categorySection.classList.add('hidden-view');
    }
  } else {
    // Determine activeCategory within the group
    if (group === 'Coffee') {
      state.activeCategory = 'Coffee';
    } else if (group === 'Pastries') {
      state.activeCategory = 'Desserts';
    } else {
      state.activeCategory = 'All';
    }

    if (bottomTabs.length > 0) {
      bottomTabs.forEach(t => t.classList.remove('active'));
      const orderTab = document.querySelector('.bottom-nav [data-tab="order"]');
      if (orderTab) orderTab.classList.add('active');
    }

    renderCategories();
    renderMenu();

    const menuContainer = document.querySelector('.menu-container');
    if (menuContainer) {
      menuContainer.scrollTop = 0;
    }

    if (categoriesView) {
      categoriesView.classList.add('hidden-view');
    }
    if (menuItemsView) {
      menuItemsView.classList.remove('hidden-view');
      menuItemsView.classList.remove('hidden');
    }
    if (categorySection) {
      categorySection.classList.remove('hidden');
      categorySection.classList.remove('hidden-view');
    }
  }
}

function renderCategories() {
  categoryListContainer.innerHTML = '';
  
  let groupCategories = [];
  if (state.currentGroup && CATEGORY_GROUPS[state.currentGroup]) {
    groupCategories = ['All', ...CATEGORY_GROUPS[state.currentGroup]];
  } else {
    groupCategories = CATEGORIES;
  }

  groupCategories.forEach(category => {
    const chip = document.createElement('button');
    chip.className = `category-chip ${state.activeCategory === category ? 'active' : ''}`;
    chip.dataset.category = category;
    
    let label = category;
    let emoji = '';
    
    if (category === 'All') {
      if (state.currentGroup === 'Brunch') {
        label = 'All Brunch';
        emoji = '✨';
      } else if (state.currentGroup === 'Tea') {
        label = 'All Tea';
        emoji = '✨';
      } else {
        label = 'All';
        emoji = '✨';
      }
    } else {
      switch(category) {
        case 'Pizza': emoji = '🍕'; break;
        case 'Coffee': emoji = '☕'; break;
        case 'Sandwiches': emoji = '🥪'; break;
        case 'Pasta': emoji = '🍝'; break;
        case 'Shakes': emoji = '🥤'; break;
        case 'Mocktails': emoji = '🍹'; break;
        case 'Desserts': 
          emoji = '🍰'; 
          label = 'Pastries';
          break;
      }
    }
    
    chip.innerHTML = `<span class="category-icon">${emoji}</span> ${label}`;
    chip.addEventListener('click', () => selectCategory(category));
    categoryListContainer.appendChild(chip);
  });
}

function selectCategory(category) {
  state.activeCategory = category;
  
  const chips = categoryListContainer.querySelectorAll('.category-chip');
  chips.forEach(chip => {
    if (chip.dataset.category === category) {
      chip.classList.add('active');
      chip.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
    } else {
      chip.classList.remove('active');
    }
  });

  renderMenu();
}

// --------------------------------------------------------------------------
// 7. Menu Rendering Logic
// --------------------------------------------------------------------------
function renderMenu() {
  let filteredItems = MENU_DATA;

  if (state.activeCategory === 'All') {
    if (state.currentGroup && CATEGORY_GROUPS[state.currentGroup]) {
      const allowedCategories = CATEGORY_GROUPS[state.currentGroup];
      filteredItems = filteredItems.filter(item => allowedCategories.includes(item.category));
    }
  } else {
    filteredItems = filteredItems.filter(item => item.category === state.activeCategory);
  }

  if (state.searchQuery.trim() !== '') {
    const query = state.searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }

  if (state.activeCategory === 'All') {
    if (state.currentGroup) {
      currentCategoryTitle.textContent = state.currentGroup;
    } else {
      currentCategoryTitle.textContent = 'Our Menu';
    }
  } else {
    currentCategoryTitle.textContent = state.activeCategory === 'Desserts' ? 'Pastries' : state.activeCategory;
  }
  
  categoryItemCount.textContent = `${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'}`;

  if (filteredItems.length === 0) {
    menuGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  } else {
    menuGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }

  menuGrid.innerHTML = '';
  filteredItems.forEach((item, index) => {
    const inCartQty = state.cart[item.id] || 0;
    const isItemInCart = inCartQty > 0;

    const card = document.createElement('div');
    card.className = `menu-item-card`;
    card.id = `card-${item.id}`;
    // Assign a staggered entry index capped at 8
    card.style.setProperty('--stagger-index', Math.min(index, 8));

    card.innerHTML = `
      <div class="item-img-container">
        <img src="${item.image}" alt="${item.name}" class="item-image" loading="lazy">
        ${item.bestSeller ? `
          <div class="best-seller-badge">
            <span class="best-seller-star">★</span>
            <span>Bestseller</span>
          </div>
        ` : ''}
      </div>
      <div class="item-details">
        <div class="item-name-row">
          <h3 class="item-name">${item.name}</h3>
          <span class="item-price">$${item.price.toFixed(2)}</span>
        </div>
        <p class="item-description">${item.description}</p>
        <div class="item-action-row">
          <div class="action-container ${isItemInCart ? 'in-cart' : ''}" id="action-${item.id}">
            <!-- Add Button -->
            <button class="add-btn" data-id="${item.id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add</span>
            </button>
            
            <!-- Quantity Selector -->
            <div class="quantity-selector">
              <button class="qty-btn minus" data-id="${item.id}">−</button>
              <span class="qty-count" id="qty-val-${item.id}">${inCartQty}</span>
              <button class="qty-btn plus" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const addBtn = card.querySelector('.add-btn');
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');

    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCartItem(item.id, 1);
      spawnFloatingText(addBtn, '+1');
    });

    minusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCartItem(item.id, -1);
      spawnFloatingText(minusBtn, '−1');
    });

    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCartItem(item.id, 1);
      spawnFloatingText(plusBtn, '+1');
    });

    menuGrid.appendChild(card);
  });
}

// --------------------------------------------------------------------------
// 8. Cart State Management
// --------------------------------------------------------------------------
function updateCartItem(itemId, change) {
  const currentQty = state.cart[itemId] || 0;
  let newQty = currentQty + change;

  if (newQty < 0) newQty = 0;

  if (newQty === 0) {
    delete state.cart[itemId];
  } else {
    state.cart[itemId] = newQty;
  }

  // Update dynamic quantity selectors in Menu Cards
  const actionContainer = document.getElementById(`action-${itemId}`);
  const qtyVal = document.getElementById(`qty-val-${itemId}`);

  if (actionContainer) {
    if (newQty > 0) {
      qtyVal.textContent = newQty;
      actionContainer.classList.add('in-cart');
    } else {
      actionContainer.classList.remove('in-cart');
    }
  }

  updateCartUI();
}

function updateCartUI() {
  const cartItemIds = Object.keys(state.cart);
  let totalQty = 0;
  let totalPrice = 0;

  cartItemIds.forEach(id => {
    const qty = state.cart[id];
    const item = MENU_DATA.find(i => i.id === id);
    if (item) {
      totalQty += qty;
      totalPrice += item.price * qty;
    }
  });

  if (totalQty > 0) {
    const isHiddenBefore = floatingCart.classList.contains('hidden') || !floatingCart.classList.contains('active');
    
    floatingCart.classList.remove('hidden');
    requestAnimationFrame(() => {
      floatingCart.classList.add('active');
    });
    
    cartTotalQty.textContent = totalQty;
    cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;

    // Trigger cart bump if it was already visible
    if (!isHiddenBefore) {
      floatingCart.classList.add('bump');
      floatingCart.addEventListener('animationend', () => {
        floatingCart.classList.remove('bump');
      }, { once: true });
    }

    // Trigger badge pop
    cartTotalQty.classList.add('pop');
    cartTotalQty.addEventListener('animationend', () => {
      cartTotalQty.classList.remove('pop');
    }, { once: true });
  } else {
    floatingCart.classList.remove('active');
    setTimeout(() => {
      if (!floatingCart.classList.contains('active')) {
        floatingCart.classList.add('hidden');
      }
    }, 400);
  }
}

function spawnFloatingText(targetEl, text) {
  const rect = targetEl.getBoundingClientRect();
  const container = document.querySelector('.app-container');
  if (!container) return;
  const containerRect = container.getBoundingClientRect();

  const particle = document.createElement('span');
  particle.className = 'floating-particle';
  particle.textContent = text;

  // Set red color for subtraction/remove actions
  if (text.startsWith('−')) {
    particle.style.color = 'var(--color-danger)';
  }

  // Position particle relative to .app-container wrapper
  const x = rect.left - containerRect.left + rect.width / 2;
  const y = rect.top - containerRect.top;

  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;

  container.appendChild(particle);

  particle.addEventListener('animationend', () => {
    particle.remove();
  });
}

// --------------------------------------------------------------------------
// 9. Cart Modal Rendering
// --------------------------------------------------------------------------
function renderCartModal() {
  const cartItemIds = Object.keys(state.cart);
  const cartList = document.getElementById('cart-items-list');
  const emptyStateEl = document.getElementById('cart-empty-state');
  const summarySection = document.getElementById('cart-summary-section');
  
  if (!cartList) return;

  if (cartItemIds.length === 0) {
    cartList.innerHTML = '';
    emptyStateEl.classList.remove('hidden');
    summarySection.classList.add('hidden');
    return;
  }

  emptyStateEl.classList.add('hidden');
  summarySection.classList.remove('hidden');

  cartList.innerHTML = '';
  let subtotal = 0;

  cartItemIds.forEach(id => {
    const qty = state.cart[id];
    const item = MENU_DATA.find(i => i.id === id);
    if (!item) return;

    subtotal += item.price * qty;

    const cartCard = document.createElement('div');
    cartCard.className = 'cart-item-card';
    cartCard.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.name}</h4>
        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
      </div>
      <div class="cart-item-controls">
        <div class="cart-item-qty-container">
          <button class="cart-qty-btn cart-minus" data-id="${item.id}">−</button>
          <span class="cart-qty-val">${qty}</span>
          <button class="cart-qty-btn cart-plus" data-id="${item.id}">+</button>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;

    const cartMinus = cartCard.querySelector('.cart-minus');
    const cartPlus = cartCard.querySelector('.cart-plus');
    const cartRemove = cartCard.querySelector('.cart-item-remove');

    cartMinus.addEventListener('click', () => {
      updateCartItem(item.id, -1);
      renderCartModal();
      spawnFloatingText(cartMinus, '−1');
    });

    cartPlus.addEventListener('click', () => {
      updateCartItem(item.id, 1);
      renderCartModal();
      spawnFloatingText(cartPlus, '+1');
    });

    cartRemove.addEventListener('click', () => {
      const removedQty = state.cart[item.id] || 0;
      updateCartItem(item.id, -removedQty);
      renderCartModal();
      spawnFloatingText(cartRemove, `−${removedQty}`);
    });

    cartList.appendChild(cartCard);
  });

  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

// --------------------------------------------------------------------------
// 10. Search Filter Logic
// --------------------------------------------------------------------------
function handleSearch(e) {
  state.searchQuery = e.target.value;

  if (state.searchQuery.trim() !== '') {
    clearSearchBtn.classList.remove('hidden');
    if (state.currentView === 'categories') {
      switchView('items', null);
    }
  } else {
    clearSearchBtn.classList.add('hidden');
  }

  renderMenu();
}

function clearSearch() {
  searchInput.value = '';
  state.searchQuery = '';
  clearSearchBtn.classList.add('hidden');
  if (state.currentGroup === null) {
    switchView('categories');
  } else {
    renderMenu();
  }
  searchInput.focus();
}

// --------------------------------------------------------------------------
// 11. Modals Overlay Management
// --------------------------------------------------------------------------
function openModal(modal) {
  modalOverlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Use animation frames to cleanly trigger transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modalOverlay.classList.add('active');
      modal.classList.add('active');
    });
  });
}

function closeAllModals() {
  const activeContent = modalOverlay.querySelector('.modal-content.active');
  
  modalOverlay.classList.remove('active');
  if (activeContent) {
    activeContent.classList.remove('active');
  }
  document.body.style.overflow = '';

  // Wait 400ms for slide-down outro transition to complete
  setTimeout(() => {
    if (!modalOverlay.classList.contains('active')) {
      modalOverlay.classList.add('hidden');
      rewardsModal.classList.add('hidden');
      ordersModal.classList.add('hidden');
      cartModal.classList.add('hidden');
      checkoutFormModal.classList.add('hidden');
      checkoutSuccessModal.classList.add('hidden');
    }
  }, 400);

  bottomTabs.forEach(tab => {
    if (tab.dataset.tab === 'menu') {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

// --------------------------------------------------------------------------
// 12. Checkout Success Screen population
// --------------------------------------------------------------------------
function showSuccessPage(orderId, payload) {
  successOrderId.textContent = `#${orderId.substring(0, 8).toUpperCase()}`;
  successTableNum.textContent = `Table ${payload.tableNumber}`;
  
  const summaryText = payload.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
  successOrderSummary.textContent = summaryText;
  successTotalPrice.textContent = `$${payload.totalAmount.toFixed(2)}`;
  
  const totalItemsCount = payload.items.reduce((sum, item) => sum + item.quantity, 0);
  const waitTime = Math.min(10 + totalItemsCount * 2, 25);
  successWaitTime.textContent = `${waitTime}-${waitTime + 3} mins`;

  closeAllModals();
  openModal(checkoutSuccessModal);
}

// --------------------------------------------------------------------------
// 13. Firestore Live Order Tracking Status
// --------------------------------------------------------------------------
function startOrderTracking(orderId) {
  if (state.activeOrderListener) {
    state.activeOrderListener();
    state.activeOrderListener = null;
  }

  const orderDocRef = doc(db, "orders", orderId);
  
  state.activeOrderListener = onSnapshot(orderDocRef, (docSnap) => {
    if (!docSnap.exists()) {
      activeTrackerSection.classList.add('hidden');
      ordersEmptyState.classList.remove('hidden');
      return;
    }

    activeTrackerSection.classList.remove('hidden');
    ordersEmptyState.classList.add('hidden');

    const data = docSnap.data();
    
    trackOrderId.textContent = `#${orderId.substring(0, 8).toUpperCase()}`;
    
    const summaryText = data.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
    trackItemsList.textContent = summaryText;

    trackStatusBadge.textContent = data.status.charAt(0).toUpperCase() + data.status.slice(1);
    
    trackStatusBadge.className = 'order-status-badge';
    if (data.status === 'received') {
      trackStatusBadge.classList.add('cooking');
    } else if (data.status === 'preparing') {
      trackStatusBadge.classList.add('cooking');
    } else if (data.status === 'ready') {
      trackStatusBadge.style.backgroundColor = '#D1FAE5';
      trackStatusBadge.style.color = '#065F46';
    } else if (data.status === 'served') {
      trackStatusBadge.style.backgroundColor = '#E0F2FE';
      trackStatusBadge.style.color = '#0369A1';
    }

    const steps = ['received', 'preparing', 'ready', 'served'];
    const currentStepIndex = steps.indexOf(data.status);

    // Update timeline progress bar line width
    const progressBar = document.getElementById('timeline-progress-bar');
    if (progressBar) {
      const percentage = (currentStepIndex / (steps.length - 1)) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    steps.forEach((stepName, index) => {
      const stepEl = document.getElementById(`step-${stepName}`);
      if (stepEl) {
        stepEl.className = 'timeline-step';
        if (index < currentStepIndex) {
          stepEl.classList.add('completed');
        } else if (index === currentStepIndex) {
          stepEl.classList.add('active');
        }
      }
    });

    if (data.status === 'received') {
      trackTimeEst.textContent = 'Order received. Awaiting kitchen confirmation...';
    } else if (data.status === 'preparing') {
      trackTimeEst.textContent = 'Chef is preparing your gourmet meal...';
    } else if (data.status === 'ready') {
      trackTimeEst.textContent = '🎉 Order is ready! Bringing it to your table...';
    } else if (data.status === 'served') {
      trackTimeEst.textContent = '✨ Order served. Enjoy your meal!';
    }
  }, (error) => {
    console.error("Firestore tracking error: ", error);
  });
}

function revealMenu() {
  const welcomeScreen = document.getElementById('welcome-screen');
  const appContainer = document.querySelector('.app-container');
  if (welcomeScreen) welcomeScreen.classList.add('dismissed');
  if (appContainer) {
    appContainer.classList.add('menu-revealed');
    // Set intro-done after 1.2 seconds to clear stagger delays for scroll events
    setTimeout(() => {
      appContainer.classList.add('intro-done');
    }, 1200);
  }
}

// --------------------------------------------------------------------------
// 14. Event Listeners Setup
// --------------------------------------------------------------------------
function setupEventListeners() {
  // Welcome Screen Dismissals
  const welcomeScreen = document.getElementById('welcome-screen');
  const welcomeStartBtn = document.getElementById('welcome-start-btn');
  const welcomeViewMenuBtn = document.getElementById('welcome-view-menu-btn');

  if (welcomeScreen && welcomeStartBtn) {
    welcomeStartBtn.addEventListener('click', () => {
      revealMenu();
    });
  }

  if (welcomeScreen && welcomeViewMenuBtn) {
    welcomeViewMenuBtn.addEventListener('click', () => {
      revealMenu();
    });
  }

  // Category Cards Click Handlers
  const categoryCards = document.querySelectorAll('.category-grid-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const group = card.dataset.categoryGroup;
      if (group) {
        switchView('items', group);
      }
    });
  });

  // Back to Categories button click handler
  const backToCategoriesBtn = document.getElementById('back-to-categories-btn');
  if (backToCategoriesBtn) {
    backToCategoriesBtn.addEventListener('click', () => {
      switchView('categories');
    });
  }

  // Keyboard visibility detection to hide bottom elements on mobile search focus
  const appContainerEl = document.querySelector('.app-container');
  if (searchInput && appContainerEl) {
    searchInput.addEventListener('focus', () => {
      if (window.innerWidth <= 480) {
        appContainerEl.classList.add('keyboard-visible');
      }
    });
    searchInput.addEventListener('blur', () => {
      appContainerEl.classList.remove('keyboard-visible');
    });
  }

  // Scroll listener removed to prevent header resize/layout shifts and ensure perfectly smooth mobile scrolling.

  // Search Listeners
  searchInput.addEventListener('input', handleSearch);
  clearSearchBtn.addEventListener('click', clearSearch);

  // Reset Filters Empty State Button
  resetFilterBtn.addEventListener('click', () => {
    clearSearch();
    if (state.currentGroup) {
      selectCategory('All');
    } else {
      switchView('categories');
    }
  });

  // Modal Closures
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeAllModals();
    }
  });

  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Floating Cart View Cart Action
  viewCartBtn.addEventListener('click', () => {
    renderCartModal();
    openModal(cartModal);
  });

  // Empty cart back to menu
  document.getElementById('close-cart-btn-empty').addEventListener('click', closeAllModals);

  // Empty orders tracking back to menu
  document.getElementById('close-orders-btn-empty').addEventListener('click', closeAllModals);

  // Cart Proceed to Checkout Action
  document.getElementById('cart-checkout-btn').addEventListener('click', () => {
    const cartItemIds = Object.keys(state.cart);
    if (cartItemIds.length === 0) return;

    // Pre-fill Table and Notes
    checkoutNotes.value = cartNotesTextarea.value.trim();
    
    let subtotal = 0;
    cartItemIds.forEach(id => {
      const item = MENU_DATA.find(i => i.id === id);
      if (item) subtotal += item.price * state.cart[id];
    });
    const tax = subtotal * 0.18;
    const totalAmount = subtotal + tax;
    checkoutTotal.textContent = `$${totalAmount.toFixed(2)}`;

    closeAllModals();
    openModal(checkoutFormModal);
  });

  // Checkout Form Submission & Place Order
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameValue = checkoutName.value.trim();
    if (!nameValue) {
      alert("Please enter your name to place the order.");
      return;
    }

    const phoneValue = checkoutPhone.value.trim();
    const notesValue = checkoutNotes.value.trim();

    const cartItemIds = Object.keys(state.cart);
    const items = cartItemIds.map(id => {
      const item = MENU_DATA.find(i => i.id === id);
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: state.cart[id]
      };
    });

    let subtotal = 0;
    items.forEach(i => subtotal += i.price * i.quantity);
    const tax = subtotal * 0.18;
    const totalAmount = subtotal + tax;

    const orderPayload = {
      tableNumber: state.tableNumber,
      customerName: nameValue,
      customerPhone: phoneValue || "",
      items: items,
      totalAmount: totalAmount,
      notes: notesValue || "",
      status: "received",
      createdAt: new Date().toISOString()
    };

    // Disable place button during write
    const placeBtn = document.getElementById('place-order-btn');
    placeBtn.disabled = true;
    placeBtn.textContent = "Placing Order...";

    try {
      const docRef = await addDoc(collection(db, "orders"), orderPayload);
      const orderId = docRef.id;

      // Reset cart and UI
      state.cart = {};
      cartNotesTextarea.value = '';
      updateCartUI();
      renderMenu();

      // Set order id pointers
      state.activeOrderId = orderId;
      localStorage.setItem('shaina_active_order_id', orderId);

      // Start listener
      startOrderTracking(orderId);

      // Render success screen
      showSuccessPage(orderId, orderPayload);

      // Reset form
      checkoutForm.reset();
      updateTableDisplay();
    } catch (err) {
      console.error("Firebase placement error: ", err);
      alert("Failed to connect to Shaina Cafe kitchen. Please check your network and try again.");
    } finally {
      placeBtn.disabled = false;
      placeBtn.textContent = "Place Order";
    }
  });

  // Success screen navigation buttons
  successTrackBtn.addEventListener('click', () => {
    closeAllModals();
    bottomTabs.forEach(t => t.classList.remove('active'));
    const profileTab = document.querySelector('.bottom-nav [data-tab="profile"]');
    if (profileTab) profileTab.classList.add('active');
    openModal(ordersModal);
  });

  document.getElementById('success-back-menu-btn-custom').addEventListener('click', closeAllModals);

  // Bottom Navigation tabs routing
  bottomTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      
      const tabName = tab.dataset.tab;

      bottomTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tabName === 'menu') {
        closeAllModals();
        switchView('categories');
      } else if (tabName === 'order') {
        closeAllModals();
        switchView('items', null);
      } else if (tabName === 'rewards') {
        closeAllModals();
        tab.classList.add('active');
        openModal(rewardsModal);
      } else if (tabName === 'profile') {
        closeAllModals();
        tab.classList.add('active');
        openModal(ordersModal);
        
        // Load active tracker if available
        if (state.activeOrderId) {
          startOrderTracking(state.activeOrderId);
        } else {
          activeTrackerSection.classList.add('hidden');
          ordersEmptyState.classList.remove('hidden');
        }
      }
    });
  });
}
