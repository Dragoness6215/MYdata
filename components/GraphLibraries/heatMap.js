import React from 'react'
import { View, Text, Dimensions } from 'react-native';
import { ContributionGraph } from "react-native-chart-kit";
import AwesomeAlert from 'react-native-awesome-alerts';

let backgroundColor="#faf5ef";

const chartConfig = {
  backgroundColor: backgroundColor,
  backgroundGradientFrom: backgroundColor,
  backgroundGradientTo: backgroundColor,
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(52, 52, 52, ${opacity})`,
};

export default class HeatMap extends React.Component {
  //State of the class, data stored in here
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showAlert: false,
      alertTitle: "",
      alertMessage: "",
      graphData: [],
      numberOfDays: 0,
      endDate: new Date(),
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

    let dates = [];
    let dayData = [];
    for (let i = 0; i < dataArray.length; i++) {
      if (!dates.includes(dataArray[i].Date.toLocaleDateString())) {
        dates.push(dataArray[i].Date.toLocaleDateString());
      }
    }

    //For each day, filter out the entries for that day
    for (let i = 0; i < dates.length; i++) {
      dayCount = dataArray.filter((entry) => (entry.Date.toLocaleDateString() == dates[i])).length;
      dayData.push({date: new Date(dates[i]), count: dayCount})
    }

    let startDate = new Date(dates[0]);
    let endDate = new Date();
    let dayCount = Math.ceil((endDate - startDate) / 86400000);
    
    this.setState({
      isLoading: false,
      graphData: dayData,
      numberOfDays: dayCount,
      endDate: endDate,
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

  //Displays additional info when user interacts with graph
  pressHandler = (day) => {
    let title = day.date.toLocaleDateString();
    let message = `Total Inputs: ${day.count}`;

    this.setState({
      showAlert:true,
      alertTitle: title,
      alertMessage: message,
    })
  }

  render() {
    return (
      <View style={this.props.styles.container}>
        <View style={this.props.styles.border}>
          {(this.state.graphData.length < 1) ? <Text style={this.props.styles.regularText}/>:
            <ContributionGraph
              endDate={this.state.endDate}
              numDays={this.state.numberOfDays}
              values={this.state.graphData}
              width={Dimensions.get("window").width * .75}
              height={(Math.ceil(this.state.numberOfDays / 7 + 2) * (Dimensions.get("window").width * .075))}
              onDayPress={(day)=>this.pressHandler(day)}
              squareSize={Dimensions.get("window").width * .075}
              horizontal={false}
              chartConfig={chartConfig}
            />
          }
        </View>
        <Text style={this.props.styles.regularText}> Tap the boxes to see more information </Text>

        <AwesomeAlert
          show={this.state.showAlert}
          title={this.state.alertTitle}
          message= {this.state.alertMessage}
          titleStyle={this.props.styles.alertText}
          messageStyle={this.props.styles.alertBody}
          contentContainerStyle={this.props.styles.alert}
          onDismiss={() => { this.setState({showAlert:false}); }}
        />
      </View>
    );
  }
}