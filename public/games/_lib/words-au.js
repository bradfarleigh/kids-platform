const AU = {};

AU.SOUND_WORDS = {
  a:'apple', b:'ball', c:'cat', d:'dog', e:'egg', f:'fish', g:'goat',
  h:'hat', i:'insect', j:'jam', k:'kite', l:'leg', m:'moon', n:'net',
  o:'orange', p:'pig', q:'queen', r:'rain', s:'sun', t:'tap',
  u:'umbrella', v:'van', w:'web', x:'fox', y:'yo-yo', z:'zebra',
};

AU.STAGES = [
  { id:1, icon:'🐣', label:'Letters', ages:'4–5', sub:'Trace letters & hear their sounds', mode:'trace', words:null },
  { id:2, icon:'🐱', label:'First Words', ages:'5', sub:'Sound out short words', mode:'tiles', words:[
    { w:'cat', g:['c','a','t'], e:'🐱' }, { w:'dog', g:['d','o','g'], e:'🐶' },
    { w:'sun', g:['s','u','n'], e:'☀️' }, { w:'pig', g:['p','i','g'], e:'🐷' },
    { w:'hen', g:['h','e','n'], e:'🐔' }, { w:'bus', g:['b','u','s'], e:'🚌' },
    { w:'hat', g:['h','a','t'], e:'🎩' }, { w:'cup', g:['c','u','p'], e:'☕' },
    { w:'bed', g:['b','e','d'], e:'🛏️' }, { w:'box', g:['b','o','x'], e:'📦' },
    { w:'fox', g:['f','o','x'], e:'🦊' }, { w:'egg', g:['e','gg'], e:'🥚' },
    { w:'ant', g:['a','n','t'], e:'🐜' }, { w:'bag', g:['b','a','g'], e:'👜' },
    { w:'net', g:['n','e','t'], e:'🥅' }, { w:'web', g:['w','e','b'], e:'🕸️' },
    { w:'bug', g:['b','u','g'], e:'🐛' }, { w:'rat', g:['r','a','t'], e:'🐀' },
    { w:'leg', g:['l','e','g'], e:'🦵' }, { w:'map', g:['m','a','p'], e:'🗺️' },
    { w:'pan', g:['p','a','n'], e:'🍳' }, { w:'van', g:['v','a','n'], e:'🚐' },
    { w:'ten', g:['t','e','n'], e:'🔟' }, { w:'pen', g:['p','e','n'], e:'🖊️' },
    { w:'nut', g:['n','u','t'], e:'🥜' }, { w:'cap', g:['c','a','p'], e:'🧢' },
    { w:'log', g:['l','o','g'], e:'🪵' }, { w:'tap', g:['t','a','p'], e:'🚰' },
    { w:'duck', g:['d','u','ck'], e:'🦆' }, { w:'sock', g:['s','o','ck'], e:'🧦' },
    { w:'bell', g:['b','e','ll'], e:'🔔' },
  ]},
  { id:3, icon:'🚢', label:'Sound Teams', ages:'6', sub:'sh ch th ng & blends', mode:'tiles', words:[
    { w:'ship', g:['sh','i','p'], e:'🚢' }, { w:'fish', g:['f','i','sh'], e:'🐟' },
    { w:'shell', g:['sh','e','ll'], e:'🐚' }, { w:'shop', g:['sh','o','p'], e:'🏪' },
    { w:'chick', g:['ch','i','ck'], e:'🐤' }, { w:'chips', g:['ch','i','p','s'], e:'🍟' },
    { w:'lunch', g:['l','u','n','ch'], e:'🍱' }, { w:'bath', g:['b','a','th'], e:'🛁' },
    { w:'ring', g:['r','i','ng'], e:'💍' }, { w:'king', g:['k','i','ng'], e:'👑' },
    { w:'wing', g:['w','i','ng'], e:'🪽' }, { w:'song', g:['s','o','ng'], e:'🎵' },
    { w:'frog', g:['f','r','o','g'], e:'🐸' }, { w:'crab', g:['c','r','a','b'], e:'🦀' },
    { w:'drum', g:['d','r','u','m'], e:'🥁' }, { w:'flag', g:['f','l','a','g'], e:'🚩' },
    { w:'swim', g:['s','w','i','m'], e:'🏊' }, { w:'nest', g:['n','e','s','t'], e:'🪺' },
    { w:'tent', g:['t','e','n','t'], e:'⛺' }, { w:'hand', g:['h','a','n','d'], e:'✋' },
    { w:'milk', g:['m','i','l','k'], e:'🥛' }, { w:'gift', g:['g','i','f','t'], e:'🎁' },
    { w:'plant', g:['p','l','a','n','t'], e:'🪴' }, { w:'truck', g:['t','r','u','ck'], e:'🚚' },
    { w:'clap', g:['c','l','a','p'], e:'👏' }, { w:'stop', g:['s','t','o','p'], e:'🛑' },
  ]},
  { id:4, icon:'🌙', label:'Long Vowels', ages:'6–7', sub:'ai ee oa oo & magic e', mode:'tiles', words:[
    { w:'rain', g:['r','ai','n'], e:'🌧️' }, { w:'snail', g:['s','n','ai','l'], e:'🐌' },
    { w:'train', g:['t','r','ai','n'], e:'🚂' }, { w:'hay', g:['h','ay'], e:'🌾' },
    { w:'tree', g:['t','r','ee'], e:'🌳' }, { w:'bee', g:['b','ee'], e:'🐝' },
    { w:'sheep', g:['sh','ee','p'], e:'🐑' }, { w:'queen', g:['qu','ee','n'], e:'👸' },
    { w:'sea', g:['s','ea'], e:'🌊' }, { w:'leaf', g:['l','ea','f'], e:'🍃' },
    { w:'peach', g:['p','ea','ch'], e:'🍑' }, { w:'beach', g:['b','ea','ch'], e:'🏖️' },
    { w:'night', g:['n','igh','t'], e:'🌃' }, { w:'light', g:['l','igh','t'], e:'💡' },
    { w:'moon', g:['m','oo','n'], e:'🌙' }, { w:'spoon', g:['s','p','oo','n'], e:'🥄' },
    { w:'boot', g:['b','oo','t'], e:'🥾' }, { w:'book', g:['b','oo','k'], e:'📖' },
    { w:'boat', g:['b','oa','t'], e:'⛵' }, { w:'goat', g:['g','oa','t'], e:'🐐' },
    { w:'coat', g:['c','oa','t'], e:'🧥' }, { w:'road', g:['r','oa','d'], e:'🛣️' },
    { w:'snow', g:['s','n','ow'], e:'☃️' }, { w:'owl', g:['ow','l'], e:'🦉' },
    { w:'cow', g:['c','ow'], e:'🐮' }, { w:'clown', g:['c','l','ow','n'], e:'🤡' },
    { w:'star', g:['s','t','ar'], e:'⭐' }, { w:'shark', g:['sh','ar','k'], e:'🦈' },
    { w:'car', g:['c','ar'], e:'🚗' }, { w:'corn', g:['c','or','n'], e:'🌽' },
    { w:'fork', g:['f','or','k'], e:'🍴' }, { w:'storm', g:['s','t','or','m'], e:'⛈️' },
    { w:'surf', g:['s','ur','f'], e:'🏄' }, { w:'bird', g:['b','ir','d'], e:'🐦' },
    { w:'girl', g:['g','ir','l'], e:'👧' }, { w:'cake', g:['c','a','k','e'], e:'🎂' },
    { w:'snake', g:['s','n','a','k','e'], e:'🐍' }, { w:'plane', g:['p','l','a','n','e'], e:'✈️' },
    { w:'kite', g:['k','i','t','e'], e:'🪁' }, { w:'bike', g:['b','i','k','e'], e:'🚲' },
    { w:'bone', g:['b','o','n','e'], e:'🦴' }, { w:'nose', g:['n','o','s','e'], e:'👃' },
    { w:'rose', g:['r','o','s','e'], e:'🌹' },
  ]},
  { id:5, icon:'🦘', label:'Tricky Words', ages:'7–8', sub:'Bigger words & endings', mode:'tiles', words:[
    { w:'whale', g:['wh','a','l','e'], e:'🐋' }, { w:'wheel', g:['wh','ee','l'], e:'🛞' },
    { w:'phone', g:['ph','o','n','e'], e:'📱' }, { w:'dolphin', g:['d','o','l','ph','i','n'], e:'🐬' },
    { w:'coin', g:['c','oi','n'], e:'🪙' }, { w:'boy', g:['b','oy'], e:'👦' },
    { w:'toy', g:['t','oy'], e:'🧸' }, { w:'cloud', g:['c','l','ou','d'], e:'☁️' },
    { w:'mouse', g:['m','ou','s','e'], e:'🐭' }, { w:'house', g:['h','ou','s','e'], e:'🏠' },
    { w:'chair', g:['ch','air'], e:'🪑' }, { w:'bear', g:['b','ear'], e:'🐻' },
    { w:'pear', g:['p','ear'], e:'🍐' }, { w:'face', g:['f','a','ce'], e:'🙂' },
    { w:'dance', g:['d','a','n','ce'], e:'💃' }, { w:'giraffe', g:['g','i','r','a','ff','e'], e:'🦒' },
    { w:'kangaroo', g:['k','a','ng','a','r','oo'], e:'🦘' }, { w:'koala', g:['k','o','a','l','a'], e:'🐨' },
    { w:'rainbow', g:['r','ai','n','b','ow'], e:'🌈' }, { w:'football', g:['f','oo','t','b','a','ll'], e:'⚽' },
    { w:'cupcake', g:['c','u','p','c','a','k','e'], e:'🧁' }, { w:'sunflower', g:['s','u','n','f','l','ow','er'], e:'🌻' },
    { w:'butterfly', g:['b','u','tt','er','f','l','y'], e:'🦋' }, { w:'running', g:['r','u','nn','i','ng'], e:'🏃' },
    { w:'sleeping', g:['s','l','ee','p','i','ng'], e:'😴' }, { w:'smiled', g:['s','m','i','l','e','d'], e:'😊' },
  ]},
  { id:6, icon:'⌨️', label:'Hear & Type', ages:'8–9', sub:'Listen, then type the word', mode:'type', words:[
    { w:'unhappy', s:'The unhappy baby cried.' },
    { w:'unlock', s:'Use the key to unlock the door.' },
    { w:'replay', s:'Tap the button to replay the song.' },
    { w:'dislike', s:'I dislike cold showers.' },
    { w:'careful', s:'Be careful crossing the road.' },
    { w:'careless', s:'The careless puppy knocked over the plant.' },
    { w:'helpful', s:'It is helpful to pack your own bag.' },
    { w:'hopeless', s:'The team felt hopeless at half time.' },
    { w:'slowly', s:'The wombat walked slowly across the road.' },
    { w:'quickly', s:'She quickly packed her school bag.' },
    { w:'quicker', s:'A plane is quicker than a car.' },
    { w:'brightest', s:'That is the brightest star in the sky.' },
    { w:'playful', s:'The playful puppy chased its tail.' },
    { w:'teacher', s:'Our teacher reads us a story every day.' },
    { w:'sunny', s:'It was a sunny day at the beach.' },
    { w:'funny', s:'He told a funny joke at lunch.' },
    { w:'garden', s:'We grow tomatoes in our garden.' },
    { w:'window', s:'Rain ran down the window.' },
    { w:'morning', s:'We walk to school every morning.' },
    { w:'yellow', s:'The yellow bus stopped at our street.' },
  ]},
  { id:7, icon:'🏆', label:'Champions', ages:'9–10', sub:'Spelling-bee words', mode:'type', words:[
    { w:'station', s:'The train stops at the station.' },
    { w:'question', s:'Put your hand up to ask a question.' },
    { w:'picture', s:'She drew a picture of her family.' },
    { w:'nature', s:'We saw lots of nature on our bushwalk.' },
    { w:'colour', s:'Green is my favourite colour.' },
    { w:'favourite', s:'Mangoes are my favourite fruit.' },
    { w:'neighbour', s:'Our neighbour has a friendly dog.' },
    { w:'harbour', s:'The ferry crossed the harbour.' },
    { w:'because', s:'We stayed inside because of the storm.' },
    { w:'friend', s:'My friend lives next door.' },
    { w:'beautiful', s:'The reef was beautiful.' },
    { w:'enough', s:'Is there enough cake for everyone?' },
    { w:'thought', s:'I thought it would rain today.' },
    { w:'caught', s:'She caught the ball with one hand.' },
    { w:'knee', s:'He grazed his knee at footy training.' },
    { w:'knife', s:'Use a knife and fork.' },
    { w:'write', s:'Please write your name at the top.' },
    { w:'wrong', s:'I took the wrong bus home.' },
    { w:'climb', s:'Koalas climb gum trees.' },
    { w:'lamb', s:'The lamb stayed close to its mum.' },
    { w:'island', s:'We sailed to a small island.' },
    { w:'answer', s:'Write the answer in your book.' },
    { w:'minute', s:'The popcorn takes one minute.' },
    { w:'often', s:'We often swim at the beach in summer.' },
  ]},
];

