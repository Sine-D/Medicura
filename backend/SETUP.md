# MediCura Backend Setup Guide

## Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medicura?retryWrites=true&w=majority
MONGODB_DB=medicura

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure

# Admin Credentials
ADMIN_EMAIL=admin@medicura.com
ADMIN_PASSWORD=admin123456

# Accountant Credentials
ACCOUNTANT_EMAIL=accountant@medicura.com
ACCOUNTANT_PASSWORD=accountant123

# Cloudinary Configuration (for image uploads)
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_api_secret
```

## MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose "Build a Database"
   - Select "FREE" tier
   - Choose a region close to you
   - Create cluster

3. **Set Up Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Set privileges to "Read and write to any database"

4. **Set Up Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0) for development
   - For production, add your specific IP addresses

5. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `medicura`

## Cloudinary Setup (Optional)

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for a free account

2. **Get Credentials**
   - Go to Dashboard
   - Copy your Cloud Name, API Key, and API Secret
   - Add them to your `.env` file

## Installation & Running

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Test the API**
   - Visit `http://localhost:4000` for API info
   - Visit `http://localhost:4000/health` for health check

## Health Check Endpoints

- `GET /` - API information
- `GET /health` - Database connection status
- `POST /api/admin/add-doctor` - Add new doctor
- `POST /api/admin/login` - Admin login
- `POST /api/auth/login` - User login (Doctor, Lab Assistant, Supplier, Inventory Manager, Accountant)

## Troubleshooting

### Database Connection Issues
- Check if MONGODB_URI is correct
- Verify IP is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

### Cloudinary Issues
- Check if all Cloudinary credentials are set
- Verify API key and secret are correct
- Check if your Cloudinary account is active

### General Issues
- Make sure all environment variables are set
- Check console logs for detailed error messages
- Verify all dependencies are installed
