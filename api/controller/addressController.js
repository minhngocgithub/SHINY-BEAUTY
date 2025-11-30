const Address = require('../models/address.models')

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 })

    res.status(200).json({
      success: true,
      addresses
    })
  } catch (error) {
    console.error('Get addresses error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses'
    })
  }
}

// Add new address
const addUserAddress = async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      user: req.user._id
    }

    const address = new Address(addressData)
    await address.save()

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address
    })
  } catch (error) {
    console.error('Add address error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add address'
    })
  }
}

// Update address
const updateUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address
    })
  } catch (error) {
    console.error('Update address error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update address'
    })
  }
}

// Delete address
const deleteUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    const address = await Address.findOneAndDelete({
      _id: addressId,
      user: req.user._id
    })

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    })
  } catch (error) {
    console.error('Delete address error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    })
  }
}

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params
    
    // First, unset all default addresses for this user
    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    )

    // Then set the selected address as default
    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: req.user._id },
      { $set: { isDefault: true } },
      { new: true }
    )

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      address
    })
  } catch (error) {
    console.error('Set default address error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to set default address'
    })
  }
}

module.exports = {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress
}
