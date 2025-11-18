-- Migration: Add mission progress tracking for the expanded mission system
-- Date: 2025-11-18
-- Description: Adds mission_progress JSONB column to track detailed mission progress

-- Add mission_progress column to game_players table
ALTER TABLE public.game_players 
ADD COLUMN IF NOT EXISTS mission_progress JSONB DEFAULT '{
  "relics": 0,
  "resources": 0,
  "duelsWon": 0,
  "enigmasSolved": 0,
  "allianceMarks": [],
  "prophecies": 0,
  "energyPoints": 0,
  "enigmaHints": 0,
  "canAnswerEnigma": false,
  "enigmaAnswered": false,
  "hasCompletedLap": false,
  "throneDefended": false,
  "throneBattlesWon": 0
}'::jsonb;

-- Add comment to document the field structure
COMMENT ON COLUMN public.game_players.mission_progress IS 
'Tracks mission progress for different mission types:
- relics: Number of collected relics (Mission 1)
- resources: Number of purchased resources (Mission 2)
- duelsWon: Number of duels won (Mission 3)
- enigmasSolved: Number of enigmas solved (Mission 4)
- allianceMarks: Array of alliance regions visited (Mission 5)
- prophecies: Number of prophecies fulfilled (Mission 6)
- energyPoints: Number of energy points activated (Mission 8)
- enigmaHints: Number of enigma hints collected
- canAnswerEnigma: Boolean indicating if player can answer enigma
- enigmaAnswered: Boolean indicating if enigma was answered
- hasCompletedLap: Boolean indicating if first lap completed
- throneDefended: Boolean for throne mission
- throneBattlesWon: Number of battles won while on throne';

-- Update existing records to have the default mission_progress
UPDATE public.game_players 
SET mission_progress = '{
  "relics": 0,
  "resources": 0,
  "duelsWon": 0,
  "enigmasSolved": 0,
  "allianceMarks": [],
  "prophecies": 0,
  "energyPoints": 0,
  "enigmaHints": 0,
  "canAnswerEnigma": false,
  "enigmaAnswered": false,
  "hasCompletedLap": false,
  "throneDefended": false,
  "throneBattlesWon": 0
}'::jsonb
WHERE mission_progress IS NULL;

