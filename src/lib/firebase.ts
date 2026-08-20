// Firebase has been removed from this project.
// This file provides a stub FirebaseUser type to satisfy TypeScript references
// in DashboardContext without importing the Firebase SDK.

export type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};
