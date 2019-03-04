const app = {  
    emoji: null,
    cardBack: "🎴", // '\u1F3b4' "flower playing cards",
    checkMark: '\u2705',
    defaultGameSize: 'med',
    sizeValues: {
        'sm': {rows: 4, cols: 4},
        'med': {rows: 6, cols: 4},
        'lg': {rows: 6, cols: 6},
        'xl': {rows: 8, cols: 8},
    },
}

const game = {
    gameSize: 'med',
    cards: [], // card objects in dom
    cardFaceUp: [], // map of card-face states
    cardFronts: [], // card images
    completeCards: 0,
    elapsedSeconds: 0,
    selections: [],
    turnCount: 0,
    timer: null,
    rows: 0,
    cols: 0,
    elements: {
        moveCounter: document.getElementById('moveCounter'),  
        gridSize: document.getElementById('gridSize'),
        popup: document.getElementById('gameOver'),
        timerMinutes: document.getElementById('minutes'),
        timerSeconds: document.getElementById('seconds')
    },
}

function buildCardHTML(row, col) {
    let cardRow = ('00' + row).slice(-2); // left-pad 0s 
    let cardCol = ('00' + col).slice(-2);
    let cardHTML = '<div class="column card" id="card-' + cardRow + cardCol + '">' + app.cardBack + '</div>';
    return cardHTML;
}
function buildCardGridRow(rowNum, rows, cols){
    let rowHTML = '<div class="row">';
    for (let col = 0; col < cols; col++) {
        rowHTML += buildCardHTML(rowNum, col);
    }
    rowHTML += '</div>';
    return rowHTML;
}

function buildCardGrid(rows, cols) {
    let html = '';
    for (let i = 0; i < rows; i++) {
        html += buildCardGridRow(i, rows, cols);
    }
    return html;
}
function addCards(rows, cols) {
    // dynamic card array size. Must be even number of cards
    let parentContainer = document.getElementById("cardArray");
    parentContainer.className = "container rows_" + rows + " cols_" + cols
    parentContainer.innerHTML = buildCardGrid(rows,cols);
}

function startTimer(){
    game.timer = setInterval(updateTimer, 1000);
}

function stopTimer(){
    if (game.timer){
        clearInterval(game.timer);
    }
}

function resetTimer() {
    stopTimer();
    game.elapsedSeconds = 0;
    game.elements.timerMinutes.innerHTML = '00';
    game.elements.timerSeconds.innerHTML = '00';
  }
  
function updateTimer() {
    game.elapsedSeconds++;
    let seconds = (game.elapsedSeconds % 60).toFixed(0);
    seconds = ('00' + seconds).slice(-2); // left-pad 0s
    minutes = Math.floor(game.elapsedSeconds / 60)
    game.elements.timerMinutes.innerHTML = minutes;
    game.elements.timerSeconds.innerHTML = seconds;
}

function getCardIndex(card) {
    // 0000 -> row, row, col, col
    let row = Number(card.id.slice(-4,-2));
    let col = Number(card.id.slice(-2));
    let index = row * game.cols + col;
    return index;
}

function isFaceUp(card){
    return(game.cardFaceUp[getCardIndex(card)]);
}
function turnFaceDown(card){
    card.innerHTML = app.cardBack;
    game.cardFaceUp[getCardIndex(card)] = 0;
}
function turnFaceUp(card){
    // ToDo: Front images
    let cardIndex = getCardIndex(card);
    card.innerHTML = game.cardFronts[cardIndex];
    game.cardFaceUp[cardIndex] = 1;
}
function toggleCard(card) {
    if (isFaceUp(card)) {
        turnFaceDown(card);
    } else {
        turnFaceUp(card);
    }
}

function setCardCompleted(card) {
    card.innerHTML = app.checkMark;
    card.removeEventListener('click', cardClickEventHandler);
}

