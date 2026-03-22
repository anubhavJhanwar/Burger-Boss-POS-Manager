import { db } from '../config/firebase.js';

// Generic CRUD operations for Firestore
export const firebaseService = {
  // Create document
  async create(collection, data) {
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...data };
  },

  // Get all documents
  async getAll(collection) {
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get document by ID
  async getById(collection, id) {
    const doc = await db.collection(collection).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  // Update document
  async update(collection, id, data) {
    await db.collection(collection).doc(id).update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return { id, ...data };
  },

  // Delete document
  async delete(collection, id) {
    await db.collection(collection).doc(id).delete();
    return { id };
  },

  // Query with filters
  async query(collection, filters = []) {
    let query = db.collection(collection);
    filters.forEach(({ field, operator, value }) => {
      query = query.where(field, operator, value);
    });
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};
