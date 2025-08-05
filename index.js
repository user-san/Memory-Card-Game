document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timer = 0;
    let timerInterval;
    let gameStarted = false;
    let previewActive = false;
    let previewTimeout;
    const totalPairs = {
        easy: 8,
        medium: 18,
        hard: 32
    };
    let currentDifficulty = 'easy';
    let previewDuration = {
        easy: 500,
        medium: 1000,
        hard: 3000
    };
    let currentPreviewDuration = previewDuration.easy;

    // DOM elements
    const gameBoard = document.getElementById('gameBoard');
    const timeDisplay = document.getElementById('time');
    const movesDisplay = document.getElementById('moves');
    const winMessage = document.getElementById('winMessage');
    const finalTimeDisplay = document.getElementById('finalTime');
    const finalMovesDisplay = document.getElementById('finalMoves');
    const playAgainBtn = document.getElementById('playAgain');
    const easyBtn = document.getElementById('easy');
    const mediumBtn = document.getElementById('medium');
    const hardBtn = document.getElementById('hard');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const infoBtn = document.querySelector('.info-btn');
    const rulesModal = document.getElementById('rulesModal');
    const closeBtn = document.querySelector('.close-btn');

    // Emoji icons for cards
    const emojis = [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
        '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
        '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
        '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞'
    ];

    // Initialize game
    initGame();

    // Event listeners
    easyBtn.addEventListener('click', () => setDifficulty('easy'));
    mediumBtn.addEventListener('click', () => setDifficulty('medium'));
    hardBtn.addEventListener('click', () => setDifficulty('hard'));
    playAgainBtn.addEventListener('click', resetGame);
    startBtn.addEventListener('click', startPreview);
    stopBtn.addEventListener('click', stopPreview);

    // Modal controls
    infoBtn.addEventListener('click', showModal);
    closeBtn.addEventListener('click', hideModal);
    rulesModal.addEventListener('click', (e) => {
        if (e.target === rulesModal) hideModal();
    });

    // Modal functions
    function showModal() {
        rulesModal.style.display = 'flex';
        setTimeout(() => {
            rulesModal.classList.add('show');
        }, 10);
    }

    function hideModal() {
        rulesModal.classList.remove('show');
        setTimeout(() => {
            rulesModal.style.display = 'none';
        }, 300);
    }

    // Initialize game
    function initGame() {
        resetGame();
        createCards();
        renderCards();
    }

    // Create cards based on difficulty
    function createCards() {
        cards = [];
        const pairsNeeded = totalPairs[currentDifficulty];
        const selectedEmojis = emojis.slice(0, pairsNeeded);

        // Create pairs for each emoji
        selectedEmojis.forEach(emoji => {
            cards.push({ emoji, matched: false, flipped: false });
            cards.push({ emoji, matched: false, flipped: false });
        });

        // Shuffle cards
        shuffleCards();
    }

    // Shuffle cards using Fisher-Yates algorithm
    function shuffleCards() {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
    }

    // Render cards to the DOM
    function renderCards() {
        gameBoard.innerHTML = '';
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;

            if (card.flipped || card.matched) {
                cardElement.classList.add('flipped');
            }

            if (card.matched) {
                cardElement.classList.add('matched');
            }

            const front = document.createElement('div');
            front.className = 'card-face card-front';

            const back = document.createElement('div');
            back.className = 'card-face card-back';
            back.textContent = card.emoji;

            cardElement.appendChild(front);
            cardElement.appendChild(back);

            cardElement.addEventListener('click', () => flipCard(index));
            gameBoard.appendChild(cardElement);
        });
    }

    // Flip a card
    function flipCard(index) {
        // Don't allow flipping during preview or if game hasn't started
        if (previewActive || !gameStarted) {
            return;
        }

        const card = cards[index];

        if (card.flipped || card.matched || flippedCards.length >= 2) {
            return;
        }

        // Flip the card
        card.flipped = true;
        flippedCards.push(index);
        renderCards();

        // Check for match if two cards are flipped
        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.textContent = moves;

            const [firstIndex, secondIndex] = flippedCards;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.emoji === secondCard.emoji) {
                // Match found
                firstCard.matched = true;
                secondCard.matched = true;
                matchedPairs++;

                flippedCards = [];

                // Check for win
                if (matchedPairs === totalPairs[currentDifficulty]) {
                    endGame();
                }
            } else {
                // No match, flip back after delay
                setTimeout(() => {
                    cards[firstIndex].flipped = false;
                    cards[secondIndex].flipped = false;
                    flippedCards = [];
                    renderCards();
                }, 1000);
            }
        }
    }

    // Start the game timer
    function startGameTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timeDisplay.textContent = timer;
        }, 1000);
    }

    // Start the card preview
    function startPreview() {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        previewActive = true;

        // Flip all cards
        cards.forEach(card => card.flipped = true);
        renderCards();

        // After preview duration, flip cards back and start game
        previewTimeout = setTimeout(() => {
            cards.forEach(card => card.flipped = false);
            renderCards();
            previewActive = false;
            gameStarted = true;
            startGameTimer();
        }, currentPreviewDuration);
    }

    // Stop the preview and reset
    function stopPreview() {
        clearTimeout(previewTimeout);
        clearInterval(timerInterval);

        cards.forEach(card => {
            card.flipped = false;
            card.matched = false;
        });

        renderCards();
        previewActive = false;
        gameStarted = false;
        timer = 0;
        moves = 0;
        matchedPairs = 0;
        flippedCards = [];
        timeDisplay.textContent = '0';
        movesDisplay.textContent = '0';

        startBtn.disabled = false;
        stopBtn.disabled = true;
    }

    // End the game (win condition)
    function endGame() {
        clearInterval(timerInterval);
        finalTimeDisplay.textContent = timer;
        finalMovesDisplay.textContent = moves;
        winMessage.classList.add('show');
    }

    // Reset the game state
    function resetGame() {
        stopPreview();
        createCards();
        renderCards();
        winMessage.classList.remove('show');
    }

    // Set game difficulty
    function setDifficulty(difficulty) {
        currentDifficulty = difficulty;
        gameBoard.className = 'game-board ' + difficulty;
        currentPreviewDuration = previewDuration[difficulty];
        resetGame();
    }
});