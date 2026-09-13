import { Song } from '../types';
import rawSongs from './songs.json';

export const SONGS: Song[] = rawSongs as Song[];
export const songs: Song[] = SONGS;
export default SONGS;
