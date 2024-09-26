require("dotenv").config();
const cron = require('node-cron');
const bot = require("./config/telegramConfig");
const supabase = require('./config/supabaseConfig');
const client = require("./config/binanceConfig");
const { getCriptos, getPrices, getPricesWithChanges, updatePricesTable, sendMessage } = require("./services/services");

async function main(){
    const quoteAsset = 'USDT'
    const criptos = await getCriptos(client, quoteAsset);

    const prices = await getPrices(client, criptos);

    const pricesWithChanges = await getPricesWithChanges(supabase, prices);

    await sendMessage(bot, pricesWithChanges)

    await updatePricesTable(supabase, prices);
    
    console.log("Updated with sucess!");
}

cron.schedule('* * * * *', () => {
    console.log('running task');
    main();
});
