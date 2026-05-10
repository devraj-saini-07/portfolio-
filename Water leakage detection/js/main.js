/* =====================================================
   Smart Jal Suraksha Portal — main.js
   ===================================================== */


  //  firebase configuration
  const firebaseConfig = {
  apiKey: "AIzaSyDtJaA_cVdV6QtsNmDmbKZT8aGNnqiHiag",
  authDomain: "water-leakage-detection-4777e.firebaseapp.com",
  databaseURL: "https://water-leakage-detection-4777e-default-rtdb.firebaseio.com",
  projectId: "water-leakage-detection-4777e",
  storageBucket: "water-leakage-detection-4777e.firebasestorage.app",
  messagingSenderId: "535259921999",
  appId: "1:535259921999:web:b7f602fbbd5ab3d091743a"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

const messaging = firebase.messaging();



//service work
navigator.serviceWorker.register('./firebase-messaging-sw.js')


.then((registration) => {

  console.log("SW Registered");

  Notification.requestPermission()
  .then(() => {

    return messaging.getToken({

      vapidKey: "BAhKP27xu1wdCGNLNj7sm0ilz-cPkceZ-YNT3l1MvS5bE_66PeRrLM08dyus6ZNykigAPN5i09XPGxN1fokacCo",

      serviceWorkerRegistration: registration

    });

  })
 .then((token) => {

   console.log(token);

   firebase.database()
   .ref("users/user1")
   .set({

    token: token,
     leakage: false

   });

  })

});




let isDark = false;
let currentLoginType = 'Government';
let currentTab = 'email';

/* ===== TOAST ===== */
function showToast(msg, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-text">${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add('hiding');
    setTimeout(() => t.remove(), 300);
  }, duration);
}

/* ===== MODAL HELPERS ===== */
function openModal(id) {
  const m = document.getElementById(id);
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const m = document.getElementById(id);
  m.classList.remove('open');
  if (
    !document.querySelector('.modal-backdrop.open') &&
    !document.querySelector('.login-form-backdrop.open')
  ) {
    document.body.style.overflow = '';
  }
}

function handleBdClick(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal('loginFormModal');
    closeModal('loginModal');
    document.body.style.overflow = '';
  }
});

/* ===== LOGIN SELECTOR ===== */
function openLogin() {
  openModal('loginModal');
}

function openLoginForm(type, icon, cls) {
  currentLoginType = type;

  // Update badge
  const badge = document.getElementById('lfTypeBadge');
  badge.innerHTML = `${icon} ${type} Login`;
  badge.style.background =
    cls === 'admin' ? 'rgba(103,58,183,0.12)' :
    cls === 'staff' ? 'var(--orange-bg)' :
    cls === 'mobile' ? 'var(--green-bg)' : 'var(--blue-bg)';
  badge.style.color =
    cls === 'admin' ? '#7c4dff' :
    cls === 'staff' ? 'var(--orange)' :
    cls === 'mobile' ? 'var(--green)' : 'var(--blue)';

  // Citizen uses mobile tab by default
  if (cls === 'mobile') switchTab('mobile');
  else switchTab('email');

  clearForm();
  closeModal('loginModal');
  openModal('loginFormModal');
}

function guestLogin() {
  closeModal('loginModal');
  showToast('Logged in as Guest (View Only mode)', 'info');
}

function backToSelector() {
  closeModal('loginFormModal');
  openModal('loginModal');
}

function closeLoginForm() {
  closeModal('loginFormModal');
  document.body.style.overflow = '';
}

/* ===== TAB SWITCH ===== */
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('panel-email').style.display = tab === 'email' ? 'block' : 'none';
  document.getElementById('panel-mobile').style.display = tab === 'mobile' ? 'block' : 'none';
  document.getElementById('tab-email').classList.toggle('active', tab === 'email');
  document.getElementById('tab-mobile').classList.toggle('active', tab === 'mobile');
  clearErrors();
}

/* ===== PASSWORD TOGGLE ===== */
function togglePw(inputId, btnId) {
  const inp = document.getElementById(inputId);
  const open = inp.type === 'password';
  inp.type = open ? 'text' : 'password';
  document.getElementById(btnId).textContent = open ? '🙈' : '👁️';
}

