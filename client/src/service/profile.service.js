import axiosApiInstance from "../../utils/api"

const BASE_USER_API = "/users"

// ==================== PROFILE UTILITIES ====================

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Vietnamese format)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/
  return phoneRegex.test(phone)
}

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const minLength = 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const errors = []

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`)
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number')
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar)
  }
}

/**
 * Calculate password strength
 */
const calculatePasswordStrength = (password, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar) => {
  let strength = 0

  if (password.length >= 6) strength += 1
  if (password.length >= 10) strength += 1
  if (hasUpperCase && hasLowerCase) strength += 1
  if (hasNumbers) strength += 1
  if (hasSpecialChar) strength += 1

  if (strength <= 2) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
}

/**
 * Format user display name
 */
export const formatDisplayName = (user) => {
  if (user.fullName) return user.fullName
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  return user.email?.split('@')[0] || 'User'
}

/**
 * Get avatar URL or default
 */
export const getAvatarUrl = (user, size = 'medium') => {
  if (user?.avatar?.url) return user.avatar.url

  // Generate default avatar with initials
  const name = formatDisplayName(user)
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const sizes = {
    small: 40,
    medium: 80,
    large: 160
  }

  const dimension = sizes[size] || sizes.medium

  // Use UI Avatars API
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${dimension}&background=random&color=fff`
}

/**
 * Check if profile is complete
 */
export const isProfileComplete = (user) => {
  const requiredFields = ['email', 'fullName', 'phone']
  return requiredFields.every(field => user?.[field])
}

/**
 * Calculate profile completion percentage
 */
export const getProfileCompletionPercentage = (user) => {
  if (!user) return 0

  const fields = {
    email: 15,
    fullName: 15,
    phone: 15,
    avatar: 10,
    dateOfBirth: 10,
    gender: 5,
    addresses: 15,
    emailVerified: 15
  }

  let completed = 0

  if (user.email) completed += fields.email
  if (user.fullName) completed += fields.fullName
  if (user.phone) completed += fields.phone
  if (user.avatar?.url) completed += fields.avatar
  if (user.dateOfBirth) completed += fields.dateOfBirth
  if (user.gender) completed += fields.gender
  if (user.addresses?.length > 0) completed += fields.addresses
  if (user.emailVerified) completed += fields.emailVerified

  return Math.round(completed)
}

/**
 * Format address for display
 */
export const formatAddress = (address) => {
  if (!address) return ''

  const parts = [
    address.street,
    address.ward,
    address.district,
    address.city,
    address.country
  ].filter(Boolean)

  return parts.join(', ')
}

/**
 * Validate address data
 */
export const validateAddress = (address) => {
  const requiredFields = ['fullName', 'phone', 'street', 'city']
  const errors = {}

  requiredFields.forEach(field => {
    if (!address[field] || address[field].trim() === '') {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
    }
  })

  if (address.phone && !validatePhone(address.phone)) {
    errors.phone = 'Invalid phone number format'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Get user tier badge color
 */
export const getTierBadgeColor = (tier) => {
  const colors = {
    NEW_CUSTOMER: 'bg-gray-500',
    REGULAR: 'bg-blue-500',
    VIP: 'bg-purple-500',
    PLATINUM: 'bg-gray-800'
  }
  return colors[tier] || colors.NEW_CUSTOMER
}

/**
 * Format user stats for display
 */
export const formatUserStats = (stats) => {
  if (!stats) return null

  return {
    totalOrders: stats.totalOrders || 0,
    totalSpent: stats.totalSpent || 0,
    averageOrderValue: stats.averageOrderValue || 0,
    wishlistItems: stats.wishlistItems || 0,
    reviewsCount: stats.reviewsCount || 0,
    loyaltyPoints: stats.loyaltyPoints || 0
  }
}

/**
 * Check if user can delete account
 */
export const canDeleteAccount = (user) => {
  // Cannot delete if:
  // - Has pending orders
  // - Has active subscriptions
  // - Account is less than 30 days old

  const accountAge = Date.now() - new Date(user.createdAt).getTime()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000

  return {
    canDelete: accountAge >= thirtyDays,
    reason: accountAge < thirtyDays ? 'Account must be at least 30 days old' : null
  }
}

/**
 * Generate secure password
 */
export const generateSecurePassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = uppercase + lowercase + numbers + symbols
  let password = ''

  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Format date for profile display
 */
export const formatProfileDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Get account age in days
 */
export const getAccountAge = (createdAt) => {
  if (!createdAt) return 0
  const age = Date.now() - new Date(createdAt).getTime()
  return Math.floor(age / (1000 * 60 * 60 * 24))
}

/**
 * Check if email is verified
 */
export const isEmailVerified = (user) => {
  return user?.emailVerified === true
}

/**
 * Get OAuth provider icon
 */
export const getOAuthProviderIcon = (provider) => {
  const icons = {
    google: '🔵',
    facebook: '🔷',
    github: '⚫',
    twitter: '🐦'
  }
  return icons[provider] || '🔗'
}

/**
 * Get OAuth provider name
 */
export const getOAuthProviderName = (provider) => {
  const names = {
    google: 'Google',
    facebook: 'Facebook',
    github: 'GitHub',
    twitter: 'Twitter'
  }
  return names[provider] || provider.charAt(0).toUpperCase() + provider.slice(1)
}
