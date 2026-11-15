"use strict";
/* When the growth reaches a height, and when the stars spreading over the top reach a spot. */

const growTime = (y) => T_GROW[0] + (T_GROW[1] - T_GROW[0]) * clamp((y - BOTTOM_Y) / (TOP_Y - BOTTOM_Y), 0, 1);
const grownTo = (t) => BOTTOM_Y + (TOP_Y - BOTTOM_Y) * (t - T_GROW[0]) / (T_GROW[1] - T_GROW[0]);
const topTime = (tilt) => T_TOP[0] + (T_TOP[1] - T_TOP[0]) * clamp(tilt / 1.25, 0, 1);
