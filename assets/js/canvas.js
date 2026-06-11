const canvas = document.getElementById("canvas-bg");
const ctx = canvas.getContext("2d");

let particlesArray;

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = {
  x: null,
  y: null,
  radius: 150 // Connection distance for mouse
};

window.addEventListener("mousemove", function(event) {
  mouse.x = event.x;
  mouse.y = event.y;
});

window.addEventListener("mouseout", function() {
  mouse.x = undefined;
  mouse.y = undefined;
});

// Resize event
window.addEventListener("resize", function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});

class Particle {
  constructor(x, y, directionX, directionY, size, color) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    
    // Dynamic color based on theme
    const isLight = document.body.classList.contains("light-theme");
    ctx.fillStyle = isLight ? "rgba(18, 146, 238, 0.5)" : "rgba(18, 146, 238, 0.8)";
    ctx.fill();
  }

  update() {
    // Check window bounds
    if (this.x > canvas.width || this.x < 0) {
      this.directionX = -this.directionX;
    }
    if (this.y > canvas.height || this.y < 0) {
      this.directionY = -this.directionY;
    }

    // Move particle
    this.x += this.directionX;
    this.y += this.directionY;
    this.draw();
  }
}

function init() {
  particlesArray = [];
  let numberOfParticles = (canvas.height * canvas.width) / 15000;
  
  // Cap the max number of particles for performance
  if (numberOfParticles > 100) numberOfParticles = 100;

  for (let i = 0; i < numberOfParticles; i++) {
    let size = (Math.random() * 2) + 1;
    let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
    let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
    let directionX = (Math.random() * 1) - 0.5;
    let directionY = (Math.random() * 1) - 0.5;
    let color = 'rgba(18, 146, 238, 0.8)';

    particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
  }
}

function connect() {
  const isLight = document.body.classList.contains("light-theme");
  const baseAlpha = isLight ? 0.1 : 0.2;
  const maxDistance = 120; // Connection distance between particles

  for (let a = 0; a < particlesArray.length; a++) {
    for (let b = a; b < particlesArray.length; b++) {
      let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
      + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
      
      if (distance < maxDistance * maxDistance) {
        let opacityValue = 1 - (distance / (maxDistance * maxDistance));
        ctx.strokeStyle = `rgba(18, 146, 238, ${opacityValue * baseAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
        ctx.stroke();
      }
    }
    
    // Connect to mouse
    if (mouse.x != null && mouse.y != null) {
      let dx = particlesArray[a].x - mouse.x;
      let dy = particlesArray[a].y - mouse.y;
      let distance = dx * dx + dy * dy;
      
      if (distance < mouse.radius * mouse.radius) {
        let opacityValue = 1 - (distance / (mouse.radius * mouse.radius));
        ctx.strokeStyle = `rgba(18, 146, 238, ${opacityValue * (baseAlpha + 0.2)})`; // slightly stronger connection to mouse
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        
        // Slight attraction to mouse
        const force = (mouse.radius * mouse.radius - distance) / (mouse.radius * mouse.radius);
        if(particlesArray[a].x < mouse.x && particlesArray[a].x < canvas.width - particlesArray[a].size * 10) {
            particlesArray[a].x += force;
        }
        if(particlesArray[a].x > mouse.x && particlesArray[a].x > particlesArray[a].size * 10) {
            particlesArray[a].x -= force;
        }
        if(particlesArray[a].y < mouse.y && particlesArray[a].y < canvas.height - particlesArray[a].size * 10) {
            particlesArray[a].y += force;
        }
        if(particlesArray[a].y > mouse.y && particlesArray[a].y > particlesArray[a].size * 10) {
            particlesArray[a].y -= force;
        }
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
  }
  connect();
}

init();
animate();
