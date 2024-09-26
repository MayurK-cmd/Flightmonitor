const express = require("express");
const { Flightdetails } = require("./types"); // Correctly import Flightdetails
const { Flight } = require("./db"); // Correctly import your Flight model

const app = express();
app.use(express.json());

// Create a flight record
app.post('/myflight', async (req, res) => {
    const createPayload = req.body;

    // Validate request payload using the Zod schema
    const parsedPayload = Flightdetails.safeParse(createPayload);

    if (!parsedPayload.success) {
        return res.status(400).json({
            msg: "You sent the wrong inputs",
            errors: parsedPayload.error.errors, // Send back validation errors
        });
    }

    try {
        // Destructure the parsed data for better readability
        const { departureDate, flightNumber, flightClass, flightSeat, seatNumber } = parsedPayload.data;

        // Create the flight record in the database
        await Flight.create({
            departureDate,
            flightNumber,
            flightClass: flightClass || null,
            flightSeat: flightSeat || null,
            seatNumber: seatNumber || null
        });

        res.json({
            msg: "Flight added successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
