
(() => {
  // 尽量在顶层网页执行，而不是内部 iframe
  let W = window;
  try {
    if (window.top.document) W = window.top;
  } catch (_) {}

  const D = W.document;

  // 清除之前的樱花
  W.stopSakura?.();

  // 创建网页顶层容器
  const host = D.createElement("div");
  host.setAttribute("popover", "manual");

  const styles = {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    margin: "0",
    padding: "0",
    border: "0",
    outline: "0",
    background: "transparent",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: "2147483647",
    maxWidth: "none",
    maxHeight: "none",
    visibility: "visible",
    opacity: "1",
    boxSizing: "border-box"
  };

  for (const [key, value] of Object.entries(styles)) {
    const property = key.replace(/[A-Z]/g, c => "-" + c.toLowerCase());
    host.style.setProperty(property, value, "important");
  }

  (D.body || D.documentElement).appendChild(host);

  // 进入浏览器真正的 Top Layer
  try {
    host.showPopover();
  } catch (error) {
    host.removeAttribute("popover");
    console.warn("Top Layer 不可用，使用最高 z-index", error);
  }

  // 隔离网站本身的 CSS
  const root = host.attachShadow({ mode: "open" });

  // 花瓣数量
  const COUNT = 150;

  const random = (min, max) =>
    min + Math.random() * (max - min);

  const animations = [];

  // 立即生成全部花瓣
  for (let i = 0; i < COUNT; i++) {
    const petal = D.createElement("span");

    const size = random(16, 30);
    const x = random(0, W.innerWidth);
    const bottom = W.innerHeight + 80;

    const wind = random(-180, 180);
    const swing = random(30, 110);
    const duration = random(7000, 14500);
    const angle = random(0, 360);

    // 樱花外观
    petal.style.cssText = `
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      display: block !important;
      width: ${size}px !important;
      height: ${size * 1.12}px !important;
      border-radius: 80% 12% 80% 15% !important;
      background: radial-gradient(
        circle at 28% 30%,
        #ffe9f2 0%,
        #ff86b0 54%,
        #ef357c 100%
      ) !important;
      box-shadow: 0 0 3px #f35a9a !important;
      opacity: ${random(0.75, 1)} !important;
      pointer-events: none !important;
      will-change: transform !important;
    `;

    root.appendChild(petal);

    // 关键：负延迟，让花瓣立即遍布整个屏幕
    const animation = petal.animate(
      [
        {
          transform: `translate3d(${x}px,-50px,0) rotate(${angle}deg) rotateY(0deg)`,
          offset: 0
        },
        {
          transform: `translate3d(${x + wind * 0.33 + swing}px,${bottom * 0.33}px,0) rotate(${angle + 150}deg) rotateY(130deg)`,
          offset: 0.33
        },
        {
          transform: `translate3d(${x + wind * 0.66 - swing}px,${bottom * 0.66}px,0) rotate(${angle + 320}deg) rotateY(250deg)`,
          offset: 0.66
        },
        {
          transform: `translate3d(${x + wind}px,${bottom}px,0) rotate(${angle + 540}deg) rotateY(360deg)`,
          offset: 1
        }
      ],
      {
        duration: duration,
        iterations: Infinity,
        delay: -random(0, duration),
        easing: "linear"
      }
    );

    animations.push(animation);
  }

  // 停止特效
  W.stopSakura = function () {
    animations.forEach(a => a.cancel());
    host.remove();
    delete W.stopSakura;
    console.log("🌸 樱花效果已关闭");
  };

  console.log(
    "🌸 已创建 " + COUNT + " 片樱花",
    "Top Layer:",
    host.matches(":popover-open")
  );
})();
