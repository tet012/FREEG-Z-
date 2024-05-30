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

    // Calculate small distortion values using Perlin noise
    const noiseX = (perlin.noise(time * .9)) * 0.0002; // Small horizontal distortion
    const noiseY = (perlin.noise(0, time * .9)) * 0.0002; // Small vertical distortion

    // Apply a small transformation to simulate deformation
    ctx.setTransform(
        1 + noiseX, // Scale X
        noiseY,     // Skew Y
        noiseX,     // Skew X
        1 + noiseY, // Scale Y
        0,          // Translate X
        0           // Translate Y
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