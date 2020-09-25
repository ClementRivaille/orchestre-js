import SoundLoop from "./sound-loop";

export interface PlayerConfiguration {
  name: string;
  url: string;
  length: number;
  absolute?: boolean;
  destination?: AudioDestinationNode;
}

interface Player extends PlayerConfiguration {
  soundLoop: SoundLoop;
  playing: boolean;
}

export default Player;
