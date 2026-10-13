/* =========================================================
   GSI – FUNKSJONER & SKOLEÅRHÅNDTERING
   ========================================================= */

const pages = [
  {id:1,name:'Enhetsopplysninger'},{id:2,name:'Om skolen'},{id:3,name:'Elever og timer'},
  {id:4,name:'Årstimer'},{id:5,name:'Lærere og assistenter'},{id:6,name:'Årsverk og ansatte'},
  {id:7,name:'Individuell tilrettelegging'},{id:8,name:'Særskilt språkopplæring'},{id:9,name:'Opplæringsspråk'},
  {id:10,name:'Fremmedspråk, språklig fordypning og arbeidslivsfag'},{id:11,name:'Valgfag'},
  {id:12,name:'Fysisk aktivitet og leksehjelp'},{id:13,name:'Andre opplysninger'},{id:14,name:'Skolefritidsordningen (SFO)'},
  {id:15,name:'Pedagogisk-psykologisk tjeneste (PPT)'},{id:16,name:'Fordrevne ukrainske elever'},
  {id:17,name:'Kontroller'},{id:18,name:'Fullfør'}
];

// VIKTIG: activeSchoolId må defineres helt øverst!
let activeSchoolId = null;
let currentPage = 1, formData = {}, saveTimer = null;
let activeSchoolYear = '';
let isLoadingData = false;



/* =========================================================
   HJELPEFUNKSJONER
   ========================================================= */

const parseNum = val => (Number.isFinite(Number.parseFloat(val)) ? Number.parseFloat(val) : 0);
const numberValue = id => parseNum(document.getElementById(id)?.value);

function setNumber(id, value) {
  let n = parseNum(value);
  n = Math.round((n + Number.EPSILON) * 100) / 100;

  formData[id] = n;
  const el = document.getElementById(id);
  if (el) {
    el.value = (n === 0) ? '' : n;
  }
}

const sumIds = ids => ids.reduce((sum, id) => sum + numberValue(id), 0);
const rangeIds = (prefix, from, to, suffix = '') => Array.from({ length: to - from + 1 }, (_, i) => `${prefix}${from + i}${suffix}`);
const allFormElements = () => document.querySelectorAll('main input[id], main select[id], main textarea[id], main input[name]');

/* =========================================================
   SKOLEÅR OG HÅNDTERING (SEPARERT PER SKOLE OG ÅR)
   ========================================================= */

function getActiveSchoolYear() {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

// Skolespesifikk nøkkel for localStorage (virker nå siden activeSchoolId er definert over)
const storageKeyFor = (year) => {
  const schoolPrefix = activeSchoolId ? `${activeSchoolId}_` : '';
  return `gsi_data_${schoolPrefix}${year || 'ukjent'}`;
};

function populateSchoolYears() {
  const select = document.getElementById('year-select');
  if (!select) return;

  const currentSchoolYear = getActiveSchoolYear();
  const [startY] = currentSchoolYear.split('-').map(Number);
  const futureSchoolYear = `${startY + 1}-${startY + 2}`;

  select.innerHTML = `
    <option value="${currentSchoolYear}">${startY}/${startY + 1}</option>
    <option value="${futureSchoolYear}">${startY + 1}/${startY + 2}</option>
  `;

  activeSchoolYear = select.value || currentSchoolYear;
}

function handleYearChange() {
  if (isLoadingData) return;
  saveDataForYear(activeSchoolYear);
  const select = document.getElementById('year-select');
  if (select) {
    activeSchoolYear = select.value;
  }
  
  if (!activeSchoolId) {
    if (typeof renderStartside === 'function') renderStartside();
  } else {
    loadDataForYear();
    syncActiveSchoolStamdata(); // Tvinger inn stamdata for det nye valgte året
    if (typeof saveData === 'function') saveData(false);
  }
}

function saveDataForYear(year) {
  if (isLoadingData || !year) return;
  syncInputsToData();
  try {
    localStorage.setItem(storageKeyFor(year), JSON.stringify(formData));
  } catch (err) {
    console.error('Kunne ikke lagre GSI-data:', err);
  }
}

function saveData(showMessage = false) {
  saveDataForYear(activeSchoolYear);
  if (showMessage) showSaveMessage('Endringer ble lagret.');
}

function loadDataForYear() {
  isLoadingData = true;

  const saved = localStorage.getItem(storageKeyFor(activeSchoolYear));
  try {
    formData = saved ? JSON.parse(saved) || {} : {};
  } catch (err) {
    console.warn('Lagrede data kunne ikke leses.', err);
    formData = {};
  }

  // 1. Gjenopprett dynamiske rader
  if (typeof restoreSide3ERows === 'function') restoreSide3ERows();
  if (typeof restoreSide7HRows === 'function') restoreSide7HRows();
  if (typeof restoreSide8CRows === 'function') restoreSide8CRows();
  if (typeof restoreSide8DRows === 'function') restoreSide8DRows();
  if (typeof restoreSide9CRows === 'function') restoreSide9CRows();

  // 2. Fyll inn verdier i skjermfeltene (og tøm verdier som ikke tilhører dette året)
  syncDataToInputs();

  // 3. Sett skolenavn og kommune fra aktiv skole dersom feltet er tomt
  const activeSchool = typeof getSchools === 'function' ? getSchools().find(s => s.id === activeSchoolId) : null;
  if (activeSchool) {
    if (!formData['s1_skole']) formData['s1_skole'] = activeSchool.name;
    if (!formData['s1_kommunenavn']) formData['s1_kommunenavn'] = activeSchool.kommune;
    
    const s1El = document.getElementById('s1_skole');
    const m1El = document.getElementById('s1_kommunenavn');
    if (s1El && !s1El.value) s1El.value = activeSchool.name;
    if (m1El && !m1El.value) m1El.value = activeSchool.kommune;
  }

  calculateAll(false);

  if (typeof toggleLibraryHours === 'function') toggleLibraryHours();

  updateTopbarInfo();
  updateHeading();
  renderSidebar();

  setTimeout(() => {
    isLoadingData = false;
  }, 100);
}

function syncInputsToData() {
  if (isLoadingData) return;

  allFormElements().forEach(el => {
    if (el.type === 'file' || (!el.id && !el.name)) return;

    if (['radio', 'checkbox'].includes(el.type)) {
      const key = el.id ? `${el.id}__checked` : `${el.name}_${el.value}__checked`;
      if (el.checked) {
        formData[key] = true;
      } else {
        delete formData[key];
      }
    } else if (el.id) {
      if (el.value !== '' && el.value !== null && el.value !== undefined) {
        formData[el.id] = el.value;
      } else {
        delete formData[el.id];
      }
    }
  });
}

function syncDataToInputs() {
  allFormElements().forEach(el => {
    if (el.type === 'file' || (!el.id && !el.name)) return;

    const isCheck = ['radio', 'checkbox'].includes(el.type);
    const key = isCheck ? (el.id ? `${el.id}__checked` : `${el.name}_${el.value}__checked`) : el.id;

    if (Object.prototype.hasOwnProperty.call(formData, key)) {
      if (isCheck) {
        el.checked = Boolean(formData[key]);
      } else {
        el.value = formData[key] !== undefined && formData[key] !== null ? formData[key] : '';
      }
    } else {
      // VIKTIG: Hvis nøkkelen IKKE finnes for dette skoleåret, tøm feltet!
      if (isCheck) {
        el.checked = false;
      } else {
        el.value = '';
      }
    }
  });
}

function autoSave() {
  if (isLoadingData) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveData(false), 300);
}

function calculateAll(saveAfter = false) {
  [calcSide3, calcSide4, calcSide5, calcSide6, calcSide7, calcSide8, calcSide9, calcSide12, calcSide13, calcSide14, calcSide16]
    .forEach(fn => typeof fn === 'function' && fn());

  if (!isLoadingData) {
    syncInputsToData();
  }
  updateTopbarInfo();

  if (saveAfter) saveData(false);
}

/* =========================================================
   SIDEMENY OG NAVIGASJON
   ========================================================= */

function renderSidebar() {
  const nav = document.getElementById('sidebar-menu');
  if (!nav) return;

  nav.innerHTML = pages.map(p => `
    <a href="#" class="nav-item${p.id === currentPage ? ' active' : ''}" onclick="event.preventDefault(); selectPage(${p.id})">
      <span class="nav-number">${p.id}</span><span>${p.name}</span>
    </a>
  `).join('');
}

function updateHeading() {
  const heading = document.getElementById('page-heading');
  const page = pages.find(p => p.id === currentPage);

  const yearSelect = document.getElementById('year-select');
  const yearText = yearSelect?.selectedOptions[0]?.text || activeSchoolYear;

  const startYear = parseInt(yearText.split('/')[0].split('-')[0], 10) || new Date().getFullYear();
  const colorIndex = (startYear % 6) + 1;
  const themeClass = `year-theme-${colorIndex}`;

  if (heading && page) {
    heading.innerHTML = `
      <div class="heading-left">
        <span>${page.id}. ${page.name}</span>
        <span class="school-year-badge ${themeClass}">Skoleår ${yearText}</span>
        <button class="mini-btn btn-fetch-prev" id="copy-prev-year-btn" type="button" title="Hent registreringer fra forrige skoleår for kun denne siden">
          ⟲ Hent fra forrige år
        </button>
      </div>
    `;

    document.getElementById('copy-prev-year-btn')?.addEventListener('click', copyPreviousYearPageData);
  }
}

function selectPage(id) {
  if (id < 1 || id > 18) return;
  saveData(false);

  currentPage = id;
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', Number(p.dataset.page) === id));

  updateHeading();
  renderSidebar();
  if (id === 17 && typeof runValidation === 'function') runValidation(false);
}

const navigatePage = dir => selectPage(currentPage + dir);

function showSaveMessage(msg) {
  let box = document.getElementById('save-message');
  if (!box) {
    box = document.createElement('div');
    box.id = 'save-message';
    box.className = 'save-message-toast';
    document.body.appendChild(box);
  }
  box.textContent = msg;
  box.style.display = 'block';
  clearTimeout(box._timer);
  box._timer = setTimeout(() => box.style.display = 'none', 1800);
}

function updateTopbarInfo() {
  const activeSchool = typeof getSchools === 'function' ? getSchools().find(s => s.id === activeSchoolId) : null;

  const schoolInput = document.getElementById('s1_skole');
  const schoolName = schoolInput?.value || formData['s1_skole'] || activeSchool?.name || 'Velg skole...';

  const muniInput = document.getElementById('s1_kommunenavn');
  const municipality = muniInput?.value || formData['s1_kommunenavn'] || activeSchool?.kommune || 'Kommune';

  const userNameInput = document.getElementById('s18_navn') || document.getElementById('s18_a_navn');
  const userName = userNameInput?.value || formData['s18_navn'] || formData['s18_a_navn'] || 'Tor Pettersen Skarprud';

  const userRoleInput = document.getElementById('s18_rolle') || document.getElementById('s18_a_rolle');
  const userRole = userRoleInput?.value || formData['s18_rolle'] || formData['s18_a_rolle'] || 'Skoleleder';

  const elSchool = document.getElementById('topbar-school');
  const elMuni = document.getElementById('topbar-municipality');
  const elName = document.getElementById('topbar-user-name');
  const elRole = document.getElementById('topbar-user-role');

  if (elSchool) elSchool.textContent = schoolName;
  if (elMuni) elMuni.textContent = municipality;
  if (elName) elName.textContent = userName;
  if (elRole) elRole.textContent = userRole;
}

/* =========================================================
   SIDE 3 TIL 16 BEREGNINGSFUNKSJONER
   ========================================================= */

function calcSide3() {
  for (let t = 1; t <= 10; t++) setNumber(`s3_a_${t}_sum`, numberValue(`s3_a_${t}_gutter`) + numberValue(`s3_a_${t}_jenter`));
  ['gutter', 'jenter', 'sum'].forEach(sfx => {
    setNumber(`s3_a_sum17_${sfx}`, sumIds(rangeIds('s3_a_', 1, 7, `_${sfx}`)));
    setNumber(`s3_a_sum810_${sfx}`, sumIds(rangeIds('s3_a_', 8, 10, `_${sfx}`)));
    setNumber(`s3_a_total_${sfx === 'sum' ? '' : sfx}`.replace(/_$/, ''), numberValue(`s3_a_sum17_${sfx}`) + numberValue(`s3_a_sum810_${sfx}`));
  });
  setNumber('s3_b_sum17', sumIds(rangeIds('s3_b_', 1, 7)));
  setNumber('s3_b_sum810', sumIds(rangeIds('s3_b_', 8, 10)));
  setNumber('s3_b_total', numberValue('s3_b_sum17') + numberValue('s3_b_sum810'));
  setNumber('s3_c_sum', sumIds(rangeIds('s3_c_', 1, 10)));

  calcSide3E();
}

