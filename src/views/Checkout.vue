<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <h1>Checkout</h1>
      
      <div v-if="cartItems.length === 0" class="empty-checkout">
        <p>Your cart is empty</p>
        <router-link to="/customize" class="cta-button">
          Start Customizing
        </router-link>
      </div>

      <div v-else class="checkout-content">
        <!-- Order Summary -->
        <div class="order-summary">
          <h2>Order Summary</h2>
          <div class="summary-items">
            <div 
              v-for="item in cartItems" 
              :key="item.id" 
              class="summary-item"
            >
              <div class="item-details">
                <h4>{{ item.product.name }}</h4>
                <p>{{ item.fabric.name }} • {{ item.color.name }}</p>
                <span class="quantity">Qty: {{ item.quantity }}</span>
              </div>
              <span class="item-price">₦{{ (item.totalPrice * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="summary-total">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>₦{{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="total-line">
              <span>Shipping:</span>
              <span>₦{{ shippingCost.toFixed(2) }}</span>
            </div>
            <div class="total-line grand-total">
              <span>Total:</span>
              <span>₦{{ grandTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="customer-info">
          <h2>Customer Information</h2>
          <form class="checkout-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="customerInfo.email" 
                required 
                placeholder="your@email.com"
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="customerInfo.firstName" 
                  required 
                  placeholder="John"
                >
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="customerInfo.lastName" 
                  required 
                  placeholder="Doe"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="customerInfo.phone" 
                required 
                placeholder="08012345678"
              >
            </div>

            <div class="form-group">
              <label for="address">Address</label>
              <input 
                type="text" 
                id="address" 
                v-model="customerInfo.address" 
                required 
                placeholder="123 Main St"
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="city">City</label>
                <input 
                  type="text" 
                  id="city" 
                  v-model="customerInfo.city" 
                  required 
                  placeholder="Lagos"
                >
              </div>
              <div class="form-group">
                <label for="state">State</label>
                <input 
                  type="text" 
                  id="state" 
                  v-model="customerInfo.state" 
                  required 
                  placeholder="Lagos State"
                >
              </div>
            </div>

            <!-- Payment Section -->
            <div class="payment-section">
              <h3>Payment Information</h3>
              
              <FlutterwavePayment
                :amount="grandTotal"
                :customer-info="customerInfo"
                :order-id="orderId"
                @payment-success="onPaymentSuccess"
                @payment-error="onPaymentError"
                @payment-cancelled="onPaymentCancelled"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '../stores/cart';
import FlutterwavePayment from '../components/FlutterwavePayment.vue';

export default {
  name: 'CheckoutPage',
  components: {
    FlutterwavePayment
  },
  data() {
    return {
      customerInfo: {
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: ''
      },
      processing: false,
      shippingCost: 2500, // Naira shipping cost
      orderId: 'ORD_' + Date.now()
    };
  },
  setup() {
    const cartStore = useCartStore();
    
    return {
      cartItems: cartStore.cartItems,
      totalPrice: cartStore.totalPrice,
      clearCart: cartStore.clearCart
    };
  },
  computed: {
    grandTotal() {
      // Convert to number to fix prop type warning
      return Number((this.totalPrice + this.shippingCost).toFixed(2));
    }
  },
  methods: {
    async onPaymentSuccess(paymentResult) {
      this.processing = true;
      
      console.log('Payment successful:', paymentResult);
      
      // Create order confirmation
      const order = {
        id: this.orderId,
        items: this.cartItems,
        customer: this.customerInfo,
        total: this.grandTotal,
        payment: paymentResult,
        date: new Date().toISOString(),
        currency: 'NGN'
      };
      
      // Store order in localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Clear cart
      this.clearCart();
      
      // Redirect to success page
      this.$router.push({
        name: 'OrderConfirmation',
        params: { orderId: order.id }
      });
      
      this.processing = false;
    },

    onPaymentError(errorData) {
      console.error('Payment error:', errorData);
      this.processing = false;
      
      // Show error message to user (you can use a toast notification here)
      alert(`Payment failed: ${errorData.error || 'Please try again'}`);
    },

    onPaymentCancelled() {
      console.log('Payment cancelled by user');
      this.processing = false;
    }
  },

  mounted() {
    // Generate a new order ID when component mounts
    this.orderId = 'ORD_' + Date.now();
  }
};
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-container h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}

.empty-checkout {
  text-align: center;
  padding: 60px 20px;
}

.empty-checkout p {
  color: #666;
  margin-bottom: 20px;
  font-size: 1.2em;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.order-summary {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 10px;
  height: fit-content;
}

.order-summary h2 {
  margin-bottom: 20px;
  color: #333;
}

.summary-items {
  margin-bottom: 30px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 15px 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-item:last-child {
  border-bottom: none;
}

.item-details h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.item-details p {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 0.9em;
}

.quantity {
  font-size: 0.8em;
  color: #888;
}

.item-price {
  font-weight: bold;
  color: #2c5aa0;
}

.summary-total {
  border-top: 2px solid #ddd;
  padding-top: 20px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.grand-total {
  font-weight: bold;
  font-size: 1.2em;
  border-top: 1px solid #ddd;
  padding-top: 10px;
  margin-top: 10px;
}

.customer-info {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.customer-info h2 {
  margin-bottom: 20px;
  color: #333;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
}

.form-group input:focus {
  outline: none;
  border-color: #2c5aa0;
}

.payment-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 20px;
}

.payment-section h3 {
  margin-bottom: 15px;
  color: #333;
}

/* Responsive */
@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>