AU.GPC = {
  2: {
    cons: ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','y','z','ck','ll','ss','ff'],
    vowels: ['a','e','i','o','u'],
  },
  3: {
    cons: ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','y','z','ck','ll','ss','ff','sh','ch','th','ng','qu'],
    vowels: ['a','e','i','o','u'],
  },
  4: {
    cons: ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','y','z','ck','ll','ss','ff','sh','ch','th','ng','qu'],
    vowels: ['a','e','i','o','u','ai','ay','ee','ea','igh','oa','ow','oo','ar','or','er','ir','ur'],
  },
  5: {
    cons: ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','y','z','ck','ll','ss','ff','sh','ch','th','ng','qu','wh','ph','ce','tt','nn'],
    vowels: ['a','e','i','o','u','ai','ay','ee','ea','igh','oa','ow','oo','ar','or','er','ir','ur','oi','oy','ou','air','ear'],
  },
};

AU.ALIEN = {
  1: {
    real: ['cat','dog','sun','pig','hen','bus','nut','leg','map','bed'],
    alien: ['vap','mip','dop','zub','fet','hib','gud','sep','taz','wob'],
  },
  2: {
    real: ['ship','fish','chick','bath','ring','frog','drum','flag','nest','milk'],
    alien: ['shap','chom','thip','quen','drap','snib','frip','plon','clab','trab'],
  },
  3: {
    real: ['rain','sheep','night','moon','boat','snow','star','corn','cake','kite'],
    alien: ['straim','queep','foan','glay','jound','sloam','groak','thaip','murn','doil'],
  },
};

