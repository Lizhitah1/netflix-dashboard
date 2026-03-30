console.log("🚀 VERSION FINAL FUNCIONAL");

let netflixData = [];

// =========================
// CARGA CSV
// =========================
function loadCSV() {

    Papa.parse("./netflix_titles.csv", {
        download: true,
        header: true,
        complete: function(results) {

            netflixData = results.data;
            init();
        }
    });
}

// Google Charts
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(loadCSV);

// =========================
// INIT
// =========================
function init() {
    drawKPIs();
    drawPieChart();
    drawLineChart();
    drawCountryChart();
    drawGenreChart();
}

// =========================
// KPI
// =========================
function drawKPIs() {

    let total = netflixData.length;

    let countries = new Set();
    let years = [];

    netflixData.forEach(item => {

        if (item.country) {
            item.country.split(",").forEach(c => {
                countries.add(c.trim());
            });
        }

        if (item.release_year) {
            years.push(Number(item.release_year));
        }
    });

    let maxYear = Math.max(...years);

    animateValue("totalTitles", 0, total, 800);
    animateValue("totalCountries", 0, countries.size, 800);
    animateValue("latestYear", 0, maxYear, 800);
}

// =========================
// ANIMACIÓN KPI
// =========================
function animateValue(id, start, end, duration) {

    let obj = document.getElementById(id);
    if (!obj) return;

    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / range));

    let timer = setInterval(() => {
        current += increment;
        obj.innerText = current.toLocaleString();

        if (current == end) clearInterval(timer);
    }, stepTime);
}

// =========================
// PIE CHART
// =========================
function drawPieChart() {

    let movies = 0;
    let series = 0;

    netflixData.forEach(item => {
        if (item.type === "Movie") movies++;
        if (item.type === "TV Show") series++;
    });

    let data = google.visualization.arrayToDataTable([
        ['Tipo', 'Cantidad'],
        ['Películas', movies],
        ['Series', series]
    ]);

    let options = {
        pieHole: 0.5,
        colors: ['#E50914', '#666666'],
        backgroundColor: 'transparent',
        pieSliceText: 'percentage',
        chartArea: { width: '80%', height: '80%' }
    };

    let chart = new google.visualization.PieChart(
        document.getElementById('piechart')
    );

    chart.draw(data, options);
}

// =========================
// LINE CHART (SIN CEROS)
// =========================
function drawLineChart() {

    let years = {};

    netflixData.forEach(item => {

        let year = item.release_year;
        let type = item.type;

        if (!year) return;

        if (!years[year]) {
            years[year] = { Movie: 0, "TV Show": 0 };
        }

        if (type === "Movie") years[year].Movie++;
        if (type === "TV Show") years[year]["TV Show"]++;
    });

    let dataArray = [
        ['Año', 'Películas', 'Series']
    ];

    Object.keys(years)
        .filter(y => years[y].Movie > 0 || years[y]["TV Show"] > 0)
        .sort((a, b) => a - b)
        .forEach(year => {

            dataArray.push([
                Number(year),
                years[year].Movie,
                years[year]["TV Show"]
            ]);
        });

    let data = google.visualization.arrayToDataTable(dataArray);

    let options = {
        backgroundColor: 'transparent',
        colors: ['#E50914', '#aaaaaa'],
        chartArea: { width: '80%', height: '70%' },
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white' }, format: 'short' }
    };

    let chart = new google.visualization.LineChart(
        document.getElementById('linechart')
    );

    chart.draw(data, options);
}

// =========================
// COUNTRY CHART
// =========================
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

    sorted.slice().reverse().forEach(([country, count]) => {
        dataArray.push([country, count]);
    });

    let data = google.visualization.arrayToDataTable(dataArray);

    let options = {
        backgroundColor: 'transparent',
        legend: 'none',
        colors: ['#E50914'],
        chartArea: { left: 150, width: '70%' }
    };

    let chart = new google.visualization.BarChart(
        document.getElementById('countrychart')
    );

    chart.draw(data, options);

    // Insight dinámico
    let insight = document.querySelector("#countrychart + .insight");

    if (sorted.length > 0) {

        let topCountry = sorted[0][0];
        let totalTop = sorted.reduce((sum, item) => sum + item[1], 0);

        insight.innerText =
            `${topCountry} lidera la producción. El Top ${topN} concentra ${totalTop.toLocaleString()} títulos.`;
    }
}

// =========================
// GENRE CHART
// =========================
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

    let sorted = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);

    let dataArray = [['Género', 'Cantidad', { role: 'annotation' }]];

    sorted.forEach(([genre, count]) => {
        dataArray.push([genre, count, count]);
    });

    let data = google.visualization.arrayToDataTable(dataArray);

    let options = {
        backgroundColor: 'transparent',
        legend: 'none',
        colors: ['#E50914'],
        chartArea: { left: 180, width: '65%' }
    };

    let chart = new google.visualization.BarChart(
        document.getElementById('genrechart')
    );

    chart.draw(data, options);

    // Insight dinámico
    let insight = document.getElementById("genreInsight");

    if (sorted.length > 0) {
        let topGenre = sorted[0][0];
        insight.innerHTML = `El género <span class="highlight">${topGenre}</span> lidera el catálogo.`;
    }
}

// =========================
// EVENTOS
// =========================
document.getElementById("topN").addEventListener("change", drawCountryChart);
document.getElementById("typeFilter").addEventListener("change", drawGenreChart);