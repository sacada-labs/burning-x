import { config } from 'dotenv'
import { resolve } from 'path'

// Ensure we load env from project root BEFORE importing db
const rootDir = resolve(import.meta.dirname, '..')
config({ path: [resolve(rootDir, '.env.local'), resolve(rootDir, '.env')] })

// Set DATABASE_URL to absolute path
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('/')) {
	process.env.DATABASE_URL = resolve(rootDir, process.env.DATABASE_URL)
}

// Now import db module
const { db } = await import('../src/db/index.ts')
const { trainingPlans, workouts } = await import('../src/db/schema.ts')

const planDefinitions = [
	{
		name: 'Couch to 5K',
		description: 'A gentle 8-week program designed to take you from walking to running a full 5K. Perfect for absolute beginners.',
		distanceType: '5k',
		durationWeeks: 8,
		difficulty: 'beginner',
		schedule: [
			// Week 1
			{ week: 1, day: 1, title: 'Walk/Run Intervals', type: 'easy', duration: 20, instructions: 'Alternate 60 seconds jogging, 90 seconds walking. Repeat for 20 minutes.' },
			{ week: 1, day: 3, title: 'Walk/Run Intervals', type: 'easy', duration: 20, instructions: 'Alternate 60 seconds jogging, 90 seconds walking. Repeat for 20 minutes.' },
			{ week: 1, day: 5, title: 'Walk/Run Intervals', type: 'easy', duration: 20, instructions: 'Alternate 60 seconds jogging, 90 seconds walking. Repeat for 20 minutes.' },
			// Week 2
			{ week: 2, day: 1, title: 'Walk/Run Intervals', type: 'easy', duration: 22, instructions: 'Alternate 90 seconds jogging, 2 minutes walking. Repeat for 22 minutes.' },
			{ week: 2, day: 3, title: 'Walk/Run Intervals', type: 'easy', duration: 22, instructions: 'Alternate 90 seconds jogging, 2 minutes walking. Repeat for 22 minutes.' },
			{ week: 2, day: 5, title: 'Walk/Run Intervals', type: 'easy', duration: 22, instructions: 'Alternate 90 seconds jogging, 2 minutes walking. Repeat for 22 minutes.' },
			// Week 3
			{ week: 3, day: 1, title: 'Walk/Run Intervals', type: 'easy', duration: 25, instructions: 'Run 2 minutes, walk 90 seconds, run 3 minutes, walk 3 minutes. Repeat twice.' },
			{ week: 3, day: 3, title: 'Walk/Run Intervals', type: 'easy', duration: 25, instructions: 'Run 2 minutes, walk 90 seconds, run 3 minutes, walk 3 minutes. Repeat twice.' },
			{ week: 3, day: 5, title: 'Walk/Run Intervals', type: 'easy', duration: 25, instructions: 'Run 2 minutes, walk 90 seconds, run 3 minutes, walk 3 minutes. Repeat twice.' },
			// Week 4
			{ week: 4, day: 1, title: 'Continuous Run', type: 'easy', duration: 25, instructions: 'Run 5 minutes, walk 2 minutes. Repeat 3 times.' },
			{ week: 4, day: 3, title: 'Continuous Run', type: 'easy', duration: 25, instructions: 'Run 5 minutes, walk 2 minutes. Repeat 3 times.' },
			{ week: 4, day: 5, title: 'Continuous Run', type: 'easy', duration: 25, instructions: 'Run 5 minutes, walk 2 minutes. Repeat 3 times.' },
			// Week 5
			{ week: 5, day: 1, title: 'Building Endurance', type: 'easy', duration: 25, instructions: 'Run 8 minutes, walk 2 minutes. Repeat twice, then run 5 minutes.' },
			{ week: 5, day: 3, title: 'Tempo Introduction', type: 'tempo', duration: 20, instructions: '5 min warm-up walk, 10 min steady run, 5 min cool-down walk.' },
			{ week: 5, day: 5, title: 'Building Endurance', type: 'easy', duration: 25, instructions: 'Run 8 minutes, walk 2 minutes. Repeat twice, then run 5 minutes.' },
			// Week 6
			{ week: 6, day: 1, title: 'Long Run', type: 'long_run', duration: 30, instructions: 'Run 10 minutes, walk 3 minutes, run 10 minutes. Keep pace conversational.' },
			{ week: 6, day: 3, title: 'Steady Run', type: 'easy', duration: 25, instructions: 'Run 12 minutes, walk 2 minutes, run 10 minutes.' },
			{ week: 6, day: 5, title: 'Tempo Run', type: 'tempo', duration: 25, instructions: '5 min warm-up, 15 min steady run, 5 min cool-down.' },
			// Week 7
			{ week: 7, day: 1, title: 'Long Run', type: 'long_run', duration: 30, instructions: 'Run 15 minutes, walk 2 minutes, run 12 minutes.' },
			{ week: 7, day: 3, title: 'Intervals', type: 'interval', duration: 25, instructions: '5 min warm-up, then 4x (2 min fast, 2 min jog). 5 min cool-down.' },
			{ week: 7, day: 5, title: 'Steady Run', type: 'easy', duration: 25, instructions: 'Run 20 minutes without stopping. Easy, conversational pace.' },
			// Week 8
			{ week: 8, day: 1, title: 'Long Run', type: 'long_run', duration: 35, instructions: 'Run 25 minutes continuously at easy pace.' },
			{ week: 8, day: 3, title: 'Easy Run', type: 'easy', duration: 20, instructions: 'Easy 20-minute run. Stay relaxed.' },
			{ week: 8, day: 5, title: '5K Race Day!', type: 'race', duration: 35, instructions: 'Run your first 5K! Start easy, finish strong. Celebrate!' },
		],
	},
	{
		name: 'Beginner 10K',
		description: 'A 10-week program to build your endurance from 5K to 10K. Assumes you can currently run 20-30 minutes continuously.',
		distanceType: '10k',
		durationWeeks: 10,
		difficulty: 'beginner',
		schedule: [
			// Week 1
			{ week: 1, day: 1, title: 'Easy Run', type: 'easy', distance: 3, duration: 25, instructions: 'Easy 3K run. Conversational pace.' },
			{ week: 1, day: 3, title: 'Easy Run', type: 'easy', distance: 3, duration: 25, instructions: 'Easy 3K run. Focus on form and breathing.' },
			{ week: 1, day: 5, title: 'Long Run', type: 'long_run', distance: 4, duration: 30, instructions: 'Easy 4K run. Your first longer run.' },
			// Week 2
			{ week: 2, day: 1, title: 'Tempo Run', type: 'tempo', distance: 3, duration: 22, instructions: '1K easy, 1K steady, 1K easy.' },
			{ week: 2, day: 3, title: 'Easy Run', type: 'easy', distance: 3.5, duration: 28, instructions: 'Easy 3.5K run.' },
			{ week: 2, day: 5, title: 'Long Run', type: 'long_run', distance: 5, duration: 38, instructions: 'Easy 5K run.' },
			// Week 3
			{ week: 3, day: 1, title: 'Intervals', type: 'interval', distance: 3, duration: 25, instructions: '5 min warm-up, 4x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 3, day: 3, title: 'Easy Run', type: 'easy', distance: 4, duration: 32, instructions: 'Easy 4K run.' },
			{ week: 3, day: 5, title: 'Long Run', type: 'long_run', distance: 5.5, duration: 42, instructions: 'Easy 5.5K run. Stay relaxed.' },
			// Week 4 (recovery)
			{ week: 4, day: 1, title: 'Easy Run', type: 'easy', distance: 3, duration: 24, instructions: 'Very easy 3K recovery run.' },
			{ week: 4, day: 3, title: 'Tempo Run', type: 'tempo', distance: 4, duration: 28, instructions: '1K easy, 2K steady, 1K easy.' },
			{ week: 4, day: 5, title: 'Long Run', type: 'long_run', distance: 6, duration: 45, instructions: 'Easy 6K run. Milestone distance!' },
			// Week 5
			{ week: 5, day: 1, title: 'Hill Repeats', type: 'interval', distance: 4, duration: 30, instructions: '5 min warm-up, 5x (1 min uphill, jog down), 5 min cool-down.' },
			{ week: 5, day: 3, title: 'Easy Run', type: 'easy', distance: 4.5, duration: 35, instructions: 'Easy 4.5K run.' },
			{ week: 5, day: 5, title: 'Long Run', type: 'long_run', distance: 6.5, duration: 48, instructions: 'Easy 6.5K run.' },
			// Week 6
			{ week: 6, day: 1, title: 'Tempo Run', type: 'tempo', distance: 5, duration: 32, instructions: '1K easy, 3K steady, 1K easy.' },
			{ week: 6, day: 3, title: 'Easy Run', type: 'easy', distance: 4, duration: 32, instructions: 'Easy 4K run.' },
			{ week: 6, day: 5, title: 'Long Run', type: 'long_run', distance: 7, duration: 52, instructions: 'Easy 7K run. Building endurance.' },
			// Week 7
			{ week: 7, day: 1, title: 'Intervals', type: 'interval', distance: 4, duration: 28, instructions: '5 min warm-up, 5x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 7, day: 3, title: 'Easy Run', type: 'easy', distance: 4.5, duration: 35, instructions: 'Easy 4.5K run.' },
			{ week: 7, day: 5, title: 'Long Run', type: 'long_run', distance: 7.5, duration: 55, instructions: 'Easy 7.5K run.' },
			// Week 8 (recovery)
			{ week: 8, day: 1, title: 'Easy Run', type: 'easy', distance: 4, duration: 30, instructions: 'Very easy recovery run.' },
			{ week: 8, day: 3, title: 'Tempo Run', type: 'tempo', distance: 5, duration: 32, instructions: '1K easy, 3K steady, 1K easy.' },
			{ week: 8, day: 5, title: 'Long Run', type: 'long_run', distance: 8, duration: 58, instructions: 'Easy 8K run.' },
			// Week 9
			{ week: 9, day: 1, title: 'Intervals', type: 'interval', distance: 4, duration: 28, instructions: '5 min warm-up, 6x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 9, day: 3, title: 'Easy Run', type: 'easy', distance: 4, duration: 32, instructions: 'Easy 4K run.' },
			{ week: 9, day: 5, title: 'Long Run', type: 'long_run', distance: 8.5, duration: 62, instructions: 'Easy 8.5K run.' },
			// Week 10
			{ week: 10, day: 1, title: 'Easy Run', type: 'easy', distance: 3, duration: 22, instructions: 'Easy 3K shake-out run.' },
			{ week: 10, day: 3, title: 'Tempo Run', type: 'tempo', distance: 4, duration: 26, instructions: '2K easy, 2K steady. Keep it controlled.' },
			{ week: 10, day: 5, title: '10K Race Day!', type: 'race', distance: 10, duration: 60, instructions: 'Run your first 10K! Start conservative, finish strong. You have trained for this!' },
		],
	},
	{
		name: 'Beginner Half Marathon',
		description: 'A 12-week program to take you to your first half marathon. Assumes you can currently run 5K comfortably.',
		distanceType: 'half_marathon',
		durationWeeks: 12,
		difficulty: 'beginner',
		schedule: [
			// Week 1
			{ week: 1, day: 1, title: 'Easy Run', type: 'easy', distance: 4, duration: 30, instructions: 'Easy 4K run. Conversational pace.' },
			{ week: 1, day: 3, title: 'Tempo Run', type: 'tempo', distance: 4, duration: 26, instructions: '1K easy, 2K steady, 1K easy.' },
			{ week: 1, day: 5, title: 'Easy Run', type: 'easy', distance: 5, duration: 38, instructions: 'Easy 5K run.' },
			{ week: 1, day: 7, title: 'Long Run', type: 'long_run', distance: 6, duration: 45, instructions: 'Easy 6K run. The start of your long run tradition.' },
			// Week 2
			{ week: 2, day: 1, title: 'Intervals', type: 'interval', distance: 4, duration: 28, instructions: '5 min warm-up, 4x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 2, day: 3, title: 'Easy Run', type: 'easy', distance: 4.5, duration: 34, instructions: 'Easy 4.5K run.' },
			{ week: 2, day: 5, title: 'Tempo Run', type: 'tempo', distance: 5, duration: 32, instructions: '1K easy, 3K steady, 1K easy.' },
			{ week: 2, day: 7, title: 'Long Run', type: 'long_run', distance: 7, duration: 52, instructions: 'Easy 7K run.' },
			// Week 3
			{ week: 3, day: 1, title: 'Hill Repeats', type: 'interval', distance: 5, duration: 35, instructions: '5 min warm-up, 5x (1 min uphill, jog down), 5 min cool-down.' },
			{ week: 3, day: 3, title: 'Easy Run', type: 'easy', distance: 5, duration: 38, instructions: 'Easy 5K run.' },
			{ week: 3, day: 5, title: 'Tempo Run', type: 'tempo', distance: 5.5, duration: 35, instructions: '1K easy, 3.5K steady, 1K easy.' },
			{ week: 3, day: 7, title: 'Long Run', type: 'long_run', distance: 8, duration: 58, instructions: 'Easy 8K run.' },
			// Week 4 (recovery)
			{ week: 4, day: 1, title: 'Easy Run', type: 'easy', distance: 4, duration: 30, instructions: 'Very easy recovery run.' },
			{ week: 4, day: 3, title: 'Easy Run', type: 'easy', distance: 4.5, duration: 34, instructions: 'Easy 4.5K run.' },
			{ week: 4, day: 5, title: 'Tempo Run', type: 'tempo', distance: 5, duration: 30, instructions: '2K easy, 3K steady.' },
			{ week: 4, day: 7, title: 'Long Run', type: 'long_run', distance: 8, duration: 58, instructions: 'Easy 8K run. Recovery week long run.' },
			// Week 5
			{ week: 5, day: 1, title: 'Intervals', type: 'interval', distance: 5, duration: 32, instructions: '5 min warm-up, 5x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 5, day: 3, title: 'Easy Run', type: 'easy', distance: 5, duration: 38, instructions: 'Easy 5K run.' },
			{ week: 5, day: 5, title: 'Tempo Run', type: 'tempo', distance: 6, duration: 38, instructions: '1K easy, 4K steady, 1K easy.' },
			{ week: 5, day: 7, title: 'Long Run', type: 'long_run', distance: 10, duration: 72, instructions: 'Easy 10K run. Double digits!' },
			// Week 6
			{ week: 6, day: 1, title: 'Hill Repeats', type: 'interval', distance: 5, duration: 35, instructions: '5 min warm-up, 6x (1 min uphill, jog down), 5 min cool-down.' },
			{ week: 6, day: 3, title: 'Easy Run', type: 'easy', distance: 5.5, duration: 40, instructions: 'Easy 5.5K run.' },
			{ week: 6, day: 5, title: 'Tempo Run', type: 'tempo', distance: 6.5, duration: 40, instructions: '1K easy, 4.5K steady, 1K easy.' },
			{ week: 6, day: 7, title: 'Long Run', type: 'long_run', distance: 11, duration: 78, instructions: 'Easy 11K run.' },
			// Week 7
			{ week: 7, day: 1, title: 'Intervals', type: 'interval', distance: 5, duration: 32, instructions: '5 min warm-up, 6x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 7, day: 3, title: 'Easy Run', type: 'easy', distance: 5, duration: 38, instructions: 'Easy 5K run.' },
			{ week: 7, day: 5, title: 'Tempo Run', type: 'tempo', distance: 7, duration: 42, instructions: '1K easy, 5K steady, 1K easy.' },
			{ week: 7, day: 7, title: 'Long Run', type: 'long_run', distance: 12, duration: 85, instructions: 'Easy 12K run.' },
			// Week 8 (recovery)
			{ week: 8, day: 1, title: 'Easy Run', type: 'easy', distance: 4.5, duration: 34, instructions: 'Very easy recovery run.' },
			{ week: 8, day: 3, title: 'Tempo Run', type: 'tempo', distance: 5, duration: 30, instructions: '2K easy, 3K steady.' },
			{ week: 8, day: 5, title: 'Easy Run', type: 'easy', distance: 5, duration: 38, instructions: 'Easy 5K run.' },
			{ week: 8, day: 7, title: 'Long Run', type: 'long_run', distance: 10, duration: 70, instructions: 'Easy 10K recovery long run.' },
			// Week 9
			{ week: 9, day: 1, title: 'Intervals', type: 'interval', distance: 5, duration: 32, instructions: '5 min warm-up, 8x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 9, day: 3, title: 'Easy Run', type: 'easy', distance: 5, duration: 38, instructions: 'Easy 5K run.' },
			{ week: 9, day: 5, title: 'Tempo Run', type: 'tempo', distance: 7, duration: 42, instructions: '1K easy, 5K steady, 1K easy.' },
			{ week: 9, day: 7, title: 'Long Run', type: 'long_run', distance: 14, duration: 98, instructions: 'Easy 14K run. Longest yet!' },
			// Week 10
			{ week: 10, day: 1, title: 'Hill Repeats', type: 'interval', distance: 5, duration: 35, instructions: '5 min warm-up, 8x (1 min uphill, jog down), 5 min cool-down.' },
			{ week: 10, day: 3, title: 'Easy Run', type: 'easy', distance: 5, duration: 38, instructions: 'Easy 5K run.' },
			{ week: 10, day: 5, title: 'Tempo Run', type: 'tempo', distance: 8, duration: 48, instructions: '1K easy, 6K steady, 1K easy.' },
			{ week: 10, day: 7, title: 'Long Run', type: 'long_run', distance: 16, duration: 112, instructions: 'Easy 16K run. Building mental toughness.' },
			// Week 11 (taper)
			{ week: 11, day: 1, title: 'Easy Run', type: 'easy', distance: 4, duration: 30, instructions: 'Easy 4K. Taper week - reduce volume.' },
			{ week: 11, day: 3, title: 'Tempo Run', type: 'tempo', distance: 5, duration: 30, instructions: '2K easy, 3K steady. Keep it controlled.' },
			{ week: 11, day: 5, title: 'Easy Run', type: 'easy', distance: 4, duration: 30, instructions: 'Easy 4K. Stay fresh.' },
			{ week: 11, day: 7, title: 'Long Run', type: 'long_run', distance: 10, duration: 70, instructions: 'Easy 10K. Final long run before race.' },
			// Week 12 (race week)
			{ week: 12, day: 1, title: 'Easy Run', type: 'easy', distance: 3, duration: 22, instructions: 'Easy 3K shake-out run.' },
			{ week: 12, day: 3, title: 'Easy Run', type: 'easy', distance: 3, duration: 22, instructions: 'Easy 3K. Stay loose.' },
			{ week: 12, day: 5, title: 'Rest', type: 'rest', instructions: 'Complete rest. Hydrate and eat well.' },
			{ week: 12, day: 7, title: 'Half Marathon Race Day!', type: 'race', distance: 21.1, duration: 150, instructions: 'Your first half marathon! Start conservative, trust your training, and enjoy every kilometer!' },
		],
	},
	{
		name: 'Beginner Marathon',
		description: 'A 16-week program for your first marathon. Assumes you can currently run 10K comfortably.',
		distanceType: 'marathon',
		durationWeeks: 16,
		difficulty: 'beginner',
		schedule: [
			// Week 1
			{ week: 1, day: 1, title: 'Easy Run', type: 'easy', distance: 5, duration: 35, instructions: 'Easy 5K run. Conversational pace.' },
			{ week: 1, day: 3, title: 'Tempo Run', type: 'tempo', distance: 5, duration: 30, instructions: '1K easy, 3K steady, 1K easy.' },
			{ week: 1, day: 5, title: 'Easy Run', type: 'easy', distance: 6, duration: 42, instructions: 'Easy 6K run.' },
			{ week: 1, day: 7, title: 'Long Run', type: 'long_run', distance: 10, duration: 70, instructions: 'Easy 10K long run.' },
			// Week 2
			{ week: 2, day: 1, title: 'Intervals', type: 'interval', distance: 5, duration: 32, instructions: '5 min warm-up, 5x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 2, day: 3, title: 'Easy Run', type: 'easy', distance: 5, duration: 36, instructions: 'Easy 5K run.' },
			{ week: 2, day: 5, title: 'Tempo Run', type: 'tempo', distance: 6, duration: 36, instructions: '1K easy, 4K steady, 1K easy.' },
			{ week: 2, day: 7, title: 'Long Run', type: 'long_run', distance: 11, duration: 76, instructions: 'Easy 11K long run.' },
			// Week 3
			{ week: 3, day: 1, title: 'Hill Repeats', type: 'interval', distance: 5, duration: 35, instructions: '5 min warm-up, 6x (1 min uphill, jog down), 5 min cool-down.' },
			{ week: 3, day: 3, title: 'Easy Run', type: 'easy', distance: 6, duration: 42, instructions: 'Easy 6K run.' },
			{ week: 3, day: 5, title: 'Tempo Run', type: 'tempo', distance: 6, duration: 36, instructions: '1K easy, 4K steady, 1K easy.' },
			{ week: 3, day: 7, title: 'Long Run', type: 'long_run', distance: 12, duration: 82, instructions: 'Easy 12K long run.' },
			// Week 4 (recovery)
			{ week: 4, day: 1, title: 'Easy Run', type: 'easy', distance: 5, duration: 35, instructions: 'Very easy recovery run.' },
			{ week: 4, day: 3, title: 'Tempo Run', type: 'tempo', distance: 5, duration: 30, instructions: '2K easy, 3K steady.' },
			{ week: 4, day: 5, title: 'Easy Run', type: 'easy', distance: 5, duration: 35, instructions: 'Easy 5K run.' },
			{ week: 4, day: 7, title: 'Long Run', type: 'long_run', distance: 10, duration: 68, instructions: 'Easy 10K. Recovery week.' },
			// Week 5
			{ week: 5, day: 1, title: 'Intervals', type: 'interval', distance: 6, duration: 38, instructions: '5 min warm-up, 6x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 5, day: 3, title: 'Easy Run', type: 'easy', distance: 6, duration: 42, instructions: 'Easy 6K run.' },
			{ week: 5, day: 5, title: 'Tempo Run', type: 'tempo', distance: 7, duration: 40, instructions: '1K easy, 5K steady, 1K easy.' },
			{ week: 5, day: 7, title: 'Long Run', type: 'long_run', distance: 14, duration: 95, instructions: 'Easy 14K long run.' },
			// Week 6
			{ week: 6, day: 1, title: 'Hill Repeats', type: 'interval', distance: 6, duration: 38, instructions: '5 min warm-up, 8x (1 min uphill, jog down), 5 min cool-down.' },
			{ week: 6, day: 3, title: 'Easy Run', type: 'easy', distance: 6, duration: 42, instructions: 'Easy 6K run.' },
			{ week: 6, day: 5, title: 'Tempo Run', type: 'tempo', distance: 7, duration: 40, instructions: '1K easy, 5K steady, 1K easy.' },
			{ week: 6, day: 7, title: 'Long Run', type: 'long_run', distance: 16, duration: 108, instructions: 'Easy 16K long run.' },
			// Week 7
			{ week: 7, day: 1, title: 'Intervals', type: 'interval', distance: 6, duration: 38, instructions: '5 min warm-up, 8x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 7, day: 3, title: 'Easy Run', type: 'easy', distance: 7, duration: 48, instructions: 'Easy 7K run.' },
			{ week: 7, day: 5, title: 'Tempo Run', type: 'tempo', distance: 8, duration: 44, instructions: '1K easy, 6K steady, 1K easy.' },
			{ week: 7, day: 7, title: 'Long Run', type: 'long_run', distance: 18, duration: 120, instructions: 'Easy 18K long run.' },
			// Week 8 (recovery)
			{ week: 8, day: 1, title: 'Easy Run', type: 'easy', distance: 5, duration: 35, instructions: 'Very easy recovery run.' },
			{ week: 8, day: 3, title: 'Tempo Run', type: 'tempo', distance: 6, duration: 34, instructions: '2K easy, 4K steady.' },
			{ week: 8, day: 5, title: 'Easy Run', type: 'easy', distance: 6, duration: 40, instructions: 'Easy 6K run.' },
			{ week: 8, day: 7, title: 'Long Run', type: 'long_run', distance: 14, duration: 94, instructions: 'Easy 14K. Recovery week long run.' },
			// Week 9
			{ week: 9, day: 1, title: 'Intervals', type: 'interval', distance: 6, duration: 38, instructions: '5 min warm-up, 10x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 9, day: 3, title: 'Easy Run', type: 'easy', distance: 7, duration: 48, instructions: 'Easy 7K run.' },
			{ week: 9, day: 5, title: 'Tempo Run', type: 'tempo', distance: 8, duration: 44, instructions: '1K easy, 6K steady, 1K easy.' },
			{ week: 9, day: 7, title: 'Long Run', type: 'long_run', distance: 20, duration: 132, instructions: 'Easy 20K long run. Big milestone!' },
			// Week 10
			{ week: 10, day: 1, title: 'Hill Repeats', type: 'interval', distance: 6, duration: 38, instructions: '5 min warm-up, 10x (1 min uphill, jog down), 5 min cool-down.' },
			{ week: 10, day: 3, title: 'Easy Run', type: 'easy', distance: 7, duration: 48, instructions: 'Easy 7K run.' },
			{ week: 10, day: 5, title: 'Tempo Run', type: 'tempo', distance: 9, duration: 48, instructions: '1K easy, 7K steady, 1K easy.' },
			{ week: 10, day: 7, title: 'Long Run', type: 'long_run', distance: 22, duration: 144, instructions: 'Easy 22K long run.' },
			// Week 11
			{ week: 11, day: 1, title: 'Intervals', type: 'interval', distance: 6, duration: 38, instructions: '5 min warm-up, 10x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 11, day: 3, title: 'Easy Run', type: 'easy', distance: 7, duration: 48, instructions: 'Easy 7K run.' },
			{ week: 11, day: 5, title: 'Tempo Run', type: 'tempo', distance: 9, duration: 48, instructions: '1K easy, 7K steady, 1K easy.' },
			{ week: 11, day: 7, title: 'Long Run', type: 'long_run', distance: 25, duration: 162, instructions: 'Easy 25K long run. Longest yet!' },
			// Week 12 (recovery)
			{ week: 12, day: 1, title: 'Easy Run', type: 'easy', distance: 5, duration: 35, instructions: 'Very easy recovery run.' },
			{ week: 12, day: 3, title: 'Tempo Run', type: 'tempo', distance: 6, duration: 34, instructions: '2K easy, 4K steady.' },
			{ week: 12, day: 5, title: 'Easy Run', type: 'easy', distance: 6, duration: 40, instructions: 'Easy 6K run.' },
			{ week: 12, day: 7, title: 'Long Run', type: 'long_run', distance: 18, duration: 116, instructions: 'Easy 18K. Recovery week.' },
			// Week 13
			{ week: 13, day: 1, title: 'Intervals', type: 'interval', distance: 6, duration: 38, instructions: '5 min warm-up, 10x (400m fast, 400m jog), 5 min cool-down.' },
			{ week: 13, day: 3, title: 'Easy Run', type: 'easy', distance: 7, duration: 48, instructions: 'Easy 7K run.' },
			{ week: 13, day: 5, title: 'Tempo Run', type: 'tempo', distance: 10, duration: 52, instructions: '1K easy, 8K steady, 1K easy.' },
			{ week: 13, day: 7, title: 'Long Run', type: 'long_run', distance: 28, duration: 180, instructions: 'Easy 28K long run. Peak long run!' },
			// Week 14
			{ week: 14, day: 1, title: 'Hill Repeats', type: 'interval', distance: 6, duration: 38, instructions: '5 min warm-up, 8x (1 min uphill, jog down), 5 min cool-down.' },
			{ week: 14, day: 3, title: 'Easy Run', type: 'easy', distance: 7, duration: 48, instructions: 'Easy 7K run.' },
			{ week: 14, day: 5, title: 'Tempo Run', type: 'tempo', distance: 10, duration: 52, instructions: '1K easy, 8K steady, 1K easy.' },
			{ week: 14, day: 7, title: 'Long Run', type: 'long_run', distance: 20, duration: 128, instructions: 'Easy 20K long run.' },
			// Week 15 (taper begins)
			{ week: 15, day: 1, title: 'Easy Run', type: 'easy', distance: 5, duration: 35, instructions: 'Easy 5K. Taper week - reduce volume.' },
			{ week: 15, day: 3, title: 'Tempo Run', type: 'tempo', distance: 6, duration: 32, instructions: '2K easy, 4K steady. Keep it controlled.' },
			{ week: 15, day: 5, title: 'Easy Run', type: 'easy', distance: 5, duration: 35, instructions: 'Easy 5K. Stay fresh.' },
			{ week: 15, day: 7, title: 'Long Run', type: 'long_run', distance: 12, duration: 76, instructions: 'Easy 12K. Final long run before race.' },
			// Week 16 (race week)
			{ week: 16, day: 1, title: 'Easy Run', type: 'easy', distance: 4, duration: 28, instructions: 'Easy 4K shake-out run.' },
			{ week: 16, day: 3, title: 'Easy Run', type: 'easy', distance: 3, duration: 20, instructions: 'Easy 3K. Stay loose.' },
			{ week: 16, day: 5, title: 'Rest', type: 'rest', instructions: 'Complete rest. Hydrate, eat well, get good sleep.' },
			{ week: 16, day: 7, title: 'Marathon Race Day!', type: 'race', distance: 42.2, duration: 300, instructions: 'Your first marathon! Start conservative, trust your training, fuel properly, and enjoy the journey of 42.2K!' },
		],
	},
]

async function seed() {
	console.log('Seeding training plans...')

	for (const planDef of planDefinitions) {
		// Check if plan already exists
		const existing = await db.query.trainingPlans.findFirst({
			where: (plans, { eq }) => eq(plans.name, planDef.name),
		})

		if (existing) {
			console.log(`Plan "${planDef.name}" already exists, skipping...`)
			continue
		}

		// Insert plan
		const [plan] = await db
			.insert(trainingPlans)
			.values({
				name: planDef.name,
				description: planDef.description,
				distanceType: planDef.distanceType,
				durationWeeks: planDef.durationWeeks,
				difficulty: planDef.difficulty,
			})
			.returning()

		console.log(`Created plan: ${plan.name} (ID: ${plan.id})`)

		// Insert workouts
		for (const workout of planDef.schedule) {
			await db.insert(workouts).values({
				planId: plan.id,
				weekNumber: workout.week,
				dayNumber: workout.day,
				title: workout.title,
				description: workout.description,
				workoutType: workout.type,
				distanceKm: workout.distance ?? null,
				durationMinutes: workout.duration ?? null,
				instructions: workout.instructions,
			})
		}

		console.log(`  -> Added ${planDef.schedule.length} workouts`)
	}

	console.log('Seeding complete!')
	process.exit(0)
}

seed().catch((err) => {
	console.error('Seeding failed:', err)
	process.exit(1)
})
