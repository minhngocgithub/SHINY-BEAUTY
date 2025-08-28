const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const session = require('express-session')
dotenv.config()

// Import Passport configuration
const passport = require('./config/passport')

const app = express()
const authsRouter = require('../api/routers/authsRouter')
const otpRouter = require('../api/routers/otpRouter')
const adminRouter = require('../api/routers/adminRouter')
const productRouter = require('../api/routers/productRouter')
const orderRouter = require('../api/routers/orderRouter')
const couponRouter = require('../api/routers/couponRouter')
const paymentRouter = require('../api/routers/paymentRouter')
const analyticRouter = require('../api/routers/analyticRouter')
const categoryRouter = require('../api/routers/categoryRouter')
const subCategoryRouter = require('../api/routers/subCategoryRouter')
const oauthRouter = require('../api/routers/oauthRouter')
const Product = require('./models/product.models')
const cron = require('node-cron')


// CONNECT DB
const connectDB = async () => {
    try {
        await mongoose.connect((process.env.CONNECT_DB_URL),
        { 
            
        })
        console.log('Mongoose DB connected')

    } catch(error) {
        console.log(error.message)
        process.exit(1)
    }
}
connectDB()


// USE
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}));

app.use(cookieParser())
app.use(bodyParser.json({limit:"50MB"}))
app.use(express.urlencoded({ extended: true }))

// Session configuration for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/users', authsRouter)
app.use('/api/v1/otp', otpRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/product', productRouter)
app.use('/api/v1/order', orderRouter)
app.use('/api/v1/coupon', couponRouter)
app.use('/api/v1/payment', paymentRouter)
app.use('/api/v1/analytic', analyticRouter)
app.use('/api/v1/category', categoryRouter)
app.use('/api/v1/subCategory', subCategoryRouter)
app.use('/api/v1/auth/oauth', oauthRouter)
app.use(express.json())
app.get('/test', (req, res) => {
    res.json('test ok')
})

// Background job: mark products older than 15 days as not new
cron.schedule('0 * * * *', async () => {
    const now = new Date()
    try {
        await Product.updateMany(
            {
                isNewProduct: true,
                $or: [
                    { newUntil: { $lte: now } },
                    { newUntil: { $exists: false } },
                ],
            },
            { $set: { isNewProduct: false } }
        )
    } catch (err) {
        console.error('Cron: failed to update isNewProduct flags', err.message)
    }
})

// LISTEN
const PORT = 4000
app.listen(PORT, () => {
    console.log(`Server is starting at PORT: ${PORT}`)
})