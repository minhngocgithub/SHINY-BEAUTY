const User = require('../models/user.models')
const Address = require('../models/address.models')
const argon = require('argon2')
const sendMail = require('../utils/sendMail')
const crypto = require('crypto')
const { generateAccessToken, generateRefreshToken } = require('../utils/createToken')
const { uploadImageCloudinary, deleteImageFromCloudinary } = require('../utils/upload.service')
const OTP = require('../models/otp.models')
const fs = require('fs')

const register = async (req, res) => {
  const { name, email, password, otp } = req.body
  try {
    if (!name || !email || !password || !otp) {
      return res.status(400).json('Please fill in fields')
    }

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn' });
    }

    // Kiểm tra thời gian hết hạn (5 phút = 300000 milliseconds)
    const otpAge = Date.now() - new Date(otpRecord.createdAt).getTime();
    if (otpAge > 300000) { // 5 phút
      await OTP.deleteOne({ _id: otpRecord._id }); // Xóa OTP đã hết hạn
      return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn' });
    }

    const existingUser = await User.findOne({ email: email })
    if (existingUser) {
      return res.status(402).json('Email is registed')
    }
    const hashPassword = await argon.hash(password)
    otpRecord.verified = true;
    await otpRecord.save();

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      isOAuthUser: false
    })

    if (user) {
      await OTP.deleteMany({ email });
      return res.status(200).json({
        name: user.name,
        email: user.email,
        isOAuthUser: user.isOAuthUser
      })
    } else {
      return res.status(401).json('Invalid email or password register')
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json('Error')
  }
}

const login = async (req, res) => {
  const { email, password } = req.body
  try {
    if (!email || !password) return res.status(422).json({ 'message': 'Invalid field' })

    const user = await User.findOne({ email })
    if (user) {
      if (user.isOAuthUser) {
        return res.status(422).json('This account was created using OAuth. Please use OAuth login instead.')
      }

      const match = await argon.verify(user.password, password)
      if (match) {
        const { password, isAdmin, refreshToken, ...userData } = user.toObject()
        const accessToken = generateAccessToken(user._id, isAdmin)
        const newRefreshToken = generateRefreshToken(user._id)
        await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken }, { new: true })
        return res.status(200).json({
          sucess: true,
          _id: user.id,
          avatar: user.avatar,
          accessToken,
          newRefreshToken,
          userData,
          isAdmin,
          isOAuthUser: user.isOAuthUser
        })
      } else {
        return res.status(422).json('Email and Password not match.')
      }
    } else {
      return res.status(404).json('Not found this User.')
    }
  } catch (error) {
    return res.status(500).json('Unable login!')

  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      avatar: user.avatar,
      isOAuthUser: user.isOAuthUser,
      googleId: user.googleId,
      facebookId: user.facebookId,
      twitterId: user.twitterId,
      isAdmin: user.isAdmin,
      createAt: user.createAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

const logOut = async (req, res) => {
  try {
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    }

    res.clearCookie("accessToken", cookiesOption)
    res.clearCookie("refreshToken", cookiesOption)

    return res.json({
      message: "Logout successfully",
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) return res.status(422).json({ 'message': 'Email is not invalid!' }) // Check email

    const user = await User.findOne({ email }) // Find user by email    

    if (!user) return res.status(401).json({ 'message': 'Can not find this user' })
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false })
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`
    const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Please click the button below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <p><strong>Note:</strong> This link will expire in 15 minutes.</p>
                <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                <p>${resetUrl}</p>
            </div>
        `
    // Gửi email
    try {
      await sendMail({
        email: user.email,
        subject: "Reset Password",
        html: message
      });

      res.status(200).json({
        success: true,
        message: 'Email đặt lại mật khẩu đã được gửi'
      });

    } catch (error) {
      // Nếu gửi email thất bại, reset lại các trường token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại sau',
        error: error.message
      });
    }

  } catch (error) {
    return res.status(500).json(error)
  }
}

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.params.token || req.body.token;

    if (!password || !token) return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
    const hashedPassword = await argon.hash(password);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.log("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password',
      error: error.message
    });
  }
}
const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(422).json({
        success: false,
        message: 'Please fill in fields.'
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User existed.'
      })
    }

    if (user.isOAuthUser) {
      return res.status(422).json({
        success: false,
        message: 'Account logged in OAuth, cannot change password.'
      })
    }

    const isMatch = await argon.verify(user.password, currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password not correctly.'
      })
    }

    user.password = await argon.hash(newPassword)
    user.passwordChangedAt = Date.now()
    user.refreshToken = generateRefreshToken(user._id)

    await user.save()

    const accessToken = generateAccessToken(user._id, user.isAdmin)
    const { password, refreshToken, ...userData } = user.toObject()

    return res.status(200).json({
      success: true,
      message: 'Success.',
      accessToken,
      newRefreshToken: user.refreshToken,
      userData,
      isAdmin: user.isAdmin,
      isOAuthUser: user.isOAuthUser
    })
  } catch (error) {
    console.error('Change password error:', error)
    return res.status(500).json({
      success: false,
      message: 'Cannot change password.'
    })
  }
}
const updateMyInfo = async (req, res) => {
  try {
    if (req.user.isOAuthUser && req.body.email && req.body.email !== req.user.email) {
      return res.status(400).json({
        message: "OAuth users cannot change their email address",
        error: true,
        success: false
      });
    }

    const updateUser = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    })

    if (!updateUser) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    return res.status(200).json({
      message: "Updated successfully",
      error: false,
      success: true,
      data: updateUser,
      newAccessToken: generateAccessToken(updateUser._id, updateUser.isAdmin)
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      })
    }
    if (req.user.isOAuthUser) {
      return res.status(400).json({
        success: false,
        message: "OAuth users cannot change their avatar through this method",
      })
    }

    if (req.user.avatar && req.user.avatar.public_id) {
      await deleteImageFromCloudinary(req.user.avatar.public_id)
    }
    const uploadResult = await uploadImageCloudinary(req.file, "avatars")
    console.log(uploadResult);

    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
        },
      },
      { new: true },
    )
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: updatedUser.avatar,
    })
  } catch (error) {
    console.error("Lỗi upload avatar:", error)

    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi hệ thống",
    })
  }
}

