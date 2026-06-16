import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';

// Component Imports
import { WelcomeScreen } from './components/WelcomeScreen';
import { Header } from './components/Header';
import { DiscoverGrid } from './components/DiscoverGrid';
import { MenuSection } from './components/MenuSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartModal } from './components/CartModal';
import { CheckoutModal } from './components/CheckoutModal';
import { SuccessModal } from './components/SuccessModal';
import { TrackingModal } from './components/TrackingModal';
import { ProfileTab } from './components/ProfileTab';
import { RewardsTab } from './components/RewardsTab';
import { AdminDashboard } from './components/AdminDashboard';

// Type Definitions
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  bestSeller?: boolean;
  new?: boolean;
  featured?: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  notes: string;
  status: 'received' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  createdAt: string;
  userId?: string | null;
}

const sortOrdersNewestFirst = (orders: Order[]) =>
  [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const mergeOrdersById = (baseOrders: Order[], incomingOrders: Order[]) => {
  const orderMap = new Map<string, Order>();

  [...baseOrders, ...incomingOrders].forEach(order => {
    orderMap.set(order.id, { ...orderMap.get(order.id), ...order });
  });

  return sortOrdersNewestFirst(Array.from(orderMap.values()));
};

const createServerFallbackOrder = async (orderPayload: Omit<Order, 'id'> & Record<string, unknown>) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  if (!response.ok) {
    throw new Error(`Local order server returned ${response.status}`);
  }

  return response.json() as Promise<Order>;
};



