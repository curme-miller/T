(() => {
  let W = window;
  try {
    if (window.top && window.top.document) W = window.top;
  } catch (_) {}

  const D = W.document;

  // 清理旧效果
  W.stopCurme3D?.();
  W.stopSakura?.();

  const TEXT = "curme";
  const START_COUNT = 10;
  const ADD_EVERY_MS = 1000;
  const ADD_COUNT = 2;
  const MAX_COUNT = 100;

  const rand = (a, b) => a + Math.random() * (b - a);

  // ========= 顶层容器 =========
  const host = D.createElement("div");
  host.setAttribute("popover", "manual");

  const hostStyle = {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    margin: "0",
    padding: "0",
    border: "0",
    background: "transparent",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: "2147483647",
    display: "block",
    visibility: "visible",
    opacity: "1",
    maxWidth: "none",
    maxHeight: "none"
  };

  for (const [k, v] of Object.entries(hostStyle)) {
    host.style.setProperty(
      k.replace(/[A-Z]/g, c => "-" + c.toLowerCase()),
      v,
      "important"
    );
  }

  (D.body || D.documentElement).appendChild(host);

  try {
    host.showPopover();
  } catch (_) {
    host.removeAttribute("popover");
  }

  const root = host.attachShadow({ mode: "open" });

  root.innerHTML = `
    <style>
      :host, * {
        box-sizing: border-box;
      }

      #layer {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        perspective: 1000px;
      }

      .curme {
        position: absolute;
        left: 0;
        top: 0;
        display: inline-block;
        white-space: nowrap;
        pointer-events: none;
        user-select: none;
        font-family: Impact, "Arial Black", Arial, sans-serif;
        font-weight: 900;
        line-height: 1;
        letter-spacing: 1px;
        will-change: transform;
        transform-style: preserve-3d;

        /* 彩色立体文字 */
        background: linear-gradient(
          90deg,
          #ff2d55 0%,
          #ff9500 16%,
          #ffd60a 32%,
          #30d158 48%,
          #0a84ff 64%,
          #5e5ce6 82%,
          #ff2d55 100%
        );
        background-size: 250% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;

        -webkit-text-stroke: 2px rgba(255,255,255,0.9);

        text-shadow:
          1px 1px 0 #7a1840,
          2px 2px 0 #7a1840,
          3px 3px 0 #7a1840,
          4px 4px 0 #7a1840,
          5px 5px 0 #7a1840,
          6px 6px 0 rgba(70, 10, 40, 0.95),
          8px 8px 12px rgba(0,0,0,0.35),
          0 0 10px rgba(255,255,255,0.55),
          0 0 24px rgba(255,105,180,0.55);

        filter: saturate(1.25) contrast(1.08);
      }

      .shine {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
    </style>
    <div id="layer"></div>
  `;

  const layer = root.getElementById("layer");

  let screenW = W.innerWidth;
  let screenH = W.innerHeight;

  const items = [];
  let frameId = 0;
  let previous = 0;
  let addTimer = 0;

  function getFontSize() {
    const base = Math.min(screenW, screenH);
    return Math.max(34, Math.min(72, base * 0.065));
  }

  function makeWord() {
    const el = D.createElement("span");
    el.className = "curme";
    el.textContent = TEXT;

    const fontSize = rand(getFontSize() * 0.85, getFontSize() * 1.2);
    el.style.fontSize = fontSize + "px";

    // 每个文字有独立色相偏移，让整体更彩
    el.style.filter = `hue-rotate(${rand(0, 360)}deg) saturate(1.35) contrast(1.08)`;

    layer.appendChild(el);

    const rect = el.getBoundingClientRect();
    const width = Math.max(rect.width, fontSize * 3.8);
    const height = Math.max(rect.height, fontSize * 1.2);

    const x = rand(0, Math.max(0, screenW - width));
    const y = rand(0, Math.max(0, screenH - height));

    const speed = rand(90, 220);
    const angle = rand(0, Math.PI * 2);

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const item = {
      el,
      x,
      y,
      vx,
      vy,
      width,
      height,
      rot: rand(-18, 18),
      rotSpeed: rand(-55, 55),
      tiltX: rand(-22, 22),
      tiltY: rand(-22, 22),
      pulsePhase: rand(0, Math.PI * 2),
      pulseSpeed: rand(1.2, 3.4)
    };

    applyTransform(item, performance.now());
    items.push(item);
  }

  function applyTransform(item, time) {
    const pulse = 1 + Math.sin(time * 0.001 * item.pulseSpeed + item.pulsePhase) * 0.08;
    const tiltX = item.tiltX + Math.sin(time * 0.0014 + item.pulsePhase) * 6;
    const tiltY = item.tiltY + Math.cos(time * 0.0012 + item.pulsePhase) * 6;

    item.el.style.transform =
      `translate3d(${item.x}px, ${item.y}px, 0) ` +
      `rotate(${item.rot}deg) ` +
      `rotateX(${tiltX}deg) ` +
      `rotateY(${tiltY}deg) ` +
      `scale(${pulse})`;

    // 彩虹流动
    item.el.style.backgroundPosition =
      `${(time * 0.045 + item.pulsePhase * 100) % 250}px 0`;
  }

  function seedInitialWords() {
    for (let i = 0; i < START_COUNT; i++) {
      makeWord();
    }
  }

  function addWordsOverTime() {
    if (items.length >= MAX_COUNT) return;
    const remain = MAX_COUNT - items.length;
    const count = Math.min(ADD_COUNT, remain);
    for (let i = 0; i < count; i++) {
      makeWord();
    }
  }

  function animate(time) {
    const dt = Math.min((time - (previous || time)) / 1000, 0.05);
    previous = time;

    for (const item of items) {
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.rot += item.rotSpeed * dt;

      const maxX = Math.max(0, screenW - item.width);
      const maxY = Math.max(0, screenH - item.height);

      // 左右边界反弹
      if (item.x <= 0) {
        item.x = 0;
        item.vx = Math.abs(item.vx);
        item.rotSpeed *= -1;
      } else if (item.x >= maxX) {
        item.x = maxX;
        item.vx = -Math.abs(item.vx);
        item.rotSpeed *= -1;
      }

      // 上下边界反弹
      if (item.y <= 0) {
        item.y = 0;
        item.vy = Math.abs(item.vy);
        item.rotSpeed *= -1;
      } else if (item.y >= maxY) {
        item.y = maxY;
        item.vy = -Math.abs(item.vy);
        item.rotSpeed *= -1;
      }

      applyTransform(item, time);
    }

    frameId = W.requestAnimationFrame(animate);
  }

  function resize() {
    screenW = W.innerWidth;
    screenH = W.innerHeight;

    for (const item of items) {
      const rect = item.el.getBoundingClientRect();
      item.width = rect.width || item.width;
      item.height = rect.height || item.height;

      item.x = Math.min(item.x, Math.max(0, screenW - item.width));
      item.y = Math.min(item.y, Math.max(0, screenH - item.height));
    }
  }

  seedInitialWords();

  W.addEventListener("resize", resize);

  addTimer = W.setInterval(() => {
    addWordsOverTime();
  }, ADD_EVERY_MS);

  frameId = W.requestAnimationFrame(animate);

  W.stopCurme3D = () => {
    W.cancelAnimationFrame(frameId);
    W.clearInterval(addTimer);
    W.removeEventListener("resize", resize);

    try {
      if (host.matches(":popover-open")) {
        host.hidePopover();
      }
    } catch (_) {}

    host.remove();
    delete W.stopCurme3D;

    console.log("curme 3D 效果已关闭");
  };

  console.log(
    `已启动 3D curme：初始 ${START_COUNT} 个，每 ${ADD_EVERY_MS / 1000} 秒增加 ${ADD_COUNT} 个，最多 ${MAX_COUNT} 个`
  );
})();
