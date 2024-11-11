async function stackedArea() {
    let data = await loadStackedAreaData();
    console.log(data);
    data = accumulateAlbumsOverYears(data);
    console.log(data);
    createStackedAreaChart(data);
}

stackedArea();