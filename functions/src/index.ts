import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onValueWritten } from 'firebase-functions/v2/database';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.database();

// FIFA API constants for World Cup 2026
const FIFA_COMPETITION_ID = '17'; // FIFA World Cup
const FIFA_SEASON_ID = '285023'; // 2026

interface Match {
  game: number;
  fifaId: string;
  homeScore: number;
  awayScore: number;
  round:
    | 'First Stage'
    | 'Round of 32'
    | 'Round of 16'
    | 'Quarter-final'
    | 'Semi-final'
    | 'Play-off for third place'
    | 'Bronze final'
    | 'Final';
}

interface Prediction {
  homePrediction: number;
  awayPrediction: number;
  points: number;
}

interface FifaMatch {
  IdMatch: string;
  Home: { Score: number | null };
  Away: { Score: number | null };
  HomeTeamPenaltyScore: number | null;
  AwayTeamPenaltyScore: number | null;
}

interface FifaApiResponse {
  Results: FifaMatch[];
}

interface FifaApiMatch {
  IdMatch: string;
  StageName: Array<{ Description: string }>;
  GroupName: Array<{ Description: string }> | null;
  Date: string;

  Stadium: {
    Name: Array<{ Description: string }>;
    CityName: Array<{ Description: string }>;
    IdCountry: string;
  };

  Home: {
    Abbreviation: string | null;
    ShortClubName: string | null;
    Score: number | null;
  };

  Away: {
    Abbreviation: string | null;
    ShortClubName: string | null;
    Score: number | null;
  };
  HomeTeamPenaltyScore?: number | null;
  AwayTeamPenaltyScore?: number | null;

  PlaceHolderA: string;
  PlaceHolderB: string;
}

/**
 * Determine the winner of a match
 */
const getWinner = (home: number, away: number): 'home' | 'away' | 'tied' => {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'tied';
};

/**
 * Calculate points for a prediction
 * - 15 points: Exact score
 * - Up to 10 points: Correct winner, minus difference from actual score (min 0)
 * - 0 points: Wrong winner or no prediction
 */
const calculatePoints = (
  homeScore: number,
  awayScore: number,
  homePrediction: number | null,
  awayPrediction: number | null
): number => {
  // No prediction or match not played yet
  if (homeScore < 0 || homePrediction === null || awayPrediction === null) {
    return 0;
  }

  // Exact score: 15 points
  if (homeScore === homePrediction && awayScore === awayPrediction) {
    return 15;
  }

  // Correct winner: 10 points minus difference (min 0)
  if (
    getWinner(homeScore, awayScore) ===
    getWinner(homePrediction, awayPrediction)
  ) {
    const difference =
      Math.abs(homePrediction - homeScore) +
      Math.abs(awayPrediction - awayScore);
    return Math.max(0, 10 - difference);
  }

  // Wrong winner: 0 points
  return 0;
};

/**
 * Scheduled function to fetch and update match scores from FIFA API
 * Runs every 1 minute during the tournament
 */
