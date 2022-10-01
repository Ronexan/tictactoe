const tiles = document.querySelectorAll('.tile');
const turnInfo = document.querySelector('.turn-info');
const scoreText = document.getElementById('score-text');
let tilesValues = [
    '', '', '',
    '', '', '',
    '', '', ''
];
let turns = {
    player: 'Player',
    computer: 'Computer'
}
let playerValue = 'X';
let computerValue = 'O';
let playerScore = 0;
let computerScore = 0;
let gameWinner = null; // no winner yet
let currentTurn = turns.player; // Math.floor(Math.random()*2) === 0 ? turns.player : turns.computer;
turnInfo.innerHTML = currentTurn + "'s turn";

const gameOverScreen = document.createElement('div');
gameOverScreen.id = 'game-over-screen';
const winnerText = document.createElement('div');
winnerText.id = 'winner-text';
gameOverScreen.appendChild(winnerText);

let confettis = [];
let colors = ['red', 'blue', 'green', 'yellow', 'orange', 'pink', 'purple'];
let runConfettiAnimation = false;


function setTurn(newTurn) {
    currentTurn = newTurn;
    turnInfo.innerHTML = newTurn + "'s turn";
}

function setTileValue(index, value) {
    tilesValues[index] = value;
    tiles[index].innerHTML = '<span>' + tilesValues[index] + '</span>';
    let element = tiles[index].querySelector('span');
    element.style.animation = 'fade-in 0.4s forwards';
}

function updateScoreText() {
    scoreText.innerHTML = playerScore + ' - ' + computerScore;
}

function allTilesTaken() {
    let takenTiles = 0;
    tilesValues.forEach(tile => {
        if (tile !== '') takenTiles++;
    });

    if (takenTiles === tilesValues.length) return true;
    return false;
}

function checkForWinner(value) {
    let winner = false;

    // check horizontally
    for (let i = 0; i < 7; i += 3) {
        if (tilesValues[i] === value && tilesValues[i+1] === value && tilesValues[i+2] === value) {
            winner = true;
            break;
        }
    }

    // check vertically
    for (let i = 0; i < 3; i++) {
        if (tilesValues[i] === value && tilesValues[i+3] === value && tilesValues[i+6] === value) {
            winner = true;
            break;
        }
    }

    // check diagonally
    if (tilesValues[0] === value && tilesValues[4] === value && tilesValues[8] === value) {
        winner = true;
    }else if (tilesValues[2] === value && tilesValues[4] === value && tilesValues[6] === value) {
        winner = true;
    }

    return winner;
}

function checkForAvailableWins(value) {
    /* check's for a winning chance on the tiles */
    let winTile = undefined; // the next tile needed to win
    
    // horizontal right
    for (let i = 0; i < 7; i += 3) {
        if (tilesValues[i] === value && tilesValues[i+1] === value && tilesValues[i+2] === '') {
            winTile = i+2;
            break;
        }
    }

    // horizontal left
    if (winTile === undefined) {
        for (let i = 2; i < 9; i += 3) {
            if (tilesValues[i] === value && tilesValues[i-1] === value && tilesValues[i-2] === '') {
                winTile = i-2;
                break;
            }
        }
    }
    
    // vertical bottom
    if (winTile === undefined) {
        for (let i = 0; i < 3; i++) {
            if (tilesValues[i] === value && tilesValues[i+3] === value && tilesValues[i+6] === '') {
                winTile = i+6;
                break;
            }
        }
    }

    // vertical top
    if (winTile === undefined) {
        for (let i = 6; i < 9; i++) {
            if (tilesValues[i] === value && tilesValues[i-3] === value && tilesValues[i-6] === '') {
                winTile = i-6;
                break;
            }
        }
    }

    // horizontal middle
    if (winTile === undefined) {
        for (let i = 0; i < 7; i += 3) {
            if (tilesValues[i] === value && tilesValues[i+1] === '' && tilesValues[i+2] === value) {
                winTile = i+1;
                break;
            }
        }
    }

    // vertical middle
    if (winTile === undefined) {
        for (let i = 0; i < 3; i++) {
            if (tilesValues[i] === value && tilesValues[i+3] === '' && tilesValues[i+6] === value) {
                winTile = i+3;
                break;
            }
        }
    }

    // diagonal
    if (winTile === undefined) {
        for (let i = 0; i < 3; i += 2) {
            let allTiles;

            if (i === 0) {
                allTiles = [i, i+4, i+8];
            }else {
                allTiles = [i, i+2, i+4];
            }

            let taken = 0;
            let avalilable = 0;
            let emptyTiles = [];
            
            allTiles.forEach(tile => {
                if (tilesValues[tile] === value) {
                    taken++;
                }else if (tilesValues[tile] === '') {
                    avalilable++;
                    emptyTiles.push(tile);
                }
            });

            if (taken === 2 && avalilable === 1) {
                winTile = emptyTiles[0];
                break;
            }
        }
    }

    return winTile;
}

