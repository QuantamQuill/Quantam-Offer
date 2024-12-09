const prizes = [
    { name: "MacBook Pro", chance: 0.00001, image: "https://i.ibb.co/7VhQM5c/macbook-2048px-232020.jpg" },
    { name: "iPhone 16 Pro", chance: 0.00003, image: "https://i.ibb.co/2vPfzDF/apple-iphone-16-pro-max-1.jpg" },
    { name: "60% Discount", chance: 0.05, image: null },
    { name: "50% Discount", chance: 0.1, image: null },
    { name: "40% Discount", chance: 0.15, image: null },
    { name: "30% Discount", chance: 0.2, image: null },
    { name: "20% Discount", chance: 0.25, image: null },
    { name: "10% Discount", chance: 0.25, image: null }
];

const prizeCodes = {};
const spinHistory = JSON.parse(localStorage.getItem('spinHistory')) || { lastSpin: 0, spinsLeft: 4 };

function generateRandomCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function getPrize() {
    let random = Math.random();
    let cumulativeChance = 0;

    for (let prize of prizes) {
        cumulativeChance += prize.chance;
        if (random < cumulativeChance) {
            let code = generateRandomCode();
            prizeCodes[code] = prize.name;
            return { name: prize.name, code: code, image: prize.image };
        }
    }
    return { name: "10% Discount", code: generateRandomCode(), image: null };
}

function updateSpinHistory() {
    const now = Date.now();
    if (now - spinHistory.lastSpin > 3 * 24 * 60 * 60 * 1000) {
        spinHistory.spinsLeft = 4;
    }
    spinHistory.lastSpin = now;
    spinHistory.spinsLeft -= 1;
    localStorage.setItem('spinHistory', JSON.stringify(spinHistory));
}

function canSpin() {
    const now = Date.now();
    if (spinHistory.spinsLeft > 0 || now - spinHistory.lastSpin > 3 * 24 * 60 * 60 * 1000) {
        return true;
    }
    return false;
}

document.getElementById('spin-button').addEventListener('click', () => {
    if (!canSpin()) {
        document.getElementById('prize-message').innerHTML = 'You have reached the spin limit. Please wait for the cooldown period.';
        return;
    }
    let prize = getPrize();
    let prizeMessage = `You won a ${prize.name}! Your code is: ${prize.code}`;
    if (prize.image) {
        prizeMessage += `<br><img class="prize-image" src="${prize.image}" alt="${prize.name}">`;
    }
    document.getElementById('prize-message').innerHTML = prizeMessage;
    updateSpinHistory();

    // Spin animation
    const totalSegments = prizes.length;
    const randomAngle = Math.random() * 360 + 360 * 3; // At least 3 full rotations
    canvas.style.transition = "transform 4s ease-out";
    canvas.style.transform = `rotate(${randomAngle}deg)`;

    setTimeout(() => {
        canvas.style.transition = "none";
        canvas.style.transform = `rotate(${randomAngle % 360}deg)`;
    }, 4000);
});

document.getElementById('verify-button').addEventListener('click', () => {
    let code = document.getElementById('verify-code').value;
    if (prizeCodes[code]) {
        document.getElementById('verify-message').innerHTML = `Code is valid! You won a ${prizeCodes[code]}! Now screenshot and send to Quantum Quill page on Facebook.`;
    } else {
        document.getElementById('verify-message').innerHTML = "Invalid code!";
    }
});

// Drawing the wheel
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const wheelRadius = canvas.width / 2;
const numSegments = prizes.length;
const segmentAngle = 2 * Math.PI / numSegments;

ctx.translate(wheelRadius, wheelRadius);

prizes.forEach((prize, index) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, wheelRadius, index * segmentAngle, (index + 1) * segmentAngle);
    ctx.fillStyle = index % 2 === 0 ? '#FFCC00' : '#FF9900';
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.rotate((index + 0.5) * segmentAngle);
    ctx.translate(wheelRadius / 2, 0);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.fillText(prize.name, 0, 0);
    ctx.restore();
});