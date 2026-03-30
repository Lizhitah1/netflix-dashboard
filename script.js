console.log("🔥 NUEVA VERSION GENEROS");
let netflixData = [];

function animateValue(id, start, end, duration) {

    let obj = document.getElementById(id);

    if (!obj) return; // seguridad

    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / range));

    let timer = setInterval(() => {
        current += increment;
        obj.innerText = current.toLocaleString();

        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}

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
    drawKPIs();
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
// 6. GRÁFICO 3 (AQUÍ 👇)}}
// 7. GRÁFICO 4 (AQUÍ 👇
function drawGenreChart() {

    let filter = document.getElementById("typeFilter").value;

    let genreCount = {};

    netflixData.forEach(item => {

        if (!item.listed_in || !item.type) return;

        if (filter === "Movie" && item.type !== "Movie") return;
        if (filter === "TV Show" && item.type !== "TV Show") return;

        item.listed_in.split(",").forEach(g => {

            let genre = g.trim();
            if (!genre) return;

            genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
    });

    // 🔥 Orden tipo ranking (TOP)
    let sorted = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);

    // 🔥 Agregamos columna de anotaciones (labels)
    let dataArray = [['Género', 'Cantidad', { role: 'annotation' }]];

    sorted.forEach(([genre, count]) => {
        dataArray.push([genre, count, count]); // 👈 muestra valor en barra
    });

    if (dataArray.length <= 1) {
        document.getElementById('genrechart').innerHTML =
            "<p style='color:white'>No hay datos para mostrar</p>";
        return;
    }

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor: 'transparent',
        legend: 'none',
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white', fontSize: 11 } },
        colors: ['#E50914'],
        chartArea: { left: 180, width: '65%' },
        annotations: {
            textStyle: {
                color: 'white',
                fontSize: 12,
                bold: true
            }
        }
    };

    var chart = new google.visualization.BarChart(
        document.getElementById('genrechart')
    );

    chart.draw(data, options);

    // 🎯 INSIGHT DINÁMICO
    let insight = document.getElementById("genreInsight");

if (sorted.length > 0) {
    let topGenre = sorted[0][0];

    if (filter === "Movie") {
        insight.innerHTML = `Las películas están dominadas por el género <span class="highlight">${topGenre}</span>.`;
    } 
    else if (filter === "TV Show") {
        insight.innerHTML = `Las series destacan principalmente en <span class="highlight">${topGenre}</span>.`;
    } 
    else {
        insight.innerHTML = `A nivel general, el género <span class="highlight">${topGenre}</span> lidera el catálogo de Netflix.`;
    }
}
}
function drawCountryChart() {

    let topN = document.getElementById("topN").value;

    let countryCount = {};

    // 🔹 Contar países
    netflixData.forEach(item => {

        if (!item.country) return;

        item.country.split(",").forEach(country => {

            let c = country.trim();
            if (!c) return;

            if (!countryCount[c]) countryCount[c] = 0;

            countryCount[c]++;
        });
    });

    // 🔹 Ordenar y tomar Top N
    let sortedCountries = Object.entries(countryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    // 🔹 Preparar datos para gráfico
    let dataArray = [['País', 'Cantidad']];

    sortedCountries
        .slice() // evitar mutar original
        .reverse()
        .forEach(([country, count]) => {
            dataArray.push([country, count]);
        });

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor: 'transparent',
        legend: 'none',
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white' } },
        colors: ['#E50914'],
        chartArea: { left: 150, width: '70%' },
        bars: 'horizontal',

        // 🔥 Tooltip PRO
        tooltip: {
            textStyle: { color: 'white' },
            showColorCode: true
        }
    };

    var chart = new google.visualization.BarChart(
        document.getElementById('countrychart')
    );

    chart.draw(data, options);

    // 🔥 INSIGHT DINÁMICO PRO
    let insight = document.querySelector("#countrychart + .insight");

    if (sortedCountries.length > 0) {

        let topCountry = sortedCountries[0][0];
        let topValue = sortedCountries[0][1];

        let totalTop = sortedCountries.reduce((sum, item) => sum + item[1], 0);

        insight.innerText = `${topCountry} lidera la producción con ${topValue.toLocaleString()} títulos. Al analizar el Top ${topN}, estos países concentran ${totalTop.toLocaleString()} contenidos, evidenciando una fuerte concentración geográfica del catálogo de Netflix.`;
    }
}
function drawKPIs() {

    let total = netflixData.length;

    let countries = new Set();
    let years = [];

    netflixData.forEach(item => {
        if (item.country) {
            item.country.split(",").forEach(c => countries.add(c.trim()));
        }

        if (item.release_year) {
            years.push(parseInt(item.release_year));
        }
    });

    let maxYear = Math.max(...years);

    animateValue("totalTitles", 0, total, 1000);
    animateValue("totalCountries", 0, countries.size, 1000);
    animateValue("latestYear", 0, maxYear, 1000);
}


document.getElementById("typeFilter").addEventListener("change", drawGenreChart);
document.getElementById("topN").addEventListener("change", function () {
    drawCountryChart();
});


