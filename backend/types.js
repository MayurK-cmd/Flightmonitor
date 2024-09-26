const zod = require("zod");

// Schema for flight
const Flightdetails = zod.object({
    departureDate: zod.string().nonempty("Date is required"),
    flightNumber: zod.string().nonempty("Flight Number is required"),
    flightClass: zod.string().optional(), // Optional fields can be added like this
    flightSeat: zod.string().optional(),
    seatNumber: zod.string().optional()
});

// Export
module.exports = {
    Flightdetails
};
