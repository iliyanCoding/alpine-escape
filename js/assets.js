function loadAssets(assets, callback) {
  let remaining = assets.length;

  function onLoaded() {
    remaining -= 1;
    if (remaining === 0) {
      callback();
    }
  }

  for (const asset of assets) {
    const element = asset.var;
    if (element instanceof HTMLImageElement) {
      element.addEventListener("load", onLoaded, false);
    } else if (element instanceof HTMLAudioElement) {
      element.addEventListener("canplaythrough", onLoaded, false);
    }
    element.src = asset.url;
  }
}

export { loadAssets };
