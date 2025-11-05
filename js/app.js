/* ===========================
   Main Application Logic
   =========================== */

class PuzzleApp {
  constructor() {
    this.currentGame = null;
    this.gameStats = Utils.storage.get('puzzleStats', {
      totalGamesPlayed: 0,
      totalGamesCompleted: 0,
      totalTimePlayed: 0,
      bestTimes: {},
      bestMoves: {},
      achievements: [],
      streaks: {
        current: 0,
        longest: 0
      }
    });
    
    this.settings = Utils.storage.get('puzzleSettings', {
      soundEnabled: true,
      animationsEnabled: true,
      difficulty: 'intermediate',
      theme: 'default'
    });
    
    this.init();
  }

  init() {
    console.log('🎮 Initializing Puzzle Application...');
    
    // Setup DOM event listeners
    this.setupEventListeners();
    
    // Initialize navigation
    this.setupNavigation();
    
    // Load statistics
    this.updateStatsDisplay();
    
    // Setup smooth scrolling for anchor links
    this.setupSmoothScrolling();
    
    // Initialize responsive navigation
    this.setupMobileNavigation();
    
    // Setup game info modals
    this.setupModals();
    
    // Load any URL parameters
    this.handleUrlParams();
    
    console.log('✅ Puzzle Application initialized successfully');
  }

