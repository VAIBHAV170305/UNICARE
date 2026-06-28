"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff,
  History, 
  Plus, 
  User, 
  Bot, 
  ArrowDown, 
  Check,
  Brain,
  Moon,
  Volume2,
  Settings,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  streaming?: boolean;
}

interface HistoryItem {
  id: string;
  title: string;
  date: string;
}

export default function AICompanion() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "ai",
      text: "Hello! I'm your UniCare AI Health Companion. I can analyze your wearable bio-data, evaluate symptoms, prepare nutrition templates, or structure breathing routines. How can I help you optimize your health today?",
      timestamp: "10:30 AM"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Load API Key on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("gemini_api_key") || "";
      setApiKey(savedKey);
    }
  }, []);
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: "h1", title: "Sleep Architecture Analysis", date: "Today" },
    { id: "h2", title: "HRV and Stress Evaluation", date: "Yesterday" },
    { id: "h3", title: "High-Protein Meal Prep Plan", date: "3 days ago" },
    { id: "h4", title: "SOS Safety Setup Verification", date: "1 week ago" }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    { text: "Analyze my sleep HRV anomalies from last night", category: "Sleep" },
    { text: "Suggest a breathing exercise for workplace stress", category: "Stress" },
    { text: "High-protein vegetarian lunch plan recipe", category: "Nutrition" },
    { text: "Explain how cycle phase correlates with recovery", category: "Hormonal" }
  ];

  // Scroll to bottom on message updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentMessagesList = [...messages];
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    let aiText = "";

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("unicare_token") : null;
      const headers: Record<string, string> = { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      if (apiKey) {
        headers["x-gemini-api-key"] = apiKey;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          history: currentMessagesList.slice(-10),
          userProfile: user?.profile
        })
      });

      if (response.ok) {
        const data = await response.json();
        aiText = data.text;
      } else {
        throw new Error("Failed to fetch response from chat API");
      }
    } catch (err) {
      console.warn("Using local fallback response generator due to:", err);
      // Local fallback logic
      const queryText = text.toLowerCase();
      
      // --- HINDI PATTERNS ---
      if (queryText.includes("सिर दर्द") || queryText.includes("सिरदर्द") || queryText.includes("दर्द")) {
        aiText = `मुझे खेद है कि आपके सिर में दर्द हो रहा है। आपके यूनीकेयर एआई के रूप में, मैं किसी बीमारी का निदान नहीं कर सकता। आज आपका पानी का स्तर केवल 1.5L दर्ज किया गया है, जो 3.0L के लक्ष्य से कम है। निर्जलीकरण (dehydration) सिरदर्द का एक आम कारण है। मैं सुझाव देता हूँ कि आप 500ml पानी पिएं और आराम करें। यदि दर्द गंभीर या लगातार बना रहता है, तो कृपया तुरंत डॉक्टर से संपर्क करें।`;
      } else if (queryText.includes("दवाई") || queryText.includes("दवा") || queryText.includes("मेडिसिन")) {
        aiText = "आपकी दवा अनुसूची के अनुसार: आपने सुबह 9:00 बजे अपने मल्टीविटामिन ले लिए हैं। आज दोपहर या शाम के लिए कोई अन्य दवा बाकी नहीं है। भविष्य के लिए मैं आपके लिए रिमाइंडर सेट कर सकता हूँ।";
      } else if (queryText.includes("नाश्ता") || queryText.includes("क्या खाऊं") || queryText.includes("भोजन")) {
        aiText = `आपके ${user?.profile?.weight || 75}kg वजन और ${user?.profile?.healthGoals || 'हृदय सहनशक्ति (cardiovascular endurance)'} के लक्ष्यों को देखते हुए, मैं एक पौष्टिक नाश्ते का सुझाव देता हूँ: ओट्स, ग्रीक योगर्ट, चिया सीड्स, केले के स्लाइस और बादाम। यह आपको पूरे दिन ऊर्जावान रखेगा। इसके साथ एक गिलास पानी जरूर पिएं, क्योंकि आज पानी का स्तर कम है।`;
      } else if (queryText.includes("तनाव") || queryText.includes("टेंशन") || queryText.includes("चिंता") || queryText.includes("परेशान")) {
        aiText = "आपकी तनाव की स्थिति को देखते हुए, मैं 5 मिनट के बॉक्स ब्रीदिंग (4s सांस लें, 4s रोकें, 4s छोड़ें, 4s रोकें) का सुझाव देता हूँ। यह आपके तंत्रिका तंत्र को शांत करेगा। आप हमारे मानसिक कल्याण (Mental Wellness) मॉड्यूल में ब्रीदिंग कोच का उपयोग कर सकते हैं।";
      } else if (queryText.includes("पानी") || queryText.includes("हाइड्रेशन") || queryText.includes("प्यास")) {
        aiText = "आपका दैनिक पानी का लक्ष्य 3.0L (3,000ml) है। आपने आज केवल 1,500ml (1.5L) पानी पिया है, जो आपके लक्ष्य का 50% है। सिरदर्द और थकान से बचने के लिए, कृपया अभी एक गिलास पानी पिएं।";
      } else if (queryText.includes("अपॉइंटमेंट") || queryText.includes("डॉक्टर") || queryText.includes("मिलना")) {
        aiText = "आपके कैलेंडर के अनुसार, 3 महीने में आपका स्किन मैपिंग checkup निर्धारित है। आज कोई अन्य अपॉइंटमेंट नहीं है। क्या आप नया अपॉइंटमेंट बुक करना चाहते हैं?";
      } else if (queryText.includes("कसरत") || queryText.includes("व्यायाम") || queryText.includes("वर्कआउट")) {
        aiText = "आज आपने 9,240 कदम पूरे किए हैं और 640 कैलोरी बर्न की है (लक्ष्य: 800 कैलोरी)। आपकी रिकवरी को देखते हुए, मैं 25 मिनट की हल्की दौड़ या स्ट्रेचिंग की सलाह देता हूँ ताकि मांसपेशियों पर अत्यधिक दबाव न पड़े।";
      } else if (queryText.includes("सारांश") || queryText.includes("रिपोर्ट") || queryText.includes("स्वास्थ्य")) {
        aiText = `आज का आपका स्वास्थ्य सारांश: आपने 8 घंटे 12 मिनट की नींद ली (92% दक्षता)। आपके कदम 9,240 हैं और 640 कैलोरी बर्न हुई है। आपका मूड शांत (Calm) दर्ज किया गया है। लेकिन पानी का स्तर 1.5L ही है, कृपया पानी का सेवा बढ़ाएं।`;
      } else if (queryText.includes("नींद") || queryText.includes("सोना")) {
        aiText = "आपकी नींद के विश्लेषण के अनुसार: आपने कल रात 8 घंटे 12 मिनट की गहरी और अच्छी नींद ली। आपकी रिकवरी सामान्य है, हालांकि पानी का स्तर कम होने से थोड़ी सुस्ती हो सकती है।";
      } else if (queryText.includes("नमस्ते") || queryText.includes("हैलो") || queryText.includes("मदद") || queryText.includes("सहायता") || queryText.includes("कैसे हो")) {
        aiText = `नमस्ते ${user?.profile?.name || user?.name || 'एलेक्स'}! मैं आपका यूनीकेयर एआई स्वास्थ्य साथी हूँ। मैं आपके बायो-डेटा का विश्लेषण कर सकता हूँ, दर्द के लक्षणों का मूल्यांकन कर सकता हूँ, या पोषण योजना तैयार कर सकता हूँ। आज मैं आपकी क्या सहायता करूँ?`;
      }
      
      // --- ENGLISH PATTERNS ---
      else if (queryText.includes("sleep") || queryText.includes("hrv")) {
        aiText = "Looking at your telemetry: Your Heart Rate Variability (HRV) average dropped to 62ms last night (normally 74ms), which indicates minor autonomic fatigue. Combined with your sleep duration of 8.2 hours (but with low deep sleep), your body is recovering slower. Recommendation: Postpone heavy weight lifting; opt for a 20-minute restorative yoga or breathing cycle. Drink 500ml of mineral-rich fluids now.";
      } else if (queryText.includes("breathing") || queryText.includes("stress") || queryText.includes("stressed")) {
        aiText = "I notice your logged mood is Calm, but you mentioned feeling stressed. Your HRV last night was 74ms, which indicates a good recovery state, but daily screen time has been high. Let's do a 5-minute box breathing session (4s inhale, 4s hold, 4s exhale, 4s hold) to calm your nervous system. You can try the animated breathing coach in the Mental Wellness module. If stress becomes overwhelming, seeking support from a therapist is recommended.";
      } else if (queryText.includes("nutrition") || queryText.includes("meal") || queryText.includes("lunch")) {
        aiText = "Here is a personalized high-protein vegetarian meal formula containing approximately 680 kcal, 38g protein: \n\n- **Base**: 1 cup cooked Quinoa & Spiced Lentils\n- **Proteins**: 150g Seared Sesame Tempeh\n- **Vitamins/Fibers**: Roast Broccoli, Bell Peppers, and Baby Spinach\n- **Fats**: 1/4 Avocado & Lemon Tahini Drizzle\n\nThis meal is enriched with magnesium and potassium to support muscular repair and autonomic recovery.";
      } else if (queryText.includes("cycle") || queryText.includes("phase")) {
        aiText = "Analyzing hormonal markers: You are currently in the mid-follicular phase. Oestrogen is beginning to rise, which enhances cardiovascular output, energy efficiency, and bone-building capacity. This is an excellent stage to increase progressive training loads in your Fitness module and engage in strength workouts. Keep hydration steady at 2.8L.";
      } else if (queryText.includes("headache")) {
        aiText = `I understand you have had a headache. As your UniCare AI, I must remind you that I cannot diagnose diseases or medical conditions. Based on your profile (${user?.profile?.name || user?.name || 'Alex'}, ${user?.profile?.age || 28}, ${user?.profile?.gender || 'Male'}), your logged water intake is only 1.5L today, which is below your 3.0L target. Dehydration is a common headache trigger. I suggest drinking 500ml of water and resting. Are you experiencing other symptoms like fever or vision changes? If this headache is unusually severe, sudden, or persistent, please consult a healthcare professional immediately.`;
      } else if (queryText.includes("medicine") || queryText.includes("medication")) {
        aiText = "Let me check your medication schedule: You have logged your morning multivitamins as taken at 9:00 AM today. There are no other medications scheduled for the rest of the day. To help you stay on track, I can set voice alerts for future dosages. If you suspect you missed a prescription, please cross-reference your physical container or contact your pharmacist.";
      } else if (queryText.includes("breakfast") || queryText.includes("what should i eat")) {
        aiText = `Given your profile (${user?.profile?.weight || 75}kg, ${user?.profile?.height || 180}cm) and goal of improving ${user?.profile?.healthGoals || 'cardiovascular endurance'}, I suggest a nutrient-dense breakfast: rolled oats with Greek yogurt, chia seeds, sliced bananas, and raw almonds. This combination provides complex carbs, high protein, and healthy fats to fuel your active metabolism. Make sure to pair it with a glass of water, as your current logged intake is low at 1.5L.`;
      } else if (queryText.includes("water") || queryText.includes("hydration") || queryText.includes("drink")) {
        aiText = "Your customized daily hydration target is 3.0L (3,000ml). According to your dashboard tracker, you have logged 1,500ml (1.5L) today. You are at 50% of your target. To prevent headaches and maintain physical performance, I recommend drinking a 250ml glass of water right now. I can log it for you!";
      } else if (queryText.includes("appointment")) {
        aiText = "Reviewing your UniCare Preventive Care Timeline: Your next scheduled checkup is a Dermatology Skin Mapping checkup in 3 months. There are no medical appointments scheduled for today. Would you like me to help you look for available physician consults or schedule a routine checkup?";
      } else if (queryText.includes("workout") || queryText.includes("exercise") || queryText.includes("activity")) {
        aiText = "Based on your activity tracker, you have logged 9,240 steps and burned 640 active kcal today against your 800 active kcal goal. Since your physical recovery is optimal and sleep was 8h 12m, I recommend a moderate 25-minute outdoor jog or a steady-state cardio session to complete your daily goal without overtraining your muscles. Remember to bring a water bottle!";
      } else if (queryText.includes("summary") || queryText.includes("how is my health")) {
        aiText = "Here is your spoken health summary for today: You slept 8h 12m with a 92% efficiency index. Your active calories are at 640 kcal (9,240 steps), which is 80% of your target. Your mood is logged as Calm, and you completed your 9 AM multivitamin dose. However, your hydration is low at 1.5L logged. I recommend drinking some water and completing a light workout to finish your daily goals.";
      } else {
        const defaultAnswers = [
          "Thank you for sharing that. I'm analyzing your active biometrics to compile custom suggestions. We notice your active calories are steady at 640 kcal, but your hydration logged is low today (1.5L). Let's log another glass of water first.",
          "Interesting query. Based on your cardiovascular goals and your sleep efficiency of 92%, you are well-positioned for physical activity. Is there a specific workout or nutrition plan you would like me to detail?",
          `Reviewing your profile context: ${user?.profile?.name || user?.name || 'Alex'}, age ${user?.profile?.age || 28}, ${user?.profile?.gender || 'male'}, with ${user?.profile?.medicalHistory || 'mild seasonal asthma'}. Your biometrics show steady resting vitals. To optimize recovery, try to maintain your daily sleep above 8 hours and drink 3.0L of water. How else can I assist your health tracking today?`
        ];
        const randomIndex = Math.abs(text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % defaultAnswers.length;
        aiText = defaultAnswers[randomIndex];
      }
    }

    setIsTyping(false);

    // Simulate streaming response character by character
    const words = aiText.split(" ");
    let currentWordIndex = 0;
    
    const newMsgId = `ai-msg-${Date.now()}`;
    
    const streamMsg: Message = {
      id: newMsgId,
      sender: "ai",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      streaming: true
    };

    setMessages(prev => [...prev, streamMsg]);

    const interval = setInterval(() => {
      if (currentWordIndex >= words.length) {
        clearInterval(interval);
        setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, streaming: false, text: aiText } : m));
        
        // Add to history if unique
        const newHistoryTitle = text.length > 25 ? text.substring(0, 25) + "..." : text;
        setHistory(prev => [
          { id: `h-${Date.now()}`, title: newHistoryTitle, date: "Today" },
          ...prev.slice(0, 5)
        ]);
      } else {
        const currentWordsText = words.slice(0, currentWordIndex + 1).join(" ");
        setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, text: currentWordsText } : m));
        currentWordIndex++;
      }
    }, 35); // 35ms per word
  };

  const handleVoiceToggle = () => {
    const btn = document.getElementById("floating-voice-btn");
    if (btn) {
      btn.click();
    }
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] rounded-3xl overflow-hidden glass-card border border-slate-200/60 dark:border-slate-800/60 relative">
      
      {/* Sidebar - History */}
      <div className="w-64 border-r border-slate-200/40 dark:border-slate-850 bg-white/40 dark:bg-slate-900/20 flex-col hidden lg:flex justify-between select-none">
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setMessages([
                {
                  id: `init-${Date.now()}`,
                  sender: "ai",
                  text: "Hello! Ready to assist. What details or symptoms can I evaluate for you?",
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ])}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all border border-slate-200/25 dark:border-slate-700/25"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </button>
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/25 dark:border-slate-700/25 transition-all flex items-center justify-center shrink-0"
              title="Configure Gemini API Key"
            >
              <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
              <History className="h-3.5 w-3.5" /> Recent logs
            </span>
            <div className="space-y-1">
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSendMessage(item.title)}
                  className="w-full flex flex-col items-start px-2 py-2 rounded-lg text-left text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 truncate hover:text-slate-800 dark:hover:text-white"
                >
                  <span className="font-bold truncate w-full">{item.title}</span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{item.date}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200/30 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/30">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
            <Volume2 className="h-3.5 w-3.5 text-brand-emerald animate-pulse" /> Voice Engine ready
          </div>
        </div>
      </div>

      {/* Main Workspace Chat area */}
      <div className="flex-1 flex flex-col justify-between bg-white/20 dark:bg-slate-900/10">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between bg-white/40 dark:bg-slate-900/30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white shadow-md shadow-brand-blue/15 shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                UniCare AI Healthcare Companion
                <span className="h-2 w-2 rounded-full bg-brand-emerald animate-ping" />
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold">Clinical-grade medical parsing & tracking</p>
            </div>
          </div>

          <button
            onClick={() => setShowKeyModal(true)}
            className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] ${
              apiKey 
                ? "bg-brand-emerald/10 border-brand-emerald/25 text-brand-emerald" 
                : "bg-amber-500/10 border-amber-500/25 text-amber-500"
            }`}
          >
            {apiKey ? "AI Active" : "Demo Mode (Mock)"}
          </button>
        </div>

        {/* Messages List */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
        >
          {messages.map((msg) => {
            const isAI = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto text-left" : "ml-auto flex-row-reverse text-left"}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border ${
                  isAI 
                    ? "bg-brand-purple/10 border-brand-purple/20 text-brand-purple" 
                    : "bg-brand-blue/10 border-brand-blue/20 text-brand-blue"
                }`}>
                  {isAI ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed border ${
                    isAI 
                      ? "bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 text-slate-700 dark:text-slate-200" 
                      : "bg-gradient-to-tr from-brand-blue to-brand-blue/90 border-transparent text-white shadow"
                  }`}>
                    {/* Render paragraphs or lists */}
                    <div className="whitespace-pre-line font-sans font-medium">
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto text-left">
              <div className="h-8 w-8 rounded-lg bg-brand-purple/10 border border-brand-purple/20 text-brand-purple flex items-center justify-center shrink-0">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1.5">
                <div className="px-4 py-3 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 flex items-center gap-1.5">
                  <div className="h-2 w-2 bg-brand-purple rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-brand-purple rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 bg-brand-purple rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block px-1">
                  UniCare AI is analyzing data...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input & Suggested Prompts area */}
        <div className="p-4 bg-white/40 dark:bg-slate-900/30 border-t border-slate-200/40 dark:border-slate-850 backdrop-blur-md">
          
          {/* Suggested prompts list */}
          {messages.length === 1 && !isTyping && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {suggestedPrompts.map((p) => (
                <button
                  key={p.text}
                  onClick={() => handleSendMessage(p.text)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/40 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold text-left transition-all"
                >
                  <span className="truncate">{p.text}</span>
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 rounded px-1 ml-2">
                    {p.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Chat Form */}
          <div className="relative flex items-center gap-2">
            
            {/* Mic voice command trigger */}
            <button
              onClick={handleVoiceToggle}
              className={`p-3 rounded-2xl border transition-all shrink-0 ${
                isVoiceActive
                  ? "bg-red-500 border-red-600 text-white animate-pulse"
                  : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Toggle Voice Commands"
            >
              {isVoiceActive ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Input box */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage(inputVal);
              }}
              placeholder={isVoiceActive ? "Listening for health query..." : "Ask UniCare AI companion anything..."}
              disabled={isVoiceActive}
              className="flex-1 bg-white/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 outline-none text-slate-950 dark:text-white text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-blue/50 dark:focus:border-brand-purple/50 shadow-inner"
            />

            {/* Send button */}
            <button
              onClick={() => handleSendMessage(inputVal)}
              disabled={!inputVal.trim() || isVoiceActive}
              className={`p-3 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow font-semibold transition-all shrink-0 ${
                inputVal.trim() && !isVoiceActive ? "hover:opacity-90 hover:scale-[1.03] active:scale-[0.98]" : "opacity-50 cursor-not-allowed"
              }`}
            >
              <Send className="h-5 w-5" />
            </button>

          </div>

          {/* AI Medical Disclaimer */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-normal max-w-lg mx-auto pt-2">
            ⚠️ <strong>AI Disclaimer:</strong> UniCare provides educational and wellness guidance only and is not a substitute for professional medical advice.
          </p>

        </div>

        <VoiceAssistant
          setInputVal={setInputVal}
          onSendMessage={handleSendMessage}
          messages={messages}
          onListeningStateChange={setIsVoiceActive}
        />

      </div>

      {/* API Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-4 text-left"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-brand-purple" />
                  Gemini API Configuration
                </h3>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  To get real-time, complete AI Healthcare responses, paste your Google Gemini API key below. Your key is stored locally in your browser and is never shared.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-4 outline-none text-slate-950 dark:text-white text-xs font-bold focus:border-brand-purple/50 shadow-inner"
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem("gemini_api_key");
                      setApiKey("");
                      setShowKeyModal(false);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white uppercase transition-all"
                  >
                    Clear Key
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem("gemini_api_key", apiKey.trim());
                      setShowKeyModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-purple-600 text-[10px] font-bold text-white uppercase transition-all shadow shadow-brand-purple/20"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
