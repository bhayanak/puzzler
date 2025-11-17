/**
 * Nonogram (Picross) Game
 * Picture logic puzzle with number clues
 */

class NonogramGame {
    constructor() {
        this.puzzles = this.initializePuzzles();
        this.currentPuzzleIndex = 0;
        this.grid = [];
        this.solution = [];
        this.currentTool = 'fill';
        this.timer = 0;
        this.errors = 0;
        this.timerInterval = null;
        
        this.initializeDOM();
        this.loadPuzzle(0);
    }
    
    initializeDOM() {
        this.boardElement = document.getElementById('nonogram-board');
        this.timerElement = document.getElementById('timer');
        this.errorsElement = document.getElementById('errors');
        this.progressElement = document.getElementById('progress');
        this.puzzleSelect = document.getElementById('puzzle-select');
        this.overlayElement = document.getElementById('board-overlay');
        
        this.puzzleSelect.addEventListener('change', (e) => this.loadPuzzle(parseInt(e.target.value)));
        document.getElementById('fill-btn').addEventListener('click', () => this.setTool('fill'));
        document.getElementById('mark-btn').addEventListener('click', () => this.setTool('mark'));
        document.getElementById('clear-btn').addEventListener('click', () => this.clearGrid());
        document.getElementById('check-btn').addEventListener('click', () => this.checkSolution());
        document.getElementById('next-puzzle-btn').addEventListener('click', () => this.nextPuzzle());
        document.getElementById('replay-btn').addEventListener('click', () => this.replayPuzzle());
    }
    
    initializePuzzles() {
        return [
            { name: 'Heart', size: 5, solution: [[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]] },
            { name: 'Star', size: 5, solution: [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[1,0,1,0,1]] },
            { name: 'Arrow', size: 5, solution: [[0,0,1,0,0],[0,1,1,1,0],[1,0,1,0,1],[0,0,1,0,0],[0,0,1,0,0]] },
            { name: 'Cat', size: 10, solution: this.generateRandomPuzzle(10) },
            { name: 'House', size: 10, solution: this.generateRandomPuzzle(10) },
            { name: 'Sailboat', size: 10, solution: this.generateRandomPuzzle(10) },
            { name: 'Butterfly', size: 15, solution: this.generateRandomPuzzle(15) },
            { name: 'Rocket', size: 15, solution: this.generateRandomPuzzle(15) },
            { name: 'Castle', size: 15, solution: this.generateRandomPuzzle(15) }
        ];
    }
    
    generateRandomPuzzle(size) {
        const grid = [];
        for (let i = 0; i < size; i++) {
            grid[i] = [];
            for (let j = 0; j < size; j++) {
                grid[i][j] = Math.random() > 0.6 ? 1 : 0;
            }
        }
        return grid;
    }
    
    loadPuzzle(index) {
        this.currentPuzzleIndex = index;
        const puzzle = this.puzzles[index];
        this.solution = puzzle.solution;
        this.grid = Array(puzzle.size).fill(null).map(() => Array(puzzle.size).fill(0));
        this.errors = 0;
        this.timer = 0;
        this.clearTimer();
        this.startTimer();
        this.renderBoard();
        this.updateDisplay();
    }
    