  setupEventListeners() {
    // Global click handler for game cards and buttons
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // Handle game start buttons
      if (target.matches('[onclick*="startGame"]')) {
        e.preventDefault();
        const gameType = target.getAttribute('onclick').match(/startGame\('([^']+)'\)/)?.[1];
        if (gameType) {
          this.startGame(gameType);
        }
      }
      
      // Handle game info buttons
      if (target.matches('[onclick*="showGameInfo"]')) {
        e.preventDefault();
        const gameType = target.getAttribute('onclick').match(/showGameInfo\('([^']+)'\)/)?.[1];
        if (gameType) {
          this.showGameInfo(gameType);
        }
      }
      
      // Handle modal close buttons
      if (target.matches('[onclick*="closeModal"]')) {
        e.preventDefault();
        this.closeModal();
      }
      
      // Handle footer modal buttons
      if (target.matches('[onclick*="showFooterModal"]')) {
        e.preventDefault();
        const modalType = target.getAttribute('onclick').match(/showFooterModal\('([^']+)'\)/)?.[1];
        if (modalType) {
          this.showFooterModal(modalType);
        }
      }
      
      // Handle footer modal close buttons
      if (target.matches('[onclick*="closeFooterModal"]')) {
        e.preventDefault();
        this.closeFooterModal();
      }
    });

    // Refresh stats when returning to the page
    window.addEventListener('focus', () => {
      this.updateStatsDisplay();
    });
    
    // Also refresh on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateStatsDisplay();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Close modal with Escape key
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeFooterModal();
      }
      
      // Navigation with arrow keys
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        this.handleKeyboardNavigation(e.key);
      }
    });

    // Window resize handler
    window.addEventListener('resize', Utils.throttle(() => {
      this.handleResize();
    }, 250));

    // Page visibility change (for pausing games)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseCurrentGame();
      } else {
        this.resumeCurrentGame();
      }
    });
  }

  setupNavigation() {
    const navLinks = Utils.$$('.nav-link');
    
    navLinks.forEach(link => {
      Utils.on(link, 'click', (e) => {
        // Don't prevent default if the link has an onclick attribute (like Settings)
        if (!link.hasAttribute('onclick')) {
          e.preventDefault();
        }
        
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Get target section
        const target = link.getAttribute('href');
        if (target && target.startsWith('#')) {
          this.scrollToSection(target);
        }
      });
    });
  }

  setupSmoothScrolling() {
    // Handle anchor link clicks
    Utils.$$('a[href^="#"]').forEach(anchor => {
      Utils.on(anchor, 'click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        this.scrollToSection(targetId);
      });
    });
    
    // Refresh stats when page becomes visible (user returns from game)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateStatsDisplay();
      }
    });
  }

  scrollToSection(targetId) {
    const targetElement = Utils.$(targetId);
    if (targetElement) {
      const headerHeight = Utils.$('.app-header')?.offsetHeight || 0;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  setupMobileNavigation() {
    const navToggle = Utils.$('.nav-toggle');
    const navMenu = Utils.$('.nav-menu');
    
    if (navToggle && navMenu) {
      Utils.on(navToggle, 'click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Animate hamburger icon
        const spans = navToggle.querySelectorAll('span');
        spans.forEach((span, index) => {
          if (navToggle.classList.contains('active')) {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
          } else {
            span.style.transform = '';
            span.style.opacity = '';
          }
        });
      });
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove('active');
          navToggle.classList.remove('active');
          
          // Reset hamburger icon
          navToggle.querySelectorAll('span').forEach(span => {
            span.style.transform = '';
            span.style.opacity = '';
          });
        }
      });
    }
  }

  setupModals() {
    const modal = Utils.$('#game-info-modal');
    if (modal) {
      // Close modal when clicking backdrop
      Utils.on(modal, 'click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }
    
    const footerModal = Utils.$('#footer-modal');
    if (footerModal) {
      // Close footer modal when clicking backdrop
      Utils.on(footerModal, 'click', (e) => {
        if (e.target === footerModal) {
          this.closeFooterModal();
        }
      });
    }
  }

  handleUrlParams() {
    const params = Utils.getUrlParams();
    
    // Auto-start game if specified in URL
    if (params.game) {
      this.startGame(params.game);
    }
    
    // Jump to section if specified
    if (params.section) {
      setTimeout(() => {
        this.scrollToSection(`#${params.section}`);
      }, 500);
    }
    
    // Check for new achievements when returning from game
    if (params.returning === 'true') {
      setTimeout(() => {
        this.checkForNewAchievements();
      }, 1000);
    }
  }
  
  checkForNewAchievements() {
    // Refresh stats first
    this.updateStatsDisplay();
    
    // Get recent achievements (last 5 minutes)
    const recentAchievements = this.gameStats.achievements.filter(achievement => {
      // For now, show all achievements since we don't have timestamps
      // In a real app, you'd filter by timestamp
      return true;
    });
    
    if (recentAchievements.length > 0) {
      // Show the most recent achievement
      const latestAchievement = recentAchievements[recentAchievements.length - 1];
      this.showAlert(`🏆 Achievement Unlocked: ${latestAchievement}`, 'success');
    }
  }

  handleResize() {
    // Update mobile navigation state
    const navMenu = Utils.$('.nav-menu');
    if (window.innerWidth > 767 && navMenu?.classList.contains('active')) {
      navMenu.classList.remove('active');
    }
    
    // Notify current game of resize
    if (this.currentGame && typeof this.currentGame.handleResize === 'function') {
      this.currentGame.handleResize();
    }
  }

  handleKeyboardNavigation(key) {
    const gameCards = Utils.$$('.game-card');
    const currentFocus = document.activeElement;
    
    let currentIndex = Array.from(gameCards).indexOf(currentFocus);
    if (currentIndex === -1) currentIndex = 0;
    
    if (key === 'ArrowLeft' && currentIndex > 0) {
      gameCards[currentIndex - 1].focus();
    } else if (key === 'ArrowRight' && currentIndex < gameCards.length - 1) {
      gameCards[currentIndex + 1].focus();
    }
  }

  async startGame(gameType) {
    console.log(`🎯 Starting game: ${gameType}`);
    
    try {
      // Show loading overlay
      this.showLoading('Loading your puzzle...');
      
      // Load game-specific assets and initialize
      switch (gameType) {
        case 'tower-of-hanoi':
          // Update URL for embedded games
          Utils.setUrlParam('game', gameType);
          await this.loadTowerOfHanoi();
          break;
        case 'sliding-puzzle':
          await this.loadSlidingPuzzle();
          break;
        case 'lights-out':
          await this.loadLightsOut();
          break;
        case 'sudoku':
          // Navigate immediately to sudoku page
          window.location.href = 'games/sudoku.html';
          return; // Exit immediately to prevent any further execution
          break;
        default:
          throw new Error(`Unknown game type: ${gameType}`);
      }
      
    } catch (error) {
      console.error('Failed to start game:', error);
      this.showError('Failed to load game. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  async loadTowerOfHanoi() {
    // Check if Tower of Hanoi script is already loaded
    if (!window.TowerOfHanoi) {
      // Dynamically load the game script
      await this.loadScript('js/games/tower-of-hanoi.js');
      
      // Load game-specific CSS
      await this.loadStylesheet('css/games/tower-of-hanoi.css');
    }
    
    // Navigate to game page
    window.location.href = 'games/tower-of-hanoi.html';
  }

  async loadSlidingPuzzle() {
    // Navigate directly to game page - scripts are loaded there
    window.location.href = 'games/sliding-puzzle.html';
  }

  async loadLightsOut() {
    // Navigate directly to game page - scripts are loaded there
    window.location.href = 'games/lights-out.html';
  }

  async loadSudoku() {
    // Navigate directly to game page - scripts are loaded there
    console.log('🚀 Navigating to Sudoku game...');
    window.location.href = 'games/sudoku.html';
    return; // Prevent any further execution
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadStylesheet(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  showGameInfo(gameType) {
    const modal = Utils.$('#game-info-modal');
    const modalTitle = Utils.$('#modal-title');
    const modalBody = Utils.$('#modal-body');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    const gameInfo = this.getGameInfo(gameType);
    
    modalTitle.textContent = gameInfo.title;
    modalBody.innerHTML = gameInfo.content;
    
    modal.classList.add('active');
    
    // Focus management for accessibility
    modal.setAttribute('aria-hidden', 'false');
    Utils.$('.modal-close')?.focus();
  }

  closeModal() {
    const modal = Utils.$('#game-info-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  showFooterModal(type) {
    const modal = Utils.$('#footer-modal');
    const title = Utils.$('#footer-modal-title');
    const content = Utils.$('#footer-modal-body');
    
    if (!modal || !title || !content) return;

    const footerContent = this.getFooterContent(type);
    title.textContent = footerContent.title;
    content.innerHTML = footerContent.content;
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus on close button for accessibility
    Utils.$('#footer-modal .modal-close')?.focus();
  }

  closeFooterModal() {
    const modal = Utils.$('#footer-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  getGameInfo(gameType) {
    const gameInfoData = {
      'tower-of-hanoi': {
        title: 'Tower of Hanoi Rules',
        content: `
          <div class="game-rules">
            <h4>Objective</h4>
            <p>Move all disks from the left tower to the right tower.</p>
            
            <h4>Rules</h4>
            <ol>
              <li>You can only move one disk at a time</li>
              <li>You can only move the top disk from a tower</li>
              <li>You cannot place a larger disk on top of a smaller disk</li>
            </ol>
            
            <h4>Strategy Tips</h4>
            <ul>
              <li>Start by moving the smallest disk</li>
              <li>Always alternate between moving the smallest disk and making the only legal move not involving the smallest disk</li>
              <li>Think ahead - each move should contribute to your overall strategy</li>
            </ul>
            
            <h4>Difficulty Levels</h4>
            <ul>
              <li><strong>3 disks:</strong> 7 moves minimum (Beginner)</li>
              <li><strong>4 disks:</strong> 15 moves minimum (Intermediate)</li>
              <li><strong>5 disks:</strong> 31 moves minimum (Advanced)</li>
              <li><strong>6+ disks:</strong> 63+ moves minimum (Expert)</li>
            </ul>
          </div>
        `
      },
      'sliding-puzzle': {
        title: 'Sliding Puzzle Rules',
        content: `
          <div class="game-rules">
            <h4>Objective</h4>
            <p>Arrange the numbered tiles (or image pieces) in correct order by sliding them into the empty space.</p>
            
            <h4>How to Play</h4>
            <ol>
              <li>Click or tap a tile adjacent to the empty space to slide it</li>
              <li>Use arrow keys to move tiles (↑↓←→)</li>
              <li>On mobile: swipe tiles toward the empty space</li>
              <li>Continue until all tiles are in numerical order</li>
            </ol>
            
            <h4>Game Features</h4>
            <ul>
              <li><strong>Multiple Sizes:</strong> 3×3 (8-puzzle), 4×4 (15-puzzle), 5×5 (24-puzzle)</li>
              <li><strong>Custom Images:</strong> Upload your own photos for personalized puzzles</li>
              <li><strong>Smart Shuffling:</strong> Guaranteed solvable starting positions</li>
              <li><strong>Hint System:</strong> Get suggestions when stuck</li>
            </ul>
            
            <h4>Strategy Tips</h4>
            <ul>
              <li>Start by solving the top row from left to right</li>
              <li>Work systematically row by row</li>
              <li>Practice with 3×3 grids before attempting larger puzzles</li>
              <li>Use the hint feature to learn optimal move patterns</li>
            </ul>
            
            <h4>Difficulty Levels</h4>
            <ul>
              <li><strong>3×3 (8-Puzzle):</strong> Perfect for beginners ★★☆☆☆</li>
              <li><strong>4×4 (15-Puzzle):</strong> Classic challenging experience ★★★☆☆</li>
              <li><strong>5×5 (24-Puzzle):</strong> Expert level difficulty ★★★★★</li>
            </ul>
          </div>
        `
      },
      'lights-out': {
        title: 'Lights Out Rules',
        content: `
          <div class="game-rules">
            <h4>Objective</h4>
            <p>Turn off all the lights on the grid. Sounds simple? Think again!</p>
            
            <h4>How to Play</h4>
            <ol>
              <li>Click any light to toggle it and its adjacent neighbors</li>
              <li>When you click a light, it affects lights above, below, left, and right</li>
              <li>Continue clicking until all lights are turned off</li>
              <li>Use keyboard arrows and Space/Enter for accessibility</li>
            </ol>
            
            <h4>Game Features</h4>
            <ul>
              <li><strong>Multiple Grid Sizes:</strong> 3×3, 5×5, 7×7 for varying difficulty</li>
              <li><strong>Pattern Library:</strong> Cross, corners, border, checkerboard and more</li>
              <li><strong>Visual Themes:</strong> Classic gold, neon, retro, and rainbow effects</li>
              <li><strong>AI Solver:</strong> Get hints or watch the computer solve automatically</li>
              <li><strong>Custom Designer:</strong> Create your own starting patterns</li>
            </ul>
            
            <h4>Strategy Tips</h4>
            <ul>
              <li>Each cell can only be pressed once in an optimal solution</li>
              <li>Work systematically - don't just click randomly</li>
              <li>Use the hint system to learn solving patterns</li>
              <li>Some puzzles have no solution - the game ensures all generated patterns are solvable</li>
              <li>Practice with 3×3 grids to understand the mechanics</li>
            </ul>
            
            <h4>Difficulty Levels</h4>
            <ul>
              <li><strong>3×3 Grid:</strong> Quick puzzles, perfect for learning ★★☆☆☆</li>
              <li><strong>5×5 Grid:</strong> Classic challenge with good complexity ★★★☆☆</li>
              <li><strong>7×7 Grid:</strong> Advanced puzzles requiring strategy ★★★★★</li>
            </ul>
          </div>
        `
      },
      'sudoku': {
        title: 'Sudoku Rules',
        content: `
          <div class="game-rules">
            <h4>Objective</h4>
            <p>Fill the 9×9 grid with digits 1-9 so that each row, column, and 3×3 box contains all numbers exactly once.</p>
            
            <h4>How to Play</h4>
            <ol>
              <li>Click any empty cell to select it</li>
              <li>Use the number pad or keyboard (1-9) to enter digits</li>
              <li>Use the erase button or Delete/Backspace to clear cells</li>
              <li>Navigate with arrow keys for keyboard-only play</li>
            </ol>
            
            <h4>Game Features</h4>
            <ul>
              <li><strong>Multiple Difficulties:</strong> Easy to Expert with varying clue counts</li>
              <li><strong>Smart Validation:</strong> Real-time conflict detection and checking</li>
              <li><strong>Hint System:</strong> Get stuck? Use hints to learn solving techniques</li>
              <li><strong>Auto-solve:</strong> Watch the AI solve the puzzle step by step</li>
              <li><strong>Visual Aids:</strong> Highlight related cells and conflicts</li>
              <li><strong>Statistics:</strong> Track your progress and best times per difficulty</li>
            </ul>
            
            <h4>Strategy Tips</h4>
            <ul>
              <li>Start with cells that can only contain one possible number</li>
              <li>Look for "naked singles" - cells where only one digit fits</li>
              <li>Use process of elimination within rows, columns, and boxes</li>
              <li>Look for "hidden singles" - digits that can only go in one cell in a group</li>
              <li>Work systematically rather than guessing randomly</li>
            </ul>
            
            <h4>Difficulty Levels</h4>
            <ul>
              <li><strong>Easy (35-40 clues):</strong> Great for beginners ★★☆☆☆</li>
              <li><strong>Medium (30-35 clues):</strong> Balanced challenge ★★★☆☆</li>
              <li><strong>Hard (25-30 clues):</strong> Advanced techniques required ★★★★☆</li>
              <li><strong>Expert (20-25 clues):</strong> Master-level puzzles ★★★★★</li>
            </ul>
          </div>
        `
      }
    };
    
    return gameInfoData[gameType] || {
      title: 'Game Information',
      content: '<p>Game information not available.</p>'
    };
  }

  getFooterContent(type) {
    const footerContentData = {
      'about': {
        title: 'About Puzzle Hub',
        content: `
          <div class="footer-content">
            <h4>Welcome to Puzzle Hub</h4>
            <p>A collection of classic puzzle games designed to challenge your mind and provide hours of entertainment. Our platform features carefully crafted implementations of beloved puzzle games with modern, responsive design.</p>
            
            <h4>Featured Games</h4>
            <ul>
              <li><strong>Tower of Hanoi:</strong> The classic mathematical puzzle with variable difficulty</li>
              <li><strong>Lights Out:</strong> Toggle lights to solve challenging grid patterns</li>
              <li><strong>Sudoku:</strong> Number placement puzzles with multiple generation patterns</li>
            </ul>
            
            <h4>Features</h4>
            <ul>
              <li>💾 Local progress tracking and best time records</li>
              <li>🎯 Multiple difficulty levels for each game</li>
              <li>📱 Responsive design that works on all devices</li>
              <li>🏆 Achievement tracking and statistics</li>
              <li>♿ Accessible design with keyboard navigation</li>
            </ul>
            
            <p><strong>Version:</strong> 1.0.0 | <strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        `
      },
      'contact': {
        title: 'Contact Us',
        content: `
          <div class="footer-content">
            <h4>Get in Touch</h4>
            <p>We'd love to hear from you! Whether you have feedback, suggestions, or just want to say hello, there are several ways to reach us.</p>
            
            <h4>Contact Information</h4>
            <div class="contact-info">
              <p><strong>📧 Email:</strong> <a href="mailto:info@puzzlehub.com">info@puzzlehub.com</a></p>
              <p><strong>🐙 GitHub:</strong> <a href="https://github.com/bhayanak/puzzler" target="_blank">github.com/puzzlehub</a></p>
            </div>
            
            <h4>Feedback & Suggestions</h4>
            <p>Have an idea for a new game or feature? Found a bug? We appreciate all feedback!</p>
            <ul>
              <li>Report bugs or suggest features on our GitHub repository</li>
              <li>Send us an email with your thoughts and ideas</li>
              <li>Follow us on social media for updates and announcements</li>
            </ul>
            
            <h4>Support</h4>
            <p>Having trouble with a puzzle? Check out the game rules by clicking the "?" button on any game page, or reach out to us directly!</p>
          </div>
        `
      },
      'privacy': {
        title: 'Privacy Policy',
        content: `
          <div class="footer-content">
            <h4>Privacy Policy</h4>
            <p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>
            
            <h4>Information We Collect</h4>
            <p>Puzzle Hub is designed with privacy in mind. We collect minimal information to provide you with the best gaming experience:</p>
            <ul>
              <li><strong>Local Game Data:</strong> Your game progress, best times, and statistics are stored locally in your browser</li>
              <li><strong>No Personal Information:</strong> We do not collect names, email addresses, or other personal data</li>
              <li><strong>No Tracking:</strong> We do not use cookies, analytics, or tracking scripts</li>
            </ul>
            
            <h4>Data Storage</h4>
            <p>All your game data is stored using your browser's localStorage feature:</p>
            <ul>
              <li>Data never leaves your device</li>
              <li>You can clear your data anytime through browser settings</li>
              <li>Data persists between sessions for convenience</li>
            </ul>
            
            <h4>Third-Party Services</h4>
            <p>Puzzle Hub does not integrate with any third-party services, social networks, or advertising platforms.</p>
            
            <h4>Data Security</h4>
            <p>Since all data is stored locally on your device, you maintain complete control over your information. No data is transmitted to external servers.</p>
            
            <h4>Changes to Privacy Policy</h4>
            <p>Any changes to this privacy policy will be reflected in the "Last updated" date above. Continued use of the application constitutes acceptance of any changes.</p>
          </div>
        `
      },
      'settings': {
        title: 'Settings',
        content: `
          <div class="footer-content">
            <h4>Game Settings</h4>
            <p>Customize your Puzzle Hub experience with these options:</p>
            
            <div class="settings-section">
              <h4>🎮 Game Preferences</h4>
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="sound-effects" checked> 
                  Enable sound effects
                </label>
              </div>
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="animations" checked> 
                  Enable animations
                </label>
              </div>
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="auto-save" checked> 
                  Auto-save progress
                </label>
              </div>
            </div>
            
            <div class="settings-section">
              <h4>📊 Statistics & Data</h4>
              <div class="setting-item">
                <button class="btn btn-secondary" onclick="exportGameData()">📤 Export Game Data</button>
                <p class="setting-desc">Download your statistics and progress as a JSON file</p>
              </div>
              <div class="setting-item">
                <button class="btn btn-secondary" onclick="importGameData()">📥 Import Game Data</button>
                <p class="setting-desc">Restore progress from a previously exported file</p>
              </div>
              <div class="setting-item">
                <button class="btn btn-danger" onclick="resetAllData()">🗑️ Reset All Data</button>
                <p class="setting-desc">Clear all game progress and statistics (cannot be undone)</p>
              </div>
            </div>
            
            <div class="settings-section">
              <h4>♿ Accessibility</h4>
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="high-contrast"> 
                  High contrast mode
                </label>
              </div>
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="large-buttons"> 
                  Larger buttons and text
                </label>
              </div>
              <div class="setting-item">
                <label>
                  <input type="checkbox" id="reduced-motion"> 
                  Reduce motion and animations
                </label>
              </div>
            </div>
            
            <p class="settings-note"><strong>Note:</strong> All settings are saved locally in your browser and will persist between sessions.</p>
          </div>
        `
      }
    };

    return footerContentData[type] || {
      title: 'Information',
      content: '<p>Content not available.</p>'
    };
  }

  showComingSoon(gameName) {
    this.showAlert(`${gameName} is coming soon! Stay tuned for updates.`, 'info');
  }

  showLoading(message = 'Loading...') {
    const overlay = Utils.$('#loading-overlay');
    const text = Utils.$('.loading-text');
    
    if (overlay && text) {
      text.textContent = message;
      overlay.classList.add('active');
    }
  }

  hideLoading() {
    const overlay = Utils.$('#loading-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  showAlert(message, type = 'info') {
    // Create alert element
    const alert = Utils.createElement('div', `alert alert-${type} fade-in`);
    alert.innerHTML = `
      <div class="alert-icon">${this.getAlertIcon(type)}</div>
      <div class="alert-content">${message}</div>
    `;
    
    // Insert at top of main content
    const mainContent = Utils.$('.main-content');
    if (mainContent) {
      mainContent.insertBefore(alert, mainContent.firstChild);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        Utils.fadeOut(alert).then(() => {
          alert.remove();
        });
      }, 5000);
    }
  }

  getAlertIcon(type) {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  showError(message) {
    this.showAlert(message, 'error');
  }

  pauseCurrentGame() {
    if (this.currentGame && typeof this.currentGame.pause === 'function') {
      this.currentGame.pause();
    }
  }

  resumeCurrentGame() {
    if (this.currentGame && typeof this.currentGame.resume === 'function') {
      this.currentGame.resume();
    }
  }

  updateStatsDisplay() {
    // Reload stats from localStorage to get latest data
    this.gameStats = Utils.storage.get('puzzleStats', {
      totalGamesPlayed: 0,
      totalGamesCompleted: 0,
      totalTimePlayed: 0,
      bestTimes: {},
      bestMoves: {},
      achievements: [],
      streaks: {
        current: 0,
        longest: 0
      }
    });
    
    // Update total games completed
    const totalGamesEl = Utils.$('#total-games');
    if (totalGamesEl) {
      totalGamesEl.textContent = Utils.formatNumber(this.gameStats.totalGamesCompleted);
    }
    
    // Update best time (best across all games)
    const bestTimeEl = Utils.$('#best-time');
    if (bestTimeEl) {
      const allBestTimes = Object.values(this.gameStats.bestTimes);
      if (allBestTimes.length > 0) {
        const overallBestTime = Math.min(...allBestTimes);
        bestTimeEl.textContent = Utils.formatTime(overallBestTime);
      } else {
        bestTimeEl.textContent = '--:--';
      }
    }
    
    // Update efficiency (completion rate)
    const efficiencyEl = Utils.$('#efficiency');
    if (efficiencyEl) {
      if (this.gameStats.totalGamesPlayed > 0) {
        const efficiency = (this.gameStats.totalGamesCompleted / this.gameStats.totalGamesPlayed) * 100;
        efficiencyEl.textContent = Math.round(efficiency) + '%';
      } else {
        efficiencyEl.textContent = '0%';
      }
    }
    
    // Update current streak
    const streakEl = Utils.$('#streak');
    if (streakEl) {
      streakEl.textContent = this.gameStats.streaks.current.toString();
    }
    
    // Update total time played
    const totalTimeEl = Utils.$('#total-time');
    if (totalTimeEl) {
      if (this.gameStats.totalTimePlayed > 0) {
        totalTimeEl.textContent = Utils.formatTime(this.gameStats.totalTimePlayed);
      } else {
        totalTimeEl.textContent = '00:00';
      }
    }
    
    // Update individual game best times on main page cards
    this.updateGameCardStats();
  }

  updateGameCardStats() {
    // Update individual game cards on main page with best times/moves and difficulty stars
    
    // Tower of Hanoi - uses main puzzleStats 
    const tohBestTimeEl = Utils.$('#tower-of-hanoi-best-time');
    if (tohBestTimeEl) {
      if (this.gameStats.bestTimes && this.gameStats.bestTimes['tower-of-hanoi']) {
        tohBestTimeEl.textContent = Utils.formatTime(this.gameStats.bestTimes['tower-of-hanoi']);
      } else {
        tohBestTimeEl.textContent = '--:--';
      }
    }
    
    // Sliding Puzzle - uses own localStorage (best moves)
    const slidingBestMovesEl = Utils.$('#sliding-puzzle-best-moves');
    if (slidingBestMovesEl) {
      const slidingStats = Utils.storage.get('slidingPuzzleStats', {});
      if (slidingStats.bestMoves && slidingStats.bestMoves !== Infinity) {
        slidingBestMovesEl.textContent = slidingStats.bestMoves.toString();
      } else {
        slidingBestMovesEl.textContent = '--';
      }
    }
    
    // Lights Out - uses own localStorage (best overall time)
    const lightsOutBestTimeEl = Utils.$('#lights-out-best-time');
    if (lightsOutBestTimeEl) {
      const lightsOutStats = Utils.storage.get('lightsOut_statistics', {});
      if (lightsOutStats.bestTime && lightsOutStats.bestTime !== Infinity) {
        lightsOutBestTimeEl.textContent = Utils.formatTime(lightsOutStats.bestTime);
      } else {
        lightsOutBestTimeEl.textContent = '--:--';
      }
    }
    
    // Sudoku - uses own localStorage (best time across all difficulties)
    const sudokuBestTimeEl = Utils.$('#sudoku-best-time');
    if (sudokuBestTimeEl) {
      const sudokuStats = Utils.storage.get('sudoku_stats', {});
      // Find the best time across all difficulty levels
      let bestTime = Infinity;
      Object.keys(sudokuStats).forEach(key => {
        if (key.startsWith('bestTime_') && sudokuStats[key] < bestTime) {
          bestTime = sudokuStats[key];
        }
      });
      
      if (bestTime !== Infinity) {
        sudokuBestTimeEl.textContent = Utils.formatTime(bestTime);
      } else {
        sudokuBestTimeEl.textContent = '--:--';
      }
    }
  }

  saveStats() {
    Utils.storage.set('puzzleStats', this.gameStats);
  }

  recordGameCompletion(gameType, moves, time, optimalMoves) {
    this.gameStats.totalGamesCompleted++;
    this.gameStats.totalTimePlayed += time;
    
    // Update best time for this game type
    if (!this.gameStats.bestTimes[gameType] || time < this.gameStats.bestTimes[gameType]) {
      this.gameStats.bestTimes[gameType] = time;
    }
    
    // Update best moves for this game type
    if (!this.gameStats.bestMoves[gameType] || moves < this.gameStats.bestMoves[gameType]) {
      this.gameStats.bestMoves[gameType] = moves;
    }
    
    // Update streak
    this.gameStats.streaks.current++;
    if (this.gameStats.streaks.current > this.gameStats.streaks.longest) {
      this.gameStats.streaks.longest = this.gameStats.streaks.current;
    }
    
    // Check for achievements
    this.checkAchievements(gameType, moves, time, optimalMoves);
    
    // Save to storage
    this.saveStats();
    
    // Update display
    this.updateStatsDisplay();
  }

  checkAchievements(gameType, moves, time, optimalMoves) {
    const achievements = [];
    
    // Perfect game achievement
    if (moves === optimalMoves) {
      achievements.push('Perfect Game - Completed with minimum moves!');
    }
    
    // Speed achievements
    if (gameType === 'tower-of-hanoi' && time < 60) {
      achievements.push('Speed Demon - Completed Tower of Hanoi in under 1 minute!');
    }
    
    // Streak achievements
    if (this.gameStats.streaks.current === 5) {
      achievements.push('On Fire - 5 games in a row!');
    } else if (this.gameStats.streaks.current === 10) {
      achievements.push('Unstoppable - 10 games in a row!');
    }
    
    // Show achievement notifications
    achievements.forEach(achievement => {
      setTimeout(() => this.showAlert(achievement, 'success'), 1000);
    });
    
    // Add to achievements list
    achievements.forEach(achievement => {
      if (!this.gameStats.achievements.includes(achievement)) {
        this.gameStats.achievements.push(achievement);
      }
    });
  }
}

// Utility functions for settings modal
function exportGameData() {
  const gameData = {
    towerOfHanoi: localStorage.getItem('towerOfHanoi-stats'),
    lightsOut: localStorage.getItem('lightsOut-stats'),
    sudoku: localStorage.getItem('sudoku-stats'),
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };
  
  const dataStr = JSON.stringify(gameData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `puzzle-hub-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  if (window.puzzleApp) {
    window.puzzleApp.showAlert('Game data exported successfully!', 'success');
  }
}

function importGameData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gameData = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!gameData.towerOfHanoi && !gameData.lightsOut && !gameData.sudoku) {
          throw new Error('Invalid game data format');
        }
        
        // Import data
        if (gameData.towerOfHanoi) localStorage.setItem('towerOfHanoi-stats', gameData.towerOfHanoi);
        if (gameData.lightsOut) localStorage.setItem('lightsOut-stats', gameData.lightsOut);
        if (gameData.sudoku) localStorage.setItem('sudoku-stats', gameData.sudoku);
        
        if (window.puzzleApp) {
          window.puzzleApp.showAlert('Game data imported successfully! Refresh the page to see updated statistics.', 'success');
        }
      } catch (error) {
        if (window.puzzleApp) {
          window.puzzleApp.showAlert('Error importing data: ' + error.message, 'error');
        }
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

function resetAllData() {
  if (confirm('Are you sure you want to reset all game data? This action cannot be undone!')) {
    if (confirm('This will delete all your progress, statistics, and best times. Are you absolutely sure?')) {
      localStorage.removeItem('towerOfHanoi-stats');
      localStorage.removeItem('lightsOut-stats');
      localStorage.removeItem('sudoku-stats');
      
      if (window.puzzleApp) {
        window.puzzleApp.showAlert('All game data has been reset. Refresh the page to see changes.', 'info');
      }
    }
  }
}

// Global functions for inline event handlers (legacy support)
window.startGame = (gameType) => {
  if (window.puzzleApp) {
    window.puzzleApp.startGame(gameType);
  }
};

window.showGameInfo = (gameType) => {
  if (window.puzzleApp) {
    window.puzzleApp.showGameInfo(gameType);
  }
};

window.closeModal = () => {
  if (window.puzzleApp) {
    window.puzzleApp.closeModal();
  }
};

window.showFooterModal = (type) => {
  if (window.puzzleApp) {
    window.puzzleApp.showFooterModal(type);
  }
};

window.closeFooterModal = () => {
  if (window.puzzleApp) {
    window.puzzleApp.closeFooterModal();
  }
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.puzzleApp = new PuzzleApp();
});

// Export for module use
window.PuzzleApp = PuzzleApp;

console.log('🚀 Main application script loaded');