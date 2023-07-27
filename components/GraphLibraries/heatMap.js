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
      tableHead: [],
      tableData: [],
    }
  }

  // when passed in json changes, this is called
  //updates the state for the graph
  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props || this.state.isLoading) {
      this.DataProcessing(this.props.rawData);
      // let newTableData=this.ChangeTableData(tempGraphData);
    }
  }

  // called on load
  componentDidMount() {
    this.DataProcessing(this.props.rawData);
    // let newTableData=this.ChangeTableData(tempGraphData);
  }

  updateData() {
    this.setState({ isLoading:true });
  }

  //Changes TableData for BarGraph
  ChangeTableData = (tempData) => {
        let tableDataClone=[];
        for(let i = 0 ; i< this.descriptionList.length;i++){
          let temp=[];
          temp.push(this.descriptionList[i][0]);
          temp.push(this.descriptionList[i][1]);
          tableDataClone.push(temp);
        }
        return tableDataClone;
  }
  
  descriptionList=[];

  // treats all buttons as the same
  DataProcessing = (graph) => {
    let dataArray = graph.NewData;

    if (!dataArray.length) {
      return;
    }

    this.quickSort(dataArray, 0, (dataArray.length - 1));

    let dateCounts = [];
    let currDate = dataArray[0].Date;
    let count = 0;

    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i].Date.toDateString() == currDate.toDateString()) {
        count++;
      }

      else {
        dateCounts.push({date: currDate, count: count});
        currDate = dataArray[i].Date;
        count = 1;
      }
    }

    dateCounts.push({date: currDate, count: count});

    let startDate = new Date(dateCounts[0].date);
    let endDate = new Date();
    let totalDateCount = Math.ceil((endDate - startDate) / 86400000);
    
    this.setState({
      isLoading: false,
      graphData: dateCounts,
      numberOfDays: totalDateCount,
      endDate: endDate,
      // tableData:newTableData,
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
        {/* {this.descriptionList.length >0 ? (
        <View style={this.props.styles.container}>
          <Table borderStyle={{borderWidth: 2, borderColor:{dark}}}>
            <Row data={this.state.tableHead} style={this.props.styles.tableHead} textStyle={this.props.styles.tableHead}/>
            <Rows data={this.state.tableData} textStyle={this.props.styles.tableText}/>
          </Table>
        </View>
        ): null} */}

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