import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail, // <-- New: Added for password reset
} from "firebase/auth";
import { auth } from "../firebaseConfig";

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user };
  } catch (error) {
    console.error("signIn error", error);
    throw error;
  }
};

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user };
  } catch (error) {
    console.error("signUp error", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("signOut error", error);
    throw error;
  }
};

// New function for Task 4: Sends a password reset email via Firebase
export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Export auth instance for use in other parts of the app
export const getAuthInstance = () => auth;
