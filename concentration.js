const card_backs = ['a', 'b', 'b', 'a'];
const turn = [];
var turnCount = 0;

const card_side = [0,0,0,0]; // 0, 1 for front, back

var cards = document.getElementsByClassName('card');

function getCardIndex(card) {
    return Number(card.id.slice(-3));
}

function toggleCard(card) {
    // ToDo: Front and back images
    let cardIndex = getCardIndex(card);

    if (card_side[cardIndex]) {
        card.innerHTML = card.id;
    } else {
        card.innerHTML = card_backs[cardIndex];
    }
    card_side[cardIndex] = 1 - card_side[cardIndex];
}
function isCorrectTurn() {
    let card0 = turn[0];
    let card1 = turn[1];
    let card0Index = getCardIndex(card0);
    let card1Index = getCardIndex(card1);
    return card_backs[card0Index] === card_backs[card1Index];
}

function resolveTurn(isCorrect) {
    if (isCorrect) {
        alert('correct');
    } else {
        alert('incorrect');
    }
    toggleCard(turn[0]);
    toggleCard(turn[1]);
    turn.pop();
    turn.pop();
}
const cardClickEventHandler = function() {
    turnCount++;
    turn.push(this);
    toggleCard(this);
    if (turn.length == 2) {
        resolveTurn(isCorrectTurn()); 
    } 
};

Array.from(cards).forEach(function(card) {
    card.addEventListener('click', cardClickEventHandler);
  });
