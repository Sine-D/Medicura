import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LabForm from './LabForm';

const TestsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const location = useLocation();
    
    const tests = [
        {
            id: 1,
            name: "Complete Blood Count (CBC)",
            duration: "30 mins",
            price: "$50",
            availability: "Available",
            category: "Hematology"
        },
        {
            id: 2,
            name: "Blood Glucose Test",
            duration: "15 mins",
            price: "$30",
            availability: "Available",
            category: "Diabetes"
        },
        {
            id: 3,
            name: "Lipid Panel",
            duration: "45 mins",
            price: "$75",
            availability: "Limited",
            category: "Cardiac"
        },
        {
            id: 4,
            name: "Thyroid Function Test",
            duration: "1 hour",
            price: "$100",
            availability: "Available",
            category: "Endocrine"
        },
        {
            id: 5,
            name: "Liver Function Test",
            duration: "40 mins",
            price: "$85",
            availability: "Available",
            category: "Hepatology"
        },
        {
            id: 6,
            name: "Vitamin D Test",
            duration: "25 mins",
            price: "$65",
            availability: "Limited",
            category: "Nutrition"
        }
    ];

    const filteredTests = tests.filter(test =>
        (test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (activeFilter === 'All' || test.availability === activeFilter)
    );

    // Function to handle opening the form
    const handleScheduleTest = (test) => {
        setSelectedTest(test);
        setIsFormOpen(true);
    };

    // Function to handle closing the form
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedTest(null);
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Hematology': 'bg-purple-100 text-purple-800',
            'Diabetes': 'bg-blue-100 text-blue-800',
            'Cardiac': 'bg-red-100 text-red-800',
            'Endocrine': 'bg-yellow-100 text-yellow-800',
            'Hepatology': 'bg-green-100 text-green-800',
            'Nutrition': 'bg-pink-100 text-pink-800',
            'Default': 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors['Default'];
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Navigation Sidebar */}
            <nav className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-700 to-purple-800 text-white p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-10">
                    <div className="bg-white p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">MedicuraLab</h1>
                </div>
                
                <div className="space-y-3">
                    <Link 
                        to="/" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-600/30 hover:scale-105 group ${
                            location.pathname === '/' ? 'bg-blue-600/30 shadow-inner' : ''
                        }`}
                    >
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <span className="group-hover:translate-x-2 transition-transform font-medium">Dashboard</span>
                    </Link>
                    
                    <Link 
                        to="/appointments" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-600/30 hover:scale-105 group ${
                            location.pathname === '/appointments' ? 'bg-blue-600/30 shadow-inner' : ''
                        }`}
                    >
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="group-hover:translate-x-2 transition-transform font-medium">Appointments</span>
                    </Link>
                    
                    <Link 
                        to="/tests" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-600/30 hover:scale-105 group ${
                            location.pathname === '/tests' ? 'bg-blue-600/30 shadow-inner' : ''
                        }`}
                    >
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="group-hover:translate-x-2 transition-transform font-medium">Tests</span>
                    </Link>
                    
                    <Link 
                        to="/logout" 
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/30 hover:scale-105 group mt-8"
                    >
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <span className="group-hover:translate-x-2 transition-transform font-medium">Logout</span>
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="ml-64 p-8 w-full">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2 text-gray-800">Laboratory Tests</h1>
                    <p className="text-gray-600 mb-8">Browse and schedule your medical tests with ease</p>
                    
                    {/* Search and Filter Section */}
                    <div className="flex flex-col md:flex-row gap-4 mb-10">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search tests by name or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
                            <span className="text-gray-600 font-medium">Filter:</span>
                            <button 
                                onClick={() => setActiveFilter('All')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    activeFilter === 'All' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            <button 
                                onClick={() => setActiveFilter('Available')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    activeFilter === 'Available' 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Available
                            </button>
                            <button 
                                onClick={() => setActiveFilter('Limited')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    activeFilter === 'Limited' 
                                        ? 'bg-yellow-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Limited
                            </button>
                        </div>
                    </div>

                    {/* Tests Grid */}
                    {filteredTests.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-md">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No tests found</h3>
                            <p className="mt-1 text-gray-500">Try adjusting your search query or filter</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTests.map(test => (
                                <div key={test.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(test.category)}`}>
                                                {test.category}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                test.availability === 'Available' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {test.availability}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-3">{test.name}</h3>
                                        <div className="space-y-3 text-gray-600 mb-5">
                                            <div className="flex items-center">
                                                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{test.duration}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-medium">{test.price}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleScheduleTest(test)}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Schedule Test
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Lab Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-screen overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                Schedule {selectedTest?.name}
                            </h2>
                            <button
                                onClick={handleCloseForm}
                                className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <LabForm 
                            initialData={{ testType: selectedTest?.name }} 
                            onSuccess={handleCloseForm} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestsPage;