var cards = document.getElementsByClassName('card');
const card_backs = ['a', 'b', 'b', 'a'];
const cardFaceUp = [0,0,0,0]; 
var completedCards = 0;

const selections = []; // selected card divs from DOM.
var elapsedSeconds = 0;
var turnCount = 0;
const moveCounter = document.getElementById('moveCounter');
const gameControlButton = document.getElementById('gameControl');
var timer;
const timerMinutes = document.getElementById('minutes');
const timerSeconds = document.getElementById('seconds');

function startTimer(){
    timer = setInterval(updateTimer, 1000);
}

function stopTimer(){
    if (timer){
        clearInterval(timer);
    }
}

function resetTimer() {
    stopTimer();
    elapsedSeconds = 0;
    timerMinutes.innerHTML = '00';
    timerSeconds.innerHTML = '00';
  }
  
function updateTimer() {
    elapsedSeconds++;
    let seconds = (elapsedSeconds % 60).toFixed(0);
    seconds = ('00' + seconds).slice(-2);
    minutes = Math.floor(elapsedSeconds / 60)
    timerMinutes.innerHTML = minutes;
    timerSeconds.innerHTML = seconds;
}

function getCardIndex(card) {
    return Number(card.id.slice(-3));
}

function isFaceUp(card){
    return(cardFaceUp[getCardIndex(card)]);
}
function turnFaceDown(card){
    // todo: Get back image
    card.innerHTML = card.id;
    cardFaceUp[getCardIndex(card)] = 0;
}
function turnFaceUp(card){
    // ToDo: Front images
    let cardIndex = getCardIndex(card);
    card.innerHTML = card_backs[cardIndex];
    cardFaceUp[cardIndex] = 1;
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
    let card0 = selections[0];
    let card1 = selections[1];
    let card0Index = getCardIndex(card0);
    let card1Index = getCardIndex(card1);
    return card_backs[card0Index] === card_backs[card1Index];
}
function addClass(el, className) {
    if (el.classList)
  el.classList.add(className);
else
  el.className += ' ' + className;
}

function removeClass(element, className) {
    if (element.classList)
  element.classList.remove(className);
else
  element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function gameWon(){
    let message = "Congratulations! You won in " +
    turnCount + " moves and " +
    elapsedSeconds + " seconds.";
    alert(message);
    stopTimer();
    gameControlButton.innerHTML = "New Game";
}

function resolveTurn(isCorrect) {
    const longPause = 1000; // ms
    const shortPause = 500;

    let card0 = selections[0];
    let card1 = selections[1];

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
    selections.pop();
    selections.pop();
}

function cardClickEventHandler() {
    if (turnCount === 0) {
        startTimer();
    }
    incrementMoveCounter();
    selections.push(this);
    toggleCard(this);
    if (selections.length == 2) {
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
    moveCounter.innerHTML = String(turnCount);
}

function incrementMoveCounter() {
    turnCount++;
    setMoveCounter();
}

function resetMoveCounter() {
    turnCount = 0;
    setMoveCounter();
}

function shuffleCards() {

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

gameControlButton.addEventListener('click', gameControlClickHandler);

