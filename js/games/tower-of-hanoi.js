/* ===========================
   Tower of Hanoi Game Implementation
   =========================== */

class TowerOfHanoi {
  constructor() {
    // Game state
    this.towers = [[], [], []]; // Three towers: source, auxiliary, destination
    this.selectedDisk = null;
    this.selectedTower = null;
    this.moves = 0;
    this.startTime = null;
    this.gameTime = 0;
    this.timer = null;
    this.isPaused = false;
    this.isGameComplete = false;
    this.gameId = Utils.generateGameId();
    
    // Game settings
    this.diskCount = 3;
    this.optimalMoves = this.calculateOptimalMoves(this.diskCount);
    
    // Move history for undo functionality
    this.moveHistory = [];
    
    // Audio context for sound effects (if enabled)
    this.audioContext = null;
    
    this.init();
  }

  init() {
    console.log('🗼 Initializing Tower of Hanoi game...');
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize game board
    this.initializeGame();
    
    // Setup UI elements
    this.setupUI();
    
    // Show welcome message
    this.showMessage('Welcome to Tower of Hanoi! Click a disk to select it, then click a tower to move it there.');
    
    console.log('✅ Tower of Hanoi game initialized successfully');
  }

  setupEventListeners() {
    // Disk count selector
    Utils.on('#disk-count', 'change', (e) => {
      this.changeDifficulty(parseInt(e.target.value));
    });

    // Game control buttons
    Utils.on('#reset-btn', 'click', () => this.resetGame());
    Utils.on('#new-game-btn', 'click', () => this.newGame());
    Utils.on('#pause-btn', 'click', () => this.togglePause());
    Utils.on('#resume-btn', 'click', () => this.togglePause());
    Utils.on('#hint-btn', 'click', () => this.showHint());
    Utils.on('#undo-btn', 'click', () => this.undoMove());
    Utils.on('#auto-solve-btn', 'click', () => this.autoSolve());

    // Modal controls
    Utils.on('#rules-btn', 'click', () => this.showRulesModal());
    Utils.on('#close-rules', 'click', () => this.closeRulesModal());
    Utils.on('#start-game-btn', 'click', () => {
      this.closeRulesModal();
      this.newGame();
    });

    // Win modal controls
    Utils.on('#play-again-btn', 'click', () => {
      this.closeWinModal();
      this.newGame();
    });
    Utils.on('#next-level-btn', 'click', () => {
      this.closeWinModal();
      this.nextLevel();
    });
    Utils.on('#share-result-btn', 'click', () => this.shareResult());

    // Tower click handlers
    document.addEventListener('click', (e) => {
      if (e.target.closest('.tower')) {
        const tower = e.target.closest('.tower');
        const towerIndex = parseInt(tower.dataset.tower);
        this.handleTowerClick(towerIndex);
      } else if (e.target.closest('.disk')) {
        const disk = e.target.closest('.disk');
        const diskSize = parseInt(disk.dataset.size);
        this.handleDiskClick(diskSize);
      }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!this.isPaused && !this.isGameComplete) {
        this.handleKeyPress(e);
      }
    });

    // Touch support for mobile
    if (Utils.isTouchDevice()) {
      this.setupTouchControls();
    }

