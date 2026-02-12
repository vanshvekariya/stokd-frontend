import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  OAuthProvider,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { FirebaseError } from 'firebase/app';
import { userSignup } from './auth.services';

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Get the Firebase ID token for backend authentication
    const token = await result.user.getIdToken();

    return {
      success: true,
      user: result.user,
      token,
    };
  } catch (error) {
    if (error instanceof FirebaseError) {
      return { success: false, error: error.code };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const signInWithApple = async () => {
  try {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    // Sign in with a popup
    const result = await signInWithPopup(auth, provider);
    // Get the Firebase ID token for backend authentication
    const token = await result.user.getIdToken();

    return {
      success: true,
      user: result.user,
      token,
    };
  } catch (error) {
    // Handle specific Apple Sign-In errors
    let errorMessage = 'Authentication failed';
    if (error.code) {
      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
          errorMessage =
            'An account already exists with a different credential';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage =
            'Popup was blocked. Please enable popups for this site.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in popup was closed';
          break;
        default:
          errorMessage = 'Apple Sign-In failed';
      }
    }

    return {
      success: false,
      error: errorMessage || 'An unexpected error occurred',
    };
  }
};

// Sign in with email and password
export const signIn = async ({ email, password }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await userCredential.user.getIdToken();

    return {
      success: true,
      user: userCredential.user,
      token,
    };
  } catch (error) {
    let errorMessage = 'Authentication failed';
    switch (error.code) {
      case 'auth/invalid-credential':
        errorMessage =
          'Invalid email or password. Please check your credentials.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password.';
        break;
      case 'auth/too-many-requests':
        errorMessage =
          'Too many failed login attempts. Please try again later.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      default:
        errorMessage = error.message || 'Authentication failed';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Sign up with email and password
export const signUp = async ({ email, password, name }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update user profile with name (optional)
    if (name) {
      await updateProfile(userCredential.user, {
        displayName: name,
      });
    }

    // Get Firebase ID token for backend authentication
    // const token = await userCredential.user.getIdToken();
    await userSignup();
    // Send token to your backend (optional)
    // await authenticateUserWithBackend({
    //   token,
    //   provider: 'email',
    //   isNewUser: true,
    // });

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    let errorMessage = 'Registration failed';

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email format.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please use a stronger password.';
        break;
      default:
        errorMessage = error.message || 'Registration failed';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    // Check if email exists
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);

    // if (signInMethods.length === 0) {
    //   console.log('No account found with this email address', signInMethods);
    //   return {
    //     success: false,
    //     error: 'No account found with this email address',
    //   };
    // }

    // Send reset email
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent successfully!',
    };
  } catch (error) {
    let errorMessage = 'Failed to send password reset email';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please try again later';
        break;
      default:
        errorMessage = error.message || 'Failed to send password reset email';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Function to get current user's Firebase token
export const getCurrentUserToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    return await user.getIdToken(true);
  } catch (error) {
    return error;
  }
};

// Authentication state observer (use in your AuthContext)
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
