import React, {useEffect, useState, Suspense } from 'react'
import {View,Text, Dimensions,TouchableWithoutFeedback} from 'react-native';
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import styles from "../lightStyles.js";
import GLOBAL from "../global.js";

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

// returns a barGraph 
export default class BarGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      title:"Whatever you want",
      graphData: {
        labels: [],
        datasets: [ { data: [] } ],
      },
      tableHead: [' Button and Time', ' Description',],
      tableData: [ [] ],
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

  // used to manually reload the state
  updateData() {
    this.setState({ isLoading:true });
  }

  //Changes TableData for BarGraph
  ChangeTableData = (tempData) => {
    let tableDataClone=[];
    let tempString="";
    let dataPoint={};
    for(let i = 0; i<tempData.data.descriptions.length;i++){
      dataPoint = tempData.data.descriptions[i];
      tempString=dataPoint.ButtonName+"\n";
      tempString+=dataPoint.Month+"/"+dataPoint.Day+"/"+dataPoint.Year+"\n";
      tempString+=dataPoint.Hour+":"+dataPoint.Minutes;
      let row=[];
      row[0]=tempString;
      row[1]=dataPoint.Description;
      console.log(row);
      tableDataClone.push(row);
    }
    console.log(tableDataClone);
    return tableDataClone;
  }

  DataProcessing = (graph) => {
    let dataArray = graph.NewData;

    this.quickSort(dataArray, 0, (dataArray.length - 1));

    let dataLabels = [];
    let dataCounts = [];
    for (let i = 0; i < graph.TempButtons.length; i++) {
      dataLabels.push(graph.TempButtons[i].ButtonName);
      dataCounts.push(0);
    }

    for (let i = 0; i < dataArray.length; i++) {
      dataCounts[dataArray[i].ButtonID]++;
    }
    
    this.setState({
      graphData: {
        labels: dataLabels,
        datasets:[ { data: dataCounts } ]
      },
      //tableData:this.ChangeTableData(tempGraphData),
      title: graph.Title,
      isLoading: false
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

  render() {
    return (
      <View style={this.props.styles.container}>
        <View style={this.props.styles.border}>
          <BarChart
            data={this.state.graphData}
            width={Dimensions.get("window").width * .75} // from react-native
            height={Dimensions.get("window").height * .4}
            fromZero={true}
            chartConfig={chartConfig}
          />
        </View>
        {/* {this.state.tableData.length > 0 ? (
          <View style={this.props.styles.container}>
          <Table borderStyle={{borderWidth: 2, borderColor:{dark}}}>
              <Row data={this.state.tableHead} style={this.props.styles.tableHead} textStyle={this.props.styles.tableHead}/>
              <Rows data={this.state.tableData} textStyle={this.props.styles.tableText}/>
          </Table>
        </View>
        ): null} */}
      </View>
    );
  }
}