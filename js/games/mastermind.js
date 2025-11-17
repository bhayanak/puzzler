/** Mastermind Game */
class MastermindGame {
    constructor() {
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
        this.secretCode = [];
        this.currentGuess = [];
        this.attempts = 0;
        this.maxAttempts = 10;
        this.guesses = [];
        this.initializeDOM();
        this.newGame();
    }
    initializeDOM() {
        this.boardElement = document.getElementById('mastermind-board');
        this.attemptsElement = document.getElementById('attempts');
        this.selectorElement = document.getElementById('color-selector');
        this.overlayElement = document.getElementById('board-overlay');
        document.getElementById('submit-btn').addEventListener('click', () => this.submitGuess());
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('play-again-btn').addEventListener('click', () => this.newGame());
        this.renderColorSelector();
    }
    renderColorSelector() {
        this.selectorElement.innerHTML = '';
        this.colors.forEach(color => {
            const peg = document.createElement('div');
            peg.className = 'code-peg';
            peg.style.background = color;
            peg.addEventListener('click', () => this.selectColor(color));
            this.selectorElement.appendChild(peg);
        });
    }
    newGame() {
        this.secretCode = Array(4).fill(0).map(() => this.colors[Math.floor(Math.random() * this.colors.length)]);
        this.currentGuess = Array(4).fill(null);
        this.attempts = 0;
        this.guesses = [];
        this.render();
        this.overlayElement.classList.remove('show');
    }
    selectColor(color) {
        const emptyIndex = this.currentGuess.indexOf(null);
        if (emptyIndex !== -1) {
            this.currentGuess[emptyIndex] = color;
            this.renderCurrentGuess();
        }
    }
    submitGuess() {
        if (this.currentGuess.includes(null)) return;
        const feedback = this.getFeedback(this.currentGuess);
        this.guesses.push({ guess: [...this.currentGuess], feedback });
        this.attempts++;
        if (feedback.black === 4) {
            this.handleWin();
        } else if (this.attempts >= this.maxAttempts) {
            this.handleLoss();
        } else {
            this.currentGuess = Array(4).fill(null);
            this.render();
        }
    }
    getFeedback(guess) {
        let black = 0, white = 0;
        const secretCopy = [...this.secretCode];
        const guessCopy = [...guess];
        for (let i = 0; i < 4; i++) {
            if (guessCopy[i] === secretCopy[i]) {
                black++;
                secretCopy[i] = guessCopy[i] = null;
            }
        }
        for (let i = 0; i < 4; i++) {
            if (guessCopy[i] && secretCopy.includes(guessCopy[i])) {
                white++;
                secretCopy[secretCopy.indexOf(guessCopy[i])] = null;
            }
        }
        return { black, white };
    }
    render() {
        this.boardElement.innerHTML = '';
        this.guesses.forEach(({ guess, feedback }) => {
            const row = document.createElement('div');
            row.className = 'guess-row';
            guess.forEach(color => {
                const peg = document.createElement('div');
                peg.className = 'code-peg';
                peg.style.background = color;
                row.appendChild(peg);
            });
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'feedback-pegs';
            for (let i = 0; i < feedback.black; i++) {
                const peg = document.createElement('div');
                peg.className = 'feedback-peg black';
                feedbackDiv.appendChild(peg);
            }
            for (let i = 0; i < feedback.white; i++) {
                const peg = document.createElement('div');
                peg.className = 'feedback-peg white';
                feedbackDiv.appendChild(peg);
            }
            row.appendChild(feedbackDiv);
            this.boardElement.appendChild(row);
        });
        this.renderCurrentGuess();
        this.attemptsElement.textContent = `${this.attempts}/${this.maxAttempts}`;
    }
    renderCurrentGuess() {
        const existing = this.boardElement.querySelector('.current-guess');
        if (existing) existing.remove();
        const row = document.createElement('div');
        row.className = 'guess-row current-guess';
        this.currentGuess.forEach(color => {
            const peg = document.createElement('div');
            peg.className = 'code-peg';
            if (color) peg.style.background = color;
            row.appendChild(peg);
        });
        this.boardElement.appendChild(row);
    }
    handleWin() {
        this.updateGlobalStats();
        document.getElementById('result-title').textContent = 'You Win!';
        document.getElementById('result-message').textContent = `Cracked in ${this.attempts} attempts!`;
        this.overlayElement.classList.add('show');
    }
    handleLoss() {
        document.getElementById('result-title').textContent = 'Game Over';
        document.getElementById('result-message').textContent = 'Better luck next time!';
        this.overlayElement.classList.add('show');
    }
    updateGlobalStats() {
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        puzzleStats.totalGamesCompleted++;
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
    }
}
