<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div>
          <h2>{{ campaign.name }}</h2>
          <p class="campaign-subject">{{ campaign.subject }}</p>
        </div>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="modal-body">
        <!-- Campaign Info -->
        <div class="info-section">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Status</span>
              <span :class="['badge', 'badge-' + campaign.status]">{{
                campaign.status
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Category</span>
              <span class="info-value">{{
                formatCategory(campaign.category)
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Template</span>
              <span class="info-value">{{ campaign.template }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Created</span>
              <span class="info-value">{{
                formatDate(campaign.createdAt)
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Scheduled</span>
              <span class="info-value">{{
                campaign.scheduledAt
                  ? formatDate(campaign.scheduledAt)
                  : "Not scheduled"
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Sent At</span>
              <span class="info-value">{{
                campaign.sentAt ? formatDate(campaign.sentAt) : "-"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="stats-section">
          <h3 class="section-title">📊 Performance Metrics</h3>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-label">Target Audience</span>
                <span class="stat-icon">👥</span>
              </div>
              <div class="stat-value">
                {{ campaign.stats?.targetCount || 0 }}
              </div>
              <div class="stat-subtitle">
                {{ formatTargetType(campaign.targetAudience.type) }}
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-label">Emails Sent</span>
                <span class="stat-icon">📨</span>
              </div>
              <div class="stat-value">{{ campaign.stats?.sent || 0 }}</div>
              <div class="stat-subtitle">
                {{
                  calculatePercentage(
                    campaign.stats?.sent,
                    campaign.stats?.targetCount
                  )
                }}% of target
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-label">Delivered</span>
                <span class="stat-icon">✅</span>
              </div>
              <div class="stat-value">{{ campaign.stats?.delivered || 0 }}</div>
              <div class="stat-subtitle">{{ deliveryRate }}% delivery rate</div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-label">Opened</span>
                <span class="stat-icon">👀</span>
              </div>
              <div class="stat-value">{{ campaign.stats?.opened || 0 }}</div>
              <div class="stat-subtitle">{{ openRate }}% open rate</div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-label">Clicked</span>
                <span class="stat-icon">🖱️</span>
              </div>
              <div class="stat-value">{{ campaign.stats?.clicked || 0 }}</div>
              <div class="stat-subtitle">{{ clickRate }}% click rate</div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <span class="stat-label">Bounced</span>
                <span class="stat-icon">⚠️</span>
              </div>
              <div class="stat-value">{{ campaign.stats?.bounced || 0 }}</div>
              <div class="stat-subtitle">{{ bounceRate }}% bounce rate</div>
            </div>
          </div>
        </div>

        <!-- Visual Performance -->
        <div class="performance-section">
          <h3 class="section-title">📈 Engagement Funnel</h3>

          <div class="funnel">
            <div class="funnel-step">
              <div
                class="funnel-bar"
                :style="{ width: '100%', background: '#667eea' }"
              >
                <span class="funnel-label">Sent</span>
                <span class="funnel-count">{{
                  campaign.stats?.sent || 0
                }}</span>
              </div>
            </div>
            <div class="funnel-step">
              <div
                class="funnel-bar"
                :style="{ width: deliveryRate + '%', background: '#10b981' }"
              >
                <span class="funnel-label">Delivered</span>
                <span class="funnel-count">{{
                  campaign.stats?.delivered || 0
                }}</span>
              </div>
            </div>
            <div class="funnel-step">
              <div
                class="funnel-bar"
                :style="{ width: openRate + '%', background: '#f59e0b' }"
              >
                <span class="funnel-label">Opened</span>
                <span class="funnel-count">{{
                  campaign.stats?.opened || 0
                }}</span>
              </div>
            </div>
            <div class="funnel-step">
              <div
                class="funnel-bar"
                :style="{ width: clickRate + '%', background: '#8b5cf6' }"
              >
                <span class="funnel-label">Clicked</span>
                <span class="funnel-count">{{
                  campaign.stats?.clicked || 0
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Target Audience Details -->
        <div class="audience-section">
          <h3 class="section-title">🎯 Target Audience</h3>

          <div class="audience-details">
            <div class="detail-item">
              <span class="detail-label">Audience Type:</span>
              <span class="detail-value">{{
                formatTargetType(campaign.targetAudience.type)
              }}</span>
            </div>

            <div
              v-if="campaign.targetAudience.segments?.length"
              class="detail-item"
            >
              <span class="detail-label">Segments:</span>
              <div class="segments-list">
                <span
                  v-for="segment in campaign.targetAudience.segments"
                  :key="segment"
                  class="segment-badge"
                >
                  {{ segment.replace(/_/g, " ").toUpperCase() }}
                </span>
              </div>
            </div>

            <div class="detail-item">
              <span class="detail-label">Exclude Previous Recipients:</span>
              <span class="detail-value">{{
                campaign.excludePreviousRecipients ? "Yes" : "No"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Content Preview -->
        <div class="content-section">
          <h3 class="section-title">📄 Email Content</h3>

          <div class="content-preview">
            <div class="preview-item">
              <span class="preview-label">Subject Line:</span>
              <span class="preview-value">{{ campaign.subject }}</span>
            </div>

            <div v-if="campaign.previewText" class="preview-item">
              <span class="preview-label">Preview Text:</span>
              <span class="preview-value">{{ campaign.previewText }}</span>
            </div>

            <div class="preview-item">
              <span class="preview-label">Content Data:</span>
              <pre class="json-preview">{{
                JSON.stringify(campaign.contentData, null, 2)
              }}</pre>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-primary">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  campaign: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const deliveryRate = computed(() => {
  const sent = props.campaign.stats?.sent || 0;
  const delivered = props.campaign.stats?.delivered || 0;
  return sent > 0 ? ((delivered / sent) * 100).toFixed(1) : 0;
});

const openRate = computed(() => {
  const sent = props.campaign.stats?.sent || 0;
  const opened = props.campaign.stats?.opened || 0;
  return sent > 0 ? ((opened / sent) * 100).toFixed(1) : 0;
});

const clickRate = computed(() => {
  const opened = props.campaign.stats?.opened || 0;
  const clicked = props.campaign.stats?.clicked || 0;
  return opened > 0 ? ((clicked / opened) * 100).toFixed(1) : 0;
});

const bounceRate = computed(() => {
  const sent = props.campaign.stats?.sent || 0;
  const bounced = props.campaign.stats?.bounced || 0;
  return sent > 0 ? ((bounced / sent) * 100).toFixed(1) : 0;
});

const formatCategory = (category) => {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatTargetType = (type) => {
  const types = {
    all: "All Users",
    segments: "Specific Segments",
    specific_users: "Specific Users",
  };
  return types[type] || type;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.campaign-subject {
  font-size: 14px;
  color: #6b7280;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

/* Info Section */
.info-section {
  margin-bottom: 32px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  width: fit-content;
}

.badge-draft {
  background: #f3f4f6;
  color: #6b7280;
}
.badge-scheduled {
  background: #dbeafe;
  color: #1e40af;
}
.badge-sending {
  background: #fef3c7;
  color: #92400e;
}
.badge-completed {
  background: #d1fae5;
  color: #065f46;
}
.badge-paused {
  background: #fee2e2;
  color: #991b1b;
}
.badge-failed {
  background: #fecaca;
  color: #7f1d1d;
}

/* Stats Section */
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 12px;
  color: #6b7280;
}

/* Performance Section */
.performance-section {
  margin-bottom: 32px;
}

.funnel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.funnel-step {
  width: 100%;
}

.funnel-bar {
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: white;
  font-weight: 600;
  transition: width 0.3s;
}

.funnel-label {
  font-size: 14px;
}

.funnel-count {
  font-size: 18px;
}

/* Audience Section */
.audience-section {
  margin-bottom: 32px;
}

.audience-details {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
  min-width: 180px;
}

.detail-value {
  font-size: 14px;
  color: #1a1a1a;
}

.segments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.segment-badge {
  background: #ede9fe;
  color: #5b21b6;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Content Section */
.content-section {
  margin-bottom: 0;
}

.content-preview {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
}

.preview-item {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.preview-value {
  font-size: 14px;
  color: #1a1a1a;
}

.json-preview {
  background: #1f2937;
  color: #10b981;
  padding: 16px;
  border-radius: 8px;
  font-family: "Courier New", monospace;
  font-size: 13px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Footer */
.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
