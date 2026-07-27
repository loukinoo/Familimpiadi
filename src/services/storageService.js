/**
 * @file storageService.js
 * @description Gestore del salvataggio e recupero dati per Familimpiadi.
 * Supporta la selezione dell'anno corrente (2026), l'archivio 2025 e il reset Admin con conferma.
 */

import { db } from '../config/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import default2025 from '../data/defaultData2025.json';
import initialParticipants from '../data/initialParticipants.json';
import { createInitialTournamentState } from './tournamentLogic';

const STORAGE_KEY_PREFIX = 'familimpiadi_';
const ADMIN_PIN = '1234';

// Lista delle edizioni disponibili
export const AVAILABLE_YEARS = [2026, 2025];

/**
 * Crea lo stato vuoto (blank) per un nuovo anno
 */
export function createBlankYearState(year) {
  const sports = [
    "Biliardino",
    "Bocce",
    "Bowling",
    "Equilibrio",
    "Memory",
    "Muffin Pong"
  ];

  const sportsData = {};
  sports.forEach((sport) => {
    sportsData[sport] = createInitialTournamentState([]);
  });

  return {
    year: year,
    participants: initialParticipants,
    couples: [],
    sports: sports,
    sportsData: sportsData,
    suggestions: [],
  };
}

/**
 * Carica lo stato per un dato anno
 */
export function getStoredStateForYear(year = 2026) {
  const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}state_${year}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Errore parsing state year:", e);
    }
  }

  // Se è il 2025, ritorna i dati storici del 2025
  if (year === 2025) {
    const sportsData = {};
    default2025.sports.forEach((sport) => {
      sportsData[sport] = createInitialTournamentState(default2025.couples);
    });
    return {
      year: 2025,
      participants: initialParticipants,
      couples: default2025.couples,
      sports: default2025.sports,
      sportsData: sportsData,
      suggestions: [],
      isArchived: true,
    };
  }

  // Altrimenti ritorna lo stato blank per il 2026
  const blankState = createBlankYearState(year);
  saveStoredStateForYear(year, blankState);
  return blankState;
}

/**
 * Salva lo stato di un anno specifico in localStorage e Firestore
 */
export function saveStoredStateForYear(year, state) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}state_${year}`, JSON.stringify(state));
  } catch (e) {
    console.error("Errore salvataggio localStorage:", e);
  }

  if (db) {
    try {
      const docRef = doc(db, "familimpiadi", `year_${year}`);
      setDoc(docRef, state, { merge: true });
    } catch (err) {
      console.warn("Errore salvataggio Firestore:", err);
    }
  }
}

/**
 * Resetta completamente i dati dell'anno specificato (Admin)
 */
export function resetYearData(year) {
  const blankState = createBlankYearState(year);
  saveStoredStateForYear(year, blankState);
  return blankState;
}

/**
 * Ascolta Firestore in tempo reale per l'anno selezionato
 */
export function subscribeToYearState(year, callback) {
  if (!db) return () => { };

  try {
    const docRef = doc(db, "familimpiadi", `year_${year}`);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    });
  } catch (e) {
    console.warn("Errore sottoscrizione Firestore:", e);
    return () => { };
  }
}

/**
 * Verifica PIN Admin.
 */
export function verifyAdminPassword(pin) {
  return pin === ADMIN_PIN || pin === 'admin';
}