export const updateMatchScores = onSchedule('every 1 minutes', async () => {
  logger.info('Updating match scores from FIFA API...');

  try {
    // Get today's date range
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's matches from FIFA API
    const apiUrl = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&count=500`;
    console.log(apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`FIFA API error: ${response.status}`);
    }

    const data = (await response.json()) as FifaApiResponse;

    // Get current matches from database
    const matchesSnapshot = await db.ref('matches').once('value');
    const matches = matchesSnapshot.val() as Record<string, Match> | null;

    if (!matches) {
      logger.warn('No matches found in database');
      return;
    }

    // Update scores for matching games
    const updates: Record<string, number> = {};

    for (const fifaMatch of data.Results) {
      for (const [gameId, match] of Object.entries(matches)) {
        if (match.fifaId === fifaMatch.IdMatch) {
          const fifaHomeScore = fifaMatch.Home?.Score ?? -1;
          const fifaAwayScore = fifaMatch.Away?.Score ?? -1;

          let finalHomeScore = fifaHomeScore;
          let finalAwayScore = fifaAwayScore;

          logger.info(
            JSON.stringify({
              id: fifaMatch.IdMatch,
              home: fifaMatch.HomeTeamPenaltyScore,
              away: fifaMatch.AwayTeamPenaltyScore,
            })
          );

          // Add penalty winner +1
          if (
            typeof fifaMatch.HomeTeamPenaltyScore === 'number' &&
            typeof fifaMatch.AwayTeamPenaltyScore === 'number'
          ) {
            if (
              fifaMatch.HomeTeamPenaltyScore > fifaMatch.AwayTeamPenaltyScore
            ) {
              finalHomeScore = fifaHomeScore + 1;
              logger.info(
                `Computed game ${gameId} home score with extra score: ${finalHomeScore}`
              );
            } else if (
              fifaMatch.AwayTeamPenaltyScore > fifaMatch.HomeTeamPenaltyScore
            ) {
              finalAwayScore = fifaAwayScore + 1;
              logger.info(
                `Computed game ${gameId} away score with extra score: ${finalAwayScore}`
              );
            }
          }

          // Update DB
          if (finalHomeScore >= 0 && match.homeScore !== finalHomeScore) {
            updates[`matches/${gameId}/homeScore`] = finalHomeScore;
            logger.info(`Updated game ${gameId} home score: ${finalHomeScore}`);
          }

          if (finalAwayScore >= 0 && match.awayScore !== finalAwayScore) {
            updates[`matches/${gameId}/awayScore`] = finalAwayScore;
            logger.info(`Updated game ${gameId} away score: ${finalAwayScore}`);
          }
        }
      }
    }

    // Apply all updates at once
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      logger.info(`Applied ${Object.keys(updates).length} score updates`);
    }
  } catch (error) {
    logger.error('Error updating match scores:', error);
  }
});

/**
 * Triggered when a match is updated
 * Recalculates prediction points for all users for that match
 */
export const updatePredictionPoints = onValueWritten(
  'matches/{matchId}',
  async (event) => {
    const matchId = event.params.matchId;
    const match = event.data.after.val() as Match | null;

    if (!match) {
      logger.warn(`Match ${matchId} was deleted`);
      return;
    }

    // Only recalculate if match has scores
    if (match.homeScore < 0 || match.awayScore < 0) {
      return;
    }

    let multiplier = 1;
    if (match.game === 99) {
      multiplier = 9;
    } else {
      switch (match.round) {
        case 'Round of 32':
          multiplier = 2;
          break;

        case 'Round of 16':
          multiplier = 3;
          break;

        case 'Quarter-final':
          multiplier = 4;
          break;

        case 'Semi-final':
          multiplier = 5;
          break;

        case 'Play-off for third place':
          multiplier = 5;
          break;

        case 'Bronze final':
          multiplier = 5;
          break;

        case 'Final':
          multiplier = 20;
          break;

        default:
          multiplier = 1;
      }
    }

    // logger.info(`Updating prediction points for match ${matchId}`);
    logger.info(
      `Updating points for ${matchId}, round: ${match.round}, multiplier: ${multiplier}`
    );

    try {
      // Get all users
      const usersSnapshot = await db.ref('users').once('value');
      const users = usersSnapshot.val() as Record<string, unknown> | null;

      if (!users) {
        return;
      }

      const updates: Record<string, number> = {};

      // Calculate points for each user's prediction
      for (const userId of Object.keys(users)) {
        const predictionSnapshot = await db
          .ref(`predictions/${userId}/${matchId}`)
          .once('value');
        const prediction = predictionSnapshot.val() as Prediction | null;

        if (prediction) {
          // Base points
          const basePoints = calculatePoints(
            match.homeScore,
            match.awayScore,
            prediction.homePrediction,
            prediction.awayPrediction
          );
          // Apply round multiplier
          const finalPoints = basePoints * multiplier;

          if (prediction.points !== finalPoints) {
            updates[`predictions/${userId}/${matchId}/points`] = finalPoints;
            logger.info(
              `User ${userId}: ${finalPoints} points (${basePoints} x ${multiplier})`
            );
          }
        }
      }

      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        logger.info(`Updated ${Object.keys(updates).length} prediction points`);
      }
    } catch (error) {
      logger.error('Error updating prediction points:', error);
    }
  }
);

/**
 * Triggered when prediction points change
 * Updates the user's total score
 */
export const updateUserScore = onValueWritten(
  'predictions/{userId}/{matchId}/points',
  async (event) => {
    const { userId } = event.params;
    const beforePoints = (event.data.before.val() as number | null) ?? 0;
    const afterPoints = (event.data.after.val() as number | null) ?? 0;

    // No change in points
    if (beforePoints === afterPoints) {
      return;
    }

    const pointsDiff = afterPoints - beforePoints;

    logger.info(
      `User ${userId} points changed: ${beforePoints} -> ${afterPoints} (diff: ${pointsDiff})`
    );

    try {
      const scoreSnapshot = await db.ref(`users/${userId}/score`).once('value');
      const currentScore = (scoreSnapshot.val() as number | null) ?? 0;
      const newScore = currentScore + pointsDiff;

      await db.ref(`users/${userId}/score`).set(newScore);
      logger.info(`User ${userId} total score: ${newScore}`);
    } catch (error) {
      logger.error('Error updating user score:', error);
    }
  }
);

const FIFA_API_URL = 'https://api.fifa.com/api/v3/calendar/matches';
const SEASON_ID = '285023';
const COMPETITION_ID = '17';

async function fetchFifaMatches() {
  const url = new URL(FIFA_API_URL);
  url.searchParams.set('idseason', SEASON_ID);
  url.searchParams.set('idcompetition', COMPETITION_ID);
  url.searchParams.set('count', '500');
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`FIFA API error ${response.status}`);
  }

  const json = (await response.json()) as {
    Results: FifaApiMatch[];
  };

  return transformMatches(json.Results);
}

// 0 10 * * *
// │ │ │ │ │
// │ │ │ │ └── day of week
// │ │ │ └──── month
// │ │ └────── day of month
// │ └──────── hour (10 AM)
// └────────── minute
// Every day 10:00 AM Dubai time

export const updateMatches = onSchedule(
  {
    schedule: '0 10 * * *',
    timeZone: 'Asia/Dubai',
  },
  async () => {
    const matches = await fetchFifaMatches();
    await db.ref('matches').set(matches);
    console.log(`Updated ${Object.keys(matches).length} matches`);
  }
);

export const updateMatchScoresWithoutPenalty = onSchedule(
  'every 1 minutes',
  async () => {
    logger.info('Updating match scores from FIFA API...');

    try {
      // Get today's date range
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch today's matches from FIFA API
      const apiUrl = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&count=500`;
      console.log(apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`FIFA API error: ${response.status}`);
      }

      const data = (await response.json()) as FifaApiResponse;

      // Get current matches from database
      const matchesSnapshot = await db.ref('matches').once('value');
      const matches = matchesSnapshot.val() as Record<string, Match> | null;

      if (!matches) {
        logger.warn('No matches found in database');
        return;
      }

      // Update scores for matching games
      const updates: Record<string, number> = {};

      for (const fifaMatch of data.Results) {
        for (const [gameId, match] of Object.entries(matches)) {
          if (match.fifaId === fifaMatch.IdMatch) {
            const homeScore = fifaMatch.Home?.Score ?? -1;
            const awayScore = fifaMatch.Away?.Score ?? -1;

            if (match.homeScore !== homeScore && homeScore >= 0) {
              updates[`matches/${gameId}/homeScore`] = homeScore;
              logger.info(`Updated game ${gameId} home score: ${homeScore}`);
            }

            if (match.awayScore !== awayScore && awayScore >= 0) {
              updates[`matches/${gameId}/awayScore`] = awayScore;
              logger.info(`Updated game ${gameId} away score: ${awayScore}`);
            }
          }
        }
      }

      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        logger.info(`Applied ${Object.keys(updates).length} score updates`);
      }
    } catch (error) {
      logger.error('Error updating match scores:', error);
    }
  }
);

