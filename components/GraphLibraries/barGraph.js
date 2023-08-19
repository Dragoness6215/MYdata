import React from 'react'
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from "react-native-chart-kit";

let backgroundColor="#faf5ef";
let highlight="#63ba83";
let midtone = "#4ea66d";
let dark="#343434";
let warning = "#E07A5F";

const chartConfig = {
  backgroundGradientFrom: backgroundColor,
  backgroundGradientFromOpacity: midtone,
  backgroundGradientTo: backgroundColor,
  color: (opacity = 1) => `rgba(52, 52, 52, ${opacity})`,
  strokeWidth: 10,
  decimalPlaces: 0,
  barPercentage:1,
  style: { borderRadius: 16 },
}

export default class BarGraph extends React.Component {
  //State of the class, data stored in here
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      graphData: { labels: [], datasets: [ { data: [] } ] }
    }
  }

  //Called on load
  componentDidMount() {
    this.DataProcessing(this.props.rawData);
  }

  //Called when the data changes and updates the state for the graph
  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props || this.state.isLoading) {
      this.DataProcessing(this.props.rawData);
    }
  }

  //Processes the incoming data as needed for the graph
  DataProcessing = (graph) => {
    let dataArray = graph.Data;
    this.quickSort(dataArray, 0, (dataArray.length - 1));

    let dataLabels = [];
    let dataCounts = [];
    for (let i = 0; i < graph.Buttons.length; i++) {
      dataLabels.push(graph.Buttons[i].ButtonName);
      dataCounts.push(0);
    }

    for (let i = 0; i < dataArray.length; i++) {
      dataCounts[dataArray[i].ButtonID]++;
    }
    
    this.setState({
      isLoading: false,
      graphData: { labels: dataLabels, datasets:[ { data: dataCounts } ] },
    });
  }

  // Algorithim Implementation modified from : https://www.geeksforgeeks.org/quick-sort/ 
  quickSort = (arr, low, high) => {
    if (low < high) {
      let pi = this.partition(arr, low, high);
      this.quickSort(arr, low, pi - 1);
      this.quickSort(arr, pi + 1, high);
    }
  }

  partition = (arr, low, high) => {
    let pivot = arr[high];
    let i = (low - 1);

    for (let j = low; j <= high - 1; j++) {
      if (arr[j].Date < pivot.Date) {
        i++;
        this.swap(arr, i, j);
      }
    }
    this.swap(arr, i + 1, high);
    return (i + 1);
  }
  
  swap=(arr,xp, yp)=>{
    var temp = arr[xp];
    arr[xp] = arr[yp];
    arr[yp] = temp;
  }

  render() {
    return (
      <View style={this.props.styles.container}>
        <View style={this.props.styles.border}>
          <BarChart
            data={this.state.graphData}
            width={Dimensions.get("window").width * .75}
            height={Dimensions.get("window").height * .4}
            fromZero={true}
            chartConfig={chartConfig}
          />
        </View>
      </View>
    );
  }
}