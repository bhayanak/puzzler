// Lights Out Game Implementation
class LightsOutGame {
    constructor() {
        // Check if we have essential elements before initializing
        if (!document.getElementById('lights-grid')) {
            console.warn('Lights Out game elements not found. Skipping initialization.');
            return;
        }
        
        this.gameBoard = null;
        this.lights = [];
        this.moves = 0;
        this.gameActive = false;
        this.gameTimer = null;
        this.startTime = null;
        this.settings = this.loadSettings();
        this.patterns = this.initializePatterns();
        this.currentPattern = 'random';
        
        this.bindEvents();
        this.initializeGame();
    }

    // Game Initialization
    initializeGame() {
        this.setupUI();
        this.setupBoard();
        this.updateUI();
        // Start the game after initialization
        this.startGame();
    }

    setupUI() {
        // Load game settings from localStorage
        const savedSettings = this.loadSettings();
        
        // Apply settings to UI - with null checks (matching HTML IDs)
        const gridSizeEl = document.getElementById('grid-size');
        if (gridSizeEl) gridSizeEl.value = savedSettings.gridSize;
        
        const lightThemeEl = document.getElementById('light-theme');
        if (lightThemeEl) lightThemeEl.value = savedSettings.theme;
        
        const animationSpeedEl = document.getElementById('animation-speed');
        if (animationSpeedEl) animationSpeedEl.value = savedSettings.animationSpeed;
        
        // Update theme
        this.updateTheme();
        this.updateAnimationSpeed();
        
        // Initialize pattern selector
        this.updatePatternSelector();
    }

