/* Front door sample: screens. Data comes from backend.js (window.API), which is pretend.
   Every text is written twice, L('Korean', 'English'); the switch in the yellow bar picks one (saved in this browser). */
(function () {
  const $app = document.getElementById('app');  const $modal = document.getElementById('modal');
  const $toast = document.getElementById('toast');
  const P = API.PRODUCTS;
  const prod = id => P.find(p => p.id === id);
  const won = n => '₩' + n.toLocaleString('ko-KR');
  const face = f => `assets/faces/face-${f}.webp`;
  const art = id => ({ library: 'gb', math: 'math', phonics: 'phonics' })[id];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const artBox = (id, cls = 'art') => `<div class="${cls} ${art(id)}">${id === 'phonics' ? '<span>A b c</span>' : ''}</div>`;
  let parentOk = false;
  try { parentOk = sessionStorage.getItem('gpdemo.parentOk') === '1'; } catch (e) {}

  /* ---------- Language ---------- */
  let lang = 'ko';
  try { lang = localStorage.getItem('gpdemo.lang') || 'ko'; } catch (e) {}
  const L = (ko, en) => lang === 'en' ? en : ko;
  const unit = p => L(p.unit, p.unitEn);
  // Words that come from the sample data (statuses, payment methods, receipts). Names of people and schools stay as they are.
  const DATA_EN = {
    '2주 전': '2 weeks ago', '오늘': 'Today', '어제': 'Yesterday', '3일 전': '3 days ago',
    '사용 중': 'Active', '초대 보냄': 'Invite sent', '입금 완료': 'Paid', '입금 전': 'Not paid', '이용 중': 'Active',
    '견적 보냄': 'Quote sent', '무료 체험 (3/31까지)': 'Free trial (until 31 Mar)', '세금계산서 발행': 'Tax invoice issued',
    '카카오페이': 'Kakao Pay', '네이버페이': 'Naver Pay', '굿즈 10% 할인': '10% off goods', '(미정)': '(none)', 'GP 운영자': 'GP staff',
    '하준 · Fresh Math 3월 숲 수료증': '하준 · Fresh Math March forest certificate',
    '해바라기 영어유치원 원생 명단 열람': 'Opened 해바라기 영어유치원 student list', '3월 명단 등록 도움': 'Help loading the March list',
    '기관 명단 등록 도움': 'Help loading a school list', '부모님 문의 응대': 'Answering a parent', '결제·환불 처리': 'Payment or refund', '오류 확인': 'Checking an error',
    '3개 상품 · 50명 · 1년 (예시 단가 ₩180,000/명·상품)': '3 products · 50 children · 1 year (example ₩180,000 per child per product)',
    '해바라기 영어유치원 · 서연': '해바라기 영어유치원 · 서연'
  };
  const dv = s => {
    if (lang !== 'en' || s == null) return s;
    if (DATA_EN[s]) return DATA_EN[s];
    return String(s).replace('신용카드', 'Card').replace(' 첫 달', ' first month').replace(/ 3월$/, ' March');
  };
  function paintBar() {
    document.getElementById('sampleNote').innerHTML = L('<b>샘플 화면</b> · 실제 계정·결제 없음', '<b>Sample only</b> · no real accounts or payments');
    document.getElementById('resetDemo').textContent = L('처음 상태로', 'Reset demo');
    document.querySelectorAll('[data-lang]').forEach(b => { b.classList.toggle('on', b.dataset.lang === lang); b.setAttribute('aria-pressed', b.dataset.lang === lang); });
    document.documentElement.lang = lang;
  }
  document.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => {
    lang = b.dataset.lang; try { localStorage.setItem('gpdemo.lang', lang); } catch (e) {}
    paintBar(); render(true);
  });

  function toast(msg) { $toast.textContent = msg; $toast.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => $toast.hidden = true, 2600); }
  function modal(html) { $modal.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`; $modal.hidden = false; }
  function closeModal() { $modal.hidden = true; $modal.innerHTML = ''; }
  $modal.addEventListener('click', e => { if (e.target === $modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$modal.hidden) closeModal(); });
  document.getElementById('resetDemo').onclick = () => { API.reset(); parentOk = false; shown.clear(); try { sessionStorage.removeItem('gpdemo.parentOk'); localStorage.removeItem('gpdemo.tabletClass'); } catch (e) {} Object.assign(kidState, { code: '', cls: null, kid: null, tries: [] }); toast(L('샘플을 처음 상태로 되돌렸어요', 'The sample is back to the start')); location.hash = '#/'; render(); };

  const topbar = (right) => `
    <header class="top"><div class="wrap">
      <a class="logo" href="#/"><span class="dots"><b style="background:var(--gb-2)"></b><b style="background:var(--math)"></b><b style="background:var(--phonics)"></b><b style="background:var(--pbl)"></b></span>GPEIS</a>
      <nav>${right}</nav>
    </div></header>`;
  const ROLE_HOME = { parent: '#/family', teacher: '#/teacher', admin: '#/admin', staff: '#/staff', counselor: '#/counselor' };
  const authNav = () => {
    const s = API.session();
    const here = (location.hash.slice(2).split(/[/?]/)[0]) || '';
    const tab = (to, ko, en) => `<a class="tab ${here === to ? 'on' : ''}" href="#/${to}">${L(ko, en)}</a>`;
    const tabs = `<div class="tabs">${tab('about', 'GPEIS 소개', 'About')}${tab('programs', '프로그램', 'Programs')}${tab('books', '책', 'Books')}${tab('activities', '활동', 'Activities')}</div>`;
    const ask = `<a class="btn util ask" href="#/consult"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="currentColor"/></svg>${L('교육센터 상담', 'Ask an education centre')}</a>`;
    if (!s) return tabs + `<div class="utils">${ask}<a class="util-link" href="#/school-login">${L('기관 로그인', 'School log-in')}</a><a class="btn primary" href="#/login">${L('로그인 / 가입', 'Log in / Sign up')}</a></div>`;
    const name = { parent: L('우리 가족', 'My family'), teacher: L('선생님 화면', 'Teacher'), admin: L('기관 관리', 'School admin'), staff: L('GP 운영', 'GP staff'), counselor: L('상담 선생님', 'Counsellor') }[s.role];
    return (s.role === 'parent' ? tabs : '') + `<div class="utils">${s.role === 'parent' ? ask : ''}<a class="btn" href="${ROLE_HOME[s.role]}">${name}</a><button class="util-link" data-logout>${L('로그아웃', 'Log out')}</button></div>`;
  };
  function bindCommon() {
    $app.querySelectorAll('[data-logout]').forEach(b => b.onclick = async () => { await API.logout(); parentOk = false; try { sessionStorage.removeItem('gpdemo.parentOk'); } catch (e) {} location.hash = '#/'; });
  }
  /* The turning GPEIS sticker used as a divider: it sits in the middle and gives the next band room to breathe */
  const divider = () => `<div class="divider" aria-hidden="true"><i></i>${badge()}<i></i></div>`;
  const notYet = () => toast(L('샘플에서는 아직 동작하지 않아요', 'Not working in the sample yet'));

  /* A slowly turning round sticker with the learning steps */
  const badge = () => `<div class="badge-spin" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="ring" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"/></defs>
    <g class="ring"><text textLength="446" lengthAdjust="spacing"><textPath href="#ring" textLength="446" lengthAdjust="spacing">READ · THINK · DISCOVER · LISTEN · SPEAK ·</textPath></text></g>
    <circle cx="100" cy="100" r="40" class="core"/><text x="100" y="106" text-anchor="middle" class="core-t">GPEIS</text></svg></div>`;

  /* Simple original pictures built from circles, triangles and blocks (used on product cards and worksheet previews) */
  const MOTIFS = {
    mountain: '<circle cx="152" cy="38" r="20" fill="var(--hl-y)"/><path d="M18 130 80 38l62 92z" fill="var(--ink)"/><path d="M92 130l44-58 48 58z" fill="var(--c-fm)"/><path d="M80 38 65 60l15-7 15 7z" fill="#fff"/>',
    cave: '<path d="M26 130V82a74 62 0 0 1 148 0v48z" fill="var(--ink)"/><path d="M68 130V98a32 30 0 0 1 64 0v32z" fill="var(--hl-y)"/><circle cx="100" cy="104" r="9" fill="#fff"/><circle cx="160" cy="30" r="8" fill="var(--c-pbl)"/>',
    globe: '<circle cx="96" cy="74" r="52" fill="var(--c-lgr)"/><path d="M44 74h104M96 22c-27 20-27 84 0 104M96 22c27 20 27 84 0 104" stroke="#fff" stroke-width="5" fill="none"/><path d="M152 14v52" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M154 18l28 13-28 13z" fill="var(--c-pbl)"/>',
    sound: '<circle cx="78" cy="78" r="40" fill="var(--c-pbl)"/><path d="M112 68l32 10-32 12z" fill="var(--hl-y)"/><circle cx="92" cy="64" r="6" fill="var(--ink)"/><path d="M154 50q14 28 0 56M172 38q22 40 0 80" stroke="var(--ink)" stroke-width="6" fill="none" stroke-linecap="round"/>',
    medal: '<path d="M68 8l32 54 32-54z" fill="var(--c-lgr)"/><circle cx="100" cy="88" r="42" fill="var(--hl-y)"/><path d="M100 62l8 16 18 3-13 12 3 18-16-9-16 9 3-18-13-12 18-3z" fill="#fff"/>',
    bee: '<path d="M36 62l24-14 24 14v28l-24 14-24-14z" fill="var(--hl-y)"/><path d="M84 90l24-14 24 14v28l-24 14-24-14z" fill="var(--hl-y)"/><path d="M84 34l24-14 24 14v28l-24 14-24-14z" fill="var(--ink)"/><ellipse cx="160" cy="54" rx="21" ry="15" fill="var(--hl-y)"/><path d="M154 40v28M166 40v28" stroke="var(--ink)" stroke-width="5"/><ellipse cx="156" cy="34" rx="10" ry="6" fill="#fff"/>',
    paw: '<ellipse cx="100" cy="94" rx="36" ry="29" fill="var(--ink)"/><circle cx="56" cy="60" r="14" fill="var(--ink)"/><circle cx="85" cy="36" r="14" fill="var(--ink)"/><circle cx="117" cy="36" r="14" fill="var(--ink)"/><circle cx="146" cy="60" r="14" fill="var(--ink)"/><circle cx="100" cy="96" r="11" fill="var(--hl-p)"/>',
    sprout: '<path d="M58 98h84l-11 36H69z" fill="var(--c-pbl)"/><path d="M100 98V52" stroke="var(--ink)" stroke-width="6"/><path d="M100 70c-36 4-46-18-44-36 24-4 44 8 44 36z" fill="var(--c-fm)"/><path d="M100 56c32 2 42-16 40-32-22-4-40 8-40 32z" fill="var(--c-fm)"/>',
    tangram: '<path d="M38 112l42-42 42 42z" fill="var(--c-lgr)"/><rect x="92" y="40" width="36" height="36" fill="var(--hl-y)"/><path d="M128 40l32-26v52z" fill="var(--c-pbl)"/><path d="M122 112l36-36v36z" fill="var(--c-ml)"/><path d="M38 112l-22-28h28z" fill="var(--c-fm)"/>',
    scale: '<path d="M100 30v92M58 126h84" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/><path d="M38 54l124-16" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/><path d="M18 58h42a21 21 0 0 1-42 0z" fill="var(--c-pbl)"/><path d="M140 42h42a21 21 0 0 1-42 0z" fill="var(--c-lgr)"/><circle cx="100" cy="30" r="9" fill="var(--hl-y)"/>',
    sort: '<rect x="14" y="36" width="52" height="68" rx="12" fill="#fff"/><circle cx="40" cy="70" r="16" fill="var(--c-pbl)"/><rect x="74" y="36" width="52" height="68" rx="12" fill="#fff"/><path d="M100 52l18 32H82z" fill="var(--c-lgr)"/><rect x="134" y="36" width="52" height="68" rx="12" fill="#fff"/><rect x="145" y="55" width="30" height="30" fill="var(--c-fm)"/>',
    clock: '<circle cx="100" cy="70" r="54" fill="#fff" stroke="var(--ink)" stroke-width="7"/><path d="M100 70V36M100 70l25 14" stroke="var(--c-pbl)" stroke-width="7" stroke-linecap="round"/><circle cx="100" cy="70" r="6" fill="var(--ink)"/>',
    book: '<g class="mv mv-tilt"><path d="M100 42c-20-14-50-14-72-6v82c22-8 52-8 72 6z" fill="#fff"/><path d="M100 42c20-14 50-14 72-6v82c-22-8-52-8-72 6z" fill="var(--hl-y)"/><path d="M100 42v82" stroke="var(--ink)" stroke-width="5"/></g><circle class="mv mv-float" cx="152" cy="26" r="12" fill="var(--c-pbl)"/><circle class="mv mv-float d2" cx="44" cy="22" r="7" fill="var(--c-lgr)"/>',
    brush: '<path d="M30 88a62 46 0 1 1 106 32c-14 9-19-12-36-8-22 6-58 8-70-24z" fill="var(--ink)"/><circle cx="66" cy="72" r="10" fill="var(--c-pbl)"/><circle cx="96" cy="56" r="10" fill="var(--hl-y)"/><circle cx="126" cy="70" r="10" fill="var(--c-lgr)"/><path d="M168 18l14 12-36 48-12-8z" fill="var(--c-fm)"/>',
    letters: '<g class="mv mv-bob"><rect x="18" y="52" width="52" height="52" rx="10" fill="var(--c-pbl)"/><text x="44" y="91" font-size="38" fill="#fff" font-family="Jost,sans-serif" font-weight="600" text-anchor="middle">A</text></g><g class="mv mv-bob d2"><rect x="74" y="34" width="52" height="52" rx="10" fill="var(--c-lgr)"/><text x="100" y="73" font-size="38" fill="#fff" font-family="Jost,sans-serif" font-weight="600" text-anchor="middle">b</text></g><g class="mv mv-bob d3"><rect x="130" y="58" width="52" height="52" rx="10" fill="var(--c-fm)"/><text x="156" y="96" font-size="38" fill="#fff" font-family="Jost,sans-serif" font-weight="600" text-anchor="middle">c</text></g>',
    speech: '<path d="M30 26h112a16 16 0 0 1 16 16v42a16 16 0 0 1-16 16H82l-28 26v-26H30a16 16 0 0 1-16-16V42a16 16 0 0 1 16-16z" fill="var(--ink)"/><circle cx="56" cy="63" r="8" fill="var(--hl-y)"/><circle cx="86" cy="63" r="8" fill="#fff"/><circle cx="116" cy="63" r="8" fill="var(--hl-p)"/><circle cx="170" cy="112" r="10" fill="var(--c-lgr)"/>',
    pen: '<g class="mv mv-write"><path d="M148 18l28 28-80 80-38 10 10-38z" fill="var(--c-le)"/><path d="M68 98l28 28-38 10z" fill="var(--ink)"/></g><path class="mv mv-draw" pathLength="1" d="M22 132h70" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/><circle class="mv mv-float" cx="40" cy="40" r="12" fill="var(--hl-y)"/>',
    blocks: '<rect class="mv mv-bob" x="26" y="76" width="52" height="52" rx="8" fill="var(--c-pbl)"/><rect class="mv mv-bob d2" x="82" y="76" width="52" height="52" rx="8" fill="var(--hl-y)"/><rect class="mv mv-drop" x="54" y="20" width="52" height="52" rx="8" fill="var(--c-lgr)"/><circle class="mv mv-roll" cx="164" cy="100" r="26" fill="var(--c-fm)"/>',
    flask: '<g class="mv mv-tilt"><path d="M84 18h32v38l36 62a9 9 0 0 1-8 14H56a9 9 0 0 1-8-14l36-62z" fill="#fff" stroke="var(--ink)" stroke-width="6" stroke-linejoin="round"/><path d="M64 98h72l13 24a3 3 0 0 1-3 5H54a3 3 0 0 1-3-5z" fill="var(--c-ml)"/><circle class="mv mv-bubble" cx="92" cy="110" r="5" fill="#fff"/><circle class="mv mv-bubble d2" cx="114" cy="117" r="4" fill="#fff"/></g><circle class="mv mv-float" cx="160" cy="34" r="9" fill="var(--hl-y)"/>',
    count: '<g class="mv mv-pop"><circle cx="46" cy="50" r="22" fill="var(--c-fm)"/><text x="46" y="59" font-size="26" fill="#fff" font-family="Jost,sans-serif" font-weight="600" text-anchor="middle">1</text></g><g class="mv mv-pop d2"><circle cx="100" cy="50" r="22" fill="var(--hl-y)"/><text x="100" y="59" font-size="26" fill="var(--ink)" font-family="Jost,sans-serif" font-weight="600" text-anchor="middle">2</text></g><g class="mv mv-pop d3"><circle cx="154" cy="50" r="22" fill="var(--c-pbl)"/><text x="154" y="59" font-size="26" fill="#fff" font-family="Jost,sans-serif" font-weight="600" text-anchor="middle">3</text></g><path d="M24 104h152M24 120h100" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/>'
  };
  const motif = (m, cls = 'motif') => `<svg class="${cls}" viewBox="0 0 200 140" aria-hidden="true">${MOTIFS[m] || ''}</svg>`;
  const PROD_MOTIF = { library: 'book', math: 'count', phonics: 'letters' };
  /* Product logos: put the file in assets/logos/ and write its name here, e.g. pbl: 'assets/logos/start-pbl.png'.
     While a logo is empty the card shows the product name in its place. */
  const PROD_LOGO = { pbl: 'assets/logos/start-pbl.png', phonics: 'assets/logos/lets-go-readers.png', math: 'assets/logos/fresh-math.png', library: 'assets/logos/gb-magic-library.webp', 'math-lab': 'assets/logos/math-lab.png', 'logic-essay': 'assets/logos/logic-essay.png' };
  const plogo = (key, name) => PROD_LOGO[key] ? `<img class="plogo" src="${PROD_LOGO[key]}" alt="${name}">` : name;

  /* One worksheet spread: a bold picture page on the left, a draw-and-write page on the right */
  const sheet = (sh, i) => sh.img ? `<figure class="wsheet wimg"><img src="${sh.img}" alt="${esc(sh.t)}" loading="lazy"></figure>` : `<figure class="wsheet sc-${sh.c}">
    <div class="sh-l"><span class="sh-no">0${i + 1}</span><h4>${esc(sh.t)}</h4>${motif(sh.m)}</div>
    <div class="sh-r"><p class="sh-say">${esc(sh.say)}</p><div class="sh-draw"><span>${L('그려 보세요', 'Draw here')}</span></div><p class="sh-write">${esc(sh.w).replace(/___/g, '<i></i>')}</p><span class="sh-star" aria-hidden="true">★</span></div>
  </figure>`;


  /* Hand-drawn doodles (original line drawings) that draw themselves and wiggle */
  const DOODLES = {
    squiggle: [92, 40, 'M4 20c10-18 18 18 28 0s18 18 28 0 18 18 28 0'],
    star: [60, 60, 'M30 5l7 17 18 2-14 12 5 18-16-10-16 10 5-18L5 24l18-2z'],
    spiral: [64, 64, 'M32 32c0-6 8-6 8 0s-14 10-16 0 10-20 22-12 8 28-8 30-30-10-26-30'],
    arrow: [80, 44, 'M4 34c20-24 44-24 66-6M58 12l14 16-20 6'],
    heart: [60, 58, 'M30 52C8 36 4 22 14 14c8-6 14 0 16 6 2-6 8-12 16-6 10 8 6 22-16 38z'],
    sparkle: [44, 44, 'M22 3v38M3 22h38M9 9l26 26M35 9L9 35'],
    crown: [64, 48, 'M8 42L5 14l15 13L32 6l12 21 15-13-3 28z'],
    scribble: [130, 26, 'M4 12c40-8 80-8 120 0-36-2-70 2-100 8'],
    loop: [90, 44, 'M4 30c14-30 34-30 30-8s-22 16-10-2 34-20 60-6']
  };
  const doodle = (n, cls = '') => { const [w, h, p] = DOODLES[n]; return `<svg class="doodle dd-${n} ${cls}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><path pathLength="1" d="${p}"/></svg>`; };

  /* Fresh Math card: the booklet's pages slide up one after another. Start PBL card: EES worksheet pages slide sideways. */
  const slideV = () => `<div class="sv" aria-hidden="true"><div class="sv-track">${[1, 2, 3, 4, 5, 6, 1].map(n => `<img src="assets/fmbook/${n}.webp" alt="">`).join('')}</div></div>`;
  /* Card pictures that move, one kind per programme (worksheet pictures are assets/worksheets/<id>-<n>.png) */
  const wsImg = (id, n) => `<img src="assets/worksheets/${id}-${n}.png" alt="">`;
  const pileDeal = (id, ns) => `<div class="pm pm-pile" aria-hidden="true">${ns.map(n => wsImg(id, n)).join('')}</div>`;            // Fresh Math
  const wsHalf = (id, n, side) => `<b style="background-image:url(assets/worksheets/${id}-${n}.png)" class="${side}"></b>`;
  const counterRoll = (id, ns) => `<div class="pm pm-roll" aria-hidden="true"><div class="up"><div>${[...ns, ns[0]].map(n => wsHalf(id, n, 'l')).join('')}</div></div><div class="down"><div>${[ns[0], ...ns.slice(1).reverse(), ns[0]].map(n => wsHalf(id, n, 'r')).join('')}</div></div></div>`;   // Math Lab
  const padFlip = (id, ns) => `<div class="pm pm-pad" aria-hidden="true"><i></i>${ns.map(n => wsImg(id, n)).join('')}</div>`;        // Logic Essay
  const slideH = (id = 'ees-park-ranger', ns = [1, 2, 3, 4, 1]) => `<div class="sh ${ns.length === 4 ? 'sh3' : ''}" aria-hidden="true"><div class="sh-track">${ns.map(n => `<img src="assets/worksheets/${id}-${n}.png" alt="">`).join('')}</div></div>`;

  /* Front banner: an opened hardcover seen from outside (back cover, spine, front cover); the reading books and the workbook take turns */
  const HERO_BOOKS = [   // id, height / width of the cover spread, label, then the banner colours that contrast with this cover:
    // background, text, first highlight (and its text), second highlight (and its text), main button (and its text)
    ['rb-b8', .5867, 'GB Magic Library Reading Book · Level B · 8', ['#ffd95e', '#151e4b', '#2c5855', '#fff', '#fffdf6', '#151e4b', '#2c5855', '#fff']],
    ['wb-b8', .5867, 'GB Magic Library Reading Literacy workbook · Level B · 8', ['#1f4a47', '#fff', '#ffd426', '#151e4b', '#f0553f', '#fff', '#ffd426', '#151e4b']],
    ['rb-a8', .5133, 'GB Magic Library Reading Book · Level A · 8', ['#ffb48a', '#151e4b', '#223a6b', '#fff', '#fffdf6', '#151e4b', '#223a6b', '#fff']],
    ['rb-c8', .6707, 'GB Magic Library Reading Book · Level C · 8', ['#a8e6cf', '#151e4b', '#4a2a5e', '#fff', '#fffdf6', '#151e4b', '#4a2a5e', '#fff']]
  ];
  let heroBookTimer = null;
  const half = side => `<div class="b3-cover b3-${side}"><i class="b3-edge"></i><i class="b3-top"></i><i class="b3-bot"></i></div>`;
  const heroBook = () => `<div class="hb" id="hb">${HERO_BOOKS.map(([id, ar, alt], i) => `<div class="hb-book b3 ${i ? '' : 'on'}" role="img" aria-label="${alt}" style="--img:url(assets/covers/${id}.webp);--ar:${ar}">
      <div class="b3-in"><div class="b3-spine"></div>${half('front')}${half('back')}</div><div class="b3-shadow"></div></div>`).join('')}</div>`;
  function startHeroBook() {
    clearInterval(heroBookTimer);
    const el = document.getElementById('hb'); if (!el) return;
    const hero = el.closest('.vibe-hero'), books = [...el.querySelectorAll('.hb-book')];
    let i = +(new URLSearchParams(location.hash.split('?')[1] || '').get('book') || 0) % books.length;   // #/?book=2 opens on the third book
    books.forEach((b, k) => b.classList.toggle('on', k === i));
    const paint = () => ['--hbg', '--hfg', '--m1', '--m1t', '--m2', '--m2t', '--b1', '--b1t'].forEach((v, k) => hero.style.setProperty(v, HERO_BOOKS[i][3][k]));
    hero.classList.add('themed'); paint();
    heroBookTimer = setInterval(() => {
      if (!document.body.contains(el)) return clearInterval(heroBookTimer);
      books[i].classList.remove('on'); books[i].classList.add('out');
      const gone = books[i]; setTimeout(() => gone.classList.remove('out'), 900);
      i = (i + 1) % books.length; books[i].classList.add('on'); paint();
    }, 4200);
  }

  /* GB Magic Library card: a hardcover storybook that opens, turns a page, closes, then the next story (real covers and pages) */
  const FLIP_BOOKS = ['b8-2', 'b8-3', 'b8-4'];
  const flipBook = () => `<div class="fb" id="fb" aria-hidden="true"><div class="fb-book">
      <div class="fb-half fb-l"><img alt=""></div><div class="fb-half fb-r"><img alt=""></div>
      <div class="fb-leaf"><img class="fr" alt=""><img class="bk" alt=""></div>
      <div class="fb-cover"><img alt=""></div>
    </div></div>`;
  async function startFlip() {
    const el = document.getElementById('fb'); if (!el) return;
    const q = c => el.querySelector(c), wait = ms => new Promise(r => setTimeout(r, ms)), alive = () => document.body.contains(el);
    const leaf = q('.fb-leaf'), P = (id, n) => `assets/gbbook/${id}/${n}.webp`;
    let b = 0;
    while (alive()) {
      const id = FLIP_BOOKS[b];
      q('.fb-cover img').src = `assets/gbbook/${id}/cover.webp`;
      q('.fb-l img').src = P(id, 1); q('.fb-r img').src = P(id, 2); q('.fr').src = P(id, 2); q('.bk').src = P(id, 3);
      el.classList.add('swap'); await wait(1900); el.classList.remove('swap'); if (!alive()) return;
      el.classList.add('open'); await wait(2300); if (!alive()) return;
      q('.fb-r img').src = P(id, 4); leaf.classList.add('flip'); await wait(1100); q('.fb-l img').src = P(id, 3); await wait(1900); if (!alive()) return;
      el.classList.remove('open'); await wait(1000);
      leaf.style.transition = 'none'; leaf.classList.remove('flip'); void leaf.offsetWidth; leaf.style.transition = '';
      b = (b + 1) % FLIP_BOOKS.length;
    }
  }

  /* A round face that blinks and talks (original character) */
  const talkFace = () => `<svg class="face" viewBox="0 0 200 200" aria-hidden="true">
      <g class="face-ring"><circle cx="100" cy="100" r="90" fill="#1f3fbf"/><circle cx="100" cy="100" r="80" fill="none" stroke="#9be3dc" stroke-width="16" stroke-dasharray="14 12"/><circle cx="100" cy="100" r="80" fill="none" stroke="#ff9f8c" stroke-width="6" stroke-dasharray="3 23" stroke-linecap="round"/></g>
      <circle cx="100" cy="100" r="66" fill="#ffe45c"/>
      <circle cx="58" cy="112" r="10" fill="#ff9f8c"/><circle cx="142" cy="112" r="10" fill="#ff9f8c"/>
      <g class="face-eye"><circle cx="76" cy="86" r="13" fill="#fff"/><circle cx="78" cy="88" r="6" fill="#17204a"/></g>
      <g class="face-eye"><circle cx="124" cy="86" r="13" fill="#fff"/><circle cx="126" cy="88" r="6" fill="#17204a"/></g>
      <path class="face-shut" d="M78 126q22 12 44 0" fill="none" stroke="#17204a" stroke-width="6" stroke-linecap="round"/>
      <g class="face-open"><path d="M70 118h60a30 30 0 0 1-60 0z" fill="#17204a"/><path d="M84 138a16 12 0 0 1 32 0 26 26 0 0 1-32 0z" fill="#ff7a66"/><path d="M82 118h36v8H82z" fill="#fff"/></g>
    </svg>`;

  /* The reel: four scenes on the front page; in each one, pictures pop in one after another, then the next scene starts */
  let reelTimer = null;
  /* 소개 banner: the key sentences take turns; the banner colour, highlight and the disc behind Gerry and Penny change with each */
  let kbTimer = null;
  function startKeyBanner() {
    clearTimeout(kbTimer);
    const el = document.getElementById('kb'); if (!el) return;
    const sets = [...el.querySelectorAll('.kb-h, .kb-sub')].map(x => [...x.querySelectorAll('.kb-line')]), ds = [...el.querySelectorAll('.kb-dots button')];
    let i = +(new URLSearchParams(location.hash.split('?')[1] || '').get('k') || 0) % 3;   // #/about?k=1 opens on the second sentence
    const show = () => { sets.forEach(ls => ls.forEach((x, k) => x.classList.toggle('on', k === i))); ds.forEach((x, k) => x.classList.toggle('on', k === i)); el.dataset.k = i; };
    // it moves by itself every 5.2 s; after the reader goes back or forth it waits 12 s, so there is time to read
    const wait = ms => { clearTimeout(kbTimer); kbTimer = setTimeout(() => { if (!document.body.contains(el)) return; go((i + 1) % 3, false); }, ms); };
    const go = (n, byHand) => {
      if (n === i) return wait(byHand ? 12000 : 5200);
      el.classList.add('swap');                                   // fade the words out, change sentence and layout, fade back in
      setTimeout(() => { i = n; show(); el.classList.remove('swap'); }, byHand ? 220 : 420);
      wait(byHand ? 12000 : 5200);
    };
    ds.forEach((b, k) => b.onclick = () => go(k, true));
    el.querySelectorAll('[data-kbdir]').forEach(b => b.onclick = () => go((i + +b.dataset.kbdir + 3) % 3, true));
    let x0 = null;                                                // swipe on a phone
    el.ontouchstart = e => { x0 = e.touches[0].clientX; };
    el.ontouchend = e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 48) go((i + (dx < 0 ? 1 : -1) + 3) % 3, true); };
    show(); wait(5200);
  }

  /* Gerry and Penny talking (their real idle / talk / blink frames), used beside "Ask a teacher near you" */
  const friendFace = who => `<span class="ff ff-${who}">${['idle', 'talk', 'blink'].map(f => `<img class="ff-${f}" src="assets/friends/${who}-${f}.webp" alt="">`).join('')}</span>`;
  const friendsTalk = () => `<div class="ffs" aria-hidden="true">${friendFace('gerry')}${friendFace('penny')}</div>`;

  /* Teaser clip (storyboard approved 2026-11-11). Each scene is a full-width colour with one idea; its parts carry class "tz" and an order
     number (--i) and arrive one after another while the scene is showing. Timing lives in TEASER_MS and in the .tz rules in app.css. */
  const TEASER_MS = 4300;
  const reel = () => {
    const tz = (kind, i, style, html) => `<div class="tz tz-${kind}" style="--i:${i};${style}">${html}</div>`;
    const img = src => `<img src="${src}" alt="">`;
    // a photo that moves: a short silent clip, with the still photo shown until it loads (clips in assets/photos/video, made with Grok)
    const vid = (name, ratio) => `<video src="assets/photos/video/${name}.mp4" poster="assets/photos/${name}.webp" style="aspect-ratio:${ratio}" muted loop playsinline preload="auto"></video>`;
    const sheetLive = (src, key) => `<div class="tz-sheet"><img src="${src}" alt="">${((window.TZ_OVER || {})[key] || {}).over || ''}</div>`;
    const lines = (ko, en, i0, style = '') => `<div class="tz-big" style="${style}">${L(ko, en).map((t, k) => `<span class="tz tz-up" style="--i:${i0 + k}">${t}</span>`).join('')}</div>`;
    const SC = [
      ['#ffe45c', '<i class="tzbg tzbg-dots"></i><i class="tz tz-spark" style="--i:6;right:9%;top:10%"></i><i class="tz tz-spark" style="--i:7;right:36%;top:16%"></i><i class="tz tz-spark" style="--i:8;right:7%;bottom:14%"></i>' + lines(['책으로', '상상하고'], ['Imagine', 'with a book'], 0) +
        tz('drop', 3, 'right:13%;top:8%;height:84%;--r:5deg', img('assets/covers/rb-b8-front.webp'))],
      ['#151e4b', '<i class="tzbg tzbg-dots light"></i>' + tz('pop', 0, 'left:7%;top:17%;height:62%;--r:-7deg', img('assets/gbbook/b8-2/1.webp')) + tz('pop', 2, 'left:29%;top:23%;height:62%;--r:3deg', img('assets/gbbook/b8-2/2.webp')) +
        tz('pop', 4, 'left:51%;top:15%;height:62%;--r:-3deg', img('assets/gbbook/b8-3/1.webp')) + tz('pop', 6, 'left:73%;top:23%;height:62%;--r:6deg', img('assets/gbbook/b8-4/2.webp'))],
      ['#9be3dc', '<svg class="tzbg tzbg-strokes" viewBox="0 0 1200 520" preserveAspectRatio="none"><path pathLength="1" d="M-20 150 C 220 40, 420 250, 700 120 S 1100 60, 1230 170"/><path pathLength="1" d="M-20 330 C 260 240, 480 430, 760 310 S 1080 250, 1230 360"/><path pathLength="1" d="M-20 470 C 300 400, 520 520, 820 440 S 1100 430, 1230 480"/></svg>' + lines(['그림으로', '표현하며'], ['Express it', 'in a picture'], 0) +
        tz('slide', 3, 'right:5%;top:9%;width:46%;--r:3deg', sheetLive('assets/worksheets/ees-park-ranger-1.png', 'hello')), (window.TZ_OVER || {}).hello],
      ['#ff9f8c', '<i class="tzbg tzbg-rules"></i>' + lines(['글로 생각을', '완성하다'], ['Complete it', 'in writing'], 0) +
        tz('slide', 3, 'right:5%;top:9%;width:46%;--r:-3deg', sheetLive('assets/worksheets/ees-park-ranger-2.png', 'protect')), (window.TZ_OVER || {}).protect],
      ['#f6e8cc', '<i class="tzbg tzbg-rounds"><b></b><b></b><b></b></i>' + tz('pop', 0, 'left:4%;top:8%;height:82%;--r:-4deg', vid('block-tower', '768 / 1168')) + tz('pop', 2, 'left:24%;top:11%;height:58%;--r:3deg', vid('baker', '1 / 1')) +
        tz('pop', 4, 'left:37%;bottom:7%;height:42%;--r:-2deg', vid('farmer', '1168 / 768')) + lines(['놀면서', '배워요'], ['Learning', 'by doing'], 6, 'left:auto;right:5%;text-align:right'), { ms: 7800 }],
      ['#151e4b', '<i class="tzbg tzbg-dots light"></i>' + `<div class="tz-chips">${['start-pbl.png', 'lets-go-readers.png', 'fresh-math.png', 'gb-magic-library.webp', 'math-lab.png', 'logic-essay.png'].map((f, k) => `<div class="tz tz-chip" style="--i:${k}">${img('assets/logos/' + f)}</div>`).join('')}</div>
        <div class="tz tz-up tz-slogan" style="--i:8">Listen More, Understand More, Speak Naturally.</div>`]
    ];
    return `<section class="reel teaser" id="reel" aria-label="${L('GPEIS 한눈에 보기', 'GPEIS at a glance')}">
      ${SC.map(([bg, html, live], k) => `<div class="scene-r ${k ? '' : 'on'}" data-ms="${(live && live.ms) || TEASER_MS}" style="background:${bg}"><div class="tz-in ${bg === '#151e4b' ? 'dark' : ''}">${html}</div></div>`).join('')}
      <div class="reel-dots">${SC.map((x, k) => `<button data-reel="${k}" class="${k ? '' : 'on'}" aria-label="${k + 1}"></button>`).join('')}</div>
    </section>`;
  };
  function startReel() {
    clearTimeout(reelTimer);
    const el = document.getElementById('reel'); if (!el) return;
    const scenes = [...el.querySelectorAll('.scene-r')], dots = [...el.querySelectorAll('[data-reel]')];
    let i = 0;
    const show = n => { i = n; scenes.forEach((sc, k) => sc.classList.toggle('on', k === n)); el.classList.toggle('on-dark', !!scenes[n].querySelector('.tz-in.dark')); dots.forEach((b, k) => b.classList.toggle('on', k === n));
      scenes.forEach((sc, k) => sc.querySelectorAll('video').forEach(v => { if (k === n) { try { v.currentTime = 0; } catch (e) {} } else v.pause(); }));
      playNow(); setTimeout(playNow, 600); };
    // the clips of the scene on show: start them, and start them again whenever the teaser scrolls back into view (browsers pause silent clips that are off screen)
    const playNow = () => scenes[i].querySelectorAll('video').forEach(v => { if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) playNow(); }), { threshold: .15 }).observe(el);
    const run = () => { clearTimeout(reelTimer); reelTimer = setTimeout(() => { if (!document.body.contains(el)) return; show((i + 1) % scenes.length); run(); }, +scenes[i].dataset.ms || TEASER_MS); };
    dots.forEach((b, k) => b.onclick = () => { show(k); run(); });
    const first = +(new URLSearchParams(location.hash.split('?')[1] || '').get('scene') || 0); if (first) show(first % scenes.length);
    run();
  }

  /* Moving picture for the front page: an open book with things to learn rising out of it (original drawing) */
  const heroScene = () => `<div class="scene" aria-hidden="true"><svg viewBox="0 0 420 380">
      <g class="mv mv-spin"><circle cx="338" cy="70" r="30" fill="var(--hl-y)"/><path d="M338 22v-14M338 132v-14M290 70h-14M400 70h-14M304 36l-10-10M382 114l-10-10M304 104l-10 10M382 26l-10 10" stroke="var(--hl-y)" stroke-width="7" stroke-linecap="round"/></g>
      <g class="mv mv-rise"><rect x="60" y="150" width="62" height="62" rx="14" fill="var(--c-pbl)"/><text x="91" y="196" font-size="44" fill="#fff" font-family="Jost,sans-serif" font-weight="600" text-anchor="middle">A</text></g>
      <g class="mv mv-rise d2"><circle cx="212" cy="96" r="36" fill="var(--hl-g)"/><text x="212" y="112" font-size="44" fill="var(--ink)" font-family="Jost,sans-serif" font-weight="600" text-anchor="middle">3</text></g>
      <g class="mv mv-rise d3"><path d="M286 210l44-64 44 64z" fill="var(--hl-b)"/></g>
      <g class="mv mv-rise d4"><path d="M150 60l9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3z" fill="var(--hl-p)"/></g>
      <g class="mv mv-rise d5"><path d="M118 96c-30 2-40-16-38-32 20-4 38 8 38 32z" fill="var(--c-fm)"/></g>
      <g class="mv mv-float"><path d="M250 150h70a12 12 0 0 1 12 12v26a12 12 0 0 1-12 12h-36l-18 16v-16h-16a12 12 0 0 1-12-12v-26a12 12 0 0 1 12-12z" fill="#fff"/><circle cx="266" cy="175" r="5" fill="var(--c-pbl)"/><circle cx="286" cy="175" r="5" fill="var(--c-lgr)"/><circle cx="306" cy="175" r="5" fill="var(--c-fm)"/></g>
      <g class="mv mv-tilt"><path d="M210 262c-40-26-98-26-142-10v112c44-16 102-16 142 10z" fill="#fff"/><path d="M210 262c40-26 98-26 142-10v112c-44-16-102-16-142 10z" fill="var(--hl-y)"/><path d="M210 262v112" stroke="var(--ink)" stroke-width="7"/><path d="M96 284c28-6 60-4 88 8M96 310c28-6 60-4 88 8" stroke="#c9cfe6" stroke-width="6" stroke-linecap="round" fill="none"/></g>
    </svg></div>`;

  /* Activities page: pictures of children doing the activities from all GP programmes.
     Pictures live in assets/activities/<id>.webp (AI-made stand-ins until GP has real photos). */
  const ACTS = [
    { g: 'GB Magic Library', c: 'var(--c-gb)', items: [
      { id: 'read-together', t: ['이야기책 함께 읽기', 'Reading a storybook together'], s: ['읽고, 질문하고, 생각을 나눠요.', 'Read, ask questions and share ideas.'] },
      { id: 'make-a-book', t: ['나만의 책 만들기', 'Making my own book'], s: ['이야기를 그림과 글로 다시 만들어요.', 'Retell the story in pictures and words.'] },
      { id: 'book-outdoors', t: ['책과 함께 밖으로', 'Books go outdoors'], s: ['이야기 속 자연을 밖에서 직접 만나요.', 'Meet the nature from the story outside.'] } ] },
    { g: 'Let’s Go Readers', c: 'var(--c-lgr)', items: [
      { id: 'letter-sounds', t: ['소리와 글자 놀이', 'Letters and sounds'], s: ['글자 카드로 소리를 듣고 말해요.', 'Hear and say sounds with letter cards.'] },
      { id: 'letter-hop', t: ['글자 뛰기', 'Letter hop'], s: ['밖에서 뛰면서 낱말을 읽어요.', 'Jump from letter to letter and read the word.'] } ] },
    { g: 'Fresh Math', c: 'var(--c-fm)', items: [
      { id: 'forest-counting', t: ['숲에서 수 세기', 'Counting in the forest'], s: ['솔방울과 나뭇가지로 세고 묶어요.', 'Count and bundle pine cones and sticks.'] },
      { id: 'tangram', t: ['칠교 퍼즐', 'Tangram puzzles'], s: ['일곱 조각으로 동물을 만들어요.', 'Make animals from seven pieces.'] } ] },
    { g: 'Start PBL', c: 'var(--c-pbl)', items: [
      { id: 'build-project', t: ['함께 만드는 프로젝트', 'Building a project together'], s: ['하나의 주제를 친구들과 만들어 봐요.', 'Build one big theme with friends.'] },
      { id: 'nature-explorers', t: ['자연 탐험', 'Nature explorers'], s: ['돋보기로 관찰하고 영어로 말해요.', 'Look closely and talk about it in English.'] } ] },
    { g: 'EES · ELS', c: 'var(--c-le)', items: [
      { id: 'draw-and-write', t: ['그리고 쓰기', 'Draw and write'], s: ['책에서 배운 문장을 그림과 글로 남겨요.', 'Draw and write the sentences from the book.'] },
      { id: 'learn-at-home', t: ['집에서 이어 배우기', 'Learning at home'], s: ['태블릿으로 가족과 함께 복습해요.', 'Go over it again on a tablet with family.'] } ] }
  ];
  const actCard = (a, c) => `<figure class="act-card" style="--ac:${c}"><div class="act-photo"><img src="assets/activities/${a.id}.webp" alt="${L(a.t[0], a.t[1])}" loading="lazy" onerror="this.remove()"></div><figcaption><b>${L(a.t[0], a.t[1])}</b><span>${L(a.s[0], a.s[1])}</span></figcaption></figure>`;
  const GALLERY = [
    ['hands-sticks', 'Fresh Math'], ['toys', 'GP Friends'], ['handstand', 'Start PBL'], ['book-face', 'GB Magic Library'], ['hands-chalk', 'Let’s Go Readers'], ['park-ranger', 'EES'], ['number-steps', 'Fresh Math'], ['felt-balls', 'Fresh Math'], ['letter-s', 'Let’s Go Readers'], ['block-tower', 'Start PBL'], ['forest-sticks', 'Fresh Math'],
    ['baker', 'EES'], ['book-owl', 'GB Magic Library'], ['letter-hop', 'Let’s Go Readers'], ['farmer', 'EES'], ['tablet', 'GB Magic Library'],
    ['athlete', 'EES'], ['workbook-peek', 'GB Magic Library'], ['forest-counting', 'Fresh Math'], ['cave-explorer', 'EES'], ['make-a-book', 'GB Magic Library'],
    ['pet-groomer', 'EES'], ['book-frog', 'GB Magic Library'],
    ['doctor', 'Start PBL'], ['moon', 'GB Magic Library'], ['float-or-sink', 'GB Magic Library'], ['body-play', 'Start PBL'], ['artist', 'EES']
  ];
  function activities() {
    $app.innerHTML = topbar(authNav()) + `
    <main class="wrap acts">
      <section class="acts-head">
        <h1>${L('<mark class="hl-y">놀면서</mark> 배워요', 'Learning by <mark class="hl-y">doing</mark>')}</h1>
        <p class="acts-line">${L('<mark class="k1">영어</mark>로 세상을 만나고, <mark class="k2">놀이</mark>로 생각을 키우며, 말과 <mark class="k3">표현</mark>으로 채워 가는 아이들의 행복한 성장일기.', 'Meeting the world in <mark class="k1">English</mark>, growing thinking through <mark class="k2">play</mark>, filled with words and <mark class="k3">expression</mark>: a happy growth diary.')}</p>
      </section>
      <div class="gal">${GALLERY.map(([id, prog]) => `<figure class="gal-item"><img src="assets/photos/${id}.webp" alt="${prog}" onerror="this.parentNode.remove()"></figure>`).join('')}</div>
      <p class="note">${L('샘플: 사진은 실제 GP 학생이 아니라 AI로 만든 예시예요. 실제 사진이 준비되면 바꿔요.', 'Sample: these pictures are AI-made examples, not real GP students. They will be replaced when real photos are ready.')}</p>
    </main>${foot()}`;
    bindCommon();
  }

  const foot = () => `<footer class="foot"><div class="wrap">
      <div class="foot-main">
        <div><a class="logo" href="#/"><span class="dots"><b style="background:var(--hl-y)"></b><b style="background:var(--hl-g)"></b><b style="background:var(--hl-p)"></b><b style="background:var(--hl-b)"></b></span>GPEIS</a>
          <p>Listen More, Understand More, Speak Naturally.</p></div>
        <nav aria-label="${L('바닥 메뉴', 'Footer')}"><a href="#/about">${L('GPEIS 소개', 'About GPEIS')}</a><a href="#/books">${L('책', 'Books')}</a><a href="#/activities">${L('활동', 'Activities')}</a><a href="#/consult">${L('교육센터 상담', 'Ask an education centre')}</a><a href="#/school-login">${L('기관 로그인', 'School log-in')}</a></nav>
      </div>
      <p class="foot-legal">${L('상호 (예시) · 대표 OOO · 사업자등록번호 000-00-00000 · 통신판매업 신고 제0000-서울-0000호 · 주소 · 고객센터 · 이용약관 · 개인정보 처리방침 · 환불 정책. 결제 회사가 사이트를 심사할 때 이 정보가 모두 보여야 해요. (샘플)',
        'Company name (example) · CEO OOO · Business no. 000-00-00000 · Online sales reg. no. 0000-Seoul-0000 · Address · Customer service · Terms · Privacy notice · Refund policy. The payment company checks that all of this is visible before it approves the site. (sample)')}</p>
    </div>
    <svg class="foot-art" viewBox="0 0 420 220" aria-hidden="true"><circle cx="330" cy="150" r="80" fill="var(--hl-y)"/><path d="M150 220l70-120 70 120z" fill="var(--hl-p)"/><rect x="40" y="130" width="90" height="90" rx="18" fill="var(--hl-b)"/><circle cx="238" cy="62" r="26" fill="var(--hl-g)"/></svg>
  </footer>`;

  /* ---------- Front door ---------- */
  async function home() {
    const s = API.session();
    const fam = s && s.role === 'parent' ? await API.family() : null;
    const owned = id => fam && fam.subs[id] && fam.subs[id].status !== 'ended';
    const EYE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/></svg>';
    // One programme: the card (clip, "see more" link, logo) and, under it, the price and buttons
    const cell = (cls, pic, logo, about, price, actions) => `
        <div class="pcell ${cls}">
          <article class="pcard ${cls}">
            <div class="pic">${pic}</div>
            <a class="pmore" href="#/books?p=${about}">${EYE}<span>${L('자세히 보기', 'See more')}</span></a>
            <div class="body"><h3>${logo}</h3></div>
          </article>
          <div class="pbelow"><div class="price">${won(price)} <small>/ ${L('월', 'month')}</small></div><div class="actions">${actions}</div></div>
        </div>`;
    const ABOUT_OF = { library: 'p-gb', math: 'p-fm', phonics: 'p-lgr' };
    const buyCard = p => cell('stripe-' + art(p.id),
      (p.id === 'library' ? flipBook() : p.id === 'math' ? pileDeal('fresh-math', [1, 2, 3]) : motif(PROD_MOTIF[p.id])) + (owned(p.id) ? `<span class="badge ok">${L('구독 중', 'Subscribed')}</span>` : ''),
      plogo(p.id, p.name), ABOUT_OF[p.id], p.price,
      (owned(p.id) ? `<a class="btn primary" href="#/play/${p.id}">${L('열기', 'Open')}</a>` : `<button class="btn primary" data-buy="${p.id}">${L('구독하기', 'Subscribe')}</button>`) +
      `<a class="btn" href="#/play/${p.id}?sample=1">${L('맛보기', 'Try a sample')}</a>`);
    const pblCard = () => cell('stripe-pbl', slideH(), plogo('pbl', 'Start PBL'), 'p-pbl', 35000,
      `<button class="btn primary" id="pbl">${L('Start PBL 사이트로', 'Go to the Start PBL site')} ↗</button>`);
    const soonCard = (name) => { const key = name.toLowerCase().replace(/\s+/g, '-');
      return cell('stripe-soon soon-' + key, (name === 'Math Lab' ? counterRoll(key, [1, 2, 8]) : padFlip(key, [1, 2, 4])), plogo(key, name), name === 'Math Lab' ? 'p-ml' : 'p-le', 50000,
        `<span class="badge muted">${L('준비 중', 'Coming soon')}</span>`); };
    const group = (code, name, cards) => `
      <section class="pgroup" aria-label="${code}">
        <h2><b>${code}</b> <span>${name}</span>${doodle('arrow', 'g-d')}</h2>
        <div class="products">${cards.join('')}</div>
      </section>`;
    $app.innerHTML = topbar(authNav()) + `
    <main class="wrap">
      <section class="hero vibe-hero">
        <div>
          <span class="eyebrow">${L('유치부 GPKIS · 초등부 GPPIS', 'Kinder GPKIS · Primary GPPIS')}</span>
          <h1>${L('<mark class="hl-y">듣는</mark> 영어가 달라야<br><mark class="hl-p">말하는</mark> 영어가 달라집니다.', '<mark class="hl-y">Listen</mark> more,<br><mark class="hl-b">understand</mark> more,<br><mark class="hl-p">speak</mark> naturally.')}</h1>
          <div class="form-row"><a class="btn primary big" href="#/about">${L('GPEIS 소개 보기', 'About GPEIS')}</a><a class="btn big" href="#/consult">${L('교육센터 상담', 'Ask an education centre')}</a></div>
        </div>
        ${heroBook()}
      </section>
      ${group('GPKIS', L('GP 유치부 국제학교', 'GP Kinder International School'), [pblCard(), buyCard(prod('phonics')), buyCard(prod('math'))])}
      ${group('GPPIS', L('GP 초등부 국제학교', 'GP Primary International School'), [buyCard(prod('library')), soonCard('Math Lab', '매스 랩'), soonCard('Logic Essay', '로직 에세이')])}
      ${divider()}
      ${''/* The family bundle and group-purchase strip was taken out on 11 Nov 2026: pricing bundles and the school route are not planned yet. The checkout still understands "bundle". */}
      <div class="strip consult-strip">
        <img class="ask-pose" src="assets/friends/pose3.webp" alt="">
        <div><span class="eyebrow">${L('교육센터', 'Education centres')}</span><br><b>${L('우리 동네 선생님께 상담받기', 'Ask a teacher near you')}</b> <span class="dim">${L('시·구를 고르고 문의를 남기면 담당 선생님이 답해 드려요', 'Pick your city and district, leave a question, and the local teacher answers')}</span></div>
        <a class="btn primary" href="#/consult" style="margin-left:auto">${L('상담 문의하기', 'Ask a question')}</a>
      </div>
      ${''/* The four points about how the platform works inside (what opens, child profiles, parent area, school version) were taken out on 11 Nov 2026: not for customers yet. */}
    </main>
    ${foot()}`;
    bindCommon(); startFlip(); startHeroBook();
    // for still pictures of the moving cards: #/?at=3.6 freezes their movements 3.6 seconds in
    const at = new URLSearchParams(location.hash.split('?')[1] || '').get('at');
    if (at) $app.querySelectorAll('.pm img, .pm-roll > div > div').forEach(e => { e.style.animationDelay = (parseFloat(getComputedStyle(e).animationDelay) || 0) - at + 's'; e.style.animationPlayState = 'paused'; });
    document.getElementById('pbl').onclick = () => toast(L('실제 사이트에서는 Wix의 Start PBL 사이트로 이동해요', 'The real site goes to the Start PBL site on Wix'));
    $app.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
      if (!API.session() || API.session().role !== 'parent') { sessionStorage.setItem('gpdemo.after', b.dataset.buy); location.hash = '#/login'; return; }
      checkout(b.dataset.buy);
    });
  }

  /* ---------- Parent login ---------- */
  function login() {
    $app.innerHTML = topbar(`<a class="btn ghost" href="#/">← ${L('처음으로', 'Home')}</a>`) + `
    <main class="wrap"><div class="auth">
      <h1>${L('로그인 / 회원가입', 'Log in / Sign up')}</h1>
      <p>${L('부모님만 로그인해요. 아이는 로그인 없이 부모님 계정 안의 프로필로 들어와요.', 'Only parents log in. Children use a profile inside the parent\'s account, with no login.')}</p>
      <button class="social kakao" data-via="kakao">${L('카카오로 시작하기', 'Continue with Kakao')}</button>
      <button class="social naver" data-via="naver">${L('네이버로 시작하기', 'Continue with Naver')}</button>
      <button class="social google" data-via="google">${L('Google로 시작하기', 'Continue with Google')}</button>
      <div class="or">${L('또는', 'or')}</div>
      <button class="social email" data-via="email">${L('이메일로 시작하기', 'Continue with email')}</button>
      <p class="note">${L('샘플에서는 어느 버튼을 눌러도 예시 부모 계정(김지민 님)으로 들어가요. 실제 사이트에서는 카카오·네이버·구글 화면으로 이동해요.', 'In the sample, every button logs into the example parent account (김지민). The real site would go to the Kakao, Naver or Google screen.')}</p>
    </div></main>`;
    $app.querySelectorAll('[data-via]').forEach(b => b.onclick = async () => {
      b.disabled = true; b.textContent = L('로그인 중…', 'Logging in…');
      await API.login('parent', b.dataset.via);
      const after = sessionStorage.getItem('gpdemo.after'); sessionStorage.removeItem('gpdemo.after');
      location.hash = '#/family';
      if (after) setTimeout(() => checkout(after), 300);
    });
  }

  function schoolLogin() {
    $app.innerHTML = topbar(`<a class="btn ghost" href="#/">← ${L('처음으로', 'Home')}</a>`) + `
    <main class="wrap"><div class="auth">
      <h1>${L('기관 로그인', 'School log-in')}</h1>
      <p>${L('원장님·선생님 계정은 GP가 기관과 계약한 뒤 만들어 드려요.', 'Principal and teacher accounts are made after the school signs with GP.')}</p>
      <div class="demo-pick">
        <button data-role="admin"><b>${L('원장님으로 보기 (예시)', 'View as principal (example)')}</b><span>${L('해바라기 영어유치원 · 반, 선생님, 원생, 시간표, 이용권', '해바라기 영어유치원 · classes, teachers, children, timetable, licence')}</span></button>
        <button data-role="teacher"><b>${L('선생님으로 보기 (예시)', 'View as teacher (example)')}</b><span>${L('이선생님 · 해바라기반 12명의 진도', '이선생님 · progress of 12 children in 해바라기반')}</span></button>
        <a class="btn" href="#/kid" style="justify-content:center">${L('아이 입장 화면 보기 (교실 태블릿)', 'Child log-in screen (classroom tablet)')}</a>
        <button data-role="counselor"><b>${L('상담 선생님으로 보기 (예시)', 'View as counsellor (example)')}</b><span>${L('윤선생님 · 서울 강남·서초·송파·강동 교육센터 문의에 답변', '윤선생님 · answers inquiries for 강남, 서초, 송파 and 강동 in Seoul')}</span></button>
        <button data-role="staff"><b>${L('GP 운영자로 보기 (예시)', 'View as GP staff (example)')}</b><span>${L('모든 기관·가정 회원·결제·열람 기록·데이터. 실제로는 GP 전용 주소와 2단계 로그인', 'All schools, families, payments, access log, data. Real version: a GP-only address and two-step login')}</span></button>
      </div>
      <p class="note">${L('단체 구매 문의: 견적서 → 세금계산서 → 계좌이체. 2~4주 무료 체험반 가능 (예시).', 'Group purchase: quote → tax invoice → bank transfer. A 2-4 week free trial class is possible (example).')}</p>
    </div></main>`;
    $app.querySelectorAll('[data-role]').forEach(b => b.onclick = async () => { b.disabled = true; await API.login(b.dataset.role); location.hash = ROLE_HOME[b.dataset.role]; });
  }

  /* ---------- Checkout (pretend payment company window) ---------- */
  async function checkout(id) {
    const fam = await API.family();
    const items = id === 'bundle' ? P.filter(p => !(fam.subs[p.id] && fam.subs[p.id].status === 'active')) : [prod(id)];
    if (!items.length) { toast(L('이미 모두 구독 중이에요', 'You already have all three')); return; }
    const total = id === 'bundle' ? Math.max(API.BUNDLE - P.filter(p => !items.includes(p)).reduce((a, p) => a + p.price, 0), 0) : items[0].price;
    modal(`
      <h2>${L('구독 시작하기', 'Start a subscription')}</h2>
      ${items.map(p => `<div class="sum"><span>${p.name} · ${L('월 구독', 'monthly')}</span><span>${won(p.price)}</span></div>`).join('')}
      ${id === 'bundle' ? `<div class="sum dim"><span>${L('가족 묶음 할인', 'Family bundle discount')}</span><span>-${won(items.reduce((a, p) => a + p.price, 0) - total)}</span></div>` : ''}
      <div class="sum"><span>${L('오늘 결제', 'Pay today')}</span><b>${won(total)}</b></div>
      <div class="methods" role="radiogroup" aria-label="${L('결제 수단', 'Payment method')}">
        <label><input type="radio" name="pm" value="신용카드 ****4321" checked> ${L('신용·체크카드', 'Credit or debit card')}</label>
        <label><input type="radio" name="pm" value="카카오페이"> ${L('카카오페이', 'Kakao Pay')}</label>
        <label><input type="radio" name="pm" value="네이버페이"> ${L('네이버페이', 'Naver Pay')}</label>
      </div>
      <div class="fine">
        <span>· ${L('매달 같은 날 자동 결제돼요. 다음 결제일 3일 전에 알림톡으로 알려 드려요.', 'Charged automatically on the same day each month. We send a KakaoTalk reminder 3 days before.')}</span>
        <span>· ${L('언제든 부모님 화면에서 해지할 수 있고, 해지해도 남은 기간까지 이용할 수 있어요.', 'Cancel any time in the parent area; it stays open until the paid period ends.')}</span>
        <span>· ${L('카드 번호는 결제 회사 화면에서만 입력해요. 우리 사이트에는 저장되지 않아요.', 'The card number is typed only in the payment company\'s window. Our site never stores it.')}</span>
      </div>
      <label class="switch"><input type="checkbox" id="agree"> ${L('위 내용과 이용약관·환불 정책에 동의해요', 'I agree to the above, the terms and the refund policy')}</label>
      <button class="btn primary big" id="pay" disabled>${L(`${won(total)} 결제하기 (샘플)`, `Pay ${won(total)} (sample)`)}</button>
      <button class="btn ghost" id="cancelPay">${L('취소', 'Cancel')}</button>
      <p class="note">${L('샘플이라 실제로 결제되지 않아요. 실제 사이트에서는 여기서 토스페이먼츠(또는 포트원) 결제창이 열려요.', 'Nothing is charged in the sample. On the real site, the Toss Payments (or PortOne) payment window opens here.')}</p>`);
    const pay = document.getElementById('pay');
    document.getElementById('agree').onchange = e => pay.disabled = !e.target.checked;
    document.getElementById('cancelPay').onclick = closeModal;
    pay.onclick = async () => {
      const method = document.querySelector('input[name=pm]:checked').value;
      modal(`<h2>${L('결제 중…', 'Paying…')}</h2><div class="spinner" aria-hidden="true"></div><p class="dim" style="text-align:center;margin:0">${L('결제 회사의 확인을 기다리고 있어요 (샘플)', 'Waiting for the payment company to confirm (sample)')}</p>`);
      for (const p of items) await API.subscribe(p.id, method);
      modal(`<h2>${L('구독이 시작됐어요', 'Your subscription has started')} 🎉</h2>
        <p style="margin:0">${L(`${items.map(p => `<b>${p.name}</b>`).join(', ')}이(가) 이제 열려요. 영수증은 부모님 화면 › 결제 내역에 있어요.`, `${items.map(p => `<b>${p.name}</b>`).join(', ')} is now open. The receipt is in Parent area › Payments.`)}</p>
        <button class="btn primary big" id="goPlay">${L('지금 열어 보기', 'Open it now')}</button>`);
      document.getElementById('goPlay').onclick = () => { closeModal(); location.hash = '#/family'; render(); };
    };
  }

  /* ---------- Parent: who's playing + products ---------- */
  let activeKid = null;
  async function family() {
    const fam = await API.family();
    if (!activeKid || !fam.children.find(c => c.id === activeKid)) activeKid = fam.children[0].id;
    const kid = fam.children.find(c => c.id === activeKid);
    $app.innerHTML = topbar(authNav()) + `
    <main class="wrap" style="padding-block:28px 48px;display:grid;gap:22px">
      <div><h1 style="font-size:26px">${L('누가 놀이할까요?', "Who's playing today?")}</h1></div>
      <div class="kids">${fam.children.map(c => `<button class="kid ${c.id === activeKid ? 'on' : ''}" data-kid="${c.id}"><img src="${face(c.face)}" alt=""><b>${esc(c.name)}</b></button>`).join('')}</div>
      <div class="grid3">${P.map(p => {
        const s = fam.subs[p.id], open = s && s.status !== 'ended';
        return `<a class="tile ${open ? '' : 'locked'}" href="${open ? `#/play/${p.id}` : '#'}" data-tile="${p.id}">
          ${artBox(p.id)}
          ${open ? '' : `<span class="badge lock lockmark">🔒 ${L('구독 전', 'Not subscribed')}</span>`}
          <div class="cap"><b>${p.name}</b>${open ? `<span class="prog" style="min-width:110px"><span class="bar ${art(p.id)}"><i style="width:${Math.round(kid.progress[p.id] / p.total * 100)}%"></i></span>${kid.progress[p.id]}/${p.total}${unit(p)}</span>` : `<span class="btn primary" style="padding:4px 12px">${L('구독하기', 'Subscribe')}</span>`}</div>
        </a>`; }).join('')}</div>
      <div class="panel" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div style="flex:1;min-width:220px"><b>${L('부모님 화면', 'Parent area')}</b><br><span class="dim">${L('구독 관리, 결제 내역, 학습 리포트, 쿠폰, 가족 프로필, 개인정보 동의', 'Subscriptions, payments, learning reports, coupons, family profiles, privacy consent')}</span></div>
        <a class="btn" href="#/family/subs">${L('부모님 화면 열기', 'Open the parent area')} →</a>
      </div>
    </main>`;
    bindCommon();
    $app.querySelectorAll('[data-kid]').forEach(b => b.onclick = () => { activeKid = b.dataset.kid; family(); });
    $app.querySelectorAll('.tile.locked').forEach(a => a.onclick = e => { e.preventDefault(); checkout(a.dataset.tile); });
  }

  /* ---------- Parent area (behind a parent check, like GB) ---------- */
  function parentCheck(next) {
    const a = 6 + Math.floor(Math.random() * 3), b = 7 + Math.floor(Math.random() * 2), ans = a * b;
    const opts = [ans, ans + a, ans - b].sort(() => Math.random() - .5);
    modal(`<h2>${L('부모님 확인', 'Grown-ups only')}</h2><p style="margin:0">${a} × ${b} = ?</p>
      <div class="form-row">${opts.map(o => `<button class="btn big" data-ans="${o}">${o}</button>`).join('')}</div>
      <p class="note">${L('아이가 부모님 화면에 들어오지 않도록 묻는 질문이에요. 쿠폰과 결제는 이 뒤에만 보여요.', 'This keeps children out of the parent area. Coupons and payments are only shown behind it.')}</p>`);
    $modal.querySelectorAll('[data-ans]').forEach(btn => btn.onclick = () => {
      if (+btn.dataset.ans === ans) { parentOk = true; try { sessionStorage.setItem('gpdemo.parentOk', '1'); } catch (e) {} closeModal(); next(); }
      else { btn.disabled = true; toast(L('다시 골라 주세요', 'Try again')); }
    });
  }
  async function parentArea(tab) {
    if (!parentOk) { $app.innerHTML = topbar(authNav()) + `<div class="loading">${L('부모님 확인이 필요해요', 'A grown-up check is needed')}</div>`; bindCommon(); parentCheck(() => parentArea(tab)); return; }
    const fam = await API.family();
    const TABS = [['subs', L('구독 관리', 'Subscriptions')], ['billing', L('결제 내역', 'Payments')], ['reports', L('학습 리포트', 'Learning reports')], ['coupons', L('쿠폰', 'Coupons')], ['profiles', L('가족 프로필', 'Family profiles')], ['consults', L('상담 문의', 'My questions')], ['privacy', L('개인정보·동의', 'Privacy and consent')]];
    const open = fam.coupons.filter(c => !c.used).length;
    const side = `<aside class="side"><div class="who"><b>${esc(fam.name)} ${L('님', '')}</b>${fam.login === 'kakao' ? L('카카오', 'Kakao') : fam.login} ${L('계정', 'account')} · ${esc(fam.email)}</div>
      ${TABS.map(([k, n]) => `<a href="#/family/${k}" class="${k === tab ? 'on' : ''}">${n}${k === 'coupons' && open ? ` <span class="badge warn">${open}</span>` : ''}</a>`).join('')}
      <a href="#/family">← ${L('아이 화면으로', 'Back to the children')}</a></aside>`;
    let body = '';
    if (tab === 'subs') {
      const monthly = P.filter(p => fam.subs[p.id] && fam.subs[p.id].status === 'active').reduce((a, p) => a + p.price, 0);
      body = `<h1>${L('구독 관리', 'Subscriptions')}</h1><p class="sub">${L('상품마다 따로 구독하고 따로 해지할 수 있어요.', 'Each product is subscribed to and cancelled on its own.')}</p>
      <div class="panel scroll"><table><tr><th>${L('상품', 'Product')}</th><th>${L('상태', 'Status')}</th><th>${L('결제 수단', 'Method')}</th><th>${L('다음 결제일', 'Next payment')}</th><th class="num">${L('월 요금', 'Per month')}</th><th></th></tr>
      ${P.map(p => { const s = fam.subs[p.id];
        if (!s) return `<tr><td><span class="chip ${p.id}">${p.name}</span></td><td><span class="badge muted">${L('구독 전', 'Not subscribed')}</span></td><td class="dim">-</td><td class="dim">-</td><td class="num">${won(p.price)}</td><td><button class="btn primary" data-buy="${p.id}">${L('구독하기', 'Subscribe')}</button></td></tr>`;
        return `<tr><td><span class="chip ${p.id}">${p.name}</span></td><td>${s.status === 'active' ? `<span class="badge ok">${L('구독 중', 'Active')}</span>` : `<span class="badge warn">${L('해지 예약', 'Cancelled, open until end')}</span>`}</td><td>${esc(dv(s.method))}</td><td>${s.status === 'active' ? s.next : L(s.next + '까지 이용', 'Open until ' + s.next)}</td><td class="num">${won(p.price)}</td>
          <td>${s.status === 'active' ? `<button class="btn" data-cancel="${p.id}">${L('해지', 'Cancel')}</button>` : `<button class="btn" data-resume="${p.id}">${L('다시 구독', 'Resume')}</button>`}</td></tr>`; }).join('')}
      </table></div>
      <div class="panel"><div class="stat"><b>${won(monthly)}</b><span>${L('다음 달 결제 예정 금액 (예시 가격)', 'Next month\'s total (example prices)')}</span></div></div>
      <p class="note">${L('해지 버튼은 가입 버튼만큼 쉽게 (전자상거래법). 해지해도 이미 낸 기간까지는 열려 있어요.', 'Cancelling must be as easy as signing up (e-commerce law). A cancelled product stays open until the paid period ends.')}</p>`;
    } else if (tab === 'billing') {
      body = `<h1>${L('결제 내역', 'Payments')}</h1><p class="sub">${L('카드 영수증은 결제 회사가 보내 드려요.', 'Card receipts come from the payment company.')}</p>
      <div class="panel scroll"><table><tr><th>${L('날짜', 'Date')}</th><th>${L('내용', 'Item')}</th><th>${L('결제 수단', 'Method')}</th><th class="num">${L('금액', 'Amount')}</th><th></th></tr>
      ${fam.receipts.map(r => `<tr><td>${r.date}</td><td>${esc(dv(r.item))}</td><td>${esc(dv(r.method))}</td><td class="num">${won(r.amount)}</td><td><button class="btn" data-receipt>${L('영수증', 'Receipt')}</button></td></tr>`).join('')}</table></div>`;
    } else if (tab === 'reports') {
      body = `<h1>${L('학습 리포트', 'Learning reports')}</h1><p class="sub">${L('이번 달 아이별·상품별 진도예요. 자세한 리포트는 각 상품 안의 부모님 화면에 있어요.', 'This month\'s progress per child and product. Detailed reports are in each product\'s own parent area.')}</p>
      <div class="grid2">${fam.children.map(c => `<div class="panel"><h2><span><img class="mini-face" src="${face(c.face)}" alt="">${esc(c.name)} <span class="dim" style="font-weight:400">· ${L('레벨', 'Level')} ${c.level}</span></span></h2>
        ${P.map(p => { const s = fam.subs[p.id]; return `<div style="display:grid;gap:4px;margin-bottom:12px"><span class="chip ${p.id}" style="justify-self:start">${p.name}</span>
          ${s ? `<div class="prog"><span class="bar ${art(p.id)}"><i style="width:${Math.round(c.progress[p.id] / p.total * 100)}%"></i></span>${c.progress[p.id]}/${p.total}${unit(p)}</div>` : `<span class="dim" style="font-size:13px">${L('구독하지 않은 상품', 'Not subscribed')}</span>`}</div>`; }).join('')}
      </div>`).join('')}</div>`;
    } else if (tab === 'coupons') {
      body = `<h1>${L('쿠폰', 'Coupons')}</h1><p class="sub">${L('아이가 목표를 이루면 부모님께 쿠폰이 와요. 아이 화면에는 쿠폰도 가게도 보이지 않아요.', 'When a child reaches a goal, the parent gets a coupon. Children never see coupons or the shop.')}</p>
      ${fam.coupons.map(c => `<div class="coupon"><span class="dim">${esc(dv(c.why))}</span><b>${esc(dv(c.title))}</b><code>${c.code}</code><span class="dim" style="font-size:13px">${L(c.until + '까지 · 한 번 사용', 'Until ' + c.until + ' · one use')}</span>
        <div class="form-row" style="margin-top:6px"><button class="btn" data-copy="${c.code}">${L('코드 복사', 'Copy code')}</button><button class="btn" data-shop>${L('굿즈 스토어로 가기', 'Go to the goods store')}</button></div></div>`).join('') || `<p class="dim">${L('아직 쿠폰이 없어요', 'No coupons yet')}</p>`}
      <div class="panel"><h2>${L('쿠폰 받는 방법 (예시)', 'How to earn coupons (example)')}</h2><table>
        <tr><td>${L('상품의 한 달 수료증 받기', 'A product\'s monthly certificate')}</td><td>${L('굿즈 10% 할인', '10% off goods')}</td></tr><tr><td>${L('3개월 연속 수료', 'Three months in a row')}</td><td>${L('무료 배송 또는 스티커', 'Free shipping or stickers')}</td></tr></table>
        <p class="note" style="margin-top:10px">${L('스토어는 GP 판매 회사의 기존 쇼핑몰이에요. 쇼핑몰에서 이 코드를 입력해요.', 'The store is GP\'s sales company\'s existing shop. The parent types the code there.')}</p></div>`;
    } else if (tab === 'profiles') {
      body = `<h1>${L('가족 프로필', 'Family profiles')}</h1><p class="sub">${L('아이는 4명까지. 이름 대신 별명도 좋아요. 사진은 받지 않아요.', 'Up to 4 children. A nickname is fine. No photos.')}</p>
      <div class="panel"><div class="kids">${fam.children.map(c => `<div class="kid"><img src="${face(c.face)}" alt=""><b>${esc(c.name)}</b><span class="dim" style="font-size:12px">${L('레벨', 'Level')} ${c.level}</span></div>`).join('')}
        ${fam.children.length < 4 ? `<button class="kid add" id="addKid"><span class="plus">+</span><b>${L('아이 추가', 'Add a child')}</b></button>` : ''}</div></div>`;
    } else if (tab === 'consults') {
      const mine = await API.myInquiries();
      body = `<h1>${L('상담 문의', 'My questions')}</h1><p class="sub">${L('교육센터에 남긴 문의와 선생님의 답변이에요.', 'Questions you left for an education centre, and the answers.')}</p>
      ${mine.map(q => inquiryCard(q, true)).join('') || `<p class="dim">${L('아직 남긴 문의가 없어요.', 'No questions yet.')}</p>`}
      <a class="btn primary" href="#/consult" style="justify-self:start">${L('새 상담 문의', 'Ask a new question')}</a>`;
    } else if (tab === 'privacy') {
      body = `<h1>${L('개인정보·동의', 'Privacy and consent')}</h1><p class="sub">${L('만 14세 미만 아이의 정보는 부모님 동의가 있어야 저장해요.', 'Information about children under 14 is stored only with a parent\'s consent.')}</p>
      <div class="panel"><table>
        <tr><td>${L('만 14세 미만 법정대리인 동의', 'Parent consent (child under 14)')}</td><td><span class="badge ok">${L('동의함', 'Given')} · ${fam.consent.date}</span></td></tr>
        <tr><td>${L('저장하는 아이 정보', 'What we store about the child')}</td><td>${L('별명, 얼굴 그림, 레벨, 진도', 'Nickname, face picture, level, progress')}</td></tr>
        <tr><td>${L('저장하지 않는 정보', 'What we do not store')}</td><td>${L('사진, 생일, 음성 녹음·그림(기기에만 남아요)', 'Photos, birthday, voice recordings and drawings (these stay on the device)')}</td></tr>
        <tr><td>${L('마케팅 알림 (선택)', 'Marketing messages (optional)')}</td><td><label class="switch"><input type="checkbox" ${fam.consent.marketing ? 'checked' : ''} disabled> ${L('받지 않음 (샘플)', 'Off (sample)')}</label></td></tr>
        <tr><td>${L('탈퇴하면', 'If you close the account')}</td><td>${L('아이 정보와 진도를 모두 지워요', 'All child information and progress is deleted')}</td></tr></table></div>`;
    }
    $app.innerHTML = topbar(authNav()) + `<div class="wrap shell">${side}<main class="main">${body}</main></div>`;
    bindCommon();
    $app.querySelectorAll('[data-cancel]').forEach(b => b.onclick = () => {
      const p = prod(b.dataset.cancel);
      modal(`<h2>${L(`${p.name} 해지할까요?`, `Cancel ${p.name}?`)}</h2><p style="margin:0">${L('다음 결제일부터 결제되지 않고, 그날까지는 계속 이용할 수 있어요.', 'No more payments from the next payment day; it stays open until then.')}</p>
        <button class="btn primary big" id="yes">${L('해지하기', 'Cancel subscription')}</button><button class="btn ghost" id="no">${L('그대로 두기', 'Keep it')}</button>`);
      document.getElementById('no').onclick = closeModal;
      document.getElementById('yes').onclick = async () => { await API.cancel(p.id); closeModal(); toast(L('해지 예약됐어요', 'Cancelled; open until the end of the period')); parentArea(tab); };
    });
    $app.querySelectorAll('[data-resume]').forEach(b => b.onclick = async () => { await API.resume(b.dataset.resume); toast(L('다시 구독 중이에요', 'Subscription resumed')); parentArea(tab); });
    $app.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => checkout(b.dataset.buy));
    $app.querySelectorAll('[data-receipt]').forEach(b => b.onclick = () => toast(L('실제 사이트에서는 결제 회사 영수증이 열려요', 'The real site opens the payment company\'s receipt')));
    $app.querySelectorAll('[data-shop]').forEach(b => b.onclick = () => toast(L('실제 사이트에서는 판매 회사 쇼핑몰로 이동해요', 'The real site goes to the sales company\'s shop')));
    $app.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => { navigator.clipboard?.writeText(b.dataset.copy).then(() => toast(L('복사했어요', 'Copied')), () => toast(b.dataset.copy)); });
    const add = document.getElementById('addKid');
    if (add) add.onclick = () => {
      const faces = ['ria', 'syd', 'wanda', 'don', 'coover'];
      modal(`<h2>${L('아이 추가', 'Add a child')}</h2><div class="form-row"><input id="kn" placeholder="${L('이름 또는 별명', 'Name or nickname')}" maxlength="10"></div>
        <div class="kids">${faces.map((f, i) => `<button class="kid ${i ? '' : 'on'}" data-f="${f}"><img src="${face(f)}" alt=""></button>`).join('')}</div>
        <button class="btn primary big" id="kok">${L('추가하기', 'Add')}</button>`);
      let pick = faces[0];
      $modal.querySelectorAll('[data-f]').forEach(x => x.onclick = () => { $modal.querySelectorAll('[data-f]').forEach(y => y.classList.remove('on')); x.classList.add('on'); pick = x.dataset.f; });
      document.getElementById('kok').onclick = async () => {
        const n = document.getElementById('kn').value.trim(); if (!n) { toast(L('이름을 적어 주세요', 'Please type a name')); return; }
        try { await API.addChild(n, pick); closeModal(); toast(L(n + ' 추가됨', n + ' added')); parentArea('profiles'); } catch (e) { toast(L(e.message, 'Up to 4 children per account')); }
      };
    };
  }

  /* ---------- Product placeholder (the gate) ---------- */
  async function play(id, q) {
    const p = prod(id); if (!p) return home();
    const s = API.session();
    const school = q.get('school');
    const can = school || q.get('sample') || (s && s.role === 'parent' && await API.hasProduct(id));
    if (!can) {
      $app.innerHTML = topbar(authNav()) + `<main class="wrap"><div class="auth" style="text-align:center">
        <div style="font-size:42px">🔒</div><h1>${L(`${p.name}은(는) 구독 후 열려요`, `${p.name} opens after you subscribe`)}</h1>
        <p>${L('이 화면이 "구매한 상품만 열기"예요. 서버가 우리 가족의 구독을 확인한 뒤에만 내용을 보내 줘요.', 'This is "only what you bought opens": the server sends the content only after it has checked the family\'s subscription.')}</p>
        <button class="btn primary big" id="sub">${won(p.price)}/${L('월 구독하기', 'month · Subscribe')}</button><a class="btn" href="#/play/${id}?sample=1">${L('맛보기 보기', 'Try a sample')}</a></div></main>`;
      bindCommon();
      document.getElementById('sub').onclick = () => { if (!s || s.role !== 'parent') { sessionStorage.setItem('gpdemo.after', id); location.hash = '#/login'; } else checkout(id); };
      return;
    }
    const bg = id === 'library' ? 'assets/gb.webp' : id === 'math' ? 'assets/forest.webp' : '';
    const who = school ? decodeURIComponent(school) : (q.get('sample') ? L('맛보기', 'Sample') : '');
    $app.innerHTML = `<div class="prod">${topbar(school ? `<a class="btn" href="#/kid">← ${L('친구 바꾸기', 'Next child')}</a>` : `<a class="btn" href="${s && s.role === 'parent' ? '#/family' : '#/'}">← ${L('나가기', 'Leave')}</a>`)}
      <div class="stage" style="${bg ? `background-image:url(${bg})` : 'background:linear-gradient(135deg,#ff8a65,#d65a3c)'}">
        <div class="card"><span class="chip ${id}" style="justify-self:center">${who ? esc(who) : L('구독 중', 'Subscribed')}</span>
          <h1 style="font:600 30px var(--round)">${p.name}</h1>
          <p style="margin:0">${L(`여기서 ${p.name}이(가) 열려요. 이 샘플은 정문과 계정만 보여 주고, 상품 내용은 각 프로젝트에서 만들어요.`, `${p.name} opens here. This sample only shows the front door and accounts; each product is built in its own project.`)}</p>
          ${id === 'library' ? `<a class="btn primary big" href="https://gp-eis.github.io/gb-magic-library/" target="_blank" rel="noopener">${L('지금 있는 데모 열기', 'Open the current demo')} ↗</a>` : `<span class="dim">${L('아직 만드는 중 (Fresh Math 계획 단계, Let’s Go Readers 준비 중)', 'Not built yet (Fresh Math is at the plan stage; Let’s Go Readers is being prepared)')}</span>`}
        </div></div></div>`;
    bindCommon();
  }

  /* ---------- Teacher ---------- */
  function qrCanvas(text, px = 4) {
    // A QR-looking pattern from the text (sample only; a real QR library would draw a scannable one).
    const n = 21, c = document.createElement('canvas'); c.width = c.height = n * px; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#1c2433';
    let h = 0; for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { h = (h * 1103515245 + 12345) >>> 0; if ((h >> 16) & 1) g.fillRect(x * px, y * px, px, px); }
    const eye = (x, y) => { g.fillStyle = '#1c2433'; g.fillRect(x * px, y * px, 7 * px, 7 * px); g.fillStyle = '#fff'; g.fillRect((x + 1) * px, (y + 1) * px, 5 * px, 5 * px); g.fillStyle = '#1c2433'; g.fillRect((x + 2) * px, (y + 2) * px, 3 * px, 3 * px); };
    eye(0, 0); eye(n - 7, 0); eye(0, n - 7);
    return c;
  }
  const progCell = (st, p) => `<td><div class="prog"><span class="bar ${art(p.id)}"><i style="width:${Math.round(st.progress[p.id] / p.total * 100)}%"></i></span>${st.progress[p.id]}/${p.total}</div></td>`;

  async function teacher(view, arg) {
    const sch = await API.school();
    const cls = sch.classes[0];
    const kids = sch.students.filter(s => s.classId === cls.id);
    const side = `<aside class="side"><div class="who"><b>${cls.teacher}</b>${sch.name}</div>
      <a href="#/teacher" class="${!view ? 'on' : ''}">${L('우리 반 진도', 'My class')}</a><a href="#/teacher/cards" class="${view === 'cards' ? 'on' : ''}">${L('로그인 카드', 'Login cards')}</a><a href="#/kid">${L('아이 입장 화면', 'Child log-in screen')}</a></aside>`;
    const avg = key => Math.round(kids.reduce((a, k) => a + k.progress[key], 0) / kids.length * 10) / 10;
    let body = '';
    if (!view) {
      const idle = kids.filter(k => k.lastPlayed === '2주 전');
      body = `<h1>${cls.name} <span class="dim" style="font-size:16px;font-weight:400">· ${L('레벨', 'Level')} ${cls.level} · ${kids.length}${L('명', ' children')}</span></h1>
      <div class="grid3">${P.map(p => `<div class="panel stat"><b>${avg(p.id)}<small class="dim">/${p.total}${unit(p)}</small></b><span>${p.name} ${L('평균', 'average')}</span></div>`).join('')}</div>
      ${idle.length ? `<div class="note" style="background:var(--warn-soft);color:var(--warn)">${L('이번 주에 아직 안 들어온 친구', 'Not played yet this week')}: ${idle.map(k => k.name).join(', ')}</div>` : ''}
      <div class="panel scroll"><h2>${L('아이별 · 상품별 진도 (3월)', 'Progress per child and product (March)')} <button class="btn" data-excel>${L('엑셀로 내보내기', 'Export to Excel')}</button></h2>
      <table><tr><th>${L('이름', 'Name')}</th>${P.map(p => `<th>${p.name}</th>`).join('')}<th>${L('마지막 접속', 'Last played')}</th></tr>
      ${kids.map(k => `<tr class="${k.lastPlayed === '2주 전' ? 'row-alert' : ''}"><td><a href="#/teacher/student/${k.id}" style="color:inherit;text-decoration:none"><img class="mini-face" src="${face(k.face)}" alt="">${k.name}</a></td>${P.map(p => progCell(k, p)).join('')}<td>${dv(k.lastPlayed)}</td></tr>`).join('')}</table></div>`;
    } else if (view === 'student') {
      const k = sch.students.find(s => s.id === arg);
      body = `<a href="#/teacher" class="dim">← ${cls.name}</a><h1><img class="mini-face" style="width:44px;height:44px" src="${face(k.face)}" alt="">${k.name}</h1>
      <div class="grid3">${P.map(p => `<div class="panel"><span class="chip ${p.id}">${p.name}</span><div class="stat" style="margin-top:8px"><b>${k.progress[p.id]}<small class="dim">/${p.total}${unit(p)}</small></b><span>${L('3월 진도', 'March progress')}</span></div><div class="bar ${art(p.id)}" style="margin-top:8px"><i style="width:${Math.round(k.progress[p.id] / p.total * 100)}%"></i></div></div>`).join('')}</div>
      <div class="panel"><h2>${L('선생님 메모 (예시)', 'Teacher note (example)')}</h2><p class="dim" style="margin:0">${L('자세한 활동 기록(어떤 책·트레일·소리를 했는지)은 실제 버전에서 상품별로 보여 줘요. 음성 녹음과 그림은 기기에만 남아서 여기에는 없어요.', 'The real version shows the detailed record per product (which books, trails and sounds). Voice recordings and drawings stay on the device, so they are not here.')}</p></div>`;
    } else if (view === 'cards') {
      body = `<h1>${L('로그인 카드', 'Login cards')}</h1><p class="sub">${L('교실 태블릿은 반 코드나 반 QR을 한 번만 입력해요. 개인 기기에는 아이별 QR 카드를 써요.', 'A classroom tablet needs the class code or class QR only once. Own devices use a QR card per child.')}</p>
      <div class="panel" style="display:flex;gap:24px;align-items:center;flex-wrap:wrap"><div id="classQr"></div><div><span class="eyebrow">${L('반 코드', 'Class code')}</span><div class="code-box">${cls.code}</div><span class="dim">${cls.name} · ${L('태블릿에서 입력', 'type it on the tablet')}</span></div></div>
      <div class="panel"><h2>${L('아이별 카드', 'Cards per child')} <span class="dim" style="font-size:13px;font-weight:400">${L('실제로는 인쇄용 PDF', 'a printable PDF in the real version')}</span></h2><div class="cards" id="cards">
      ${kids.map(k => `<div class="lcard" data-id="${k.id}"><img class="f" src="${face(k.face)}" alt=""><b>${k.name}</b><span class="pp" title="${L('그림 비밀번호', 'Picture password')}">${k.picPass.join('')}</span></div>`).join('')}</div></div>`;
    }
    $app.innerHTML = topbar(authNav()) + `<div class="wrap shell">${side}<main class="main">${body}</main></div>`;
    bindCommon();
    $app.querySelectorAll('[data-excel]').forEach(b => b.onclick = () => toast(L('실제 버전에서는 엑셀 파일로 내려받아요', 'The real version downloads an Excel file')));
    if (view === 'cards') {
      document.getElementById('classQr').appendChild(Object.assign(qrCanvas(cls.code, 6), { className: 'qr' }));
      $app.querySelectorAll('.lcard').forEach(el => el.insertBefore(qrCanvas(el.dataset.id, 3), el.querySelector('b')));
    }
  }

  /* ---------- School admin ---------- */
  async function admin(tab = '') {
    const sch = await API.school();
    const Lc = sch.licence;
    const count = c => c.count != null ? c.count : sch.students.filter(s => s.classId === c.id).length;
    const TABS = [['', L('한눈에 보기', 'Overview')], ['classes', L('반', 'Classes')], ['teachers', L('선생님', 'Teachers')], ['students', L('원생', 'Children')], ['schedule', L('시간표', 'Timetable')], ['billing', L('이용권 · 청구서', 'Licence and invoices')]];
    const side = `<aside class="side"><div class="who"><b>${sch.admin}</b>${sch.name}</div>
      ${TABS.map(([k, n]) => `<a href="#/admin${k ? '/' + k : ''}" class="${k === tab ? 'on' : ''}">${n}</a>`).join('')}</aside>`;
    const pname = id => prod(id).name.replace('GB Magic ', '');
    let body = '';
    if (!tab) {
      body = `<h1>${sch.name}</h1><p class="sub">${L('2027년 3월 · 이용권', 'March 2027 · licence')} ${Lc.from} ~ ${Lc.to}</p>
      <div class="grid3">
        <div class="panel stat"><b>${sch.classes.length}</b><span>${L('반', 'Classes')}</span></div>
        <div class="panel stat"><b>${Lc.used}<small class="dim">/${Lc.seats}</small></b><span>${L('사용 중인 자리', 'Seats used')}</span></div>
        <div class="panel stat"><b>${Lc.products.length}</b><span>${L('이용 상품', 'Products')}</span></div>
      </div>
      <div class="panel scroll"><h2>${L('반별 이번 주', 'This week by class')}</h2><table><tr><th>${L('반', 'Class')}</th><th>${L('선생님', 'Teacher')}</th><th class="num">${L('원생', 'Children')}</th>${P.map(p => `<th>${p.name}</th>`).join('')}</tr>
      ${sch.classes.map((c, i) => `<tr><td>${esc(c.name)}</td><td>${esc(dv(c.teacher))}</td><td class="num">${count(c)}</td>${P.map((p, j) => c.months[p.id] ? `<td><div class="prog"><span class="bar ${art(p.id)}"><i style="width:${[58, 41, 33][(i + j) % 3]}%"></i></span>${[58, 41, 33][(i + j) % 3]}%</div></td>` : `<td class="dim">${L('닫힘', 'Closed')}</td>`).join('')}</tr>`).join('')}</table></div>`;
    } else if (tab === 'classes') {
      body = `<h1>${L('반', 'Classes')}</h1><p class="sub">${L('반마다 선생님, 레벨, 열어 줄 상품을 정해요.', 'Each class gets a teacher, a level and the products to open.')}</p>
      <div class="panel scroll"><table><tr><th>${L('반', 'Class')}</th><th>${L('선생님', 'Teacher')}</th><th>${L('레벨', 'Level')}</th><th>${L('반 코드', 'Class code')}</th>${P.map(p => `<th>${p.name}<br><span class="dim">${L('3월 열기', 'March open')}</span></th>`).join('')}</tr>
      ${sch.classes.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(dv(c.teacher))}</td><td>${c.level}</td><td><code>${c.code}</code></td>${P.map(p => `<td><label class="switch"><input type="checkbox" data-month="${c.id}|${p.id}" ${c.months[p.id] ? 'checked' : ''}> ${c.months[p.id] ? L('열림', 'Open') : L('닫힘', 'Closed')}</label></td>`).join('')}</tr>`).join('')}</table></div>
      <div class="panel"><h2>${L('새 반 만들기', 'New class')}</h2><form class="form-row" id="newClass"><input id="cn" placeholder="${L('반 이름 (예: 꽃잎반)', 'Class name (e.g. 꽃잎반)')}" required><select id="ct">${sch.teachers.map(t => `<option>${esc(t.name)}</option>`).join('')}</select><select id="cl"><option>A</option><option selected>B</option><option>C</option></select><button class="btn primary">${L('만들기', 'Create')}</button></form></div>`;
    } else if (tab === 'teachers') {
      body = `<h1>${L('선생님', 'Teachers')}</h1><p class="sub">${L('원장님이 선생님을 초대해요. 선생님은 받은 링크를 열고 카카오·네이버·구글·이메일로 가입하면 바로 맡은 반이 보여요.', 'The principal invites teachers. A teacher opens the link, signs up with Kakao, Naver, Google or email, and sees their class straight away.')}</p>
      <div class="panel scroll"><table><tr><th>${L('이름', 'Name')}</th><th>${L('이메일 · 휴대폰', 'Email or phone')}</th><th>${L('로그인', 'Login')}</th><th>${L('상태', 'Status')}</th><th>${L('맡은 반', 'Class')}</th><th></th></tr>
      ${sch.teachers.map(t => `<tr><td>${esc(t.name)}</td><td>${esc(t.contact)}</td><td>${t.login}</td>
        <td>${t.status === '사용 중' ? `<span class="badge ok">${dv(t.status)}</span>` : `<span class="badge warn">${dv(t.status)}</span>`}</td>
        <td><select data-assign="${t.id}" aria-label="${esc(t.name)}"><option value="">${L('반 고르기', 'Pick a class')}</option>${sch.classes.map(c => `<option value="${c.id}" ${t.classes.includes(c.id) ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></td>
        <td style="white-space:nowrap">${t.status !== '사용 중' ? `<button class="btn" data-accept="${t.id}">${L('샘플: 수락하기', 'Sample: accept')}</button> ` : ''}<button class="btn ghost" data-remove="${t.id}">${L('내보내기', 'Remove')}</button></td></tr>`).join('')}</table></div>
      <div class="panel"><h2>${L('선생님 초대하기', 'Invite a teacher')}</h2><form class="form-row" id="invite">
        <input id="tn" placeholder="${L('이름 (예: 김선생님)', 'Name (e.g. 김선생님)')}" required><input id="tc" placeholder="${L('이메일 또는 휴대폰 번호', 'Email or phone number')}" required>
        <select id="tcl"><option value="">${L('맡을 반 (나중에)', 'Class (later)')}</option>${sch.classes.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
        <button class="btn primary">${L('초대 보내기', 'Send invite')}</button></form>
        <p class="note" style="margin-top:10px">${L('초대는 알림톡이나 이메일로 가요. 선생님은 자기 반만 보고, 다른 반·결제·가정 정보는 못 봐요. 그만둔 선생님은 "내보내기"하면 바로 못 들어와요.', 'The invite goes by KakaoTalk message or email. Teachers see only their own class, never other classes, payments or family details. "Remove" locks out a teacher who has left, straight away.')}</p></div>`;
    } else if (tab === 'students') {
      body = `<h1>${L('원생', 'Children')}</h1><p class="sub">${L('성과 이름(또는 이름만), 반, 얼굴 그림만 받아요. 사진·생일·주민번호는 받지 않아요.', 'Only a (first) name, class and face picture. No photos, birthdays or ID numbers.')}</p>
      <div class="panel" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="btn" data-x>${L('엑셀 명단 올리기', 'Upload an Excel list')}</button><button class="btn" data-x>${L('한 명 추가', 'Add one child')}</button><span class="dim" style="font-size:13px">${L('3월에는 GP가 명단을 받아 대신 넣어 드려요.', 'In March, GP loads the list for the school.')}</span></div>
      <div class="panel scroll"><table><tr><th>${L('이름', 'Name')}</th><th>${L('반', 'Class')}</th><th>${L('그림 비밀번호', 'Picture password')}</th><th>${L('가정 연결', 'Home link')}</th></tr>
      ${sch.students.map((k, i) => `<tr><td><img class="mini-face" src="${face(k.face)}" alt="">${k.name}</td><td>${sch.classes.find(c => c.id === k.classId).name}</td><td style="font-size:18px">${k.picPass.join('')}</td><td>${i % 4 === 0 ? `<span class="badge ok">${L('부모님 연결', 'Parent linked')}</span>` : `<span class="badge muted">${L('코드 보내기', 'Send code')}</span>`}</td></tr>`).join('')}</table></div>`;
    } else if (tab === 'schedule') {
      const days = L('월,화,수,목,금', 'Mon,Tue,Wed,Thu,Fri').split(',');
      body = `<h1>${L('시간표', 'Timetable')}</h1><p class="sub">${L('반마다 요일별로 어떤 상품을 할지 정해요. 수업 시간 밖에는 교실 태블릿을 잠글 수도 있어요 (선택).', 'Which product each class uses on which day. Classroom tablets can be locked outside class time (optional).')}</p>
      <div class="panel scroll"><table class="sched"><tr><th>${L('반', 'Class')}</th>${days.map(d => `<th>${d}</th>`).join('')}</tr>
      ${sch.classes.map(c => `<tr><td style="text-align:left">${esc(c.name)}</td>${(sch.schedule[c.id] || []).map(x => `<td>${x ? `<span class="chip ${x}">${pname(x)}</span>` : '<span class="dim">-</span>'}</td>`).join('')}</tr>`).join('')}</table></div>
      <p class="note">${L('시간표 편집은 2단계(4~6월) 기능이에요. 3월에는 보기만 있어요.', 'Editing the timetable comes in phase 2 (April-June). In March it is view-only.')}</p>`;
    } else if (tab === 'billing') {
      body = `<h1>${L('이용권 · 청구서', 'Licence and invoices')}</h1>
      <div class="panel"><table><tr><td>${L('상품', 'Products')}</td><td>${Lc.products.map(id => `<span class="chip ${id}">${prod(id).name}</span>`).join(' ')}</td></tr>
        <tr><td>${L('자리', 'Seats')}</td><td>${L(`${Lc.seats}명 (사용 ${Lc.used}명)`, `${Lc.seats} (${Lc.used} used)`)}</td></tr><tr><td>${L('기간', 'Period')}</td><td>${Lc.from} ~ ${Lc.to}</td></tr></table>
        <div class="form-row" style="margin-top:12px"><button class="btn" data-x>${L('자리 추가 견적 요청', 'Ask for a quote for more seats')}</button></div></div>
      <div class="panel scroll"><h2>${L('청구서', 'Invoices')}</h2><table><tr><th>${L('번호', 'No.')}</th><th>${L('날짜', 'Date')}</th><th>${L('내용', 'Item')}</th><th class="num">${L('금액', 'Amount')}</th><th>${L('입금', 'Payment')}</th><th>${L('세금계산서', 'Tax invoice')}</th></tr>
      ${sch.invoices.map(v => `<tr><td>${v.no}</td><td>${v.date}</td><td>${esc(dv(v.item))}</td><td class="num">${won(v.amount)}</td><td><span class="badge ok">${dv(v.status)}</span></td><td>${dv(v.tax)}</td></tr>`).join('')}</table></div>
      <p class="note">${L('기관은 견적서 → 청구서·세금계산서 → 계좌이체. 가격은 예시예요.', 'Schools: quote → invoice and tax invoice → bank transfer. Prices are examples.')}</p>`;
    }
    $app.innerHTML = topbar(authNav()) + `<div class="wrap shell">${side}<main class="main">${body}</main></div>`;
    bindCommon();
    $app.querySelectorAll('[data-x]').forEach(b => b.onclick = notYet);
    $app.querySelectorAll('[data-month]').forEach(i => i.onchange = async () => { const [c, p] = i.dataset.month.split('|'); await API.setMonth(c, p, i.checked); toast(i.checked ? L('열었어요', 'Opened') : L('닫았어요', 'Closed')); admin(tab); });
    const inv = document.getElementById('invite');
    if (inv) inv.onsubmit = async e => {
      e.preventDefault();
      const n = document.getElementById('tn').value.trim(), c = document.getElementById('tc').value.trim();
      await API.inviteTeacher(n, c, document.getElementById('tcl').value);
      modal(`<h2>${L('초대를 보냈어요', 'Invite sent')}</h2><p style="margin:0">${L(`<b>${esc(n)}</b>님(${esc(c)})에게 초대 링크가 가요.`, `An invite link goes to <b>${esc(n)}</b> (${esc(c)}).`)}</p>
        <div class="note">${L('[GPEIS] 해바라기 영어유치원에서 선생님으로 초대했어요. 아래 링크를 눌러 가입해 주세요. https://…/invite/XXXX (샘플)', '[GPEIS] 해바라기 영어유치원 has invited you as a teacher. Tap the link below to sign up. https://…/invite/XXXX (sample)')}</div>
        <button class="btn primary big" id="ok">${L('확인', 'OK')}</button>`);
      document.getElementById('ok').onclick = () => { closeModal(); admin('teachers'); };
    };
    $app.querySelectorAll('[data-accept]').forEach(b => b.onclick = async () => { await API.acceptInvite(b.dataset.accept); toast(L('선생님이 가입했어요 (샘플)', 'The teacher has signed up (sample)')); admin('teachers'); });
    $app.querySelectorAll('[data-assign]').forEach(s => s.onchange = async () => { if (!s.value) return; await API.assignTeacher(s.dataset.assign, s.value); toast(L('맡은 반을 바꿨어요', 'Class changed')); admin('teachers'); });
    $app.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => {
      modal(`<h2>${L('이 선생님을 내보낼까요?', 'Remove this teacher?')}</h2><p style="margin:0">${L('바로 로그인할 수 없게 돼요. 반과 아이들의 진도는 그대로 남아요.', 'They can no longer log in. The class and the children\'s progress stay.')}</p>
        <button class="btn primary big" id="yes">${L('내보내기', 'Remove')}</button><button class="btn ghost" id="no">${L('취소', 'Cancel')}</button>`);
      document.getElementById('no').onclick = closeModal;
      document.getElementById('yes').onclick = async () => { await API.removeTeacher(b.dataset.remove); closeModal(); toast(L('내보냈어요', 'Removed')); admin('teachers'); };
    });
    const f = document.getElementById('newClass');
    if (f) f.onsubmit = async e => { e.preventDefault(); await API.addClass(document.getElementById('cn').value.trim(), document.getElementById('ct').value, document.getElementById('cl').value); toast(L('새 반을 만들었어요', 'Class created')); admin('classes'); };
  }

  /* ---------- GP staff (운영자): every school, family and payment ---------- */
  const WHY = ['기관 명단 등록 도움', '부모님 문의 응대', '결제·환불 처리', '오류 확인'];
  function askWhy(what, next) {
    modal(`<h2>${L('왜 여는지 골라 주세요', 'Why are you opening this?')}</h2><p style="margin:0">${esc(what)}</p>
      <div class="demo-pick">${WHY.map(w => `<button data-why="${w}"><b>${dv(w)}</b></button>`).join('')}</div>
      <p class="note">${L('아이 정보가 있는 화면은 열 때마다 누가·언제·왜 열었는지 기록돼요 (개인정보 보호). 기관과 맺는 위탁 계약에도 적혀요.', 'Every time a screen with children\'s information is opened, who, when and why is written down (privacy rule). The data-processing agreement with each school says so too.')}</p>
      <button class="btn ghost" id="no">${L('취소', 'Cancel')}</button>`);
    document.getElementById('no').onclick = () => { closeModal(); history.back(); };
    $modal.querySelectorAll('[data-why]').forEach(b => b.onclick = async () => { await API.staffOpen(what, b.dataset.why); closeModal(); next(); });
  }
  const shown = new Set();
  async function staff(tab = '', arg) {
    const o = await API.staffOverview();
    const TABS = [['', L('한눈에 보기', 'Overview')], ['schools', L('기관', 'Schools')], ['families', L('가정 회원', 'Families')], ['payments', L('결제', 'Payments')], ['consults', L('교육센터 문의', 'Centre inquiries')], ['log', L('열람 기록', 'Access log')], ['data', L('데이터 보기', 'Data')]];
    const side = `<aside class="side"><div class="who"><b>${L('GP 운영자', 'GP staff')}</b>${L('모든 기관·가정 · 2단계 로그인', 'All schools and families · two-step login')}</div>
      ${TABS.map(([k, n]) => `<a href="#/staff${k ? '/' + k : ''}" class="${k === tab || (k === 'schools' && tab === 'school') || (k === 'families' && tab === 'family') ? 'on' : ''}">${n}</a>`).join('')}</aside>`;
    const allReceipts = o.families.flatMap(f => f.receipts.map(r => ({ ...r, fam: f.name, famId: f.id })));
    const pname = id => prod(id).name.replace('GB Magic ', '');
    const famSubs = f => P.filter(p => f.subs[p.id]).map(p => `<span class="chip ${p.id}">${pname(p.id)}${f.subs[p.id].status === 'cancelled' ? L(' (해지 예약)', ' (cancelled)') : ''}</span>`).join(' ') || `<span class="dim">${L('없음', 'None')}</span>`;
    let body = '';
    if (!tab) {
      const active = o.families.reduce((a, f) => a + Object.values(f.subs).filter(s => s.status === 'active').length, 0);
      body = `<h1>${L('운영 한눈에 보기', 'Overview')}</h1><p class="sub">${L('2027년 3월 · 샘플 숫자', 'March 2027 · sample numbers')}</p>
      <div class="grid3">
        <div class="panel stat"><b>${o.families.length}</b><span>${L('가정 회원', 'Families')}</span></div>
        <div class="panel stat"><b>${active}</b><span>${L('개인 구독 (상품 기준)', 'Home subscriptions (per product)')}</span></div>
        <div class="panel stat"><b>${o.schools.length}</b><span>${L('기관 (이용·체험·견적)', 'Schools (active, trial, quote)')}</span></div>
        <div class="panel stat"><b>${o.schools.reduce((a, s) => a + s.used, 0)}</b><span>${L('기관 원생 자리 사용', 'School seats used')}</span></div>
        <div class="panel stat"><b>${won(allReceipts.reduce((a, r) => a + r.amount, 0))}</b><span>${L('이번 달 개인 결제', 'Home payments this month')}</span></div>
        <div class="panel stat"><b>${o.schools.filter(s => s.paid === '입금 전').length}</b><span>${L('입금 기다리는 기관', 'Schools not paid yet')}</span></div>
      </div>
      <div class="panel"><h2>${L('할 일', 'To do')}</h2><table>
        ${o.schools.filter(s => s.paid === '입금 전').map(s => `<tr><td>${s.name}</td><td>${L('견적 보냄 · 입금 확인 후 이용권 켜기', 'Quote sent · switch the licence on when paid')}</td></tr>`).join('')}
        ${o.schools.filter(s => s.status.startsWith('무료')).map(s => `<tr><td>${s.name}</td><td>${dv(s.status)} · ${L('구매 안내 연락', 'contact about buying')}</td></tr>`).join('')}
        ${o.families.filter(f => Object.values(f.subs).some(x => x.status === 'cancelled')).map(f => `<tr><td>${f.name}</td><td>${L('해지 예약 · 이유 확인 (선택)', 'Cancelled · ask why (optional)')}</td></tr>`).join('')}</table></div>`;
    } else if (tab === 'schools') {
      body = `<h1>${L('기관', 'Schools')}</h1><p class="sub">${L('기관을 만들고, 이용권(상품·자리·기간)을 켜고, 입금을 확인해요.', 'Create schools, switch licences on (products, seats, period) and check payments.')}</p>
      <div class="panel scroll"><table><tr><th>${L('기관', 'School')}</th><th>${L('담당', 'Contact')}</th><th>${L('상품', 'Products')}</th><th class="num">${L('자리', 'Seats')}</th><th>${L('상태', 'Status')}</th><th>${L('입금', 'Payment')}</th><th>${L('이용 끝', 'Ends')}</th></tr>
      ${o.schools.map(s => `<tr><td><a href="#/staff/school/${s.id}">${s.name}</a></td><td>${s.admin}</td><td>${s.products.map(id => `<span class="chip ${id}">${pname(id)}</span>`).join(' ')}</td><td class="num">${s.used}/${s.seats}</td><td>${dv(s.status)}</td><td>${s.paid === '입금 완료' ? `<span class="badge ok">${dv(s.paid)}</span>` : s.paid === '입금 전' ? `<span class="badge warn">${dv(s.paid)}</span>` : '-'}</td><td>${s.to}</td></tr>`).join('')}</table></div>
      <div class="panel"><h2>${L('새 기관 만들기', 'New school')}</h2><div class="form-row"><input placeholder="${L('기관 이름', 'School name')}"><input placeholder="${L('원장님 이메일 또는 휴대폰', 'Principal\'s email or phone')}"><button class="btn primary" data-x>${L('만들고 원장님 초대', 'Create and invite the principal')}</button></div>
      <p class="note" style="margin-top:10px">${L('GP가 기관과 원장님 계정을 만들면, 원장님이 선생님을 초대하고 원생을 넣어요. 3월에는 GP가 엑셀 명단으로 대신 넣어 드려요.', 'GP creates the school and the principal\'s account; the principal then invites teachers and adds children. In March, GP loads the children from an Excel list.')}</p></div>`;
    } else if (tab === 'school') {
      const key = 'school:' + arg, nm = o.schools.find(s => s.id === arg).name;
      if (!shown.has(key)) { askWhy(L(`${nm} 상세 정보 (원생 명단 포함)`, `${nm} details (including the children list)`), () => { shown.add(key); staff('school', arg); }); return; }
      if (arg !== 'sch1') { body = `<a href="#/staff/schools" class="dim">← ${L('기관', 'Schools')}</a><h1>${nm}</h1><p class="note">${L('샘플에서는 해바라기 영어유치원만 자세히 채워져 있어요.', 'In the sample only 해바라기 영어유치원 is filled in.')}</p>`; }
      else {
        const sch = await API.school();
        body = `<a href="#/staff/schools" class="dim">← ${L('기관', 'Schools')}</a><h1>${sch.name}</h1><p class="sub">${L('원장님', 'Principal')} ${sch.admin} · ${L('이용권', 'Licence')} ${sch.licence.from} ~ ${sch.licence.to} · ${L('자리', 'Seats')} ${sch.licence.used}/${sch.licence.seats}</p>
        <div class="grid2">
          <div class="panel"><h2>${L('반', 'Classes')}</h2><table>${sch.classes.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(dv(c.teacher))}</td><td><code>${c.code}</code></td></tr>`).join('')}</table></div>
          <div class="panel"><h2>${L('선생님', 'Teachers')}</h2><table>${sch.teachers.map(t => `<tr><td>${esc(t.name)}</td><td>${esc(t.contact)}</td><td>${dv(t.status)}</td></tr>`).join('')}</table></div>
        </div>
        <div class="panel scroll"><h2>${L('원생 진도 (해바라기반)', 'Children\'s progress (해바라기반)')}</h2><table><tr><th>${L('이름', 'Name')}</th>${P.map(p => `<th>${p.name}</th>`).join('')}<th>${L('마지막 접속', 'Last played')}</th></tr>
        ${sch.students.map(k => `<tr><td><img class="mini-face" src="${face(k.face)}" alt="">${k.name}</td>${P.map(p => progCell(k, p)).join('')}<td>${dv(k.lastPlayed)}</td></tr>`).join('')}</table></div>
        <div class="panel"><h2>${L('청구서', 'Invoices')}</h2><table>${sch.invoices.map(v => `<tr><td>${v.no}</td><td>${esc(dv(v.item))}</td><td class="num">${won(v.amount)}</td><td>${dv(v.status)}</td><td>${dv(v.tax)}</td></tr>`).join('')}</table>
        <div class="form-row" style="margin-top:10px"><button class="btn" data-x>${L('견적서 만들기', 'Make a quote')}</button><button class="btn" data-x>${L('입금 확인 → 이용권 켜기', 'Payment received → switch licence on')}</button><button class="btn" data-x>${L('세금계산서 (홈택스)', 'Tax invoice (Hometax)')}</button></div></div>`;
      }
    } else if (tab === 'families') {
      body = `<h1>${L('가정 회원', 'Families')}</h1><p class="sub">${L('개인으로 구독한 부모님들이에요. 이름을 누르면 상세 정보가 열려요 (열람 기록 남음).', 'Parents who subscribe at home. Click a name for details (the access is logged).')}</p>
      <div class="form-row"><input placeholder="${L('이름, 이메일로 찾기', 'Search by name or email')}" aria-label="${L('찾기', 'Search')}" style="max-width:320px"></div>
      <div class="panel scroll"><table><tr><th>${L('부모님', 'Parent')}</th><th>${L('로그인', 'Login')}</th><th class="num">${L('아이', 'Children')}</th><th>${L('구독', 'Subscriptions')}</th><th>${L('기관 연결', 'School link')}</th><th>${L('가입 동의', 'Consent')}</th></tr>
      ${o.families.map(f => `<tr><td><a href="#/staff/family/${f.id}">${f.name}</a><br><span class="dim" style="font-size:12px">${f.email}</span></td><td>${f.login}</td><td class="num">${f.children.length}</td><td>${famSubs(f)}</td><td>${f.schoolLink ? esc(f.schoolLink) : '<span class="dim">-</span>'}</td><td>${f.consent.date}</td></tr>`).join('')}</table></div>`;
    } else if (tab === 'family') {
      const f = o.families.find(x => x.id === arg), key = 'family:' + arg;
      if (!shown.has(key)) { askWhy(L(`${f.name} 님 가정 상세 정보 (아이 정보 포함)`, `${f.name} family details (including children)`), () => { shown.add(key); staff('family', arg); }); return; }
      body = `<a href="#/staff/families" class="dim">← ${L('가정 회원', 'Families')}</a><h1>${f.name}</h1><p class="sub">${f.email} · ${f.login} · ${L('동의', 'consent')} ${f.consent.date} · ${L('마케팅 수신', 'marketing')} ${f.consent.marketing ? L('예', 'yes') : L('아니요', 'no')}</p>
      <div class="grid2">
        <div class="panel"><h2>${L('아이', 'Children')}</h2><table>${f.children.map(c => `<tr><td><img class="mini-face" src="${face(c.face)}" alt="">${esc(c.name)}</td><td>${L('레벨', 'Level')} ${c.level}</td><td>${c.fromSchool ? L('기관에서 연결', 'Linked from school') : ''}</td></tr>`).join('')}</table></div>
        <div class="panel"><h2>${L('구독', 'Subscriptions')}</h2><table>${P.filter(p => f.subs[p.id]).map(p => `<tr><td><span class="chip ${p.id}">${p.name}</span></td><td>${f.subs[p.id].status === 'active' ? L('구독 중', 'Active') : L('해지 예약', 'Cancelled')}</td><td>${esc(dv(f.subs[p.id].method))}</td><td>${f.subs[p.id].next}</td></tr>`).join('') || `<tr><td class="dim">${L('구독 없음', 'No subscriptions')}</td></tr>`}</table></div>
      </div>
      <div class="panel scroll"><h2>${L('결제', 'Payments')}</h2><table>${f.receipts.map(r => `<tr><td>${r.date}</td><td>${esc(dv(r.item))}</td><td>${esc(dv(r.method))}</td><td class="num">${won(r.amount)}</td><td><button class="btn" data-x>${L('환불', 'Refund')}</button></td></tr>`).join('') || `<tr><td class="dim">${L('결제 없음', 'No payments')}</td></tr>`}</table></div>
      <div class="form-row"><button class="btn" data-x>${L('구독 직접 켜기 (오류 시)', 'Switch a subscription on by hand (if something broke)')}</button><button class="btn" data-x>${L('쿠폰 보내기', 'Send a coupon')}</button><button class="btn" data-x>${L('탈퇴 처리 (데이터 삭제)', 'Close account (delete data)')}</button></div>
      <p class="note">${L('카드 번호는 GP도 볼 수 없어요 (결제 회사에만 있어요). 아이의 음성·그림은 기기에만 있어서 여기에 없어요.', 'GP cannot see card numbers either (only the payment company has them). Children\'s voices and drawings stay on the device, so they are not here.')}</p>`;
    } else if (tab === 'payments') {
      body = `<h1>${L('결제', 'Payments')}</h1><p class="sub">${L('개인 결제는 결제 회사에서 자동으로 들어와요. 기관은 계좌이체 입금을 확인해요.', 'Home payments arrive automatically from the payment company. School bank transfers are checked by hand.')}</p>
      <div class="panel scroll"><table><tr><th>${L('날짜', 'Date')}</th><th>${L('부모님', 'Parent')}</th><th>${L('내용', 'Item')}</th><th>${L('결제 수단', 'Method')}</th><th class="num">${L('금액', 'Amount')}</th></tr>
      ${allReceipts.sort((a, b) => b.date.localeCompare(a.date)).map(r => `<tr><td>${r.date}</td><td>${r.fam}</td><td>${esc(dv(r.item))}</td><td>${esc(dv(r.method))}</td><td class="num">${won(r.amount)}</td></tr>`).join('')}</table></div>
      <p class="note">${L('실제로는 결제 회사(토스페이먼츠·포트원) 관리자 화면에도 같은 내역이 있어요. 환불은 거기서 하거나 여기서 버튼으로 요청해요.', 'The payment company\'s own admin screen (Toss Payments or PortOne) shows the same list. Refunds are made there, or requested from here.')}</p>`;
    } else if (tab === 'log') {
      body = `<h1>${L('열람 기록', 'Access log')}</h1><p class="sub">${L('GP 운영자가 기관·가정 상세 정보를 열 때마다 남아요. 지울 수 없어요.', 'Written every time GP staff open a school\'s or family\'s details. It cannot be deleted.')}</p>
      <div class="panel scroll"><table><tr><th>${L('언제', 'When')}</th><th>${L('누가', 'Who')}</th><th>${L('무엇을', 'What')}</th><th>${L('왜', 'Why')}</th></tr>
      ${o.log.map(l => `<tr><td>${l.at}</td><td>${dv(l.who)}</td><td>${esc(dv(l.what))}</td><td>${esc(dv(l.why))}</td></tr>`).join('')}</table></div>`;
    } else if (tab === 'consults') {
      const { items, counselors } = await API.allInquiries();
      const covered = new Set(counselors.flatMap(c => c.areas));
      const opt = q => `<select data-assign-q="${q.id}" aria-label="${q.id}"><option value="">${L('본사 (미배정)', 'GP head office (none)')}</option>${counselors.map(c => `<option value="${c.id}" ${q.counselor === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>`;
      body = `<h1>${L('교육센터 문의', 'Centre inquiries')}</h1><p class="sub">${L('모든 지역의 상담 문의예요. 담당 선생님이 없는 지역은 본사가 답하거나 선생님을 배정해요.', 'Inquiries from every area. Where no counsellor covers an area, GP head office answers or assigns one.')}</p>
      <div class="grid3">
        <div class="panel stat"><b>${items.filter(q => q.status === 'new').length}</b><span>${L('답변 기다리는 문의', 'Waiting for an answer')}</span></div>
        <div class="panel stat"><b>${items.filter(q => !q.counselor).length}</b><span>${L('담당 선생님 없음', 'No counsellor yet')}</span></div>
        <div class="panel stat"><b>${counselors.length}</b><span>${L('상담 선생님', 'Counsellors')}</span></div>
      </div>
      <div class="panel scroll"><h2>${L('문의 목록', 'Inquiries')}</h2><table><tr><th>${L('번호', 'No.')}</th><th>${L('날짜', 'Date')}</th><th>${L('지역', 'Area')}</th><th>${L('보호자', 'Parent')}</th><th>${L('상태', 'Status')}</th><th>${L('담당', 'Counsellor')}</th></tr>
      ${items.map(q => `<tr class="${q.counselor ? '' : 'row-alert'}"><td>${q.id}</td><td>${q.at}</td><td>${q.sido} ${q.gu}</td><td>${esc(q.name)}</td><td>${statusBadge(q)}</td><td>${opt(q)}</td></tr>`).join('')}</table></div>
      <div class="panel"><h2>${L('서울 담당 지역', 'Seoul coverage')}</h2>${seoulMap(gu => covered.has('서울특별시 ' + gu) ? 'on' : '', null)}
        <p class="note" style="margin-top:10px">${L('색칠된 구는 담당 선생님이 있어요. 선생님은 GP가 모집해서 지역을 맡겨요.', 'Coloured districts have a counsellor. GP recruits counsellors and gives each one areas.')}</p></div>
      <div class="panel"><h2>${L('상담 선생님', 'Counsellors')} <button class="btn" data-x>${L('선생님 추가', 'Add a counsellor')}</button></h2><table>${counselors.map(c => `<tr><td>${c.name}</td><td>${c.areas.map(a => a.replace('서울특별시 ', '서울 ')).join(', ')}</td></tr>`).join('')}</table></div>`;
    } else if (tab === 'data') {
      const db = API.raw();
      const rows = [
        ['families', L('가정', 'families'), Object.keys(db.families).length, L('부모님 계정, 아이, 구독, 결제 내역, 쿠폰, 동의', 'Parent accounts, children, subscriptions, payments, coupons, consent')],
        ['children', L('아이', 'children'), Object.values(db.families).reduce((a, f) => a + f.children.length, 0) + db.school.students.length, L('가정 아이 + 기관 원생 (별명, 얼굴 그림, 레벨, 진도)', 'Home children + school children (nickname, face picture, level, progress)')],
        ['schools', L('기관', 'schools'), 1 + db.otherSchools.length, L('이용권, 반, 선생님, 시간표, 청구서', 'Licence, classes, teachers, timetable, invoices')],
        ['teachers', L('선생님', 'teachers'), db.school.teachers.length, L('이름, 연락처, 맡은 반', 'Name, contact, class')],
        ['inquiries', L('상담 문의', 'inquiries'), db.inquiries.length, L('지역, 보호자 이름·연락처, 문의 내용, 답변, 담당 선생님', 'Area, parent name and contact, question, answer, counsellor')],
        ['counselors', L('상담 선생님', 'counsellors'), db.counselors.length, L('이름, 맡은 지역', 'Name, areas')],
        ['accessLog', L('열람 기록', 'access log'), db.accessLog.length, L('GP 운영자 열람 기록', 'GP staff access log')]
      ];
      body = `<h1>${L('데이터 보기', 'Data')}</h1><p class="sub">${L('샘플의 "데이터베이스"예요. 지금은 이 브라우저 안(localStorage, 이름 gpdemo.db)에만 있어요.', 'The sample\'s "database". For now it lives only inside this browser (localStorage, named gpdemo.db).')}</p>
      <div class="panel scroll"><table><tr><th>${L('표', 'Table')}</th><th class="num">${L('개수', 'Rows')}</th><th>${L('들어 있는 것', 'What is in it')}</th></tr>${rows.map(r => `<tr><td>${r[0]} <span class="dim">(${r[1]})</span></td><td class="num">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table></div>
      <div class="panel"><h2>${L('원본 데이터 (JSON)', 'Raw data (JSON)')} <button class="btn" id="copyDb">${L('복사', 'Copy')}</button></h2><pre style="max-height:420px;overflow:auto;font:12px/1.5 Consolas,'Noto Sans KR',monospace;background:var(--bg);border-radius:10px;padding:12px;margin:0">${esc(JSON.stringify(db, null, 2))}</pre></div>
      <p class="note">${L('실제 버전에서는 이 표들이 Supabase(서울) 데이터베이스에 있고, Supabase 관리 화면에서도 볼 수 있어요. 처음 데이터는 platform/sample/backend.js의 seed()에 적혀 있어요.', 'In the real version these tables live in a Supabase database (Seoul), also visible in Supabase\'s admin screen. The starting data is written in seed() in platform/sample/backend.js.')}</p>`;
    }
    $app.innerHTML = topbar(authNav()) + `<div class="wrap shell">${side}<main class="main">${body}</main></div>`;
    bindCommon();
    $app.querySelectorAll('[data-x]').forEach(b => b.onclick = notYet);
    $app.querySelectorAll('[data-assign-q]').forEach(sel => sel.onchange = async () => { await API.assignInquiry(sel.dataset.assignQ, sel.value); toast(L('담당을 바꿨어요', 'Counsellor changed')); staff('consults'); });
    const cp = document.getElementById('copyDb');
    if (cp) cp.onclick = () => navigator.clipboard?.writeText(JSON.stringify(API.raw(), null, 2)).then(() => toast(L('복사했어요', 'Copied')), () => toast(L('복사할 수 없어요', 'Could not copy')));
  }

  /* ---------- GPEIS 소개 (text from GP_English_Listening_and_Integrated_Learning_20261105.pdf) ---------- */
  function about() {
    const PLOGO = { 'p-pbl': 'start-pbl.png', 'p-lgr': 'lets-go-readers.png', 'p-fm': 'fresh-math.png', 'p-gb': 'gb-magic-library.webp', 'p-ml': 'math-lab.png', 'p-le': 'logic-essay.png' };
    const prog = (cls, name, line, extra) => `<article class="program ${cls}"><h3><img class="prog-logo" src="assets/logos/${PLOGO[cls]}" alt="${name}"></h3><p class="lead">${line}</p>${extra || ''}</article>`;
    const steps = items => `<ol class="flow">${items.map(([en, ko]) => `<li><b>${en}</b><span>${ko}</span></li>`).join('')}</ol>`;
    $app.innerHTML = topbar(authNav()) + `
    <main class="wrap about">
      <section class="hero vibe-hero about-hero kb" id="kb" data-k="0">
        <h1 class="kb-h">
          <span class="kb-line on">${L('배움의 <mark>품격</mark>을 설계하다.', 'Designing the<br><mark>quality</mark> of learning.')}</span>
          <span class="kb-line">${L('듣는 양보다 중요한 것은<br><mark>이해의 깊이</mark>입니다.', 'Depth of <mark>understanding</mark><br>matters more than hours of listening.')}</span>
          <span class="kb-line">${L('배움의 깊이는 <mark>질문</mark>에서,<br>성장은 <mark>표현</mark>에서 시작됩니다.', 'Deep learning starts with <mark>questions</mark>;<br>growth starts with <mark>expression</mark>.')}</span>
        </h1>
        <div class="kb-side">
          <p class="kb-sub">
            <span class="kb-line on">${L('GP는 아이 스스로 배우고 연결하며 세상을 이해하도록 돕습니다.', 'GP helps children learn, connect and understand the world for themselves.')}</span>
            <span class="kb-line">${L('같은 영어를 반복해서 듣는 것에서 벗어나, 새로운 내용을 이해하며 듣기의 세계를 넓혀 갑니다.', 'Instead of hearing the same English again and again, children widen their listening by understanding new things.')}</span>
            <span class="kb-line">${L('듣고 이해한 내용이 생각과 말하기로 연결되어야 합니다.', 'What children hear and understand should lead to thinking and speaking.')}</span>
          </p>
          <p class="tagline">Listen More, Understand More, Speak Naturally.</p>
          <div class="kb-dots">${[0, 1, 2].map(k => `<button data-kb="${k}" class="${k ? '' : 'on'}" aria-label="${k + 1} / 3"></button>`).join('')}</div>
        </div>
      </section>
      ${reel()}
      ${divider()}
      <section class="say">
        <p>${L('GP 영어교육의 차별성은 단순히 영어를 많이 들려주는 데 있지 않습니다. 아이가 <mark class="hl-y">이미 이해한 내용</mark>을 바탕으로 <mark class="hl-b">새로운 지식과 표현</mark>을 확장해 가는 개념 기반 탐구학습 교육에 있습니다.',
          'What makes GP different is not simply giving children a lot of English to hear. It is concept-based inquiry learning that builds on <mark class="hl-y">what a child already understands</mark> and grows into <mark class="hl-b">new knowledge and expressions</mark>.')}</p>
      </section>

      <section class="stress">
        <h2>${L('GP가 중요하게 생각하는 것', 'What GP holds to')}</h2>
        <ol class="big-list">
          <li>${L('같은 문장만 반복해서 듣는다고 충분한 듣기량이 형성되는 것은 아닙니다.', 'Hearing the same sentence over and over is not enough listening.')}</li>
          <li>${L('이해할 수 있는 영어를 다양한 상황과 맥락에서 경험해야 합니다.', 'Children need English they can understand, met in many situations and contexts.')}</li>
          <li>${L('익숙한 어휘와 표현을 바탕으로 새로운 문장과 지식을 접해야 합니다.', 'New sentences and knowledge should build on words and expressions they already know.')}</li>
          <li>${L('듣고 이해한 내용이 생각과 말하기로 연결되어야 합니다.', 'What they hear and understand should lead to thinking and speaking.')}</li>
        </ol>
        <p class="dim">${L('즉, GP는 반복 재생 중심이 아니라 이해의 확장과 언어 경험의 누적을 통한 영어 습득을 지향합니다.', 'In short, GP aims for English learned by widening understanding and building up language experience, not by replaying.')}</p>
      </section>

      <section>
        <h2>${L('핵심 차별점 3가지', 'Three things that set GP apart')}</h2>
        <div class="three">
          <div class="c-y"><b>01</b><h3>${L('반복 재생이 아닌 듣기 경험의 확장', 'Wider listening, not replaying')}</h3><p>${L('같은 문장을 반복하는 데 그치지 않고 다양한 이야기와 상황 속에서 새로운 언어를 경험합니다.', 'Children meet new language in many stories and situations instead of repeating the same sentence.')}</p></div>
          <div class="c-p"><b>02</b><h3>${L('주제 중심의 통합적 이해', 'Theme-based, connected understanding')}</h3><p>${L('Theme PBL을 통해 영어와 수학, 과학, 자연, 문화 등을 연결하여 이해의 폭을 넓힙니다.', 'Theme PBL links English with maths, science, nature and culture to widen understanding.')}</p></div>
          <div class="c-b"><b>03</b><h3>${L('이해에서 표현으로 이어지는 성장', 'From understanding to expression')}</h3><p>${L('듣고 이해한 내용을 질문, 대화, 발표와 글쓰기로 발전시킵니다.', 'What they hear and understand grows into questions, conversation, presentations and writing.')}</p></div>
        </div>
      </section>

      ${divider()}
      <section class="bdw">
        <span class="eyebrow">${L('창의융합교육', 'Creative, connected learning')}</span>
        <h2>${L('책에서 시작해 <mark class="hl-y">그림</mark>으로 표현하고, <mark class="hl-b">글</mark>로 완성하는 창의융합교육', 'Starting from a book, expressed in <mark class="hl-y">pictures</mark>, completed in <mark class="hl-b">writing</mark>')}</h2>
        <p class="lead">${L('책은 상상의 문을 열고, 색채는 생각을 확장하며, 그림은 아이의 내면을 표현하는 언어가 됩니다.<br class="br-wide"> 그림으로 생각하고, 말로 나누며, 글로 완성하는 과정에서 창의력과 문해력, 자기표현의 힘을 키웁니다.',
          'A book opens the door to imagination, colour widens thinking, and drawing becomes the language of a child’s inner world. Thinking in pictures, sharing in words and finishing in writing builds creativity, literacy and the confidence to express oneself.')}</p>
        <ol class="bdw-steps">
          <li><b>${L('책', 'Book')}</b><span>${L('책으로 상상하고', 'Imagine with a book')}</span></li>
          <li><b>${L('그림', 'Picture')}</b><span>${L('그림으로 표현하며', 'Express it in a picture')}</span></li>
          <li><b>${L('글', 'Writing')}</b><span>${L('글로 생각을 완성하다', 'Complete the thought in writing')}</span></li>
        </ol>
        <p class="bdw-slogan">${L('책으로 상상하고, 그림으로 표현하며, 글로 생각을 완성하다.', 'Imagine with a book, express with a picture, complete the thought in writing.')}</p>
      </section>

      <section>
        <h2>READ · THINK · DISCOVER</h2>
        <p class="lead">${L('배움은 연결될 때 깊어집니다. 읽기에서 사고로, 수학 개념에서 문제 해결로, 자연 관찰에서 발견과 표현으로 이어지는 통합 학습.', 'Learning deepens when it connects: from reading to thinking, from maths ideas to problem solving, from looking at nature to discovering and expressing.')}</p>
        <div class="three rtd">
          <div><h3 class="t-y">READ</h3><p>${L('읽고 이해하기. 책과 이야기를 통해 어휘력과 문해력을 기릅니다.', 'Read and understand: build vocabulary and literacy through books and stories.')}</p></div>
          <div><h3 class="t-p">THINK</h3><p>${L('생각하고 탐구하기. 질문하고 비교하고 연결하며 개념과 사고를 확장합니다.', 'Think and explore: question, compare and connect to grow ideas and thinking.')}</p></div>
          <div><h3 class="t-b">DISCOVER</h3><p>${L('발견하고 표현하기. 배운 것을 놀이·대화·글쓰기와 프로젝트로 표현합니다.', 'Discover and express: show what they learned through play, talk, writing and projects.')}</p></div>
        </div>
      </section>


      <section class="closing">
        <h2>${L('배움의 깊이는 질문에서,<br>성장은 <mark class="hl-g">표현</mark>에서 시작됩니다.', 'Deep learning starts with questions;<br>growth starts with <mark class="hl-g">expression</mark>.')}</h2>
        <p>${L('GP는 아이 스스로 배우고 연결하며 세상을 이해하도록 돕습니다.', 'GP helps children learn, connect and understand the world for themselves.')}</p>
        <div class="form-row" style="justify-content:center"><a class="btn primary big" href="#/">${L('프로그램 보기', 'See the programmes')}</a><a class="btn big" href="#/consult">${L('교육센터 상담', 'Ask an education centre')}</a></div>
      </section>
      <p class="note">${L('샘플: 문구는 GP 영어교육·통합교육 자료(2026-11-05)에서 가져왔어요. Start PBL = GP THEME PBL SERIES, Math Lab = GP English Math로 보고 옮겼으니 확인이 필요해요.', 'Sample: the text comes from the GP English and integrated learning document (5 Nov 2026). Start PBL is taken as the GP THEME PBL SERIES and Math Lab as GP English Math; please confirm.')}</p>
    </main>${foot()}`;
    bindCommon(); startReel(); startKeyBanner();
  }

  /* ---------- Books: big coloured titles or covers; each book has a look-inside strip (cover + worksheet previews) ---------- */
  const BOOK_COLORS = ['var(--c-pbl)', 'var(--c-lgr)', 'var(--c-gb)', 'var(--c-ml)', 'var(--c-fm)', 'var(--c-le)'];
  const SER = window.SERIES || {};
  const bookState = { series: 'all', view: 'list' };
  try { bookState.view = localStorage.getItem('gpdemo.bookView') || 'list'; } catch (e) {}
  const bookMeta = b => `${SER[b.series].name} · ${b.level === 'K' ? 'K' : 'Level ' + b.level} · ${b.no}`;
  const bookColor = b => BOOK_COLORS[(window.BOOKS || []).indexOf(b) % BOOK_COLORS.length];
  // A heading wherever the series or level changes (books are sorted by series, level, number)
  const bookHead = (list, i, tag) => {
    const b = list[i], p = list[i - 1];
    if (p && p.series === b.series && p.level === b.level) return '';
    return `<${tag} class="blevel"><b>${SER[b.series].name}</b> ${b.level === 'K' ? 'K' : 'Level ' + b.level}</${tag}>`;
  };
  /* Programme information (was on 소개): one entry per programme, used by the Books page */
  const PLOGOS = { 'p-pbl': 'start-pbl.png', 'p-lgr': 'lets-go-readers.png', 'p-fm': 'fresh-math.png', 'p-gb': 'gb-magic-library.webp', 'p-ml': 'math-lab.png', 'p-le': 'logic-essay.png' };
  const progList = () => {
    const out = []; let group = '';
    const steps = items => `<ol class="flow">${items.map(([en, ko]) => `<li><b>${en}</b><span>${ko}</span></li>`).join('')}</ol>`;
    const prog = (cls, name, line, extra) => out.push({ cls, name, line, extra: extra || '', group });
    group = 'GPKIS'; prog('p-pbl', 'Start PBL', L('하나의 주제, 다양한 이야기, 확장되는 영어 사고력!', 'One theme, many stories, growing thinking in English!'),
          `<p>${L('주제를 중심으로 동화, 과학, 수학, 자연, 역사, 문화 등 다양한 영역을 연결합니다.', 'Each theme links stories, science, maths, nature, history and culture.')}</p>` + steps([['Listen', L('다양한 맥락에서 영어를 듣고', 'hear English in many contexts')], ['Understand', L('내용을 이해하고 지식을 넓히며', 'understand and widen knowledge')], ['Explore', L('질문하고 탐구하고', 'ask and explore')], ['Speak', L('자신의 생각을 영어로 표현합니다', 'say their own ideas in English')]]));
    group = 'GPKIS'; prog('p-lgr', "Let’s Go Readers", L('Reading Phonics가 함께 들어 있는 읽기 프로그램이에요.', 'A reading programme that includes Reading Phonics.'), `<p class="dim">${L('자세한 소개는 준비 중이에요.', 'More about it soon.')}</p>`);
    group = 'GPKIS'; prog('p-fm', 'Fresh Math', L('숲에서 발견하는 수학, 놀이로 키우는 사고력', 'Maths found in the forest, thinking grown through play'),
          `<p>${L('자연물을 살펴보고 직접 비교하고 분류하며 수학 개념을 경험합니다.', 'Children look closely at things from nature, compare and sort them, and meet maths ideas.')}</p>` + steps([['Count', L('세어 보기', 'count')], ['Compare', L('크기·길이 비교하기', 'compare size and length')], ['Sort', L('모양과 특징에 따라 분류하기', 'sort by shape and feature')], ['Find patterns', L('자연 속 규칙 찾기', 'find patterns in nature')], ['Measure & build', L('재고 구성하며 만들기', 'measure and build')]]));
    group = 'GPPIS'; prog('p-gb', 'GB Magic Library', L('144권의 책에서 시작하는 읽기·탐구·영어 글쓰기', 'Reading, exploring and English writing, starting from 144 books'),
          `<p>${L('다양한 그림책과 동화를 읽고 이야기의 의미와 관점을 살펴보며 자신의 생각을 말과 글로 표현합니다.', 'Children read picture books and stories, look at their meaning and points of view, and put their own thoughts into speech and writing.')}</p>` +
          steps([['Read', L('내용 파악', 'understand the story')], ['Question', L('인물·사건·주제에 대해 질문 만들기', 'ask about characters, events and themes')], ['Discuss', L('근거를 들어 생각 나누기', 'share ideas with reasons')], ['Write', L('자신의 관점과 생각을 영어로 표현하기', 'write their view in English')]]) +
          `<p class="ib">${L('GB는 IB 인증 과정이나 공식 IB 프로그램이 아니라, 탐구·성찰·비판적 사고의 교육 방향을 참고해 자체 개발하는 독서 기반 프로그램입니다.', 'GB is not an IB-certified course or an official IB programme. It is a reading-based programme GP develops itself, drawing on the ideas of inquiry, reflection and critical thinking.')}</p>`);
    group = 'GPPIS'; prog('p-ml', 'Math Lab', L('영어로 배우는 수학 개념과 사고력', 'Maths ideas and thinking, learned in English'),
          `<p>${L('수와 연산 · 도형과 공간 · 측정 · 규칙과 관계 · 문제 해결과 추론', 'Number and operations · shapes and space · measurement · patterns and relationships · problem solving and reasoning')}</p>` + steps([[L('개념 이해', 'Understand'), ''], [L('전략 탐색', 'Explore strategies'), ''], [L('문제 해결', 'Solve'), ''], [L('수학적 표현', 'Explain'), '']]) + `<p class="dim">${L('준비 중', 'Coming soon')}</p>`);
    /* Logic Essay: from the boss's "GP LOGIC & ESSAY" 12-theme plan (11 Nov 2026); sample wording, please confirm */
    group = 'GPPIS'; prog('p-le', 'Logic Essay', L('생각하는 힘이 논리가 되고, 논리가 글이 됩니다.', 'The power to think becomes logic, and logic becomes writing.'),
          `<p>${L('논리적 사고 · 근거 제시 · 비판적 사고 · 주장과 설득 · 에세이 구성을 12개 주제로 배웁니다.', 'Logical thinking · reasons and evidence · critical thinking · argument and persuasion · essay structure, across 12 themes.')}</p>` +
          steps([['Think', L('생각을 정리하고 표현하기', 'organise and express ideas')], ['Reason', L('논리적으로 분석하고 근거 제시하기', 'analyse logically and give evidence')], ['Argue', L('주장하고 설득하기', 'make a claim and persuade')], ['Write', L('서론·본론·결론을 갖춘 에세이 완성하기', 'finish an essay with an introduction, body and conclusion')]]) +
          `<p>${L('Level 1 · Think & Express → Level 2 · Logic & Reasoning → Level 3 · Argument & Essay', 'Level 1 · Think & Express → Level 2 · Logic & Reasoning → Level 3 · Argument & Essay')}</p><p class="dim">${L('준비 중', 'Coming soon')}</p>`);
    return out;
  };
  /* 책 page (rebuilt 11 Nov 2026 from the company book plan, see book-catalog.js): programme tabs, then level tabs, then that level's books.
     A cover opens its own page only when that book has finished worksheets (pictures in books.js); every other book shows "준비 중". */
  const hasSheets = id => { const b = (window.BOOKS || []).find(x => x.id === id); return !!(b && (b.sheets || []).some(sh => sh.img)); };
  const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>';
  let bookTab = ''; const bookLevel = {};
  function books(focus, level) {
    const CAT = window.CATALOG || {}, P = progList();
    const cur = P.find(p => p.cls === focus) || P.find(p => p.cls === bookTab) || P[0]; bookTab = cur.cls;
    const levels = (CAT[cur.cls] || {}).levels || [];
    const lv = levels.find(x => x.key === String(level || '').toUpperCase()) || levels.find(x => x.key === bookLevel[cur.cls]) || levels[0];
    if (lv) bookLevel[cur.cls] = lv.key;
    const soon = `<span class="bp-soon">${L('준비 중', 'Coming soon')}</span>`, open = `<span class="bp-open">${EYE}${L('워크시트 보기', 'See worksheets')}</span>`;
    const cover = (b, cls = '') => { const inner = `<figure><img src="${b.img}" alt="">${b.t ? `<figcaption>${b.t}</figcaption>` : ''}</figure>`;
      return hasSheets(b.id) ? `<a class="bp-cover can ${cls}" href="#/books/${b.id}">${inner}</a>` : `<div class="bp-cover ${cls}">${inner}</div>`; };
    // Start PBL, Level A and B: four theme blocks, three numbers in each, a phonics pad with every number
    const themeView = v => `<div class="bp-themes">${v.themes.map((t, k) => `<section class="bp-theme" style="--c:${t.c};${t.t ? '--t:' + t.t : ''}">
        <div class="bp-side"><div><div class="n">PBL ${k + 1}</div><h3>${L(t.ko, t.en)}</h3><div class="job">${t.job}</div></div><div class="nos">Level ${v.key} · ${t.from} – ${t.to}</div></div>
        <div class="bp-groups">${t.groups.map(g => `<div class="bp-group ${g.books.length === 1 ? 'one' : ''}"><div class="bp-no"><b>${g.no}</b>${g.books.some(b => hasSheets(b.id)) ? open : soon}</div>
          <div class="bp-covers">${g.books.map(b => cover(b, b.t === 'Big Book' ? 'big' : '')).join('')}${cover(g.phonics, 'ph')}</div></div>`).join('')}</div>
      </section>`).join('')}</div>`;
    // Start PBL, Level C: four subject columns, then the Speech Book and phonics strips
    const cycleView = v => `<div class="bp-cols">${v.cycle.map(c => `<section class="bp-col" style="--c:${c.c}"><header><div class="n">${c.skill.toUpperCase()}</div><h3>${L(c.ko, c.en)}</h3><p>${L(c.en, c.ko)}</p></header>
        <ul>${c.books.map(b => { const can = hasSheets(b.id), inner = `<img src="${b.img}" alt=""><span><b>${b.t}</b>${can ? open : soon}</span>`; return `<li>${can ? `<a href="#/books/${b.id}">${inner}</a>` : `<div>${inner}</div>`}</li>`; }).join('')}</ul></section>`).join('')}</div>
      ${v.strips.map(st => `<section class="bp-strip"><div><div class="n">${st.tag}</div><h3>${L(st.title[0], st.title[1])}</h3><p>${L(st.text[0], st.text[1])}</p></div><div class="bp-strip-row ${st.wide ? 'wide' : ''}">${st.books.map(b => cover(b)).join('')}</div></section>`).join('')}`;
    // every other programme: shelves of covers
    const shelfView = v => `<div class="bp-shelves">${v.shelves.map(sh => `<section class="bp-shelf ${sh.books.some(b => /\/gb-[abc]\d-/.test(b.img)) ? 'land nocap' : sh.books.length > 2 && sh.books.every(b => /assets\/worksheets\//.test(b.img)) ? 'land' : ''}"><div class="bp-shelf-h"><h4>${sh.title}</h4>${sh.sub ? `<span>${sh.sub}</span>` : ''}${sh.books.some(b => hasSheets(b.id)) ? open : ''}</div>
        <div class="bp-shelf-row">${sh.books.length ? sh.books.map(b => cover(b)).join('') : `<div class="bp-empty">${L('표지 준비 중', 'Cover coming')}</div>`}</div></section>`).join('')}</div>`;
    // GB Magic Library: one row per number: the Reading Book and Workbook covers first, then that number's four stories
    const gbView = v => `<div class="bp-rows">${v.rows.map(r => `<section class="bp-row"><div class="bp-row-h"><b>${r.no}</b><span>Level ${v.key} · ${r.no}</span></div>
        <div class="bp-row-books">${[['Reading Book', r.rb], ['Workbook', r.wb]].map(([t, cv]) => `<figure class="bp-cover"><img src="${cv.img}" alt=""><figcaption>${t}${cv.soft ? `<i>${L('임시', 'stand-in')}</i>` : ''}</figcaption></figure>`).join('')}</div>
        <div class="bp-row-stories">${r.stories.length ? r.stories.map(b => `<figure class="bp-cover"><img src="${b.img}" alt=""></figure>`).join('') : `<div class="bp-empty wide">${L('이야기 네 편 준비 중', 'Four stories coming')}</div>`}</div></section>`).join('')}</div>`;
    const body = !lv ? `<p class="bk-none">${L('책은 준비 중이에요.', 'Books are being prepared.')}</p>` : `
        <div class="bp-bar"><div class="bp-pills">${levels.length < 2 ? '' : levels.map(x => `<button class="bp-pill ${x === lv ? 'on' : ''}" data-plevel="${x.key}">Level ${x.key}${x.age[0] ? `<small>${L(x.age[0], x.age[1])}</small>` : ''}</button>`).join('')}</div></div>
        ${lv.lead ? `<p class="bp-lead">${L(lv.lead[0], lv.lead[1])}</p>` : ''}
        ${lv.themes ? themeView(lv) : lv.cycle ? cycleView(lv) : lv.rows ? gbView(lv) : shelfView(lv)}`;
    const tabs = code => `<div class="ptabs-g"><span>${code}</span>${P.filter(p => p.group === code).map(p => `<button class="ptab ${p.cls === cur.cls ? 'on' : ''}" data-ptab="${p.cls}" aria-label="${p.name}"><img src="assets/logos/${PLOGOS[p.cls]}" alt=""></button>`).join('')}</div>`;
    $app.innerHTML = topbar(authNav()) + `
    <main class="wrap books byprog">
      <section class="books-head"><h1>${L('책', 'Books')}</h1>
        <p>${L('프로그램마다 어떤 책으로 배우는지 레벨별로 볼 수 있어요.', 'See which books each programme uses, level by level.')}</p></section>
      <nav class="ptabs" aria-label="${L('프로그램', 'Programmes')}">${tabs('GPKIS')}${tabs('GPPIS')}</nav>
      <article class="bprog ${cur.cls}" id="${cur.cls}">
        <div class="bprog-info"><h3><img class="prog-logo" src="assets/logos/${PLOGOS[cur.cls]}" alt="${cur.name}"></h3><div class="bprog-text"><p class="lead">${cur.line}</p>${cur.extra}</div></div>
        ${body}
      </article>
      <p class="note">${L('표지를 누르면 책 소개와 워크시트를 볼 수 있어요. 지금은 디자인이 확정된 책만 열리고, 나머지는 준비 중이에요. 흐릿한 표지는 설명회 자료에서 가져온 임시 그림이에요.', 'Click a cover to see the book and its worksheets. For now only books with confirmed designs open; the rest are coming soon. Soft covers are temporary pictures taken from the briefing slides.')}</p>
    </main>${foot()}`;
    bindCommon();
    const go = (p, l) => { const y = window.scrollY; history.replaceState(null, '', '#/books?p=' + p + (l ? '&l=' + l : '')); books(p, l); window.scrollTo(0, y); };
    $app.querySelectorAll('[data-ptab]').forEach(b => b.onclick = () => go(b.dataset.ptab));
    $app.querySelectorAll('[data-plevel]').forEach(b => b.onclick = () => go(cur.cls, b.dataset.plevel));
  }

  function book(id) {
    const all = window.BOOKS || [];
    const i = all.findIndex(b => b.id === id);
    if (i < 0) { location.hash = '#/books'; return; }
    const b = all[i], prev = all[(i - 1 + all.length) % all.length], next = all[(i + 1) % all.length];
    const ser = SER[b.series], col = bookColor(b);
    const bubbles = (b.talk || []).map((t, k) => `<p class="bubble ${k % 2 ? 'b2' : 'b1'}">${esc(t)}</p>`).join('');
    $app.innerHTML = topbar(authNav()) + `
    <main class="book-page">
      <div class="strip-wrap">
        <button class="arrow prev" id="stripPrev" aria-label="${L('이전', 'Previous')}">←</button>
        <div class="bstrip" id="bstrip" tabindex="0" style="--pat:url(assets/patterns/${b.series === 'ees' ? 'logic' : 'phonics'}.svg)">
          <div class="cover-tile" style="--tile:${ser.tint};--dot:${ser.color}"><img src="${b.cover}" alt="${esc(b.title)}"></div>
          ${b.sheets.map(sheet).join('')}
        </div>
        <button class="arrow next" id="stripNext" aria-label="${L('다음', 'Next')}">→</button>
      </div>
      <div class="wrap">
        <p class="strip-note">${b.sheets.some(s => s.img) ? L('표지 옆 장들은 이 책의 수업 내용으로 만든 “그리고 쓰는” 워크시트예요.', 'The pages beside the cover are the draw-and-write worksheets made from this book’s lessons.') : L('표지 옆 장들은 “그리고 쓰는” 워크시트 미리보기 샘플이에요. 실제 워크시트는 책의 수업 내용으로 따로 만들어요.', 'The pages beside the cover are sample previews of the draw-and-write worksheets. The real worksheets will be made separately from the book’s lessons.')}</p>
        <h1 class="book-title" style="color:${col}">${esc(b.title)}</h1>
        <div class="book-cols">
          <div class="book-desc">
            <p class="lead">${L(b.ko, b.en)}</p>
            <p>${b.note ? L(b.note[0], b.note[1]) : L(`${ser.full} (${ser.name}) 시리즈의 ${esc(b.kind)} 책이에요. 책을 배운 뒤에는 워크시트에서 배운 내용을 한 장으로 정리하고, 직접 그리고 써 보며 자기 것으로 만들어요.`, `A ${esc(b.kind)} book in the ${ser.full} (${ser.name}) series. After the book, a worksheet sums up each lesson on one page, and children draw and write to make it their own.`)}</p>
            ${bubbles ? `<h3><mark class="hl-y">${L('책 속 문장', 'In this book')}</mark></h3><div class="bubbles">${bubbles}</div>` : ''}
          </div>
          <aside class="book-side">
            <div class="seal" style="background:${col}"><svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 4l12 9 15-3 6 14 14 6-3 15 9 12-9 12 3 15-14 6-6 14-15-3-12 9-12-9-15 3-6-14-14-6 3-15-9-12 9-12-3-15 14-6 6-14 15 3z" fill="currentColor"/></svg><span>${b.seal ? b.seal[0] : b.level === 'K' ? 'ELS' : 'Level'}<b>${b.seal ? b.seal[1] : b.level}</b></span></div>
            <h3><mark class="hl-b">${L('이 책은', 'About this book')}</mark></h3>
            <ul class="facts">${b.facts ? b.facts.map(f => `<li>${L(f[0], f[1])}</li>`).join('') : `<li>${ser.name} · ${ser.full}</li><li>${esc(b.kind)}</li><li>${b.level === 'K' ? 'K' : 'Level ' + b.level} · ${b.no}</li>${b.pages ? `<li>${L(b.pages + '쪽', b.pages + ' pages')}</li>` : ''}`}</ul>
            <h3><mark class="hl-g">${L('만나는 방법', 'Where to find it')}</mark></h3>
            <ul class="links">${b.prog ? `<li><a href="#/play/${b.prog}?sample=1">${L('GB Magic Library에서 보기', 'See it in GB Magic Library')}</a></li>` : ''}<li><a href="#/consult">${L('교육센터에 문의하기', 'Ask an education centre')}</a></li><li><a href="#/school-login">${L('기관 단체 구매', 'Schools and group orders')}</a></li><li><button class="linkish" id="buyBook">${L('실물 책 구매 (준비 중)', 'Buy the printed book (soon)')}</button></li></ul>
          </aside>
        </div>
        <nav class="book-nav"><a href="#/books/${prev.id}">← ${esc(prev.title)}</a><a href="#/books/${next.id}">${esc(next.title)} →</a></nav>
      </div>
    </main>${foot()}`;
    bindCommon();
    const strip = document.getElementById('bstrip');
    const step = dir => strip.scrollBy({ left: dir * Math.min(strip.clientWidth * 0.8, 620), behavior: 'smooth' });
    document.getElementById('stripPrev').onclick = () => step(-1);
    document.getElementById('stripNext').onclick = () => step(1);
    document.getElementById('buyBook').onclick = () => toast(L('실제 사이트에서는 판매 회사 쇼핑몰의 이 책 페이지로 이동해요', 'The real site opens this book in the sales company\'s shop'));
  }

  /* ---------- 교육센터: parents pick 시/도 and 구, leave a question, the local counsellor answers ---------- */
  const R = window.REGIONS;
  const METHODS = { phone: () => L('전화', 'Phone call'), sms: () => L('문자', 'Text message'), email: () => L('이메일', 'Email'), site: () => L('사이트에서 답변', 'Answer on the site') };
  const AGES = ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const ageText = a => L('만 ' + a + '세', 'age ' + a);
  const statusBadge = q => q.status === 'answered' ? `<span class="badge ok">${L('답변 완료', 'Answered')}</span>` : `<span class="badge warn">${L('답변 대기', 'Waiting')}</span>`;
  function inquiryCard(q, parentView) {
    const counselor = q.counselor ? (API.raw().counselors.find(c => c.id === q.counselor) || {}).name : L('GP 본사', 'GP head office');
    return `<div class="panel inquiry"><div class="iq-head"><b>${q.id}</b> <span class="dim">${q.at} · ${q.sido} ${q.gu} · ${ageText(q.child)}</span> ${statusBadge(q)}</div>
      <p class="iq-text">${esc(q.text)}</p>
      ${q.products && q.products.length ? `<div>${q.products.map(id => `<span class="chip ${id}">${prod(id) ? prod(id).name : id}</span>`).join(' ')}</div>` : ''}
      ${q.status === 'answered' ? `<div class="iq-reply"><b>${esc(counselor)}</b> <span class="dim">${q.replyAt}</span><p>${esc(q.reply)}</p></div>`
        : `<p class="dim" style="margin:0">${parentView ? L(`답변 담당: ${counselor} · 연락 방법: ${METHODS[q.method]()}`, `Counsellor: ${counselor} · we will reply by ${METHODS[q.method]().toLowerCase()}`) : ''}</p>`}
    </div>`;
  }
  function seoulMap(cls, picked) {
    return `<div class="seoul" role="group" aria-label="${L('서울 지도', 'Map of Seoul')}">${R.seoulTiles.map(([g, c, r]) => `<button type="button" class="tile-gu ${cls(g)} ${g === picked ? 'picked' : ''}" style="grid-column:${c + 1};grid-row:${r + 1}" data-gu="${g}">${g.replace(/구$/, '')}</button>`).join('')}</div>`;
  }
  const consultState = { sido: '서울특별시', gu: '' };
  async function consult() {
    const s = API.session();
    const fam = s && s.role === 'parent' ? await API.family() : null;
    const st = consultState;
    const gus = R.gu[st.sido] || [];
    const c = st.gu ? API.counselorFor(st.sido, st.gu) : null;
    $app.innerHTML = topbar(authNav()) + `
    <main class="wrap consult">
      <section class="hero" style="padding-block:32px 8px">
        <span class="eyebrow">${L('교육센터', 'Education centres')}</span>
        <h1>${L('우리 동네 선생님께 상담받기', 'Ask a teacher near you')}</h1>
        <p>${L('지역을 고르고 궁금한 점을 남겨 주세요. 그 지역 담당 선생님이 답해 드려요. 회원이 아니어도 문의할 수 있어요.', 'Pick your area and leave your question. The teacher for that area will answer. You do not need an account.')}</p>
      </section>
      <div class="consult-grid">
        <section class="panel">
          <h2>1. ${L('지역 고르기', 'Pick your area')}</h2>
          <div class="form-row">
            <select id="sido" aria-label="${L('시/도', 'City or province')}">${R.sido.map(x => `<option ${x === st.sido ? 'selected' : ''}>${x}</option>`).join('')}</select>
            <select id="gu" aria-label="${L('시·군·구', 'District')}"><option value="">${gus.length ? L('시·군·구 고르기', 'Pick a district') : L('목록 준비 중 (샘플)', 'List coming (sample)')}</option>${gus.map(x => `<option ${x === st.gu ? 'selected' : ''}>${x}</option>`).join('')}</select>
          </div>
          ${st.sido === '서울특별시' ? `<p class="dim" style="font-size:13px;margin:12px 0 6px">${L('지도에서 구를 눌러도 돼요 (간단한 지도, 샘플)', 'Or tap a district on the map (simplified, sample)')}</p>${seoulMap(g => API.counselorFor('서울특별시', g) ? 'on' : '', st.gu)}` : ''}
          <div class="note" style="margin-top:12px">${st.gu ? (c ? L(`${st.sido} ${st.gu} 담당: <b>${c.name}</b>`, `Counsellor for ${st.gu}: <b>${c.name}</b>`) : L(`${st.gu}에는 아직 담당 선생님이 없어서 GP 본사에서 답해 드려요.`, `No counsellor for ${st.gu} yet, so GP head office will answer.`)) : L('색칠된 구에는 담당 선생님이 있어요.', 'Coloured districts already have a counsellor.')}</div>
        </section>
        <form class="panel" id="qform" novalidate>
          <h2>2. ${L('문의 남기기', 'Leave your question')}</h2>
          <div class="fields">
            <label>${L('보호자 이름', 'Your name')}<input id="qn" required value="${fam ? esc(fam.name) : ''}"></label>
            <label>${L('연락처 (휴대폰 또는 이메일)', 'Phone or email')}<input id="qc" required value="${fam ? esc(fam.email) : ''}"></label>
            <label>${L('아이 나이', 'Child\'s age')}<select id="qa">${AGES.map(a => `<option value="${a}" ${a === '5' ? 'selected' : ''}>${ageText(a)}</option>`).join('')}</select></label>
            <label>${L('답변받을 방법', 'How to reply')}<select id="qm">${Object.keys(METHODS).map(k => `<option value="${k}" ${k === (fam ? 'site' : 'phone') ? 'selected' : ''}>${METHODS[k]()}</option>`).join('')}</select></label>
          </div>
          <fieldset class="prods"><legend>${L('관심 있는 프로그램 (선택)', 'Programmes you are interested in (optional)')}</legend>
            ${P.map(p => `<label class="switch"><input type="checkbox" value="${p.id}"> ${p.name}</label>`).join('')}
            <label class="switch"><input type="checkbox" value="pbl"> Start PBL</label>
            <label class="switch"><input type="checkbox" value="mathlab"> Math Lab</label>
            <label class="switch"><input type="checkbox" value="essay"> Logic Essay</label>
          </fieldset>
          <label class="full">${L('문의 내용', 'Your question')}<textarea id="qt" rows="5" required placeholder="${L('예: 만 5세 아이에게 어떤 프로그램이 맞을까요?', 'e.g. Which programme suits my 5-year-old?')}"></textarea></label>
          <label class="switch consent"><input type="checkbox" id="qok"> <span>${L('[필수] 상담을 위해 이름, 연락처, 아이 나이, 문의 내용을 수집·이용하는 데 동의해요. 상담이 끝나고 1년 뒤 지워요. 동의하지 않으면 문의할 수 없어요.', '[Required] I agree that my name, contact, child\'s age and question are collected and used to answer me. They are deleted 1 year after the consultation. Without this, the question cannot be sent.')}</span></label>
          <button class="btn primary big" id="qsend">${L('문의 보내기', 'Send my question')}</button>
          <p class="note">${L('샘플이라 실제로 보내지지 않아요. 실제 버전에서는 담당 선생님에게 알림이 가고, 답변은 선택한 방법으로 와요.', 'Nothing is really sent in the sample. The real version notifies the counsellor, and the answer comes the way you chose.')}</p>
        </form>
      </div>
    </main>${foot()}`;
    bindCommon();
    document.getElementById('sido').onchange = e => { st.sido = e.target.value; st.gu = ''; consult(); };
    document.getElementById('gu').onchange = e => { st.gu = e.target.value; consult(); };
    $app.querySelectorAll('.seoul [data-gu]').forEach(b => b.onclick = () => { st.gu = b.dataset.gu; consult(); });
    document.getElementById('qform').onsubmit = async e => {
      e.preventDefault();
      const v = id => document.getElementById(id).value.trim();
      if (!st.gu && (R.gu[st.sido] || []).length) { toast(L('지역(시·군·구)을 골라 주세요', 'Please pick a district')); return; }
      if (!v('qn') || !v('qc') || !v('qt')) { toast(L('이름, 연락처, 문의 내용을 적어 주세요', 'Please fill in name, contact and question')); return; }
      if (!document.getElementById('qok').checked) { toast(L('개인정보 수집·이용에 동의해야 보낼 수 있어요', 'Please agree to the data use to send')); return; }
      document.getElementById('qsend').disabled = true;
      const res = await API.addInquiry({ sido: st.sido, gu: st.gu || L('(지역 미정)', '(area not listed)'), name: v('qn'), contact: v('qc'), child: v('qa'), method: v('qm'),
        products: [...document.querySelectorAll('.prods input:checked')].map(i => i.value).filter(id => prod(id)), text: v('qt') });
      modal(`<h2>${L('문의를 받았어요', 'We have your question')}</h2>
        <p style="margin:0">${L(`접수 번호 <b>${res.id}</b>. 답변 담당: ${res.counselor ? res.counselor.name : 'GP 본사'}`, `Reference <b>${res.id}</b>. ${res.counselor ? res.counselor.name : 'GP head office'} will answer.`)}</p>
        <p class="note">${L('답변까지 걸리는 시간은 아직 정하는 중이에요 (예: 영업일 1~2일).', 'How fast we answer is still to decide (for example 1-2 working days).')}</p>
        <button class="btn primary big" id="ok">${L('확인', 'OK')}</button>`);
      document.getElementById('ok').onclick = () => { closeModal(); st.gu = ''; location.hash = s && s.role === 'parent' ? '#/family/consults' : '#/'; };
    };
  }

  /* ---------- Counsellor (designated teacher for an area) ---------- */
  async function counselor(view) {
    const { me, items } = await API.counselorInbox('cs1');
    const show = view === 'done' ? items.filter(q => q.status === 'answered') : items.filter(q => q.status !== 'answered');
    const side = `<aside class="side"><div class="who"><b>${me.name}</b>${L('교육센터 상담 선생님', 'Education centre counsellor')}</div>
      <a href="#/counselor" class="${view !== 'done' ? 'on' : ''}">${L('새 문의', 'New')} <span class="badge warn">${items.filter(q => q.status !== 'answered').length}</span></a>
      <a href="#/counselor/done" class="${view === 'done' ? 'on' : ''}">${L('답변 완료', 'Answered')}</a>
      <div class="note" style="margin-top:10px">${L('맡은 지역', 'Your areas')}: ${me.areas.map(a => a.replace('서울특별시 ', '')).join(', ')}</div></aside>`;
    const body = `<h1>${view === 'done' ? L('답변 완료', 'Answered') : L('새 문의', 'New inquiries')}</h1>
      <p class="sub">${L('맡은 지역에서 들어온 문의만 보여요. 보호자 연락처는 상담에만 써요.', 'Only inquiries from your areas. Use the parent\'s contact only for this consultation.')}</p>
      ${show.map(q => `${inquiryCard(q, false)}
        <div class="panel contact-row"><span>${esc(q.name)} · ${esc(q.contact)} · ${METHODS[q.method]()}</span>
        ${q.status !== 'answered' ? `<form class="reply" data-q="${q.id}"><textarea rows="3" required placeholder="${L('답변 쓰기', 'Write your answer')}"></textarea>
          <div class="form-row"><button class="btn primary">${L('답변 보내기', 'Send answer')}</button><button type="button" class="btn" data-called="${q.id}">${L('전화로 상담했어요', 'I answered by phone')}</button></div></form>` : ''}</div>`).join('') || `<p class="dim">${L('지금은 없어요.', 'Nothing here right now.')}</p>`}`;
    $app.innerHTML = topbar(authNav()) + `<div class="wrap shell">${side}<main class="main">${body}</main></div>`;
    bindCommon();
    $app.querySelectorAll('form.reply').forEach(f => f.onsubmit = async e => {
      e.preventDefault(); const t = f.querySelector('textarea').value.trim();
      if (!t) { toast(L('답변을 적어 주세요', 'Please write an answer')); return; }
      await API.answerInquiry(f.dataset.q, t, 'site'); toast(L('답변을 보냈어요 (샘플)', 'Answer sent (sample)')); counselor(view);
    });
    $app.querySelectorAll('[data-called]').forEach(b => b.onclick = async () => { await API.answerInquiry(b.dataset.called, L('전화로 상담을 마쳤어요.', 'Answered by phone.'), 'phone'); toast(L('완료로 표시했어요', 'Marked as answered')); counselor(view); });
  }

  /* ---------- Child login at school: class code → face → picture password ---------- */
  const kidState = { code: '', cls: null, kid: null, tries: [] };
  async function kid() {
    const box = inner => { $app.innerHTML = `<div class="kidzone"><div class="kidbox">${inner}</div></div>`; };
    if (!kidState.cls) {
      try { const saved = localStorage.getItem('gpdemo.tabletClass'); if (saved) kidState.cls = await API.findClass(saved); } catch (e) {}
    }
    if (!kidState.cls) {
      const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
      box(`<span class="teacher-note">${L('선생님이 이 태블릿에서 한 번만 해요 · 예시 코드', 'The teacher does this once on each tablet · example code')} <b>SUN482</b></span>
        <h1>${L('반 코드를 넣어 주세요', 'Type the class code')}</h1>
        <div class="codeinput">${[0, 1, 2, 3, 4, 5].map(i => `<span>${kidState.code[i] || ''}</span>`).join('')}</div>
        <div class="keys">${keys.map(k => `<button data-k="${k}">${k}</button>`).join('')}<button class="wide" data-k="del">⌫ ${L('지우기', 'Delete')}</button><button class="wide" data-k="qr">${L('QR 스캔 (샘플)', 'Scan QR (sample)')}</button><button class="wide" data-k="home">← ${L('정문으로', 'Front door')}</button></div>`);
      $app.querySelectorAll('[data-k]').forEach(b => b.onclick = async () => {
        const k = b.dataset.k;
        if (k === 'home') { location.hash = '#/school-login'; return; }
        if (k === 'del') kidState.code = kidState.code.slice(0, -1);
        else if (k === 'qr') kidState.code = 'SUN482';
        else if (kidState.code.length < 6) kidState.code += k;
        if (kidState.code.length === 6) {
          const c = await API.findClass(kidState.code);
          if (c) { kidState.cls = c; try { localStorage.setItem('gpdemo.tabletClass', c.code); } catch (e) {} }
          else { toast(L('없는 반 코드예요', 'No class has this code')); kidState.code = ''; }
        }
        kid();
      });
      return;
    }
    const sch = await API.school();
    const kids = sch.students.filter(s => s.classId === kidState.cls.id);
    if (!kidState.kid) {
      box(`<h1>${L(`${kidState.cls.name} 친구, 내 얼굴을 눌러요!`, `${kidState.cls.name}, tap your face!`)}</h1>
        <div class="faces">${kids.map(k => `<button data-s="${k.id}"><img src="${face(k.face)}" alt="">${k.name}</button>`).join('') || `<p>${L('이 반에는 아직 친구가 없어요 (샘플은 해바라기반만 채워져 있어요)', 'No children in this class yet (only 해바라기반 is filled in for the sample)')}</p>`}</div>
        <button class="btn ghost" id="forget">${L('이 태블릿의 반 바꾸기 (선생님)', 'Change this tablet\'s class (teacher)')}</button>`);
      $app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { kidState.kid = kids.find(k => k.id === b.dataset.s); kidState.tries = []; kid(); });
      document.getElementById('forget').onclick = () => { try { localStorage.removeItem('gpdemo.tabletClass'); } catch (e) {} kidState.cls = null; kidState.code = ''; kid(); };
      return;
    }
    const k = kidState.kid;
    if (kidState.tries.length < 3) {
      const grid = ['🍎', '⭐', '🐱', '🚗', '🌈', '🐟', '🌻', '🎈', '🐻'];
      box(`<img src="${face(k.face)}" alt="" style="width:90px;height:90px;border-radius:50%;background:var(--brand-soft)">
        <h1>${L(`${k.name}, 내 그림 비밀번호를 차례로 눌러요`, `${k.name}, tap your secret pictures in order`)}</h1>
        <span class="teacher-note">${L('샘플 정답', 'Sample answer')}: ${k.picPass.join(' ')}</span>
        <div class="dots3">${[0, 1, 2].map(i => `<i class="${i < kidState.tries.length ? 'on' : ''}"></i>`).join('')}</div>
        <div class="pics">${grid.map(g => `<button data-p="${g}">${g}</button>`).join('')}</div>
        <button class="btn ghost" id="back">← ${L('내 얼굴이 아니에요', 'That\'s not me')}</button>`);
      $app.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {
        const want = k.picPass[kidState.tries.length];
        if (b.dataset.p === want) { b.classList.add('hit'); kidState.tries.push(want); setTimeout(kid, 250); }
        else { b.classList.add('miss'); kidState.tries = []; setTimeout(kid, 450); }
      });
      document.getElementById('back').onclick = () => { kidState.kid = null; kid(); };
      return;
    }
    const open = P.filter(p => kidState.cls.months[p.id]);
    box(`<img src="${face(k.face)}" alt="" style="width:90px;height:90px;border-radius:50%;background:var(--brand-soft)">
      <h1>${L(`안녕, ${k.name}! 무엇을 할까?`, `Hi, ${k.name}! What shall we play?`)}</h1>
      <div class="kidtiles">${open.map(p => `<a href="#/play/${p.id}?school=${encodeURIComponent(kidState.cls.name + ' · ' + k.name)}">${artBox(p.id)}<b>${p.name}</b></a>`).join('')}</div>
      <button class="btn ghost" id="done">${L('다 했어요 (다음 친구)', 'All done (next child)')}</button>`);
    document.getElementById('done').onclick = () => { kidState.kid = null; kidState.tries = []; kid(); };
  }

  /* ---------- Router ---------- */
  async function render(keepScroll) {
    closeModal();
    const [path, qs] = (location.hash.slice(1) || '/').split('?');
    const q = new URLSearchParams(qs || '');
    const parts = path.split('/').filter(Boolean);
    const s = API.session();
    const need = role => { if (!s || s.role !== role) { location.hash = role === 'parent' ? '#/login' : '#/school-login'; return false; } return true; };
    if (!keepScroll) window.scrollTo(0, 0);
    if (!parts.length) return home();
    switch (parts[0]) {
      case 'login': return login();
      case 'school-login': return schoolLogin();
      case 'family': if (!need('parent')) return; return parts[1] ? parentArea(parts[1]) : family();
      case 'play': return play(parts[1], q);
      case 'teacher': if (!need('teacher')) return; return teacher(parts[1], parts[2]);
      case 'admin': if (!need('admin')) return; return admin(parts[1]);
      case 'staff': if (!need('staff')) return; return staff(parts[1], parts[2]);
      case 'about': { about(); const t = q.get('p') && document.querySelector('.program.' + q.get('p')); if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); return; }
      case 'activities': return activities();
      case 'programs': return home();   // opens at the top, with the banner (until 11 Nov it slid down to the programme cards)
      case 'books': return parts[1] ? book(parts[1]) : books(q.get('p'), q.get('l'));
      case 'consult': return consult();
      case 'counselor': if (!need('counselor')) return; return counselor(parts[1]);
      case 'kid': return kid();
      default: return home();
    }
  }
  window.addEventListener('hashchange', () => render());
  paintBar();
  render();
})();
