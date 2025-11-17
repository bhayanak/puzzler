/** Flow Free Game */
class FlowFreeGame {
    constructor() {
        this.level = 1;
        this.size = 5;
        this.grid = [];
        this.paths = {}; // Stores path for each color
        this.endpoints = {}; // Stores endpoints {color: [{r,c}, {r,c}]}
        this.isDrawing = false;
        this.currentColor = null;
        this.currentPath = [];
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
        
        this.initializeDOM();
        this.newLevel();
    }
    
    initializeDOM() {
        this.boardElement = document.getElementById('flow-board');
        this.levelElement = document.getElementById('level');
        this.coverageElement = document.getElementById('coverage');
        this.overlayElement = document.getElementById('board-overlay');
        
        document.getElementById('clear-btn').addEventListener('click', () => this.clear());
        document.getElementById('solution-btn')?.addEventListener('click', () => this.showSolution());
        document.getElementById('next-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('continue-btn').addEventListener('click', () => this.nextLevel());
        
        // Global mouseup to stop drawing
        document.addEventListener('mouseup', () => this.stopDrawing());
        document.addEventListener('touchend', () => this.stopDrawing());
    }
    
    newLevel() {
        // Use level configurations or default
        const levelConfig = window.FLOW_FREE_LEVELS && window.FLOW_FREE_LEVELS[(this.level - 1) % window.FLOW_FREE_LEVELS.length];
        
        if (levelConfig) {
            this.size = levelConfig.size;
            this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
            this.paths = {};
            this.endpoints = {};
            this.currentSolution = levelConfig.solution;
            this.currentDifficulty = levelConfig.difficulty;
            
            levelConfig.endpoints.forEach(ep => {
                this.placeEndpoints(ep.colorIdx, ep.positions);
            });
        } else {
            // Fallback to default
            this.size = 5;
            this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
            this.paths = {};
            this.endpoints = {};
            this.placeEndpoints(0, [{r: 0, c: 0}, {r: 0, c: 4}]);
            this.placeEndpoints(1, [{r: 2, c: 1}, {r: 2, c: 3}]);
        }
        
        this.render();
    }
    
    placeEndpoints(colorIdx, positions) {
        const color = this.colors[colorIdx];
        this.endpoints[colorIdx] = positions;
        positions.forEach(pos => {
            this.grid[pos.r][pos.c] = { type: 'endpoint', color, colorIdx };
        });
    }
    
    render() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.size}, 60px)`;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'flow-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                const cellData = this.grid[i][j];
                if (cellData) {
                    cell.style.background = cellData.color;
                    if (cellData.type === 'endpoint') {
                        cell.classList.add('endpoint');
                    } else if (cellData.type === 'path') {
                        cell.classList.add('path');
                    }
                }
                
                // Mouse events for drag drawing
                cell.addEventListener('mousedown', (e) => this.startDrawing(i, j, e));
                cell.addEventListener('mouseenter', () => this.continueDrawing(i, j));
                cell.addEventListener('touchstart', (e) => this.startDrawing(i, j, e));
                cell.addEventListener('touchmove', (e) => this.handleTouchMove(e));
                
                this.boardElement.appendChild(cell);
            }
        }
        
        this.updateCoverage();
    }
    
    startDrawing(row, col, e) {
        e.preventDefault();
        const cellData = this.grid[row][col];
        
        if (!cellData) return;
        
        if (cellData.type === 'endpoint') {
            // Start drawing from endpoint
            this.isDrawing = true;
            this.currentColor = cellData.colorIdx;
            this.currentPath = [{r: row, c: col}];
            // Clear existing path for this color
            this.clearPathForColor(this.currentColor);
        } else if (cellData.type === 'path') {
            // Clear the path if clicking on it
            this.clearPathForColor(cellData.colorIdx);
        }
    }
    
    continueDrawing(row, col) {
        if (!this.isDrawing || this.currentPath.length === 0) return;
        
        const last = this.currentPath[this.currentPath.length - 1];
        
        // Check if adjacent to last cell
        const isAdjacent = Math.abs(last.r - row) + Math.abs(last.c - col) === 1;
        if (!isAdjacent) return;
        
        // Check if backtracking
        if (this.currentPath.length > 1) {
            const prev = this.currentPath[this.currentPath.length - 2];
            if (prev.r === row && prev.c === col) {
                // Remove last cell (backtracking)
                const removed = this.currentPath.pop();
                this.grid[removed.r][removed.c] = null;
                this.render();
                return;
            }
        }
        
        const cellData = this.grid[row][col];
        
        // Can't cross other paths
        if (cellData && cellData.type === 'path' && cellData.colorIdx !== this.currentColor) {
            return;
        }
        
        // Check if reached the other endpoint
        if (cellData && cellData.type === 'endpoint' && cellData.colorIdx === this.currentColor) {
            const endpoints = this.endpoints[this.currentColor];
            const startPoint = this.currentPath[0];
            const otherEnd = endpoints.find(ep => !(ep.r === startPoint.r && ep.c === startPoint.c));
            
            if (otherEnd && otherEnd.r === row && otherEnd.c === col) {
                // Complete the path
                this.currentPath.push({r: row, c: col});
                this.paths[this.currentColor] = [...this.currentPath];
                this.drawPath();
                this.checkWin();
                this.stopDrawing();
                return;
            }
        }
        
        // Add to path if cell is empty or already part of current path
        if (!cellData || (cellData.type === 'path' && cellData.colorIdx === this.currentColor)) {
            this.currentPath.push({r: row, c: col});
            this.drawPath();
        }
    }
    
    stopDrawing() {
        this.isDrawing = false;
        this.currentColor = null;
        this.currentPath = [];
    }
    
    drawPath() {
        // Draw current path (excluding endpoints)
        const color = this.colors[this.currentColor];
        for (let i = 1; i < this.currentPath.length - 1; i++) {
            const {r, c} = this.currentPath[i];
            this.grid[r][c] = { type: 'path', color, colorIdx: this.currentColor };
        }
        
        // Handle last cell if not an endpoint
        if (this.currentPath.length > 1) {
            const last = this.currentPath[this.currentPath.length - 1];
            const lastData = this.grid[last.r][last.c];
            if (!lastData || lastData.type !== 'endpoint') {
                this.grid[last.r][last.c] = { type: 'path', color, colorIdx: this.currentColor };
            }
        }
        
        this.render();
    }
    
    clearPathForColor(colorIdx) {
        // Remove all path cells for this color
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cellData = this.grid[i][j];
                if (cellData && cellData.type === 'path' && cellData.colorIdx === colorIdx) {
                    this.grid[i][j] = null;
                }
            }
        }
        delete this.paths[colorIdx];
        this.render();
    }
    
    handleTouchMove(e) {
        if (!this.isDrawing) return;
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.dataset.row !== undefined) {
            const row = parseInt(element.dataset.row);
            const col = parseInt(element.dataset.col);
            this.continueDrawing(row, col);
        }
    }
    
    updateCoverage() {
        let filled = 0;
        const total = this.size * this.size;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j]) filled++;
            }
        }
        
        const coverage = Math.round((filled / total) * 100);
        this.coverageElement.textContent = `${coverage}%`;
        this.levelElement.textContent = this.level;
    }
    
    checkWin() {
        // Check if all cells are filled
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.grid[i][j]) return;
            }
        }
        
        // Check if all paths are complete
        const endpointColors = Object.keys(this.endpoints);
        for (const colorIdx of endpointColors) {
            if (!this.paths[colorIdx]) return;
        }
        
        this.handleWin();
    }
    
    handleWin() {
        this.updateGlobalStats();
        this.overlayElement.classList.add('show');
    }
    
    clear() {
        this.newLevel();
    }
    
    showSolution() {
        // Clear existing paths
        this.clear();
        
        // Use stored solution if available
        if (this.currentSolution) {
            Object.keys(this.currentSolution).forEach(colorIdxStr => {
                const colorIdx = parseInt(colorIdxStr); // Convert string key to number
                const path = this.currentSolution[colorIdxStr];
                this.paths[colorIdx] = path;
                
                // Draw path (skip first and last as they are endpoints)
                path.slice(1, -1).forEach(pos => {
                    this.grid[pos.r][pos.c] = { 
                        type: 'path', 
                        color: this.colors[colorIdx], 
                        colorIdx: colorIdx 
                    };
                });
            });
        }
        
        this.render();
        this.updateCoverage();
        alert('💡 Solution shown! Study the pattern and try the next level yourself.');
    }
    
    nextLevel() {
        this.level++;
        this.overlayElement.classList.remove('show');
        this.newLevel();
    }
    
    updateGlobalStats() {
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        puzzleStats.totalGamesCompleted++;
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
    }
}
