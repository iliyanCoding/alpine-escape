// AABB collision detection: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

export { collides };
