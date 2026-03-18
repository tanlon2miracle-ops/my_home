/* 强制首次访问使用亮色模式
   MkDocs Material 会在 localStorage 存 __palette，
   旧主题(EVA暗色)遗留的值会让回访用户看到暗色。
   这段脚本在首次加载时检测并清理过期的 palette 偏好。 */
(function () {
  try {
    var key = "__palette";
    var stored = localStorage.getItem(key);
    if (stored) {
      var parsed = JSON.parse(stored);
      // 如果存的 scheme 是 slate（暗色），重置为亮色
      if (parsed && parsed.scheme === "slate") {
        localStorage.removeItem(key);
        // 如果当前已经渲染了暗色，刷新一次
        if (document.body) {
          location.reload();
        }
      }
    }
  } catch (e) {
    // ignore
  }
})();
