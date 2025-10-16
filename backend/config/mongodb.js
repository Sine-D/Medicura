import mongoose from "mongoose"

const connectDB = async () => {
    try {
        // Connection event listeners
        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully')
            console.log(`📊 Database: ${mongoose.connection.db.databaseName}`)
            console.log(`🌐 Host: ${mongoose.connection.host}`)
        })

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err)
        })

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected')
        })

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close()
            console.log('🔌 MongoDB connection closed through app termination')
            process.exit(0)
        })

        // Check for required environment variables
        const uri = process.env.MONGODB_URI
        if (!uri) {
            throw new Error('❌ MONGODB_URI is not set in environment variables')
        }

        console.log('🔄 Connecting to MongoDB...')
        
        // Enhanced connection options (compatible with all MongoDB versions)
        const options = {
            dbName: process.env.MONGODB_DB || 'medicura',
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            retryWrites: true,
            w: 'majority',
            // Additional options for local MongoDB
            useNewUrlParser: true,
            useUnifiedTopology: true
        }

        await mongoose.connect(uri, options)
        
        // Verify connection
        if (mongoose.connection.readyState === 1) {
            console.log('✅ MongoDB connection verified and ready')
        } else {
            throw new Error('❌ MongoDB connection not established properly')
        }

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message)
        console.error('💡 Please check:')
        console.error('   - MONGODB_URI is correctly set in .env file')
        console.error('   - MongoDB Atlas cluster is running')
        console.error('   - IP address is whitelisted in MongoDB Atlas')
        console.error('   - Database credentials are correct')
        process.exit(1)
    }
}

// Connection health check function
export const checkConnection = () => {
    const state = mongoose.connection.readyState
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    }
    return {
        state: states[state],
        isConnected: state === 1
    }
}

export default connectDB