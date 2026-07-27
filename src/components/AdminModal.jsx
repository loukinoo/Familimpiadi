/**
 * @file AdminModal.jsx
 * @description Modal di autenticazione Admin con funzione di Reset Anno previa conferma.
 */

import React, { useState } from 'react';
import { Lock, KeyRound, Check, X, ShieldAlert, RotateCcw, AlertTriangle } from 'lucide-react';
import { verifyAdminPassword } from '../services/storageService';

export default function AdminModal({
  isOpen,
  onClose,
  isAdmin,
  setIsAdmin,
  selectedYear,
  onResetYearData,
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verifyAdminPassword(pin)) {
      setIsAdmin(true);
      setError(false);
      setPin('');
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setShowConfirmReset(false);
    onClose();
  };

  const handleConfirmResetAction = () => {
    onResetYearData(selectedYear);
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="modal-header text-center">
          <div className="icon-circle bg-amber-500/20 text-amber-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="mt-2">Pannello Amministratore</h3>
          <p className="text-sm text-slate-300">
            {isAdmin
              ? `Sei autenticato come Admin per l'Edizione ${selectedYear}.`
              : "Inserisci il PIN segreto per gestire le vittorie, le estrazioni ed i reset."}
          </p>
        </div>

        {isAdmin ? (
          <div className="admin-status-box mt-4">
            {!showConfirmReset ? (
              <>
                <div className="status-badge bg-emerald-500/20 text-emerald-400 p-3 rounded-lg flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span className="font-bold">Modalità Admin Attiva</span>
                </div>

                <p className="text-xs text-slate-300 text-center mt-3">
                  Puoi cliccare sulle squadre nei tornei per decretare i vincitori o azzerare l'anno corrente per una nuova presentazione.
                </p>

                <div className="admin-actions-stack mt-4">
                  <button
                    className="btn-warning-outline w-full flex items-center justify-center gap-2"
                    onClick={() => setShowConfirmReset(true)}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Resetta Dati Edizione {selectedYear}</span>
                  </button>

                  <button className="btn-secondary w-full mt-2" onClick={handleLogout}>
                    Disattiva Modalità Admin
                  </button>
                </div>
              </>
            ) : (
              <div className="confirm-reset-box bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-center animate-scale-up">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2 animate-bounce" />
                <h4 className="font-extrabold text-red-400 text-base">Conferma Reset Edizione {selectedYear}</h4>
                <p className="text-xs text-slate-200 mt-2">
                  Sei sicuro di voler resettare tutte le coppie, le partite ed i punteggi dell'anno {selectedYear}? Questa azione riporterà il torneo al suo stato vuoto (blank).
                </p>

                <div className="confirm-actions-row mt-4 flex gap-3">
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => setShowConfirmReset(false)}
                  >
                    Annulla
                  </button>
                  <button
                    className="btn-danger flex-1"
                    onClick={handleConfirmResetAction}
                  >
                    Sì, Resetta Ora 🔥
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-form mt-4">
            <div className="form-group">
              <label htmlFor="admin-pin">PIN o Password Admin</label>
              <div className="input-with-icon mt-1">
                <KeyRound className="input-icon text-slate-400" />
                <input
                  id="admin-pin"
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(false);
                  }}
                  placeholder="Inserisci PIN"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="error-message mt-2 text-red-400 text-xs flex items-center gap-1 justify-center">
                <ShieldAlert className="w-4 h-4" />
                <span>PIN errato.</span>
              </div>
            )}

            <div className="modal-footer mt-4 flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={onClose}>
                Annulla
              </button>
              <button type="submit" className="btn-primary flex-1">
                Sblocca Admin 🔓
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
