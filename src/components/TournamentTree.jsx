/**
 * @file TournamentTree.jsx
 * @description Tabellone del torneo orizzontale e simmetrico con funzioni Admin per rimescolare o azzerare le vittorie di un singolo torneo.
 */

import React, { useState } from 'react';
import MatchCard from './MatchCard';
import FirstTimeIntro from './FirstTimeIntro';
import { setMatchWinner, reshuffleSportBracket, resetSportVictories, hasAnyWinner } from '../services/tournamentLogic';
import { Trophy, Medal, ShieldAlert, Shuffle, RotateCcw, AlertTriangle, X } from 'lucide-react';

export default function TournamentTree({ state, onUpdateSportsData, isAdmin }) {
  const sports = state.sports || [];
  const [selectedSport, setSelectedSport] = useState(sports[0] || 'Biliardino');
  const [showReshuffleConfirm, setShowReshuffleConfirm] = useState(false);
  const [showResetVictoriesConfirm, setShowResetVictoriesConfirm] = useState(false);

  const currentSportData = state.sportsData[selectedSport] || {};
  const isSportStarted = hasAnyWinner(currentSportData);

  const handleWinnerSelect = (matchId, winnerTeam) => {
    if (!isAdmin) return;
    const updatedSportState = setMatchWinner(currentSportData, matchId, winnerTeam);
    const updatedSportsData = {
      ...state.sportsData,
      [selectedSport]: updatedSportState,
    };
    onUpdateSportsData(updatedSportsData);
  };

  // Azione Admin: Rimescola le sfide iniziali dopo la conferma
  const handleConfirmReshuffle = () => {
    if (!isAdmin || isSportStarted) return;
    const newSportState = reshuffleSportBracket(state.couples);
    const updatedSportsData = {
      ...state.sportsData,
      [selectedSport]: newSportState,
    };
    onUpdateSportsData(updatedSportsData);
    setShowReshuffleConfirm(false);
  };

  // Azione Admin: Azzera tutte le vittorie di questo specifico torneo
  const handleConfirmResetVictories = () => {
    if (!isAdmin) return;
    const resetState = resetSportVictories(currentSportData);
    const updatedSportsData = {
      ...state.sportsData,
      [selectedSport]: resetState,
    };
    onUpdateSportsData(updatedSportsData);
    setShowResetVictoriesConfirm(false);
  };

  const quarters = currentSportData.quarters || [];
  const mainSemis = currentSportData.semis?.main || [];
  const consolationSemis = currentSportData.semis?.consolation || [];
  const finals = currentSportData.finals || [];
  const standings = currentSportData.standings || {};

  // Formattiamo le finali per includere i titoli specifici
  const f56 = finals[2] ? { ...finals[2], title: 'Finale 5º – 6º Posto 🎖️' } : null;
  const f78 = finals[3] ? { ...finals[3], title: 'Finale 7º – 8º Posto 🎖️' } : null;
  const f12 = finals[0] ? { ...finals[0], title: '🥇 Finale 1º – 2º Posto (Scudetto)' } : null;
  const f34 = finals[1] ? { ...finals[1], title: '🥉 Finale 3º – 4º Posto (Bronzo)' } : null;

  return (
    <div className="tournament-tree-container animate-fade-in">
      {/* Effetto speciale d'ingresso */}
      <FirstTimeIntro
        title={`Torneo di ${selectedSport}`}
        storageKey={`intro_seen_${selectedSport.toLowerCase().replace(/\s+/g, '_')}`}
      />

      {/* Selettore dello Sport */}
      <div className="sport-selector-bar mb-8">
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`sport-chip ${selectedSport === sport ? 'sport-chip-active' : ''}`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Header del Torneo con pulsanti Admin per rimescolare o azzerare risultati */}
      <div className="tournament-header text-center mb-12">
        <h2 className="text-3xl font-extrabold mb-3">
          Torneo di <span className="text-amber-400 font-black">{selectedSport}</span> 🏆
        </h2>

        {isAdmin ? (
          <div className="admin-actions-bar mt-3 flex justify-center gap-3">
            {!isSportStarted ? (
              <button
                onClick={() => setShowReshuffleConfirm(true)}
                className="btn-warning-outline text-xs inline-flex items-center gap-1.5"
                title="Rimescola le sfide iniziali di questo torneo"
              >
                <span>🎲 Rimescola Sfide Iniziali ({selectedSport})</span>
              </button>
            ) : (
              <button
                onClick={() => setShowResetVictoriesConfirm(true)}
                className="btn-warning-outline text-xs inline-flex items-center gap-1.5 border-red-500/40 text-red-300"
                title="Azzera tutti i risultati registrati in questo torneo"
              >
                <span>🔄 Azzera Risultati ({selectedSport})</span>
              </button>
            )}
          </div>
        ) : (
          <div className="read-only-hint mt-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 inline mr-1" />
            <span className="span">Modalità Vista: Clicca "Accedi Admin" in alto per inserire i vincitori.</span>
          </div>
        )}
      </div>

      {/* Modal di Conferma Rimescolamento */}
      {showReshuffleConfirm && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowReshuffleConfirm(false)}>
          <div className="modal-content animate-scale-up text-center" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowReshuffleConfirm(false)}>
              <X className="w-5 h-5" />
            </button>
            <div className="icon-circle bg-amber-500/20 text-amber-400 mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>
            <h3 className="text-xl font-extrabold text-amber-400">Conferma Rimescolamento Sfide</h3>
            <p className="text-sm text-slate-300 mt-2">
              Sei sicuro di voler sorteggiare una nuova combinazione casuale di Quarti di Finale per il torneo di <strong>{selectedSport}</strong>?
            </p>
            <div className="modal-footer mt-6 flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setShowReshuffleConfirm(false)}>
                Annulla
              </button>
              <button className="btn-warning-outline flex-1" onClick={handleConfirmReshuffle}>
                Sì, Rimescola Ora 🎲
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal di Conferma Azzeramento Risultati Torneo */}
      {showResetVictoriesConfirm && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowResetVictoriesConfirm(false)}>
          <div className="modal-content animate-scale-up text-center" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowResetVictoriesConfirm(false)}>
              <X className="w-5 h-5" />
            </button>
            <div className="icon-circle bg-red-500/20 text-red-400 mx-auto mb-3">
              <RotateCcw className="w-8 h-8 text-red-400 animate-spin" />
            </div>
            <h3 className="text-xl font-extrabold text-red-400">Conferma Azzeramento Risultati</h3>
            <p className="text-sm text-slate-300 mt-2">
              Sei sicuro di voler rimuovere tutti i vincitori ed i punteggi registrati per il torneo di <strong>{selectedSport}</strong>?
            </p>
            <p className="text-xs text-slate-400 mt-1">
              (Gli accoppiamenti iniziali dei Quarti rimarranno salvati).
            </p>
            <div className="modal-footer mt-6 flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setShowResetVictoriesConfirm(false)}>
                Annulla
              </button>
              <button className="btn-warning-outline flex-1 bg-red-500/20 border-red-500/50 text-red-300" onClick={handleConfirmResetVictories}>
                Sì, Azzera Risultati 🔄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRUTTURA AD ALBERO ORIZZONTALE SIMMETRICA CON AMPIO MARGINE SUPERIORE ED INFERIORE */}
      <div className="horizontal-symmetric-tree my-12">
        <div className="tree-scroll-container">

          {/* COLONNA 1 (Estrema Sinistra): Box Speciale Finali 5º-6º e 7º-8º */}
          <div className="bracket-col special-box-col left-special-box">
            <div className="col-header-area text-emerald-400">
              <Medal className="w-4 h-4" />
              <span>FINALI CONSOLAZIONE</span>
            </div>
            <div className="matches-content-stack justify-around">
              {f56 && <MatchCard match={f56} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              {f78 && <MatchCard match={f78} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
            </div>
          </div>

          {/* Connettore SVG Sinistra 1: Semifinali Consolation -> Finali Consolation (VERDE CONTINUO) */}
          <div className="tree-connector hidden lg:block">
            <div className="col-header-area-spacer"></div>
            <svg className="connector-svg" viewBox="0 0 50 520" preserveAspectRatio="none">
              <path d="M 50 120 L 0 120" stroke="#10b981" strokeWidth="2.5" fill="none" />
              <path d="M 50 400 L 0 400" stroke="#10b981" strokeWidth="2.5" fill="none" />
            </svg>
          </div>

          {/* COLONNA 2: Semifinali Consolation (5º - 8º Posto) */}
          <div className="bracket-col">
            <div className="col-header-area chip-emerald">
              <span>Semifinali 5º–8º</span>
            </div>
            <div className="matches-content-stack justify-around">
              {consolationSemis[0] && <MatchCard match={consolationSemis[0]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              {consolationSemis[1] && <MatchCard match={consolationSemis[1]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
            </div>
          </div>

          {/* Connettore SVG Sinistra 2: Quarti (Perdenti) -> Semifinali Consolation (VERDE CONTINUO) */}
          <div className="tree-connector hidden lg:block">
            <div className="col-header-area-spacer"></div>
            <svg className="connector-svg" viewBox="0 0 50 520" preserveAspectRatio="none">
              {/* Q1 (50px) & Q2 (190px) -> Semi Consolation 1 (120px) */}
              <path d="M 50 50 L 25 50 L 25 120 L 0 120" stroke="#10b981" strokeWidth="2.5" fill="none" />
              <path d="M 50 190 L 25 190 L 25 120 L 0 120" stroke="#10b981" strokeWidth="2.5" fill="none" />
              {/* Q3 (330px) & Q4 (470px) -> Semi Consolation 2 (400px) */}
              <path d="M 50 330 L 25 330 L 25 400 L 0 400" stroke="#10b981" strokeWidth="2.5" fill="none" />
              <path d="M 50 470 L 25 470 L 25 400 L 0 400" stroke="#10b981" strokeWidth="2.5" fill="none" />
            </svg>
          </div>

          {/* COLONNA 3 (CENTRO): Quarti di Finale (4 Partite distanziate) */}
          <div className="bracket-col center-col">
            <div className="col-header-area chip-amber font-bold">
              <span>🎯 Quarti di Finale</span>
            </div>
            <div className="matches-content-stack justify-between">
              {quarters[0] && <MatchCard match={quarters[0]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              {quarters[1] && <MatchCard match={quarters[1]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              {quarters[2] && <MatchCard match={quarters[2]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              {quarters[3] && <MatchCard match={quarters[3]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
            </div>
          </div>

          {/* Connettore SVG Destra 1: Quarti (Vincenti) -> Semifinali Main (GIALLO CONTINUO) */}
          <div className="tree-connector hidden lg:block">
            <div className="col-header-area-spacer"></div>
            <svg className="connector-svg" viewBox="0 0 50 520" preserveAspectRatio="none">
              {/* Q1 (50px) & Q2 (190px) -> Semi Main 1 (120px) */}
              <path d="M 0 50 L 25 50 L 25 120 L 50 120" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
              <path d="M 0 190 L 25 190 L 25 120 L 50 120" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
              {/* Q3 (330px) & Q4 (470px) -> Semi Main 2 (400px) */}
              <path d="M 0 330 L 25 330 L 25 400 L 50 400" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
              <path d="M 0 470 L 25 470 L 25 400 L 50 400" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
            </svg>
          </div>

          {/* COLONNA 4: Semifinali Scudetto (1º - 4º Posto) */}
          <div className="bracket-col">
            <div className="col-header-area chip-amber">
              <span>Semifinali Scudetto</span>
            </div>
            <div className="matches-content-stack justify-around">
              {mainSemis[0] && <MatchCard match={mainSemis[0]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              {mainSemis[1] && <MatchCard match={mainSemis[1]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
            </div>
          </div>

          {/* Connettore SVG Destra 2: Semifinali Main -> Finali Scudetto (GIALLO CONTINUO) */}
          <div className="tree-connector hidden lg:block">
            <div className="col-header-area-spacer"></div>
            <svg className="connector-svg" viewBox="0 0 50 520" preserveAspectRatio="none">
              <path d="M 0 120 L 50 120" stroke="#fbbf24" strokeWidth="3" fill="none" />
              <path d="M 0 400 L 50 400" stroke="#fbbf24" strokeWidth="3" fill="none" />
            </svg>
          </div>

          {/* COLONNA 5 (Estrema Destra): Box Speciale Finali 1º-2º e 3º-4º */}
          <div className="bracket-col special-box-col right-special-box">
            <div className="col-header-area text-yellow-400">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>FINALI SCUDETTO</span>
            </div>
            <div className="matches-content-stack justify-around">
              {f12 && <MatchCard match={f12} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              {f34 && <MatchCard match={f34} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
            </div>
          </div>

        </div>
      </div>

      {/* Classifica Punti della Disciplina con abbondante spazio superiore */}
      <div className="sport-standings-card mt-16 pt-6">
        <div className="card-title-bar mb-4">
          <h3 className="text-xl font-bold">Classifica Finale della Disciplina: {selectedSport}</h3>
        </div>
        <div className="standings-table-wrapper mt-4">
          <table className="standings-table">
            <thead>
              <tr>
                <th>Posizione</th>
                <th>Coppia / Squadra</th>
                <th>Punti per la Classifica Generale</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(standings).length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-slate-400">
                    Nessuna partita ancora conclusa. L'Admin può cliccare su una squadra nel tabellone per decretare chi vince!
                  </td>
                </tr>
              ) : (
                Object.entries(standings)
                  .sort((a, b) => a[1].rank - b[1].rank)
                  .map(([team, info]) => (
                    <tr key={team}>
                      <td className="font-extrabold text-base">
                        {info.rank === 1 && '🥇 (Campioni)'}
                        {info.rank === 2 && '🥈'}
                        {info.rank === 3 && '🥉'}
                        {info.rank > 3 && `${info.rank}º Posto`}
                      </td>
                      <td className="font-bold text-amber-200 text-base">{team}</td>
                      <td className="text-amber-400 font-extrabold text-base">+{info.points} Punti</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
