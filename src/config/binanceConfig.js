const { Spot } = require('@binance/connector');

const apiKey = process.env.BINANCE_API_KEY
const apiSecret = process.env.BINANCE_SECRET_KEY
const client = new Spot(apiKey, apiSecret)

module.exports = client;