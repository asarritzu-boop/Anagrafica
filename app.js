/**
 * APP.JS - Versione Integrale con Calcoli S-88 e Media Mensile
 * Gestione Congregazione S-21 e S-88
 */

// --- 1. DATABASE E COSTANTI ---
let db = JSON.parse(localStorage.getItem('congregazione_db')) || {
    membri: [],
    gruppi: [],
    statisticheS88: {}, 
    archivio: {}
};

const MESI = ["Settembre", "Ottobre", "Novembre", "Dicembre", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto"];

function saveData() {
    localStorage.setItem('congregazione_db', JSON.stringify(db));
}

// --- 2. MOTORE UI (MODALE) ---
function chiudiModal() {
    document.getElementById('mainModal').classList.add('hidden');
}

function apriModal(html) {
    const modal = document.getElementById('mainModal');
    document.getElementById('modalContent').innerHTML = html + 
        `<button onclick="chiudiModal()" class="w-full mt-6 bg-gray-200 p-3 rounded-xl font-bold text-gray-600 hover:bg-gray-300 transition">Torna alla Dashboard</button>`;
    modal.classList.remove('hidden');
}

// --- 3. CREAZIONE COMPONENTE (S-21 COMPLETA) ---
function apriModalNuovoMembro() {
    let html = `
    <h2 class="text-2xl font-bold mb-6 text-bordeaux border-b pb-2">Nuova Scheda S-21</h2>
    <form id="formNuovo" class="space-y-4 text-left">
        <div>
            <label class="block text-xs font-bold text-gray-500 uppercase">Nome e Cognome</label>
            <input type="text" id="n_nome" class="w-full border-2 border-gray-200 p-3 rounded-lg font-bold focus:border-bordeaux outline-none" required>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
            <div class="border p-2 rounded-lg bg-gray-50">
                <label class="text-[10px] font-bold block uppercase text-gray-400">Data di Nascita</label>
                <input type="date" id="n_nascita" class="w-full bg-transparent">
            </div>
            <div class="border p-2 rounded-lg bg-gray-50">
                <label class="text-[10px] font-bold block uppercase text-gray-400">Data del Battesimo</label>
                <input type="date" id="n_battesimo" class="w-full bg-transparent">
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm">
            <div>
                <label class="block text-xs font-bold mb-2 text-gray-600 uppercase">Sesso</label>
                <div class="flex gap-4">
                    <label class="flex items-center"><input type="radio" name="sex" value="M" checked class="mr-1"> M</label>
                    <label class="flex items-center"><input type="radio" name="sex" value="F" class="mr-1"> F</label>
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold mb-2 text-gray-600 uppercase">Speranza</label>
                <div class="flex gap-4">
                    <label class="flex items-center"><input type="radio" name="hope" value="AP" checked class="mr-1"> AP</label>
                    <label class="flex items-center"><input type="radio" name="hope" value="U" class="mr-1"> U</label>
                </div>
            </div>
        </div>

        <div class="p-4 border rounded-xl bg-white space-y-2 shadow-sm text-sm">
            <label class="block text-xs font-bold mb-2 text-gray-500 uppercase">Incarichi e Privilegi</label>
            <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center"><input type="checkbox" id="c_anziano" class="mr-2"> Anziano</label>
                <label class="flex items-center"><input type="checkbox" id="c_servitore" class="mr-2"> Servitore di Min.</label>
                <label class="flex items-center"><input type="checkbox" id="c_pionR" class="mr-2"> Pioniere Regolare</label>
                <label class="flex items-center"><input type="checkbox" id="c_pionS" class="mr-2"> Pioniere Speciale</label>
                <label class="flex items-center col-span-2"><input type="checkbox" id="c_miss" class="mr-2"> Missionario sul campo</label>
            </div>
        </div>

        <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Osservazioni</label>
            <textarea id="n_osservazioni" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm h-24 focus:border-bordeaux outline-none" placeholder="Note aggiuntive..."></textarea>
        </div>

        <button type="button" onclick="salvaNuovoComponente()" class="w-full bg-bordeaux text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:bg-red-900 transition">
            SALVA SCHEDA S-21
        </button>
    </form>`;
    apriModal(html);
}

function salvaNuovoComponente() {
    const nome = document.getElementById('n_nome').value;
    if(!nome) return alert("Il nome è obbligatorio");

    const nuovo = {
        id: Date.now(),
        nome: nome,
        nascita: document.getElementById('n_nascita').value,
        battesimo: document.getElementById('n_battesimo').value,
        sesso: document.querySelector('input[name="sex"]:checked').value,
        speranza: document.querySelector('input[name="hope"]:checked').value,
        anziano: document.getElementById('c_anziano').checked,
        servitore: document.getElementById('c_servitore').checked,
        pioniereR: document.getElementById('c_pionR').checked,
        pioniereS: document.getElementById('c_pionS').checked,
        missionario: document.getElementById('c_miss').checked,
        osservazioni: document.getElementById('n_osservazioni').value,
        rapporti: {}
    };

    db.membri.push(nuovo);
    saveData();
    chiudiModal();
    alert("Componente aggiunto!");
}

// --- 4. VISUALIZZAZIONE ANAGRAFICA ---
function visualizzaAnagrafica(tipo) {
    let membriOrdinati = [...db.membri];
    if (tipo === 'alfabetico') {
        membriOrdinati.sort((a, b) => a.nome.localeCompare(b.nome));
    } else {
        membriOrdinati.sort((a, b) => (a.gruppoId || '').localeCompare(b.gruppoId || ''));
    }

    let html = `
    <div class="flex justify-between items-center mb-6 border-b pb-2">
        <h2 class="text-xl font-bold text-bordeaux uppercase">Anagrafica ${tipo}</h2>
        <button onclick="alert('Generazione PDF...')" class="bg-green-600 text-white px-4 py-1 rounded-lg text-xs font-bold">SCARICA PDF</button>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-100 text-[10px] uppercase text-gray-600">
                <tr><th class="p-2">Nome</th><th class="p-2">Privilegi</th><th class="p-2">Gruppo</th></tr>
            </thead>
            <tbody>
                ${membriOrdinati.map(m => `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-2 font-bold">${m.nome}</td>
                        <td class="p-2 text-xs">${m.anziano?'Anziano':m.servitore?'Servitore':'Proclamatore'}</td>
                        <td class="p-2 text-xs">${m.gruppoId || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
    apriModal(html);
}

// --- 5. GESTIONE S-88 (PRESENTI ADUNANZE) ---
function apriEditorS88() {
    let html = `<h2 class="text-2xl font-bold mb-4 text-bordeaux border-b pb-2 text-center">Registrazione Presenti (S-88)</h2>
    <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">`;
    
    MESI.forEach(mese => {
        const s = db.statisticheS88[mese] || { inf_tot: '', inf_num: '', inf_media: '-', fs_tot: '', fs_num: '', fs_media: '-' };
        html += `
        <div class="p-4 border rounded-xl bg-gray-50 text-left shadow-sm">
            <div class="font-bold text-bordeaux mb-3 border-b pb-1 text-center uppercase tracking-wider">${mese}</div>
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <p class="text-[10px] font-black text-blue-700 uppercase border-l-2 border-blue-700 pl-2">Infrasettimanale</p>
                    <input type="number" placeholder="Tot. Presenti" value="${s.inf_tot}" class="w-full border p-2 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" onchange="salvaS88('${mese}','inf_tot',this.value)">
                    <input type="number" placeholder="N. Adunanze" value="${s.inf_num}" class="w-full border p-2 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" onchange="salvaS88('${mese}','inf_num',this.value)">
                    <p class="text-[10px] font-bold text-gray-400">MEDIA SETT: <span class="text-blue-700" id="media-inf-${mese}">${s.inf_media}</span></p>
                </div>
                <div class="space-y-2">
                    <p class="text-[10px] font-black text-green-700 uppercase border-l-2 border-green-700 pl-2">Fine Settimana</p>
                    <input type="number" placeholder="Tot. Presenti" value="${s.fs_tot}" class="w-full border p-2 rounded text-sm focus:ring-1 focus:ring-green-500 outline-none" onchange="salvaS88('${mese}','fs_tot',this.value)">
                    <input type="number" placeholder="N. Adunanze" value="${s.fs_num}" class="w-full border p-2 rounded text-sm focus:ring-1 focus:ring-green-500 outline-none" onchange="salvaS88('${mese}','fs_num',this.value)">
                    <p class="text-[10px] font-bold text-gray-400">MEDIA SETT: <span class="text-green-700" id="media-fs-${mese}">${s.fs_media}</span></p>
                </div>
            </div>
        </div>`;
    });

    const mediaAnnuale = calcolaMediaAnnualeS88();
    html += `
    </div>
    <div class="mt-4 p-3 bg-bordeaux text-white rounded-xl shadow-lg text-center">
        <p class="text-[10px] font-bold uppercase mb-1">Media Presenti Ogni Mese (Annuale)</p>
        <div class="flex justify-around font-bold">
            <div>INF: ${mediaAnnuale.inf}</div>
            <div>F.S.: ${mediaAnnuale.fs}</div>
        </div>
    </div>
    <button onclick="alert('Generazione S-88 PDF...')" class="w-full mt-4 bg-gray-800 text-white p-4 rounded-xl font-bold hover:bg-black transition shadow-xl uppercase tracking-widest">Genera PDF S-88</button>`;
    apriModal(html);
}

function salvaS88(mese, campo, valore) {
    if(!db.statisticheS88[mese]) db.statisticheS88[mese] = { inf_tot: '', inf_num: '', inf_media: '-', fs_tot: '', fs_num: '', fs_media: '-' };
    db.statisticheS88[mese][campo] = valore;

    const s = db.statisticheS88[mese];
    
    // Calcolo automatico media settimanale infrasettimanale
    if (s.inf_tot && s.inf_num && s.inf_num > 0) {
        s.inf_media = Math.round(s.inf_tot / s.inf_num);
        document.getElementById(`media-inf-${mese}`).innerText = s.inf_media;
    }
    
    // Calcolo automatico media settimanale fine settimana
    if (s.fs_tot && s.fs_num && s.fs_num > 0) {
        s.fs_media = Math.round(s.fs_tot / s.fs_num);
        document.getElementById(`media-fs-${mese}`).innerText = s.fs_media;
    }
    
    saveData();
}

function calcolaMediaAnnualeS88() {
    let totInf = 0, numInf = 0, totFs = 0, numFs = 0;
    
    Object.values(db.statisticheS88).forEach(s => {
        if(s.inf_tot && s.inf_num) { totInf += parseInt(s.inf_tot); numInf += parseInt(s.inf_num); }
        if(s.fs_tot && s.fs_num) { totFs += parseInt(s.fs_tot); numFs += parseInt(s.fs_num); }
    });

    return {
        inf: numInf > 0 ? Math.round(totInf / numInf) : '-',
        fs: numFs > 0 ? Math.round(totFs / numFs) : '-'
    };
}

// --- 6. ARCHIVIO, BACKUP E RESET ---
function apriArchivio() {
    const anni = Object.keys(db.archivio);
    let html = `<h2 class="text-2xl font-bold mb-6 text-bordeaux border-b">Archivio Annuale</h2>
    <div class="space-y-3">`;
    anni.forEach(anno => {
        html += `<div class="p-4 border rounded-xl bg-gray-50 flex justify-between items-center shadow-sm">
            <span class="font-bold">Anno ${anno}</span>
            <button onclick="generaZIP('${anno}')" class="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tighter shadow-sm hover:bg-green-700 transition">Scarica ZIP 📦</button>
        </div>`;
    });
    html += `</div><button onclick="chiudiAnno()" class="w-full mt-6 bg-orange-600 text-white p-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg">🔒 CHIUDI E ARCHIVIA ANNO ATTUALE</button>`;
    apriModal(html);
}

function resetTotale() {
    if (confirm("⚠️ ATTENZIONE: Questa operazione cancellerà TUTTI i dati. Continuare?")) {
        localStorage.removeItem('congregazione_db');
        location.reload();
    }
}

function esportaBackup() {
    const data = JSON.stringify(db);
    const blob = new Blob([data], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_congregazione.json`;
    a.click();
}

// --- 7. CONDIVISIONE ---
async function condividiApp() {
    const shareData = { title: 'Gestione S-21/S-88', url: window.location.href };
    try {
        if (navigator.share) await navigator.share(shareData);
        else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copiato negli appunti!");
        }
    } catch (err) { console.log(err); }
}

// --- 8. FOOTER ---
function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = "max-w-4xl mx-auto p-8 flex flex-col items-center gap-4 text-gray-400";
    footer.innerHTML = `
        <div class="flex gap-6 text-sm font-medium">
            <button onclick="esportaBackup()" class="hover:text-bordeaux transition">📤 Esporta Backup</button>
            <button onclick="resetTotale()" class="text-red-400 hover:text-red-600 transition">⚠️ Reset Database</button>
        </div>
        <p class="text-[10px] uppercase tracking-widest font-bold">Sistema Gestionale Locale - Privacy Garantita</p>
    `;
    document.body.appendChild(footer);
}

// Inizializzazione
renderFooter();
saveData();
