console.log("🚀 VERSION FINAL 10/10");

let netflixData = [];

// ================= KPI =================
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

// ================= LOAD CSV =================
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

// ================= INIT =================
function init() {
    drawKPIs();
    drawPieChart();
    drawLineChart();
    drawCountryChart();
    drawGenreChart();
}

// ================= KPI =================
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

// ================= PIE =================
function drawPieChart() {

    let movies = 0;
    let series = 0;

    netflixData.forEach(item => {
        if (item.type === "Movie") movies++;
        if (item.type === "TV Show") series++;
    });

    const data = google.visualization.arrayToDataTable([
        ['Tipo', 'Cantidad'],
        ['Películas', movies],
        ['Series', series]
    ]);

    const options = {
        pieHole: 0.55,
        colors: ['#E50914', '#9e9e9e'],
        backgroundColor: 'transparent',
        chartArea: { width: '80%', height: '80%' },
        legend: { textStyle: { color: '#fff' } },
        pieSliceText: 'percentage'
    };

    new google.visualization.PieChart(
        document.getElementById('piechart')
    ).draw(data, options);
}

// ================= LINE =================
function drawLineChart() {

    let years = {};

    netflixData.forEach(item => {
        let y = Number(item.release_year);
        if (!y || y < 2000) return;

        if (!years[y]) years[y] = { m: 0, s: 0 };

        if (item.type === "Movie") years[y].m++;
        if (item.type === "TV Show") years[y].s++;
    });

    const dataArray = [
        ['Año', 'Películas', 'Series', { role: 'tooltip', p: { html: true } }]
    ];

    Object.keys(years).sort((a, b) => a - b).forEach(y => {

        const m = years[y].m;
        const s = years[y].s;

        dataArray.push([
            Number(y),
            m,
            s,
            `<div style="padding:8px;color:black">
                <b>${y}</b><br>
                🎬 ${m.toLocaleString()}<br>
                📺 ${s.toLocaleString()}
            </div>`
        ]);
    });

    const data = google.visualization.arrayToDataTable(dataArray);

    const options = {
        backgroundColor: 'transparent',
        colors: ['#E50914', '#bbbbbb'],
        chartArea: { width: '80%', height: '70%' },
        hAxis: { textStyle: { color: '#fff' } },
        vAxis: { textStyle: { color: '#fff' }, format: 'short' },
        tooltip: { isHtml: true },
        legend: { textStyle: { color: '#fff' } }
    };

    new google.visualization.LineChart(
        document.getElementById('linechart')
    ).draw(data, options);
}

// ================= COUNTRIES =================
function drawCountryChart() {

    let topN = parseInt(document.getElementById("topN").value);
    let countryCount = {};

    netflixData.forEach(item => {
        if (!item.country) return;

        item.country.split(",").forEach(country => {
            let c = country.trim();
            if (!c) return;
            countryCount[c] = (countryCount[c] || 0) + 1;
        });
    });

    let sortedCountries = Object.entries(countryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    const colorsGradient = [
        '#ff4d4d','#ff1a1a','#E50914','#b20710',
        '#800000','#660000','#4d0000','#330000'
    ];

    let dataArray = [['País', 'Cantidad', { role: 'style' }]];

    sortedCountries.forEach(([country, count], index) => {
        dataArray.push([country, count, colorsGradient[index] || '#E50914']);
    });

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor: 'transparent',
        legend: 'none',
        chartArea: { left: 130, width: '65%', height: '70%' },
        hAxis: { textStyle: { color: 'white' }, gridlines: { color: '#333' } },
        vAxis: { textStyle: { color: 'white' } },
        bars: 'horizontal'
    };

    new google.visualization.BarChart(
        document.getElementById('countrychart')
    ).draw(data, options);
}

// ================= GENRES =================
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

    let dataArray = [['Género', 'Cantidad']];

    sorted.forEach(([g, v]) => {
        dataArray.push([g, v]);
    });

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        backgroundColor: 'transparent',
        legend: 'none',

        chartArea: { width: '70%', height: '65%' },

        // 🔥 COLOR NETFLIX (YA NO VERDE)
        colors: ['#E50914'],

        hAxis: {
            textStyle: { color: '#fff', fontSize: 10 },
            slantedText: true,
            slantedTextAngle: 30
        },

        vAxis: {
            textStyle: { color: '#ccc' }
        }
    };

    new google.visualization.ColumnChart(
        document.getElementById('genrechart')
    ).draw(data, options);

    // 🔥 INSIGHT DINÁMICO RESTAURADO
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
// ================= EVENTS =================
document.getElementById("typeFilter").addEventListener("change", drawGenreChart);
document.getElementById("topN").addEventListener("change", drawCountryChart);