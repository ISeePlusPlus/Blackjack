class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit;
  }

  /*Specific for a blackjack game.
  Could be method of subClass of card for generalazition, i.e class Blackjack Card */
  getCardNumericValue() {
    if (this.value == "A") {
      return 1;
    } else
      return this.value != "J" && this.value != "Q" && this.value != "K"
        ? this.value
        : 10;
  }
}

class Deck {
  constructor(cards) {
    this.cards = cards;
    this.shuffle();
  }

  shuffle() {
    this.cards.sort(() => Math.random() - 0.5);
  }

  resetDeck() {
    this.cards = createStandardDeckCardArray();
  }

  draw() {
    return this.cards.pop();
  }
}

//ENUM javascript substitutions
const messages = {
  loseMessage: "You lost. Better luck next time",
  winMessage: "You won!",
  drawMessage: "It's a darw, no one wins",
  blackjackMessage: "You've got Blackjack, double pay!",
  dealderMessage: "Do you want to draw a new card?",
  noFundMessage: "Not enought currency",
};
Object.freeze(messages);

const gameStates = {
  prior: 0,
  ongoing: 1,
  ending: 2,
};
Object.freeze(gameStates);

/*Could be improved by removing the if from updateGameState(). possibly sub class FinalGameState, and overrides update. 
This would require changing the attribute gameState as well */
class GameState {
  constructor() {
    this.gameState = gameStates.prior;
    this.gameEnded = false;
    this.gameMessage = "";
  }

  updateGameState() {
    if (this.gameState != gameStates.ending) {
      this.updateLiveGameState();
    } else {
      this.updateFinalGameState();
    }
    if (this.gameEnded) {
      const gameButnArr = document.querySelectorAll("button");
      gameButnArr[0].style.display = "block";
    }
  }

  updateLiveGameState() {
    if (playerSum < 21) {
      this.gameMessage = messages.dealderMessage;
    } else if (playerSum === 21) {
      this.gameState = 2;
      player.currency += 2 * player.currentBet;
      this.gameMessage = messages.blackjackMessage;
      this.gameEnded = true;
    } else {
      this.gameState = 2;
      player.currency -= player.currentBet;
      this.gameMessage = messages.loseMessage;
      this.gameEnded = true;
    }
  }

  updateFinalGameState() {
    this.gameEnded = true;
    if (playerSum < houseSum && houseSum < 22) {
      player.currency -= player.currentBet;
      this.gameMessage = messages.loseMessage;
    } else if (playerSum === houseSum) {
      this.gameMessage = messages.drawMessage;
    } else {
      player.currency += player.currentBet;
      this.gameMessage = messages.winMessage;
    }
  }
}

/*startGame() up to stand() are in charge of game flow.
Turning these functions into one class(GameControl) would make the code more managable
All buttons also have similar functions, making an interface would make sense */

function startGame() {
  player.currentBet=20;
  if (player.currency < player.currentBet) {
    gamestateVar.gameMessage = messages.noFundMessage;
    renderGame();
  } else {
    if (gamestateVar.gameEnded) {
      restartBoard();
    }
    if (gamestateVar.gameState === gameStates.prior) {
      gamestateVar.gameState = gameStates.ongoing;
      gamestateVar.updateGameState();
      displayGameElements();
      dealCards();
      renderGame();
    }
  }
}

function dealCards() {
  drawCard("#card-container");
  drawCard("#card-container");
  drawCard("#dealer-card-container");
}

//OO fix - remove the if, add class card container
function drawCard(container) {
  const card = deck.draw();
  value = card.getCardNumericValue();
  if (container == "#card-container") {
    playerSum += value;
  } else {
    houseSum += value;
  }
  addCardElement(card, container);
}

//player and house sums should be in gameState, with a gameState object updating them in the Control class
function restartBoard() {
  deck.resetDeck();
  deck.shuffle();
  player.currentBet = 20;
  playerSum = 0;
  houseSum = 0;
  clearCardElements("#card-container");
  clearCardElements("#dealer-card-container");
  gamestateVar.gameState = gameStates.prior;
  gamestateVar.gameEnded = false;
}

function hit() {
  if (gamestateVar.gameState === gameStates.ongoing) {
    drawCard("#card-container");
    gamestateVar.updateGameState();
    renderGame();
  }
}

function double() {
    if (gamestateVar.gameState === gameStates.ongoing) {
      if (player.currency < player.currentBet * 2) {
        gamestateVar.gameMessage = messages.noFundMessage;
      }else{
        player.currentBet *= 2;
        drawCard("#card-container");
        gamestateVar.updateGameState();
      }
      renderGame();
    }
  }


function stand() {
  if (gamestateVar.gameState === gameStates.ongoing) {
    while (houseSum <= 17) {
      if (houseSum <= playerSum) {
        drawCard("#dealer-card-container");
      } else {
        break;
      }
    }
    gamestateVar.gameState = gameStates.ending;
    gamestateVar.updateGameState();
    renderGame();
  }
}

/* renderGame() up to addCardElement() are all in charge of display.
Turning these functions into one class(GameDisplay) would make the code more managable*/

function renderGame() {
  const messageElement = document.querySelector("#messege-el");
  const sumElement = document.querySelector("#sum-el");
  const dealderSumElement = document.querySelector("#dealer-sum-el");
  const playerElement = document.querySelector("#player-el");

  messageElement.textContent = gamestateVar.gameMessage;
  sumElement.textContent = playerSum;
  dealderSumElement.textContent = houseSum;
  playerElement.innerHTML =
    player.name +
    ": $" +
    player.currency +
    "<br>" +
    "Current Bet: " +
    player.currentBet;
}

function displayGameElements() {
  const gameTextArr = document.querySelectorAll(".gameText");
  for (let i = 0; i < gameTextArr.length; i++) {
    gameTextArr[i].style.display = "inline-block";
  }
  const gameButnArr = document.querySelectorAll("button");
  gameButnArr[0].style.display = "none";
  for (let j = 1; j < gameButnArr.length; j++) {
    gameButnArr[j].style.display = "inline-block";
  }
}

function clearCardElements(container) {
  const cardContainer = document.querySelector(container);
  cardContainer.innerHTML = "";
}

function addCardElement(card, container) {
  value = card.value;
  suit = card.suit;
  const redFlag = suit == "diams" || suit == "hearts" ? " red'" : "'";
  const cardContainer = document.querySelector(container);
  cardContainer.innerHTML +=
    "<div class='card-el " +
    redFlag +
    "><div class='top'><span>" +
    value +
    "</span><span>&" +
    suit +
    ";</span></div><p>&" +
    suit +
    ";</p><div class='bottom'><span>&" +
    suit +
    ";</span><span>" +
    value +
    "</span></div></div>";
}

//Main

function createStandardDeckCardArray() {
  let cards = [];
  const suits = ["spades", "hearts", "clubs", "diams"];
  const values = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

  for (let suit in suits) {
    for (let value in values) {
      cards.push(new Card(values[value], suits[suit]));
    }
  }
  return cards;
}

let player = {
  name: "Player",
  currency: 200,
  currentBet: 20,
};

cards = createStandardDeckCardArray();
const deck = new Deck(cards);
let gamestateVar = new GameState();
let playerSum = 0;
let houseSum = 0;
