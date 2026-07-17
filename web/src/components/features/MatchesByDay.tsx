import { useEffect, useMemo, useRef } from 'react';
import {
  type Match,
  type MatchesData,
  type UserPredictions,
} from '../../services';
import { MatchCard } from './MatchCard';

type MatchesByDayProps = {
  matches: MatchesData;
  isOwnProfile?: boolean;
  userId?: string;
  predictions?: UserPredictions;
};

export const MatchesByDay = ({
  matches,
  isOwnProfile,
  userId,
  predictions,
}: MatchesByDayProps) => {
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Group matches by date
  const groupedByDay = useMemo(() => {
    return Object.values(matches).reduce<Record<string, Match[]>>(
      (acc, match) => {
        const dayKey = new Date(match.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        if (!acc[dayKey]) {
          acc[dayKey] = [];
        }

        acc[dayKey].push(match);
        return acc;
      },
      {}
    );
  }, [matches]);

  // Sort days chronologically
  const sortedDays = useMemo(() => {
    return Object.keys(groupedByDay).sort((a, b) => {
      const dateA = new Date(groupedByDay[a][0].date);
      const dateB = new Date(groupedByDay[b][0].date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [groupedByDay]);

  useEffect(() => {
    if (sortedDays.length === 0) return;

    // Yesterday
    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);

    let targetDay: string | undefined;

    // Find the latest available day <= yesterday
    for (const day of sortedDays) {
      const date = new Date(groupedByDay[day][0].date);
      date.setHours(0, 0, 0, 0);

      if (date <= yesterday) {
        targetDay = day;
      } else {
        // Since the days are sorted, we can stop here
        break;
      }
    }

    // If there are no previous days, scroll to the first available day
    if (!targetDay) {
      targetDay = sortedDays[0];
    }

    dayRefs.current[targetDay]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [sortedDays, groupedByDay]);

  return (
    <div className="flex flex-col gap-6">
      {sortedDays.map((day) => (
        <div
          key={day}
          ref={(el) => {
            dayRefs.current[day] = el;
          }}
        >
          <h3 className="text-lg font-semibold mb-3 text-white/80 pb-2">
            {day}
          </h3>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {groupedByDay[day]
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((match) => (
                <MatchCard
                  key={match.game}
                  match={match}
                  isOwnProfile={isOwnProfile}
                  userId={userId}
                  prediction={predictions?.[match.game]}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
