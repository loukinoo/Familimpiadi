/**
 * @file TournamentTree.jsx
 * @description Tabellone del torneo Familimpiadi con inserimento punteggi e classifica triangolari per differenza reti/punti.
 */

import React, { useState } from 'react';
import MatchCard from './MatchCard';
import FirstTimeIntro from './FirstTimeIntro';
import {
  setMatchWinner,
  setMatchScores,
  reshuffleSportBracket,
  resetSportVictories,
  hasAnyWinner,
  setTriangolareTiebreakOrder
} from '../services/tournamentLogic';
import {
  Trophy,
  Medal,
  ShieldAlert,
  Shuffle,
  RotateCcw,
  AlertTriangle,
  X,
  Flame,
  ArrowUp,
  ArrowDown,
  Award
} from 'lucide-react';

export default function TournamentTree({ state, onUpdateSportsData, isAdmin }) {
  const sports = state.sports || [];
  const [selectedSport, setSelectedSport] = useState(sports[0] || 'Biliardino');
  const [showReshuffleConfirm, setShowReshuffleConfirm] = useState(false);
  const [showResetVictoriesConfirm, setShowResetVictoriesConfirm] = useState(false);

  // Modale per la risoluzione manuale dello spareggio nel triangolare
  const [tiebreakModal, setTiebreakModal] = useState(null);

  const currentSportData = state.sportsData[selectedSport] || {};
  const isSportStarted = hasAnyWinner(currentSportData);
  const is6Teams = currentSportData.format === '6-teams' || !!currentSportData.initialMatches;

  const handleWinnerSelect = (matchId, winnerTeam) => {
    if (!isAdmin) return;
    const updatedSportState = setMatchWinner(currentSportData, matchId, winnerTeam);
    const updatedSportsData = {
      ...state.sportsData,
      [selectedSport]: updatedSportState,
    };
    onUpdateSportsData(updatedSportsData);
  };

  const handleScoreUpdate = (matchId, score1, score2) => {
    if (!isAdmin) return;
    const updatedSportState = setMatchScores(currentSportData, matchId, score1, score2);
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

  // Apertura modale spareggio
  const handleOpenTiebreakModal = (triangolareKey, title) => {
    const triangolare = currentSportData[triangolareKey];
    if (!triangolare) return;

    const currentTeams = [...(triangolare.manualRanking || triangolare.teams || [])].filter((t) => t && t.trim() !== '');
    if (currentTeams.length < 3) return;

    setTiebreakModal({
      key: triangolareKey,
      title: title,
      teams: currentTeams,
    });
  };

  // Sposta squadra su/giù nello spareggio
  const handleMoveTeam = (index, direction) => {
    if (!tiebreakModal) return;
    const newTeams = [...tiebreakModal.teams];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newTeams.length) return;

    const temp = newTeams[index];
    newTeams[index] = newTeams[targetIndex];
    newTeams[targetIndex] = temp;

    setTiebreakModal({ ...tiebreakModal, teams: newTeams });
  };

  // Salva ordine spareggio
  const handleSaveTiebreakOrder = () => {
    if (!tiebreakModal || !isAdmin) return;
    const updatedSportState = setTriangolareTiebreakOrder(
      currentSportData,
      tiebreakModal.key,
      tiebreakModal.teams
    );
    const updatedSportsData = {
      ...state.sportsData,
      [selectedSport]: updatedSportState,
    };
    onUpdateSportsData(updatedSportsData);
    setTiebreakModal(null);
  };

  // Ripristina ordine automatico triangolare
  const handleResetTiebreakToAuto = () => {
    if (!tiebreakModal || !isAdmin) return;
    const updatedSportState = setTriangolareTiebreakOrder(
      currentSportData,
      tiebreakModal.key,
      null
    );
    const updatedSportsData = {
      ...state.sportsData,
      [selectedSport]: updatedSportState,
    };
    onUpdateSportsData(updatedSportsData);
    setTiebreakModal(null);
  };

  const standings = currentSportData.standings || {};

  // Dati per formato a 6 squadre
  const initialMatches = currentSportData.initialMatches || [];
  const tsMatches = currentSportData.triangolareScudetto?.matches || [];
  const tcMatches = currentSportData.triangolareConsolazione?.matches || [];
  const tsStandings = currentSportData.triangolareScudetto?.standings || {};
  const tcStandings = currentSportData.triangolareConsolazione?.standings || {};

  const tsTeamsCount = (currentSportData.triangolareScudetto?.teams || []).filter((t) => t && t.trim()).length;
  const tcTeamsCount = (currentSportData.triangolareConsolazione?.teams || []).filter((t) => t && t.trim()).length;

  const isTsTie = Object.values(tsStandings).some((s) => s.isTie);
  const isTcTie = Object.values(tcStandings).some((s) => s.isTie);

  // Dati per formato a 8 squadre (2025)
  const quarters = currentSportData.quarters || [];
  const mainSemis = currentSportData.semis?.main || [];
  const consolationSemis = currentSportData.semis?.consolation || [];
  const finals = currentSportData.finals || [];
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

      {/* Header del Torneo con pulsanti Admin */}
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
                <Shuffle className="w-3.5 h-3.5" />
                <span>🎲 Rimescola Sfide Iniziali ({selectedSport})</span>
              </button>
            ) : (
              <button
                onClick={() => setShowResetVictoriesConfirm(true)}
                className="btn-warning-outline text-xs inline-flex items-center gap-1.5 border-red-500/40 text-red-300"
                title="Azzera tutti i risultati registrati in questo torneo"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>🔄 Azzera Risultati ({selectedSport})</span>
              </button>
            )}
          </div>
        ) : (
          <div className="read-only-hint mt-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 inline mr-1" />
            <span className="span">Modalità Vista: Clicca "Accedi Admin" in alto per inserire punteggi e vincitori.</span>
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
              Sei sicuro di voler sorteggiare una nuova combinazione casuale di sfide iniziali per il torneo di <strong>{selectedSport}</strong>?
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
              Sei sicuro di voler rimuovere tutti i punteggi ed i vincitori per il torneo di <strong>{selectedSport}</strong>?
            </p>
            <p className="text-xs text-slate-400 mt-1">
              (Gli accoppiamenti iniziali rimarranno salvati).
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

      {/* Modal di Risoluzione Spareggio Triangolare */}
      {tiebreakModal && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setTiebreakModal(null)}>
          <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setTiebreakModal(null)}>
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-4">
              <div className="icon-circle bg-amber-500/20 text-amber-400 mx-auto mb-2">
                <Award className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-black text-amber-400">{tiebreakModal.title}</h3>
              <p className="text-xs text-slate-300 mt-1">
                Definisci l'ordine di arrivo ufficiale delle 3 squadre usando i tasti freccia:
              </p>
            </div>

            <div className="tiebreak-team-list flex flex-col gap-2 my-4">
              {tiebreakModal.teams.map((team, idx) => {
                const baseRank = tiebreakModal.key === 'triangolareScudetto' ? 1 : 4;
                const posNumber = baseRank + idx;

                return (
                  <div
                    key={team}
                    className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-amber-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-extrabold flex items-center justify-center text-xs">
                        {posNumber}º
                      </span>
                      <span className="font-bold text-white text-sm">{team}</span>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveTeam(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 disabled:opacity-30 disabled:pointer-events-none"
                          title="Sposta su"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveTeam(idx, 1)}
                          disabled={idx === tiebreakModal.teams.length - 1}
                          className="p-1 rounded bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 disabled:opacity-30 disabled:pointer-events-none"
                          title="Sposta giù"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="modal-footer flex gap-2 mt-5">
              <button
                className="btn-secondary text-xs flex-1"
                onClick={handleResetTiebreakToAuto}
                title="Ripristina il calcolo automatico per vittorie e differenza punti"
              >
                Auto 🔄
              </button>
              <button
                className="btn-primary text-xs flex-1 justify-center"
                onClick={handleSaveTiebreakOrder}
              >
                Salva Ordine Spareggio 🏆
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TABELLONE 2026 A 6 SQUADRE: 3 SFIDE INIZIALI + 2 TRIANGOLARI
          ========================================================================= */}
      {is6Teams ? (
        <div className="horizontal-symmetric-tree my-12">
          <div className="tree-scroll-container">

            {/* COLONNA 1 (Sinistra): TRIANGOLARE CONSOLAZIONE (4º - 6º Posto) */}
            <div className="bracket-col special-box-col left-special-box">
              <div className="col-header-area text-emerald-400 flex items-center justify-center gap-1.5">
                <Medal className="w-4 h-4 text-emerald-400" />
                <span>TRIANGOLARE 4º–6º</span>
              </div>
              <div className="matches-content-stack justify-around">
                {tcMatches.map((m, idx) => (
                  <MatchCard
                    key={m.id || idx}
                    match={{ ...m, title: `Consolazione - Sfida ${idx + 1}` }}
                    onSelectWinner={handleWinnerSelect}
                    onUpdateScore={handleScoreUpdate}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>

              {/* Mini Classifica Triangolare Consolazione con Differenza Reti/Punti */}
              {Object.keys(tcStandings).length > 0 && (
                <div className="triangolare-mini-standings mt-2 p-2.5 bg-slate-900/90 rounded-md border border-emerald-500/30 text-xs">
                  <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-slate-800">
                    <span className="font-bold text-emerald-400">Classifica Girone:</span>
                    {isTcTie && (
                      <span className="text-[10px] bg-red-500/30 text-red-300 font-extrabold px-1.5 py-0.5 rounded border border-red-500/40">
                        Parità!
                      </span>
                    )}
                  </div>
                  {Object.entries(tcStandings).map(([t, info]) => (
                    <div key={t} className="flex justify-between items-center py-1 text-slate-300 border-b border-slate-800/40 last:border-none">
                      <span className="font-bold text-white truncate max-w-[110px]">{info.rank}º {t}</span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-emerald-300 font-bold">{info.wins}V</span>
                        <span className={`font-extrabold ${info.diff > 0 ? 'text-emerald-400' : info.diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                          {info.diff > 0 ? `+${info.diff}` : info.diff}
                        </span>
                        <span className="text-slate-500 text-[10px]">({info.gf || 0}-{info.gs || 0})</span>
                      </div>
                    </div>
                  ))}

                  {isAdmin && tcTeamsCount === 3 && (
                    <button
                      onClick={() => handleOpenTiebreakModal('triangolareConsolazione', 'Spareggio Triangolare Consolazione (4º–6º)')}
                      className="w-full mt-2.5 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/30 flex items-center justify-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{currentSportData.triangolareConsolazione?.manualRanking ? 'Modifica Spareggio ✏️' : '🎯 Regola Spareggio / Ordine'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Connettore SVG Sinistra: Perdenti delle 3 Sfide -> Triangolare Consolazione (VERDE) */}
            <div className="tree-connector hidden lg:block">
              <div className="col-header-area-spacer"></div>
              <svg className="connector-svg" viewBox="0 0 50 520" preserveAspectRatio="none">
                <path d="M 50 80 L 25 80 L 25 260 L 0 260" stroke="#10b981" strokeWidth="2.5" fill="none" />
                <path d="M 50 260 L 0 260" stroke="#10b981" strokeWidth="2.5" fill="none" />
                <path d="M 50 440 L 25 440 L 25 260 L 0 260" stroke="#10b981" strokeWidth="2.5" fill="none" />
              </svg>
            </div>

            {/* COLONNA 2 (Centro): 3 SFIDE INIZIALI */}
            <div className="bracket-col center-col">
              <div className="col-header-area chip-amber font-bold flex items-center justify-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>🎯 3 Sfide Iniziali</span>
              </div>
              <div className="matches-content-stack justify-around">
                {initialMatches.map((m, idx) => (
                  <MatchCard
                    key={m.id || idx}
                    match={{ ...m, title: `Partita ${idx + 1}` }}
                    onSelectWinner={handleWinnerSelect}
                    onUpdateScore={handleScoreUpdate}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>

            {/* Connettore SVG Destra: Vincenti delle 3 Sfide -> Triangolare Scudetto (GIALLO) */}
            <div className="tree-connector hidden lg:block">
              <div className="col-header-area-spacer"></div>
              <svg className="connector-svg" viewBox="0 0 50 520" preserveAspectRatio="none">
                <path d="M 0 80 L 25 80 L 25 260 L 50 260" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                <path d="M 0 260 L 50 260" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                <path d="M 0 440 L 25 440 L 25 260 L 50 260" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
              </svg>
            </div>

            {/* COLONNA 3 (Destra): TRIANGOLARE SCUDETTO (1º - 3º Posto) */}
            <div className="bracket-col special-box-col right-special-box">
              <div className="col-header-area text-yellow-400 flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>TRIANGOLARE 1º–3º</span>
              </div>
              <div className="matches-content-stack justify-around">
                {tsMatches.map((m, idx) => (
                  <MatchCard
                    key={m.id || idx}
                    match={{ ...m, title: `Scudetto - Sfida ${idx + 1}` }}
                    onSelectWinner={handleWinnerSelect}
                    onUpdateScore={handleScoreUpdate}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>

              {/* Mini Classifica Triangolare Scudetto con Differenza Reti/Punti */}
              {Object.keys(tsStandings).length > 0 && (
                <div className="triangolare-mini-standings mt-2 p-2.5 bg-slate-900/90 rounded-md border border-amber-500/30 text-xs">
                  <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-slate-800">
                    <span className="font-bold text-amber-400">Classifica Scudetto:</span>
                    {isTsTie && (
                      <span className="text-[10px] bg-red-500/30 text-red-300 font-extrabold px-1.5 py-0.5 rounded border border-red-500/40">
                        Parità!
                      </span>
                    )}
                  </div>
                  {Object.entries(tsStandings).map(([t, info]) => (
                    <div key={t} className="flex justify-between items-center py-1 text-slate-300 border-b border-slate-800/40 last:border-none">
                      <span className="font-bold text-white truncate max-w-[110px]">
                        {info.rank === 1 ? '🥇' : info.rank === 2 ? '🥈' : '🥉'} {t}
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-amber-300 font-bold">{info.wins}V</span>
                        <span className={`font-extrabold ${info.diff > 0 ? 'text-emerald-400' : info.diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                          {info.diff > 0 ? `+${info.diff}` : info.diff}
                        </span>
                        <span className="text-slate-500 text-[10px]">({info.gf || 0}-{info.gs || 0})</span>
                      </div>
                    </div>
                  ))}

                  {isAdmin && tsTeamsCount === 3 && (
                    <button
                      onClick={() => handleOpenTiebreakModal('triangolareScudetto', 'Spareggio Triangolare Scudetto (1º–3º)')}
                      className="w-full mt-2.5 py-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded border border-amber-500/30 flex items-center justify-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{currentSportData.triangolareScudetto?.manualRanking ? 'Modifica Spareggio ✏️' : '🎯 Regola Spareggio / Ordine'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* =========================================================================
           TABELLONE CLASSICO AD ALBERO PER 8 SQUADRE (2025)
           ========================================================================= */
        <div className="horizontal-symmetric-tree my-12">
          <div className="tree-scroll-container">

            {/* COLONNA 1: Finali 5º-6º e 7º-8º */}
            <div className="bracket-col special-box-col left-special-box">
              <div className="col-header-area text-emerald-400">
                <Medal className="w-4 h-4" />
                <span>FINALI CONSOLAZIONE</span>
              </div>
              <div className="matches-content-stack justify-around">
                {f56 && <MatchCard match={f56} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
                {f78 && <MatchCard match={f78} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
              </div>
            </div>

            {/* Connettore SVG Sinistra 1 */}
            <div className="tree-connector hidden lg:block">
              <div className="col-header-area-spacer"></div>
              <svg className="connector-svg" viewBox="0 0 50 520" preserveAspectRatio="none">
                <path d="M 50 120 L 0 120" stroke="#10b981" strokeWidth="2.5" fill="none" />
                <path d="M 50 400 L 0 400" stroke="#10b981" strokeWidth="2.5" fill="none" />
              </svg>
            </div>

            {/* COLONNA 2: Semifinali Consolation */}
            <div className="bracket-col">
              <div className="col-header-area chip-emerald">
                <span>Semifinali 5º–8º</span>
              </div>
              <div className="matches-content-stack justify-around">
                {consolationSemis[0] && <MatchCard match={consolationSemis[0]} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
                {consolationSemis[1] && <MatchCard match={consolationSemis[1]} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
              </div>
            </div>

            {/* Connettore SVG Sinistra 2 */}
            <div className="tree-connector hidden lg:block">
              <div className="col-header-area-spacer"></div>
              <svg className="connector-svg" viewBox="0 0 50 520" preserveAspectRatio="none">
                <path d="M 50 50 L 25 50 L 25 120 L 0 120" stroke="#10b981" strokeWidth="2.5" fill="none" />
                <path d="M 50 190 L 25 190 L 25 120 L 0 120" stroke="#10b981" strokeWidth="2.5" fill="none" />
                <path d="M 50 330 L 25 330 L 25 400 L 0 400" stroke="#10b981" strokeWidth="2.5" fill="none" />
                <path d="M 50 470 L 25 470 L 25 400 L 0 400" stroke="#10b981" strokeWidth="2.5" fill="none" />
              </svg>
            </div>

            {/* COLONNA 3 (Centro): Quarti di Finale */}
            <div className="bracket-col center-col">
              <div className="col-header-area chip-amber font-bold">
                <span>🎯 Quarti di Finale</span>
              </div>
              <div className="matches-content-stack justify-between">
                {quarters[0] && <MatchCard match={quarters[0]} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
                {quarters[1] && <MatchCard match={quarters[1]} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
                {quarters[2] && <MatchCard match={quarters[2]} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
                {quarters[3] && <MatchCard match={quarters[3]} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
              </div>
            </div>

            {/* Connettore SVG Destra 1 */}
            <div className="tree-connector hidden lg:block">
              <div className="col-header-area-spacer"></div>
              <svg className="connector-svg" viewBox="0 0 50 520" preserveAspectRatio="none">
                <path d="M 0 50 L 25 50 L 25 120 L 50 120" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                <path d="M 0 190 L 25 190 L 25 120 L 50 120" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                <path d="M 0 330 L 25 330 L 25 400 L 50 400" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                <path d="M 0 470 L 25 470 L 25 400 L 50 400" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
              </svg>
            </div>

            {/* COLONNA 4: Semifinali Scudetto */}
            <div className="bracket-col">
              <div className="col-header-area chip-amber">
                <span>Semifinali Scudetto</span>
              </div>
              <div className="matches-content-stack justify-around">
                {mainSemis[0] && <MatchCard match={mainSemis[0]} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
                {mainSemis[1] && <MatchCard match={mainSemis[1]} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
              </div>
            </div>

            {/* Connettore SVG Destra 2 */}
            <div className="tree-connector hidden lg:block">
              <div className="col-header-area-spacer"></div>
              <svg className="connector-svg" viewBox="0 0 50 520" preserveAspectRatio="none">
                <path d="M 0 120 L 50 120" stroke="#fbbf24" strokeWidth="3" fill="none" />
                <path d="M 0 400 L 50 400" stroke="#fbbf24" strokeWidth="3" fill="none" />
              </svg>
            </div>

            {/* COLONNA 5: Finali Scudetto */}
            <div className="bracket-col special-box-col right-special-box">
              <div className="col-header-area text-yellow-400">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>FINALI SCUDETTO</span>
              </div>
              <div className="matches-content-stack justify-around">
                {f12 && <MatchCard match={f12} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
                {f34 && <MatchCard match={f34} onSelectWinner={handleWinnerSelect} onUpdateScore={handleScoreUpdate} isAdmin={isAdmin} />}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Classifica Punti della Disciplina */}
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
                    Nessuna partita ancora conclusa. L'Admin può inserire i punteggi numerici o cliccare su una squadra per decretare chi vince!
                  </td>
                </tr>
              ) : (
                Object.entries(standings)
                  .sort((a, b) => a[1].rank - b[1].rank)
                  .map(([team, info]) => (
                    <tr key={team}>
                      <td className="font-extrabold text-base">
                        {info.rank === 1 && '🥇 1º Posto (Campioni)'}
                        {info.rank === 2 && '🥈 2º Posto'}
                        {info.rank === 3 && '🥉 3º Posto'}
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
