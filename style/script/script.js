/* ================================================
   ĐỌC THÔNG TIN TỪ information.js
   ================================================ */
// INFO được load từ information.js trước script này

/* Điền nội dung vào DOM */
(function populateInfo() {
  const pad2 = n => String(n).padStart(2, '0');

  document.getElementById('js-ten-nguoi').textContent = INFO.tenNguoi;

  if (INFO.gioiTinh === 'nam') document.body.classList.add('nam');

  const urlName = new URLSearchParams(window.location.search).get('name');
  if (urlName) {
    document.querySelector('.lbl-you').textContent = urlName.toUpperCase();
  }

  document.getElementById('js-event-datetime').innerHTML =
    `${pad2(INFO.ngay)}/${pad2(INFO.thang)}/${INFO.nam} &nbsp;|&nbsp; ${INFO.hienThiGio}`;

  document.getElementById('js-event-addr').innerHTML =
    `${INFO.diaChi1}<br>${INFO.diaChi2}`;

  document.getElementById('js-map-iframe').src  = INFO.mapEmbed;
  document.getElementById('js-map-link').href   = INFO.mapLink;
  document.getElementById('js-map-link').textContent = 'Xem Google Map';
})();

/* Alias để các hàm bên dưới dùng chung */
const EVENT = {
  year:   INFO.nam,
  month:  INFO.thang,
  day:    INFO.ngay,
  hour:   INFO.gio,
  minute: INFO.phut,
};

/* ================================================
   HOA RƠI NỀN
   ================================================ */
(function initPetals() {
  const container = document.getElementById('flowersContainer');
  const symbols   = ['✿', '❀', '✾', '❁', '⁕'];
  const colors    = ['#c9a84c','#e8d5a3','#d4a06a','#e8c96a','#f0dca0'];

  function spawn() {
    const el = document.createElement('span');
    el.className  = 'petal';
    el.textContent = symbols[Math.random() * symbols.length | 0];
    el.style.left             = Math.random() * 100 + 'vw';
    el.style.fontSize         = (10 + Math.random() * 12) + 'px';
    el.style.color            = colors[Math.random() * colors.length | 0];
    const dur                 = 10 + Math.random() * 14;
    el.style.animationDuration  = dur + 's';
    el.style.animationDelay     = '0s';
    container.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000 + 200);
  }

  for (let i = 0; i < 8; i++) setTimeout(spawn, i * 800);
  setInterval(spawn, 2200);
})();

/* ================================================
   LỊCH THÁNG
   ================================================ */
(function renderCalendar() {
  const { year, month, day } = EVENT;

  const DAY_NAMES = ['T2','T3','T4','T5','T6','T7','CN']; // Mon-first
  const daysInMonth = new Date(year, month, 0).getDate();

  // JS getDay(): 0=Sun … 6=Sat → đổi sang Mon-first offset
  const firstDow  = new Date(year, month - 1, 1).getDay(); // Sun=0
  const startOffset = (firstDow + 6) % 7; // Mon=0

  const monthStr = `THÁNG ${String(month).padStart(2, '0')}`;

  let cells = '';

  // Ô rỗng đầu tháng
  for (let i = 0; i < startOffset; i++) {
    cells += '<div class="cal-cell empty">·</div>';
  }

  // Các ngày
  for (let d = 1; d <= daysInMonth; d++) {
    if (d === day) {
      const genderClass = INFO.gioiTinh === 'nam' ? ' nam' : '';
      cells += `<div class="cal-cell today${genderClass}"><span class="today-num">${d}</span></div>`;
    } else {
      cells += `<div class="cal-cell">${d}</div>`;
    }
  }

  document.getElementById('calendar').innerHTML = `
    <div class="cal-header">${monthStr} &nbsp;&nbsp;&nbsp; ${year}</div>
    <div class="cal-daynames">
      ${DAY_NAMES.map(n => `<div class="cal-dn">${n}</div>`).join('')}
    </div>
    <div class="cal-dates">${cells}</div>
  `;
})();

