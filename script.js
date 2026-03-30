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
function drawGenreChart() {

    let filter = document.getElementById("typeFilter").value;

    let genreCount = {};

    // 🔹 Contar géneros
    netflixData.forEach(item => {

        if (!item.listed_in) return;

        let genres = item.listed_in.split(",");

        genres.forEach(genre => {

            let g = genre.trim();
            if (g === "") return;

            if (!genreCount[g]) {
                genreCount[g] = { Movie: 0, "TV Show": 0 };
            }

            if (item.type === "Movie") genreCount[g].Movie++;
            if (item.type === "TV Show") genreCount[g]["TV Show"]++;
        });
    });

    let sortedGenres;

    // 🔥 Lógica según filtro (UNA sola métrica)
    if (filter === "Movie") {
        sortedGenres = Object.entries(genreCount)
            .sort((a, b) => b[1].Movie - a[1].Movie)
            .slice(0, 7);
    } 
    else if (filter === "TV Show") {
        sortedGenres = Object.entries(genreCount)
            .sort((a, b) => b[1]["TV Show"] - a[1]["TV Show"])
            .slice(0, 7);
    } 
    else {
        sortedGenres = Object.entries(genreCount)
            .sort((a, b) => 
                (b[1].Movie + b[1]["TV Show"]) - (a[1].Movie + a[1]["TV Show"])
            )
            .slice(0, 7);
    }

    // 🔹 Mejor orden visual
    sortedGenres.reverse();

    // 🔹 Dataset SIEMPRE de una sola columna
    let dataArray = [['Género', 'Cantidad']];

    sortedGenres.forEach(([genre, counts]) => {

        let value;

        if (filter === "Movie") {
            value = counts.Movie;
        } 
        else if (filter === "TV Show") {
            value = counts["TV Show"];
        } 
        else {
            value = counts.Movie + counts["TV Show"];
        }

        dataArray.push([genre, value]);
    });

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor: 'transparent',
        legend: 'none', // 👈 clave (no hay comparación)
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white', fontSize: 11 } },
        colors: ['#E50914'],
        chartArea: { left: 250, width: '60%' },
        bars: 'horizontal'
    };

    var chart = new google.visualization.BarChart(document.getElementById('genrechart'));
    chart.draw(data, options);
}