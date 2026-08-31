/**
 * @file storageService.js
 * @description Gestore del salvataggio e recupero dati per Familimpiadi.
 * PROTEZIONE TOTALE: Nessuna scrittura su Firestore è consentita se non in modalità ADMIN.
 * Lettura in tempo reale sicura senza mutazioni distruttive.
 */

import { db } from '../config/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import default2025 from '../data/defaultData2025.json';
import default2026 from '../data/defaultData2026.json';
import initialParticipants from '../data/initialParticipants.json';
import { createInitialTournamentState, OFFICIAL_2026_COUPLES } from './tournamentLogic';

const STORAGE_KEY_PREFIX = 'familimpiadi_';
const ADMIN_PIN = '1234';

// Lista delle edizioni disponibili
export const AVAILABLE_YEARS = [2026, 2025];

// 7 Discipline Ufficiali per il 2026
export const SPORTS_2026 = [
  "Biliardino",
  "Bocce",
  "Equilibrio",
  "Freccette",
  "Memory",
  "Metratura",
  "Muffin Pong"
];

/**
 * Crea lo stato di default iniziale per il 2026
 */
export function createDefault2026State() {
  const sports = [...SPORTS_2026];
  const couples = [...default2026.couples];
  const doubleWeight = [...(default2026.doubleWeightParticipants || ['Savannah', 'Simona'])];

  const sportsData = {};
  sports.forEach((sport) => {
    sportsData[sport] = createInitialTournamentState(couples, false);
  });

  return {
    year: 2026,
    participants: initialParticipants,
    couples: couples,
    doubleWeightParticipants: doubleWeight,
    sports: sports,
    sportsData: sportsData,
    suggestions: [],
  };
}

/**
 * Crea lo stato per il 2025
 */
export function createDefault2025State() {
  const sportsData = {};
  default2025.sports.forEach((sport) => {
    sportsData[sport] = createInitialTournamentState(default2025.couples, false);
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

/**
 * Normalizza in sola lettura lo stato del 2026 senza effettuare alcuna scrittura nel database
 */
function normalize2026State(state) {
  if (!state || state.year !== 2026) return state;

  const copy = JSON.parse(JSON.stringify(state));

  // 1. Assicura che le coppie 2026 siano presenti
  if (!copy.couples || copy.couples.length === 0) {
    copy.couples = [...OFFICIAL_2026_COUPLES];
  }

  // 2. Assicura partecipanti con valore doppio
  if (!copy.doubleWeightParticipants || copy.doubleWeightParticipants.length === 0) {
    copy.doubleWeightParticipants = [...(default2026.doubleWeightParticipants || ['Savannah', 'Simona'])];
  }

  // 3. Assicura lista partecipanti
  if (!copy.participants || copy.participants.length === 0) {
    copy.participants = initialParticipants;
  }

  // 4. Assicura lista 7 sport
  if (!copy.sports || copy.sports.length === 0) {
    copy.sports = [...SPORTS_2026];
  }

  // 5. Assicura struttura per ciascuno sport
  if (!copy.sportsData) {
    copy.sportsData = {};
  }

  copy.sports.forEach((sport) => {
    if (!copy.sportsData[sport] || !copy.sportsData[sport].initialMatches) {
      copy.sportsData[sport] = createInitialTournamentState(copy.couples, false);
    }
  });

  return copy;
}

/**
 * Carica lo stato per un dato anno da localStorage (sola lettura)
 */
export function getStoredStateForYear(year = 2026) {
  const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}state_${year}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (year === 2026) {
        return normalize2026State(parsed);
      }
      return parsed;
    } catch (e) {
      console.error("Errore parsing state year:", e);
    }
  }

  if (year === 2025) {
    return createDefault2025State();
  }

  return createDefault2026State();
}

/**
 * Salva lo stato in localStorage e su Firestore.
 * IMPORTANTE: Scrive su Firestore ESCLUSIVAMENTE se isAdmin è true.
 */
export function saveStoredStateForYear(year, state, isAdmin = false) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}state_${year}`, JSON.stringify(state));
  } catch (e) {
    console.error("Errore salvataggio localStorage:", e);
  }

  // BLOCCO TOTALE: solo l'Admin può modificare Firestore!
  if (db && isAdmin) {
    try {
      const docRef = doc(db, "familimpiadi", `year_${year}`);
      setDoc(docRef, state, { merge: true });
    } catch (err) {
      console.warn("Errore salvataggio Firestore:", err);
    }
  }
}

/**
 * Resetta completamente i dati dell'anno specificato (Admin Action)
 */
export function resetYearData(year) {
  const defaultState = year === 2025 ? createDefault2025State() : createDefault2026State();
  saveStoredStateForYear(year, defaultState, true);
  return defaultState;
}

/**
 * Ascolta Firestore in tempo reale per l'anno selezionato (SOLA LETTURA, nessuna scrittura spontanea).
 */
export function subscribeToYearState(year, callback) {
  if (!db) return () => { };

  try {
    const docRef = doc(db, "familimpiadi", `year_${year}`);

    // Caricamento iniziale in sola lettura
    getDoc(docRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const stateToUse = year === 2026 ? normalize2026State(data) : data;
        localStorage.setItem(`${STORAGE_KEY_PREFIX}state_${year}`, JSON.stringify(stateToUse));
        callback(stateToUse);
      }
    }).catch((err) => {
      console.warn("Errore getDoc iniziale Firestore:", err);
    });

    // Ascolto in tempo reale (SOLA LETTURA)
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const stateToUse = year === 2026 ? normalize2026State(data) : data;
        localStorage.setItem(`${STORAGE_KEY_PREFIX}state_${year}`, JSON.stringify(stateToUse));
        callback(stateToUse);
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
