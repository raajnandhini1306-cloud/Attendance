const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./auth');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(authRoutes);
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', authRoutes);

// ------------------ Location Restriction ------------------
const allowedLat = 12.8421;
const allowedLon = 80.1559;
const allowedRadius = 100; // meters

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

app.post("/mark_attendance", (req, res) => {
    const { student_id, student_name, lat, lon } = req.body;

    if (!lat || !lon) {
        return res.status(400).json({ message: "Location not provided" });
    }

    const distance = getDistanceFromLatLonInMeters(lat, lon, allowedLat, allowedLon);

    if (distance <= allowedRadius) {
        const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        db.run(
            `INSERT INTO attendance (student_id, student_name, date, status, latitude, longitude)
             VALUES (?, ?, ?, 'Present', ?, ?)`,
            [student_id, student_name, date, lat, lon],
            function (err) {
                if (err) {
                    console.error("DB insert error:", err.message);
                    return res.status(500).json({ message: "DB error" });
                }
                res.json({ message: "✅ Attendance marked successfully!" });
            }
        );
    } else {
        res.json({ message: "❌ You are not in the allowed location!" });
    }
});

// -----------------------------------------------------------

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
