import { collection, doc, getDoc, setDoc, getDocs, query, where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../context/AuthContext';
import { sanitizeClientErrorMessage } from './securityUtils';

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

function normalizeTimestamp(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return new Date(value).toISOString();
  return new Date().toISOString();
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
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: data.updatedAt ? normalizeTimestamp(data.updatedAt) : undefined,
        } as Review;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
      return [];
    }
  },

  /**
   * Adds or updates a review using deterministic reviewId `${userId}_${toolId}`.
   * Derives user identity from the authenticated session (preventing spoofing)
   * and preserves immutable createdAt timestamp across updates using serverTimestamp().
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

      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        const updatePayload = {
          id: reviewId,
          toolId,
          userId,
          userName,
          userAvatar,
          rating: Math.min(5, Math.max(1, rating)),
          text: text.trim().slice(0, 2000),
          createdAt: existingData.createdAt,
          updatedAt: serverTimestamp(),
        };
        await setDoc(reviewRef, updatePayload);
        return {
          ...updatePayload,
          createdAt: normalizeTimestamp(existingData.createdAt),
          updatedAt: new Date().toISOString(),
        } as Review;
      } else {
        const createPayload = {
          id: reviewId,
          toolId,
          userId,
          userName,
          userAvatar,
          rating: Math.min(5, Math.max(1, rating)),
          text: text.trim().slice(0, 2000),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(reviewRef, createPayload);
        return {
          ...createPayload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Review;
      }
    } catch (error) {
      sanitizeClientErrorMessage(error, 'Unable to submit review. Please try again.');
      handleFirestoreError(error, OperationType.WRITE, `reviews/${reviewId}`);
      return null;
    }
  }
};
