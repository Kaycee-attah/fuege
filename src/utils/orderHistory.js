export const OrderHistory = {
  // Get all orders
  getOrders() {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  },

  // Get specific order
  getOrder(orderId) {
    const orders = this.getOrders();
    return orders.find(order => order.id === orderId);
  },

  // Save order
  saveOrder(order) {
    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    return order;
  },

  // Get orders count
  getOrdersCount() {
    return this.getOrders().length;
  }
};