AU.SORTS = [
  { id:'long-a', icon:'🌧️', title:'Long a', ages:'7+', rule:'ay ends a word, ai sits in the middle, a_e wraps around the end.',
    cols: [
      { label:'ai', words:['rain','snail','train','paint','chain','tail'] },
      { label:'ay', words:['play','day','tray','stay','away','spray'] },
      { label:'a_e', words:['cake','snake','plane','gate','late','wave'] },
    ]},
  { id:'long-e', icon:'🌳', title:'Long e', ages:'7+', rule:'ee and ea both say ee — you have to remember which team each word is on.',
    cols: [
      { label:'ee', words:['tree','sheep','green','sleep','queen','week'] },
      { label:'ea', words:['sea','leaf','beach','read','dream','team'] },
    ]},
  { id:'long-o', icon:'⛵', title:'Long o', ages:'7+', rule:'ow usually ends a word, oa sits in the middle, o_e wraps around the end.',
    cols: [
      { label:'oa', words:['boat','goat','coat','road','soap','toast'] },
      { label:'ow', words:['snow','grow','show','slow','yellow','window'] },
      { label:'o_e', words:['bone','nose','home','rope','stone','smoke'] },
    ]},
  { id:'ed', icon:'🏃', title:'ed endings', ages:'8+', rule:'ed can say t, d or id — say the word out loud to hear it.',
    cols: [
      { label:'ed says t', words:['jumped','kicked','looked','washed','helped','licked'] },
      { label:'ed says d', words:['played','smiled','rained','cleaned','yelled','opened'] },
      { label:'ed says id', words:['wanted','painted','planted','shouted','landed','melted'] },
    ]},
  { id:'er-ir-ur', icon:'🐦', title:'er ir ur', ages:'8+', rule:'er, ir and ur all say the same sound.',
    cols: [
      { label:'er', words:['her','fern','winter','river','sister','under'] },
      { label:'ir', words:['bird','girl','first','shirt','dirt','third'] },
      { label:'ur', words:['turn','burn','nurse','surf','curl','hurt'] },
    ]},
  { id:'plurals', icon:'🐈', title:'s or es', ages:'8+', rule:'Add es when a word ends in s, x, sh or ch.',
    cols: [
      { label:'s', words:['cats','dogs','birds','trees','cars','hands'] },
      { label:'es', words:['boxes','buses','wishes','beaches','foxes','glasses'] },
    ]},
];

