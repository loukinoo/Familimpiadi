/**
 * @file SportsManager.jsx
 * @description Gestione degli sport ufficiali e form pubblico per la proposta di nuovi sport.
 */

import React, { useState } from 'react';
import { Lightbulb, Plus, Trash2, CheckCircle, XCircle, Send, Sparkles } from 'lucide-react';

export default function SportsManager({ state, onUpdateSportsList, onUpdateSuggestions, isAdmin }) {
  const sports = state.sports || [];
  const suggestions = state.suggestions || [];

  const [newSportName, setNewSportName] = useState('');
  const [suggestionName, setSuggestionName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState(false);

  // Aggiunta diretta sport (Admin)
  const handleAddSport = (e) => {
    e.preventDefault();
    if (!newSportName.trim()) return;
    if (sports.includes(newSportName.trim())) return;

    const updated = [...sports, newSportName.trim()];
    onUpdateSportsList(updated);
    setNewSportName('');
  };

  // Rimozione sport (Admin)
  const handleRemoveSport = (sportToRemove) => {
    if (sports.length <= 1) return;
    const updated = sports.filter((s) => s !== sportToRemove);
    onUpdateSportsList(updated);
  };

  // Invio suggerimento da parte di un parente (Pubblico)
  const handleSendSuggestion = (e) => {
    e.preventDefault();
    if (!suggestionName.trim()) return;

    const newSuggestion = {
      id: Date.now().toString(),
      sportName: suggestionName.trim(),
      author: authorName.trim() || 'Parente Anonimo',
      status: 'pending',
    };

    onUpdateSuggestions([...suggestions, newSuggestion]);
    setSuggestionName('');
    setAuthorName('');
    setSubmittedMsg(true);
    setTimeout(() => setSubmittedMsg(false), 4000);
  };

  // Approva suggerimento e trasforma in sport ufficiale (Admin)
  const handleApproveSuggestion = (sug) => {
    const updatedSuggestions = suggestions.map((item) =>
      item.id === sug.id ? { ...item, status: 'approved' } : item
    );
    onUpdateSuggestions(updatedSuggestions);

    if (!sports.includes(sug.sportName)) {
      onUpdateSportsList([...sports, sug.sportName]);
    }
  };

  // Rifiuta suggerimento (Admin)
  const handleRejectSuggestion = (sugId) => {
    const updatedSuggestions = suggestions.map((item) =>
      item.id === sugId ? { ...item, status: 'rejected' } : item
    );
    onUpdateSuggestions(updatedSuggestions);
  };

  return (
    <div className="sports-manager-container animate-fade-in">
      <div className="sports-header">
        <div className="header-badge">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span>Idee e Discipline</span>
        </div>
        <h2>Gestione Sport & Suggerimenti</h2>
        <p>
          Esplora le discipline ufficiali dell'edizione corrente o proponi un nuovo sport per le prossime Familimpiadi!
        </p>
      </div>

      <div className="sports-grid mt-6">
        {/* Pannello Sport Ufficiali */}
        <div className="drawer-card">
          <div className="card-title-bar">
            <h3>Sport Ufficiali ({sports.length})</h3>
          </div>

          <div className="official-sports-list">
            {sports.map((sport) => (
              <div key={sport} className="sport-item-row">
                <span className="sport-name">🏆 {sport}</span>
                {isAdmin && (
                  <button
                    onClick={() => handleRemoveSport(sport)}
                    className="btn-icon-danger"
                    title="Rimuovi sport"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isAdmin && (
            <form onSubmit={handleAddSport} className="add-sport-form mt-4">
              <input
                type="text"
                value={newSportName}
                onChange={(e) => setNewSportName(e.target.value)}
                placeholder="Nuovo sport (es: Freccette)..."
              />
              <button type="submit" className="btn-primary">
                <Plus className="w-4 h-4" />
                <span>Aggiungi Sport</span>
              </button>
            </form>
          )}
        </div>

        {/* Form Suggerisci uno Sport (Pubblico) */}
        <div className="drawer-card">
          <div className="card-title-bar">
            <h3>Suggerisci uno Sport per il 2026 💡</h3>
          </div>

          {submittedMsg ? (
            <div className="success-box my-4">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <span>Grazie! La tua proposta è stata inviata all'Admin! 🎉</span>
            </div>
          ) : (
            <form onSubmit={handleSendSuggestion} className="suggestion-form">
              <div className="form-group">
                <label>Nome dello Sport o Gioco</label>
                <input
                  type="text"
                  value={suggestionName}
                  onChange={(e) => setSuggestionName(e.target.value)}
                  placeholder="Es: Corsa con i sacchi, Ping Pong, Padel..."
                  required
                />
              </div>

              <div className="form-group mt-3">
                <label>Il tuo nome (facoltativo)</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Es: Zio Corrado, Sabrina..."
                />
              </div>

              <button type="submit" className="btn-accent-gradient w-full mt-4">
                <Send className="w-4 h-4" />
                <span>Invia Proposta</span>
              </button>
            </form>
          )}

          {/* Elenco dei Suggerimenti Inviati */}
          <div className="suggestions-list-box mt-6">
            <h4>Proposte della Famiglia</h4>
            {suggestions.length === 0 ? (
              <p className="text-xs text-slate-400 mt-2">Nessun suggerimento inviato finora. Sii il primo!</p>
            ) : (
              <div className="suggestions-stack mt-2">
                {suggestions.map((sug) => (
                  <div key={sug.id} className="suggestion-item">
                    <div className="suggestion-info">
                      <span className="sug-name">{sug.sportName}</span>
                      <span className="sug-author">Proposto da: {sug.author}</span>
                    </div>

                    <div className="suggestion-status">
                      {sug.status === 'approved' && (
                        <span className="status-badge-approved">Approvato ✅</span>
                      )}
                      {sug.status === 'rejected' && (
                        <span className="status-badge-rejected">Scartato ❌</span>
                      )}
                      {sug.status === 'pending' && !isAdmin && (
                        <span className="status-badge-pending">In revisione ⏳</span>
                      )}

                      {isAdmin && sug.status === 'pending' && (
                        <div className="admin-sug-actions">
                          <button
                            onClick={() => handleApproveSuggestion(sug)}
                            className="btn-icon-success"
                            title="Approva e aggiungi agli sport"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectSuggestion(sug.id)}
                            className="btn-icon-danger"
                            title="Rifiuta proposta"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
