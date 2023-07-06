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
      graphData: { // data object for the graph
        labels: [0,1,2],
        datasets: [ { data: [0,1,2] } ],
      },
      tableHead: [' Button and Time', ' Description',],
      tableData: [ [] ],
    }
  }

  previousProps;
  // when passed in json changes, this is called
  //updates the state for the graph
  componentDidUpdate(prevProps, prevState) {
    if (this.previousProps != this.props || this.state.isLoading) {
      console.log("Updating Graph");
      let tempGraphData=this.DataProcessing(this.props.rawData);
      this.setState({
        graphData:this.ChangeGraphData(tempGraphData),
        tableData:this.ChangeTableData(tempGraphData),
        title:this.props.rawData.Title,
        isLoading:false
      });
      this.previousProps=this.props;
    }
  }

  componentDidMount(){
    let tempGraphData=this.DataProcessing(GLOBAL.ITEM);
      this.setState({
        graphData:this.ChangeGraphData(tempGraphData),
        tableData:this.ChangeTableData(tempGraphData),
        title:GLOBAL.ITEM.Title,
        isLoading:false
      });
  }

  updateData(){
    this.setState({
      isLoading:true,
    });
  }

  // Change GraphData for BarGraph
  ChangeGraphData = (tempData) => {
    //get current state data
    const dataClone = {...this.state.graphData}
    //get parent's passed value
    const values = tempData;
    //copy it over!
    dataClone.datasets[0].data = values.data.datasets;
    dataClone.labels=values.data.labels;
    return dataClone;
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

  DataProcessing = (rawJson) =>{
      let parsedJson={
          data:{
              title:"",
              labels:[],
              datasets:[
                  {
                      data:[],
                  }
              ]
          }
      };
      //inputing the data into datasets
      let dataArray = rawJson.Data;
      let totalStuff=[];
      let totalLabels=[];
      let descriptions=[];
      for(let i = 0 ; i < dataArray.length;i++){
        let temp1=dataArray[i].data;
        totalStuff[i]=temp1.length;
        totalLabels[i]=dataArray[i].ButtonName;
        for(let j =0; j<dataArray[i].data.length;j++){
          if(dataArray[i].data[j].Description!=undefined){
            //console.log(dataArray[i].data[j].Description);
            let temp=dataArray[i].data[j];
            temp.ButtonName=dataArray[i].ButtonName;
            descriptions.push(temp);
          }
        }
      }
      //console.log(descriptions);
      parsedJson.data.labels=totalLabels;
      parsedJson.data.datasets=totalStuff;
      parsedJson.data.title=rawJson.Title;
      parsedJson.data.descriptions=descriptions;
      return parsedJson;
  }

  render() {
    const state = this.state;
      // since we're now referencing this.state.data, its value 
      // will be updated directly when we update the state
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