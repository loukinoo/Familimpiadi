/**
 * @file AdminModal.jsx
 * @description Modal di autenticazione per l'accesso alle funzionalità Admin.
 */

import React, { useState } from 'react';
import { Lock, KeyRound, Check, X, ShieldAlert } from 'lucide-react';
import { verifyAdminPassword } from '../services/storageService';

export default function AdminModal({ isOpen, onClose, isAdmin, setIsAdmin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verifyAdminPassword(pin)) {
      setIsAdmin(true);
      setError(false);
      setPin('');
      onClose();
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="modal-header">
          <div className="icon-circle bg-amber-500/20 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <h3>Pannello di Controllo Admin</h3>
          <p>
            {isAdmin 
              ? "Sei attualmente autenticato come Amministratore del Torneo." 
              : "Inserisci il PIN segreto Admin per gestire i risultati e le impostazioni del torneo."}
          </p>
        </div>

        {isAdmin ? (
          <div className="admin-status-box">
            <div className="status-badge bg-emerald-500/20 text-emerald-400">
              <Check className="w-5 h-5" />
              <span>Modalità Admin Attiva</span>
            </div>
            <p className="text-sm text-slate-300 mt-2">
              Puoi cliccare sulle squadre nei tabelloni per decretare i vincitori, avviare le estrazioni e gestire gli sport.
            </p>
            <button className="btn-danger w-full mt-4" onClick={handleLogout}>
              Disattiva Modalità Admin
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="admin-pin">PIN o Password Admin</label>
              <div className="input-with-icon">
                <KeyRound className="input-icon" />
                <input
                  id="admin-pin"
                  type="password"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setError(false); }}
                  placeholder="Inserisci PIN (default: 1234)"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <ShieldAlert className="w-4 h-4" />
                <span>PIN errato. Riprova! (PIN predefinito: 1234)</span>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Annulla
              </button>
              <button type="submit" className="btn-primary">
                Sblocca Admin 🔓
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
