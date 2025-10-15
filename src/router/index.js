import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Customizer from '../views/Customizer.vue'
import Checkout from '../views/Checkout.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/customize',
    name: 'Customizer',
    component: Customizer
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout
  },
  {
    path: '/order-confirmation/:orderId',
    name: 'OrderConfirmation',
    component: OrderConfirmation,
    props: true
  },
   {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router