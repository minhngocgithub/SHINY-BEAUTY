const Product = require('../../models/product.models')

function registerFeaturedHandlers(io, socket) {
  // User views a featured product
  socket.on('featured:view', async ({ productId }) => {
    if (!productId) return
    try {
      const product = await Product.findById(productId)
      if (!product || !product.featured) return

      // Update both old fields and new metrics
      product.featuredViews = (product.featuredViews || 0) + 1

      if (!product.featuredMetrics) {
        product.featuredMetrics = { views: 0, clicks: 0, conversions: 0, ctr: 0, conversionRate: 0 }
      }
      product.featuredMetrics.views = (product.featuredMetrics.views || 0) + 1

      // Recalculate CTR
      const views = product.featuredMetrics.views
      const clicks = product.featuredMetrics.clicks || 0
      if (views > 0) {
        product.featuredMetrics.ctr = parseFloat(((clicks / views) * 100).toFixed(2))
      }

      await product.save()

      // Emit update with full metrics
      io.emit('featured:update', {
        productId,
        featuredViews: product.featuredViews,
        featuredClicks: product.featuredClicks,
        metrics: {
          views: product.featuredMetrics.views,
          clicks: product.featuredMetrics.clicks,
          conversions: product.featuredMetrics.conversions,
          ctr: product.featuredMetrics.ctr,
          conversionRate: product.featuredMetrics.conversionRate
        }
      })
    } catch (err) {
      console.error('Socket featured:view error:', err)
    }
  })

  // User clicks a featured product
  socket.on('featured:click', async ({ productId }) => {
    if (!productId) return
    try {
      const product = await Product.findById(productId)
      if (!product || !product.featured) return

      // Update both old fields and new metrics
      product.featuredClicks = (product.featuredClicks || 0) + 1

      if (!product.featuredMetrics) {
        product.featuredMetrics = { views: 0, clicks: 0, conversions: 0, ctr: 0, conversionRate: 0 }
      }
      product.featuredMetrics.clicks = (product.featuredMetrics.clicks || 0) + 1

      // Recalculate CTR
      const views = product.featuredMetrics.views || product.featuredViews || 0
      const clicks = product.featuredMetrics.clicks
      if (views > 0) {
        product.featuredMetrics.ctr = parseFloat(((clicks / views) * 100).toFixed(2))
      }

      await product.save()

      // Emit update with full metrics
      io.emit('featured:update', {
        productId,
        featuredViews: product.featuredViews,
        featuredClicks: product.featuredClicks,
        metrics: {
          views: product.featuredMetrics.views,
          clicks: product.featuredMetrics.clicks,
          conversions: product.featuredMetrics.conversions,
          ctr: product.featuredMetrics.ctr,
          conversionRate: product.featuredMetrics.conversionRate
        }
      })
    } catch (err) {
      console.error('Socket featured:click error:', err)
    }
  })
}

module.exports = { registerFeaturedHandlers }