let side3ERowCount = 0;

function addSide3ERowWithId(rowId, kommuneVal = '', eleverVal = '') {
  const tbody = document.getElementById('s3-e-tbody') || document.getElementById('s3_e_tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.id = `s3-e-row-${rowId}`;

  tr.innerHTML = `
    <td style="text-align: center; background: #d8ebe2; border: 1px solid #526b8e; font-weight: bold; color: #0f172a;" class="s3-e-row-index"></td>
    <td style="padding: 2px 4px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="text" list="kommuner-list" id="s3_e_kommune_${rowId}" value="${kommuneVal}" style="width: 100%; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 2px; font-size: 0.88rem; text-align: left;" oninput="if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="padding: 2px 4px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="number" min="0" id="s3_e_elever_${rowId}" value="${eleverVal}" style="width: 100%; text-align: right; border: 1px solid #cbd5e1; padding: 4px 6px; border-radius: 2px; font-size: 0.88rem;" oninput="calcSide3E(); if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="text-align: center; vertical-align: middle; background: #ffffff; border: 1px solid #526b8e;">
      <button type="button" onclick="removeSide3ERow(${rowId})" style="background: none; border: none; color: #1e293b; font-size: 1.15rem; cursor: pointer; padding: 0; line-height: 1;" title="Slett rad">&#8855;</button>
    </td>
  `;

  tbody.appendChild(tr);

  if (typeof formData !== 'undefined') {
    formData[`s3_e_kommune_${rowId}`] = kommuneVal;
    formData[`s3_e_elever_${rowId}`] = eleverVal;
  }
}

function addSide3ERow(kommuneVal = '', eleverVal = '') {
  const safeKommune = (typeof kommuneVal === 'string') ? kommuneVal : '';
  const safeElever = (typeof eleverVal === 'number' || typeof eleverVal === 'string') && typeof eleverVal !== 'object' ? eleverVal : '';

  side3ERowCount++;
  addSide3ERowWithId(side3ERowCount, safeKommune, safeElever);
  updateSide3ERowNumbers();
  calcSide3E();
}

function removeSide3ERow(rowId) {
  const row = document.getElementById(`s3-e-row-${rowId}`);
  if (row) {
    if (typeof formData !== 'undefined') {
      delete formData[`s3_e_kommune_${rowId}`];
      delete formData[`s3_e_elever_${rowId}`];
    }
    row.remove();
    updateSide3ERowNumbers();
    calcSide3E();
    if (typeof saveData === 'function') saveData(true);
  }
}

function updateSide3ERowNumbers() {
  const tbody = document.getElementById('s3-e-tbody') || document.getElementById('s3_e_tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  rows.forEach((tr, index) => {
    const idxTd = tr.querySelector('.s3-e-row-index') || tr.querySelector('.row-no-cell');
    if (idxTd) idxTd.textContent = index + 1;
  });

  const sumNoTd = document.getElementById('s3-e-sum-no') || document.getElementById('s3_e_sum_row_no');
  if (sumNoTd) sumNoTd.textContent = rows.length + 1;
}

function calcSide3E() {
  const tbody = document.getElementById('s3-e-tbody') || document.getElementById('s3_e_tbody');
  if (!tbody) return;

  let totalElever = 0;
  let hasAnyInput = false;

  const eleverInputs = tbody.querySelectorAll('input[type="number"]');

  eleverInputs.forEach(input => {
    const val = typeof parseNum === 'function' ? parseNum(input.value) : (parseInt(input.value, 10) || 0);
    if (input.value !== '') hasAnyInput = true;
    totalElever += val;
  });

  const sumInput = document.getElementById('s3_e_total');
  if (sumInput) {
    sumInput.value = (totalElever > 0) ? totalElever : (hasAnyInput ? 0 : '');
  }
}