const SEED_MENU_DATA = [
  // PIZZA (26 items)
  {
    name: 'Paneer Paprika Pizza (Regular)',
    description: 'Spicy paneer chunks, red paprika, bell peppers, mozzarella cheese, and rich house tomato sauce.',
    price: 249,
    category: 'Pizza',
    image: '/images/menu-items/paneer_paprika_pizza.jpg',
    bestSeller: true,
    new: false,
    featured: true
  },
  {
    name: 'Paneer Paprika Pizza (Large)',
    description: 'Spicy paneer chunks, red paprika, bell peppers, mozzarella cheese, and rich house tomato sauce on a large crust.',
    price: 399,
    category: 'Pizza',
    image: '/images/menu-items/paneer_paprika_pizza.jpg',
    bestSeller: true,
    new: false,
    featured: true
  },
  {
    name: 'Loaded Pizza (Regular)',
    description: 'Overloaded with fresh vegetables, mushrooms, olives, paneer, and premium mozzarella cheese.',
    price: 259,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: true
  },
  {
    name: 'Loaded Pizza (Large)',
    description: 'Overloaded with fresh vegetables, mushrooms, olives, paneer, and premium mozzarella cheese on a large crust.',
    price: 409,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: true
  },
  {
    name: 'Margherita Pizza (Regular)',
    description: 'Classic mozzarella, vine-ripened tomatoes, fresh basil leaves, and extra virgin olive oil.',
    price: 189,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Margherita Pizza (Large)',
    description: 'Classic mozzarella, vine-ripened tomatoes, fresh basil leaves, and extra virgin olive oil on a large crust.',
    price: 325,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Corn Pizza (Regular)',
    description: 'Sweet golden corn kernels, rich pizza sauce, and a generous layer of melted mozzarella.',
    price: 195,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Corn Pizza (Large)',
    description: 'Sweet golden corn kernels, rich pizza sauce, and a generous layer of melted mozzarella on a large crust.',
    price: 359,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Punjabi Pizza (Regular)',
    description: 'Spicy tandoori paneer, onions, capsicum, and coriander leaves with a North Indian twist.',
    price: 255,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Punjabi Pizza (Large)',
    description: 'Spicy tandoori paneer, onions, capsicum, and coriander leaves with a North Indian twist on a large crust.',
    price: 420,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Paneer Onion Pizza (Regular)',
    description: 'Succulent paneer cubes and crisp sliced onions on a bed of rich tomato sauce and cheese.',
    price: 209,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Paneer Onion Pizza (Large)',
    description: 'Succulent paneer cubes and crisp sliced onions on a bed of rich tomato sauce and cheese on a large crust.',
    price: 369,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Double Cheese Margherita (Regular)',
    description: 'Classic Margherita loaded with an extra helping of premium stretch mozzarella cheese.',
    price: 215,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Double Cheese Margherita (Large)',
    description: 'Classic Margherita loaded with an extra helping of premium stretch mozzarella cheese on a large crust.',
    price: 349,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Farm Fresh Pizza (Regular)',
    description: 'A colorful mix of capsicum, onion, tomato, golden corn, mushrooms, and olives.',
    price: 255,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Farm Fresh Pizza (Large)',
    description: 'A colorful mix of capsicum, onion, tomato, golden corn, mushrooms, and olives on a large crust.',
    price: 399,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Makhni Pizza (Regular)',
    description: 'Rich and buttery Makhni sauce base topped with paneer, onions, and capsicum.',
    price: 255,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Makhni Pizza (Large)',
    description: 'Rich and buttery Makhni sauce base topped with paneer, onions, and capsicum on a large crust.',
    price: 405,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Tandoori Pizza (Regular)',
    description: 'Charcoal smoky tandoori sauce base, paneer, olives, capsicum, onions, and green chilies.',
    price: 259,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Tandoori Pizza (Large)',
    description: 'Charcoal smoky tandoori sauce base, paneer, olives, capsicum, onions, and green chilies on a large crust.',
    price: 405,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Veggie Italian Pizza (Regular)',
    description: 'Zesty Italian pizza sauce, mushrooms, black olives, bell peppers, baby corn, and cheese.',
    price: 259,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Veggie Italian Pizza (Large)',
    description: 'Zesty Italian pizza sauce, mushrooms, black olives, bell peppers, baby corn, and cheese on a large crust.',
    price: 405,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Peri Peri Pizza (Regular)',
    description: 'Spicy Peri Peri sauce base, red paprika, jalapenos, onions, and bell peppers.',
    price: 275,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: true,
    featured: false
  },
  {
    name: 'Peri Peri Pizza (Large)',
    description: 'Spicy Peri Peri sauce base, red paprika, jalapenos, onions, and bell peppers on a large crust.',
    price: 429,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: true,
    featured: false
  },
  {
    name: 'Malai Paneer Pizza (Regular)',
    description: 'Creamy malai paneer cubes, sweet corn, baby corn, and mild herbs.',
    price: 290,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: true,
    featured: false
  },
  {
    name: 'Malai Paneer Pizza (Large)',
    description: 'Creamy malai paneer cubes, sweet corn, baby corn, and mild herbs on a large crust.',
    price: 450,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: false,
    new: true,
    featured: false
  },

  // PASTA (6 items)
  {
    name: 'Red Sauce Pasta',
    description: 'Penne pasta tossed in our house fiery tomato garlic sauce, loaded with fresh red chilies, extra virgin olive oil, and sweet basil leaves.',
    price: 149,
    category: 'Pasta',
    image: '/images/menu-items/pasta.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Makhni Sauce Pasta',
    description: 'Penne pasta tossed in a rich, buttery North Indian Makhni gravy, topped with cream and herbs.',
    price: 169,
    category: 'Pasta',
    image: '/images/menu-items/pasta.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'White Sauce Pasta',
    description: 'Penne pasta tossed in rich, velvety white cream sauce, loaded with bell peppers, corn, and garlic.',
    price: 165,
    category: 'Pasta',
    image: '/images/menu-items/pasta.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Tandoori Pasta',
    description: 'Smoked tandoori paneer chunks and penne pasta tossed in a creamy, smoky tandoori sauce.',
    price: 165,
    category: 'Pasta',
    image: '/images/menu-items/pasta.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Mix Sauce Pasta',
    description: 'Penne pasta tossed in a perfect blend of tangy red sauce and creamy white sauce (Pink Sauce).',
    price: 165,
    category: 'Pasta',
    image: '/images/menu-items/pasta.jpg',
    bestSeller: false,
    new: true,
    featured: false
  },
  {
    name: 'Baked Pasta',
    description: 'Creamy pasta loaded with fresh vegetables, topped with mozzarella cheese and baked to golden brown.',
    price: 189,
    category: 'Pasta',
    image: '/images/menu-items/baked_pasta.jpg',
    bestSeller: true,
    new: false,
    featured: true
  },

  // SANDWICHES (12 items)
  {
    name: 'Corn Sandwich',
    description: 'Simple and delicious toasted sandwich with sweet golden corn kernels and mayo.',
    price: 105,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Mexican Sandwich',
    description: 'Toasted sandwich packed with spicy Mexican beans, salsa, onions, jalapenos, and bell peppers.',
    price: 109,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Punjabi Paneer Sandwich',
    description: 'Spicy tandoori paneer bhurji, capsicum, onions, and fresh mint chutney toasted in fresh bread.',
    price: 124,
    category: 'Sandwiches',
    image: '/images/menu-items/punjabi_paneer_sandwich.jpg',
    bestSeller: true,
    new: false,
    featured: true
  },
  {
    name: 'Diet Sandwich',
    description: 'Healthy and light multigrain sandwich stuffed with cucumber, tomato, lettuce, and mint yogurt dressing.',
    price: 119,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'French Garlic Sandwich',
    description: 'Toasted garlic bread sandwich stuffed with cheese, garlic butter, and fresh herbs.',
    price: 119,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Cheese Corn Sandwich',
    description: 'Loaded with sweet golden corn kernels and a heavy dose of melted cheddar cheese.',
    price: 115,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Cheese Veg Corn Sandwich',
    description: 'Perfect combination of sweet corn, capsicum, onions, carrots, and gooey cheese.',
    price: 119,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: true,
    new: false,
    featured: true
  },
  {
    name: 'Cheese Sandwich',
    description: 'Classic toasted bread sandwich filled with double layers of melted cheese slices.',
    price: 129,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Veg Corn Sandwich',
    description: 'Sweet corn and freshly chopped vegetables mixed in rich sandwich spread and toasted.',
    price: 119,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Veg Sandwich',
    description: 'Classic street style toasted sandwich with cucumber, tomato, potato slices, and mint chutney.',
    price: 109,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },
  {
    name: 'Paneer Tikka Sandwich',
    description: 'Marinated spicy paneer tikka cubes, onions, and bell peppers in warm toasted bread.',
    price: 119,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: true,
    new: false,
    featured: true
  },
  {
    name: 'Paneer Makhani Sandwich',
    description: 'Creamy paneer cubes coated in rich Makhani gravy, stuffed in toasted bread.',
    price: 119,
    category: 'Sandwiches',
    image: '/images/menu-items/sandwich.jpg',
    bestSeller: false,
    new: false,
    featured: false
  },

  // HOT COFFEE (20 items)
  {
    name: 'Cappuccino (Regular)',
    description: 'Classic rich espresso shot, topped with warm steamed milk foam.',
    price: 119,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Cappuccino (Large)',
    description: 'Double espresso shot topped with a mountain of warm steamed milk foam.',
    price: 159,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Latte (Regular)',
    description: 'Smooth double shot of espresso combined with velvety steamed milk.',
    price: 129,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Latte (Large)',
    description: 'Double shot of espresso combined with extra velvety steamed milk in a large mug.',
    price: 165,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Flat White (Regular)',
    description: 'Espresso with microfoam (steamed milk with small, fine bubbles) and a velvety consistency.',
    price: 129,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Flat White (Large)',
    description: 'Double espresso shot with extra microfoam and velvety milk.',
    price: 165,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Espresso (Single)',
    description: 'Concentrated coffee brewed by forcing hot water under pressure through finely ground beans.',
    price: 89,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Espresso (Double)',
    description: 'A double shot of our house specialty roasted espresso beans.',
    price: 109,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Mocha (Regular)',
    description: 'Espresso shot blended with rich hot chocolate, steamed milk, and cocoa powder.',
    price: 139,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Mocha (Large)',
    description: 'Double espresso shot blended with rich chocolate and steamed milk in a large mug.',
    price: 169,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Hazelnut Latte (Regular)',
    description: 'Velvety espresso and steamed milk flavored with premium sweet hazelnut syrup.',
    price: 129,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Hazelnut Latte (Large)',
    description: 'Large double espresso latte with sweet hazelnut syrup and milk foam.',
    price: 165,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Caramel Latte (Regular)',
    description: 'Espresso and steamed milk swirled with sweet buttery caramel syrup.',
    price: 129,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Caramel Latte (Large)',
    description: 'Large double espresso latte swirled with sweet buttery caramel syrup.',
    price: 165,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Black Coffee (Regular)',
    description: 'Bold and pure espresso shots diluted with hot water (Americano).',
    price: 99,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Black Coffee (Large)',
    description: 'Large size bold black Americano coffee.',
    price: 129,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Biscoff Latte',
    description: 'Specialty espresso blended with creamy milk and rich Biscoff cookie butter, topped with crushed Biscoff biscuit crumble.',
    price: 199,
    category: 'Hot Coffee',
    image: '/images/menu-items/biscoff_latte.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Tiramisu Latte (Regular)',
    description: 'Espresso latte with the flavor of classic Italian tiramisu dessert and cocoa powder dusting.',
    price: 139,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg',
    new: true
  },
  {
    name: 'Tiramisu Latte (Large)',
    description: 'Large espresso latte with the flavor of classic Italian tiramisu dessert.',
    price: 189,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg',
    new: true
  },
  {
    name: 'Hot Chocolate',
    description: 'Rich, dark Belgian chocolate melted in hot steamed milk, topped with mini marshmallows.',
    price: 129,
    category: 'Hot Coffee',
    image: '/images/menu-items/coffee.jpg',
    new: true
  },

  // COLD COFFEE (20 items)
  {
    name: 'Frappe (Regular)',
    description: 'Creamy iced blended coffee topped with whipped cream and chocolate drizzle.',
    price: 149,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Frappe (Large)',
    description: 'Large size creamy iced blended coffee with whipped cream.',
    price: 189,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Iced Latte (Regular)',
    description: 'Chilled milk poured over ice, stained with a double shot of espresso.',
    price: 129,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Iced Latte (Large)',
    description: 'Large cup chilled milk poured over ice with double espresso shot.',
    price: 169,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Biscoff Cold Coffee (Regular)',
    description: 'Creamy blended cold coffee infused with sweet speculoos Biscoff paste and biscuit bits.',
    price: 199,
    category: 'Cold Coffee',
    image: '/images/menu-items/biscoff_latte.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Biscoff Cold Coffee (Large)',
    description: 'Large cup creamy blended cold coffee infused with sweet speculoos Biscoff paste and biscuit bits.',
    price: 239,
    category: 'Cold Coffee',
    image: '/images/menu-items/biscoff_latte.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Cafe Mocha (Regular)',
    description: 'Chilled chocolate mocha syrup blended with coffee, milk, ice, and whipped cream.',
    price: 149,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Cafe Mocha (Large)',
    description: 'Large size blended iced chocolate cafe mocha with whipped cream.',
    price: 189,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Koppi Shaina (Regular)',
    description: 'Our signature secret spiced sweet cold coffee recipe, brewed with premium local beans.',
    price: 189,
    category: 'Cold Coffee',
    image: '/images/menu-items/koppi_shaina.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Koppi Shaina (Large)',
    description: 'Large signature secret spiced sweet cold coffee recipe.',
    price: 239,
    category: 'Cold Coffee',
    image: '/images/menu-items/koppi_shaina.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Caramel Frappe (Regular)',
    description: 'Iced blended coffee with rich caramel sauce, milk, ice, and whipped cream.',
    price: 139,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Caramel Frappe (Large)',
    description: 'Large blended coffee with sweet caramel sauce and whipped cream.',
    price: 189,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'French Vanilla Latte (Regular)',
    description: 'Double espresso over ice with chilled milk and aromatic French vanilla syrup.',
    price: 125,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'French Vanilla Latte (Large)',
    description: 'Large double espresso over ice with French vanilla syrup and milk.',
    price: 179,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg'
  },
  {
    name: 'Brownie Frappe (Regular)',
    description: 'Rich blended iced coffee loaded with fudge brownie chunks and chocolate sauce.',
    price: 199,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Brownie Frappe (Large)',
    description: 'Large blended iced coffee loaded with fudge brownie chunks and chocolate sauce.',
    price: 239,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Vanilla Frappe (Regular)',
    description: 'Light and creamy blended iced coffee flavored with classic Madagascar vanilla bean.',
    price: 159,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg',
    new: true
  },
  {
    name: 'Vanilla Frappe (Large)',
    description: 'Large blended iced coffee flavored with Madagascar vanilla bean.',
    price: 199,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg',
    new: true
  },
  {
    name: 'Tiramisu Frappe (Regular)',
    description: 'Iced blended coffee with rich mascarpone cheese flavor and cocoa powder.',
    price: 179,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg',
    new: true
  },
  {
    name: 'Tiramisu Frappe (Large)',
    description: 'Large blended iced coffee with rich mascarpone cheese flavor and cocoa powder.',
    price: 209,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg',
    new: true
  },

  // SHAKES (22 items)
  {
    name: 'Kitkat Shake (Regular)',
    description: 'Indulgent chocolate shake blended with crunchy Kitkat waffle bars.',
    price: 139,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Kitkat Shake (Large)',
    description: 'Large chocolate shake blended with crunchy Kitkat waffle bars.',
    price: 169,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Caramel Oreo (Regular)',
    description: 'Classic Oreo shake blended with sweet buttery caramel sauce.',
    price: 119,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Caramel Oreo (Large)',
    description: 'Large size Oreo shake blended with sweet buttery caramel sauce.',
    price: 149,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Mango Mastani (Regular)',
    description: 'Thick mango pulp milkshake topped with chopped nuts, vanilla ice cream, and cherries.',
    price: 139,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Mango Mastani (Large)',
    description: 'Large size thick mango pulp milkshake topped with nuts and ice cream.',
    price: 169,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Bubble Gum Shake (Regular)',
    description: 'Fun, pink, retro-themed milkshake with nostalgic sweet bubble gum flavor.',
    price: 149,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Bubble Gum Shake (Large)',
    description: 'Large size pink milkshake with sweet bubble gum flavor.',
    price: 189,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Brownie Shake (Regular)',
    description: 'Thick milkshake blended with chocolate fudge brownies and vanilla bean ice cream.',
    price: 149,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Brownie Shake (Large)',
    description: 'Large chocolate milkshake blended with chocolate fudge brownies.',
    price: 189,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Oreo Blast (Regular)',
    description: 'Velvety vanilla milkshake loaded with crushed chocolate Oreo cookies and chocolate syrup.',
    price: 139,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Oreo Blast (Large)',
    description: 'Large size vanilla milkshake loaded with crushed Oreo cookies and chocolate syrup.',
    price: 169,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Chocolate Coco (Regular)',
    description: 'Rich chocolate milkshake blended with toasted coconut flakes and coconut milk.',
    price: 109,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Chocolate Coco (Large)',
    description: 'Large size rich chocolate milkshake blended with toasted coconut flakes.',
    price: 139,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Black Currant (Regular)',
    description: 'Sweet and tangy milkshake made with blackcurrant berries and vanilla ice cream.',
    price: 109,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Black Currant (Large)',
    description: 'Large size sweet and tangy blackcurrant berry milkshake.',
    price: 139,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Blueberry Cheese Shake (Regular)',
    description: 'Indulgent thick shake tasting like a liquid blueberry cheesecake with cream cheese.',
    price: 169,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Blueberry Cheese Shake (Large)',
    description: 'Large size thick shake tasting like a liquid blueberry cheesecake.',
    price: 199,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Vanilla Shake (Regular)',
    description: 'Classic milkshake blended with double vanilla bean pods and cream.',
    price: 139,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Vanilla Shake (Large)',
    description: 'Large size classic double vanilla bean milkshake.',
    price: 169,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg'
  },
  {
    name: 'Shahi Kesar Badam (Regular)',
    description: 'Traditional Indian royal milkshake with saffron strands (kesar) and almonds (badam).',
    price: 149,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Shahi Kesar Badam (Large)',
    description: 'Large traditional Indian royal saffron and almond milkshake.',
    price: 189,
    category: 'Shakes',
    image: '/images/menu-items/shake.jpg',
    bestSeller: true,
    featured: true
  },

  // MOCKTAILS (11 items)
  {
    name: 'Virgin Mojito',
    description: 'Classic refreshing mocktail made with fresh lime juice, mint leaves, simple syrup, and sparkling soda.',
    price: 105,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg'
  },
  {
    name: 'Angry Chilli Guava',
    description: 'Zesty guava juice with red chili powder rim, lime juice, and a kick of spice.',
    price: 109,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg'
  },
  {
    name: 'Signature Mojito',
    description: 'Our bartender special custom blended fruit juice and mint mojito.',
    price: 139,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Tangy Jamun Mojito',
    description: 'A purple summer mocktail made with tangy Indian black plum (jamun) pulp and mint.',
    price: 129,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg',
    new: true
  },
  {
    name: 'Green Apple Mojito',
    description: 'Crisp green apple syrup, mint, lime juice, and sparkling club soda.',
    price: 119,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg'
  },
  {
    name: 'Bubble Gum Mocktail',
    description: 'Sweet pink mocktail with retro bubble gum flavor and sparkling soda.',
    price: 129,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg'
  },
  {
    name: 'Peach Mojito',
    description: 'Sweet golden peach nectar, crushed mint leaves, lime, and sparkling club soda.',
    price: 129,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg',
    new: true
  },
  {
    name: 'Water Melon Mojito',
    description: 'Fresh juicy watermelon chunks, crushed mint, lime, and sparkling club soda.',
    price: 119,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg'
  },
  {
    name: 'Black Widow',
    description: 'Dark berry mocktail with blackberries, lime, soda, and a sugar rim.',
    price: 129,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg'
  },
  {
    name: 'Blue Berry Mojito',
    description: 'Sweet blueberries, mint leaves, lime juice, and sparkling soda.',
    price: 139,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg'
  },
  {
    name: 'Spicy Mango',
    description: 'Sweet mango nectar with a kick of hot spice and lime, served with chili salt rim.',
    price: 115,
    category: 'Mocktails',
    image: '/images/menu-items/mocktail.jpg',
    new: true
  },

  // DESSERTS (6 items)
  {
    name: 'Hot Brownie With Chocolate',
    description: 'Warm, gooey chocolate fudge brownie smothered in rich hot chocolate fudge sauce.',
    price: 109,
    category: 'Desserts',
    image: '/images/menu-items/dessert.jpg'
  },
  {
    name: 'Sizzling Brownie',
    description: 'Freshly baked chocolate brownie served on a sizzler plate with vanilla scoop and sizzling hot chocolate syrup.',
    price: 189,
    category: 'Desserts',
    image: '/images/menu-items/sizzling_brownie.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Hot Brownie With Vanilla',
    description: 'Warm chocolate fudge brownie paired with a scoop of cold Madagascar vanilla bean gelato.',
    price: 149,
    category: 'Desserts',
    image: '/images/menu-items/dessert.jpg'
  },
  {
    name: 'Brownie Paradise',
    description: 'A double decker brownie layered with vanilla ice cream, whipped cream, cherries, and chocolate chips.',
    price: 149,
    category: 'Desserts',
    image: '/images/menu-items/dessert.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Choco Lava Cake',
    description: 'Warm chocolate cake with a molten chocolate liquid core, dusted with powdered sugar.',
    price: 119,
    category: 'Desserts',
    image: '/images/menu-items/dessert.jpg'
  },
  {
    name: 'Nutella Brownie',
    description: 'Rich fudge brownie swirled and layered with creamy Nutella hazelnut spread.',
    price: 159,
    category: 'Desserts',
    image: '/images/menu-items/dessert.jpg',
    new: true
  }
];

