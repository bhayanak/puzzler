// Sokoban Game Implementation - Following PROJECT_PLAN.md Standards
class SokobanGame {
    constructor() {
        // ✅ MUST: Check for essential DOM elements before initializing
        if (!document.getElementById('sokoban-board')) {
            console.warn('Sokoban game elements not found. Skipping initialization.');
            return;
        }
        
        // ✅ MUST: Initialize all core properties
        this.gameBoard = null;
        this.gameActive = false;
        this.moves = 0;
        this.pushes = 0;
        this.currentLevel = 1;
        this.playerPosition = { x: 0, y: 0 };
        this.boxes = [];
        this.targets = [];
        this.walls = [];
        this.moveHistory = [];
        this.isInitialized = false;
        
        // Game settings with consistent property structure
        this.settings = this.loadSettings();
        this.levels = this.initializeLevels();
        
        // ✅ MUST: Bind events before initialization
        this.bindEvents();
        this.initializeGame();
    }

    // ✅ Required Core Methods (Non-negotiable)
    initializeGame() {
        if (this.isInitialized) {
            console.warn('Sokoban game already initialized');
            return;
        }
        
        this.isInitialized = true;
        this.setupUI();
        this.loadLevel(this.currentLevel);
        this.updateUI();
    }

    setupUI() {
        // Load game settings from localStorage
        const savedSettings = this.loadSettings();
        
        // Populate level selector with all available levels
        this.populateLevelSelector();
        
        // Apply settings to UI - with null checks
        const levelSelect = document.getElementById('level-select');
        if (levelSelect) levelSelect.value = this.currentLevel.toString();
        
        this.gameBoard = document.getElementById('sokoban-board');
        
        // Initialize UI elements
        this.updateUI();
    }

    // Populate level selector with all 30 levels organized by category
    populateLevelSelector() {
        const levelSelect = document.getElementById('level-select');
        if (!levelSelect) return;
        
        // Clear existing options
        levelSelect.innerHTML = '';
        
        let currentCategory = '';
        
        // Add all levels organized by category
        for (let i = 1; i <= 30; i++) {
            const level = this.levels[i];
            if (!level) continue;
            
            // Add category separator
            if (level.category !== currentCategory) {
                currentCategory = level.category;
                const separator = document.createElement('optgroup');
                separator.label = `${currentCategory} Levels`;
                levelSelect.appendChild(separator);
            }
            
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = `${i}. ${level.name}`;
            if (level.concept) {
                option.title = `${level.concept} - ${level.hint}`;
            }
            
            // Add to the last optgroup
            const lastOptgroup = levelSelect.lastElementChild;
            if (lastOptgroup && lastOptgroup.tagName === 'OPTGROUP') {
                lastOptgroup.appendChild(option);
            } else {
                levelSelect.appendChild(option);
            }
        }
    }

