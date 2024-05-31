const canvas = document.getElementById('ceasefire_now');
const ctx = canvas.getContext('2d');
let rc = rough.canvas(canvas);
let scale = 2

const W = 550 * scale;
const H = 820 * scale;

canvas.style.width = `${W / scale}px`;
canvas.style.height = `${H / scale}px`;

canvas.width = W;
canvas.height = H;

function granulate(amount) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
        let grainAmount = Math.random() * (amount * 2) - amount;
        pixels[i] = Math.max(0, Math.min(255, pixels[i] + grainAmount));
        pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + grainAmount));
        pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] + grainAmount));
    }
    ctx.putImageData(imageData, 0, 0);
}

function genTokenData(projectNum) {
    let data = {};
    let hash = "0x";
    for (var i = 0; i < 64; i++) {
        hash += Math.floor(Math.random() * 16).toString(16);
    }
    data.hash = hash;
    data.tokenId = (
        projectNum * 1000000 +
        Math.floor(Math.random() * 1000)
    ).toString();
    return data;
}
let tokenData = genTokenData(123);

class Random {
    constructor() {
        this.useA = false;
        let sfc32 = function (uint128Hex) {
            let a = parseInt(uint128Hex.substring(0, 8), 16);
            let b = parseInt(uint128Hex.substring(8, 16), 16);
            let c = parseInt(uint128Hex.substring(16, 24), 16);
            let d = parseInt(uint128Hex.substring(24, 32), 16);
            return function () {
                a |= 0;
                b |= 0;
                c |= 0;
                d |= 0;
                let t = (((a + b) | 0) + d) | 0;
                d = (d + 1) | 0;
                a = b ^ (b >>> 9);
                b = (c + (c << 3)) | 0;
                c = (c << 21) | (c >>> 11);
                c = (c + t) | 0;
                return (t >>> 0) / 4294967296;
            };
        };
        this.prngA = new sfc32(tokenData.hash.substring(2, 34));
        this.prngB = new sfc32(tokenData.hash.substring(34, 66));
        for (let i = 0; i < 1e6; i += 2) {
            this.prngA();
            this.prngB();
        }
    }
    random_dec() {
        this.useA = !this.useA;
        return this.useA ? this.prngA() : this.prngB();
    }
    random_num(a, b) {
        return a + (b - a) * this.random_dec();
    }
    random_int(a, b) {
        return Math.floor(this.random_num(a, b + 1));
    }
    random_bool(p) {
        return this.random_dec() < p;
    }
    random_choice(list) {
        return list[this.random_int(0, list.length - 1)];
    }
}

class Perlin {
    constructor() {
        this.permutation = [...Array(256).keys()];
        this.permutation = this.permutation.concat(this.permutation);
        this.shuffle(this.permutation);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    noise(x) {
        if (x < 0) x = -x;
        let xi = Math.floor(x) & 255;
        let xf = x - Math.floor(x);
        let u = this.fade(xf);
        return lerp(u, this.grad(this.permutation[xi], xf), this.grad(this.permutation[xi + 1], xf - 1)) * 2;
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    grad(hash, x) {
        let h = hash & 15;
        let grad = 1 + (h & 7);
        if (h & 8) grad = -grad;
        return (grad * x);
    }
}

function lerp(t, a, b) {
    return a + t * (b - a);
}

let perlin = new Perlin();
let R = new Random();

class Trail {
    constructor(flowerX, flowerY) {
        this.flowerX = flowerX;
        this.flowerY = flowerY;
        this.startX = R.random_num(-W, W * 2);
        this.startY = 0;

        const distanceFromFlower = R.random_num(100, 1000);
        const angle = Math.atan2(flowerY - this.startY, flowerX - this.startX);

        this.endX = flowerX - distanceFromFlower * Math.cos(angle);
        this.endY = flowerY - distanceFromFlower * Math.sin(angle);
        this.points = this.addPoints(this.startX, this.startY, this.endX, this.endY);
        this.dashOffset = 0;
        this.size = R.random_int(5, 25);
    }

    addPoints(startX, startY, endX, endY) {
        const points = [];
        const numPoints = 100;
        const noiseScale = 0.05;

        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const x = startX + t * (endX - startX);
            const y = startY + t * (endY - startY) + (perlin.noise(t * noiseScale, 0) * 50);
            points.push([x, y]);
        }

        return points;
    }

    draw(ctx) {
        ctx.save();
        ctx.setLineDash([10, 15]);
        ctx.lineDashOffset = this.dashOffset;

        ctx.beginPath();
        ctx.moveTo(this.points[0][0], this.points[0][1]);

        for (let i = 1; i < this.points.length; i++) {
            const [x2, y2] = this.points[i];
            ctx.lineTo(x2, y2);
        }

        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();

        this.drawBomb(ctx);
    }

    drawBomb(ctx) {
        const pA = this.points[this.points.length - 1];
        const pB = this.points[this.points.length - 2];
        const angle = Math.atan2(pA[1] - pB[1], pA[0] - pB[0]);

        const bomb = new Bomb(pA[0], pA[1], this.size, angle);
        bomb.draw(ctx);
    }

    update() {
        this.dashOffset -= -5;
        if (this.dashOffset < -25) {
            this.dashOffset = 0;
        }
    }
}

class Bomb {
    constructor(x, y, radius, angle) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.angle = angle;
    }

    draw(ctx) {
        ctx.save();

        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI * 1.5);



