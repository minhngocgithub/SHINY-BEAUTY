<template>
  <div class="feedback-view">
    <!-- Header -->
    <div class="header">
      <div>
        <h1>Customer Feedback & Support</h1>
        <p class="subtitle">Manage customer feedback, support tickets, and service quality metrics</p>
      </div>
      <div class="header-actions">
        <button @click="refreshData" class="btn-refresh" :disabled="loading">
          <span v-if="!loading">🔄</span>
          <span v-else class="animate-spin">⟳</span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100">💬</div>
        <div class="stat-info">
          <div class="stat-value">{{ pagination.total || 0 }}</div>
          <div class="stat-label">Total Feedbacks</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-orange-100">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ getPendingCount() }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-red-100">🚨</div>
        <div class="stat-info">
          <div class="stat-value">{{ getUrgentCount() }}</div>
          <div class="stat-label">Urgent Priority</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-green-100">⚡</div>
        <div class="stat-info">
          <div class="stat-value">{{ formatSLATime(statistics.sla?.avgResponseTime) }}</div>
          <div class="stat-label">Avg Response Time</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-group">
        <div class="filter-item">
          <label>Type</label>
          <select v-model="filters.type" @change="applyFilters" class="filter-select">
            <option value="">All Types</option>
            <option value="order_issue">📦 Order Issue</option>
            <option value="payment_problem">💳 Payment Problem</option>
            <option value="shipping_delay">🚚 Shipping Delay</option>
            <option value="product_quality">⭐ Product Quality</option>
            <option value="technical_issue">⚙️ Technical Issue</option>
            <option value="account_issue">👤 Account Issue</option>
            <option value="bug">🐛 Bug Report</option>
            <option value="suggestion">💡 Suggestion</option>
            <option value="question">❓ Question</option>
            <option value="complaint">😤 Complaint</option>
            <option value="other">ℹ️ Other</option>
          </select>
        </div>

        <div class="filter-item">
          <label>Status</label>
          <select v-model="filters.status" @change="applyFilters" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="in_progress">🔄 In Progress</option>
            <option value="resolved">✅ Resolved</option>
            <option value="closed">🔒 Closed</option>
          </select>
        </div>

        <div class="filter-item">
          <label>Priority</label>
          <select v-model="filters.priority" @change="applyFilters" class="filter-select">
            <option value="">All Priorities</option>
            <option value="urgent">🚨 Urgent</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>

        <div class="filter-item search-box">
          <label>Search</label>
          <input 
            v-model="filters.search" 
            @input="debouncedSearch"
            type="text" 
            placeholder="Search message, email, tags..."
            class="search-input"
          />
        </div>
      </div>
    </div>

    <!-- Feedbacks List -->
    <div class="content-card">
      <div v-if="loading && feedbacks.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>Loading feedbacks...</p>
      </div>

      <div v-else-if="feedbacks.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No feedbacks found</h3>
        <p>There are no customer feedbacks matching your filters.</p>
      </div>

      <div v-else class="feedbacks-list">
        <div v-for="feedback in feedbacks" :key="feedback._id" class="feedback-card">
          <div class="feedback-header">
            <div class="customer-section">
              <div class="customer-name">{{ feedback.displayName }}</div>
              <div class="customer-email">{{ feedback.contactEmail }}</div>
            </div>
            <div class="badges-section">
              <span :class="`priority-badge priority-${feedback.priority}`">
                {{ getPriorityIcon(feedback.priority) }} {{ getPriorityLabel(feedback.priority) }}
              </span>
              <span :class="`status-badge status-${getFeedbackStatusColor(feedback.status)}`">
                {{ getFeedbackStatusLabel(feedback.status) }}
              </span>
            </div>
          </div>

          <div class="feedback-body">
            <div class="type-label">
              <span :class="`type-badge type-${getFeedbackTypeColor(feedback.type)}`">
                {{ getFeedbackTypeIcon(feedback.type) }} {{ getFeedbackTypeLabel(feedback.type) }}
              </span>
              <span class="feedback-date">{{ formatDate(feedback.createdAt) }}</span>
            </div>
            
            <div class="message-preview">{{ truncateMessage(feedback.message, 150) }}</div>

            <div v-if="feedback.relatedOrder" class="order-badge">
              📦 Order #{{ feedback.relatedOrder.orderNumber || feedback.relatedOrder._id?.slice(-6) }}
            </div>

            <div v-if="feedback.tags && feedback.tags.length > 0" class="tags-list">
              <span v-for="tag in feedback.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>

          <div class="feedback-footer">
            <div class="sla-metrics">
              <span v-if="feedback.sla?.responseTime" class="sla-badge">
                ⚡ Response: {{ formatSLATime(feedback.sla.responseTime) }}
              </span>
              <span v-if="feedback.sla?.resolutionTime" class="sla-badge">
                ✅ Resolution: {{ formatSLATime(feedback.sla.resolutionTime) }}
              </span>
              <span v-if="feedback.reply?.length > 0" class="replies-count">
                💬 {{ feedback.reply.length }} {{ feedback.reply.length === 1 ? 'reply' : 'replies' }}
              </span>
            </div>
            <button @click="viewDetails(feedback)" class="btn-view-details">
              View Details →
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <button 
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="pagination-btn"
        >
          ← Previous
        </button>
        <span class="pagination-info">
          Page {{ pagination.page }} of {{ pagination.totalPages }} ({{ pagination.total }} total)
        </span>
        <button 
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.totalPages"
          class="pagination-btn"
        >
          Next →
        </button>
      </div>
    </div>

    <!-- Detail Modal -->
    <teleport to="body">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Feedback Details</h2>
            <button @click="closeModal" class="modal-close">✕</button>
          </div>

          <div v-if="selectedFeedback" class="modal-body">
            <!-- Customer Info & Status -->
            <div class="detail-section">
              <div class="detail-grid">
                <div>
                  <label>Customer:</label>
                  <p class="detail-value">{{ selectedFeedback.displayName }}</p>
                </div>
                <div>
                  <label>Email:</label>
                  <p class="detail-value">{{ selectedFeedback.contactEmail }}</p>
                </div>
                <div>
                  <label>Type:</label>
                  <span :class="`type-badge type-${getFeedbackTypeColor(selectedFeedback.type)}`">
                    {{ getFeedbackTypeIcon(selectedFeedback.type) }} {{ getFeedbackTypeLabel(selectedFeedback.type) }}
                  </span>
                </div>
                <div>
                  <label>Priority:</label>
                  <span :class="`priority-badge priority-${selectedFeedback.priority}`">
                    {{ getPriorityIcon(selectedFeedback.priority) }} {{ getPriorityLabel(selectedFeedback.priority) }}
                  </span>
                </div>
                <div>
                  <label>Status:</label>
                  <span :class="`status-badge status-${getFeedbackStatusColor(selectedFeedback.status)}`">
                    {{ getFeedbackStatusLabel(selectedFeedback.status) }}
                  </span>
                </div>
                <div>
                  <label>Created:</label>
                  <p class="detail-value">{{ formatFullDate(selectedFeedback.createdAt) }}</p>
                </div>
              </div>
            </div>

            <!-- Order -->
            <div v-if="selectedFeedback.relatedOrder" class="detail-section">
              <h3>📦 Related Order</h3>
              <div class="order-card">
                <p><strong>Order #:</strong> {{ selectedFeedback.relatedOrder.orderNumber || selectedFeedback.relatedOrder._id }}</p>
                <p><strong>Total:</strong> ${{ selectedFeedback.relatedOrder.totalPrice?.toFixed(2) }}</p>
                <p><strong>Status:</strong> {{ selectedFeedback.relatedOrder.status }}</p>
              </div>
            </div>

            <!-- Message -->
            <div class="detail-section">
              <h3>Message</h3>
              <div class="message-box">{{ selectedFeedback.message }}</div>
            </div>

            <!-- Replies -->
            <div v-if="selectedFeedback.reply && selectedFeedback.reply.length > 0" class="detail-section">
              <h3>💬 Admin Replies ({{ selectedFeedback.reply.length }})</h3>
              <div class="replies-container">
                <div v-for="reply in selectedFeedback.reply" :key="reply._id" class="reply-card">
                  <div class="reply-header">
                    <strong>{{ reply.admin?.name || 'Admin' }}</strong>
                    <span>{{ formatFullDate(reply.createdAt) }}</span>
                  </div>
                  <p>{{ reply.message }}</p>
                </div>
              </div>
            </div>

            <!-- Reply Form -->
            <div class="detail-section">
              <h3>Send Reply</h3>
              <textarea 
                v-model="replyForm.message" 
                placeholder="Type your reply to the customer..."
                rows="4"
                class="reply-textarea"
              ></textarea>
              <textarea 
                v-model="replyForm.internalNote" 
                placeholder="Internal note (optional, not visible to customer)..."
                rows="2"
                class="reply-textarea internal-note"
              ></textarea>
              <div class="reply-actions">
                <select v-model="replyForm.status" class="status-select">
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <button 
                  @click="submitReply" 
                  :disabled="!replyForm.message && !replyForm.internalNote || submitting"
                  class="btn-submit"
                >
                  {{ submitting ? 'Sending...' : 'Send Reply' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  getAllFeedbacksApi,
  getFeedbackByIdApi,
  replyToFeedbackApi,
  updateFeedbackStatusApi,
  getFeedbackTypeLabel,
  getFeedbackTypeIcon,
  getFeedbackTypeColor,
  getFeedbackStatusLabel,
  getFeedbackStatusColor,
  getPriorityLabel,
  formatSLATime
} from '../../service/feedback.service'

const feedbacks = ref([])
const loading = ref(false)
const submitting = ref(false)
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const statistics = reactive({
  byStatus: [],
  byType: [],
  byPriority: [],
  sla: { avgResponseTime: 0, avgResolutionTime: 0 }
})

const filters = reactive({
  type: '',
  status: '',
  priority: '',
  search: ''
})

const showDetailModal = ref(false)
const selectedFeedback = ref(null)
const replyForm = reactive({
  message: '',
  internalNote: '',
  status: 'in_progress'
})

let searchTimeout = null

const fetchFeedbacks = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: 'createdAt',
      order: 'desc'
    }
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.search) params.search = filters.search

    const response = await getAllFeedbacksApi(params)
    if (response.data.success) {
      feedbacks.value = response.data.feedbacks
      Object.assign(pagination, response.data.pagination)
      Object.assign(statistics, response.data.statistics)
    }
  } catch (error) {
    console.error('Fetch feedbacks error:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.page = 1
  fetchFeedbacks()
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => applyFilters(), 500)
}

