
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  logout: () => void;
  toggleSavedTool: (toolId: string) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  if (authError) {
    throw authError; // Throw during render so ErrorBoundary catches it
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Setup snapshot listener for the user document
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({ ...data, id: firebaseUser.uid } as User);
          }
        }, (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          } catch (e) {
            setAuthError(e as Error);
          }
        });
        
        // Initial fetch/create
        try {
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous User',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              joinedAt: new Date().toISOString(),
              savedToolIds: [],
              masteryLevel: 1,
              stacksCreated: 0
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          } else {
            const data = docSnap.data();
            setUser({ ...data, id: firebaseUser.uid } as User);
          }

          // Migrate any legacy local storage stacks to user's Firestore collection
          try {
            const legacyLocalStacks = localStorage.getItem('user_stacks');
            if (legacyLocalStacks) {
              const parsed = JSON.parse(legacyLocalStacks);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const { stackService } = await import('../services/stackService');
                for (const stack of parsed) {
                  if (stack?.name) {
                    await stackService.createStack(firebaseUser.uid, stack.name, stack.toolIds || stack.tools || []);
                  }
                }
              }
              localStorage.removeItem('user_stacks');
            }
          } catch (migError) {
            console.error("Local stack migration error:", migError);
            localStorage.removeItem('user_stacks');
          }
        } catch (error) {
          try {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          } catch (e) {
            setAuthError(e as Error);
          }
        }
        setIsAuthReady(true);
        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, updates);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
      } catch (e) {
        setAuthError(e as Error);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleSavedTool = async (toolId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const isSaved = user.savedToolIds.includes(toolId);
    const updatedIds = isSaved 
      ? user.savedToolIds.filter(id => id !== toolId)
      : [...user.savedToolIds, toolId];

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { savedToolIds: updatedIds });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
      } catch (e) {
        setAuthError(e as Error);
      }
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{ 
      user, login, updateProfile, logout, toggleSavedTool, 
      isAuthModalOpen, openAuthModal, closeAuthModal, isAuthReady
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
