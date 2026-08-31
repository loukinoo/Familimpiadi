/**
 * @file LiveDrawer.jsx
 * @description Gestore completo delle Squadre e Sorteggio Live per Familimpiadi 2026.
 * Supporta:
 * - 6 Squadre (con 2 o 3 componenti ciascuna).
 * - Gestione partecipanti con peso doppio ("Valgono come 2": Savannah e Simona).
 * - Separazione rigorosa dei partecipanti doppi (mai nella stessa squadra) e divieto di terzetto per le loro squadre.
 * - Modifica diretta di nome squadra e componenti.
 * - Squadre / Coppie Predefinite (bloccate che non vengono sorteggiate).
 * - Estrazione animata intelligente dei partecipanti rimanenti.
 */

import React, { useState, useEffect } from 'react';
import {
  Shuffle,
  UserPlus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Edit3,
  Save,
  Lock,
  Unlock,
  Users,
  Plus,
  X,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Divide una stringa di membri usando separatori sicuri (senza dividere lettere interne come 'e' in Kevin, Alessio, etc.)
 */
function splitMembersString(str) {
  if (!str || typeof str !== 'string') return [];
  return str
    .split(/\s*,\s*|\s+&\s+|\s+e\s+|\s+ed\s+|\s*&\s*/i)
    .map((m) => m.trim())
    .filter(Boolean);
}

/**
 * Parsa una stringa squadra tipo "Gli Agnolotti (Gabriel, Chio & Kevin)" o "Luca & Kevin"
 */
function parseTeamString(str, index) {
  if (!str || typeof str !== 'string') {
    return {
      id: index + 1,
      name: `Squadra ${index + 1}`,
      members: [],
      isLocked: false,
    };
  }

  const parenMatch = str.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const rawName = parenMatch[1].trim();
    const rawMembers = splitMembersString(parenMatch[2]);
    return {
      id: index + 1,
      name: rawName,
      members: rawMembers,
      isLocked: rawMembers.length > 0,
    };
  }

  const members = splitMembersString(str);
  return {
    id: index + 1,
    name: str.startsWith('Squadra ') ? str : `Squadra ${index + 1}`,
    members: members.length > 0 ? members : [str],
    isLocked: members.length > 0,
  };
}

/**
 * Formatta un oggetto squadra in stringa completa per i tabelloni e la classifica
 */
function formatTeamToString(team) {
  const membersStr = team.members.join(' & ');
  const cleanName = team.name.trim();

  if (!cleanName || cleanName === `Squadra ${team.id}`) {
    return membersStr || `Squadra ${team.id}`;
  }

  if (membersStr && cleanName.toLowerCase() !== membersStr.toLowerCase()) {
    return `${cleanName} (${membersStr})`;
  }

  return cleanName || `Squadra ${team.id}`;
}

