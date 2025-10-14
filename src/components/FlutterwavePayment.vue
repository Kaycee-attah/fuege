<template>
  <div class="flutterwave-payment">
    <div class="payment-form">
      <h3>Payment Information</h3>
      
      <!-- Payment Method Selection -->
      <div class="payment-methods">
        <label class="payment-method-option">
          <input 
            type="radio" 
            v-model="selectedMethod" 
            value="card" 
            class="method-radio"
          >
          <span class="method-label">Credit/Debit Card</span>
        </label>
        
        <label class="payment-method-option">
          <input 
            type="radio" 
            v-model="selectedMethod" 
            value="banktransfer" 
            class="method-radio"
          >
          <span class="method-label">Bank Transfer</span>
        </label>
        
        <label class="payment-method-option">
          <input 
            type="radio" 
            v-model="selectedMethod" 
            value="ussd" 
            class="method-radio"
          >
          <span class="method-label">USSD</span>
        </label>
      </div>

      <!-- Payment Errors -->
      <div v-if="error" class="payment-error">
        {{ error }}
      </div>

      <!-- Payment Button -->
      <button 
        @click="initiatePayment" 
        :disabled="processing" 
        class="pay-button"
      >
        {{ processing ? 'Processing...' : `Pay ₦${formatAmount(amount)}` }}
      </button>

      <!-- Test Payment Info -->
      <div class="test-payment-info">
        <h4>Test Payment Details:</h4>
        <p>Card: <strong>5531 8866 5214 2950</strong></p>
        <p>Expiry: <strong>09/32</strong></p>
        <p>CVV: <strong>564</strong></p>
        <p>PIN: <strong>3310</strong></p>
        <p>OTP: <strong>12345</strong></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlutterwavePayment',
  props: {
    amount: {
      type: Number,
      required: true
    },
    customerInfo: {
      type: Object,
      required: true
    },
    orderId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      processing: false,
      error: null,
      selectedMethod: 'card'
    };
  },
  mounted() {
    this.loadFlutterwaveScript();
  },
  methods: {
    loadFlutterwaveScript() {
      // Check if Flutterwave script is already loaded
      if (window.FlutterwaveCheckout) {
        return;
      }

      // Load Flutterwave script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.onload = () => {
        console.log('Flutterwave script loaded successfully');
      };
      script.onerror = () => {
        this.error = 'Failed to load payment system. Please refresh the page.';
        console.error('Failed to load Flutterwave script');
      };
      document.head.appendChild(script);
    },

    formatAmount(amount) {
      // Format amount for Nigerian Naira
      return new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    },

    generateTransactionReference() {
      // Generate unique transaction reference
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      return `FURN_${this.orderId}_${timestamp}_${random}`;
    },

    initiatePayment() {
      if (!window.FlutterwaveCheckout) {
        this.error = 'Payment system not ready. Please try again.';
        return;
      }

      this.processing = true;
      this.error = null;

      try {
        const paymentData = {
          public_key: 'FLWPUBK_TEST-fcb924bf6907a446ad71e78753bef2be-X', // Test public key
          tx_ref: this.generateTransactionReference(),
          amount: this.amount,
          currency: 'NGN',
          payment_options: this.selectedMethod,
          customer: {
            email: this.customerInfo.email,
            phone_number: this.customerInfo.phone || '08000000000',
            name: `${this.customerInfo.firstName} ${this.customerInfo.lastName}`
          },
          customizations: {
            title: 'Furniture Customizer',
            description: `Payment for Order #${this.orderId}`,
            logo: 'https://assets-global.website-files.com/5f5a53e153805db840dae2db/64e79ca5bf38f6746e6ba6ff_Fuege%20Logo.png'
          },
          meta: {
            order_id: this.orderId,
            customer_id: this.customerInfo.email,
            product_type: 'custom_furniture'
          },
          callback: this.handlePaymentCallback,
          onclose: this.handlePaymentModalClose
        };

        // Add redirect URL for successful payments
        if (this.selectedMethod === 'banktransfer' || this.selectedMethod === 'ussd') {
          paymentData.redirect_url = `${window.location.origin}/order-confirmation/${this.orderId}`;
        }

        // Initialize Flutterwave payment
        window.FlutterwaveCheckout(paymentData);

      } catch (error) {
        console.error('Error initiating payment:', error);
        this.error = 'Failed to initialize payment. Please try again.';
        this.processing = false;
      }
    },

    handlePaymentCallback(response) {
      console.log('Payment callback received:', response);
      
      // Reset processing state
      this.processing = false;

      if (response.status === 'successful') {
        // Payment was successful
        this.$emit('payment-success', {
          transactionId: response.transaction_id,
          txRef: response.tx_ref,
          amount: response.amount,
          currency: response.currency,
          paymentMethod: this.selectedMethod,
          flutterwaveResponse: response
        });

      } else {
        // Payment failed or was cancelled
        this.error = `Payment failed: ${response.message || 'Unknown error'}`;
        
        this.$emit('payment-error', {
          error: response.message,
          txRef: response.tx_ref,
          paymentMethod: this.selectedMethod
        });
      }
    },

    handlePaymentModalClose() {
      console.log('Payment modal closed');
      this.processing = false;
      this.$emit('payment-cancelled');
    }
  }
};
</script>

<style scoped>
.flutterwave-payment {
  margin-top: 20px;
}

.payment-form h3 {
  margin-bottom: 20px;
  color: #333;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.payment-method-option {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.payment-method-option:hover {
  border-color: #2c5aa0;
  background: #f8f9fa;
}

.payment-method-option:has(.method-radio:checked) {
  border-color: #2c5aa0;
  background: #f0f7ff;
}

.method-radio {
  margin-right: 12px;
  accent-color: #2c5aa0;
}

.method-label {
  font-weight: 500;
  color: #333;
}

.payment-error {
  color: #ff4444;
  margin-bottom: 15px;
  padding: 12px;
  background: #fff5f5;
  border: 1px solid #ff4444;
  border-radius: 8px;
  font-size: 0.9em;
}

.pay-button {
  width: 100%;
  background: #2c5aa0;
  color: white;
  padding: 16px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.pay-button:hover:not(:disabled) {
  background: #1e3d6f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.3);
}

.pay-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.test-payment-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  font-size: 0.85em;
}

.test-payment-info h4 {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 0.95em;
  font-weight: 600;
}

.test-payment-info p {
  margin: 6px 0;
  color: #666;
  line-height: 1.4;
}

.test-payment-info strong {
  color: #333;
  font-family: 'Courier New', monospace;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .payment-methods {
    gap: 8px;
  }
  
  .payment-method-option {
    padding: 10px 12px;
  }
  
  .pay-button {
    padding: 14px;
    font-size: 1em;
  }
  
  .test-payment-info {
    padding: 15px;
  }
}
</style>