    // Prevent context menu on game elements
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.game-board')) {
        e.preventDefault();
      }
    });
  }

  setupTouchControls() {
    let touchStartPos = null;
    let touchTarget = null;
    
    document.addEventListener('touchstart', (e) => {
      if (e.target.closest('.game-board')) {
        touchStartPos = Utils.getTouchPosition(e);
        touchTarget = e.target;
        // Prevent default to avoid ghost clicks
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (!touchStartPos || !touchTarget) return;
      
      const touchEndPos = Utils.getTouchPosition(e);
      const distance = Utils.getDistance(touchStartPos, touchEndPos);
      
      // If it's a tap (not a swipe)
      if (distance < 15) {
        // Handle touch directly without simulating click
        this.handleTouchTap(touchTarget);
      }
      
      touchStartPos = null;
      touchTarget = null;
    });

    // Prevent context menu on touch devices
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.game-board')) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  handleTouchTap(target) {
    if (this.isPaused || this.isGameComplete) return;

    // Clear any existing selection visual artifacts
    this.clearSelectionArtifacts();

    if (target.closest('.tower')) {
      const tower = target.closest('.tower');
      const towerIndex = parseInt(tower.dataset.tower);
      this.handleTowerClick(towerIndex);
    } else if (target.closest('.disk')) {
      const disk = target.closest('.disk');
      const diskSize = parseInt(disk.dataset.size);
      this.handleDiskClick(diskSize);
    }
  }

  clearSelectionArtifacts() {
    // Remove any stray selection classes that might persist
    Utils.$$('.disk.selected').forEach(disk => {
      disk.classList.remove('selected');
    });
  }

  setupUI() {
    // Update initial stats
    this.updateStats();
    
    // Set initial difficulty
    const diskCountSelect = Utils.$('#disk-count');
    if (diskCountSelect) {
      diskCountSelect.value = this.diskCount.toString();
    }
  }

  initializeGame() {
    // Reset game state
    this.towers = [[], [], []];
    this.selectedDisk = null;
    this.selectedTower = null;
    this.moves = 0;
    this.gameTime = 0;
    this.startTime = null;
    this.isGameComplete = false;
    this.moveHistory = [];
    
    // Clear timer
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // Initialize towers with disks on the first tower
    for (let i = this.diskCount; i >= 1; i--) {
      this.towers[0].push(i);
    }
    
    // Calculate optimal moves for current difficulty
    this.optimalMoves = this.calculateOptimalMoves(this.diskCount);
    
    // Render the initial state
    this.renderTowers();
    this.updateStats();
    
    // Update UI controls
    this.updateUIControls();
  }

  calculateOptimalMoves(diskCount) {
    return Math.pow(2, diskCount) - 1;
  }

  renderTowers() {
    // Clear all existing disks
    Utils.$$('.disk').forEach(disk => disk.remove());
    
    // Render disks on each tower
    this.towers.forEach((tower, towerIndex) => {
      const towerElement = Utils.$(`#tower-${towerIndex}`);
      const diskContainer = towerElement.querySelector('.disk-container');
      
      tower.forEach((diskSize, diskIndex) => {
        const disk = this.createDiskElement(diskSize, diskIndex);
        diskContainer.appendChild(disk);
      });
    });
  }

  createDiskElement(size, position) {
    const disk = Utils.createElement('div', `disk disk-${size}`);
    disk.dataset.size = size;
    disk.setAttribute('tabindex', '0');
    disk.setAttribute('role', 'button');
    disk.setAttribute('aria-label', `Disk ${size}`);
    disk.textContent = size;
    
    // Position the disk properly stacked with responsive spacing
    const isMobile = window.innerWidth <= 767;
    const diskSpacing = isMobile ? 17 : 22; // Smaller spacing on mobile
    disk.style.bottom = `${position * diskSpacing}px`;
    disk.style.zIndex = 100 - size; // Smaller disks on top
    
    return disk;
  }

  handleDiskClick(diskSize) {
    if (this.isPaused || this.isGameComplete) return;
    
    // Find which tower contains this disk
    let towerIndex = -1;
    let diskPosition = -1;
    
    for (let i = 0; i < this.towers.length; i++) {
      const pos = this.towers[i].indexOf(diskSize);
      if (pos !== -1) {
        towerIndex = i;
        diskPosition = pos;
        break;
      }
    }
    
    // Check if this disk is on top of its tower
    if (diskPosition !== this.towers[towerIndex].length - 1) {
      this.showMessage('❌ You can only move the top disk from a tower!');
      this.animateInvalidMove(diskSize);
      return;
    }
    
    // Select/deselect the disk
    if (this.selectedDisk === diskSize) {
      this.deselectDisk();
      this.showMessage('Disk deselected. Click a disk to select it, then click a tower to move it there.');
    } else {
      this.selectDisk(diskSize, towerIndex);
      this.showMessage(`Disk ${diskSize} selected. Now click on a tower to move it there.`);
    }
  }

  handleTowerClick(towerIndex) {
    if (this.isPaused || this.isGameComplete) return;
    
    if (this.selectedDisk === null) {
      // No disk selected, select the top disk from this tower
      const tower = this.towers[towerIndex];
      if (tower.length > 0) {
        const topDisk = tower[tower.length - 1];
        this.selectDisk(topDisk, towerIndex);
        this.showMessage(`Disk ${topDisk} selected. Click on another tower to move it there.`);
      } else {
        this.showMessage('This tower is empty. Select a disk first, then click here to move it.');
      }
    } else {
      // Try to move the selected disk to this tower
      this.attemptMove(this.selectedTower, towerIndex);
    }
  }

  selectDisk(diskSize, towerIndex) {
    // Deselect previous selection
    this.deselectDisk();
    
    // Select new disk
    this.selectedDisk = diskSize;
    this.selectedTower = towerIndex;
    
    // Update visual selection with proper cleanup
    this.updateSelectionVisuals();
  }

  deselectDisk() {
    // Remove selection from currently selected disk
    if (this.selectedDisk !== null) {
      const diskElement = Utils.$(`[data-size="${this.selectedDisk}"]`);
      if (diskElement) {
        diskElement.classList.remove('selected');
      }
    }
    
    // Clear all selection artifacts - sometimes multiple elements might have selection class
    Utils.$$('.disk.selected').forEach(disk => {
      disk.classList.remove('selected');
    });

    // Reset selection state
    this.selectedDisk = null;
    this.selectedTower = null;

    // Force a visual refresh to ensure selection is cleared
    requestAnimationFrame(() => {
      this.updateSelectionVisuals();
    });
  }

  updateSelectionVisuals() {
    // Ensure only the currently selected disk (if any) has the selected class
    Utils.$$('.disk').forEach(disk => {
      const diskSize = parseInt(disk.dataset.size);
      if (diskSize === this.selectedDisk) {
        disk.classList.add('selected');
      } else {
        disk.classList.remove('selected');
      }
    });
  }

  attemptMove(fromTower, toTower) {
    if (fromTower === toTower) {
      this.deselectDisk();
      this.showMessage('Select a different tower to move the disk to.');
      return;
    }
    
    const disk = this.selectedDisk;
    const fromTowerArray = this.towers[fromTower];
    const toTowerArray = this.towers[toTower];
    
    // Check if the move is valid
    if (this.isValidMove(fromTowerArray, toTowerArray)) {
      this.executeMove(fromTower, toTower);
    } else {
      const topDisk = toTowerArray.length > 0 ? toTowerArray[toTowerArray.length - 1] : null;
      this.showMessage(`❌ Invalid move! Cannot place disk ${disk} on top of disk ${topDisk}.`);
      this.animateInvalidMove(disk);
    }
  }

  isValidMove(fromTower, toTower) {
    if (fromTower.length === 0) return false;
    if (toTower.length === 0) return true;
    
    const movingDisk = fromTower[fromTower.length - 1];
    const topDisk = toTower[toTower.length - 1];
    
    return movingDisk < topDisk;
  }

  executeMove(fromTowerIndex, toTowerIndex) {
    // Start timer if this is the first move
    if (this.moves === 0) {
      this.startTimer();
    }
    
    // Save move to history for undo
    this.moveHistory.push({
      from: fromTowerIndex,
      to: toTowerIndex,
      disk: this.selectedDisk,
      moveNumber: this.moves + 1
    });
    
    // Execute the move
    const disk = this.towers[fromTowerIndex].pop();
    this.towers[toTowerIndex].push(disk);
    
    // Increment move counter
    this.moves++;
    
    // Animate the move
    this.animateMove(disk, fromTowerIndex, toTowerIndex);
    
    // Update game state - ensure complete deselection
    this.forceDeselectAll();
    this.updateStats();
    this.updateUIControls();
    
    // Check for win condition after a brief delay to ensure proper state update
    setTimeout(() => {
      if (this.checkWinCondition()) {
        this.gameComplete();
      } else {
        this.showMessage(`✅ Moved disk ${disk}. Moves: ${this.moves}/${this.optimalMoves}`);
      }
    }, 100);
  }

  forceDeselectAll() {
    // Aggressively clear all selection state and visuals
    this.selectedDisk = null;
    this.selectedTower = null;

    // Remove all selection classes immediately
    Utils.$$('.disk').forEach(disk => {
      disk.classList.remove('selected');
    });

    // Also clear any potential aria-selected attributes
    Utils.$$('.disk[aria-selected="true"]').forEach(disk => {
      disk.removeAttribute('aria-selected');
    });

    // Force a repaint to ensure changes are applied
    this.clearSelectionArtifacts();
  }

  animateMove(diskSize, fromTowerIndex, toTowerIndex) {
    const diskElement = Utils.$(`[data-size="${diskSize}"]`);
    if (!diskElement) return;
    
    diskElement.classList.add('disk-moving');
    
    // Calculate animation path (arc motion)
    const fromTower = Utils.$(`#tower-${fromTowerIndex}`);
    const toTower = Utils.$(`#tower-${toTowerIndex}`);
    
    const fromRect = fromTower.getBoundingClientRect();
    const toRect = toTower.getBoundingClientRect();
    
    const deltaX = toRect.left - fromRect.left;
    const arcHeight = 100; // Height of the arc
    
    // Animate the move
    const animation = diskElement.animate([
      { transform: `translate(0, 0)` },
      { transform: `translate(${deltaX / 2}px, -${arcHeight}px)` },
      { transform: `translate(${deltaX}px, 0)` }
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    animation.addEventListener('finish', () => {
      diskElement.classList.remove('disk-moving');
      this.renderTowers(); // Re-render to ensure proper positioning
      
      // Double-check win condition after animation completes
      if (this.checkWinCondition() && !this.isGameComplete) {
        setTimeout(() => this.gameComplete(), 200);
      }
    });
  }

  animateInvalidMove(diskSize) {
    const diskElement = Utils.$(`[data-size="${diskSize}"]`);
    if (diskElement) {
      diskElement.classList.add('disk-invalid-move');
      setTimeout(() => {
        diskElement.classList.remove('disk-invalid-move');
      }, 500);
    }
  }

  checkWinCondition() {
    // Win condition: all disks are on the destination tower (tower 2)
    return this.towers[2].length === this.diskCount;
  }

  gameComplete() {
    this.isGameComplete = true;
    this.stopTimer();
    
    // Calculate final stats
    const efficiency = Math.round((this.optimalMoves / this.moves) * 100);
    const timeInSeconds = Math.floor(this.gameTime / 1000);
    
    // Save game statistics and get achievements
    const newAchievements = this.saveGameStatsAndGetAchievements();
    
    // Show win message
    this.showMessage('🎉 Congratulations! You completed the Tower of Hanoi!');
    
    // Show achievements if any
    if (newAchievements.length > 0) {
      setTimeout(() => {
        newAchievements.forEach((achievement, index) => {
          setTimeout(() => {
            this.showMessage(`🏆 Achievement: ${achievement}`);
          }, (index + 1) * 2000);
        });
      }, 1000);
    }
    
    // Show win modal after achievements
    setTimeout(() => {
      this.showWinModal();
    }, 1500 + (newAchievements.length * 2000));
  }
  
  saveGameStatsAndGetAchievements() {
    const timeInSeconds = Math.floor(this.gameTime / 1000);
    const efficiency = Math.round((this.optimalMoves / this.moves) * 100);
    
    // Get current achievements count
    const currentStats = Utils.storage.get('puzzleStats', { achievements: [] });
    const previousAchievementCount = currentStats.achievements.length;
    
    // Save all stats
    this.saveGameStats();
    
    // Get updated stats to see new achievements
    const updatedStats = Utils.storage.get('puzzleStats', { achievements: [] });
    const newAchievements = updatedStats.achievements.slice(previousAchievementCount);
    
    return newAchievements;
  }

  showWinModal() {
    const modal = Utils.$('#win-modal');
    const finalMoves = Utils.$('#final-moves');
    const finalTime = Utils.$('#final-time');
    const efficiencyScore = Utils.$('#efficiency-score');
    const performanceDiv = Utils.$('#win-performance');
    
    if (modal && finalMoves && finalTime && efficiencyScore) {
      finalMoves.textContent = this.moves;
      finalTime.textContent = Utils.formatTime(Math.floor(this.gameTime / 1000));
      
      const efficiency = Math.round((this.optimalMoves / this.moves) * 100);
      efficiencyScore.textContent = efficiency + '%';
      
      // Show performance rating
      const rating = this.getPerformanceRating(efficiency);
      performanceDiv.innerHTML = `
        <div class="performance-rating ${rating.class}">
          <span>${rating.icon}</span>
          <span>${rating.text}</span>
        </div>
      `;
      
      modal.classList.add('active');
    }
  }

  getPerformanceRating(efficiency) {
    if (efficiency >= 95) {
      return { icon: '🏆', text: 'Perfect!', class: 'excellent' };
    } else if (efficiency >= 80) {
      return { icon: '⭐', text: 'Excellent!', class: 'excellent' };
    } else if (efficiency >= 65) {
      return { icon: '👍', text: 'Good Job!', class: 'good' };
    } else if (efficiency >= 50) {
      return { icon: '👌', text: 'Not Bad!', class: 'average' };
    } else {
      return { icon: '💪', text: 'Keep Practicing!', class: 'needs-improvement' };
    }
  }

  closeWinModal() {
    const modal = Utils.$('#win-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  startTimer() {
    this.startTime = Date.now();
    this.timer = setInterval(() => {
      if (!this.isPaused) {
        this.gameTime = Date.now() - this.startTime;
        this.updateTimerDisplay();
      }
    }, 100);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateTimerDisplay() {
    const timerElement = Utils.$('#timer');
    if (timerElement) {
      timerElement.textContent = Utils.formatTime(Math.floor(this.gameTime / 1000));
    }
  }

  updateStats() {
    // Update move count
    const moveCountElement = Utils.$('#move-count');
    if (moveCountElement) {
      moveCountElement.textContent = this.moves;
    }
    
    // Update optimal moves
    const optimalMovesElement = Utils.$('#optimal-moves');
    if (optimalMovesElement) {
      optimalMovesElement.textContent = this.optimalMoves;
    }
    
    // Update difficulty level
    const difficultyElement = Utils.$('#difficulty-level');
    if (difficultyElement) {
      difficultyElement.textContent = this.getDifficultyName(this.diskCount);
    }
    
    // Update timer
    this.updateTimerDisplay();
    
    // Update game stats display on main page (if elements exist)
    this.updateMainPageStats();
  }
  
  updateMainPageStats() {
    // This will update stats on the main page if we're in an iframe or popup
    try {
      const mainStats = Utils.storage.get('puzzleStats', {});
      
      // Try to update parent window stats if available
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'updateStats',
          stats: mainStats
        }, '*');
      }
    } catch (e) {
      // Ignore errors - probably not in iframe
    }
  }

  getDifficultyName(diskCount) {
    const difficulties = {
      3: 'Beginner',
      4: 'Intermediate',
      5: 'Advanced',
      6: 'Expert',
      7: 'Master'
    };
    return difficulties[diskCount] || 'Custom';
  }

  updateUIControls() {
    // Update undo button state
    const undoBtn = Utils.$('#undo-btn');
    if (undoBtn) {
      undoBtn.disabled = this.moveHistory.length === 0;
    }
    
    // Update next level button visibility
    const nextLevelBtn = Utils.$('#next-level-btn');
    if (nextLevelBtn) {
      nextLevelBtn.style.display = this.diskCount >= 7 ? 'none' : 'block';
    }
  }

  changeDifficulty(newDiskCount) {
    if (this.moves > 0) {
      if (!confirm('Changing difficulty will reset the current game. Continue?')) {
        // Reset select to current value
        const diskCountSelect = Utils.$('#disk-count');
        if (diskCountSelect) {
          diskCountSelect.value = this.diskCount.toString();
        }
        return;
      }
    }
    
    this.diskCount = newDiskCount;
    this.initializeGame();
    this.showMessage(`Difficulty changed to ${this.getDifficultyName(newDiskCount)}. ${newDiskCount} disks, ${this.optimalMoves} optimal moves.`);
  }

  resetGame() {
    if (this.moves > 0) {
      if (!confirm('Are you sure you want to reset the current game?')) {
        return;
      }
    }
    
    this.initializeGame();
    this.showMessage('Game reset. Click a disk to start playing!');
  }

  newGame() {
    this.initializeGame();
    this.showMessage('New game started! Good luck!');
  }

  nextLevel() {
    if (this.diskCount < 7) {
      this.diskCount++;
      const diskCountSelect = Utils.$('#disk-count');
      if (diskCountSelect) {
        diskCountSelect.value = this.diskCount.toString();
      }
      this.initializeGame();
      this.showMessage(`Level up! Now playing with ${this.diskCount} disks.`);
    }
  }

  togglePause() {
    if (this.isGameComplete) return;
    
    this.isPaused = !this.isPaused;
    
    const pauseBtn = Utils.$('#pause-btn');
    const pauseOverlay = Utils.$('#pause-overlay');
    
    if (this.isPaused) {
      pauseOverlay?.classList.add('active');
      if (pauseBtn) {
        pauseBtn.innerHTML = '<span class="btn-icon">▶️</span> Resume';
      }
    } else {
      pauseOverlay?.classList.remove('active');
      if (pauseBtn) {
        pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span> Pause';
      }
    }
  }

  undoMove() {
    if (this.moveHistory.length === 0) return;
    
    const lastMove = this.moveHistory.pop();
    
    // Reverse the move
    const disk = this.towers[lastMove.to].pop();
    this.towers[lastMove.from].push(disk);
    
    // Decrement move counter
    this.moves--;
    
    // Re-render and update
    this.renderTowers();
    this.updateStats();
    this.updateUIControls();
    
    this.showMessage(`↶ Undid move: Disk ${disk} back to tower ${lastMove.from + 1}`);
  }

  showHint() {
    if (this.isGameComplete) return;
    
    const hint = this.calculateHint();
    if (hint) {
      this.showMessage(`💡 Hint: Move disk ${hint.disk} from tower ${hint.from + 1} to tower ${hint.to + 1}`);
      
      // Highlight the suggested move
      this.highlightHint(hint);
    } else {
      this.showMessage('💡 No hint available right now. Try moving the smallest disk!');
    }
  }

  calculateHint() {
    // Simple heuristic: suggest moving the smallest movable disk
    for (let size = 1; size <= this.diskCount; size++) {
      for (let fromTower = 0; fromTower < 3; fromTower++) {
        const tower = this.towers[fromTower];
        if (tower.length > 0 && tower[tower.length - 1] === size) {
          // Found the disk, now find a valid destination
          for (let toTower = 0; toTower < 3; toTower++) {
            if (fromTower !== toTower && this.isValidMove(this.towers[fromTower], this.towers[toTower])) {
              return { disk: size, from: fromTower, to: toTower };
            }
          }
        }
      }
    }
    return null;
  }

  highlightHint(hint) {
    // Highlight the disk and tower
    const diskElement = Utils.$(`[data-size="${hint.disk}"]`);
    const towerElement = Utils.$(`#tower-${hint.to}`);
    
    if (diskElement) {
      diskElement.style.boxShadow = '0 0 20px #ffeaa7';
    }
    
    if (towerElement) {
      towerElement.classList.add('highlight');
    }
    
    // Remove highlights after 3 seconds
    setTimeout(() => {
      if (diskElement) {
        diskElement.style.boxShadow = '';
      }
      if (towerElement) {
        towerElement.classList.remove('highlight');
      }
    }, 3000);
  }

  autoSolve() {
    if (!confirm('This will automatically solve the puzzle. Are you sure?')) {
      return;
    }
    
    this.showMessage('🤖 Auto-solving... Watch and learn!');
    this.solveHanoi(this.diskCount, 0, 2, 1);
  }

  async solveHanoi(n, from, to, auxiliary, delay = 1000) {
    if (n === 1) {
      await this.autoMove(from, to, delay);
    } else {
      await this.solveHanoi(n - 1, from, auxiliary, to, delay);
      await this.autoMove(from, to, delay);
      await this.solveHanoi(n - 1, auxiliary, to, from, delay);
    }
  }

  async autoMove(from, to, delay) {
    return new Promise(resolve => {
      // Simulate the move
      this.selectedDisk = this.towers[from][this.towers[from].length - 1];
      this.selectedTower = from;
      
      setTimeout(() => {
        this.attemptMove(from, to);
        resolve();
      }, delay);
    });
  }

  handleKeyPress(e) {
    switch(e.key) {
      case '1':
      case '2':
      case '3':
        const towerIndex = parseInt(e.key) - 1;
        this.handleTowerClick(towerIndex);
        break;
      case 'h':
      case 'H':
        this.showHint();
        break;
      case 'u':
      case 'U':
        this.undoMove();
        break;
      case 'r':
      case 'R':
        this.resetGame();
        break;
      case ' ':
        e.preventDefault();
        this.togglePause();
        break;
    }
  }

  showRulesModal() {
    const modal = Utils.$('#rules-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeRulesModal() {
    const modal = Utils.$('#rules-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  showMessage(message) {
    const messageElement = Utils.$('#game-messages .message-text');
    if (messageElement) {
      messageElement.textContent = message;
      
      // Add animation
      messageElement.style.opacity = '0';
      messageElement.style.transform = 'translateY(10px)';
      
      Utils.fadeIn(messageElement.parentElement, 300);
      
      setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
      }, 50);
    }
  }

  saveGameStats() {
    const timeInSeconds = Math.floor(this.gameTime / 1000);
    const efficiency = Math.round((this.optimalMoves / this.moves) * 100);
    
    // Save individual game record
    const gameStats = {
      gameId: this.gameId,
      diskCount: this.diskCount,
      moves: this.moves,
      optimalMoves: this.optimalMoves,
      gameTime: this.gameTime,
      timeInSeconds: timeInSeconds,
      completed: this.isGameComplete,
      efficiency: efficiency,
      timestamp: new Date().toISOString()
    };
    
    Utils.storage.set(`toh_game_${this.gameId}`, gameStats);
    
    // Update main app statistics (used by index.html)
    let mainAppStats = Utils.storage.get('puzzleStats', {
      totalGamesPlayed: 0,
      totalGamesCompleted: 0,
      totalTimePlayed: 0,
      bestTimes: {},
      bestMoves: {},
      achievements: [],
      streaks: { current: 0, longest: 0 }
    });
    
    mainAppStats.totalGamesPlayed++;
    
    if (this.isGameComplete) {
      mainAppStats.totalGamesCompleted++;
      mainAppStats.totalTimePlayed += timeInSeconds;
      
      // Update best time (in seconds)
      const gameKey = 'tower-of-hanoi';
      if (!mainAppStats.bestTimes[gameKey] || timeInSeconds < mainAppStats.bestTimes[gameKey]) {
        mainAppStats.bestTimes[gameKey] = timeInSeconds;
      }
      
      // Update streak
      mainAppStats.streaks.current++;
      if (mainAppStats.streaks.current > mainAppStats.streaks.longest) {
        mainAppStats.streaks.longest = mainAppStats.streaks.current;
      }
      
      // Check for achievements
      this.checkAndAddAchievements(mainAppStats, efficiency, timeInSeconds);
    } else {
      // Reset streak if game not completed
      mainAppStats.streaks.current = 0;
    }
    
    Utils.storage.set('puzzleStats', mainAppStats);
    
    // Update Tower of Hanoi specific stats
    const tohStats = Utils.storage.get('toh_global_stats', {
      gamesPlayed: 0,
      gamesCompleted: 0,
      totalMoves: 0,
      totalTime: 0,
      bestTimes: {},
      bestMoves: {},
      bestEfficiency: {}
    });
    
    tohStats.gamesPlayed++;
    if (this.isGameComplete) {
      tohStats.gamesCompleted++;
      tohStats.totalMoves += this.moves;
      tohStats.totalTime += timeInSeconds;
      
      // Update best records by difficulty
      const difficultyKey = `${this.diskCount}disks`;
      
      // Ensure the nested objects exist before accessing
      if (!tohStats.bestTimes) tohStats.bestTimes = {};
      if (!tohStats.bestMoves) tohStats.bestMoves = {};
      if (!tohStats.bestEfficiency) tohStats.bestEfficiency = {};
      
      if (!tohStats.bestTimes[difficultyKey] || timeInSeconds < tohStats.bestTimes[difficultyKey]) {
        tohStats.bestTimes[difficultyKey] = timeInSeconds;
      }
      
      if (!tohStats.bestMoves[difficultyKey] || this.moves < tohStats.bestMoves[difficultyKey]) {
        tohStats.bestMoves[difficultyKey] = this.moves;
      }
      
      if (!tohStats.bestEfficiency[difficultyKey] || efficiency > tohStats.bestEfficiency[difficultyKey]) {
        tohStats.bestEfficiency[difficultyKey] = efficiency;
      }
    }
    
    Utils.storage.set('toh_global_stats', tohStats);
  }
  
  checkAndAddAchievements(mainAppStats, efficiency, timeInSeconds) {
    const achievements = [];
    
    // Perfect game achievement
    if (efficiency === 100) {
      achievements.push('Perfect Game - Completed with optimal moves!');
    }
    
    // Speed achievements
    if (this.diskCount === 3 && timeInSeconds < 60) {
      achievements.push('Speed Demon - Completed 3-disk Tower of Hanoi in under 1 minute!');
    }
    
    // Efficiency achievements  
    if (efficiency >= 90) {
      achievements.push('Efficiency Expert - 90%+ efficiency achieved!');
    }
    
    // Streak achievements
    if (mainAppStats.streaks.current === 5) {
      achievements.push('On Fire - 5 games completed in a row!');
    } else if (mainAppStats.streaks.current === 10) {
      achievements.push('Unstoppable - 10 games completed in a row!');
    }
    
    // Difficulty achievements
    if (this.diskCount >= 6) {
      achievements.push(`Master Level - Completed ${this.diskCount}-disk challenge!`);
    }
    
    // Add new achievements to the list
    achievements.forEach(achievement => {
      if (!mainAppStats.achievements.includes(achievement)) {
        mainAppStats.achievements.push(achievement);
      }
    });
    
    return achievements;
  }

  shareResult() {
    const efficiency = Math.round((this.optimalMoves / this.moves) * 100);
    const timeStr = Utils.formatTime(Math.floor(this.gameTime / 1000));
    
    const shareText = `🗼 I just completed Tower of Hanoi with ${this.diskCount} disks!\n` +
                     `📊 ${this.moves} moves (${efficiency}% efficiency)\n` +
                     `⏱️ Time: ${timeStr}\n` +
                     `🎯 Optimal: ${this.optimalMoves} moves\n\n` +
                     `Try it yourself: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Tower of Hanoi Challenge',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        this.showMessage('📋 Result copied to clipboard!');
      }).catch(() => {
        this.showMessage('Unable to share result. Try again later.');
      });
    }
  }

  // Public API methods
  pause() {
    if (!this.isPaused) {
      this.togglePause();
    }
  }

  resume() {
    if (this.isPaused) {
      this.togglePause();
    }
  }

  handleResize() {
    // Adjust game layout for new screen size
    this.renderTowers();
  }

  destroy() {
    // Cleanup when leaving the game
    this.stopTimer();
    this.saveGameStats();
  }
}

// Export for global use
window.TowerOfHanoi = TowerOfHanoi;

// Log game script loaded
console.log('🗼 Tower of Hanoi game script loaded successfully');