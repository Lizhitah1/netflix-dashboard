console.log("🔥 NUEVA VERSION GENEROS");
let netflixData = [];

function loadCSV() {
    console.log("📊 Intentando cargar CSV...");

    Papa.parse("./netflix_titles.csv", {
        download: true,
        header: true,
        complete: function(results) {
            console.log("✅ CSV cargado");
            console.log("📦 Total registros:", results.data.length);

            netflixData = results.data;

            init();
        }
    });
}
// Cargar Google Charts
google.charts.load('current', { packages: ['corechart'] });

// Callback general
google.charts.setOnLoadCallback(loadCSV);

function init() {
    drawPieChart();
    drawLineChart();
    drawCountryChart();
    drawGenreChart();
}

// GRÁFICO 1
function drawPieChart() {

    let movies = 0;
    let series = 0;

    netflixData.forEach(item => {
        if (item.type === "Movie") movies++;
        else if (item.type === "TV Show") series++;
    });

    var data = google.visualization.arrayToDataTable([
        ['Tipo', 'Cantidad'],
        ['Películas', movies],
        ['Series', series]
    ]);

    var options = {
        pieHole: 0.5,
        colors: ['#E50914', '#666666'],
        backgroundColor: 'transparent',
        legendTextStyle: { color: 'white' },
        titleTextStyle: { color: 'white' },
        pieSliceText: 'percentage'
    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}
function drawLineChart() {

    console.log("📈 Dibujando gráfico...");

    let years = {};

    netflixData.forEach(item => {
        let year = item.release_year;
        let type = item.type;

        if (!year) return; // 🔥 evita datos malos

        if (!years[year]) {
            years[year] = { Movie: 0, "TV Show": 0 };
        }

        if (type === "Movie") years[year].Movie++;
        if (type === "TV Show") years[year]["TV Show"]++;
    });

    let dataArray = [['Año', 'Películas', 'Series']];

    Object.keys(years)
        .filter(year => year)
        .sort((a, b) => a - b)
        .forEach(year => {
            dataArray.push([
                Number(year), // 🔥 clave importante
                years[year].Movie,
                years[year]["TV Show"]
            ]);
        });

    console.log("📊 Data:", dataArray);

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor: 'transparent',
        legendTextStyle: { color: 'white' },
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white' } },
        colors: ['#E50914', '#aaaaaa']
    };

    var chart = new google.visualization.LineChart(document.getElementById('linechart'));
    chart.draw(data, options);
}
// 6. GRÁFICO 3 (AQUÍ 👇)}
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
        .slice(0, topN)
        .reverse();

    let dataArray = [['País', 'Cantidad']];

    sorted.forEach(([country, count]) => {
        dataArray.push([country, count]);
    });

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor: 'transparent',
        legend: 'none',
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white', fontSize: 11 } },
        colors: ['#E50914'],
        chartArea: { left: 150, width: '70%' }
    };

    var chart = new google.visualization.BarChart(
        document.getElementById('barchart')
    );

    chart.draw(data, options);
}
// 7. GRÁFICO 4 (AQUÍ 👇
function drawGenreChart() {

    let filter = document.getElementById("typeFilter").value;

    let genreCount = {};

    netflixData.forEach(item => {

        if (!item.listed_in || !item.type) return;

        if (filter !== "Todos" && item.type !== filter) return;

        item.listed_in.split(",").forEach(g => {

            let genre = g.trim();
            if (!genre) return;

            genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
    });

    let sorted = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .reverse();

    let dataArray = [['Género', 'Cantidad']];

    sorted.forEach(([genre, count]) => {
        dataArray.push([genre, Number(count)]);
    });

    console.log("🎬 Géneros:", dataArray);

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor: 'transparent',
        legend: 'none',
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white', fontSize: 11 } },
        colors: ['#E50914'],
        chartArea: { left: 180, width: '65%' }
    };

    var chart = new google.visualization.BarChart(
        document.getElementById('genrechart')
    );

    chart.draw(data, options);
}
document.getElementById("topN").addEventListener("change", drawCountryChart);
document.getElementById("typeFilter").addEventListener("change", drawGenreChart);


