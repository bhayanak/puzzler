/**
 * Minesweeper Game
 * Classic mine detection puzzle with animated blast effects
 */

class MinesweeperGame {
    constructor() {
        this.difficulties = {
            beginner: { rows: 9, cols: 9, mines: 10, size: 'small' },
            intermediate: { rows: 16, cols: 16, mines: 40, size: 'medium' },
            expert: { rows: 16, cols: 30, mines: 99, size: 'large' }
        };
        
        this.currentDifficulty = 'intermediate';
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.firstClick = true;
        this.gameOver = false;
        this.gameWon = false;
        this.timer = 0;
        this.timerInterval = null;
        this.minesRemaining = 0;
        this.flagMode = false; // Toggle between reveal and flag mode for mobile
        
        this.initializeDOM();
        this.loadBestTimes();
        this.newGame();
    }
    
    initializeDOM() {
        this.boardElement = document.getElementById('minesweeper-board');
        this.timerElement = document.getElementById('timer');
        this.minesElement = document.getElementById('mines-remaining');
        this.bestTimeElement = document.getElementById('best-time');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.overlayElement = document.getElementById('board-overlay');
        
        // Event Listeners
        this.difficultySelect.addEventListener('change', (e) => this.changeDifficulty(e.target.value));
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('flag-mode-btn')?.addEventListener('click', () => this.toggleFlagMode());
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('change-difficulty-btn').addEventListener('click', () => this.changeDifficultyFromOverlay());
    }
    
