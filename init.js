// Global vars
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let rc = rough.canvas(canvas);

let perlin = new Perlin();
let R = new Random();

// Canvas Size
let scale = 2
const W = 550 * scale;
const H = 820 * scale;

canvas.style.width = `${W / scale}px`;
canvas.style.height = `${H / scale}px`;

canvas.width = W;
canvas.height = H;

// Arrays
let
    ellipses = [],
    targets = [],
    groundPoints = []

// Vars
let
    numPoints, randomGroundIndex, randomGroundPoint, strokeWeight, strokeFactor = 10, padding = .1, angle

// Date
let
    // h = new Date().getHours(),
    h = R.random_int(0, 24),
    m = new Date().getMinutes(),
    totalMinutes = h * 60 + m,
    n, h0, s0, l0, h1, s1, l1, targetY

// Density
let density = R.random_choice([0.5, 0.75, 1]),
    trials = R.random_choice([1000, 10000, 100000, 1000000]);

// Sizes
let sizes = {
    tiny: [5 * scale, 50 * scale],
    small: [5 * scale, 100 * scale],
};

// Size selector
let
    sizeKeys = Object.keys(sizes),
    randomSizeKey = sizeKeys[Math.floor(Math.random() * sizeKeys.length)],
    [minRadius, maxRadius] = sizes[randomSizeKey];

// Props
let
    roughness = 1,

    // Petal
    petalSize = R.random_choice(['small', 'medium', 'large']),

    //Fill
    stemType = R.random_choice(['straight', 'curved', 'super']),

    // Stroke
    strokeColor = 'transparent',

    // Stem
    sameOrigin = R.random_bool(0.15),

    // Eyes direction
    directionX = R.random_choice([0.5, 0, -0.5]),
    directionY = R.random_choice([0.25, 0, -0.25]),

    // Shadows
    shadowBlur = 2,
    shadowOffsetX = 0,
    shadowOffsetY = 0

let bomb = true
let monoBomb = R.random_bool(0.5)
let eyeFill