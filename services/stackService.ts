import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../context/AuthContext';
import { TOOLS_REGISTRY } from '../constants';

export interface UserStack {
  id: string;
  userId: string;
  name: string;
  toolIds: string[];
  createdAt: string;
  updatedAt: string;
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

const CANONICAL_TOOL_IDS = new Set<string>(TOOLS_REGISTRY.map(t => t.id));

export function filterCanonicalToolIds(ids: unknown[]): string[] {
  if (!Array.isArray(ids)) return [];
  return ids
    .filter((id): id is string => typeof id === 'string' && CANONICAL_TOOL_IDS.has(id.trim()))
    .map(id => id.trim())
    .slice(0, 100);
}

export const stackService = {
  async getUserStacks(userId: string): Promise<UserStack[]> {
    if (!userId) return [];
    try {
      const q = query(collection(db, 'stacks'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: normalizeTimestamp(data.updatedAt),
        } as UserStack;
      });
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
        const data = docSnap.data();
        return {
          ...data,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: normalizeTimestamp(data.updatedAt),
        } as UserStack;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `stacks/${stackId}`);
      return null;
    }
  },

  async createStack(userId: string, name: string, initialToolIds: string[] = []): Promise<UserStack> {
    const verifiedUid = auth.currentUser?.uid || userId;
    if (!verifiedUid) throw new Error("Authenticated userId is required to create a stack");
    
    // Strict registry validation: only canonical registered tools are persisted
    const validatedToolIds = filterCanonicalToolIds(initialToolIds);
    const sanitizedName = name.trim().slice(0, 100) || "Custom Workflow Stack";

    try {
      const newStackRef = doc(collection(db, 'stacks'));
      const payload = {
        id: newStackRef.id,
        userId: verifiedUid,
        name: sanitizedName,
        toolIds: validatedToolIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(newStackRef, payload);
      return {
        id: newStackRef.id,
        userId: verifiedUid,
        name: sanitizedName,
        toolIds: validatedToolIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `stacks`);
      throw error;
    }
  },

  async updateStackTools(stackId: string, toolIds: string[]): Promise<boolean> {
    const validatedToolIds = filterCanonicalToolIds(toolIds);
    try {
      const docRef = doc(db, 'stacks', stackId);
      await updateDoc(docRef, { 
        toolIds: validatedToolIds,
        updatedAt: serverTimestamp(),
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
