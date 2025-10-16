import React, { useContext, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [state, setState] = useState('Admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { setAToken, backendUrl } = useContext(AdminContext);
    const navigate = useNavigate();

    // User type mapping
    const userTypes = {
        'Admin': 'admin',
        'Doctor': 'doctor',
        'Lab Assistant': 'labAssistant',
        'Supplier': 'supplier',
        'Inventory Manager': 'inventoryManager',
        'Accountant': 'accountant'
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        try {
            if (state === 'Admin') {
                // Admin login (existing backend logic)
                const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password });
                if (data.success) {
                    localStorage.setItem('userInfo', JSON.stringify(data.user));
                    setAToken(data.token);
                } else {
                    toast.error(data.message);
                }
            } else if (state === 'Supplier') {
                // Hardcoded Supplier login
                if (email === "supplier1@example.com" && password === "password123") {
                    localStorage.setItem('userInfo', JSON.stringify({ email, name: "Supplier One", role: "supplier" }));
                    setAToken("dummy-supplier-token"); // dummy token
                    navigate("/supplier-dashboard");
                } else {
                    toast.error("Invalid Supplier credentials");
                }
            }else if (state === 'Lab Assistant') {
                // Hardcoded Lab Assistant login
                if (email === "lalith@gmail.com" && password === "lab123456") {
                    localStorage.setItem('userInfo', JSON.stringify({ email, name: "Lalith Kumara", userType: "labAssistant" }));
                    setAToken("dummy-labassistant-token"); // dummy token
                    navigate("/lab");
                } else {
                    toast.error("Invalid Lab assistant credentials");
                }
            } else if (state === 'Inventory Manager') {
                // Hardcoded Inventory Manager login
                if (email === "john.doe@example.com" && password === "manager123") {
                    localStorage.setItem('userInfo', JSON.stringify({ email, name: "John Doe", role: "inventoryManager" }));
                    setAToken("dummy-inventory-token"); // dummy token
                    navigate("/inventory-dashboard");
                } else {
                    toast.error("Invalid Inventory Manager credentials");
                }
            } else {
                // Other user types login through backend
                const userType = userTypes[state];
                const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password, userType });
                if (data.success) {
                    localStorage.setItem('userInfo', JSON.stringify(data.user));
                    setAToken(data.token);
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            console.log(error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Login failed. Please try again.');
            }
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg '>
                <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{state}</span> Login</p>
                
                <div className='w-full'>
                    <p>Email</p>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type='email' required />
                </div>

                <div className='w-full'>
                    <p>Password</p>
                    <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type='password' required />
                </div>

                <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>

                <div className='w-full'>
                    <p className='mb-2'>Login as:</p>
                    <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className='w-full p-2 border border-[#DADADA] rounded'
                    >
                        <option value="Admin">Admin</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Lab Assistant">Lab Assistant</option>
                        <option value="Supplier">Supplier</option>
                        <option value="Inventory Manager">Inventory Manager</option>
                        <option value="Accountant">Accountant</option>
                    </select>
                </div>
            </div>
        </form>
    );
};

export default Login;
