/**
 * @file App.jsx
 * @description Componente radice dell'applicazione Familimpiadi.
 * Supporta la selezione dinamica dell'anno (2026/2025), lo stato vuoto iniziale e il reset Admin.
 * Protezione database: le modifiche a Firestore avvengono esclusivamente con isAdmin abilitato.
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import Leaderboard from './components/Leaderboard';
import TournamentTree from './components/TournamentTree';
import LiveDrawer from './components/LiveDrawer';
import HistoryArchive from './components/HistoryArchive';
import SportsManager from './components/SportsManager';
import AdminModal from './components/AdminModal';

import { db } from './config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  getStoredStateForYear,
  saveStoredStateForYear,
  subscribeToYearState,
  resetYearData,
} from './services/storageService';
import { createInitialTournamentState, renameTeamsInSportsData } from './services/tournamentLogic';

export default function App() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Stato globale per l'anno selezionato (recuperato da localStorage/Firestore in sola lettura)
  const [appState, setAppState] = useState(() => getStoredStateForYear(2026));

  // Quando cambia l'anno selezionato, carica i dati corrispondenti
  useEffect(() => {
    const loadedState = getStoredStateForYear(selectedYear);
    setAppState(loadedState);

    // Sincronizzazione in tempo reale via Firestore (SOLA LETTURA)
    const unsubscribe = subscribeToYearState(selectedYear, (remoteState) => {
      if (remoteState) {
        setAppState(remoteState);
      }
    });

    return () => unsubscribe();
  }, [selectedYear]);

  // Funzione helper per aggiornare lo stato. Scrive su Firestore SOLO se isAdmin è attivo!
  const updateState = (updater) => {
    setAppState((prev) => {
      const nextState = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveStoredStateForYear(selectedYear, nextState, isAdmin);
      return nextState;
    });
  };

  // Aggiornamento dei dati dei tornei per ogni disciplina (solo Admin)
  const handleUpdateSportsData = (newSportsData) => {
    if (!isAdmin) return;
    updateState({ sportsData: newSportsData });
  };

  // Salvataggio squadre ed estrazione con protezione degli accoppiamenti (solo Admin)
  const handleSaveCouples = (newCouples, newParticipants, newDoubleWeight) => {
    if (!isAdmin) return;
    updateState((prev) => {
      const prevCouples = prev.couples || [];
      const hasExistingSportsData =
        prev.sportsData && Object.keys(prev.sportsData).length > 0;

      let newSportsData;

      if (!hasExistingSportsData || prevCouples.length === 0) {
        newSportsData = {};
        (prev.sports || []).forEach((sport) => {
          newSportsData[sport] = createInitialTournamentState(newCouples, true);
        });
      } else {
        newSportsData = renameTeamsInSportsData(prev.sportsData, prevCouples, newCouples);

        (prev.sports || []).forEach((sport) => {
          if (!newSportsData[sport]) {
            newSportsData[sport] = createInitialTournamentState(newCouples, false);
          }
        });
      }

      return {
        ...prev,
        participants: newParticipants || prev.participants,
        doubleWeightParticipants: newDoubleWeight !== undefined ? newDoubleWeight : prev.doubleWeightParticipants,
        couples: newCouples,
        sportsData: newSportsData,
      };
    });
    setActiveTab('tournaments');
  };

  // Aggiornamento lista sport ufficiali (solo Admin)
  const handleUpdateSportsList = (newSportsList) => {
    if (!isAdmin) return;
    updateState((prev) => {
      const newSportsData = { ...prev.sportsData };
      newSportsList.forEach((sport) => {
        if (!newSportsData[sport]) {
          newSportsData[sport] = createInitialTournamentState(prev.couples, false);
        }
      });
      return {
        ...prev,
        sports: newSportsList,
        sportsData: newSportsData,
      };
    });
  };

  // Aggiornamento suggerimenti (consentito agli utenti)
  const handleUpdateSuggestions = (newSuggestions) => {
    updateState({ suggestions: newSuggestions });
    if (db) {
      try {
        const docRef = doc(db, "familimpiadi", `year_${selectedYear}`);
        setDoc(docRef, { suggestions: newSuggestions }, { merge: true });
      } catch (e) {
        console.warn("Errore salvataggio suggerimenti:", e);
      }
    }
  };

  // Reset dell'anno corrente da parte dell'Admin
  const handleResetYearData = (yearToReset) => {
    if (!isAdmin) return;
    const blank = resetYearData(yearToReset);
    setAppState(blank);
  };

  return (
    <div className="app-layout">
      {/* Top Navbar con selettore anno */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Body Principale */}
      <main className="main-content-container">
        {/* Banner con statistiche */}
        <HeroBanner state={appState} />

        {/* Tab 1: Classifica Generale */}
        {activeTab === 'leaderboard' && <Leaderboard state={appState} />}

        {/* Tab 2: Tabelloni dei Tornei */}
        {activeTab === 'tournaments' && (
          <TournamentTree
            state={appState}
            onUpdateSportsData={handleUpdateSportsData}
            isAdmin={isAdmin}
          />
        )}

        {/* Tab 3: Estrazione Coppie Live */}
        {activeTab === 'drawer' && (
          <LiveDrawer
            state={appState}
            onSaveCouples={handleSaveCouples}
            isAdmin={isAdmin}
          />
        )}

        {/* Tab 4: Storico Anni Passati */}
        {activeTab === 'history' && <HistoryArchive />}

        {/* Tab 5: Suggerimenti & Sport */}
        {activeTab === 'suggestions' && (
          <SportsManager
            state={appState}
            onUpdateSportsList={handleUpdateSportsList}
            onUpdateSuggestions={handleUpdateSuggestions}
            isAdmin={isAdmin}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="footer-container">
        <p>🏆 <strong>Familimpiadi</strong> - Edizione {selectedYear}. Sviluppato per la famiglia.</p>
      </footer>

      {/* Modal Autenticazione Admin & Reset */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        selectedYear={selectedYear}
        onResetYearData={handleResetYearData}
      />
    </div>
  );
}