/* ===== OTP ===== */
function sendOTP() {
  const mob = document.getElementById('lf-mob').value.replace(/\s/g, '');
  if (!/^(\+91|91)?[6-9]\d{9}$/.test(mob)) {
    showError('err-mob', true);
    return;
  }
  showError('err-mob', false);
  const btn = document.getElementById('otpBtn');
  btn.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    showToast('OTP sent to your mobile number!', 'success');
    let sec = 30;
    btn.textContent = `Resend (${sec}s)`;
    const iv = setInterval(() => {
      sec--;
      if (sec <= 0) {
        clearInterval(iv);
        btn.textContent = 'Send OTP';
        btn.disabled = false;
      } else {
        btn.textContent = `Resend (${sec}s)`;
      }
    }, 1000);
  }, 1000);
}

/* ===== FORGOT PASSWORD ===== */
function forgotPassword() {
  showToast('Password reset link sent to your registered email/mobile.', 'info');
}

/* ===== VALIDATION ===== */
function showError(id, show) {
  const el = document.getElementById(id);
  el.classList.toggle('show', show);
  const input =
    el.previousElementSibling?.tagName === 'INPUT'
      ? el.previousElementSibling
      : el.previousElementSibling?.querySelector('input');
  if (input) input.classList.toggle('error', show);
}