// function getFinalScores(item: FifaApiMatch) {
//   const fifaHomeScore = item.Home?.Score ?? -1;
//   const fifaAwayScore = item.Away?.Score ?? -1;

//   let finalHomeScore = fifaHomeScore;
//   let finalAwayScore = fifaAwayScore;

//   if (
//     typeof item.HomeTeamPenaltyScore === 'number' &&
//     typeof item.AwayTeamPenaltyScore === 'number'
//   ) {
//     if (item.HomeTeamPenaltyScore > item.AwayTeamPenaltyScore) {
//       finalHomeScore = fifaHomeScore + 1;
//     } else if (item.AwayTeamPenaltyScore > item.HomeTeamPenaltyScore) {
//       finalAwayScore = fifaAwayScore + 1;
//     }
//   }

//   return {
//     homeScore: finalHomeScore,
//     awayScore: finalAwayScore,
//   };
// }

function calculateFinalScore(item: FifaApiMatch) {
  const fifaHomeScore = item.Home?.Score ?? -1;
  const fifaAwayScore = item.Away?.Score ?? -1;

  let homeScore = fifaHomeScore;
  let awayScore = fifaAwayScore;

  if (
    typeof item.HomeTeamPenaltyScore === 'number' &&
    typeof item.AwayTeamPenaltyScore === 'number'
  ) {
    if (item.HomeTeamPenaltyScore > item.AwayTeamPenaltyScore) {
      homeScore = fifaHomeScore + 1;
    } else if (item.AwayTeamPenaltyScore > item.HomeTeamPenaltyScore) {
      awayScore = fifaAwayScore + 1;
    }
  }

  return {
    homeScore,
    awayScore,
  };
}

