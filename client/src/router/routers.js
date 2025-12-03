import { createRouter, createWebHistory } from "vue-router"

// Layouts
import defaultLayout from "../components/layouts/defaultLayout.vue"
import dashboardLayout from "../components/layouts/dashboardLayout.vue"

// Views - Home & Main
import HomeView from "../views/HomeView.vue"
import ShopView from "../views/ShopView.vue"
import SearchView from "../views/SearchView.vue"
import CategoryProductsView from "../views/category/CategoryProductsView.vue"
import NotFound404 from "../views/NotFound404.vue"

// Views - Auth
import Login from "../views/auth/Login.vue"
import Register from "../views/auth/Register.vue"
import ForgotPassword from "../views/auth/ForgotPassword.vue"
import ResetPassword from "../views/auth/ResetPassword.vue"
import OAuthCallback from "../views/auth/OAuthCallback.vue"

// Views - Products
import ProductDetail from "../views/product-page/ProductDetail.vue"
import FeaturedView from "../views/product-page/FeaturedView.vue"
import SaleProgramProducts from "../views/product-page/SaleProgramProducts.vue"
import WishListProducts from "../views/product-page/WishListProducts.vue"

// Views - Cart & Orders
import CartView from "../views/cart/CartView.vue"
import CheckoutView from "../views/checkout/CheckoutView.vue"
import OrdersView from "../views/order/OrdersView.vue"
import OrderDetailView from "../views/order/OrderDetailView.vue"
import CheckoutPayment from '../views/checkout/CheckoutPayment.vue'

// Views - Admin
import AdminView from "../views/admin/AdminView.vue"

// Views - User Profile
import UserProfile from "../views/auth/UserProfile.vue"
import SettingTab from "../components/profile/SettingTab.vue"
import ShopProfile from "../components/profile/ShopProfile.vue"

