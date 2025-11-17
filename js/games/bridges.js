/** Bridges Game (Hashiwokakero) */
class BridgesGame {
    constructor() {
        this.level = 1;
        this.size = 7;
        this.islands = [];
        this.bridges = [];
        this.selectedIsland = null;
        this.initializeDOM();
        this.newLevel();
    }
    
    initializeDOM() {
        this.boardElement = document.getElementById('bridges-board');
        this.levelElement = document.getElementById('level');
        document.getElementById('check-btn').addEventListener('click', () => this.check());
        document.getElementById('hint-btn')?.addEventListener('click', () => this.showHint());
    }
    
    newLevel() {
        this.islands = [];
        this.bridges = [];
        this.selectedIsland = null;
        
        // Generate puzzle - 20+ diverse bridge puzzles
        const puzzles = [
            // EASY (Levels 1-5): 4-5 islands, simple connections
            [
                {row: 1, col: 1, required: 2},
                {row: 1, col: 5, required: 2},
                {row: 5, col: 1, required: 2},
                {row: 5, col: 5, required: 2}
            ],
            [
                {row: 1, col: 3, required: 1},
                {row: 3, col: 1, required: 1},
                {row: 3, col: 3, required: 4},
                {row: 3, col: 5, required: 1},
                {row: 5, col: 3, required: 1}
            ],
            [
                {row: 1, col: 2, required: 2},
                {row: 1, col: 4, required: 2},
                {row: 5, col: 2, required: 2},
                {row: 5, col: 4, required: 2}
            ],
            [
                {row: 2, col: 1, required: 2},
                {row: 2, col: 5, required: 2},
                {row: 4, col: 1, required: 2},
                {row: 4, col: 5, required: 2}
            ],
            [
                {row: 1, col: 1, required: 2},
                {row: 1, col: 3, required: 2},
                {row: 1, col: 5, required: 2},
                {row: 5, col: 1, required: 2},
                {row: 5, col: 3, required: 2},
                {row: 5, col: 5, required: 2}
            ],
            
            // MEDIUM (Levels 6-12): 6-7 islands, more complex
            [
                {row: 1, col: 1, required: 2},
                { row: 1, col: 3, required: 2 },
                {row: 1, col: 5, required: 2},
                {row: 5, col: 1, required: 2},
                { row: 5, col: 3, required: 2 },
                {row: 5, col: 5, required: 2}
            ],
            [
                {row: 1, col: 1, required: 2},
                { row: 1, col: 3, required: 2 },
                { row: 1, col: 5, required: 2 },
                {row: 3, col: 3, required: 4},
                { row: 5, col: 1, required: 2 },
                { row: 5, col: 3, required: 2 },
                {row: 5, col: 5, required: 2}
            ],
            [
                { row: 1, col: 2, required: 2 },
                {row: 1, col: 4, required: 2},
                {row: 3, col: 2, required: 2},
                { row: 3, col: 4, required: 2 },
                {row: 5, col: 2, required: 2},
                {row: 5, col: 4, required: 2}
            ],
            [
                { row: 1, col: 1, required: 2 },
                {row: 1, col: 3, required: 4},
                { row: 1, col: 5, required: 2 },
                {row: 5, col: 1, required: 2},
                {row: 5, col: 3, required: 2},
                {row: 5, col: 5, required: 2}
            ],
            [
                {row: 2, col: 1, required: 2},
                { row: 2, col: 3, required: 3 },
                {row: 2, col: 5, required: 2},
                { row: 4, col: 1, required: 2 },
                { row: 4, col: 3, required: 3 },
                { row: 4, col: 5, required: 2 }
            ],
            [
                { row: 1, col: 1, required: 3 },
                {row: 1, col: 3, required: 3},
                {row: 3, col: 1, required: 2},
                {row: 3, col: 3, required: 4},
                {row: 3, col: 5, required: 2},
                { row: 5, col: 3, required: 2 }
            ],
            [
                {row: 1, col: 2, required: 2},
                {row: 2, col: 1, required: 3},
                {row: 2, col: 5, required: 2},
                {row: 4, col: 1, required: 2},
                {row: 4, col: 5, required: 3},
                {row: 5, col: 4, required: 2}
            ],
            
            // HARD (Levels 13-18): 7-8 islands, challenging patterns
            [
                {row: 1, col: 1, required: 3},
                {row: 1, col: 3, required: 4},
                {row: 1, col: 5, required: 3},
                {row: 3, col: 1, required: 2},
                {row: 3, col: 5, required: 2},
                {row: 5, col: 1, required: 2},
                {row: 5, col: 3, required: 4},
                {row: 5, col: 5, required: 2}
            ],
            [
                {row: 1, col: 1, required: 2},
                {row: 1, col: 3, required: 4},
                {row: 1, col: 5, required: 2},
                {row: 3, col: 1, required: 4},
                {row: 3, col: 3, required: 4},
                {row: 3, col: 5, required: 4},
                {row: 5, col: 3, required: 2}
            ],
            [
                {row: 1, col: 2, required: 3},
                {row: 2, col: 1, required: 2},
                {row: 2, col: 3, required: 5},
                {row: 2, col: 5, required: 2},
                {row: 4, col: 1, required: 3},
                {row: 4, col: 3, required: 4},
                {row: 4, col: 5, required: 3},
                {row: 5, col: 2, required: 2}
            ],
            [
                {row: 1, col: 1, required: 4},
                {row: 1, col: 3, required: 5},
                {row: 1, col: 5, required: 4},
                {row: 3, col: 3, required: 4},
                {row: 5, col: 1, required: 3},
                {row: 5, col: 3, required: 5},
                {row: 5, col: 5, required: 3}
            ],
            [
                {row: 1, col: 1, required: 2},
                {row: 1, col: 4, required: 4},
                {row: 2, col: 2, required: 4},
                {row: 3, col: 1, required: 4},
                {row: 3, col: 3, required: 4},
                {row: 4, col: 4, required: 4},
                {row: 5, col: 2, required: 4},
                {row: 5, col: 5, required: 2}
            ],
            [
                {row: 1, col: 1, required: 3},
                {row: 1, col: 3, required: 6},
                {row: 1, col: 5, required: 3},
                {row: 3, col: 1, required: 4},
                {row: 3, col: 3, required: 4},
                {row: 3, col: 5, required: 4},
                {row: 5, col: 1, required: 2},
                {row: 5, col: 3, required: 6},
                {row: 5, col: 5, required: 2}
            ],
            
            // EXPERT (Levels 19-25): 8+ islands, maximum complexity
            [
                {row: 1, col: 1, required: 4},
                {row: 1, col: 3, required: 6},
                {row: 1, col: 5, required: 4},
                {row: 2, col: 2, required: 3},
                {row: 2, col: 4, required: 3},
                {row: 4, col: 2, required: 4},
                {row: 4, col: 4, required: 4},
                {row: 5, col: 1, required: 3},
                {row: 5, col: 3, required: 6},
                {row: 5, col: 5, required: 3}
            ],
            [
                {row: 1, col: 1, required: 4},
                {row: 1, col: 2, required: 4},
                {row: 1, col: 4, required: 4},
                {row: 1, col: 5, required: 4},
                {row: 3, col: 1, required: 4},
                {row: 3, col: 3, required: 6},
                {row: 3, col: 5, required: 4},
                {row: 5, col: 1, required: 2},
                {row: 5, col: 3, required: 4},
                {row: 5, col: 5, required: 2}
            ]
        ];
        
        const puzzleIndex = (this.level - 1) % puzzles.length;
        this.islands = puzzles[puzzleIndex].map((island, idx) => ({
            ...island,
            id: idx,
            current: 0
        }));
        
        this.render();
    }
    
