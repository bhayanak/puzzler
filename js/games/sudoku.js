// Sudoku Game Implementation
class SudokuGame {
    constructor() {
        // Check if we have essential elements before initializing
        if (!document.getElementById('sudoku-grid')) {
            console.warn('Sudoku game elements not found. Skipping initialization.');
            return;
        }
        
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initialGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.gameActive = false;
        this.gameTimer = null;
        this.startTime = null;
        this.hintsUsed = 0;
        
        this.settings = {
            highlightConflicts: true,
            showCandidates: false,
            highlightRelated: true,
            autoValidate: false,
            timerEnabled: true,
            difficulty: 'medium',
            generationPattern: 'random' // 'random', 'scattered', 'symmetric'
        };
        
        this.stats = this.loadStats();
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.updateUI();
        this.generateNewPuzzle();
    }

    initializeElements() {
        this.gridElement = document.getElementById('sudoku-grid');
        this.timeElement = document.getElementById('game-time');
        this.filledElement = document.getElementById('filled-cells');
        this.hintsElement = document.getElementById('hints-used');
        this.bestTimeElement = document.getElementById('best-time');
        
        // Modals
        this.helpModal = document.getElementById('help-modal');
        this.settingsModal = document.getElementById('settings-modal');
        
        // Success overlay
        this.boardOverlay = document.getElementById('board-overlay');
        this.successAnimation = document.getElementById('success-animation');
        
        this.createGrid();
    }

    createGrid() {
        this.gridElement.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.selectCell(row, col));
                
