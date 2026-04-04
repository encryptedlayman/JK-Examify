import { GoogleGenAI, Type } from "@google/genai";
import { db, auth } from "../firebase";
import { collection, addDoc, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { MCQ } from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function getMCQCount(category?: string, topic?: string): Promise<number> {
  const path = "mcqs";
  try {
    const mcqCollection = collection(db, path);
    let q = query(mcqCollection);
    
    if (category) {
      q = query(q, where("category", "==", category));
    }
    if (topic) {
      q = query(q, where("topic", "==", topic));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting MCQ count:", error);
    return 0;
  }
}

export async function generateMCQs(category: string, topic: string, count: number = 10) {
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
        answer: { type: Type.INTEGER, description: "0-3 index of correct option" },
        explanation: { type: Type.STRING },
        difficulty: { type: Type.STRING, description: "Difficulty level: Easy, Medium, or Hard" },
        topic: { type: Type.STRING },
        category: { type: Type.STRING },
        examType: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["question", "options", "answer", "explanation", "difficulty", "topic", "category"]
    }
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate ${count} high-quality, recently asked multiple-choice questions for the ${category} exam on the topic: ${topic}. 
    Ensure the questions are accurate, have clear explanations, and cover various difficulty levels.
    The exam types should include ${category} and relevant national exams like SSC.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: MCQ_SCHEMA,
    },
  });

  if (!response.text) {
    throw new Error("Empty response from Gemini");
  }

  return JSON.parse(response.text) as MCQ[];
}

export async function generateAndStoreMCQs(category: string, topic: string, count: number = 10) {
  try {
    const questions = await generateMCQs(category, topic, count);
    
    const mcqCollection = collection(db, "mcqs");
    const promises = questions.map(async (q) => {
      try {
        return await addDoc(mcqCollection, {
          ...q,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        // If it's a permission error, we just log it and return the questions anyway
        // This allows the admin to see what would have been stored
        console.warn("Could not store MCQ due to permissions:", error);
        return null;
      }
    });

    await Promise.all(promises);
    return questions;
  } catch (error) {
    console.error("Error generating/storing MCQs:", error);
    throw error;
  }
}

export async function getMCQsFromFirestore(category: string, topic: string, count: number = 10) {
  const path = "mcqs";
  try {
    const mcqCollection = collection(db, path);
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
      // Only try to store if we think we might have permission (admin)
      // For now, we'll just call generateAndStoreMCQs and it will handle permission errors internally
      const newMcqs = await generateAndStoreMCQs(category, topic, needed);
      return [...mcqs, ...newMcqs];
    }
    
    return mcqs;
  } catch (error) {
    // If it's a permission error on LIST, we fallback to just generating
    console.warn("Firestore list failed, falling back to generation:", error);
    return generateMCQs(category, topic, count);
  }
}