function computerMakeMove() {
    let choice;

    // first check for a winning chance and take it!
    choice = checkForAvailableWins(computerValue);

    // else check for player's winning chance and eliminate it!
    if (choice === undefined) choice = checkForAvailableWins(playerValue);

    // still nothing? well then just make a random move!
    if (choice === undefined) {
        let availTiles = [];
        tilesValues.forEach((value, index) => {
            if (value === '') {
                availTiles.push(index);
            }
        });

        if (availTiles.length != 0) choice = availTiles[Math.floor(Math.random()*availTiles.length)];
    }

    if (choice != undefined) {
        setTileValue(choice, computerValue);
        let winner = checkForWinner(computerValue);

        if (winner) {
            gameWinner = turns.computer;
            showGameOverScreen('Computer Wins!');
            computerScore++;
            updateScoreText();
        }else {
            let drawn = allTilesTaken();

            if (drawn) {
                gameWinner = 'drawn';
                showGameOverScreen('Drawn!');
            }
        }

        setTimeout(() => setTurn(turns.player), 500);
    }
}

function gameOverAnimationEnd() {
    document.querySelector('body').removeChild(gameOverScreen);
    gameOverScreen.removeEventListener('animationend', gameOverAnimationEnd);
    runConfettiAnimation = false;
    confettis.forEach(confetti => {
        gameOverScreen.removeChild(confetti.element);
    });
    confettis = [];
    currentTurn === turns.computer ? computerMakeMove() : '';
}

function resetValues() {
    tilesValues = [
        '', '', '',
        '', '', '',
        '', '', ''
    ];
    gameWinner = null;
    gameOverScreen.addEventListener('animationend', gameOverAnimationEnd);
    gameOverScreen.style.animation = 'fade-out 0.5s both';

    tiles.forEach((tile, index) => {
        tile.innerHTML = '<span>' + tilesValues[index] + '</span>';
    });
}

function showGameOverScreen(text) {
    // setup message text
    gameOverScreen.style.width = window.innerWidth.toString() + 'px';
    gameOverScreen.style.height = window.innerHeight.toString() + 'px';
    gameOverScreen.style.opacity = '0';
    gameOverScreen.style.animation = 'fade-in 0.5s forwards';
    winnerText.innerHTML = text;

    // add confettis
    let confetti = createConfetti();
    gameOverScreen.appendChild(confetti);
    confettis.push({
        top: parseInt(confetti.style.top.slice(0, -2)),
        element: confetti
    });

    // add gameoverscreen to DOM
    document.querySelector('body').appendChild(gameOverScreen);
    runConfettiAnimation = true;
    requestAnimationFrame(animateConfettis);
}

function animateConfettis() {
    confettis.forEach(confetti => {
        confetti.top += 4;
        confetti.element.style.top = confetti.top.toString()+'px';
    });

    if (runConfettiAnimation && confettis.length !== 0) requestAnimationFrame(animateConfettis);
}

// set each tile's click function
tiles.forEach((tile, index) => {
    tile.addEventListener('click', () => {
        if (tilesValues[index] === '' && currentTurn === turns.player && gameWinner === null) {
            setTileValue(index, playerValue);
            let winner = checkForWinner(playerValue);

            if (winner) {
                gameWinner = turns.player;
                showGameOverScreen('You Win!');
                playerScore++;
                updateScoreText();
            }else {
                let drawn = allTilesTaken();

                if (drawn) {
                    gameWinner = 'drawn';
                    showGameOverScreen('Drawn!');
                }
            }
            
            setTurn(turns.computer);
            gameWinner === null ? setTimeout(() => computerMakeMove(), 700) : '';
        }
    });
});

function createConfetti() {
    /* creates and returns a confetti object for the game over screen */
    let confetti = document.createElement('div');
    confetti.style.left = '200px';
    confetti.style.top = '200px';
    confetti.style.width = '100px';
    confetti.style.height = '120px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
    confetti.style.position = 'fixed';
    return confetti;
}

window.addEventListener('keypress', (ev) => {
    if ((ev.key === 'r' && gameWinner !== null)) {
        resetValues();
    }else {
        if (confettis.length === 0) {
            showGameOverScreen('Confetti Test!');
        }else {
            resetValues();
        }
    }
});
window.addEventListener('resize', () => {
    gameOverScreen.style.width = window.innerWidth.toString() + 'px';
    gameOverScreen.style.height = window.innerHeight.toString() + 'px';
});

