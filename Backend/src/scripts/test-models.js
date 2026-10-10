const { sequelize, Room, RatePlan, Booking } = require("../models");

async function main() {
  await sequelize.authenticate();
  console.log("Connected.");

  const room = await Room.findOne({ where: { name: "Room1" } });
  const ratePlan = await RatePlan.findOne({ where: { duration_hours: 8 } });

  console.log(`Room1 id: ${room.id}`);
  console.log(`8h rate plan id: ${ratePlan.id}`);

  // Just reading, not creating anything yet — proves the association works.
  const bookings = await Booking.findAll({
    include: [
      { model: Room, as: "room" },
      { model: RatePlan, as: "ratePlan" },
    ],
  });
  console.log(`Bookings found: ${bookings.length}`);

  await sequelize.close();
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
