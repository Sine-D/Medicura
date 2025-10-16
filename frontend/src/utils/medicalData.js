// Medical knowledge database
export const medicalKnowledge = {
    "diabetes": {
        symptoms: "Increased thirst, frequent urination, extreme fatigue, blurred vision, slow-healing sores",
        treatment: "Blood sugar monitoring, medication (metformin, insulin), diet management, regular exercise",
        warning: "Diabetes requires ongoing medical supervision. Consult your doctor for proper management."
    },
    "hypertension": {
        symptoms: "Headaches, shortness of breath, nosebleeds, dizziness, chest pain",
        treatment: "Lifestyle changes, medication (ACE inhibitors, diuretics), regular monitoring",
        warning: "High blood pressure can lead to serious complications. Regular check-ups are essential."
    },
    "asthma": {
        symptoms: "Wheezing, shortness of breath, chest tightness, coughing, especially at night",
        treatment: "Inhalers (rescue and controller), avoiding triggers, regular monitoring",
        warning: "Asthma attacks can be life-threatening. Always carry your rescue inhaler."
    },
    "migraine": {
        symptoms: "Severe headache, nausea, vomiting, sensitivity to light and sound, visual disturbances",
        treatment: "Pain relief medication, preventive medication, lifestyle modifications, stress management",
        warning: "If you experience sudden severe headache or changes in vision, seek immediate medical attention."
    },
    "anxiety": {
        symptoms: "Excessive worry, restlessness, fatigue, difficulty concentrating, irritability, sleep problems",
        treatment: "Therapy (CBT), medication, relaxation techniques, lifestyle changes",
        warning: "Anxiety disorders are treatable. Professional help can significantly improve quality of life."
    },
    "depression": {
        symptoms: "Persistent sadness, loss of interest, fatigue, changes in appetite, sleep disturbances, hopelessness",
        treatment: "Therapy, medication (antidepressants), lifestyle changes, support groups",
        warning: "If you have thoughts of self-harm, seek immediate help from a mental health professional."
    },
    "common cold": {
        symptoms: "Runny nose, sneezing, sore throat, cough, mild headache, body aches",
        treatment: "Rest, fluids, over-the-counter medications, humidifier, throat lozenges",
        warning: "If symptoms persist for more than 10 days or worsen, consult a healthcare provider."
    },
    "flu": {
        symptoms: "Fever, chills, muscle aches, fatigue, headache, dry cough, sore throat",
        treatment: "Rest, fluids, antiviral medication (if caught early), over-the-counter pain relievers",
        warning: "Seek medical attention if you have difficulty breathing, chest pain, or persistent high fever."
    }
};

