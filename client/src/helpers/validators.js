export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-+$$$$]{10,}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export const validateZipCode = (zipCode) => {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

export const validateShippingAddress = (address) => {
  const errors = []

  if (!address.name || address.name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters")
  }

  if (!address.phone || !validatePhone(address.phone)) {
    errors.push("Please enter a valid phone number")
  }

  if (!address.email || !validateEmail(address.email)) {
    errors.push("Please enter a valid email address")
  }

  if (!address.address || address.address.trim().length < 5) {
    errors.push("Street address must be at least 5 characters")
  }

  if (!address.city || address.city.trim().length < 2) {
    errors.push("City must be at least 2 characters")
  }

  if (!address.state || address.state.trim().length < 2) {
    errors.push("State must be at least 2 characters")
  }

  if (!address.zipCode || !validateZipCode(address.zipCode)) {
    errors.push("Please enter a valid zip code")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const validateProductQuantity = (product, quantity) => {
  if (!product) {
    return { valid: false, message: "Product not found" }
  }

  if (quantity < 1) {
    return { valid: false, message: "Quantity must be at least 1" }
  }

  if (product.countInstock <= 0) {
    return { valid: false, message: "Product is out of stock" }
  }

  if (quantity > product.countInstock) {
    return { valid: false, message: `Only ${product.countInstock} items available` }
  }

  // Check flash sale limits
  if (product.flashSale?.isFlashSale && product.flashSale?.maxQuantityPerUser) {
    if (quantity > product.flashSale.maxQuantityPerUser) {
      return {
        valid: false,
        message: `Maximum ${product.flashSale.maxQuantityPerUser} items per customer for this flash sale`,
      }
    }
  }

  // Check order limit
  if (quantity > 10) {
    return { valid: false, message: "Maximum 10 items per order" }
  }

  return { valid: true, message: "Valid quantity" }
}

export const validateCartItem = (item) => {
  if (!item) {
    return { valid: false, message: "Invalid cart item" }
  }

  const product = item.product || item.bundle
  if (!product) {
    return { valid: false, message: "Product data missing" }
  }

  if (!item.quantity || item.quantity < 1) {
    return { valid: false, message: "Invalid quantity" }
  }

  return { valid: true, message: "Valid cart item" }
}

export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }

  return { valid: true, message: "Valid password" }
}

export const validateLoginForm = (email, password) => {
  const errors = {}

  if (!email || !validateEmail(email)) {
    errors.email = "Please enter a valid email address"
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateRegisterForm = (data) => {
  const errors = {}

  if (!data.email || !validateEmail(data.email)) {
    errors.email = "Please enter a valid email address"
  }

  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