export default function LiveDrawer({ state, onSaveCouples, isAdmin }) {
  const [participants, setParticipants] = useState(state.participants || []);
  const [newPerson, setNewPerson] = useState('');
  const [isNewPersonDouble, setIsNewPersonDouble] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSlotText, setCurrentSlotText] = useState('Pronto per il sorteggio 🎲');

  // Lista di persone che "Valgono come 2" (Default: Savannah e Simona)
  const [doubleWeightList, setDoubleWeightList] = useState(
    state.doubleWeightParticipants || ['Savannah', 'Simona']
  );

  // Inizializza esattamente 6 squadre
  const [teams, setTeams] = useState(() => {
    const savedCouples = state.couples || [];
    const list = [];
    for (let i = 0; i < 6; i++) {
      if (savedCouples[i]) {
        list.push(parseTeamString(savedCouples[i], i));
      } else {
        list.push({
          id: i + 1,
          name: `Squadra ${i + 1}`,
          members: [],
          isLocked: false,
        });
      }
    }
    return list;
  });

  // Stato per l'editing del nome squadra
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [tempTeamName, setTempTeamName] = useState('');
  // Stato per aggiungere un membro al volo
  const [addingMemberTeamId, setAddingMemberTeamId] = useState(null);
  const [tempMemberName, setTempMemberName] = useState('');

  // Sincronizza se cambiano dall'esterno
  useEffect(() => {
    if (state.participants) {
      setParticipants(state.participants);
    }
    if (state.doubleWeightParticipants) {
      setDoubleWeightList(state.doubleWeightParticipants);
    }
  }, [state.participants, state.doubleWeightParticipants]);

  // Toggle valore doppio (Vale 2) per un partecipante
  const handleToggleDoubleWeight = (person) => {
    if (!isAdmin) return;
    if (doubleWeightList.includes(person)) {
      setDoubleWeightList(doubleWeightList.filter((p) => p !== person));
    } else {
      setDoubleWeightList([...doubleWeightList, person]);
    }
  };

  // Aggiunge un partecipante alla lista generale
  const handleAddParticipant = (e) => {
    e.preventDefault();
    const name = newPerson.trim();
    if (!name) return;
    if (participants.includes(name)) return;

    setParticipants([...participants, name]);
    if (isNewPersonDouble && !doubleWeightList.includes(name)) {
      setDoubleWeightList([...doubleWeightList, name]);
    }
    setNewPerson('');
    setIsNewPersonDouble(false);
  };

  // Rimuove un partecipante dalla lista generale
  const handleRemoveParticipant = (name) => {
    setParticipants(participants.filter((p) => p !== name));
    setDoubleWeightList(doubleWeightList.filter((p) => p !== name));
    // Rimuovilo anche dalle squadre se presente
    setTeams(teams.map((t) => ({
      ...t,
      members: t.members.filter((m) => m !== name),
    })));
  };

  // Toggle blocco squadra predefinita
  const handleToggleLock = (teamId) => {
    if (!isAdmin) return;
    setTeams(teams.map((t) => (t.id === teamId ? { ...t, isLocked: !t.isLocked } : t)));
  };

  // Modifica nome squadra
  const handleStartEditName = (team) => {
    if (!isAdmin) return;
    setEditingTeamId(team.id);
    setTempTeamName(team.name);
  };

  const handleSaveTeamName = (teamId) => {
    setTeams(teams.map((t) => (t.id === teamId ? { ...t, name: tempTeamName.trim() || `Squadra ${teamId}` } : t)));
    setEditingTeamId(null);
  };

  // Aggiunge un membro alla squadra (fino a 3 membri, ma max 2 se c'è un membro "Vale 2")
  const handleAddMemberToTeam = (teamId, memberName) => {
    if (!isAdmin || !memberName || !memberName.trim()) return;
    const nameToAdd = memberName.trim();

    setTeams(teams.map((t) => {
      if (t.id === teamId) {
        const hasDoubleMember = t.members.some((m) => doubleWeightList.includes(m));
        const isAddingDouble = doubleWeightList.includes(nameToAdd);

        // Se la squadra ha già un membro doppio, non può superare 2 membri!
        if (hasDoubleMember && t.members.length >= 2) return t;
        // Non si possono mettere due membri doppi nella stessa squadra!
        if (hasDoubleMember && isAddingDouble) return t;
        // Se non ha membri doppi, max 3 membri
        if (!hasDoubleMember && isAddingDouble && t.members.length >= 2) return t;
        if (t.members.includes(nameToAdd) || t.members.length >= 3) return t;

        return {
          ...t,
          members: [...t.members, nameToAdd],
          isLocked: true,
        };
      }
      return t;
    }));

    if (!participants.includes(nameToAdd)) {
      setParticipants([...participants, nameToAdd]);
    }

    setAddingMemberTeamId(null);
    setTempMemberName('');
  };

  // Rimuove un membro dalla squadra
  const handleRemoveMemberFromTeam = (teamId, memberName) => {
    if (!isAdmin) return;
    setTeams(teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          members: t.members.filter((m) => m !== memberName),
        };
      }
      return t;
    }));
  };

  // Svuota tutti i membri delle squadre non bloccate per ricominciare
  const handleClearUnlockedTeams = () => {
    if (!isAdmin) return;
    setTeams(teams.map((t) => (t.isLocked ? t : { ...t, members: [] })));
  };

  // Trova partecipanti già assegnati a squadre bloccate
  const assignedMembers = new Set();
  teams.forEach((t) => {
    if (t.isLocked) {
      t.members.forEach((m) => assignedMembers.add(m));
    }
  });

  // Partecipanti disponibili per il sorteggio
  const availablePool = participants.filter((p) => !assignedMembers.has(p));

  // Algoritmo di mescolamento Fisher-Yates
  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  /**
   * Sorteggio intelligente con rispetto dei vincoli:
   * 1. Partecipanti che "Valgono come 2" (Savannah, Simona, ecc.) vanno in squadre DIVERSE tra loro.
   * 2. Ognuno di loro riceve ESATTAMENTE 1 altro membro regolare (totale 2 membri nella squadra).
   * 3. Le squadre con partecipanti doppi NON diventano MAI terzetti (rimangono rigorosamente da 2 persone).
   * 4. I partecipanti regolari rimanenti riempiono le altre squadre (2 persone a testa, e gli eventuali extra formano terzetti solo nelle squadre regolari).
   */
  const startRandomExtraction = () => {
    if (availablePool.length < 2 && teams.every((t) => t.isLocked)) return;
    setIsDrawing(true);

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      const rand1 = availablePool[Math.floor(Math.random() * availablePool.length)] || 'Partecipante';
      const rand2 = availablePool[Math.floor(Math.random() * availablePool.length)] || 'Partecipante';
      setCurrentSlotText(`🎲 ${rand1} ❤️ ${rand2}`);

      if (counter > 20) {
        clearInterval(interval);

        // Separa il pool disponibile tra persone con peso doppio e regolari
        let dwAvailable = shuffle(availablePool.filter((p) => doubleWeightList.includes(p)));
        let regAvailable = shuffle(availablePool.filter((p) => !doubleWeightList.includes(p)));

        const updatedTeams = [...teams];
        const unlockedTeams = updatedTeams.filter((t) => !t.isLocked);

        // Reset membri delle squadre non bloccate
        unlockedTeams.forEach((t) => { t.members = []; });

        // FASE 1: Assegna ciascuna persona con peso doppio a una squadra non bloccata DIVERSA
        const teamsWithDouble = [];
        const teamsRegularOnly = [];

        unlockedTeams.forEach((team) => {
          if (dwAvailable.length > 0) {
            const dwPerson = dwAvailable.pop();
            team.members.push(dwPerson);
            teamsWithDouble.push(team);
          } else {
            teamsRegularOnly.push(team);
          }
        });

        // FASE 2: Assegna ESATTAMENTE 1 partner regolare a ciascuna squadra con membro doppio
        teamsWithDouble.forEach((team) => {
          if (regAvailable.length > 0) {
            team.members.push(regAvailable.pop());
          }
        });

        // FASE 3: Assegna 2 membri regolari a ciascuna squadra regolare rimanente
        for (let round = 0; round < 2; round++) {
          teamsRegularOnly.forEach((team) => {
            if (regAvailable.length > 0) {
              team.members.push(regAvailable.pop());
            }
          });
        }

        // FASE 4: Se avanzano ancora partecipanti regolari (es. 14 partecipanti = 2 terzetti e 4 coppie),
        // aggiungili come 3º membro SOLO ED ESCLUSIVAMENTE alle squadre REGOLARI (mai a quelle con membri doppi!)
        let regTeamIdx = 0;
        while (regAvailable.length > 0) {
          if (regTeamIdx < teamsRegularOnly.length && teamsRegularOnly[regTeamIdx].members.length < 3) {
            teamsRegularOnly[regTeamIdx].members.push(regAvailable.pop());
            regTeamIdx++;
          } else {
            break;
          }
        }

        setTeams(updatedTeams);
        setIsDrawing(false);
        setCurrentSlotText('🎉 Sorteggio Completato con Successo!');

        confetti({
          particleCount: 85,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }, 90);
  };

  // Salva e applica le 6 squadre al torneo
  const handleApplyCouples = () => {
    const formattedCouples = teams.map((t) => formatTeamToString(t));
    onSaveCouples(formattedCouples, participants, doubleWeightList);
  };

  return (
    <div className="drawer-container animate-fade-in">
      <div className="drawer-header text-center">
        <div className="drawer-icon-glow">
          <Shuffle className="w-8 h-8 text-amber-400" />
        </div>
        <h2>🎲 Gestione Squadre & Sorteggio Live 2026</h2>
        <p>
          Configura le <strong>6 squadre</strong> dell'edizione 2026. Gestisci i partecipanti con valore doppio, blocca le coppie predefinite e sorteggia i rimanenti!
        </p>
      </div>

      <div className="drawer-grid mt-6">
        {/* COLONNA SINISTRA: Partecipanti Singoli */}
        <div className="drawer-card">
          <div className="card-title-bar flex justify-between items-center">
            <h3>👥 Partecipanti Iscritti ({participants.length})</h3>
            <span className="badge-double-counter">
              ⭐ {doubleWeightList.length} Valore 2
            </span>
          </div>

          {isAdmin && (
            <form onSubmit={handleAddParticipant} className="add-person-form flex flex-col gap-2 mt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  placeholder="Aggiungi partecipante (es. Zio Corrado)..."
                />
                <button type="submit" className="btn-primary shrink-0">
                  <UserPlus className="w-4 h-4" />
                  <span>Aggiungi</span>
                </button>
              </div>
              <label className="text-xs text-amber-300 flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isNewPersonDouble}
                  onChange={(e) => setIsNewPersonDouble(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>⭐ Questa persona vale come 2 (Doppio Peso)</span>
              </label>
            </form>
          )}

          <div className="participants-chip-list mt-3">
            {participants.map((person) => {
              const isAssigned = assignedMembers.has(person);
              const isDouble = doubleWeightList.includes(person);

              return (
                <span
                  key={person}
                  className={`participant-chip transition-all ${
                    isDouble ? 'chip-double-weight' : ''
                  } ${isAssigned ? 'opacity-60 border-emerald-500/40 bg-emerald-950/40' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {isDouble ? '⭐' : '👤'} {person}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => handleToggleDoubleWeight(person)}
                      className={`chip-double-btn ${isDouble ? 'chip-double-btn-active' : ''}`}
                      title={isDouble ? 'Rimuovi stato "Vale come 2"' : 'Imposta come "Vale come 2" (Doppio Peso)'}
                    >
                      {isDouble ? 'Vale 2' : '+ x2'}
                    </button>
                  )}

                  {isAssigned && <span className="text-[10px] text-emerald-400 font-bold">(In squadra)</span>}

                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveParticipant(person)}
                      className="chip-remove"
                      title="Rimuovi partecipante"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>

          <div className="info-box-cozy mt-4 p-3 bg-slate-900/70 border border-slate-700 rounded-lg text-xs text-slate-300 flex flex-col gap-1.5">
            <div className="font-bold text-amber-400 flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Regole Speciali Sorteggio 2026:</span>
            </div>
            <p>
              • <strong>Persone da 2 ({doubleWeightList.join(', ')}):</strong> Vengono assegnate <strong>ciascuna a una squadra diversa</strong> (mai insieme) e ricevono <strong>1 solo compagno</strong> (queste squadre non diventano mai terzetti).
            </p>
            <p>
              • <strong>Terzetti (3 persone):</strong> Se ci sono partecipanti extra, i terzetti si formano <strong>solo tra le squadre regolari</strong>.
            </p>
            <p>• Partecipanti disponibili da sorteggiare: <strong>{availablePool.length}</strong>.</p>
          </div>

          {isAdmin && (
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={startRandomExtraction}
                disabled={isDrawing || availablePool.length < 2}
                className="btn-accent-gradient w-full"
                title="Sorteggia i partecipanti disponibili rispettando le regole"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isDrawing ? 'Mescolamento in corso...' : '🎲 Estrai Squadre Rimanenti'}</span>
              </button>

              <button
                onClick={handleClearUnlockedTeams}
                className="btn-secondary text-xs w-full py-1.5 opacity-80 hover:opacity-100"
                title="Svuota i componenti delle squadre libere per rifare il sorteggio da zero"
              >
                🔄 Reset Squadre Libere
              </button>
            </div>
          )}
        </div>

        {/* COLONNA DESTRA: Le 6 Squadre */}
        <div className="drawer-card">
          <div className="card-title-bar">
            <h3>🏆 Le 6 Squadre Ufficiali 2026</h3>
          </div>

          <div className={`slot-machine-box ${isDrawing ? 'slot-animating' : ''}`}>
            <span className="slot-text">{currentSlotText}</span>
          </div>

          <div className="teams-management-list mt-3">
            {teams.map((team, index) => {
              const isEditing = editingTeamId === team.id;
              const isAddingMember = addingMemberTeamId === team.id;
              const hasDoubleMember = team.members.some((m) => doubleWeightList.includes(m));
              const isTrio = team.members.length === 3;

              return (
                <div
                  key={team.id}
                  className={`team-edit-card ${
                    hasDoubleMember
                      ? 'team-edit-card-double'
                      : team.isLocked
                      ? 'team-edit-card-locked'
                      : ''
                  }`}
                >
                  {/* Intestazione Riga Squadra: Indice + Nome Squadra + Azioni Lock/Edit */}
                  <div className="team-card-header-row">
                    <div className="team-card-title-group">
                      <span className="team-index-badge">
                        #{index + 1}
                      </span>

                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            className="nickname-edit-input text-xs py-1"
                            value={tempTeamName}
                            onChange={(e) => setTempTeamName(e.target.value)}
                            placeholder="Nome Squadra (es: Gli Agnolotti)..."
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveTeamName(team.id)}
                            className="btn-icon-success p-1"
                            title="Salva nome"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="team-name-text">
                          <span>{team.name}</span>
                          {hasDoubleMember && (
                            <span className="tag-double-val">
                              ⭐ Vale 3 (1+2)
                            </span>
                          )}
                          {isTrio && (
                            <span className="tag-trio">
                              Terzetto (3)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEditName(team)}
                            className="text-slate-400 hover:text-amber-400 p-1"
                            title="Modifica nome squadra"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleLock(team.id)}
                          className={`team-lock-btn ${
                            team.isLocked ? 'team-lock-btn-active' : ''
                          }`}
                          title={team.isLocked ? 'Squadra Fissa / Predefinita (Non verrà sorteggiata)' : 'Squadra Libera (Verrà sorteggiata)'}
                        >
                          {team.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Lista Membri / Componenti della Squadra */}
                  <div className="team-members-chips">
                    {team.members.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">Nessun componente (in attesa di sorteggio)</span>
                    ) : (
                      team.members.map((member) => {
                        const isDoubleMember = doubleWeightList.includes(member);
                        return (
                          <span
                            key={member}
                            className={`team-member-pill ${
                              isDoubleMember ? 'team-member-pill-double' : ''
                            }`}
                          >
                            <span>{isDoubleMember ? '⭐' : '👤'} {member}</span>
                            {isDoubleMember && <span className="text-[9px] text-amber-300 font-extrabold">(x2)</span>}
                            {isAdmin && (
                              <button
                                onClick={() => handleRemoveMemberFromTeam(team.id, member)}
                                className="text-slate-400 hover:text-red-400 ml-1"
                                title="Rimuovi membro"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                        );
                      })
                    )}

                    {/* Bottone per aggiungere manualmente un componente */}
                    {isAdmin && !isAddingMember && (
                      <>
                        {hasDoubleMember ? (
                          team.members.length < 2 && (
                            <button
                              onClick={() => {
                                setAddingMemberTeamId(team.id);
                                setTempMemberName('');
                              }}
                              className="btn-add-member-pill"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Aggiungi Compagno</span>
                            </button>
                          )
                        ) : (
                          team.members.length < 3 && (
                            <button
                              onClick={() => {
                                setAddingMemberTeamId(team.id);
                                setTempMemberName('');
                              }}
                              className="btn-add-member-pill"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{team.members.length === 2 ? 'Aggiungi 3º Membro' : 'Aggiungi Persona'}</span>
                            </button>
                          )
                        )}
                      </>
                    )}
                  </div>

                  {/* Form veloce per aggiungere membro */}
                  {isAddingMember && (
                    <div className="add-member-inline mt-2 flex items-center gap-1.5">
                      <select
                        className="text-xs bg-slate-900 text-white rounded p-1 border border-slate-700 flex-1"
                        value={tempMemberName}
                        onChange={(e) => setTempMemberName(e.target.value)}
                      >
                        <option value="">-- Seleziona o scrivi nome --</option>
                        {participants
                          .filter((p) => !team.members.includes(p))
                          .map((p) => (
                            <option key={p} value={p}>
                              {p} {doubleWeightList.includes(p) ? '⭐ (x2)' : ''} {assignedMembers.has(p) ? '(già assegnato)' : ''}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => handleAddMemberToTeam(team.id, tempMemberName)}
                        disabled={!tempMemberName}
                        className="btn-primary text-xs py-1 px-2.5"
                      >
                        Inserisci
                      </button>
                      <button
                        onClick={() => setAddingMemberTeamId(null)}
                        className="btn-secondary text-xs py-1 px-2"
                      >
                        Annulla
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isAdmin && (
            <button onClick={handleApplyCouples} className="btn-success w-full mt-5">
              <CheckCircle2 className="w-5 h-5" />
              <span>Salva e Applica al Torneo 🏆</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
