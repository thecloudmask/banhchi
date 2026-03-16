import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocs,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { Expense } from "@/types";
import { logActivity } from "./event.service";

const cleanData = (obj: any): any => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date || (obj.constructor && obj.constructor.name === 'Timestamp')) return obj;
  if (Array.isArray(obj)) return obj.map(cleanData);

  const cleaned: any = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== undefined) {
      cleaned[key] = cleanData(value);
    }
  });
  return cleaned;
};

const EVENTS_COLLECTION = "events";

export const getExpenses = async (eventId: string): Promise<Expense[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION, eventId, "expenses"), 
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
};

export const subscribeToExpenses = (eventId: string, callback: (expenses: Expense[]) => void) => {
  if (!db) return () => {};
  
  const q = query(
    collection(db, EVENTS_COLLECTION, eventId, "expenses"), 
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Expense));
    callback(expenses);
  });
};

export const addExpense = async (eventId: string, expense: Omit<Expense, "id" | "createdAt">): Promise<void> => {
  if (!db) return;
  try {
    const expenseData = cleanData({
      ...expense,
      createdAt: serverTimestamp()
    });
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION, eventId, "expenses"), expenseData);

    await logActivity(
      eventId,
      'CREATE',
      `Added expense [${expense.name}] - Budget: ${expense.budgetAmount}, Actual: ${expense.actualAmount}`,
      docRef.id,
      null,
      expense
    );
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

export const updateExpense = async (eventId: string, expenseId: string, data: Partial<Expense>): Promise<void> => {
  if (!db) return;
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId, "expenses", expenseId);
    const oldDoc = await getDoc(docRef);
    const oldValue = oldDoc.exists() ? oldDoc.data() : null;

    await updateDoc(docRef, cleanData({
      ...data,
      updatedAt: serverTimestamp()
    }));

    await logActivity(
      eventId,
      'UPDATE',
      `Updated expense [${oldValue?.name || 'Unknown'}]`,
      expenseId,
      oldValue,
      data
    );
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

export const deleteExpense = async (eventId: string, expenseId: string): Promise<void> => {
  if (!db) return;
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId, "expenses", expenseId);
    const oldDoc = await getDoc(docRef);
    const oldValue = oldDoc.exists() ? oldDoc.data() : null;

    await deleteDoc(docRef);

    await logActivity(
      eventId,
      'DELETE',
      `Deleted expense [${oldValue?.name || 'Unknown'}]`,
      expenseId,
      oldValue,
      null
    );
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};
