import React, {useEffect, useState, Suspense } from 'react'
import {View,Text, Dimensions,TouchableWithoutFeedback} from 'react-native';
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import GLOBAL from "../global.js";
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

  // when passed in json changes, this is called
  //updates the state for the graph
  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props || this.state.isLoading) {
      this.DataProcessing(this.props.rawData);
    }
  }

  // called on load
  componentDidMount() {
    this.DataProcessing(this.props.rawData);
  }

  updateData() {
    this.setState({ isLoading:true });
  }

  // treats all buttons as the same
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

  onPress = (day) => {
    let title = day.date.toLocaleDateString();
    let message = `There were ${day.count} presses on ${day.date.toLocaleDateString()}`;

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
              onDayPress={(day)=>this.onPress(day)}
              squareSize={Dimensions.get("window").width * .075}
              horizontal={false}
              chartConfig={chartConfig}
            />
          }
        </View>
        <Text style={this.props.styles.regularText}> Click on each day to see more information </Text>

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