const BASE_GUESTS = 2;
const EXTRA_GUEST_FEE_CENTAVOS = 30000;

function calculateTotal(basePriceCentavos, guestCount) {
  const extraGuests = Math.max(0, guestCount - BASE_GUESTS);
  return basePriceCentavos + extraGuests * EXTRA_GUEST_FEE_CENTAVOS;
}

// 50% downpayment, rounded UP to the next centavo.
function calculateDownpayment(totalCentavos) {
  return Math.ceil(totalCentavos / 2);
}

module.exports = {
  BASE_GUESTS,
  EXTRA_GUEST_FEE_CENTAVOS,
  calculateTotal,
  calculateDownpayment,
};
