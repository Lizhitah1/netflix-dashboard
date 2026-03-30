console.log("🚀 SCRIPT CARGADO");
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
// 6. GRÁFICO 3 (AQUÍ 👇)
function drawCountryChart() {

    let topN = parseInt(document.getElementById("topN").value);

    let countryCount = {};

    netflixData.forEach(item => {
        if (!item.country) return;

        let countries = item.country.split(",");

        countries.forEach(country => {
            let c = country.trim();

            if (!countryCount[c]) {
                countryCount[c] = 0;
            }

            countryCount[c]++;
        });
    });

    // Convertir a array y ordenar
    let sortedCountries = Object.entries(countryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    let dataArray = [['País', 'Cantidad']];

    sortedCountries.forEach(([country, count]) => {
        dataArray.push([country, count]);
    });

    console.log("🌍 Top países:", dataArray);

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor: 'transparent',
        legend: { textStyle: { color: 'white' } },
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white' } },
        colors: ['#E50914'],
        chartArea: { left: 120, width: '70%' }
    };

    var chart = new google.visualization.BarChart(document.getElementById('barchart'));
    chart.draw(data, options);
}
function drawGenreChart() {

    var filter = document.getElementById("typeFilter").value;

    var allData = [
        ['Género', 'Películas', 'Series'],
        ['Drama', 1800, 900],
        ['Comedia', 1500, 700],
        ['Acción', 1200, 300],
        ['Documental', 500, 400],
        ['Romance', 800, 200],
        ['Terror', 600, 100]
    ];

    var data;

    if (filter === "Movie") {
        data = [['Género', 'Películas']];
        allData.slice(1).forEach(row => {
            data.push([row[0], row[1]]);
        });
    } else if (filter === "TV Show") {
        data = [['Género', 'Series']];
        allData.slice(1).forEach(row => {
            data.push([row[0], row[2]]);
        });
    } else {
        data = allData;
    }

    var dataTable = google.visualization.arrayToDataTable(data);

    var options = {
        backgroundColor: 'transparent',
        legend: { textStyle: { color: 'white' } },
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white' } },
        colors: ['#E50914', '#999999']
        
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('genrechart'));
    chart.draw(dataTable, options);
}