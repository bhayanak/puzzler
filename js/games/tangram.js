/** Tangram Game */
class TangramGame {
    constructor() {
        this.puzzleNum = 1;
        this.pieces = [];
        this.selectedPiece = null;
        this.dragOffset = {x: 0, y: 0};
        this.initializeDOM();
        this.newPuzzle();
    }
    
    initializeDOM() {
        this.boardElement = document.getElementById('tangram-board');
        this.puzzleElement = document.getElementById('puzzle-num');
        document.getElementById('next-btn').addEventListener('click', () => this.nextPuzzle());
        
        // Mouse/touch event handlers for dragging
        this.boardElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.boardElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.boardElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.boardElement.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.boardElement.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.boardElement.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }
    
    newPuzzle() {
        this.createPieces();
        this.render();
    }
    
    createPieces() {
        // Define 7 tangram pieces with SVG paths
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#00b894'];
        
        this.pieces = [
            // Large triangle 1
            {id: 0, path: 'M0,0 L100,0 L0,100 Z', color: colors[0], x: 50, y: 50, rotation: 0, scale: 1},
            // Large triangle 2
            {id: 1, path: 'M0,0 L100,0 L0,100 Z', color: colors[1], x: 200, y: 50, rotation: 0, scale: 1},
            // Medium triangle
            {id: 2, path: 'M0,0 L70,0 L0,70 Z', color: colors[2], x: 50, y: 200, rotation: 0, scale: 1},
            // Small triangle 1
            {id: 3, path: 'M0,0 L50,0 L0,50 Z', color: colors[3], x: 200, y: 200, rotation: 0, scale: 1},
            // Small triangle 2
            {id: 4, path: 'M0,0 L50,0 L0,50 Z', color: colors[4], x: 280, y: 200, rotation: 0, scale: 1},
            // Square
            {id: 5, path: 'M0,0 L50,0 L50,50 L0,50 Z', color: colors[5], x: 150, y: 150, rotation: 0, scale: 1},
            // Parallelogram
            {id: 6, path: 'M0,0 L70,0 L50,50 L-20,50 Z', color: colors[6], x: 300, y: 100, rotation: 0, scale: 1}
        ];
    }
    
    render() {
        this.boardElement.innerHTML = `
            <div style="margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-radius: 8px; text-align: center;">
                <strong>🎯 Target: SQUARE</strong> - Arrange all 7 pieces to form a square shape
            </div>
            <svg width="100%" height="500" style="border: 2px solid #ddd; border-radius: 8px; background: #f8f9fa;">
                <defs>
                    <filter id="shadow">
                        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                    </filter>
                </defs>
                ${this.pieces.map(piece => this.renderPiece(piece)).join('')}
            </svg>
            <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px;">
                <strong>🎮 Controls:</strong><br>
                • <strong>Drag</strong> pieces to move them<br>
                • <strong>Right-click</strong> or <strong>Double-tap</strong> to rotate<br>
                • <strong>Scroll wheel</strong> over piece to rotate (desktop)
            </div>
        `;
        
        // Add rotation event listeners to pieces
        this.pieces.forEach(piece => {
            const element = document.getElementById(`piece-${piece.id}`);
            if (element) {
                element.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.rotatePiece(piece);
                });
                element.addEventListener('dblclick', () => this.rotatePiece(piece));
                element.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    this.rotatePiece(piece, e.deltaY > 0 ? -15 : 15);
                });
            }
        });
        
        this.puzzleElement.textContent = this.puzzleNum;
    }
    
    renderPiece(piece) {
        return `
            <g id="piece-${piece.id}" 
               transform="translate(${piece.x}, ${piece.y}) rotate(${piece.rotation}) scale(${piece.scale})"
               style="cursor: grab; filter: url(#shadow);">
                <path d="${piece.path}" 
                      fill="${piece.color}" 
                      stroke="#333" 
                      stroke-width="2"
                      opacity="0.9"/>
            </g>
        `;
    }
    
    onMouseDown(e) {
        const piece = this.getPieceAtPoint(e.offsetX, e.offsetY);
        if (piece) {
            this.selectedPiece = piece;
            this.dragOffset = {
                x: e.offsetX - piece.x,
                y: e.offsetY - piece.y
            };
            e.target.style.cursor = 'grabbing';
        }
    }
    
    onMouseMove(e) {
        if (this.selectedPiece) {
            this.selectedPiece.x = e.offsetX - this.dragOffset.x;
            this.selectedPiece.y = e.offsetY - this.dragOffset.y;
            this.render();
        }
    }
    
    onMouseUp(e) {
        if (this.selectedPiece) {
            this.selectedPiece = null;
            e.target.style.cursor = 'grab';
        }
    }
    
    onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.boardElement.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const piece = this.getPieceAtPoint(x, y);
        if (piece) {
            this.selectedPiece = piece;
            this.dragOffset = {
                x: x - piece.x,
                y: y - piece.y
            };
        }
    }
    
    onTouchMove(e) {
        e.preventDefault();
        if (this.selectedPiece) {
            const touch = e.touches[0];
            const rect = this.boardElement.getBoundingClientRect();
            this.selectedPiece.x = touch.clientX - rect.left - this.dragOffset.x;
            this.selectedPiece.y = touch.clientY - rect.top - this.dragOffset.y;
            this.render();
        }
    }
    
    onTouchEnd(e) {
        this.selectedPiece = null;
    }
    
    getPieceAtPoint(x, y) {
        // Check pieces in reverse order (top to bottom)
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            const piece = this.pieces[i];
            const dx = x - piece.x;
            const dy = y - piece.y;
            // Simple bounding box check
            if (Math.abs(dx) < 60 && Math.abs(dy) < 60) {
                return piece;
            }
        }
        return null;
    }
    
    rotatePiece(piece, angle = 45) {
        piece.rotation = (piece.rotation + angle) % 360;
        this.render();
    }
    
    nextPuzzle() {
        this.puzzleNum++;
        this.updateGlobalStats();
        this.newPuzzle();
    }
    
    updateGlobalStats() {
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        puzzleStats.totalGamesCompleted++;
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
    }
}
