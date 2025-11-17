/** Flow Free Level Configurations - DIVERSE PATTERNS */
const FLOW_FREE_LEVELS = [
    // Level 1: EASY - Simple horizontal lines
    {
        size: 5,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 0}, {r: 0, c: 4}]},
            {colorIdx: 1, positions: [{r: 2, c: 1}, {r: 2, c: 3}]}
        ],
        solution: {
            0: [{r:0,c:0},{r:0,c:1},{r:0,c:2},{r:0,c:3},{r:0,c:4}],
            1: [{r:2,c:1},{r:2,c:2},{r:2,c:3}]
        },
        difficulty: 'Easy'
    },

    // Level 2: EASY - Vertical lines
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 1 }, { r: 4, c: 1 }] },
            { colorIdx: 1, positions: [{ r: 0, c: 3 }, { r: 4, c: 3 }] }
        ],
        solution: {
            0: [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 }],
            1: [{ r: 0, c: 3 }, { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }]
        },
        difficulty: 'Easy'
    },

    // Level 3: EASY - L-shapes
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 2, c: 4 }] },
            { colorIdx: 1, positions: [{ r: 4, c: 0 }, { r: 2, c: 2 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 1, c: 4 }, { r: 2, c: 4 }],
            1: [{ r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }]
        },
        difficulty: 'Easy'
    },

    // Level 4: MEDIUM - Diagonal cross pattern
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 2 }, { r: 4, c: 2 }] },
            { colorIdx: 1, positions: [{ r: 2, c: 0 }, { r: 2, c: 4 }] },
            { colorIdx: 2, positions: [{ r: 1, c: 1 }, { r: 3, c: 3 }] }
        ],
        solution: {
            0: [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 }],
            1: [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 3 }, { r: 2, c: 4 }],
            2: [{ r: 1, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 3 }]
        },
        difficulty: 'Medium'
    },

    // Level 5: MEDIUM - Spiral pattern
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 2, c: 2 }] },
            { colorIdx: 1, positions: [{ r: 0, c: 4 }, { r: 4, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }],
            1: [{ r: 0, c: 4 }, { r: 0, c: 3 }, { r: 0, c: 2 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }]
        },
        difficulty: 'Medium'
    },

    // Level 6: MEDIUM - 6x6 grid with corners
    {
        size: 6,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 5, c: 5 }] },
            { colorIdx: 1, positions: [{ r: 0, c: 5 }, { r: 5, c: 0 }] },
            { colorIdx: 2, positions: [{ r: 2, c: 2 }, { r: 3, c: 3 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 5, c: 0 }, { r: 5, c: 1 }, { r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 5, c: 5 }],
            1: [{ r: 0, c: 5 }, { r: 0, c: 4 }, { r: 0, c: 3 }, { r: 0, c: 2 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 }, { r: 5, c: 1 }],
            2: [{ r: 2, c: 2 }, { r: 3, c: 2 }, { r: 3, c: 3 }]
        },
        difficulty: 'Medium'
    },

    // Level 7: HARD - 6x6 zigzag pattern
    {
        size: 6,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 5, c: 5 }] },
            { colorIdx: 1, positions: [{ r: 1, c: 2 }, { r: 4, c: 3 }] },
            { colorIdx: 2, positions: [{ r: 0, c: 5 }, { r: 5, c: 0 }] },
            { colorIdx: 3, positions: [{ r: 2, c: 1 }, { r: 3, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 }, { r: 5, c: 1 }, { r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 5, c: 5 }],
            1: [{ r: 1, c: 2 }, { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }],
            2: [{ r: 0, c: 5 }, { r: 0, c: 4 }, { r: 0, c: 3 }, { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 5, c: 2 }, { r: 5, c: 1 }, { r: 5, c: 0 }],
            3: [{ r: 2, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }]
        },
        difficulty: 'Hard'
    },

    // Level 8: HARD - Complex weaving
    {
        size: 6,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 2 }, { r: 5, c: 3 }] },
            { colorIdx: 1, positions: [{ r: 1, c: 0 }, { r: 4, c: 5 }] },
            { colorIdx: 2, positions: [{ r: 2, c: 5 }, { r: 3, c: 0 }] },
            { colorIdx: 3, positions: [{ r: 1, c: 3 }, { r: 4, c: 2 }] }
        ],
        solution: {
            0: [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 }, { r: 5, c: 2 }, { r: 5, c: 3 }],
            1: [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 4, c: 5 }],
            2: [{ r: 2, c: 5 }, { r: 2, c: 4 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 2, c: 0 }, { r: 3, c: 0 }],
            3: [{ r: 1, c: 3 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 3 }, { r: 4, c: 2 }]
        },
        difficulty: 'Hard'
    },
    
    // Level 9: EXPERT - Multiple colors competing for space
    {
        size: 6,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 0}, {r: 5, c: 5}]},
            {colorIdx: 1, positions: [{r: 0, c: 5}, {r: 5, c: 0}]},
            { colorIdx: 2, positions: [{ r: 0, c: 2 }, { r: 5, c: 2 }] },
            { colorIdx: 3, positions: [{ r: 2, c: 0 }, { r: 2, c: 5 }] },
            { colorIdx: 4, positions: [{ r: 3, c: 3 }, { r: 1, c: 1 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 5, c: 0 }, { r: 5, c: 1 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 5, c: 5 }],
            1: [{ r: 0, c: 5 }, { r: 0, c: 4 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 3 }, { r: 4, c: 1 }, { r: 5, c: 1 }],
            2: [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 }, { r: 5, c: 2 }],
            3: [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }],
            4: [{ r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 }]
        },
        difficulty: 'Expert'
    },

    // Level 10: EXPERT - Maze-like pattern
    {
        size: 6,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 1 }, { r: 5, c: 4 }] },
            { colorIdx: 1, positions: [{ r: 1, c: 5 }, { r: 4, c: 0 }] },
            { colorIdx: 2, positions: [{ r: 0, c: 3 }, { r: 5, c: 2 }] }
        ],
        solution: {
            0: [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 5, c: 4 }],
            1: [{ r: 1, c: 5 }, { r: 1, c: 4 }, { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 1 }, { r: 3, c: 0 }, { r: 4, c: 0 }],
            2: [{ r: 0, c: 3 }, { r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 }, { r: 5, c: 2 }]
        },
        difficulty: 'Expert'
    },

    // Level 11: EXPERT - Full board challenge
    {
        size: 6,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 0, c: 5 }] },
            { colorIdx: 1, positions: [{ r: 5, c: 0 }, { r: 5, c: 5 }] },
            { colorIdx: 2, positions: [{ r: 1, c: 1 }, { r: 4, c: 4 }] },
            { colorIdx: 3, positions: [{ r: 1, c: 4 }, { r: 4, c: 1 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 0, c: 5 }],
            1: [{ r: 5, c: 0 }, { r: 5, c: 1 }, { r: 5, c: 2 }, { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 5, c: 5 }],
            2: [{ r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }],
            3: [{ r: 1, c: 4 }, { r: 1, c: 3 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 }]
        },
        difficulty: 'Expert'
    },

    // Level 12: EXTREME - Ultimate challenge
    {
        size: 6,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 5, c: 5 }] },
            { colorIdx: 1, positions: [{ r: 0, c: 5 }, { r: 5, c: 0 }] },
            { colorIdx: 2, positions: [{ r: 0, c: 2 }, { r: 5, c: 3 }] },
            { colorIdx: 3, positions: [{ r: 2, c: 0 }, { r: 3, c: 5 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 5, c: 4 }, { r: 5, c: 5 }],
            1: [{ r: 0, c: 5 }, { r: 0, c: 4 }, { r: 0, c: 3 }, { r: 1, c: 3 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 3, c: 1 }, { r: 4, c: 1 }, { r: 5, c: 1 }, { r: 5, c: 0 }],
            2: [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 5, c: 3 }],
            3: [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 3, c: 5 }]
        },
        difficulty: 'Extreme'
    }
];
