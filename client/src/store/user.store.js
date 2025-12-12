import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    setDefaultAddress,
    getUserStats,
    updateNotificationPreferences,
    getNotificationPreferences,
    uploadAvatar,
    deleteAvatar,
    getOAuthUrls,
    linkOAuthAccount,
    unlinkOAuthAccount,
    getConnectedOAuthAccounts,
    deleteAccount
} from '../service/user.service'

export const useUserStore = defineStore('user', () => {
    // State
    const profile = ref(null)
    const addresses = ref([])
    const stats = ref(null)
    const oauthAccounts = ref({
        google: false,
        facebook: false,
        github: false
    })
    const oauthUrls = ref({
        google: '',
        facebook: '',
        github: ''
    })
    const notificationPreferences = ref({
        email: {
            orderUpdates: true,
            promotions: true,
            newsletter: false,
            productRecommendations: true,
            loyaltyUpdates: true
        },
        push: {
            orderUpdates: true,
            promotions: false,
            productRecommendations: false,
            loyaltyUpdates: true
        }
    })
    const loading = ref(false)
    const error = ref(null)

    // Computed
    const hasAddresses = computed(() => addresses.value.length > 0)
    const defaultAddress = computed(() =>
        addresses.value.find(addr => addr.isDefault) || addresses.value[0] || null
    )

    // Actions
    const fetchProfile = async () => {
        try {
            loading.value = true
            error.value = null
            const response = await getUserProfile()
            if (response.data.success) {
                profile.value = response.data.user
                return response.data.user
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch profile'
            console.error('Fetch profile error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateProfile = async (data) => {
        try {
            loading.value = true
            error.value = null
            const response = await updateUserProfile(data)
            if (response.data.success) {
                profile.value = { ...profile.value, ...response.data.user }
                return response.data.user
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update profile'
            console.error('Update profile error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const changeUserPassword = async (passwordData) => {
        try {
            loading.value = true
            error.value = null
            const response = await changePassword(passwordData)
            if (response.data.success) {
                return response.data
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to change password'
            console.error('Change password error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchAddresses = async () => {
        try {
            loading.value = true
            error.value = null
            const response = await getUserAddresses()
            if (response.data.success) {
                addresses.value = response.data.addresses || []
                return addresses.value
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch addresses'
            console.error('Fetch addresses error:', err)
            addresses.value = []
        } finally {
            loading.value = false
        }
    }

    const addAddress = async (addressData) => {
        try {
            loading.value = true
            error.value = null
            const response = await addUserAddress(addressData)
            if (response.data.success) {
                addresses.value.push(response.data.address)
                return response.data.address
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to add address'
            console.error('Add address error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateAddress = async (addressId, addressData) => {
        try {
            loading.value = true
            error.value = null
            const response = await updateUserAddress(addressId, addressData)
            if (response.data.success) {
                const index = addresses.value.findIndex(a => a._id === addressId)
                if (index > -1) {
                    addresses.value[index] = response.data.address
                }
                return response.data.address
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update address'
            console.error('Update address error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const removeAddress = async (addressId) => {
        try {
            loading.value = true
            error.value = null
            const response = await deleteUserAddress(addressId)
            if (response.data.success) {
                addresses.value = addresses.value.filter(a => a._id !== addressId)
                return true
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to delete address'
            console.error('Delete address error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const setDefault = async (addressId) => {
        try {
            loading.value = true
            error.value = null
            const response = await setDefaultAddress(addressId)
            if (response.data.success) {
                addresses.value = addresses.value.map(addr => ({
                    ...addr,
                    isDefault: addr._id === addressId
                }))
                return true
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to set default address'
            console.error('Set default address error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchStats = async () => {
        try {
            loading.value = true
            error.value = null
            const response = await getUserStats()
            if (response.data.success) {
                stats.value = response.data.stats
                return stats.value
            }
        } catch (err) {
            console.error('Fetch stats error:', err)
            stats.value = null
        } finally {
            loading.value = false
        }
    }

    const fetchNotificationPreferences = async () => {
        try {
            const response = await getNotificationPreferences()
            if (response.data.success) {
                notificationPreferences.value = response.data.preferences
            }
        } catch (err) {
            console.error('Fetch notification preferences error:', err)
        }
    }

    const updateNotifications = async (preferences) => {
        try {
            loading.value = true
            error.value = null
            const response = await updateNotificationPreferences(preferences)
            if (response.data.success) {
                notificationPreferences.value = { ...notificationPreferences.value, ...preferences }
                return response.data.preferences
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update preferences'
            console.error('Update notification preferences error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const uploadUserAvatar = async (formData) => {
        try {
            loading.value = true
            error.value = null
            const response = await uploadAvatar(formData)
            if (response.data.success) {
                if (profile.value) {
                    profile.value.avatar = response.data.avatar
                }
                return response.data.avatar
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to upload avatar'
            console.error('Upload avatar error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteUserAvatar = async () => {
        try {
            loading.value = true
            error.value = null
            const response = await deleteAvatar()
            if (response.data.success) {
                if (profile.value) {
                    profile.value.avatar = null
                }
                return true
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to delete avatar'
            console.error('Delete avatar error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchOAuthUrls = async () => {
        try {
            const response = await getOAuthUrls()
            if (response.data.success) {
                oauthUrls.value = response.data.urls
                return response.data.urls
            }
        } catch (err) {
            console.error('Fetch OAuth URLs error:', err)
        }
    }

    const fetchConnectedOAuthAccounts = async () => {
        try {
            const response = await getConnectedOAuthAccounts()
            if (response.data.success) {
                oauthAccounts.value = response.data.accounts
                return response.data.accounts
            }
        } catch (err) {
            console.error('Fetch connected OAuth accounts error:', err)
        }
    }

    const linkOAuth = async (provider) => {
        try {
            loading.value = true
            error.value = null
            const response = await linkOAuthAccount(provider)
            if (response.data.success) {
                oauthAccounts.value[provider] = true
                return response.data
            }
        } catch (err) {
            error.value = err.response?.data?.message || `Failed to link ${provider} account`
            console.error('Link OAuth account error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const unlinkOAuth = async (provider) => {
        try {
            loading.value = true
            error.value = null
            const response = await unlinkOAuthAccount(provider)
            if (response.data.success) {
                oauthAccounts.value[provider] = false
                return response.data
            }
        } catch (err) {
            error.value = err.response?.data?.message || `Failed to unlink ${provider} account`
            console.error('Unlink OAuth account error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const removeAccount = async (password) => {
        try {
            loading.value = true
            error.value = null
            const response = await deleteAccount(password)
            if (response.data.success) {
                // Clear all user data
                profile.value = null
                addresses.value = []
                stats.value = null
                return true
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to delete account'
            console.error('Delete account error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        useUserStore,
        profile,
        addresses,
        stats,
        oauthAccounts,
        oauthUrls,
        notificationPreferences,
        loading,
        error,

        hasAddresses,
        defaultAddress,

        // Actions
        fetchProfile,
        updateProfile,
        changeUserPassword,
        fetchAddresses,
        addAddress,
        updateAddress,
        removeAddress,
        setDefault,
        fetchStats,
        fetchNotificationPreferences,
        updateNotifications,
        uploadUserAvatar,
        deleteUserAvatar,
        fetchOAuthUrls,
        fetchConnectedOAuthAccounts,
        linkOAuth,
        unlinkOAuth,
        removeAccount
    }
})