/* ============================================================
   ASTA CONFIG — ubah sesuai kebutuhan
   ============================================================ */
const ASTA_CONFIG = {
  TABLE: 'members',
  GROUP_LINK: 'https://whatsapp.com/channel/0029VbCN9yLEwEjsv7W8W61G', // Ganti dengan link grup WhatsApp/Telegram
};

/* ============================================================
   SUPABASE — aktifkan jika sudah ada
   ============================================================ */
let sb = null;
// const sb = supabase.createClient('YOUR_URL', 'YOUR_ANON_KEY');

/* ============================================================
   GENERATE ID ANGGOTA — acak & unik
   ============================================================ */
function generateMemberId() {
  const tahun = new Date().getFullYear();
  // Gabungkan timestamp + random agar tidak tabrakan
  const ts   = Date.now().toString(36).toUpperCase();            // base-36 timestamp
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 char acak
  return `ASTA-${tahun}-${ts}${rand}`;
}

/* ============================================================
   STAR CANVAS
   ============================================================ */
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');
  let stars    = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        da: (Math.random() - 0.5) * 0.008,
        color: Math.random() > 0.85
          ? (Math.random() > 0.5 ? '#7efeff' : '#7b2fff')
          : '#ffffff'
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a = Math.max(0.05, Math.min(0.9, s.a + s.da));
      if (s.a >= 0.9 || s.a <= 0.05) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle  = s.color;
      ctx.globalAlpha = s.a;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  createStars();
  draw();
  window.addEventListener('resize', () => { resize(); createStars(); });
})();

/* ============================================================
   NAVBAR
   ============================================================ */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   SCROLL DOT ANIMATION
   ============================================================ */
(function animateScrollDot() {
  const dot = document.querySelector('.scroll-dot');
  if (!dot) return;
  let up = false;
  setInterval(() => {
    dot.setAttribute('cy', up ? '8' : '18');
    dot.style.opacity = up ? '0.6' : '0.2';
    up = !up;
  }, 1000);
})();

/* ============================================================
   ANIMATE COUNT
   ============================================================ */
function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 1200;
  const start    = Date.now();
  function update() {
    const progress = Math.min((Date.now() - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  update();
}

/* ============================================================
   MEMBER COUNT (Supabase optional)
   ============================================================ */
async function loadMemberCount() {
  if (!sb) { animateCount('memberCount', 247); return; }
  try {
    const { count, error } = await sb.from(ASTA_CONFIG.TABLE).select('*', { count: 'exact', head: true });
    if (error) throw error;
    animateCount('memberCount', count ?? 0);
  } catch {
    document.getElementById('memberCount').textContent = '247';
  }
}

loadMemberCount();

/* ============================================================
   FOOTER YEAR
   ============================================================ */
document.getElementById('footerYear').textContent = new Date().getFullYear();

/* ============================================================
   FORM MODAL
   ============================================================ */
const formOverlay = document.getElementById('formOverlay');
const formCloseBtn = document.getElementById('formCloseBtn');

function openFormModal() {
  formOverlay.classList.remove('hidden');
  formOverlay.classList.add('entering');
  document.body.style.overflow = 'hidden';
  setTimeout(() => formOverlay.classList.remove('entering'), 400);
}

function closeFormModal() {
  formOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

document.querySelectorAll('.open-form-btn').forEach(btn => {
  btn.addEventListener('click', openFormModal);
});

document.getElementById('navDaftar').addEventListener('click', openFormModal);
document.getElementById('navDaftar').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') openFormModal();
});

formCloseBtn.addEventListener('click', closeFormModal);

formOverlay.addEventListener('click', e => {
  if (e.target === formOverlay) closeFormModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeFormModal();
    closeCardOverlay();
  }
});

/* ============================================================
   VALIDATION
   ============================================================ */
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
  const input = document.getElementById(id.replace('Error', ''));
  if (input) input.classList.add('error');
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
  const input = document.getElementById(id.replace('Error', ''));
  if (input) input.classList.remove('error');
}

['nama','usia','gender','email','whatsapp'].forEach(field => {
  const input = document.getElementById(field);
  if (input) input.addEventListener('input', () => clearError(field + 'Error'));
});

function validateForm(data) {
  let valid = true;

  if (!data.nama.trim()) { showError('namaError', 'Nama wajib diisi'); valid = false; }
  else clearError('namaError');

  const usiaNum = parseInt(data.usia);
  if (!data.usia || isNaN(usiaNum) || usiaNum < 10) { showError('usiaError', 'Usia minimal 10 tahun'); valid = false; }
  else clearError('usiaError');

  if (!data.gender) { showError('genderError', 'Pilih gender'); valid = false; }
  else clearError('genderError');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(data.email)) { showError('emailError', 'Email tidak valid'); valid = false; }
  else clearError('emailError');

  const waRe = /^[0-9]{8,15}$/;
  if (!waRe.test(data.whatsapp.replace(/[\s+-]/g, ''))) { showError('whatsappError', 'Nomor WhatsApp tidak valid (angka saja)'); valid = false; }
  else clearError('whatsappError');

  return valid;
}

