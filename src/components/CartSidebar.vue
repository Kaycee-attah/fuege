<template>
  <div class="cart-sidebar" :class="{ open: isOpen }">
    <div class="cart-header">
      <h2>Your Cart ({{ totalItems }})</h2>
      <button @click="closeCart" class="close-btn">×</button>
    </div>

    <div class="cart-content">
      <div v-if="items.length === 0" class="empty-cart">
        <p>Your cart is empty</p>
        <router-link to="/customize" @click="closeCart" class="browse-btn">
          Start Customizing
        </router-link>
      </div>

      <div v-else class="cart-items">
        <div v-for="item in items" :key="item.id" class="cart-item">
          <div class="item-info">
            <h4>{{ item.product.name }}</h4>
            <p class="item-details">
              {{ item.fabric.name }} • {{ item.color.name }}
            </p>
            <div class="quantity-controls">
              <button 
                @click="updateQuantity(item.id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
                class="qty-btn"
              >
                −
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button 
                @click="updateQuantity(item.id, item.quantity + 1)"
                class="qty-btn"
              >
                +
              </button>
            </div>
          </div>
          
          <div class="item-price">
            <p class="price">₦{{ (item.totalPrice * item.quantity).toFixed(2) }}</p>
            <button @click="removeFromCart(item.id)" class="remove-btn">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="items.length > 0" class="cart-footer">
      <div class="cart-total">
        <span>Total:</span>
        <span class="total-price">₦{{ totalPrice.toFixed(2) }}</span>
      </div>
      <button @click="proceedToCheckout" class="checkout-btn">
        Proceed to Checkout
      </button>
      <button @click="clearCart" class="clear-cart-btn">
        Clear Cart
      </button>
    </div>
  </div>

  <!-- Cart Overlay -->
  <div v-if="isOpen" class="cart-overlay" @click="closeCart"></div>
</template>

<script>
import { useCartStore } from '../stores/cart';
import { storeToRefs } from 'pinia';

export default {
  name: 'CartSidebar',
  setup() {
    const cartStore = useCartStore();
    
    // Use storeToRefs to maintain reactivity
    const { isOpen, cartItems, totalItems, totalPrice } = storeToRefs(cartStore);
    
    return {
      isOpen,
      items: cartItems,
      totalItems,
      totalPrice,
      closeCart: cartStore.closeCart,
      removeFromCart: cartStore.removeFromCart,
      updateQuantity: cartStore.updateQuantity,
      clearCart: cartStore.clearCart
    };
  },
  methods: {
    proceedToCheckout() {
      this.closeCart();
      this.$router.push('/checkout');
    }
  }
};
</script>

<style scoped>
.cart-sidebar {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.cart-sidebar.open {
  right: 0;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.cart-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.cart-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
}

.empty-cart p {
  color: #666;
  margin-bottom: 20px;
}

.browse-btn {
  background: #2c5aa0;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 5px;
  display: inline-block;
}

.browse-btn:hover {
  background: #1e3d6f;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
}

.item-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.item-details {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9em;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.item-price {
  text-align: right;
}

.price {
  font-weight: bold;
  color: #2c5aa0;
  margin: 0 0 5px 0;
}

.remove-btn {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 0.8em;
}

.remove-btn:hover {
  text-decoration: underline;
}

.cart-footer {
  padding: 20px;
  border-top: 1px solid #eee;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 1.2em;
  font-weight: bold;
}

.total-price {
  color: #2c5aa0;
}

.checkout-btn {
  width: 100%;
  background: #2c5aa0;
  color: white;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 10px;
}

.checkout-btn:hover {
  background: #1e3d6f;
}

.clear-cart-btn {
  width: 100%;
  background: #f8f9fa;
  color: #666;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.clear-cart-btn:hover {
  background: #e9ecef;
}

.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
</style>