function restoreSide3ERows() {
  const tbody = document.getElementById('s3-e-tbody') || document.getElementById('s3_e_tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  side3ERowCount = 0;

  if (typeof formData === 'undefined') return;

  const existingIndices = new Set();
  Object.keys(formData).forEach(key => {
    if (key.startsWith('s3_e_kommune_') || key.startsWith('s3_e_elever_')) {
      const idx = parseInt(key.split('_').pop(), 10);
      if (!isNaN(idx)) existingIndices.add(idx);
    }
  });

  const sortedIndices = Array.from(existingIndices).sort((a, b) => a - b);

  sortedIndices.forEach(i => {
    const kVal = formData[`s3_e_kommune_${i}`] || '';
    const eVal = formData[`s3_e_elever_${i}`] || '';

    if (kVal !== '' || eVal !== '') {
      addSide3ERowWithId(i, kVal, eVal);
      if (i > side3ERowCount) side3ERowCount = i;
    }
  });

  updateSide3ERowNumbers();
  calcSide3E();
}

function calcSide4() {
  [1, 2].forEach(r => {
    const sum17 = numberValue(`s4_a${r}_1`) + numberValue(`s4_a${r}_2`);
    setNumber(`s4_a${r}_17`, sum17);

    const sumTotal = sum17 + numberValue(`s4_a${r}_3`);
    setNumber(`s4_a${r}_sum`, sumTotal);
  });

  const cols4A = ['1', '2', '17', '3', 'sum'];
  cols4A.forEach(col => {
    setNumber(`s4_a3_${col}`, numberValue(`s4_a1_${col}`) + numberValue(`s4_a2_${col}`));
  });

  for (let r = 1; r <= 12; r++) {
    setNumber(`s4_b${r}_17`, numberValue(`s4_b${r}_1`) + numberValue(`s4_b${r}_2`));
    setNumber(`s4_b${r}_sum`, numberValue(`s4_b${r}_17`) + numberValue(`s4_b${r}_3`));
  }

  [1, 2, 3].forEach(c => {
    setNumber(`s4_b13_${c}`, sumIds(rangeIds('s4_b', 1, 12, `_${c}`)));
  });
  setNumber('s4_b13_17', numberValue('s4_b13_1') + numberValue('s4_b13_2'));
  setNumber('s4_b13_sum', numberValue('s4_b13_17') + numberValue('s4_b13_3'));

  cols4A.forEach(col => {
    const a3Val = numberValue(`s4_a3_${col}`);
    const b13Val = numberValue(`s4_b13_${col}`);
    setNumber(`s4_c_${col}`, Math.max(0, a3Val - b13Val));
  });

  setNumber('s4_d_sum', numberValue('s4_d_17') + numberValue('s4_d_3'));
  ['e1', 'e2', 'e3', 'e4', 'e6'].forEach(row => setNumber(`s4_${row}_sum`, sumIds(rangeIds(`s4_${row}_`, 1, 3))));
  [1, 2, 3].forEach(col => setNumber(`s4_e5_${col}`, sumIds([1, 2, 3, 4].map(r => `s4_e${r}_${col}`))));
  setNumber('s4_e5_sum', sumIds(['s4_e5_1', 's4_e5_2', 's4_e5_3']));
}

function calcSide5() {
  ['a1', 'a2'].forEach(row => {
    const trinn = numberValue(`s5_${row}_14`) + numberValue(`s5_${row}_57`) + numberValue(`s5_${row}_810`);
    const kjonn = numberValue(`s5_${row}_m`) + numberValue(`s5_${row}_k`);
    setNumber(`s5_${row}_sum`, trinn > 0 ? trinn : kjonn);
  });
  ['b1', 'b2', 'b3', 'f'].forEach(r => setNumber(`s5_${r}_sum`, numberValue(`s5_${r}_m`) + numberValue(`s5_${r}_k`)));
  ['c1', 'c2'].forEach(r => setNumber(`s5_${r}_sum`, numberValue(`s5_${r}_17`) + numberValue(`s5_${r}_810`)));
  for (let r = 1; r <= 5; r++) {
    setNumber(`s5_d${r}_17sum`, numberValue(`s5_d${r}_1730`) + numberValue(`s5_d${r}_170`));
    setNumber(`s5_d${r}_810sum`, numberValue(`s5_d${r}_81060`) + numberValue(`s5_d${r}_8103059`) + numberValue(`s5_d${r}_810029`));
  }
  setNumber('s5_e_sum', numberValue('s5_e1') + numberValue('s5_e2') + numberValue('s5_e3'));
}

function calcSide6() {
  const calcYears = (timer, rammeKey) => numberValue(rammeKey) > 0 ? Math.round((timer / numberValue(rammeKey)) * 100) / 100 : 0;
  setNumber('s6_a_sum', numberValue('s6_a1') + numberValue('s6_a2'));
  const c14 = calcYears(numberValue('s4_c_1') + numberValue('s4_b13_1'), 's6_b_17');
  const c57 = calcYears(numberValue('s4_c_2') + numberValue('s4_b13_2'), 's6_b_17');
  const c810 = calcYears(numberValue('s4_c_3') + numberValue('s4_b13_3'), 's6_b_810');
  setNumber('s6_c_14', c14);
  setNumber('s6_c_57', c57);
  setNumber('s6_c_810', c810);
  setNumber('s6_c_sum', Math.round((c14 + c57 + c810) * 100) / 100);
}

/* =========================================================
   SIDE 7: BEREGNINGER OG EXCEL-IMPORT
   ========================================================= */

function calcSide7() {
  const sumGJ = prefix => setNumber(`${prefix}_sum`, numberValue(`${prefix}_g`) + numberValue(`${prefix}_j`));
  let [totG, totJ] = [0, 0];
  for (let t = 1; t <= 10; t++) {
    const [g, j] = [numberValue(`s7_a${t}_g`), numberValue(`s7_a${t}_j`)];
    setNumber(`s7_a${t}_sum`, g + j);
    totG += g; totJ += j;
  }
  setNumber('s7_a_gsum', totG);
  setNumber('s7_a_jsum', totJ);
  setNumber('s7_a_tot', totG + totJ);

  for (let r = 1; r <= 2; r++) {
    const medG = numberValue(`s7_b${r}_med_g`);
    const medJ = numberValue(`s7_b${r}_med_j`);
    const medSum = medG + medJ;
    setNumber(`s7_b${r}_med_sum`, medSum);

    const utenG = numberValue(`s7_b${r}_uten_g`);
    const utenJ = numberValue(`s7_b${r}_uten_j`);
    const utenSum = utenG + utenJ;
    setNumber(`s7_b${r}_uten_sum`, utenSum);

    setNumber(`s7_b${r}_total`, medSum + utenSum);
  }

  const sumC = numberValue('s7_c_17') + numberValue('s7_c_810') || (numberValue('s7_c_g') + numberValue('s7_c_j'));
  setNumber('s7_c_sum', sumC);

  const sumD = numberValue('s7_d_17') + numberValue('s7_d_810') || (numberValue('s7_d_g') + numberValue('s7_d_j'));
  setNumber('s7_d_sum', sumD);

  [1, 2, 3, 4].forEach(r => ['e', 'f', 'g'].forEach(sec => sumGJ(`s7_${sec}${r}`)));
  ['14', '57', '810', 'g', 'j'].forEach(sfx => setNumber(`s7_f5_${sfx}`, sumIds([1, 2, 3, 4].map(r => `s7_f${r}_${sfx}`))));
  sumGJ('s7_f5');
  setNumber('s7_g5_g', sumIds([1, 2, 3, 4].map(r => `s7_g${r}_g`)));
  setNumber('s7_g5_j', sumIds([1, 2, 3, 4].map(r => `s7_g${r}_j`)));
  sumGJ('s7_g5');
}

function openCalcSide7Modal() {
  const modal = document.getElementById('calc-s7-modal');
  if (!modal) return;
  
  const txtArea = document.getElementById('excel-paste-input');
  if (txtArea) txtArea.value = '';

  const summary = document.getElementById('excel-parse-summary');
  if (summary) summary.style.display = 'none';

  modal.style.display = 'flex';
}

function closeCalcSide7Modal() {
  const modal = document.getElementById('calc-s7-modal');
  if (modal) modal.style.display = 'none';
}

function getHourIntervalCategory(hours) {
  const h = parseNum(hours);
  if (h <= 0) return null;
  if (h >= 1 && h <= 75) return 1;
  if (h >= 76 && h <= 190) return 2;
  if (h >= 191 && h <= 270) return 3;
  if (h >= 271) return 4;
  return null;
}

function applyCalcSide7Data() {
  const rawText = document.getElementById('excel-paste-input')?.value?.trim();
  if (!rawText) {
    alert('Vennligst lim inn rader fra Excel først.');
    return;
  }

  let counts = {
    a: Array.from({ length: 11 }, () => ({ g: 0, j: 0 })),
    b1_med_g: 0, b1_med_j: 0,
    b1_uten_g: 0, b1_uten_j: 0,
    b2_med_g: 0, b2_med_j: 0,
    b2_uten_g: 0, b2_uten_j: 0,
    c: { t17: 0, t810: 0, g: 0, j: 0 },
    d: { t17: 0, t810: 0, g: 0, j: 0 },
    e1: { g: 0, j: 0 },
    e2: { g: 0, j: 0 },
    e3: { g: 0, j: 0 },
    e4: { g: 0, j: 0 },
    f: { 
      1: { t14: 0, t57: 0, t810: 0, g: 0, j: 0 }, 
      2: { t14: 0, t57: 0, t810: 0, g: 0, j: 0 }, 
      3: { t14: 0, t57: 0, t810: 0, g: 0, j: 0 }, 
      4: { t14: 0, t57: 0, t810: 0, g: 0, j: 0 } 
    },
    g_tab: { 1: { g: 0, j: 0 }, 2: { g: 0, j: 0 }, 3: { g: 0, j: 0 }, 4: { g: 0, j: 0 } }
  };

  const lines = rawText.split('\n');

  lines.forEach(line => {
    const cols = line.split('\t').map(c => c.trim().replace(',', '.'));
    if (cols.length < 2) return;

    const lineLower = line.toLowerCase();
    if (lineLower.includes('kjønn') || lineLower.includes('kjonn') || lineLower.includes('trinn')) return;

    const trinn = parseInt(cols[0], 10);
    const kjonnStr = cols[1]?.toLowerCase() || '';
    const kjonn = kjonnStr.startsWith('g') ? 'g' : (kjonnStr.startsWith('j') ? 'j' : null);
    
    if (!kjonn) return;

    const itoHours      = parseNum(cols[2]);
    const p11_4Hours    = parseNum(cols[3]);
    const p11_5Has      = cols[4] && ['ja', 'x', '1'].includes(cols[4].toLowerCase());
    const audiopedHours = parseNum(cols[5]);
    const logopedHours  = parseNum(cols[6]);

    const hasITO = itoHours > 0 || (cols[2] && ['ja', 'x', '1', 'iop'].includes(cols[2].toLowerCase()));
    const totalTeachingHours = itoHours + audiopedHours + logopedHours;

    const isOrdKlasse = cols[7]  && ['x', 'ja', '1'].includes(cols[7].toLowerCase());
    const isGrp6Plus  = cols[8]  && ['x', 'ja', '1'].includes(cols[8].toLowerCase());
    const isGrp2Til5  = cols[9]  && ['x', 'ja', '1'].includes(cols[9].toLowerCase());
    const isAlene     = cols[10] && ['x', 'ja', '1'].includes(cols[10].toLowerCase());

    const isFastAvd   = cols[11] && ['x', 'ja', '1'].includes(cols[11].toLowerCase());
    const isFastAlt   = cols[12] && ['x', 'ja', '1'].includes(cols[12].toLowerCase());

    if (totalTeachingHours > 0) {
      if (!isNaN(trinn) && trinn >= 1 && trinn <= 10) {
        counts.a[trinn][kjonn]++;
      }
      const cat = getHourIntervalCategory(totalTeachingHours);
      if (cat) {
        counts.f[cat][kjonn]++;
        if (!isNaN(trinn)) {
          if (trinn >= 1 && trinn <= 4) counts.f[cat].t14++;
          else if (trinn >= 5 && trinn <= 7) counts.f[cat].t57++;
          else if (trinn >= 8 && trinn <= 10) counts.f[cat].t810++;
        }
      }
    }

    if (p11_4Hours > 0 || (cols[3] && ['ja', 'x', '1'].includes(cols[3].toLowerCase()))) {
      if (hasITO) {
        counts[`b1_med_${kjonn}`]++;
      } else {
        counts[`b1_uten_${kjonn}`]++;
      }

      const cat = getHourIntervalCategory(p11_4Hours);
      if (cat) counts.g_tab[cat][kjonn]++;
    }

    if (p11_5Has) {
      if (hasITO) {
        counts[`b2_med_${kjonn}`]++;
      } else {
        counts[`b2_uten_${kjonn}`]++;
      }
    }

    if (isFastAvd) {
      counts.c[kjonn]++;
      if (!isNaN(trinn) && trinn >= 1 && trinn <= 7) counts.c.t17++;
      else if (!isNaN(trinn) && trinn >= 8 && trinn <= 10) counts.c.t810++;
    }

    if (isFastAlt) {
      counts.d[kjonn]++;
      if (!isNaN(trinn) && trinn >= 1 && trinn <= 7) counts.d.t17++;
      else if (!isNaN(trinn) && trinn >= 8 && trinn <= 10) counts.d.t810++;
    }

    if (isOrdKlasse) counts.e1[kjonn]++;
    if (isGrp6Plus)  counts.e2[kjonn]++;
    if (isGrp2Til5)  counts.e3[kjonn]++;
    if (isAlene)     counts.e4[kjonn]++;
  });

  for (let t = 1; t <= 10; t++) {
    setNumber(`s7_a${t}_g`, counts.a[t].g);
    setNumber(`s7_a${t}_j`, counts.a[t].j);
  }

  setNumber('s7_b1_med_g', counts.b1_med_g);
  setNumber('s7_b1_med_j', counts.b1_med_j);
  setNumber('s7_b1_uten_g', counts.b1_uten_g);
  setNumber('s7_b1_uten_j', counts.b1_uten_j);

  setNumber('s7_b2_med_g', counts.b2_med_g);
  setNumber('s7_b2_med_j', counts.b2_med_j);
  setNumber('s7_b2_uten_g', counts.b2_uten_g);
  setNumber('s7_b2_uten_j', counts.b2_uten_j);

  setNumber('s7_c_17', counts.c.t17);
  setNumber('s7_c_810', counts.c.t810);
  setNumber('s7_c_g', counts.c.g);
  setNumber('s7_c_j', counts.c.j);

  setNumber('s7_d_17', counts.d.t17);
  setNumber('s7_d_810', counts.d.t810);
  setNumber('s7_d_g', counts.d.g);
  setNumber('s7_d_j', counts.d.j);

  setNumber('s7_e1_g', counts.e1.g); setNumber('s7_e1_j', counts.e1.j);
  setNumber('s7_e2_g', counts.e2.g); setNumber('s7_e2_j', counts.e2.j);
  setNumber('s7_e3_g', counts.e3.g); setNumber('s7_e3_j', counts.e3.j);
  setNumber('s7_e4_g', counts.e4.g); setNumber('s7_e4_j', counts.e4.j);

  [1, 2, 3, 4].forEach(cat => {
    setNumber(`s7_f${cat}_14`, counts.f[cat].t14);
    setNumber(`s7_f${cat}_57`, counts.f[cat].t57);
    setNumber(`s7_f${cat}_810`, counts.f[cat].t810);
    setNumber(`s7_f${cat}_g`, counts.f[cat].g);
    setNumber(`s7_f${cat}_j`, counts.f[cat].j);
  });

  [1, 2, 3, 4].forEach(cat => {
    setNumber(`s7_g${cat}_g`, counts.g_tab[cat].g);
    setNumber(`s7_g${cat}_j`, counts.g_tab[cat].j);
  });

  calculateAll(false);
  if (typeof saveData === 'function') saveData(true);

  closeCalcSide7Modal();
  showSaveMessage('Excel-data overført til Side 7 (med oppdeling i Med/Uten ITO for 7B)!');
}

let side7HRowCount = 0;

function addSide7HRowWithId(rowId, kommuneVal = '', eleverVal = '') {
  const tbody = document.getElementById('s7-h-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.id = `s7-h-row-${rowId}`;

  tr.innerHTML = `
    <td style="text-align: center; background: #d8ebe2; border: 1px solid #526b8e; font-weight: bold; color: #0f172a;" class="s7-h-row-index"></td>
    <td style="padding: 2px 4px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="text" list="kommuner-list" id="s7_h_kommune_${rowId}" value="${kommuneVal}" style="width: 100%; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 2px; font-size: 0.88rem; text-align: left;" oninput="if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="padding: 2px 4px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="number" min="0" id="s7_h_elever_${rowId}" value="${eleverVal}" style="width: 100%; text-align: right; border: 1px solid #cbd5e1; padding: 4px 6px; border-radius: 2px; font-size: 0.88rem;" oninput="calcSide7H(); if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="text-align: center; vertical-align: middle; background: #ffffff; border: 1px solid #526b8e;">
      <button type="button" onclick="removeSide7HRow(${rowId})" style="background: none; border: none; color: #1e293b; font-size: 1.15rem; cursor: pointer; padding: 0; line-height: 1;" title="Slett rad">&#8855;</button>
    </td>
  `;

  tbody.appendChild(tr);

  if (typeof formData !== 'undefined') {
    formData[`s7_h_kommune_${rowId}`] = kommuneVal;
    formData[`s7_h_elever_${rowId}`] = eleverVal;
  }
}

function addSide7HRow(kommuneVal = '', eleverVal = '') {
  const safeKommune = (typeof kommuneVal === 'string') ? kommuneVal : '';
  const safeElever = (typeof eleverVal === 'number' || typeof eleverVal === 'string') && typeof eleverVal !== 'object' ? eleverVal : '';

  side7HRowCount++;
  addSide7HRowWithId(side7HRowCount, safeKommune, safeElever);
  updateSide7HRowNumbers();
  calcSide7H();
}

function removeSide7HRow(rowId) {
  const row = document.getElementById(`s7-h-row-${rowId}`);
  if (row) {
    if (typeof formData !== 'undefined') {
      delete formData[`s7_h_kommune_${rowId}`];
      delete formData[`s7_h_elever_${rowId}`];
    }
    row.remove();
    updateSide7HRowNumbers();
    calcSide7H();
    if (typeof saveData === 'function') saveData(true);
  }
}

function updateSide7HRowNumbers() {
  const tbody = document.getElementById('s7-h-tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  rows.forEach((tr, index) => {
    const idxTd = tr.querySelector('.s7-h-row-index');
    if (idxTd) idxTd.textContent = index + 1;
  });

  const sumNoTd = document.getElementById('s7-h-sum-no');
  if (sumNoTd) sumNoTd.textContent = rows.length + 1;
}

function calcSide7H() {
  const tbody = document.getElementById('s7-h-tbody');
  if (!tbody) return;

  let totalElever = 0;
  let hasAnyInput = false;

  const eleverInputs = tbody.querySelectorAll('input[type="number"]');

  eleverInputs.forEach(input => {
    const val = typeof parseNum === 'function' ? parseNum(input.value) : (parseInt(input.value, 10) || 0);
    if (input.value !== '') hasAnyInput = true;
    totalElever += val;
  });

  const sumInput = document.getElementById('s7_h_sum');
  if (sumInput) {
    sumInput.value = (totalElever > 0) ? totalElever : (hasAnyInput ? 0 : '');
  }
}

function restoreSide7HRows() {
  const tbody = document.getElementById('s7-h-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  side7HRowCount = 0;

  if (typeof formData === 'undefined') return;

  const existingIndices = new Set();
  Object.keys(formData).forEach(key => {
    if (key.startsWith('s7_h_kommune_') || key.startsWith('s7_h_elever_')) {
      const idx = parseInt(key.split('_').pop(), 10);
      if (!isNaN(idx)) existingIndices.add(idx);
    }
  });

  const sortedIndices = Array.from(existingIndices).sort((a, b) => a - b);

  sortedIndices.forEach(i => {
    const kVal = formData[`s7_h_kommune_${i}`] || '';
    const eVal = formData[`s7_h_elever_${i}`] || '';

    if (kVal !== '' || eVal !== '') {
      addSide7HRowWithId(i, kVal, eVal);
      if (i > side7HRowCount) side7HRowCount = i;
    }
  });

  updateSide7HRowNumbers();
  calcSide7H();
}

/* =========================================================
   SIDE 8: BEREGNINGER, MODAL OG EXCEL-IMPORT
   ========================================================= */

function calcSide8() {
  setNumber('s8_a_norsk_sum', sumIds(rangeIds('s8_a', 1, 10, '_norsk')));
  setNumber('s8_a_gno_sum', sumIds(rangeIds('s8_a', 1, 10, '_gno')));
  ['b1', 'b2'].forEach(row => setNumber(`s8_${row}_sum`, numberValue(`s8_${row}_g`) + numberValue(`s8_${row}_j`)));
  
  calcSide8C();
  calcSide8D();
}

function openCalcSide8Modal() {
  const modal = document.getElementById('calc-s8-modal');
  if (modal) modal.style.display = 'block';
}

function closeCalcSide8Modal() {
  const modal = document.getElementById('calc-s8-modal');
  if (modal) modal.style.display = 'none';
}

function applyCalcSide8Data() {
  const inputEl = document.getElementById('calc-s8-input');
  const rawText = inputEl?.value || '';
  if (!rawText.trim()) {
    closeCalcSide8Modal();
    return;
  }

  const lines = rawText.trim().split('\n');

  const s8aNorsk = Array(11).fill(0);
  const s8aGno = Array(11).fill(0);

  let b1G = 0, b1J = 0;
  let b2G = 0, b2J = 0;

  const sprakMap = {};

  lines.forEach(line => {
    const cols = line.split('\t').map(c => c.trim());
    if (cols.length < 2) return;

    const lineLower = line.toLowerCase();
    if (lineLower.includes('trinn') || lineLower.includes('tospråklig') || lineLower.includes('språk')) return;

    const trinnRaw = parseInt(cols[0].replace(/\D/g, ''), 10);
    if (isNaN(trinnRaw) || trinnRaw < 1 || trinnRaw > 10) return;

    const kjonn = cols[1]?.toLowerCase() || '';
    const plan = cols[2]?.toLowerCase() || '';
    const egenGruppe = cols[3]?.toLowerCase() || '';
    const asylsoker = cols[4]?.toLowerCase() || '';

    const tosprakOpplRaw = cols[5] || '';
    let sprakRaw = cols[6] || '';

    if (!sprakRaw || !isNaN(parseFloat(sprakRaw.replace(',', '.')))) {
      for (let i = cols.length - 1; i >= 5; i--) {
        if (cols[i] && isNaN(parseFloat(cols[i].replace(',', '.')))) {
          sprakRaw = cols[i];
          break;
        }
      }
    }

    s8aNorsk[trinnRaw]++;
    if (plan.includes('gno') || plan.includes('grunnleggende')) {
      s8aGno[trinnRaw]++;
    }

    const isGutt = kjonn.startsWith('g');
    const isJente = kjonn.startsWith('j');

    const isEgenGruppe = egenGruppe !== '' && egenGruppe !== 'nei' && egenGruppe !== '0';
    const isAsyl = asylsoker !== '' && asylsoker !== 'nei' && asylsoker !== '0';

    if (isEgenGruppe) {
      if (isGutt) b1G++;
      if (isJente) b1J++;
    }

    if (isAsyl) {
      if (isGutt) b2G++;
      if (isJente) b2J++;
    }

    const hasTosprakOppl = tosprakOpplRaw !== '' && 
                           tosprakOpplRaw !== '0' && 
                           tosprakOpplRaw.toLowerCase() !== 'nei';

    if (hasTosprakOppl && sprakRaw !== '' && !sprakRaw.toLowerCase().includes('norsk')) {
      let matchedSprak = sprakRaw;
      if (typeof GSI_SPRAK_LISTE !== 'undefined') {
        const found = GSI_SPRAK_LISTE.find(s => s.toLowerCase() === sprakRaw.toLowerCase());
        if (found) matchedSprak = found;
      }

      sprakMap[matchedSprak] = (sprakMap[matchedSprak] || 0) + 1;
    }
  });

  for (let i = 1; i <= 10; i++) {
    const nEl = document.getElementById(`s8_a${i}_norsk`);
    const gEl = document.getElementById(`s8_a${i}_gno`);
    if (nEl) nEl.value = s8aNorsk[i] || '';
    if (gEl) gEl.value = s8aGno[i] || '';
  }

  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setVal('s8_b1_g', b1G || '');
  setVal('s8_b1_j', b1J || '');
  setVal('s8_b2_g', b2G || '');
  setVal('s8_b2_j', b2J || '');

  const tbody8C = document.getElementById('s8-c-tbody');
  if (tbody8C) tbody8C.innerHTML = '';
  side8CRowCount = 0;

  Object.keys(sprakMap).forEach((sprakNavn, index) => {
    const antallElever = sprakMap[sprakNavn];
    addSide8CRow(sprakNavn, '', antallElever, '', '');

    const rowId = index + 1;
    formData[`s8_c_sprak_${rowId}`] = sprakNavn;
    formData[`s8_c_tosprak_${rowId}`] = antallElever;
  });

  calcSide8();
  if (typeof saveData === 'function') saveData(true);

  if (inputEl) inputEl.value = '';
  closeCalcSide8Modal();
}

let side8CRowCount = 0;

function addSide8CRowWithId(rowId, sprakVal = '', mVal = '', tVal = '', bVal = '', aVal = '') {
  const tbody = document.getElementById('s8-c-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.id = `s8-c-row-${rowId}`;

  tr.innerHTML = `
    <td style="text-align: center; background: #d8ebe2; border: 1px solid #526b8e; font-weight: bold; color: #0f172a;" class="s8-c-row-index"></td>
    <td style="padding: 2px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="text" list="sprak-list" id="s8_c_sprak_${rowId}" value="${sprakVal}" placeholder="Velg språk..." style="width: 100%; border: 1px solid #cbd5e1; padding: 3px 4px; border-radius: 2px; font-size: 0.85rem;" oninput="if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="padding: 2px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="number" min="0" id="s8_c_morsmal_${rowId}" value="${mVal}" style="width: 100%; text-align: right; border: 1px solid #cbd5e1; padding: 3px 4px; border-radius: 2px; font-size: 0.85rem;" oninput="calcSide8C(); if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="padding: 2px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="number" min="0" id="s8_c_tosprak_${rowId}" value="${tVal}" style="width: 100%; text-align: right; border: 1px solid #cbd5e1; padding: 3px 4px; border-radius: 2px; font-size: 0.85rem;" oninput="calcSide8C(); if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="padding: 2px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="number" min="0" id="s8_c_begge_${rowId}" value="${bVal}" style="width: 100%; text-align: right; border: 1px solid #cbd5e1; padding: 3px 4px; border-radius: 2px; font-size: 0.85rem;" oninput="calcSide8C(); if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="padding: 2px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="number" min="0" id="s8_c_annen_${rowId}" value="${aVal}" style="width: 100%; text-align: right; border: 1px solid #cbd5e1; padding: 3px 4px; border-radius: 2px; font-size: 0.85rem;" oninput="calcSide8C(); if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="padding: 2px; border: 1px solid #526b8e; background: #c2cad2;">
      <input type="text" id="s8_c_sum_${rowId}" readonly style="width: 100%; text-align: right; font-weight: bold; border: none; background: transparent; padding: 3px 2px; font-size: 0.85rem;">
    </td>
    <td style="text-align: center; vertical-align: middle; background: #ffffff; border: 1px solid #526b8e;">
      <button type="button" onclick="removeSide8CRow(${rowId})" style="background: none; border: none; color: #1e293b; font-size: 1.1rem; cursor: pointer; padding: 0; line-height: 1;" title="Slett rad">&#8855;</button>
    </td>
  `;

  tbody.appendChild(tr);

  if (typeof formData !== 'undefined') {
    formData[`s8_c_sprak_${rowId}`] = sprakVal;
    formData[`s8_c_morsmal_${rowId}`] = mVal;
    formData[`s8_c_tosprak_${rowId}`] = tVal;
    formData[`s8_c_begge_${rowId}`] = bVal;
    formData[`s8_c_annen_${rowId}`] = aVal;
  }
}

function addSide8CRow(sprakVal = '', mVal = '', tVal = '', bVal = '', aVal = '') {
  side8CRowCount++;
  addSide8CRowWithId(side8CRowCount, sprakVal, mVal, tVal, bVal, aVal);
  updateSide8CRowNumbers();
  calcSide8C();
}

function removeSide8CRow(rowId) {
  const row = document.getElementById(`s8-c-row-${rowId}`);
  if (row) {
    if (typeof formData !== 'undefined') {
      delete formData[`s8_c_sprak_${rowId}`];
      delete formData[`s8_c_morsmal_${rowId}`];
      delete formData[`s8_c_tosprak_${rowId}`];
      delete formData[`s8_c_begge_${rowId}`];
      delete formData[`s8_c_annen_${rowId}`];
    }
    row.remove();
    updateSide8CRowNumbers();
    calcSide8C();
    if (typeof saveData === 'function') saveData(true);
  }
}

function updateSide8CRowNumbers() {
  const tbody = document.getElementById('s8-c-tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  rows.forEach((tr, index) => {
    const idxTd = tr.querySelector('.s8-c-row-index');
    if (idxTd) idxTd.textContent = index + 1;
  });

  const sumNoTd = document.getElementById('s8-c-sum-no');
  if (sumNoTd) sumNoTd.textContent = rows.length + 1;
}

function calcSide8C() {
  const tbody = document.getElementById('s8-c-tbody');
  if (!tbody) return;

  let sumM = 0, sumT = 0, sumB = 0, sumA = 0, total = 0;

  const rows = tbody.querySelectorAll('tr');
  rows.forEach(tr => {
    const rowId = tr.id.replace('s8-c-row-', '');
    const parse = val => (typeof parseNum === 'function' ? parseNum(val) : (parseInt(val, 10) || 0));

    const m = parse(document.getElementById(`s8_c_morsmal_${rowId}`)?.value);
    const t = parse(document.getElementById(`s8_c_tosprak_${rowId}`)?.value);
    const b = parse(document.getElementById(`s8_c_begge_${rowId}`)?.value);
    const a = parse(document.getElementById(`s8_c_annen_${rowId}`)?.value);

    const rowSum = m + t + b + a;
    const rowSumEl = document.getElementById(`s8_c_sum_${rowId}`);
    if (rowSumEl) rowSumEl.value = rowSum > 0 ? rowSum : '';

    sumM += m; sumT += t; sumB += b; sumA += a; total += rowSum;
  });

  const setSum = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val > 0 ? val : '';
  };

  setSum('s8_c_morsmal_sum', sumM);
  setSum('s8_c_tosprak_sum', sumT);
  setSum('s8_c_begge_sum', sumB);
  setSum('s8_c_annen_sum', sumA);
  setSum('s8_c_total_sum', total);
}

function restoreSide8CRows() {
  const tbody = document.getElementById('s8-c-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  side8CRowCount = 0;

  if (typeof formData === 'undefined') return;

  const existingIndices = new Set();
  Object.keys(formData).forEach(key => {
    if (key.startsWith('s8_c_sprak_')) {
      const idx = parseInt(key.split('_').pop(), 10);
      if (!isNaN(idx)) existingIndices.add(idx);
    }
  });

  const sortedIndices = Array.from(existingIndices).sort((a, b) => a - b);

  sortedIndices.forEach(i => {
    const sVal = formData[`s8_c_sprak_${i}`] || '';
    const mVal = formData[`s8_c_morsmal_${i}`] || '';
    const tVal = formData[`s8_c_tosprak_${i}`] || '';
    const bVal = formData[`s8_c_begge_${i}`] || '';
    const aVal = formData[`s8_c_annen_${i}`] || '';

    if (sVal !== '' || mVal !== '' || tVal !== '' || bVal !== '' || aVal !== '') {
      addSide8CRowWithId(i, sVal, mVal, tVal, bVal, aVal);
      if (i > side8CRowCount) side8CRowCount = i;
    }
  });

  updateSide8CRowNumbers();
  calcSide8C();
}

let side8DRowCount = 0;

function addSide8DRowWithId(rowId, kommuneVal = '', eleverVal = '') {
  const tbody = document.getElementById('s8-d-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.id = `s8-d-row-${rowId}`;

  tr.innerHTML = `
    <td style="text-align: center; background: #d8ebe2; border: 1px solid #526b8e; font-weight: bold; color: #0f172a;" class="s8-d-row-index"></td>
    <td style="padding: 2px 4px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="text" list="kommuner-list" id="s8_d_kommune_${rowId}" value="${kommuneVal}" style="width: 100%; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 2px; font-size: 0.88rem; text-align: left;" oninput="if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="padding: 2px 4px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="number" min="0" id="s8_d_elever_${rowId}" value="${eleverVal}" style="width: 100%; text-align: right; border: 1px solid #cbd5e1; padding: 4px 6px; border-radius: 2px; font-size: 0.88rem;" oninput="calcSide8D(); if(typeof saveData === 'function') saveData(false);">
    </td>
    <td style="text-align: center; vertical-align: middle; background: #ffffff; border: 1px solid #526b8e;">
      <button type="button" onclick="removeSide8DRow(${rowId})" style="background: none; border: none; color: #1e293b; font-size: 1.15rem; cursor: pointer; padding: 0; line-height: 1;" title="Slett rad">&#8855;</button>
    </td>
  `;

  tbody.appendChild(tr);
}

function addSide8DRow(kommuneVal = '', eleverVal = '') {
  const safeKommune = (typeof kommuneVal === 'string') ? kommuneVal : '';
  const safeElever = (typeof eleverVal === 'number' || typeof eleverVal === 'string') && typeof eleverVal !== 'object' ? eleverVal : '';

  side8DRowCount++;
  addSide8DRowWithId(side8DRowCount, safeKommune, safeElever);
  updateSide8DRowNumbers();
  calcSide8D();
}

function removeSide8DRow(rowId) {
  const row = document.getElementById(`s8-d-row-${rowId}`);
  if (row) {
    if (typeof formData !== 'undefined') {
      delete formData[`s8_d_kommune_${rowId}`];
      delete formData[`s8_d_elever_${rowId}`];
    }
    row.remove();
    updateSide8DRowNumbers();
    calcSide8D();
    if (typeof saveData === 'function') saveData(false);
  }
}

function updateSide8DRowNumbers() {
  const tbody = document.getElementById('s8-d-tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  rows.forEach((tr, index) => {
    const idxTd = tr.querySelector('.s8-d-row-index');
    if (idxTd) idxTd.textContent = index + 1;
  });

  const sumNoTd = document.getElementById('s8-d-sum-no');
  if (sumNoTd) sumNoTd.textContent = rows.length + 1;
}

function calcSide8D() {
  const tbody = document.getElementById('s8-d-tbody');
  if (!tbody) return;

  let totalElever = 0;
  let hasAnyInput = false;

  const eleverInputs = tbody.querySelectorAll('input[type="number"]');

  eleverInputs.forEach(input => {
    const val = typeof parseNum === 'function' ? parseNum(input.value) : (parseInt(input.value, 10) || 0);
    if (input.value !== '') hasAnyInput = true;
    totalElever += val;
  });

  const sumInput = document.getElementById('s8_d_sum');
  if (sumInput) {
    sumInput.value = (totalElever > 0) ? totalElever : (hasAnyInput ? 0 : '');
  }
}

function restoreSide8DRows() {
  const tbody = document.getElementById('s8-d-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  side8DRowCount = 0;

  if (typeof formData === 'undefined') return;

  const existingIndices = new Set();
  Object.keys(formData).forEach(key => {
    if (key.startsWith('s8_d_kommune_') || key.startsWith('s8_d_elever_')) {
      const idx = parseInt(key.split('_').pop(), 10);
      if (!isNaN(idx)) existingIndices.add(idx);
    }
  });

  const sortedIndices = Array.from(existingIndices).sort((a, b) => a - b);

  sortedIndices.forEach(i => {
    const kVal = formData[`s8_d_kommune_${i}`] || '';
    const eVal = formData[`s8_d_elever_${i}`] || '';

    if (kVal !== '' || eVal !== '') {
      addSide8DRowWithId(i, kVal, eVal);
      if (i > side8DRowCount) side8DRowCount = i;
    }
  });

  updateSide8DRowNumbers();
  calcSide8D();
}

/* =========================================================
   SIDE 9 OG YTTERLIGERE SIDER
   ========================================================= */

function calcSide9() {
  for (let t = 1; t <= 10; t++) {
    setNumber(`s9_a${t}_sum`, sumIds(['bokmal', 'nynorsk', 'samisk', 'andre'].map(s => `s9_a${t}_${s}`)));
    setNumber(`s9_a${t}_elevtall`, numberValue(`s3_a_${t}_sum`));
  }
  ['bokmal', 'nynorsk', 'samisk', 'andre', 'sum'].forEach(sfx => setNumber(`s9_a_sum_${sfx}`, sumIds(rangeIds('s9_a', 1, 10, `_${sfx}`))));
  setNumber('s9_a_elevtall_sum', numberValue('s3_a_total'));
  calcSide9C();
  [1, 2, 3].forEach(r => setNumber(`s9_d${r}_sum`, sumIds(['14', '57', '810'].map(col => `s9_d${r}_${col}`))));
  ['14', '57', '810', 'sum'].forEach(col => setNumber(`s9_d3_${col}`, numberValue(`s9_d1_${col}`) + numberValue(`s9_d2_${col}`)));
}

let side9CRowCount = 0;

function addSide9CRowWithId(rowId, sprakVal = '', trinnValues = []) {
  const tbody = document.getElementById('s9-c-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.id = `s9-c-row-${rowId}`;

  let trinnInputsHtml = '';
  for (let t = 1; t <= 10; t++) {
    const val = trinnValues[t - 1] !== undefined ? trinnValues[t - 1] : '';
    trinnInputsHtml += `
      <td style="padding: 2px; border: 1px solid #526b8e; background: #ffffff;">
        <input type="number" min="0" id="s9_c_t${t}_${rowId}" value="${val}" style="width: 100%; text-align: right; border: 1px solid #cbd5e1; padding: 3px 2px; border-radius: 2px; font-size: 0.85rem;" oninput="calcSide9C(); if(typeof saveData === 'function') saveData(false);">
      </td>
    `;
  }

  tr.innerHTML = `
    <td style="text-align: center; background: #d8ebe2; border: 1px solid #526b8e; font-weight: bold; color: #0f172a;" class="s9-c-row-index"></td>
    <td style="padding: 2px; border: 1px solid #526b8e; background: #ffffff;">
      <input type="text" list="samisk-sprak-list" id="s9_c_sprak_${rowId}" value="${sprakVal}" placeholder="Velg språk..." style="width: 100%; border: 1px solid #cbd5e1; padding: 3px 4px; border-radius: 2px; font-size: 0.85rem;" oninput="if(typeof saveData === 'function') saveData(false);">
    </td>
    ${trinnInputsHtml}
    <td style="padding: 2px; border: 1px solid #526b8e; background: #c2cad2;">
      <input type="text" id="s9_c_sum_${rowId}" readonly style="width: 100%; text-align: right; font-weight: bold; border: none; background: transparent; padding: 3px 2px; font-size: 0.85rem;">
    </td>
    <td style="text-align: center; vertical-align: middle; background: #ffffff; border: 1px solid #526b8e;">
      <button type="button" onclick="removeSide9CRow(${rowId})" style="background: none; border: none; color: #1e293b; font-size: 1.1rem; cursor: pointer; padding: 0; line-height: 1;" title="Slett rad">&#8855;</button>
    </td>
  `;

  tbody.appendChild(tr);
}

function addSide9CRow(sprakVal = '', trinnValues = []) {
  side9CRowCount++;
  addSide9CRowWithId(side9CRowCount, sprakVal, trinnValues);
  updateSide9CRowNumbers();
  calcSide9C();
}

function removeSide9CRow(rowId) {
  const row = document.getElementById(`s9-c-row-${rowId}`);
  if (row) {
    if (typeof formData !== 'undefined') {
      delete formData[`s9_c_sprak_${rowId}`];
      for (let t = 1; t <= 10; t++) {
        delete formData[`s9_c_t${t}_${rowId}`];
      }
    }
    row.remove();
    updateSide9CRowNumbers();
    calcSide9C();
    if (typeof saveData === 'function') saveData(false);
  }
}

function updateSide9CRowNumbers() {
  const tbody = document.getElementById('s9-c-tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  rows.forEach((tr, index) => {
    const idxTd = tr.querySelector('.s9-c-row-index');
    if (idxTd) idxTd.textContent = index + 1;
  });

  const sumNoTd = document.getElementById('s9-c-sum-no');
  if (sumNoTd) sumNoTd.textContent = rows.length + 1;
}

function calcSide9C() {
  const tbody = document.getElementById('s9-c-tbody');
  if (!tbody) return;

  const trinnTotals = Array(11).fill(0);
  let totalAllRows = 0;

  const rows = tbody.querySelectorAll('tr');
  rows.forEach(tr => {
    const rowId = tr.id.replace('s9-c-row-', '');
    let rowSum = 0;

    for (let t = 1; t <= 10; t++) {
      const el = document.getElementById(`s9_c_t${t}_${rowId}`);
      const val = typeof parseNum === 'function' ? parseNum(el?.value) : (parseInt(el?.value, 10) || 0);
      rowSum += val;
      trinnTotals[t] += val;
    }

    const rowSumEl = document.getElementById(`s9_c_sum_${rowId}`);
    if (rowSumEl) rowSumEl.value = rowSum > 0 ? rowSum : '';
    totalAllRows += rowSum;
  });

  for (let t = 1; t <= 10; t++) {
    const sumEl = document.getElementById(`s9_c_sum_t${t}`);
    if (sumEl) sumEl.value = trinnTotals[t] > 0 ? trinnTotals[t] : '';
  }

  const totalEl = document.getElementById('s9_c_sum_total');
  if (totalEl) totalEl.value = totalAllRows > 0 ? totalAllRows : '';
}

function restoreSide9CRows() {
  const tbody = document.getElementById('s9-c-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  side9CRowCount = 0;

  if (typeof formData === 'undefined') return;

  const existingIndices = new Set();
  Object.keys(formData).forEach(key => {
    if (key.startsWith('s9_c_sprak_')) {
      const idx = parseInt(key.split('_').pop(), 10);
      if (!isNaN(idx)) existingIndices.add(idx);
    }
  });

  const sortedIndices = Array.from(existingIndices).sort((a, b) => a - b);

  sortedIndices.forEach(i => {
    const sVal = formData[`s9_c_sprak_${i}`] || '';
    const tVals = [];
    for (let t = 1; t <= 10; t++) {
      tVals.push(formData[`s9_c_t${t}_${i}`] || '');
    }

    if (sVal !== '' || tVals.some(v => v !== '')) {
      addSide9CRowWithId(i, sVal, tVals);
      if (i > side9CRowCount) side9CRowCount = i;
    }
  });

  updateSide9CRowNumbers();
  calcSide9C();
}

function calcSide12() {
  ['students', 'hours'].forEach(type => setNumber(`s12_c_${type}_sum`, sumIds(rangeIds('s12_c_', 1, 10, `_${type}`))));
}

function toggleLibraryHours() {
  const jaChecked = document.getElementById('s13_d_1_ja')?.checked;
  const hoursBox = document.getElementById('s13-d-library-hours');
  const hoursInput = document.getElementById('s13_d_library_hours');

  if (hoursBox) {
    if (jaChecked) {
      hoursBox.style.display = 'flex';
    } else {
      hoursBox.style.display = 'none';
      if (hoursInput) hoursInput.value = '';
    }
  }
}

function calcSide13() {
  setNumber('s13_a_sum', numberValue('s13_a_1') + numberValue('s13_a_2'));
  [1, 2, 3, 4].forEach(col => setNumber(`s13_c_sum_${col}`, sumIds(rangeIds('s13_c_', 1, 10, `_${col}`))));
  [1, 2, 3, 4, 5].forEach(r => setNumber(`s13_e_${r}_sum`, sumIds(rangeIds(`s13_e_${r}_`, 1, 10))));
  for (let t = 1; t <= 10; t++) {
    setNumber(`s13_e_total_${t}`, sumIds([1, 2, 3, 4, 5].map(r => `s13_e_${r}_${t}`)));
    setNumber(`s13_e_students_${t}`, numberValue(`s3_a_${t}_sum`));
  }
  setNumber('s13_e_total_sum', sumIds(rangeIds('s13_e_total_', 1, 10)));
  setNumber('s13_e_students_sum', numberValue('s3_a_total'));
  [1, 2].forEach(r => setNumber(`s13_g_${r}_sum`, sumIds([8, 9, 10].map(t => `s13_g_${r}_${t}`))));
  [8, 9, 10].forEach(t => setNumber(`s13_g_sum_${t}`, numberValue(`s13_g_1_${t}`) + numberValue(`s13_g_2_${t}`)));
  setNumber('s13_g_total', numberValue('s13_g_sum_8') + numberValue('s13_g_sum_9') + numberValue('s13_g_sum_10'));

  toggleLibraryHours();
}

function calcSide14() {
  [1, 2].forEach(c => {
    setNumber(`s14_a_sum_${c}`, sumIds(rangeIds('s14_a_', 1, 5, `_${c}`)));
    setNumber(`s14_e_sum_${c}`, sumIds(rangeIds('s14_e_', 1, 4, `_${c}`)));
  });

  [1, 2, 3].forEach(r => {
    const m = numberValue(`s14_b${r}_m`);
    const k = numberValue(`s14_b${r}_k`);
    setNumber(`s14_b${r}_sum`, m + k);
  });

  setNumber('s14_b4_m', sumIds([1, 2, 3].map(r => `s14_b${r}_m`)));
  setNumber('s14_b4_k', sumIds([1, 2, 3].map(r => `s14_b${r}_k`)));
  setNumber('s14_b4_sum', sumIds([1, 2, 3].map(r => `s14_b${r}_sum`)));

  let totalArsverk = 0;
  [1, 2, 3].forEach(r => {
    const el = document.getElementById(`s14_b${r}_arsverk`);
    if (el && el.value !== '') {
      const val = parseFloat(String(el.value).replace(',', '.')) || 0;
      totalArsverk += val;
    }
  });

  const totalArsverkEl = document.getElementById('s14_b4_arsverk');
  if (totalArsverkEl) {
    totalArsverkEl.value = totalArsverk > 0 ? totalArsverk.toFixed(2).replace('.', ',') : '';
  }
}

function calcSide16() {
  for (let t = 1; t <= 10; t++) setNumber(`s16_a_${t}_sum`, numberValue(`s16_a_${t}_1`) + numberValue(`s16_a_${t}_2`));
  ['1', '2', 'sum'].forEach(sfx => setNumber(`s16_a_total_${sfx}`, sumIds(rangeIds('s16_a_', 1, 10, `_${sfx}`))));
  setNumber('s16_d_sum', sumIds([1, 2, 3, 4].map(r => `s16_d_${r}`)));
}

/* =========================================================
   NULLSTILLING, EKSPORT, IMPORT OG UTSKRIFT
   ========================================================= */

function clearDynamicRows3E() {
  try {
    const tbody = document.getElementById('s3-e-tbody') || document.getElementById('s3_e_tbody');
    if (tbody) tbody.innerHTML = '';
    if (typeof side3ERowCount !== 'undefined') side3ERowCount = 0;
    
    const sumNo = document.getElementById('s3-e-sum-no') || document.getElementById('s3_e_sum_row_no');
    if (sumNo) sumNo.textContent = '1';

    if (typeof formData !== 'undefined') {
      Object.keys(formData).forEach(key => {
        if (key.startsWith('s3_e_')) delete formData[key];
      });
    }
    if (typeof calcSide3E === 'function') calcSide3E();
  } catch (err) {
    console.warn("Feil ved tømming av Side 3E:", err);
  }
}

function clearDynamicRows7H() {
  try {
    const tbody = document.getElementById('s7-h-tbody');
    if (tbody) tbody.innerHTML = '';
    if (typeof side7HRowCount !== 'undefined') side7HRowCount = 0;

    const sumNo = document.getElementById('s7-h-sum-no');
    if (sumNo) sumNo.textContent = '1';

    if (typeof formData !== 'undefined') {
      Object.keys(formData).forEach(key => {
        if (key.startsWith('s7_h_')) delete formData[key];
      });
    }
    if (typeof calcSide7H === 'function') calcSide7H();
  } catch (err) {
    console.warn("Feil ved tømming av Side 7H:", err);
  }
}

function clearDynamicRows8C() {
  try {
    const tbody = document.getElementById('s8-c-tbody');
    if (tbody) tbody.innerHTML = '';
    if (typeof side8CRowCount !== 'undefined') side8CRowCount = 0;

    const sumNo = document.getElementById('s8-c-sum-no');
    if (sumNo) sumNo.textContent = '1';

    if (typeof formData !== 'undefined') {
      Object.keys(formData).forEach(key => {
        if (key.startsWith('s8_c_')) delete formData[key];
      });
    }
    if (typeof calcSide8C === 'function') calcSide8C();
  } catch (err) {
    console.warn("Feil ved tømming av Side 8C:", err);
  }
}

function resetCurrentPageData() {
  const pageObj = (typeof pages !== 'undefined') ? pages.find(p => p.id === currentPage) : null;
  const pageName = pageObj ? `${pageObj.id}. ${pageObj.name}` : `Side ${currentPage}`;

  if (!window.confirm(`Er du sikker på at du vil slette alle inndata på "${pageName}"?`)) return;

  const pageEl = document.querySelector(`.page[data-page="${currentPage}"]`);
  if (pageEl) {
    const pageInputs = pageEl.querySelectorAll('input[id], select[id], textarea[id], input[name]');

    pageInputs.forEach(el => {
      if (['radio', 'checkbox'].includes(el.type)) {
        const key = el.id ? `${el.id}__checked` : `${el.name}_${el.value}__checked`;
        delete formData[key];
        el.checked = false;
      } else if (el.id) {
        delete formData[el.id];
        el.value = '';
      }
    });
  }

  if (currentPage === 3) clearDynamicRows3E();
  if (currentPage === 7) clearDynamicRows7H();
  if (currentPage === 8) clearDynamicRows8C();

  if (typeof calculateAll === 'function') calculateAll(false);
  if (typeof saveData === 'function') saveData(false);
  if (typeof syncDataToInputs === 'function') syncDataToInputs();
  if (typeof showSaveMessage === 'function') showSaveMessage(`Innholdet på ${pageName} ble slettet.`);
}

function resetSchoolYearData(keepPage1And2 = true) {
  const currentYearText = document.getElementById('year-select')?.selectedOptions[0]?.text || activeSchoolYear;
  
  const msg = keepPage1And2
    ? `Er du sikker på at du vil slette registreringene for ${currentYearText}?\n\nSide 1 og 2 (Enhetsopplysninger og Om skolen) vil BLI BEVART.`
    : `Er du sikker på at du vil slette ABSOLUTT ALT for skoleåret ${currentYearText} (inkludert side 1 og 2)?`;

  if (!window.confirm(msg)) return;

  if (keepPage1And2) {
    const preservedData = {};
    const page1and2Elements = document.querySelectorAll('.page[data-page="1"] [id], .page[data-page="2"] [id]');
    const preservedKeys = new Set();
    
    page1and2Elements.forEach(el => {
      if (['radio', 'checkbox'].includes(el.type)) {
        preservedKeys.add(el.id ? `${el.id}__checked` : `${el.name}_${el.value}__checked`);
      } else if (el.id) {
        preservedKeys.add(el.id);
      }
    });

    preservedKeys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        preservedData[key] = formData[key];
      }
    });

    formData = preservedData;
  } else {
    formData = {};
  }

  clearDynamicRows3E();
  clearDynamicRows7H();
  clearDynamicRows8C();

  try {
    document.querySelectorAll('#page-9 .table-s9-c tbody tr:not(.total-row)').forEach(row => row.remove());
  } catch (e) {
    // Svelg feil dersom tabellen på side 9 ikke finnes
  }

  if (typeof syncDataToInputs === 'function') syncDataToInputs();
  if (typeof calculateAll === 'function') calculateAll(false);
  if (typeof saveData === 'function') saveData(false);

  if (typeof showSaveMessage === 'function') {
    showSaveMessage(keepPage1And2 ? `Skoleåret ${currentYearText} ble nullstilt (beholdt side 1 & 2).` : `Alt for ${currentYearText} ble slettet.`);
  }
}

function handleResetSelect(event) {
  const action = event.target.value;
  if (!action) return;

  if (action === 'page') {
    resetCurrentPageData();
  } else if (action === 'year_keep_1_2') {
    resetSchoolYearData(true);
  } else if (action === 'year_all') {
    resetSchoolYearData(false);
  }

  event.target.value = '';
}


function exportJSON() {
  syncInputsToData();
  saveData(false); // Sørg for at alt for aktiv skole er lagret i localStorage først

  // 1. Hent alle aktive og slettede skoler
  const schools = getSchools();
  const deletedSchools = getDeletedSchools();

  // 2. Samle opp alle skjemadata (alle nøkler i localStorage som starter på gsi_data_)
  const allFormData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('gsi_data_')) {
      try {
        allFormData[key] = JSON.parse(localStorage.getItem(key)) || {};
      } catch (e) {
        console.warn('Kunne ikke lese nøkkel ved eksport:', key);
      }
    }
  }

  // 3. Bygg en komplett system-pakke
  const exportPayload = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    schools: schools,
    deletedSchools: deletedSchools,
    allFormData: allFormData
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  const fileName = `GSI_Komplett_Sikkerhetskopi_${new Date().toISOString().slice(0, 10)}.json`;

  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  if (typeof showSaveMessage === 'function') {
    showSaveMessage('Komplett sikkerhetskopi ble eksportert!');
  } else {
    alert('Komplett sikkerhetskopi ble eksportert!');
  }
}


