const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// Mongoose connection with error handling
mongoose.connect("")
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Define the schema
const flightSchema = new mongoose.Schema({
    departureDate: { type: String, required: true },  
    flightNumber: { type: String, required: true },
    departureAirport: { type: String, required: false },
    departureCity: { type: String, required: false },  // Added departure city
    departureTime: { type: Date, required: false },
    arrivalAirport: { type: String, required: false },
    arrivalCity: { type: String, required: false },    // Added arrival city
    arrivalTime: { type: Date, required: false },
    airline: { type: String, required: false },
    aircraftType: { type: String, required: false },  // Autofilled
    aircraftReg: { type: String, required: false },   // Autofilled
    flightClass: { type: String, required: false },
    flightSeat: { type: String, required: false },
    seatNumber: { type: String, required: false },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual field for flight duration (in minutes)
flightSchema.virtual('flightDuration').get(function() {
    const departureTime = this.departureTime;
    const arrivalTime = this.arrivalTime;

    if (departureTime && arrivalTime) {
        const durationMs = arrivalTime - departureTime;
        const durationMinutes = Math.floor(durationMs / (1000 * 60)); // Convert ms to minutes
        return durationMinutes;
    }
    return null;
});

// Pre-save hook to auto-fill flight details
flightSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('flightNumber')) {
        const flightNumber = this.flightNumber;
        const apiKey = process.env.API_KEY; // Ensure API key is correctly set
        const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}`;

        console.log(`Fetching flight data for flight number: ${flightNumber}`);
        console.log(`Requesting URL: ${url}`);

        try {
            // Make the API request to fetch flight details
            const response = await axios.get(url);
            const flightData = response.data.data[0]; // Assuming first result is the right flight

            console.log('Flight Data Fetched: ', flightData);

            if (flightData) {
                // Autofill the flight details including city and airport
                this.departureAirport = flightData.departure.airport;
                this.departureCity = flightData.departure.iata;  // Autofill the departure city
                this.departureTime = flightData.departure.estimated || flightData.departure.actual || flightData.departure.scheduled;
                
                this.arrivalAirport = flightData.arrival.airport;
                this.arrivalCity = flightData.arrival.iata;  // Autofill the arrival city
                this.arrivalTime = flightData.arrival.estimated || flightData.arrival.actual || flightData.arrival.scheduled;
                
                this.airline = flightData.airline.name;
                this.aircraftType = flightData.aircraft.iata;  // Autofill aircraft type
                this.aircraftReg = flightData.aircraft.registration || 'Unknown';  // Autofill aircraft registration
            } else {
                throw new Error('Flight data not found.');
            }
        } catch (error) {
            console.error('Error fetching flight details from aviation API:', error.message);
            return next(new Error('Failed to auto-fill flight details. Please try again.'));
        }
    }

    next();
});

// Model creation
const Flight = mongoose.model('Flight', flightSchema);

// Export modules
module.exports = {
    Flight
};
