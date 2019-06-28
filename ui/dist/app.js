window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

var color = Chart.helpers.color;

var config = {
    type: 'line',
    data: {
        datasets: []
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Temperature time series'
        },
        scales: {
            xAxes: [{
                type: 'time',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Date'
                },
                ticks: {
                    major: {
                        fontStyle: 'bold',
                        fontColor: '#FF0000'
                    }
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'value'
                }
            }]
        }
    }
};
 

function showElement(elementId) {
  document.getElementById(elementId).style.display = 'flex';
}

function hideElement(elementId) {
  document.getElementById(elementId).style.display = 'none';
}

function ajax(url, method, payload, successCallback) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4 || xhr.status != 200) return;
    successCallback(xhr.responseText);
  };
  xhr.send(JSON.stringify(payload));
}

function newDateString(epoch) {
    return moment(epoch).format();
}


const diffObj = (newObj, oldObj) => {
    return newObj.filter( ne => {
        let res;
        oldObj.forEach( oe => {
            if (ne.x === oe.x) {
	        res = false;
	    } else {
		res = true;
	    }
	});
	return res;
    });
}



const generateDataSet = (apiDataFormat) => {
    const label = apiDataFormat[0].deviceId;
    const borderColor = Object.values(window.chartColors)[config.data.datasets.length];
    const backgroundColor = color(borderColor).alpha(0.5).rgbString();
    const data = apiDataFormat.map( point => ({
        x: newDateString(point.timestamp),
        y: point.temperature,
    }));

    const dataset = {
        label,
        backgroundColor,
        borderColor,
        fill: false,
        data,
    };
    return dataset;
}

const updateDataPoints = (response) => {
    const parsedResponse = JSON.parse(response);
    
    config.data.datasets = [];
    Object.values(parsedResponse).forEach( serie => {
        const t = generateDataSet(serie);
	config.data.datasets.push(t);
    });
    window.myLine.update();
};

const onFetchTempSuccess = (response) => {
    const parsedResponse = JSON.parse(response);

    Object.values(parsedResponse).forEach( (serie, index) => {
        const t = generateDataSet(serie);
	t.id = index;
        config.data.datasets.push(t);
    });

    const ctx = document.getElementById('temperature').getContext('2d');
    window.myLine = new Chart(ctx, config);
    hideElement('loader');
    showElement('temperature');    
    //showElement('battery');
    setInterval(() => {
        ajax('https://r0mmu0hpcl.execute-api.eu-west-1.amazonaws.com/dev/data', 'GET', {}, updateDataPoints);
    }, 5000);
}

window.onload = function() {
    showElement('loader');
    hideElement('temperature');
    //hideElement('battery');
    ajax('https://r0mmu0hpcl.execute-api.eu-west-1.amazonaws.com/dev/data', 'GET', {}, onFetchTempSuccess);
};