function importJSON(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);

      // Sjekk om det er en ny komplett backup (v2) eller gammel enkelt-eksport
      const isFullBackup = Boolean(imported.allFormData && imported.schools);

      let confirmMsg = `Vil du importere data fra filen "${file.name}"?\n\nDette vil oppdatere dine skoler og skjemaer med innholdet i filen.`;
      if (!window.confirm(confirmMsg)) return;

      if (isFullBackup) {
        // --- 1. HÅNDTER KOMPLETT BACKUP (ALLE SKOLER OG ÅR) ---
        if (Array.isArray(imported.schools)) {
          localStorage.setItem('gsi_schools', JSON.stringify(imported.schools));
        }
        if (Array.isArray(imported.deletedSchools)) {
          localStorage.setItem('gsi_schools_deleted', JSON.stringify(imported.deletedSchools));
        }

        // Skriv inn alle lagrede skjemanøkler til localStorage
        if (imported.allFormData && typeof imported.allFormData === 'object') {
          Object.keys(imported.allFormData).forEach(key => {
            localStorage.setItem(key, JSON.stringify(imported.allFormData[key]));
          });
        }
      } else {
        // --- 2. BAKOVERKOMPATIBELT: HÅNDTER GAMMEL / ENKELTFILEKSPORT ---
        const newFormData = imported.formData || imported;
        if (typeof newFormData === 'object' && newFormData !== null) {
          formData = newFormData;
          saveDataForYear(activeSchoolYear);
        }
      }

      // Oppdater visningen
      if (!activeSchoolId) {
        renderStartside();
      } else {
        loadDataForYear();
        syncActiveSchoolStamdata(); // Sikrer at importerte skoledata umiddelbart vises i feltene
        if (typeof saveData === 'function') saveData(false);
      }

      alert(`Suksess! Data ble importert fra ${file.name}.`);
    } catch (err) {
      console.error('Feil ved import:', err);
      alert('Kunne ikke importere filen. Sjekk at det er en gyldig GSI JSON-fil.');
    } finally {
      event.target.value = '';
    }
  };

  reader.readAsText(file);
}