function isMatch() {
    let card0 = game.selections[0];
    let card1 = game.selections[1];
    let card0Index = getCardIndex(card0);
    let card1Index = getCardIndex(card1);
    return game.cardFronts[card0Index] === game.cardFronts[card1Index];
}
function addClass(element, className) {
    if (element.classList)
  element.classList.add(className);
else
  element.className += ' ' + className;
}

function removeClass(element, className) {
    if (element.classList)
  element.classList.remove(className);
else
  element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function setGameWon(){
    let popup = game.elements.popup;
    let message = "Congratulations! You won with " +
    game.turnCount + " moves in " +
    game.elapsedSeconds + " seconds." + 
    "<p>Play again?</p>";
    popup.innerHTML = message;
    popup.classList.toggle("show");
    stopTimer();
}

function resolveTurn(isCorrect) {
    const longPause = 1000; // ms
    const shortPause = 500;

    let card0 = game.selections[0];
    let card1 = game.selections[1];

    if (isCorrect) {
        completedCards += 2;
        addClass(card0, 'flashCorrect')
        setTimeout(() => {
            setCardCompleted(card0);
            setCardCompleted(card1);
        }, shortPause);
        if (completedCards === game.cards.length){
            setGameWon();
        }
    } else {
        // pause for user to see, then reset.
        setTimeout(() => {
            toggleCard(card0)
        }, longPause);
        setTimeout(() => {
            toggleCard(card1);
        }, longPause);
    }
    game.selections.pop();
    game.selections.pop();
}

function cardClickEventHandler() {
    if (game.turnCount === 0) {
        startTimer();
    }
    // don't allow re-picking the same card on a turn.
    if (!(game.selections.length === 1 && game.selections[0] === this)){
        incrementMoveCounter();
        game.selections.push(this);
        toggleCard(this);
        if (game.selections.length == 2) {
            resolveTurn(isMatch()); 
        }
    } 
};

function popupClickHandler() {
    initGame();
    game.elements.popup.classList.toggle("show");
}

function setGameSize(size) {
    game.gameSize = size;
    game.rows = app.sizeValues[size].rows;
    game.cols = app.sizeValues[size].cols;

}
function gameSizeChangeHandler(e){
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.value != game.gameSize) {
        setGameSize(e.currentTarget.value);
        initGame();
    }

  }
  
function setMoveCounter() {
    moveCounter.innerHTML = String(game.turnCount);
}

function incrementMoveCounter() {
    game.turnCount++;
    setMoveCounter();
}

function resetMoveCounter() {
    game.turnCount = 0;
    setMoveCounter();
}

function shuffleCards() {
    
    let emojiCount = emoji.length,
        cardFront = '',
        m = game.rows * game.cols, 
        t, i;

    // Need at least two of each card.  Symbol pairs may repeat.
    for (i = 0; i < m; i += 2) {
        cardFront = Math.floor(Math.random() * emojiCount);
        game.cardFronts[i] = game.cardFronts[i+1] = emoji[cardFront].char;
    }
    // Fisher-Yates shuffle.
    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        t = game.cardFronts[m];
        game.cardFronts[m] = game.cardFronts[i];
        game.cardFronts[i] = t;
    }      
}

function initGame() {
    const cardCount = game.rows * game.cols;
    addCards(game.rows, game.cols);
    game.selections = [];
    game.cardFronts = [];
    game.cardFaceUp = [];
    for (var i = 0; i < cardCount; i++) {
        game.cardFronts.push('');
        game.cardFaceUp.push(0);
    }

    game.cards = document.getElementsByClassName('card');
    Array.from(game.cards).forEach(function(card) {
        card.addEventListener('click', cardClickEventHandler);
    });    

    for (card of game.cards) {
        turnFaceDown(card);
    }
    shuffleCards();
    resetTimer();
    resetMoveCounter();
    completedCards = 0;
}


