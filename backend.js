/* Pretend back end for the platform sample.
   Everything lives in this browser's localStorage ("gpdemo.db"). Each call waits a moment like a real server.
   The real version would be Supabase (accounts + database) and the payment company; the shape of the calls stays similar. */
(function () {
  const KEY = 'gpdemo.db', SESSION = 'gpdemo.session';
  const wait = (ms = 350) => new Promise(r => setTimeout(r, ms));
  const today = () => '2027-03-15'; // the sample pretends it is mid-March 2027, just after launch
  const plusMonth = d => { const x = new Date(d); x.setMonth(x.getMonth() + 1); return x.toISOString().slice(0, 10); };

  const PRODUCTS = [
    { id: 'library', name: 'GB Magic Library', ko: '매직 라이브러리', price: 50000, color: 'gb',
      line: '144권의 책에서 시작하는 읽기·탐구·영어 글쓰기. 책 속에서 질문을 찾고, 생각을 나만의 글로.', unit: '권', total: 12,
      lineEn: 'Reading, exploring and writing in English, starting from 144 books. Find questions in books and put your own thoughts into words.', unitEn: ' books' },
    { id: 'math', name: 'Fresh Math', ko: '프레시 매스', price: 35000, color: 'math',
      line: '숲에서 발견하는 수학, 놀이로 키우는 사고력. 자연물을 세고 비교하고 분류하며 수학을 경험해요.', unit: '트레일', total: 4,
      lineEn: 'Maths found in the forest, thinking grown through play: count, compare and sort things from nature.', unitEn: ' trails' },
    { id: 'phonics', name: 'Let’s Go Readers', ko: '렛츠 고 리더스', price: 35000, color: 'phonics',
      line: 'Reading Phonics가 함께 들어 있는 읽기 프로그램이에요. 자세한 내용은 준비 중이에요.', unit: '활동', total: 8,
      lineEn: 'A reading programme that includes Reading Phonics. Details are being prepared.', unitEn: ' activities' }
  ];
  const BUNDLE = 99000;   // example only: the three subscribable programmes cost 120,000 separately (GPKIS 35,000 each, GPPIS 50,000 each)

  function seed() {
    const t = today();
    const kids = ['서연', '도윤', '하은', '지호', '민준', '수아', '예준', '지우', '서준', '하린', '시우', '유나'];
    const faces = ['penny', 'syd', 'ria', 'don', 'gerry', 'wanda', 'coover', 'coover-beekeeper'];
    const pics = ['🍎', '⭐', '🐱', '🚗', '🌈', '🐟', '🌻', '🎈', '🐻'];
    const rnd = (i, n) => (i * 7 + n * 3) % (n + 1);
    const students = kids.map((name, i) => ({
      id: 's' + i, name, face: faces[i % faces.length], classId: i < 12 ? 'c1' : 'c2',
      picPass: [pics[i % 9], pics[(i + 3) % 9], pics[(i + 5) % 9]],
      progress: { library: rnd(i, 12), math: rnd(i + 1, 4), phonics: rnd(i + 2, 8) },
      lastPlayed: i % 5 === 3 ? '2주 전' : (i % 3 === 0 ? '오늘' : (i % 3 === 1 ? '어제' : '3일 전'))
    }));
    return {
      version: 8,
      // Other schools, as GP staff see them in the list (only the first school is filled in for the sample).
      otherSchools: [
        { id: 'sch2', name: '별빛 영어학원 (분당)', admin: '한실장', products: ['math', 'phonics'], seats: 30, used: 27, status: '이용 중', paid: '입금 완료', to: '2028-02-29' },
        { id: 'sch3', name: 'GP 송파 지점', admin: '오지점장', products: ['library', 'math', 'phonics'], seats: 80, used: 0, status: '견적 보냄', paid: '입금 전', to: '-' },
        { id: 'sch4', name: '도토리 어린이집', admin: '윤원장', products: ['library'], seats: 20, used: 12, status: '무료 체험 (3/31까지)', paid: '-', to: '2027-03-31' }
      ],
      // Every time GP staff open a school's or family's details, it is written down here (privacy rule).
      // 교육센터: consultation teachers (to be recruited by GP later) and the areas each one answers for.
      counselors: [
        { id: 'cs1', name: '윤선생님', areas: ['서울특별시 강남구', '서울특별시 서초구', '서울특별시 송파구', '서울특별시 강동구'] },
        { id: 'cs2', name: '한선생님', areas: ['서울특별시 마포구', '서울특별시 서대문구', '서울특별시 은평구', '서울특별시 용산구'] }
      ],
      // Inquiries parents leave on the 교육센터 page. family = the parent's account if they were logged in.
      inquiries: [
        { id: 'Q-0003', at: '2027-03-14', sido: '부산광역시', gu: '해운대구', dong: '우1동', name: '정하늘', contact: '010-0000-3333', method: 'phone', child: '7', products: ['library'],
          text: '초등 1학년인데 GB Magic Library 레벨을 어떻게 고르나요?', status: 'new', counselor: null, family: null },
        { id: 'Q-0002', at: '2027-03-13', sido: '서울특별시', gu: '마포구', dong: '서교동', name: '오민지', contact: 'minji@example.com', method: 'email', child: '4', products: ['phonics', 'math'],
          text: '만 4세 아이가 영어를 처음 시작해요. Let’s Go Readers와 Fresh Math 중 무엇부터 하면 좋을까요?', status: 'new', counselor: 'cs2', family: null },
        { id: 'Q-0001', at: '2027-03-10', sido: '서울특별시', gu: '강남구', dong: '삼성1동', name: '김지민', contact: 'parent@example.com', method: 'site', child: '5', products: ['phonics'],
          text: '둘째가 Let’s Go Readers를 시작하면 첫째와 같은 계정을 써도 되나요?', status: 'answered', counselor: 'cs1', family: 'kim',
          reply: '네, 한 계정에 아이를 4명까지 등록할 수 있어요. 부모님 화면 › 가족 프로필에서 둘째를 추가하신 뒤 Let’s Go Readers를 구독하시면 됩니다.', replyAt: '2027-03-11' }
      ],
      accessLog: [
        { at: '2027-03-10 14:02', who: 'GP 운영자', what: '해바라기 영어유치원 원생 명단 열람', why: '3월 명단 등록 도움' }
      ],
      families: {
        lee: {
          id: 'lee', name: '이수진', email: 'sujin@example.com', login: 'naver',
          children: [{ id: 'k3', name: '지안', face: 'ria', level: 'C', progress: { library: 10, math: 0, phonics: 5 } }],
          subs: {
            library: { status: 'active', since: '2027-03-02', next: '2027-04-02', method: '네이버페이' },
            phonics: { status: 'cancelled', since: '2027-03-02', next: '2027-04-02', method: '신용카드 ****8890' }
          },
          receipts: [
            { date: '2027-03-02', item: 'GB Magic Library 3월', amount: 29000, method: '네이버페이' },
            { date: '2027-03-02', item: 'Let’s Go Readers 3월', amount: 29000, method: '신용카드 ****8890' }
          ],
          coupons: [], consent: { under14: true, marketing: true, date: '2027-02-27' }
        },
        choi: {
          id: 'choi', name: '최민호', email: 'minho@example.com', login: 'google', schoolLink: '해바라기 영어유치원 · 서연',
          children: [{ id: 's0', name: '서연', face: 'penny', level: 'B', progress: { library: 0, math: 0, phonics: 0 }, fromSchool: true }],
          subs: {}, receipts: [], coupons: [], consent: { under14: true, marketing: false, date: '2027-03-08' }
        },
        kim: {
          id: 'kim', name: '김지민', email: 'parent@example.com', login: 'kakao',
          children: [
            { id: 'k1', name: '하준', face: 'gerry', level: 'B', progress: { library: 7, math: 3, phonics: 0 } },
            { id: 'k2', name: '소율', face: 'penny', level: 'A', progress: { library: 4, math: 1, phonics: 0 } }
          ],
          subs: {
            library: { status: 'active', since: '2027-03-02', next: plusMonth(t), method: '카카오페이' },
            math: { status: 'active', since: '2027-03-02', next: plusMonth(t), method: '신용카드 ****1234' }
          },
          receipts: [
            { date: '2027-03-02', item: 'GB Magic Library 3월', amount: 29000, method: '카카오페이' },
            { date: '2027-03-02', item: 'Fresh Math 3월', amount: 29000, method: '신용카드 ****1234' }
          ],
          coupons: [
            { id: 'cp1', title: '굿즈 10% 할인', why: '하준 · Fresh Math 3월 숲 수료증', code: 'FM10-7Q2K-9XA', until: '2027-05-31', used: false }
          ],
          consent: { under14: true, marketing: false, date: '2027-02-13' }
        }
      },
      school: {
        id: 'sch1', name: '해바라기 영어유치원', admin: '박원장',
        licence: { products: ['library', 'math', 'phonics'], seats: 50, used: 36, from: '2027-03-02', to: '2028-02-29' },
        classes: [
          { id: 'c1', name: '해바라기반', teacher: '이선생님', code: 'SUN482', level: 'B', months: { library: 1, math: 1, phonics: 1 } },
          { id: 'c2', name: '별님반', teacher: '최선생님', code: 'STR915', level: 'A', months: { library: 1, math: 1, phonics: 1 }, count: 14 },
          { id: 'c3', name: '무지개반', teacher: '정선생님', code: 'RBW307', level: 'C', months: { library: 1, math: 1, phonics: 0 }, count: 10 }
        ],
        teachers: [
          { id: 't1', name: '이선생님', contact: 'lee.t@example.com', login: 'kakao', status: '사용 중', classes: ['c1'] },
          { id: 't2', name: '최선생님', contact: '010-0000-1111', login: 'naver', status: '사용 중', classes: ['c2'] },
          { id: 't3', name: '정선생님', contact: 'jung.t@example.com', login: 'google', status: '사용 중', classes: ['c3'] },
          { id: 't4', name: '강선생님', contact: '010-0000-2222', login: '-', status: '초대 보냄', classes: [] }
        ],
        schedule: { c1: ['library', 'math', 'phonics', 'library', 'math'], c2: ['phonics', 'library', 'math', 'phonics', ''], c3: ['math', '', 'library', '', 'math'] },
        invoices: [
          { no: 'INV-2027-031', date: '2027-02-20', item: '3개 상품 · 50명 · 1년 (예시 단가 ₩180,000/명·상품)', amount: 27000000, status: '입금 완료', tax: '세금계산서 발행' }
        ],
        students
      }
    };
  }

  function load() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.version === 8) return d; } catch (e) {}
    const d = seed(); save(d); return d;
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  let db = load();
  let session = null;
  try { session = JSON.parse(sessionStorage.getItem(SESSION)); } catch (e) {}
  const setSession = s => { session = s; try { s ? sessionStorage.setItem(SESSION, JSON.stringify(s)) : sessionStorage.removeItem(SESSION); } catch (e) {} };
  const fam = () => db.families.kim;

  window.API = {
    PRODUCTS, BUNDLE,
    session: () => session,
    reset() { db = seed(); save(db); setSession(null); },

    // Accounts. Every social button logs into the same dummy parent; the real site sends the parent to Kakao/Naver/Google.
    async login(role, via) { await wait(500); setSession({ role, via: via || 'demo' }); return session; },
    async logout() { await wait(150); setSession(null); },

    // Parent
    async family() { await wait(200); return JSON.parse(JSON.stringify(fam())); },
    async hasProduct(id) { await wait(80); const s = fam().subs[id]; return !!s && s.status !== 'ended'; },
    async subscribe(id, method) {
      await wait(1200);
      const p = PRODUCTS.find(x => x.id === id), t = today();
      fam().subs[id] = { status: 'active', since: t, next: plusMonth(t), method };
      fam().receipts.unshift({ date: t, item: p.name + ' 첫 달', amount: p.price, method });
      save(db); return fam().subs[id];
    },
    async cancel(id) { await wait(600); const s = fam().subs[id]; if (s) { s.status = 'cancelled'; save(db); } return s; },
    async resume(id) { await wait(600); const s = fam().subs[id]; if (s) { s.status = 'active'; save(db); } return s; },
    async addChild(name, face) {
      await wait(400); const f = fam();
      if (f.children.length >= 4) throw new Error('아이는 4명까지 등록할 수 있어요.');
      f.children.push({ id: 'k' + Date.now(), name, face, level: 'A', progress: { library: 0, math: 0, phonics: 0 } });
      save(db); return f.children;
    },

    // School
    async school() { await wait(250); return JSON.parse(JSON.stringify(db.school)); },
    async findClass(code) { await wait(500); return db.school.classes.find(c => c.code === code.toUpperCase()) || null; },
    async addClass(name, teacher, level) {
      await wait(450); const id = 'c' + Date.now();
      const code = 'NEW' + String(Math.floor(100 + Math.random() * 900));
      db.school.classes.push({ id, name, teacher, code, level, months: { library: 1, math: 1, phonics: 1 }, count: 0 });
      db.school.schedule[id] = ['', '', '', '', ''];
      save(db); return id;
    },
    async setMonth(classId, product, on) { await wait(250); const c = db.school.classes.find(x => x.id === classId); c.months[product] = on ? 1 : 0; save(db); },

    // Teachers: the school admin invites by email or phone; the teacher opens the invite link and signs in with
    // Kakao / Naver / Google / email. Until then the status is "초대 보냄".
    async inviteTeacher(name, contact, classId) {
      await wait(500); const id = 't' + Date.now();
      if (classId) db.school.teachers.forEach(x => x.classes = x.classes.filter(k => k !== classId));
      db.school.teachers.push({ id, name, contact, login: '-', status: '초대 보냄', classes: classId ? [classId] : [] });
      if (classId) db.school.classes.find(c => c.id === classId).teacher = name;
      save(db); return id;
    },
    async acceptInvite(id) { await wait(500); const t = db.school.teachers.find(x => x.id === id); t.status = '사용 중'; t.login = 'kakao'; save(db); },
    async assignTeacher(teacherId, classId) {
      await wait(300); const t = db.school.teachers.find(x => x.id === teacherId), c = db.school.classes.find(x => x.id === classId);
      db.school.teachers.forEach(x => x.classes = x.classes.filter(k => k !== classId));
      t.classes.push(classId); c.teacher = t.name; save(db);
    },
    async removeTeacher(id) {
      await wait(400); const t = db.school.teachers.find(x => x.id === id);
      db.school.classes.forEach(c => { if (c.teacher === t.name) c.teacher = '(미정)'; });
      db.school.teachers = db.school.teachers.filter(x => x.id !== id); save(db);
    },

    // GP staff (super admin). Real version: a separate GP-only login with two-step sign-in; every look at a
    // school's or family's details is logged.
    async staffOverview() {
      await wait(300);
      const s = db.school, fams = Object.values(db.families);
      const mine = { id: s.id, name: s.name, admin: s.admin, products: s.licence.products, seats: s.licence.seats, used: s.licence.used, status: '이용 중', paid: '입금 완료', to: s.licence.to };
      return JSON.parse(JSON.stringify({ schools: [mine, ...db.otherSchools], families: fams, log: db.accessLog }));
    },
    async staffOpen(what, why) {
      await wait(150); const d = new Date();
      db.accessLog.unshift({ at: '2027-03-15 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), who: 'GP 운영자', what, why });
      save(db);
    },
    raw() { return JSON.parse(JSON.stringify(db)); },

    // 교육센터 inquiries. Real version: a table in Supabase; the parent and the teacher get a 알림톡 or email.
    counselorFor(sido, gu) { const c = db.counselors.find(x => x.areas.includes(sido + ' ' + gu)); return c ? { id: c.id, name: c.name } : null; },
    async addInquiry(q) {
      await wait(700);
      const id = 'Q-' + String(db.inquiries.length + 1).padStart(4, '0');
      const c = this.counselorFor(q.sido, q.gu);
      const item = { id, at: today(), status: 'new', counselor: c ? c.id : null, family: session && session.role === 'parent' ? 'kim' : null, ...q };
      db.inquiries.unshift(item); save(db); return { id, counselor: c };
    },
    async myInquiries() { await wait(200); return JSON.parse(JSON.stringify(db.inquiries.filter(q => q.family === 'kim'))); },
    async counselorInbox(cid) {
      await wait(250); const c = db.counselors.find(x => x.id === cid);
      return JSON.parse(JSON.stringify({ me: c, items: db.inquiries.filter(q => q.counselor === cid) }));
    },
    async answerInquiry(id, reply, how) {
      await wait(500); const q = db.inquiries.find(x => x.id === id);
      q.status = 'answered'; q.reply = reply; q.replyHow = how; q.replyAt = today(); save(db);
    },
    async allInquiries() { await wait(250); return JSON.parse(JSON.stringify({ items: db.inquiries, counselors: db.counselors })); },
    async assignInquiry(id, cid) { await wait(300); const q = db.inquiries.find(x => x.id === id); q.counselor = cid || null; save(db); }
  };
})();
