// default imports
import React, {useEffect, useState, Suspense } from 'react'
import {View,Text, Dimensions,TouchableWithoutFeedback} from 'react-native';
// React-Native-Chart-Kit import; simple graphs
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
// React-Native-Svg import
import Svg, {Circle,Ellipse,G,TSpan,TextPath,Path,Polygon,Polyline,Line,Rect,Use,Image,Symbol,Defs,LinearGradient,RadialGradient,Stop,ClipPath,Pattern,Mask,} from 'react-native-svg';
// Table stuff
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
// Global Variables
import GLOBAL from "../global.js";

// all colors
let backgroundColor="#faf5ef";
let highlight="#63ba83";
let midtone = "#4ea66d";
let dark="#343434";
let warning = "#E07A5F";
let pink="#c740d6";
let red="#d64040";
let yellow="#d6b640";
let green="#4ea66d";
let blue="#438ab0";
let teal="#43b0a9";
let indigo="#6243b0";

let colorArray = [red, blue, yellow];


export default class Dandelion extends React.Component {

  // State of the class, data stored in here
  // @param: props, the props passed in from the the parent class
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      numberOfDays:0,
      endDate:new Date("2017-04-01"),
      title:"Whatever you want",
      graphData: [],
      dateList: [],
      dateListTotals: [],
      tableHead: [' Column 1', ' Column 2',],
      tableData: [['row 1', 'row 1'], ['row 2', 'row 2']]
    }
  }

  // used to check if props have updated
  previousProps;
  // if you integrate data point descriptions, you may use this to store the descriptionData
  descriptionList=[];

  // When the passed in value changes, this is called
  // Updates the state for the graph
  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props || this.state.isLoading) {
      let tempGraphData=this.DataProcessing(this.props.rawData);
      let newTableData=this.ChangeTableData(tempGraphData);
      this.setState({
        isLoading:false,
        graphData:tempGraphData,
        tableData:newTableData,
        title:this.props.rawData.Title,
      });
      this.previousProps=this.props;
    }
  }

  // This is Called on load
  // Updates the state for the graph
  componentDidMount(){
    let tempGraphData=this.DataProcessing(GLOBAL.ITEM);
    let newTableData=this.ChangeTableData(tempGraphData);
    this.setState({
      isLoading:false,
      graphData:tempGraphData,
      tableData:newTableData,
      title:GLOBAL.ITEM.Title,
    });
  }

  // This is used to manually reload the state
  updateData(){
      this.setState({
        isLoading:true,
      });
  }

  reformatDate = (rawJson, i, j) => {
    let tempJson = {};
    let date = new Date(rawJson.data[j].Year, rawJson.data[j].Month+1, rawJson.data[j].Day, rawJson.data[j].Hour, rawJson.data[j].Minutes, rawJson.data[j].Seconds, rawJson.data[j].Milliseconds);
    tempJson.data = date;
    tempJson.button = i;
    tempJson.buttonName = rawJson.ButtonName;
    return tempJson;
  }

  // processes the data 
  DataProcessing = (rawJson) => {
    //TODO: Write code to parse the data
    let dataArray = rawJson.Data;
    let allData = [];
    for(let i = 0 ; i < dataArray.length;i++){
      for(let j = 0; j < dataArray[i].data.length;j++){
        allData.push(this.reformatDate(dataArray[i],i,j));
      }
    };

    if (allData.length > 0) {
      this.quickSort(allData, 0, (allData.length - 1));
    }

    let TempDates = [];
    for (let i = 0; i < allData.length; i++) {
      TempDates.push(allData[i].data.toDateString());
    }

    let dates = [...new Set(TempDates.map((date) => date))];
    let dateTotals = [];

    for (let i = 0; i < dates.length; i++) {
      let count = 0;
      for (let j = 0; j < TempDates.length; j++) {
        if (TempDates[j] === dates[i]) {
          count++;
        }
      }
      dateTotals.push(count);
    }

    this.setState({
      dateList:dates,
      dateListTotals:dateTotals,
    });

    return allData;
  }

  // Changes TableData for BarGraph
  // tempData by default is the parsed data from DataProcessing
  ChangeTableData = (tempData) => {
    let tableDataClone=[];
    // TODO: write the code to return the table's data
    return tableDataClone;
  }

  swap=(arr,xp, yp)=>{
    var temp = arr[xp];
    arr[xp] = arr[yp];
    arr[yp] = temp;
  }

  partition = (arr, low, high) => {
    let pivot = arr[high];
    let i = (low - 1);

    for (let j = low; j <= high - 1; j++) {
      if (arr[j].data < pivot.data) {
        i++;
        this.swap(arr, i, j);
      }
    }
    this.swap(arr, i + 1, high);
    return (i + 1);
  }

  quickSort = (arr, low, high) => {
    if (low < high) {
      let pi = this.partition(arr, low, high);
      this.quickSort(arr, low, pi - 1);
      this.quickSort(arr, pi + 1, high);
    }
  }

  render() {
    return (
      <View style={this.props.styles.container}>
        <View style={this.props.styles.border}>
          <GetDandelion 
            data={this.state.graphData} 
            dateList={this.state.dateList} 
            dateTotals={this.state.dateListTotals}
            colors={colorArray}
            styles={this.props.styles}>
          </GetDandelion>
        </View>
      </View>
    );
  }
}

function GetDandelion({data, dateList, dateTotals, colors, styles}) {
  let days = [];
  let spokes = [];
  let entries = [];
  let width = Dimensions.get("window").width*.75;
  let height = width;

  let dateLocations = [];

  let circleX = width/2;
  let circleY = height/2;

  let radiusInner = width * .1;
  let radiusOuter = width * .45;

  let prev = -1;
  for (let i = 0; i < dateList.length; i++) {
    let min = prev + 1;
    let max = prev + dateTotals[i];

    let minAngle = min * ((2 * Math.PI) / data.length);
    let maxAngle = max * ((2 * Math.PI) / data.length);
    let finalAngle = ((maxAngle - minAngle) / 2) + minAngle;

    let dayX = (Math.sin(finalAngle) * radiusInner) + circleX;
    let dayY = (Math.cos(finalAngle) * radiusInner) + circleY;

    dateLocations.push([dayX, dayY]);
    days.push(<Circle cx={dayX} cy={dayY} r={width*0.02} fill={dark}/>)

    prev = max;
  }


  for (let i = 0; i < data.length; i++) {
    let angle = i * ((2 * Math.PI) / data.length);
    let dataX = (Math.sin(angle) * radiusOuter) + circleX;
    let dataY = (Math.cos(angle) * radiusOuter) + circleY;

    entries.push(<Circle cx={dataX} cy={dataY} r={width*0.01} fill={colors[data[i].button]}/>);

    const dateMatch = (element) => element === date;
    let date = data[i].data.toDateString();
    let index = dateList.findIndex(dateMatch)
    let dateCoordinates = dateLocations[index];
    let dayX = dateCoordinates[0];
    let dayY = dateCoordinates[1];

    spokes.push(<Line x1={dataX} y1={dataY} x2={dayX} y2={dayY} strokeWidth={1.5} stroke={colors[data[i].button]}/>);
  }

  return (
    <View>
      <Svg height={height} width={width} key={"Dandelion"}>
        <Circle cx={circleX} cy={circleY} r={width*.04} fill={dark}/>
        {entries}
        {spokes}
        {days}
      </Svg>
    </View>
  );
}