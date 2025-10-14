import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isOpen: false
  }),
  
  getters: {
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },
    totalPrice: (state) => {
      return state.items.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
    },
    cartItems: (state) => state.items
  },
  
  actions: {
    addToCart(item) {
      const existingItem = this.items.find(
        cartItem => 
          cartItem.product.id === item.product.id &&
          cartItem.fabric.id === item.fabric.id &&
          cartItem.color.id === item.color.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({
          ...item,
          quantity: 1,
          id: Date.now() + Math.random() // More unique ID
        });
      }
      
      // Open cart when adding items
      this.isOpen = true;
    },
    
    removeFromCart(itemId) {
      this.items = this.items.filter(item => item.id !== itemId);
    },
    
    updateQuantity(itemId, quantity) {
      const item = this.items.find(item => item.id === itemId);
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(itemId);
        } else {
          item.quantity = quantity;
        }
      }
    },
    
    clearCart() {
      this.items = [];
    },
    
    toggleCart() {
      this.isOpen = !this.isOpen;
    },
    
    closeCart() {
      this.isOpen = false;
    }
  },
  
  // FIXED: Correct persistence configuration
  persist: {
    key: 'furniture-cart',
    storage: localStorage,
  }
});