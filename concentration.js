const card_backs = [];

var cards = document.getElementsByClassName('card');

function toggleCard(card) {
    if (card.innerHTML == "clicked") {
        card.innerHTML = card.id;
    } else {
        card.innerHTML = "clicked";
    }    
}


var cardClickEventHandler = function() {
    // var attribute = this.getAttribute("data-myattribute");
    toggleCard(this);
    console.log(this.innerHTML);
};

Array.from(cards).forEach(function(card) {
    card.addEventListener('click', cardClickEventHandler);
  });