function copyPreviousYearPageData() {
  const [startY, endY] = activeSchoolYear.split('-').map(Number);
  if (!startY) {
    alert('Ugyldig skoleår valgt.');
    return;
  }
  
  const prevSchoolYear = `${startY - 1}-${endY - 1}`;
  const prevYearDisplay = `${startY - 1}/${endY - 1}`;
  const prevKey = storageKeyFor(prevSchoolYear);

  const prevDataRaw = localStorage.getItem(prevKey);
  if (!prevDataRaw) {
    alert(`Fant ingen lagrede data for forrige skoleår (${prevYearDisplay}).`);
    return;
  }

  let prevData = {};
  try {
    prevData = JSON.parse(prevDataRaw) || {};
  } catch (err) {
    alert(`Kunne ikke lese data for skoleåret ${prevYearDisplay}.`);
    return;
  }

  const pageObj = pages.find(p => p.id === currentPage);
  const pageName = pageObj ? `${pageObj.id}. ${pageObj.name}` : `Side ${currentPage}`;

  const confirmCopy = window.confirm(
    `Vil du hente registreringene fra skoleåret ${prevYearDisplay} for "${pageName}"?\n\nNåværende tall/tekst på denne siden vil bli overskrevet.`
  );

  if (!confirmCopy) return;

  const pageEl = document.querySelector(`.page[data-page="${currentPage}"]`);
  if (!pageEl) return;

  const pageInputs = pageEl.querySelectorAll('input[id], select[id], textarea[id], input[name]');
  let copiedCount = 0;

  pageInputs.forEach(el => {
    if (el.type === 'file') return;

    const isCheck = ['radio', 'checkbox'].includes(el.type);
    const key = isCheck ? (el.id ? `${el.id}__checked` : `${el.name}_${el.value}__checked`) : el.id;

    if (key && Object.prototype.hasOwnProperty.call(prevData, key)) {
      formData[key] = prevData[key];
      copiedCount++;
    }
  });

  if (copiedCount === 0) {
    alert(`Det ble ikke funnet noen lagrede data på ${pageName} for ${prevYearDisplay}.`);
    return;
  }

  syncDataToInputs();
  calculateAll(false);
  saveData(false);

  showSaveMessage(`Data for ${pageName} ble hentet fra ${prevYearDisplay}!`);
}

