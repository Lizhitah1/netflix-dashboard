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
    //drawLineChart();
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
// 6. GRÁFICO 3 (AQUÍ 👇)
function drawCountryChart() {

    var topN = document.getElementById("topN").value;

    var allData = [
        ['País', 'Cantidad'],
        ['Estados Unidos', 3000],
        ['India', 1000],
        ['Reino Unido', 800],
        ['Canadá', 600],
        ['Japón', 500],
        ['España', 400],
        ['Corea del Sur', 350],
        ['Francia', 300],
        ['México', 250],
        ['Alemania', 200]
    ];

    var dataFiltered = [allData[0]].concat(allData.slice(1, parseInt(topN) + 1));

    var data = google.visualization.arrayToDataTable(dataFiltered);

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