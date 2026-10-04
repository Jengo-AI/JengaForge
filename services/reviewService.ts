import { collection, doc, setDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
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

  /**
   * Adds or updates a review using deterministic reviewId `${userId}_${toolId}`.
   * This naturally enforces the constraint of 1 review per user per tool at the Firestore level.
   */
  addReview: async (toolId: string, userId: string, userName: string, userAvatar: string | undefined, rating: number, text: string): Promise<Review | null> => {
    try {
      const reviewId = `${userId}_${toolId}`;
      const newReview = {
        toolId,
        userId,
        userName,
        userAvatar: userAvatar || '',
        rating,
        text,
        createdAt: new Date().toISOString()
      };
      
      const reviewRef = doc(db, 'reviews', reviewId);
      await setDoc(reviewRef, newReview);
      return { id: reviewId, ...newReview };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reviews/${userId}_${toolId}`);
      return null;
    }
  }
};
