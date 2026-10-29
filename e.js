
(() => {
  let W = window;
  try {
    if (window.top.document) W = window.top;
  } catch (_) {}

  const D = W.document;

  // 清除旧特效
  W.stopSakura?.();
  W.stopPetalFall?.();

  // 参数
  const PETAL_COUNT = 150;
  const TEXT_COUNT = 7;
  const TEXT = "curme";
  const rand = (a, b) => a + Math.random() * (b - a);

  // 创建顶层窗口
  const host = D.createElement("div");
  host.setAttribute("popover", "manual");

  const css = {
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

  for (const [key, value] of Object.entries(css)) {
    host.style.setProperty(
      key.replace(/[A-Z]/g, c => "-" + c.toLowerCase()),
      value,
      "important"
    );
  }

  (D.body || D.documentElement).appendChild(host);

  try {
    host.showPopover();
  } catch (_) {
    host.removeAttribute("popover");
  }

  // Shadow DOM 隔离网站 CSS
  const root = host.attachShadow({ mode: "open" });

  root.innerHTML = `
    <style>
      #petals, #words {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
      }

      #petals { z-index: 1; }
      #words { z-index: 999999; }

      .petal {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        border-radius: 80% 12% 80% 15%;
        background: radial-gradient(
          circle at 28% 30%,
          #ffe9f2 0%,
          #ff86b0 54%,
          #ef357c 100%
        );
        box-shadow: 0 0 3px #f35a9a;
        pointer-events: none;
        will-change: transform;
      }

      .word {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        white-space: nowrap;
        font-family: Arial, sans-serif;
        font-weight: 900;
        line-height: 1.2;
        color: #ffffff;
        -webkit-text-stroke: 3px #ff2482;
        text-shadow:
          0 0 5px #ff1888,
          0 0 12px #ff1888,
          0 0 25px #ff69b4,
          4px 5px 0 #b91860;
        pointer-events: none;
        will-change: transform;
        z-index: 999999;
      }
    </style>
    <div id="petals"></div>
    <div id="words"></div>
  `;

  const petalLayer = root.getElementById("petals");
  const wordLayer = root.getElementById("words");
  const animations = [];

  // ===========================
  // 1. 樱花飘落
  // ===========================

  for (let i = 0; i < PETAL_COUNT; i++) {
    const petal = D.createElement("span");
    petal.className = "petal";

    const size = rand(13, 27);
    const x = rand(0, W.innerWidth);
    const bottom = W.innerHeight + 70;
    const wind = rand(-160, 160);
    const swing = rand(30, 100);
    const duration = rand(6500, 14000);
    const angle = rand(0, 360);

    petal.style.width = size + "px";
    petal.style.height = size * 1.15 + "px";
    petal.style.opacity = rand(0.7, 1);

    petalLayer.appendChild(petal);

    const animation = petal.animate(
      [
        {
          transform: `translate3d(${x}px,-50px,0) rotate(${angle}deg) rotateY(0deg)`
        },
        {
          transform: `translate3d(${x + wind * .33 + swing}px,${bottom * .33}px,0) rotate(${angle + 140}deg) rotateY(120deg)`
        },
        {
          transform: `translate3d(${x + wind * .66 - swing}px,${bottom * .66}px,0) rotate(${angle + 300}deg) rotateY(250deg)`
        },
        {
          transform: `translate3d(${x + wind}px,${bottom}px,0) rotate(${angle + 540}deg) rotateY(360deg)`
        }
      ],
      {
        duration,
        iterations: Infinity,
        delay: -rand(0, duration),
        easing: "linear"
      }
    );

    animations.push(animation);
  }

  // ===========================
  // 2. 大号 curme 跳动文字
  // ===========================

  const words = [];
  let screenWidth = W.innerWidth;
  let screenHeight = W.innerHeight;

  for (let i = 0; i < TEXT_COUNT; i++) {
    const el = D.createElement("span");
    el.className = "word";
    el.textContent = TEXT;

    // 大号字体
    const fontSize = Math.min(
      rand(52, 85),
      Math.max(40, screenWidth / 5)
    );

    el.style.fontSize = fontSize + "px";

    // 部分文字使用不同色调
    if (i % 3 === 1) {
      el.style.webkitTextStroke = "3px #a84bff";
      el.style.textShadow =
        "0 0 12px #b66aff, 0 0 25px #a84bff, 4px 5px 0 #6329ad";
    }

    wordLayer.appendChild(el);

    const rect = el.getBoundingClientRect();
    const textWidth = rect.width || fontSize * 3.5;
    const textHeight = rect.height || fontSize * 1.2;

    const maxX = Math.max(0, screenWidth - textWidth);
    const maxY = Math.max(0, screenHeight - textHeight - 55);

    words.push({
      el,
      x: rand(0, maxX),
      y: rand(45, Math.max(45, maxY)),
      vx: rand(35, 95) * (Math.random() > .5 ? 1 : -1),
      vy: rand(20, 65) * (Math.random() > .5 ? 1 : -1),
      width: textWidth,
      height: textHeight,
      phase: rand(0, Math.PI * 2),
      jumpSpeed: rand(2.5, 4.5),
      jumpHeight: rand(20, 55)
    });
  }

  // ===========================
  // 3. 文字跳动动画
  // ===========================

  let frameId;
  let previous = 0;

  function animate(time) {
    const dt = Math.min(
      (time - (previous || time)) / 1000,
      0.05
    );

    previous = time;

    for (const p of words) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const maxX = Math.max(0, screenWidth - p.width);
      const maxY = Math.max(
        0,
        screenHeight - p.height - p.jumpHeight
      );

      // 碰到屏幕边缘反弹
      if (p.x <= 0) {
        p.x = 0;
        p.vx = Math.abs(p.vx);
      } else if (p.x >= maxX) {
        p.x = maxX;
        p.vx = -Math.abs(p.vx);
      }

      if (p.y <= p.jumpHeight) {
        p.y = p.jumpHeight;
        p.vy = Math.abs(p.vy);
      } else if (p.y >= maxY) {
        p.y = maxY;
        p.vy = -Math.abs(p.vy);
      }

      // 上下弹跳
      const jump = Math.abs(
        Math.sin(time * 0.001 * p.jumpSpeed + p.phase)
      );

      const offsetY = jump * p.jumpHeight;

      // 跳动时轻微放大
      const scale = 1 + jump * 0.12;

      // 轻微左右摇摆
      const rotation = Math.sin(
        time * 0.002 + p.phase
      ) * 8;

      p.el.style.transform =
        `translate3d(${p.x}px,${p.y - offsetY}px,0) ` +
        `rotate(${rotation}deg) scale(${scale})`;
    }

    frameId = W.requestAnimationFrame(animate);
  }

  function resize() {
    screenWidth = W.innerWidth;
    screenHeight = W.innerHeight;
  }

  W.addEventListener("resize", resize);
  frameId = W.requestAnimationFrame(animate);

  // ===========================
  // 4. 关闭特效
  // ===========================

  W.stopSakura = () => {
    W.cancelAnimationFrame(frameId);
    W.removeEventListener("resize", resize);

    animations.forEach(a => a.cancel());

    try {
      if (host.matches(":popover-open")) {
        host.hidePopover();
      }
    } catch (_) {}

    host.remove();
    delete W.stopSakura;

    console.log("🌸 特效已关闭");
  };

  console.log(
    `🌸 启动成功：${PETAL_COUNT} 片樱花 + ${TEXT_COUNT} 个 ${TEXT}`
  );
})();
