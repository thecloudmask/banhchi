import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp,
  serverTimestamp,
  where,
  limit,
  deleteField,
  onSnapshot
} from "firebase/firestore";
import { uploadToCloudinary, uploadMultipleToCloudinary } from "@/lib/cloudinary";
import { Event, Guest, AuditLog } from "@/types";

const EVENTS_COLLECTION = "events";

export const getEvents = async (): Promise<Event[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, EVENTS_COLLECTION), orderBy("eventDate", "desc"), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getEventById = async (id: string): Promise<Event | null> => {
  if (!db) return null;
  try {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Event;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const createEvent = async (
  data: Omit<Event, "id" | "createdAt" | "status" | "bannerUrl" | "galleryUrls">, 
  bannerFile?: File,
  galleryFiles?: File[]
): Promise<string> => {
  if (!db) throw new Error("Firebase services not initialized");
  
  let bannerUrl = "";
  let galleryUrls: string[] = [];

  if (bannerFile) {
    bannerUrl = await uploadToCloudinary(bannerFile, "banners", 'banner');
  }

  if (galleryFiles && galleryFiles.length > 0) {
    galleryUrls = await uploadMultipleToCloudinary(galleryFiles, "galleries");
  }

  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
    ...data,
    bannerUrl,
    galleryUrls,
    status: 'active',
    eventDate: Timestamp.fromDate(data.eventDate as Date),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateEvent = async (
  id: string, 
  data: Partial<Omit<Event, "id" | "createdAt">>, 
  bannerFile?: File, 
  bankQrFile?: File,
  galleryFiles?: File[]
): Promise<void> => {
  if (!db) throw new Error("Database not initialized");
  
  let updateData: any = { ...data };

  if (bannerFile) {
    updateData.bannerUrl = await uploadToCloudinary(bannerFile, "banners", 'banner');
  }

  if (bankQrFile) {
    updateData.bankQrUrl = await uploadToCloudinary(bankQrFile, "bank_qrs", 'thumbnail');
  }

  if (galleryFiles && galleryFiles.length > 0) {
    const newUrls = await uploadMultipleToCloudinary(galleryFiles, "galleries");
    // If we have existing galleryUrls in data, append. Otherwise, fetch or just set.
    // However, the UI usually passes the full 'galleryUrls' list if it wants to manage removals.
    // If galleryFiles is provided, we append them to whatever is in updateData.galleryUrls or event.galleryUrls.
    const currentUrls = updateData.galleryUrls || [];
    updateData.galleryUrls = [...currentUrls, ...newUrls];
  }

  if (data.eventDate) {
    updateData.eventDate = Timestamp.fromDate(data.eventDate as Date);
  }

  // Remove undefined values to prevent Firebase errors
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  const docRef = doc(db, EVENTS_COLLECTION, id);
  await updateDoc(docRef, updateData);
};

export const deleteEvent = async (id: string): Promise<void> => {
  if (!db) return;
  const docRef = doc(db, EVENTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// --- Guest Sub-collection ---

export const getGuests = async (eventId: string): Promise<Guest[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION, eventId, "guests"), 
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guest));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const subscribeToGuests = (eventId: string, callback: (guests: Guest[]) => void) => {
  if (!db) return () => {};
  
  const q = query(
    collection(db, EVENTS_COLLECTION, eventId, "guests"), 
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const guests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guest));
    callback(guests);
  }, (error) => {
    console.error("Guest subscription failed", error);
  });
};

// --- Audit Logging System ---
export const logActivity = async (
  eventId: string, 
  action: 'CREATE' | 'UPDATE' | 'DELETE', 
  details: string,
  guestId?: string,
  oldValue?: any,
  newValue?: any
) => {
  if (!db) return;
  try {
    await addDoc(collection(db, EVENTS_COLLECTION, eventId, "logs"), {
      guestId,
      action,
      details,
      oldValue,
      newValue,
      timestamp: serverTimestamp(),
      userId: auth?.currentUser?.uid || "anonymous"
    });
  } catch (error) {
    console.error("Failed to log activity", error);
  }
};

export const addGuest = async (eventId: string, guest: Omit<Guest, "id" | "createdAt">): Promise<string> => {
  if (!db) throw new Error("Database not initialized");
  const docRef = await addDoc(collection(db, EVENTS_COLLECTION, eventId, "guests"), {
    ...guest,
    createdAt: serverTimestamp(),
  });

  const contributionSummary = `$${guest.amountUsd}, ${guest.amountKhr} ៛`;

  await logActivity(
    eventId, 
    'CREATE', 
    `Added guest [${guest.name}] with [${contributionSummary}]`,
    docRef.id,
    null,
    guest
  );

  return docRef.id;
};

export const updateGuest = async (eventId: string, guestId: string, data: Partial<Guest>) => {
  if (!db) throw new Error("Database not initialized");
  const docRef = doc(db, EVENTS_COLLECTION, eventId, "guests", guestId);
  const oldDoc = await getDoc(docRef);
  const oldValue = oldDoc.exists() ? oldDoc.data() : null;

  await updateDoc(docRef, data);

  // Generate detailed change log
  let changes = [];
  if (data.name && data.name !== oldValue?.name) changes.push(`name: ${oldValue?.name} -> ${data.name}`);
  if (data.amountUsd !== undefined && data.amountUsd !== oldValue?.amountUsd) changes.push(`usd: ${oldValue?.amountUsd} -> ${data.amountUsd}`);
  if (data.amountKhr !== undefined && data.amountKhr !== oldValue?.amountKhr) changes.push(`khr: ${oldValue?.amountKhr} -> ${data.amountKhr}`);
  if (data.paymentMethod && data.paymentMethod !== oldValue?.paymentMethod) changes.push(`method: ${oldValue?.paymentMethod} -> ${data.paymentMethod}`);
  
  await logActivity(
    eventId, 
    'UPDATE', 
    `Updated guest [${oldValue?.name || 'Unknown'}]. Changes: ${changes.join(', ') || 'None'}`,
    guestId,
    oldValue,
    data
  );
};

export const deleteGuest = async (eventId: string, guestId: string) => {
  if (!db) throw new Error("Database not initialized");
  const docRef = doc(db, EVENTS_COLLECTION, eventId, "guests", guestId);
  const oldDoc = await getDoc(docRef);
  const oldValue = oldDoc.exists() ? oldDoc.data() : null;

  await deleteDoc(docRef);

  await logActivity(
    eventId, 
    'DELETE', 
    `Deleted guest [${oldValue?.name || 'Unknown'}]`,
    guestId,
    oldValue,
    null
  );
};

export const getGuestLogs = async (eventId: string, guestId: string): Promise<AuditLog[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION, eventId, "logs"),
      where("guestId", "==", guestId)
    );
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
    
    return logs.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp as any).toMillis?.() || 0;
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp as any).toMillis?.() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getEventLogs = async (eventId: string, limitCount: number = 20): Promise<AuditLog[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION, eventId, "logs"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
  } catch (error) {
    console.error(error);
    return [];
  }
};
