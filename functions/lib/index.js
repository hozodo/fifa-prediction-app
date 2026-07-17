"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserScore = exports.updatePredictionPoints = exports.updateMatchScores = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const database_1 = require("firebase-functions/v2/database");
const firebase_functions_1 = require("firebase-functions");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.database();
// FIFA API constants for World Cup 2026
const FIFA_COMPETITION_ID = '17'; // FIFA World Cup
const FIFA_SEASON_ID = '285023'; // 2026
/**
 * Determine the winner of a match
 */
const getWinner = (home, away) => {
    if (home > away)
        return 'home';
    if (home < away)
        return 'away';
    return 'tied';
};
/**
 * Calculate points for a prediction
 * - 15 points: Exact score
 * - Up to 10 points: Correct winner, minus difference from actual score (min 0)
 * - 0 points: Wrong winner or no prediction
 */
const calculatePoints = (homeScore, awayScore, homePrediction, awayPrediction) => {
    // No prediction or match not played yet
    if (homeScore < 0 || homePrediction === null || awayPrediction === null) {
        return 0;
    }
    // Exact score: 15 points
    if (homeScore === homePrediction && awayScore === awayPrediction) {
        return 15;
    }
    // Correct winner: 10 points minus difference (min 0)
    if (getWinner(homeScore, awayScore) === getWinner(homePrediction, awayPrediction)) {
        const difference = Math.abs(homePrediction - homeScore) + Math.abs(awayPrediction - awayScore);
        return Math.max(0, 10 - difference);
    }
    // Wrong winner: 0 points
    return 0;
};
/**
 * Scheduled function to fetch and update match scores from FIFA API
 * Runs every 1 minute during the tournament
 */
exports.updateMatchScores = (0, scheduler_1.onSchedule)('every 1 minutes', async () => {
    firebase_functions_1.logger.info('Updating match scores from FIFA API...');
    try {
        // Get today's date range
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const fromDate = startOfDay.toISOString();
        const toDate = endOfDay.toISOString();
        // Fetch today's matches from FIFA API
        const apiUrl = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&from=${fromDate}&to=${toDate}&count=500`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`FIFA API error: ${response.status}`);
        }
        const data = await response.json();
        // Get current matches from database
        const matchesSnapshot = await db.ref('matches').once('value');
        const matches = matchesSnapshot.val();
        if (!matches) {
            firebase_functions_1.logger.warn('No matches found in database');
            return;
        }
        // Update scores for matching games
        const updates = {};
        for (const fifaMatch of data.Results) {
            for (const [gameId, match] of Object.entries(matches)) {
                if (match.fifaId === fifaMatch.IdMatch) {
                    const homeScore = fifaMatch.Home?.Score ?? -1;
                    const awayScore = fifaMatch.Away?.Score ?? -1;
                    if (match.homeScore !== homeScore && homeScore >= 0) {
                        updates[`matches/${gameId}/homeScore`] = homeScore;
                        firebase_functions_1.logger.info(`Updated game ${gameId} home score: ${homeScore}`);
                    }
                    if (match.awayScore !== awayScore && awayScore >= 0) {
                        updates[`matches/${gameId}/awayScore`] = awayScore;
                        firebase_functions_1.logger.info(`Updated game ${gameId} away score: ${awayScore}`);
                    }
                }
            }
        }
        // Apply all updates at once
        if (Object.keys(updates).length > 0) {
            await db.ref().update(updates);
            firebase_functions_1.logger.info(`Applied ${Object.keys(updates).length} score updates`);
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('Error updating match scores:', error);
    }
});
/**
 * Triggered when a match is updated
 * Recalculates prediction points for all users for that match
 */
exports.updatePredictionPoints = (0, database_1.onValueWritten)('matches/{matchId}', async (event) => {
    const matchId = event.params.matchId;
    const match = event.data.after.val();
    if (!match) {
        firebase_functions_1.logger.warn(`Match ${matchId} was deleted`);
        return;
    }
    // Only recalculate if match has scores
    if (match.homeScore < 0 || match.awayScore < 0) {
        return;
    }
    firebase_functions_1.logger.info(`Updating prediction points for match ${matchId}`);
    try {
        // Get all users
        const usersSnapshot = await db.ref('users').once('value');
        const users = usersSnapshot.val();
        if (!users) {
            return;
        }
        const updates = {};
        // Calculate points for each user's prediction
        for (const userId of Object.keys(users)) {
            const predictionSnapshot = await db.ref(`predictions/${userId}/${matchId}`).once('value');
            const prediction = predictionSnapshot.val();
            if (prediction) {
                const points = calculatePoints(match.homeScore, match.awayScore, prediction.homePrediction, prediction.awayPrediction);
                if (prediction.points !== points) {
                    updates[`predictions/${userId}/${matchId}/points`] = points;
                    firebase_functions_1.logger.info(`User ${userId}: ${points} points for match ${matchId}`);
                }
            }
        }
        // Apply all updates at once
        if (Object.keys(updates).length > 0) {
            await db.ref().update(updates);
            firebase_functions_1.logger.info(`Updated ${Object.keys(updates).length} prediction points`);
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('Error updating prediction points:', error);
    }
});
/**
 * Triggered when prediction points change
 * Updates the user's total score
 */
exports.updateUserScore = (0, database_1.onValueWritten)('predictions/{userId}/{matchId}/points', async (event) => {
    const { userId } = event.params;
    const beforePoints = event.data.before.val() ?? 0;
    const afterPoints = event.data.after.val() ?? 0;
    // No change in points
    if (beforePoints === afterPoints) {
        return;
    }
    const pointsDiff = afterPoints - beforePoints;
    firebase_functions_1.logger.info(`User ${userId} points changed: ${beforePoints} -> ${afterPoints} (diff: ${pointsDiff})`);
    try {
        const scoreSnapshot = await db.ref(`users/${userId}/score`).once('value');
        const currentScore = scoreSnapshot.val() ?? 0;
        const newScore = currentScore + pointsDiff;
        await db.ref(`users/${userId}/score`).set(newScore);
        firebase_functions_1.logger.info(`User ${userId} total score: ${newScore}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error updating user score:', error);
    }
});
//# sourceMappingURL=index.js.map