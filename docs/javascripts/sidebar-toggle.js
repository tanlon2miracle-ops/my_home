/* === 侧边栏切换 === */
document.addEventListener('DOMContentLoaded', function () {
  // 只在桌面端创建按钮
  var navBtn = document.createElement('button');
  navBtn.className = 'sidebar-toggle-btn';
  navBtn.innerHTML = '📑';
  navBtn.title = '展开/收起导航';

  var tocBtn = document.createElement('button');
  tocBtn.className = 'toc-toggle-btn';
  tocBtn.innerHTML = '📋';
  tocBtn.title = '展开/收起目录';

  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';

  document.body.appendChild(navBtn);
  document.body.appendChild(tocBtn);
  document.body.appendChild(overlay);

  navBtn.addEventListener('click', function () {
    document.body.classList.toggle('sidebar-open');
    document.body.classList.remove('toc-open');
  });

  tocBtn.addEventListener('click', function () {
    document.body.classList.toggle('toc-open');
    document.body.classList.remove('sidebar-open');
  });

  overlay.addEventListener('click', function () {
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('toc-open');
  });

  // ESC 关闭
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.body.classList.remove('sidebar-open');
      document.body.classList.remove('toc-open');
    }
  });
});
