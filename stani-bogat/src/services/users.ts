import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  DocumentReference,
} from "firebase/firestore";
import { db } from "../firebase";

export interface UserStats {
  uid: string;
  email?: string;
  displayName?: string;
  answeredCount: number;
  moneyEarned: number;
}

export function getUserDocRef(uid: string): DocumentReference {
  return doc(db, "users", uid);
}

export async function createUserIfNotExists(uid: string, data: Partial<UserStats>) {
  const ref = getUserDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: any = {
      uid,
      answeredCount: 0,
      moneyEarned: 0,
    };

    // copy only defined properties from data to avoid Firestore rejecting `undefined`
    Object.entries(data || {}).forEach(([k, v]) => {
      if (v !== undefined) payload[k] = v;
    });

    await setDoc(ref, payload);
  }
}

export async function incrementUserStats(uid: string, answeredDelta = 0, moneyDelta = 0) {
  const ref = getUserDocRef(uid);
  const updates: any = {};
  if (answeredDelta !== 0) updates.answeredCount = increment(answeredDelta);
  if (moneyDelta !== 0) updates.moneyEarned = increment(moneyDelta);
  if (Object.keys(updates).length === 0) return;
  await updateDoc(ref, updates);
}

export async function getUserStats(uid: string): Promise<UserStats | null> {
  const ref = getUserDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserStats;
}
