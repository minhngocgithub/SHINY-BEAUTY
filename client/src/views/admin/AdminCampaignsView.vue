<template>
  <div class="campaigns-view">
    <!-- Header with Actions -->
    <div class="header">
      <div>
        <h1>Campaign Management</h1>
        <p class="subtitle">Manage email campaigns and marketing</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary">
        <span class="icon">✉️</span>
        Create Campaign
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon campaigns">📧</div>
        <div class="stat-info">
          <div class="stat-value">{{ campaignStore.totalCampaigns }}</div>
          <div class="stat-label">Total Campaigns</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">✅</div>
        <div class="stat-info">
          <div class="stat-value">
            {{ campaignStore.activeCampaigns.length }}
          </div>
          <div class="stat-label">Active</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon sent">📨</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalEmailsSent.toLocaleString() }}</div>
          <div class="stat-label">Emails Sent</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rate">📈</div>
        <div class="stat-info">
          <div class="stat-value">{{ averageOpenRate.toFixed(1) }}%</div>
          <div class="stat-label">Avg Open Rate</div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="filters-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search campaigns..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="failed">Failed</option>
        </select>
        <select v-model="categoryFilter" class="filter-select">
          <option value="">All Categories</option>
          <option value="promotional">Promotional</option>
          <option value="newsletter">Newsletter</option>
          <option value="flash_sale">Flash Sale</option>
          <option value="new_product">New Product</option>
          <option value="abandoned_cart">Abandoned Cart</option>
          <option value="seasonal">Seasonal</option>
          <option value="birthday_offer">Birthday Offer</option>
          <option value="loyalty_reward">Loyalty Reward</option>
          <option value="price_drop">Price Drop</option>
          <option value="back_in_stock">Back in Stock</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading campaigns...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="fetchCampaigns" class="btn-retry">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCampaigns.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>No campaigns found</h3>
      <p>
        {{
          searchQuery || statusFilter || categoryFilter
            ? "Try adjusting your filters"
            : "Create your first campaign to get started"
        }}
      </p>
      <button
        v-if="!searchQuery && !statusFilter && !categoryFilter"
        @click="showCreateModal = true"
        class="btn-primary"
      >
        Create First Campaign
      </button>
    </div>

    <!-- Campaigns Table -->
    <div v-else class="campaigns-table-container">
      <table class="campaigns-table">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Category</th>
            <th>Status</th>
            <th>Target</th>
            <th>Sent</th>
            <th>Open Rate</th>
            <th>Scheduled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="campaign in filteredCampaigns"
            :key="campaign._id"
            class="campaign-row"
          >
            <td>
              <div class="campaign-info">
                <div class="campaign-name">{{ campaign.name }}</div>
                <div class="campaign-subject">{{ campaign.subject }}</div>
              </div>
            </td>
            <td>
              <span :class="['badge', 'badge-category', campaign.category]">
                {{ formatCategory(campaign.category) }}
              </span>
            </td>
            <td>
              <span :class="['badge', 'badge-status', campaign.status]">
                {{ campaign.status }}
              </span>
            </td>
            <td>
              <div class="target-info">
                <span class="target-type">{{
                  formatTargetType(campaign.targetAudience.type)
                }}</span>
                <span class="target-count"
                  >{{ campaign.stats?.targetCount || 0 }} users</span
                >
              </div>
            </td>
            <td>{{ campaign.stats?.sent || 0 }}</td>
            <td>
              <div class="rate-display">
                <span class="rate-value"
                  >{{
                    (
                      (campaign.stats?.opened / campaign.stats?.sent || 0) * 100
                    ).toFixed(1)
                  }}%</span
                >
                <div class="rate-bar">
                  <div
                    class="rate-fill"
                    :style="{
                      width: `${
                        (campaign.stats?.opened / campaign.stats?.sent || 0) *
                        100
                      }%`,
                    }"
                  ></div>
                </div>
              </div>
            </td>
            <td>
              <div class="schedule-info">
                {{
                  campaign.scheduledAt ? formatDate(campaign.scheduledAt) : "-"
                }}
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  @click="viewCampaign(campaign)"
                  class="btn-icon"
                  title="View Details"
                >
                  👁️
                </button>
                <button
                  v-if="
                    campaign.status === 'draft' ||
                    campaign.status === 'scheduled'
                  "
                  @click="editCampaign(campaign)"
                  class="btn-icon"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  v-if="campaign.status === 'draft'"
                  @click="sendCampaign(campaign)"
                  class="btn-icon btn-success"
                  title="Send Now"
                >
                  🚀
                </button>
                <button
                  v-if="campaign.status === 'scheduled'"
                  @click="pauseCampaign(campaign)"
                  class="btn-icon btn-warning"
                  title="Pause"
                >
                  ⏸️
                </button>
                <button
                  v-if="campaign.status === 'paused'"
                  @click="resumeCampaign(campaign)"
                  class="btn-icon btn-success"
                  title="Resume"
                >
                  ▶️
                </button>
                <button
                  @click="deleteCampaign(campaign)"
                  class="btn-icon btn-danger"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Campaign Modal -->
    <CampaignModal
      v-if="showCreateModal || showEditModal"
      :campaign="selectedCampaign"
      :isEdit="showEditModal"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- View Campaign Stats Modal -->
    <CampaignStatsModal
      v-if="showStatsModal"
      :campaign="selectedCampaign"
      @close="showStatsModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCampaignStore } from "../../store/admin/campaign.store";
import CampaignModal from "../../components/admin/campaigns/CampaignModal.vue";
import CampaignStatsModal from "../../components/admin/campaigns/CampaignStatsModal.vue";