AU.FACTORY = {
  1: [
    { clue:'not happy', base:'happy', affix:'un', pos:'pre', word:'unhappy' },
    { clue:'open the lock', base:'lock', affix:'un', pos:'pre', word:'unlock' },
    { clue:'not kind', base:'kind', affix:'un', pos:'pre', word:'unkind' },
    { clue:'tell again', base:'tell', affix:'re', pos:'pre', word:'retell' },
    { clue:'play again', base:'play', affix:'re', pos:'pre', word:'replay' },
    { clue:'read again', base:'read', affix:'re', pos:'pre', word:'reread' },
    { clue:'does not like', base:'like', affix:'dis', pos:'pre', word:'dislike' },
    { clue:'does not agree', base:'agree', affix:'dis', pos:'pre', word:'disagree' },
    { clue:'behave badly', base:'behave', affix:'mis', pos:'pre', word:'misbehave' },
    { clue:'take things out of a bag', base:'pack', affix:'un', pos:'pre', word:'unpack' },
  ],
  2: [
    { clue:'full of care', base:'care', affix:'ful', pos:'suf', word:'careful' },
    { clue:'without care', base:'care', affix:'less', pos:'suf', word:'careless' },
    { clue:'full of help', base:'help', affix:'ful', pos:'suf', word:'helpful' },
    { clue:'without hope', base:'hope', affix:'less', pos:'suf', word:'hopeless' },
    { clue:'in a slow way', base:'slow', affix:'ly', pos:'suf', word:'slowly' },
    { clue:'in a quick way', base:'quick', affix:'ly', pos:'suf', word:'quickly' },
    { clue:'a person who paints', base:'paint', affix:'er', pos:'suf', word:'painter' },
    { clue:'a person who teaches', base:'teach', affix:'er', pos:'suf', word:'teacher' },
    { clue:'the most bright', base:'bright', affix:'est', pos:'suf', word:'brightest' },
    { clue:'full of colour', base:'colour', affix:'ful', pos:'suf', word:'colourful' },
  ],
  3: [
    { clue:'not helpful', base:'help', pre:'un', suf:'ful', word:'unhelpful' },
    { clue:'in a way that is not fair', base:'fair', pre:'un', suf:'ly', word:'unfairly' },
    { clue:'showing no respect', base:'respect', pre:'dis', suf:'ful', word:'disrespectful' },
    { clue:'tricking someone the wrong way', base:'lead', pre:'mis', suf:'ing', word:'misleading' },
    { clue:'painted again', base:'paint', pre:'re', suf:'ed', word:'repainted' },
    { clue:'took everything out', base:'pack', pre:'un', suf:'ed', word:'unpacked' },
    { clue:'played again', base:'play', pre:'re', suf:'ed', word:'replayed' },
    { clue:'does not trust', base:'trust', pre:'dis', suf:'ful', word:'distrustful' },
    { clue:'in an unkind way', base:'kind', pre:'un', suf:'ly', word:'unkindly' },
    { clue:'treated badly', base:'treat', pre:'mis', suf:'ed', word:'mistreated' },
  ],
};

