import { collection, doc, getDoc, setDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
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
  updatedAt?: string;
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
   * Derives user identity from the authenticated session (preventing spoofing)
   * and preserves immutable createdAt timestamp across updates.
   */
  addReview: async (
    toolId: string,
    _passedUserId: string,
    _passedUserName: string,
    _passedAvatar: string | undefined,
    rating: number,
    text: string
  ): Promise<Review | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Authentication required to submit a review.");
    }

    const userId = currentUser.uid;
    const userName = currentUser.displayName?.trim() || 'Verified Builder';
    const userAvatar = currentUser.photoURL || '';
    const reviewId = `${userId}_${toolId}`;
    const reviewRef = doc(db, 'reviews', reviewId);

    try {
      const existingSnap = await getDoc(reviewRef);
      const now = new Date().toISOString();

      let reviewPayload: Review;
      if (existingSnap.exists()) {
        const existingData = existingSnap.data() as Review;
        reviewPayload = {
          id: reviewId,
          toolId,
          userId,
          userName,
          userAvatar,
          rating: Math.min(5, Math.max(1, rating)),
          text: text.trim().slice(0, 2000),
          createdAt: existingData.createdAt || now,
          updatedAt: now,
        };
      } else {
        reviewPayload = {
          id: reviewId,
          toolId,
          userId,
          userName,
          userAvatar,
          rating: Math.min(5, Math.max(1, rating)),
          text: text.trim().slice(0, 2000),
          createdAt: now,
          updatedAt: now,
        };
      }

      await setDoc(reviewRef, reviewPayload);
      return reviewPayload;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reviews/${reviewId}`);
      return null;
    }
  }
};
