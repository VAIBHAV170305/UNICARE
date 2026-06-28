"use client";

import React, { useState } from "react";
import { 
  Utensils, 
  Droplet, 
  Flame, 
  Sparkles, 
  Plus, 
  CheckCircle, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Search,
  Trash2,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fats: number; // in g
}

export default function NutritionHydration() {
  const [waterAmount, setWaterAmount] = useState(1750); // in ml
  const [meals, setMeals] = useState<Record<string, MealItem[]>>({
    breakfast: [
      { id: "b1", name: "Steel-Cut Oats with Berries & Honey", calories: 340, protein: 12, carbs: 62, fats: 5 },
      { id: "b2", name: "Whey Protein Shake", calories: 180, protein: 30, carbs: 5, fats: 2 },
    ],
    lunch: [
      { id: "l1", name: "Seared Tempeh Quinoa Bowl", calories: 580, protein: 28, carbs: 75, fats: 16 },
    ],
    dinner: [],
  });

  const [addMealCategory, setAddMealCategory] = useState("dinner");
  const [addFoodName, setAddFoodName] = useState("");
  const [addCalories, setAddCalories] = useState("");
  const [addProtein, setAddProtein] = useState("");
  const [addCarbs, setAddCarbs] = useState("");
  const [addFats, setAddFats] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const recipes = [
    {
      title: "Mediterranean Salmon Bowl",
      desc: "Rich in omega-3 acids to support cardiovascular health.",
      time: "20 min",
      calories: 520,
      macros: "42g Protein &bull; 35g Carbs &bull; 18g Fats",
      foodItem: { id: "recipe-salmon", name: "Mediterranean Salmon Bowl", calories: 520, protein: 42, carbs: 35, fats: 18 }
    },
    {
      title: "Avocado Sourdough Toast",
      desc: "Healthy monounsaturated fats for sustained metabolic energy.",
      time: "10 min",
      calories: 320,
      macros: "8g Protein &bull; 24g Carbs &bull; 15g Fats",
      foodItem: { id: "recipe-toast", name: "Avocado Sourdough Toast", calories: 320, protein: 8, carbs: 24, fats: 15 }
    }
  ];

  const handleAddWater = (amt: number) => {
    setWaterAmount(prev => Math.min(prev + amt, 4000));
    if (waterAmount + amt >= 3000 && waterAmount < 3000) {
      confetti({
        particleCount: 60,
        spread: 40,
        colors: ["#3b82f6", "#10b981"]
      });
    }
  };

  const handleAddFood = () => {
    if (!addFoodName.trim()) return;

    const c = parseInt(addCalories) || 0;
    const p = parseInt(addProtein) || 0;
    const cb = parseInt(addCarbs) || 0;
    const f = parseInt(addFats) || 0;

    const newItem: MealItem = {
      id: `m-${Date.now()}`,
      name: addFoodName,
      calories: c,
      protein: p,
      carbs: cb,
      fats: f
    };

    setMeals(prev => ({
      ...prev,
      [addMealCategory]: [...prev[addMealCategory], newItem]
    }));

    setAddFoodName("");
    setAddCalories("");
    setAddProtein("");
    setAddCarbs("");
    setAddFats("");

    setSuccessMsg("Food added successfully");
    confetti({
      particleCount: 30,
      spread: 30,
      colors: ["#10b981"]
    });
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleQuickAddRecipe = (recipeItem: MealItem) => {
    setMeals(prev => ({
      ...prev,
      lunch: [...prev.lunch, { ...recipeItem, id: `r-${Date.now()}` }]
    }));
    setSuccessMsg(`Recipe added to lunch log`);
    confetti({
      particleCount: 50,
      spread: 45,
      colors: ["#10b981", "#3b82f6"]
    });
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleDeleteItem = (category: string, id: string) => {
    setMeals(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
  };

  // Compute totals
  const allMealItems = Object.values(meals).flat();
  const totalCalories = allMealItems.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein = allMealItems.reduce((acc, item) => acc + item.protein, 0);
  const totalCarbs = allMealItems.reduce((acc, item) => acc + item.carbs, 0);
  const totalFats = allMealItems.reduce((acc, item) => acc + item.fats, 0);

  const calTarget = 2200;
  const pTarget = 120;
  const cTarget = 250;
  const fTarget = 70;

  return (
    <div className="space-y-8 select-none pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <Utensils className="h-7 w-7 text-emerald-500 fill-current" /> Nutrition & Hydration Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            Macro-nutrient logging, water reminders, and healthy recipe plans.
          </p>
        </div>
      </div>

      {/* Grid 1: Calorie circle rings & Water hydration tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Caloric Intake Gauge */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-4.5 w-4.5 text-orange-500 fill-current" /> Calorie Tracker
            </h3>

            <div className="flex items-center gap-6 py-2">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="48"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={301.6}
                    initial={{ strokeDashoffset: 301.6 }}
                    animate={{ strokeDashoffset: 301.6 - (301.6 * totalCalories) / calTarget }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{totalCalories}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">consumed</span>
                </div>
              </div>

              <div className="space-y-2 flex-1 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">Target</span>
                  <span className="font-black text-slate-700 dark:text-white">{calTarget} kcal</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">Remaining</span>
                  <span className="font-black text-brand-blue">{Math.max(0, calTarget - totalCalories)} kcal</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-brand-emerald rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((totalCalories / calTarget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Macro breakdown */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-4 text-left">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Protein</span>
              <p className="text-sm font-black text-slate-700 dark:text-white mt-0.5">{totalProtein}g <span className="text-[10px] text-slate-400 font-semibold">/ {pTarget}g</span></p>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Carbs</span>
              <p className="text-sm font-black text-slate-700 dark:text-white mt-0.5">{totalCarbs}g <span className="text-[10px] text-slate-400 font-semibold">/ {cTarget}g</span></p>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Fats</span>
              <p className="text-sm font-black text-slate-700 dark:text-white mt-0.5">{totalFats}g <span className="text-[10px] text-slate-400 font-semibold">/ {fTarget}g</span></p>
            </div>
          </div>
        </div>

        {/* Water Hydration wave progress */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="h-4.5 w-4.5 text-brand-blue" /> Water Intake Hydration
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Target: 3,000ml (3.0L)</span>
            </div>

            {/* Dynamic Water wave progress bar container */}
            <div className="h-28 rounded-2xl border border-slate-200/20 bg-slate-100/50 dark:bg-slate-950/20 overflow-hidden relative flex items-center justify-center">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-brand-blue/20 dark:bg-brand-purple/20 transition-all duration-700" 
                style={{ height: `${Math.min((waterAmount / 3000) * 100, 100)}%` }}
              />
              <div className="relative flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-slate-800 dark:text-white">{waterAmount} <span className="text-xs font-semibold text-slate-400">ml</span></p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Logged today</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <button 
              onClick={() => handleAddWater(250)}
              className="flex-1 py-2 rounded-xl bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue text-brand-blue hover:text-white text-xs font-bold transition-all"
            >
              + 250ml
            </button>
            <button 
              onClick={() => handleAddWater(500)}
              className="flex-1 py-2 rounded-xl bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue text-brand-blue hover:text-white text-xs font-bold transition-all"
            >
              + 500ml
            </button>
            <button 
              onClick={() => setWaterAmount(0)}
              className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold transition-all"
              title="Reset Hydration"
            >
              Reset
            </button>
          </div>
        </div>

      </div>

      {/* Grid 2: Meal Logger (Left) & Recipes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Meal Logger */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between min-h-[400px]">
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4.5 w-4.5 text-brand-blue" /> Today&rsquo;s Meal Planner
              </h3>
              <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase">{allMealItems.length} items logged</span>
            </div>

            {/* Display categories */}
            <div className="space-y-4 pt-2">
              {["breakfast", "lunch", "dinner"].map((category) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{category}</h4>
                  
                  {meals[category].length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No food logged yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {meals[category].map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10 text-xs">
                          <div className="text-left">
                            <p className="font-bold text-slate-700 dark:text-slate-350">{item.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                              {item.calories} kcal &bull; P: {item.protein}g &bull; C: {item.carbs}g &bull; F: {item.fats}g
                            </p>
                          </div>
                          <button 
                            onClick={() => handleDeleteItem(category, item.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-550/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add custom food panel */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase mb-3">Add Custom Food</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={addFoodName}
                onChange={(e) => setAddFoodName(e.target.value)}
                placeholder="Food name (e.g. Greek Yogurt)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold outline-none focus:border-brand-blue"
              />
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  value={addCalories}
                  onChange={(e) => setAddCalories(e.target.value)}
                  placeholder="kcal"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold outline-none text-center"
                />
                <input
                  type="number"
                  value={addProtein}
                  onChange={(e) => setAddProtein(e.target.value)}
                  placeholder="P"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold outline-none text-center"
                />
                <input
                  type="number"
                  value={addCarbs}
                  onChange={(e) => setAddCarbs(e.target.value)}
                  placeholder="C"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold outline-none text-center"
                />
                <input
                  type="number"
                  value={addFats}
                  onChange={(e) => setAddFats(e.target.value)}
                  placeholder="F"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold outline-none text-center"
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-3">
              <select
                value={addMealCategory}
                onChange={(e) => setAddMealCategory(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-bold outline-none text-slate-600 dark:text-slate-350"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
              
              <button
                onClick={handleAddFood}
                className="py-2 px-4 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs shadow-sm transition-all"
              >
                Log Custom Food
              </button>
            </div>
            
            <AnimatePresence>
              {successMsg && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-brand-emerald font-bold text-center mt-3"
                >
                  {successMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Healthy Recipes */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between min-h-[400px]">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-brand-purple animate-pulse" /> AI Curated Recipes
            </h3>

            <div className="space-y-3.5 pt-2">
              {recipes.map(recipe => (
                <div key={recipe.title} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10 flex flex-col justify-between h-36">
                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">{recipe.title}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{recipe.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                      {recipe.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2 mt-2">
                    <span 
                      className="text-[9px] text-slate-500 font-bold"
                      dangerouslySetInnerHTML={{ __html: recipe.macros }}
                    />
                    <button
                      onClick={() => handleQuickAddRecipe(recipe.foodItem)}
                      className="flex items-center text-[10px] font-extrabold text-brand-blue dark:text-brand-purple hover:underline gap-0.5"
                    >
                      Quick Add <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl border border-slate-200/20 bg-slate-50/30 dark:bg-slate-900/30 text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-brand-blue" />
            <span>Recipe suggestions rotate every 24 hours based on physiological needs.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
