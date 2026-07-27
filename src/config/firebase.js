/**
 * @file firebase.js
 * @description Inizializzazione facoltativa di Firebase Firestore & Auth.
 * Se le chiavi d'ambiente non sono presenti o se si preferisce l'uso offline, 
 * l'applicazione ricorre automaticamente al localStorage senza interrompere il funzionamento.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configurazione Firebase (può essere popolata con le proprie credenziali)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let db = null;

// Verifica se la configurazione di Firebase è attiva
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 Firebase Firestore inizializzato con successo!");
  } catch (error) {
    console.warn("⚠️ Errore nell'inizializzazione di Firebase. Utilizzo di localStorage:", error);
  }
} else {
  console.log("ℹ️ Firebase non configurato (modalità offline / localStorage attiva).");
}

export { db };
