var cards = document.getElementsByClassName('card');
const cardBacks = ['a', 'b', 'b', 'a'];
const game = {
    cardFaceUp: [0,0,0,0],
    completeCards: 0,
    elapsedSeconds: 0,
    selections: [],
    turnCount: 0,
    timer: null,
    elements: {
        moveCounter: document.getElementById('moveCounter'),  
        gameControlButton: document.getElementById('gameControl'),
        gameOver: document.getElementById('gameOver'),
        timerMinutes: document.getElementById('minutes'),
        timerSeconds: document.getElementById('seconds')
    }
}

game.elements.gameControlButton.addEventListener('click', gameControlClickHandler);

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
    return Number(card.id.slice(-3));
}

function isFaceUp(card){
    return(game.cardFaceUp[getCardIndex(card)]);
}
function turnFaceDown(card){
    // todo: Get back image
    card.innerHTML = card.id;
    game.cardFaceUp[getCardIndex(card)] = 0;
}
function turnFaceUp(card){
    // ToDo: Front images
    let cardIndex = getCardIndex(card);
    card.innerHTML = cardBacks[cardIndex];
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
    card.innerHTML = 'done';
    card.removeEventListener('click', cardClickEventHandler);
}

function isMatch() {
    let card0 = game.selections[0];
    let card1 = game.selections[1];
    let card0Index = getCardIndex(card0);
    let card1Index = getCardIndex(card1);
    return cardBacks[card0Index] === cardBacks[card1Index];
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

function gameWon(){
    let message = "Congratulations! You won with " +
    game.turnCount + " moves in " +
    game.elapsedSeconds + " seconds.";
    game.elements.gameOver.innerHTML = message;
    addClass(game.elements.gameOver, 'showing')
    setTimeout(() => {
        addClass(game.elements.gameOver, 'hidden');
        removeClass(game.elements.gameOver, 'showing');
    }, 2000);

    stopTimer();
    game.elements.gameControlButton.innerHTML = "New Game";
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
        if (completedCards === cards.length){
            gameWon();
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
    incrementMoveCounter();
    game.selections.push(this);
    toggleCard(this);
    if (game.selections.length == 2) {
        resolveTurn(isMatch()); 
    } 
};

function gameControlClickHandler() {
    console.log('button clicked');
    console.log(this.innerHTML);
    switch(this.innerHTML) {
        case 'Start Game': case 'New Game':
            initGame();
            this.innerHTML = 'Quit Game';
            break;
        case 'Quit Game':
            // restart
            if (confirm('Are you sure you want to quit?')) {
                initGame();
                this.innerHTML = "New Game";
            }
            break;
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
    var m = cardBacks.length, t, i;
    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = cardBacks[m];
        cardBacks[m] = cardBacks[i];
        cardBacks[i] = t;
    }      
}

function initGame() {
    resetMoveCounter();
    completedCards = 0;

    for (card of cards) {
        turnFaceDown(card);
    }
    shuffleCards();
    resetTimer();
    Array.from(cards).forEach(function(card) {
        card.addEventListener('click', cardClickEventHandler);
    });    
}


