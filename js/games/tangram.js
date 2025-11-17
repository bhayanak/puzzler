/** Tangram Game */
class TangramGame {
    constructor() {
        this.puzzleNum = 1;
        this.pieces = [];
        this.selectedPiece = null;
        this.dragOffset = {x: 0, y: 0};
        this.levels = this.createLevels();
        this.initializeDOM();
        this.newPuzzle();
    }
    
    initializeDOM() {
        this.boardElement = document.getElementById('tangram-board');
        this.puzzleElement = document.getElementById('puzzle-num');
        document.getElementById('next-btn').addEventListener('click', () => this.nextPuzzle());
        document.getElementById('solution-btn')?.addEventListener('click', () => this.showSolution());
        
        // Mouse/touch event handlers for dragging
        this.boardElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.boardElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.boardElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.boardElement.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.boardElement.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.boardElement.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }
    
    createLevels() {
        return [
            // Level 1: Square
            {
                name: 'Square',
                targetShape: 'M0,0 L200,0 L200,200 L0,200 Z',
                solution: [
                    { id: 0, x: 100, y: 0, rotation: 0 },     // Large triangle 1 - top right
                    { id: 1, x: 0, y: 100, rotation: 270 },   // Large triangle 2 - bottom left
                    { id: 2, x: 100, y: 100, rotation: 180 }, // Medium triangle - bottom right
                    { id: 3, x: 100, y: 0, rotation: 90 },    // Small triangle 1 - top middle
                    { id: 4, x: 50, y: 100, rotation: 0 },    // Small triangle 2 - center
                    { id: 5, x: 0, y: 50, rotation: 0 },      // Square - left middle
                    { id: 6, x: 0, y: 0, rotation: 0 }        // Parallelogram - top left
                ]
            },
            // Level 2: House
            {
                name: 'House',
                targetShape: 'M50,0 L150,0 L200,50 L200,200 L0,200 L0,50 Z',
                solution: [
                    { id: 0, x: 50, y: 0, rotation: 45 },     // Large triangle 1 - roof
                    { id: 1, x: 0, y: 50, rotation: 0 },      // Large triangle 2 - left wall
                    { id: 2, x: 150, y: 100, rotation: 270 }, // Medium triangle - right part
                    { id: 3, x: 100, y: 50, rotation: 180 },  // Small triangle 1 - roof detail
                    { id: 4, x: 50, y: 150, rotation: 0 },    // Small triangle 2 - door
                    { id: 5, x: 100, y: 150, rotation: 0 },   // Square - window
                    { id: 6, x: 0, y: 150, rotation: 0 }      // Parallelogram - base
                ]
            },
            // Level 3: Cat
            {
                name: 'Cat',
                targetShape: 'M20,20 L60,0 L100,20 L120,60 L100,100 L60,120 L20,100 L0,60 Z',
                solution: [
                    { id: 0, x: 60, y: 0, rotation: 315 },    // Large triangle 1 - head
                    { id: 1, x: 20, y: 60, rotation: 0 },     // Large triangle 2 - body
                    { id: 2, x: 100, y: 60, rotation: 90 },   // Medium triangle - tail
                    { id: 3, x: 40, y: 10, rotation: 135 },   // Small triangle 1 - ear
                    { id: 4, x: 80, y: 10, rotation: 45 },    // Small triangle 2 - ear
                    { id: 5, x: 50, y: 50, rotation: 0 },     // Square - body
                    { id: 6, x: 20, y: 100, rotation: 0 }     // Parallelogram - leg
                ]
            },
            // Level 4: Boat
            {
                name: 'Boat',
                targetShape: 'M100,0 L150,100 L200,100 L150,150 L50,150 L0,100 L50,100 Z',
                solution: [
                    { id: 0, x: 100, y: 0, rotation: 180 },   // Large triangle 1 - sail
                    { id: 1, x: 0, y: 100, rotation: 0 },     // Large triangle 2 - hull
                    { id: 2, x: 150, y: 100, rotation: 270 }, // Medium triangle - hull right
                    { id: 3, x: 120, y: 20, rotation: 225 },  // Small triangle 1 - sail top
                    { id: 4, x: 75, y: 125, rotation: 0 },    // Small triangle 2 - hull detail
                    { id: 5, x: 50, y: 100, rotation: 0 },    // Square - hull middle
                    { id: 6, x: 100, y: 50, rotation: 270 }   // Parallelogram - sail middle
                ]
            },
            // Level 5: Bird
            {
                name: 'Bird',
                targetShape: 'M0,50 L50,0 L150,50 L200,100 L150,150 L100,120 L50,150 Z',
                solution: [
                    { id: 0, x: 50, y: 0, rotation: 45 },     // Large triangle 1 - wing
                    { id: 1, x: 150, y: 100, rotation: 135 }, // Large triangle 2 - tail
                    { id: 2, x: 100, y: 50, rotation: 0 },    // Medium triangle - body
                    { id: 3, x: 30, y: 30, rotation: 90 },    // Small triangle 1 - head
                    { id: 4, x: 175, y: 125, rotation: 315 }, // Small triangle 2 - tail tip
                    { id: 5, x: 75, y: 75, rotation: 45 },    // Square - body center
                    { id: 6, x: 125, y: 75, rotation: 0 }     // Parallelogram - wing detail
                ]
            },
            // Level 6: Running Person
            {
                name: 'Runner',
                targetShape: 'M50,0 L100,30 L120,80 L100,130 L50,150 L20,120 L0,70 L20,30 Z',
                solution: [
                    { id: 0, x: 50, y: 0, rotation: 315 },    // Large triangle 1 - torso
                    { id: 1, x: 20, y: 70, rotation: 45 },    // Large triangle 2 - legs
                    { id: 2, x: 100, y: 30, rotation: 180 },  // Medium triangle - arm
                    { id: 3, x: 60, y: 10, rotation: 135 },   // Small triangle 1 - head
                    { id: 4, x: 50, y: 130, rotation: 270 },  // Small triangle 2 - foot
                    { id: 5, x: 40, y: 60, rotation: 45 },    // Square - torso center
                    { id: 6, x: 80, y: 80, rotation: 0 }      // Parallelogram - hip
                ]
            },
            // Level 7: Fish
            {
                name: 'Fish',
                targetShape: 'M0,80 L40,40 L120,40 L160,80 L120,120 L40,120 Z',
                solution: [
                    { id: 0, x: 40, y: 40, rotation: 0 },     // Large triangle 1 - body top
                    { id: 1, x: 40, y: 120, rotation: 270 },  // Large triangle 2 - body bottom
                    { id: 2, x: 0, y: 80, rotation: 315 },    // Medium triangle - tail
                    { id: 3, x: 130, y: 70, rotation: 45 },   // Small triangle 1 - fin
                    { id: 4, x: 110, y: 50, rotation: 0 },    // Small triangle 2 - head detail
                    { id: 5, x: 70, y: 70, rotation: 0 },     // Square - body center
                    { id: 6, x: 120, y: 80, rotation: 0 }     // Parallelogram - mouth
                ]
            },
            // Level 8: Dog
            {
                name: 'Dog',
                targetShape: 'M20,40 L80,0 L140,40 L160,100 L120,140 L60,140 L20,100 Z',
                solution: [
                    { id: 0, x: 80, y: 0, rotation: 270 },    // Large triangle 1 - head/ear
                    { id: 1, x: 20, y: 100, rotation: 45 },   // Large triangle 2 - body
                    { id: 2, x: 140, y: 40, rotation: 180 },  // Medium triangle - back
                    { id: 3, x: 60, y: 20, rotation: 90 },    // Small triangle 1 - ear
                    { id: 4, x: 60, y: 120, rotation: 0 },    // Small triangle 2 - leg
                    { id: 5, x: 80, y: 80, rotation: 0 },     // Square - body middle
                    { id: 6, x: 120, y: 100, rotation: 270 }  // Parallelogram - tail
                ]
            }
        ];
    }

