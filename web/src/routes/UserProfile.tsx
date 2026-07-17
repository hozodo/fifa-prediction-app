import React from 'react';
import { useParams } from 'react-router-dom';
import {
  AppLayout,
  MatchesByDay,
  MatchesByGroup,
  MatchesHeader,
  UserHeader,
} from '../components';
import { useMatches, useAuth } from '../hooks';
import {
  type UserPredictions,
  subscribeToPredictions,
  getUserByUsername,
} from '../services';

type ViewMode = 'day' | 'group';

export const UserProfile = () => {
  const { userName } = useParams();
  const { matches, loading: matchesLoading, error } = useMatches();
  const { user, userData } = useAuth();
  const [viewMode, setViewMode] = React.useState<ViewMode>('day');
  const [predictions, setPredictions] = React.useState<UserPredictions>({});
  const [profileUserId, setProfileUserId] = React.useState<string | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);

  // Determine if viewing own profile
  const isOwnProfile = userData?.userName === userName;

  // Reset state when userName changes to prevent stale data flash
  React.useEffect(() => {
    setProfileLoading(true);
    setProfileUserId(null);
    setPredictions({});
  }, [userName]);

  // Get the user ID for the profile being viewed
  React.useEffect(() => {
    if (isOwnProfile && user) {
      setProfileUserId(user.uid);
      setProfileLoading(false);
    } else if (userName) {
      // Fetch the user ID by username for viewing others' profiles
      getUserByUsername(userName)
        .then((profileUser) => {
          setProfileUserId(profileUser?.id ?? null);
        })
        .catch(console.error)
        .finally(() => setProfileLoading(false));
    }
  }, [userName, isOwnProfile, user]);

  // Subscribe to predictions for the profile being viewed
  React.useEffect(() => {
    if (!profileUserId) return;

    const unsubscribe = subscribeToPredictions(profileUserId, setPredictions);
    return () => unsubscribe();
  }, [profileUserId]);

  const loading = profileLoading || matchesLoading;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="py-20 text-center text-white/70">Loading...</div>
        ) : (
          <>
            {/* Sticky headers */}
            <div className="sticky top-16 md:top-0 z-20 -mx-4 mb-6 bg-black/80 px-4 pt-8 backdrop-blur-lg">
              {profileUserId && (
                <UserHeader
                  userId={profileUserId}
                  className="border-b border-white/10 pb-6"
                />
              )}

              <div className="pt-6">
                <MatchesHeader
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>

            {error && (
              <div className="text-center text-red-400">Error: {error}</div>
            )}

            {matches &&
              (viewMode === 'day' ? (
                <MatchesByDay
                  matches={matches}
                  isOwnProfile={isOwnProfile}
                  userId={profileUserId ?? undefined}
                  predictions={predictions}
                />
              ) : (
                <MatchesByGroup
                  matches={matches}
                  isOwnProfile={isOwnProfile}
                  userId={profileUserId ?? undefined}
                  predictions={predictions}
                />
              ))}
          </>
        )}
      </div>
    </AppLayout>
  );
};
