/** Flow Free Level Configurations */
const FLOW_FREE_LEVELS = [
    // EASY (Levels 1-7): 5x5 grid, 2-3 colors, simple paths
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
    {
        size: 5,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 0}, {r: 4, c: 0}]},
            {colorIdx: 1, positions: [{r: 1, c: 2}, {r: 3, c: 2}]}
        ],
        solution: {
            0: [{r:0,c:0},{r:1,c:0},{r:2,c:0},{r:3,c:0},{r:4,c:0}],
            1: [{r:1,c:2},{r:2,c:2},{r:3,c:2}]
        },
        difficulty: 'Easy'
    },
    {
        size: 5,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 1}, {r: 4, c: 1}]},
            {colorIdx: 1, positions: [{r: 0, c: 3}, {r: 4, c: 3}]},
            {colorIdx: 2, positions: [{r: 2, c: 0}, {r: 2, c: 4}]}
        ],
        solution: {
            0: [{r:0,c:1},{r:1,c:1},{r:2,c:1},{r:3,c:1},{r:4,c:1}],
            1: [{r:0,c:3},{r:1,c:3},{r:2,c:3},{r:3,c:3},{r:4,c:3}],
            2: [{r:2,c:0},{r:2,c:2},{r:2,c:4}]
        },
        difficulty: 'Easy'
    },
    {
        size: 5,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 0}, {r: 0, c: 2}]},
            {colorIdx: 1, positions: [{r: 4, c: 0}, {r: 4, c: 2}]},
            {colorIdx: 2, positions: [{r: 0, c: 4}, {r: 4, c: 4}]}
        ],
        solution: {
            0: [{r:0,c:0},{r:0,c:1},{r:0,c:2}],
            1: [{r:4,c:0},{r:4,c:1},{r:4,c:2}],
            2: [{r:0,c:4},{r:1,c:4},{r:2,c:4},{r:3,c:4},{r:4,c:4}]
        },
        difficulty: 'Easy'
    },
    {
        size: 5,
        endpoints: [
            {colorIdx: 0, positions: [{r: 1, c: 0}, {r: 1, c: 4}]},
            {colorIdx: 1, positions: [{r: 3, c: 0}, {r: 3, c: 4}]}
        ],
        solution: {
            0: [{r:1,c:0},{r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4}],
            1: [{r:3,c:0},{r:3,c:1},{r:3,c:2},{r:3,c:3},{r:3,c:4}]
        },
        difficulty: 'Easy'
    },
    {
        size: 5,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 1}, {r: 2, c: 1}]},
            {colorIdx: 1, positions: [{r: 0, c: 3}, {r: 2, c: 3}]},
            {colorIdx: 2, positions: [{r: 4, c: 0}, {r: 4, c: 4}]}
        ],
        solution: {
            0: [{r:0,c:1},{r:1,c:1},{r:2,c:1}],
            1: [{r:0,c:3},{r:1,c:3},{r:2,c:3}],
            2: [{r:4,c:0},{r:4,c:1},{r:4,c:2},{r:4,c:3},{r:4,c:4}]
        },
        difficulty: 'Easy'
    },
    {
        size: 5,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 0}, {r: 4, c: 4}]},
            {colorIdx: 1, positions: [{r: 0, c: 4}, {r: 4, c: 0}]}
        ],
        solution: {
            0: [{r:0,c:0},{r:0,c:1},{r:0,c:2},{r:1,c:2},{r:2,c:2},{r:3,c:2},{r:4,c:2},{r:4,c:3},{r:4,c:4}],
            1: [{r:0,c:4},{r:0,c:3},{r:1,c:3},{r:2,c:3},{r:3,c:3},{r:4,c:3},{r:4,c:2},{r:4,c:1},{r:4,c:0}]
        },
        difficulty: 'Easy'
    },
    
    // MEDIUM (Levels 8-14): 6x6 grid, 3-4 colors
    {
        size: 6,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 0}, {r: 5, c: 5}]},
            {colorIdx: 1, positions: [{r: 0, c: 5}, {r: 5, c: 0}]},
            {colorIdx: 2, positions: [{r: 2, c: 2}, {r: 3, c: 3}]}
        ],
        solution: {
            0: [{r:0,c:0},{r:1,c:0},{r:2,c:0},{r:3,c:0},{r:4,c:0},{r:5,c:0},{r:5,c:1},{r:5,c:2},{r:5,c:3},{r:5,c:4},{r:5,c:5}],
            1: [{r:0,c:5},{r:0,c:4},{r:0,c:3},{r:0,c:2},{r:0,c:1},{r:1,c:1},{r:2,c:1},{r:3,c:1},{r:4,c:1},{r:5,c:1}],
            2: [{r:2,c:2},{r:3,c:3}]
        },
        difficulty: 'Medium'
    },
    {
        size: 6,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 2}, {r: 5, c: 2}]},
            {colorIdx: 1, positions: [{r: 2, c: 0}, {r: 2, c: 5}]},
            {colorIdx: 2, positions: [{r: 1, c: 1}, {r: 4, c: 4}]}
        ],
        solution: {
            0: [{r:0,c:2},{r:1,c:2},{r:2,c:2},{r:3,c:2},{r:4,c:2},{r:5,c:2}],
            1: [{r:2,c:0},{r:2,c:1},{r:2,c:3},{r:2,c:4},{r:2,c:5}],
            2: [{r:1,c:1},{r:3,c:3},{r:4,c:4}]
        },
        difficulty: 'Medium'
    },
    {
        size: 6,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 1}, {r: 5, c: 1}]},
            {colorIdx: 1, positions: [{r: 0, c: 3}, {r: 5, c: 3}]},
            {colorIdx: 2, positions: [{r: 1, c: 0}, {r: 1, c: 5}]},
            {colorIdx: 3, positions: [{r: 4, c: 0}, {r: 4, c: 5}]}
        ],
        solution: {
            0: [{r:0,c:1},{r:1,c:1},{r:2,c:1},{r:3,c:1},{r:4,c:1},{r:5,c:1}],
            1: [{r:0,c:3},{r:1,c:3},{r:2,c:3},{r:3,c:3},{r:4,c:3},{r:5,c:3}],
            2: [{r:1,c:0},{r:1,c:2},{r:1,c:4},{r:1,c:5}],
            3: [{r:4,c:0},{r:4,c:2},{r:4,c:4},{r:4,c:5}]
        },
        difficulty: 'Medium'
    },
    // Add more Medium and Hard levels...
    {
        size: 6,
        endpoints: [
            {colorIdx: 0, positions: [{r: 0, c: 0}, {r: 3, c: 3}]},
            {colorIdx: 1, positions: [{r: 0, c: 5}, {r: 3, c: 2}]},
            {colorIdx: 2, positions: [{r: 5, c: 0}, {r: 2, c: 3}]}
        ],
        solution: {
            0: [{r:0,c:0},{r:1,c:0},{r:2,c:0},{r:3,c:0},{r:3,c:1},{r:3,c:2},{r:3,c:3}],
            1: [{r:0,c:5},{r:0,c:4},{r:0,c:3},{r:1,c:3},{r:2,c:3},{r:3,c:2}],
            2: [{r:5,c:0},{r:4,c:0},{r:3,c:0},{r:2,c:3}]
        },
        difficulty: 'Medium'
    }
];