const changePage = (page) => {
  pagination.page = page
  fetchFeedbacks()
}

const refreshData = () => fetchFeedbacks()

const viewDetails = async (feedback) => {
  try {
    const response = await getFeedbackByIdApi(feedback._id)
    if (response.data.success) {
      selectedFeedback.value = response.data.feedback
      showDetailModal.value = true
      replyForm.message = ''
      replyForm.internalNote = ''
      replyForm.status = 'in_progress'
    }
  } catch (error) {
    console.error('Fetch feedback details error:', error)
  }
}

const closeModal = () => {
  showDetailModal.value = false
  selectedFeedback.value = null
}

const submitReply = async () => {
  if (!selectedFeedback.value) return
  submitting.value = true
  try {
    const replyData = {}
    if (replyForm.message) replyData.message = replyForm.message
    if (replyForm.internalNote) replyData.internalNote = replyForm.internalNote

    await replyToFeedbackApi(selectedFeedback.value._id, replyData)

    if (replyForm.status !== selectedFeedback.value.status) {
      await updateFeedbackStatusApi(selectedFeedback.value._id, replyForm.status)
    }

    alert('Reply sent successfully!')
    closeModal()
    fetchFeedbacks()
  } catch (error) {
    console.error('Submit reply error:', error)
    alert('Failed to send reply.')
  } finally {
    submitting.value = false
  }
}

