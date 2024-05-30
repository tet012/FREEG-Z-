let headlines = [
    { text: '“PEACE”', size: 'bold 100px' },
    { text: '“CEASEFIRE NOW”', size: 'bold 80px' },
    { text: '“STOP WAR”', size: 'bold 100px' },
    { text: '“PROTECT CIVILIANS”', size: 'bold 70px' },
    { text: '“SAVE THE CHILDREN”', size: 'bold 75px' }
];
let headline = R.random_choice(headlines);
let mark = R.random_choice(['™', '®', '©']);


let redColorStop = 0.7;
let time = 0;

function drawBg() {
    ctx.clearRect(0, 0, W, H);
    const noiseValue = perlin.noise(time * 0.005, 0);
    redColorStop = 0.75 + Math.sin(time * 0.05) * 0.1;

    ctx.beginPath();
    ctx.rect(0, 0, W, H);

    var gradient = ctx.createLinearGradient(W / 2, 0, W / 2, H);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(Math.min(Math.max(redColorStop, 0), 1), "red"); // Ensure it's within bounds
    gradient.addColorStop(1, "yellow");

    ctx.fillStyle = gradient;
    ctx.fill();

    time += 1; // Increment time for the next frame
}


function drawSun() {
    ctx.save();

    ctx.save()
    ctx.shadowColor = 'rgba(255, 255, 0, .5)';
    ctx.shadowBlur = 200;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'black';
    rc.ellipse(W / 2, H / 3, 250 * 4, 250 * 2, {
        fill: 'white',
        fillStyle: 'solid',
        stroke: 'transparent',
        roughness: roughness,
        curveFitting: 1,

    })
    ctx.clip()

    rc.ellipse(W / 2, H / 3, 250 * scale, 250 * scale, {
        fill: 'red',
        fillStyle: 'solid',
        stroke: 'transparent',
        roughness: roughness,
        curveFitting: 1,
    });


    rc.ellipse(W / 2, H / 3, 250 * 1, 250 * 1, {
        fillStyle: 'solid',
        stroke: 'transparent',
        roughness: roughness,
        curveFitting: 1,
    });
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 400;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.restore();
}

function drawText() {
    ctx.save();
    ctx.font = headline.size + ' Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText(headline.text + mark, W / 2, H / 9);
    ctx.restore();

    ctx.save()
    ctx.font = ' 30px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText('"A DIGITAL ARTIFACT." Trying to save the world.', W / 2 + 50, H / 7.5);
    ctx.restore();
}