const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId).select('isOAuthUser avatar')

    if (!user) {
      return res.status(404).json({ success: false, message: 'Not found user' })
    }

    if (user.isOAuthUser) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete avatar for OAuth users through this method',
      })
    }

    if (user.avatar?.public_id) {
      await deleteImageFromCloudinary(user.avatar.public_id)
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'avatar.public_id': null,
          'avatar.url': null
        }
      },
      { new: true }
    )

    return res.status(200).json({
      success: true,
      message: 'Successfully deleted avatar',
      avatar: updatedUser.avatar
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}

const handleOAuthLogin = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'OAuth authentication failed'
      });
    }

    const { password, refreshToken, ...userData } = user.toObject();
    const accessToken = generateAccessToken(user._id, user.isAdmin);
    const newRefreshToken = generateRefreshToken(user._id);

    // Cập nhật refresh token
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken }, { new: true });

    return res.status(200).json({
      success: true,
      _id: user._id,
      avatar: user.avatar,
      accessToken,
      newRefreshToken,
      userData,
      isAdmin: user.isAdmin,
      isOAuthUser: user.isOAuthUser
    });
  } catch (error) {
    console.error('OAuth login error:', error);
    return res.status(500).json({
      success: false,
      message: 'OAuth login failed'
    });
  }
};
const getOAuthUrls = async (req, res) => {
  try {
    const oauthUrls = {
      google: process.env.GOOGLE_OAUTH_URL || null,
      facebook: process.env.FACEBOOK_OAUTH_URL || null,
      twitter: process.env.TWITTER_OAUTH_URL || null
    }
    const missingProviders = Object.entries(oauthUrls)
      .filter(([_, url]) => !url)
      .map(([provider]) => provider)

    if (missingProviders.length > 0) {
      console.warn(` Missing OAuth URLs for: ${missingProviders.join(', ')}`)
    }

    return res.status(200).json({
      success: true,
      oauthUrls
    })
  } catch (error) {
    console.error('Get OAuth URLs error:', error)
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách OAuth URLs',
      error: error.message
    })
  }
}
const linkOAuthAccount = async (req, res) => {
  try {
    const { platform, id } = req.body
    const userId = req.user._id

    if (!platform || !id) {
      return res.status(400).json({ success: false, message: 'Missing platform or ID' })
    }

    let idField
    switch (platform.toLowerCase()) {
      case 'google':
        idField = 'googleId'
        break
      case 'facebook':
        idField = 'facebookId'
        break
      case 'twitter':
        idField = 'twitterId'
        break
      default:
        return res.status(400).json({ success: false, message: 'Invalid OAuth platform' })
    }

    const existingUser = await User.findOne({ [idField]: id })
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(400).json({ success: false, message: 'Account is already linked to another user' })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { [idField]: id },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: `${platform} account linked successfully`,
      user: updatedUser.toObject()
    })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to link OAuth account' })
  }
}
const unlinkOAuthAccount = async (req, res) => {
  try {
    const { platform } = req.body
    const userId = req.user._id

    if (!platform) {
      return res.status(400).json({ success: false, message: 'Missing platform' })
    }

    let idField
    switch (platform.toLowerCase()) {
      case 'google':
        idField = 'googleId'
        break
      case 'facebook':
        idField = 'facebookId'
        break
      case 'twitter':
        idField = 'twitterId'
        break
      default:
        return res.status(400).json({ success: false, message: 'Invalid OAuth platform' })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { [idField]: null } },
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: `${platform} account unlinked successfully`,
      user: updatedUser.toObject()
    })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to unlink OAuth account' })
  }
}

// ============ ADDRESS MANAGEMENT ============
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

// ============ USER STATS ============
const getUserStats = async (req, res) => {
  try {
    const Order = require('../models/order.models')
    const Review = require('../models/review.models')

    const userId = req.user._id

    // Get order stats
    const orderStats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
          averageOrderValue: { $avg: "$totalPrice" },
          lastOrderDate: { $max: "$createdAt" }
        }
      }
    ])
    const reviewStats = await Review.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" }
        }
      }
    ])
    const user = await User.findById(userId).select('wishlistItems')
    const wishlistCount = user?.wishlistItems?.length || 0

    const stats = {
      totalOrders: orderStats[0]?.totalOrders || 0,
      totalSpent: orderStats[0]?.totalSpent || 0,
      averageOrderValue: orderStats[0]?.averageOrderValue || 0,
      totalReviews: reviewStats[0]?.totalReviews || 0,
      averageRating: reviewStats[0]?.averageRating || 0,
      wishlistCount,
      lastOrderDate: orderStats[0]?.lastOrderDate || null,
      memberSince: req.user.createAt || req.user.createdAt
    }

    res.status(200).json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    })
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateMyInfo,
  logOut,
  forgotPassword,
  resetPassword,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  handleOAuthLogin,
  getOAuthUrls,
  linkOAuthAccount,
  unlinkOAuthAccount,
  // Address Management
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  // User Stats
  getUserStats
}