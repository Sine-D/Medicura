import express from 'express'
import cors from 'cors'
import path from 'path'
import 'dotenv/config'
import crypto from 'crypto'
import connectDB, { checkConnection } from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'

// Import existing routes
import adminRouter from './routes/adminRoute.js'
import authRouter from './routes/authRoute.js'
import userRouter from './routes/userRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import inventoryRoutes from "./routes/inventory.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import inventoryRequestRoutes from "./routes/inventory.request.routes.js"
import clientRoutes from "./routes/client.routes.js"
import inventoryInvoiceRoutes from "./routes/inventoryInvoice.routes.js"

// Import routes from app.js (convert to ES6 exports in your route files)
import invoiceRoutes from "./routes/invoiceRoutes.js"
import expenseRoutes from "./routes/expenseRoutes.js"
import employeePaymentRoutes from "./routes/employeePaymentRoutes.js"
import payhereRoutes from "./routes/payhereRoutes.js"

// App config
const app = express()
const port = process.env.PORT || 4000

// Initialize database connection
connectDB()
connectCloudinary()

// Middlewares
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) // Required for PayHere form data
app.use(cors())

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// API endpoints - Main project routes
app.use('/api/admin', adminRouter)
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/doctors', doctorRouter)

// Inventory management routes
app.use("/api/inventory", inventoryRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/inventory-requests", inventoryRequestRoutes)
app.use("/api/inventory-invoices", inventoryInvoiceRoutes)
app.use("/api/clients", clientRoutes)

// Financial management routes (from app.js)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/employee-payments", employeePaymentRoutes)
app.use("/api/payhere-routes", payhereRoutes)

// PayHere payment endpoints
app.post('/api/payhere/order', (req, res) => {
    try {
        const { order_id, items, currency, amount, first_name, last_name, email, phone, address, city, country } = req.body || {}
        
        if (!order_id || !items || !currency || !amount) {
            return res.status(400).json({ error: 'Missing required payment fields' })
        }
        
        const merchant_id = process.env.PAYHERE_MERCHANT_ID || '1232089'
        const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET || 'MTExNjEyNjQxNjE4MjM0MzE3NTIxODc4NTM5MDg3Mzc5MDA0NTg2NA=='
        const amountFixed = Number(amount).toFixed(2)
        const secret_md5 = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase()
        const cur = (currency || 'USD')
        const hash_string = merchant_id + order_id + amountFixed + cur + secret_md5
        const hash = crypto.createHash('md5').update(hash_string).digest('hex').toUpperCase()

        const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173'
        
        return res.json({
            merchant_id,
            return_url: `${origin}/success`,
            cancel_url: `${origin}/cancel`,
            notify_url: `${req.protocol}://${req.get('host')}/api/payhere/notify`,
            order_id,
            items,
            currency: cur,
            amount: amountFixed,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            country,
            hash
        })
    } catch (err) {
        console.error('PayHere order error:', err)
        return res.status(500).json({ error: err.message })
    }
})

app.post('/api/payhere/notify', (req, res) => {
    console.log('PayHere Notify Data:', req.body)
    // Add your payment verification logic here
    res.sendStatus(200)
})

// Health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = checkConnection()
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    })
})

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'MediCura API is running!',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            admin: '/api/admin',
            auth: '/api/auth',
            user: '/api/user',
            doctors: '/api/doctors',
            inventory: '/api/inventory',
            cart: '/api/cart',
            inventoryRequests: '/api/inventory-requests',
            inventoryInvoices: '/api/inventory-invoices',
            clients: '/api/clients',
            invoices: '/api/invoices',
            expenses: '/api/expenses',
            employeePayments: '/api/employee-payments',
            payhere: '/api/payhere'
        }
    })
})

// Catch undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found',
        path: req.originalUrl 
    })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err)
    process.exit(1)
})

// Start server
app.listen(port, () => {
    console.log('🚀 Server started on port', port)
    console.log(`📊 API Base: http://localhost:${port}`)
    console.log(`💊 Invoices: http://localhost:${port}/api/invoices`)
    console.log(`💸 Expenses: http://localhost:${port}/api/expenses`)
    console.log(`💰 Employee Payments: http://localhost:${port}/api/employee-payments`)
    console.log(`💳 PayHere: http://localhost:${port}/api/payhere`)
    console.log(`🏥 Health Check: http://localhost:${port}/health`)
})