/**
 * Location Service - Get user's current location and convert to address
 */

// ==================== GET CURRENT POSITION ====================
export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                })
            },
            (error) => {
                let message = 'Unable to get your location'
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied. Please allow location access in your browser settings.'
                        break
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information is unavailable.'
                        break
                    case error.TIMEOUT:
                        message = 'Location request timed out.'
                        break
                }
                reject(new Error(message))
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    })
}

export const reverseGeocode = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'vi'
                }
            }
        )

        if (!response.ok) {
            throw new Error('Failed to fetch address')
        }

        const data = await response.json()

        return {
            fullAddress: data.display_name,
            street: data.address.road || data.address.street || '',
            ward: data.address.suburb || data.address.neighbourhood || '',
            district: data.address.city_district || data.address.district || data.address.county || '',
            city: data.address.city || data.address.town || data.address.state || '',
            country: data.address.country || 'Vietnam',
            postalCode: data.address.postcode || '',
            raw: data.address
        }
    } catch (error) {
        console.error('Reverse geocode error:', error)
        throw new Error('Failed to convert location to address')
    }
}

/**
 * Alternative: Use Google Maps Geocoding API (requires API key)
 * Uncomment this if you have Google Maps API key
 */
export const reverseGeocodeGoogle = async (latitude, longitude, apiKey) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=vi`
        )

        if (!response.ok) {
            throw new Error('Failed to fetch address from Google Maps')
        }

        const data = await response.json()

        if (data.status !== 'OK' || !data.results[0]) {
            throw new Error('No address found')
        }

        const result = data.results[0]
        const addressComponents = result.address_components

        const getComponent = (types) => {
            const component = addressComponents.find(c =>
                types.some(type => c.types.includes(type))
            )
            return component?.long_name || ''
        }

        return {
            fullAddress: result.formatted_address,
            street: getComponent(['route', 'street_address']),
            ward: getComponent(['sublocality_level_1', 'sublocality']),
            district: getComponent(['administrative_area_level_2', 'locality']),
            city: getComponent(['administrative_area_level_1', 'administrative_area']),
            country: getComponent(['country']),
            postalCode: getComponent(['postal_code']),
            raw: result
        }
    } catch (error) {
        console.error('Google reverse geocode error:', error)
        throw new Error('Failed to convert location to address')
    }
}

// ==================== GET CURRENT LOCATION WITH ADDRESS ====================
export const getCurrentLocationWithAddress = async (useGoogle = false, googleApiKey = '') => {
    try {
        // Step 1: Get coordinates
        const position = await getCurrentPosition()

        // Step 2: Convert to address
        let address
        if (useGoogle && googleApiKey) {
            address = await reverseGeocodeGoogle(position.latitude, position.longitude, googleApiKey)
        } else {
            address = await reverseGeocode(position.latitude, position.longitude)
        }

        return {
            position,
            address
        }
    } catch (error) {
        throw error
    }
}

// ==================== CHECK LOCATION PERMISSION ====================
export const checkLocationPermission = async () => {
    if (!navigator.permissions) {
        return 'unknown'
    }

    try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        return result.state // 'granted', 'denied', or 'prompt'
    } catch (error) {
        return 'unknown'
    }
}

// ==================== FORMAT ADDRESS FOR DISPLAY ====================
export const formatAddressForDisplay = (address) => {
    const parts = [
        address.street,
        address.ward,
        address.district,
        address.city,
        address.country
    ].filter(Boolean)

    return parts.join(', ')
}

// ==================== VIETNAM SPECIFIC ====================
/**
 * Get Vietnam provinces list
 */
export const getVietnamProvinces = () => {
    return [
        'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
        'An Giang', 'Bà Rịa-Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
        'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
        'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
        'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
        'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
        'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
        'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
        'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
        'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
        'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
        'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
        'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
    ]
}

/**
 * Detect if coordinates are in Vietnam
 */
export const isInVietnam = (latitude, longitude) => {
    // Vietnam boundaries (approximate)
    const vietnamBounds = {
        north: 23.393395,
        south: 8.559611,
        east: 109.464638,
        west: 102.144444
    }

    return (
        latitude >= vietnamBounds.south &&
        latitude <= vietnamBounds.north &&
        longitude >= vietnamBounds.west &&
        longitude <= vietnamBounds.east
    )
}
