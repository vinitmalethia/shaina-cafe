import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

async function runTest() {
  console.log("Starting Firestore test...");
  
  // Set a timeout of 5 seconds
  const timeout = setTimeout(() => {
    console.error("❌ Firestore operation TIMEOUT after 5 seconds!");
    process.exit(1);
  }, 5000);

  try {
    console.log("Attempting to write a test order...");
    const docRef = await addDoc(collection(db, 'orders'), {
      customerName: "NodeJS Test Guest",
      tableNumber: 99,
      totalAmount: 135,
      status: "received",
      createdAt: new Date().toISOString(),
      items: [{ id: "test", name: "Test Latte", price: 135, quantity: 1 }]
    });
    console.log("✅ Successfully wrote order! ID:", docRef.id);
    
    console.log("Attempting to read orders...");
    const snapshot = await getDocs(collection(db, 'orders'));
    console.log(`✅ Successfully read ${snapshot.size} orders!`);
    
    clearTimeout(timeout);
    process.exit(0);
  } catch (error) {
    console.error("❌ Firestore operation failed with error:", error);
    clearTimeout(timeout);
    process.exit(1);
  }
}

runTest();