    renderBoard() {
        const size = this.solution.length;
        
        // Calculate clues
        const rowClues = this.calculateRowClues();
        const colClues = this.calculateColClues();
        
        // Render column clues
        const colCluesElement = document.getElementById('col-clues');
        colCluesElement.innerHTML = '';
        colCluesElement.style.gridTemplateColumns = `repeat(${size}, 30px)`;
        colClues.forEach(clue => {
            const clueDiv = document.createElement('div');
            clueDiv.className = 'col-clue';
            clue.forEach(num => {
                const span = document.createElement('span');
                span.textContent = num;
                clueDiv.appendChild(span);
            });
            colCluesElement.appendChild(clueDiv);
        });
        
        // Render row clues
        const rowCluesElement = document.getElementById('row-clues');
        rowCluesElement.innerHTML = '';
        rowClues.forEach(clue => {
            const clueDiv = document.createElement('div');
            clueDiv.className = 'row-clue';
            clue.forEach(num => {
                const span = document.createElement('span');
                span.textContent = num;
                clueDiv.appendChild(span);
            });
            rowCluesElement.appendChild(clueDiv);
        });
        
        // Render grid
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${size}, 30px)`;
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('div');
                cell.className = 'nonogram-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', () => this.handleCellClick(i, j));
                this.boardElement.appendChild(cell);
            }
        }
    }
    
    calculateRowClues() {
        const clues = [];
        for (let i = 0; i < this.solution.length; i++) {
            const row = this.solution[i];
            const rowClues = [];
            let count = 0;
            for (let j = 0; j < row.length; j++) {
                if (row[j] === 1) {
                    count++;
                } else if (count > 0) {
                    rowClues.push(count);
                    count = 0;
                }
            }
            if (count > 0) rowClues.push(count);
            if (rowClues.length === 0) rowClues.push(0);
            clues.push(rowClues);
        }
        return clues;
    }
    
    calculateColClues() {
        const clues = [];
        const size = this.solution.length;
        for (let j = 0; j < size; j++) {
            const colClues = [];
            let count = 0;
            for (let i = 0; i < size; i++) {
                if (this.solution[i][j] === 1) {
                    count++;
                } else if (count > 0) {
                    colClues.push(count);
                    count = 0;
                }
            }
            if (count > 0) colClues.push(count);
            if (colClues.length === 0) colClues.push(0);
            clues.push(colClues);
        }
        return clues;
    }
    
    handleCellClick(row, col) {
        if (this.currentTool === 'fill') {
            this.grid[row][col] = this.grid[row][col] === 1 ? 0 : 1;
        } else {
            this.grid[row][col] = this.grid[row][col] === 2 ? 0 : 2;
        }
        this.updateCell(row, col);
        this.updateProgress();
    }
    
    updateCell(row, col) {
        const cell = this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.className = 'nonogram-cell';
        if (this.grid[row][col] === 1) cell.classList.add('filled');
        if (this.grid[row][col] === 2) cell.classList.add('marked');
    }
    
    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    }
    
    clearGrid() {
        this.grid = Array(this.solution.length).fill(null).map(() => Array(this.solution.length).fill(0));
        this.renderBoard();
        this.updateProgress();
    }
    
    checkSolution() {
        let correct = true;
        for (let i = 0; i < this.solution.length; i++) {
            for (let j = 0; j < this.solution[i].length; j++) {
                if (this.grid[i][j] === 1 && this.solution[i][j] !== 1) {
                    this.errors++;
                    correct = false;
                }
            }
        }
        
        if (correct && this.isComplete()) {
            this.handleWin();
        } else {
            this.updateDisplay();
        }
    }
    
    isComplete() {
        for (let i = 0; i < this.solution.length; i++) {
            for (let j = 0; j < this.solution[i].length; j++) {
                if (this.solution[i][j] === 1 && this.grid[i][j] !== 1) return false;
            }
        }
        return true;
    }
    
    handleWin() {
        this.clearTimer();
        this.updateGlobalStats();
        document.getElementById('success-time').textContent = this.formatTime(this.timer);
        document.getElementById('success-errors').textContent = this.errors;
        document.getElementById('success-rating').textContent = this.errors === 0 ? '⭐⭐⭐' : this.errors < 3 ? '⭐⭐' : '⭐';
        this.overlayElement.classList.add('show');
    }
    
    nextPuzzle() {
        this.overlayElement.classList.remove('show');
        const nextIndex = (this.currentPuzzleIndex + 1) % this.puzzles.length;
        this.puzzleSelect.value = nextIndex;
        this.loadPuzzle(nextIndex);
    }
    
    replayPuzzle() {
        this.overlayElement.classList.remove('show');
        this.loadPuzzle(this.currentPuzzleIndex);
    }
    
    updateProgress() {
        const total = this.solution.length * this.solution[0].length;
        let filled = 0;
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j] === 1) filled++;
            }
        }
        const progress = Math.round((filled / total) * 100);
        this.progressElement.textContent = `${progress}%`;
    }
    
    updateDisplay() {
        this.timerElement.textContent = this.formatTime(this.timer);
        this.errorsElement.textContent = this.errors;
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
    
    updateGlobalStats() {
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        if (!puzzleStats.totalTimePlayed) puzzleStats.totalTimePlayed = 0;
        if (!puzzleStats.streaks) puzzleStats.streaks = { current: 0, longest: 0 };
        
        puzzleStats.totalGamesCompleted++;
        puzzleStats.totalTimePlayed += this.timer;
        puzzleStats.streaks.current++;
        if (puzzleStats.streaks.current > puzzleStats.streaks.longest) {
            puzzleStats.streaks.longest = puzzleStats.streaks.current;
        }
        
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NonogramGame;
}
