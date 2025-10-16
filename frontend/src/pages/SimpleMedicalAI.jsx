import React, { useState, useRef } from 'react';
import { medicalKnowledge, labTestRanges, sampleQuestions } from '../utils/medicalData';
import LabAppointmentForm from './LabAppointmentForm';

const SimpleMedicalAI = () => {
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            content: "Hello! I'm your medical AI assistant. How can I help you today?"
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
                addMessage('user', 'Uploaded a lab report for analysis');
                addMessage('bot', 'I can help you understand your lab report. What would you like to know about?');
            };
            reader.readAsDataURL(file);
        }
    };

    const addMessage = (type, content) => {
        setMessages(prev => [...prev, { type, content }]);
        setTimeout(() => {
            chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    };

    const generateResponse = (input) => {
        const lowercaseInput = input.toLowerCase();
        let found = false;
        let response = "";

        // Check for medical conditions
        for (const [condition, info] of Object.entries(medicalKnowledge)) {
            if (lowercaseInput.includes(condition) || 
                lowercaseInput.includes(condition + "s") ||
                lowercaseInput.includes("symptoms of " + condition) ||
                lowercaseInput.includes("treatment for " + condition)) {
                response = `Regarding ${condition}:\n`;
                response += `• Symptoms: ${info.symptoms}\n`;
                response += `• Treatment: ${info.treatment}\n`;
                response += `⚠️ Important: ${info.warning}`;
                found = true;
                break;
            }
        }

        // Check for lab test related questions
        if (!found) {
            for (const [test, values] of Object.entries(labTestRanges)) {
                if (lowercaseInput.includes(test) || 
                    lowercaseInput.includes(test + " test") ||
                    lowercaseInput.includes(test + " results")) {
                    response = `Here are the normal ranges for ${test}:\n\n`;
                    for (const [component, info] of Object.entries(values)) {
                        response += `• ${component}:\n  Normal Range: ${info.normal}\n  ${info.interpretation}\n\n`;
                    }
                    found = true;
                    break;
                }
            }
        }

        // Check for lifestyle and general health questions
        if (!found) {
            const keywords = {
                diet: "Here are some dietary recommendations:\n• Eat plenty of fruits, vegetables, and whole grains\n• Choose lean proteins and healthy fats\n• Limit processed foods and added sugars\n• Stay hydrated with water\n• Control portion sizes",
                exercise: "Exercise recommendations:\n• Aim for 150 minutes of moderate activity per week\n• Include both cardio and strength training\n• Start slowly and gradually increase intensity\n• Choose activities you enjoy\n• Always warm up and cool down",
                stress: "Stress management techniques:\n• Practice deep breathing exercises\n• Try meditation or mindfulness\n• Regular physical activity\n• Maintain good sleep habits\n• Consider talking to a counselor",
                sleep: "Tips for better sleep:\n• Stick to a regular sleep schedule\n• Create a relaxing bedtime routine\n• Keep your bedroom cool and dark\n• Limit screen time before bed\n• Avoid caffeine late in the day"
            };

            for (const [keyword, advice] of Object.entries(keywords)) {
                if (lowercaseInput.includes(keyword)) {
                    response = advice;
                    found = true;
                    break;
                }
            }
        }

        // If no specific match is found, provide a helpful response
        if (!found) {
            if (lowercaseInput.includes("when") && (lowercaseInput.includes("doctor") || lowercaseInput.includes("emergency"))) {
                response = "You should seek immediate medical attention if you experience:\n" +
                         "• Severe chest pain or difficulty breathing\n" +
                         "• Sudden severe headache or confusion\n" +
                         "• Severe abdominal pain\n" +
                         "• High fever with stiff neck\n" +
                         "• Serious injuries or uncontrolled bleeding\n\n" +
                         "Schedule a routine doctor visit for:\n" +
                         "• Persistent symptoms lasting more than a week\n" +
                         "• Regular health screenings and check-ups\n" +
                         "• New or changing health concerns\n" +
                         "• Management of chronic conditions";
            } else {
                response = "I understand you're asking about " + input.toLowerCase() + ". While I can provide general information, " +
                         "I recommend consulting with a healthcare provider for personalized medical advice. " +
                         "You can ask me about:\n" +
                         "• Specific medical conditions and their symptoms\n" +
                         "• Lab test results and interpretations\n" +
                         "• General health and lifestyle advice\n" +
                         "• When to seek medical attention";
            }
        }

        return response;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Add user message
        addMessage('user', inputMessage);
        setInputMessage('');
        setIsAnalyzing(true);

        // Generate response after a short delay
        setTimeout(() => {
            const response = generateResponse(inputMessage);
            addMessage('bot', response);
            setIsAnalyzing(false);
        }, 1000);
    };

    const handleSampleQuestion = (question) => {
        setInputMessage(question);
        handleSubmit({ preventDefault: () => {} });
    };

    return (
        <>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.7);
                }
            `}</style>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
                {/* Hero Section with Background Pattern */}
                <div className="relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10"></div>
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
                    </div>
                    
                    <div className="relative max-w-7xl mx-auto px-6 py-16">
                        {/* Header Section */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 mb-6 shadow-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Live Laboratory Services</span>
                            </div>
                            
                            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-6 leading-tight">
                                Advanced Laboratory Testing & Diagnostic Services
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
                                Precision diagnostics for better healthcare decisions. Fast, accurate, and reliable laboratory results you can trust.
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <button 
                                    onClick={() => setShowAppointmentForm(true)}
                                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-5 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 hover:shadow-2xl font-semibold text-lg shadow-xl"
                                >
                                    <div className="p-2 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
                                        <span className="text-2xl">📋</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Book Lab Appointment</div>
                                        <div className="text-sm opacity-90">Schedule your test</div>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => {
                                        document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-5 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 hover:shadow-2xl font-semibold text-lg shadow-xl"
                                >
                                    <div className="p-2 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
                                        <span className="text-2xl">🤖</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Check Lab Reports with AI</div>
                                        <div className="text-sm opacity-90">Get instant analysis</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        <div className="group text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-100 hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                                <span className="text-2xl">⏱️</span>
                            </div>
                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 mb-2">24-48h</div>
                            <div className="text-gray-600 font-medium">Result Time</div>
                            <div className="text-xs text-gray-500 mt-2">Fast & Reliable</div>
                        </div>
                        <div className="group text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-indigo-100 hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                                <span className="text-2xl">🧪</span>
                            </div>
                            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 mb-2">200+</div>
                            <div className="text-gray-600 font-medium">Tests Available</div>
                            <div className="text-xs text-gray-500 mt-2">Comprehensive Range</div>
                        </div>
                        <div className="group text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-green-100 hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 mb-2">98%</div>
                            <div className="text-gray-600 font-medium">Accuracy Rate</div>
                            <div className="text-xs text-gray-500 mt-2">Precision Guaranteed</div>
                        </div>
                        <div className="group text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100 hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 mb-2">5000+</div>
                            <div className="text-gray-600 font-medium">Samples Processed Monthly</div>
                            <div className="text-xs text-gray-500 mt-2">High Volume Capacity</div>
                        </div>
                    </div>
                </div>
            
                {/* Main Content Section */}
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                        {/* Lab Report Upload Section */}
                        <div className="group bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-2xl p-8 border border-blue-100 transform transition-all hover:scale-[1.02] hover:shadow-3xl hover:-translate-y-2">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <span className="text-3xl">🔬</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                        Lab Report Analysis
                                    </h2>
                                    <p className="text-gray-600 mt-1">AI-powered diagnostic insights</p>
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="group/upload border-3 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:bg-blue-50/70 transition-all cursor-pointer bg-white/60 backdrop-blur-sm hover:border-blue-400 hover:shadow-lg"
                            >
                                <div className="text-6xl mb-6 group-hover/upload:scale-110 transition-transform">📄</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-3">Upload Your Lab Report</h3>
                                <p className="text-gray-600 mb-8 leading-relaxed">Get instant AI analysis and insights from your laboratory results</p>
                                <button className="group/btn bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-10 py-4 rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg font-semibold text-lg">
                                    <span className="flex items-center gap-2">
                                        <span>📁</span>
                                        Select Image
                                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                    </span>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            
                            {selectedImage && (
                                <div className="mt-8 group">
                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <span className="text-green-600">✓</span>
                                            </div>
                                            <span className="font-semibold text-gray-700">Image Uploaded Successfully</span>
                                        </div>
                                        <img src={selectedImage} alt="Lab Report" className="max-w-full rounded-xl shadow-md group-hover:shadow-lg transition-shadow" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* AI Chat Interface Section */}
                        <div id="ai-section" className="group bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl shadow-2xl p-8 border border-emerald-100 transform transition-all hover:scale-[1.02] hover:shadow-3xl hover:-translate-y-2">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <span className="text-3xl">🤖</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                                        AI Lab Report Analysis
                                    </h2>
                                    <p className="text-gray-600 mt-1">Intelligent medical insights</p>
                                </div>
                            </div>
                            <div className="h-[600px] flex flex-col">
                                <div 
                                    ref={chatContainerRef}
                                    className="flex-1 overflow-y-auto mb-6 space-y-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-inner"
                                >
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                                        >
                                            <div
                                                className={`max-w-[85%] p-5 rounded-2xl shadow-lg backdrop-blur-sm ${
                                                    message.type === 'user'
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                                        : 'bg-white/90 border border-emerald-100'
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isAnalyzing && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/90 p-5 rounded-2xl shadow-lg animate-pulse border border-emerald-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="animate-spin text-emerald-500 text-xl">⚕️</div>
                                                    <span className="font-medium text-gray-700">AI is analyzing your question...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sample Questions */}
                                <div className="mb-6 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-sm">💡</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800">Quick Questions</h3>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {sampleQuestions.slice(0, 6).map((question, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSampleQuestion(question)}
                                                    className="group text-left text-sm bg-white hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 p-4 rounded-xl transition-all border border-emerald-100 hover:border-emerald-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-emerald-500 group-hover:scale-110 transition-transform">→</span>
                                                        <span className="text-gray-700 group-hover:text-emerald-700 transition-colors">{question}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            placeholder="Ask me anything about your health or lab results..."
                                            className="w-full p-5 pr-12 rounded-2xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/90 backdrop-blur-sm shadow-lg text-lg placeholder-gray-400"
                                        />
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400">
                                            <span className="text-2xl">💬</span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="group bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-5 rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 font-semibold text-lg"
                                        disabled={isAnalyzing}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>Send</span>
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="max-w-7xl mx-auto px-6 mb-16">
                    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 p-8 rounded-3xl shadow-xl">
                        <div className="flex items-start gap-4 text-amber-700">
                            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">⚕️</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-amber-900 mb-2">Medical Disclaimer</h3>
                                <p className="text-sm leading-relaxed">
                                    <strong className="text-amber-900">Important:</strong> This AI assistant provides general health information only. 
                                    Always consult with a qualified healthcare professional for medical advice, diagnosis, or treatment. 
                                    The information provided is not a substitute for professional medical care.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Floating Help Button */}
            <div className="fixed bottom-8 right-8 z-40">
                <button
                    onClick={() => document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 hover:-translate-y-2 animate-bounce"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-2xl group-hover:rotate-12 transition-transform">💬</span>
                        <span className="hidden group-hover:block font-semibold">Ask AI</span>
                    </div>
                </button>
            </div>
            
            {/* Lab Appointment Form Popup */}
            <LabAppointmentForm 
                isOpen={showAppointmentForm} 
                onClose={() => setShowAppointmentForm(false)} 
            />
        </>
    );
};

export default SimpleMedicalAI;