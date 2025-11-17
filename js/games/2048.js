/** 2048 Game */
class Game2048 {
    constructor() {
        this.grid = Array(4).fill(null).map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048-best') || '0');
        this.history = [];
        this.maxHistory = 5;
        this.initializeDOM();
        this.newGame();
    }
    
    initializeDOM() {
        this.boardElement = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.overlayElement = document.getElementById('board-overlay');
        
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('continue-btn').addEventListener('click', () => this.hideOverlay());
        document.getElementById('restart-btn').addEventListener('click', () => this.newGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch swipe support
        let touchStartX = 0;
        let touchStartY = 0;
        this.boardElement.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        this.boardElement.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) return;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                this.move(deltaX > 0 ? 'right' : 'left');
            } else {
                // Vertical swipe
                this.move(deltaY > 0 ? 'down' : 'up');
            }
            
            touchStartX = 0;
            touchStartY = 0;
        });
    }
    
    newGame() {
        this.grid = Array(4).fill(null).map(() => Array(4).fill(0));
        this.score = 0;
        this.history = []; // Clear history when starting new game
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        this.hideOverlay();
    }
    
    addRandomTile() {
        const empty = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) empty.push({i, j});
            }
        }
        if (empty.length > 0) {
            const {i, j} = empty[Math.floor(Math.random() * empty.length)];
            this.grid[i][j] = Math.random() > 0.9 ? 4 : 2;
        }
    }
    
    saveState() {
        this.history.push({
            grid: this.grid.map(row => [...row]),
            score: this.score
        });
        if (this.history.length > this.maxHistory) this.history.shift();
    }
    
    undo() {
        if (this.history.length > 0) {
            const state = this.history.pop();
            this.grid = state.grid.map(row => [...row]);
            this.score = state.score;
            this.render();
        }
    }
    
    handleKeyPress(e) {
        const key = e.key;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            this.move(key.replace('Arrow', '').toLowerCase());
        }
    }
    
    move(direction) {
        // Create snapshot of current state BEFORE any modifications
        const gridSnapshot = this.grid.map(row => [...row]);
        const scoreSnapshot = this.score;
        
        const oldGrid = JSON.stringify(this.grid);
        if (direction === 'left') this.moveLeft();
        else if (direction === 'right') this.moveRight();
        else if (direction === 'up') this.moveUp();
        else if (direction === 'down') this.moveDown();
        
        if (JSON.stringify(this.grid) !== oldGrid) {
            // Move changed the grid - save the snapshot (before new tile)
            // CRITICAL: Trim history BEFORE adding new tile
            if (this.history.length >= this.maxHistory) this.history.shift();
            this.history.push({
                grid: gridSnapshot,
                score: scoreSnapshot
            });
            
            this.addRandomTile();
            this.render();
            this.checkWin();
        }
    }
    
    moveLeft() {
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(x => x !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            while (row.length < 4) row.push(0);
            this.grid[i] = row;
        }
    }
    
    moveRight() {
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(x => x !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            while (row.length < 4) row.unshift(0);
            this.grid[i] = row;
        }
    }
    
    moveUp() {
        for (let j = 0; j < 4; j++) {
            let col = [this.grid[0][j], this.grid[1][j], this.grid[2][j], this.grid[3][j]].filter(x => x !== 0);
            for (let i = 0; i < col.length - 1; i++) {
                if (col[i] === col[i + 1]) {
                    col[i] *= 2;
                    this.score += col[i];
                    col.splice(i + 1, 1);
                }
            }
            while (col.length < 4) col.push(0);
            for (let i = 0; i < 4; i++) this.grid[i][j] = col[i];
        }
    }
    
    moveDown() {
        for (let j = 0; j < 4; j++) {
            let col = [this.grid[0][j], this.grid[1][j], this.grid[2][j], this.grid[3][j]].filter(x => x !== 0);
            for (let i = col.length - 1; i > 0; i--) {
                if (col[i] === col[i - 1]) {
                    col[i] *= 2;
                    this.score += col[i];
                    col.splice(i - 1, 1);
                    i--;
                }
            }
            while (col.length < 4) col.unshift(0);
            for (let i = 0; i < 4; i++) this.grid[i][j] = col[i];
        }
    }
    
    checkWin() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 2048) {
                    this.handleWin();
                    return;
                }
            }
        }
    }
    
    handleWin() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048-best', this.bestScore);
        }
        this.updateGlobalStats();
        document.getElementById('final-score').textContent = `Score: ${this.score}`;
        this.overlayElement.classList.add('show');
    }
    
    hideOverlay() {
        this.overlayElement.classList.remove('show');
    }
    
    undo() {
        // Basic undo placeholder
    }
    
    render() {
        this.boardElement.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.value = this.grid[i][j];
                tile.textContent = this.grid[i][j] || '';
                this.boardElement.appendChild(tile);
            }
        }
        this.scoreElement.textContent = this.score;
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    updateGlobalStats() {
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        puzzleStats.totalGamesCompleted++;
        if (!puzzleStats.bestTimes) puzzleStats.bestTimes = {};
        puzzleStats.bestTimes['2048'] = this.score;
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
    }
}
