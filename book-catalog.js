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
    ml: { name: 'Math Lab', full: 'GP Primary International School', color: '#1c2b4d', tint: '#ffd2ca' },
    le: { name: 'Logic Essay', full: 'GP Primary International School', color: '#222a3a', tint: '#f3ddd0' },
    fm: { name: 'Fresh Math', full: 'GP Kinder International School', color: 'var(--c-fm)', tint: '#e3f1dc' } });
  (window.BOOKS = window.BOOKS || []).push(
    { id: 'math-lab', series: 'ml', level: '', no: '', title: 'Math Lab: Think Beyond Numbers!', kind: 'Workbook', cover: cat('math-lab-cover'), talk: [], seal: ['Themes', '12'],
      ko: '수를 넘어 생각하는 힘을 키우는 열두 가지 주제예요. 주제마다 두 쪽 워크시트에서 생각하고, 찾아보고, 이유를 설명해요.',
      en: 'Twelve themes for thinking beyond numbers. Each theme has a two-page worksheet for thinking, discovering and explaining why.',
      note: ['표지 옆 장들은 열두 주제의 워크시트예요. 영어로 배우는 수학 개념과 사고력을 한 주제씩 직접 풀고 써 보며 익혀요.', 'The pages beside the cover are the worksheets for the twelve themes: maths ideas and thinking, learned in English, one theme at a time.'],
      facts: [['Math Lab · GPPIS', 'Math Lab · GPPIS'], ['12가지 주제', '12 themes'], ['주제마다 워크시트 2쪽', 'A two-page worksheet per theme']], sheets: ws('math-lab', 2, ML) },
    { id: 'logic-essay', series: 'le', level: '', no: '', title: 'Logic Essay: Think. Reason. Argue. Write.', kind: 'Workbook', cover: cat('logic-essay-cover'), talk: [], seal: ['Themes', '12'],
      ko: '생각하는 힘이 논리가 되고, 논리가 글이 됩니다. 열두 가지 주제를 따라 생각을 정리하고 영어로 글을 써요.',
      en: 'The power to think becomes logic, and logic becomes writing. Twelve themes for organising ideas and writing them in English.',
      note: ['표지 옆 장들은 열두 주제의 워크시트예요. 내 생각 말하기에서 시작해 근거를 들고, 설득하고, 한 편의 글을 완성해요.', 'The pages beside the cover are the worksheets for the twelve themes: from saying my own idea to giving reasons, persuading and finishing an essay.'],
      facts: [['Logic Essay · GPPIS', 'Logic Essay · GPPIS'], ['12가지 주제', '12 themes'], ['주제마다 워크시트 2쪽', 'A two-page worksheet per theme']], sheets: ws('logic-essay', 2, LE) },
    { id: 'fresh-math', series: 'fm', level: 'A', no: '1', title: 'Fresh Math: Black Forest', kind: 'Booklet', cover: 'assets/fmbook/1.webp', talk: [], seal: ['Level', 'A'],
      ko: '도형, 시계, 무게를 그림으로 만나고 직접 그리고 써 보는 Fresh Math 워크시트예요.',
      en: 'Fresh Math worksheets: children meet shapes, the clock and weight in pictures, then draw and write.',
      note: ['표지 옆 장들은 Fresh Math 워크시트예요. 색종이 도형, 째깍째깍 시계, 뚱뚱해진 고양이 이야기로 수학 개념을 경험해요.', 'The pages beside the cover are Fresh Math worksheets: shapes on coloured paper, the tick-tock clock and the cat that got chubby.'],
      facts: [['Fresh Math · GPKIS', 'Fresh Math · GPKIS'], ['Booklet', 'Booklet'], ['Level A · 1', 'Level A · 1']], sheets: ws('fresh-math', 1, FM) });

  window.CATALOG = {
    'p-pbl': { levels: [
      { key: 'A', age: ['만 3세', 'age 3'], lead: ['네 개의 <mark>PBL 주제</mark>를 세 번씩 깊게 경험하며 People, History, Conversation, General Knowledge로 넓혀 갑니다.', 'Four <mark>PBL themes</mark>, three steps each, growing through People, History, Conversation and General Knowledge.'],
        themes: themes('A', [['나와 친구들', 'Me and My Friends', 'Baker', '#ff9f8c'], ['동물', 'Animal Friends', 'Pet Groomer', '#ffe45c'], ['세계 여러 나라', 'Countries of the World', 'Athlete', '#a8e6cf'], ['환경', 'Environment & Life', 'Park Ranger', '#151e4b', '#fff']]) },
      { key: 'B', age: ['만 4세', 'age 4'], lead: ['<mark>가족과 이웃, 식물, 문화, 탐험</mark>을 세 번씩 깊게 경험하며 더 긴 문장과 스스로 하는 탐구로 나아갑니다.', '<mark>Family and neighbours, plants, culture and exploration</mark>, three steps each, moving to longer sentences and independent inquiry.'],
        themes: themes('B', [['가족과 이웃', 'My Family', 'Designer', '#ffb48a'], ['식물', 'Growing Plants', 'Farmer', '#ffe45c'], ['문화', 'Culture & Life', 'Beekeeper', '#9fd3f5'], ['탐험', 'Exploration & Tools', 'Cave Explorer', '#c9b8f0']]) },
      { key: 'C', age: ['만 5세', 'age 5'], lead: ['<mark>인성 논술 · 언어, 수 · 미술놀이 · 통합사고</mark>가 차례로 세 번 돌아옵니다.', '<mark>Personality Essay · Language and Math · Art Play · Integrated Thinking</mark> come in turn, three rounds.'],
        cycle, strips: [
          { tag: 'SPEECH BOOK', title: ['스피치북<br>매번 1권', 'Speech Book<br>one every number'], text: ['12권 세트. 네 가지 스피치가 차례로 돌아옵니다.', 'A set of 12. Four kinds of speech come in turn.'], books: speech, wide: true },
          { tag: 'PHONICS', title: ['GP Phonics Book<br>매번 1권', 'GP Phonics Book<br>one every number'], text: ['소리와 글자를 익히는 파닉스 패드.', 'A phonics pad for sounds and letters.'], books: [7, 8, 9].map(n => bk('Level C · ' + n, cat('ph-c-' + n))) } ] }
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
        shelf('Fresh Math Booklet', '', [bk(lv('A', 1, 'Black Forest'), 'assets/fmbook/1.webp', 'fresh-math')]),
        shelf('Literacy and Math', '', [bk(lv('A', 4, 'Lengths'), cat('math-a-4')), bk(lv('A', 6, 'Weight'), cat('math-a-6')), bk(lv('A', 8, 'Category'), cat('math-a-8')), bk(lv('A', 9, 'Time'), cat('math-a-9'))]) ] },
      { key: 'B', age: ['만 4세', 'age 4'], shelves: [
        shelf('Literacy and Math', '', [bk(lv('B', 4, 'Lengths'), cat('math-b-4')), bk(lv('B', 6, 'Weight'), cat('math-b-6')), bk(lv('B', 8, 'Category'), cat('math-b-8')), bk(lv('B', 9, 'Time'), cat('math-b-9'))]) ] },
      { key: 'C', age: ['만 5세', 'age 5'], shelves: [
        shelf('Literacy and Math', '', [bk(lv('C', 4, 'Lengths'), cat('math-c-4')), bk(lv('C', 5, 'Area'), cat('math-c-5')), bk(lv('C', 6, 'Weight'), old('els-math-weight'), 'els-math-weight'), bk(lv('C', 8, 'Category'), old('els-math-category'), 'els-math-category'), bk(lv('C', 9, 'Time'), old('els-math-time'), 'els-math-time')]) ] }
    ] },
    'p-ml': { levels: [{ key: '', age: ['', ''], shelves: [
        shelf('Math Lab', '12 themes', [bk('Think Beyond Numbers!', cat('math-lab-cover'), 'math-lab')]) ] }] },
    'p-le': { levels: [{ key: '', age: ['', ''], shelves: [
        shelf('Logic Essay', '12 themes', [bk('Think. Reason. Argue. Write.', cat('logic-essay-cover'), 'logic-essay')]) ] }] },
    /* GB Magic Library: every number has a Reading Book, a Workbook and four stories. Covers come from make-gb-covers.cjs:
       real ones where the book exists, stand-ins ("soft") in the colour plan's colours where it does not yet. Stories exist for 1, 7, 8, 9. */
    'p-gb': { levels: ['a', 'b', 'c'].map(l => ({ key: l.toUpperCase(), age: ['', ''],
      lead: ['번호마다 <mark>Reading Book</mark>과 <mark>Workbook</mark>, 그리고 이야기 네 편이 있어요.', 'Every number has a <mark>Reading Book</mark>, a <mark>Workbook</mark> and four stories.'],
      rows: Array.from({ length: 12 }, (x, i) => i + 1).map(n => ({ no: n,
        rb: { img: n === 8 ? `assets/covers/front-gb-${l}8.webp` : cat(`gb-rb-${l}${n}`), soft: ![1, 7, 8, 9].includes(n) },
        wb: { img: n === 8 && l === 'b' ? 'assets/covers/front-gb-wb-b8.webp' : cat(`gb-wb-${l}${n}`), soft: !(n === 7 || (n === 8 && l === 'b')) },
        stories: [1, 7, 8, 9].includes(n) ? gb(l, n) : [] })) })) }
  };
})();
