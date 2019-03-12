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

// --------set up game-----
emoji = JSON.parse(emojiJSON);

game.elements.popup.addEventListener('click', popupClickHandler);
game.elements.gridSize.addEventListener('change', gameSizeChangeHandler);
setGameSize(app.defaultGameSize);
initGame();
// -------------------------
