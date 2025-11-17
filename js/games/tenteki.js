/** Tenteki (Laser) Game */
class TentekiGame {
    constructor() {
        this.level = 1;
        this.size = 8;
        this.grid = [];
        this.laserStart = {row: 0, col: 0, direction: 'right'};
        this.target = {row: 7, col: 7};
        this.selectedMirror = '/'; // Default mirror type
        this.initializeDOM();
        this.newLevel();
    }
    
    initializeDOM() {
        this.boardElement = document.getElementById('tenteki-board');
        this.levelElement = document.getElementById('level');
        document.getElementById('next-btn').addEventListener('click', () => this.nextLevel());
    }
    
    newLevel() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        
        // 25 diverse levels from easy to expert
        const configs = [
            // EASY (Levels 1-5): 1-2 mirrors, straight paths
            {start: {row: 0, col: 0, direction: 'right'}, target: {row: 0, col: 7}, difficulty: 'Easy'},
            {start: {row: 0, col: 0, direction: 'down'}, target: {row: 7, col: 0}, difficulty: 'Easy'},
            {start: {row: 0, col: 0, direction: 'right'}, target: {row: 7, col: 7}, difficulty: 'Easy'},
            {start: {row: 7, col: 0, direction: 'up'}, target: {row: 0, col: 7}, difficulty: 'Easy'},
            {start: {row: 0, col: 0, direction: 'down'}, target: {row: 7, col: 7}, difficulty: 'Easy'},
            
            // MEDIUM (Levels 6-12): 2-3 mirrors, L-shapes
            {start: {row: 0, col: 0, direction: 'right'}, target: {row: 4, col: 7}, difficulty: 'Medium'},
            {start: {row: 3, col: 0, direction: 'right'}, target: {row: 7, col: 3}, difficulty: 'Medium'},
            {start: {row: 0, col: 4, direction: 'down'}, target: {row: 7, col: 0}, difficulty: 'Medium'},
            {start: {row: 7, col: 7, direction: 'left'}, target: {row: 0, col: 0}, difficulty: 'Medium'},
            {start: {row: 0, col: 7, direction: 'down'}, target: {row: 7, col: 0}, difficulty: 'Medium'},
            {start: {row: 4, col: 0, direction: 'right'}, target: {row: 0, col: 4}, difficulty: 'Medium'},
            {start: {row: 7, col: 3, direction: 'up'}, target: {row: 3, col: 7}, difficulty: 'Medium'},
            
            // HARD (Levels 13-18): 3-5 mirrors, zigzag paths
            {start: {row: 0, col: 0, direction: 'right'}, target: {row: 3, col: 7}, difficulty: 'Hard'},
            {start: {row: 7, col: 7, direction: 'up'}, target: {row: 0, col: 0}, difficulty: 'Hard'},
            {start: {row: 3, col: 0, direction: 'right'}, target: {row: 0, col: 3}, difficulty: 'Hard'},
            {start: {row: 0, col: 3, direction: 'down'}, target: {row: 7, col: 7}, difficulty: 'Hard'},
            {start: {row: 7, col: 0, direction: 'up'}, target: {row: 0, col: 7}, difficulty: 'Hard'},
            {start: {row: 0, col: 7, direction: 'down'}, target: {row: 7, col: 1}, difficulty: 'Hard'},
            
            // EXPERT (Levels 19-25): 5+ mirrors, complex reflections
            {start: {row: 0, col: 0, direction: 'right'}, target: {row: 2, col: 7}, difficulty: 'Expert'},
            {start: {row: 7, col: 7, direction: 'left'}, target: {row: 1, col: 0}, difficulty: 'Expert'},
            {start: {row: 3, col: 0, direction: 'right'}, target: {row: 5, col: 7}, difficulty: 'Expert'},
            {start: {row: 0, col: 4, direction: 'down'}, target: {row: 7, col: 2}, difficulty: 'Expert'},
            {start: {row: 7, col: 3, direction: 'up'}, target: {row: 0, col: 6}, difficulty: 'Expert'},
            {start: {row: 2, col: 0, direction: 'right'}, target: {row: 6, col: 7}, difficulty: 'Expert'},
            {start: {row: 0, col: 6, direction: 'down'}, target: {row: 7, col: 1}, difficulty: 'Expert'}
        ];
        
        const config = configs[(this.level - 1) % configs.length];
        this.laserStart = config.start;
        this.target = config.target;
        this.currentDifficulty = config.difficulty;
        
