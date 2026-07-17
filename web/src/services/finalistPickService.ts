import { db } from '../firebase';
import { ref, set, onValue, type Unsubscribe } from 'firebase/database';
import { FINALIST_PLAYERS, type FinalistTeam } from '../data/finalsPlayers';

export interface FinalistPick {
  playerId: string;
  playerName: string;
  team: FinalistTeam;
  position: string;
  selectedAt: number;
}

/**
 * Save (or overwrite) the logged-in user's single finalist player pick.
 * Writing always replaces any previous pick, since a user may only have one.
 */
export const saveFinalistPick = async (
  userId: string,
  playerId: string
): Promise<void> => {
  const player = FINALIST_PLAYERS.find((p) => p.id === playerId);

  if (!player) {
    throw new Error('Unknown player selected');
  }

  const pick: FinalistPick = {
    playerId: player.id,
    playerName: player.name,
    team: player.team,
    position: player.position,
    selectedAt: Date.now(),
  };

  await set(ref(db, `finalistPicks/${userId}`), pick);
};

/**
 * Subscribe to real-time updates for a user's finalist pick.
 */
export const subscribeToFinalistPick = (
  userId: string,
  callback: (pick: FinalistPick | null) => void
): Unsubscribe => {
  const pickRef = ref(db, `finalistPicks/${userId}`);

  return onValue(pickRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as FinalistPick) : null);
  });
};

/**
 * Subscribe to real-time updates for every user's finalist pick, keyed by uid.
 */
export const subscribeToAllFinalistPicks = (
  callback: (picks: Record<string, FinalistPick>) => void
): Unsubscribe => {
  const picksRef = ref(db, 'finalistPicks');

  return onValue(picksRef, (snapshot) => {
    const data = snapshot.val() as Record<string, FinalistPick> | null;
    callback(data ?? {});
  });
};
