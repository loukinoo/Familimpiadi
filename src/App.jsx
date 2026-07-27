/**
 * @file App.jsx
 * @description Componente radice dell'applicazione Familimpiadi.
 * Gestisce lo stato globale del torneo, la navigazione a schede e i permessi Admin.
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

import { getStoredState, saveStoredState, subscribeToState } from './services/storageService';
import { createInitialTournamentState } from './services/tournamentLogic';

export default function App() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Stato globale dell'applicazione (recuperato da localStorage/Firestore)
  const [appState, setAppState] = useState(() => getStoredState());

  // Sincronizzazione in tempo reale via Firestore (se attivo)
  useEffect(() => {
    const unsubscribe = subscribeToState((remoteState) => {
      if (remoteState) {
        setAppState(remoteState);
      }
    });
    return () => unsubscribe();
  }, []);

  // Funzione helper per aggiornare e salvare lo stato
  const updateState = (updater) => {
    setAppState((prev) => {
      const nextState = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveStoredState(nextState);
      return nextState;
    });
  };

  // Aggiornamento dei dati dei tornei per ogni disciplina
  const handleUpdateSportsData = (newSportsData) => {
    updateState({ sportsData: newSportsData });
  };

  // Salvataggio nuove coppie ed estrazione
  const handleSaveCouples = (newCouples, newParticipants) => {
    updateState((prev) => {
      // Rigenera la struttura iniziale dei tornei per ogni sport con le nuove coppie
      const newSportsData = {};
      (prev.sports || []).forEach((sport) => {
        newSportsData[sport] = createInitialTournamentState(newCouples);
      });

      return {
        ...prev,
        participants: newParticipants || prev.participants,
        couples: newCouples,
        sportsData: newSportsData,
      };
    });
    setActiveTab('tournaments');
  };

  // Aggiornamento lista sport ufficiali
  const handleUpdateSportsList = (newSportsList) => {
    updateState((prev) => {
      const newSportsData = { ...prev.sportsData };
      newSportsList.forEach((sport) => {
        if (!newSportsData[sport]) {
          newSportsData[sport] = createInitialTournamentState(prev.couples);
        }
      });
      return {
        ...prev,
        sports: newSportsList,
        sportsData: newSportsData,
      };
    });
  };

  // Aggiornamento suggerimenti
  const handleUpdateSuggestions = (newSuggestions) => {
    updateState({ suggestions: newSuggestions });
  };

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content Body */}
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
        <p>🏆 <strong>Familimpiadi</strong> - Sviluppato per le sfide annuali in famiglia.</p>
        <p className="text-xs text-slate-500 mt-1">
          Hosting statico compatibile con GitHub Pages | Real-time ready con Firebase.
        </p>
      </footer>

      {/* Modal Autenticazione Admin */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />
    </div>
  );
}