        let params = {
            fill: 'rgba(0,0, 0)',
            stroke: 'transparent',
            fillStyle: 'solid',
        };

        ctx.save();

        rc.ellipse(0, 0, this.radius, this.radius * 4, params);
        ctx.restore();

        ctx.beginPath();

        let bp = {
            p1: [0, 0],
            p2: [this.radius, this.radius],
            p3: [this.radius * 1.5, this.radius * 3],
            p4: [0, this.radius * 1.5]
        }

        rc.polygon([
            [bp.p1[0], bp.p1[1]],
            [-bp.p2[0], -bp.p2[1]],
            [-bp.p3[0], -bp.p3[1]],
            [bp.p4[0], -bp.p4[1]]
        ], params);

        rc.polygon([
            [bp.p1[0], bp.p1[1]],
            [bp.p2[0], -bp.p2[1]],
            [bp.p3[0], -bp.p3[1]],
            [bp.p4[0], -bp.p4[1]]
        ], params);

        rc.rectangle(-this.radius / 4, -this.radius * 2, this.radius / 2, this.radius, params);

        ctx.closePath();
        ctx.restore();
    }
}

const numTrails = R.random_int(1, 50);
const trails = Array.from({ length: numTrails }, () => new Trail(W / 2, H * 0.9));

let headlines = [
    { text: '“PEACE”', size: 'bold 100px' },
    { text: '“CEASEFIRE NOW”', size: 'bold 80px' },
    { text: '“STOP WAR”', size: 'bold 100px' },
    { text: '“PROTECT CIVILIANS”', size: 'bold 70px' },
    { text: '“SAVE THE CHILDREN”', size: 'bold 75px' }
];
let headline = R.random_choice(headlines);
let mark = R.random_choice(['™', '®', '©']);

let time = 0;

function drawBg() {
    ctx.clearRect(0, 0, W, H);
    shift = 0.75 + Math.sin(time * 0.05) * 0.1;

    ctx.beginPath();
    ctx.rect(0, 0, W, H);

    var gradient = ctx.createLinearGradient(W / 2, 0, W / 2, H);
    gradient.addColorStop(0, "rgb(10, 0, 5)");
    gradient.addColorStop(Math.min(Math.max(shift, 0), 1), "rgb(230, 0, 40)");
    gradient.addColorStop(1, "rgb(235, 230, 50)");

    ctx.fillStyle = gradient;
    ctx.fill();

    time += 1;
}

function drawSun() {
    ctx.save();

    ctx.save()
    ctx.shadowColor = 'rgba(255, 255, 0, .5)';
    ctx.shadowBlur = 200;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let params = {
        fill: 'rgb(230, 230, 230)',
        fillStyle: 'solid',
        stroke: 'transparent',
        curveFitting: .999,
    };

    rc.ellipse(W / 2, H / 3, 250 * 4, 250 * 2, params)
    ctx.clip()

    ctx.shadowColor = 'rgba(255, 0, 0, .5)';
    ctx.shadowBlur = 200;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    rc.ellipse(W / 2, H / 3, 250 * 2, 250 * 2, params);
    ctx.fillStyle = 'rgba(230, 0, 40, .95)';
    ctx.fill();

    rc.ellipse(W / 2, H / 3, 250 * 1, 250 * 1, params);
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 200;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, .95)';
    ctx.fill();
    ctx.restore();
}

function drawText() {
    ctx.font = headline.size + ' Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText(headline.text + mark, W / 2, H / 11);

    ctx.font = ' 30px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText('Sometimes the scandal is not what law was broken,', W / 2, H / 8.5);

    ctx.font = ' 30px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText('but what the law allows.', W / 2, H / 7.5);

    ctx.font = ' 15px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.letterSpacing = "2px";
    ctx.fillText('Edward Snowden', W / 2, H / 6.5);
    ctx.restore();
}

class Flower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 200;
    }

    draw(ctx) {
        let debut = { x: W / 2, y: H };
        let cp1 = { x: W / 2.1, y: H * 0.98 };
        let cp2 = { x: W / 1.75, y: H * .95 };
        let fin = { x: W / 2, y: H * 0.9 };

        ctx.beginPath();
        ctx.moveTo(debut.x, debut.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, fin.x, fin.y);
        ctx.stroke();
        ctx.lineWidth = 5;


        for (let i = 0; i < 8; i++) {
            ctx.save();
            ctx.translate(W / 2, H * 0.9);
            ctx.rotate(i * Math.PI / 4);
            rc.ellipse(0, 0, 50, 150, { fill: 'yellow', fillStyle: 'solid', stroke: 'transparent' });
            ctx.restore();
        }


        rc.ellipse(W / 2, H * 0.9, 50, 50, { fill: 'red', fillStyle: 'solid', stroke: 'transparent' });
    }
}
let flowers = new Flower(W / 2, H);

function draw() {
    requestAnimationFrame(draw);
    drawBg();
    drawSun();

    const noiseX = (perlin.noise(time * .9)) * 0.0002;
    const noiseY = (perlin.noise(0, time * .9)) * 0.0002;
    ctx.setTransform(
        1 + noiseX,
        noiseY,
        noiseX,
        1 + noiseY,
        0,
        0
    );

    drawText();

    trails.forEach(trail => {
        trail.update();
        trail.draw(ctx);
    });

    flowers.draw(ctx);

    granulate(52);

}

draw();