const getPendingCount = () => statistics.byStatus.find(s => s._id === 'pending')?.count || 0
const getUrgentCount = () => statistics.byPriority.find(s => s._id === 'urgent')?.count || 0
const getPriorityIcon = (priority) => ({ urgent: '🚨', high: '🔴', medium: '🟡', low: '🟢' }[priority] || '⚪')
const truncateMessage = (msg, len = 80) => msg && msg.length > len ? msg.substring(0, len) + '...' : msg || ''
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const diff = new Date() - new Date(dateStr)
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days}d ago` : new Date(dateStr).toLocaleDateString()
}
const formatFullDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : 'N/A'

onMounted(() => fetchFeedbacks())
</script>

<style scoped>
.feedback-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-refresh {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #3b82f6;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.bg-blue-100 { background: #dbeafe; }
.bg-orange-100 { background: #fed7aa; }
.bg-red-100 { background: #fee2e2; }
.bg-green-100 { background: #d1fae5; }

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filter-item label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.filter-select,
.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.feedbacks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.feedback-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.customer-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 16px;
}

.customer-email {
  color: #6b7280;
  font-size: 13px;
  margin-top: 2px;
}

.badges-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.priority-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.priority-urgent { background: #fee2e2; color: #991b1b; }
.priority-high { background: #fed7aa; color: #9a3412; }
.priority-medium { background: #fef3c7; color: #92400e; }
.priority-low { background: #d1fae5; color: #065f46; }

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-orange { background: #fed7aa; color: #9a3412; }
.status-blue { background: #dbeafe; color: #1e40af; }
.status-green { background: #d1fae5; color: #065f46; }
.status-gray { background: #f3f4f6; color: #374151; }

.feedback-body {
  margin-bottom: 12px;
}

.type-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.type-blue { background: #dbeafe; color: #1e40af; }
.type-red { background: #fee2e2; color: #991b1b; }
.type-yellow { background: #fef3c7; color: #92400e; }
.type-orange { background: #fed7aa; color: #9a3412; }
.type-purple { background: #e9d5ff; color: #6b21a8; }
.type-amber { background: #fef3c7; color: #78350f; }
.type-pink { background: #fce7f3; color: #9f1239; }
.type-indigo { background: #e0e7ff; color: #3730a3; }
.type-cyan { background: #cffafe; color: #155e75; }
.type-gray { background: #f3f4f6; color: #374151; }

.feedback-date {
  font-size: 12px;
  color: #9ca3af;
}

.message-preview {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 8px;
}

.order-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  font-size: 12px;
  color: #0369a1;
  margin-bottom: 8px;
}

.tags-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 3px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 11px;
  color: #6b7280;
}

.feedback-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.sla-metrics {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.sla-badge,
.replies-count {
  font-size: 12px;
  color: #6b7280;
}

.btn-view-details {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-view-details:hover {
  background: #2563eb;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #3b82f6;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

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

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-grid label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
}

.detail-value {
  color: #1a1a1a;
  font-size: 14px;
}

.order-card {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.message-box {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  white-space: pre-wrap;
  line-height: 1.6;
}

.replies-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-card {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.reply-header strong {
  color: #1a1a1a;
}

.reply-header span {
  color: #6b7280;
}

.reply-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 12px;
}

.reply-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.internal-note {
  background: #fffbeb;
  border-color: #fde68a;
}

.reply-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-select {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.btn-submit {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
