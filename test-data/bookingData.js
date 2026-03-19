const today = new Date();

const checkIn = new Date(today);
checkIn.setDate(today.getDate() + 2);

const checkOut = new Date(today);
checkOut.setDate(today.getDate() + 3);

module.exports = {
  hotelName: "Muong Thanh Saigon Centre Hotel",
  checkIn,
  checkOut,
  adults: 4,
  children: 2,
  childAges: [8, 10],
  rooms: 1,
};