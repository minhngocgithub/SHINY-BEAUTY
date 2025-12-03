<template>
  <div class="shipping-view">
    <div class="header">
      <h1>Shipping Management</h1>
      <p class="subtitle">Manage shipping methods, rates, and carriers</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🚚</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalShipments }}</div>
          <div class="stat-label">Total Shipments</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📍</div>
        <div class="stat-info">
          <div class="stat-value">{{ inTransit }}</div>
          <div class="stat-label">In Transit</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ delivered }}</div>
          <div class="stat-label">Delivered</div>
        </div>
      </div>
    </div>

    <div class="content-card">
      <p class="placeholder-text">
        🚧 Shipping Management Interface - Coming Soon
      </p>
      <p class="info-text">
        Configure shipping methods, set delivery zones, manage carrier
        integrations, and track shipments.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const totalShipments = ref(0);
const inTransit = ref(0);
const delivered = ref(0);
</script>

<style scoped>
.shipping-view {
  padding: 24px;
}

.header {
  margin-bottom: 24px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.placeholder-text {
  font-size: 24px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 12px;
}

.info-text {
  color: #6b7280;
  font-size: 16px;
  max-width: 600px;
  margin: 0 auto;
}
</style>
