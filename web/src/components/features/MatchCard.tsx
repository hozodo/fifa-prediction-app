import React from 'react';
import { type Match, type Prediction, savePrediction } from '../../services';
import { Card } from '../ui/Card';

// Import all flags dynamically
const flagModules: Record<string, string> = import.meta.glob(
  '../../assets/flags/*.png',
  { eager: true, import: 'default' }
);

const getFlag = (code: string): string => {
  return (
    flagModules[`../../assets/flags/${code}.png`] ??
    flagModules['../../assets/flags/UNKNOWN.png']
  );
};

type MatchCardProps = {
  match: Match;
  isOwnProfile?: boolean;
  userId?: string;
  prediction?: Prediction;
};

export const MatchCard = ({
  match,
  isOwnProfile = false,
  userId,
  prediction,
}: MatchCardProps) => {
  const matchDate = new Date(match.date);

  const timeString = matchDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;

  const cutoffTime = match.timestamp * 1000 - 10 * 60 * 1000;
  const predictionsClosed = Date.now() > cutoffTime;

  const kickoffTime = match.timestamp * 1000;
  const matchEndEstimate = kickoffTime + 150 * 60 * 1000;

  const isLive =
    !isPlayed && Date.now() >= kickoffTime && Date.now() < matchEndEstimate;

  const canPredict = isOwnProfile && !!userId && !predictionsClosed && !isLive;

  const [homePrediction, setHomePrediction] = React.useState(
    prediction?.homePrediction?.toString() ?? ''
  );

  const [awayPrediction, setAwayPrediction] = React.useState(
    prediction?.awayPrediction?.toString() ?? ''
  );

  const [saving, setSaving] = React.useState(false);

  const savingRef = React.useRef(false);

  React.useEffect(() => {
    if (prediction) {
      setHomePrediction(prediction.homePrediction?.toString() ?? '');

      setAwayPrediction(prediction.awayPrediction?.toString() ?? '');
    }
  }, [prediction]);

  const handleSavePrediction = async (homeValue: string, awayValue: string) => {
    if (!userId || !canPredict) return;

    if (savingRef.current) return;

    const home = Number(homeValue);
    const away = Number(awayValue);

    if (
      !Number.isInteger(home) ||
      !Number.isInteger(away) ||
      home < 0 ||
      away < 0
    ) {
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      await savePrediction(userId, match.game, home, away);

      // keep UI in sync
      setHomePrediction(home.toString());
      setAwayPrediction(away.toString());
    } catch (error) {
      console.error('Error saving prediction:', error);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleBlur = () => {
    if (homePrediction !== '' && awayPrediction !== '') {
      void handleSavePrediction(homePrediction, awayPrediction);
    }
  };

  const inputClass =
    'w-10 h-8 text-center bg-white/10 border border-white/20 rounded text-white text-lg font-bold focus:outline-none focus:border-white/40 disabled:opacity-50';

  const scoreClass =
    'w-10 h-8 flex items-center justify-center text-lg font-bold';

  const predictionClass =
    'w-10 h-8 flex items-center justify-center bg-blue-600/30 border border-blue-400/30 rounded text-lg font-bold';

  const dateString = matchDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  const showPoints = isPlayed && prediction;

  const renderInput = (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      value={value}
      onChange={(e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);

        setValue(val);
      }}
      onFocus={(e) => e.target.select()}
      onBlur={handleBlur}
      className={inputClass}
      disabled={saving}
      placeholder="-"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-form-type="other"
    />
  );

  return (
    <Card className="p-4 hover:bg-white/10 transition-colors after:hidden">
      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <img
              src={getFlag(match.home)}
              alt={match.home}
              className="h-6 w-9 md:h-8 md:w-12 object-contain rounded-sm"
            />

            <span className="flex-1 font-medium text-sm md:text-base">
              {match.homeName}
            </span>

            <span className={scoreClass}>
              {isPlayed ? match.homeScore : '-'}
            </span>

            {canPredict && renderInput(homePrediction, setHomePrediction)}

            {!canPredict && prediction && (
              <span className={predictionClass}>
                {prediction.homePrediction}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <img
              src={getFlag(match.away)}
              alt={match.away}
              className="h-6 w-9 md:h-8 md:w-12 object-contain rounded-sm"
            />

            <span className="flex-1 font-medium text-sm md:text-base">
              {match.awayName}
            </span>

            <span className={scoreClass}>
              {isPlayed ? match.awayScore : '-'}
            </span>

            {canPredict && renderInput(awayPrediction, setAwayPrediction)}

            {!canPredict && prediction && (
              <span className={predictionClass}>
                {prediction.awayPrediction}
              </span>
            )}
          </div>
        </div>

        {showPoints && (
          <div
            className={`flex flex-col items-center border rounded-lg w-14 ${
              prediction.points > 0
                ? 'border-green-500/20 bg-green-600/10'
                : 'border-red-500/20 bg-red-600/10'
            }`}
          >
            <span className="flex-1 flex items-center text-2xl">
              {prediction.points === 15
                ? '🥳'
                : prediction.points > 0
                  ? '😄'
                  : '😔'}
            </span>

            <span
              className={`flex items-center justify-center text-xs px-1 py-0.5 w-14 rounded-b ${
                prediction.points > 0
                  ? 'bg-green-800 text-white'
                  : 'bg-red-800 text-white'
              }`}
            >
              {prediction.points > 0
                ? `+${prediction.points}`
                : prediction.points}{' '}
              pts
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-white/50">
        {match.group && (
          <>
            <span>Group: {match.group}</span>
            <span>·</span>
          </>
        )}

        <span className="truncate">
          {match.locationCity}, {match.locationCountry}
        </span>

        <span>·</span>

        <span>
          {dateString}, {timeString}
        </span>

        {isLive && (
          <span className="ml-auto flex items-center gap-1.5 text-red-500 font-bold animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            LIVE
          </span>
        )}
      </div>
    </Card>
  );
};
