
const { app, BrowserWindow, screen } = require("electron");

// 花瓣动画页面
const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
  }

  #layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .petal {
    position: absolute;
    left: 0;
    top: 0;
    width: 20px;
    height: 26px;
    border-radius: 88% 12% 75% 25%;
    background: radial-gradient(
      ellipse at 28% 30%,
      #ffe5ef 0%,
      #ff95ba 48%,
      #f03777 100%
    );
    box-shadow: 0 0 3px rgba(255, 50, 110, .4);
    opacity: .93;
    will-change: transform;
  }
</style>
</head>
<body>
<div id="layer"></div>

<script>
(() => {
  const layer = document.getElementById("layer");
  const rand = (min, max) =>
    min + Math.random() * (max - min);

  const petals = [];

  const count = Math.min(
    200,
    Math.max(
      95,
      Math.floor(innerWidth * innerHeight / 9000)
    )
  );

  function reset(p, anywhere) {
    p.x = rand(-30, innerWidth + 30);
    p.y = anywhere
      ? rand(0, innerHeight)
      : rand(-70, -20);

    p.speed = rand(45, 125);
    p.wind = rand(-35, 25);
    p.sway = rand(12, 55);
    p.freq = rand(.001, .0025);
    p.phase = rand(0, Math.PI * 2);
    p.angle = rand(0, 360);
    p.spin = rand(-120, 120);
    p.flip = rand(0, Math.PI * 2);

    const size = rand(12, 25);

    p.el.style.width = size + "px";
    p.el.style.height = size * 1.35 + "px";
    p.el.style.opacity = rand(.75, 1);
  }

  // 初始化花瓣：立即分布到整个屏幕
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "petal";
    layer.appendChild(el);

    const p = { el };
    reset(p, true);
    petals.push(p);
  }

  let previous = 0;

  function animate(time) {
    const dt = Math.min(
      (time - (previous || time)) / 1000,
      .05
    );

    previous = time;

    for (const p of petals) {
      p.y += p.speed * dt;
      p.x += p.wind * dt;
      p.angle += p.spin * dt;
      p.flip += 2 * dt;

      if (
        p.y > innerHeight + 40 ||
        p.x < -100 ||
        p.x > innerWidth + 100
      ) {
        reset(p, false);
      }

      const x =
        p.x +
        Math.sin(time * p.freq + p.phase) * p.sway;

      const flip =
        .4 + Math.abs(Math.cos(p.flip)) * .6;

      p.el.style.transform =
        "translate3d(" +
        x + "px," +
        p.y + "px,0) rotate(" +
        p.angle + "deg) scaleX(" +
        flip + ")";
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
</script>
</body>
</html>
`;

// 保留窗口引用
const windows = [];

function createOverlay(display) {
  const { x, y, width, height } = display.bounds;

  const win = new BrowserWindow({
    x,
    y,
    width,
    height,

    // 全透明、无边框
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",

    // 置顶
    alwaysOnTop: true,

    // 不抢占当前应用焦点
    focusable: false,

    // 不显示任务栏图标
    skipTaskbar: true,

    // 不显示阴影
    hasShadow: false,

    resizable: false,
    fullscreenable: false,
    show: false,

    webPreferences: {
      backgroundThrottling: false
    }
  });

  windows.push(win);

  // 鼠标穿透，不影响下面的软件
  win.setIgnoreMouseEvents(true, {
    forward: true
  });

  win.webContents.on("did-finish-load", () => {
    win.showInactive();

    // macOS 高级别置顶窗口
    win.setAlwaysOnTop(true, "screen-saver");

    // 在全部桌面空间以及全屏应用上显示
    if (process.platform === "darwin") {
      win.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true
      });
    }
  });

  win.loadURL(
    "data:text/html;charset=UTF-8," +
    encodeURIComponent(html)
  );
}

// 启动
app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock.hide();
  }

  // 支持多个显示器
  for (const display of screen.getAllDisplays()) {
    createOverlay(display);
  }
});

app.on("window-all-closed", () => app.quit());
