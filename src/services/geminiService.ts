import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, limit } from "firebase/firestore";
import { MCQ } from "../types";

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export async function generateMCQs(
  category: string, 
  topic: string, 
  count: number = 10, 
  distribution: DifficultyDistribution = { easy: 40, medium: 40, hard: 20 }
): Promise<MCQ[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });

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
        difficulty: { type: Type.STRING, description: "Difficulty level: Easy, Medium, or Hard" }
      },
      required: ["question", "options", "answer", "explanation", "difficulty"]
    }
  };

  const prompt = `You are an expert exam paper setter for JKSSB (Jammu & Kashmir Services Selection Board) and SSC (Staff Selection Commission). 
  Generate ${count} high-quality, exam-standard Multiple Choice Questions (MCQs) for the topic "${topic}" in the category "${category}". 
  
  Difficulty Distribution:
  - Easy: ${Math.round(count * distribution.easy / 100)} questions
  - Medium: ${Math.round(count * distribution.medium / 100)} questions
  - Hard: ${Math.round(count * (100 - distribution.easy - distribution.medium) / 100)} questions
  
  Guidelines:
  1. Relevance: Questions must be strictly based on the latest JKSSB/SSC syllabus for ${topic}.
  2. Format: Exactly 4 distinct and plausible options per question.
  3. Accuracy: Ensure the correct answer index (0-3) is 100% accurate.
  4. Explanations: Provide a clear, educational explanation for each answer that helps students learn the concept.
  5. Language: Use professional, clear English.
  
  Return the result as a JSON array matching the schema.`;

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  let retries = 0;
  const maxRetries = 5;
  const baseDelay = 2000;

  while (retries < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: MCQ_SCHEMA
        }
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      const rawMcqs = JSON.parse(response.text);
      return rawMcqs.map((m: any) => ({
        ...m,
        category,
        topic,
        examType: ["JKSSB", "SSC"]
      }));
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429;
      
      if (isRateLimit && retries < maxRetries - 1) {
        retries++;
        const delay = baseDelay * Math.pow(2, retries);
        console.warn(`Gemini Rate Limit hit. Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
        await wait(delay);
        continue;
      }
      
      console.error("Error generating MCQs:", error);
      return [];
    }
  }
  return [];
}

export async function generateMCQsFromPDF(
  category: string,
  topic: string,
  pdfBase64: string,
  count: number = 20
): Promise<MCQ[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });

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
        difficulty: { type: Type.STRING, description: "Difficulty level: Easy, Medium, or Hard" }
      },
      required: ["question", "options", "answer", "explanation", "difficulty"]
    }
  };

  const prompt = `You are an expert exam paper setter. 
  Extract and generate ${count} high-quality MCQs from the provided PDF document.
  The questions should be relevant to the topic "${topic}" and category "${category}".
  
  Guidelines:
  1. Use only information present in the PDF or highly relevant to the context.
  2. Format: Exactly 4 distinct options per question.
  3. Accuracy: Ensure the correct answer index (0-3) is accurate.
  4. Explanations: Provide a clear explanation for each answer based on the PDF content.
  
  Return the result as a JSON array matching the schema.`;

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  let retries = 0;
  const maxRetries = 3;
  const baseDelay = 2000;

  while (retries < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
          parts: [
            { inlineData: { data: pdfBase64, mimeType: "application/pdf" } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: MCQ_SCHEMA
        }
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      const rawMcqs = JSON.parse(response.text);
      return rawMcqs.map((m: any) => ({
        ...m,
        category,
        topic,
        examType: ["JKSSB", "SSC"]
      }));
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429;
      
      if (isRateLimit && retries < maxRetries - 1) {
        retries++;
        const delay = baseDelay * Math.pow(2, retries);
        await wait(delay);
        continue;
      }
      
      console.error("Error generating MCQs from PDF:", error);
      return [];
    }
  }
  return [];
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
