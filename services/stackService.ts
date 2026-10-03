import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../context/AuthContext';

export interface UserStack {
  id: string;
  userId: string;
  name: string;
  toolIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const stackService = {
  async getUserStacks(userId: string): Promise<UserStack[]> {
    if (!userId) return [];
    try {
      const q = query(collection(db, 'stacks'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as UserStack);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'stacks');
      return [];
    }
  },

  async getStackById(stackId: string): Promise<UserStack | null> {
    try {
      const docRef = doc(db, 'stacks', stackId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserStack;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `stacks/${stackId}`);
      return null;
    }
  },

  async createStack(userId: string, name: string, initialToolIds: string[] = []): Promise<UserStack> {
    if (!userId) throw new Error("userId missing");
    try {
      const newStackRef = doc(collection(db, 'stacks'));
      const now = new Date().toISOString();
      const newStack: UserStack = {
        id: newStackRef.id,
        userId,
        name,
        toolIds: initialToolIds,
        createdAt: now,
        updatedAt: now
      };
      await setDoc(newStackRef, newStack);
      return newStack;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `stacks`);
      throw error; // Will not be reached as handleFirestoreError throws
    }
  },

  async updateStackTools(stackId: string, toolIds: string[]): Promise<boolean> {
    try {
      const docRef = doc(db, 'stacks', stackId);
      await updateDoc(docRef, { 
        toolIds,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `stacks/${stackId}`);
      return false;
    }
  },

  async deleteStack(stackId: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'stacks', stackId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `stacks/${stackId}`);
      return false;
    }
  }
};
