const sequelize = require("../src/config/database");

async function runOverlapTest() {
  console.log("\n🧪 Starting Double-Booking Exclusion Constraint Test...\n");

  const t = await sequelize.transaction();

  try {
    // 1. Create temporary test data within the transaction
    const [user] = await sequelize.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ('test-overlap@example.com', 'dummyhash', 'Test Guest', 'user')
       RETURNING id;`,
      { transaction: t },
    );
    const userId = user[0].id;

    const [room] = await sequelize.query(
      `INSERT INTO rooms (name, capacity)
       VALUES ('Test Room 101', 2)
       RETURNING id;`,
      { transaction: t },
    );
    const roomId = room[0].id;

    const [ratePlan] = await sequelize.query(
      `INSERT INTO rate_plans (duration_hours, price_centavos)
       VALUES (8, 250000)
       RETURNING id;`,
      { transaction: t },
    );
    const ratePlanId = ratePlan[0].id;

    const checkIn = new Date("2026-10-01T14:00:00Z");
    const checkOut = new Date("2026-10-01T22:00:00Z"); // 8 hours later

    // 2. Insert Booking #1 (Valid booking)
    console.log(
      "▶ [Step 1] Creating initial Booking #1 (14:00 - 22:00 UTC)...",
    );
    await sequelize.query(
      `INSERT INTO bookings (
         user_id, room_id, rate_plan_id, check_in, check_out,
         guest_count, total_price_centavos, status, idempotency_key
       ) VALUES (
         :userId, :roomId, :ratePlanId, :checkIn, :checkOut,
         2, 250000, 'confirmed', 'idem-test-001'
       );`,
      {
        replacements: { userId, roomId, ratePlanId, checkIn, checkOut },
        transaction: t,
      },
    );
    console.log("  ✅ Booking #1 successfully created!\n");

    // 3. Attempt Booking #2 (Overlapping: 18:00 - 02:00 next day)
    const overlappingCheckIn = new Date("2026-10-01T18:00:00Z");
    const overlappingCheckOut = new Date("2026-10-02T02:00:00Z");

    console.log(
      "▶ [Step 2] Attempting overlapping Booking #2 (18:00 - 02:00 UTC)...",
    );
    await sequelize.query("SAVEPOINT overlap_check;", { transaction: t });

    let caughtError = null;

    try {
      await sequelize.query(
        `INSERT INTO bookings (
           user_id, room_id, rate_plan_id, check_in, check_out,
           guest_count, total_price_centavos, status, idempotency_key
         ) VALUES (
           :userId, :roomId, :ratePlanId, :checkIn, :checkOut,
           2, 250000, 'pending', 'idem-test-002'
         );`,
        {
          replacements: {
            userId,
            roomId,
            ratePlanId,
            checkIn: overlappingCheckIn,
            checkOut: overlappingCheckOut,
          },
          transaction: t,
        },
      );
    } catch (err) {
      caughtError = err;
      await sequelize.query("ROLLBACK TO SAVEPOINT overlap_check;", {
        transaction: t,
      });
    }

    if (!caughtError) {
      throw new Error(
        "❌ FAILED: PostgreSQL allowed an overlapping booking! Exclusion constraint is missing or inactive.",
      );
    }

    const isExclusionViolation =
      caughtError.name === "SequelizeExclusionConstraintError" ||
      caughtError.parent?.code === "23P01" ||
      caughtError.message.includes("bookings_no_overlap_check");

    if (isExclusionViolation) {
      console.log(
        "  🛡️  SUCCESS! PostgreSQL blocked the double booking as expected!",
      );
      console.log(
        `  📌 Constraint caught: bookings_no_overlap_check (PostgreSQL code: 23P01)\n`,
      );
    } else {
      console.error("  ⚠️ Caught unexpected error:", caughtError.message);
      throw caughtError;
    }

    // 4. Verify that non-overlapping booking succeeds
    const nonOverlappingCheckIn = new Date("2026-10-02T14:00:00Z");
    const nonOverlappingCheckOut = new Date("2026-10-02T22:00:00Z");

    console.log(
      "▶ [Step 3] Creating non-overlapping Booking #3 for next day (14:00 - 22:00 UTC)...",
    );
    await sequelize.query(
      `INSERT INTO bookings (
         user_id, room_id, rate_plan_id, check_in, check_out,
         guest_count, total_price_centavos, status, idempotency_key
       ) VALUES (
         :userId, :roomId, :ratePlanId, :checkIn, :checkOut,
         2, 250000, 'confirmed', 'idem-test-003'
       );`,
      {
        replacements: {
          userId,
          roomId,
          ratePlanId,
          checkIn: nonOverlappingCheckIn,
          checkOut: nonOverlappingCheckOut,
        },
        transaction: t,
      },
    );
    console.log("  ✅ Booking #3 successfully created!\n");

    console.log(
      "===============================================================",
    );
    console.log(
      "🎉 ALL TESTS PASSED: Double-booking exclusion constraint verified!",
    );
    console.log(
      "===============================================================\n",
    );
  } catch (err) {
    console.error("❌ Test script failed:", err);
  } finally {
    // Always rollback so no dummy test records remain in the database
    await t.rollback();
    await sequelize.close();
  }
}

runOverlapTest();