function getSchoolYearOptions() {
  const yearSelect = document.getElementById('year-select');
  if (yearSelect && yearSelect.options.length > 0) {
    return Array.from(yearSelect.options).map(opt => ({
      value: opt.value,
      text: opt.text
    }));
  }
  return [{ value: activeSchoolYear, text: activeSchoolYear }];
}

function openPrintModal() {
  const modal = document.getElementById('print-modal');
  const yearSelect = document.getElementById('print-year-select');
  const pagesList = document.getElementById('print-pages-list');

  if (!modal) return;

  if (yearSelect) {
    yearSelect.innerHTML = '';
    getSchoolYearOptions().forEach(yr => {
      const opt = document.createElement('option');
      opt.value = yr.value;
      opt.textContent = yr.text;
      if (yr.value === activeSchoolYear) opt.selected = true;
      yearSelect.appendChild(opt);
    });
  }

  if (pagesList) {
    pagesList.innerHTML = '';
    pages.forEach(p => {
      const pageEl = document.querySelector(`.page[data-page="${p.id}"]`);
      const sections = pageEl ? Array.from(pageEl.querySelectorAll('.section-card')) : [];

      const pageContainer = document.createElement('div');
      pageContainer.className = 'print-page-group';

      let sectionsHTML = '';
      if (sections.length > 0) {
        sectionsHTML = `<div class="print-sections-list">`;
        sections.forEach((sec, idx) => {
          const title = sec.querySelector('.section-header')?.textContent?.trim() || `Del ${idx + 1}`;
          sectionsHTML += `
            <label class="print-sub-item">
              <input type="checkbox" class="print-section-check" data-page="${p.id}" data-section-idx="${idx}" checked>
              <span>${title}</span>
            </label>
          `;
        });
        sectionsHTML += `</div>`;
      }

      pageContainer.innerHTML = `
        <div class="print-page-header">
          <label class="print-page-item">
            <input type="checkbox" class="print-page-check" data-page="${p.id}" checked>
            <span><strong>${p.id}.</strong> ${p.name}</span>
          </label>
          ${sections.length > 0 ? `<button type="button" class="toggle-sub-btn" onclick="this.parentElement.nextElementSibling.classList.toggle('show')">▼ Deloppgaver</button>` : ''}
        </div>
        ${sectionsHTML}
      `;

      pagesList.appendChild(pageContainer);
    });

    pagesList.querySelectorAll('.print-page-check').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const pageId = e.target.getAttribute('data-page');
        const subChecks = pagesList.querySelectorAll(`.print-section-check[data-page="${pageId}"]`);
        subChecks.forEach(sub => sub.checked = e.target.checked);
      });
    });
  }

  modal.style.display = 'flex';
}

