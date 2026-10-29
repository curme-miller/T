
(() => {
  "use strict";

  // 防止重复执行
  const KEY = "__sakuraTopmostEffect__";
  window[KEY]?.stop();
  window.stopPetalFall?.();

  // 创建最顶层容器
  const overlay = document.createElement("div");
  overlay.id = "sakura-overlay-" + Date.now();
  overlay.setAttribute("popover", "manual");

  const styles = {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    margin: "0",
    padding: "0",
    border: "0",
    overflow: "hidden",
    background: "transparent",
    display: "block",
    visibility: "visible",
    opacity: "1",
    "pointer-events": "none",
    "z-index": "2147483647"
  };

  for (const [name, value] of Object.entries(styles)) {
    overlay.style.setProperty(name, value, "important");
  }

  // 创建 Canvas
  const canvas = document.createElement("canvas");

  Object.assign(canvas.style, {
    display: "block",
    width: "100%",
    height: "100%",
    pointerEvents: "none"
  });

  overlay.appendChild(canvas);
  (document.body || document.documentElement).appendChild(overlay);

  // 进入浏览器 Top Layer
  // 不支持时使用最高 z-index
  try {
    overlay.showPopover?.();
  } catch (_) {}

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    overlay.remove();
    throw new Error("浏览器不支持 Canvas 2D");
  }

  let w = 0;
  let h = 0;
  let petals = [];
  let id = 0;
  let last = 0;

  // 樱花颜色
  const colors = [
    "#ff5d91",
    "#ff76a5",
    "#ff95b8",
    "#f74682",
    "#ffb1cb"
  ];

  const random = (a, b) => a + Math.random() * (b - a);

  // 创建花瓣
  function makePetal(anywhere = false) {
    return {
      x: random(-20, w + 20),
      y: anywhere ? random(0, h) : random(-80, -20),
      size: random(9, 19),
      speed: random(35, 105),
      drift: random(-18, 27),
      sway: random(8, 42),
      frequency: random(0.0008, 0.0021),
      phase: random(0, Math.PI * 2),
      angle: random(0, Math.PI * 2),
      spin: random(-1.8, 1.8),
      flip: random(0, Math.PI * 2),
      alpha: random(0.68, 0.98),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }

  // 根据屏幕调整尺寸
  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 花瓣数量
    const count = Math.min(
      165,
      Math.max(55, Math.round(w * h / 9000))
    );

    petals = Array.from(
      { length: count },
      () => makePetal(true)
    );
  }

  // 绘制樱花花瓣
  function drawPetal(p, time) {
    const x =
      p.x +
      Math.sin(time * p.frequency + p.phase) * p.sway;

    ctx.save();
    ctx.translate(x, p.y);
    ctx.rotate(p.angle);

    ctx.scale(
      Math.max(0.28, Math.abs(Math.cos(p.flip))),
      1
    );

    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.strokeStyle = "rgba(180, 34, 83, .32)";
    ctx.lineWidth = 0.8;

    const s = p.size;

    ctx.beginPath();
    ctx.moveTo(0, -s);

    ctx.bezierCurveTo(
      s * 1.1, -s * 0.95,
      s * 1.15, s * 0.55,
      0, s
    );

    ctx.bezierCurveTo(
      -s * 1.15, s * 0.55,
      -s * 1.1, -s * 0.95,
      0, -s
    );

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 花瓣中间纹理
    ctx.beginPath();
    ctx.moveTo(0, s * 0.72);

    ctx.quadraticCurveTo(
      s * 0.22, 0,
      0, -s * 0.63
    );

    ctx.strokeStyle = "rgba(255, 255, 255, .45)";
    ctx.stroke();

    ctx.restore();
  }

  // 动画循环
  function frame(time) {
    const dt = Math.min(
      (time - (last || time)) / 1000,
      0.05
    );

    last = time;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < petals.length; i++) {
      let p = petals[i];

      // 花瓣下落
      p.y += p.speed * dt;

      // 水平方向飘动
      p.x += p.drift * dt;

      // 旋转
      p.angle += p.spin * dt;

      // 翻转
      p.flip += 2.0 * dt;

      // 离开屏幕后重新生成
      if (
        p.y > h + 40 ||
        p.x < -100 ||
        p.x > w + 100
      ) {
        p = petals[i] = makePetal();
      }

      drawPetal(p, time);
    }

    id = requestAnimationFrame(frame);
  }

  // 启动动画
  resize();

  window.addEventListener("resize", resize);

  id = requestAnimationFrame(frame);

  // 关闭功能
  window[KEY] = {
    stop() {
      cancelAnimationFrame(id);

      window.removeEventListener("resize", resize);

      try {
        if (overlay.matches(":popover-open")) {
          overlay.hidePopover();
        }
      } catch (_) {}

      overlay.remove();

      delete window[KEY];
      delete window.stopSakura;
    }
  };

  window.stopSakura = () => window[KEY]?.stop();

  console.log("🌸 樱花花瓣特效已启动！");
})();