const campaignStore = useCampaignStore();

// State
const loading = ref(false);
const error = ref(null);
const searchQuery = ref("");
const statusFilter = ref("");
const categoryFilter = ref("");
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showStatsModal = ref(false);
const selectedCampaign = ref(null);

// Computed
const totalEmailsSent = computed(() => {
  return campaignStore.campaigns.reduce(
    (sum, c) => sum + (c.stats?.sent || 0),
    0
  );
});

const averageOpenRate = computed(() => {
  const campaigns = campaignStore.campaigns.filter((c) => c.stats?.sent > 0);
  if (campaigns.length === 0) return 0;
  const totalRate = campaigns.reduce((sum, c) => {
    return sum + (c.stats.opened / c.stats.sent) * 100;
  }, 0);
  return totalRate / campaigns.length;
});

const filteredCampaigns = computed(() => {
  let filtered = [...campaignStore.campaigns];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.subject.toLowerCase().includes(query)
    );
  }

  if (statusFilter.value) {
    filtered = filtered.filter((c) => c.status === statusFilter.value);
  }

  if (categoryFilter.value) {
    filtered = filtered.filter((c) => c.category === categoryFilter.value);
  }

  return filtered;
});

// Methods
const fetchCampaigns = async () => {
  loading.value = true;
  error.value = null;
  try {
    await campaignStore.fetchCampaigns();
  } catch (err) {
    error.value = err.message || "Failed to load campaigns";
  } finally {
    loading.value = false;
  }
};

const viewCampaign = (campaign) => {
  selectedCampaign.value = campaign;
  showStatsModal.value = true;
};

const editCampaign = (campaign) => {
  selectedCampaign.value = campaign;
  showEditModal.value = true;
};

const sendCampaign = async (campaign) => {
  if (!confirm(`Send campaign "${campaign.name}" now?`)) return;

  try {
    await campaignStore.sendCampaign(campaign._id);
    alert("Campaign sent successfully!");
    await fetchCampaigns();
  } catch (err) {
    alert(err.message || "Failed to send campaign");
  }
};

const pauseCampaign = async (campaign) => {
  try {
    await campaignStore.pauseCampaign(campaign._id);
    await fetchCampaigns();
  } catch (err) {
    alert(err.message || "Failed to pause campaign");
  }
};

const resumeCampaign = async (campaign) => {
  try {
    await campaignStore.resumeCampaign(campaign._id);
    await fetchCampaigns();
  } catch (err) {
    alert(err.message || "Failed to resume campaign");
  }
};

const deleteCampaign = async (campaign) => {
  if (
    !confirm(
      `Delete campaign "${campaign.name}"? This action cannot be undone.`
    )
  )
    return;

  try {
    await campaignStore.deleteCampaign(campaign._id);
    await fetchCampaigns();
  } catch (err) {
    alert(err.message || "Failed to delete campaign");
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  selectedCampaign.value = null;
};

const handleSave = async (campaignData) => {
  try {
    if (showEditModal.value) {
      await campaignStore.updateCampaign(
        selectedCampaign.value._id,
        campaignData
      );
    } else {
      await campaignStore.createCampaign(campaignData);
    }
    closeModal();
    await fetchCampaigns();
  } catch (err) {
    alert(err.message || "Failed to save campaign");
  }
};

const formatCategory = (category) => {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatTargetType = (type) => {
  const types = {
    all: "All Users",
    segments: "Segments",
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

// Lifecycle
onMounted(() => {
  fetchCampaigns();
});
</script>

<style scoped>
.campaigns-view {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.icon {
  font-size: 18px;
}

/* Stats Grid */
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
  font-size: 24px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-icon.campaigns {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.sent {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.rate {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

/* Filters Bar */
.filters-bar {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  background: white;
  border-radius: 12px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.btn-retry {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* Table */
.campaigns-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.campaigns-table {
  width: 100%;
  border-collapse: collapse;
}

.campaigns-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.campaigns-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.campaigns-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.campaign-row:hover {
  background: #f9fafb;
}

.campaign-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.campaign-name {
  font-weight: 600;
  color: #1a1a1a;
}

.campaign-subject {
  font-size: 13px;
  color: #6b7280;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-status {
  text-transform: capitalize;
}

.badge-status.draft {
  background: #f3f4f6;
  color: #6b7280;
}
.badge-status.scheduled {
  background: #dbeafe;
  color: #1e40af;
}
.badge-status.sending {
  background: #fef3c7;
  color: #92400e;
}
.badge-status.completed {
  background: #d1fae5;
  color: #065f46;
}
.badge-status.paused {
  background: #fee2e2;
  color: #991b1b;
}
.badge-status.failed {
  background: #fecaca;
  color: #7f1d1d;
}

.badge-category {
  text-transform: capitalize;
  background: #ede9fe;
  color: #5b21b6;
}

.target-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.target-type {
  font-size: 14px;
  color: #1a1a1a;
}

.target-count {
  font-size: 12px;
  color: #6b7280;
}

.rate-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rate-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.rate-bar {
  width: 80px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s;
}

.schedule-info {
  font-size: 13px;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  transform: translateY(-2px);
  background: #e5e7eb;
}

.btn-icon.btn-success {
  background: #d1fae5;
}

.btn-icon.btn-success:hover {
  background: #a7f3d0;
}

.btn-icon.btn-warning {
  background: #fef3c7;
}

.btn-icon.btn-warning:hover {
  background: #fde68a;
}

.btn-icon.btn-danger {
  background: #fee2e2;
}

.btn-icon.btn-danger:hover {
  background: #fecaca;
}
</style>
