const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Room bookings stored in memory
let bookings = [];

// Load bookings from the JSON file if it exists
const bookingsFilePath = path.join(__dirname, 'bookings.json');
if (fs.existsSync(bookingsFilePath)) {
    const fileData = fs.readFileSync(bookingsFilePath);
    bookings = JSON.parse(fileData);
}

// Save bookings to the JSON file
const saveBookingsToFile = () => {
    fs.writeFileSync(bookingsFilePath, JSON.stringify(bookings, null, 2));
};

// Endpoint to handle booking form submissions
app.post('/api/book', (req, res) => {
    const { name, email, room, date, time } = req.body;

    // Validate input
    if (!name || !email || !room || !date || !time) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if the room is available at the requested time
    const isBooked = bookings.some(
        (booking) => booking.room === room && booking.date === date && booking.time === time
    );

    if (isBooked) {
        return res.status(400).json({ error: 'The selected room is already booked for the chosen time.' });
    }

    // Add the new booking
    const newBooking = { name, email, room, date, time };
    bookings.push(newBooking);

    // Save bookings to the file
    saveBookingsToFile();

    return res.status(200).json({ message: 'Room successfully booked!', booking: newBooking });
});

// Endpoint to get all bookings (for debugging or future features)
app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