// Lab test normal ranges
export const labTestRanges = {
    "complete blood count": {
        "White Blood Cells (WBC)": {
            normal: "4,500-11,000 cells/μL",
            interpretation: "High levels may indicate infection; low levels may indicate immune system problems"
        },
        "Red Blood Cells (RBC)": {
            normal: "4.5-5.9 million cells/μL (men), 4.1-5.1 million cells/μL (women)",
            interpretation: "Low levels may indicate anemia; high levels may indicate dehydration or other conditions"
        },
        "Hemoglobin": {
            normal: "13.8-17.2 g/dL (men), 12.1-15.1 g/dL (women)",
            interpretation: "Low levels indicate anemia; high levels may indicate dehydration or other conditions"
        },
        "Hematocrit": {
            normal: "40.7-50.3% (men), 36.1-44.3% (women)",
            interpretation: "Percentage of blood volume made up by red blood cells"
        },
        "Platelets": {
            normal: "150,000-450,000 platelets/μL",
            interpretation: "Low levels may cause bleeding; high levels may increase clotting risk"
        }
    },
    "basic metabolic panel": {
        "Glucose": {
            normal: "70-100 mg/dL (fasting)",
            interpretation: "High levels may indicate diabetes; low levels may indicate hypoglycemia"
        },
        "Sodium": {
            normal: "136-145 mEq/L",
            interpretation: "Essential for fluid balance and nerve function"
        },
        "Potassium": {
            normal: "3.5-5.0 mEq/L",
            interpretation: "Important for heart and muscle function"
        },
        "Chloride": {
            normal: "98-107 mEq/L",
            interpretation: "Helps maintain acid-base balance"
        },
        "BUN (Blood Urea Nitrogen)": {
            normal: "7-20 mg/dL",
            interpretation: "Indicates kidney function; high levels may suggest kidney problems"
        },
        "Creatinine": {
            normal: "0.6-1.2 mg/dL (men), 0.5-1.1 mg/dL (women)",
            interpretation: "Another indicator of kidney function"
        }
    },
    "lipid panel": {
        "Total Cholesterol": {
            normal: "Less than 200 mg/dL",
            interpretation: "High levels increase heart disease risk"
        },
        "LDL (Bad Cholesterol)": {
            normal: "Less than 100 mg/dL",
            interpretation: "Lower is better; high levels increase heart disease risk"
        },
        "HDL (Good Cholesterol)": {
            normal: "60 mg/dL or higher",
            interpretation: "Higher is better; protects against heart disease"
        },
        "Triglycerides": {
            normal: "Less than 150 mg/dL",
            interpretation: "High levels increase heart disease risk"
        }
    },
    "thyroid function": {
        "TSH (Thyroid Stimulating Hormone)": {
            normal: "0.4-4.0 mIU/L",
            interpretation: "High levels may indicate hypothyroidism; low levels may indicate hyperthyroidism"
        },
        "Free T4": {
            normal: "0.8-1.8 ng/dL",
            interpretation: "Active thyroid hormone; high levels may indicate hyperthyroidism"
        },
        "Free T3": {
            normal: "2.3-4.2 pg/mL",
            interpretation: "Another active thyroid hormone"
        }
    }
};

// Sample questions for users
export const sampleQuestions = [
    "What are the symptoms of diabetes?",
    "What is the normal range for blood pressure?",
    "How can I manage stress and anxiety?",
    "What should I do if I have a fever?",
    "How often should I get a check-up?",
    "What are the warning signs of a heart attack?",
    "How can I improve my sleep quality?",
    "What is the normal range for cholesterol?",
    "How can I boost my immune system?",
    "What are the symptoms of depression?",
    "How can I manage chronic pain?",
    "What should I know about my thyroid function?",
    "How can I prevent the flu?",
    "What are the benefits of regular exercise?",
    "How can I maintain a healthy diet?"
];

// Health tips and general advice
export const healthTips = {
    "general": [
        "Stay hydrated by drinking 8-10 glasses of water daily",
        "Get 7-9 hours of quality sleep each night",
        "Exercise for at least 30 minutes most days of the week",
        "Eat a balanced diet with plenty of fruits and vegetables",
        "Manage stress through relaxation techniques",
        "Avoid smoking and limit alcohol consumption",
        "Wash your hands regularly to prevent infections",
        "Get regular health check-ups and screenings"
    ],
    "prevention": [
        "Get vaccinated according to recommended schedules",
        "Practice safe food handling and preparation",
        "Use sunscreen to protect against UV radiation",
        "Maintain a healthy weight",
        "Practice good oral hygiene",
        "Stay up to date with health screenings",
        "Practice safe sex",
        "Avoid sharing personal items like toothbrushes or razors"
    ],
    "emergency": [
        "Call emergency services (911) for life-threatening situations",
        "Learn basic first aid and CPR",
        "Keep emergency contact numbers readily available",
        "Know the location of the nearest hospital",
        "Have a first aid kit at home and in your car",
        "Learn to recognize signs of stroke (FAST: Face, Arms, Speech, Time)",
        "Know the signs of heart attack (chest pain, shortness of breath, etc.)",
        "Keep important medical information easily accessible"
    ]
};
