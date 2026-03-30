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

        if (c === "") return; // 🔥 evita vacíos

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

    let filter = document.getElementById("typeFilter").value;

    let genreCount = {};

    netflixData.forEach(item => {

        if (!item.listed_in) return;

        let genres = item.listed_in.split(",");

        genres.forEach(genre => {

            let g = genre.trim();

            if (g === "") return;

            // 🔥 Limpieza PRO de nombres
            g = g.replace("International ", "")
                 .replace("TV ", "");

            if (!genreCount[g]) {
                genreCount[g] = { Movie: 0, "TV Show": 0 };
            }

            if (item.type === "Movie") genreCount[g].Movie++;
            if (item.type === "TV Show") genreCount[g]["TV Show"]++;
        });
    });

    // 🔥 Ordenar por total y tomar top 10
    let sortedGenres = Object.entries(genreCount)
        .sort((a, b) => (b[1].Movie + b[1]["TV Show"]) - (a[1].Movie + a[1]["TV Show"]))
        .slice(0, 10)
        .reverse(); // 👈 mejora visual en horizontal

    let dataArray;

    if (filter === "Movie") {
        dataArray = [['Género', 'Películas']];
        sortedGenres.forEach(([genre, counts]) => {
            dataArray.push([genre, counts.Movie]);
        });
    } 
    else if (filter === "TV Show") {
        dataArray = [['Género', 'Series']];
        sortedGenres.forEach(([genre, counts]) => {
            dataArray.push([genre, counts["TV Show"]]);
        });
    } 
    else {
        dataArray = [['Género', 'Películas', 'Series']];
        sortedGenres.forEach(([genre, counts]) => {
            dataArray.push([genre, counts.Movie, counts["TV Show"]]);
        });
    }

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor: 'transparent',
        legend: { textStyle: { color: 'white' } },
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white' } },
        colors: ['#E50914', '#999999'],
        chartArea: { left: 200, width: '65%' }, // 👈 espacio para etiquetas
        bars: 'horizontal'
    };

    var chart = new google.visualization.BarChart(document.getElementById('genrechart'));
    chart.draw(data, options);
}