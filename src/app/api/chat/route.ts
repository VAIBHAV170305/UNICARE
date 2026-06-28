import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyAuthToken } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access: Valid authentication token required" }, { status: 401 });
    }

    const { message, history, userProfile } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const queryLower = message.toLowerCase();
    if (queryLower.includes("medicine") || queryLower.includes("medication") || queryLower.includes("dawa") || queryLower.includes("दवा")) {
      await logActivity(authUser.uid, "MEDICATION_QUERY", "Queried AI companion for medication info or schedule");
    }

    const clientApiKey = request.headers.get("x-gemini-api-key");
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    const profile = userProfile || {
      name: "Alex",
      age: 28,
      gender: "Male",
      height: 180,
      weight: 75,
      medicalHistory: "Mild seasonal asthma",
      allergies: "None",
      healthGoals: "Cardiovascular endurance"
    };

    // Build system prompt with user profile & active biometrics context
    const systemInstruction = `You are the UniCare AI Healthcare Companion. Your responses must be warm, supportive, type-safe, and professional.

User Profile:
- Name: ${profile.name}
- Age: ${profile.age} years old
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Medical History: ${profile.medicalHistory}
- Allergies: ${profile.allergies || "None"}
- Health Goals: ${profile.healthGoals}

Active Daily Biometrics:
- Sleep duration: 8 hours 12 minutes, 92% sleep efficiency index.
- Water hydration: 1,500 ml logged so far today (daily target: 3.0L).
- Physical activity: 9,240 steps completed, 640 active calories burned (target: 800 kcal).
- Mood state: Calm.
- Medication schedule: Morning multivitamins logged as taken at 9:00 AM.

CRITICAL HEALTHCARE BOUNDARY:
- You must NEVER diagnose diseases or prescribe medications.
- If the user asks about symptoms or claims concerning conditions, you must:
  1. Ask clarifying follow-up questions about the severity, duration, and associated symptoms.
  2. Provide general educational information about standard causes (like dehydration, lack of sleep, muscle fatigue).
  3. Suggest healthy habits and preventive steps (like drinking water, resting).
  4. Strongly recommend consulting a qualified healthcare professional if symptoms persist or worsen.

RESPONSE CONCISTENCY:
- Keep your answers relatively concise, under 3-4 short paragraphs, as the assistant speaks the answers aloud.
- Use clean formatting (bullet points, clear sections). Do not use excessive markdown.`;

    // Fallback Keyless AI if GEMINI_API_KEY is not configured
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not configured. Falling back to Pollinations Keyless AI.");
      try {
        const response = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { "role": "system", "content": systemInstruction },
              ...(Array.isArray(history) 
                ? history.map((h: { sender: string; text: string }) => ({
                    role: h.sender === "user" ? "user" : "assistant",
                    content: h.text
                  }))
                : []),
              { "role": "user", "content": message }
            ],
            model: "openai"
          })
        });

        if (response.ok) {
          const aiResponseText = await response.text();
          return NextResponse.json({ text: aiResponseText });
        } else {
          throw new Error(`Pollinations API returned status ${response.status}`);
        }
      } catch (pollinationsError) {
        console.error("Pollinations AI call failed, using local mock generator:", pollinationsError);
        const responseText = generateFallbackMockResponse(message);
        return NextResponse.json({ text: responseText, mocked: true });
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    // Map conversation history to Gemini Chat format
    const chatSession = model.startChat({
      history: Array.isArray(history) 
        ? history.map((h: { sender: string; text: string }) => ({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          }))
        : []
    });

    const result = await chatSession.sendMessage(message);
    const aiResponseText = result.response.text();

    return NextResponse.json({ text: aiResponseText });

  } catch (err: unknown) {
    console.error("API Chat route error:", err);
    const errorDetails = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: errorDetails
    }, { status: 500 });
  }
}

/**
 * Enhanced, diverse local response generator if no API key is set
 */
