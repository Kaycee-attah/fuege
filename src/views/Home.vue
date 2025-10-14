<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to Our Furniture Store</h1>
        <p>Create your dream furniture with our interactive customizer</p>
        <router-link to="/customize" class="cta-button">
          Start Customizing
        </router-link>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-products">
      <h2>Featured Collections</h2>
      <div class="products-grid">
        <div 
          v-for="product in featuredProducts" 
          :key="product.id" 
          class="product-card"
        >
          <img :src="product.image" :alt="product.name" class="product-image">
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
          <span class="price">From ₦{{ product.basePrice }}</span>
          <router-link 
            :to="'/customize'" 
            class="customize-btn"
            @click="setProductForCustomizer(product)"
          >
            Customize
          </router-link>
        </div>
      </div>
    </section>

    <!-- Store Features -->
    <section class="features">
      <h2>Why Choose Us?</h2>
      <div class="features-grid">
        <div class="feature">
          <h3>🛠️ Customization</h3>
          <p>Choose from hundreds of fabrics, colors, and designs</p>
        </div>
        <div class="feature">
          <h3>🚚 Fast Shipping</h3>
          <p>Get your custom furniture in 2-3 weeks</p>
        </div>
        <div class="feature">
          <h3>⭐ Quality Guarantee</h3>
          <p>10-year warranty on all our products</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { products } from '../data/products.js'

export default {
  name: 'HomePage',
  data() {
    return {
      featuredProducts: products // Use all products from central data
    }
  },
  methods: {
    setProductForCustomizer(product) {
      // Store the complete product data including modelPath
      localStorage.setItem('selectedProduct', JSON.stringify(product))
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
  border-radius: 10px;
  margin-bottom: 60px;
}

.hero h1 {
  font-size: 3em;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.2em;
  margin-bottom: 30px;
  opacity: 0.9;
}

.cta-button {
  display: inline-block;
  background: white;
  color: #667eea;
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1.1em;
  transition: transform 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-3px);
}

.featured-products {
  margin-bottom: 60px;
}

.featured-products h2 {
  text-align: center;
  margin-bottom: 40px;
  color: #333;
  font-size: 2.5em;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.product-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-card h3 {
  color: #333;
  margin-bottom: 10px;
}

.product-card p {
  color: #666;
  margin-bottom: 15px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price {
  display: block;
  font-weight: bold;
  color: #2c5aa0;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.customize-btn {
  display: inline-block;
  background: #2c5aa0;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.customize-btn:hover {
  background: #1e3d6f;
}

.features {
  text-align: center;
}

.features h2 {
  margin-bottom: 40px;
  color: #333;
  font-size: 2.5em;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature {
  padding: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.feature h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.3em;
}

.feature p {
  color: #666;
  line-height: 1.6;
}
</style>