import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import doctorModel from '../models/doctorModel.js';
import labAssistantModel from '../models/labAssistantModel.js';
import supplierModel from '../models/supplierModel.js';
import inventoryManagerModel from '../models/inventoryManagerModel.js';

// Generic login function for all user types
const loginUser = async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        if (!email || !password || !userType) {
            return res.json({ success: false, message: "Missing credentials" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // Check credentials for each user type
        let user = null;
        let userName = '';
        let userId = '';

        switch (userType) {
            case 'admin':
                // Check admin credentials from environment variables
                if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                    user = { 
                        _id: 'admin_001',
                        name: 'Admin User',
                        email: email
                    };
                    userName = 'Admin User';
                    userId = 'admin_001';
                }
                break;

            case 'doctor':
                // First check environment variables for predefined doctor
                if (email === process.env.DOCTOR_EMAIL && password === process.env.DOCTOR_PASSWORD) {
                    user = { 
                        _id: 'doctor_001',
                        name: 'Dr. Smith',
                        email: email
                    };
                    userName = 'Dr. Smith';
                    userId = 'doctor_001';
                } else {
                    // Check database for other doctors
                    user = await doctorModel.findOne({ email });
                    if (user) {
                        const isPasswordValid = await bcrypt.compare(password, user.password);
                        if (isPasswordValid) {
                            userName = user.name;
                            userId = user._id;
                        } else {
                            user = null;
                        }
                    }
                }
                break;

            case 'labAssistant':
                // First check environment variables for predefined lab assistant
                if (email === process.env.LAB_EMAIL && password === process.env.LAB_PASSWORD) {
                    user = { 
                        _id: 'lab_001',
                        name: 'Lab Assistant John',
                        email: email
                    };
                    userName = 'Lab Assistant John';
                    userId = 'lab_001';
                } else {
                    // Check database for other lab assistants
                    user = await labAssistantModel.findOne({ email });
                    if (user) {
                        const isPasswordValid = await bcrypt.compare(password, user.password);
                        if (isPasswordValid) {
                            userName = user.name;
                            userId = user._id;
                        } else {
                            user = null;
                        }
                    }
                }
                break;

            case 'supplier':
                // First check environment variables for predefined supplier
                if (email === process.env.SUPPLIER_EMAIL && password === process.env.SUPPLIER_PASSWORD) {
                    user = { 
                        _id: 'supplier_001',
                        name: 'Supplier Mike',
                        email: email
                    };
                    userName = 'Supplier Mike';
                    userId = 'supplier_001';
                } else {
                    // Check database for other suppliers
                    user = await supplierModel.findOne({ email });
                    if (user) {
                        const isPasswordValid = await bcrypt.compare(password, user.password);
                        if (isPasswordValid) {
                            userName = user.name;
                            userId = user._id;
                        } else {
                            user = null;
                        }
                    }
                }
                break;

            case 'inventoryManager':
                // First check environment variables for predefined inventory manager
                if (email === process.env.INVENTORY_EMAIL && password === process.env.INVENTORY_PASSWORD) {
                    user = { 
                        _id: 'inventory_001',
                        name: 'Inventory Manager Sarah',
                        email: email
                    };
                    userName = 'Inventory Manager Sarah';
                    userId = 'inventory_001';
                } else {
                    // Check database for other inventory managers
                    user = await inventoryManagerModel.findOne({ email });
                    if (user) {
                        const isPasswordValid = await bcrypt.compare(password, user.password);
                        if (isPasswordValid) {
                            userName = user.name;
                            userId = user._id;
                        } else {
                            user = null;
                        }
                    }
                }
                break;

            case 'accountant':
                // Check accountant credentials from environment variables
                if (email === process.env.ACCOUNTANT_EMAIL && password === process.env.ACCOUNTANT_PASSWORD) {
                    user = { 
                        _id: 'accountant_001',
                        name: 'John Accountant',
                        email: email
                    };
                    userName = 'John Accountant';
                    userId = 'accountant_001';
                }
                break;

            default:
                return res.json({ success: false, message: "Invalid user type" });
        }

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: userId,
                email: email, 
                userType: userType,
                name: userName 
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            success: true, 
            token,
            user: {
                id: userId,
                name: userName,
                email: email,
                userType: userType
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Register function for all user types
const registerUser = async (req, res) => {
    try {
        const { name, email, password, userType, ...additionalData } = req.body;

        if (!name || !email || !password || !userType) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Prevent registration for predefined roles with environment emails
        const predefinedEmails = [
            process.env.ADMIN_EMAIL,
            process.env.DOCTOR_EMAIL,
            process.env.LAB_EMAIL,
            process.env.SUPPLIER_EMAIL,
            process.env.INVENTORY_EMAIL,
            process.env.ACCOUNTANT_EMAIL
        ];

        if (predefinedEmails.includes(email)) {
            return res.json({ 
                success: false, 
                message: "This email is reserved for a predefined system user." 
            });
        }

        let model;
        let userData;

        // Select the appropriate model and prepare data based on user type
        switch (userType) {
            case 'doctor':
                model = doctorModel;
                userData = {
                    name,
                    email,
                    password: await bcrypt.hash(password, 10),
                    speciality: additionalData.speciality || '',
                    degree: additionalData.degree || '',
                    experience: additionalData.experience || '',
                    about: additionalData.about || '',
                    available: additionalData.available !== undefined ? additionalData.available : true,
                    fees: additionalData.fees || 0,
                    address: additionalData.address || { line1: '', line2: '' },
                    image: additionalData.image || '',
                    date: Date.now()
                };
                break;

            case 'labAssistant':
                model = labAssistantModel;
                userData = {
                    name,
                    email,
                    password: await bcrypt.hash(password, 10),
                    department: additionalData.department || '',
                    specialization: additionalData.specialization || '',
                    licenseNumber: additionalData.licenseNumber || '',
                    address: additionalData.address || { line1: '', line2: '' },
                    gender: additionalData.gender || 'Not Selected',
                    dob: additionalData.dob || 'Not Selected',
                    phone: additionalData.phone || '0000000000',
                    date: Date.now()
                };
                break;

            case 'supplier':
                model = supplierModel;
                userData = {
                    name,
                    email,
                    password: await bcrypt.hash(password, 10),
                    companyName: additionalData.companyName || '',
                    businessType: additionalData.businessType || '',
                    licenseNumber: additionalData.licenseNumber || '',
                    address: additionalData.address || { line1: '', line2: '' },
                    gender: additionalData.gender || 'Not Selected',
                    dob: additionalData.dob || 'Not Selected',
                    phone: additionalData.phone || '0000000000',
                    date: Date.now()
                };
                break;

            case 'inventoryManager':
                model = inventoryManagerModel;
                userData = {
                    name,
                    email,
                    password: await bcrypt.hash(password, 10),
                    department: additionalData.department || '',
                    specialization: additionalData.specialization || '',
                    employeeId: additionalData.employeeId || '',
                    address: additionalData.address || { line1: '', line2: '' },
                    gender: additionalData.gender || 'Not Selected',
                    dob: additionalData.dob || 'Not Selected',
                    phone: additionalData.phone || '0000000000',
                    date: Date.now()
                };
                break;

            case 'admin':
            case 'accountant':
                return res.json({ 
                    success: false, 
                    message: `Cannot register ${userType} through this endpoint. These are predefined system roles.` 
                });

            default:
                return res.json({ success: false, message: "Invalid user type" });
        }

        // Check if user already exists
        const existingUser = await model.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists with this email" });
        }

        // Create new user
        const newUser = new model(userData);
        await newUser.save();

        res.json({ success: true, message: `${userType} registered successfully` });

    } catch (error) {
        console.error('Registration error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Verify token middleware
const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.json({ success: false, message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.json({ success: false, message: "Invalid token" });
    }
};

export { loginUser, registerUser, verifyToken };