/** Flow Free Level Configurations - SIMPLE & WORKING */
const FLOW_FREE_LEVELS = [
    // Level 1: Simple L-shape (works!)
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 4, c: 4 }] },
            { colorIdx: 1, positions: [{ r: 0, c: 4 }, { r: 3, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }],
            1: [{ r: 0, c: 4 }, { r: 0, c: 3 }, { r: 0, c: 2 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }]
        },
        difficulty: 'Easy'
    },

    // Level 2: Two horizontal lines
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 0, c: 4 }] },
            { colorIdx: 1, positions: [{ r: 4, c: 0 }, { r: 4, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }],
            1: [{ r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }]
        },
        difficulty: 'Easy'
    },

    // Level 3: Vertical columns
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 4, c: 0 }] },
            { colorIdx: 1, positions: [{ r: 0, c: 4 }, { r: 4, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }],
            1: [{ r: 0, c: 4 }, { r: 0, c: 3 }, { r: 0, c: 2 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }]
        },
        difficulty: 'Easy'
    },

    // Level 4: Three rows
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 0, c: 4 }] },
            { colorIdx: 1, positions: [{ r: 2, c: 0 }, { r: 2, c: 4 }] },
            { colorIdx: 2, positions: [{ r: 4, c: 0 }, { r: 4, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }],
            1: [{ r: 2, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }],
            2: [{ r: 4, c: 0 }, { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 3 }, { r: 4, c: 2 }, { r: 4, c: 1 }]
        },
        difficulty: 'Medium'
    },

    // Level 5: Zigzag pattern
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 0, c: 1 }] },
            { colorIdx: 1, positions: [{ r: 0, c: 2 }, { r: 4, c: 3 }] },
            { colorIdx: 2, positions: [{ r: 0, c: 4 }, { r: 4, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 3, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 1 }, { r: 0, c: 1 }],
            1: [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 3, c: 3 }, { r: 2, c: 3 }, { r: 1, c: 3 }, { r: 0, c: 3 }],
            2: [{ r: 0, c: 4 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 4, c: 4 }]
        },
        difficulty: 'Medium'
    },

    // Level 6: Corner pieces
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 4, c: 2 }] },
            { colorIdx: 1, positions: [{ r: 0, c: 4 }, { r: 4, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 3, c: 2 }, { r: 2, c: 2 }, { r: 1, c: 2 }, { r: 0, c: 2 }, { r: 0, c: 1 }],
            1: [{ r: 0, c: 4 }, { r: 0, c: 3 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 2, c: 3 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 3 }, { r: 1, c: 1 }]
        },
        difficulty: 'Medium'
    },

    // Level 7: Simple cross
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 2 }, { r: 4, c: 2 }] },
            { colorIdx: 1, positions: [{ r: 2, c: 0 }, { r: 2, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 }],
            1: [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 0, c: 0 }, { r: 1, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 3, c: 1 }, { r: 1, c: 1 }, { r: 0, c: 1 }, { r: 0, c: 3 }, { r: 1, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 3, c: 4 }, { r: 1, c: 4 }, { r: 0, c: 4 }]
        },
        difficulty: 'Hard'
    },

    // Level 8: Box spiral
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 2, c: 2 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 3 }, { r: 4, c: 2 }, { r: 4, c: 1 }, { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 1 }, { r: 2, c: 1 }, { r: 2, c: 2 }]
        },
        difficulty: 'Hard'
    },

    // Level 9: Wave
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 4, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 }, { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 2 }, { r: 2, c: 2 }, { r: 3, c: 2 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 3, c: 3 }, { r: 2, c: 3 }, { r: 1, c: 3 }, { r: 0, c: 3 }, { r: 0, c: 2 }, { r: 0, c: 4 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 4, c: 4 }]
        },
        difficulty: 'Hard'
    },

    // Level 10: Three stripes
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 0, c: 4 }] },
            { colorIdx: 1, positions: [{ r: 2, c: 0 }, { r: 2, c: 4 }] },
            { colorIdx: 2, positions: [{ r: 4, c: 0 }, { r: 4, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }],
            1: [{ r: 2, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }],
            2: [{ r: 4, c: 0 }, { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 4, c: 4 }, { r: 4, c: 3 }, { r: 4, c: 2 }, { r: 4, c: 1 }]
        },
        difficulty: 'Expert'
    },

    // Level 11: Two spirals
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 0 }, { r: 1, c: 1 }] },
            { colorIdx: 1, positions: [{ r: 4, c: 4 }, { r: 3, c: 3 }] }
        ],
        solution: {
            0: [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
            1: [{ r: 4, c: 4 }, { r: 4, c: 3 }, { r: 4, c: 2 }, { r: 4, c: 1 }, { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 1, c: 3 }, { r: 1, c: 2 }]
        },
        difficulty: 'Expert'
    },

    // Level 12: Complex weave
    {
        size: 5,
        endpoints: [
            { colorIdx: 0, positions: [{ r: 0, c: 1 }, { r: 4, c: 3 }] },
            { colorIdx: 1, positions: [{ r: 0, c: 3 }, { r: 4, c: 1 }] },
            { colorIdx: 2, positions: [{ r: 2, c: 0 }, { r: 2, c: 4 }] }
        ],
        solution: {
            0: [{ r: 0, c: 1 }, { r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 3, c: 3 }, { r: 2, c: 3 }, { r: 1, c: 3 }],
            1: [{ r: 0, c: 3 }, { r: 0, c: 4 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 4, c: 4 }, { r: 3, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 1 }],
            2: [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 1, c: 2 }, { r: 0, c: 2 }, { r: 3, c: 2 }]
        },
        difficulty: 'Extreme'
    }
];

// Expose to global scope
if (typeof window !== 'undefined') {
    window.FLOW_FREE_LEVELS = FLOW_FREE_LEVELS;
    console.log('[Flow Free Levels] Loaded', FLOW_FREE_LEVELS.length, 'levels');
    console.log('[Flow Free Levels] Level 1 endpoints:', FLOW_FREE_LEVELS[0].endpoints);
}

// Last updated: 2025-11-18T14:30:00Z
