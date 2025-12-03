<template>
  <div class="h-screen p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
        Users Management
      </h1>
      <p class="mt-1 text-slate-600 dark:text-slate-400">
        Manage customers and admin accounts
      </p>
    </div>

    <!-- Filters & Search -->
    <div
      class="p-6 mb-6 bg-white border shadow-lg dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700"
    >
      <div class="flex items-center gap-2 mb-4">
        <svg
          class="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
          Bộ Lọc & Tìm Kiếm
        </h3>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="relative md:col-span-2">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
          >
            <svg
              class="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            v-model="filters.search"
            @input="debounceSearch"
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            class="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div class="relative">
          <select
            v-model="filters.role"
            @change="fetchUsers"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">👥 Tất cả vai trò</option>
            <option value="user">Khách hàng</option>
            <option value="admin">Quản trị viên</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <div class="relative">
          <select
            v-model="filters.status"
            @change="fetchUsers"
            class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">📊 Tất cả trạng thái</option>
            <option value="active">✅ Hoạt động</option>
            <option value="banned">🚫 Bị chặn</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div
        class="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"
      ></div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
    >
      <p class="text-red-800 dark:text-red-200">{{ error }}</p>
    </div>

    <!-- Users Table -->
    <div
      v-else
      class="overflow-hidden bg-white rounded-lg shadow dark:bg-slate-800"
    >
      <table class="w-full">
        <thead class="bg-slate-100 dark:bg-slate-700">
          <tr>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              User
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Email
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Role
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Loyalty Tier
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Total Orders
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Status
            </th>
            <th
              class="px-4 py-3 text-sm font-semibold text-left text-slate-900 dark:text-white"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr
            v-for="user in users"
            :key="user._id"
            class="hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img
                  :src="user.avatar || '/default-avatar.png'"
                  :alt="user.name"
                  class="object-cover w-10 h-10 rounded-full"
                />
                <div>
                  <div class="font-medium text-slate-900 dark:text-white">
                    {{ user.name }}
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ formatDate(user.createdAt) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
              {{ user.email }}
            </td>
            <td class="px-4 py-3">
              <select
                :value="user.isAdmin ? 'admin' : 'user'"
                @change="changeUserRole(user._id, $event.target.value)"
                :disabled="user._id === currentUserId"
                class="px-2 py-1 text-sm bg-white border rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50"
              >
                <option value="user">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td class="px-4 py-3">
              <span
                :class="getLoyaltyColor(user.loyaltyTier)"
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ user.loyaltyTier || "Bronze" }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-slate-900 dark:text-white">
              <button
                @click="viewUserOrders(user)"
                class="text-blue-600 hover:underline"
              >
                {{ user.totalOrders || 0 }} orders
              </button>
            </td>
            <td class="px-4 py-3">
              <button
                @click="toggleUserStatus(user)"
                :disabled="user._id === currentUserId"
                :class="
                  user.isBanned
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                "
                class="px-2 py-1 text-xs font-medium transition-colors rounded-full hover:opacity-80 disabled:opacity-50"
              >
                {{ user.isBanned ? "Banned" : "Active" }}
              </button>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button
                  @click="viewUserDetail(user)"
                  class="p-1 text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="View Details"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  v-if="user._id !== currentUserId"
                  @click="deleteUser(user._id)"
                  class="p-1 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete User"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="users.length === 0 && !loading" class="py-12 text-center">
        <p class="text-slate-600 dark:text-slate-400">No users found</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700"
      >
        <div class="text-sm text-slate-600 dark:text-slate-400">
          Showing {{ users.length }} of {{ totalUsers }} users
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span class="px-3 py-1 text-sm"
            >Page {{ currentPage }} of {{ totalPages }}</span
          >
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- User Detail Modal -->
    <UserDetailModal
      v-if="selectedUser"
      :user="selectedUser"
      @close="selectedUser = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getAllUsersApi,
  updateUserApi,
  toggleUserBanApi,
  deleteUserApi,
} from "../../service/admin.service";
import { useAuthStore } from "../../store/auth.store";
import UserDetailModal from "../../components/admin/users/UserDetailModal.vue";

const router = useRouter();
const authStore = useAuthStore();

// Reactive state
const users = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedUser = ref(null);
const filters = ref({
  search: "",
  role: "",
  status: "",
});
const currentPage = ref(1);
const totalPages = ref(1);
const totalUsers = ref(0);
const limit = ref(20);
const searchTimeout = ref(null);
const currentUserId = ref(null);

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true;
    error.value = null;

    const params = {};

    const response = await getAllUsersApi(params);
    console.log("Users API response:", response);

    let allUsers = response.users || [];

    if (filters.value.search && filters.value.search.trim()) {
      const searchTerm = filters.value.search.toLowerCase();
      allUsers = allUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.value.role) {
      if (filters.value.role === "admin") {
        allUsers = allUsers.filter((user) => user.isAdmin === true);
      } else if (filters.value.role === "user") {
        allUsers = allUsers.filter((user) => user.isAdmin !== true);
      }
    }

    if (filters.value.status) {
      if (filters.value.status === "banned") {
        allUsers = allUsers.filter((user) => user.isBanned === true);
      } else if (filters.value.status === "active") {
        allUsers = allUsers.filter((user) => user.isBanned !== true);
      }
    }

    totalUsers.value = allUsers.length;
    totalPages.value = Math.ceil(allUsers.length / limit.value);

    const start = (currentPage.value - 1) * limit.value;
    const end = start + limit.value;
    users.value = allUsers.slice(start, end);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    error.value = err.response?.data?.message || "Failed to load users";
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchUsers();
  }, 500);
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchUsers();
  }
};

const changeUserRole = async (userId, newRole) => {
  if (!confirm(`Change user role to ${newRole}?`)) return;

  try {
    const isAdmin = newRole === "admin";
    await updateUserApi(userId, isAdmin);
    await fetchUsers();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to change user role");
  }
};

const toggleUserStatus = async (user) => {
  const action = user.isBanned ? "unban" : "ban";
  if (!confirm(`${action} this user?`)) return;

  try {
    const isBanned = !user.isBanned;
    await toggleUserBanApi(user._id, isBanned);
    await fetchUsers();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update user status");
  }
};

const deleteUser = async (userId) => {
  if (!confirm("Permanently delete this user? This cannot be undone.")) return;

  try {
    await deleteUserApi(userId);
    await fetchUsers();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete user");
  }
};

const viewUserDetail = (user) => {
  selectedUser.value = user;
};

const viewUserOrders = (user) => {
  router.push({ name: "AdminOrders", query: { userId: user._id } });
};

const getLoyaltyColor = (tier) => {
  const colors = {
    Bronze: "bg-orange-100 text-orange-800",
    Silver: "bg-slate-200 text-slate-800",
    Gold: "bg-yellow-100 text-yellow-800",
    Platinum: "bg-purple-100 text-purple-800",
  };
  return colors[tier] || colors.Bronze;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Lifecycle
onMounted(async () => {
  currentUserId.value = authStore.user?._id;
  await fetchUsers();
});
</script>
