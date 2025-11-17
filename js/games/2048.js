/** 2048 Game */
class Game2048 {
    constructor() {
        this.grid = Array(4).fill(null).map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048-best') || '0');
        this.initializeDOM();
        this.newGame();
    }
    
    initializeDOM() {
        this.boardElement = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.overlayElement = document.getElementById('board-overlay');
        
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('fullscreen-btn')?.addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('continue-btn').addEventListener('click', () => this.hideOverlay());
        document.getElementById('restart-btn').addEventListener('click', () => this.newGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Prevent pull-to-refresh and bounce scrolling on mobile
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('.game-board')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Touch swipe support
        let touchStartX = 0;
        let touchStartY = 0;
        this.boardElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: false });
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
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert('Fullscreen failed: ' + err.message);
            });
        } else {
            document.exitFullscreen();
        }
    }

    newGame() {
        this.grid = Array(4).fill(null).map(() => Array(4).fill(0));
        this.score = 0;
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

    handleKeyPress(e) {
        const key = e.key;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            this.move(key.replace('Arrow', '').toLowerCase());
        }
    }
    
    move(direction) {
        const oldGrid = JSON.stringify(this.grid);

        if (direction === 'left') this.moveLeft();
        else if (direction === 'right') this.moveRight();
        else if (direction === 'up') this.moveUp();
        else if (direction === 'down') this.moveDown();
        
        if (JSON.stringify(this.grid) !== oldGrid) {
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