    setupBoard() {
        const size = parseInt(this.settings.gridSize);
        this.gameBoard = document.getElementById('lights-grid');
        
        // Initialize lights array first (fallback for missing DOM)
        this.lights = Array(size).fill().map(() => Array(size).fill(false));
        
        // Check if game board exists
        if (!this.gameBoard) {
            console.warn('Game board element not found. Make sure you are on the lights-out.html page.');
            return;
        }
        
        // Clear existing board
        this.gameBoard.innerHTML = '';
        
        // Set grid class for styling
        this.gameBoard.className = `lights-grid size-${size} theme-${this.settings.theme} speed-${this.settings.animationSpeed}`;
        
        // Create light cells
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const lightCell = document.createElement('div');
                lightCell.className = 'light-cell off';
                lightCell.dataset.row = row;
                lightCell.dataset.col = col;
                
                lightCell.addEventListener('click', (e) => this.handleLightClick(e));
                lightCell.addEventListener('mouseenter', (e) => this.showPreview(e));
                lightCell.addEventListener('mouseleave', () => this.hidePreview());
                
                // Add touch support for mobile devices
                lightCell.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // Prevent ghost clicks
                    this.showPreview(e);
                });
                lightCell.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.hidePreview();
                    this.handleLightClick(e);
                });

                this.gameBoard.appendChild(lightCell);
            }
        }
        
        // Apply initial pattern
        this.applyPattern(this.currentPattern);
        // Ensure at least one light is on for playability
        if (this.lights.flat().every(light => !light)) {
            // If all lights are off, turn on the center light
            const center = Math.floor(size / 2);
            this.lights[center][center] = true;
            this.updateLightCell(center, center);
        }
        // Ensure at least one light is on for playability
        if (this.lights.flat().every(light => !light)) {
            // If all lights are off, turn on the center light
            const center = Math.floor(size / 2);
            this.lights[center][center] = true;
            this.updateLightCell(center, center);
        }
    }

    bindEvents() {
        // Game controls - with null checks (matching HTML IDs)
        // Controls (all kebab-case IDs)
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) newGameBtn.addEventListener('click', () => this.newGame());

        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetGame());

        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) hintBtn.addEventListener('click', () => this.showHint());

        const solveBtn = document.getElementById('solve-btn');
        if (solveBtn) solveBtn.addEventListener('click', () => this.autoSolve());

        // Settings
        const gridSize = document.getElementById('grid-size');
        if (gridSize) gridSize.addEventListener('change', (e) => this.changeGridSize(e.target.value));

        const lightTheme = document.getElementById('light-theme');
        if (lightTheme) lightTheme.addEventListener('change', (e) => this.changeTheme(e.target.value));

        const animationSpeed = document.getElementById('animation-speed');
        if (animationSpeed) animationSpeed.addEventListener('change', (e) => this.changeAnimationSpeed(e.target.value));

        const patternSelect = document.getElementById('pattern-type');
        if (patternSelect) patternSelect.addEventListener('change', (e) => this.selectPattern(e.target.value));

        // Modals
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) helpBtn.addEventListener('click', () => this.showModal('help-modal'));

        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.showModal('settings-modal'));

        const designBtn = document.getElementById('design-btn');
        if (designBtn) designBtn.addEventListener('click', () => this.showModal('design-modal'));

        // Modal close buttons
        document.querySelectorAll('.modal-close, [data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e));
        });

        // Design modal
        const applyDesign = document.getElementById('apply-design');
        if (applyDesign) applyDesign.addEventListener('click', () => this.applyCustomDesign());

        const clearDesign = document.getElementById('clear-design');
        if (clearDesign) clearDesign.addEventListener('click', () => this.clearDesignGrid());

        const randomizeDesign = document.getElementById('randomize-design');
        if (randomizeDesign) randomizeDesign.addEventListener('click', () => this.randomizeDesignGrid());

        // Settings modal
        const saveSettings = document.getElementById('save-settings');
        if (saveSettings) saveSettings.addEventListener('click', () => this.saveGameSettings());

        const resetStats = document.getElementById('reset-stats');
        if (resetStats) resetStats.addEventListener('click', () => this.resetStatistics());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // Game Logic
    handleLightClick(event) {
        console.log('🔥 Light clicked!', event.target.dataset);
        if (!this.gameActive) {
            console.log('⚠️ Game not active yet');
            return;
        }
        
        // Get the target element - might be different on touch vs click
        let target = event.target;
        if (!target.dataset.row) {
            // If clicked element doesn't have data attributes, find the light cell
            target = target.closest('[data-row][data-col]');
        }

        if (!target || !target.dataset.row) {
            console.warn('⚠️ Could not find light cell data');
            return;
        }

        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);
        console.log('📍 Toggling light at:', row, col);
        
        // Prevent multiple rapid clicks/touches
        if (this._processing) {
            return;
        }
        this._processing = true;

        this.makeMove(row, col);

        // Clear processing flag after animation
        setTimeout(() => {
            this._processing = false;
        }, 100);
    }

    makeMove(row, col) {
        const size = this.lights.length;
        
        // Toggle clicked light and adjacent lights (cross pattern)
        const positions = [
            [row, col],           // Center
            [row - 1, col],       // Up
            [row + 1, col],       // Down
            [row, col - 1],       // Left
            [row, col + 1]        // Right
        ];

        positions.forEach(([r, c]) => {
            if (r >= 0 && r < size && c >= 0 && c < size) {
                this.lights[r][c] = !this.lights[r][c];
                this.updateLightCell(r, c);
            }
        });

        this.moves++;
        this.updateUI();
        
        // Check for win condition
        if (this.checkWinCondition()) {
            this.handleGameWin();
        }
    }

    updateLightCell(row, col) {
        const cell = this.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.className = `light-cell ${this.lights[row][col] ? 'on' : 'off'}`;
        }
    }

    showPreview(event) {
        if (!this.gameActive) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const size = this.lights.length;
        
        // Show preview of affected lights
        const positions = [
            [row, col],           // Center
            [row - 1, col],       // Up
            [row + 1, col],       // Down
            [row, col - 1],       // Left
            [row, col + 1]        // Right
        ];

        positions.forEach(([r, c]) => {
            if (r >= 0 && r < size && c >= 0 && c < size) {
                const cell = this.gameBoard.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    const currentState = this.lights[r][c];
                    cell.classList.add(currentState ? 'preview-off' : 'preview-on');
                }
            }
        });
    }

    hidePreview() {
        document.querySelectorAll('.light-cell').forEach(cell => {
            cell.classList.remove('preview-on', 'preview-off');
        });
    }

    checkWinCondition() {
        // Win condition: All lights are off
        return this.lights.every(row => row.every(light => !light));
    }

    handleGameWin() {
        console.log('🎉 Game won! All lights are out!');
        this.gameActive = false;
        this.stopTimer();
        
        // Update statistics
        this.updateStatistics();
        
        // Show success message
        this.showGameWinMessage();

        // Show success animation
        this.showSuccessOverlay();
        
        // Play win sound (if enabled)
        this.playWinSound();
    }

    showGameWinMessage() {
        const time = this.getElapsedTime();
        const message = `🎉 Congratulations! You've turned off all the lights!\n\n⏱️ Time: ${this.formatTime(time)}\n🎯 Moves: ${this.moves}\n\nWell done!`;

        // Success overlay will handle the display now
        // No need for alert popup

        // Try to show in a modal if it exists
        const modalTitle = document.getElementById('footer-modal-title');
        const modalBody = document.getElementById('footer-modal-body');
        const modal = document.getElementById('footer-modal');

        if (modalTitle && modalBody && modal) {
            modalTitle.textContent = 'Game Complete!';
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <h3>Congratulations!</h3>
                    <p>You've successfully turned off all the lights!</p>
                    <div style="margin: 1.5rem 0;">
                        <div><strong>⏱️ Time:</strong> ${this.formatTime(time)}</div>
                        <div><strong>🎯 Moves:</strong> ${this.moves}</div>
                    </div>
                    <p>Well done!</p>
                </div>
            `;
            modal.classList.add('show');
        }
    }

    // Game Control Methods
    newGame() {
        this.resetGame();
        this.applyPattern(this.currentPattern);
        this.startGame();
    }

    resetGame() {
        this.gameActive = false;
        this.moves = 0;
        this.stopTimer();
        
        // Clear all lights (set to OFF state)
        const size = this.lights.length;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                this.lights[row][col] = false;
                this.updateLightCell(row, col);
            }
        }
        
        this.hideSuccessOverlay();
        this.updateUI();
    }

    startGame() {
        this.gameActive = true;
        this.moves = 0;
        this.startTime = Date.now();
        this.startTimer();
        this.updateUI();
    }

    // Pattern System
    initializePatterns() {
        return {
            'random': {
                name: 'Random Pattern',
                description: 'Completely random configuration',
                generate: (size) => this.generateRandomPattern(size)
            },
            'cross': {
                name: 'Cross Pattern',
                description: 'Cross shape in center',
                generate: (size) => this.generateCrossPattern(size)
            },
            'corners': {
                name: 'Four Corners',
                description: 'Lights in corners only',
                generate: (size) => this.generateCornersPattern(size)
            },
            'border': {
                name: 'Border Pattern',
                description: 'Lights around the border',
                generate: (size) => this.generateBorderPattern(size)
            },
            'checkerboard': {
                name: 'Checkerboard',
                description: 'Alternating pattern',
                generate: (size) => this.generateCheckerboardPattern(size)
            },
            'diamond': {
                name: 'Diamond Shape',
                description: 'Diamond pattern in center',
                generate: (size) => this.generateDiamondPattern(size)
            },
            'spiral': {
                name: 'Spiral Pattern',
                description: 'Spiral from center outward',
                generate: (size) => this.generateSpiralPattern(size)
            }
        };
    }

    generateRandomPattern(size) {
        const pattern = Array(size).fill().map(() => Array(size).fill(false));
        const lightCount = Math.floor(size * size * 0.3) + Math.floor(Math.random() * size);
        
        for (let i = 0; i < lightCount; i++) {
            let row, col;
            do {
                row = Math.floor(Math.random() * size);
                col = Math.floor(Math.random() * size);
            } while (pattern[row][col]);
            
            pattern[row][col] = true;
        }
        
        return pattern;
    }

    generateCrossPattern(size) {
        const pattern = Array(size).fill().map(() => Array(size).fill(false));
        const center = Math.floor(size / 2);
        
        // Horizontal line
        for (let col = 0; col < size; col++) {
            pattern[center][col] = true;
        }
        
        // Vertical line
        for (let row = 0; row < size; row++) {
            pattern[row][center] = true;
        }
        
        return pattern;
    }

    generateCornersPattern(size) {
        const pattern = Array(size).fill().map(() => Array(size).fill(false));
        pattern[0][0] = true;
        pattern[0][size - 1] = true;
        pattern[size - 1][0] = true;
        pattern[size - 1][size - 1] = true;
        return pattern;
    }

    generateBorderPattern(size) {
        const pattern = Array(size).fill().map(() => Array(size).fill(false));
        
        for (let i = 0; i < size; i++) {
            pattern[0][i] = true;        // Top
            pattern[size - 1][i] = true; // Bottom
            pattern[i][0] = true;        // Left
            pattern[i][size - 1] = true; // Right
        }
        
        return pattern;
    }

    generateCheckerboardPattern(size) {
        const pattern = Array(size).fill().map(() => Array(size).fill(false));
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                pattern[row][col] = (row + col) % 2 === 0;
            }
        }
        
        return pattern;
    }

    generateDiamondPattern(size) {
        const pattern = Array(size).fill().map(() => Array(size).fill(false));
        const center = Math.floor(size / 2);
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const distance = Math.abs(row - center) + Math.abs(col - center);
                if (distance === Math.floor(size / 4) || distance === Math.floor(size / 2)) {
                    pattern[row][col] = true;
                }
            }
        }
        
        return pattern;
    }

    generateSpiralPattern(size) {
        const pattern = Array(size).fill().map(() => Array(size).fill(false));
        let row = Math.floor(size / 2);
        let col = Math.floor(size / 2);
        let direction = 0; // 0: right, 1: down, 2: left, 3: up
        let steps = 1;
        
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        
        pattern[row][col] = true;
        
        for (let i = 0; i < Math.floor(size * size / 3); i++) {
            for (let j = 0; j < 2; j++) {
                for (let k = 0; k < steps; k++) {
                    row += directions[direction][0];
                    col += directions[direction][1];
                    
                    if (row >= 0 && row < size && col >= 0 && col < size) {
                        pattern[row][col] = true;
                    }
                }
                direction = (direction + 1) % 4;
            }
            steps++;
        }
        
        return pattern;
    }

    applyPattern(patternName) {
        if (!this.patterns[patternName]) {
            patternName = 'random';
        }
        
        this.currentPattern = patternName;
        const size = this.lights.length;
        const pattern = this.patterns[patternName].generate(size);
        
        console.log('🎨 Applying pattern:', patternName, pattern);
        
        // Apply pattern to game board
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                this.lights[row][col] = pattern[row][col];
                this.updateLightCell(row, col);
            }
        }
        
        console.log('💡 Current lights state:', this.lights);
        this.updateUI();
    }

    selectPattern(patternName) {
        this.currentPattern = patternName;
        if (patternName === 'custom') {
            this.showModal('designModal');
            this.setupDesignGrid();
        } else {
            this.applyPattern(patternName);
        }
    }

    // Timer System
    startTimer() {
        this.startTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.updateTimer();
        }, 100);
    }

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    updateTimer() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        const gameTimeEl = document.getElementById('game-time');
        if (gameTimeEl) {
            gameTimeEl.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    getElapsedTime() {
        return this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    }

    // AI Solver & Hints
    showHint() {
        const solution = this.solvePuzzle();
        if (solution && solution.length > 0) {
            const nextMove = solution[0];
            const cell = this.gameBoard.querySelector(`[data-row="${nextMove.row}"][data-col="${nextMove.col}"]`);
            
            if (cell) {
                cell.classList.add('hint-cell');
                setTimeout(() => {
                    cell.classList.remove('hint-cell');
                }, 3000);
            }
        }
    }

    autoSolve() {
        if (!this.gameActive) return;
        
        const solution = this.solvePuzzle();
        if (!solution || solution.length === 0) {
            alert('No solution found for current configuration.');
            return;
        }
        
        this.gameBoard.classList.add('auto-solving');
        this.gameActive = false;
        
        let moveIndex = 0;
        const executeMoves = () => {
            if (moveIndex < solution.length) {
                const move = solution[moveIndex];
                const cell = this.gameBoard.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
                
                if (cell) {
                    cell.classList.add('solving-move');
                    setTimeout(() => {
                        cell.classList.remove('solving-move');
                        this.makeMove(move.row, move.col);
                        moveIndex++;
                        setTimeout(executeMoves, 600);
                    }, 300);
                }
            } else {
                this.gameBoard.classList.remove('auto-solving');
                this.gameActive = true;
            }
        };
        
        setTimeout(executeMoves, 1000);
    }

    solvePuzzle() {
        // Gaussian elimination solver for Lights Out
        const size = this.lights.length;
        const n = size * size;
        
        // Create augmented matrix for the system of linear equations
        const matrix = [];
        
        // Each row represents the equation for one cell
        for (let i = 0; i < n; i++) {
            const row = Array(n + 1).fill(0);
            const cellRow = Math.floor(i / size);
            const cellCol = i % size;
            
            // Set coefficients for lights affected by this move
            const positions = [
                [cellRow, cellCol],           // Center
                [cellRow - 1, cellCol],       // Up
                [cellRow + 1, cellCol],       // Down
                [cellRow, cellCol - 1],       // Left
                [cellRow, cellCol + 1]        // Right
            ];

            positions.forEach(([r, c]) => {
                if (r >= 0 && r < size && c >= 0 && c < size) {
                    const index = r * size + c;
                    row[index] = 1;
                }
            });
            
            // Set the target state (we want all lights off, so target is current state)
            row[n] = this.lights[cellRow][cellCol] ? 1 : 0;
            matrix.push(row);
        }
        
        // Solve using Gaussian elimination in GF(2)
        const solution = this.gaussianEliminationGF2(matrix);
        
        if (!solution) return null;
        
        // Convert solution to move list
        const moves = [];
        for (let i = 0; i < n; i++) {
            if (solution[i] === 1) {
                const row = Math.floor(i / size);
                const col = i % size;
                moves.push({ row, col });
            }
        }
        
        return moves;
    }

    gaussianEliminationGF2(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length - 1;
        
        // Forward elimination
        for (let col = 0, row = 0; col < cols && row < rows; col++) {
            // Find pivot
            let pivotRow = -1;
            for (let i = row; i < rows; i++) {
                if (matrix[i][col] === 1) {
                    pivotRow = i;
                    break;
                }
            }
            
            if (pivotRow === -1) continue;
            
            // Swap rows if needed
            if (pivotRow !== row) {
                [matrix[row], matrix[pivotRow]] = [matrix[pivotRow], matrix[row]];
            }
            
            // Eliminate
            for (let i = 0; i < rows; i++) {
                if (i !== row && matrix[i][col] === 1) {
                    for (let j = 0; j < cols + 1; j++) {
                        matrix[i][j] ^= matrix[row][j];
                    }
                }
            }
            
            row++;
        }
        
        // Check for inconsistency
        for (let i = 0; i < rows; i++) {
            let allZero = true;
            for (let j = 0; j < cols; j++) {
                if (matrix[i][j] === 1) {
                    allZero = false;
                    break;
                }
            }
            if (allZero && matrix[i][cols] === 1) {
                return null; // Inconsistent system
            }
        }
        
        // Back substitution
        const solution = Array(cols).fill(0);
        for (let i = rows - 1; i >= 0; i--) {
            let pivotCol = -1;
            for (let j = 0; j < cols; j++) {
                if (matrix[i][j] === 1) {
                    pivotCol = j;
                    break;
                }
            }
            
            if (pivotCol !== -1) {
                solution[pivotCol] = matrix[i][cols];
                for (let j = pivotCol + 1; j < cols; j++) {
                    solution[pivotCol] ^= matrix[i][j] * solution[j];
                }
            }
        }
        
        return solution;
    }

    // UI Updates
    updateUI() {
        // Update moves counter
        const moveCountEl = document.getElementById('move-count');
        if (moveCountEl) moveCountEl.textContent = this.moves.toString();
        
        // Update lights on counter
        const lightsOn = this.lights.flat().filter(light => light).length;
        const lightsOnEl = document.getElementById('lights-on');
        if (lightsOnEl) lightsOnEl.textContent = lightsOn.toString();
        
        // Update pattern info
        const patternSelect = document.getElementById('pattern-type');
        const selectedPattern = this.patterns[this.currentPattern];
        if (patternSelect && selectedPattern) {
            patternSelect.value = this.currentPattern;
        }
        
        // Update statistics  
        const stats = this.loadStatistics();
        const currentDifficulty = this.settings.gridSize.toString();
        
        const gamesPlayedEl = document.getElementById('gamesPlayed');
        if (gamesPlayedEl) gamesPlayedEl.textContent = stats.gamesPlayed.toString();
        
        const gamesWonEl = document.getElementById('gamesWon');
        if (gamesWonEl) gamesWonEl.textContent = stats.gamesWon.toString();
        
        // Update best time for current difficulty
        const bestTimeEl = document.getElementById('best-time');
        if (bestTimeEl) {
            const difficultyBestTime = stats.bestTimesByDifficulty[currentDifficulty];
            bestTimeEl.textContent = difficultyBestTime !== Infinity ? 
                this.formatTime(difficultyBestTime) : '—';
        }
        
        // Update best moves for current difficulty
        const bestMovesEl = document.getElementById('best-moves');
        if (bestMovesEl) {
            const difficultyBestMoves = stats.bestMovesByDifficulty[currentDifficulty];
            bestMovesEl.textContent = difficultyBestMoves !== Infinity ? 
                difficultyBestMoves.toString() : '—';
        }
        
        // Update current difficulty display
        const currentDifficultyEl = document.getElementById('current-difficulty');
        if (currentDifficultyEl) {
            const difficultyNames = { '3': '3×3 Easy', '5': '5×5 Classic', '7': '7×7 Expert' };
            currentDifficultyEl.textContent = difficultyNames[currentDifficulty] || `${currentDifficulty}×${currentDifficulty}`;
        }
        
        const averageMovesEl = document.getElementById('averageMoves');
        if (averageMovesEl) averageMovesEl.textContent = stats.averageMoves.toFixed(1);
    }

    updatePatternSelector() {
        const select = document.getElementById('pattern-type');
        if (!select) return;
        
        select.innerHTML = '';
        
        // Add pattern options
        Object.entries(this.patterns).forEach(([key, pattern]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = pattern.name;
            select.appendChild(option);
        });
        
        // Add custom option
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = 'Custom Design';
        select.appendChild(customOption);
    }

    formatTime(seconds) {
        if (seconds === Infinity || seconds === 0) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    changeGridSize(size) {
        this.settings.gridSize = size;
        this.saveSettings();
        this.setupBoard();
        this.newGame();
    }

    changeTheme(theme) {
        this.settings.theme = theme;
        this.saveSettings();
        this.updateTheme();
    }

    changeAnimationSpeed(speed) {
        this.settings.animationSpeed = speed;
        this.saveSettings();
        this.updateAnimationSpeed();
    }

    updateTheme() {
        const gameBoard = this.gameBoard;
        if (gameBoard) {
            gameBoard.className = gameBoard.className.replace(/theme-\w+/g, '');
            gameBoard.classList.add(`theme-${this.settings.theme}`);
        }
    }

    updateAnimationSpeed() {
        const gameBoard = this.gameBoard;
        if (gameBoard) {
            gameBoard.className = gameBoard.className.replace(/speed-\w+/g, '');
            gameBoard.classList.add(`speed-${this.settings.animationSpeed}`);
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Special setup for design modal
            if (modalId === 'designModal') {
                this.setupDesignGrid();
            }
        }
    }

    closeModal(event) {
        const modal = event.target.closest('.modal-overlay');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Custom Design System
    setupDesignGrid() {
        const size = parseInt(this.settings.gridSize);
        const designGrid = document.getElementById('designGrid');
        
        designGrid.innerHTML = '';
        designGrid.className = `design-grid size-${size}`;
        
        this.designPattern = Array(size).fill().map(() => Array(size).fill(false));
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('div');
                cell.className = 'design-cell off';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => {
                    const r = parseInt(e.target.dataset.row);
                    const c = parseInt(e.target.dataset.col);
                    this.designPattern[r][c] = !this.designPattern[r][c];
                    e.target.className = `design-cell ${this.designPattern[r][c] ? 'on' : 'off'}`;
                    this.updateDesignInfo();
                });
                
                designGrid.appendChild(cell);
            }
        }
        
        this.updateDesignInfo();
    }

    updateDesignInfo() {
        const lightsOn = this.designPattern ? this.designPattern.flat().filter(light => light).length : 0;
        const total = this.designPattern ? this.designPattern.length * this.designPattern[0].length : 0;
        
        const designInfoEl = document.getElementById('designInfo');
        if (designInfoEl) {
            designInfoEl.innerHTML = `
                <strong>Lights On:</strong> ${lightsOn}/${total}<br>
                <strong>Pattern:</strong> ${lightsOn === 0 ? 'All Off' : lightsOn === total ? 'All On' : 'Mixed'}
            `;
        }
    }

    clearDesignGrid() {
        if (!this.designPattern) return;
        
        const size = this.designPattern.length;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                this.designPattern[row][col] = false;
                const cell = document.querySelector(`#designGrid [data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.className = 'design-cell off';
                }
            }
        }
        this.updateDesignInfo();
    }

    randomizeDesignGrid() {
        if (!this.designPattern) return;
        
        const size = this.designPattern.length;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                this.designPattern[row][col] = Math.random() < 0.3;
                const cell = document.querySelector(`#designGrid [data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.className = `design-cell ${this.designPattern[row][col] ? 'on' : 'off'}`;
                }
            }
        }
        this.updateDesignInfo();
    }

    applyCustomDesign() {
        if (!this.designPattern) return;
        
        // Apply design to main game board
        const size = this.lights.length;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                this.lights[row][col] = this.designPattern[row][col];
                this.updateLightCell(row, col);
            }
        }
        
        this.currentPattern = 'custom';
        this.closeModal({ target: document.getElementById('designModal') });
        this.updateUI();
    }

    // Success Overlay
    showSuccessOverlay() {
        // Add victory animation to the game board
        if (this.gameBoard) {
            this.gameBoard.classList.add('game-complete');

            // Animate all light cells
            const cells = this.gameBoard.querySelectorAll('.light-cell');
            cells.forEach((cell, index) => {
                setTimeout(() => {
                    cell.style.animation = 'victoryPulse 0.5s ease-in-out';
                }, index * 50);
            });
        }

        // Calculate game statistics
        const time = this.getElapsedTime();
        const timeFormatted = this.formatTime(time);
        const moves = this.moves;

        // Calculate efficiency (lower moves = higher efficiency)
        const optimalMoves = Math.ceil(this.settings.gridSize * this.settings.gridSize * 0.5); // Rough estimate
        const efficiency = Math.max(0, Math.min(100, Math.round((optimalMoves / moves) * 100)));
        const efficiencyDisplay = efficiency > 90 ? '⭐⭐⭐' : efficiency > 70 ? '⭐⭐' : efficiency > 50 ? '⭐' : 'OK';

        // Update success modal content
        const successTimeEl = document.getElementById('success-time');
        if (successTimeEl) successTimeEl.textContent = timeFormatted;

        const successMovesEl = document.getElementById('success-moves');
        if (successMovesEl) successMovesEl.textContent = moves.toString();

        const successEfficiencyEl = document.getElementById('success-efficiency');
        if (successEfficiencyEl) successEfficiencyEl.textContent = efficiencyDisplay;

        // Show the overlay
        const overlay = document.getElementById('board-overlay');
        if (overlay) {
            overlay.classList.add('show');
        }

        // Update statistics
        this.updateStatistics(time, moves);
    }

    hideSuccessOverlay() {
        const overlay = document.querySelector('.board-overlay');
        if (overlay) overlay.classList.remove('show');
    }

    // Statistics System
    loadStatistics() {
        const defaultStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            bestTime: Infinity,
            totalMoves: 0,
            averageMoves: 0,
            // Difficulty-specific best times and moves
            bestTimesByDifficulty: {
                '3': Infinity, // 3x3 (Easy)
                '5': Infinity, // 5x5 (Classic)  
                '7': Infinity  // 7x7 (Expert)
            },
            bestMovesByDifficulty: {
                '3': Infinity,
                '5': Infinity,
                '7': Infinity
            }
        };
        
        try {
            const saved = localStorage.getItem('lightsOut_statistics');
            return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
        } catch (error) {
            console.warn('Failed to load statistics:', error);
            return defaultStats;
        }
    }

    updateStatistics() {
        const stats = this.loadStatistics();
        const time = this.getElapsedTime();
        const currentDifficulty = this.settings.gridSize.toString();
        
        stats.gamesPlayed++;
        stats.gamesWon++;
        stats.totalMoves += this.moves;
        stats.averageMoves = stats.totalMoves / stats.gamesWon;
        
        // Update overall best time
        if (time < stats.bestTime) {
            stats.bestTime = time;
        }
        
        // Update difficulty-specific best times and moves
        if (time < stats.bestTimesByDifficulty[currentDifficulty]) {
            stats.bestTimesByDifficulty[currentDifficulty] = time;
        }
        
        if (this.moves < stats.bestMovesByDifficulty[currentDifficulty]) {
            stats.bestMovesByDifficulty[currentDifficulty] = this.moves;
        }
        
        this.saveStatistics(stats);
        
        // Update main app statistics (used by index.html)
        this.updateMainAppStats(time);
        
        this.updateUI();
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
            
            // Update best time for lights-out
            const gameKey = 'lights-out';
            if (!mainAppStats.bestTimes[gameKey] || timeInSeconds < mainAppStats.bestTimes[gameKey]) {
                mainAppStats.bestTimes[gameKey] = timeInSeconds;
            }
            
            // Update best moves for lights-out  
            if (!mainAppStats.bestMoves[gameKey] || this.moves < mainAppStats.bestMoves[gameKey]) {
                mainAppStats.bestMoves[gameKey] = this.moves;
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

    saveStatistics(stats) {
        try {
            localStorage.setItem('lightsOut_statistics', JSON.stringify(stats));
        } catch (error) {
            console.warn('Failed to save statistics:', error);
        }
    }

    resetStatistics() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            localStorage.removeItem('lightsOut_statistics');
            this.updateUI();
        }
    }

    // Settings System
    loadSettings() {
        const defaultSettings = {
            gridSize: '5',
            theme: 'classic',
            animationSpeed: 'normal',
            showHints: true,
            playSounds: true
        };
        
        try {
            const saved = localStorage.getItem('lightsOut_settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('lightsOut_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    saveGameSettings() {
        // Collect settings from modal - with null checks
        const showHintsEl = document.getElementById('showHints');
        if (showHintsEl) this.settings.showHints = showHintsEl.checked;
        
        const playSoundsEl = document.getElementById('playSounds');
        if (playSoundsEl) this.settings.playSounds = playSoundsEl.checked;
        
        this.saveSettings();
        
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            this.closeModal({ target: settingsModal });
        }
    }

    // Keyboard Controls
    handleKeyboard(event) {
        if (!this.gameActive) return;
        
        // Arrow key navigation with Space to toggle
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('light-cell')) {
            const row = parseInt(activeElement.dataset.row);
            const col = parseInt(activeElement.dataset.col);
            const size = this.lights.length;
            
            let newRow = row;
            let newCol = col;
            
            switch (event.key) {
                case 'ArrowUp':
                    newRow = Math.max(0, row - 1);
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    newRow = Math.min(size - 1, row + 1);
                    event.preventDefault();
                    break;
                case 'ArrowLeft':
                    newCol = Math.max(0, col - 1);
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                    newCol = Math.min(size - 1, col + 1);
                    event.preventDefault();
                    break;
                case ' ':
                case 'Enter':
                    this.makeMove(row, col);
                    event.preventDefault();
                    break;
            }
            
            if (newRow !== row || newCol !== col) {
                const newCell = this.gameBoard.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
                if (newCell) {
                    newCell.focus();
                }
            }
        }
        
        // Game shortcuts
        switch (event.key) {
            case 'n':
                if (event.ctrlKey || event.metaKey) {
                    this.newGame();
                    event.preventDefault();
                }
                break;
            case 'r':
                if (event.ctrlKey || event.metaKey) {
                    this.resetGame();
                    event.preventDefault();
                }
                break;
            case 'h':
                if (event.ctrlKey || event.metaKey) {
                    this.showHint();
                    event.preventDefault();
                }
                break;
            case 'Escape':
                // Close any open modals
                document.querySelectorAll('.modal-overlay').forEach(modal => {
                    if (modal.style.display === 'flex') {
                        modal.style.display = 'none';
                        document.body.style.overflow = '';
                    }
                });
                break;
        }
    }

    // Sound System
    playWinSound() {
        if (!this.settings.playSounds) return;
        
        // Create simple win sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('Could not play win sound:', error);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the lights-out game page
    if (document.getElementById('lights-grid')) {
        window.lightsOutGame = new LightsOutGame();
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LightsOutGame;
}