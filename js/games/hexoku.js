/** Hexoku Game (Hexagonal Sudoku) */
class HexokuGame {
    constructor() {
        this.puzzleNum = 1;
        this.cells = [];
        this.selectedCell = null;
        this.initializeDOM();
        this.newPuzzle();
    }
    
    initializeDOM() {
        this.boardElement = document.getElementById('hexoku-board');
        this.puzzleElement = document.getElementById('puzzle-num');
        document.getElementById('check-btn').addEventListener('click', () => this.check());
        document.getElementById('hint-btn')?.addEventListener('click', () => this.showHint());
    }
    
    newPuzzle() {
        // Create hexagonal grid - 19 cells in honeycomb pattern
        this.cells = [
            // Row 1 (3 cells)
            {id: 0, row: 0, col: 0, region: 0, value: null, given: false},
            {id: 1, row: 0, col: 1, region: 0, value: null, given: false},
            {id: 2, row: 0, col: 2, region: 0, value: null, given: false},
            // Row 2 (4 cells)
            {id: 3, row: 1, col: 0, region: 0, value: null, given: false},
            {id: 4, row: 1, col: 1, region: 1, value: null, given: false},
            {id: 5, row: 1, col: 2, region: 1, value: null, given: false},
            {id: 6, row: 1, col: 3, region: 2, value: null, given: false},
            // Row 3 (5 cells)
            {id: 7, row: 2, col: 0, region: 0, value: null, given: false},
            {id: 8, row: 2, col: 1, region: 1, value: null, given: false},
            {id: 9, row: 2, col: 2, region: 1, value: null, given: false},
            {id: 10, row: 2, col: 3, region: 1, value: null, given: false},
            {id: 11, row: 2, col: 4, region: 2, value: null, given: false},
            // Row 4 (4 cells)
            {id: 12, row: 3, col: 0, region: 0, value: null, given: false},
            {id: 13, row: 3, col: 1, region: 1, value: null, given: false},
            {id: 14, row: 3, col: 2, region: 1, value: null, given: false},
            {id: 15, row: 3, col: 3, region: 2, value: null, given: false},
            // Row 5 (3 cells)
            {id: 16, row: 4, col: 0, region: 0, value: null, given: false},
            {id: 17, row: 4, col: 1, region: 2, value: null, given: false},
            {id: 18, row: 4, col: 2, region: 2, value: null, given: false}
        ];
        
        // Add some pre-filled values for the puzzle
        const givens = [
            {id: 0, value: 1},
            {id: 4, value: 3},
            {id: 9, value: 2},
            {id: 14, value: 1},
            {id: 18, value: 3}
        ];
        
        givens.forEach(({id, value}) => {
            this.cells[id].value = value;
            this.cells[id].given = true;
        });
        
        this.render();
    }
    
    render() {
        const hexSize = 40;
        const hexHeight = hexSize * 2;
        const hexWidth = Math.sqrt(3) * hexSize;
        const vertDist = hexHeight * 0.75;
        
        this.boardElement.innerHTML = '';
        this.boardElement.style.position = 'relative';
        this.boardElement.style.width = '600px';
        this.boardElement.style.height = '400px';
        this.boardElement.style.margin = '0 auto';
        
        // Create SVG for hexagons
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '600');
        svg.setAttribute('height', '400');
        svg.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        svg.style.borderRadius = '12px';
        svg.style.padding = '20px';
        