AU.FACTORY_AFFIXES = { pre: ['un','re','dis','mis'], suf: ['ful','less','ly','er','est','ing','ed'] };

AU.EXTRA_WORDS = ['cot','cut','bat','bit','but','bet','bad','bud','bid','dig','dug','wig','pin','pun','pit','pat','pot','put','pet','rot','rut','ran','run','rib','rob','rub','hot','hit','hut','ham','him','hum','hop','hip','top','tip','tin','tan','ton','men','man','mat','met','mad','mud','sat','sit','set','sad','son','sip','sap','fan','fun','fin','fit','fat','fig','lap','lip','lit','lot','let','led','lad','lid','kid','kit','gas','got','gut','gun','gum','jet','jot','jab','job','jog','jug','win','wet','wit','vet','yes','yet','zip','cop','cob','cab','nip','nap','nod','not','peg','pop','pup','pad','red','rid','rod','rag','rig','rug','tag','tug','wag','dot','den','din','don','dim','dam','beg','bog','bun','ban','bin','hag','hog','keg','mob','mop','mum','nan','pal','paw','sob','sow','sew','tab','tub','tot','vat','wax','fix','mix','deck','dock','dack','rock','lock','lick','kick','pick','tick','sick','neck','peck','pack','puck','luck','muck','tuck','suck','back','sack','rack','tack','lack','jack','buck','yuck','mock','hock','jock','nick','wick','cell','dell','fen','ken','hem','dill','bill','fill','hill','mill','pill','till','will','tell','sell','fell','well','yell','ball','call','fall','tall','wall','doll','dull','gull','hull','coke','lake','like','lime','line','lane','mane','mine','bake','rake','wake','woke','poke','pike','duke','dome','dime','dame','game','gate','late','mate','rate','site','bite','note','vote','rope','ripe','rise','rude','ride','rode','code','cove','cave','dive','dove','five','hive','gave','give','live','love','made','mode','wide','wade','wine','vine','nine','pine','pane','cane','cone','tone','tune','tame','time','tale','tile','pole','pale','pile','mile','mole','male','sale','sole','tide','hide','hole','kale','toad','load','goad','maid','paid','raid','main','pain','gain','vain','wait','bait','meat','heat','beat','neat','seat','bead','lead','read','mean','bean','lean','team','beam','seam','week','seek','peek','meek','keen','teen','seen','been','feet','meet','beet','feed','seed','weed','deed','need','reel','feel','peel','heel','moan','loan','soak','coal','foal','goal','born','horn','torn','worn','cord','lord','ford','form','fort','sort','port','part','park','dark','bark','mark','lark','hard','card','cart','tart','dart','barn','yarn','farm','harm','chat','chin','chop','chest','than','then','them','this','that','thud','shin','shed','shot','shut','sham','wish','dish','dash','mash','rash','cash','bash','gash','hash','wash','mesh','gosh','hush','rush','bush','push','rang','sang','hang','bang','gang','long','lung','sung','rung','ring','wink','sink','link','pink','hunk','junk','bunk','sunk','howl','fowl','gown','town','down','brown','frown','crow','blow','flow','glow','slow','stow','mown','sown','dawn','lawn','seal','heal','meal','deal','real','peat','feat'];

