class Trail {
    constructor() {
        this.startX = R.random_num(0, W);
        this.startY = 0;
        this.endX = R.random_num(W * 0.2, W * 0.8);
        this.endY = R.random_num(H * 0.6, H * 0.8)
        this.points = this.generatePoints(this.startX, this.startY, this.endX, this.endY);
        this.dashOffset = 0;
        this.size = R.random_int(5, 25)
    }

    generatePoints(startX, startY, endX, endY) {
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


    draw(ctx, rc) {
        ctx.save();
        ctx.setLineDash([10, 15]);
        ctx.lineDashOffset = this.dashOffset;

        ctx.beginPath();
        ctx.moveTo(this.points[0][0], this.points[0][1]);

        for (let i = 1; i < this.points.length; i++) {
            const [x1, y1] = this.points[i - 1];
            const [x2, y2] = this.points[i];
            ctx.lineTo(x2, y2);
        }

        ctx.strokeStyle = 'rgba(0,0,1,0.6)';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();

        this.drawBomb(ctx);
    }

    drawBomb(ctx) {
        const lastPoint = this.points[this.points.length - 1];
        const secondLastPoint = this.points[this.points.length - 2];
        const angle = Math.atan2(lastPoint[1] - secondLastPoint[1], lastPoint[0] - secondLastPoint[0]);

        const bomb = new Bomb(lastPoint[0], lastPoint[1], this.size, angle);
        bomb.draw(ctx);
    }

    update() {
        this.dashOffset -= -4;
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

        let paramsEye = {
            fill: 'rgba(0,0, 0)',
            stroke: 'transparent',
            strokeWidth: this.radius / strokeFactor * .5,
            bowing: 10,
            roughness: roughness,
            fillStyle: 'solid',
        };

        ctx.save();


        rc.ellipse(0, 0, this.radius, this.radius * 4, paramsEye);
        ctx.restore();

        ctx.beginPath();

        let bp = {
            p1: [0, 0],
            p2: [this.radius, this.radius],
            p3: [this.radius * 1.15, this.radius * 2],
            p4: [0, this.radius * 1.5]
        }

        rc.polygon([
            [bp.p1[0], bp.p1[1]],
            [-bp.p2[0], -bp.p2[1]],
            [-bp.p3[0], -bp.p3[1]],
            [bp.p4[0], -bp.p4[1]]
        ], {
            fill: 'black',
            fillStyle: 'solid',
            roughness: roughness,
            stroke: 'transparent',
        });

        rc.polygon([
            [bp.p1[0], bp.p1[1]],
            [bp.p2[0], -bp.p2[1]],
            [bp.p3[0], -bp.p3[1]],
            [bp.p4[0], -bp.p4[1]]
        ], {
            fill: 'black',
            fillStyle: 'solid',
            roughness: roughness,
            stroke: 'transparent',
        });

        rc.rectangle(-this.radius / 4, -this.radius * 1.75, this.radius / 2, this.radius, {
            fill: 'black',
            fillStyle: 'solid',
            roughness: roughness,
            stroke: 'transparent',
        });

        ctx.closePath();
        ctx.restore();
    }
}