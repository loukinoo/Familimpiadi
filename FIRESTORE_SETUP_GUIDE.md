# 🔥 Guida Passo-Passo: Configurazione di Firebase Firestore

Questa guida ti accompagna nella configurazione gratuita di **Firebase Cloud Firestore** per abilitare la **sincronizzazione in tempo reale**. In questo modo, quando tu (Amministratore) clicchi su una squadra per segnare la vittoria su uno smartphone, il risultato apparirà **istantaneamente** anche sui telefoni di tutti gli altri parenti!

---

## 🛠️ Passaggio 1: Crea un Progetto su Firebase

1. Vai su **[Firebase Console](https://console.firebase.google.com/)** ed effettua l'accesso con il tuo account Google.
2. Clicca su **Crea un progetto** (o *Aggiungi progetto*).
3. Inserisci il nome del progetto: **`Familimpiadi`**.
4. Disabilita Google Analytics (non serve per un uso casalingo) e clicca su **Crea progetto**.

---

## 🛠️ Passaggio 2: Aggiungi un'App Web e Ottieni le Chiavi

1. Nella dashboard del tuo nuovo progetto Firebase, clicca sull'icona Web **`</>`** (Aggiungi app).
2. Soprannome dell'app: **`Familimpiadi Web`**.
3. Clicca su **Registra l'app**.
4. Vedrai una sezione di codice chiamata `const firebaseConfig = { ... }`.
5. Nel tuo progetto sul computer, apri il file **`.env.local`** (se non esiste, crealo nella cartella radice `Familimpiadi`) e incolla le tue chiavi in questo formato:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=familimpiadi-XXXXX.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=familimpiadi-XXXXX
VITE_FIREBASE_STORAGE_BUCKET=familimpiadi-XXXXX.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

> ⚠️ **Nota:** Assicurati che non ci siano spazi attorno al segno `=`.

---

## 🛠️ Passaggio 3: Crea il Database Firestore

1. Nel menu a sinistra della console Firebase, vai su **Build** -> **Database Firestore**.
2. Clicca su **Crea database**.
3. Posizione del database: seleziona **`eur3 (europe-west)`** o **`europe-west1`** (Europa).
4. Regole di avvio: seleziona **Avvia in modalità di prova** (Test mode) e clicca su **Crea**.

---

## 🛡️ Passaggio 4: Configura le Regole di Sicurezza Firestore

Per permettere ai tuoi parenti di leggere i dati in tempo reale e all'Admin di salvare i risultati:

1. Nella pagina di Cloud Firestore, clicca sulla scheda **Regole** (Rules).
2. Sostituisci il contenuto del pannello con queste regole pronte:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /familimpiadi/{document=**} {
      // Permetti a tutti di leggere e salvare i risultati dei tornei di famiglia
      allow read, write: if true;
    }
  }
}
```

3. Clicca sul pulsante **Pubblica** (Publish) in alto a destra.

---

## 🎉 Fatto!
Riavvia il server locale con `npm run dev` o compila con `npm run build`.
Nel terminale vedrai il messaggio:
`🔥 Firebase Firestore inizializzato con successo!`

Ora il tuo torneo ha la sincronizzazione cloud dal vivo attiva! 📱⚡️