function closePrintModal() {
  const modal = document.getElementById('print-modal');
  if (modal) modal.style.display = 'none';
}

function handleStartPrint() {
  const selectedYear = document.getElementById('print-year-select')?.value;
  const isDataMode = document.querySelector('input[name="print-data-mode"]:checked')?.value === 'with-data';
  
  const checkedPageCbs = Array.from(document.querySelectorAll('.print-page-check:checked'));
  const checkedPageIds = checkedPageCbs.map(cb => parseInt(cb.getAttribute('data-page'), 10));

  if (checkedPageIds.length === 0) {
    alert('Vennligst velg minst én side for utskrift.');
    return;
  }

  let printData = {};
  if (isDataMode && selectedYear) {
    const raw = localStorage.getItem(storageKeyFor(selectedYear));
    if (raw) {
      try { printData = JSON.parse(raw) || {}; } catch (e) { printData = {}; }
    }
  }

  const backupFormData = { ...formData };
  const backupPage = currentPage;

  formData = printData;
  syncDataToInputs();
  calculateAll(false);

  const schoolName = formData['s1_skole'] || 'Skole';
  const muniName = formData['s1_kommunenavn'] || 'Kommune';
  const yearText = `Skoleår ${selectedYear ? selectedYear.replace('-', '/') : activeSchoolYear}`;

  document.querySelectorAll('.print-header-instance').forEach(el => el.remove());

  document.querySelectorAll('.page').forEach(pageEl => {
    const pageNum = parseInt(pageEl.getAttribute('data-page'), 10);
    const pageObj = pages.find(p => p.id === pageNum);
    const pageTitle = pageObj ? `${pageObj.id}. ${pageObj.name}` : `Side ${pageNum}`;

    pageEl.querySelectorAll('.section-card').forEach(sc => sc.classList.remove('print-section-hidden'));

    if (checkedPageIds.includes(pageNum)) {
      pageEl.classList.add('print-visible');

      const printHeader = document.createElement('div');
      printHeader.className = 'print-header print-header-instance';
      printHeader.innerHTML = `
        <div><strong>${schoolName}</strong> — ${muniName}</div>
        <div><strong>${pageTitle}</strong></div>
        <div>${yearText}</div>
      `;
      pageEl.insertBefore(printHeader, pageEl.firstChild);

      const sections = pageEl.querySelectorAll('.section-card');
      sections.forEach((secEl, idx) => {
        const subCb = document.querySelector(`.print-section-check[data-page="${pageNum}"][data-section-idx="${idx}"]`);
        if (subCb && !subCb.checked) {
          secEl.classList.add('print-section-hidden');
        }
      });

    } else {
      pageEl.classList.remove('print-visible');
    }
  });

  closePrintModal();

  setTimeout(() => {
    window.print();

    formData = backupFormData;
    syncDataToInputs();
    calculateAll(false);

    document.querySelectorAll('.print-header-instance').forEach(el => el.remove());
    document.querySelectorAll('.page').forEach(pageEl => {
      pageEl.classList.remove('print-visible');
      pageEl.querySelectorAll('.section-card').forEach(sc => sc.classList.remove('print-section-hidden'));
    });

    if (typeof selectPage === 'function') selectPage(backupPage);
  }, 150);
}

/* =========================================================
   SKOLEBEHANDLING, STARTSIDE, PAPIRKURV OG NAVIGASJON
   ========================================================= */

let editingSchoolId = null; // null = ny skole, streng = redigerer eksisterende skole

const defaultSchools = [];

function getSchools() {
  const saved = localStorage.getItem('gsi_schools');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.warn('Kunne ikke lese gsi_schools:', e);
    }
  }
  localStorage.setItem('gsi_schools', JSON.stringify(defaultSchools));
  return defaultSchools;
}

function getDeletedSchools() {
  const saved = localStorage.getItem('gsi_schools_deleted');
  if (saved) {
    try { return JSON.parse(saved) || []; } catch (e) { return []; }
  }
  return [];
}

function saveSchools(schools) {
  localStorage.setItem('gsi_schools', JSON.stringify(schools));
  renderStartside();
}

function saveDeletedSchools(deletedList) {
  localStorage.setItem('gsi_schools_deleted', JSON.stringify(deletedList));
  updateTrashBadge();
}

function updateTrashBadge() {
  const badge = document.getElementById('trash-count');
  if (badge) badge.textContent = getDeletedSchools().length;
}

