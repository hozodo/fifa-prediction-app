import { AppLayout, Card } from '../components';

export const Rules = () => {
  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Rules</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Prediction Deadline
          </h2>
          <div className="flex items-start gap-3 text-white/80">
            <span className="text-2xl">⏰</span>
            <p>
              Predictions must be submitted{' '}
              <span className="text-white font-semibold">
                at least 10 minutes before kickoff
              </span>
              . After that, predictions are locked and cannot be changed.
            </p>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Points Multiplier
          </h2>

          <p className="text-white/80 mb-4">
            Points earned for each prediction are multiplied based on the
            tournament stage.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-2 font-semibold">Round</th>
                  <th className="py-2 font-semibold text-right">Multiplier</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                <tr className="border-b border-white/10">
                  <td className="py-3">First Stage / Group</td>
                  <td className="py-3 text-right font-semibold text-white">
                    1×
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3">Round of 32</td>
                  <td className="py-3 text-right font-semibold text-white">
                    2×
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3">Round of 16</td>
                  <td className="py-3 text-right font-semibold text-white">
                    3×
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3">Quarter-final</td>
                  <td className="py-3 text-right font-semibold text-white">
                    4×
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3">Semi-final</td>
                  <td className="py-3 text-right font-semibold text-white">
                    5×
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3">Play-off for third place</td>
                  <td className="py-3 text-right font-semibold text-white">
                    5×
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Final</td>
                  <td className="py-3 text-right font-bold text-green-400">
                    6×
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Penalty Shootouts
          </h2>

          <div className="space-y-4 text-white/80">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🥅</span>
              <div>
                <p>
                  If a match is decided by a penalty shootout, the winning team
                  is awarded{' '}
                  <span className="font-semibold text-white">
                    one additional goal
                  </span>
                  , which is added to the full-time score for scoring purposes.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-2">Example</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Full-time Score</span>
                  <span className="font-mono text-white">1 - 1</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/60">Penalty Winner</span>
                  <span className="font-mono text-white">Team A</span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-white/60">Recorded Score</span>
                  <span className="font-mono font-bold text-green-400">
                    Team A 2 - 1 Team B
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            How Points Are Calculated
          </h2>

          <div className="space-y-4 text-white/80">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🥳</span>
              <div>
                <h3 className="font-semibold text-white">
                  Exact Score — 15 points
                </h3>
                <p className="text-sm">
                  Predict the exact final score of both teams.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">😄</span>
              <div>
                <h3 className="font-semibold text-white">
                  Correct Result — Up to 10 points
                </h3>
                <p className="text-sm">
                  Predict the correct winner (or draw), but not the exact score.
                  Points = 10 minus the difference from the actual scores.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">😔</span>
              <div>
                <h3 className="font-semibold text-white">
                  Wrong Result — 0 points
                </h3>
                <p className="text-sm">
                  Predict the wrong winner or miss a draw.
                </p>
              </div>
            </div>
          </div>

          <h2 className="mt-8 text-xl font-semibold text-white mb-4">
            Examples
          </h2>

          <div className="space-y-6">
            {/* Example 1: Exact score */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Actual Result</span>
                <span className="text-white font-mono">
                  Mexico 2 - 1 South Africa
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Your Prediction</span>
                <span className="text-white font-mono">
                  Mexico 2 - 1 South Africa
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">Points Earned</span>
                <span className="text-green-400 font-bold">
                  🥳 15 points (Exact!)
                </span>
              </div>
            </div>

            {/* Example 2: Correct winner */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Actual Result</span>
                <span className="text-white font-mono">
                  Brazil 2 - 1 Morocco
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Your Prediction</span>
                <span className="text-white font-mono">
                  Brazil 3 - 0 Morocco
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">Points Earned</span>
                <div className="md:text-right">
                  <span className="text-yellow-400 font-bold">😄 8 points</span>
                  <div className="text-white/40 text-xs font-mono">
                    10 - |3-2| - |0-1| = 8
                  </div>
                </div>
              </div>
            </div>

            {/* Example 3: Correct draw */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Actual Result</span>
                <span className="text-white font-mono">
                  Netherlands 2 - 2 Japan
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Your Prediction</span>
                <span className="text-white font-mono">
                  Netherlands 0 - 0 Japan
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">Points Earned</span>
                <div className="md:text-right">
                  <span className="text-yellow-400 font-bold">😄 6 points</span>
                  <div className="text-white/40 text-xs font-mono">
                    10 - |0-2| - |0-2| = 6
                  </div>
                </div>
              </div>
            </div>

            {/* Example 4: Wrong result */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Actual Result</span>
                <span className="text-white font-mono">
                  England 2 - 1 Croatia
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-white/60 text-sm">Your Prediction</span>
                <span className="text-white font-mono">
                  England 0 - 2 Croatia
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="text-white/60 text-sm">Points Earned</span>
                <span className="text-red-400 font-bold">
                  😔 0 points (Wrong winner)
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
