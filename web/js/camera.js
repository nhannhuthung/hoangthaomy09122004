"use strict";
/* Where we look from, the light, the gentle swing, and how points land on the character grid. */

const CAM_POS = [0, 0.3, 3.8], CAM_AIM = [0, -0.45, 0], FOCAL = 3.0, MIDDLE = 0.47, NEAR = 0.3;
const LIGHT = unit([-0.55, 0.7, -0.45]);                  // camera space: upper left, front
const DESIGN_ASPECT = 0.8;   // framed for windows at least this wide; narrower ones (a phone) zoom out
const CAM_FWD = unit([CAM_AIM[0] - CAM_POS[0], CAM_AIM[1] - CAM_POS[1], CAM_AIM[2] - CAM_POS[2]]);
const CAM_RIGHT = [1, 0, 0], CAM_UP = cross(CAM_RIGHT, CAM_FWD), CAM = [CAM_RIGHT, CAM_UP, CAM_FWD];
const CAM_OFF = [dot(CAM_RIGHT, CAM_POS), dot(CAM_UP, CAM_POS), dot(CAM_FWD, CAM_POS)];
const spinAt = (t) => (t <= T_SPIN ? 0 : SPIN * Math.sin(TAU * (t - T_SPIN) / SPIN_PERIOD) * smooth((t - T_SPIN) / 2.5));
// her own turn of the bouquet, on top of the swing: dragged round, then spinning on and coming back to face her (main.js)
const userTurn = { angle: 0, speed: 0, held: false, settling: false, used: false };
function viewMatrix(spin) {                               // CAM @ (a turn about the y axis)
  const c = Math.cos(spin), s = Math.sin(spin), R = [[c, 0, s], [0, 1, 0], [-s, 0, c]], M = new Float64Array(9);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) M[r * 3 + k] = CAM[r][0] * R[0][k] + CAM[r][1] * R[1][k] + CAM[r][2] * R[2][k];
  return M;
}
const SKY_VIEW = viewMatrix(0);
const zoom = (aspect) => Math.min(1, aspect / DESIGN_ASPECT);