/* ============================================================
   FORM SUBMIT
   ============================================================ */
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const data = {
    nama:      document.getElementById('nama').value.trim(),
    usia:      document.getElementById('usia').value.trim(),
    gender:    document.getElementById('gender').value,
    email:     document.getElementById('email').value.trim(),
    whatsapp:  document.getElementById('whatsapp').value.trim(),
  };

  if (!validateForm(data)) return;

  const submitBtn = this.querySelector('.btn-submit');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="btn-glow"></span>Memproses...';

  // Generate ID anggota — acak & unik (timestamp + random)
  const memberId = generateMemberId();
  const tanggal  = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  // Simpan ke Supabase jika ada
  if (sb) {
    try {
      await sb.from(ASTA_CONFIG.TABLE).insert([{
        registration_id: memberId,
        nama:            data.nama,
        usia:            parseInt(data.usia),
        gender:          data.gender,
        email:           data.email,
        whatsapp:        data.whatsapp,
        created_at:      new Date().toISOString(),
      }]);
    } catch (err) {
      console.warn('Supabase insert error (non-fatal):', err);
    }
  }

  // Isi data card
  document.getElementById('cardId').textContent     = memberId;
  document.getElementById('cardName').textContent   = data.nama;
  document.getElementById('cardAge').textContent    = data.usia + ' tahun';
  document.getElementById('cardGender').textContent = data.gender;
  document.getElementById('cardDate').textContent   = tanggal;

  // Set link grup
  document.getElementById('grupBtn').href = ASTA_CONFIG.GROUP_LINK;

  // Tutup form, buka card
  closeFormModal();
  openCardOverlay();
  showToast();

  // Reset form
  this.reset();
  ['nama','usia','gender','email','whatsapp'].forEach(f => clearError(f + 'Error'));
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<span class="btn-glow"></span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Daftar Sekarang';
});

/* ============================================================
   CARD OVERLAY
   ============================================================ */
const cardOverlay = document.getElementById('cardOverlay');

function openCardOverlay() {
  cardOverlay.classList.remove('hidden');
  cardOverlay.classList.add('entering');
  // Jangan block body scroll — overlay sendiri yang scroll
  setTimeout(() => cardOverlay.classList.remove('entering'), 400);
  // Scroll ke atas agar tombol langsung kelihatan
  cardOverlay.scrollTop = 0;
}

function closeCardOverlay() {
  cardOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('cardCloseBtn').addEventListener('click', closeCardOverlay);

// Klik backdrop (bukan konten modal) untuk tutup
cardOverlay.addEventListener('click', e => {
  if (e.target === cardOverlay || e.target.classList.contains('card-modal-scroll')) {
    closeCardOverlay();
  }
});

/* ============================================================
   DOWNLOAD CARD — render ke canvas offline (tanpa Google Fonts)
   Strategi: clone node, inject inline styles, baru html2canvas
   ============================================================ */
document.getElementById('downloadBtn').addEventListener('click', async () => {
  const card   = document.getElementById('memberCard');
  const cardId = document.getElementById('cardId').textContent;
  const btn    = document.getElementById('downloadBtn');

  btn.disabled    = true;
  btn.textContent = 'Memproses...';

  try {
    /* ── Clone card dan inject gaya statis agar html2canvas tidak bergantung
          pada CSS variables / Google Fonts yang sering gagal di-capture ── */
    const clone = card.cloneNode(true);

    // Wrapper render — tidak terlihat di layar
    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
      'position:fixed',
      'left:-9999px',
      'top:0',
      'width:440px',
      'padding:0',
      'background:transparent',
      'z-index:-1',
    ].join(';');
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Terapkan semua gaya inline supaya html2canvas bisa capture dengan benar
    applyInlineStyles(clone);

    const canvas = await html2canvas(clone, {
      backgroundColor: null,
      scale:           2,
      useCORS:         true,
      logging:         false,
      allowTaint:      true,
      width:           440,
      windowWidth:     440,
    });

    document.body.removeChild(wrapper);

    const link    = document.createElement('a');
    link.download = `${cardId}.png`;
    link.href     = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Download error:', err);
    alert('Gagal mengunduh kartu. Coba lagi.');
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v8M4 7l3.5 3.5L11 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13h11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg> Download Kartu';
  }
});

/**
 * Inject inline styles ke node card sehingga html2canvas
 * tidak perlu resolve CSS variables / external font.
 */
