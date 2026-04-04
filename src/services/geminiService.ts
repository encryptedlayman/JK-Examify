import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, limit } from "firebase/firestore";
import { MCQ } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MCQ_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exactly 4 options"
      },
      answer: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
      explanation: { type: Type.STRING },
      difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
    },
    required: ["question", "options", "answer", "explanation", "difficulty"]
  }
};

export async function generateMCQs(category: string, topic: string, count: number = 10): Promise<MCQ[]> {
  const prompt = `Generate ${count} high-quality Multiple Choice Questions (MCQs) for the topic "${topic}" in the category "${category}". 
  The questions should be relevant for JKSSB and SSC exams. 
  Include a mix of Easy (40%), Medium (40%), and Hard (20%) difficulty levels.
  Each question must have exactly 4 options, a correct answer index (0-3), and a detailed explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: MCQ_SCHEMA
      }
    });

    const rawMcqs = JSON.parse(response.text || "[]");
    return rawMcqs.map((m: any) => ({
      ...m,
      category,
      topic,
      examType: ["JKSSB", "SSC"]
    }));
  } catch (error) {
    console.error("Error generating MCQs:", error);
    return [];
  }
}

export async function seedMCQs(category: string, topic: string) {
  const mcqs = await generateMCQs(category, topic, 10);
  const mcqCollection = collection(db, "mcqs");
  
  for (const mcq of mcqs) {
    await addDoc(mcqCollection, mcq);
  }
  return mcqs;
}

export async function getMCQsByTopic(topic: string, count: number = 10): Promise<MCQ[]> {
  const mcqCollection = collection(db, "mcqs");
  const q = query(mcqCollection, where("topic", "==", topic), limit(count));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    // Seed if empty (for demo)
    const category = "General Knowledge"; // Default or lookup
    return await seedMCQs(category, topic);
  }
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MCQ));
}
