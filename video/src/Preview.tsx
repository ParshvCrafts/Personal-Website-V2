// 10s preview: Signal master backdrop + the three story beats + sign-off.
// Midnight-palette hex is intentional here: this renders an exported MP4
// artifact, not a themed app surface.
//
// Wrinkle fix #1: master.mp4 is 5s but composition is 10s.
// playbackRate={0.5} slows playback so 5s of source spans the full 10s.
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";

const fraunces = loadFraunces();
const mono = loadMono();

const BG = "#0A0F1E";
const INK = "#E6EAF2";
const ACCENT = "#2DD4BF";
const MUTED = "#8A93A6";

const BEATS = [
  { heading: "Data, everywhere", body: "Raw, scattered, noisy." },
  { heading: "Structure emerges", body: "Patterns resolve as the model learns." },
  { heading: "Intelligence", body: "Systems that turn signal into decisions." },
];
const BEAT_LEN = 80; // frames per beat; last 60 frames = sign-off

const Beat: React.FC<{ heading: string; body: string }> = ({ heading, body }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15, BEAT_LEN - 15, BEAT_LEN], [0, 1, 1, 0]);
  const y = interpolate(frame, [0, 15], [24, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: 120, opacity }}>
      <div style={{ transform: `translateY(${y}px)`, maxWidth: 900 }}>
        <div style={{ width: 64, height: 4, background: ACCENT, marginBottom: 28 }} />
        <div style={{ fontFamily: fraunces.fontFamily, fontSize: 88, color: INK, lineHeight: 1.05 }}>
          {heading}
        </div>
        <div style={{ fontFamily: mono.fontFamily, fontSize: 28, color: MUTED, marginTop: 20 }}>
          {body}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SignOff: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: fraunces.fontFamily, fontSize: 96, color: INK }}>Parshv Patel</div>
        <div
          style={{
            fontFamily: mono.fontFamily,
            fontSize: 26,
            color: ACCENT,
            marginTop: 16,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Data Science &amp; AI · UC Berkeley
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Preview: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    {/* playbackRate=0.5 stretches 5s source across 10s composition — cinematic slow drift */}
    <OffthreadVideo
      src={staticFile("master.mp4")}
      muted
      playbackRate={0.5}
      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
    />
    {BEATS.map((b, i) => (
      <Sequence key={b.heading} from={i * BEAT_LEN} durationInFrames={BEAT_LEN}>
        <Beat heading={b.heading} body={b.body} />
      </Sequence>
    ))}
    <Sequence from={240} durationInFrames={60}>
      <SignOff />
    </Sequence>
  </AbsoluteFill>
);
