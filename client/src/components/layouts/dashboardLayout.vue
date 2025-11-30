<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Added sidebar component -->
    <EnhancedSidebar />
    
    <!-- Main content area -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Render admin dashboard content -->
      <AdminDashboard />
    </div>
  </div>
</template>

<script>
import AdminDashboard from '../../views/admin/AdminDashboard.vue'
import EnhancedSidebar from '../admin/EnhancedSidebar.vue'

export default {
  name: 'DashboardLayout',
  components: {
    AdminDashboard,
    EnhancedSidebar,
  },
}
</script>

<style scoped>
/* Layout transitions for dark mode */
</style>