                this.gridElement.appendChild(cell);
            }
        }
    }

    bindEvents() {
        // Game controls
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) newGameBtn.addEventListener('click', () => this.generateNewPuzzle());
        
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearPuzzle());
        
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) hintBtn.addEventListener('click', () => this.showHint());
        
        const validateBtn = document.getElementById('validate-btn');
        if (validateBtn) validateBtn.addEventListener('click', () => this.validatePuzzle());
        
        const solveBtn = document.getElementById('solve-btn');
        if (solveBtn) solveBtn.addEventListener('click', () => this.solvePuzzle());
        
        // Difficulty selector
        const difficultySelect = document.getElementById('difficulty-level');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.settings.difficulty = e.target.value;
                this.saveSettings();
                this.updateUI(); // Update display to show new difficulty's best time
            });
        }
        
        // Pattern selector
        const patternSelect = document.getElementById('pattern-type');
        if (patternSelect) {
            patternSelect.addEventListener('change', (e) => {
                this.settings.generationPattern = e.target.value;
                this.saveSettings();
                console.log(`🎨 Pattern changed to: ${e.target.value}`);
            });
        }
        
        // Number pad
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = parseInt(e.target.dataset.number);
                this.inputNumber(number);
            });
        });
        
        // Modal controls
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) helpBtn.addEventListener('click', () => this.showModal('help-modal'));
        
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.showModal('settings-modal'));
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e));
        });
        
        // Settings
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => this.saveGameSettings());
        
        const resetStatsBtn = document.getElementById('reset-stats');
        if (resetStatsBtn) resetStatsBtn.addEventListener('click', () => this.resetStatistics());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Click outside modal to close
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    handleKeyboard(e) {
        if (!this.gameActive || !this.selectedCell) return;
        
        const key = e.key;
        
        if (key >= '1' && key <= '9') {
            e.preventDefault();
            this.inputNumber(parseInt(key));
        } else if (key === 'Delete' || key === 'Backspace') {
            e.preventDefault();
            this.inputNumber(0);
        } else if (key === 'h' || key === 'H') {
            e.preventDefault();
            this.showHint();
        } else if (key === 'v' || key === 'V') {
            e.preventDefault();
            this.validatePuzzle();
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            this.moveSelection(key);
        }
    }

    moveSelection(direction) {
        if (!this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        let newRow = row;
        let newCol = col;
        
        switch (direction) {
            case 'ArrowUp':
                newRow = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(8, col + 1);
                break;
        }
        
        this.selectCell(newRow, newCol);
    }

    selectCell(row, col) {
        // Don't select given cells
        if (this.initialGrid[row][col] !== 0) return;
        
        // Remove previous selection
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted');
        });
        
        this.selectedCell = { row, col };
        const cell = this.getCellElement(row, col);
        cell.classList.add('selected');
        
        // Highlight related cells if enabled
        if (this.settings.highlightRelated) {
            this.highlightRelatedCells(row, col);
        }
    }

    highlightRelatedCells(row, col) {
        // Highlight same row, column, and 3x3 box
        for (let i = 0; i < 9; i++) {
            // Same row
            this.getCellElement(row, i).classList.add('highlighted');
            // Same column
            this.getCellElement(i, col).classList.add('highlighted');
        }
        
        // Same 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                this.getCellElement(r, c).classList.add('highlighted');
            }
        }
    }

    inputNumber(number) {
        if (!this.gameActive || !this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        
        // Don't modify given cells
        if (this.initialGrid[row][col] !== 0) return;
        
        this.grid[row][col] = number;
        this.updateCellDisplay(row, col);
        
        // Check for conflicts if enabled
        if (this.settings.highlightConflicts) {
            this.updateConflicts();
        }
        
        // Auto-validate if enabled
        if (this.settings.autoValidate && number !== 0) {
            if (!this.isValidMove(row, col, number)) {
                this.getCellElement(row, col).classList.add('conflict');
            }
        }
        
        this.updateUI();
        
        // Check for win condition
        if (this.checkWinCondition()) {
            this.handleGameWin();
        }
    }

    updateCellDisplay(row, col) {
        const cell = this.getCellElement(row, col);
        const value = this.grid[row][col];
        
        cell.textContent = value === 0 ? '' : value.toString();
        cell.classList.remove('conflict');
        
        if (this.initialGrid[row][col] !== 0) {
            cell.classList.add('given');
        }
    }

    getCellElement(row, col) {
        return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    updateConflicts() {
        // Clear existing conflicts
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('conflict');
        });
        
        // Check for conflicts
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.grid[row][col];
                if (value !== 0 && !this.isValidMove(row, col, value)) {
                    this.getCellElement(row, col).classList.add('conflict');
                }
            }
        }
    }

    isValidMove(row, col, number) {
        // Check row
        for (let c = 0; c < 9; c++) {
            if (c !== col && this.grid[row][c] === number) {
                return false;
            }
        }
        
        // Check column
        for (let r = 0; r < 9; r++) {
            if (r !== row && this.grid[r][col] === number) {
                return false;
            }
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && this.grid[r][c] === number) {
                    return false;
                }
            }
        }
        
        return true;
    }

    generateNewPuzzle() {
        console.log('🎯 Generating new Sudoku puzzle...');
        
        // If set to 'random', cycle through different patterns for variety
        if (this.settings.generationPattern === 'random') {
            const patterns = ['scattered', 'symmetric', 'random'];
            const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
            console.log(`🎲 Random mode selected: ${randomPattern}`);
        }
        
        // Generate a complete solution
        this.generateCompleteSolution();
        
        // Create puzzle by removing numbers
        this.createPuzzleFromSolution();
        
        this.gameActive = true;
        this.hintsUsed = 0;
        this.startTimer();
        this.updateUI();
        
        console.log('✅ New puzzle generated');
    }

    generateCompleteSolution() {
        // Initialize empty grid
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        
        // Fill the grid using backtracking
        this.solveSudoku(this.solution);
        
        console.log('✅ Complete solution generated');
    }

    solveSudoku(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    // Try numbers 1-9 in random order
                    const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    
                    for (const num of numbers) {
                        if (this.isValidPlacement(grid, row, col, num)) {
                            grid[row][col] = num;
                            
                            if (this.solveSudoku(grid)) {
                                return true;
                            }
                            
                            grid[row][col] = 0;
                        }
                    }
                    
                    return false;
                }
            }
        }
        return true;
    }

    isValidPlacement(grid, row, col, num) {
        // Check row
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] === num) return false;
        }
        
        // Check column
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] === num) return false;
            }
        }
        
        return true;
    }

    createPuzzleFromSolution() {
        // Copy solution to grids
        this.grid = this.solution.map(row => [...row]);
        this.initialGrid = this.solution.map(row => [...row]);
        
        // Determine number of clues based on difficulty
        const cluesCounts = {
            easy: 40,
            medium: 32,
            hard: 27,
            expert: 22
        };
        
        const targetClues = cluesCounts[this.settings.difficulty] || 32;
        const cellsToRemove = 81 - targetClues;
        
        // Choose generation pattern (randomly select if not specified)
        const patterns = ['random', 'scattered', 'symmetric'];
        const selectedPattern = this.settings.generationPattern === 'random' ? 
            patterns[Math.floor(Math.random() * patterns.length)] : 
            this.settings.generationPattern;
        
        console.log(`🎨 Using ${selectedPattern} generation pattern`);
        
        // Generate positions to remove based on selected pattern
        let positionsToRemove;
        switch (selectedPattern) {
            case 'scattered':
                positionsToRemove = this.generateScatteredPattern(cellsToRemove);
                break;
            case 'symmetric':
                positionsToRemove = this.generateSymmetricPattern(cellsToRemove);
                break;
            default: // 'random'
                positionsToRemove = this.generateRandomPattern(cellsToRemove);
                break;
        }
        
        // Remove the selected cells
        for (const { row, col } of positionsToRemove) {
            this.grid[row][col] = 0;
            this.initialGrid[row][col] = 0;
        }
        
        // Update display
        this.renderGrid();
    }

    renderGrid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                this.updateCellDisplay(row, col);
            }
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    generateRandomPattern(cellsToRemove) {
        // Original random pattern - completely random removal
        const positions = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                positions.push({ row, col });
            }
        }
        
        this.shuffleArray(positions);
        return positions.slice(0, cellsToRemove);
    }

    generateScatteredPattern(cellsToRemove) {
        // Scattered pattern - ensure cells are distributed across all 9 boxes
        const positions = [];
        const boxCells = {}; // Track cells per box
        
        // Initialize box tracking
        for (let box = 0; box < 9; box++) {
            boxCells[box] = [];
        }
        
        // Populate cells by box
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
                boxCells[box].push({ row, col, box });
            }
        }
        
        // Shuffle cells within each box
        Object.values(boxCells).forEach(cells => this.shuffleArray(cells));
        
        // Distribute removals across boxes more evenly
        const cellsPerBox = Math.floor(cellsToRemove / 9);
        const extraCells = cellsToRemove % 9;
        
        for (let box = 0; box < 9; box++) {
            const cellsFromThisBox = cellsPerBox + (box < extraCells ? 1 : 0);
            const boxPositions = boxCells[box].slice(0, Math.min(cellsFromThisBox, boxCells[box].length));
            positions.push(...boxPositions);
        }
        
        // If we need more cells, add randomly from remaining
        if (positions.length < cellsToRemove) {
            const remaining = [];
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (!positions.find(p => p.row === row && p.col === col)) {
                        remaining.push({ row, col });
                    }
                }
            }
            this.shuffleArray(remaining);
            positions.push(...remaining.slice(0, cellsToRemove - positions.length));
        }
        
        return positions.slice(0, cellsToRemove);
    }

    generateSymmetricPattern(cellsToRemove) {
        // Symmetric pattern - remove cells in symmetric pairs/patterns
        const positions = [];
        const used = new Set();
        
        // Try to create symmetric pairs first
        let attempts = 0;
        while (positions.length < cellsToRemove && attempts < cellsToRemove * 2) {
            attempts++;
            
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            const key1 = `${row},${col}`;
            
            if (used.has(key1)) continue;
            
            // Create symmetric counterpart (center symmetry)
            const symRow = 8 - row;
            const symCol = 8 - col;
            const key2 = `${symRow},${symCol}`;
            
            if (!used.has(key2)) {
                // Add both symmetric positions if we have room
                if (positions.length + (row === symRow && col === symCol ? 1 : 2) <= cellsToRemove) {
                    positions.push({ row, col });
                    used.add(key1);
                    
                    if (!(row === symRow && col === symCol)) {
                        positions.push({ row: symRow, col: symCol });
                        used.add(key2);
                    }
                }
            }
        }
        
        // Fill remaining positions randomly if needed
        if (positions.length < cellsToRemove) {
            const remaining = [];
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const key = `${row},${col}`;
                    if (!used.has(key)) {
                        remaining.push({ row, col });
                    }
                }
            }
            this.shuffleArray(remaining);
            positions.push(...remaining.slice(0, cellsToRemove - positions.length));
        }
        
        return positions.slice(0, cellsToRemove);
    }

    showHint() {
        if (!this.gameActive) return;
        
        // Find an empty cell and fill it with the correct answer
        const emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) return;
        
        // Choose a random empty cell
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const { row, col } = randomCell;
        
        this.grid[row][col] = this.solution[row][col];
        this.updateCellDisplay(row, col);
        
        // Highlight the hint cell briefly
        const cell = this.getCellElement(row, col);
        cell.style.background = 'var(--success-color)';
        cell.style.color = 'white';
        
        setTimeout(() => {
            cell.style.background = '';
            cell.style.color = '';
        }, 1000);
        
        this.hintsUsed++;
        this.updateUI();
        
        // Check for win condition
        if (this.checkWinCondition()) {
            this.handleGameWin();
        }
    }

    validatePuzzle() {
        let isValid = true;
        let conflicts = 0;
        
        // Clear existing conflicts
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('conflict');
        });
        
        // Check each filled cell
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.grid[row][col];
                if (value !== 0 && !this.isValidMove(row, col, value)) {
                    this.getCellElement(row, col).classList.add('conflict');
                    isValid = false;
                    conflicts++;
                }
            }
        }
        
        // Show validation result
        if (isValid) {
            this.showMessage('✅ No conflicts found!', 'success');
        } else {
            this.showMessage(`❌ Found ${conflicts} conflict${conflicts > 1 ? 's' : ''}`, 'error');
        }
    }

    solvePuzzle() {
        if (!this.gameActive) return;
        
        // Copy current grid and solve it
        const gridCopy = this.grid.map(row => [...row]);
        
        if (this.solveSudoku(gridCopy)) {
            this.grid = gridCopy;
            this.renderGrid();
            this.handleGameWin();
        } else {
            this.showMessage('❌ No solution found!', 'error');
        }
    }

    clearPuzzle() {
        // Clear only user-filled cells
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.initialGrid[row][col] === 0) {
                    this.grid[row][col] = 0;
                    this.updateCellDisplay(row, col);
                }
            }
        }
        
        // Clear conflicts
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('conflict');
        });
        
        this.updateUI();
    }

    checkWinCondition() {
        // Check if grid is completely filled
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Check if solution is valid
        return this.isValidSolution();
    }

    isValidSolution() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.grid[row][col];
                if (!this.isValidMove(row, col, value)) {
                    return false;
                }
            }
        }
        return true;
    }

    handleGameWin() {
        this.gameActive = false;
        this.stopTimer();
        
        // Update statistics
        this.updateStatistics();
        
        // Show success animation
        this.showSuccessOverlay();
    }

    updateStatistics() {
        const completionTime = this.getElapsedTime();
        
        this.stats.gamesPlayed++;
        this.stats.gamesWon++;
        this.stats.totalTime += completionTime;
        
        // Update best time for difficulty
        const difficultyKey = `bestTime_${this.settings.difficulty}`;
        if (!this.stats[difficultyKey] || completionTime < this.stats[difficultyKey]) {
            this.stats[difficultyKey] = completionTime;
        }
        
        this.saveStats();
        
        // Update main app statistics (used by index.html)
        this.updateMainAppStats(completionTime);
    }

    updateMainAppStats(timeInSeconds) {
        try {
            // Load or create main app stats
            let mainAppStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
            
            // Initialize if needed
            if (!mainAppStats.totalGamesPlayed) {
                mainAppStats = {
                    totalGamesPlayed: 0,
                    totalGamesCompleted: 0,
                    totalTimePlayed: 0,
                    bestTimes: {},
                    bestMoves: {},
                    achievements: [],
                    streaks: { current: 0, longest: 0 }
                };
            }
            
            mainAppStats.totalGamesPlayed++;
            mainAppStats.totalGamesCompleted++;
            mainAppStats.totalTimePlayed += timeInSeconds;
            
            // Update best time for sudoku
            const gameKey = 'sudoku';
            if (!mainAppStats.bestTimes[gameKey] || timeInSeconds < mainAppStats.bestTimes[gameKey]) {
                mainAppStats.bestTimes[gameKey] = timeInSeconds;
            }
            
            // Update streak
            mainAppStats.streaks.current++;
            if (mainAppStats.streaks.current > mainAppStats.streaks.longest) {
                mainAppStats.streaks.longest = mainAppStats.streaks.current;
            }
            
            localStorage.setItem('puzzleStats', JSON.stringify(mainAppStats));
        } catch (error) {
            console.warn('Failed to update main app statistics:', error);
        }
    }

    showSuccessOverlay() {
        const completionTime = this.formatTime(this.getElapsedTime());
        const completionStats = document.getElementById('completion-stats');
        
        if (completionStats) {
            completionStats.textContent = `Completed in ${completionTime} with ${this.hintsUsed} hints`;
        }
        
        this.successAnimation.style.display = 'block';
        this.boardOverlay.style.display = 'flex';
        
        setTimeout(() => {
            this.boardOverlay.style.display = 'none';
            this.successAnimation.style.display = 'none';
        }, 3000);
    }

    startTimer() {
        if (!this.settings.timerEnabled) return;
        
        this.startTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    updateTimer() {
        if (this.timeElement) {
            const elapsed = this.getElapsedTime();
            this.timeElement.textContent = this.formatTime(elapsed);
        }
    }

    getElapsedTime() {
        return this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateUI() {
        // Update stats
        if (this.filledElement) {
            const filled = this.grid.flat().filter(cell => cell !== 0).length;
            this.filledElement.textContent = `${filled}/81`;
        }
        
        if (this.hintsElement) {
            this.hintsElement.textContent = this.hintsUsed.toString();
        }
        
        if (this.bestTimeElement) {
            const difficultyKey = `bestTime_${this.settings.difficulty}`;
            const bestTime = this.stats[difficultyKey];
            this.bestTimeElement.textContent = bestTime ? this.formatTime(bestTime) : '—';
        }
        
        // Update current difficulty display
        const currentDifficultyEl = document.getElementById('current-difficulty');
        if (currentDifficultyEl) {
            const difficultyNames = {
                'easy': 'Easy',
                'medium': 'Medium', 
                'hard': 'Hard',
                'expert': 'Expert'
            };
            currentDifficultyEl.textContent = difficultyNames[this.settings.difficulty] || this.settings.difficulty;
        }
        
        // Update settings modal stats
        this.updateSettingsStats();
    }

    updateSettingsStats() {
        const elements = {
            'games-played': this.stats.gamesPlayed,
            'games-won': this.stats.gamesWon,
            'win-rate': this.stats.gamesPlayed > 0 ? 
                Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) + '%' : '0%',
            'avg-time': this.stats.gamesWon > 0 ? 
                this.formatTime(Math.round(this.stats.totalTime / this.stats.gamesWon)) : '—'
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(e) {
        const modal = e.target.closest('.modal-overlay');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveGameSettings() {
        // Collect settings from UI
        const highlightConflicts = document.getElementById('highlight-conflicts');
        if (highlightConflicts) this.settings.highlightConflicts = highlightConflicts.checked;
        
        const showCandidates = document.getElementById('show-candidates');
        if (showCandidates) this.settings.showCandidates = showCandidates.checked;
        
        const highlightRelated = document.getElementById('highlight-related');
        if (highlightRelated) this.settings.highlightRelated = highlightRelated.checked;
        
        const autoValidate = document.getElementById('auto-validate');
        if (autoValidate) this.settings.autoValidate = autoValidate.checked;
        
        const timerEnabled = document.getElementById('timer-enabled');
        if (timerEnabled) this.settings.timerEnabled = timerEnabled.checked;
        
        this.saveSettings();
        this.closeModal({ target: document.getElementById('settings-modal') });
        
        this.showMessage('Settings saved!', 'success');
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('sudoku_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
        
        // Apply settings to UI
        const elements = {
            'difficulty-level': this.settings.difficulty,
            'pattern-type': this.settings.generationPattern,
            'highlight-conflicts': this.settings.highlightConflicts,
            'show-candidates': this.settings.showCandidates,
            'highlight-related': this.settings.highlightRelated,
            'auto-validate': this.settings.autoValidate,
            'timer-enabled': this.settings.timerEnabled
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    saveSettings() {
        try {
            localStorage.setItem('sudoku_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    loadStats() {
        try {
            const saved = localStorage.getItem('sudoku_stats');
            return saved ? JSON.parse(saved) : {
                gamesPlayed: 0,
                gamesWon: 0,
                totalTime: 0
            };
        } catch (e) {
            console.warn('Could not load stats:', e);
            return { gamesPlayed: 0, gamesWon: 0, totalTime: 0 };
        }
    }

    saveStats() {
        try {
            localStorage.setItem('sudoku_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Could not save stats:', e);
        }
    }

    resetStatistics() {
        if (confirm('Are you sure you want to reset all statistics?')) {
            this.stats = { gamesPlayed: 0, gamesWon: 0, totalTime: 0 };
            this.saveStats();
            this.updateSettingsStats();
            this.updateUI();
            this.showMessage('Statistics reset!', 'success');
        }
    }

    showMessage(message, type = 'info') {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 
                         type === 'error' ? 'var(--danger-color)' : 'var(--info-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 2000);
    }
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SudokuGame;
}