"use strict";
/* What you'd want to change: the note, the music, the look and when each stage happens. */

const BIRTHDAY = [12, 9];         // her birthday (month, day): each year's order of daily notes starts from it
// the effect on a note's [marked] words, by day ("month-day"): party, christmas, newyear or pink (other days: pink)
const NOTE_EFFECTS = { "12-9": "party", "12-24": "christmas", "12-25": "christmas", "1-1": "newyear", "3-8": "pink", "10-20": "pink" };
const LINE_DELAY = 1.0;          // pause (s) after a line has typed out, before the next one starts
const TYPE_SPEED_MIN = 10;       // letters per second the note types at ...
const TYPE_TIME_MAX = 12;        // ... but a long note types faster, so it never takes longer than this (s) to type out
const MESSAGE_PK = 26;           // size of the note in a 965 px tall window (it scales with the window)
const GRID_ROWS = 90;            // rows of characters to fit in the window - more = finer
const GLOW = 0.55;               // the soft glow around the characters (0 = none)
const SHOW_STATS = true;         // the status lines at the bottom and the timer at the top
// the song, looping ("" = no music) - from the music folder, next to index.html
const MUSIC_FILE = "music/Harry Styles - Coming Up Roses - short.mp3";
// a different song on some days ("month-day"), e.g. "12-25": "music/christmas.mp3"; "" = the usual song above
// (a song that can't be found plays the usual one instead)
const DAY_MUSIC = { "12-24": "music/Wham - Last Christmas - short.mp3",
                    "12-25": "music/Công Thành, Lynn - Feliz Navidad - short.mp3", 
                    "12-31": "music/Madelynn - Chào Mừng Năm Mới - short.mp3", 
                    "1-1": "music/ABBA - Happy New Year - short.mp3" };
const MUSIC_VOLUME = 0.6;        // 0 .. 1

const T_GROW = [0.0, 1.8];       // the stems grow from the bottom up, sparkling stars leading them
const T_TOP = [1.8, 2.8];        // at the top the stars spread out and draw the top: foliage and buds
const T_PAPER = [2.8, 3.9];      // the wrap blows out like a skirt ...
const T_BOW = [2.8, 3.6];        // ... and the bow pops up with it
const T_BLOOM = 4.0;             // the rose on top opens, then the ring round it, then the outer ring ...
const TIER_GAP = 1.6;            // ... each ring that much later
const OPEN = 3.0;                // seconds it takes one rose to open
const T_SPIN = 11.4, SPIN = 0.22, SPIN_PERIOD = 13.0;   // then the bouquet swings gently
const T_MSG = 11.8;              // the note starts typing
const T_FALL = 12.4;             // petals start drifting down
const FADE_IN = 0.35;            // seconds each new bit takes to fade in

const WAIST_Y = -0.78, BOTTOM_Y = -1.22, TOP_Y = 0.3, DOME = [0, -0.5, 0];
const REDUCED_MOTION = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const CHANGE_RATE = REDUCED_MOTION ? 0.8 : 2.5;   // how often (per second) a cell picks a new letter
