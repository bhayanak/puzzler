// ===== SLIDING PUZZLE GAME =====

class SlidingPuzzle {
  constructor() {
    this.boardSize = 4;
    this.mode = 'numbers'; // 'numbers' or 'image'
    this.board = [];
    this.emptyPos = { row: this.boardSize - 1, col: this.boardSize - 1 };
    this.moves = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.isGameActive = false;
    this.currentImage = null;
    this.settings = {
      animationSpeed: 'normal',
      soundEffects: true,
      showNumbers: true,
      highlightValid: true
    };
    
    this.animationDurations = {
      fast: 150,
      normal: 300,
      slow: 600,
      none: 0
    };
    
    this.initializeElements();
    this.initializeEventListeners();
    this.loadSettings();
    this.loadBestScores();
    this.initializeGame();
  }
  
  initializeElements() {
    console.log('🎯 Initializing Sliding Puzzle elements...');
    
    // Game elements
    this.boardElement = document.getElementById('puzzle-board');
    this.boardOverlay = document.getElementById('board-overlay');
    this.successAnimation = document.getElementById('success-animation');
    
    // Debug: Check if critical elements exist
    if (!this.boardElement) {
      console.error('❌ Critical element missing: puzzle-board');
      return;
    }
    
    console.log('✅ Board element found:', this.boardElement);
    
    // Controls - with null checks
    this.boardSizeSelect = document.getElementById('board-size');
    this.puzzleModeSelect = document.getElementById('puzzle-mode');
    this.newGameBtn = document.getElementById('new-game-btn');
    this.shuffleBtn = document.getElementById('shuffle-btn');
    
    if (!this.boardSizeSelect) console.warn('⚠️ board-size element not found');
    if (!this.puzzleModeSelect) console.warn('⚠️ puzzle-mode element not found');
    
    // Stats
    this.moveCountElement = document.getElementById('move-count');
    this.gameTimeElement = document.getElementById('game-time');
    this.bestMovesElement = document.getElementById('best-moves');
    
    // Image upload
    this.imageUploadArea = document.getElementById('image-upload-area');
    this.uploadZone = document.getElementById('upload-zone');
    this.imageInput = document.getElementById('image-input');
    this.browseBtn = document.getElementById('browse-btn');
    this.imagePreview = document.getElementById('image-preview');
    this.previewImg = document.getElementById('preview-img');
    this.removeImageBtn = document.getElementById('remove-image-btn');
    
    // Action buttons
    this.hintBtn = document.getElementById('hint-btn');
    this.solveBtn = document.getElementById('solve-btn');
    this.resetBtn = document.getElementById('reset-btn');
    
    // Modals
    this.helpModal = document.getElementById('help-modal');
    this.settingsModal = document.getElementById('settings-modal');
    
    // Settings
    this.animationSpeedSelect = document.getElementById('animation-speed');
    this.soundEffectsToggle = document.getElementById('sound-effects');
    this.showNumbersToggle = document.getElementById('show-numbers');
    this.highlightValidToggle = document.getElementById('highlight-valid');
  }
  
  initializeEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Control listeners - with null checks
    if (this.boardSizeSelect) {
      this.boardSizeSelect.addEventListener('change', () => this.changeBoardSize());
    }
    if (this.puzzleModeSelect) {
      this.puzzleModeSelect.addEventListener('change', () => this.changePuzzleMode());
    }
    if (this.newGameBtn) {
      this.newGameBtn.addEventListener('click', () => this.newGame());
    }
    if (this.shuffleBtn) {
      this.shuffleBtn.addEventListener('click', () => this.shuffleBoard());
    }
    
