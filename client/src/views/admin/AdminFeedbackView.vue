<template>
  <div class="feedback-view">
    <div class="header">
      <h1>Customer Feedback</h1>
      <p class="subtitle">View and manage customer feedback and suggestions</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalFeedback }}</div>
          <div class="stat-label">Total Feedback</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-value">{{ avgRating }}/5</div>
          <div class="stat-label">Avg Rating</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingReview }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
      </div>
    </div>

    <div class="content-card">
      <p class="placeholder-text">
        🚧 Customer Feedback Interface - Coming Soon
      </p>
      <p class="info-text">
        Review customer feedback, respond to suggestions, track satisfaction
        scores, and identify improvement areas.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const totalFeedback = ref(0);
const avgRating = ref(0);
const pendingReview = ref(0);
</script>

<style scoped>
.feedback-view {
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
  background: linear-gradient(135deg, #fddb92 0%, #d1fdff 100%);
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