import Test from "../components/Test.vue"
const routes = [
  // ============ PUBLIC ROUTES ============
  {
    path: "/",
    name: "Home",
    component: HomeView,
    meta: {
      layout: defaultLayout,
      title: "SHINY BEAUTY - Premium Cosmetics & Beauty Products",
      description: "Shop the best beauty products, makeup, skincare, haircare and more at SHINY BEAUTY",
      breadcrumb: "Home",
      requiresAuth: false,
    },
  },

  // ============ AUTHENTICATION ROUTES ============
  {
    path: "/auth",
    children: [
      {
        path: "login",
        name: "Login",
        component: Login,
        meta: {
          title: "Login - SHINY BEAUTY",
          description: "Sign in to your SHINY BEAUTY account",
          requiresAuth: false,
        },
      },
      {
        path: "register",
        name: "Register",
        component: Register,
        meta: {
          title: "Create Account - SHINY BEAUTY",
          description: "Join SHINY BEAUTY and start shopping",
          requiresAuth: false,
        },
      },
      {
        path: "forgot-password",
        name: "ForgotPassword",
        component: ForgotPassword,
        meta: {
          title: "Forgot Password - SHINY BEAUTY",
          description: "Reset your SHINY BEAUTY password",
          requiresAuth: false,
        },
      },
      {
        path: "reset-password/:token",
        name: "ResetPassword",
        component: ResetPassword,
        meta: {
          title: "Reset Password - SHINY BEAUTY",
          description: "Create a new password for your account",
          requiresAuth: false,
        },
      },
      {
        path: "oauth-callback",
        name: "OAuthCallback",
        component: OAuthCallback,
        meta: {
          title: "OAuth Callback - SHINY BEAUTY",
          requiresAuth: false,
        },
      },
    ],
  },

  // ============ PRODUCT ROUTES ============
  {
    path: "/products",
    children: [
      {
        path: ":id",
        name: "ProductDetail",
        component: ProductDetail,
        meta: {
          title: "Product Details - SHINY BEAUTY",
          description: "View product details and reviews",
          requiresAuth: false,
        },
      },
    ],
  },
  // ============ SHOP ROUTES ============
  {
    path: "/shop",
    children: [
      {
        path: "",
        name: "Shop",
        component: ShopView,
        meta: {
          title: "Shop Beauty Products - SHINY BEAUTY | Premium Cosmetics",
          description: "Explore our curated beauty collections: featured products, flash sales, skincare, makeup and more. Free shipping on orders over $50. 100% authentic products.",
          breadcrumb: "Shop",
          requiresAuth: false,
        },
      },
      {
        path: "search",
        name: "search",
        component: SearchView,
        meta: {
          layout: defaultLayout,
          title: "Search Products - SHINY BEAUTY",
          description: "Search for beauty products, makeup, skincare and more",
          breadcrumb: "Search",
          requiresAuth: false,
        },
      },
      {
        path: "featured",
        name: "FeaturedView",
        component: FeaturedView,
        meta: {
          title: "Featured Products - SHINY BEAUTY",
          description: "Discover our featured beauty products",
          breadcrumb: "Featured",
          requiresAuth: false,
        },
      },
      {
        path: "wishlist",
        name: "Wishlist",
        component: WishListProducts,
        meta: {
          title: "My Wishlist - SHINY BEAUTY",
          description: "View your saved wishlist items",
          breadcrumb: "Wishlist",
          requiresAuth: true,
        },
      },
      // Multi-level category routes (must come after static routes)
      {
        path: ":level1",
        name: "CategoryLevel1",
        component: CategoryProductsView,
        meta: {
          title: "Shop Products - SHINY BEAUTY",
          description: "Browse products by category",
          breadcrumb: "Category",
          requiresAuth: false,
        },
      },
      {
        path: ":level1/:level2",
        name: "CategoryLevel2",
        component: CategoryProductsView,
        meta: {
          title: "Shop Products - SHINY BEAUTY",
          description: "Browse products by category",
          breadcrumb: "Category",
          requiresAuth: false,
        },
      },
      {
        path: ":level1/:level2/:level3",
        name: "CategoryLevel3",
        component: CategoryProductsView,
        meta: {
          title: "Shop Products - SHINY BEAUTY",
          description: "Browse products by category",
          breadcrumb: "Category",
          requiresAuth: false,
        },
      },
    ],
  },

  // ============ SALE PROGRAMS ROUTES ============
  {
    path: "/sale-programs",
    children: [
      {
        path: "",
        name: "SaleProgram",
        component: () => import("../views/product-page/SaleProgramView.vue"),
        meta: {
          title: "All Sale Programs - SHINY BEAUTY",
          description: "Browse all active sale programs and promotions",
          breadcrumb: "Sale Programs",
          requiresAuth: false,
        },
      },
      {
        path: ":id/products",
        name: "SaleProgramProducts",
        component: SaleProgramProducts,
        meta: {
          title: "Sale Program Products - SHINY BEAUTY",
          description: "View products in this sale program",
          breadcrumb: "Products",
          requiresAuth: false,
        },
      },
    ],
  },

  // ============ CHECKOUT ROUTES ============
  {
    path: "/cart",
    name: "Cart",
    component: CartView,
    meta: {
      layout: defaultLayout,
      title: "Shopping Cart - SHINY BEAUTY",
      description: "View and manage your cart items",
      breadcrumb: "Cart",
      requiresAuth: false,
    },
  },
  {
    path: "/checkout",
    children: [
      {
        path: "",
        name: "Checkout",
        component: CheckoutView,
        meta: {
          layout: defaultLayout,
          title: "Checkout - SHINY BEAUTY",
          description: "Complete your purchase",
          breadcrumb: "Checkout",
          requiresAuth: true,
        },
      },
      {
        path: "payment",
        name: "CheckoutPayment",
        component: CheckoutPayment,
        meta: {
          title: "Checkout - SHINY BEAUTY",
          description: "Complete your purchase",
          requiresAuth: true,
        },
      },
    ],
  },

  // ============ ORDERS ROUTES ============
  {
    path: "/orders",
    children: [
      {
        path: "",
        name: "Orders",
        component: OrdersView,
        meta: {
          layout: defaultLayout,
          title: "My Orders - SHINY BEAUTY",
          description: "View and track your orders",
          breadcrumb: "Orders",
          requiresAuth: true,
        },
      },
      {
        path: ":id",
        name: "OrderDetail",
        component: OrderDetailView,
        meta: {
          layout: defaultLayout,
          title: "Order Details - SHINY BEAUTY",
          description: "View order details and tracking",
          breadcrumb: "Order Details",
          requiresAuth: true,
        },
      },
      {
        path: ":id/track",
        name: "OrderTracking",
        component: () => import("../views/order/OrderTrackingView.vue"),
        meta: {
          layout: defaultLayout,
          title: "Track Order - SHINY BEAUTY",
          description: "Real-time order tracking with live map and shipper location",
          breadcrumb: "Track Order",
          requiresAuth: true,
        },
      },
    ],
  },

  // ============ USER PROFILE ROUTES ============
  {
    path: "/account",
    children: [
      {
        path: "profile",
        name: "UserProfile",
        component: UserProfile,
        meta: {
          title: "My Profile - SHINY BEAUTY",
          description: "Manage your account profile",
          requiresAuth: true,
        },
      },
      {
        path: "settings",
        name: "Settings",
        component: SettingTab,
        meta: {
          title: "Account Settings - SHINY BEAUTY",
          description: "Manage your account settings",
          requiresAuth: true,
        },
      },
      {
        path: "shop-profile",
        name: "ShopProfile",
        component: ShopProfile,
        meta: {
          title: "Shop Profile - SHINY BEAUTY",
          description: "View your shop profile",
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: "/admin",
    component: dashboardLayout,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: AdminView,
        meta: {
          title: "Admin Dashboard - SHINY BEAUTY",
          description: "Manage your store",
        },
      },
      {
        path: "products",
        name: "AdminProducts",
        component: () => import("../views/admin/AdminProductsView.vue"),
        meta: {
          title: "Products Management - SHINY BEAUTY",
          description: "Manage all products, stock, and pricing",
        },
      },

      {
        path: "orders",
        name: "AdminOrders",
        component: () => import("../views/admin/AdminOrdersView.vue"),
        meta: {
          title: "Order Management - SHINY BEAUTY",
          description: "Manage customer orders",
        },
      },
      {
        path: "bundles",
        name: "AdminBundles",
        component: () => import("../views/admin/AdminOrdersView.vue"),
        meta: {
          title: "Order Management - SHINY BEAUTY",
          description: "Manage customer orders",
        },
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("../views/admin/AdminUsersView.vue"),
        meta: {
          title: "Users Management - SHINY BEAUTY",
          description: "Manage customers and admin users",
        },
      },
      {
        path: "categories",
        name: "AdminCategories",
        component: () => import("../views/admin/AdminCategoriesView.vue"),
        meta: {
          title: "Categories Management - SHINY BEAUTY",
          description: "Manage product categories and subcategories",
        },
      },
      {
        path: "reviews",
        name: "AdminReviews",
        component: () => import("../views/admin/AdminReviewsView.vue"),
        meta: {
          title: "Reviews Management - SHINY BEAUTY",
          description: "Moderate product reviews and ratings",
        },
      },
      {
        path: "campaigns",
        name: "AdminCampaigns",
        component: () => import("../views/admin/AdminCampaignsView.vue"),
        meta: {
          title: "Campaign Management - SHINY BEAUTY",
          description: "Manage email campaigns and marketing",
        },
      },
      {
        path: "coupons",
        name: "AdminCoupons",
        component: () => import("../views/admin/AdminCouponsView.vue"),
        meta: {
          title: "Coupon Management - SHINY BEAUTY",
          description: "Manage discount coupons and promotions",
        },
      },
      {
        path: "sale-programs",
        name: "AdminSalePrograms",
        component: () => import("../views/admin/AdminSaleProgramsView.vue"),
        meta: {
          title: "Sale Programs Management - SHINY BEAUTY",
          description: "Manage sale programs and flash sales",
        },
      },
      {
        path: "loyalty",
        name: "AdminLoyalty",
        component: () => import("../views/admin/AdminLoyaltyView.vue"),
        meta: {
          title: "Loyalty Program - SHINY BEAUTY",
          description: "Manage customer loyalty rewards",
        },
      },
      {
        path: "inventory",
        name: "AdminInventory",
        component: () => import("../views/admin/AdminInventoryView.vue"),
        meta: {
          title: "Inventory Management - SHINY BEAUTY",
          description: "Manage stock levels and inventory",
        },
      },
      {
        path: "shipping",
        name: "AdminShipping",
        component: () => import("../views/admin/AdminShippingView.vue"),
        meta: {
          title: "Shipping Management - SHINY BEAUTY",
          description: "Manage shipping methods and rates",
        },
      },
      {
        path: "analytics",
        name: "AdminAnalytics",
        component: () => import("../views/admin/AdminAnalyticsView.vue"),
        meta: {
          title: "Analytics & Reports - SHINY BEAUTY",
          description: "View sales analytics and reports",
        },
      },
      {
        path: "support-tickets",
        name: "AdminSupportTickets",
        component: () => import("../views/admin/AdminSupportTicketsView.vue"),
        meta: {
          title: "Support Tickets - SHINY BEAUTY",
          description: "Manage customer support tickets",
        },
      },
      {
        path: "feedback",
        name: "AdminFeedback",
        component: () => import("../views/admin/AdminFeedbackView.vue"),
        meta: {
          title: "Customer Feedback - SHINY BEAUTY",
          description: "View and manage customer feedback",
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound404",
    component: NotFound404,
    meta: {
      title: "404 - Page Not Found",
      description: "The page you are looking for does not exist",
    },
  },
  {
    path: "/test",
    name: "Test",
    component: Test,
    meta: {
      title: "TEST Page",
      description: "The page you are looking for does not exist",
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: "smooth" }
    }
  },
})

router.beforeEach((to, from, next) => {
  const title = to.meta.title || "SHINY BEAUTY"
  const description = to.meta.description || "Premium Cosmetics & Beauty Products"

  document.title = title
  document.querySelector('meta[name="description"]')?.setAttribute("content", description)

  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin
  const isLoggedIn = !!localStorage.getItem("accessToken")

  // Get user info from localStorage (stored during login)
  const userInfo = localStorage.getItem("userInfo")
  const user = userInfo ? JSON.parse(userInfo) : null
  const isAdmin = user?.isAdmin || false

  if (requiresAuth && !isLoggedIn) {
    next({ name: "Login", query: { redirect: to.fullPath } })
  } else if (requiresAdmin && !isAdmin) {
    next({ name: "Home" })
  } else {
    next()
  }
})

export default router
