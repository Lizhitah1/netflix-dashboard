function drawCountryChart() {

    let topN = parseInt(document.getElementById("topN").value);
    let countryCount = {};

    netflixData.forEach(item => {
        if (!item.country) return;

        item.country.split(",").forEach(c => {
            let country = c.trim();
            if (!country) return;
            countryCount[country] = (countryCount[country] || 0) + 1;
        });
    });

    let sorted = Object.entries(countryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    let dataArray = [['País', 'Cantidad']];

    sorted.reverse().forEach(([country, count]) => {
        dataArray.push([country, count]);
    });

    let data = google.visualization.arrayToDataTable(dataArray);

    let options = {
        backgroundColor: 'transparent',
        legend: 'none',

        // 🔥 CLAVE: MÁS ESPACIO PARA TEXTO
        chartArea: {
            left: 220,
            width: '60%',
            height: '70%'
        },

        hAxis: {
            textStyle: { color: '#ccc' }
        },

        vAxis: {
            textStyle: {
                color: '#fff',
                fontSize: 12
            }
        },

        colors: ['#E50914']
    };

    new google.visualization.BarChart(
        document.getElementById('countrychart')
    ).draw(data, options);
}