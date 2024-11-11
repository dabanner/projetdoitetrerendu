async function parallelCoordinate() {
    const data = await loadParallelSetData(50);
    console.log(data);
    if (data.length > 0) {
      displayParallelCoordinateChart(data);
    } else {
      console.log('No data available to display');
    }
  }
  
  parallelCoordinate();