/** Memory Match Game */
class MemoryMatchGame {
    constructor() {
        this.cards = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        this.grid = [];
        this.flipped = [];
        this.matched = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.initializeDOM();
        this.newGame();
    }
    initializeDOM() {
        this.boardElement = document.getElementById('memory-board');
        this.movesElement = document.getElementById('moves');
        this.matchesElement = document.getElementById('matches');
        this.timerElement = document.getElementById('timer');
        this.overlayElement = document.getElementById('board-overlay');
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('play-again-btn').addEventListener('click', () => this.newGame());
    }
    newGame() {
        this.grid = [...this.cards, ...this.cards].sort(() => Math.random() - 0.5);
        this.flipped = [];
        this.matched = [];
        this.moves = 0;
        this.timer = 0;
        this.startTimer();
        this.render();
        this.overlayElement.classList.remove('show');
    }
    render() {
        this.boardElement.innerHTML = '';
        this.grid.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.dataset.index = index;
            cardEl.innerHTML = `<div class="card-back">?</div><div class="card-front">${card}</div>`;
            cardEl.addEventListener('click', () => this.flipCard(index));
            this.boardElement.appendChild(cardEl);
        });
        this.updateDisplay();
    }
    flipCard(index) {
        if (this.flipped.length === 2 || this.flipped.includes(index) || this.matched.includes(index)) return;
        this.flipped.push(index);
        const cardEl = this.boardElement.querySelector(`[data-index="${index}"]`);
        cardEl.classList.add('flipped');
        if (this.flipped.length === 2) {
            this.moves++;
            setTimeout(() => this.checkMatch(), 500);
        }
    }
    checkMatch() {
        const [i1, i2] = this.flipped;
        if (this.grid[i1] === this.grid[i2]) {
            this.matched.push(i1, i2);
            if (this.matched.length === this.grid.length) {
                this.handleWin();
            }
        } else {
            this.boardElement.querySelector(`[data-index="${i1}"]`).classList.remove('flipped');
            this.boardElement.querySelector(`[data-index="${i2}"]`).classList.remove('flipped');
        }
        this.flipped = [];
        this.updateDisplay();
    }
    updateDisplay() {
        this.movesElement.textContent = this.moves;
        this.matchesElement.textContent = `${this.matched.length / 2}/8`;
        this.timerElement.textContent = `${Math.floor(this.timer / 60)}:${(this.timer % 60).toString().padStart(2, '0')}`;
    }
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }
    handleWin() {
        clearInterval(this.timerInterval);
        this.updateGlobalStats();
        document.getElementById('final-stats').textContent = `Moves: ${this.moves} | Time: ${Math.floor(this.timer / 60)}:${(this.timer % 60).toString().padStart(2, '0')}`;
        this.overlayElement.classList.add('show');
    }
    updateGlobalStats() {
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        if (!puzzleStats.totalTimePlayed) puzzleStats.totalTimePlayed = 0;
        puzzleStats.totalGamesCompleted++;
        puzzleStats.totalTimePlayed += this.timer;
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
    }
}
