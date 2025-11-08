const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;  // ← CRITICAL FIX!

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Mood-Based Music Recommender API',
        status: 'Running',
        endpoints: {
            moods: '/api/moods',
            recommend: '/api/recommend/:mood',
            songs: '/api/songs',
            searchArtist: '/api/search/artist/:name'
        }
    });
});

// Songs database
const songsDatabase = {
    songs: [
        // Happy mood songs
        { id: 1, title: "Happy Together", artist: "The Turtles", mood: "Happy", genre: "Pop", tempo: "upbeat", duration: "2:55" },
        { id: 2, title: "Walking on Sunshine", artist: "Katrina and The Waves", mood: "Happy", genre: "Pop", tempo: "upbeat", duration: "3:58" },
        { id: 3, title: "Good Vibrations", artist: "The Beach Boys", mood: "Happy", genre: "Rock", tempo: "upbeat", duration: "3:36" },
        { id: 4, title: "Don't Stop Me Now", artist: "Queen", mood: "Happy", genre: "Rock", tempo: "upbeat", duration: "3:29" },
        { id: 5, title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", mood: "Happy", genre: "Funk", tempo: "upbeat", duration: "4:30" },

        // Sad mood songs
        { id: 6, title: "Someone Like You", artist: "Adele", mood: "Sad", genre: "Pop", tempo: "slow", duration: "4:45" },
        { id: 7, title: "The Night We Met", artist: "Lord Huron", mood: "Sad", genre: "Indie", tempo: "slow", duration: "3:28" },
        { id: 8, title: "Fix You", artist: "Coldplay", mood: "Sad", genre: "Alternative", tempo: "slow", duration: "4:54" },
        { id: 9, title: "Hurt", artist: "Johnny Cash", mood: "Sad", genre: "Country", tempo: "slow", duration: "3:38" },
        { id: 10, title: "All I Want", artist: "Kodaline", mood: "Sad", genre: "Indie", tempo: "slow", duration: "5:06" },

        // Calm mood songs
        { id: 11, title: "Weightless", artist: "Marconi Union", mood: "Calm", genre: "Ambient", tempo: "slow", duration: "8:10" },
        { id: 12, title: "River Flows in You", artist: "Yiruma", mood: "Calm", genre: "Classical", tempo: "moderate", duration: "3:40" },
        { id: 13, title: "Clair de Lune", artist: "Claude Debussy", mood: "Calm", genre: "Classical", tempo: "slow", duration: "5:00" },
        { id: 14, title: "Electra", artist: "Airstream", mood: "Calm", genre: "Ambient", tempo: "slow", duration: "4:47" },
        { id: 15, title: "Sunset", artist: "Café del Mar", mood: "Calm", genre: "Chillout", tempo: "slow", duration: "6:20" },

        // Energetic mood songs
        { id: 16, title: "Eye of the Tiger", artist: "Survivor", mood: "Energetic", genre: "Rock", tempo: "fast", duration: "4:04" },
        { id: 17, title: "Thunder", artist: "Imagine Dragons", mood: "Energetic", genre: "Pop Rock", tempo: "fast", duration: "3:07" },
        { id: 18, title: "Titanium", artist: "David Guetta ft. Sia", mood: "Energetic", genre: "EDM", tempo: "fast", duration: "4:05" },
        { id: 19, title: "Stronger", artist: "Kanye West", mood: "Energetic", genre: "Hip Hop", tempo: "fast", duration: "5:12" },
        { id: 20, title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", mood: "Energetic", genre: "Hip Hop", tempo: "fast", duration: "4:18" }
    ],
    moodCategories: {
        Happy: {
            keywords: ["happy", "joyful", "cheerful", "excited", "positive"],
            description: "Uplifting songs to boost your mood"
        },
        Sad: {
            keywords: ["sad", "melancholic", "emotional", "heartbroken", "reflective"],
            description: "Emotional songs for when you need to let it out"
        },
        Calm: {
            keywords: ["calm", "peaceful", "relaxing", "chill", "serene"],
            description: "Soothing songs to help you unwind"
        },
        Energetic: {
            keywords: ["energetic", "intense", "motivated", "pumped", "powerful"],
            description: "High-energy songs to get you moving"
        }
    }
};

// Helper functions
function durationToSeconds(duration) {
    const [mins, secs] = duration.split(':').map(Number);
    return mins * 60 + secs;
}

function secondsToDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Routes

// Get all available moods
app.get('/api/moods', (req, res) => {
    const moods = Object.keys(songsDatabase.moodCategories).map(mood => ({
        name: mood,
        description: songsDatabase.moodCategories[mood].description
    }));
    res.json(moods);
});

// Get recommendations by mood
app.get('/api/recommend/:mood', (req, res) => {
    const mood = req.params.mood;

    if (!songsDatabase.moodCategories[mood]) {
        return res.status(404).json({ error: 'Mood not found' });
    }

    // Filter songs by mood
    let matchingSongs = songsDatabase.songs.filter(song => song.mood === mood);

    // Shuffle songs for variety
    matchingSongs = matchingSongs.sort(() => 0.5 - Math.random());

    // Limit to 8 songs
    const selectedSongs = matchingSongs.slice(0, 8);

    // Calculate total duration
    const totalSeconds = selectedSongs.reduce((sum, song) => {
        return sum + durationToSeconds(song.duration);
    }, 0);

    const playlist = {
        mood: mood,
        description: songsDatabase.moodCategories[mood].description,
        songCount: selectedSongs.length,
        totalDuration: secondsToDuration(totalSeconds),
        songs: selectedSongs
    };

    res.json(playlist);
});

// Get all songs
app.get('/api/songs', (req, res) => {
    res.json(songsDatabase.songs);
});

// Search songs by artist
app.get('/api/search/artist/:name', (req, res) => {
    const artistName = req.params.name.toLowerCase();
    const results = songsDatabase.songs.filter(song => 
        song.artist.toLowerCase().includes(artistName)
    );
    res.json(results);
});

// Start server
app.listen(PORT, () => {
    console.log(`🎵 Mood-Based Music Recommender API running on port ${PORT}`);
});
