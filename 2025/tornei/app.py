from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

# Carica i dati dei match da file JSON
def load_data():
    with open("data/squadre.json", "r", encoding="utf-8") as f:
        return json.load(f)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/biliardino.html")
def biliardino():
    return render_template("biliardino.html")

@app.route("/api/match")
def api_match():
    data = load_data()
    return jsonify(data)

@app.route('/save_match', methods=['POST'])
def save_match():
    new_data = request.json
    # Leggi il JSON esistente
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Cerca la riga corrispondente e aggiorna, altrimenti aggiungi
    updated = False
    for row in data:
        if (row['Disciplina'] == new_data['Disciplina'] and
            str(row['Round']) == str(new_data['Round']) and
            str(row['Match']) == str(new_data['Match'])):
            row.update(new_data)
            updated = True
            break
    if not updated:
        data.append(new_data)
    
    # Scrivi di nuovo il JSON
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    return jsonify({"status":"ok"})

if __name__ == "__main__":
    app.run(debug=True)