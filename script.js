const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const mainContainer = document.getElementById('main-container');
const bgMusic = document.getElementById('bg-music');
const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const typewriterElement = document.getElementById('typewriter-text');

// Texto de la dedicatoria
const messageText = 
`CADA LATIDO QUE VES
AQUÍ ES UN TE AMO
PARA TI MI VIDA.

ASÍ COMO EL SOL ILUMINA
LOS CAMPOS, TÚ ILUMINAS
MI VIDA.

QUE ESTAS FLORES TE
RECUERDEN LO ESPECIAL
QUE ERES PARA MÍ.

- ¡TE AMO MI BEBITA! -`;

let heartFlowers = [];
let fallingPetals = [];
let magicSparks = [];
let typewriterStarted = false;
let pulseTimer = 0;

// Posición del ratón para interactuar con el fondo
let mousePos = { x: -1000, y: -1000 };

window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - rect.left;
  mousePos.y = e.clientY - rect.top;
});

// --- OPTIMIZACIÓN EN BUFFER (1 Girasol preparado) ---
const sunflowerBuffer = document.createElement('canvas');
sunflowerBuffer.width = 50;
sunflowerBuffer.height = 50;
const sCtx = sunflowerBuffer.getContext('2d');

function prepareSunflowerBuffer() {
  sCtx.translate(25, 25);
  // Pétalos del girasol
  sCtx.fillStyle = '#f5c42c';
  const petals = 12;
  for (let i = 0; i < petals; i++) {
    sCtx.beginPath();
    sCtx.rotate((Math.PI * 2) / petals);
    sCtx.ellipse(0, 12, 4, 11, 0, 0, Math.PI * 2);
    sCtx.fill();
  }
  // Centro
  sCtx.beginPath();
  sCtx.arc(0, 0, 7.5, 0, Math.PI * 2);
  sCtx.fillStyle = '#3d2314';
  sCtx.fill();
}
prepareSunflowerBuffer();

function drawSunflowerFast(x, y, scale, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  let size = 50 * scale;
  ctx.drawImage(sunflowerBuffer, -size / 2, -size / 2, size, size);
  ctx.restore();
}

// --- GENERAR CORAZÓN DENSEMENTE RELLENO Y CON FLORES MÁS GRANDES ---
function generateHeartShapePoints() {
  const points = [];
  const totalFlowers = 700; 

  let count = 0;
  while (count < totalFlowers) {
    let nx = (Math.random() * 2.6) - 1.3;
    let ny = (Math.random() * 2.6) - 1.3;
    
    // Ecuación matemática de área de corazón
    let equation = Math.pow(nx * nx + ny * ny - 1, 3) - (nx * nx * Math.pow(ny, 3));
    
    if (equation <= 0) {
      let posX = 250 + (nx * 130);
      let posY = 175 - (ny * 120);

      points.push({
        baseX: posX,
        baseY: posY,
        x: posX,
        y: posY,
        scale: 0,
        // FLORES MÁS GRANDES: Escala aumentada a 0.45 - 0.75
        maxScale: 0.45 + Math.random() * 0.30,
        rotation: Math.random() * Math.PI
      });
      count++;
    }
  }
  return points;
}

// Flores que caen suavemente (también más grandes)
function createFallingPetals() {
  fallingPetals = [];
  for (let i = 0; i < 32; i++) {
    fallingPetals.push({
      x: 100 + Math.random() * 300,
      y: 80 + Math.random() * 150,
      speedY: 0.4 + Math.random() * 0.6,
      speedX: (Math.random() - 0.5) * 0.5,
      scale: 0.32 + Math.random() * 0.25, // Pétalos flotantes más grandes
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04
    });
  }
}

// --- FONDO INTERACTIVO Y VIVO (MÁS DESTELLOS Y MOVILES CON EL CURSOR) ---
function createMagicSparks() {
  magicSparks = [];
  for (let i = 0; i < 45; i++) {
    magicSparks.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2.5 + 1,
      alpha: Math.random(),
      speedAlpha: 0.01 + Math.random() * 0.02
    });
  }
}