const promiseWithTimeout = <T,>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(errorMsg));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timeoutId);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
};

const isAdminRoute = () => {
  const params = new URLSearchParams(window.location.search);
  return window.location.pathname.startsWith('/admin') || params.get('admin') === 'true' || window.location.hash === '#admin';
};

const ensureOrderAuth = async () => {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const credential = await signInAnonymously(auth);
  return credential.user;
};

export default function App() {
  // Routing & View States
  const [currentView, setCurrentView] = useState<'welcome' | 'menu' | 'admin'>('welcome');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [currentSubView, setCurrentSubView] = useState<'categories' | 'items'>('categories');
  const [currentGroup, setCurrentGroup] = useState<'Coffee' | 'Pastries' | 'Brunch' | 'Tea' | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Animations & Intro Transition States
  const [menuRevealed, setMenuRevealed] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'discover' | 'order' | 'rewards' | 'profile'>('discover');

  // Cart States
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [cartNotes, setCartNotes] = useState<string>('');

  // Customer/User States
  const [guestName, setGuestName] = useState<string>('');
  const [guestTable, setGuestTable] = useState<number>(7);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]);

  // Active Live Order tracking state
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Firestore Menu State (initialized with local seed data for instant 0ms rendering)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    SEED_MENU_DATA.map((item, idx) => ({ id: `temp-${idx}`, ...item }))
  );
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  
  // Detail views and Modal overlays
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [showModal, setShowModal] = useState<'cart' | 'checkout' | 'success' | 'tracking' | 'profile' | null>(null);

  // Success Confirmation Cache
  const [successDetails, setSuccessDetails] = useState<{ id: string; totalAmount: number; itemsCount: number } | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Listen for local orders placed in other tabs (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shaina_local_orders') {
        const localOrdersStr = e.newValue;
        const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];

        // Sync unfiltered allOrders list
        setAllOrders(prev => {
          const firestoreOnly = prev.filter(o => !o.id.startsWith('local-'));
          const merged = [...firestoreOnly];
          localOrders.forEach((lo: Order) => {
            if (!merged.some(m => m.id === lo.id)) {
              merged.push(lo);
            }
          });
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return merged;
        });

        // Sync filtered ordersHistory list
        const guestOrdersStr = localStorage.getItem('shaina_guest_orders');
        const guestOrderIds = guestOrdersStr ? JSON.parse(guestOrdersStr) : [];

        setOrdersHistory(prev => {
          const firestoreOnly = prev.filter(o => !o.id.startsWith('local-'));
          const merged = [...firestoreOnly];
          localOrders.forEach((lo: Order) => {
            const isGuestLocal = !googleUser && !lo.userId && guestOrderIds.includes(lo.id);
            const isUserLocal = googleUser && lo.userId === googleUser.uid;
            if ((isUserLocal || isGuestLocal) && !merged.some(m => m.id === lo.id)) {
              merged.push(lo);
            }
          });
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return merged;
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [googleUser]);

  // Listen to same-network orders saved by the local Vite server fallback.
  useEffect(() => {
    const applyServerOrders = (serverOrders: Order[]) => {
      const guestOrdersStr = localStorage.getItem('shaina_guest_orders');
      const guestOrderIds = guestOrdersStr ? JSON.parse(guestOrdersStr) : [];

      setAllOrders(prev => mergeOrdersById(prev, serverOrders));
      setOrdersHistory(prev => {
        const visibleServerOrders = serverOrders.filter(order => {
          return googleUser ? order.userId === googleUser.uid : guestOrderIds.includes(order.id);
        });

        return mergeOrdersById(prev, visibleServerOrders);
      });
    };

    const fetchServerOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) return;

        const serverOrders = await response.json() as Order[];
        applyServerOrders(serverOrders);
      } catch (error) {
        console.warn('Local server orders fetch failed:', error);
      }
    };

	    fetchServerOrders();
	    const intervalId = window.setInterval(fetchServerOrders, 2000);
	    const eventSource = typeof EventSource !== 'undefined' ? new EventSource('/api/orders/stream') : null;

	    if (eventSource) {
	      eventSource.onmessage = event => {
	        try {
	          applyServerOrders(JSON.parse(event.data));
	        } catch (error) {
	          console.warn('Local server order stream parse failed:', error);
	        }
	      };
	      eventSource.onerror = () => {
	        fetchServerOrders();
	      };
	    }

	    return () => {
	      window.clearInterval(intervalId);
	      eventSource?.close();
	    };
	  }, [googleUser]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => prev === message ? null : prev);
    }, 2500);
  };

  const openAdminPortal = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setShowModal(null);
    setCurrentView('admin');
  };

  // Load user data on startup
  useEffect(() => {
    if (isAdminRoute()) {
      setCurrentView('admin');
      setWelcomeDismissed(true);
      setMenuRevealed(true);
      setIntroDone(true);
      return;
    }

    // Sync table number query param if available
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    
    const cachedName = localStorage.getItem('shaina_customer_name');
    const cachedTable = localStorage.getItem('shaina_table_number');
    const cachedActiveOrderId = localStorage.getItem('shaina_active_order_id');

    if (tableParam) {
      setGuestTable(parseInt(tableParam, 10) || 7);
    } else if (cachedTable) {
      setGuestTable(parseInt(cachedTable, 10) || 7);
    }

    if (cachedName) {
      setGuestName(cachedName);
      // Skip welcome screen for returning customers
      setCurrentView('menu');
      setWelcomeDismissed(true);
      setMenuRevealed(true);
      setIntroDone(true);
    }

    if (cachedActiveOrderId) {
      setActiveOrderId(cachedActiveOrderId);
    }
  }, []);

  // Sync back button / popstate route changes
  useEffect(() => {
    const handlePopState = () => {
      if (isAdminRoute()) {
        setCurrentView('admin');
        setShowModal(null);
        return;
      }

      const cachedName = localStorage.getItem('shaina_customer_name');
      setCurrentView(cachedName ? 'menu' : 'welcome');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen to rewards catalog dynamically
  useEffect(() => {
    const q = query(collection(db, 'rewards'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rews: any[] = [];
      snapshot.forEach(docSnap => {
        rews.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRewardsList(rews);
    }, (error) => {
      console.warn("Firestore customer rewards listen failed:", error);
    });
    return unsubscribe;
  }, []);

  // Sync Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const signedInCustomer = user && !user.isAnonymous ? user : null;
      setGoogleUser(signedInCustomer);

      if (signedInCustomer) {
        // Sync user details with Firestore
        const userDocRef = doc(db, 'users', signedInCustomer.uid);
        
        // Listen to User loyalty document
        const unsubUserDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            setLoyaltyPoints(snap.data().points || 0);
          } else {
            const localPoints = parseInt(localStorage.getItem('shaina_local_points') || '0', 10);
            setLoyaltyPoints(localPoints);
          }
        }, (error) => {
          console.warn("User document listen failed, using local points fallback:", error);
          const localPoints = parseInt(localStorage.getItem('shaina_local_points') || '0', 10);
          setLoyaltyPoints(localPoints);
        });

        return () => {
          unsubUserDoc();
        };
      } else {
        setLoyaltyPoints(0);
      }
    });
    return unsubscribe;
  }, []);

  // Listen to orders history (either Google User's cloud history or Guest User's local device history)
  useEffect(() => {
    const qHistory = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(qHistory, (snapshot) => {
      const historyList: Order[] = [];
      const unfilteredList: Order[] = [];
      const guestOrdersStr = localStorage.getItem('shaina_guest_orders');
      const guestOrderIds = guestOrdersStr ? JSON.parse(guestOrdersStr) : [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const orderObj = { id: docSnap.id, ...data } as Order;
        unfilteredList.push(orderObj);

        const isGuestOrder = guestOrderIds.includes(docSnap.id);
        const isUserOrder = googleUser && data.userId === googleUser.uid;
        
        if (isUserOrder || (!googleUser && isGuestOrder)) {
          historyList.push(orderObj);
        }
      });
      
      // Merge with any local-only orders that weren't synced to Firestore yet
      const localOrdersStr = localStorage.getItem('shaina_local_orders');
      const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      
      localOrders.forEach((lo: Order) => {
        if (!unfilteredList.some(h => h.id === lo.id)) {
          unfilteredList.push(lo);
        }
        if (!historyList.some(h => h.id === lo.id)) {
          const isGuestLocal = !googleUser && !lo.userId;
          const isUserLocal = googleUser && lo.userId === googleUser.uid;
          if (isUserLocal || isGuestLocal) {
            historyList.push(lo);
          }
        }
      });
      
      // Sort lists by date desc
      historyList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      unfilteredList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrdersHistory(prev => {
        const sharedLocalHistory = prev.filter(order => order.id.startsWith('local-server-'));
        return mergeOrdersById(historyList, sharedLocalHistory);
      });
      setAllOrders(prev => {
        const sharedLocalOrders = prev.filter(order => order.id.startsWith('local-server-'));
        return mergeOrdersById(unfilteredList, sharedLocalOrders);
      });
    }, (error) => {
      console.warn("Firestore history listen failed, loading local orders:", error);
      const localOrdersStr = localStorage.getItem('shaina_local_orders');
      const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      
      const filteredLocal = localOrders.filter((lo: any) => {
        return googleUser ? lo.userId === googleUser.uid : !lo.userId;
      });
      filteredLocal.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      localOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrdersHistory(filteredLocal);
      setAllOrders(localOrders);
    });

    return unsubscribe;
  }, [googleUser]);

  // Listen to Firestore menu items & seed DB if empty
  useEffect(() => {
    const q = query(collection(db, 'menu_items'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        let image = data.image || '';
        // Map Unsplash URLs and old local PNG paths to high-performance local JPEG assets for instant loading
        if (image.includes('unsplash.com') || image.includes('/images/menu-items/') || image.includes('/public/images/menu-items/')) {
          const cat = (data.category || '').toLowerCase();
          if (cat.includes('coffee') || cat.includes('tea') || cat.includes('smoothies')) {
            image = '/images/menu-items/coffee.jpg';
          } else if (cat.includes('pizza')) {
            image = '/images/menu-items/pizza.jpg';
          } else if (cat.includes('sandwich') || cat.includes('bread') || cat.includes('wrap') || cat.includes('fries') || cat.includes('nachos') || cat.includes('salad') || cat.includes('brunch')) {
            image = '/images/menu-items/sandwich.jpg';
          } else if (cat.includes('pasta')) {
            image = '/images/menu-items/pasta.jpg';
          } else if (cat.includes('shake')) {
            image = '/images/menu-items/shake.jpg';
          } else if (cat.includes('mocktail')) {
            image = '/images/menu-items/mocktail.jpg';
          } else if (cat.includes('dessert') || cat.includes('pastries') || cat.includes('ice cream')) {
            image = '/images/menu-items/dessert.jpg';
          }
        }
        
        items.push({ id: docSnap.id, ...data, image } as MenuItem);
      });

      if (items.length === 0) {
        // Database is empty. Seed initial menu data to Firestore
        console.log('Seeding initial menu data to Firestore...');
        setMenuItems(SEED_MENU_DATA.map((item, idx) => ({ id: `temp-${idx}`, ...item })));
        setLoadingMenu(false);
        const seedPromises = SEED_MENU_DATA.map(item => addDoc(collection(db, 'menu_items'), item));
        await Promise.all(seedPromises);
      } else {
        setMenuItems(items);
        setLoadingMenu(false);
      }
    }, (error) => {
      console.error("Firestore read error:", error);
      // Fallback to local seed data immediately if Firestore read fails
      setMenuItems(SEED_MENU_DATA.map((item, idx) => ({ id: `temp-${idx}`, ...item })));
      setLoadingMenu(false);
    });

    return unsubscribe;
  }, []);

  // Real-time listener for active tracking order
  useEffect(() => {
    if (!activeOrderId) {
      setActiveOrder(null);
      return;
    }

    if (activeOrderId.startsWith('local-')) {
      const localOrdersStr = localStorage.getItem('shaina_local_orders');
      const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      const found = localOrders.find((lo: Order) => lo.id === activeOrderId);
      setActiveOrder(found || null);
      return;
    }

    const docRef = doc(db, 'orders', activeOrderId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setActiveOrder({ id: docSnap.id, ...docSnap.data() } as Order);
      } else {
        setActiveOrder(null);
      }
    }, (error) => {
      console.warn("Active order doc listen failed, checking local storage:", error);
      const localOrdersStr = localStorage.getItem('shaina_local_orders');
      const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      const found = localOrders.find((lo: Order) => lo.id === activeOrderId);
      setActiveOrder(found || null);
    });

    return unsubscribe;
  }, [activeOrderId]);

  // Welcome screen submit handler
  const handleStartOrdering = (name: string, table: number) => {
    setGuestName(name);
    setGuestTable(table);
    localStorage.setItem('shaina_customer_name', name);
    localStorage.setItem('shaina_table_number', String(table));
    setWelcomeDismissed(true);
    setMenuRevealed(true);
    setTimeout(() => {
      setIntroDone(true);
      setCurrentView('menu');
    }, 400);
  };

  const handleUpdateGuestDetails = (name: string, table: number) => {
    setGuestName(name);
    setGuestTable(table);
    localStorage.setItem('shaina_customer_name', name);
    localStorage.setItem('shaina_table_number', String(table));

    // If Google login user is active, sync name to loyalty profile too
    if (googleUser) {
      updateDoc(doc(db, 'users', googleUser.uid), { name: name });
    }
  };

  // Search Input Handler
  const handleSearchQuery = (queryText: string) => {
    setSearchQuery(queryText);
    if (queryText.trim() !== '') {
      if (currentSubView === 'categories') {
        setCurrentSubView('items');
        setCurrentGroup(null);
        setActiveCategory('All');
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (currentGroup === null) {
      setCurrentSubView('categories');
    }
  };

  // Category selection handler
  const handleSelectGroup = (group: 'Coffee' | 'Pastries' | 'Brunch' | 'Tea') => {
    setCurrentGroup(group);
    if (group === 'Coffee') {
      setActiveCategory('Hot Coffee');
    } else if (group === 'Pastries') {
      setActiveCategory('Desserts');
    } else {
      setActiveCategory('All');
    }
    setCurrentSubView('items');
  };

  const handleBackToCategories = () => {
    setCurrentSubView('categories');
    setCurrentGroup(null);
    setActiveCategory('All');
    setSearchQuery('');
  };

  // Cart handlers
  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setCart(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = currentQty + delta;
      
      const newCart = { ...prev };
      if (newQty <= 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = newQty;
      }
      return newCart;
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  };

  // Calculate cart quantities and price amounts
  const getCartTotals = () => {
    let totalItems = 0;
    let subtotal = 0;
    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = menuItems.find(i => i.id === itemId);
      if (item) {
        totalItems += qty;
        subtotal += item.price * qty;
      }
    });

    const gst = subtotal * 0.05; // 5% GST
    const totalAmount = subtotal + gst;
    return { totalItems, subtotal, gst, totalAmount };
  };

  const totals = getCartTotals();

  // Checkout Placement Handler
  const handlePlaceOrder = async (name: string, phone: string) => {
    try {
      const orderItems = Object.entries(cart).map(([itemId, qty]) => {
        const item = menuItems.find(i => i.id === itemId);
        return {
          id: itemId,
          name: item ? item.name : 'Unknown Item',
          price: item ? item.price : 0,
          quantity: qty
        };
      });

      const orderPayload = {
        customerName: name,
        customerPhone: phone,
        tableNumber: guestTable,
        items: orderItems,
        totalAmount: totals.totalAmount,
        notes: cartNotes.trim(),
        status: 'received' as const,
        createdAt: new Date().toISOString(),
        userId: googleUser ? googleUser.uid : null,
        createdByUid: auth.currentUser?.uid || null,
        isGuestOrder: !googleUser
      };

      // Save to the same-network local order server first so mobile orders appear on admin immediately.
      let newOrderId = '';
      let savedOrder: Order | null = null;
      try {
        savedOrder = await createServerFallbackOrder(orderPayload);
        newOrderId = savedOrder.id;
      } catch (err) {
        console.warn("Local order server failed, trying Firestore:", err);
        try {
          const orderAuthUser = await promiseWithTimeout(
            ensureOrderAuth(),
            3000,
            "Firebase auth timed out"
          );
          const firestorePayload = {
            ...orderPayload,
            createdByUid: orderAuthUser.uid
          };
          const docRef = await promiseWithTimeout(
            addDoc(collection(db, 'orders'), firestorePayload),
            7000,
            "Firestore write timed out"
          );
          newOrderId = docRef.id;
          savedOrder = { id: docRef.id, ...firestorePayload };
        } catch (firestoreErr) {
          console.warn("Shared order placement failed, falling back to this device only:", firestoreErr);
          newOrderId = 'local-' + Date.now();
        }
      }

      // Accrue Loyalty Points (₹100 spent = 10 points)
      const pointsEarned = Math.floor(totals.totalAmount * 0.1); // Since total is in Rupees, ₹100 = 10 pts (amount * 0.1)
      if (googleUser) {
        try {
          const userDocRef = doc(db, 'users', googleUser.uid);
          await updateDoc(userDocRef, {
            points: increment(pointsEarned)
          });
        } catch (err) {
          console.warn("Firestore points increment failed, using local fallback:", err);
          const localPoints = parseInt(localStorage.getItem('shaina_local_points') || '0', 10);
          localStorage.setItem('shaina_local_points', String(localPoints + pointsEarned));
          setLoyaltyPoints(localPoints + pointsEarned);
        }
      }

      // Save full order details in localStorage as a backup
      const localOrdersStr = localStorage.getItem('shaina_local_orders');
      const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      const localOrderObj = savedOrder || { id: newOrderId, ...orderPayload };
      if (!localOrders.some((order: Order) => order.id === localOrderObj.id)) {
        localOrders.push(localOrderObj);
      }
      localStorage.setItem('shaina_local_orders', JSON.stringify(localOrders));
      setAllOrders(prev => {
        const merged = prev.some(order => order.id === localOrderObj.id) ? prev : [localOrderObj, ...prev];
        return [...merged].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
      setOrdersHistory(prev => {
        const shouldShowInHistory = googleUser ? localOrderObj.userId === googleUser.uid : !localOrderObj.userId;
        if (!shouldShowInHistory || prev.some(order => order.id === localOrderObj.id)) return prev;
        return [localOrderObj, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });

      // Sync local order tracking state
      setActiveOrderId(newOrderId);
      localStorage.setItem('shaina_active_order_id', newOrderId);

      // Save guest order IDs to local storage for guest order history tracking
      if (!googleUser) {
        const localGuestOrders = localStorage.getItem('shaina_guest_orders');
        const guestOrdersArray = localGuestOrders ? JSON.parse(localGuestOrders) : [];
        if (!guestOrdersArray.includes(newOrderId)) {
          guestOrdersArray.push(newOrderId);
          localStorage.setItem('shaina_guest_orders', JSON.stringify(guestOrdersArray));
        }
      }

      // Cache details for Success Screen
      setSuccessDetails({
        id: newOrderId,
        totalAmount: totals.totalAmount,
        itemsCount: totals.totalItems
      });

      // Clear cart
      setCart({});
      setCartNotes('');
      setShowModal('success');
      showToast('🎉 Order placed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      showToast('⚠️ Failed to place order. Check connection.');
    }
  };

  // Redeem rewards points handler
  /*
  const handleRedeemReward = async (points: number, rewardName: string) => {
    if (!googleUser) return;
    if (loyaltyPoints < points) {
      alert('Insufficient points to claim reward.');
      return;
    }

    try {
      const userRef = doc(db, 'users', googleUser.uid);
      await updateDoc(userRef, {
        points: increment(-points)
      });
      alert(`🎉 Success! You have redeemed "${rewardName}" for ${points} points! Show this coupon at the counter to claim.`);
    } catch (err) {
      console.error(err);
      alert('Failed to redeem reward.');
    }
  };
  */

  // Nav routing logic
  const handleOpenActiveTracker = () => {
    setShowModal('tracking');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (orderId.startsWith('local-')) {
      const localOrdersStr = localStorage.getItem('shaina_local_orders');
      const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      const updated = localOrders.map((lo: Order) => {
        if (lo.id === orderId) {
          return { ...lo, status };
        }
        return lo;
      });
      localStorage.setItem('shaina_local_orders', JSON.stringify(updated));
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setOrdersHistory(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (activeOrderId === orderId) {
        setActiveOrder(prev => prev ? { ...prev, status } : null);
      }
      showToast(`Order status updated to ${status}`);
      return;
    }

    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status });
      showToast(`Order status updated to ${status}`);
    } catch (err) {
      console.error("Failed to update order status in Firestore:", err);
      showToast("⚠️ Failed to update status");
    }
  };

  const handleAdminSignOut = () => {
    signOut(auth);
    localStorage.removeItem('shaina_customer_name');
    localStorage.removeItem('shaina_table_number');
    localStorage.removeItem('shaina_active_order_id');
    localStorage.removeItem('shaina_guest_orders');
    setGuestName('');
    setGuestTable(7);
    setActiveOrderId(null);
    setCart({});
    setWelcomeDismissed(false);
    setMenuRevealed(false);
    setIntroDone(false);
    window.history.pushState({}, '', '/');
    setCurrentView('welcome');
    setActiveNavTab('discover');
  };

  if (currentView === 'admin') {
    return (
      <AdminDashboard
        orders={allOrders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onSignOut={handleAdminSignOut}
      />
    );
  }

  const activeTab = activeNavTab;

  return (
    <div className={`app-container font-body ${menuRevealed ? 'menu-revealed' : ''} ${introDone ? 'intro-done' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Welcome Screen Overlay */}
      {!introDone && (
        <WelcomeScreen
          onStart={handleStartOrdering}
          initialName={guestName}
          initialTable={String(guestTable)}
          dismissed={welcomeDismissed}
        />
      )}

      {/* Brand Header */}
      <Header
        tableNumber={guestTable}
        searchQuery={searchQuery}
        onSearchChange={handleSearchQuery}
        onClearSearch={handleClearSearch}
        onOpenProfile={() => {
          setActiveNavTab('profile');
        }}
        activeTab={activeTab}
        cartItemsCount={totals.totalItems}
        onOpenCart={() => setShowModal('cart')}
      />

      {/* Main Container */}
      <main className="menu-container" style={{ paddingBottom: activeTab === 'profile' || activeTab === 'rewards' ? '90px' : '100px' }}>
        {activeTab === 'profile' ? (
          <ProfileTab
            guestName={guestName}
            guestTable={guestTable}
            onUpdateGuest={handleUpdateGuestDetails}
            googleUser={googleUser}
            loyaltyPoints={loyaltyPoints}
            ordersHistory={ordersHistory}
            menuItems={menuItems}
            onOpenProductDetails={setSelectedDetailItem}
            onSignOut={() => {
              if (googleUser) {
                signOut(auth);
              }
              localStorage.removeItem('shaina_customer_name');
              localStorage.removeItem('shaina_table_number');
              localStorage.removeItem('shaina_active_order_id');
              localStorage.removeItem('shaina_guest_orders');
              setGuestName('');
              setGuestTable(7);
              setActiveOrderId(null);
              setCart({});
              setWelcomeDismissed(false);
              setMenuRevealed(false);
              setIntroDone(false);
              setCurrentView('welcome');
              setActiveNavTab('discover');
            }}
            activeOrder={activeOrder}
            setActiveTab={setActiveNavTab}
            onAddToCart={(itemId: string) => {
              handleUpdateCartQty(itemId, 1);
              const itemName = menuItems.find(i => i.id === itemId)?.name || 'item';
              showToast(`🛒 Added ${itemName} to cart!`);
            }}
            onOpenAdmin={openAdminPortal}
          />
        ) : activeTab === 'rewards' ? (
          <RewardsTab
            googleUser={googleUser}
            loyaltyPoints={loyaltyPoints}
            onRedeemReward={async (points, rewardName) => {
              if (!googleUser) return;
              try {
                const userRef = doc(db, 'users', googleUser.uid);
                await updateDoc(userRef, {
                  points: increment(-points)
                });
                showToast(`🎉 Success! Redeemed "${rewardName}" for ${points} pts!`);
              } catch (err) {
                console.warn("Firestore rewards redemption failed, falling back locally:", err);
                const localPoints = parseInt(localStorage.getItem('shaina_local_points') || '0', 10);
                if (localPoints >= points) {
                  localStorage.setItem('shaina_local_points', String(localPoints - points));
                  setLoyaltyPoints(localPoints - points);
                  showToast(`🎉 Success! Redeemed "${rewardName}" for ${points} pts!`);
                } else {
                  showToast('Insufficient points to claim reward.');
                }
              }
            }}
            onLogin={() => setActiveNavTab('profile')}
            rewardsList={rewardsList}
          />

        ) : currentSubView === 'categories' ? (
          <DiscoverGrid onSelectGroup={handleSelectGroup} />
        ) : (
          <MenuSection
            currentGroup={currentGroup}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            menuItems={menuItems}
            isLoading={loadingMenu}
            cart={cart}
            onBack={handleBackToCategories}
            onSelectCategory={setActiveCategory}
            onUpdateCartQty={handleUpdateCartQty}
            onOpenProductDetails={setSelectedDetailItem}
          />
        )}
      </main>

      {/* Floating Cart FAB */}
      {totals.totalItems > 0 && (
        <button
          className="floating-cart active"
          id="floating-cart"
          aria-label="View Cart"
          onClick={() => setShowModal('cart')}
        >
          <svg className="cart-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="cart-badge" id="cart-total-qty">{totals.totalItems}</span>
        </button>
      )}

      {/* Bottom Tabs Navigation */}
      <nav className="bottom-nav">
        <a
          href="#"
          className={`nav-tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setShowModal(null);
            setActiveNavTab('discover');
            handleBackToCategories();
          }}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 8h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1M2 6h15v8a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6z" />
            <path d="M1 21h18" />
          </svg>
          <span className="nav-label">Menu</span>
        </a>

        <a
          href="#"
          className={`nav-tab ${activeTab === 'order' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setShowModal(null);
            setActiveNavTab('order');
            setCurrentSubView('items');
            setCurrentGroup(null);
            setActiveCategory('All');
          }}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span className="nav-label">Orders</span>
        </a>

        {googleUser && (
          <a
            href="#"
            className={`nav-tab ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setShowModal(null);
              setActiveNavTab('rewards');
            }}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <path d="M9.5 7.5a1.5 1.5 0 1 1 3 0c.5 1.5-1.5 3-3 4-1.5-1-3.5-2.5-3-4a1.5 1.5 0 0 1 3 0z" />
            </svg>
            <span className="nav-label">Rewards</span>
          </a>
        )}

        <a
          href="#"
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setShowModal(null);
            setActiveNavTab('profile');
          }}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="nav-label">Profile</span>
        </a>
      </nav>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-secondary)',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-headline)',
          fontSize: '13px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          animation: 'fade-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedDetailItem && (
        <ProductDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          cartQty={cart[selectedDetailItem.id] || 0}
          onUpdateQty={(newQty) => {
            const current = cart[selectedDetailItem.id] || 0;
            handleUpdateCartQty(selectedDetailItem.id, newQty - current);
          }}
        />
      )}

      {/* Cart Modal */}
      {showModal === 'cart' && (
        <CartModal
          onClose={() => setShowModal(null)}
          cart={cart}
          menuItems={menuItems}
          onUpdateQty={handleUpdateCartQty}
          onRemoveItem={handleRemoveFromCart}
          notes={cartNotes}
          onChangeNotes={setCartNotes}
          onCheckout={() => setShowModal('checkout')}
        />
      )}

      {/* Checkout Details Modal */}
      {showModal === 'checkout' && (
        <CheckoutModal
          onClose={() => setShowModal('cart')}
          onSubmit={handlePlaceOrder}
          customerName={googleUser ? googleUser.displayName : guestName}
          tableNumber={guestTable}
          specialInstructions={cartNotes}
          totalToPay={totals.totalAmount}
        />
      )}

      {/* Checkout Success Modal */}
      {showModal === 'success' && successDetails && (
        <SuccessModal
          onClose={() => {
            setShowModal(null);
            setSuccessDetails(null);
          }}
          onTrack={handleOpenActiveTracker}
          orderId={successDetails.id}
          customerName={googleUser ? googleUser.displayName : guestName}
          tableNumber={guestTable}
          totalAmount={successDetails.totalAmount}
          itemsCount={successDetails.itemsCount}
        />
      )}

      {/* Real-time Tracking Modal */}
      {showModal === 'tracking' && (
        <TrackingModal
          onClose={() => setShowModal(null)}
          order={activeOrder}
          onBrowseMenu={() => setShowModal(null)}
        />
      )}

    </div>
  );
}
