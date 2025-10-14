<template>
  <div class="customizer-page">

    
    <div class="customizer-container">
      <!-- 3D Model Viewer -->
      <div class="product-display">
        <SimpleModelViewer
          :current-model="currentModel"
          :selected-color="selectedColor.value"
          :selected-fabric="selectedFabric"
        />
      </div>

      <!-- Customization Controls -->
      <div class="customization-panel">
        <h2>Customize Your {{ currentProduct.name }}</h2>
        <p class="product-description">{{ currentProduct.description }}</p>
        
        

        <!-- Color Selection -->
        <div class="option-section">
          <h3>Color</h3>
          <div class="color-grid">
            <div
              v-for="color in colors"
              :key="color.id"
              class="color-option"
              :class="{ active: selectedColor.id === color.id }"
              :style="{ backgroundColor: color.value }"
              @click="selectColor(color)"
              :title="color.name"
            ></div>
          </div>
        </div>

        <!-- Fabric Selection -->
        <div class="option-section">
          <h3>Fabric Material</h3>
          <div class="fabric-grid">
            <div
              v-for="fabric in fabrics"
              :key="fabric.id"
              class="fabric-option"
              :class="{ active: selectedFabric.id === fabric.id }"
              @click="selectFabric(fabric)"
            >
              <div class="fabric-swatch" :style="{ backgroundColor: getFabricColor(fabric.name) }"></div>
              <span>{{ fabric.name }}</span>
              <span v-if="fabric.price > 0" class="price-add">+₦{{ fabric.price }}</span>
            </div>
          </div>
        </div>

        <!-- Price Summary -->
        <div class="price-summary">
          <div class="price-breakdown">
            <div class="price-item">
              <span>Base Price</span>
              <span>₦{{ currentProduct.basePrice }}</span>
            </div>
            <div class="price-item" v-if="selectedFabric.price > 0">
              <span>{{ selectedFabric.name }} Fabric</span>
              <span>+₦{{ selectedFabric.price }}</span>
            </div>
            <div class="price-item" v-if="selectedColor.price > 0">
              <span>{{ selectedColor.name }} Color</span>
              <span>+₦{{ selectedColor.price }}</span>
            </div>
            <div class="price-total">
              <span>Total</span>
              <span>₦{{ totalPrice }}</span>
            </div>
          </div>
          <button class="add-to-cart-btn" @click="addToCart">
            Add to Cart - ₦{{ totalPrice }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SimpleModelViewer from '../components/SimpleModelViewer.vue'
import { products, fabrics, colors } from '../data/products.js'
import { useCartStore } from '../stores/cart';

export default {
  name: 'CustomizerPage',
  components: {
    SimpleModelViewer
  },
  data() {
    return {
      currentProduct: {},
      selectedColor: {},
      selectedFabric: {},
      currentModel: {
        type: 'gltf',
        src: '' // Start empty - will be set from selected product
      },
      allProducts: products, // From centralized data
      fabrics: fabrics,       // From centralized data
      colors: colors         // From centralized data
    }
  },
  computed: {
    totalPrice() {
      const base = this.currentProduct.basePrice || 0
      const fabricPrice = this.selectedFabric.price || 0
      const colorPrice = this.selectedColor.price || 0
      return base + fabricPrice + colorPrice
    }
  },
  methods: {
    selectProduct(product) {
      this.currentProduct = product
      this.currentModel.src = product.modelPath
    },
    selectColor(color) {
      this.selectedColor = color
    },
    selectFabric(fabric) {
      this.selectedFabric = fabric
    },
    getFabricColor(fabricName) {
      const fabricColors = {
        'Cotton': '#f0f0f0',
        'Leather': '#8B4513',
        'Velvet': '#800020',
        'Linen': '#FAF0E6',
        'Wool': '#D3D3D3'
      }
      return fabricColors[fabricName] || '#cccccc'
    },
    addToCart() {
      const cartStore = useCartStore(); // Move this INSIDE the method
      
      const item = {
        product: this.currentProduct,
        fabric: this.selectedFabric,
        color: this.selectedColor,
        totalPrice: this.totalPrice
      };
      
      cartStore.addToCart(item);
      
      // Show success message
      alert(`✅ Added to cart!\n${item.product.name} with ${item.fabric.name} fabric in ${item.color.name} color\nTotal: $${item.totalPrice}\n\nYour cart now has ${cartStore.totalItems} items.`);
    },
  },

  capturePreview() {
      // Get the canvas element from Three.js renderer
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        console.error('No canvas found');
        alert('No 3D model canvas found. Please wait for the model to load.');
        return;
      }
      
      // Convert canvas to data URL
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${this.currentProduct.name.toLowerCase().replace(/\s+/g, '_')}_preview.jpg`;
      link.href = imageData;
      link.click();
      
      console.log('Preview captured for:', this.currentProduct.name);
      
      // Show success message
      alert(`📸 Preview captured for ${this.currentProduct.name}!\n\nFile saved as: ${link.download}\n\nYou can find this image in your Downloads folder.`);
    },
    
    // Optional: Add a hidden button to capture previews
    setupPreviewCapture() {
      // Check if button already exists
      if (document.getElementById('preview-capture-btn')) {
        return;
      }
      
      // Add a hidden button for developers to capture previews
      const captureBtn = document.createElement('button');
      captureBtn.id = 'preview-capture-btn';
      captureBtn.innerHTML = '📸 Capture Preview';
      captureBtn.style.position = 'fixed';
      captureBtn.style.top = '10px';
      captureBtn.style.right = '10px';
      captureBtn.style.zIndex = '1000';
      captureBtn.style.padding = '10px 15px';
      captureBtn.style.background = '#2c5aa0';
      captureBtn.style.color = 'white';
      captureBtn.style.border = 'none';
      captureBtn.style.borderRadius = '5px';
      captureBtn.style.cursor = 'pointer';
      captureBtn.style.fontSize = '14px';
      captureBtn.style.fontWeight = 'bold';
      captureBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      captureBtn.onclick = () => this.capturePreview();
      
      document.body.appendChild(captureBtn);
      
      console.log('Preview capture button added for development');
    },
    
    // Method to remove capture button (call this when leaving the page)
    removePreviewCapture() {
      const captureBtn = document.getElementById('preview-capture-btn');
      if (captureBtn) {
        captureBtn.remove();
      }
    },


  mounted() {
    // Check if a product was selected from home page
    const selectedProduct = localStorage.getItem('selectedProduct');
    
    if (selectedProduct) {
      const product = JSON.parse(selectedProduct);
      this.currentProduct = product;
      this.currentModel.src = product.modelPath;
      localStorage.removeItem('selectedProduct'); // Clean up
    } else {
      // Fallback: use first product if none selected
      this.currentProduct = this.allProducts[0];
      this.currentModel.src = this.allProducts[0].modelPath;
    }
    
    // Set default color and fabric
    this.selectedColor = this.colors[0];
    this.selectedFabric = this.fabrics[0];
  }
}
</script>

<style scoped>
.customizer-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.customizer-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  align-items: start;
}

.product-display {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 600px;
}

.customization-panel {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.product-description {
  color: #666;
  margin-bottom: 20px;
  font-style: italic;
}

.option-section {
  margin-bottom: 30px;
}

.option-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.1em;
}

.products-grid {
  display: grid;
  gap: 10px;
}

.product-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-option:hover {
  border-color: #2c5aa0;
  transform: translateY(-2px);
}

.product-option.active {
  border-color: #2c5aa0;
  background: #f0f7ff;
}

.product-preview {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 6px;
}

.preview-icon {
  font-size: 1.5em;
}

.product-info h4 {
  margin: 0;
  color: #333;
  font-size: 0.95em;
}

.product-info .price {
  margin: 0;
  color: #2c5aa0;
  font-weight: bold;
  font-size: 0.9em;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  gap: 10px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #2c5aa0;
  transform: scale(1.1);
}

.fabric-grid {
  display: grid;
  gap: 10px;
}

.fabric-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fabric-option:hover {
  border-color: #2c5aa0;
}

.fabric-option.active {
  border-color: #2c5aa0;
  background: #f0f7ff;
}

.fabric-swatch {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.price-add {
  margin-left: auto;
  color: #2c5aa0;
  font-weight: bold;
  font-size: 0.9em;
}

.price-summary {
  border-top: 2px solid #f0f0f0;
  padding-top: 20px;
}

.price-breakdown {
  margin-bottom: 20px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #666;
}

.price-total {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
  font-weight: bold;
  font-size: 1.2em;
  color: #2c5aa0;
}

.add-to-cart-btn {
  width: 100%;
  background: #2c5aa0;
  color: white;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  background: #1e3d6f;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .customizer-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .customization-panel {
    position: static;
    max-height: none;
  }
}
</style>