/* ================================================
   COUNTDOWN
   ================================================ */
(function initCountdown() {
  const target = new Date(
    EVENT.year, EVENT.month - 1, EVENT.day,
    EVENT.hour, EVENT.minute, 0
  );

  const elD = document.getElementById('cd-days');
  const elH = document.getElementById('cd-hours');
  const elM = document.getElementById('cd-mins');
  const elS = document.getElementById('cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      elD.textContent = elH.textContent = elM.textContent = elS.textContent = '00';
      return;
    }
    const totalSec = Math.floor(diff / 1000);
    elD.textContent = pad(Math.floor(totalSec / 86400));
    elH.textContent = pad(Math.floor((totalSec % 86400) / 3600));
    elM.textContent = pad(Math.floor((totalSec % 3600) / 60));
    elS.textContent = pad(totalSec % 60);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ================================================
   RSVP + LỜI CHÚC (Google Sheets)
   ================================================ */

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function renderWishes(wishes) {
  const box = document.getElementById('wishesBox');
  if (!wishes || !wishes.length) {
    box.innerHTML = '<p class="wishes-empty">Chưa có lời chúc nào – hãy là người đầu tiên</p>';
    return;
  }
  box.innerHTML = wishes.map(w => `
    <div class="wish-card">
      <p class="wish-msg"> ${escHtml(w.wish || '(Không có lời nhắn)')}</p>
      <p class="wish-who">– ${escHtml(w.name)} –</p>
    </div>
  `).join('');
}

/* ---- JSONP: dùng để ĐỌC danh sách lời chúc ---- */
function jsonpFetch(url, onSuccess) {
  const cbName = '_cb_' + Date.now();
  const script = document.createElement('script');
  const sep    = url.includes('?') ? '&' : '?';

  // Timeout 8 giây phòng script không chạy được
  const timer = setTimeout(function () {
    delete window[cbName];
    script.remove();
  }, 8000);

  window[cbName] = function (data) {
    clearTimeout(timer);
    delete window[cbName];
    script.remove();
    onSuccess(data);
  };

  script.src = url + sep + 'callback=' + cbName;
  document.head.appendChild(script);
}

function fetchWishes() {
  const url = INFO.sheetApiUrl;
  if (!url) return;
  jsonpFetch(url, function (data) {
    renderWishes(Array.isArray(data) ? data : []);
  });
}

(function initRsvp() {
  fetchWishes();

  document.getElementById('rsvpForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('f-name').value.trim();
    const wish = document.getElementById('f-wish').value.trim();

    if (!name) {
      alert('Vui lòng điền tên của bạn nhé!');
      return;
    }

    const url = INFO.sheetApiUrl;
    if (!url) {
      alert('Chưa cài đặt Google Sheets API. Xem hướng dẫn trong google-apps-script.js');
      return;
    }

    const btn  = this.querySelector('button[type="submit"]');
    const form = this;
    btn.disabled    = true;
    btn.textContent = 'Đang gửi...';

    const apiUrl = url
      + '?action=add'
      + '&name=' + encodeURIComponent(name)
      + '&wish=' + encodeURIComponent(wish);

    // mode:'no-cors' → browser gửi request bình thường đến server,
    // server ghi vào sheet, browser chỉ không đọc được response (không cần)
    fetch(apiUrl, { mode: 'no-cors' })
      .then(function () {
        form.reset();
        // Đợi 2 giây cho Apps Script kịp ghi vào sheet
        setTimeout(function () {
          fetchWishes();
          document.querySelector('.sec-wishes')
            .scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 2000);
      })
      .catch(function () {
        alert('Không thể kết nối. Kiểm tra lại sheetApiUrl trong information.js');
      })
      .finally(function () {
        btn.disabled    = false;
        btn.textContent = 'GỬI LỜI CHÚC';
      });
  });
})();

/* ================================================
   MUSIC PLAYER
   ================================================ */
(function initMusicPlayer() {
  const TRACKS = INFO.danhSachNhac || [];
  if (!TRACKS.length) return;

  let currentIndex = 0;

  const audio       = document.getElementById('bgAudio');
  const fabDisc     = document.getElementById('fabDisc');
  const modalDisc   = document.getElementById('modalDisc');
  const modalEl     = document.getElementById('musicModal');
  const fabBtn      = document.getElementById('musicFab');
  const closeBtn    = document.getElementById('modalClose');
  const btnPlay     = document.getElementById('btnPlay');
  const btnPrev     = document.getElementById('btnPrev');
  const btnNext     = document.getElementById('btnNext');
  const progressBar = document.getElementById('progressBar');
  const timeCur     = document.getElementById('timeCur');
  const timeTot     = document.getElementById('timeTot');
  const songTitle   = document.getElementById('modalSongTitle');

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  }

  function setSpinning(playing) {
    fabDisc.classList.toggle('disc-spin', playing);
    modalDisc.classList.toggle('disc-spin', playing);
    btnPlay.innerHTML = playing
      ? '<i class="fa-solid fa-pause"></i>'
      : '<i class="fa-solid fa-play"></i>';
  }

  function loadTrack(index, autoPlay) {
    const track = TRACKS[index];
    audio.src = track.src;
    audio.load();
    fabDisc.src   = track.disc;
    modalDisc.src = track.disc;
    songTitle.textContent = track.ten;
    progressBar.value = 0;
    timeCur.textContent = '0:00';
    timeTot.textContent = '0:00';
    if (autoPlay) audio.play();
  }

  loadTrack(0, false);

  audio.addEventListener('play',  () => setSpinning(true));
  audio.addEventListener('pause', () => setSpinning(false));
  audio.addEventListener('ended', () => {
    currentIndex = (currentIndex + 1) % TRACKS.length;
    loadTrack(currentIndex, true);
  });

  audio.addEventListener('loadedmetadata', () => {
    progressBar.max = audio.duration || 100;
    timeTot.textContent = fmtTime(audio.duration || 0);
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progressBar.max   = audio.duration;
    progressBar.value = audio.currentTime;
    timeCur.textContent = fmtTime(audio.currentTime);
    timeTot.textContent = fmtTime(audio.duration);
  });

  progressBar.addEventListener('input', () => {
    audio.currentTime = parseFloat(progressBar.value);
  });

  fabBtn.addEventListener('click', () => modalEl.classList.add('open'));
  closeBtn.addEventListener('click', () => modalEl.classList.remove('open'));
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) modalEl.classList.remove('open');
  });

  btnPlay.addEventListener('click', () => {
    if (audio.paused) audio.play();
    else audio.pause();
  });

  btnPrev.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + TRACKS.length) % TRACKS.length;
    loadTrack(currentIndex, !audio.paused);
  });

  btnNext.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % TRACKS.length;
    loadTrack(currentIndex, !audio.paused);
  });

  // Tự phát khi người dùng chạm / click / cuộn lần đầu
  let started = false;
  function tryAutoPlay() {
    if (started) return;
    started = true;
    audio.play().then(function () {
      document.removeEventListener('touchstart', tryAutoPlay);
      document.removeEventListener('touchend',   tryAutoPlay);
      document.removeEventListener('click',      tryAutoPlay);
      document.removeEventListener('scroll',     tryAutoPlay);
      document.removeEventListener('keydown',    tryAutoPlay);
    }).catch(function () {
      started = false;
    });
  }
  document.addEventListener('touchstart', tryAutoPlay, { passive: true });
  document.addEventListener('touchend',   tryAutoPlay, { passive: true });
  document.addEventListener('click',      tryAutoPlay);
  document.addEventListener('scroll',     tryAutoPlay, { passive: true });
  document.addEventListener('keydown',    tryAutoPlay);
})();

/* ================================================
   SCROLL FADE-UP
   ================================================ */
(function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach(el => observer.observe(el));
})();
