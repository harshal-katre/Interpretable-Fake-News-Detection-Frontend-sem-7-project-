/**
 * Fixed 5 headlines for the Spot the Fake mini-game.
 * 3 Fake, 2 Real in shuffled order.
 */

export const gameHeadlines = [
  {
    id: 1,
    headline: "EXPOSED: Secret underground laboratory creates nano-trackers placed in common winter flu shots.",
    isFake: true,
    clues: ["EXPOSED", "nano-trackers"],
    reason: "Sensationalized all-caps conspiracy framing with unfalsifiable covert technology claims."
  },
  {
    id: 2,
    headline: "James Webb Space Telescope observes water vapor in inner disk of rocky planet-forming star system.",
    isFake: false,
    clues: ["James Webb Space Telescope", "observes water vapor"],
    reason: "Corroborated peer-reviewed spectroscopic discovery published by astronomical researchers."
  },
  {
    id: 3,
    headline: "Doctors ADMIT drinking hydrogen peroxide with Himalayan salt completely dissolves internal tumors in 48 hours.",
    isFake: true,
    clues: ["ADMIT", "completely dissolves"],
    reason: "Fabricated medical miracle claims relying on toxic chemical ingestion and false consensus."
  },
  {
    id: 4,
    headline: "European Central Bank leaves benchmark rates unchanged while noting persistent core services inflation.",
    isFake: false,
    clues: ["benchmark rates", "persistent core services inflation"],
    reason: "Standard economic monetary policy reporting confirmed by central bank meeting transcripts."
  },
  {
    id: 5,
    headline: "Whistleblower REVEALS 5G signals are tuned to alter human brain rhythms to silence public dissent.",
    isFake: true,
    clues: ["REVEALS", "alter human brain rhythms"],
    reason: "Classic electromagnetic conspiracy narrative lacking biological mechanism and official source verification."
  }
];