AU.BLOCKED = new Set(['dick','cock','tit','tits','ass','arse','crap','fart','poo','wee','bum','shit','shat','shet','piss','damn','hell','sex','wank','slut','fuck','fuk','cunt','knob','nob','dik','fag','prat','git','sod','turd','spaz','homo','negro','nazi']);

AU.VALID = new Set(AU.EXTRA_WORDS);
AU.STAGES.forEach(s => (s.words ?? []).forEach(x => AU.VALID.add(x.w)));
AU.SORTS.forEach(s => s.cols.forEach(c => c.words.forEach(w => AU.VALID.add(w))));
Object.values(AU.ALIEN).forEach(l => l.real.forEach(w => AU.VALID.add(w)));
Object.values(AU.FACTORY).forEach(l => l.forEach(p => AU.VALID.add(p.word)));

AU.shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

let _auVoices = [];
if ('speechSynthesis' in window) {
  _auVoices = speechSynthesis.getVoices();
  speechSynthesis.addEventListener('voiceschanged', () => { _auVoices = speechSynthesis.getVoices(); });
}

AU.speak = (text, opts = {}) => {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = _auVoices.find(x => x.lang === 'en-AU')
    || _auVoices.find(x => x.lang && x.lang.startsWith('en-GB'))
    || _auVoices.find(x => x.lang && x.lang.startsWith('en'));
  if (v) u.voice = v;
  u.rate = opts.rate ?? 0.85;
  u.pitch = opts.pitch ?? 1.05;
  speechSynthesis.speak(u);
};