        this.render();
    }
    
    render() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.size}, 50px)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.size}, 50px)`;
        
        // Create grid
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'tenteki-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Check if this is the laser start
                if (row === this.laserStart.row && col === this.laserStart.col) {
                    cell.classList.add('laser-start');
                    cell.innerHTML = '⚡';
                }
                // Check if this is the target
                else if (row === this.target.row && col === this.target.col) {
                    cell.classList.add('target');
                    cell.innerHTML = '🎯';
                }
                // Check if there's a mirror
                else if (this.grid[row][col]) {
                    cell.classList.add('mirror');
                    cell.innerHTML = this.grid[row][col];
                    cell.addEventListener('click', () => this.removeMirror(row, col));
                }
                // Empty cell - can place mirror
                else {
                    cell.addEventListener('click', () => this.placeMirror(row, col));
                }
                
                this.boardElement.appendChild(cell);
            }
        }
        
        // Remove existing controls if any
        const existingControls = this.boardElement.parentElement.querySelector('.tenteki-controls');
        if (existingControls) existingControls.remove();
        
        // Add mirror selector controls
        const controls = document.createElement('div');
        controls.className = 'tenteki-controls';
        controls.style.cssText = 'margin-top: 20px; display: flex; gap: 10px; justify-content: center;';
        controls.innerHTML = `
            <button class="mirror-btn ${this.selectedMirror === '/' ? 'active' : ''}" data-mirror="/">
                / Mirror
            </button>
            <button class="mirror-btn ${this.selectedMirror === '\\' ? 'active' : ''}" data-mirror="\\">
                \\ Mirror
            </button>
            <button class="btn btn-secondary" id="clear-mirrors">Clear All</button>
            <button class="btn btn-primary" id="test-laser">🔦 Test Laser</button>
        `;
        this.boardElement.parentElement.appendChild(controls);
        
        // Add event listeners for mirror selection
        document.querySelectorAll('.mirror-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedMirror = btn.dataset.mirror;
                document.querySelectorAll('.mirror-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        document.getElementById('clear-mirrors')?.addEventListener('click', () => {
            this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
            this.render();
        });
        
        document.getElementById('test-laser')?.addEventListener('click', () => this.testLaser());
        
        this.levelElement.textContent = this.level;
    }
    
    placeMirror(row, col) {
        // Don't place on start or target
        if ((row === this.laserStart.row && col === this.laserStart.col) ||
            (row === this.target.row && col === this.target.col)) {
            return;
        }
        
        this.grid[row][col] = this.selectedMirror;
        this.render();
    }
    
    removeMirror(row, col) {
        this.grid[row][col] = null;
        this.render();
    }
    
    testLaser() {
        let row = this.laserStart.row;
        let col = this.laserStart.col;
        let direction = this.laserStart.direction;
        const path = [];
        const maxSteps = 100; // Prevent infinite loops
        let steps = 0;
        
        while (steps < maxSteps) {
            path.push({row, col});
            
            // Move in current direction
            if (direction === 'right') col++;
            else if (direction === 'left') col--;
            else if (direction === 'down') row++;
            else if (direction === 'up') row--;
            
            // Check if out of bounds
            if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
                this.showResult(false, path);
                return;
            }
            
            // Check if hit target
            if (row === this.target.row && col === this.target.col) {
                path.push({row, col});
                this.showResult(true, path);
                return;
            }
            
            // Check if hit mirror
            const mirror = this.grid[row][col];
            if (mirror) {
                // Reflect laser
                if (mirror === '/') {
                    if (direction === 'right') direction = 'up';
                    else if (direction === 'left') direction = 'down';
                    else if (direction === 'down') direction = 'left';
                    else if (direction === 'up') direction = 'right';
                } else if (mirror === '\\') {
                    if (direction === 'right') direction = 'down';
                    else if (direction === 'left') direction = 'up';
                    else if (direction === 'down') direction = 'right';
                    else if (direction === 'up') direction = 'left';
                }
            }
            
            steps++;
        }
        
        this.showResult(false, path);
    }
    
    showResult(success, path) {
        // Highlight laser path
        path.forEach(({row, col}) => {
            const cell = document.querySelector(`.tenteki-cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.style.background = success ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
            }
        });
        
        setTimeout(() => {
            if (success) {
                alert('🎉 Success! Laser reached the target!');
                this.nextLevel();
            } else {
                alert('❌ Laser missed the target. Try adjusting your mirrors!');
                this.render(); // Clear highlighting
            }
        }, 1000);
    }
    
    nextLevel() {
        this.level++;
        this.updateGlobalStats();
        this.newLevel();
    }
    
    updateGlobalStats() {
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        puzzleStats.totalGamesCompleted++;
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
    }
}
