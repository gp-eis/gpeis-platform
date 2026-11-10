/* Books shown on the Books page (sample).
   Only EES and ELS books (user, 2026-11-10: no GB storybooks or workbooks here).
   Covers: page 1 of GP's own book PDFs (Desktop/GP worksheet/GP Books), with the GPEIS logo taken off.
   "talk" = sentences taken from the book itself. "sheets" = PLACEHOLDER worksheet previews (draw + write) drafted from each
   book's theme; the real worksheets will be made separately from the actual lessons and replace these. */
(function () {
  const S = (t, say, w, m, c) => ({ t, say, w, m, c });
  /* W = a finished worksheet spread shown as a picture: assets/worksheets/<book id>-<n>.png (t = what it is, for screen readers) */
  const W = (id, n, t) => ({ img: `assets/worksheets/${id}-${n}.png`, t });
  window.SERIES = {
    ees: { name: 'EES', full: 'GP English Emotion School', color: 'var(--c-pbl)', tint: '#fde6dc' },
    els: { name: 'ELS', full: 'GP English Language School', color: 'var(--c-lgr)', tint: '#e0effd' }
  };

  const ees = [
    { id: 'ees-park-ranger', level: 'A', no: '10-1', title: 'Park Ranger: People', kind: 'People · Environment & Life', pages: 16,
      en: 'Children meet a park ranger and learn to say who they are and what they protect.',
      ko: '공원 관리인을 만나 자기 직업을 소개하고, 무엇을 지키는지 말하는 표현을 배워요.',
      talk: ['Hello! What’s your job?', 'I am a park ranger.', 'What do you protect?'],
      /* real worksheets, made in Desktop/Claude/worksheets/ees-park-ranger (pictures copied to assets/worksheets) */
      sheets: [W('ees-park-ranger', 1, 'Hello! What’s your job?'), W('ees-park-ranger', 2, 'I protect the park'), W('ees-park-ranger', 3, 'What can we see?'), W('ees-park-ranger', 4, 'Let’s protect the forests and the rivers')] },
    { id: 'ees-park-ranger-2', level: 'A', no: '10-2', title: 'Park Ranger: History', kind: 'History · Environment & Life', pages: 16,
      en: 'Children find out what a national park is, where national parks are, and which animals live there.',
      ko: '국립공원이 무엇인지, 어디에 있는지, 어떤 동물이 사는지 알아봐요.',
      talk: ['What is a national park?', 'It is a protected place.', 'Where are national parks?'],
      /* worksheet pictures 5 to 8 of ees-park-ranger belong to this second book (10-2) */
      sheets: [W('ees-park-ranger', 5, 'What is a national park?'), W('ees-park-ranger', 6, 'Look at the animals in Africa'), W('ees-park-ranger', 7, 'What’s your name? I am Harry Yount.'), W('ees-park-ranger', 8, 'Yellowstone National Park')] },
    { id: 'ees-cave-explorer', level: 'B', no: '10-1', title: 'Cave Explorer: People', kind: 'People · Exploration & Tools', pages: 16,
      en: 'Children follow a cave explorer and talk about what can be found in a cave.',
      ko: '동굴 탐험가를 따라가며 동굴에서 무엇을 찾을 수 있는지 이야기해요.',
      talk: ['Hello! Do you explore caves?', 'Yes, I am a cave explorer.'],
      sheets: [W('ees-cave-explorer', 1, 'Do you explore caves?'), W('ees-cave-explorer', 2, 'What can you find in a cave?'), W('ees-cave-explorer', 3, 'What did you find? Some gold.'), W('ees-cave-explorer', 4, 'How do you explore? The five senses')] },
    { id: 'ees-cave-explorer-2', level: 'B', no: '10-2', title: 'Cave Explorer: History', kind: 'History · Exploration & Tools', pages: 16,
      en: 'Children learn who made cave paintings, what they drew, and why people once lived in caves.',
      ko: '누가 동굴 벽화를 그렸는지, 무엇을 그렸는지, 사람들이 왜 동굴에 살았는지 배워요.',
      talk: ['Who made cave paintings?', 'People did.', 'What did they draw?'],
      /* worksheet pictures 5 to 8 of ees-cave-explorer belong to this second book (10-2) */
      sheets: [W('ees-cave-explorer', 5, 'Who made cave paintings?'), W('ees-cave-explorer', 6, 'Caves can be dark, scary, cold'), W('ees-cave-explorer', 7, 'Why did people live in caves?'), W('ees-cave-explorer', 8, 'I made a cave painting')] },
    { id: 'ees-countries', level: 'A', no: '9', title: 'Countries of the World', kind: 'Big Book', pages: 20,
      en: 'A big book about sports around the world: what we practise and what we want to be best at.',
      ko: '세계 여러 나라의 운동 이야기를 담은 빅북이에요. 무엇을 연습하는지, 무엇을 잘하고 싶은지 말해요.',
      talk: ['What do you practice?', 'I practice … every day.', 'I want to be the best in the world.'],
      sheets: [S('I Practice Every Day', 'What do you practice?', 'I practice ___ every day.', 'medal', 'sun'), S('Around the World', 'Children play sports in every country.', 'I want to visit ___.', 'globe', 'sky'), S('The Best in the World', 'I want to be the best in the world.', 'I am good at ___.', 'medal', 'coral')] },
    { id: 'ees-culture', level: 'B', no: '9', title: 'Culture & Life', kind: 'Big Book', pages: 20,
      en: 'A big book about the sounds around our home and what Earth needs.',
      ko: '우리 집 주변의 소리와 지구에 필요한 것을 이야기하는 빅북이에요.',
      talk: ['What is that sound?', 'It is birds chirping.', 'What does Earth need?'],
      sheets: [S('What Is That Sound?', 'We hear many sounds around our home.', 'It is ___.', 'sound', 'coral'), S('What Does Earth Need?', 'Earth needs the sun, plants and clean water.', 'Earth needs ___.', 'sprout', 'mint'), S('Sounds at Home', 'Draw a sound you hear at home.', 'I hear ___.', 'speech', 'sky')] },
    { id: 'ees-athlete', level: 'A', no: '7', title: 'Athlete', kind: 'Active Literacy · Readers Series',
      en: 'An Active Literacy reader about athletes and sports.', ko: '운동선수와 스포츠를 주제로 한 Active Literacy 리더스예요.',
      sheets: [S('Ready, Set, Go!', 'An athlete trains every day.', 'I can ___.', 'medal', 'sun'), S('My Favourite Sport', 'Draw your favourite sport.', 'I like ___.', 'globe', 'sky'), S('Try Again', 'Athletes never give up.', 'I will try ___ again.', 'blocks', 'mint')] },
    { id: 'ees-beekeeper', level: 'B', no: '7', title: 'Beekeeper', kind: 'Active Literacy · Readers Series',
      en: 'An Active Literacy reader about a beekeeper, bees and honey.', ko: '양봉가와 꿀벌, 꿀을 주제로 한 Active Literacy 리더스예요.',
      sheets: [S('Busy Bees', 'A beekeeper takes care of bees.', 'Bees make ___.', 'bee', 'sun'), S('From Flower to Honey', 'Bees visit flowers.', 'I see a ___ flower.', 'sprout', 'mint'), S('A Home for Bees', 'Draw a bee and its home.', 'Bees live in a ___.', 'bee', 'coral')] },
    { id: 'ees-animal-friends', level: 'A', no: '6', title: 'Animal Friends', kind: 'Big Book', pages: 20,
      en: 'A big book about the animals we live with and care for.', ko: '우리와 함께 사는 동물 친구들을 이야기하는 빅북이에요.',
      sheets: [S('My Animal Friend', 'Animals are our friends.', 'My friend is a ___.', 'paw', 'coral'), S('Taking Care', 'Animal friends need love and care.', 'I give my friend ___.', 'speech', 'sky'), S('Draw a Friend', 'Draw an animal you like.', 'I like ___.', 'paw', 'sun')] },
    { id: 'ees-growing-plants', level: 'B', no: '6', title: 'Growing Plants', kind: 'Big Book',
      en: 'A big book about how plants grow and what they need.', ko: '식물이 어떻게 자라고 무엇이 필요한지 이야기하는 빅북이에요.',
      sheets: [S('From Seed to Plant', 'A plant grows from a seed.', 'Plants need ___.', 'sprout', 'mint'), S('My Garden', 'Draw a plant you want to grow.', 'I grow ___.', 'sprout', 'sun'), S('Watch It Grow', 'Plants change every day.', 'My plant is ___.', 'clock', 'sky')] }
  ].map(b => ({ ...b, series: 'ees' }));

  const els = [
    { id: 'els-reading', level: 'C', no: '9', title: 'Personality Essay', kind: 'Reading', pages: 24,
      en: 'A reading book that leads children from short texts to writing about themselves.',
      ko: '짧은 글을 읽고 자기 이야기를 써 보도록 이끄는 읽기 책이에요.',
      talk: ['Let’s enjoy our hobbies.', 'A goat grazes on the grass.'],
      sheets: [S('Let’s Enjoy Our Hobbies', 'We all need hobbies.', 'My hobby is ___.', 'book', 'sun'), S('Animal Homes', 'Which animals rest in dens?', 'A ___ rests in a den.', 'cave', 'mint'), S('All About Me', 'Write about what you like.', 'I like ___ because ___.', 'pen', 'lilac')] },
    { id: 'els-speaking', level: 'C', no: '7', title: 'Art Play and Drawing', kind: 'Speaking', pages: 20,
      en: 'A speaking book: children draw first, then talk about their picture.',
      ko: '먼저 그림을 그리고, 그 그림을 영어로 말해 보는 말하기 책이에요.',
      talk: ['Draw the missing animals in the park.'],
      sheets: [S('In the Park!', 'Draw the missing animals in the park.', 'The ___ is jumping.', 'brush', 'coral'), S('Tell Me About It', 'Talk about your picture.', 'This is my ___.', 'speech', 'sky'), S('Colour and Say', 'Art helps us speak.', 'I drew a ___.', 'brush', 'sun')] },
    { id: 'els-writing', level: 'C', no: '10', title: 'Language and Math', kind: 'Writing', pages: 28,
      en: 'A writing book that joins letters, words and numbers.', ko: '글자와 낱말, 수를 함께 써 보는 쓰기 책이에요.',
      sheets: [S('Letters and Numbers', 'We write with letters and numbers.', 'I can write ___.', 'letters', 'sun'), S('My Sentence', 'Write one sentence about today.', 'Today I ___.', 'pen', 'coral'), S('Count and Write', 'Count, then write the number word.', 'There are ___.', 'sort', 'sky')] },
    { id: 'els-k', level: 'K', no: '7', title: 'Math Play: Tangram Puzzles', kind: 'Literacy · Integrated Thinking', pages: 40,
      en: 'Children build pictures from tangram shapes, then count and name the shapes in English.',
      ko: '칠교 조각으로 그림을 만들고, 도형의 수를 세어 영어로 말해요.',
      talk: ['What am I? What shapes make up my body?', 'I am a dog.', 'How many triangles make up the dog?'],
      sheets: [S('What Am I?', 'What shapes make up my body?', 'I am a ___.', 'tangram', 'sun'), S('Count the Shapes', 'How many triangles make up the dog?', 'There are ___ triangles.', 'tangram', 'sky'), S('My Tangram', 'Make your own picture with shapes.', 'I made a ___.', 'sort', 'lilac')] },
    { id: 'els-math-weight', level: 'C', no: '6', title: 'Weight', kind: 'Literacy and Math', pages: 28,
      en: 'Heavy and light: comparing weight in words and in numbers.', ko: '무겁다, 가볍다: 무게를 말과 수로 비교해요.',
      sheets: [S('Heavy or Light?', 'Which one is heavier?', 'The ___ is heavier.', 'scale', 'sky'), S('Let’s Weigh', 'Draw two things and compare.', 'The ___ is lighter.', 'scale', 'sun'), S('Make It Balance', 'Make both sides the same.', '___ and ___ are the same.', 'scale', 'mint')] },
    { id: 'els-math-category', level: 'C', no: '8', title: 'Category', kind: 'Literacy and Math', pages: 28,
      en: 'Sorting and grouping: finding what belongs together and saying why.', ko: '분류하기: 무엇이 같은 무리인지 찾고 이유를 말해요.',
      sheets: [S('Sort It Out', 'Things that are alike go together.', 'These are all ___.', 'sort', 'coral'), S('Which Group?', 'Draw one more for the group.', 'A ___ belongs here.', 'sort', 'sun'), S('My Own Groups', 'Make your own rule.', 'My rule is ___.', 'blocks', 'lilac')] },
    { id: 'els-math-time', level: 'C', no: '9', title: 'Time', kind: 'Literacy and Math', pages: 28,
      en: 'Clocks and the day: reading the time and telling what happens when.', ko: '시계와 하루: 시각을 읽고 언제 무엇을 하는지 말해요.',
      sheets: [S('What Time Is It?', 'Look at the clock.', 'It is ___ o’clock.', 'clock', 'sky'), S('My Day', 'Draw what you do in the morning.', 'At ___ I wake up.', 'clock', 'sun'), S('Before and After', 'What comes next?', 'After lunch I ___.', 'clock', 'mint')] },
    { id: 'els-speech', level: 'C', no: '10', title: 'Speech Book 10', kind: 'Mathematical Speech', pages: 20,
      en: 'Speaking maths in English with clear sentence patterns: numbers, order, comparison and position.',
      ko: '수, 순서, 비교, 위치를 또렷한 문장으로 말해 보는 수학 스피치 책이에요.',
      talk: ['I can speak English!'],
      sheets: [S('I Can Speak English!', 'Say it with numbers.', 'There are ___.', 'speech', 'sun'), S('Compare and Say', 'Which is bigger?', 'The ___ is bigger.', 'scale', 'coral'), S('Where Is It?', 'Use position words.', 'It is ___ the box.', 'blocks', 'sky')] }
  ].map(b => ({ ...b, series: 'els' }));

  // In order: series (EES, then ELS), then level (K, A, B, C), then number, then type
  const LV = ['K', 'A', 'B', 'C'];
  const num = n => parseFloat(String(n).replace('-', '.'));   // '10-2' sorts after '10-1'
  const out = [...ees, ...els].sort((a, b) =>
    (a.series === b.series ? 0 : a.series === 'ees' ? -1 : 1) || LV.indexOf(a.level) - LV.indexOf(b.level) ||
    num(a.no) - num(b.no) || a.kind.localeCompare(b.kind));
  window.BOOKS = out.map(b => ({ ...b, cover: 'assets/books/' + b.id + '.webp' }));
})();