function generateFallbackMockResponse(text: string): string {
  const query = text.toLowerCase();

  // --- HINDI PATTERNS ---
  if (query.includes("सिर दर्द") || query.includes("सिरदर्द") || query.includes("दर्द")) {
    return "मुझे खेद है कि आपके सिर में दर्द हो रहा है। आपके यूनीकेयर एआई के रूप में, मैं किसी बीमारी का निदान नहीं कर सकता। आज आपका पानी का स्तर केवल 1.5L दर्ज किया गया है, जो 3.0L के लक्ष्य से कम है। निर्जलीकरण (dehydration) सिरदर्द का एक आम कारण है। मैं सुझाव देता हूँ कि आप 500ml पानी पिएं और आराम करें। यदि दर्द गंभीर या लगातार बना रहता है, तो कृपया तुरंत डॉक्टर से संपर्क करें।";
  }

  if (query.includes("दवाई") || query.includes("दवा") || query.includes("मेडिसिन")) {
    return "आपकी दवा अनुसूची के अनुसार: आपने सुबह 9:00 बजे अपने मल्टीविटामिन ले लिए हैं। आज दोपहर या शाम के लिए कोई अन्य दवा बाकी नहीं है। भविष्य के लिए मैं आपके लिए रिमाइंडर सेट कर सकता हूँ।";
  }

  if (query.includes("नाश्ता") || query.includes("क्या खाऊं") || query.includes("भोजन")) {
    return "आपके 75kg वजन और हृदय सहनशक्ति (cardiovascular endurance) के लक्ष्यों को देखते हुए, मैं एक पौष्टिक नाश्ते का सुझाव देता हूँ: ओट्स, ग्रीक योगर्ट, चिया सीड्स, केले के स्लाइस और बादाम। यह आपको पूरे दिन ऊर्जावान रखेगा। इसके साथ एक गिलास पानी जरूर पिएं, क्योंकि आज पानी का स्तर कम है।";
  }

  if (query.includes("तनाव") || query.includes("टेंशन") || query.includes("चिंता") || query.includes("परेशान")) {
    return "आपकी तनाव की स्थिति को देखते हुए, मैं 5 मिनट के बॉक्स ब्रीदिंग (4s सांस लें, 4s रोकें, 4s छोड़ें, 4s रोकें) का सुझाव देता हूँ। यह आपके तंत्रिका तंत्र को शांत करेगा। आप हमारे मानसिक कल्याण (Mental Wellness) मॉड्यूल में ब्रीदिंग कोच का उपयोग कर सकते हैं।";
  }

  if (query.includes("पानी") || query.includes("हाइड्रेशन") || query.includes("प्यास")) {
    return "आपका दैनिक पानी का लक्ष्य 3.0L (3,000ml) है। आपने आज केवल 1,500ml (1.5L) पानी पिया है, जो आपके लक्ष्य का 50% है। सिरदर्द और थकान से बचने के लिए, कृपया अभी एक गिलास पानी पिएं।";
  }

  if (query.includes("अपॉइंटमेंट") || query.includes("डॉक्टर") || query.includes("मिलना")) {
    return "आपके कैलेंडर के अनुसार, 3 महीने में आपका स्किन मैपिंग चेकअप निर्धारित है। आज कोई अन्य अपॉइंटमेंट नहीं है। क्या आप नया अपॉइंटमेंट बुक करना चाहते हैं?";
  }

  if (query.includes("कसरत") || query.includes("व्यायाम") || query.includes("वर्कआउट")) {
    return "आज आपने 9,240 कदम पूरे किए हैं और 640 कैलोरी बर्न की है (लक्ष्य: 800 कैलोरी)। आपकी रिकवरी को देखते हुए, मैं 25 मिनट की हल्की दौड़ या स्ट्रेचिंग की सलाह देता हूँ ताकि मांसपेशियों पर अत्यधिक दबाव न पड़े।";
  }

  if (query.includes("सारांश") || query.includes("रिपोर्ट") || query.includes("स्वास्थ्य")) {
    return "आज का आपका स्वास्थ्य सारांश: आपने 8 घंटे 12 मिनट की नींद ली (92% दक्षता)। आपके कदम 9,240 हैं और 640 कैलोरी बर्न हुई है। आपका मूड शांत (Calm) दर्ज किया गया है। लेकिन पानी का स्तर 1.5L ही है, कृपया पानी का सेवन बढ़ाएं।";
  }

  if (query.includes("नींद") || query.includes("सोना")) {
    return "आपकी नींद के विश्लेषण के अनुसार: आपने कल रात 8 घंटे 12 मिनट की गहरी और अच्छी नींद ली। आपकी रिकवरी सामान्य है, हालांकि पानी का स्तर कम होने से थोड़ी सुस्ती हो सकती है।";
  }

  if (query.includes("नमस्ते") || query.includes("हैलो") || query.includes("मदद") || query.includes("सहायता") || query.includes("कैसे हो")) {
    return "नमस्ते एलेक्स! मैं आपका यूनीकेयर एआई स्वास्थ्य साथी हूँ। मैं आपके बायो-डेटा का विश्लेषण कर सकता हूँ, दर्द के लक्षणों का मूल्यांकन कर सकता हूँ, या पोषण योजना तैयार कर सकता हूँ। आज मैं आपकी क्या सहायता करूँ?";
  }

  // --- ENGLISH PATTERNS ---
  if (query.includes("sleep") || query.includes("hrv")) {
    return "Looking at your telemetry: Your Heart Rate Variability (HRV) average dropped to 62ms last night (normally 74ms), which indicates minor autonomic fatigue. Combined with your sleep duration of 8.2 hours (but with low deep sleep), your body is recovering slower. Recommendation: Postpone heavy weight lifting; opt for a 20-minute restorative yoga or breathing cycle. Drink 500ml of mineral-rich fluids now.";
  }

  if (query.includes("breathing") || query.includes("stress") || query.includes("stressed")) {
    return "I notice your logged mood is Calm, but you mentioned feeling stressed. Your HRV last night was 74ms, which indicates a good recovery state, but daily screen time has been high. Let's do a 5-minute box breathing session (4s inhale, 4s hold, 4s exhale, 4s hold) to calm your nervous system. You can try the animated breathing coach in the Mental Wellness module. If stress becomes overwhelming, seeking support from a therapist is recommended.";
  }

  if (query.includes("nutrition") || query.includes("meal") || query.includes("lunch")) {
    return "Here is a personalized high-protein vegetarian meal formula containing approximately 680 kcal, 38g protein:\n\n- **Base**: 1 cup cooked Quinoa & Spiced Lentils\n- **Proteins**: 150g Seared Sesame Tempeh\n- **Vitamins/Fibers**: Roast Broccoli, Bell Peppers, and Baby Spinach\n- **Fats**: 1/4 Avocado & Lemon Tahini Drizzle\n\nThis meal is enriched with magnesium and potassium to support muscular repair and autonomic recovery.";
  }

  if (query.includes("cycle") || query.includes("phase")) {
    return "Analyzing hormonal markers: You are currently in the mid-follicular phase. Oestrogen is beginning to rise, which enhances cardiovascular output, energy efficiency, and bone-building capacity. This is an excellent stage to increase progressive training loads in your Fitness module and engage in strength workouts. Keep hydration steady at 2.8L.";
  }

  if (query.includes("headache")) {
    return "I understand you have had a headache. As your UniCare AI, I must remind you that I cannot diagnose diseases or medical conditions. Based on your profile (Alex, 28, Male), your logged water intake is only 1.5L today, which is below your 3.0L target. Dehydration is a common headache trigger. I suggest drinking 500ml of water and resting. Are you experiencing other symptoms like fever or vision changes? If this headache is unusually severe, sudden, or persistent, please consult a healthcare professional immediately.";
  }

  if (query.includes("medicine") || query.includes("medication")) {
    return "Let me check your medication schedule: You have logged your morning multivitamins as taken at 9:00 AM today. There are no other medications scheduled for the rest of the day. To help you stay on track, I can set voice alerts for future dosages. If you suspect you missed a prescription, please cross-reference your physical container or contact your pharmacist.";
  }

  if (query.includes("breakfast") || query.includes("what should i eat")) {
    return "Given your profile (75kg, 180cm) and goal of improving cardiovascular endurance, I suggest a nutrient-dense breakfast: rolled oats with Greek yogurt, chia seeds, sliced bananas, and raw almonds. This combination provides complex carbs, high protein, and healthy fats to fuel your active metabolism. Make sure to pair it with a glass of water, as your current logged intake is low at 1.5L.";
  }

  if (query.includes("water") || query.includes("hydration") || query.includes("drink")) {
    return "Your customized daily hydration target is 3.0L (3,000ml). According to your dashboard tracker, you have logged 1,500ml (1.5L) today. You are at 50% of your target. To prevent headaches and maintain physical performance, I recommend drinking a 250ml glass of water right now. I can log it for you!";
  }

  if (query.includes("appointment")) {
    return "Reviewing your UniCare Preventive Care Timeline: Your next scheduled checkup is a Dermatology Skin Mapping checkup in 3 months. There are no medical appointments scheduled for today. Would you like me to help you look for available physician consults or schedule a routine checkup?";
  }

  if (query.includes("workout") || query.includes("exercise") || query.includes("activity")) {
    return "Based on your activity tracker, you have logged 9,240 steps and burned 640 active kcal today against your 800 active kcal goal. Since your physical recovery is optimal and sleep was 8h 12m, I recommend a moderate 25-minute outdoor jog or a steady-state cardio session to complete your daily goal without overtraining your muscles. Remember to bring a water bottle!";
  }

  if (query.includes("summary") || query.includes("how is my health")) {
    return "Here is your spoken health summary for today: You slept 8h 12m with a 92% efficiency index. Your active calories are at 640 kcal (9,240 steps), which is 80% of your target. Your mood is logged as Calm, and you completed your 9 AM multivitamin dose. However, your hydration is low at 1.5L logged. I recommend drinking some water and completing a light workout to finish your daily goals.";
  }

  // Generate varied default answers
  const defaultAnswers = [
    "Thank you for sharing that. I'm analyzing your active biometrics to compile custom suggestions. We notice your active calories are steady at 640 kcal, but your hydration logged is low today (1.5L). Let's log another glass of water first.",
    "Interesting query. Based on your cardiovascular goals and your sleep efficiency of 92%, you are well-positioned for physical activity. Is there a specific workout or nutrition plan you would like me to detail?",
    "Reviewing your profile context: Alex, age 28, male, with seasonal asthma. Your biometrics show steady resting vitals. To optimize recovery, try to maintain your daily sleep above 8 hours and drink 3.0L of water. How else can I assist your health tracking today?"
  ];
  const randomIndex = Math.abs(text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % defaultAnswers.length;
  return defaultAnswers[randomIndex];
}
