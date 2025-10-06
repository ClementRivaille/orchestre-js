import SoundLoop from './sound-loop';

export type PlayerPosition = 'relative' | 'absolute';

export interface PlayerConfiguration {
  name: string;
  url: string;
  length: number;
  position?: PlayerPosition;
  destination?: AudioDestinationNode;
}

interface Player extends PlayerConfiguration {
  position: PlayerPosition;
  soundLoop: SoundLoop;
  playing: boolean;
}

export default Player;
