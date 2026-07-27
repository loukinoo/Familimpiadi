/**
 * @file LiveDrawer.jsx
 * @description Componente per l'estrazione visiva dal vivo delle coppie con soprannomi di squadra personalizzati e legati ai componenti.
 */

import React, { useState } from 'react';
import { Shuffle, UserPlus, Trash2, Sparkles, CheckCircle2, Edit3, Save, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Assicura che i nomi originali dei componenti della coppia rimangano sempre legati al soprannome.
 */
function formatTeamNickname(inputNickname, currentCoupleString) {
  const trimmed = inputNickname.trim();
  if (!trimmed) return currentCoupleString;

  // Se contiene già le parentesi con i componenti, usa la stringa completa
  if (trimmed.includes('(') && trimmed.includes(')')) {
    return trimmed;
  }

  // Estrai i componenti originali
  let members = currentCoupleString;
  const parenMatch = currentCoupleString.match(/\((.*?)\)/);
  if (parenMatch) {
    members = parenMatch[1];
  } else {
    // Se c'è un soprannome precedente tipo "Soprannome (Nome1 e Nome2)"
    const nameParts = currentCoupleString.split(' (');
    if (nameParts.length > 1) {
      members = nameParts[1].replace(')', '');
    }
  }

  // Se il soprannome inserito non include già i membri, li leghiamo tra parentesi
  if (trimmed.toLowerCase() !== members.toLowerCase()) {
    return `${trimmed} (${members})`;
  }

  return trimmed;
}

export default function LiveDrawer({ state, onSaveCouples, isAdmin }) {
  const [participants, setParticipants] = useState(state.participants || []);
  const [newPerson, setNewPerson] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [extractedCouples, setExtractedCouples] = useState(state.couples || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempNickname, setTempNickname] = useState('');
  const [currentSlotText, setCurrentSlotText] = useState('Pronto per l\'estrazione 🎲');

  // Aggiunge un partecipante singolo
  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!newPerson.trim()) return;
    if (participants.includes(newPerson.trim())) return;
    setParticipants([...participants, newPerson.trim()]);
    setNewPerson('');
  };

  // Rimuove un partecipante
  const handleRemoveParticipant = (name) => {
    setParticipants(participants.filter((p) => p !== name));
  };

  // Avvia l'estrazione animata delle coppie
  const startRandomExtraction = () => {
    if (participants.length < 2) return;
    setIsDrawing(true);

    const pool = [...participants];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const generated = [];
    let counter = 0;

    const interval = setInterval(() => {
      counter++;
      const rand1 = Math.floor(Math.random() * pool.length);
      const rand2 = Math.floor(Math.random() * pool.length);
      setCurrentSlotText(`🎲 ${pool[rand1]} ❤️ ${pool[rand2]}`);

      if (counter > 22) {
        clearInterval(interval);

        for (let i = 0; i < pool.length; i += 2) {
          if (i + 1 < pool.length) {
            generated.push(`${pool[i]} e ${pool[i + 1]}`);
          } else {
            generated.push(`${pool[i]} (Jolly)`);
          }
        }

        setExtractedCouples(generated);
        setIsDrawing(false);
        setCurrentSlotText('🎉 Coppie Estratte con Successo!');

        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 90);
  };

  // Modifica il nome/soprannome della squadra preservando i componenti
  const handleStartEdit = (index, currentName) => {
    setEditingIndex(index);

    // Se ha già un soprannome formato tipo "Soprannome (Nome1 e Nome2)", carica solo il soprannome per l'editing
    const parenMatch = currentName.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenMatch) {
      setTempNickname(parenMatch[1]);
    } else {
      setTempNickname(currentName);
    }
  };

  const handleSaveNickname = (index) => {
    const originalPairString = extractedCouples[index];
    const formatted = formatTeamNickname(tempNickname, originalPairString);

    const updated = [...extractedCouples];
    updated[index] = formatted;
    setExtractedCouples(updated);
    setEditingIndex(null);
  };

  // Applica le coppie ai tornei
  const handleApplyCouples = () => {
    if (extractedCouples.length > 0) {
      onSaveCouples(extractedCouples, participants);
    }
  };

  return (
    <div className="drawer-container animate-fade-in">
      <div className="drawer-header text-center">
        <div className="drawer-icon-glow">
          <Shuffle className="w-8 h-8 text-amber-400" />
        </div>
        <h2>🎲 Estrazione Coppie Casereccia</h2>
        <p>Estrai dal vivo i duetti della famiglia e assegna soprannomi personalizzati che mantengono legati i componenti!</p>
      </div>

      <div className="drawer-grid mt-6">
        {/* Partecipanti Singoli */}
        <div className="drawer-card">
          <div className="card-title-bar">
            <h3>Partecipanti Inscritti ({participants.length})</h3>
          </div>

          {isAdmin && (
            <form onSubmit={handleAddParticipant} className="add-person-form">
              <input
                type="text"
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                placeholder="Aggiungi nome (es. Zio Corrado)..."
              />
              <button type="submit" className="btn-primary">
                <UserPlus className="w-4 h-4" />
                <span>Aggiungi</span>
              </button>
            </form>
          )}

          <div className="participants-chip-list">
            {participants.map((person) => (
              <span key={person} className="participant-chip">
                👤 {person}
                {isAdmin && (
                  <button
                    onClick={() => handleRemoveParticipant(person)}
                    className="chip-remove"
                    title="Rimuovi"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {participants.length % 2 !== 0 && (
            <div className="warning-box mt-3">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Numero dispari! Aggiungi un'altra persona per avere tutte le coppie complete.</span>
            </div>
          )}

          {isAdmin && (
            <button
              onClick={startRandomExtraction}
              disabled={isDrawing || participants.length < 2}
              className="btn-accent-gradient w-full mt-4"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isDrawing ? 'Mescolamento in corso...' : 'Avvia Estrazione Live 🎲'}</span>
            </button>
          )}
        </div>

        {/* Risultati ed Edit Soprannomi */}
        <div className="drawer-card">
          <div className="card-title-bar">
            <h3>Coppie & Soprannomi Squadre ({extractedCouples.length})</h3>
          </div>

          <div className={`slot-machine-box ${isDrawing ? 'slot-animating' : ''}`}>
            <span className="slot-text">{currentSlotText}</span>
          </div>

          <div className="extracted-couples-list">
            {extractedCouples.map((couple, index) => (
              <div key={index} className="couple-row animate-scale-up">
                <div className="couple-row-left">
                  <span className="couple-index">Coppia {index + 1}:</span>
                  {editingIndex === index ? (
                    <input
                      type="text"
                      className="nickname-edit-input"
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      placeholder="Soprannome (es: I Bombardieri)..."
                      autoFocus
                    />
                  ) : (
                    <span className="couple-names">🏆 {couple}</span>
                  )}
                </div>

                {isAdmin && (
                  <div className="couple-row-actions">
                    {editingIndex === index ? (
                      <button
                        onClick={() => handleSaveNickname(index)}
                        className="btn-icon-success"
                        title="Salva soprannome"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(index, couple)}
                        className="btn-icon-edit"
                        title="Assegna Soprannome"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {isAdmin && extractedCouples.length > 0 && (
            <button onClick={handleApplyCouples} className="btn-success w-full mt-4">
              <CheckCircle2 className="w-5 h-5" />
              <span>Salva e Applica al Torneo 🏆</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
