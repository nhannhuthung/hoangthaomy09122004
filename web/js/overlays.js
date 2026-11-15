"use strict";
/* What is drawn over the bouquet: the gold sparks, the stars drawing it, the sky's stars, the loose
   petals. Cells are [row, col, char, colour]; loose petals glide at exact (fractional) positions. */

function sprites(t, g, aspect, view, withBouquet) {
  const { rows, cols } = g, k = cols / (aspect * rows), fitB = zoom(aspect), zbuf = withBouquet ? g.zbuf : g.empty;
  const [ox, oy, oz] = CAM_OFF;
  const project = (x, y, z, M, fit) => {
    const qz = M[6] * x + M[7] * y + M[8] * z - oz, iz = FOCAL * 0.5 * fit / Math.max(qz, 1e-3);
    const fy = MIDDLE * rows - (M[3] * x + M[4] * y + M[5] * z - oy) * iz * rows;
    const fx = 0.5 * cols + (M[0] * x + M[1] * y + M[2] * z - ox) * iz * (cols / aspect);
    const r = Math.floor(fy), c = Math.floor(fx);
    return { fx, fy, r, c, z: qz, ok: qz > NEAR && r >= 0 && r < rows && c >= 0 && c < cols };
  };
  let sparks = [], drawing = [];
  const loose = [];
  let nFalling = 0;
  if (withBouquet) {
    const cs = newCand();
    pops(t, (x, y, z, size, glint) => {
      const p = project(x, y, z, view, fitB);
      if (p.ok) addStar(cs, p.r, p.c, 0, clamp(0.45 + 0.65 * size, 0, 1), glint ? MAT.glint : MAT.gold, p.z, k);
    });
    sparks = onePerCell(g, cs, (cell, i) => cs.z[i] < zbuf[cell] + 0.3);
    const list = [];                                        // a bright * trailing glitter, now and then flashing rays
    for (let j = 0; j < 6; j++) pens(t - 0.035 * j, (x, y, z, b) => list.push([x, y, z, b * (1 - j / 6), j === 0]));
    const cd = newCand();
    list.forEach(([x, y, z, b0, head], n) => {
      const b = b0 * (0.75 + 0.25 * Math.sin(37 * t + 1.7 * n)), p = project(x, y, z, view, fitB);
      if (!p.ok || !(b > 0.03)) return;
      if (head) {
        const flash = clamp(Math.sin(23 * t + 2.3 * n), 0, 1) ** 4;
        addStar(cd, p.r, p.c, flash > 0.3 ? 1.2 + 0.8 * flash : 0, b, MAT.glint, p.z, k);
        candPush(cd, p.r, p.c, "*", colourOf(MAT.glint, b), 2.0, p.z);
      } else candPush(cd, p.r, p.c, b > 0.45 ? "+" : ".", colourOf(MAT.glint, b), b, p.z);
    });
    drawing = onePerCell(g, cd, (cell, i) => cd.z[i] < zbuf[cell] + 0.2);
    falling(t, (x, y, z, rose, pose, fade) => {
      const p = project(x, y, z, SKY_VIEW, fitB);
      if (fade < 0.05 || !p.ok || p.z > zbuf[p.r * cols + p.c] + 0.02) return;
      nFalling++;
      const tint = colourOf(ROSE_MAT[rose], 0.3 + 0.6 * fade);
      FALL_POSES[pose].forEach((ch, dc) => { if (ch) loose.push([p.fx - 0.5 + dc, p.fy - 0.5, ch, tint]); });
    });
  }
  const taken = g.taken;
  taken.fill(0);
  for (const [r, c] of sparks) taken[r * cols + c] = 1;
  for (const [r, c] of drawing) taken[r * cols + c] = 1;
  const sk = newCand(), tiles = skyTiles(aspect);           // wide windows get copies of the star field
  for (let tile = -tiles; tile <= tiles; tile++) {
    for (let i = 0; i < N_STARS; i++) {
      const st = star(i, t, tile), p = project(st.x, st.y, st.z, SKY_VIEW, 1.0);   // the sky fills the window, never zoomed
      if (!p.ok || !(st.glow > 0.02)) continue;
      let burst = STAR_BIG[st.kind] * clamp(st.glow - 0.65, 0, 1) ** 0.6;
      if (!(burst >= STAR_MIN)) burst = 0;
      addStar(sk, p.r, p.c, burst, clamp(0.2 + 0.55 * st.glow, 0, 1), MAT.star, 0, k);
    }
  }
  const sky = onePerCell(g, sk, (cell) => zbuf[cell] === Infinity && !taken[cell]);
  return { sky, sparks, drawing, loose, nFalling };
}
