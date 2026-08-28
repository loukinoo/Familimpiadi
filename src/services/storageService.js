/**
 * @file storageService.js
 * @description Gestore del salvataggio e recupero dati per Familimpiadi.
 * Supporta l'edizione 2026 a 7 discipline (Freccette e Metratura incluse) e l'archivio 2025.
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

// 7 Discipline Ufficiali per il 2026 (Bowling sostituito con Freccette e Metratura)
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
 * Crea lo stato vuoto per un anno specificato
 */
export function createBlankYearState(year) {
  const sports = year === 2025 ? default2025.sports : [...SPORTS_2026];

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
 * Migra e valida lo stato del 2026 assicurando le 7 discipline e il formato a 6 squadre
 */
function migrate2026State(state) {
  if (!state || state.year !== 2026) return state;

  let needsSave = false;

  // 1. Assicura che la lista sport 2026 contenga Freccette e Metratura e non Bowling
  if (!state.sports || state.sports.includes('Bowling') || !state.sports.includes('Freccette') || !state.sports.includes('Metratura')) {
    state.sports = [...SPORTS_2026];
    needsSave = true;
  }

  // 2. Assicura che ogni sport abbia la sua struttura dati inizializzata
  if (!state.sportsData) {
    state.sportsData = {};
    needsSave = true;
  }

  state.sports.forEach((sport) => {
    // Se lo sport non esiste o ha ancora il vecchio formato senza initialMatches e ci sono <= 6 squadre
    if (!state.sportsData[sport] || (!state.sportsData[sport].initialMatches && (!state.couples || state.couples.length <= 6))) {
      state.sportsData[sport] = createInitialTournamentState(state.couples || []);
      needsSave = true;
    }
  });

  // Rimuovi Bowling da sportsData se presente
  if (state.sportsData['Bowling']) {
    delete state.sportsData['Bowling'];
    needsSave = true;
  }

  if (needsSave) {
    saveStoredStateForYear(2026, state);
  }

  return state;
}

/**
 * Carica lo stato per un dato anno
 */
export function getStoredStateForYear(year = 2026) {
  const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}state_${year}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (year === 2026) {
        return migrate2026State(parsed);
      }
      return parsed;
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
        const data = snapshot.data();
        if (year === 2026) {
          callback(migrate2026State(data));
        } else {
          callback(data);
        }
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
