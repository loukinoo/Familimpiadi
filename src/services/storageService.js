/**
 * @file storageService.js
 * @description Gestore del salvataggio e recupero dati per Familimpiadi.
 * Supporta la modalità localStorage e Firebase Firestore per il sync live.
 */

import { db } from '../config/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import default2025 from '../data/defaultData2025.json';
import initialParticipants from '../data/initialParticipants.json';
import { createInitialTournamentState } from './tournamentLogic';

const STORAGE_KEY_PREFIX = 'familimpiadi_';
const ADMIN_PIN = '1234';

/**
 * Ottiene lo stato completo dell'edizione corrente
 */
export function getStoredState() {
  const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_state`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Errore parsing localStorage state:", e);
    }
  }

  // Stato iniziale di fallback basato su 2025
  const initialCouples = default2025.couples;
  const initialSports = default2025.sports;
  const sportsData = {};

  initialSports.forEach((sport) => {
    sportsData[sport] = createInitialTournamentState(initialCouples);
  });

  const initialState = {
    year: 2025,
    participants: initialParticipants,
    couples: initialCouples, // Può contenere sia stringhe che oggetti { name, members }
    sports: initialSports,
    sportsData: sportsData,
    suggestions: [
      { id: '1', sportName: 'Tiro con l\'Arco', author: 'Zio Corrado', status: 'approved' },
      { id: '2', sportName: 'Ping Pong', author: 'Kevin', status: 'pending' },
    ],
  };

  saveStoredState(initialState);
  return initialState;
}

/**
 * Salva lo stato corrente sia in localStorage che su Firebase Firestore.
 */
export function saveStoredState(state) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}current_state`, JSON.stringify(state));
  } catch (e) {
    console.error("Errore salvataggio localStorage:", e);
  }

  if (db) {
    try {
      const docRef = doc(db, "familimpiadi", "current");
      setDoc(docRef, state, { merge: true });
    } catch (err) {
      console.warn("Errore salvataggio Firestore:", err);
    }
  }
}

/**
 * Ascolta i cambiamenti in tempo reale se Firestore è configurato.
 */
export function subscribeToState(callback) {
  if (!db) return () => {};

  try {
    const docRef = doc(db, "familimpiadi", "current");
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data);
      }
    });
  } catch (e) {
    console.warn("Errore sottoscrizione Firestore:", e);
    return () => {};
  }
}

/**
 * Verifica PIN Admin.
 */
export function verifyAdminPassword(pin) {
  return pin === ADMIN_PIN || pin === 'admin';
}
