// src/services/questions.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  level: number;
  money: number;
  answers: Answer[];
}

export async function getAllQuestions(): Promise<Question[]> {
  const ref = collection(db, "questions");
  const snap = await getDocs(ref);

  const questions: Question[] = snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Question, "id">),
  }));

  // сортирай по level за да върви 1 → 15
  return questions.sort((a, b) => a.level - b.level);
}
