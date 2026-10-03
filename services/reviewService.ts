import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../context/AuthContext';

export interface Review {
  id: string;
  toolId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  text: string;
  createdAt: string;
}

export const reviewService = {
  getToolReviews: async (toolId: string): Promise<Review[]> => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('toolId', '==', toolId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
      return [];
    }
  },

  addReview: async (toolId: string, userId: string, userName: string, userAvatar: string | undefined, rating: number, text: string): Promise<Review | null> => {
    try {
      const newReview = {
        toolId,
        userId,
        userName,
        userAvatar: userAvatar || '',
        rating,
        text,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      return { id: docRef.id, ...newReview };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
      return null;
    }
  }
};