function clearErrors() {
  ['err-email', 'err-pw', 'err-mob', 'err-otp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });
  document.querySelectorAll('.lf-input').forEach(i => i.classList.remove('error'));
}

function clearForm() {
  ['lf-email', 'lf-pw', 'lf-mob', 'lf-otp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('lf-remember').checked = false;

  // Reset password eye
  const pw = document.getElementById('lf-pw');
  if (pw) pw.type = 'password';
  const eye = document.getElementById('eye-pw');
  if (eye) eye.textContent = '👁️';

  clearErrors();
}

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validateMobile(v) {
  return /^(\+91|91)?[6-9]\d{9}$/.test(v.replace(/\s/g, ''));
}

/* ===== SUBMIT LOGIN ===== */
function submitLogin() {
  clearErrors();
  let valid = true;

  if (currentTab === 'email') {
    const email = document.getElementById('lf-email').value.trim();
    const pw = document.getElementById('lf-pw').value;
    if (!validateEmail(email)) { showError('err-email', true); valid = false; }
    if (!pw) { showError('err-pw', true); valid = false; }
  } else {
    const mob = document.getElementById('lf-mob').value;
    const otp = document.getElementById('lf-otp').value.trim();
    if (!validateMobile(mob)) { showError('err-mob', true); valid = false; }
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) { showError('err-otp', true); valid = false; }
  }

  if (!valid) return;

  // Loading state
  const btn = document.getElementById('lfSubmitBtn');
  const txt = document.getElementById('lfBtnText');
  const spin = document.getElementById('lfSpinner');
  btn.classList.add('loading');
  txt.style.display = 'none';
  spin.style.display = 'block';

  setTimeout(() => {
    btn.classList.remove('loading');
    txt.style.display = 'block';
    spin.style.display = 'none';
    closeLoginForm();
    showToast(`Welcome! Logged in as ${currentLoginType}.`, 'success', 4000);
  }, 1800);
}

/* ===== SUPPLY TOGGLE ===== */
let supplyOnCount = 34;
const totalSupply = 40;

function handleSupplyToggle(cb) {
  const el = document.getElementById('pumpStatusText');
  const status = document.getElementById('supplycount');

  el.textContent = cb.checked ? 'ON' : 'OFF';
  el.className = 'supply-status-text ' + (cb.checked ? 'on' : 'off');

  if (cb.checked) {
    supplyOnCount++;
  } else {
    supplyOnCount--;
  }

  if (supplyOnCount < 0) supplyOnCount = 0;
  if (supplyOnCount > totalSupply) supplyOnCount = totalSupply;

  status.textContent = `${supplyOnCount}/${totalSupply}`;
 // Firebase update
  db.ref("system/pump").set(cb.checked);
  showToast(
    cb.checked
      ? 'Water supply activated.'
      : 'Water supply deactivated.',
    cb.checked ? 'success' : 'error'
  );
}


function handleBuzzerToggle(cb) {
  const el = document.getElementById('buzzerStatusText');
  const status = document.getElementById('buzzerstatus');

  el.textContent = cb.checked ? 'ON' : 'OFF';
  el.className = 'supply-status-text ' + (cb.checked ? 'on' : 'off');

  status.textContent = cb.checked ? 'Active' : 'Inactive';
 // Firebase update
  db.ref("system/buzzer").set(cb.checked);
  showToast(
    cb.checked
      ? 'Buzzer activated.'
      : 'Buzzer deactivated.',
    cb.checked ? 'success' : 'error'
  );
}
/* ===== i18n ===== */
const i18n = {
  en: {
    'nav-dashboard': 'Dashboard', 'nav-pressure': 'Water Pressure',
    'nav-leakage': 'Leakage Detection', 'nav-theft': 'Water Theft',
    'nav-purity': 'Water Purity', 'nav-pipeline': 'Pipelines',
    'nav-alerts': 'Alerts', 'nav-reports': 'Reports',
    'stat-pipelines': 'Active Pipelines', 'stat-leakage': 'Leakage Cases',
    'stat-theft': 'Theft Alerts', 'stat-maintenance': 'Maintenance',
    'stat-supply': 'Supply ON/OFF', 'chart-daily': 'Daily Water Usage (KL)',
    'chart-leakage': 'Leakage Trend (7 Days)', 'ai-risk': 'AI Risk Scores',
    'sensor-status': 'Sensor Status', 'quick-alerts': 'Recent Alerts',
    'alert1': 'Leakage — Pipeline PL-007, Ward 3',
    'alert2': 'Theft suspect — Connection C-214, Zone D',
    'alert3': 'Low pressure — Zone B (28 PSI)',
    'online': 'Online', 'offline': 'Offline', 'warning': 'Warning',
    't-title': 'Smart Jal Suraksha Portal',
    't-sub': 'IoT Based Water Monitoring • Madhya Pradesh',
    't-live': 'Live',
    'sec-pressure': 'Water Pressure Monitoring',
    'sec-leakage': 'Leakage Detection',
    'sec-theft': 'Water Theft Detection',
    'sec-purity': 'Water Purity Monitoring',
    'sec-pipeline': 'Pipeline Connection Management',
    'sec-alerts': 'Live Emergency Alerts',
    'sec-reports': 'Reports & Analytics',
    'live-monitoring': 'Live Monitoring',
    'input-sensor': 'Input Sensor',
    'output-sensor': 'Output Sensor',
    'normal': 'Normal',
    'low': 'Low',
    'high': 'High',
  },
  hi: {
    'nav-dashboard': 'डैशबोर्ड', 'nav-pressure': 'जल दबाव',
    'nav-leakage': 'रिसाव पहचान', 'nav-theft': 'जल चोरी',
    'nav-purity': 'जल शुद्धता', 'nav-pipeline': 'पाइपलाइन',
    'nav-alerts': 'अलर्ट', 'nav-reports': 'रिपोर्ट',
    'stat-pipelines': 'सक्रिय पाइपलाइन', 'stat-leakage': 'रिसाव मामले',
    'stat-theft': 'चोरी अलर्ट', 'stat-maintenance': 'रखरखाव',
    'stat-supply': 'आपूर्ति चालू/बंद', 'chart-daily': 'दैनिक जल उपयोग (KL)',
    'chart-leakage': 'रिसाव प्रवृत्ति (7 दिन)', 'ai-risk': 'AI जोखिम स्कोर',
    'sensor-status': 'सेंसर स्थिति', 'quick-alerts': 'हालिया अलर्ट',
    'alert1': 'रिसाव — पाइपलाइन PL-007, वार्ड 3',
    'alert2': 'चोरी संदिग्ध — कनेक्शन C-214',
    'alert3': 'कम दबाव — जोन B',
    'online': 'ऑनलाइन', 'offline': 'ऑफलाइन', 'warning': 'चेतावनी',
    't-title': 'स्मार्ट जल सुरक्षा पोर्टल',
    't-sub': 'IoT जल निगरानी • मध्य प्रदेश',
    't-live': 'लाइव',
    'sec-pressure': 'जल दबाव निगरानी', 'sec-leakage': 'रिसाव पहचान',
    'sec-theft': 'जल चोरी पहचान', 'sec-purity': 'जल शुद्धता निगरानी',
    'sec-pipeline': 'पाइपलाइन प्रबंधन',
    'sec-alerts': 'लाइव आपातकालीन सूचनाएं',
    'sec-reports': 'रिपोर्ट और विश्लेषण',
    'live-monitoring': 'लाइव मॉनिटरिंग',
    'input-sensor': 'इनपुट सेंसर',
    'output-sensor': 'आउटपुट सेंसर',
    'normal': 'सामान्य',
    'low': 'कम',
    'high': 'अधिक',
  },
  mr: {
    'nav-dashboard': 'डॅशबोर्ड', 'nav-pressure': 'जल दाब',
    'nav-leakage': 'गळती शोध', 'nav-theft': 'जल चोरी',
    'nav-purity': 'जल शुद्धता', 'nav-pipeline': 'पाइपलाइन',
    'nav-alerts': 'अलर्ट', 'nav-reports': 'अहवाल',
    'stat-pipelines': 'सक्रिय पाइपलाइन', 'stat-leakage': 'गळती प्रकरणे',
    'stat-theft': 'चोरी अलर्ट', 'stat-maintenance': 'देखभाल',
    'stat-supply': 'पुरवठा चालू/बंद', 'chart-daily': 'दैनंदिन जल वापर',
    'chart-leakage': 'गळती कल (७ दिवस)', 'ai-risk': 'AI जोखीम स्कोअर',
    'sensor-status': 'सेन्सर स्थिती', 'quick-alerts': 'अलीकडील अलर्ट',
    'alert1': 'गळती — PL-007, वार्ड 3', 'alert2': 'चोरी संशयित — C-214',
    'alert3': 'कमी दाब — झोन B',
    'online': 'ऑनलाइन', 'offline': 'ऑफलाइन', 'warning': 'इशारा',
    't-title': 'स्मार्ट जल सुरक्षा पोर्टल',
    't-sub': 'IoT जल निगराणी • मध्य प्रदेश',
    't-live': 'थेट',
    'sec-pressure': 'जल दाब निगराणी', 'sec-leakage': 'गळती शोध',
    'sec-theft': 'जल चोरी शोध', 'sec-purity': 'जल शुद्धता निगराणी',
    'sec-pipeline': 'पाइपलाइन व्यवस्थापन',
    'sec-alerts': 'थेट आपत्कालीन सूचना',
    'sec-reports': 'अहवाल',
    'live-monitoring': 'लाईव्ह मॉनिटरिंग',
    'input-sensor': 'इनपुट सेन्सर',
    'output-sensor': 'आउटपुट सेन्सर',
    'normal': 'सामान्य',
    'low': 'कमी',
    'high': 'जास्त',
  },
  gu: {
    'nav-dashboard': 'ડૅશબોર્ડ', 'nav-pressure': 'જળ દબાણ',
    'nav-leakage': 'લીકેજ શોધ', 'nav-theft': 'જળ ચોરી',
    'nav-purity': 'જળ શુદ્ધતા', 'nav-pipeline': 'પાઇપલાઇન',
    'nav-alerts': 'ચેતવણી', 'nav-reports': 'અહેવાલ',
    'stat-pipelines': 'સક્રિય પાઇપલાઇન', 'stat-leakage': 'લીકેજ કેસ',
    'stat-theft': 'ચોરી ચેતવણી', 'stat-maintenance': 'જાળવણી',
    'stat-supply': 'પુરવઠો ચાલુ/બંધ', 'chart-daily': 'દૈનિક જળ વપરાશ',
    'chart-leakage': 'લીકેજ ટ્રેન્ડ (7 દિવસ)', 'ai-risk': 'AI જોખમ સ્કોર',
    'sensor-status': 'સેન્સર સ્થિતિ', 'quick-alerts': 'તાજેતરની ચેતવણી',
    'alert1': 'લીકેજ — PL-007, વોર્ડ 3', 'alert2': 'ચોરી શંકા — C-214',
    'alert3': 'ઓછું દબાણ — ઝોન B',
    'online': 'ઓનલાઇન', 'offline': 'ઓફલાઇન', 'warning': 'ચેતવણી',
    't-title': 'સ્માર્ટ જળ સુરક્ષા પોર્ટલ',
    't-sub': 'IoT જળ નિગરાણી • મધ્ય પ્રદેશ',
    't-live': 'લાઇવ',
    'sec-pressure': 'જળ દબાણ નિગરાણી', 'sec-leakage': 'લીકેજ શોધ',
    'sec-theft': 'જળ ચોરી શોધ', 'sec-purity': 'જળ શુદ્ધતા નિગરાણી',
    'sec-pipeline': 'પાઇપલાઇન વ્યવસ્થાપન',
    'sec-alerts': 'લાઇવ ઇમર્જન્સી ચેતવણી',
    'sec-reports': 'અહેવાલ',
    'live-monitoring': 'લાઈવ મોનીટરીંગ',
    'input-sensor': 'ઇનપુટ સેન્સર',
    'output-sensor': 'આઉટપુટ સેન્સર',
    'normal': 'સામાન્ય',
    'low': 'ઓછું',
    'high': 'વધારે',
  }
};

function setLang(lang) {
  const t = i18n[lang] || i18n.en;
  document.querySelectorAll('[data-key]').forEach(el => {
    const k = el.getAttribute('data-key');
    if (t[k]) el.textContent = t[k];
  });
  ['t-title', 't-sub', 't-live'].forEach(id => {
    const el = document.getElementById(id);
    if (el && t[id]) el.textContent = t[id];
  });
}

/* ===== DARK MODE ===== */
function toggleDark() {
  isDark = !isDark;
  document.getElementById('app').className = isDark ? 'dark' : '';
  document.body.style.background = isDark ? '#07111f' : '#eef3f8';
  document.getElementById('darkBtn').textContent = isDark ? '☀️ Light' : '🌙 Dark';
  if (window._charts) window._charts.forEach(c => { try { c.destroy(); } catch (e) {} });
  window._charts = [];
  setTimeout(buildAllCharts, 60);
}

/* ===== SECTION NAVIGATION ===== */
function showSec(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  btn.classList.add('active');
  if (['dashboard', 'pressure', 'purity', 'reports'].includes(id)) {
    setTimeout(buildAllCharts, 90);
  }
}

/* ===== LEAKAGE TABLE FILTER ===== */
function filterLeak(q) {
  document.querySelectorAll('#leakTable tbody tr').forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

/* ===== CHARTS ===== */
function buildAllCharts() {
  if (!window.Chart) return;
  if (!window._charts) window._charts = [];

  const txt    = isDark ? '#7fb3d3' : '#4a6580';
  const grid   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const blue   = isDark ? '#64B5F6' : '#1565C0';
  const red    = isDark ? '#EF9A9A' : '#c62828';
  const green  = isDark ? '#66BB6A' : '#1f7a3f';
  const orange = isDark ? '#FFCC80' : '#e65100';

  const days   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

  const baseOpts = (extra = {}) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: txt, font: { size: 10 } }, grid: { color: grid } },
      y: { ticks: { color: txt, font: { size: 10 } }, grid: { color: grid } }
    },
    ...extra
  });

  function tryChart(id, cfg) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const ex = Chart.getChart(el);
      if (ex) ex.destroy();
      window._charts.push(new Chart(el, cfg));
    } catch (e) {}
  }

  // Daily Usage Bar
  tryChart('usageChart', {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{ data: [1240, 980, 1450, 1100, 1380, 1600, 890], backgroundColor: blue, borderRadius: 5 }]
    },
    options: baseOpts()
  });

  // Leakage Trend Line
  tryChart('leakChart', {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        data: [3, 5, 4, 7, 6, 4, 7],
        borderColor: red,
        backgroundColor: isDark ? 'rgba(239,154,154,0.09)' : 'rgba(198,40,40,0.07)',
        fill: true, tension: 0.45, pointRadius: 4, pointBackgroundColor: red
      }]
    },
    options: baseOpts()
  });

  // Pressure Real Time
  tryChart('pressChart', {
    type: 'line',
    data: {
      labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
      datasets: [
        { label: 'Ward 1', data: [50, 52, 51, 53, 52, 50, 52, 52], borderColor: blue, tension: 0.4, pointRadius: 3 },
        { label: 'Ward 3', data: [45, 30, 10, 0, 0, 5, 8, 12], borderColor: red, tension: 0.4, pointRadius: 3 }
      ]
    },
    options: baseOpts({ plugins: { legend: { display: true, labels: { color: txt, font: { size: 10 }, boxWidth: 10 } } } })
  });

  // Purity 7-Day
  tryChart('purityChart', {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        { label: 'pH', data: [7.1, 7.2, 7.0, 7.3, 7.2, 7.1, 7.2], borderColor: blue, tension: 0.4, pointRadius: 3 },
        { label: 'TDS/100', data: [3.1, 3.2, 3.0, 3.1, 3.3, 3.2, 3.1], borderColor: green, tension: 0.4, pointRadius: 3 }
      ]
    },
    options: baseOpts({ plugins: { legend: { display: true, labels: { color: txt, font: { size: 10 }, boxWidth: 10 } } } })
  });

  // Monthly Leakage vs Theft
  tryChart('monthChart', {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Leakage', data: [4, 6, 5, 8, 7, 9, 6, 5, 4, 7, 8, 7], backgroundColor: red, borderRadius: 3 },
        { label: 'Theft',   data: [1, 2, 1, 3, 2, 4, 2, 1, 2, 3, 2, 3], backgroundColor: orange, borderRadius: 3 }
      ]
    },
    options: baseOpts({ plugins: { legend: { display: true, labels: { color: txt, font: { size: 10 }, boxWidth: 10 } } } })
  });

  // Conservation Doughnut
  tryChart('consChart', {
    type: 'doughnut',
    data: {
      labels: ['Saved', 'Leaked', 'Theft Loss'],
      datasets: [{ data: [74, 18, 8], backgroundColor: [green, red, orange], borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '63%',
      plugins: { legend: { position: 'bottom', labels: { color: txt, font: { size: 10 }, boxWidth: 10 } } }
    }
  });

  initFlowChart(); // Custom flow chart (not Chart.js)
}

/* ===== INIT ===== */
setTimeout(buildAllCharts, 300);

// Live leakage counter
let cnt = 0;
setInterval(() => {
  cnt++;
  const el = document.getElementById('stat-leakage');
  if (el && cnt % 7 === 0) el.textContent = 6 + Math.floor(Math.random() * 4);
}, 3000);

// Simulate real-time pressure changes
/* ===== FLOW SENSOR REALTIME CHART ===== */
let flowChart;
const FLOW_MAX_POINTS = 20;
const flowLabels = [];
const flowData1  = [];
const flowData2  = [];

function getFlowStatus(val) {
  if (val >= 25) return 'high';
  if (val < 10)  return 'low';
  return 'normal';
}

function getFlowStatusLabel(val) {
  if (val >= 25) return 'High';
  if (val < 10)  return 'Low';
  return 'Normal';
}

function updateFlowSensorUI(rate1, rate2) {
  // Rate text
  document.getElementById('flowRate1').textContent = rate1.toFixed(1) + ' L/min';
  document.getElementById('flowRate2').textContent = rate2.toFixed(1) + ' L/min';

  // Badges
  ['1','2'].forEach(n => {
    const val    = n === '1' ? rate1 : rate2;
    const badge  = document.getElementById('flowBadge' + n);
    const status = getFlowStatus(val);
    badge.textContent = getFlowStatusLabel(val);
    badge.className   = 'flow-status-badge ' + status;
  });
}

function initFlowChart() {

  if(flowChart)
{
  flowChart.destroy();
}
  const ctx = document.getElementById('flowChart');
  if (!ctx) return;

  // Pre-fill with 20 empty points
  const now = new Date();
  for (let i = FLOW_MAX_POINTS; i >= 0; i--) {
    const t = new Date(now - i * 2000);
    flowLabels.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    flowData1.push(null);
    flowData2.push(null);
  }

  const isDark = document.body.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#7fb3d3' : '#4a6580';

  flowChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: flowLabels,
      datasets: [
        {
          label: 'Input Flow',
          data: flowData1,
          borderColor: 'var(--blue, #1565C0)',
          backgroundColor: 'rgba(21,101,192,0.08)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.45,
          fill: true,
          spanGaps: false
        },
        {
          label: 'Output Flow',
          data: flowData2,
          borderColor: 'var(--green, #1f7a3f)',
          backgroundColor: 'rgba(31,122,63,0.07)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.45,
          fill: true,
          spanGaps: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300, easing: 'easeInOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          labels: { color: textColor, font: { size: 11 }, boxWidth: 12, padding: 14 }
        },
        tooltip: {
          backgroundColor: isDark ? '#0c1e35' : '#fff',
          titleColor: textColor,
          bodyColor: isDark ? '#e2f0fd' : '#0d2137',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: ctx => ' ' + ctx.dataset.label + ': ' + (ctx.parsed.y != null ? ctx.parsed.y.toFixed(1) + ' L/min' : '--')
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 10 }, maxTicksLimit: 6, maxRotation: 0 },
          grid: { color: gridColor }
        },
        y: {
          min: 0,
          max: 50,
          ticks: { color: textColor, font: { size: 10 }, stepSize: 10,
                   callback: v => v + ' L/m' },
          grid: { color: gridColor }
        }
      }
    }
  });

  // Start live updates
 // setInterval(tickFlowSensor, 2000);
}


