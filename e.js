
(() => {
  // 防止重复运行
  window.stopPetalFall?.();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "2147483647"
  });

  document.body.appendChild(canvas);

  let width, height, dpr, animationId;
  let petals = [];
  let lastTime = performance.now();

  // 花瓣颜色
  const colors = [
    "#ffb7c5",
    "#ffc0cb",
    "#ffdae5",
    "#ff91ae",
    "#ffe4ec"
  ];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createPetal(randomY = false) {
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -30,
      size: 5 + Math.random() * 9,
      speed: 0.5 + Math.random() * 1.5,
      drift: (Math.random() - 0.5) * 0.8,
      swing: 10 + Math.random() * 30,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.035,
      opacity: 0.55 + Math.random() * 0.45,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }

  function drawPetal(p, time) {
    ctx.save();

    const sway = Math.sin(time * 0.0015 + p.phase) * p.swing;

    ctx.translate(p.x + sway, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(1, 0.7 + Math.abs(Math.sin(p.rotation)) * 0.3);

    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    const s = p.size;

    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s, -s, s * 1.2, s * 0.4, 0, s);
    ctx.bezierCurveTo(-s * 1.2, s * 0.4, -s, -s, 0, -s);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function animate(time) {
    const delta = Math.min((time - lastTime) / 16.67, 3);
    lastTime = time;

    ctx.clearRect(0, 0, width, height);

    for (const p of petals) {
      p.y += p.speed * delta;
      p.x += p.drift * delta;
      p.rotation += p.spin * delta;

      if (p.y > height + 30 || p.x < -80 || p.x > width + 80) {
        Object.assign(p, createPetal());
      }

      drawPetal(p, time);
    }

    animationId = requestAnimationFrame(animate);
  }

  resize();

  // 根据屏幕大小调整花瓣数量
  const count = Math.min(110, Math.max(35, Math.floor(width * height / 17000)));

  petals = Array.from({ length: count }, () => createPetal(true));

  window.addEventListener("resize", resize);
  animationId = requestAnimationFrame(animate);

  // 提供停止特效的方法
  window.stopPetalFall = () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", resize);
    canvas.remove();
    delete window.stopPetalFall;
  };

  console.log("🌸 樱花飘落特效已启动");
})();
