import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, limit, orderBy } from "firebase/firestore";
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
        minItems: 4,
        maxItems: 4
      },
      answer: { type: Type.INTEGER, description: "0-3 index of correct option" },
      explanation: { type: Type.STRING },
      difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
      topic: { type: Type.STRING },
      category: { type: Type.STRING },
      examType: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["question", "options", "answer", "explanation", "difficulty", "topic", "category"]
  }
};

export async function generateAndStoreMCQs(category: string, topic: string, count: number = 10) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} high-quality, recently asked multiple-choice questions for the ${category} exam on the topic: ${topic}. 
      Ensure the questions are accurate, have clear explanations, and cover various difficulty levels.
      The exam types should include ${category} and relevant national exams like SSC.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: MCQ_SCHEMA,
      },
    });

    const questions: MCQ[] = JSON.parse(response.text);
    
    const mcqCollection = collection(db, "mcqs");
    const promises = questions.map(q => addDoc(mcqCollection, {
      ...q,
      createdAt: new Date().toISOString()
    }));

    await Promise.all(promises);
    return questions;
  } catch (error) {
    console.error("Error generating/storing MCQs:", error);
    throw error;
  }
}

export async function getMCQsFromFirestore(category: string, topic: string, count: number = 10) {
  try {
    const mcqCollection = collection(db, "mcqs");
    const q = query(
      mcqCollection,
      where("category", "==", category),
      where("topic", "==", topic),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    const mcqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MCQ));
    
    // If not enough questions in DB, generate more
    if (mcqs.length < count) {
      const needed = count - mcqs.length;
      const newMcqs = await generateAndStoreMCQs(category, topic, needed);
      return [...mcqs, ...newMcqs];
    }
    
    return mcqs;
  } catch (error) {
    console.error("Error fetching MCQs from Firestore:", error);
    // Fallback to Gemini if Firestore fails
    return generateAndStoreMCQs(category, topic, count);
  }
}
