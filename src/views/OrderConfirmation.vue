<template>
  <div class="confirmation-page">
    <div class="confirmation-container">
      <!-- Loading state -->
      <div v-if="!order" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>

      <!-- Order content (only show when order exists) -->
      <div v-else class="confirmation-card">
        <div class="success-header">
          <div class="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p class="order-number">Order #{{ orderId }}</p>
        </div>

        <div class="order-details">
          <!-- Order Summary -->
          <div class="detail-section">
            <h2>Order Summary</h2>
            <div class="order-items">
              <div 
                v-for="item in order.items" 
                :key="item.id" 
                class="order-item"
              >
                <div class="item-info">
                  <h3>{{ item.product?.name || 'Product' }}</h3>
                  <p class="item-specs">
                    {{ item.fabric?.name || 'Fabric' }} • 
                    {{ item.color?.name || 'Color' }} • 
                    Qty: {{ item.quantity || 1 }}
                  </p>
                </div>
                <span class="item-total">
                  ₦{{ ((item.totalPrice || 0) * (item.quantity || 1)).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Shipping Information -->
          <div class="detail-section">
            <h2>Shipping Information</h2>
            <div class="shipping-info">
              <p><strong>{{ order.customer?.firstName }} {{ order.customer?.lastName }}</strong></p>
              <p>{{ order.customer?.address || 'Address not available' }}</p>
              <p>{{ order.customer?.city }}, {{ order.customer?.zipCode }}</p>
              <p>{{ order.customer?.email }}</p>
            </div>
          </div>

          <!-- Order Total -->
          <div class="detail-section">
            <h2>Order Total</h2>
            <div class="order-total">
              <div class="total-line">
                <span>Subtotal:</span>
                <span>₦{{ (parseFloat(order.total || 0) - 49.99).toFixed(2) }}</span>
              </div>
              <div class="total-line">
                <span>Shipping:</span>
                <span>₦259.99</span>
              </div>
              <div class="total-line grand-total">
                <span>Total:</span>
                <span>₦{{ order.total || '0.00' }}</span>
              </div>
            </div>
          </div>

          <!-- What's Next? -->
          <div class="detail-section">
            <h2>What's Next?</h2>
            <div class="next-steps">
              <div class="step">
                <span class="step-number">1</span>
                <div class="step-content">
                  <h3>Order Processing</h3>
                  <p>We'll start crafting your custom furniture within 24 hours.</p>
                </div>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <div class="step-content">
                  <h3>Shipping Updates</h3>
                  <p>You'll receive tracking information via email in 2-3 weeks.</p>
                </div>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <div class="step-content">
                  <h3>Delivery</h3>
                  <p>White-glove delivery and setup included with your order.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="confirmation-actions">
          <button @click="printOrder" class="print-btn">Print Receipt</button>
          <router-link to="/" class="continue-shopping-btn">
            Continue Shopping
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { OrderHistory } from '../utils/orderHistory';

export default {
  name: 'OrderConfirmation',
  data() {
    return {
      order: null,
      orderId: this.$route.params.orderId,
      loading: true,
      error: null
    };
  },
  mounted() {
    this.loadOrder();
  },
  methods: {
    loadOrder() {
      try {
        this.loading = true;
        const foundOrder = OrderHistory.getOrder(this.orderId);
        
        if (!foundOrder) {
          console.warn('Order not found:', this.orderId);
          this.$router.push('/');
          return;
        }

        // Ensure the order has the expected structure
        this.order = {
          ...foundOrder,
          items: foundOrder.items || [],
          customer: foundOrder.customer || {},
          total: foundOrder.total || '0.00'
        };

        console.log('Loaded order:', this.order);

      } catch (error) {
        console.error('Error loading order:', error);
        this.error = error.message;
        this.$router.push('/');
      } finally {
        this.loading = false;
      }
    },
    printOrder() {
      window.print();
    }
  }
};
</script>

<style scoped>
/* Add loading state styles */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2c5aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 1.1em;
}

/* Keep all your existing styles below */
.confirmation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.confirmation-container {
  max-width: 800px;
  margin: 0 auto;
}

.confirmation-card {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.success-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
}

.success-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.success-header h1 {
  color: #2c5aa0;
  margin-bottom: 10px;
  font-size: 2.5em;
}

.order-number {
  color: #666;
  font-size: 1.1em;
}

.detail-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-section h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.item-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.item-specs {
  margin: 0;
  color: #666;
  font-size: 0.9em;
}

.item-total {
  font-weight: bold;
  color: #2c5aa0;
  font-size: 1.1em;
}

.shipping-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.shipping-info p {
  margin: 5px 0;
}

.order-total {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
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

.next-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  align-items: start;
  gap: 15px;
}

.step-number {
  background: #2c5aa0;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.step-content p {
  margin: 0;
  color: #666;
}

.confirmation-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}

.print-btn, .continue-shopping-btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.print-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  cursor: pointer;
}

.print-btn:hover {
  background: #e9ecef;
}

.continue-shopping-btn {
  background: #2c5aa0;
  color: white;
  border: none;
}

.continue-shopping-btn:hover {
  background: #1e3d6f;
}

/* Print Styles */
@media print {
  .confirmation-page {
    background: white !important;
    padding: 0 !important;
  }
  
  .confirmation-card {
    box-shadow: none !important;
    padding: 20px !important;
  }
  
  .confirmation-actions {
    display: none !important;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .confirmation-card {
    padding: 20px;
  }
  
  .confirmation-actions {
    flex-direction: column;
  }
  
  .order-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .item-total {
    align-self: flex-end;
  }
}
</style>