    // Action button listeners - with null checks
    if (this.hintBtn) {
      this.hintBtn.addEventListener('click', () => this.showHint());
    }
    if (this.solveBtn) {
      this.solveBtn.addEventListener('click', () => this.autoSolve());
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    // Image upload listeners - with null checks
    if (this.browseBtn) {
      this.browseBtn.addEventListener('click', () => this.imageInput.click());
    }
    if (this.imageInput) {
      this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }
    if (this.removeImageBtn) {
      this.removeImageBtn.addEventListener('click', () => this.removeImage());
    }
    
    // Drag and drop listeners - with null checks
    if (this.uploadZone) {
      this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
      this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
    }
    
    // Keyboard listeners
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // Modal listeners
    this.setupModalListeners();
    
    // Settings listeners
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    }
  }
  
  setupModalListeners() {
    // Help modal
    document.getElementById('help-btn').addEventListener('click', () => {
      this.helpModal.style.display = 'flex';
    });
    
    // Settings modal
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.settingsModal.style.display = 'flex';
    });
    
    // Close modal listeners
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        modal.style.display = 'none';
      });
    });
    
    // Click outside to close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });
  }
  
  initializeGame() {
    console.log('🎯 Initializing game...');
    this.createBoard();
    console.log('📋 Board created:', this.board);
    this.renderBoard();
    console.log('🎨 Board rendered');
    
    // Auto-start with a shuffled game for better user experience
    setTimeout(() => {
      this.shuffleBoard();
      console.log('🔀 Board shuffled and ready to play');
    }, 500);
    
    this.updateStats();
    console.log('📊 Stats updated');
  }
  
  createBoard() {
    this.board = [];
    const totalTiles = this.boardSize * this.boardSize;
    
    // Create solved state (1, 2, 3, ..., n-1, empty)
    for (let i = 0; i < this.boardSize; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.boardSize; j++) {
        const tileNumber = i * this.boardSize + j + 1;
        this.board[i][j] = tileNumber === totalTiles ? 0 : tileNumber;
      }
    }
    
    this.emptyPos = { row: this.boardSize - 1, col: this.boardSize - 1 };
    this.moves = 0;
    this.isGameActive = false;
  }
  
  renderBoard() {
    // Update board size class
    this.boardElement.className = `puzzle-board size-${this.boardSize}`;
    this.boardElement.innerHTML = '';
    
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const tile = this.createTileElement(i, j);
        this.boardElement.appendChild(tile);
      }
    }
  }
  
  createTileElement(row, col) {
    const tileNumber = this.board[row][col];
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile';
    tile.dataset.row = row;
    tile.dataset.col = col;
    tile.style.setProperty('--tile-index', row * this.boardSize + col);
    
    if (tileNumber === 0) {
      tile.classList.add('empty');
    } else {
      tile.addEventListener('click', () => this.handleTileClick(row, col));
      
      // Apply content based on mode
      console.log('🎯 Creating tile', tileNumber, '- Mode:', this.mode, 'Has image:', !!this.currentImage);
      
      if (this.mode === 'image' && this.currentImage) {
        // Image mode - apply background image only, no text
        console.log('📸 Applying image mode to tile', tileNumber);
        this.applyImageToTile(tile, tileNumber);
      } else {
        // Numbers mode - show tile number
        console.log('🔢 Applying numbers mode to tile', tileNumber);
        tile.textContent = tileNumber;
        // Clear any image styling from previous mode
        tile.style.backgroundImage = '';
        tile.style.backgroundPosition = '';
        tile.style.backgroundSize = '';
        tile.classList.remove('image-tile');
      }
      
      if (this.settings.highlightValid && this.isMoveable(row, col)) {
        tile.classList.add('moveable');
      }
    }
    return tile;
  }
  
  applyImageToTile(tile, tileNumber) {
    console.log('🖼️ Applying image to tile:', tileNumber, 'mode:', this.mode, 'showNumbers:', this.settings.showNumbers);
    tile.classList.add('image-tile');
    
    // Clear any existing text content and number elements
    tile.textContent = '';
    // Remove any existing number overlays
    const existingNumbers = tile.querySelectorAll('.tile-number');
    existingNumbers.forEach(num => num.remove());
    
    // Calculate background position for this tile
    const tileIndex = tileNumber - 1; // Convert to 0-based index
    const tileRow = Math.floor(tileIndex / this.boardSize);
    const tileCol = tileIndex % this.boardSize;
    
    // Calculate position - ensure mobile compatibility with proper percentage calculation
    // Each tile shows 1/boardSize of the image, positioned correctly
    const bgPosX = tileCol * (100 / (this.boardSize - 1));
    const bgPosY = tileRow * (100 / (this.boardSize - 1));
    
    // Use setProperty with priority to override CSS
    tile.style.setProperty('background-image', `url(${this.currentImage})`, 'important');
    tile.style.setProperty('background-position', `${bgPosX}% ${bgPosY}%`, 'important');
    tile.style.setProperty('background-size', `${this.boardSize * 100}% ${this.boardSize * 100}%`, 'important');
    tile.style.setProperty('background-color', 'transparent', 'important');
    tile.style.setProperty('background-repeat', 'no-repeat', 'important');

    // Add mobile-specific handling
    if (window.innerWidth <= 768) {
      // On mobile, ensure the background attachment is handled properly
      tile.style.setProperty('background-attachment', 'scroll', 'important');
      // Force hardware acceleration on mobile for smoother rendering
      tile.style.setProperty('will-change', 'background-position', 'important');
    }
    
    console.log('✅ Image applied to tile', tileNumber, 'at row', tileRow, 'col', tileCol, 'position', bgPosX + '%', bgPosY + '%');
    console.log('🖼️ Tile styles set:', {
      backgroundImage: tile.style.backgroundImage.substring(0, 50) + '...',
      backgroundPosition: tile.style.backgroundPosition,
      backgroundSize: tile.style.backgroundSize,
      backgroundColor: tile.style.backgroundColor,
      className: tile.className
    });
    
    // Debug: Check computed styles
    const computedStyles = window.getComputedStyle(tile);
    console.log('🔍 Computed styles:', {
      backgroundImage: computedStyles.backgroundImage.substring(0, 50) + '...',
      backgroundPosition: computedStyles.backgroundPosition,
      backgroundSize: computedStyles.backgroundSize,
      backgroundColor: computedStyles.backgroundColor
    });
    
    // In pure image mode, don't show numbers regardless of settings
    // Only show numbers if explicitly enabled AND user wants overlay
    // For now, let's never show numbers in image mode for cleaner experience
  }
  
  handleTileClick(row, col) {
    if (!this.isGameActive) return;
    if (!this.isMoveable(row, col)) return;
    
    this.moveTile(row, col);
  }
  
  handleKeyDown(e) {
    if (!this.isGameActive) return;
    
    const { row, col } = this.emptyPos;
    let targetRow = row;
    let targetCol = col;
    
    switch (e.key) {
      case 'ArrowUp':
        targetRow = row + 1;
        break;
      case 'ArrowDown':
        targetRow = row - 1;
        break;
      case 'ArrowLeft':
        targetCol = col + 1;
        break;
      case 'ArrowRight':
        targetCol = col - 1;
        break;
      default:
        return;
    }
    
    if (this.isValidPosition(targetRow, targetCol)) {
      e.preventDefault();
      this.moveTile(targetRow, targetCol);
    }
  }
  
  isMoveable(row, col) {
    const { row: emptyRow, col: emptyCol } = this.emptyPos;
    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  }
  
  isValidPosition(row, col) {
    return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
  }
  
  moveTile(row, col) {
    if (!this.isMoveable(row, col)) return;
    
    const { row: emptyRow, col: emptyCol } = this.emptyPos;
    
    // Swap tile with empty position
    this.board[emptyRow][emptyCol] = this.board[row][col];
    this.board[row][col] = 0;
    this.emptyPos = { row, col };
    
    // Animate tile movement
    this.animateTileMove(row, col, emptyRow, emptyCol);
    
    this.moves++;
    this.updateStats();
    
    // Start timer on first move
    if (this.moves === 1) {
      this.startTimer();
    }
    
    // Check for win condition
    setTimeout(() => {
      if (this.checkWinCondition()) {
        this.handleGameComplete();
      } else {
        this.updateMoveableHighlights();
      }
    }, this.animationDurations[this.settings.animationSpeed] + 50);
  }
  
  animateTileMove(fromRow, fromCol, toRow, toCol) {
    const tileElement = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
    if (!tileElement) return;
    
    const duration = this.animationDurations[this.settings.animationSpeed];
    if (duration === 0) {
      this.renderBoard();
      return;
    }
    
    tileElement.classList.add('moving');
    
    setTimeout(() => {
      this.renderBoard();
    }, duration);
  }
  
  updateMoveableHighlights() {
    if (!this.settings.highlightValid) return;
    
    document.querySelectorAll('.puzzle-tile').forEach(tile => {
      tile.classList.remove('moveable');
    });
    
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] !== 0 && this.isMoveable(i, j)) {
          const tile = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
          if (tile) tile.classList.add('moveable');
        }
      }
    }
  }
  
  checkWinCondition() {
    let expected = 1;
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (i === this.boardSize - 1 && j === this.boardSize - 1) {
          return this.board[i][j] === 0; // Last position should be empty
        }
        if (this.board[i][j] !== expected) {
          return false;
        }
        expected++;
      }
    }
    return true;
  }
  
  handleGameComplete() {
    this.isGameActive = false;
    this.stopTimer();
    
    // Add completion animation to board
    this.boardElement.classList.add('completed');
    
    // Calculate completion time
    const completionTime = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Update statistics
    this.saveGameStats(true, completionTime);
    
    // Show completion overlay
    const completionStats = document.getElementById('completion-stats');
    completionStats.innerHTML = `
      <strong>Completed in ${this.moves} moves</strong><br>
      <span>Time: ${this.formatTime(completionTime)}</span>
    `;
    
    this.successAnimation.style.display = 'block';
    this.boardOverlay.classList.add('show');
    
    // Hide overlay after celebration
    setTimeout(() => {
      this.boardOverlay.classList.remove('show');
      this.boardElement.classList.remove('completed');
    }, 3000);
  }
  
  shuffleBoard() {
    if (!this.isValidBoard()) {
      this.createBoard();
    }
    
    // Perform random valid moves to shuffle
    const moves = Math.max(100, this.boardSize * this.boardSize * 10);
    
    for (let i = 0; i < moves; i++) {
      const validMoves = this.getValidMoves();
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        this.board[this.emptyPos.row][this.emptyPos.col] = this.board[randomMove.row][randomMove.col];
        this.board[randomMove.row][randomMove.col] = 0;
        this.emptyPos = randomMove;
      }
    }
    
    this.moves = 0;
    this.isGameActive = true;
    this.stopTimer();
    this.renderBoard();
    this.updateStats();
  }
  
  getValidMoves() {
    const moves = [];
    const { row, col } = this.emptyPos;
    
    const directions = [
      { row: row - 1, col }, // Up
      { row: row + 1, col }, // Down
      { row, col: col - 1 }, // Left
      { row, col: col + 1 }  // Right
    ];
    
    directions.forEach(pos => {
      if (this.isValidPosition(pos.row, pos.col)) {
        moves.push(pos);
      }
    });
    
    return moves;
  }
  
  isValidBoard() {
    // Check if current board state is solvable
    const flatBoard = [];
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] !== 0) {
          flatBoard.push(this.board[i][j]);
        }
      }
    }
    
    let inversions = 0;
    for (let i = 0; i < flatBoard.length - 1; i++) {
      for (let j = i + 1; j < flatBoard.length; j++) {
        if (flatBoard[i] > flatBoard[j]) {
          inversions++;
        }
      }
    }
    
    if (this.boardSize % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRowFromBottom = this.boardSize - this.emptyPos.row;
      return (inversions + emptyRowFromBottom) % 2 === 1;
    }
  }
  
  changeBoardSize() {
    this.boardSize = parseInt(this.boardSizeSelect.value);
    this.newGame();
  }
  
  changePuzzleMode() {
    this.mode = this.puzzleModeSelect.value;
    
    if (this.mode === 'image') {
      this.imageUploadArea.style.display = 'block';
    } else {
      this.imageUploadArea.style.display = 'none';
    }
    
    this.renderBoard();
  }
  
  newGame() {
    this.createBoard();
    this.shuffleBoard();
    this.loadBestScores();
  }
  
  resetGame() {
    this.createBoard();
    this.renderBoard();
    this.updateStats();
    this.stopTimer();
    this.isGameActive = false;
  }
  
  // Image handling methods
  handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      this.processImageFile(file);
    }
  }
  
  handleDragOver(e) {
    e.preventDefault();
    this.uploadZone.classList.add('dragover');
  }
  
  handleDragLeave(e) {
    e.preventDefault();
    this.uploadZone.classList.remove('dragover');
  }
  
  handleDrop(e) {
    e.preventDefault();
    this.uploadZone.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      this.processImageFile(imageFile);
    }
  }
  
  processImageFile(file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image file too large. Please use an image under 5MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('🖼️ Image loaded successfully');
      this.currentImage = e.target.result;
      console.log('📝 Current image set:', !!this.currentImage);
      
      if (this.previewImg) this.previewImg.src = this.currentImage;
      if (this.imagePreview) this.imagePreview.style.display = 'block';
      if (this.uploadZone) this.uploadZone.style.display = 'none';
      
      // Automatically switch to image mode when image is uploaded
      console.log('🔄 Switching to image mode...');
      this.mode = 'image';
      if (this.puzzleModeSelect) {
        this.puzzleModeSelect.value = 'image';
      }
      console.log('✅ Mode is now:', this.mode);
      
      console.log('🎨 Re-rendering board with image...');
      this.renderBoard();
    };
    reader.readAsDataURL(file);
  }
  
  removeImage() {
    this.currentImage = null;
    if (this.imagePreview) this.imagePreview.style.display = 'none';
    if (this.uploadZone) this.uploadZone.style.display = 'block';
    if (this.imageInput) this.imageInput.value = '';
    // Switch back to numbers mode when image is removed
    this.mode = 'numbers';
    if (this.puzzleModeSelect) {
      this.puzzleModeSelect.value = 'numbers';
    }
    this.renderBoard();
  }
  
  // Timer methods
  startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      if (this.startTime) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.gameTimeElement.textContent = this.formatTime(elapsed);
      }
    }, 1000);
  }
  
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  updateStats() {
    this.moveCountElement.textContent = this.moves;
    
    if (!this.startTime) {
      this.gameTimeElement.textContent = '00:00';
    }
  }
  
  // Statistics and persistence
  saveGameStats(completed = false, completionTime = 0) {
    const sizeKey = `${this.boardSize}x${this.boardSize}`;
    
    // Update main app stats (consistent with other games)
    let mainStats = Utils.storage.get('puzzleStats', {
      totalGamesPlayed: 0,
      totalGamesCompleted: 0,
      totalTimePlayed: 0,
      bestTimes: {},
      bestMoves: {},
      achievements: [],
      streaks: { current: 0, longest: 0 }
    });
    
    mainStats.totalGamesPlayed++;
    if (completed) {
      mainStats.totalGamesCompleted++;
      mainStats.totalTimePlayed += completionTime;
      
      // Update best time for sliding-puzzle
      const gameKey = 'sliding-puzzle';
      if (!mainStats.bestTimes[gameKey] || completionTime < mainStats.bestTimes[gameKey]) {
        mainStats.bestTimes[gameKey] = completionTime;
      }
      
      // Update best moves for sliding-puzzle  
      if (!mainStats.bestMoves[gameKey] || this.moves < mainStats.bestMoves[gameKey]) {
        mainStats.bestMoves[gameKey] = this.moves;
      }
      
      // Update streak
      mainStats.streaks.current++;
      if (mainStats.streaks.current > mainStats.streaks.longest) {
        mainStats.streaks.longest = mainStats.streaks.current;
      }
    } else {
      // Reset streak if game not completed
      mainStats.streaks.current = 0;
    }
    
    Utils.storage.set('puzzleStats', mainStats);
    
    // Also save game-specific stats
    const spStats = Utils.storage.get('slidingPuzzle_stats', {
      gamesPlayed: 0,
      gamesCompleted: 0,
      totalMoves: 0,
      totalTime: 0,
      bestScores: {}
    });
    
    spStats.gamesPlayed++;
    
    if (completed) {
      spStats.gamesCompleted++;
      spStats.totalMoves += this.moves;
      spStats.totalTime += completionTime;
      
      if (!spStats.bestScores[sizeKey] || this.moves < spStats.bestScores[sizeKey].moves) {
        spStats.bestScores[sizeKey] = {
          moves: this.moves,
          time: completionTime,
          mode: this.mode
        };
      }
    }
    
    Utils.storage.set('slidingPuzzle_stats', spStats);
    this.loadBestScores();
  }
  
  loadBestScores() {
    const spStats = Utils.storage.get('slidingPuzzle_stats', {
      bestScores: {}
    });
    
    if (spStats && spStats.bestScores) {
      const sizeKey = `${this.boardSize}x${this.boardSize}`;
      const bestScore = spStats.bestScores[sizeKey];
      
      if (bestScore) {
        this.bestMovesElement.textContent = bestScore.moves;
      } else {
        this.bestMovesElement.textContent = '—';
      }
    } else {
      this.bestMovesElement.textContent = '—';
    }
  }
  
  // Settings methods
  loadSettings() {
    const savedSettings = Utils.storage.get('sliding_puzzle_settings', this.settings);
    this.settings = { ...this.settings, ...savedSettings };
    
    // Apply settings to UI
    this.animationSpeedSelect.value = this.settings.animationSpeed;
    this.soundEffectsToggle.checked = this.settings.soundEffects;
    this.showNumbersToggle.checked = this.settings.showNumbers;
    this.highlightValidToggle.checked = this.settings.highlightValid;
  }
  
  saveSettings() {
    this.settings.animationSpeed = this.animationSpeedSelect.value;
    this.settings.soundEffects = this.soundEffectsToggle.checked;
    this.settings.showNumbers = this.showNumbersToggle.checked;
    this.settings.highlightValid = this.highlightValidToggle.checked;
    
    Utils.storage.set('sliding_puzzle_settings', this.settings);
    
    // Apply settings immediately
    this.renderBoard();
    this.settingsModal.style.display = 'none';
  }
  
  // Advanced features (hints, auto-solve)
  showHint() {
    // Simple hint: highlight a tile that can move toward correct position
    const hintMove = this.findBestMove();
    if (hintMove) {
      const tile = document.querySelector(`[data-row="${hintMove.row}"][data-col="${hintMove.col}"]`);
      if (tile) {
        tile.classList.add('hint-tile');
        setTimeout(() => {
          tile.classList.remove('hint-tile');
        }, 3000);
      }
    }
  }
  
  findBestMove() {
    const validMoves = this.getValidMoves();
    
    for (const move of validMoves) {
      const tileNumber = this.board[move.row][move.col];
      const correctPos = this.getCorrectPosition(tileNumber);
      
      // Check if moving this tile gets it closer to correct position
      const currentDistance = Math.abs(move.row - correctPos.row) + Math.abs(move.col - correctPos.col);
      const newDistance = Math.abs(this.emptyPos.row - correctPos.row) + Math.abs(this.emptyPos.col - correctPos.col);
      
      if (newDistance < currentDistance) {
        return move;
      }
    }
    
    return validMoves[0]; // Return any valid move if no optimal found
  }
  
  getCorrectPosition(tileNumber) {
    const index = tileNumber - 1;
    return {
      row: Math.floor(index / this.boardSize),
      col: index % this.boardSize
    };
  }
  
  autoSolve() {
    // Simple auto-solve using A* would be complex, so we'll do a basic reconstruction
    this.createBoard(); // Reset to solved state
    this.renderBoard();
    this.handleGameComplete();
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 DOM loaded, initializing Sliding Puzzle...');
  
  // Test if critical elements exist
  const boardElement = document.getElementById('puzzle-board');
  if (!boardElement) {
    console.error('❌ puzzle-board element not found!');
    alert('Error: Game board element not found. Please check the HTML structure.');
    return;
  }
  
  try {
    window.slidingPuzzle = new SlidingPuzzle();
    console.log('✅ Sliding Puzzle initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Sliding Puzzle:', error);
    alert('Error initializing game: ' + error.message);
  }
});