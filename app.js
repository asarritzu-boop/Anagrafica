/**
 * APP.JS - FIX INTEGRALE: NUOVA SCHEDA, RAPPORTI E GRUPPI
 */

let db = JSON.parse(localStorage.getItem('congregazione_db')) || {
    membri: [],
    gruppi: [],
    statisticheS88: {}, 
    archivio: {}
};

const MESI = ["Settembre", "Ottobre", "Novembre", "Dicembre", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto"];

function saveData() { localStorage.setItem('congregazione_db', JSON.stringify(db)); }

// --- UI UTILS ---
function chiudiModal() { document.getElementById('mainModal').classList.add('hidden'); }
function apriModal(html) {
    const content = document.getElementById('modalContent');
    content.innerHTML = html + `<button onclick="chiudiModal()" class="w-full mt-6 bg-gray-200 p-3 rounded-xl font-bold text-gray-600 uppercase text-xs">Chiudi</button>`;
    document.getElementById('mainModal').classList.remove('hidden');
}

// --- GESTIONE MEMBRI (FIX NUOVA SCHEDA) ---
function apriModalNuovoMembro(idMembro = null) {
    const m = idMembro ? db.membri.find(x => x.id === idMembro) : null;
    let html = `
    <h2 class="text-xl font-bold mb-6 text-bordeaux uppercase text-center">${m ? 'Modifica Membro' : 'Nuova Scheda S-21'}</h2>
    <div class="space-y-4 text-left">
        <input type="hidden" id="m_id" value="${m ? m.id : ''}">
        <div>
            <label class="text-[10px] font-bold text-gray-400 uppercase ml-2">Nome e Cognome</label>
            <input type="text" id="n_nome" value="${m ? m.nome : ''}" placeholder="Esempio: Mario Rossi" class="w-full border-2 p-3 rounded-xl font-bold outline-none focus:border-bordeaux">
        </div>
        <div class="p-4 bg-gray-50 rounded-2xl border space-y-2">
            <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Privilegi / Incarichi</p>
            <div class="grid grid-cols-2 gap-2 text-sm font-bold">
                <label class="flex items-center gap-2"><input type="checkbox" id="c_anziano" ${m?.anziano?'checked':''}> Anziano</label>
                <label class="flex items-center gap-2"><input type="checkbox" id="c_servitore" ${m?.servitore?'checked':''}> Servitore</label>
                <label class="flex items-center gap-2"><input type="checkbox" id="c_pionR" ${m?.pioniereR?'checked':''}> Pion. Reg.</label>
            </div>
        </div>
        <button onclick="salvaMembro()" class="w-full bg-bordeaux text-white p-4 rounded-2xl font-bold uppercase shadow-lg active:scale-95 transition">Salva nel Database</button>
    </div>`;
    apriModal(html);
}

function salvaMembro() {
    const id = document.getElementById('m_id').value;
    const nome = document.getElementById('n_nome').value;
    if(!nome) { alert("Inserisci almeno il nome!"); return; }

    const nuoviDati = {
        id: id ? parseInt(id) : Date.now(),
        nome: nome,
        anziano: document.getElementById('c_anziano').checked,
        servitore: document.getElementById('c_servitore').checked,
        pioniereR: document.getElementById('c_pionR').checked,
        gruppoId: id ? (db.membri.find(x => x.id == id)?.gruppoId || null) : null,
        rapporti: id ? (db.membri.find(x => x.id == id)?.rapporti || {}) : {}
    };

    if(id) {
        const index = db.membri.findIndex(x => x.id == id);
        db.membri[index] = nuoviDati;
    } else {
        db.membri.push(nuoviDati);
    }

    saveData();
    chiudiModal();
    alert("Scheda salvata con successo!");
}

// --- GESTIONE RAPPORTI (FIX INSERIMENTO) ---
function vaiAElencoProfili() {
    if(db.membri.length === 0) {
        alert("Nessun proclamatore in elenco. Crea prima una scheda!");
        return;
    }
    let html = `<h2 class="text-xl font-bold mb-4 text-bordeaux uppercase text-center">Inserimento Rapporti</h2>
    <p class="text-[9px] text-center text-gray-400 mb-4 uppercase tracking-widest">Seleziona un proclamatore</p>
    <div class="space-y-2 max-h-80 overflow-y-auto pr-1">`;
    
    db.membri.sort((a,b)=>a.nome.localeCompare(b.nome)).forEach(m => {
        html += `
        <div class="flex justify-between items-center p-3 bg-white border rounded-2xl shadow-sm">
            <span class="font-bold text-gray-700 ml-2">${m.nome}</span>
            <button onclick="apriEditorRapporti(${m.id})" class="bg-bordeaux text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase shadow-md active:scale-95 transition">Apri S-21</button>
        </div>`;
    });
    apriModal(html + `</div>`);
}

function apriEditorRapporti(id) {
    const m = db.membri.find(x => x.id === id);
    let html = `
    <h2 class="text-xl font-bold text-bordeaux text-center uppercase">${m.nome}</h2>
    <div class="my-4 space-y-2 max-h-80 overflow-y-auto pr-2">`;
    
    MESI.forEach(mese => {
        const rap = m.rapporti[mese] || { partecipato: false };
        html += `
        <div class="p-3 border rounded-xl flex items-center justify-between bg-gray-50">
            <span class="text-[11px] font-bold uppercase text-gray-500">${mese}</span>
            <div class="flex items-center gap-3">
                <span class="text-[9px] font-bold text-gray-400 uppercase">Ha partecipato?</span>
                <input type="checkbox" class="w-6 h-6 accent-bordeaux" ${rap.partecipato ? 'checked' : ''} onchange="salvaMese(${id},'${mese}','partecipato',this.checked)">
            </div>
        </div>`;
    });
    apriModal(html + `</div>`);
}

function salvaMese(id, mese, campo, valore) {
    const m = db.membri.find(x => x.id == id);
    if(!m.rapporti[mese]) m.rapporti[mese] = {};
    m.rapporti[mese][campo] = valore;
    saveData();
}

// --- FIX GRUPPI ---
function mostraGestioneGruppi() {
    let html = `
    <h2 class="text-2xl font-bold mb-6 text-bordeaux text-center uppercase">Gestione Gruppi</h2>
    <div class="grid grid-cols-1 gap-4">
        <button onclick="apriModalNuovoGruppo()" class="p-4 bg-white border-2 border-gray-100 rounded-[2rem] flex items-center gap-4 active:bg-gray-50 transition shadow-sm">
            <span class="text-3xl">➕</span>
            <div class="text-left"><p class="font-bold uppercase text-xs">Crea Nuovo Gruppo</p></div>
        </button>
        <button onclick="elencoGruppi()" class="p-4 bg-white border-2 border-gray-100 rounded-[2rem] flex items-center gap-4 active:bg-gray-50 transition shadow-sm">
            <span class="text-3xl">📂</span>
            <div class="text-left"><p class="font-bold uppercase text-xs">Elenco e Cartoline</p></div>
        </button>
    </div>`;
    apriModal(html);
}

function apriModalNuovoGruppo() {
    let html = `<h2 class="text-xl font-bold mb-4 text-bordeaux uppercase">Nuovo Gruppo</h2>
    <div class="space-y-4">
        <input type="text" id="g_nome" placeholder="Nome Gruppo (es. Gruppo 1)" class="w-full border p-4 rounded-2xl font-bold">
        <input type="text" id="g_sorv" placeholder="Nome Sorvegliante" class="w-full border p-4 rounded-2xl font-bold">
        <button onclick="salvaGruppo()" class="w-full bg-bordeaux text-white p-4 rounded-2xl font-bold uppercase shadow-lg">Salva Gruppo</button>
    </div>`;
    apriModal(html);
}

function salvaGruppo() {
    const nome = document.getElementById('g_nome').value;
    if(!nome) return alert("Nome gruppo mancante");
    db.gruppi.push({ id: Date.now(), nome, sorvegliante: document.getElementById('g_sorv').value });
    saveData();
    mostraGestioneGruppi();
}

function elencoGruppi() {
    let html = `<h2 class="text-xl font-bold mb-4 text-bordeaux uppercase text-center">Gruppi di Servizio</h2><div class="space-y-3">`;
    if(db.gruppi.length === 0) html += `<p class="text-center text-gray-400 py-4">Nessun gruppo creato.</p>`;
    db.gruppi.forEach(g => {
        html += `
        <div class="p-4 bg-gray-50 rounded-2xl border flex justify-between items-center shadow-sm">
            <div class="text-left"><p class="font-bold">${g.nome}</p><p class="text-[10px] text-gray-400 uppercase">Sorv: ${g.sorvegliante || 'N/D'}</p></div>
            <button onclick="gestisciMembriGruppo(${g.id})" class="bg-bordeaux text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase shadow-sm">Vedi</button>
        </div>`;
    });
    apriModal(html + `</div>`);
}

function gestisciMembriGruppo(gruppoId) {
    const gruppo = db.gruppi.find(g => g.id == gruppoId);
    let html = `<h2 class="text-xl font-bold text-bordeaux uppercase">${gruppo.nome}</h2><p class="text-[10px] text-gray-400 uppercase mb-4">Membri del gruppo</p>
    <div class="space-y-2 max-h-60 overflow-y-auto mb-6">`;
    const membriGruppo = db.membri.filter(m => m.gruppoId == gruppoId);
    membriGruppo.forEach(m => {
        html += `<div class="flex justify-between items-center p-3 border-b bg-white rounded-lg px-4 shadow-sm"><span class="text-sm font-bold text-gray-700">${m.nome}</span><button onclick="apriEditorRapporti(${m.id})" class="text-bordeaux font-bold text-[9px] uppercase">S-21</button></div>`;
    });
    html += `</div><p class="text-[10px] font-bold text-gray-400 uppercase mb-2 border-t pt-2">Assegna/Rimuovi Membri</p><div class="space-y-1 max-h-40 overflow-y-auto">`;
    db.membri.sort((a,b)=>a.nome.localeCompare(b.nome)).forEach(m => {
        html += `<label class="flex justify-between items-center p-2 text-xs border-b"><span class="${m.gruppoId == gruppoId ? 'font-bold text-bordeaux' : ''}">${m.nome}</span><input type="checkbox" class="w-5 h-5" ${m.gruppoId == gruppoId ? 'checked' : ''} onchange="toggleMembroGruppo(${m.id}, ${gruppoId})"></label>`;
    });
    apriModal(html + `</div>`);
}

function toggleMembroGruppo(mId, gId) {
    const m = db.membri.find(x => x.id == mId);
    m.gruppoId = (m.gruppoId == gId) ? null : gId;
    saveData();
}

// --- ALTRE FUNZIONI (STUB) ---
function controllaRapportiMancanti() {
    const data = new Date();
    const mese = MESI[(data.getMonth() + 4) % 12];
    const mancanti = db.membri.filter(m => !m.rapporti[mese] || !m.rapporti[mese].partecipato);
    let h = `<h2 class="text-xl font-bold text-bordeaux uppercase text-center">Mancanti (${mese})</h2>`;
    if(mancanti.length===0) h += `<p class="py-10 text-center font-bold text-green-600">Tutti a posto! ✅</p>`;
    else {
        h += `<div class="space-y-2 mt-4">`;
        mancanti.forEach(m => {
            h += `<div class="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                <span class="font-bold text-sm">${m.nome}</span>
                <button onclick="apriEditorRapporti(${m.id})" class="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase">Compila</button>
            </div>`;
        });
        h += `</div>`;
    }
    apriModal(h);
}

function apriEditorS88() { alert("Modulo S-88 in fase di configurazione PDF."); }
function esportaBackup() {
    const blob = new Blob([JSON.stringify(db)], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "backup_congregazione.json";
    a.click();
}
function importaBackup(e) {
    const reader = new FileReader();
    reader.onload = (x) => { db = JSON.parse(x.target.result); saveData(); location.reload(); };
    reader.readAsText(e.target.files[0]);
}
function resetTotale() { if(confirm("Cancellare tutto?")) { localStorage.clear(); location.reload(); } }
async function condividiApp() { try { await navigator.share({ title: 'Gestione S-21', url: window.location.href }); } catch (e) {} }
function mostraPionieri() { alert("Funzione Pionieri in attivazione"); }
function visualizzaAnagrafica() { alert("Funzione Anagrafica in attivazione"); }
function apriArchivio() { alert("Archivio non ancora popolato."); }
                                                                                                                                                                                                                         
