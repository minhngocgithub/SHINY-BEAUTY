import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useAuthStore = defineStore("auth", () => {
    const state = ref({
        user: null,
        isLoggedIn: false,
    })

    const isLoggedIn = computed(() => state.value.isLoggedIn)
    const user = computed(() => state.value.user)
    const userId = computed(() => state.value.user?._id)

    const setAuthStore = (data) => {
        state.value = data
        if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken)
        }
        localStorage.setItem("authState", JSON.stringify(state.value))
    }
    const loadFromStorage = () => {
        const savedState = localStorage.getItem("authState")
        if (savedState) {
            state.value = JSON.parse(savedState)
        }
    }
    const logout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("authState")
        localStorage.removeItem("userInfo")
        state.value = { user: null, isLoggedIn: false }
    }
    return {
        state,
        isLoggedIn,
        user,
        userId,
        setAuthStore,
        loadFromStorage,
        logout,
    }
})
