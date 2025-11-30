<template>
  <div class="space-y-6">
    <!-- Avatar & Header Section -->
    <div class="overflow-hidden border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
      <div class="relative h-32 bg-gradient-to-r from-rose-200 via-violet-200 to-blue-200">
        <div class="absolute inset-0 bg-white/20"></div>
      </div>
      <div class="relative p-6 sm:-mt-16">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
          <ModelChangeAvatar
            :currentAvatar="authStore.user?.avatar || { url: '', public_id: '' }"
            @update:avatar="$emit('avatar-update', $event)"
            @loading-state="$emit('avatar-loading', $event)"
          />
          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-2xl font-bold text-gray-700">{{ authStore.user?.name }}</h1>
            <p class="text-gray-500">{{ authStore.user?.email }}</p>
            <div class="flex justify-center gap-2 mt-2 sm:justify-start">
              <span class="px-3 py-1 text-sm border rounded-full bg-emerald-50 text-emerald-700 border-emerald-200">
                Member{{ authStore.user?.createAt ? ' since ' + formatYear(authStore.user.createAt) : '' }}
              </span>
              <span v-if="authStore.user?.isAdmin" class="px-3 py-1 text-sm border rounded-full bg-violet-50 text-violet-700 border-violet-200">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Details -->
    <div class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-700">Personal Information</h2>
        <button
          @click="$emit('toggle-edit')"
          :class="['px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm', 
                   isEditing ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200' 
                             : 'bg-gradient-to-r from-rose-400 to-violet-400 hover:from-rose-500 hover:to-violet-500 text-white']"
        >
          {{ isEditing ? 'Cancel' : 'Edit' }}
        </button>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Full Name -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600">Full Name</label>
          <input
            v-if="isEditing"
            v-model="editForm.name"
            type="text"
            class="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            placeholder="Enter your full name"
          />
          <div v-else class="px-4 py-3 text-gray-700 border border-gray-100 bg-gray-50 rounded-xl">
            {{ authStore.user?.name || 'Not updated' }}
          </div>
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600">Email</label>
          <input
            v-if="isEditing"
            v-model="editForm.email"
            type="email"
            :disabled="authStore.user?.isOAuthUser"
            :class="['w-full px-4 py-3 transition-all duration-200 border rounded-xl',
                     authStore.user?.isOAuthUser 
                       ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500' 
                       : 'bg-white border-gray-200 focus:ring-2 focus:ring-rose-300 focus:border-rose-300']"
            placeholder="your@email.com"
          />
          <div v-else class="px-4 py-3 text-gray-700 border border-gray-100 bg-gray-50 rounded-xl">
            {{ authStore.user?.email || 'Not updated' }}
          </div>
          <p v-if="isEditing && authStore.user?.isOAuthUser" class="text-xs text-amber-600">
            ⚠️ OAuth users cannot change their email address
          </p>
        </div>

        <!-- Phone Number -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600">Phone Number</label>
          <input
            v-if="isEditing"
            v-model="editForm.phone"
            type="tel"
            pattern="[0-9]{9,10}"
            class="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            placeholder="0123456789"
          />
          <div v-else class="px-4 py-3 text-gray-700 border border-gray-100 bg-gray-50 rounded-xl">
            {{ authStore.user?.phone || 'Not updated' }}
          </div>
        </div>

        <!-- Date of Birth -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600">Date of Birth</label>
          <input
            v-if="isEditing"
            v-model="editForm.dateOfBirth"
            type="date"
            :max="maxDate"
            :min="minDate"
            class="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
          />
          <div v-else class="px-4 py-3 text-gray-700 border border-gray-100 bg-gray-50 rounded-xl">
            {{ formatDate(authStore.user?.dateOfBirth) }}
          </div>
          <p v-if="isEditing" class="text-xs text-gray-500">
            Age must be between 10-100 years
          </p>
        </div>
      </div>

      <!-- Save Button -->
      <div v-if="isEditing" class="flex gap-3 mt-6">
        <button
          type="button"
          @click="$emit('toggle-edit')"
          class="flex-1 px-6 py-3 font-medium text-gray-600 transition-all duration-200 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleUpdateProfile"
          :disabled="userStore.loading || !isFormValid"
          class="flex-1 px-6 py-3 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-rose-400 to-violet-400 rounded-xl hover:from-rose-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ userStore.loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ModelChangeAvatar from './ModelChangeAvatar.vue'

const props = defineProps({
  authStore: Object,
  userStore: Object,
  isEditing: Boolean,
  editForm: Object
})

const emit = defineEmits(['toggle-edit', 'update-profile', 'avatar-update', 'avatar-loading'])

// Date constraints (10-100 years old)
const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 10)
  return date.toISOString().split('T')[0]
})

const minDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 100)
  return date.toISOString().split('T')[0]
})

// Form validation
const isFormValid = computed(() => {
  if (!props.editForm.name?.trim()) return false
  if (!props.editForm.email?.trim()) return false
  
  // Validate phone (9-10 digits)
  if (props.editForm.phone && !/^[0-9]{9,10}$/.test(props.editForm.phone)) {
    return false
  }
  
  return true
})

const formatDate = (date) => {
  if (!date) return 'Not updated'
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatYear = (date) => {
  if (!date) return ''
  return new Date(date).getFullYear()
}

const handleUpdateProfile = () => {
  if (!isFormValid.value) {
    return
  }
  emit('update-profile')
}
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>