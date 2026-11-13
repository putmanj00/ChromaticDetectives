export interface Clue {
  id: string;
  title: string;
  stageId: number;
  type: 'PAPER' | 'OBJECT' | 'AUDIO';
  content: string;
  date: string;
}

export const CLUES: Clue[] = [
  {
    id: '01',
    title: 'CRUMPLED RECEIPT',
    stageId: 1,
    type: 'PAPER',
    content: "You think you're the first? I've watched fourteen versions of you walk into that cafe. This one seems... fragile.",
    date: '09:05 AM'
  },
  {
    id: '02',
    title: 'HONEYCOMB SHARD',
    stageId: 2,
    type: 'OBJECT',
    content: "The preservation is a lie. Sweetness only masks the rot. Tune to 14.02 — the frequency of the heart. The spectrum is bleeding out.",
    date: '10:12 AM'
  },
  {
    id: '03',
    title: 'STATIC RECORDING',
    stageId: 3,
    type: 'AUDIO',
    content: "Can you hear the hum? That's the sound of history being overwritten. I wonder if you'll scream when I delete you.",
    date: '--:--'
  },
  {
    id: '04',
    title: 'SHATTERED LENS',
    stageId: 4,
    type: 'OBJECT',
    content: "Reflections are just light that gave up. Don't trust what you see in the Alcove. I'm watching from the other side.",
    date: '--:--'
  },
  {
    id: '05',
    title: 'INK-STAINED LETTER',
    stageId: 5,
    type: 'PAPER',
    content: "The ink never dries on a contract written in starlight. You signed it too, Investigator. You just don't remember.",
    date: '11:30 AM'
  },
  {
    id: '06',
    title: 'CRYSTALLINE FRAGMENT',
    stageId: 6,
    type: 'OBJECT',
    content: "Three stones in the lattice, each holding a different frequency of memory. The dark one absorbs, the gold one radiates, the pink one bleeds. Handle with care — or don't.",
    date: '12:15 PM'
  },
  {
    id: '07',
    title: 'BRIDGE TOKEN',
    stageId: 7,
    type: 'OBJECT',
    content: "Every crossing costs something. The bridge between worlds doesn't care about your intentions — only your weight. How heavy is fourteen years of love, Investigator?",
    date: '01:00 PM'
  },
  {
    id: '08',
    title: 'MUSEUM CATALOG PAGE',
    stageId: 8,
    type: 'PAPER',
    content: "The prince saw his future in the mirror and wept. The gallery ghosts whisper that some reflections show what could have been. I prefer the version where you fail.",
    date: '02:20 PM'
  },
  {
    id: '09',
    title: 'DAMASCUS WIRE TAP',
    stageId: 9,
    type: 'AUDIO',
    content: "Cipher test passed. Barely. The fog ahead will be thicker than the lies I've told you. The Damascus Room remembers everything — even the things you tried to forget.",
    date: '03:05 PM'
  },
  {
    id: '10',
    title: 'SMOKE SIGNAL RESIDUE',
    stageId: 10,
    type: 'OBJECT',
    content: "The haze lifts for no one. But you knocked, didn't you? Persistence or stupidity — the Syndicate can't tell the difference. Neither can I.",
    date: '03:45 PM'
  },
  {
    id: '11',
    title: 'APOTHECARY RECEIPT',
    stageId: 11,
    type: 'PAPER',
    content: "Calibration requires precision: 72% volume, 14 degrees thermal. The compound is unstable — like your grip on this timeline. One miscalculation and the whole thing evaporates.",
    date: '04:30 PM'
  },
  {
    id: '12',
    title: 'RED BRICK DUST',
    stageId: 12,
    type: 'OBJECT',
    content: "Block by block, you're rebuilding something that was never meant to stand. The Master Builder left instructions in chromatic order. Follow the color, not the shape.",
    date: '05:15 PM'
  },
  {
    id: '13',
    title: 'SPORE PRINT',
    stageId: 13,
    type: 'OBJECT',
    content: "The fungi glow in spectral decay — red to blue, long wave to short. The owl watches from above, guardian of the final spectrum. It knows what you are. Do you?",
    date: '06:00 PM'
  },
  {
    id: '14',
    title: 'GLITCH REPORT',
    stageId: 14,
    type: 'PAPER',
    content: "Grid anomalies detected in Sector OTR. The glitches are getting worse — or better, depending on your perspective. See you at Nicola's, Investigator. If you make it.",
    date: '06:45 PM'
  },
  {
    id: '15',
    title: 'FINAL MANIFESTO',
    stageId: 15,
    type: 'PAPER',
    content: "Protocol Omega isn't an end. It's a reset. See you in the next loop.",
    date: '--:--'
  }
];