function renderStartside() {
  const schools = getSchools();
  const tbody = document.getElementById('startside-schools-tbody');
  const badge = document.getElementById('school-count-badge');
  
  if (badge) badge.textContent = `Antall skoler: ${schools.length}`;
  updateTrashBadge();
  if (!tbody) return;

  const yearText = activeSchoolYear ? activeSchoolYear.split('-')[0] : new Date().getFullYear().toString();

  // Vis en hyggelig melding i tabellen når det ikke finnes noen skoler
  if (schools.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 32px; color: #64748b;">
          Ingen skoler er registrert ennå. Trykk på <strong>«+ Legg til ny skole»</strong> for å opprette din første skole.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = schools.map(s => `
    <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
      <td style="padding: 14px 16px; font-weight: 500; color: #64748b;">${yearText}</td>
      <td style="padding: 14px 16px; font-weight: 600; color: #334155;">${s.orgnr}</td>
      <td style="padding: 14px 16px; font-weight: 700; color: #0f172a; font-size: 1.05rem;">${s.name}</td>
      <td style="padding: 14px 16px; color: #475569;">${s.fylke}</td>
      <td style="padding: 14px 16px; color: #475569;">${s.kommune}</td>
      <td style="padding: 14px 16px;"><span style="color: #d97706; font-size: 0.8rem;">●</span> ${s.status}</td>
      <td style="padding: 14px 16px; text-align: right; white-space: nowrap;">
        <button type="button" class="btn" style="background: #0f172a; color: white; padding: 8px 18px; font-size: 0.9rem; border-radius: 4px; cursor: pointer; border: none; font-weight: 600; margin-right: 8px;" onclick="selectSchoolForInfo('${s.id}')">
          Åpne skjema
        </button>
        <button type="button" title="Rediger stamdata" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 0.85rem; border-radius: 4px; cursor: pointer; margin-right: 8px;" onclick="openEditSchoolModal('${s.id}')">
          ✏️ Rediger
        </button>
        <button type="button" title="Flytt til slettede skoler" style="background: transparent; color: #94a3b8; border: none; padding: 6px 8px; font-size: 0.85rem; border-radius: 4px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'" onclick="softDeleteSchool('${s.id}')">
          🗑️ Slett
        </button>
      </td>
    </tr>
  `).join('');
}

/* Sletting og gjenoppretting */
function softDeleteSchool(schoolId) {
  const schools = getSchools();
  const schoolToDelete = schools.find(s => s.id === schoolId);
  if (!schoolToDelete) return;

  if (!confirm(`Er du sikker på at du vil slette "${schoolToDelete.name}"?\nSkolen flyttes til slettede skoler og kan gjenopprettes senere.`)) {
    return;
  }

  const updatedSchools = schools.filter(s => s.id !== schoolId);
  const deletedSchools = getDeletedSchools();
  deletedSchools.push(schoolToDelete);

  saveSchools(updatedSchools);
  saveDeletedSchools(deletedSchools);
}

function restoreSchool(schoolId) {
  const deletedSchools = getDeletedSchools();
  const schoolToRestore = deletedSchools.find(s => s.id === schoolId);
  if (!schoolToRestore) return;

  const updatedDeleted = deletedSchools.filter(s => s.id !== schoolId);
  const schools = getSchools();
  schools.push(schoolToRestore);

  saveSchools(schools);
  saveDeletedSchools(updatedDeleted);
  renderTrashModal();
}

function permanentlyDeleteSchool(schoolId) {
  const deletedSchools = getDeletedSchools();
  const school = deletedSchools.find(s => s.id === schoolId);
  
  if (!confirm(`ADVARSEL: Vil du slette "${school?.name || 'skolen'}" PERMANENT?\n\nDette kan ikke angres.`)) {
    return;
  }

  const updatedDeleted = deletedSchools.filter(s => s.id !== schoolId);
  saveDeletedSchools(updatedDeleted);
  renderTrashModal();
}

/* Modal-håndtering for slettede skoler */
function openTrashModal() {
  renderTrashModal();
  const modal = document.getElementById('trash-school-modal');
  if (modal) modal.style.display = 'flex';
}

function closeTrashModal() {
  const modal = document.getElementById('trash-school-modal');
  if (modal) modal.style.display = 'none';
}

function renderTrashModal() {
  const deleted = getDeletedSchools();
  const tbody = document.getElementById('trash-schools-tbody');
  if (!tbody) return;

  if (deleted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">Ingen slettede skoler.</td></tr>`;
    return;
  }

  tbody.innerHTML = deleted.map(s => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 8px;">${s.orgnr}</td>
      <td style="padding: 8px; font-weight: bold;">${s.name}</td>
      <td style="padding: 8px;">${s.kommune}</td>
      <td style="padding: 8px; text-align: right; white-space: nowrap;">
        <button type="button" style="background: #10b981; color: white; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;" onclick="restoreSchool('${s.id}')">⟲ Gjenopprett</button>
        <button type="button" style="background: #dc2626; color: white; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer;" onclick="permanentlyDeleteSchool('${s.id}')">Slett permanent</button>
      </td>
    </tr>
  `).join('');
}

/* Hjelpefunksjon for å fylle kommune-dropdown */
function populerKommuneDropdown(selectedKommune = '') {
  const muniSelect = document.getElementById('new-school-muni');
  if (!muniSelect) return;
  muniSelect.innerHTML = '<option value="">-- Velg kommune --</option>';

  if (typeof KOMMUNER_DATA !== 'undefined') {
    const sorted = [...KOMMUNER_DATA].sort((a, b) => a.navn.localeCompare(b.navn, 'nb'));
    sorted.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k.navn;
      opt.textContent = `${k.navn} (${k.fylke})`;
      if (k.navn === selectedKommune) opt.selected = true;
      muniSelect.appendChild(opt);
    });
  }
}

/* Modal for å legge til NY skole */
function openAddSchoolModal() {
  editingSchoolId = null;
  const modal = document.getElementById('add-school-modal');
  if (modal) {
    const title = modal.querySelector('h3');
    if (title) title.textContent = 'Legg til ny skole';

    document.getElementById('new-school-name').value = '';
    document.getElementById('new-school-orgnr').value = '';
    document.getElementById('new-school-registered-by').value = '';

    populerKommuneDropdown('');
    modal.style.display = 'flex';
  }
}

/* Modal for å REDIGERE eksisterende skole */
function openEditSchoolModal(schoolId) {
  const school = getSchools().find(s => s.id === schoolId);
  if (!school) return;

  editingSchoolId = schoolId;
  const modal = document.getElementById('add-school-modal');
  if (modal) {
    const title = modal.querySelector('h3');
    if (title) title.textContent = `Rediger stamdata: ${school.name}`;

    document.getElementById('new-school-name').value = school.name || '';
    document.getElementById('new-school-orgnr').value = school.orgnr || '';
    document.getElementById('new-school-registered-by').value = school.registrertAv || '';

    populerKommuneDropdown(school.kommune);
    modal.style.display = 'flex';
  }
}

function closeAddSchoolModal() {
  const modal = document.getElementById('add-school-modal');
  if (modal) modal.style.display = 'none';
  editingSchoolId = null;
}

function saveNewSchoolFromModal() {
  const name = document.getElementById('new-school-name')?.value?.trim();
  const orgnr = document.getElementById('new-school-orgnr')?.value?.trim();
  const kommuneNavn = document.getElementById('new-school-muni')?.value;
  const registrertAv = document.getElementById('new-school-registered-by')?.value?.trim();

  if (!name || !orgnr || !kommuneNavn || !registrertAv) {
    alert('Vennligst fyll ut alle feltene (*).');
    return;
  }

  // Finn automatisk kommunedata fra KOMMUNER_DATA
  const kommuneData = (typeof KOMMUNER_DATA !== 'undefined') 
    ? (KOMMUNER_DATA.find(k => k.navn === kommuneNavn) || {}) 
    : {};

  const schools = getSchools();

  if (editingSchoolId) {
    // --- REDIGER EKSISTERENDE SKOLE ---
    const index = schools.findIndex(s => s.id === editingSchoolId);
    if (index !== -1) {
      schools[index] = {
        ...schools[index],
        name: name,
        orgnr: orgnr,
        kommune: kommuneNavn,
        kommunenr: kommuneData.knr || '',
        fylke: kommuneData.fylke || '',
        fylkesnr: kommuneData.fnr || '',
        registrertAv: registrertAv
      };
    }
  } else {
    // --- OPPRETT NY SKOLE ---
    const newId = `skole_${Date.now()}`;
    schools.push({
      id: newId,
      orgnr: orgnr,
      name: name,
      fylke: kommuneData.fylke || '',
      fylkesnr: kommuneData.fnr || '',
      kommune: kommuneNavn,
      kommunenr: kommuneData.knr || '',
      registrertAv: registrertAv,
      status: 'Under behandling'
    });
  }

  saveSchools(schools);
  closeAddSchoolModal();
}

/* Hjelpefunksjon for å vise/skjule topplinje-kontroller */
function toggleTopbarControls(show) {
  const displayStyle = show ? '' : 'none';

  // Skjul/vis Skoleår-velger
  const yearControl = document.querySelector('.year-control');
  if (yearControl) yearControl.style.display = displayStyle;

  // Skjul/vis Bruker- og skoleboks (de gule boksene)
  const userbox = document.querySelector('.userbox');
  if (userbox) userbox.style.display = show ? 'flex' : 'none';

  // Skjul/vis Hamburgermeny / Verktøymeny
  const toolsMenu = document.querySelector('.tools-menu-container');
  if (toolsMenu) toolsMenu.style.display = displayStyle;
}

function selectSchoolForInfo(schoolId) {
  activeSchoolId = schoolId;
  const school = getSchools().find(s => s.id === schoolId);

  const vStart = document.getElementById('view-startside');
  const vForm = document.getElementById('view-form');
  const vSidebar = document.getElementById('app-sidebar');
  const vInfo = document.getElementById('view-info');

  if (vStart) vStart.style.display = 'none';
  if (vForm) vForm.style.display = 'none';
  if (vSidebar) vSidebar.style.display = 'none';
  if (vInfo) vInfo.style.display = 'block';

  // Skjul topplinje-elementer på innledningssiden
  toggleTopbarControls(false);

  if (school) {
    const elSchool = document.getElementById('topbar-school');
    const elMuni = document.getElementById('topbar-municipality');
    if (elSchool) elSchool.textContent = school.name;
    if (elMuni) elMuni.textContent = school.kommune;
  }
}


/* Hjelpefunksjon for å synkronisere stamdata på tvers av alle skoleår */
function syncActiveSchoolStamdata() {
  if (!activeSchoolId) return;
  const school = getSchools().find(s => s.id === activeSchoolId);
  if (!school) return;

  // 1. Oppdater Toppmeny (.userbox og .user)
  const topSchool = document.querySelector('.userbox strong');
  const topMuni = document.querySelector('.userbox small');
  const topUser = document.querySelector('.user strong');
  if (topSchool) topSchool.textContent = school.name;
  if (topMuni) topMuni.textContent = school.kommune;
  if (topUser && school.registrertAv) topUser.textContent = school.registrertAv;

  // 2. Fyll ut felt på Side 1 (Enhetsopplysninger)
  setInputValue('s1_skole', school.name);
  setInputValue('s1_orgnr_skole', school.orgnr);
  setInputValue('s1_kommunenavn', school.kommune);
  setInputValue('s1_kommunenummer', school.kommunenr || '');
  setInputValue('s1_fylke', school.fylke || '');
  setInputValue('s1_fylkesnummer', school.fylkesnr || '');

  // 3. Fyll ut Side 18 (Skjema er fylt ut av)
  setInputValue('s18_navn', school.registrertAv || '');

  // 4. Oppdater formData-objektet for gjeldende år
  if (typeof formData !== 'undefined') {
    formData['s1_skole'] = school.name;
    formData['s1_orgnr_skole'] = school.orgnr;
    formData['s1_kommunenavn'] = school.kommune;
    formData['s1_kommunenummer'] = school.kommunenr || '';
    formData['s1_fylke'] = school.fylke || '';
    formData['s1_fylkesnummer'] = school.fylkesnr || '';
    if (school.registrertAv) formData['s18_navn'] = school.registrertAv;
  }
}

function openFormForActiveSchool() {
  const vStart = document.getElementById('view-startside');
  const vForm = document.getElementById('view-form');
  const vSidebar = document.getElementById('app-sidebar');
  const vInfo = document.getElementById('view-info');

  if (vInfo) vInfo.style.display = 'none';
  if (vStart) vStart.style.display = 'none';
  if (vSidebar) vSidebar.style.display = 'block';
  if (vForm) vForm.style.display = 'block';

  // Vis topplinje-elementene
  toggleTopbarControls(true);

  // Last data for året
  loadDataForYear();

  // Synkroniser stamdata inn over de innlastede skjemadataene
  syncActiveSchoolStamdata();
  saveData(false);

  selectPage(1);
}


// Hjelpefunksjon for å sette verdier trygt på felt
function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function goToStartside() {
  saveData(false);
  activeSchoolId = null;

  // Skjul topplinje-elementene igjen når man går tilbake til startsiden
  toggleTopbarControls(false);

  const elSchool = document.getElementById('topbar-school');
  const elMuni = document.getElementById('topbar-municipality');
  if (elSchool) elSchool.textContent = 'Velg skole...';
  if (elMuni) elMuni.textContent = 'Kommune';

  const vStart = document.getElementById('view-startside');
  const vForm = document.getElementById('view-form');
  const vSidebar = document.getElementById('app-sidebar');
  const vInfo = document.getElementById('view-info');

  if (vInfo) vInfo.style.display = 'none';
  if (vForm) vForm.style.display = 'none';
  if (vSidebar) vSidebar.style.display = 'none';
  if (vStart) vStart.style.display = 'block';

  renderStartside();
}


/* =========================================================
   HENDELSER OG OPPSTART
   ========================================================= */

function bindEvents() {
  const on = (id, event, fn) => document.getElementById(id)?.addEventListener(event, fn);

  // Ny skole modal
  on('btn-add-school', 'click', openAddSchoolModal);
  on('btn-cancel-add-school', 'click', closeAddSchoolModal);
  on('btn-save-add-school', 'click', saveNewSchoolFromModal);

  // Papirkurv modal
  on('btn-open-trash', 'click', openTrashModal);
  on('btn-close-trash', 'click', closeTrashModal);
  on('btn-close-trash-bottom', 'click', closeTrashModal);

// Eksport og import fra startsiden
on('btn-startside-export', 'click', exportJSON);
on('startside-import-file', 'change', importJSON);

  on('year-select', 'change', handleYearChange);
  on('validate-btn', 'click', () => { if (typeof runValidation === 'function') runValidation(true); });
  on('export-btn', 'click', typeof exportJSON === 'function' ? exportJSON : null);
  on('import-file', 'change', typeof importJSON === 'function' ? importJSON : null);
  on('reset-select', 'change', handleResetSelect);

  on('add-s3-e-row-btn', 'click', () => { if (typeof addSide3ERow === 'function') addSide3ERow(); });
  on('add-s7-h-row-btn', 'click', () => { if (typeof addSide7HRow === 'function') addSide7HRow(); });
  on('add-s8-c-row-btn', 'click', () => { if (typeof addSide8CRow === 'function') addSide8CRow(); });
  on('add-s8-d-row-btn', 'click', () => { if (typeof addSide8DRow === 'function') addSide8DRow(); });
  on('add-s9-c-row-btn', 'click', () => { if (typeof addSide9CRow === 'function') addSide9CRow(); });

  const toolsBtn = document.getElementById('tools-menu-btn');
  const toolsDropdown = document.getElementById('tools-dropdown');

  if (toolsBtn && toolsDropdown) {
    toolsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toolsDropdown.classList.toggle('show');
    });

    toolsDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    toolsDropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        toolsDropdown.classList.remove('show');
      });
    });

    const resetSelect = document.getElementById('reset-select');
    if (resetSelect) {
      resetSelect.addEventListener('change', () => {
        toolsDropdown.classList.remove('show');
      });
    }

    document.addEventListener('click', () => {
      toolsDropdown.classList.remove('show');
    });
  }

  on('open-calc-s7-modal-btn', 'click', openCalcSide7Modal);
  on('close-calc-s7-modal', 'click', closeCalcSide7Modal);
  on('cancel-calc-s7-btn', 'click', closeCalcSide7Modal);
  on('apply-calc-s7-btn', 'click', applyCalcSide7Data);

  on('open-calc-s8-modal-btn', 'click', openCalcSide8Modal);
  on('close-calc-s8-modal', 'click', closeCalcSide8Modal);
  on('cancel-calc-s8-btn', 'click', closeCalcSide8Modal);
  on('apply-calc-s8-btn', 'click', applyCalcSide8Data);

  on('print-modal-btn', 'click', openPrintModal);
  on('close-print-modal', 'click', closePrintModal);
  on('cancel-print', 'click', closePrintModal);
  on('start-print-btn', 'click', handleStartPrint);

  on('print-select-all', 'click', () => {
    document.querySelectorAll('.print-page-check').forEach(cb => cb.checked = true);
  });
  on('print-deselect-all', 'click', () => {
    document.querySelectorAll('.print-page-check').forEach(cb => cb.checked = false);
  });

  document.querySelectorAll('[data-nav="prev"]').forEach(b => b.addEventListener('click', () => navigatePage(-1)));
  document.querySelectorAll('[data-nav="next"]').forEach(b => b.addEventListener('click', () => navigatePage(1)));
  document.querySelectorAll('[data-save],#save-1').forEach(b => b.addEventListener('click', () => saveData(true)));

  allFormElements().forEach(el => {
    const evt = ['radio', 'checkbox'].includes(el.type) || el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      if (!isLoadingData) {
        calculateAll(false);
        autoSave();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateSchoolYears();
  bindEvents();
  toggleTopbarControls(false); // Skjuler verktøy, skoleår og brukerboks ved oppstart
  renderStartside();
});

// Eksponer globale funksjoner
window.goToStartside = goToStartside;
window.selectSchoolForInfo = selectSchoolForInfo;
window.openFormForActiveSchool = openFormForActiveSchool;
window.openAddSchoolModal = openAddSchoolModal;
window.closeAddSchoolModal = closeAddSchoolModal;
window.saveNewSchoolFromModal = saveNewSchoolFromModal;
window.softDeleteSchool = softDeleteSchool;
window.restoreSchool = restoreSchool;
window.permanentlyDeleteSchool = permanentlyDeleteSchool;
window.exportJSON = exportJSON;
window.importJSON = importJSON;