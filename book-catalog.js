/* The 책 page: which books each programme uses, by level and number (1 = March ... 12 = February).
   Source: the 설명회 slides (Documents/GPEIS 설명회.pptx, slides 9-12) and the user's notes of 11 Nov 2026.
   Pictures: assets/catalog/  = real covers, made by make-book-catalog.cjs from the company PDFs and our storybooks
             assets/books/    = real covers with the small GPEIS logo taken off (made earlier)
             assets/books-plan/ = small cut-outs from the 설명회 slides, used until the real cover file arrives ("soft")
   A book with "id" has a page of its own (books.js); it opens only when that page has finished worksheets. */
(function () {
  const cat = n => `assets/catalog/${n}.webp`, cut = n => `assets/books-plan/${n}.png`, old = n => `assets/books/${n}.webp`;
  const bk = (t, img, id) => ({ t, img, id: id || '', soft: /books-plan/.test(img) });

  /* ---- Start PBL, Level A and B: four PBL themes, three numbers each ---- */
  // real covers we have, by number: [first book, second book] or [big book]; everything else comes from the slides
  const REAL = {
    A: { 6: [bk('Big Book', old('ees-animal-friends'), 'ees-animal-friends')], 7: [bk('People', cat('pbl-a-7-1')), bk('History', cat('pbl-a-7-2'))], 8: [bk('Conversation', cat('pbl-a-8-1')), bk('General Knowledge', cat('pbl-a-8-2'))],
         9: [bk('Big Book', old('ees-countries'), 'ees-countries')], 10: [bk('People', old('ees-park-ranger'), 'ees-park-ranger'), bk('History', old('ees-park-ranger-2'), 'ees-park-ranger-2')],
         11: [bk('Conversation', cat('pbl-a-11-1')), bk('General Knowledge', cat('pbl-a-11-2'))] },
    B: { 6: [bk('Big Book', old('ees-growing-plants'), 'ees-growing-plants')], 7: [bk('People', cat('pbl-b-7-1')), bk('History', cat('pbl-b-7-2'))], 8: [bk('Conversation', cat('pbl-b-8-1')), bk('General Knowledge', cat('pbl-b-8-2'))],
         9: [bk('Big Book', old('ees-culture'), 'ees-culture')], 10: [bk('People', old('ees-cave-explorer'), 'ees-cave-explorer'), bk('History', old('ees-cave-explorer-2'), 'ees-cave-explorer-2')],
         11: [bk('Conversation', cat('pbl-b-11-1')), bk('General Knowledge', cat('pbl-b-11-2'))] }
  };
  const PHONICS = { A: [7, 8, 9], B: [7, 8, 9], C: [7, 8, 9] };          // numbers whose real phonics-pad cover we have
  const phonics = (L, n) => PHONICS[L].includes(n) ? bk('Phonics', cat(`ph-${L.toLowerCase()}-${n}`)) : bk('Phonics', cut('ph-' + L.toLowerCase()));
  const themes = (L, list) => list.map(([ko, en, job, c, t], k) => {
    const id = L.toLowerCase() + (k + 1), n = k * 3 + 1, R = REAL[L];
    return { ko, en, job, c, t: t || '', from: n, to: n + 2, groups: [
      { no: n, phonics: phonics(L, n), books: R[n] || [bk('People', cut(id + '-people')), bk('History', cut(id + '-history'))] },
      { no: n + 1, phonics: phonics(L, n + 1), books: R[n + 1] || [bk('Conversation', cut(id + '-conv')), bk('General Knowledge', cut(id + '-gk'))] },
      { no: n + 2, phonics: phonics(L, n + 2), books: R[n + 2] || [bk('Big Book', cut(id + '-big'))] } ] };
  });

  /* ---- Start PBL, Level C: four subjects in turn, three rounds; a Speech Book and a phonics pad every number ---- */
  const C_REAL = { 5: bk('', cat('c-5')), 7: bk('', old('els-speaking'), 'els-speaking'), 9: bk('', old('els-reading'), 'els-reading'), 10: bk('', old('els-writing'), 'els-writing') };
  const cycle = [['인성 논술', 'Personality Essay', 'Reading', '#ff9f8c', 1], ['언어, 수', 'Language and Math', 'Writing', '#ffe45c', 2], ['미술놀이', 'Art Play and Drawing', 'Speaking', '#a8e6cf', 3], ['통합사고', 'Integrated Thinking', 'Listening', '#9fd3f5', 4]]
    .map(([ko, en, skill, c, first]) => ({ ko, en, skill, c, books: [0, 4, 8].map(d => ({ ...(C_REAL[first + d] || bk('', cut('c' + (first + d)))), t: 'Level C · ' + (first + d), no: first + d })) }));
  const SPEECH = ['Language Patterns', 'Mathematical Speech', 'Grammar Points', 'Science Speech'];
  const speech = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({ ...(n <= 4 ? bk('', cut('sp' + n)) : n === 10 ? bk('', old('els-speech'), 'els-speech') : bk('', cat('sp-' + n))), t: `${n} · ${SPEECH[(n - 1) % 4]}`, soft: false }));

  const shelf = (title, sub, books, more) => ({ title, sub: sub || '', books, more: more || '' });
  const lv = (L, n, extra) => `Level ${L} · ${n}${extra ? ' · ' + extra : ''}`;
  const gb = (l, n) => [1, 2, 3, 4].map(k => bk(lv(l.toUpperCase(), n), cat(`gb-${l}${n}-${k}`)));

  /* ---- Math Lab, Logic Essay and Fresh Math: covers and worksheets made in Desktop/Claude/worksheets (11 Nov 2026, first samples).
     These get a page of their own here, because books.js only lists the EES and ELS books. ---- */
  const ML = ['Number Thinking', 'Classification', 'Pattern & Rules', 'Logical Thinking', 'Geometry', 'Spatial Thinking', 'Measurement', 'Mathematical Relations', 'Combinatorial Thinking', 'Probability', 'Data & Statistics', 'Creative Problem Solving'];
  const LE = ['My Ideas', 'Observation & Description', 'Compare & Contrast', 'Cause & Effect', 'Logical Thinking', 'Opinion Writing', 'Reasons & Evidence', 'Critical Thinking', 'Persuasive Writing', 'Problem & Solution', 'Debate & Discussion', 'Academic Essay'];
  const FM = ['Circles, triangles and squares', 'Tick-tock! What time is it?', 'Oh no! I got chubby!'];
  const ws = (id, first, titles) => titles.map((t, k) => ({ img: `assets/worksheets/${id}-${first + k}.png`, t }));
  const thumbs = (id, first, titles) => titles.map((t, k) => bk(`${k + 1} · ${t}`, `assets/worksheets/${id}-${first + k}.png`, id));
  Object.assign(window.SERIES = window.SERIES || {}, {
    ml: { name: 'Math Lab', full: 'GPPIS', color: '#1c2b4d', tint: '#ffd2ca' },
    le: { name: 'Logic Essay', full: 'GPPIS', color: '#222a3a', tint: '#f3ddd0' },
    fm: { name: 'Fresh Math', full: 'GPFIS', color: 'var(--c-fm)', tint: '#e3f1dc' },
    lgr: { name: "Let's Go Readers", full: 'GPFIS', color: '#223a8f', tint: '#dbeeff' } });
  const PRS = ['The Cat on the Mat', 'Who Is in My House?', 'Fun in the Sun'];
  // contents (목차) spread of each programme, shown first beside the cover (worksheets/contents, 15 Nov 2026)
  // Math Art Lab pages (worksheets/math-art-lab, 16 Nov 2026), shown first to show Math Lab's higher level: two single pages per picture
  const MAL = ['Animals from Solids · Nets', 'Volume and Size · Solid Shapes', 'A 3D Person · My 3D Zoo'];
  const toc = name => ({ img: `assets/worksheets/contents-${name}.png`, t: 'Contents: lessons 1–12' });
  (window.BOOKS = window.BOOKS || []).push(
    { id: 'phonics-reading-story', series: 'lgr', level: '', no: '', title: 'Phonics Reading Story', kind: 'Active Readers', cover: cat('phonics-reading-story-cover'), talk: [], seal: ['Stories', '3'],
      ko: '짧은 이야기를 읽고, 내용을 묻는 질문에 답하고, 이야기 속 소리로 파닉스 활동을 해요.',
      en: 'Children read a short story, answer questions about it, and do a phonics activity with the sounds from the story.',
      note: ['표지 옆 장들은 Phonics Reading Story 샘플이에요. 이야기 한 편마다 Reading Comprehension과 Phonics Activity가 함께 있어요.', 'The pages beside the cover are sample Phonics Reading Story pages. Each story comes with Reading Comprehension and a Phonics Activity.'],
      facts: [["Let's Go Readers · GPFIS", "Let's Go Readers · GPFIS"], ['이야기 + 이해 질문 + 파닉스', 'Story + questions + phonics'], ['샘플 3편', '3 sample stories']], sheets: [toc('lets-go-readers'), ...ws('phonics-reading-story', 1, PRS)] },
    { id: 'math-lab', series: 'ml', level: '', no: '', title: 'Math Lab: Think Beyond Numbers!', kind: 'Workbook', cover: cat('math-lab-cover'), talk: [], seal: ['Themes', '12'],
      ko: '수를 넘어 생각하는 힘을 키우는 열두 가지 주제예요. 주제마다 두 쪽 워크시트에서 생각하고, 찾아보고, 이유를 설명해요.',
      en: 'Twelve themes for thinking beyond numbers. Each theme has a two-page worksheet for thinking, discovering and explaining why.',
      note: ['처음 세 장은 Math Art Lab 워크시트예요. 입체도형, 전개도, 부피처럼 한 단계 높은 수학을 미술 활동으로 풀어요. 그다음은 열두 주제의 워크시트예요.', 'The first three are Math Art Lab worksheets: higher-level maths such as solid shapes, nets and volume, worked out through art. After them come the worksheets for the twelve themes.'],
      facts: [['Math Lab · GPPIS', 'Math Lab · GPPIS'], ['12가지 주제', '12 themes'], ['주제마다 워크시트 2쪽', 'A two-page worksheet per theme']], sheets: [...ws('math-art-lab', 1, MAL), ...ws('math-lab', 2, ML)] },
    { id: 'logic-essay', series: 'le', level: '', no: '', title: 'Logic Essay: Think. Reason. Argue. Write.', kind: 'Workbook', cover: cat('logic-essay-cover'), talk: [], seal: ['Themes', '12'],
      ko: '생각하는 힘이 논리가 되고, 논리가 글이 됩니다. 열두 가지 주제를 따라 생각을 정리하고 영어로 글을 써요.',
      en: 'The power to think becomes logic, and logic becomes writing. Twelve themes for organising ideas and writing them in English.',
      note: ['표지 옆 장들은 열두 주제의 워크시트예요. 내 생각 말하기에서 시작해 근거를 들고, 설득하고, 한 편의 글을 완성해요.', 'The pages beside the cover are the worksheets for the twelve themes: from saying my own idea to giving reasons, persuading and finishing an essay.'],
      facts: [['Logic Essay · GPPIS', 'Logic Essay · GPPIS'], ['12가지 주제', '12 themes'], ['주제마다 워크시트 2쪽', 'A two-page worksheet per theme']], sheets: ws('logic-essay', 2, LE) },
    ...['A', 'B', 'C'].map(L => ({ id: 'fresh-math-' + L.toLowerCase(), series: 'fm', level: L, no: '4', title: 'Literacy and Math: Lengths', kind: 'Literacy and Math', cover: cat('math-' + L.toLowerCase() + '-4'), talk: [], seal: ['Level', L],
      ko: '도형, 시계, 무게를 그림으로 만나고 직접 그리고 써 보는 Fresh Math 워크시트예요.',
      en: 'Fresh Math worksheets: children meet shapes, the clock and weight in pictures, then draw and write.',
      note: ['표지 옆 장들은 Fresh Math 워크시트예요. 색종이 도형, 째깍째깍 시계, 뚱뚱해진 고양이 이야기로 수학 개념을 경험해요.', 'The pages beside the cover are Fresh Math worksheets: shapes on coloured paper, the tick-tock clock and the cat that got chubby.'],
      facts: [['Fresh Math · GPFIS', 'Fresh Math · GPFIS'], ['Literacy and Math', 'Literacy and Math'], ['Level ' + L + ' · 4', 'Level ' + L + ' · 4']], sheets: ws('fresh-math', 1, FM) })));

  window.CATALOG = {
    'p-pbl': { levels: [
      { key: 'A', age: ['만 3세', 'age 3'], lead: ['네 개의 <mark>PBL 주제</mark>를 세 번씩 깊게 경험하며 People, History, Conversation, General Knowledge로 넓혀 갑니다.', 'Four <mark>PBL themes</mark>, three steps each, growing through People, History, Conversation and General Knowledge.'],
        themes: themes('A', [['나와 친구들', 'Me and My Friends', 'Baker', '#ff9f8c'], ['동물', 'Animal Friends', 'Pet Groomer', '#ffe45c'], ['세계 여러 나라', 'Countries of the World', 'Athlete', '#a8e6cf'], ['환경', 'Environment & Life', 'Park Ranger', '#151e4b', '#fff']]) },
      { key: 'B', age: ['만 4세', 'age 4'], lead: ['<mark>가족과 이웃, 식물, 문화, 탐험</mark>을 세 번씩 깊게 경험하며 더 긴 문장과 스스로 하는 탐구로 나아갑니다.', '<mark>Family and neighbours, plants, culture and exploration</mark>, three steps each, moving to longer sentences and independent inquiry.'],
        themes: themes('B', [['가족과 이웃', 'Family & Neighbours', 'Designer', '#ffb48a'], ['식물', 'Growing Plants', 'Farmer', '#ffe45c'], ['문화', 'Culture & Life', 'Beekeeper', '#9fd3f5'], ['탐험', 'Exploration & Tools', 'Cave Explorer', '#c9b8f0']]) },
      { key: 'C', age: ['만 5세', 'age 5'], lead: ['<mark>인성 논술 · 언어, 수 · 미술놀이 · 통합사고</mark>가 차례로 세 번 돌아옵니다.', '<mark>Personality Essay · Language and Math · Art Play · Integrated Thinking</mark> come in turn, three rounds.'],
        cycle, strips: [
          { tag: 'SPEECH BOOK', title: ['스피치북<br>매월 1권', 'Speech Book<br>one every number'], text: ['12권 세트. 네 가지 스피치가 차례로 돌아옵니다.', 'A set of 12. Four kinds of speech come in turn.'], books: speech, wide: true },
          { tag: 'PHONICS', title: ['GP Phonics Book<br>매월 1권', 'GP Phonics Book<br>one every number'], text: ['소리와 글자를 익히는 파닉스 패드.', 'A phonics pad for sounds and letters.'], books: [7, 8, 9].map(n => bk('Level C · ' + n, cat('ph-c-' + n))) } ] }
    ] },
    'p-lgr': { levels: [
      { key: 'A', age: ['만 3세', 'age 3'], shelves: [
        shelf('Active Literacy', '', [bk(lv('A', 7), old('ees-athlete'), 'ees-athlete'), bk(lv('A', 8), cat('al-a-8'))]),
        shelf('Active Readers', '', []),
        shelf('Phonics Writing', '', [bk(lv('A', 7), cat('pw-a-7')), bk(lv('A', 9), cat('pw-a-9'))]) ] },
      { key: 'B', age: ['만 4세', 'age 4'], shelves: [
        shelf('Active Literacy', '', [bk(lv('B', 7), old('ees-beekeeper'), 'ees-beekeeper'), bk(lv('B', 8), cat('al-b-8'))]),
        shelf('Active Readers', '', []),
        shelf('Phonics Writing', '', [bk(lv('B', 7), cat('pw-b-7')), bk(lv('B', 9), cat('pw-b-9'))]) ] },
      { key: 'C', age: ['만 5세', 'age 5'], shelves: [
        shelf('ELS K', '', [bk('K · 7', old('els-k'), 'els-k'), bk('K · 8', cat('k-8'))]),
        shelf('Phonics Writing', '', [bk(lv('C', 7), cat('pw-c-7'))]) ] }
    ] },
    'p-fm': { levels: [
      { key: 'A', age: ['만 3세', 'age 3'], shelves: [
        shelf('Fresh Math Booklet', '', [bk(lv('A', 1, 'Black Forest'), 'assets/fmbook/1.webp')]),
        shelf('Literacy and Math', '', [bk(lv('A', 4, 'Lengths'), cat('math-a-4'), 'fresh-math-a'), bk(lv('A', 6, 'Weight'), cat('math-a-6')), bk(lv('A', 8, 'Category'), cat('math-a-8')), bk(lv('A', 9, 'Time'), cat('math-a-9'))]) ] },
      { key: 'B', age: ['만 4세', 'age 4'], shelves: [
        shelf('Literacy and Math', '', [bk(lv('B', 4, 'Lengths'), cat('math-b-4'), 'fresh-math-b'), bk(lv('B', 6, 'Weight'), cat('math-b-6')), bk(lv('B', 8, 'Category'), cat('math-b-8')), bk(lv('B', 9, 'Time'), cat('math-b-9'))]) ] },
      { key: 'C', age: ['만 5세', 'age 5'], shelves: [
        shelf('Literacy and Math', '', [bk(lv('C', 4, 'Lengths'), cat('math-c-4'), 'fresh-math-c'), bk(lv('C', 5, 'Area'), cat('math-c-5')), bk(lv('C', 6, 'Weight'), old('els-math-weight'), 'els-math-weight'), bk(lv('C', 8, 'Category'), old('els-math-category'), 'els-math-category'), bk(lv('C', 9, 'Time'), old('els-math-time'), 'els-math-time')]) ] }
    ] },
    'p-ml': { levels: [{ key: '', age: ['', ''], shelves: [
        shelf('Math Lab', '12 themes', [bk('Think Beyond Numbers!', cat('math-lab-cover'), 'math-lab')]) ] }] },
    'p-le': { levels: [{ key: '', age: ['', ''], shelves: [
        shelf('Logic Essay', '12 themes', [bk('Think. Reason. Argue. Write.', cat('logic-essay-cover'), 'logic-essay')]) ] }] },
    /* GB Magic Library: every number has a Reading Book, a Workbook and four stories. Covers come from make-gb-covers.cjs:
       real ones where the book exists, stand-ins ("soft") in the colour plan's colours where it does not yet. Story covers: numbers 1, 7, 8, 9 from our own book files, the rest cut from the yearly story list (make-gb-stories.cjs). */
    'p-gb': { levels: ['a', 'b', 'c'].map(l => ({ key: l.toUpperCase(), age: ['', ''],
      lead: ['번호마다 <mark>Reading Book</mark>과 <mark>Reading Literacy</mark>로 구성되어 있습니다.', 'Every number is a <mark>Reading Book</mark> and a <mark>Reading Literacy</mark> book.'],
      rows: Array.from({ length: 12 }, (x, i) => i + 1).map(n => ({ no: n,
        rb: { img: n === 8 ? `assets/covers/front-gb-${l}8.webp` : cat(`gb-rb-${l}${n}`), soft: ![1, 7, 8, 9].includes(n) },
        wb: { img: n === 8 && l === 'b' ? 'assets/covers/front-gb-wb-b8.webp' : cat(`gb-wb-${l}${n}`), soft: !(n === 7 || (n === 8 && l === 'b')) },
        stories: gb(l, n) })) })) }
  };

  /* ---- 14 Nov 2026: worksheet sets with covers of their own; the GP books move to the "Kindergarten" row ---- */
  const B = window.BOOKS, by = id => B.find(b => b.id === id) || {}, sheetsOf = (...ids) => ids.flatMap(id => by(id).sheets || []);
  const wsBook = (id, from, o) => ({ ...by(from), id, no: '', pages: undefined, cover: cat(id + '-cover'), ...o });
  B.push(
    wsBook('ws-park-ranger', 'ees-park-ranger', { title: 'Park Ranger Worksheets', kind: 'Start PBL · Level A · 10', seal: ['Level', 'A'], sheets: [toc('start-pbl'), ...sheetsOf('ees-park-ranger', 'ees-park-ranger-2')],
      facts: [['Start PBL · GPFIS', 'Start PBL · GPFIS'], ['Level A · 10', 'Level A · 10'], ['그리고 쓰는 워크시트 8장', '8 draw-and-write worksheets']] }),
    wsBook('ws-cave-explorer', 'ees-cave-explorer', { title: 'Cave Explorer Worksheets', kind: 'Start PBL · Level B · 10', seal: ['Level', 'B'], sheets: [toc('start-pbl'), ...sheetsOf('ees-cave-explorer', 'ees-cave-explorer-2')],
      facts: [['Start PBL · GPFIS', 'Start PBL · GPFIS'], ['Level B · 10', 'Level B · 10'], ['그리고 쓰는 워크시트 8장', '8 draw-and-write worksheets']] }),
    wsBook('ws-fresh-math', 'fresh-math-a', { title: 'Fresh Math Worksheets', kind: 'Fresh Math', level: '', seal: ['Sheets', '3'], sheets: [toc('fresh-math'), ...(by('fresh-math-a').sheets || [])],
      facts: [['Fresh Math · GPFIS', 'Fresh Math · GPFIS'], ['도형 · 시계 · 무게', 'Shapes · time · weight'], ['워크시트 3장', '3 worksheets']] }));
  const C = window.CATALOG, one = (title, list) => ({ key: '', age: ['', ''], shelves: [shelf(title, '', list)] });
  // the GP books, as they were
  C['k-pbl'] = C['p-pbl']; C['k-lgr'] = C['p-lgr']; C['k-fm'] = C['p-fm'];
  /* ---- 16 Nov 2026: real front covers for every school book we have (assets/catalog/k, made by make-kinder-covers.cjs from D:\GP Books).
     Where the drive has no file (Athlete A7-A8, Big Book A9, Active Literacy A7-A8) the earlier cover stays. ---- */
  {
    const kc = n => `assets/catalog/k/${n}.webp`;
    const TWO = { a: [1, 2, 4, 5, 10, 11], b: [1, 2, 4, 5, 7, 8, 10, 11] }, BIG = { a: [3, 6, 12], b: [3, 6, 9, 12] };
    C['k-pbl'].levels.forEach(lv => {
      const l = lv.key.toLowerCase();
      if (lv.themes) lv.themes.forEach(t => t.groups.forEach(g => {
        g.phonics = bk('Phonics', kc(`ph-${l}${g.no}`));
        if (TWO[l].includes(g.no)) g.books = g.books.map((b, i) => bk(b.t, kc(`pbl-${l}${g.no}-${i + 1}`)));
        if (BIG[l].includes(g.no)) g.books = [bk('Big Book', kc(`big-${l}${g.no}`))];
      }));
      if (lv.cycle) {
        lv.cycle.forEach(col => { col.books = col.books.map(b => ({ ...b, img: kc('c' + b.no), soft: false, id: '' })); });
        lv.strips[0].books = Array.from({ length: 12 }, (x, i) => ({ ...bk('', kc('sp' + (i + 1))), t: `${i + 1} · ${SPEECH[i % 4]}` }));
        lv.strips[1].books = Array.from({ length: 12 }, (x, i) => bk('Level C · ' + (i + 1), kc('ph-c' + (i + 1))));
      }
    });
    const nums = (list, key, label) => list.map(n => bk(label(n), kc(key + n)));
    const ALA = [1, 2, 3, 4, 5, 10], ALB = [1, 2, 3, 4, 5, 7, 8, 10];
    const al = (L, list, extra) => [...list.map(n => [n, bk(lv(L, n), kc(`al-${L.toLowerCase()}${n}`))]), ...extra].sort((p, q) => p[0] - q[0]).map(p => p[1]);
    C['k-lgr'] = { levels: [
      { key: 'A', age: ['만 3세', 'age 3'], shelves: [
        shelf('Active Literacy', '', al('A', ALA, [[7, bk(lv('A', 7), old('ees-athlete'))], [8, bk(lv('A', 8), cat('al-a-8'))]])),
        shelf('Active Readers', '', nums(ALA, 'ar-a', n => lv('A', n))),
        shelf('Phonics Writing', '', nums([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'pw-a', n => lv('A', n))) ] },
      { key: 'B', age: ['만 4세', 'age 4'], shelves: [
        shelf('Active Literacy', '', al('B', ALB, [])),
        shelf('Active Readers', '', nums(ALB, 'ar-b', n => lv('B', n))),
        shelf('Phonics Writing', '', nums([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'pw-b', n => lv('B', n))) ] },
      { key: 'C', age: ['만 5세', 'age 5'], shelves: [
        shelf('ELS K', '', nums([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'k', n => 'K · ' + n)),
        shelf('Phonics Writing', '', nums([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'pw-c', n => lv('C', n))) ] } ] };
    const TOPIC = ['', 'Vertices', 'Lines', 'Surfaces', 'Lengths', 'Area', 'Weight', 'Rule', 'Category', 'Time', 'Calculation'];
    C['k-fm'] = { levels: [['A', '만 3세', 'age 3'], ['B', '만 4세', 'age 4'], ['C', '만 5세', 'age 5']].map(([L, ko, en]) => ({ key: L, age: [ko, en], shelves: [
      shelf('Literacy and Math', '', nums([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'lm-' + L.toLowerCase(), n => n + ' · ' + TOPIC[n])) ] })) };
  }
  C['k-lgr'].levels.forEach(l => { l.shelves = l.shelves.filter(sh => sh.books.length); });   // the empty Active Readers row is hidden for now (user, 14 Nov)
  // the programme pages: worksheet covers only
  C['p-pbl'] = { levels: [one(L => 'Worksheets', [bk('Level A · 10 · Park Ranger', cat('ws-park-ranger-cover'), 'ws-park-ranger'), bk('Level B · 10 · Cave Explorer', cat('ws-cave-explorer-cover'), 'ws-cave-explorer')])] };
  C['p-pbl'].levels[0].shelves[0].title = 'Worksheets';
  /* ---- 23 Nov 2026 (user): the 24 Start PBL worksheet covers, one per number of the 24-number 목차
     (worksheets/start-pbl/covers, pages turned into assets/catalog/pbl-cover-NN.webp). Covers only for now, no look-inside. ---- */
  {
    const PBL24 = ['All About Me', 'My Friends & Me', 'My Family', 'My Neighborhood', 'From a Seed to a Plant', 'Plants Around the World',
      'The Amazing World of Animals', 'How Animals Live', 'Exploring the Seven Continents', 'Discovering the Five Oceans', 'Material Culture', 'Intangible Culture',
      'Our Beautiful Earth', 'Let’s Save Our Earth!', 'Exploring Our World', 'Amazing Discoveries', 'My Amazing Body', 'How My Body Works',
      'Matter, Energy & Motion', 'Earth & Natural Phenomena', 'Great Minds That Changed the World', 'War and Peace: People Who Changed History', 'Our Future World', 'Beyond Earth'];
    C['p-pbl'].levels[0].shelves.unshift(shelf('Worksheets · 1 – 24', '', PBL24.map((t, i) => bk(`Start PBL · ${i + 1}`, cat('pbl-cover-' + String(i + 1).padStart(2, '0'))))));
  }
  C['p-lgr'] = { levels: [one('Worksheets', [bk('Phonics Reading Story', cat('phonics-reading-story-cover'), 'phonics-reading-story')])] };
  /* ---- 23 Nov 2026 (user): the 24 Let's Go Readers worksheet covers, one per number of the 24-number 목차
     (worksheets/lets-go-readers/lgr-covers, pages turned into assets/catalog/lgr-cover-NN.webp). Covers only for now, no look-inside. ---- */
  {
    const LGR24 = ['Letters A–D', 'Letters E–H', 'Letters I–L', 'Letters M–P', 'Letters Q–T', 'Letters U–Z',
      'Short a · 1', 'Short a · 2', 'Short e and i · 1', 'Short e and i · 2', 'Short o and u · 1', 'Short o and u · 2',
      'Double Consonants 1 · 1', 'Double Consonants 1 · 2', 'Double Consonants 2 · 1', 'Double Consonants 2 · 2', 'Double Vowels · 1', 'Double Vowels · 2',
      'Magic e · 1', 'Magic e · 2', 'Soft Sounds', 'Hard Sounds and y', 'Word Sorting and Sound Rules', 'Reading New Words'];
    C['p-lgr'].levels[0].shelves.unshift(shelf('Worksheets · 1 – 24', '', LGR24.map((t, i) => bk(`${i + 1} · ${t}`, cat('lgr-cover-' + String(i + 1).padStart(2, '0'))))));
  }
  C['p-fm'] = { levels: [one('Worksheets', [bk('Shapes · Time · Weight', cat('ws-fresh-math-cover'), 'ws-fresh-math')])] };
  /* ---- 23 Nov 2026 (user): the 24 Fresh Math worksheet covers, one per number of the 24-number 목차
     (worksheets/fresh-math/fm-covers, pages turned into assets/catalog/fm-cover-NN.webp). Covers only for now, no look-inside. ---- */
  {
    const FM24 = ['Shapes Around Us', 'Shape Builders', 'Lines Everywhere', 'Lines & Angles', 'Blocks & Balls', 'Build It Up!', "Let's Measure!", 'Long & Short',
      'Big & Small', 'Cover It Up!', 'Weigh It!', 'Heavy & Light', 'Find the Pattern', 'Make a Pattern', 'Sort It Out', 'Sort & Count',
      'My Day', 'Telling Time', 'Add & Subtract', 'Carry & Borrow', 'Times Tables', 'Share It Equally', 'Fractions & Decimals', 'Mixed Calculation'];
    C['p-fm'].levels[0].shelves.unshift(shelf('Worksheets · 1 – 24', '', FM24.map((t, i) => bk(`Fresh Math · ${i + 1}`, cat('fm-cover-' + String(i + 1).padStart(2, '0'))))));
  }
  /* ---- 23 Nov 2026 (user): "there are now 2 worksheets, so just add the 보기 on the first book" — same for Start PBL and
     Let's Go Readers. Each programme page keeps only the 1 – 24 shelf (the older sample shelves are gone from the tab; their
     pages stay in BOOKS), number 1 opens its real worksheets (spreads copied from worksheets/<programme>/<set> as
     assets/worksheets/<fm|pbl|lgr>-01-N.webp), and the shelf is an even grid: 6 a row on a computer, 4 on a tablet, 3 on a phone. ---- */
  {
    const spreads = (key, n, name) => Array.from({ length: n }, (_, k) => ({ img: `assets/worksheets/${key}-01-${k + 1}.webp`, t: `${name}, spread ${k + 1}` }));
    const FIRST = [
      ['p-fm', { id: 'ws-fm-01', series: 'fm', title: 'Fresh Math · 1 · Shapes Around Us', kind: 'Fresh Math', cover: cat('fm-cover-01'), seal: ['No.', '1'],
        ko: '꼭짓점과 변을 세어 보고, 주변에서 도형을 찾고, 직접 만들고 나누어 보는 4주 워크시트예요.',
        en: 'Four weeks of worksheets: count vertices and sides, find shapes all around, then build and split them.',
        note: ['표지 옆 장들은 Fresh Math 1번 워크시트 전체예요. 표지와 차례, 4주 32쪽, 정답 2쪽이 있어요.', 'The pages beside the cover are the whole Fresh Math number 1 set: cover, contents, 32 pages over four weeks and 2 answer pages.'],
        facts: [['Fresh Math · GPFIS', 'Fresh Math · GPFIS'], ['1 · Shapes Around Us (Vertices)', '1 · Shapes Around Us (Vertices)'], ['4주 · 32쪽 + 정답', '4 weeks · 32 pages + answers']],
        sheets: spreads('fm', 18, 'Fresh Math 1') }],
      ['p-pbl', { id: 'ws-pbl-01', series: 'ees', title: 'Start PBL · 1 · All About Me', kind: 'Start PBL', cover: cat('pbl-cover-01'), seal: ['No.', '1'],
        ko: '나의 이름과 얼굴, 감정, 좋아하는 것과 잘하는 것, 나의 하루와 꿈을 그리고 쓰며 나를 알아가요.',
        en: 'Children get to know themselves: their name and face, feelings, what they like and can do, their day and their dreams.',
        note: ['표지 옆 장들은 Start PBL 1번 워크시트 전체예요. 표지와 차례, 4주 32쪽이 있어요.', 'The pages beside the cover are the whole Start PBL number 1 set: cover, contents and 32 pages over four weeks.'],
        facts: [['Start PBL · GPFIS', 'Start PBL · GPFIS'], ['1 · All About Me', '1 · All About Me'], ['4주 · 32쪽', '4 weeks · 32 pages']],
        sheets: spreads('pbl', 17, 'Start PBL 1') }],
      ['p-lgr', { id: 'ws-lgr-01', series: 'lgr', title: "Let's Go Readers · 1 · Letters A–D", kind: "Let's Go Readers", cover: cat('lgr-cover-01'), seal: ['No.', '1'],
        ko: 'A, B, C, D로 시작하는 낱말마다 짧은 이야기를 읽고, 이해 질문과 파닉스, 이름 낱말·움직임 낱말 활동을 해요.',
        en: 'A short story for each A, B, C and D word, with reading questions, phonics, and naming and doing words.',
        note: ['표지 옆 장들은 Let’s Go Readers 1번 워크시트 전체예요. 이야기 24편, 한 편마다 이야기 쪽과 활동 쪽이 있어요.', 'The pages beside the cover are the whole Let’s Go Readers number 1 set: 24 stories, each with a story page and an activity page.'],
        facts: [["Let's Go Readers · GPFIS", "Let's Go Readers · GPFIS"], ['1 · Letters A–D', '1 · Letters A–D'], ['이야기 24편 · 50쪽', '24 stories · 50 pages']],
        sheets: spreads('lgr', 25, "Let's Go Readers 1") }]];
    FIRST.forEach(([p, b]) => {
      window.BOOKS.push({ level: '', no: '1', talk: [], ...b });
      const sh = C[p].levels[0].shelves[0];
      sh.books[0].id = b.id; sh.grid = true;
      C[p].levels[0].shelves = [sh];
    });
  }

  /* ---- 19 Nov 2026: the new GP EPS books on the GPFIS programme pages, 12 places each (covers from D:\GP Books\GP EPS ..., made by make-kinder-covers.cjs).
     To add a book later: run make-kinder-covers.cjs with the new PDF on the drive and put its number in EPS_HAVE. ---- */
  {
    const EPS_HAVE = { ps: [1,2,3,4,5,6,7,8,9], de: [1,2,3,4,5,7,8,9], lm: [1,2,3,4,5,6,7,8,9], ecs: [1,2,3,4,5,6,7,8,9,10,11,12] };
    const DE = ['', 'School', 'Spring', 'Family', 'Neighborhood', 'Summer', '', 'Fall', 'Countries', 'Reading'];   // titles from the file names (6 is not on the drive yet)
    const twelve = (p, cap) => Array.from({ length: 12 }, (x, i) => i + 1).map(n => EPS_HAVE[p].includes(n) ? bk(cap(n), `assets/catalog/k/eps-${p}${n}.webp`) : { t: cap(n), img: '', id: '', soft: false, ph: n });
    // 20 Nov: the EPS books live on their own tab, EPS / ECS, over 24 numbers (they no longer sit on the Start PBL, Let's Go Readers and Fresh Math pages)
    const one = (p, n, label) => EPS_HAVE[p] && EPS_HAVE[p].includes(n) ? bk(label, `assets/catalog/k/eps-${p}${n}.webp`) : { t: label, img: '', id: '', soft: false, ph: '' };
    const nums = (from, f) => Array.from({ length: 12 }, (x, i) => ({ no: from + i, books: f(i + 1) }));
    C['p-eps'] = { levels: [{ key: '', age: ['', ''], lead: ['<mark>24개월</mark> 과정이에요. 1~12는 Literacy and Math와 Play and Speak, 13~24는 Daily Essay와 ECS 책으로 배워요.', 'A <mark>24-number</mark> course: 1-12 Literacy and Math with Play and Speak, 13-24 Daily Essay with the ECS books.'],
      shelves: [
        { title: '1 – 12', sub: 'Literacy and Math · Play and Speak', more: '', books: [], groups: nums(1, n => [one('lm', n, 'Literacy and Math ' + n), one('ps', n, 'Play and Speak ' + n)]) },
        { title: '13 – 24', sub: 'Daily Essay · ECS', more: '', books: [], groups: nums(13, n => [one('de', n, 'Daily Essay ' + n + (DE[n] ? ' · ' + DE[n] : '')), one('ecs', n, 'ECS Level ' + n + ' · ' + ['', 'Curator', 'Presentation', 'Debate'][Math.ceil(n / 4)])]) } ] }] };
    C['k-fm'].levels.forEach(l => l.shelves.forEach(s => { if (s.title === 'Literacy and Math') s.title = 'Literacy and Literature'; }));
  }

  /* ---- 20 Nov 2026 (boss): Active Literacy and Active Readers in one shelf, grouped by number: Literacy 1, Literacy 2, Readers 3 ---- */
  {
    const kc = n => `assets/catalog/k/${n}.webp`;
    const HAVE = { a: { al: [1, 2, 3, 4, 5, 10], ar: [1, 2, 3, 4, 5, 10] }, b: { al: [1, 2, 3, 4, 5, 7, 8, 10], ar: [1, 2, 3, 4, 5, 7, 8, 10] } };
    const OLD = { a: { 7: old('ees-athlete'), 8: cat('al-a-8') }, b: {} };   // earlier Active Literacy covers that are not on the drive
    const empty = t => ({ t, img: '', id: '', soft: false, ph: '', land: true });
    C['k-lgr'].levels.forEach(lvl => {
      const l = lvl.key.toLowerCase(); if (!HAVE[l]) return;
      const groups = Array.from({ length: 12 }, (x, i) => i + 1).map(n => ({ no: n, books: [
        HAVE[l].al.includes(n) ? bk('Literacy 1', kc(`al-${l}${n}`)) : OLD[l][n] ? bk('Literacy 1', OLD[l][n]) : empty('Literacy 1'),
        empty('Literacy 2'),
        HAVE[l].ar.includes(n) ? bk('Readers 3', kc(`ar-${l}${n}`)) : empty('Readers 3') ] }));
      lvl.shelves = [{ title: 'Active Literacy and Readers', sub: '', more: '', books: [], groups }, ...lvl.shelves.filter(s => !/^Active (Literacy|Readers)$/.test(s.title))];
    });
  }

  /* ---- 23 Nov 2026 (boss): one book per number in the pattern Readers, Readers, Literacy; each theme of three numbers is one row
     (A: Baker, Pet Groomer, Athlete, Park Ranger; B: Designer, Farmer, Beekeeper, Cave Explorer). Today's covers stay until the new ones come. ---- */
  {
    const kc = n => `assets/catalog/k/${n}.webp`;
    const HAVE = { a: { al: [1, 2, 3, 4, 5, 10], ar: [1, 2, 3, 4, 5, 10] }, b: { al: [1, 2, 3, 4, 5, 7, 8, 10], ar: [1, 2, 3, 4, 5, 7, 8, 10] } };
    const THEMES = { a: ['Baker', 'Pet Groomer', 'Athlete', 'Park Ranger'], b: ['Designer', 'Farmer', 'Beekeeper', 'Cave Explorer'] };
    const empty = t => ({ t, img: '', id: '', soft: false, ph: '', land: true });
    C['k-lgr'].levels.forEach(lvl => {
      const l = lvl.key.toLowerCase(); if (!HAVE[l]) return;
      const book = n => {
        const lit = n % 3 === 0, key = lit ? 'al' : 'ar', t = n + ' · ' + (lit ? 'Active Literacy' : 'Active Readers');
        return HAVE[l][key].includes(n) ? bk(t, kc(`${key}-${l}${n}`)) : empty(t);
      };
      const groups = THEMES[l].map((theme, i) => ({ no: `${i * 3 + 1} – ${i * 3 + 3}`, theme, books: [1, 2, 3].map(k => book(i * 3 + k)) }));
      const s = lvl.shelves.find(x => x.title === 'Active Literacy and Readers'); if (s) s.groups = groups;
    });
  }
  /* ---- 24 Nov 2026 (user): the 24-month curriculum before the worksheet covers (Start PBL, Let's Go Readers, Fresh Math).
     From worksheets/contents/*-24-months.md (Start PBL and LGR final 20 Nov; Fresh Math the 20 Nov draft). ---- */
  {
    const CURR = {"p-pbl":[{"t":"All About Me","ko":"나를 알아가요","d":"my name, looks, feelings, personality, talents, dreams, my day"},{"t":"My Friends & Me","ko":"친구와 함께해요","d":"understanding friends, difference and respect, sharing feelings, caring, teamwork, friendship"},{"t":"My Family","ko":"우리 가족","d":"who is in my family · families around the world · family life and helping at home · love and care between generations"},{"t":"My Neighborhood","ko":"우리 동네와 이웃","d":"places in my town · people who help us · reading a town map, staying safe · designing a better neighbourhood"},{"t":"From a Seed to a Plant","ko":"씨앗에서 식물로","d":"the world of seeds · how seeds travel and sprout · parts of a plant · plant life cycles (annual, biennial, perennial)"},{"t":"Plants Around the World","ko":"세계의 다양한 식물","d":"water plants · desert plants · from a tree to a forest · plants and us"},{"t":"The Amazing World of Animals","ko":"동물의 세계","d":"backbones or not · mammals and birds · reptiles, amphibians and fish · insects and small animals"},{"t":"How Animals Live","ko":"동물은 어떻게 살아갈까요?","d":"what animals eat · where animals live · eggs, babies and life cycles · food chains, ecosystems, caring for animals"},{"t":"Exploring the Seven Continents","ko":"세계의 7대륙","d":"the seven continents on the world map"},{"t":"Discovering the Five Oceans","ko":"세계의 5대양","d":"the five oceans"},{"t":"Material Culture","ko":"물질문화","d":"food, clothing, homes, everyday tools around the world"},{"t":"Intangible Culture","ko":"비물질문화","d":"language, music, dance, art, traditions, festivals"},{"t":"Our Beautiful Earth","ko":"아름다운 지구","d":"nature and the environment"},{"t":"Let's Save Our Earth!","ko":"우리 지구를 지켜요!","d":"how to protect the environment"},{"t":"Exploring Our World","ko":"우리 세계 탐험하기","d":"exploring places and nature: mountains, caves, jungles, poles"},{"t":"Amazing Discoveries","ko":"놀라운 발견","d":"great discoveries and inventions, the deep sea, fossils and dinosaurs (no space)"},{"t":"My Amazing Body","ko":"놀라운 우리 몸","d":"body parts, bones and muscles, organs, senses"},{"t":"How My Body Works","ko":"우리 몸은 어떻게 움직일까요?","d":"digestion, breathing, blood, brain and nerves, health and hygiene"},{"t":"Matter, Energy & Motion","ko":"물질·에너지·운동","d":"states of matter, forces and motion, light and sound, heat, magnets and electricity"},{"t":"Earth & Natural Phenomena","ko":"지구와 자연현상","d":"weather, the water cycle, seasons, rocks and soil, volcanoes and earthquakes (no space)"},{"t":"Great Minds That Changed the World","ko":"세상을 바꾼 위대한 인물들","d":"scientists, artists, musicians, writers, inventors, human-rights leaders"},{"t":"War and Peace: People Who Changed History","ko":"전쟁과 평화, 역사를 바꾼 사람들","d":"war and peace, Gandhi, Martin Luther King Jr., Mandela, Malala, the Nobel Peace Prize, the UN"},{"t":"Our Future World","ko":"우리가 만들어 갈 미래 세계","d":"smart cities, AI and robots, future transport, green energy, future homes and schools"},{"t":"Beyond Earth","ko":"지구를 넘어 우주로","d":"sun and moon, day and night, the solar system, Moon and Mars, astronauts, space stations, living on other planets"}],"p-lgr":[{"t":"Letters A–D","ko":"Bronze","d":"Nouns + Verbs 명사 + 동사"},{"t":"Letters E–H","ko":"Bronze","d":"Nouns + Verbs 명사 + 동사"},{"t":"Letters I–L","ko":"Bronze","d":"Adjectives + Personal Pronouns 형용사 + 인칭대명사"},{"t":"Letters M–P","ko":"Bronze","d":"Adverbs 부사 (with adjectives and pronouns)"},{"t":"Letters Q–T","ko":"Bronze","d":"Prepositions 전치사"},{"t":"Letters U–Z","ko":"Bronze","d":"Conjunctions + Interjections 접속사 + 감탄사"},{"t":"Short a · 1 (-at, -an, -ap)","ko":"Silver","d":"Present 현재"},{"t":"Short a · 2 (-ad, -ag, -am)","ko":"Silver","d":"Present -ing 현재진행"},{"t":"Short e and i · 1 (-ed, -en, -et)","ko":"Silver","d":"Past -ed 과거 (규칙)"},{"t":"Short e and i · 2 (-ig, -in, -it)","ko":"Silver","d":"Past, irregular 과거 (불규칙)"},{"t":"Short o and u · 1 (-og, -op, -ot)","ko":"Silver","d":"Future will 미래"},{"t":"Short o and u · 2 (-ug, -um, -un)","ko":"Silver","d":"Future going to 미래"},{"t":"Double Consonants 1 · 1 (pl, sl, dr)","ko":"Gold","d":"Subject 주어"},{"t":"Double Consonants 1 · 2 (fr, sk, sm)","ko":"Gold","d":"Verb 서술어"},{"t":"Double Consonants 2 · 1 (st, sw, sh)","ko":"Gold","d":"Object 목적어"},{"t":"Double Consonants 2 · 2 (th, nk, ck)","ko":"Gold","d":"Complement 보어"},{"t":"Double Vowels · 1 (ee, ea, oo)","ko":"Gold","d":"Describing words 수식어 (형용사)"},{"t":"Double Vowels · 2 (ow, ue, er, ir)","ko":"Gold","d":"Describing words 수식어 (부사)"},{"t":"Magic e · 1 (cake, kite)","ko":"Diamond","d":"Pattern 1 1형식"},{"t":"Magic e · 2 (rope, cube)","ko":"Diamond","d":"Pattern 2 2형식"},{"t":"Soft Sounds (city, giraffe)","ko":"Diamond","d":"Pattern 3 3형식"},{"t":"Hard Sounds and y (cat, go; sky, baby)","ko":"Diamond","d":"Pattern 4 4형식"},{"t":"Word Sorting and Sound Rules 단어 분류와 발음 규칙 찾기","ko":"Diamond","d":"Pattern 5 5형식"},{"t":"Reading New Words 처음 보는 단어 읽기","ko":"Diamond","d":"All five patterns in one story"}],"p-fm":[{"t":"Shapes Around Us","ko":"여러 가지 모양","d":"triangle, square, rectangle, circle, pentagon, hexagon: name them and find them around us"},{"t":"Shape Builders","ko":"도형 만들기","d":"sides and vertices (변과 꼭짓점), counting them, cutting and joining shapes, tangram (칠교)"},{"t":"Lines Everywhere","ko":"여러 가지 선","d":"straight and curved lines; line segment, straight line, ray (선분·직선·반직선)"},{"t":"Lines & Angles","ko":"선과 각","d":"where lines meet: angles, right angles (직각); position and direction on a grid"},{"t":"Blocks & Balls","ko":"입체도형","d":"cube, cuboid, cylinder, sphere, cone: faces, edges and vertices"},{"t":"Build It Up!","ko":"쌓기나무","d":"building with cubes, counting cubes, views from the front, side and top"},{"t":"Let's Measure!","ko":"길이 재기","d":"measuring with a ruler; cm and mm; 1 cm = 10 mm; estimating before measuring"},{"t":"Long & Short","ko":"길이 비교와 단위 변환","d":"comparing lengths; m and km; 1 m = 100 cm, 1 km = 1000 m; choosing the right unit; adding and subtracting lengths (1 m 20 cm + 50 cm)"},{"t":"Big & Small","ko":"넓이 비교","d":"comparing areas by laying shapes over each other and counting squares on a grid"},{"t":"Cover It Up!","ko":"넓이와 둘레","d":"counting unit squares for area; going around a shape: perimeter (둘레)"},{"t":"Weigh It!","ko":"무게 재기","d":"weighing with a balance and a scale; grams and kilograms"},{"t":"Heavy & Light","ko":"무게 비교와 단위 변환","d":"comparing weights; 1 kg = 1000 g; 2 kg 300 g; adding and subtracting weights; word problems; the tonne (t)"},{"t":"Find the Pattern","ko":"규칙 찾기","d":"patterns in shapes, colours and numbers; rules in a 100 chart (수 배열표)"},{"t":"Make a Pattern","ko":"규칙 만들기","d":"growing patterns, rules in an addition table (덧셈표), making your own rule"},{"t":"Sort It Out","ko":"분류하기","d":"choosing a rule, sorting and counting by it (분류하여 세기)"},{"t":"Sort & Count","ko":"표와 그래프","d":"tables and bar graphs, reading and making them, answering questions from a graph"},{"t":"My Day","ko":"시각 읽기","d":"o'clock, half past, then hours and minutes (몇 시 몇 분)"},{"t":"Telling Time","ko":"시간과 달력","d":"how long something takes (elapsed time), days, weeks, months, the calendar"},{"t":"Add & Subtract","ko":"덧셈과 뺄셈","d":"two-digit adding and taking away without carrying; three numbers in a row; writing the number sentence (식 세우기)"},{"t":"Carry & Borrow","ko":"받아올림과 받아내림","d":"받아올림 and 받아내림; checking subtraction with addition; missing numbers (□ + 7 = 15)"},{"t":"Times Tables","ko":"곱셈","d":"equal groups and skip counting → times tables 2, 5, 10, then 3, 4 (구구단)"},{"t":"Share It Equally","ko":"나눗셈","d":"sharing equally and making groups; division as the other side of multiplication"},{"t":"Fractions & Decimals","ko":"분수와 소수","d":"halves, thirds and quarters of a shape and a group; tenths and 0.1"},{"t":"Mixed Calculation","ko":"혼합 계산과 문장제","d":"+ − × ÷ in one sentence, brackets first; multi-step story problems (문장제)"}]};
    CURR['p-lgr'].forEach(x => { x.ko = ''; });   // user 24 Nov: no Bronze / Silver / Gold / Diamond line
    Object.keys(CURR).forEach(k => C[k].levels[0].shelves.unshift({ title: 'Curriculum · 24 months', sub: '', more: '', books: [], curr: CURR[k] }));
  }
})();
