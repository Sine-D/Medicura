import React, { useState, useRef } from 'react';
import { medicalKnowledge, labTestRanges, sampleQuestions } from '../utils/medicalData';

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
    const [activeCategory, setActiveCategory] = useState('common');
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
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lab Report Upload Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border border-blue-100 transform transition-all hover:scale-[1.02] hover:shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-3xl">🔬</div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Lab Report Analysis
                        </h2>
                    </div>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-3 border-dashed border-blue-200 rounded-xl p-10 text-center hover:bg-blue-50/50 transition-all cursor-pointer bg-white/50 backdrop-blur-sm"
                    >
                        <div className="text-5xl mb-4">📄</div>
                        <p className="text-gray-600 text-lg mb-6">Upload your lab report for AI analysis</p>
                        <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-md">
                            Select Image
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
                        <div className="mt-6">
                            <img src={selectedImage} alt="Lab Report" className="max-w-full rounded-xl shadow-lg" />
                        </div>
                    )}
                </div>

                {/* Chat Interface Section */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-xl p-8 border border-emerald-100 transform transition-all hover:scale-[1.02] hover:shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-3xl">💬</div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                            Medical Assistant
                        </h2>
                    </div>
                    <div className="h-[500px] flex flex-col">
                        <div 
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl"
                        >
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-4 rounded-xl shadow-md backdrop-blur-sm ${
                                            message.type === 'user'
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                                : 'bg-white/80 border border-emerald-100'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isAnalyzing && (
                                <div className="flex justify-start">
                                    <div className="bg-white/80 p-4 rounded-xl shadow-md animate-pulse border border-emerald-100">
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin text-emerald-500">⚕️</div>
                                            Analyzing...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sample Questions Categories */}
                        <div className="mb-6 bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                {Object.keys(sampleQuestions).map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`text-sm px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                                            activeCategory === category
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                                : 'bg-white hover:bg-emerald-50 text-gray-700 border border-emerald-100'
                                        }`}
                                    >
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-3">
                                    {sampleQuestions[activeCategory]?.slice(0, 6).map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSampleQuestion(question)}
                                            className="text-left text-sm bg-white hover:bg-emerald-50 p-3 rounded-lg transition-all border border-emerald-100 hover:border-emerald-200 transform hover:scale-[1.02] shadow-sm"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your medical question here..."
                                className="flex-1 p-4 rounded-xl border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/80 backdrop-blur-sm shadow-sm"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-md disabled:opacity-50"
                                disabled={isAnalyzing}
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Medical Disclaimer */}
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 text-amber-700">
                    <div className="text-2xl">⚕️</div>
                    <p className="text-sm">
                        <strong className="text-amber-900">Important:</strong> This AI assistant provides general health information only. 
                        Always consult with a qualified healthcare professional for medical advice, diagnosis, or treatment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SimpleMedicalAI;