        this.cells.forEach((cell, index) => {
            // Calculate position
            const offsetX = 150;
            const offsetY = 50;
            let x = offsetX + cell.col * hexWidth * 0.5 + (cell.row % 2) * hexWidth * 0.25;
            let y = offsetY + cell.row * vertDist;
            
            // Adjust for row patterns
            if (cell.row === 0) x += hexWidth * 0.75;
            if (cell.row === 1) x += hexWidth * 0.5;
            if (cell.row === 3) x += hexWidth * 0.5;
            if (cell.row === 4) x += hexWidth * 0.75;
            
            // Create hexagon path
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                points.push([
                    x + hexSize * Math.cos(angle),
                    y + hexSize * Math.sin(angle)
                ]);
            }
            
            // Create hexagon element
            const hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            hex.setAttribute('points', points.map(p => p.join(',')).join(' '));
            
            // Color by region to make them visible
            const regionColors = ['#ffe6e6', '#e6f3ff', '#e6ffe6']; // Light red, blue, green
            const fillColor = cell.given ? '#e0e0e0' : (cell.value ? '#ffffff' : regionColors[cell.region]);
            
            hex.setAttribute('fill', fillColor);
            hex.setAttribute('stroke', '#333');
            hex.setAttribute('stroke-width', '2');
            hex.style.cursor = cell.given ? 'default' : 'pointer';
            hex.setAttribute('data-id', cell.id);
            
            if (!cell.given) {
                hex.addEventListener('click', () => this.selectCell(cell));
            }
            
            svg.appendChild(hex);
            
            // Add text
            if (cell.value) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', y + 8);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '28');
                text.setAttribute('font-weight', cell.given ? 'bold' : 'normal');
                text.setAttribute('fill', cell.given ? '#667eea' : '#333');
                text.textContent = cell.value;
                text.style.pointerEvents = 'none';
                svg.appendChild(text);
            }
        });
        
        this.boardElement.appendChild(svg);
        
        // Remove existing number pad if any
        const existingPad = this.boardElement.parentElement.querySelector('.hexoku-numpad');
        if (existingPad) existingPad.remove();
        
        // Add number pad
        const numPad = document.createElement('div');
        numPad.className = 'hexoku-numpad';
        numPad.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-top: 20px;';
        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.textContent = i;
            btn.style.width = '50px';
            btn.style.height = '50px';
            btn.addEventListener('click', () => this.enterNumber(i));
            numPad.appendChild(btn);
        }
        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn btn-secondary';
        clearBtn.textContent = 'Clear';
        clearBtn.addEventListener('click', () => this.enterNumber(null));
        numPad.appendChild(clearBtn);
        
        this.boardElement.parentElement.appendChild(numPad);
        
        this.puzzleElement.textContent = this.puzzleNum;
    }
    
    selectCell(cell) {
        if (cell.given) return;
        this.selectedCell = cell;
        // Highlight selected cell
        const hexElements = this.boardElement.querySelectorAll('polygon');
        hexElements.forEach(hex => {
            if (parseInt(hex.getAttribute('data-id')) === cell.id) {
                hex.setAttribute('fill', '#ffd700');
            } else if (!this.cells.find(c => c.id === parseInt(hex.getAttribute('data-id'))).given) {
                hex.setAttribute('fill', '#ffffff');
            }
        });
    }
    
    enterNumber(num) {
        if (this.selectedCell && !this.selectedCell.given) {
            this.selectedCell.value = num;
            this.selectedCell = null;
            this.render();
        }
    }
    
    showHint() {
        // Find an empty cell and show a valid number for it
        const emptyCells = this.cells.filter(c => !c.value && !c.given);
        if (emptyCells.length === 0) {
            alert('🎉 Puzzle is complete!');
            return;
        }
        
        const hintCell = emptyCells[0];
        const regionCells = this.cells.filter(c => c.region === hintCell.region && c.value);
        const usedNumbers = regionCells.map(c => c.value);
        
        // Find first available number
        for (let num = 1; num <= 5; num++) {
            if (!usedNumbers.includes(num)) {
                alert(`💡 Hint: Try placing ${num} in one of the empty ${['red', 'blue', 'green'][hintCell.region]} hexagons.`);
                return;
            }
        }
    }
    
    check() {
        // Check if puzzle is complete and valid
        const incomplete = this.cells.filter(c => c.value === null);
        if (incomplete.length > 0) {
            alert(`Puzzle incomplete! ${incomplete.length} cells remaining.`);
            return;
        }
        
        // Simple validation - check no duplicates in regions
        const regions = [0, 1, 2];
        let valid = true;
        
        regions.forEach(region => {
            const regionCells = this.cells.filter(c => c.region === region);
            const values = regionCells.map(c => c.value);
            const unique = new Set(values);
            if (unique.size !== values.length) {
                valid = false;
            }
        });
        
        if (valid) {
            alert('🎉 Puzzle solved correctly!');
            this.puzzleNum++;
            this.updateGlobalStats();
            this.newPuzzle();
        } else {
            alert('❌ Some regions have duplicate numbers. Try again!');
        }
    }
    
    updateGlobalStats() {
        const puzzleStats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
        if (!puzzleStats.totalGamesCompleted) puzzleStats.totalGamesCompleted = 0;
        puzzleStats.totalGamesCompleted++;
        localStorage.setItem('puzzleStats', JSON.stringify(puzzleStats));
    }
}