    newPuzzle() {
        this.createPieces();
        const levelIndex = (this.puzzleNum - 1) % this.levels.length;
        this.currentLevel = this.levels[levelIndex];
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
        const targetPath = this.currentLevel.targetShape;
        this.boardElement.innerHTML = `
            <div style="margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 15px;">
                <svg width="100" height="100" viewBox="0 0 200 200" style="border: 2px solid #ddd; border-radius: 4px; background: white;">
                    <path d="${targetPath}" fill="#333" opacity="0.3" stroke="#666" stroke-width="2"/>
                </svg>
                <strong>🎯 ${this.currentLevel.name}</strong>
            </div>
            <svg width="600" height="450" viewBox="0 0 600 450" style="border: 2px solid #ddd; border-radius: 8px; background: #f8f9fa;">
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
    
    showSolution() {
        const solution = this.currentLevel.solution;
        console.log('[Tangram] Applying solution...');
        console.log('[Tangram] Current level:', this.currentLevel.name);
        console.log('[Tangram] Solution exists:', !!solution);

        if (!solution) return;

        solution.forEach((sol, idx) => {
            const piece = this.pieces[sol.id];
            if (piece) {
                const oldX = piece.x, oldY = piece.y, oldRot = piece.rotation;

                piece.x = sol.x + 150;
                piece.y = sol.y + 150;
                piece.rotation = sol.rotation;

                console.log(`[Tangram] Piece ${sol.id}: (${oldX},${oldY},${oldRot}°) → (${piece.x},${piece.y},${piece.rotation}°)`);
            }
        });
        this.render();
    }

    updateGlobalStats() {
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        puzzleStats.totalGamesCompleted++;
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
    }
}
