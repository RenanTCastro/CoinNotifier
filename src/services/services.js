const { formatDate, isNewData, combineArray } = require("../utils/utils");

async function getCriptos(client, quoteAsset){
    const res = await client.exchangeInfo();
    const symbols = res.data['symbols'].filter(s=> s.quoteAsset === quoteAsset && s.status === 'TRADING');
    const coinList = symbols.map((s)=>s.symbol);
    
    return coinList;
}

async function getPrices(client, criptos) {
    const res = await client.tickerPrice('',criptos);

    return res.data;
}

async function getPricesWithChanges(supabase, prices) {
    const criptosPrices = await combineArray(supabase, prices);

    const pricesWithChanges = criptosPrices
    .map((cripto) => {
        const percentageChange = ((cripto.actual_price - cripto.price) / cripto.price) * 100;
        return { ...cripto, percentageChange };
    })
    .filter((cripto) => Math.abs(cripto.percentageChange) >= 2);

    return pricesWithChanges;
}

async function updatePricesTable(supabase, prices) {
    const updated_at = new Date().toISOString()
    const dataToUpdate = prices.map((p)=>{return {...p, updated_at}});
    
    const { data, error } = await supabase
        .from('prices')
        .upsert(dataToUpdate, { onConflict: ['symbol'] }) 
        .select();
    
    if(error){
        console.log("Erro ao atualizar tabela prices: ", error);
        return false;
    }
    return true;
}

async function sendMessage(bot, prices) {   
    const date = formatDate();

    if(!prices.length){
        return false;
    }

    const startingNow = isNewData(prices[0].updated_at);

    if(!startingNow){
        await prices.forEach(async price => {
            const message =
            `
                Variação repentina no último minuto: \n\n ${
                price.percentageChange > 0 ?    
                    ('✅ '+ price.symbol.slice(0, -4) + ' em alta de ' + price.percentageChange.toFixed(2) + '%') : 
                    ('❌ '+ price.symbol.slice(0, -4) + ' em queda de ' + price.percentageChange.toFixed(2) + '%')
                } 
                \n Verificado ${date}
            `
            await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message); 
        });
    }else{
        return false;
    }
    return true;
}

module.exports = {
    getCriptos,
    getPrices,
    getPricesWithChanges,
    updatePricesTable,
    sendMessage
}