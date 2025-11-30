<template>
  <div id="sidebar">
    <header class="bg-white shadow">
    <div class="flex items-center justify-between px-4 py-4">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">Dashboard</h2>
      </div>
      <div class="flex items-center space-x-4">
        <button class="p-1 text-gray-400 rounded-full hover:text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>


        </button>
        <div class="flex items-center">
          <img class="w-8 h-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User avatar" />
        </div>
      </div>
    </div>
    </header>
    <hr />
    <div>
        <div class="flex flex-col w-64 h-screen bg-gray-800">
            <div class="flex items-center justify-center h-16 px-4">
                <h1 class="text-xl font-bold text-white">Cosmetic Admin</h1>
            </div>
            <nav class="flex-1 px-2 py-4 space-y-1">
            <a v-for="item in navigation" :key="item.name"
                :href="item.href"
                
                :class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md']">
                <component :is="item.icon" class="w-6 h-6 mr-3" :class="[item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300']" />
                {{ item.name }}
            </a>
            </nav>
            <div class="p-2 border-t border-gray-200">
              <button
                class="flex items-center w-full gap-2 px-4 py-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                @click="logout" 
              >
                <span>Logout</span> 
              </button>
            </div>
        </div>
    </div>
  </div>
  
</template>

<script>
import { ref, reactive } from 'vue'
import {  useRouter} from 'vue-router'
import { useAuthStore } from '../../store/auth.store'
import {  HomeIcon, ShoppingBagIcon, UsersIcon, ChartBarIcon, CogIcon, BellIcon, } from '@heroicons/vue/24/outline';
import {
  logoutAccountApi,
} from "../../service/auth.service";
export default {
    name: 'SideBar',
    setup() {
        const router = useRouter()
        const authStore = useAuthStore().state
        const navigation = reactive([
            { name: 'Dashboard', icon: HomeIcon, href: '/admin', current: true },
            { name: 'Products', icon: ShoppingBagIcon, href: '/admin/manage-product', current: false },
            { name: 'Customers', icon: UsersIcon, href: '/admin/customers', current: false },
            { name: 'Analytics', icon: ChartBarIcon, href: '/admin/analytics', current: false },
            { name: 'Settings', icon: CogIcon, href: '/admin/settings', current: false },
        ]);
        const logout = async () => {
          try {
            await logoutAccountApi().then(() => {
              authStore.isLoggedIn = false;
              authStore.user = null;
              console.log("logout");

              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              router.push({ path: "/" });
            });
          } catch (error) {
            router.push({ path: "/NotFound404" });
          }
        };

        return {
            logout,
            navigation
            

        }

    }


}
</script>

<style scoped>
#sidebar {
    flex: 1;
    border-right: 0.5px solid rgb(230, 227, 227);
    min-height: 100vh;
    background-color: white;
}
hr {
    height: 0;
    border: 0.5px solid rgb(230, 227, 227);
}
.colorOption:nth-child(1) {
    background-color: white;
}
.colorOption:nth-child(2) {
    background-color: #333;
}
.colorOption:nth-child(3) {
    background-color: darkblue;
}


</style>