    newGame() {
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.clearTimer();
        
        const config = this.difficulties[this.currentDifficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.totalMines = config.mines;
        this.minesRemaining = this.totalMines;
        
        this.board = [];
        this.revealed = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
        this.flagged = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
        
        this.updateDisplay();
        this.renderBoard();
        this.hideOverlay();
    }
    
    generateMines(excludeRow, excludeCol) {
        // Initialize empty board
        this.board = Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(0)
        );
        
        // Place mines randomly (excluding first click and neighbors)
        let minesPlaced = 0;
        const excludeCells = new Set();
        
        // Add first click cell and its neighbors to exclude list
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = excludeRow + dr;
                const nc = excludeCol + dc;
                if (this.isValid(nr, nc)) {
                    excludeCells.add(`${nr},${nc}`);
                }
            }
        }
        
        while (minesPlaced < this.totalMines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            if (this.board[row][col] !== -1 && !excludeCells.has(`${row},${col}`)) {
                this.board[row][col] = -1; // -1 represents a mine
                minesPlaced++;
            }
        }
        
        // Calculate numbers for non-mine cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] !== -1) {
                    this.board[row][col] = this.countAdjacentMines(row, col);
                }
            }
        }
    }
    
    countAdjacentMines(row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr;
                const nc = col + dc;
                if (this.isValid(nr, nc) && this.board[nr][nc] === -1) {
                    count++;
                }
            }
        }
        return count;
    }
    
    isValid(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    renderBoard() {
        this.boardElement.innerHTML = '';
        const config = this.difficulties[this.currentDifficulty];
        this.boardElement.setAttribute('data-size', config.size);
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleCellClick(e, row, col));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e, row, col));
                cell.addEventListener('mousedown', (e) => this.handleMouseDown(e, row, col));
                
                this.boardElement.appendChild(cell);
            }
        }
    }
    
    handleCellClick(event, row, col) {
        event.preventDefault();
        if (this.gameOver || this.gameWon) return;

        // Flag mode for mobile - tap to place flag instead of reveal
        if (this.flagMode) {
            this.handleRightClick(event, row, col);
            return;
        }

        if (this.flagged[row][col]) return;
        if (this.revealed[row][col]) {
            // Chord clicking - reveal neighbors if flags match mine count
            this.chordClick(row, col);
            return;
        }
        
        if (this.firstClick) {
            this.generateMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        this.revealCell(row, col);
    }
    
    handleRightClick(event, row, col) {
        event.preventDefault();
        if (this.gameOver || this.gameWon) return;
        if (this.revealed[row][col]) return;
        
        this.flagged[row][col] = !this.flagged[row][col];
        this.minesRemaining += this.flagged[row][col] ? -1 : 1;
        this.updateDisplay();
        this.updateCell(row, col);
    }
    
    handleMouseDown(event, row, col) {
        // Middle click for chord clicking
        if (event.button === 1) {
            event.preventDefault();
            if (this.revealed[row][col]) {
                this.chordClick(row, col);
            }
        }
    }
    
    revealCell(row, col, cascade = false) {
        if (!this.isValid(row, col)) return;
        if (this.revealed[row][col]) return;
        if (this.flagged[row][col]) return;
        
        this.revealed[row][col] = true;
        const cell = this.getCellElement(row, col);
        
        if (cascade) {
            cell.classList.add('cascade');
            setTimeout(() => cell.classList.remove('cascade'), 300);
        }
        
        if (this.board[row][col] === -1) {
            // Hit a mine - EXPLODE!
            this.triggerExplosion(row, col);
            return;
        }
        
        cell.classList.add('revealed');
        const count = this.board[row][col];
        
        if (count > 0) {
            cell.textContent = count;
            cell.dataset.count = count;
        } else {
            // Flood fill reveal for empty cells
            setTimeout(() => this.floodFill(row, col), 50);
        }
        
        this.updateCell(row, col);
        this.checkWin();
    }
    
    floodFill(row, col) {
        const queue = [[row, col]];
        const visited = new Set([`${row},${col}`]);
        
        while (queue.length > 0) {
            const [r, c] = queue.shift();
            
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    
                    const nr = r + dr;
                    const nc = c + dc;
                    const key = `${nr},${nc}`;
                    
                    if (!this.isValid(nr, nc)) continue;
                    if (visited.has(key)) continue;
                    if (this.revealed[nr][nc]) continue;
                    if (this.flagged[nr][nc]) continue;
                    
                    visited.add(key);
                    this.revealed[nr][nc] = true;
                    
                    const cell = this.getCellElement(nr, nc);
                    cell.classList.add('revealed', 'cascade');
                    
                    const count = this.board[nr][nc];
                    if (count > 0) {
                        cell.textContent = count;
                        cell.dataset.count = count;
                    } else {
                        queue.push([nr, nc]);
                    }
                    
                    this.updateCell(nr, nc);
                }
            }
        }
        
        this.checkWin();
    }
    
    chordClick(row, col) {
        if (!this.revealed[row][col]) return;
        
        const mineCount = this.board[row][col];
        if (mineCount === 0) return;
        
        // Count adjacent flags
        let flagCount = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr;
                const nc = col + dc;
                if (this.isValid(nr, nc) && this.flagged[nr][nc]) {
                    flagCount++;
                }
            }
        }
        
        // If flag count matches mine count, reveal all non-flagged neighbors
        if (flagCount === mineCount) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = row + dr;
                    const nc = col + dc;
                    if (this.isValid(nr, nc) && !this.flagged[nr][nc] && !this.revealed[nr][nc]) {
                        this.revealCell(nr, nc);
                    }
                }
            }
        }
    }
    
    triggerExplosion(row, col) {
        this.gameOver = true;
        this.clearTimer();
        
        const cell = this.getCellElement(row, col);
        cell.classList.add('mine', 'exploded');
        
        // Create blast wave
        this.createBlastWave(cell);
        
        // Create particle explosion
        this.createParticleExplosion(cell, row, col);
        
        // Screen shake
        this.boardElement.classList.add('board-shake');
        setTimeout(() => this.boardElement.classList.remove('board-shake'), 500);
        
        // Chain reaction - reveal other mines with delay
        setTimeout(() => this.revealAllMines(row, col), 300);
        
        // Create smoke effects
        setTimeout(() => this.createSmokeEffect(cell), 200);
    }
    
    createBlastWave(cell) {
        const wave = document.createElement('div');
        wave.className = 'blast-wave';
        cell.appendChild(wave);
        
        setTimeout(() => wave.remove(), 600);
    }
    
    createParticleExplosion(cell, row, col) {
        const rect = cell.getBoundingClientRect();
        const boardRect = this.boardElement.getBoundingClientRect();
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            
            // Random direction
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 40 + Math.random() * 40;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            // Random color (fire colors)
            const colors = ['#ff6600', '#ff3300', '#ffcc00', '#ff9900'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            // Position at cell center
            particle.style.left = `${rect.left - boardRect.left + rect.width / 2}px`;
            particle.style.top = `${rect.top - boardRect.top + rect.height / 2}px`;
            
            this.boardElement.appendChild(particle);
            
            setTimeout(() => particle.remove(), 800);
        }
    }
    
    createSmokeEffect(cell) {
        const rect = cell.getBoundingClientRect();
        const boardRect = this.boardElement.getBoundingClientRect();
        const smokeCount = 5;
        
        for (let i = 0; i < smokeCount; i++) {
            setTimeout(() => {
                const smoke = document.createElement('div');
                smoke.className = 'smoke-particle';
                
                const offsetX = (Math.random() - 0.5) * 20;
                smoke.style.setProperty('--smoke-x', `${offsetX}px`);
                
                smoke.style.left = `${rect.left - boardRect.left + rect.width / 2}px`;
                smoke.style.top = `${rect.top - boardRect.top + rect.height / 2}px`;
                
                this.boardElement.appendChild(smoke);
                
                setTimeout(() => smoke.remove(), 1500);
            }, i * 100);
        }
    }
    
    revealAllMines(explosionRow, explosionCol) {
        const mines = [];
        
        // Collect all mine positions
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] === -1) {
                    const distance = Math.abs(row - explosionRow) + Math.abs(col - explosionCol);
                    mines.push({ row, col, distance });
                }
            }
        }
        
        // Sort by distance for chain reaction effect
        mines.sort((a, b) => a.distance - b.distance);
        
        // Reveal mines with cascading effect
        mines.forEach((mine, index) => {
            setTimeout(() => {
                const cell = this.getCellElement(mine.row, mine.col);
                
                if (mine.row === explosionRow && mine.col === explosionCol) {
                    return; // Already exploded
                }
                
                if (this.flagged[mine.row][mine.col]) {
                    cell.classList.add('mine', 'safe-mine');
                } else {
                    cell.classList.add('mine');
                    this.createChainRipple(cell);
                }
                
                this.revealed[mine.row][mine.col] = true;
            }, index * 50);
        });
        
        // Show wrong flags
        setTimeout(() => this.showWrongFlags(), mines.length * 50);
    }
    
    createChainRipple(cell) {
        const ripple = document.createElement('div');
        ripple.className = 'chain-ripple';
        cell.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 500);
    }
    
    showWrongFlags() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.flagged[row][col] && this.board[row][col] !== -1) {
                    const cell = this.getCellElement(row, col);
                    cell.classList.add('wrong-flag');
                }
            }
        }
    }
    
    checkWin() {
        if (this.gameOver || this.gameWon) return;
        
        let revealedSafeCells = 0;
        const totalSafeCells = this.rows * this.cols - this.totalMines;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.revealed[row][col] && this.board[row][col] !== -1) {
                    revealedSafeCells++;
                }
            }
        }
        
        if (revealedSafeCells === totalSafeCells) {
            this.gameWon = true;
            this.clearTimer();
            this.handleWin();
        }
    }
    
    handleWin() {
        // Auto-flag remaining mines
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] === -1 && !this.flagged[row][col]) {
                    this.flagged[row][col] = true;
                    this.updateCell(row, col);
                }
            }
        }
        
        this.minesRemaining = 0;
        this.updateDisplay();
        
        // Victory animation
        this.playVictoryAnimation();
        
        // Save best time
        this.saveBestTime();
        
        // Show success overlay
        setTimeout(() => this.showSuccessOverlay(), 1000);
    }
    
    playVictoryAnimation() {
        // Add pulse animation to all cells
        const cells = this.boardElement.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.classList.add('victory-pulse');
            }, index * 5);
        });
        
        // Create confetti
        this.createConfetti();
    }
    
    createConfetti() {
        const confettiCount = 100;
        const boardRect = this.boardElement.getBoundingClientRect();
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-particle';
                
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                
                const startX = Math.random() * boardRect.width;
                const endX = (Math.random() - 0.5) * 200;
                const endY = 500 + Math.random() * 200;
                
                confetti.style.setProperty('--conf-x', `${endX}px`);
                confetti.style.setProperty('--conf-y', `${endY}px`);
                
                confetti.style.left = `${startX}px`;
                confetti.style.top = '0px';
                
                this.boardElement.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 2000);
            }, i * 20);
        }
    }
    
    toggleFlagMode() {
        this.flagMode = !this.flagMode;
        const btn = document.getElementById('flag-mode-btn');
        if (btn) {
            btn.textContent = this.flagMode ? '🚩 Flag Mode: ON' : '🚩 Flag Mode: OFF';
            btn.classList.toggle('btn-success', this.flagMode);
        }
    }

    showHint() {
        if (this.gameOver || this.gameWon || this.firstClick) return;
        
        // Find a safe cell to reveal
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.revealed[row][col] && !this.flagged[row][col] && this.board[row][col] !== -1) {
                    const cell = this.getCellElement(row, col);
                    cell.style.animation = 'victoryPulse 0.5s ease 3';
                    setTimeout(() => {
                        cell.style.animation = '';
                    }, 1500);
                    return;
                }
            }
        }
    }
    
    showSuccessOverlay() {
        document.getElementById('success-time').textContent = this.formatTime(this.timer);
        document.getElementById('success-difficulty').textContent = 
            this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1);
        
        const rating = this.calculateRating();
        document.getElementById('success-rating').textContent = rating;
        
        this.overlayElement.classList.add('show');
    }
    
    hideOverlay() {
        this.overlayElement.classList.remove('show');
    }
    
    calculateRating() {
        const bestTime = this.bestTimes[this.currentDifficulty];
        if (!bestTime) return '⭐⭐⭐';
        
        if (this.timer <= bestTime) return '⭐⭐⭐⭐⭐';
        if (this.timer <= bestTime * 1.2) return '⭐⭐⭐⭐';
        if (this.timer <= bestTime * 1.5) return '⭐⭐⭐';
        return '⭐⭐';
    }
    
    getCellElement(row, col) {
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }
    
    updateCell(row, col) {
        const cell = this.getCellElement(row, col);
        if (!cell) return;
        
        cell.className = 'cell';
        
        if (this.revealed[row][col]) {
            cell.classList.add('revealed');
            const count = this.board[row][col];
            if (count > 0) {
                cell.textContent = count;
                cell.dataset.count = count;
            }
        } else if (this.flagged[row][col]) {
            cell.classList.add('flagged');
        }
    }
    
    updateDisplay() {
        this.timerElement.textContent = this.formatTime(this.timer);
        this.minesElement.textContent = this.minesRemaining;
        
        const bestTime = this.bestTimes[this.currentDifficulty];
        this.bestTimeElement.textContent = bestTime ? this.formatTime(bestTime) : '--';
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }
    
    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    changeDifficulty(difficulty) {
        if (difficulty === 'custom') {
            alert('Custom difficulty coming soon!');
            this.difficultySelect.value = this.currentDifficulty;
            return;
        }
        
        this.currentDifficulty = difficulty;
        this.newGame();
    }
    
    changeDifficultyFromOverlay() {
        this.hideOverlay();
        this.difficultySelect.focus();
    }
    
    playAgain() {
        this.hideOverlay();
        this.newGame();
    }
    
    loadBestTimes() {
        const saved = localStorage.getItem('minesweeper-best-times');
        this.bestTimes = saved ? JSON.parse(saved) : {};
    }
    
    saveBestTime() {
        const currentBest = this.bestTimes[this.currentDifficulty];
        if (!currentBest || this.timer < currentBest) {
            this.bestTimes[this.currentDifficulty] = this.timer;
            localStorage.setItem('minesweeper-best-times', JSON.stringify(this.bestTimes));
            this.updateDisplay();
        }
        
        // Update global puzzle stats
        this.updateGlobalStats();
    }
    
    updateGlobalStats() {
        // Get or initialize global stats
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        
        if (!puzzleStats.totalGamesPlayed) puzzleStats.totalGamesPlayed = 0;
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        if (!puzzleStats.totalTimePlayed) puzzleStats.totalTimePlayed = 0;
        if (!puzzleStats.bestTimes) puzzleStats.bestTimes = {};
        if (!puzzleStats.streaks) puzzleStats.streaks = { current: 0, longest: 0 };
        
        // Update stats
        puzzleStats.totalGamesCompleted++;
        puzzleStats.totalTimePlayed += this.timer;
        
        // Update best time for minesweeper
        if (!puzzleStats.bestTimes['minesweeper'] || this.timer < puzzleStats.bestTimes['minesweeper']) {
            puzzleStats.bestTimes['minesweeper'] = this.timer;
        }
        
        // Update streak
        puzzleStats.streaks.current++;
        if (puzzleStats.streaks.current > puzzleStats.streaks.longest) {
            puzzleStats.streaks.longest = puzzleStats.streaks.current;
        }
        
        // Save back to localStorage
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
        
        // Dispatch custom event for main page to update
        window.dispatchEvent(new CustomEvent('minesweeper-completed', {
            detail: {
                time: this.timer,
                difficulty: this.currentDifficulty
            }
        }));
    }
}

// Initialize game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MinesweeperGame;
}