    render() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.size}, 60px)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.size}, 60px)`;
        
        // Create grid
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'bridges-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Check if this is an island
                const island = this.islands.find(i => i.row === row && i.col === col);
                if (island) {
                    cell.classList.add('island');
                    if (this.selectedIsland && this.selectedIsland.id === island.id) {
                        cell.classList.add('selected');
                    }
                    cell.innerHTML = `<div class="island-number">${island.required}</div>`;
                    cell.addEventListener('click', () => this.selectIsland(island));
                } else {
                    // Check if there's a bridge here
                    const bridge = this.getBridgeAt(row, col);
                    if (bridge) {
                        cell.classList.add('bridge');
                        cell.classList.add(bridge.direction);
                        cell.dataset.count = bridge.count;
                        if (bridge.count === 2) {
                            cell.classList.add('double');
                        }
                    }
                }
                
                this.boardElement.appendChild(cell);
            }
        }
        
        this.levelElement.textContent = this.level;
    }
    
    selectIsland(island) {
        if (!this.selectedIsland) {
            this.selectedIsland = island;
        } else if (this.selectedIsland.id === island.id) {
            this.selectedIsland = null;
        } else {
            // Try to create bridge
            this.createBridge(this.selectedIsland, island);
            this.selectedIsland = null;
        }
        this.render();
    }
    
    createBridge(island1, island2) {
        // Check if islands are in line (same row or column)
        if (island1.row !== island2.row && island1.col !== island2.col) {
            return; // Not in line
        }
        
        // Check if there's a clear path
        const isHorizontal = island1.row === island2.row;
        const start = isHorizontal ? Math.min(island1.col, island2.col) : Math.min(island1.row, island2.row);
        const end = isHorizontal ? Math.max(island1.col, island2.col) : Math.max(island1.row, island2.row);
        
        // Check for blocking islands
        for (let i = start + 1; i < end; i++) {
            const checkRow = isHorizontal ? island1.row : i;
            const checkCol = isHorizontal ? i : island1.col;
            if (this.islands.find(island => island.row === checkRow && island.col === checkCol)) {
                return; // Blocked by another island
            }
        }
        
        // Check if bridge already exists
        const existingBridge = this.bridges.find(b => 
            (b.from === island1.id && b.to === island2.id) ||
            (b.from === island2.id && b.to === island1.id)
        );
        
        if (existingBridge) {
            if (existingBridge.count < 2) {
                // Upgrade to double bridge
                existingBridge.count = 2;
                island1.current++;
                island2.current++;
            } else {
                // Remove bridge
                this.removeBridge(existingBridge);
            }
        } else {
            // Check if islands can accept more bridges
            if (island1.current >= island1.required || island2.current >= island2.required) {
                return;
            }
            
            // Create new bridge
            this.bridges.push({
                from: island1.id,
                to: island2.id,
                count: 1,
                row1: island1.row,
                col1: island1.col,
                row2: island2.row,
                col2: island2.col,
                direction: isHorizontal ? 'horizontal' : 'vertical'
            });
            island1.current++;
            island2.current++;
        }
        
        this.render();
    }
    
    removeBridge(bridge) {
        const island1 = this.islands.find(i => i.id === bridge.from);
        const island2 = this.islands.find(i => i.id === bridge.to);
        island1.current -= bridge.count;
        island2.current -= bridge.count;
        this.bridges = this.bridges.filter(b => b !== bridge);
    }
    
    getBridgeAt(row, col) {
        for (const bridge of this.bridges) {
            const isHorizontal = bridge.direction === 'horizontal';
            if (isHorizontal && bridge.row1 === row) {
                const minCol = Math.min(bridge.col1, bridge.col2);
                const maxCol = Math.max(bridge.col1, bridge.col2);
                if (col > minCol && col < maxCol) {
                    return bridge;
                }
            } else if (!isHorizontal && bridge.col1 === col) {
                const minRow = Math.min(bridge.row1, bridge.row2);
                const maxRow = Math.max(bridge.row1, bridge.row2);
                if (row > minRow && row < maxRow) {
                    return bridge;
                }
            }
        }
        return null;
    }
    
    check() {
        // Check if all islands have correct number of bridges
        const allCorrect = this.islands.every(island => island.current === island.required);
        
        if (allCorrect) {
            alert('🎉 Puzzle solved! Moving to next level...');
            this.level++;
            this.updateGlobalStats();
            this.newLevel();
        } else {
            const incomplete = this.islands.filter(i => i.current !== i.required).length;
            alert(`Not quite! ${incomplete} island(s) still need bridges.`);
        }
    }
    
    showHint() {
        // Find islands that need more bridges
        const needMore = this.islands.filter(i => i.current < i.required);
        if (needMore.length === 0) {
            alert('🎉 All islands have their bridges! Click Check Solution.');
            return;
        }
        
        const island = needMore[0];
        const needed = island.required - island.current;
        
        // Find possible connections
        const possibleConnections = [];
        this.islands.forEach(other => {
            if (other.id !== island.id) {
                if (island.row === other.row || island.col === other.col) {
                    if (other.current < other.required) {
                        possibleConnections.push(other);
                    }
                }
            }
        });
        
        if (possibleConnections.length > 0) {
            const target = possibleConnections[0];
            const direction = island.row === target.row ? 'horizontal' : 'vertical';
            alert(`💡 Hint: Island at row ${island.row + 1}, col ${island.col + 1} needs ${needed} more bridge(s). Try connecting it ${direction}ly!`);
        } else {
            alert(`💡 Hint: Island at row ${island.row + 1}, col ${island.col + 1} needs ${needed} more bridge(s).`);
        }
    }
    
    updateGlobalStats() {
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        puzzleStats.totalGamesCompleted++;
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
    }
}
