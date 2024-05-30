const maxStems = 10;
const coresAndPetals = [];
const mainStems = [];

const numTrails = R.random_int(1, 25);
const trails = Array.from({ length: numTrails }, () => new Trail());


function animateDraw() {
    requestAnimationFrame(animateDraw);
    drawBg();



    drawSun();


    ctx.save();

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
    ctx.restore()

    granulate(52);

}

animateDraw();