function updateAndDrawSparks() {
  magicSparks.forEach(s => {
    // Movimiento natural flotante
    s.x += s.vx;
    s.y += s.vy;

    // Rebotar en bordes
    if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;
    if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy;

    // Reacción interactiva con el mouse (Repulsión suave)
    let dx = s.x - mousePos.x;
    let dy = s.y - mousePos.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 70) {
      let angle = Math.atan2(dy, dx);
      s.x += Math.cos(angle) * 2;
      s.y += Math.sin(angle) * 2;
    }

    // Titileo
    s.alpha += s.speedAlpha;
    if (s.alpha > 1 || s.alpha < 0) s.speedAlpha = -s.speedAlpha;

    // Dibujar luces flotantes del fondo
    ctx.save();
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(250, 210, 80, ${Math.abs(s.alpha)})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f5c42c';
    ctx.fill();
    ctx.restore();
  });
}

// Dibujar Suelo
function drawGround() {
  ctx.beginPath();
  ctx.moveTo(30, 430);
  ctx.lineTo(470, 430);
  ctx.strokeStyle = '#2b261f';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Dibujar Tronco y Ramas
function drawTreeBranches(progress) {
  ctx.strokeStyle = '#234a32';
  ctx.lineCap = 'round';

  // Tronco Principal
  ctx.beginPath();
  ctx.lineWidth = 11;
  ctx.moveTo(250, 430);
  ctx.lineTo(250, 430 - (175 * progress));
  ctx.stroke();

  if (progress > 0.3) {
    let p = (progress - 0.3) / 0.7;
    ctx.lineWidth = 4.5;
    
    // Rama Izquierda
    ctx.beginPath();
    ctx.moveTo(250, 320);
    ctx.quadraticCurveTo(195, 275, 170 - (25 * p), 225 - (15 * p));
    ctx.stroke();

    // Rama Derecha
    ctx.beginPath();
    ctx.moveTo(250, 305);
    ctx.quadraticCurveTo(305, 260, 330 + (25 * p), 215 - (15 * p));
    ctx.stroke();
    
    // Rama Central
    ctx.beginPath();
    ctx.moveTo(250, 280);
    ctx.lineTo(250, 190 - (20 * p));
    ctx.stroke();
  }
}

// Animación de Caída de Flores
function updateAndDrawFallingPetals() {
  fallingPetals.forEach(p => {
    p.y += p.speedY;
    p.x += Math.sin(p.y * 0.02) * 0.5 + p.speedX;
    p.rotation += p.rotSpeed;

    if (p.y > 425) {
      p.y = 100 + Math.random() * 80;
      p.x = 110 + Math.random() * 280;
    }

    drawSunflowerFast(p.x, p.y, p.scale, p.rotation);
  });
}

// Bucle Principal de Animación
function animateTree() {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    let elapsed = timestamp - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo vivo siempre presente
    updateAndDrawSparks();
    drawGround();

    // Fase 1: Crecimiento de ramas
    if (elapsed < 1800) {
      let progress = elapsed / 1800;
      drawTreeBranches(progress);
    } else {
      drawTreeBranches(1);
      
      let flowerElapsed = elapsed - 1800;
      pulseTimer += 0.025;
      let pulseScale = 1 + Math.sin(pulseTimer) * 0.018; 

      // Fase 2: Florecimiento del Corazón con flores más grandes
      heartFlowers.forEach((flower, index) => {
        let delay = index * 1.8; 
        if (flowerElapsed > delay) {
          if (flower.scale < flower.maxScale) {
            flower.scale += 0.05;
          }
        }
        if (flower.scale > 0) {
          let curX = 250 + (flower.baseX - 250) * pulseScale;
          let curY = 175 + (flower.baseY - 175) * pulseScale;
          drawSunflowerFast(curX, curY, flower.scale * pulseScale, flower.rotation);
        }
      });

      // Fase 3: Lluvia de pétalos y dedicatoria
      if (flowerElapsed > 800) {
        updateAndDrawFallingPetals();
        
        if (!typewriterStarted) {
          typewriterStarted = true;
          startTypewriter();
        }
      }
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Texto tipo Máquina de Escribir
function startTypewriter() {
  let index = 0;
  typewriterElement.innerHTML = '';
  
  function typeNextChar() {
    if (index < messageText.length) {
      typewriterElement.innerHTML += messageText.charAt(index);
      index++;
      setTimeout(typeNextChar, 35);
    }
  }
  typeNextChar();
}

// Evento al presionar el botón de inicio
startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  mainContainer.classList.remove('hidden');

  bgMusic.play().catch(e => console.log("Permiso de audio requerido"));

  heartFlowers = generateHeartShapePoints();
  createFallingPetals();
  createMagicSparks();
  animateTree();
});