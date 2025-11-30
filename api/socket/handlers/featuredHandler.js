const Product = require('../../models/product.models')

function registerFeaturedHandlers(io, socket) {
  // User views a featured product
  socket.on('featured:view', async ({ productId }) => {
    if (!productId) return
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { featuredViews: 1 } },
        { new: true }
      )
      if (product) {
        io.emit('featured:update', {
          productId,
          featuredViews: product.featuredViews,
          featuredClicks: product.featuredClicks,
        })
      }
    } catch (err) {
      console.error('Socket featured:view error:', err)
    }
  })

  // User clicks a featured product
  socket.on('featured:click', async ({ productId }) => {
    if (!productId) return
    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { featuredClicks: 1 } },
        { new: true }
      )
      if (product) {
        io.emit('featured:update', {
          productId,
          featuredViews: product.featuredViews,
          featuredClicks: product.featuredClicks,
        })
      }
    } catch (err) {
      console.error('Socket featured:click error:', err)
    }
  })
}

module.exports = { registerFeaturedHandlers }
