console.log("🔥 VERSION FINAL 10/10");

let netflixData = [];

// =========================
// LOAD CSV
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
    let maxYear = 0;

    netflixData.forEach(item => {

        if (item.country) {
            item.country.split(",").forEach(c => {
                countries.add(c.trim());
            });
        }

        if (item.release_year) {
            maxYear = Math.max(maxYear, Number(item.release_year));
        }
    });

    animateValue("totalTitles", 0, total, 800);
    animateValue("totalCountries", 0, countries.size, 800);
    animateValue("latestYear", 0, maxYear, 800);
}

// =========================
// ANIMACIÓN
// =========================
function animateValue(id, start, end, duration) {

    let obj = document.getElementById(id);
    if (!obj) return;

    let range = end - start;
    let current = start;
    let stepTime = Math.abs(Math.floor(duration / range));

    let timer = setInterval(() => {
        current++;
        obj.innerText = current.toLocaleString();
        if (current >= end) clearInterval(timer);
    }, stepTime);
}

// =========================
// PIE
// =========================
function drawPieChart() {

    let movies = 0, series = 0;

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
        colors: ['#E50914', '#888'],
        backgroundColor: 'transparent',
        pieSliceText: 'percentage',
        chartArea: { width: '85%', height: '85%' }
    };

    new google.visualization.PieChart(
        document.getElementById('piechart')
    ).draw(data, options);
}

// =========================
// LINE (CORREGIDO PRO)
// =========================
function drawLineChart() {

    let years = {};

    netflixData.forEach(item => {

        let y = Number(item.release_year);
        if (!y || y < 2000) return; // 🔥 limpia años basura

        if (!years[y]) years[y] = { m: 0, s: 0 };

        if (item.type === "Movie") years[y].m++;
        if (item.type === "TV Show") years[y].s++;
    });

    let dataArray = [
        ['Año', 'Películas', 'Series', { role: 'tooltip', p: { html: true } }]
    ];

    Object.keys(years)
        .sort((a, b) => a - b)
        .forEach(y => {

            let m = years[y].m;
            let s = years[y].s;

            if (m === 0 && s === 0) return;

            dataArray.push([
                Number(y),
                m,
                s,
                `<b>${y}</b><br>Películas: ${m}<br>Series: ${s}`
            ]);
        });

    let data = google.visualization.arrayToDataTable(dataArray);

    let options = {
        backgroundColor: 'transparent',
        colors: ['#E50914', '#aaa'],
        chartArea: { width: '80%', height: '70%' },
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white' }, format: 'short' },
        tooltip: { isHtml: true }
    };

    new google.visualization.LineChart(
        document.getElementById('linechart')
    ).draw(data, options);
}

// =========================
// COUNTRIES (FIX LABELS)
// =========================
function drawCountryChart() {

    let topN = parseInt(document.getElementById("topN").value);

    let count = {};

    netflixData.forEach(item => {
        if (!item.country) return;

        item.country.split(",").forEach(c => {
            let country = c.trim();
            if (!country) return;
            count[country] = (count[country] || 0) + 1;
        });
    });

    let sorted = Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    let dataArray = [['País', 'Cantidad', { role: 'annotation' }]];

    sorted.reverse().forEach(([c, v]) => {
        dataArray.push([c, v, v]);
    });

    let data = google.visualization.arrayToDataTable(dataArray);

    let options = {
        backgroundColor: 'transparent',
        legend: 'none',
        colors: ['#E50914'],
        chartArea: { left: 180, width: '65%' }, // 🔥 clave labels
        hAxis: { textStyle: { color: 'white' } },
        vAxis: { textStyle: { color: 'white', fontSize: 11 } },
        annotations: { textStyle: { color: 'white' } }
    };

    new google.visualization.BarChart(
        document.getElementById('countrychart')
    ).draw(data, options);
}

// =========================
// GENRES (MEJORADO)
// =========================
function drawGenreChart() {

    let filter = document.getElementById("typeFilter").value;
    let count = {};

    netflixData.forEach(item => {

        if (!item.listed_in) return;

        if (filter === "Movie" && item.type !== "Movie") return;
        if (filter === "TV Show" && item.type !== "TV Show") return;

        item.listed_in.split(",").forEach(g => {
            let genre = g.trim();
            if (!genre) return;
            count[genre] = (count[genre] || 0) + 1;
        });
    });

    let sorted = Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);

    let dataArray = [['Género', 'Cantidad', { role: 'annotation' }]];

    sorted.forEach(([g, v]) => {
        dataArray.push([g, v, v]);
    });

    let data = google.visualization.arrayToDataTable(dataArray);

    let options = {
        backgroundColor: 'transparent',
        legend: 'none',
        colors: ['#FF2E2E'], // 🔥 diferente a countries
        chartArea: { left: 200, width: '60%' },
        vAxis: { textStyle: { color: 'white', fontSize: 11 } },
        annotations: { textStyle: { color: 'white' } }
    };

    new google.visualization.BarChart(
        document.getElementById('genrechart')
    ).draw(data, options);

    let insight = document.getElementById("genreInsight");

    if (sorted.length > 0) {
        insight.innerHTML = `El género <span class="highlight">${sorted[0][0]}</span> domina el catálogo.`;
    }
}

// =========================
// EVENTS
// =========================
document.getElementById("topN").addEventListener("change", drawCountryChart);
document.getElementById("typeFilter").addEventListener("change", drawGenreChart);