emojiJSON = `[
    {
        "no": 1,
        "codes": "1F600",
        "char": "😀",
        "name": "grinning face",
        "keywords": "face | grin | grinning face"
    },
    {
        "no": 2,
        "codes": "1F603",
        "char": "😃",
        "name": "grinning face with big eyes",
        "keywords": "face | grinning face with big eyes | mouth | open | smile"
    },
    {
        "no": 3,
        "codes": "1F604",
        "char": "😄",
        "name": "grinning face with smiling eyes",
        "keywords": "eye | face | grinning face with smiling eyes | mouth | open | smile"
    },
    {
        "no": 4,
        "codes": "1F601",
        "char": "😁",
        "name": "beaming face with smiling eyes",
        "keywords": "beaming face with smiling eyes | eye | face | grin | smile"
    },
    {
        "no": 5,
        "codes": "1F606",
        "char": "😆",
        "name": "grinning squinting face",
        "keywords": "face | grinning squinting face | laugh | mouth | satisfied | smile"
    },
    {
        "no": 6,
        "codes": "1F605",
        "char": "😅",
        "name": "grinning face with sweat",
        "keywords": "cold | face | grinning face with sweat | open | smile | sweat"
    },
    {
        "no": 7,
        "codes": "1F923",
        "char": "🤣",
        "name": "rolling on the floor laughing",
        "keywords": "face | floor | laugh | rolling | rolling on the floor laughing"
    },
    {
        "no": 8,
        "codes": "1F602",
        "char": "😂",
        "name": "face with tears of joy",
        "keywords": "face | face with tears of joy | joy | laugh | tear"
    },
    {
        "no": 9,
        "codes": "1F642",
        "char": "🙂",
        "name": "slightly smiling face",
        "keywords": "face | slightly smiling face | smile"
    },
    {
        "no": 10,
        "codes": "1F643",
        "char": "🙃",
        "name": "upside-down face",
        "keywords": "face | upside-down"
    },
    {
        "no": 11,
        "codes": "1F609",
        "char": "😉",
        "name": "winking face",
        "keywords": "face | wink | winking face"
    },
    {
        "no": 12,
        "codes": "1F60A",
        "char": "😊",
        "name": "smiling face with smiling eyes",
        "keywords": "blush | eye | face | smile | smiling face with smiling eyes"
    },
    {
        "no": 13,
        "codes": "1F607",
        "char": "😇",
        "name": "smiling face with halo",
        "keywords": "angel | face | fantasy | halo | innocent | smiling face with halo"
    },
    {
        "no": 14,
        "codes": "1F970",
        "char": "🥰",
        "name": "smiling face with 3 hearts",
        "keywords": "adore | crush | in love | smiling face with 3 hearts"
    },
    {
        "no": 15,
        "codes": "1F60D",
        "char": "😍",
        "name": "smiling face with heart-eyes",
        "keywords": "eye | face | love | smile | smiling face with heart-eyes"
    },
    {
        "no": 16,
        "codes": "1F929",
        "char": "🤩",
        "name": "star-struck",
        "keywords": "eyes | face | grinning | star | star-struck | starry-eyed"
    },
    {
        "no": 17,
        "codes": "1F618",
        "char": "😘",
        "name": "face blowing a kiss",
        "keywords": "face | face blowing a kiss | kiss"
    },
    {
        "no": 18,
        "codes": "1F617",
        "char": "😗",
        "name": "kissing face",
        "keywords": "face | kiss | kissing face"
    },
    {
        "no": 19,
        "codes": "263A",
        "char": "☺",
        "name": "smiling face",
        "keywords": "face | outlined | relaxed | smile | smiling face"
    },
    {
        "no": 20,
        "codes": "1F61A",
        "char": "😚",
        "name": "kissing face with closed eyes",
        "keywords": "closed | eye | face | kiss | kissing face with closed eyes"
    },
    {
        "no": 21,
        "codes": "1F619",
        "char": "😙",
        "name": "kissing face with smiling eyes",
        "keywords": "eye | face | kiss | kissing face with smiling eyes | smile"
    },
    {
        "no": 22,
        "codes": "1F60B",
        "char": "😋",
        "name": "face savoring food",
        "keywords": "delicious | face | face savoring food | savouring | smile | yum"
    },
    {
        "no": 23,
        "codes": "1F61B",
        "char": "😛",
        "name": "face with tongue",
        "keywords": "face | face with tongue | tongue"
    },
    {
        "no": 24,
        "codes": "1F61C",
        "char": "😜",
        "name": "winking face with tongue",
        "keywords": "eye | face | joke | tongue | wink | winking face with tongue"
    },
    {
        "no": 25,
        "codes": "1F92A",
        "char": "🤪",
        "name": "zany face",
        "keywords": "eye | goofy | large | small | zany face"
    },
    {
        "no": 26,
        "codes": "1F61D",
        "char": "😝",
        "name": "squinting face with tongue",
        "keywords": "eye | face | horrible | squinting face with tongue | taste | tongue"
    },
    {
        "no": 27,
        "codes": "1F911",
        "char": "🤑",
        "name": "money-mouth face",
        "keywords": "face | money | money-mouth face | mouth"
    },
    {
        "no": 28,
        "codes": "1F917",
        "char": "🤗",
        "name": "hugging face",
        "keywords": "face | hug | hugging"
    },
    {
        "no": 29,
        "codes": "1F92D",
        "char": "🤭",
        "name": "face with hand over mouth",
        "keywords": "face with hand over mouth | whoops | shock | sudden realization | surprise"
    },
    {
        "no": 30,
        "codes": "1F92B",
        "char": "🤫",
        "name": "shushing face",
        "keywords": "quiet | shush | shushing face"
    },
    {
        "no": 31,
        "codes": "1F914",
        "char": "🤔",
        "name": "thinking face",
        "keywords": "face | thinking"
    },
    {
        "no": 32,
        "codes": "1F910",
        "char": "🤐",
        "name": "zipper-mouth face",
        "keywords": "face | mouth | zipper | zipper-mouth face"
    },
    {
        "no": 33,
        "codes": "1F928",
        "char": "🤨",
        "name": "face with raised eyebrow",
        "keywords": "distrust | face with raised eyebrow | skeptic | disapproval | disbelief | mild surprise | scepticism"
    },
    {
        "no": 34,
        "codes": "1F610",
        "char": "😐",
        "name": "neutral face",
        "keywords": "deadpan | face | meh | neutral"
    },
    {
        "no": 35,
        "codes": "1F611",
        "char": "😑",
        "name": "expressionless face",
        "keywords": "expressionless | face | inexpressive | meh | unexpressive"
    },
    {
        "no": 36,
        "codes": "1F636",
        "char": "😶",
        "name": "face without mouth",
        "keywords": "face | face without mouth | mouth | quiet | silent"
    },
    {
        "no": 37,
        "codes": "1F60F",
        "char": "😏",
        "name": "smirking face",
        "keywords": "face | smirk | smirking face"
    },
    {
        "no": 38,
        "codes": "1F612",
        "char": "😒",
        "name": "unamused face",
        "keywords": "face | unamused | unhappy"
    },
    {
        "no": 39,
        "codes": "1F644",
        "char": "🙄",
        "name": "face with rolling eyes",
        "keywords": "eyeroll | eyes | face | face with rolling eyes | rolling"
    },
    {
        "no": 40,
        "codes": "1F62C",
        "char": "😬",
        "name": "grimacing face",
        "keywords": "face | grimace | grimacing face"
    },
    {
        "no": 41,
        "codes": "1F925",
        "char": "🤥",
        "name": "lying face",
        "keywords": "face | lie | lying face | pinocchio"
    },
    {
        "no": 42,
        "codes": "1F60C",
        "char": "😌",
        "name": "relieved face",
        "keywords": "face | relieved"
    },
    {
        "no": 43,
        "codes": "1F614",
        "char": "😔",
        "name": "pensive face",
        "keywords": "dejected | face | pensive"
    },
    {
        "no": 44,
        "codes": "1F62A",
        "char": "😪",
        "name": "sleepy face",
        "keywords": "face | sleep | sleepy face"
    },
    {
        "no": 45,
        "codes": "1F924",
        "char": "🤤",
        "name": "drooling face",
        "keywords": "drooling | face"
    },
    {
        "no": 46,
        "codes": "1F634",
        "char": "😴",
        "name": "sleeping face",
        "keywords": "face | sleep | sleeping face | zzz"
    },
    {
        "no": 47,
        "codes": "1F637",
        "char": "😷",
        "name": "face with medical mask",
        "keywords": "cold | doctor | face | face with medical mask | mask | sick"
    },
    {
        "no": 48,
        "codes": "1F912",
        "char": "🤒",
        "name": "face with thermometer",
        "keywords": "face | face with thermometer | ill | sick | thermometer"
    },
    {
        "no": 49,
        "codes": "1F915",
        "char": "🤕",
        "name": "face with head-bandage",
        "keywords": "bandage | face | face with head-bandage | hurt | injury"
    },
    {
        "no": 50,
        "codes": "1F922",
        "char": "🤢",
        "name": "nauseated face",
        "keywords": "face | nauseated | vomit"
    },
    {
        "no": 51,
        "codes": "1F92E",
        "char": "🤮",
        "name": "face vomiting",
        "keywords": "face vomiting | sick | vomit"
    },
    {
        "no": 52,
        "codes": "1F927",
        "char": "🤧",
        "name": "sneezing face",
        "keywords": "face | gesundheit | sneeze | sneezing face"
    },
    {
        "no": 53,
        "codes": "1F975",
        "char": "🥵",
        "name": "hot face",
        "keywords": "feverish | heat stroke | hot | hot face | red-faced | sweating"
    },
    {
        "no": 54,
        "codes": "1F976",
        "char": "🥶",
        "name": "cold face",
        "keywords": "blue-faced | cold | cold face | freezing | frostbite | icicles"
    },
    {
        "no": 55,
        "codes": "1F974",
        "char": "🥴",
        "name": "woozy face",
        "keywords": "dizzy | intoxicated | tipsy | uneven eyes | wavy mouth | woozy face"
    },
    {
        "no": 56,
        "codes": "1F635",
        "char": "😵",
        "name": "dizzy face",
        "keywords": "dizzy | face"
    },
    {
        "no": 57,
        "codes": "1F92F",
        "char": "🤯",
        "name": "exploding head",
        "keywords": "exploding head | shocked"
    },
    {
        "no": 58,
        "codes": "1F920",
        "char": "🤠",
        "name": "cowboy hat face",
        "keywords": "cowboy | cowgirl | face | hat"
    },
    {   "no": 60,
        "codes": "1F60E",
        "char": "😎",
        "name": "smiling face with sunglasses",
        "keywords": "bright | cool | face | smiling face with sunglasses | sun | sunglasses"
    },
    {
        "no": 61,
        "codes": "1F913",
        "char": "🤓",
        "name": "nerd face",
        "keywords": "face | geek | nerd"
    },
    {
        "no": 62,
        "codes": "1F9D0",
        "char": "🧐",
        "name": "face with monocle",
        "keywords": "face with monocle | stuffy | wealthy"
    },
    {
        "no": 63,
        "codes": "1F615",
        "char": "😕",
        "name": "confused face",
        "keywords": "confused | face | meh"
    },
    {
        "no": 64,
        "codes": "1F61F",
        "char": "😟",
        "name": "worried face",
        "keywords": "face | worried"
    }
    ]`;

// --------set up game-----
emoji = JSON.parse(emojiJSON);
game.elements.popup.addEventListener('click', popupClickHandler);
game.elements.gridSize.addEventListener('change', gameSizeChangeHandler);
setGameSize(app.defaultGameSize);
initGame();
// -------------------------