function transformMatches(results: FifaApiMatch[]) {
  const matches: Record<string, any> = {};
  results.forEach((item, index) => {
    const game = index + 1;
    const scores = calculateFinalScore(item);
    matches[game] = {
      game,
      fifaId: item.IdMatch,
      round: item.StageName?.[0]?.Description ?? '',
      group: item.GroupName?.[0]?.Description?.replace('Group ', '') ?? null,
      date: item.Date,
      timestamp: Math.floor(new Date(item.Date).getTime() / 1000),
      location: item.Stadium?.Name?.[0]?.Description ?? '',
      locationCity: item.Stadium?.CityName?.[0]?.Description ?? '',
      locationCountry: item.Stadium?.IdCountry ?? '',
      home: item.Home?.Abbreviation ?? item.PlaceHolderA,
      homeName: item.Home?.ShortClubName ?? item.PlaceHolderA,
      homeScore: scores.homeScore,
      away: item.Away?.Abbreviation ?? item.PlaceHolderB,
      awayName: item.Away?.ShortClubName ?? item.PlaceHolderB,
      awayScore: scores.awayScore,
    };
  });
  return matches;
}

// function transformMatchesWithoutPenalty(results: FifaApiMatch[]) {
//   const matches: Record<string, any> = {};
//   results.forEach((item, index) => {
//     const game = index + 1;
//     matches[game] = {
//       game,
//       fifaId: item.IdMatch,
//       round: item.StageName?.[0]?.Description ?? '',
//       group: item.GroupName?.[0]?.Description?.replace('Group ', '') ?? null,
//       date: item.Date,
//       timestamp: Math.floor(new Date(item.Date).getTime() / 1000),
//       location: item.Stadium?.Name?.[0]?.Description ?? '',
//       locationCity: item.Stadium?.CityName?.[0]?.Description ?? '',
//       locationCountry: item.Stadium?.IdCountry ?? '',
//       home: item.Home?.Abbreviation ?? item.PlaceHolderA,
//       homeName: item.Home?.ShortClubName ?? item.PlaceHolderA,
//       homeScore: item.Home?.Score ?? -1,
//       away: item.Away?.Abbreviation ?? item.PlaceHolderB,
//       awayName: item.Away?.ShortClubName ?? item.PlaceHolderB,
//       awayScore: item.Away?.Score ?? -1,
//     };
//   });
//   return matches;
// }