// =====================================================
// FIREBASE LIVE FLOW SYSTEM
// =====================================================

let lastFirebaseUpdate = Date.now();

db.ref("system").on("value", (snapshot) => {

  const data = snapshot.val();

  if (!data) return;

  lastFirebaseUpdate = Date.now();

  // ---------------- FLOW VALUES ----------------
  const f1 = Number(data.flow1 || 0);
  const f2 = Number(data.flow2 || 0);

  // Update UI
  updateFlowSensorUI(f1, f2);

  // ---------------- CHART UPDATE ----------------
  if(flowChart)
  {
    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Slide graph
    if(flowLabels.length >= FLOW_MAX_POINTS)
    {
      flowLabels.shift();
      flowData1.shift();
      flowData2.shift();
    }

    flowLabels.push(now);
    flowData1.push(f1);
    flowData2.push(f2);

    flowChart.update('none');
  }

  // ---------------- PUMP STATUS ----------------
  const pump = data.pump || false;

  document.getElementById("supplyToggle").checked = pump;

  const pumpText =
    document.getElementById("pumpStatusText");

  pumpText.textContent = pump ? "ON" : "OFF";

  pumpText.className =
    "supply-status-text " + (pump ? "on" : "off");


  // ---------------- BUZZER STATUS ----------------
  const buzzer = data.buzzer || false;

  document.getElementById("buzzerToggle").checked = buzzer;

  const buzzerText =
    document.getElementById("buzzerStatusText");

  buzzerText.textContent = buzzer ? "ON" : "OFF";

  buzzerText.className =
    "supply-status-text " + (buzzer ? "on" : "off");


  // ---------------- LEAK STATUS ----------------
  const leak = data.leak || false;

  const leakStatus =
    document.getElementById("buzzerstatus");

  if(leak)
  {
    leakStatus.textContent = "⚠️ LEAK DETECTED";

    leakStatus.className = "hc-change warn";
  }
  else
  {
    leakStatus.textContent = "✅ SAFE";

    leakStatus.className = "hc-change";
  }

});

// =====================================================
// DUMMY DATA WHEN ESP32 OFF
// =====================================================

setInterval(() => {

  const now = Date.now();

  // If no Firebase update for 8 sec
  if(now - lastFirebaseUpdate > 8000)
  {
    const r1 = +(Math.random() * 10 + 20).toFixed(1);
    const r2 = +(Math.random() * 20 + 10).toFixed(1);

    updateFlowSensorUI(r1, r2);

    // Update chart
    if(flowChart)
    {
      const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      if(flowLabels.length >= FLOW_MAX_POINTS)
      {
        flowLabels.shift();
        flowData1.shift();
        flowData2.shift();
      }

      flowLabels.push(time);
      flowData1.push(r1);
      flowData2.push(r2);

      flowChart.update('none');
    }

    console.log("ESP32 OFF → Dummy data mode");
  }

}, 2000);


//notification 
firebase.database()
.ref("users/user1/leakage")
.on("value", (snapshot) => {

  const leakage = snapshot.val();

  console.log(leakage);

  if(leakage){

    alert("Water leakage detected!");

    new Notification(
      "Water Leakage Alert",
      {

        body: "Water leakage detected!"

      }
    );

  }

});