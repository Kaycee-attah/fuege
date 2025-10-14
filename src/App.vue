<template>
  <div id="app">
    <!-- Navigation Header -->
    <header class="app-header">
      <div class="container">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <img src="/logo.svg" alt="Fuege - Craft Your Vision" class="brand-logo" />
          </router-link>
        </div>
        
        <nav class="nav-menu">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/customize" class="nav-link">Customize</router-link>
          <router-link to="/cart" class="nav-link cart-link">
            🛒 Cart
            <span v-if="cartStore.totalItems > 0" class="cart-badge">
              {{ cartStore.totalItems }}
            </span>
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <img src="/logo-icon.svg" alt="Fuege" class="footer-logo" />
            <span class="brand-name">Fuege</span>
            <p class="brand-tagline">Craft Your Vision in 3D</p>
          </div>
          
          <div class="footer-links">
            <h4>Explore</h4>
            <router-link to="/">Home</router-link>
            <router-link to="/customize">Customizer</router-link>
            <router-link to="/cart">Cart</router-link>
          </div>
          
          <div class="footer-info">
            <h4>Contact</h4>
            <p>📧 hello@fuege.com</p>
            <p>📞 +234 800 000 0000</p>
            <p>📍 Lagos, Nigeria</p>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2024 Fuege. All rights reserved. Crafted with ❤️ for Nigerian design.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { useCartStore } from './stores/cart'

export default {
  name: 'App',
  setup() {
    const cartStore = useCartStore()
    return { cartStore }
  }
}
</script>

<style>
@import './assets/css/brand.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--fuege-dark);
  background-color: var(--fuege-light);
}

/* Header Styles */
.app-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.app-header .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.brand-logo {
  height: 40px;
  transition: transform 0.3s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: var(--fuege-dark);
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--fuege-primary);
}

.nav-link.router-link-active {
  color: var(--fuege-primary);
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-badge {
  background: var(--fuege-secondary);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  font-weight: bold;
}

/* Main Content */
.app-main {
  min-height: calc(100vh - 70px - 200px);
}

/* Footer Styles */
.app-footer {
  background: var(--fuege-dark);
  color: white;
  padding: 40px 0 20px;
}

.app-footer .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 30px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-logo {
  height: 40px;
  width: 40px;
}

.brand-name {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--fuege-secondary);
}

.brand-tagline {
  color: #ccc;
  font-style: italic;
}

.footer-links h4,
.footer-info h4 {
  margin-bottom: 15px;
  color: var(--fuege-secondary);
}

.footer-links a {
  display: block;
  color: #ccc;
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.footer-info p {
  margin-bottom: 8px;
  color: #ccc;
}

.footer-bottom {
  border-top: 1px solid #444;
  padding-top: 20px;
  text-align: center;
  color: #999;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header .container {
    padding: 0 15px;
  }
  
  .nav-menu {
    gap: 20px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .brand-logo {
    height: 35px;
  }
}
</style>