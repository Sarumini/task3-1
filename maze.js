"use strict";
// this is regex the code is ugly by nature

class maze extends Craters.Game {
    // initiate
    constructor() {
        super();
        this.paintbucket = new Array();
        this.state.size = {
            x: window.innerWidth,
            y: window.innerHeight
        }

        this.loop = new Craters.Loop(this, 60)
        this.viewport = new Craters.Canvas(this.state.size.x, this.state.size.y, 'body');
        this.context = this.viewport.context;
        this.viewport.style.background = "#eee";
        this.viewport.resize(this, {
            x: window.innerWidth,
            y: window.innerHeight
        })

        this.maze = this.newmaze({
            x: 14,
            y: 14
        })
        
        this.solve({
            start: [0, 0],
            end: [(Math.floor(Math.random() * this.maze.length) + 1), (Math.floor(Math.random() * this.maze[0].length) + 1)],
            maze: this.maze
        })
    }
    // update
    update() {
        super.update()
        if(this.paintbucket.length <= 0) return;
	        let i = this.paintbucket.shift()
	        // console.log(JSON.stringify(i));
	        this.maze[i[0]][i[1]]['color'] = i[2];
    }
    // render
    render() {
        super.render()
        let WIDTH = this.state.size.x,
	        HEIGHT = this.state.size.y;

        let ctx = this.context;
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let numRows = this.maze.length;
        let numCols = this.maze[0].length;
        let cellWidth = WIDTH / numCols;
        let cellHeight = HEIGHT / numRows;
        let cellLength = cellWidth > cellHeight ? cellHeight : cellWidth;
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                let cell = this.maze[row][col];
                ctx.fillStyle = '#fff'
                let rectX = col * cellLength;
                let rectY = row * cellLength;

                ctx.beginPath();
                if (cell[0] == 0) {
                    // top right bottom left
                    ctx.moveTo(rectX, rectY);
                    ctx.lineTo(rectX + cellWidth, rectY);
                }
                if (cell[1] == 0) {
                    ctx.moveTo(rectX + cellWidth, rectY);
                    ctx.lineTo(rectX + cellWidth, rectY + cellLength);
                }
                if (cell[2] == 0) {
                    ctx.moveTo(rectX, rectY + cellLength);
                    ctx.lineTo(rectX + cellWidth, rectY + cellLength);
                }
                if (cell[3] == 0) {
                    ctx.moveTo(rectX, rectY);
                    ctx.lineTo(rectX, rectY + cellLength);
                }
                ctx.fillStyle = cell['color'] || '#fff';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.fillRect(rectX, rectY, cellLength, cellLength);
            }
        }
    }

    newmaze(params) {
        // Establish variables and starting grid
        let x = params.x,
            y = params.y;

        var totalCells = x * y;
        var cells = new Array();
        var unvis = new Array();
        for (var i = 0; i < y; i++) {
            cells[i] = new Array();
            unvis[i] = new Array();
            for (var j = 0; j < x; j++) {
                cells[i][j] = [0, 0, 0, 0];
                unvis[i][j] = true;
            }
        }

        // Set a random position to start from
        var currentCell = [Math.floor(Math.random() * y), Math.floor(Math.random() * x)];
        var path = [currentCell];
        unvis[currentCell[0]][currentCell[1]] = false;
        var visited = 1;

        // Loop through all available cell positions
        while (visited < totalCells) {
            // Determine neighboring cells
            var pot = [
                [currentCell[0] - 1, currentCell[1], 0, 2],
                [currentCell[0], currentCell[1] + 1, 1, 3],
                [currentCell[0] + 1, currentCell[1], 2, 0],
                [currentCell[0], currentCell[1] - 1, 3, 1]
            ];
            var neighbors = new Array();

            // Determine if each neighboring cell is in game grid, and whether it has already been checked
            for (var l = 0; l < 4; l++) {
                if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) {
                    neighbors.push(pot[l]);
                }
            }

            // If at least one active neighboring cell has been found
            if (neighbors.length) {
                // Choose one of the neighbors at random
                let next = neighbors[Math.floor(Math.random() * neighbors.length)];

                // Remove the wall between the current cell and the chosen neighboring cell
                cells[currentCell[0]][currentCell[1]][next[2]] = 1;
                cells[next[0]][next[1]][next[3]] = 1;

                // Mark the neighbor as visited, and set it as the current cell
                unvis[next[0]][next[1]] = false;
                visited++;
                currentCell = [next[0], next[1]];
                path.push(currentCell);
            }
            // Otherwise go back up a step and keep going
            else {
                currentCell = path.pop();
            }
        }
        return cells;
    }

    solve(params) {
        let start = params.start;
        let end = params.end;
        let memory = []

        memory.push(start)
        while (memory.length > 0) {
            let i = memory.shift()
            if ((i[0] == end[0]) && (i[1] == end[1])) {
                
                this.maze[i[0]][i[1]]['path'].forEach((i) => {
                    this.paintbucket.push([i[0], i[1], 'lime'])
                });
                
                this.paintbucket.push([start[0], start[1], 'blue'])
                this.paintbucket.push([end[0], end[1], 'red'])

                break;
            }

            if (this.maze[i[0]][i[1]]['visited'] == true) continue;
            this.maze[i[0]][i[1]]['visited'] = true;
            this.paintbucket.push([i[0], i[1], '#eee'])

            let row = i[0];
            let col = i[1];

            if (row >= 0 && col >= 0 && row < this.maze.length && col < this.maze[0].length) {
                let cell = this.maze[i[0]][i[1]]
                // [top, right, left, bottom]
                let backtrack = (cell, row, col, maze) => {
                    if (typeof this.maze[row][col]['path'] == 'undefined') this.maze[row][col]['path'] = new Array();
                    if (row >= 0 && col >= 0 && row < this.maze.length && col < this.maze[0].length) {
                        this.maze[row][col]['path'].push(cell)

                        if (this.maze[cell[0]][cell[1]]['path'])
                            this.maze[cell[0]][cell[1]]['path'].forEach((x) => {
                                this.maze[row][col]['path'].push([x[0], x[1]])
                            })
                    }
                }

                if ((cell[0] == 1)) {
                    // console.log('top')
                    backtrack(i, i[0] - 1, i[1], this.maze)
                    memory.push([i[0] - 1, i[1]])
                }

                if ((cell[1] == 1)) {
                    // console.log('right')
                    backtrack(i, i[0], i[1] + 1, this.maze)
                    memory.push([i[0], i[1] + 1])
                }

                if ((cell[2] == 1)) {
                    // console.log('bottom')
                    backtrack(i, i[0] + 1, i[1], this.maze)
                    memory.push([i[0] + 1, (i[1])])
                }

                if ((cell[3] == 1)) {
                    // console.log('left')
                    backtrack(i, i[0], i[1] - 1, this.maze)
                    memory.push([i[0], i[1] - 1])
                }
            }
        }
    }
}

window.game = new maze();