function applyInlineStyles(card) {
  // Warna & font statis (tidak pakai var())
  const PURPLE = '#7b2fff';
  const BLUE   = '#00b4d8';
  const CYAN   = '#7efeff';
  const GREEN  = '#00ff88';
  const WHITE  = '#f0f4ff';
  const MUTED  = 'rgba(240,244,255,0.5)';
  const MONO   = '"Courier New", Courier, monospace';
  const DISPLAY = 'Arial Black, Arial, sans-serif';

  // Root card
  Object.assign(card.style, {
    position:   'relative',
    background: 'linear-gradient(135deg, #0d0d2a 0%, #12083a 50%, #071820 100%)',
    border:     '1px solid rgba(123,47,255,0.4)',
    borderRadius: '24px',
    padding:    '1.75rem',
    overflow:   'hidden',
    boxShadow:  '0 0 40px rgba(123,47,255,0.25)',
    width:      '440px',
    boxSizing:  'border-box',
    fontFamily: '"Segoe UI", Arial, sans-serif',
    color:      WHITE,
  });

  // card-header
  const header = card.querySelector('.card-header');
  if (header) Object.assign(header.style, { display:'flex', alignItems:'center', gap:'0.85rem', marginBottom:'1rem', position:'relative', zIndex:'1' });

  // card-org
  const org = card.querySelector('.card-org');
  if (org) Object.assign(org.style, {
    fontFamily:  DISPLAY,
    fontSize:    '1.4rem',
    fontWeight:  '900',
    letterSpacing:'0.1em',
    lineHeight:  '1',
    color:       CYAN,
    background:  'none',
    WebkitTextFillColor: CYAN,
  });

  // card-org-full
  const orgFull = card.querySelector('.card-org-full');
  if (orgFull) Object.assign(orgFull.style, { fontSize:'0.68rem', color:MUTED, fontFamily:MONO, marginTop:'0.2rem' });

  // card-divider
  const divider = card.querySelector('.card-divider');
  if (divider) Object.assign(divider.style, {
    height:'1px',
    background:'linear-gradient(90deg, transparent, rgba(123,47,255,0.5), rgba(0,180,216,0.5), transparent)',
    margin:'0.25rem 0 1rem',
    position:'relative',
    zIndex:'1',
  });

  // card-id-row
  const idRow = card.querySelector('.card-id-row');
  if (idRow) Object.assign(idRow.style, { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', position:'relative', zIndex:'1' });

  const idLabel = card.querySelector('.card-id-label');
  if (idLabel) Object.assign(idLabel.style, { fontSize:'0.7rem', color:MUTED, fontFamily:MONO, textTransform:'uppercase', letterSpacing:'0.1em' });

  const idValue = card.querySelector('.card-id-value');
  if (idValue) Object.assign(idValue.style, { fontFamily:MONO, fontSize:'0.9rem', fontWeight:'600', color:CYAN, letterSpacing:'0.08em' });

  // card-info-grid
  const infoGrid = card.querySelector('.card-info-grid');
  if (infoGrid) Object.assign(infoGrid.style, {
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:'0.75rem',
    marginBottom:'1rem',
    position:'relative',
    zIndex:'1',
  });

  card.querySelectorAll('.card-info-item').forEach(item => {
    Object.assign(item.style, {
      background:   'rgba(255,255,255,0.04)',
      border:       '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding:      '0.65rem 0.85rem',
    });
  });

  card.querySelectorAll('.card-info-label').forEach(el => {
    Object.assign(el.style, { display:'block', fontSize:'0.65rem', color:MUTED, fontFamily:MONO, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.2rem' });
  });

  card.querySelectorAll('.card-info-value').forEach(el => {
    Object.assign(el.style, { display:'block', fontSize:'0.88rem', fontWeight:'600', color:WHITE });
  });

  // card-status
  const status = card.querySelector('.card-status');
  if (status) Object.assign(status.style, {
    display:'inline-flex', alignItems:'center', gap:'0.45rem',
    padding:'0.35rem 0.85rem',
    background:'rgba(0,255,136,0.07)',
    border:'1px solid rgba(0,255,136,0.25)',
    borderRadius:'50px',
    fontSize:'0.75rem', fontFamily:MONO, color:GREEN,
    position:'relative', zIndex:'1', marginBottom:'1.25rem',
  });

  const pulseDot = card.querySelector('.pulse-dot');
  if (pulseDot) Object.assign(pulseDot.style, { width:'6px', height:'6px', borderRadius:'50%', background:GREEN, display:'inline-block' });

  // card-footer-bar
  const footerBar = card.querySelector('.card-footer-bar');
  if (footerBar) Object.assign(footerBar.style, {
    height:'3px',
    background:`linear-gradient(90deg, ${PURPLE}, ${BLUE}, ${CYAN})`,
    borderRadius:'2px',
    position:'relative', zIndex:'1',
  });

  // card-stars — sembunyikan agar tidak mengganggu (transparent di canvas)
  const stars = card.querySelector('.card-stars');
  if (stars) stars.style.display = 'none';

  // card-planet
  const planet = card.querySelector('.card-planet');
  if (planet) Object.assign(planet.style, { width:'56px', height:'56px', flexShrink:'0' });
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

/* ============================================================
   COMMON INIT (jika ada fungsi global)
   ============================================================ */
if (typeof initCommon === 'function') initCommon(220);
