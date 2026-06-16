import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDPYND0woLGmQk8Fun7oIXWbkSyg-fdAN0",
  authDomain: "shaina-cafe-vinit.firebaseapp.com",
  projectId: "shaina-cafe-vinit",
  storageBucket: "shaina-cafe-vinit.firebasestorage.app",
  messagingSenderId: "820923945890",
  appId: "1:820923945890:web:ec92e29bf37e5354add8fb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const NEW_MENU_DATA = [
  // PIZZA (26 items)
  {
    name: 'Paneer Paprika Pizza (Regular)',
    description: 'Spicy paneer chunks, red paprika, bell peppers, mozzarella cheese, and rich house tomato sauce.',
    price: 249,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
    bestSeller: true,
    new: false,
    featured: true
  },
  {
    name: 'Paneer Paprika Pizza (Large)',
    description: 'Spicy paneer chunks, red paprika, bell peppers, mozzarella cheese, and rich house tomato sauce on a large crust.',
    price: 399,
    category: 'Pizza',
    image: '/images/menu-items/pizza.jpg',
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
    image: '/images/menu-items/pasta.jpg',
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
    image: '/images/menu-items/sandwich.jpg',
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

  // HOT COFFEE (20 items - some dual sizes)
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
    image: '/images/menu-items/coffee.jpg',
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
    image: '/images/menu-items/coffee.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Biscoff Cold Coffee (Large)',
    description: 'Large cup creamy blended cold coffee infused with sweet speculoos Biscoff paste and biscuit bits.',
    price: 239,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg',
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
    image: '/images/menu-items/coffee.jpg',
    bestSeller: true,
    featured: true
  },
  {
    name: 'Koppi Shaina (Large)',
    description: 'Large signature secret spiced sweet cold coffee recipe.',
    price: 239,
    category: 'Cold Coffee',
    image: '/images/menu-items/coffee.jpg',
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
    image: '/images/menu-items/dessert.jpg',
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
    description: 'Rich fudge brownie swirled and layered with cream Nutella hazelnut spread.',
    price: 159,
    category: 'Desserts',
    image: '/images/menu-items/dessert.jpg',
    new: true
  }
];

async function seed() {
  try {
    console.log('Retrieving existing menu items...');
    const querySnapshot = await getDocs(collection(db, 'menu_items'));
    console.log(`Found ${querySnapshot.size} menu items in database.`);
    
    // Delete existing documents
    console.log('Deleting existing menu items...');
    const deletePromises = [];
    querySnapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'menu_items', docSnap.id)));
    });
    await Promise.all(deletePromises);
    console.log('Successfully deleted all existing menu items.');

    // Seed new documents
    console.log(`Seeding ${NEW_MENU_DATA.length} new menu items...`);
    const seedPromises = NEW_MENU_DATA.map((item) => {
      return addDoc(collection(db, 'menu_items'), item);
    });
    await Promise.all(seedPromises);
    console.log('Successfully seeded new menu database!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
