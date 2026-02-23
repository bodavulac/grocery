const crypto = require('crypto');

const menuItems = [
  { id: crypto.randomUUID(), name: 'Tomato', category: 'Vegetables', price: 40, description: 'Fresh red tomatoes', available: true },
  { id: crypto.randomUUID(), name: 'Onion', category: 'Vegetables', price: 30, description: 'Premium quality onions', available: true },
  { id: crypto.randomUUID(), name: 'Potato', category: 'Vegetables', price: 25, description: 'Farm fresh potatoes', available: true },
  { id: crypto.randomUUID(), name: 'Apple', category: 'Fruits', price: 150, description: 'Crisp and juicy apples', available: true },
  { id: crypto.randomUUID(), name: 'Banana', category: 'Fruits', price: 50, description: 'Ripe yellow bananas', available: true },
  { id: crypto.randomUUID(), name: 'Milk', category: 'Dairy', price: 60, description: 'Full cream fresh milk', available: true },
  { id: crypto.randomUUID(), name: 'Curd', category: 'Dairy', price: 45, description: 'Thick and creamy curd', available: true },
  { id: crypto.randomUUID(), name: 'Rice', category: 'Grains', price: 80, description: 'Premium basmati rice', available: true }
];

const orders = [];

module.exports = { menuItems, orders };
