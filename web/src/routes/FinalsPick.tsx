import React from 'react';
import { Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import {
  AppLayout,
  Card,
  Button,
  ProfilePicture,
  PlayerSelect,
} from '../components';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../hooks';
import { useToast } from '../hooks/useToast';
import {
  saveFinalistPick,
  subscribeToFinalistPick,
  subscribeToAllFinalistPicks,
  subscribeToLeaderboard,
  type FinalistPick,
  type UserWithId,
} from '../services';
import { FINALIST_PLAYERS, FINALIST_TEAMS } from '../data/finalsPlayers';

// Import all flags dynamically (same pattern used by MatchCard)
const flagModules: Record<string, string> = import.meta.glob(
  '../assets/flags/*.png',
  { eager: true, import: 'default' }
);

const getFlag = (code: string): string => {
  return (
    flagModules[`../assets/flags/${code}.png`] ??
    flagModules['../assets/flags/UNKNOWN.png']
  );
};

export const FinalsPick = () => {
  const { user, userData } = useAuth();
  const { showToast } = useToast();

  const [pick, setPick] = React.useState<FinalistPick | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [allUsers, setAllUsers] = React.useState<UserWithId[]>([]);
  const [allPicks, setAllPicks] = React.useState<Record<string, FinalistPick>>(
    {}
  );

  React.useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeToFinalistPick(user.uid, (data) => {
      setPick(data);
      setSelectedId(data?.playerId ?? null);
    });

    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    const unsubscribeUsers = subscribeToLeaderboard(setAllUsers);
    const unsubscribePicks = subscribeToAllFinalistPicks(setAllPicks);

    return () => {
      unsubscribeUsers();
      unsubscribePicks();
    };
  }, []);

  const handleSignIn = () => {
    signInWithPopup(auth, googleProvider).catch(console.error);
  };

  const handleSave = async () => {
    if (!user || !selectedId || saving) return;

    setSaving(true);
    try {
      await saveFinalistPick(user.uid, selectedId);
      showToast('Your finalist pick has been saved!', 'success');
    } catch (error) {
      console.error('Error saving finalist pick:', error);
      showToast('Could not save your pick. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pickedPlayer = pick
    ? FINALIST_PLAYERS.find((p) => p.id === pick.playerId)
    : null;

  const hasChanges = selectedId !== (pick?.playerId ?? null);

  const everyonesPicks = React.useMemo(() => {
    const usersById = new Map(allUsers.map((u) => [u.id, u]));

    return Object.entries(allPicks)
      .map(([uid, userPick]) => ({
        uid,
        user: usersById.get(uid) ?? null,
        pick: userPick,
      }))
      .filter((entry) => entry.user !== null)
      .sort((a, b) => b.pick.selectedAt - a.pick.selectedAt);
  }, [allUsers, allPicks]);

  return (
    <AppLayout>
      <div className="md:min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full space-y-6">
          {/* Header */}
          <Card className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <h2 className="md:text-2xl text-lg font-semibold text-white">
                FIFA World Cup 2026 Final Bonus Pick (+200 Points)
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <img
                    src={getFlag('ARG')}
                    alt="Argentina"
                    className="h-10 w-14 object-contain rounded-sm"
                  />
                  <span className="text-sm text-white/70">Argentina</span>
                </div>
                <span className="text-white/40 font-bold">vs</span>
                <div className="flex flex-col items-center gap-1">
                  <img
                    src={getFlag('ESP')}
                    alt="Spain"
                    className="h-10 w-14 object-contain rounded-sm"
                  />
                  <span className="text-sm text-white/70">Spain</span>
                </div>
              </div>
              <p className="text-white/60 text-sm">
                Pick your first goalscorer from the finalist squads. You can choose only one player, and selecting a new one will replace your previous pick.
              </p>
            </div>
          </Card>

          {/* Picker / Sign-in */}
          <Card className="p-6">
            {!user ? (
              <div className="flex flex-col items-center text-center gap-4">
                <p className="text-white/80">
                  Sign in to choose your finalist player.
                </p>
                <Button onClick={handleSignIn}>Sign In with Google</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-white font-semibold">
                  Choose your player
                </h3>
                <PlayerSelect
                  value={selectedId}
                  onChange={setSelectedId}
                  disabled={saving}
                />
                <Button
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={!selectedId || saving || !hasChanges}
                  className="w-full"
                >
                  {saving ? 'Saving…' : 'Add Pick'}
                </Button>
              </div>
            )}
          </Card>

          {/* Your pick */}
          {user && (
            <Card className="p-6">
              <h3 className="text-white font-semibold mb-4">Your Pick</h3>
              {pickedPlayer ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProfilePicture
                      src={userData?.photoURL}
                      name={userData?.displayName}
                      size="sm"
                    />
                    <span className="text-white font-medium truncate">
                      {userData?.displayName ?? 'You'}
                    </span>
                  </div>
                  <span className="text-white/30">+</span>
                  <div className="flex items-center gap-3 min-w-0 justify-end">
                    <div className="flex flex-col items-end min-w-0">
                      <span className="text-white font-medium truncate">
                        {pickedPlayer.name}
                      </span>
                      <span className="text-xs text-white/50">
                        {FINALIST_TEAMS[pickedPlayer.team].name} ·{' '}
                        {pickedPlayer.position}
                      </span>
                    </div>
                    <img
                      src={getFlag(pickedPlayer.team)}
                      alt={FINALIST_TEAMS[pickedPlayer.team].name}
                      className="h-8 w-11 object-contain rounded-sm shrink-0"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-sm">
                  You haven't picked a finalist player yet.
                </p>
              )}
            </Card>
          )}

          {/* Everyone's picks */}
          <Card className="p-6">
            <h3 className="text-white font-semibold mb-4">
              Everyone's Picks
            </h3>
            {everyonesPicks.length === 0 ? (
              <p className="text-white/50 text-sm">
                No one has picked a finalist player yet.
              </p>
            ) : (
              <ul className="divide-y divide-white/10">
                {everyonesPicks.map(({ uid, user: pickUser, pick: p }) => {
                  const player = FINALIST_PLAYERS.find(
                    (fp) => fp.id === p.playerId
                  );
                  if (!player || !pickUser) return null;

                  return (
                    <li
                      key={uid}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <Link
                        to={`/${pickUser.userName}`}
                        className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
                      >
                        <ProfilePicture
                          src={pickUser.photoURL}
                          name={pickUser.displayName}
                          size="sm"
                        />
                        <span className="text-white font-medium truncate">
                          {pickUser.displayName}
                        </span>
                      </Link>
                      <div className="flex items-center gap-3 min-w-0 justify-end">
                        <div className="flex flex-col items-end min-w-0">
                          <span className="text-white text-sm font-medium truncate">
                            {player.name}
                          </span>
                          <span className="text-xs text-white/50">
                            {FINALIST_TEAMS[player.team].name} ·{' '}
                            {player.position}
                          </span>
                        </div>
                        <img
                          src={getFlag(player.team)}
                          alt={FINALIST_TEAMS[player.team].name}
                          className="h-7 w-10 object-contain rounded-sm shrink-0"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
