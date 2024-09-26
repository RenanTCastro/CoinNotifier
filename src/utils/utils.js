async function combineArray(supabase, prices) {
    const { data, error } = await supabase
    .from('prices')
    .select('*');
    
    if(error){
        console.log("Erro ao acessar prices");
        return [];
    }

    const priceMap = Object.fromEntries(prices.map(item => [item.symbol, item.price]));
    const combinedArray = data.map(item => ({...item, actual_price: parseFloat(priceMap[item.symbol]) || null }));
    
    return combinedArray;
}

function formatDate(){
    const start = new Date();
    const dia = String(start.getDate()).padStart(2, '0');
    const mes = String(start.getMonth() + 1).padStart(2, '0');
    const ano = start.getFullYear();
    const horas = String(start.getHours()).padStart(2, '0');
    const minutos = String(start.getMinutes()).padStart(2, '0');

    const dataFormatada = `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
    
    return dataFormatada;
}

function isNewData(lastUpdated){
    const now = new Date();
    now.setHours(now.getHours() + 3);
    const last = new Date(lastUpdated)

    return (now - last) > 120000;
}

module.exports = { 
    combineArray,
    formatDate,
    isNewData
}