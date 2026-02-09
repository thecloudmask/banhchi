import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  limit,
  deleteField
} from "firebase/firestore";
import { db } from "@/lib/firebase";
export { deleteField };

export interface Content {
  id: string;
  title: string;
  slug?: string;
  description?: string; // Short summary
  body: string; // HTML content or detailed text
  thumbnail?: string;
  images?: string[];
  eventId?: string; // Optional link to an event
  type: 'article' | 'agenda' | 'announcement' | 'poster' | string;
  status: 'draft' | 'published';
  author?: {
    name: string;
    photoURL?: string;
  };
  agenda?: {
    date?: string;
    items: { time: string; description: string }[];
  }[];
  committee?: {
    role: string;
    members: string[];
  }[];
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = "contents";

export const addContent = async (data: Omit<Content, "id" | "createdAt" | "updatedAt">) => {
  if (!db) throw new Error("Firebase not initialized");
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding content: ", error);
    throw error;
  }
};

export const updateContent = async (id: string, data: Partial<Content>) => {
  if (!db) throw new Error("Firebase not initialized");
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error updating content: ", error);
    throw error;
  }
};

export const deleteContent = async (id: string) => {
  if (!db) throw new Error("Firebase not initialized");
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return true;
  } catch (error) {
    console.error("Error deleting content: ", error);
    throw error;
  }
};

export const getContentById = async (id: string): Promise<Content | null> => {
  if (!db) throw new Error("Firebase not initialized");
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Content;
    }
    return null;
  } catch (error) {
    console.error("Error getting content: ", error);
    throw error;
  }
};

export const getAllContents = async (): Promise<Content[]> => {
  if (!db) throw new Error("Firebase not initialized");
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"), limit(50));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content));
  } catch (error) {
    console.error("Error getting contents: ", error);
    throw error;
  }
};

export const getContentsByEventId = async (eventId: string): Promise<Content[]> => {
  if (!db) throw new Error("Firebase not initialized");
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("eventId", "==", eventId)
      // orderBy("createdAt", "desc") // Commented out to avoid index requirements for now
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content));
  } catch (error) {
    console.error("Error getting contents by event: ", error);
    throw error;
  }
};
