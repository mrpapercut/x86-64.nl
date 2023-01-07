class Line {
    constructor(canvas, ctx, startPos, lives) {
        this.alive = true;
        this.lives = lives;

        this.ctx = ctx;

        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;

        this.startPos = {
            x: startPos.x,
            y: startPos.y
        }

        this.lastPos = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}]

        // this.color = 'rgba(222, 222, 222, 0.25)';
        this.opacity = 0.2 + ((1 * this.lives) / 10);
        this.color = 'rgba(' + [
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
        ].join(', ') + `, ${this.opacity})`;

        this.aliveFrames = Math.floor(30 * (1 + Math.random()));
        this.currentFrame = 0;
        this.randomAngle = Math.floor(Math.random() * 360);
    }

    draw() {
        this.currentFrame++;
        if (this.currentFrame === this.aliveFrames) {
            return this.remove();
        }

        for (let i = 0; i < 3; i++) {
            this.lastPos[i].x = this.startPos.x + Math.cos(Math.PI * ((this.randomAngle + (120 * i) % 360) / 180)) * (4 * this.currentFrame);
            this.lastPos[i].y = this.startPos.y + Math.sin(Math.PI * ((this.randomAngle + (120 * i) % 360) / 180)) * (4 * this.currentFrame);

            this.ctx.beginPath();
            this.ctx.strokeStyle = this.color;
            this.ctx.moveTo(this.startPos.x, this.startPos.y);
            this.ctx.lineTo(this.lastPos[i].x, this.lastPos[i].y);
            this.ctx.stroke()
        }

        return true;
    }

    remove() {
        this.alive = false;

        if (this.lives > 0) return false;
    }
}

class DrawCanvas {
    constructor(canvasElement) {
        this.canvas = canvasElement;

        this.canvas.width = parseInt(window.getComputedStyle(document.body).width, 10);
        this.canvas.height = parseInt(window.getComputedStyle(document.body).height, 10);

        this.ctx = this.canvas.getContext('2d');

        // Config
        this.fps = 30;
        this.framecounter = 0;

        this.startingLives = 3;

        this.lines = [];
        this.maxnumlines = 24;

        this.mousePos = {x: 0, y: 0}
    }

    start() {
        this.attachListeners();
        this.raf = window.requestAnimationFrame(() => this.draw());
    }

    attachListeners() {
        this.canvas.addEventListener('click', e => {
            this.addLine(this.mousePos);
        });

        document.body.addEventListener('mousemove', e => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;

            if (this.framecounter === 0) {
                this.addLine(this.mousePos);
            }
        });
    }

    addLine(startPos, lives = this.startingLives) {
        if (this.lines.filter(l => l.alive).length < this.maxnumlines) {
            this.lines.push(new Line(this.canvas, this.ctx, startPos, lives))
        }
    }

    clear() {
        this.ctx.fillStyle = 'rgba(21, 21, 21, 0.3)'; // Using opacity causes fading effect
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.lines = this.lines.filter(l => l.alive)
    }

    draw() {
        this.framecounter++;
        if (this.framecounter === 59) this.framecounter = 0;
        if ((this.framecounter % 2) === 0) {
            this.raf = window.requestAnimationFrame(() => this.draw());
            return;
        }

        this.clear();
        this.lines.forEach(line => {
            if (line.alive) {
                if (line.draw() === false) {
                    const remainingLives = line.lives - 1;
                    for (let i = 0; i < 3; i++) {
                        if (! (line.lastPos[i].x < 0
                            || line.lastPos[i].x > this.canvas.width
                            || line.lastPos[i].y < 0
                            || line.lastPos[i].y > this.canvas.height)) {
                            this.addLine(line.lastPos[i], remainingLives);
                        }
                    }
                }
            }
        })

        this.raf = window.requestAnimationFrame(() => this.draw());
    }
}

const drawCanvas = new DrawCanvas(document.getElementById('bgcanvas'));
drawCanvas.start();
