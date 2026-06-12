import { Composition } from "remotion";
import { Preview } from "./Preview";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Preview"
    component={Preview}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);