    // ✅ Touch Event Handling (MANDATORY)
    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Button controls
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', this.undoMove.bind(this));
            undoBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.undoMove();
            }, { passive: false });
        }
        
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', this.resetLevel.bind(this));
            resetBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.resetLevel();
            }, { passive: false });
        }
        
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.addEventListener('click', this.showHint.bind(this));
            hintBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showHint();
            }, { passive: false });
        }
        
        const nextLevelBtn = document.getElementById('next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', this.nextLevel.bind(this));
            nextLevelBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.nextLevel();
            }, { passive: false });
        }
        
        const levelSelect = document.getElementById('level-select');
        if (levelSelect) {
            levelSelect.addEventListener('change', this.handleLevelChange.bind(this));
        }
        
        // Touch gestures for movement (mobile support)
        if (this.gameBoard) {
            let touchStartX = 0;
            let touchStartY = 0;
            
            this.gameBoard.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
            }, { passive: false });
            
            this.gameBoard.addEventListener('touchend', (e) => {
                e.preventDefault();
                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;
                const minSwipeDistance = 30;
                
                if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        // Horizontal swipe
                        this.movePlayer(deltaX > 0 ? 1 : -1, 0);
                    } else {
                        // Vertical swipe
                        this.movePlayer(0, deltaY > 0 ? 1 : -1);
                    }
                }
            }, { passive: false });
        }
    }

    handleKeyPress(e) {
        if (!this.gameActive) return;
        
        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                e.preventDefault();
                this.movePlayer(0, -1);
                break;
            case 'arrowdown':
            case 's':
                e.preventDefault();
                this.movePlayer(0, 1);
                break;
            case 'arrowleft':
            case 'a':
                e.preventDefault();
                this.movePlayer(-1, 0);
                break;
            case 'arrowright':
            case 'd':
                e.preventDefault();
                this.movePlayer(1, 0);
                break;
            case 'u':
                e.preventDefault();
                this.undoMove();
                break;
            case 'r':
                e.preventDefault();
                this.resetLevel();
                break;
            case 'h':
                e.preventDefault();
                this.showHint();
                break;
            case 'n':
                e.preventDefault();
                this.nextLevel();
                break;
        }
    }

    handleLevelChange(e) {
        const newLevel = parseInt(e.target.value);
        this.currentLevel = newLevel;
        this.loadLevel(newLevel);
        this.saveSettings();
    }

    // Game Logic
    movePlayer(dx, dy) {
        if (!this.gameActive) return false;
        
        const newX = this.playerPosition.x + dx;
        const newY = this.playerPosition.y + dy;
        
        // Check if new position is within bounds and not a wall
        if (this.isWall(newX, newY)) return false;
        
        // Check if there's a box at the new position
        const boxIndex = this.findBoxAt(newX, newY);
        if (boxIndex !== -1) {
            // Try to push the box
            const pushX = newX + dx;
            const pushY = newY + dy;
            
            // Check if box can be pushed (not into wall or another box)
            if (this.isWall(pushX, pushY) || this.findBoxAt(pushX, pushY) !== -1) {
                return false; // Can't push box
            }
            
            // Save state for undo
            this.saveStateForUndo();
            
            // Move the box
            this.boxes[boxIndex].x = pushX;
            this.boxes[boxIndex].y = pushY;
            this.pushes++;
        } else {
            // Save state for undo (player movement only)
            this.saveStateForUndo();
        }
        
        // Move player
        this.playerPosition.x = newX;
        this.playerPosition.y = newY;
        this.moves++;
        
        this.updateUI();
        
        // Check for level completion
        if (this.isLevelComplete()) {
            this.endGame();
        }
        
        return true;
    }

    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
    }

    isBox(x, y) {
        return this.findBoxAt(x, y) !== -1;
    }

    findBoxAt(x, y) {
        return this.boxes.findIndex(box => box.x === x && box.y === y);
    }

    isLevelComplete() {
        // All boxes must be on target positions
        return this.boxes.every(box => 
            this.targets.some(target => target.x === box.x && target.y === box.y)
        );
    }

    saveStateForUndo() {
        const state = {
            playerPosition: { ...this.playerPosition },
            boxes: this.boxes.map(box => ({ ...box })),
            moves: this.moves,
            pushes: this.pushes
        };
        this.moveHistory.push(state);
        
        // Limit history to prevent memory issues
        if (this.moveHistory.length > 100) {
            this.moveHistory.shift();
        }
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const previousState = this.moveHistory.pop();
        this.playerPosition = previousState.playerPosition;
        this.boxes = previousState.boxes;
        this.moves = previousState.moves;
        this.pushes = previousState.pushes;
        
        this.updateUI();
    }

    // Level Management
    loadLevel(levelNumber) {
        if (!this.levels[levelNumber]) {
            console.error(`Level ${levelNumber} not found`);
            return;
        }
        
        const level = this.levels[levelNumber];
        
        // Reset game state
        this.moves = 0;
        this.pushes = 0;
        this.moveHistory = [];
        this.playerPosition = { ...level.player };
        this.boxes = level.boxes.map(box => ({ ...box }));
        this.targets = level.targets.map(target => ({ ...target }));
        this.walls = level.walls.map(wall => ({ ...wall }));
        this.gameActive = true;
        
        this.renderBoard();
        this.updateUI();
    }

    renderBoard() {
        if (!this.gameBoard) return;
        
        const level = this.levels[this.currentLevel];
        if (!level) return;
        
        // Clear board
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${level.width}, 40px)`;
        this.gameBoard.style.gridTemplateRows = `repeat(${level.height}, 40px)`;
        
        // Create grid
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'sokoban-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Determine cell content
                if (this.isWall(x, y)) {
                    cell.classList.add('wall');
                    cell.textContent = '🧱';
                } else {
                    const isTarget = this.targets.some(target => target.x === x && target.y === y);
                    const boxIndex = this.findBoxAt(x, y);
                    const isPlayer = this.playerPosition.x === x && this.playerPosition.y === y;
                    
                    if (isTarget) {
                        cell.classList.add('target');
                        if (boxIndex !== -1) {
                            cell.classList.add('box-on-target');
                            cell.textContent = '📦';
                        } else {
                            cell.textContent = '🎯';
                        }
                    } else if (boxIndex !== -1) {
                        cell.classList.add('box');
                        cell.textContent = '📦';
                    }
                    
                    if (isPlayer) {
                        cell.classList.add('player');
                        if (isTarget) {
                            cell.textContent = '🚶‍♂️🎯';
                        } else {
                            cell.textContent = '🚶‍♂️';
                        }
                    }
                }
                
                this.gameBoard.appendChild(cell);
            }
        }
    }

    // ✅ Required UI update method
    updateUI() {
        // Update counters
        const moveCounter = document.getElementById('move-counter');
        if (moveCounter) moveCounter.textContent = this.moves.toString();
        
        const pushCounter = document.getElementById('push-counter');
        if (pushCounter) pushCounter.textContent = this.pushes.toString();
        
        const currentLevelEl = document.getElementById('current-level');
        if (currentLevelEl) currentLevelEl.textContent = this.currentLevel.toString();
        
        // Update button states
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.disabled = this.moveHistory.length === 0;
        
        const nextLevelBtn = document.getElementById('next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.disabled = this.currentLevel >= Object.keys(this.levels).length;
        }
        
        this.renderBoard();
    }

    startGame() {
        this.gameActive = true;
        this.loadLevel(this.currentLevel);
    }

    endGame() {
        this.gameActive = false;
        this.updateStatistics(this.moves, this.pushes);
        this.showSuccessOverlay();
    }

    resetLevel() {
        this.loadLevel(this.currentLevel);
    }

    nextLevel() {
        if (this.currentLevel < Object.keys(this.levels).length) {
            this.currentLevel++;
            const levelSelect = document.getElementById('level-select');
            if (levelSelect) levelSelect.value = this.currentLevel.toString();
            this.loadLevel(this.currentLevel);
            this.saveSettings();
        }
    }

    // ✅ Success Overlay (following standards)
    showSuccessOverlay() {
        // Calculate statistics
        const moves = this.moves;
        const pushes = this.pushes;
        const level = this.levels[this.currentLevel];
        
        // Calculate efficiency rating
        const optimalMoves = level.optimalMoves || moves;
        const efficiency = Math.max(0, Math.min(100, Math.round((optimalMoves / moves) * 100)));
        const rating = efficiency >= 90 ? '⭐⭐⭐' : efficiency >= 70 ? '⭐⭐' : efficiency >= 50 ? '⭐' : 'OK';
        
        // Update success modal content
        const successMovesEl = document.getElementById('success-moves');
        if (successMovesEl) successMovesEl.textContent = moves.toString();
        
        const successPushesEl = document.getElementById('success-pushes');
        if (successPushesEl) successPushesEl.textContent = pushes.toString();
        
        const successRatingEl = document.getElementById('success-rating');
        if (successRatingEl) successRatingEl.textContent = rating;
        
        // Show the overlay
        const overlay = document.getElementById('board-overlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    hideSuccessOverlay() {
        const overlay = document.getElementById('board-overlay');
        if (overlay) overlay.classList.remove('show');
    }

    // ✅ Statistics System (following standards)
    loadStatistics() {
        const defaultStats = {
            gamesPlayed: 0,
            levelsCompleted: 0,
            totalMoves: 0,
            totalPushes: 0,
            averageMoves: 0,
            byLevel: {}
        };
        
        return JSON.parse(localStorage.getItem('sokobanStats') || JSON.stringify(defaultStats));
    }

    updateStatistics(moves, pushes) {
        const stats = this.loadStatistics();
        
        stats.gamesPlayed++;
        stats.totalMoves += moves;
        stats.totalPushes += pushes;
        stats.averageMoves = Math.round(stats.totalMoves / stats.gamesPlayed);
        
        // Level-specific stats
        if (!stats.byLevel[this.currentLevel]) {
            stats.byLevel[this.currentLevel] = {
                completions: 0,
                bestMoves: Infinity,
                bestPushes: Infinity
            };
            stats.levelsCompleted++;
        }
        
        const levelStats = stats.byLevel[this.currentLevel];
        levelStats.completions++;
        
        if (moves < levelStats.bestMoves) {
            levelStats.bestMoves = moves;
        }
        
        if (pushes < levelStats.bestPushes) {
            levelStats.bestPushes = pushes;
        }
        
        localStorage.setItem('sokobanStats', JSON.stringify(stats));
    }

    // Settings Management
    loadSettings() {
        const defaultSettings = {
            currentLevel: 1,
            soundEnabled: true,
            animationsEnabled: true
        };
        
        return JSON.parse(localStorage.getItem('sokobanSettings') || JSON.stringify(defaultSettings));
    }

    saveSettings() {
        const settings = {
            currentLevel: this.currentLevel,
            soundEnabled: this.settings?.soundEnabled || true,
            animationsEnabled: this.settings?.animationsEnabled || true
        };
        
        localStorage.setItem('sokobanSettings', JSON.stringify(settings));
        this.settings = settings;
    }

    // Enhanced Hint System
    showHint() {
        // Get level-specific hint
        const level = this.levels[this.currentLevel];
        if (level && level.hint) {
            this.showHintMessage(level.hint);
        }
        
        // Find next optimal move
        const nextMove = this.calculateNextOptimalMove();
        if (nextMove) {
            this.showMovementHint(nextMove);
        } else {
            // Fallback to box highlighting for complex situations
            this.showBoxHint();
        }
    }

    calculateNextOptimalMove() {
        // Find the most urgent box to move (closest to target, not blocked)
        const unsolvedBoxes = this.boxes.filter(box => 
            !this.targets.some(target => target.x === box.x && target.y === box.y)
        );
        
        if (unsolvedBoxes.length === 0) return null;
        
        // Find the box with shortest path to any target
        let bestMove = null;
        let shortestDistance = Infinity;
        
        for (const box of unsolvedBoxes) {
            // Find nearest target for this box
            for (const target of this.targets) {
                // Skip if target is already occupied by another box
                if (this.boxes.some(b => b !== box && b.x === target.x && b.y === target.y)) {
                    continue;
                }
                
                const distance = Math.abs(box.x - target.x) + Math.abs(box.y - target.y);
                if (distance < shortestDistance) {
                    // Calculate which direction to push the box
                    const direction = this.calculatePushDirection(box, target);
                    if (direction) {
                        shortestDistance = distance;
                        bestMove = {
                            box: box,
                            target: target,
                            direction: direction,
                            playerTarget: {
                                x: box.x - direction.dx,
                                y: box.y - direction.dy
                            }
                        };
                    }
                }
            }
        }
        
        return bestMove;
    }

    calculatePushDirection(box, target) {
        // Determine which direction to push the box toward the target
        const dx = target.x - box.x;
        const dy = target.y - box.y;
        
        // Prioritize the direction with larger distance
        if (Math.abs(dx) > Math.abs(dy)) {
            const direction = { dx: Math.sign(dx), dy: 0 };
            // Check if player can reach the push position
            const pushFromX = box.x - direction.dx;
            const pushFromY = box.y - direction.dy;
            if (!this.isWall(pushFromX, pushFromY) && !this.isBox(pushFromX, pushFromY)) {
                return direction;
            }
        } else if (dy !== 0) {
            const direction = { dx: 0, dy: Math.sign(dy) };
            const pushFromX = box.x - direction.dx;
            const pushFromY = box.y - direction.dy;
            if (!this.isWall(pushFromX, pushFromY) && !this.isBox(pushFromX, pushFromY)) {
                return direction;
            }
        }
        
        // Try the other direction if first choice doesn't work
        if (dy !== 0) {
            const direction = { dx: 0, dy: Math.sign(dy) };
            const pushFromX = box.x - direction.dx;
            const pushFromY = box.y - direction.dy;
            if (!this.isWall(pushFromX, pushFromY) && !this.isBox(pushFromX, pushFromY)) {
                return direction;
            }
        }
        
        return null;
    }

    showMovementHint(move) {
        // Clear any existing hints
        this.clearHints();
        
        // Highlight the box to move
        const boxCell = this.gameBoard.querySelector(`[data-x="${move.box.x}"][data-y="${move.box.y}"]`);
        if (boxCell) {
            boxCell.classList.add('hint-box');
        }
        
        // Highlight the target destination
        const targetCell = this.gameBoard.querySelector(`[data-x="${move.target.x}"][data-y="${move.target.y}"]`);
        if (targetCell) {
            targetCell.classList.add('hint-target');
        }
        
        // Show arrow indicating push direction
        const arrowCell = this.gameBoard.querySelector(`[data-x="${move.box.x}"][data-y="${move.box.y}"]`);
        if (arrowCell) {
            const arrow = this.getArrowForDirection(move.direction);
            arrowCell.setAttribute('data-hint-arrow', arrow);
            arrowCell.classList.add('hint-arrow');
        }
        
        // Highlight where player should go to push
        const playerTargetCell = this.gameBoard.querySelector(`[data-x="${move.playerTarget.x}"][data-y="${move.playerTarget.y}"]`);
        if (playerTargetCell) {
            playerTargetCell.classList.add('hint-player-target');
        }
        
        // Auto-clear hints after 5 seconds
        setTimeout(() => this.clearHints(), 5000);
    }

    getArrowForDirection(direction) {
        if (direction.dx === 1) return '→';
        if (direction.dx === -1) return '←';
        if (direction.dy === 1) return '↓';
        if (direction.dy === -1) return '↑';
        return '•';
    }

    showBoxHint() {
        // Fallback to simple box highlighting
        const unsolvedBoxes = this.boxes.filter(box => 
            !this.targets.some(target => target.x === box.x && target.y === box.y)
        );
        
        if (unsolvedBoxes.length > 0) {
            const nearestBox = unsolvedBoxes[0];
            const boxCell = this.gameBoard.querySelector(`[data-x="${nearestBox.x}"][data-y="${nearestBox.y}"]`);
            
            if (boxCell) {
                this.showVisualHint(boxCell);
            }
        }
    }

    clearHints() {
        // Remove all hint classes
        const hintElements = this.gameBoard.querySelectorAll('.hint-box, .hint-target, .hint-arrow, .hint-player-target, .hint-highlight');
        hintElements.forEach(el => {
            el.classList.remove('hint-box', 'hint-target', 'hint-arrow', 'hint-player-target', 'hint-highlight');
            el.removeAttribute('data-hint-arrow');
        });
    }

    showVisualHint(element, duration = 3000) {
        element.classList.add('hint-highlight');
        setTimeout(() => {
            element.classList.remove('hint-highlight');
        }, duration);
    }

    showHintMessage(message = null) {
        // Use provided message or level-specific hint, or fallback to generic hints
        let hintText = message;
        
        if (!hintText) {
            const level = this.levels[this.currentLevel];
            hintText = level?.hint || this.getGenericHint();
        }
        
        // Create or update hint display
        let hintDisplay = document.getElementById('hint-display');
        if (!hintDisplay) {
            hintDisplay = document.createElement('div');
            hintDisplay.id = 'hint-display';
            hintDisplay.className = 'hint-display';
            document.querySelector('.game-container').appendChild(hintDisplay);
        }
        
        hintDisplay.textContent = hintText;
        hintDisplay.classList.add('show');
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            hintDisplay.classList.remove('show');
        }, 4000);
    }

    getGenericHint() {
        const hints = [
            "Look for boxes that aren't on target positions yet",
            "Try to avoid pushing boxes into corners where they can't be moved",
            "Plan your moves - sometimes you need to move boxes out of the way first",
            "Focus on one box at a time",
            "Use the undo button if you get stuck"
        ];
        
        return hints[Math.floor(Math.random() * hints.length)];
    }

    // Level Definitions - 30 Levels with Gradual Progression
    initializeLevels() {
        return {
            // ===== BEGINNER LEVELS (1-8): Learning Basic Concepts =====
            1: {
                name: "First Push",
                category: "Beginner",
                concept: "Basic movement and pushing",
                width: 7,
                height: 5,
                player: { x: 1, y: 2 },
                boxes: [{ x: 3, y: 2 }],
                targets: [{ x: 5, y: 2 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
                    { x: 0, y: 1 }, { x: 6, y: 1 },
                    { x: 0, y: 2 }, { x: 6, y: 2 },
                    { x: 0, y: 3 }, { x: 6, y: 3 },
                    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }
                ],
                optimalMoves: 3,
                hint: "Walk into the box to push it onto the target spot"
            },
            2: {
                name: "Two Boxes",
                category: "Beginner",
                concept: "Multiple boxes, order matters",
                width: 8,
                height: 5,
                player: { x: 1, y: 2 },
                boxes: [{ x: 2, y: 2 }, { x: 4, y: 2 }],
                targets: [{ x: 5, y: 2 }, { x: 6, y: 2 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
                    { x: 0, y: 1 }, { x: 7, y: 1 },
                    { x: 0, y: 2 }, { x: 7, y: 2 },
                    { x: 0, y: 3 }, { x: 7, y: 3 },
                    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }
                ],
                optimalMoves: 4,
                hint: "Push the rightmost box first, then the left one"
            },
            3: {
                name: "L-Shape Room",
                category: "Beginner", 
                concept: "Navigation around obstacles",
                width: 7,
                height: 7,
                player: { x: 1, y: 5 },
                boxes: [{ x: 2, y: 4 }],
                targets: [{ x: 5, y: 1 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
                    { x: 0, y: 1 }, { x: 6, y: 1 },
                    { x: 0, y: 2 }, { x: 2, y: 2 }, { x: 6, y: 2 },
                    { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 6, y: 3 },
                    { x: 0, y: 4 }, { x: 6, y: 4 },
                    { x: 0, y: 5 }, { x: 6, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }
                ],
                optimalMoves: 9,
                hint: "Go around the wall to get behind the box"
            },
            4: {
                name: "Corner Wisdom",
                category: "Beginner",
                concept: "Avoiding corners - basic strategy",
                width: 6,
                height: 6,
                player: { x: 1, y: 4 },
                boxes: [{ x: 2, y: 3 }],
                targets: [{ x: 4, y: 2 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
                    { x: 0, y: 1 }, { x: 5, y: 1 },
                    { x: 0, y: 2 }, { x: 5, y: 2 },
                    { x: 0, y: 3 }, { x: 5, y: 3 },
                    { x: 0, y: 4 }, { x: 5, y: 4 },
                    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }
                ],
                optimalMoves: 6,
                hint: "Don't push the box into the corner - go around and push it right"
            },
            5: {
                name: "Two Targets",
                category: "Beginner",
                concept: "Multiple targets, planning moves",
                width: 8,
                height: 6,
                player: { x: 1, y: 3 },
                boxes: [{ x: 3, y: 2 }, { x: 3, y: 4 }],
                targets: [{ x: 6, y: 2 }, { x: 6, y: 4 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
                    { x: 0, y: 1 }, { x: 7, y: 1 },
                    { x: 0, y: 2 }, { x: 7, y: 2 },
                    { x: 0, y: 3 }, { x: 7, y: 3 },
                    { x: 0, y: 4 }, { x: 7, y: 4 },
                    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }
                ],
                optimalMoves: 8,
                hint: "Push both boxes straight to their targets"
            },
            6: {
                name: "Simple Sequence",
                category: "Beginner",
                concept: "Order of operations",
                width: 9,
                height: 5,
                player: { x: 1, y: 2 },
                boxes: [{ x: 3, y: 2 }, { x: 4, y: 2 }],
                targets: [{ x: 7, y: 1 }, { x: 7, y: 3 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
                    { x: 0, y: 1 }, { x: 8, y: 1 },
                    { x: 0, y: 2 }, { x: 5, y: 2 }, { x: 8, y: 2 },
                    { x: 0, y: 3 }, { x: 8, y: 3 },
                    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 }
                ],
                optimalMoves: 12,
                hint: "Move the right box up first, then the left box down"
            },
            7: {
                name: "Basic Repositioning",
                category: "Beginner",
                concept: "Moving boxes out of the way",
                width: 7,
                height: 7,
                player: { x: 1, y: 1 },
                boxes: [{ x: 2, y: 3 }, { x: 4, y: 3 }],
                targets: [{ x: 3, y: 5 }, { x: 5, y: 1 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
                    { x: 0, y: 1 }, { x: 6, y: 1 },
                    { x: 0, y: 2 }, { x: 6, y: 2 },
                    { x: 0, y: 3 }, { x: 6, y: 3 },
                    { x: 0, y: 4 }, { x: 6, y: 4 },
                    { x: 0, y: 5 }, { x: 6, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }
                ],
                optimalMoves: 14,
                hint: "Move one box temporarily to access the other"
            },
            8: {
                name: "T-Junction",
                category: "Beginner",
                concept: "Working in confined spaces",
                width: 9,
                height: 7,
                player: { x: 4, y: 5 },
                boxes: [{ x: 3, y: 4 }, { x: 5, y: 4 }],
                targets: [{ x: 2, y: 1 }, { x: 6, y: 1 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
                    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 },
                    { x: 0, y: 2 }, { x: 3, y: 2 }, { x: 5, y: 2 }, { x: 8, y: 2 },
                    { x: 0, y: 3 }, { x: 3, y: 3 }, { x: 5, y: 3 }, { x: 8, y: 3 },
                    { x: 0, y: 4 }, { x: 8, y: 4 },
                    { x: 0, y: 5 }, { x: 8, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }
                ],
                optimalMoves: 16,
                hint: "Push boxes up through the T-shaped corridor"
            },

            // ===== INTERMEDIATE LEVELS (9-16): Introducing Strategy =====
            9: {
                name: "First Real Challenge",
                category: "Intermediate",
                concept: "Thinking ahead",
                width: 8,
                height: 8,
                player: { x: 1, y: 6 },
                boxes: [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }],
                targets: [{ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 6, y: 2 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
                    { x: 0, y: 1 }, { x: 7, y: 1 },
                    { x: 0, y: 2 }, { x: 7, y: 2 },
                    { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
                    { x: 0, y: 4 }, { x: 7, y: 4 },
                    { x: 0, y: 5 }, { x: 7, y: 5 },
                    { x: 0, y: 6 }, { x: 7, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }
                ],
                optimalMoves: 18,
                hint: "Work on the middle box first to create space"
            },
            10: {
                name: "Box Rotation",
                category: "Intermediate",
                concept: "Rotating box positions",
                width: 6,
                height: 8,
                player: { x: 3, y: 6 },
                boxes: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
                targets: [{ x: 2, y: 1 }, { x: 3, y: 1 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
                    { x: 0, y: 1 }, { x: 5, y: 1 },
                    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
                    { x: 1, y: 3 }, { x: 4, y: 3 },
                    { x: 1, y: 4 }, { x: 4, y: 4 },
                    { x: 1, y: 5 }, { x: 4, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }
                ],
                optimalMoves: 22,
                hint: "Use the narrow corridor to reposition boxes"
            },
            11: {
                name: "Corridor Push",
                category: "Intermediate",
                concept: "Narrow passage navigation",
                width: 9,
                height: 5,
                player: { x: 1, y: 2 },
                boxes: [{ x: 4, y: 2 }],
                targets: [{ x: 7, y: 2 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
                    { x: 0, y: 1 }, { x: 3, y: 1 }, { x: 5, y: 1 }, { x: 8, y: 1 },
                    { x: 0, y: 2 }, { x: 8, y: 2 },
                    { x: 0, y: 3 }, { x: 3, y: 3 }, { x: 5, y: 3 }, { x: 8, y: 3 },
                    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 }
                ],
                optimalMoves: 4,
                hint: "Navigate through the narrow corridor to push the box to the target"
            },
            12: {
                name: "Two Paths",
                category: "Intermediate",
                concept: "Choosing the right path",
                width: 7,
                height: 7,
                player: { x: 3, y: 5 },
                boxes: [{ x: 2, y: 3 }, { x: 4, y: 3 }],
                targets: [{ x: 2, y: 1 }, { x: 4, y: 1 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
                    { x: 0, y: 1 }, { x: 6, y: 1 },
                    { x: 0, y: 2 }, { x: 6, y: 2 },
                    { x: 0, y: 3 }, { x: 3, y: 3 }, { x: 6, y: 3 },
                    { x: 0, y: 4 }, { x: 3, y: 4 }, { x: 6, y: 4 },
                    { x: 0, y: 5 }, { x: 6, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }
                ],
                optimalMoves: 10,
                hint: "Push each box up through its own corridor"
            },
            13: {
                name: "Box Shuffle",
                category: "Intermediate", 
                concept: "Repositioning boxes to solve",
                width: 7,
                height: 6,
                player: { x: 1, y: 1 },
                boxes: [{ x: 3, y: 2 }, { x: 4, y: 3 }],
                targets: [{ x: 5, y: 2 }, { x: 5, y: 3 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
                    { x: 0, y: 1 }, { x: 6, y: 1 },
                    { x: 0, y: 2 }, { x: 6, y: 2 },
                    { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 6, y: 3 },
                    { x: 0, y: 4 }, { x: 2, y: 4 }, { x: 6, y: 4 },
                    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }
                ],
                optimalMoves: 12,
                hint: "Move one box out of the way to get the other box positioned"
            },
            14: {
                name: "The Split Room",
                category: "Intermediate",
                concept: "Working with divided spaces",
                width: 8,
                height: 6,
                player: { x: 1, y: 4 },
                boxes: [{ x: 2, y: 4 }, { x: 5, y: 1 }],
                targets: [{ x: 6, y: 4 }, { x: 2, y: 1 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
                    { x: 0, y: 1 }, { x: 7, y: 1 },
                    { x: 0, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 7, y: 2 },
                    { x: 0, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 7, y: 3 },
                    { x: 0, y: 4 }, { x: 7, y: 4 },
                    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }
                ],
                optimalMoves: 15,
                hint: "Work on each room separately through the doorway"
            },
            15: {
                name: "Triple Challenge",
                category: "Intermediate",
                concept: "Managing three boxes",
                width: 7,
                height: 7,
                player: { x: 1, y: 1 },
                boxes: [{ x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 3 }],
                targets: [{ x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
                    { x: 0, y: 1 }, { x: 6, y: 1 },
                    { x: 0, y: 2 }, { x: 6, y: 2 },
                    { x: 0, y: 3 }, { x: 6, y: 3 },
                    { x: 0, y: 4 }, { x: 6, y: 4 },
                    { x: 0, y: 5 }, { x: 6, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }
                ],
                optimalMoves: 18,
                hint: "Work from inside out - move central boxes to the bottom row"
            },
            16: {
                name: "Cross Pattern",
                category: "Intermediate",
                concept: "Central hub navigation", 
                width: 9,
                height: 9,
                player: { x: 4, y: 4 },
                boxes: [{ x: 4, y: 2 }, { x: 2, y: 4 }, { x: 6, y: 4 }, { x: 4, y: 6 }],
                targets: [{ x: 2, y: 2 }, { x: 6, y: 2 }, { x: 2, y: 6 }, { x: 6, y: 6 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
                    { x: 0, y: 1 }, { x: 3, y: 1 }, { x: 5, y: 1 }, { x: 8, y: 1 },
                    { x: 0, y: 2 }, { x: 3, y: 2 }, { x: 5, y: 2 }, { x: 8, y: 2 },
                    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 },
                    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 },
                    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
                    { x: 0, y: 6 }, { x: 3, y: 6 }, { x: 5, y: 6 }, { x: 8, y: 6 },
                    { x: 0, y: 7 }, { x: 3, y: 7 }, { x: 5, y: 7 }, { x: 8, y: 7 },
                    { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }
                ],
                optimalMoves: 24,
                hint: "Push boxes from center to corners - work one at a time"
            },

            // ===== ADVANCED LEVELS (17-24): Strategic Complexity =====
            17: {
                name: "The Zigzag",
                category: "Advanced",
                concept: "Zigzag corridor navigation",
                width: 9,
                height: 7,
                player: { x: 1, y: 1 },
                boxes: [{ x: 2, y: 1 }, { x: 6, y: 5 }],
                targets: [{ x: 7, y: 1 }, { x: 7, y: 5 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
                    { x: 0, y: 1 }, { x: 8, y: 1 },
                    { x: 0, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 8, y: 2 },
                    { x: 0, y: 3 }, { x: 3, y: 3 }, { x: 8, y: 3 },
                    { x: 0, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 8, y: 4 },
                    { x: 0, y: 5 }, { x: 8, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }
                ],
                optimalMoves: 22,
                hint: "Navigate the zigzag path - watch for dead ends"
            },
            18: {
                name: "Four Corners",
                category: "Advanced", 
                concept: "Corner placement strategy",
                width: 8,
                height: 8,
                player: { x: 3, y: 3 },
                boxes: [{ x: 3, y: 2 }, { x: 4, y: 3 }, { x: 3, y: 4 }, { x: 2, y: 3 }],
                targets: [{ x: 1, y: 1 }, { x: 6, y: 1 }, { x: 1, y: 6 }, { x: 6, y: 6 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
                    { x: 0, y: 1 }, { x: 7, y: 1 },
                    { x: 0, y: 2 }, { x: 7, y: 2 },
                    { x: 0, y: 3 }, { x: 7, y: 3 },
                    { x: 0, y: 4 }, { x: 7, y: 4 },
                    { x: 0, y: 5 }, { x: 7, y: 5 },
                    { x: 0, y: 6 }, { x: 7, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }
                ],
                optimalMoves: 28,
                hint: "Move boxes from center to corners - plan your route carefully"
            },
            19: {
                name: "The Bottleneck",
                category: "Advanced",
                concept: "Narrow passage challenge",
                width: 10,
                height: 7,
                player: { x: 1, y: 3 },
                boxes: [{ x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }],
                targets: [{ x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 },
                    { x: 0, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 9, y: 1 },
                    { x: 0, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 9, y: 2 },
                    { x: 0, y: 3 }, { x: 9, y: 3 },
                    { x: 0, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 9, y: 4 },
                    { x: 0, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 9, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }
                ],
                optimalMoves: 32,
                hint: "Push boxes through the narrow bottleneck one at a time"
            },
            20: {
                name: "The Warehouse",
                category: "Advanced",
                concept: "Multiple chamber navigation",
                width: 11,
                height: 8,
                player: { x: 1, y: 6 },
                boxes: [{ x: 2, y: 6 }, { x: 5, y: 4 }, { x: 8, y: 2 }],
                targets: [{ x: 9, y: 1 }, { x: 9, y: 3 }, { x: 9, y: 5 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 },
                    { x: 0, y: 1 }, { x: 3, y: 1 }, { x: 10, y: 1 },
                    { x: 0, y: 2 }, { x: 3, y: 2 }, { x: 6, y: 2 }, { x: 10, y: 2 },
                    { x: 0, y: 3 }, { x: 3, y: 3 }, { x: 6, y: 3 }, { x: 10, y: 3 },
                    { x: 0, y: 4 }, { x: 3, y: 4 }, { x: 6, y: 4 }, { x: 10, y: 4 },
                    { x: 0, y: 5 }, { x: 3, y: 5 }, { x: 6, y: 5 }, { x: 10, y: 5 },
                    { x: 0, y: 6 }, { x: 3, y: 6 }, { x: 6, y: 6 }, { x: 10, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }
                ],
                optimalMoves: 38,
                hint: "Navigate through the warehouse chambers - start with the farthest box"
            },
            // ===== EXPERT LEVELS (21-30): Maximum Challenge =====
            21: {
                name: "The Spiral",
                category: "Expert",
                concept: "Spiral pattern navigation",
                width: 9,
                height: 9,
                player: { x: 4, y: 4 },
                boxes: [{ x: 3, y: 4 }, { x: 4, y: 3 }, { x: 5, y: 4 }],
                targets: [{ x: 2, y: 2 }, { x: 6, y: 2 }, { x: 4, y: 6 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
                    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 },
                    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 },
                    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 },
                    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 },
                    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 },
                    { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }
                ],
                optimalMoves: 36,
                hint: "Navigate the spiral path to position boxes at the target locations"
            },
            22: {
                name: "Double Chamber",
                category: "Expert",
                concept: "Complex two-room puzzle",
                width: 10,
                height: 8,
                player: { x: 1, y: 6 },
                boxes: [{ x: 2, y: 6 }, { x: 3, y: 6 }, { x: 6, y: 1 }, { x: 7, y: 1 }],
                targets: [{ x: 8, y: 6 }, { x: 8, y: 5 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 },
                    { x: 0, y: 1 }, { x: 9, y: 1 },
                    { x: 0, y: 2 }, { x: 9, y: 2 },
                    { x: 0, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 9, y: 3 },
                    { x: 0, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 9, y: 4 },
                    { x: 0, y: 5 }, { x: 9, y: 5 },
                    { x: 0, y: 6 }, { x: 9, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }
                ],
                optimalMoves: 42,
                hint: "Swap boxes between chambers - careful planning required"
            },
            23: {
                name: "The Maze",
                category: "Expert",
                concept: "Complex maze with multiple solutions",
                width: 11,
                height: 9,
                player: { x: 1, y: 7 },
                boxes: [{ x: 2, y: 7 }, { x: 5, y: 5 }, { x: 8, y: 3 }],
                targets: [{ x: 9, y: 1 }, { x: 9, y: 4 }, { x: 9, y: 7 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 },
                    { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 4, y: 1 }, { x: 6, y: 1 }, { x: 10, y: 1 },
                    { x: 0, y: 2 }, { x: 2, y: 2 }, { x: 4, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 10, y: 2 },
                    { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 10, y: 3 },
                    { x: 0, y: 4 }, { x: 2, y: 4 }, { x: 4, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 10, y: 4 },
                    { x: 0, y: 5 }, { x: 2, y: 5 }, { x: 4, y: 5 }, { x: 6, y: 5 }, { x: 10, y: 5 },
                    { x: 0, y: 6 }, { x: 2, y: 6 }, { x: 4, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 10, y: 6 },
                    { x: 0, y: 7 }, { x: 4, y: 7 }, { x: 6, y: 7 }, { x: 10, y: 7 },
                    { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 9, y: 8 }, { x: 10, y: 8 }
                ],
                optimalMoves: 48,
                hint: "Find your way through the maze - multiple paths exist"
            },
            24: {
                name: "The Hourglass",
                category: "Expert",
                concept: "Hourglass-shaped challenge",
                width: 9,
                height: 11,
                player: { x: 4, y: 9 },
                boxes: [{ x: 2, y: 8 }, { x: 6, y: 8 }, { x: 4, y: 5 }],
                targets: [{ x: 2, y: 2 }, { x: 6, y: 2 }, { x: 4, y: 1 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 },
                    { x: 0, y: 1 }, { x: 8, y: 1 },
                    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 },
                    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 },
                    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 },
                    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 },
                    { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 },
                    { x: 0, y: 9 }, { x: 8, y: 9 },
                    { x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }, { x: 3, y: 10 }, { x: 4, y: 10 }, { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 8, y: 10 }
                ],
                optimalMoves: 44,
                hint: "Navigate through the hourglass - the narrow center is key"
            },
            25: {
                name: "The Pyramid",
                category: "Expert",
                concept: "Pyramid structure puzzle",
                width: 11,
                height: 10,
                player: { x: 5, y: 8 },
                boxes: [{ x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 6 }],
                targets: [{ x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 5, y: 1 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 },
                    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 }, { x: 9, y: 1 }, { x: 10, y: 1 },
                    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 },
                    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 8, y: 3 }, { x: 9, y: 3 }, { x: 10, y: 3 },
                    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 },
                    { x: 0, y: 5 }, { x: 10, y: 5 },
                    { x: 0, y: 6 }, { x: 10, y: 6 },
                    { x: 0, y: 7 }, { x: 10, y: 7 },
                    { x: 0, y: 8 }, { x: 10, y: 8 },
                    { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 }
                ],
                optimalMoves: 52,
                hint: "Build the pyramid - work from bottom to top"
            },
            26: {
                name: "The Diamond",
                category: "Expert",
                concept: "Diamond-shaped puzzle",
                width: 11,
                height: 11,
                player: { x: 5, y: 9 },
                boxes: [{ x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 6 }],
                targets: [{ x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 5, y: 2 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 },
                    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 }, { x: 9, y: 1 }, { x: 10, y: 1 },
                    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 },
                    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 9, y: 3 }, { x: 10, y: 3 },
                    { x: 0, y: 4 }, { x: 10, y: 4 },
                    { x: 0, y: 5 }, { x: 10, y: 5 },
                    { x: 0, y: 6 }, { x: 10, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 },
                    { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 8, y: 8 }, { x: 9, y: 8 }, { x: 10, y: 8 },
                    { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 },
                    { x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }, { x: 3, y: 10 }, { x: 4, y: 10 }, { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 10, y: 10 }
                ],
                optimalMoves: 56,
                hint: "Navigate the diamond shape - work systematically from bottom to top"
            },
            27: {
                name: "The Rings",
                category: "Expert",
                concept: "Concentric ring navigation",
                width: 11,
                height: 11,
                player: { x: 5, y: 5 },
                boxes: [{ x: 5, y: 3 }, { x: 3, y: 5 }, { x: 7, y: 5 }, { x: 5, y: 7 }],
                targets: [{ x: 5, y: 1 }, { x: 1, y: 5 }, { x: 9, y: 5 }, { x: 5, y: 9 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 },
                    { x: 0, y: 1 }, { x: 10, y: 1 },
                    { x: 0, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 10, y: 2 },
                    { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 8, y: 3 }, { x: 10, y: 3 },
                    { x: 0, y: 4 }, { x: 2, y: 4 }, { x: 8, y: 4 }, { x: 10, y: 4 },
                    { x: 0, y: 5 }, { x: 10, y: 5 },
                    { x: 0, y: 6 }, { x: 2, y: 6 }, { x: 8, y: 6 }, { x: 10, y: 6 },
                    { x: 0, y: 7 }, { x: 2, y: 7 }, { x: 8, y: 7 }, { x: 10, y: 7 },
                    { x: 0, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 10, y: 8 },
                    { x: 0, y: 9 }, { x: 10, y: 9 },
                    { x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }, { x: 3, y: 10 }, { x: 4, y: 10 }, { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 10, y: 10 }
                ],
                optimalMoves: 60,
                hint: "Push boxes through the concentric rings to the outer edges"
            },
            28: {
                name: "The Cross Roads",
                category: "Expert",
                concept: "Multi-path decision making",
                width: 13,
                height: 13,
                player: { x: 6, y: 6 },
                boxes: [{ x: 6, y: 4 }, { x: 4, y: 6 }, { x: 8, y: 6 }, { x: 6, y: 8 }, { x: 6, y: 10 }],
                targets: [{ x: 2, y: 2 }, { x: 10, y: 2 }, { x: 2, y: 10 }, { x: 10, y: 10 }, { x: 6, y: 6 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 }, { x: 12, y: 0 },
                    { x: 0, y: 1 }, { x: 5, y: 1 }, { x: 7, y: 1 }, { x: 12, y: 1 },
                    { x: 0, y: 2 }, { x: 5, y: 2 }, { x: 7, y: 2 }, { x: 12, y: 2 },
                    { x: 0, y: 3 }, { x: 5, y: 3 }, { x: 7, y: 3 }, { x: 12, y: 3 },
                    { x: 0, y: 4 }, { x: 5, y: 4 }, { x: 7, y: 4 }, { x: 12, y: 4 },
                    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 5 }, { x: 11, y: 5 }, { x: 12, y: 5 },
                    { x: 0, y: 6 }, { x: 12, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }, { x: 12, y: 7 },
                    { x: 0, y: 8 }, { x: 5, y: 8 }, { x: 7, y: 8 }, { x: 12, y: 8 },
                    { x: 0, y: 9 }, { x: 5, y: 9 }, { x: 7, y: 9 }, { x: 12, y: 9 },
                    { x: 0, y: 10 }, { x: 5, y: 10 }, { x: 7, y: 10 }, { x: 12, y: 10 },
                    { x: 0, y: 11 }, { x: 5, y: 11 }, { x: 7, y: 11 }, { x: 12, y: 11 },
                    { x: 0, y: 12 }, { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 12 }, { x: 6, y: 12 }, { x: 7, y: 12 }, { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 }
                ],
                optimalMoves: 68,
                hint: "Navigate the crossroads - choose your paths wisely"
            },
            29: {
                name: "The Castle",
                category: "Expert",
                concept: "Castle fortress with towers",
                width: 13,
                height: 12,
                player: { x: 6, y: 10 },
                boxes: [{ x: 3, y: 9 }, { x: 6, y: 8 }, { x: 9, y: 9 }, { x: 4, y: 5 }, { x: 8, y: 5 }],
                targets: [{ x: 2, y: 2 }, { x: 6, y: 1 }, { x: 10, y: 2 }, { x: 4, y: 3 }, { x: 8, y: 3 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 }, { x: 12, y: 0 },
                    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 5, y: 1 }, { x: 7, y: 1 }, { x: 9, y: 1 }, { x: 11, y: 1 }, { x: 12, y: 1 },
                    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 9, y: 2 }, { x: 11, y: 2 }, { x: 12, y: 2 },
                    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 3, y: 3 }, { x: 5, y: 3 }, { x: 7, y: 3 }, { x: 9, y: 3 }, { x: 11, y: 3 }, { x: 12, y: 3 },
                    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 3, y: 4 }, { x: 5, y: 4 }, { x: 7, y: 4 }, { x: 9, y: 4 }, { x: 11, y: 4 }, { x: 12, y: 4 },
                    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 3, y: 5 }, { x: 9, y: 5 }, { x: 11, y: 5 }, { x: 12, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 3, y: 6 }, { x: 5, y: 6 }, { x: 7, y: 6 }, { x: 9, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 11, y: 7 }, { x: 12, y: 7 },
                    { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 },
                    { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 11, y: 9 }, { x: 12, y: 9 },
                    { x: 0, y: 10 }, { x: 1, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 },
                    { x: 0, y: 11 }, { x: 1, y: 11 }, { x: 2, y: 11 }, { x: 3, y: 11 }, { x: 4, y: 11 }, { x: 5, y: 11 }, { x: 6, y: 11 }, { x: 7, y: 11 }, { x: 8, y: 11 }, { x: 9, y: 11 }, { x: 10, y: 11 }, { x: 11, y: 11 }, { x: 12, y: 11 }
                ],
                optimalMoves: 75,
                hint: "Storm the castle - navigate the towers and chambers to victory"
            },
            30: {
                name: "Grand Master Challenge",
                category: "Expert",
                concept: "The ultimate Sokoban test",
                width: 15,
                height: 13,
                player: { x: 7, y: 11 },
                boxes: [{ x: 5, y: 10 }, { x: 7, y: 10 }, { x: 9, y: 10 }, { x: 6, y: 7 }, { x: 8, y: 7 }, { x: 7, y: 5 }],
                targets: [{ x: 3, y: 2 }, { x: 7, y: 1 }, { x: 11, y: 2 }, { x: 4, y: 4 }, { x: 10, y: 4 }, { x: 7, y: 3 }],
                walls: [
                    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 }, { x: 12, y: 0 }, { x: 13, y: 0 }, { x: 14, y: 0 },
                    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 8, y: 1 }, { x: 9, y: 1 }, { x: 12, y: 1 }, { x: 13, y: 1 }, { x: 14, y: 1 },
                    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 5, y: 2 }, { x: 9, y: 2 }, { x: 12, y: 2 }, { x: 13, y: 2 }, { x: 14, y: 2 },
                    { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 5, y: 3 }, { x: 9, y: 3 }, { x: 12, y: 3 }, { x: 13, y: 3 }, { x: 14, y: 3 },
                    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 12, y: 4 }, { x: 13, y: 4 }, { x: 14, y: 4 },
                    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 5 }, { x: 11, y: 5 }, { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 },
                    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 4, y: 6 }, { x: 10, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
                    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 4, y: 7 }, { x: 10, y: 7 }, { x: 12, y: 7 }, { x: 13, y: 7 }, { x: 14, y: 7 },
                    { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 },
                    { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 12, y: 9 }, { x: 13, y: 9 }, { x: 14, y: 9 },
                    { x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }, { x: 12, y: 10 }, { x: 13, y: 10 }, { x: 14, y: 10 },
                    { x: 0, y: 11 }, { x: 1, y: 11 }, { x: 2, y: 11 }, { x: 12, y: 11 }, { x: 13, y: 11 }, { x: 14, y: 11 },
                    { x: 0, y: 12 }, { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 12 }, { x: 6, y: 12 }, { x: 7, y: 12 }, { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 }, { x: 13, y: 12 }, { x: 14, y: 12 }
                ],
                optimalMoves: 88,
                hint: "The ultimate challenge - master all Sokoban skills to conquer this final puzzle!"
            }
        };
    }
}

// Make sure we don't initialize multiple times
if (!window.sokobanGame) {
    // Game will be initialized when DOM loads via the HTML script tag
}