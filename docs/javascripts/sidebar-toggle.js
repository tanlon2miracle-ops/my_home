/* === Sidebar Hover + Width Toggle === */
document.addEventListener('DOMContentLoaded', function () {
  // ============ 1. Width mode toggle (wide/narrow) ============
  var widthBtn = document.createElement('button');
  widthBtn.className = 'width-toggle-btn';
  widthBtn.title = 'Toggle wide/narrow mode';

  // Load saved preference
  var isWide = localStorage.getItem('content-width-mode') !== 'narrow';
  updateWidthMode();

  widthBtn.addEventListener('click', function () {
    isWide = !isWide;
    localStorage.setItem('content-width-mode', isWide ? 'wide' : 'narrow');
    updateWidthMode();
  });

  function updateWidthMode() {
    if (isWide) {
      document.body.classList.add('wide-mode');
      document.body.classList.remove('narrow-mode');
      widthBtn.innerHTML = '\u2194\uFE0F'; // ↔️
      widthBtn.title = 'Switch to narrow mode';
    } else {
      document.body.classList.remove('wide-mode');
      document.body.classList.add('narrow-mode');
      widthBtn.innerHTML = '\u2195\uFE0F'; // ↕️ (using as narrow icon)
      widthBtn.title = 'Switch to wide mode';
    }
  }

  document.body.appendChild(widthBtn);

  // ============ 2. Sidebar hover zones (desktop only) ============
  // Left sidebar hover zone
  var leftZone = document.createElement('div');
  leftZone.className = 'sidebar-hover-zone sidebar-hover-zone--left';
  document.body.appendChild(leftZone);

  // Right sidebar (TOC) hover zone
  var rightZone = document.createElement('div');
  rightZone.className = 'sidebar-hover-zone sidebar-hover-zone--right';
  document.body.appendChild(rightZone);

  // Overlay for closing
  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  // Left sidebar: hover to open, leave to close
  var leftTimer = null;
  function openLeft() {
    clearTimeout(leftTimer);
    document.body.classList.add('sidebar-open');
    document.body.classList.remove('toc-open');
  }
  function closeLeft() {
    leftTimer = setTimeout(function () {
      document.body.classList.remove('sidebar-open');
    }, 300);
  }

  leftZone.addEventListener('mouseenter', openLeft);
  leftZone.addEventListener('mouseleave', closeLeft);

  // Keep sidebar open when hovering the sidebar itself
  var primarySidebar = document.querySelector('.md-sidebar--primary');
  if (primarySidebar) {
    primarySidebar.addEventListener('mouseenter', function () {
      clearTimeout(leftTimer);
      document.body.classList.add('sidebar-open');
    });
    primarySidebar.addEventListener('mouseleave', closeLeft);
  }

  // Right sidebar (TOC): hover to open, leave to close
  var rightTimer = null;
  function openRight() {
    clearTimeout(rightTimer);
    document.body.classList.add('toc-open');
    document.body.classList.remove('sidebar-open');
  }
  function closeRight() {
    rightTimer = setTimeout(function () {
      document.body.classList.remove('toc-open');
    }, 300);
  }

  rightZone.addEventListener('mouseenter', openRight);
  rightZone.addEventListener('mouseleave', closeRight);

  var secondarySidebar = document.querySelector('.md-sidebar--secondary');
  if (secondarySidebar) {
    secondarySidebar.addEventListener('mouseenter', function () {
      clearTimeout(rightTimer);
      document.body.classList.add('toc-open');
    });
    secondarySidebar.addEventListener('mouseleave', closeRight);
  }

  // Overlay click closes all
  overlay.addEventListener('click', function () {
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('toc-open');
  });

  // ESC closes all
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.body.classList.remove('sidebar-open');
      document.body.classList.remove('toc-open');
    }
  });

  // ============ 3. Remove old toggle buttons if any ============
  var oldNavBtn = document.querySelector('.sidebar-toggle-btn');
  var oldTocBtn = document.querySelector('.toc-toggle-btn');
  if (oldNavBtn) oldNavBtn.remove();
  if (oldTocBtn) oldTocBtn.remove();
});
