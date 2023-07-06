// default imports
import React, {useEffect, useState, Suspense } from 'react'
import {View,Text, Dimensions,TouchableWithoutFeedback} from 'react-native';
// standard graph stuff
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
// custom shape stuff
import Svg, {Circle,Ellipse,G,TSpan,TextPath,Path,Polygon,Polyline,Line,Rect,Use,Image,Symbol,Defs,LinearGradient,RadialGradient,Stop,ClipPath,Pattern,Mask,} from 'react-native-svg';
// Table stuff
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
// Global Variables
import GLOBAL from "../global.js";
import AsyncCode from '../../components/asyncStorage.js';
import AwesomeAlert from 'react-native-awesome-alerts';

let dark="#343434";
let light="#71d193";
let mid="#4ea66d";
let darkGreen="#357a4d";
let pink="#c740d6";
let red="#d64040";
let yellow="#d6b640";
let green="#4ea66d";
let blue="#438ab0";
let teal="#43b0a9";
let indigo="#6243b0";
let colorArray=[red,yellow,blue];

export default class Flowers extends React.Component {

  // State of the class, data stored in here
  constructor(props) {
    super(props);
    this.state = {
      showAlert: false,
      alertTitle: "",
      alertMessage: "",
      isLoading: true,
      tooBig: false,
      buttonNames: [],
      numberOfDays: 0,
      endDate: new Date("2017-04-01"),
      title: "Whatever you want",
      graphData: [],
      tableHead: [' Column 1', ' Column 2',],
      tableData: [
      ['row 1', 'row 1',],
      ['row 2', 'row 2',],
      ],
    }
  }

  descriptionList=[];

  toBig=false;
  // when passed in json changes, this is called
  // updates the state for the graph
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
  updateData(){
    this.setState({
      isLoading:true,
    });
  }

  //Changes TableData for BarGraph
  ChangeTableData = (tempData) => {
    let tableDataClone=[];
    for (let i =0; i<this.descriptionList.length;i++){
      let date= this.descriptionList[i].buttonName + "\n" +this.descriptionList[i].data.replace('T', '\n');
      let temp= [date, this.descriptionList[i].Description];
      tableDataClone.push(temp);
    }
    return tableDataClone;
  }

  DataProcessing = (key) => {
    let graph = AsyncCode.getGraph(key);
    let dataArray = graph.NewData;

    this.quickSort(dataArray, 0, (dataArray.length - 1));
    let index = Math.max(dataArray.length - 250, 0);

    let TempDates = [];
    for (let i = index; i < dataArray.length; i++) {
      TempDates.push(dataArray[i].Date.toDateString());
    }

    let dates = [...new Set(TempDates)];
    let currDay = dates[0];
    let dayEntries = [];
    let allDays = [];

    for (let i = index; i < dataArray.length; i++) {
      if (currDay != dataArray[i].Date.toDateString()) {
        allDays.push({Date: currDay, Data: dayEntries});
        dayEntries = [];
        currDay = dataArray[i].Date.toDateString();
      }
      dayEntries.push(dataArray[i]);
    }
    allDays.push({Date: currDay, Data: dayEntries});
    
    this.setState({
      isLoading: false,
      graphData: allDays,
      buttonNames: graph.TempButtons,
      // tableData:newTableData,
      title: graph.Title,
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

  onDayPressed = (day) => {
    // for (let i = 0; i < dates.length; i++) {
    //   let count = 0;
    //   for (let j = 0; j < TempDates.length; j++) {
    //     if (TempDates[j] === dates[i]) {
    //       count++;
    //     }
    //   }
    //   dateTotals.push(count);
    // }

    // let buttons = [];
    // for (let i = 0; i < day.Data.length; i++) {
    //   buttons.push(day.Data[i].ButtonID);
    // }

    let description = "";
    for (let i = 0; i < this.state.buttonNames; i++) {
      description += `\n${this.state.buttonNames[i]}: ${day.Data.filter((entry) => (entry.ButtonID === i)).length}`;
    }
    
    this.setState({
      showAlert: true,
      alertTitle: day.Date,
      alertMessage: description,
    });
  }

  render() {
    return (
      <View style={this.props.styles.container}>
        {this.toBig ? (<Text style={this.props.styles.subheader}> Data Limit Exceeded, Some Data Will Be Omitted. </Text>): null }
        <View style={this.props.styles.border}>
          <GetFlowers data={this.state.graphData} pressHandler={this.onDayPressed}></GetFlowers>
        </View>
        <Text style={this.props.styles.regularText}> Press on the flowers to see more information </Text>
        
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

function GetFlowers({data, pressHandler}) {
  let flowers = [];
  let stems = [];
  let width = Dimensions.get("window").width*.75;
  let height = (data.length + 1) * (width / 3);
  let radius = width / 6;

  let whichSide = -1;
  let strokeWidth = 10;

  for (let i = 0; i < data.length; i++) {
    stems.push(<Line x1={width / 2} y1={((width / 3) * (i + 2))} x2={(width * (whichSide + 2)) / 4} y2={((width / 3) * (i + 1))} strokeWidth={strokeWidth} stroke={darkGreen} strokeLinecap={"round"} key={i} />);
    flowers.push(<Flower data={data[i]} centerX={(width * (whichSide + 2)) / 4} centerY={((width / 3) * (i + 1))} radius={radius} pressHandler={pressHandler}/>);
    whichSide *= -1;
  }

  return(
    <View>
      <Svg height={height} width={width} key={"Flowers"}>
        <Line x1={width / 2} y1={((width / 3) * 2)} x2={width / 2} y2={height} strokeWidth={strokeWidth} stroke={darkGreen} strokeLinecap={"round"}/>
        {stems}
        {flowers}
      </Svg>
    </View>
  )
}

function Flower({data, centerX, centerY, radius, pressHandler}) {
  let petals = [];
  let strokeWidth = Math.max(1.5, Math.min(90 / (data.Data.length + 1), 20));
  
  for (let i = 0; i < data.Data.length; i++) {
    let angle = i * ((2 * Math.PI) / data.Data.length);
    
    let petalX = Math.sin(angle) * radius;
    let petalY = Math.cos(angle) * radius;
    
    petals.push(<Line x1={centerX} y1={centerY} x2={centerX + petalX} y2={centerY - petalY} strokeWidth={strokeWidth} stroke={colorArray[data.Data[i].ButtonID]}/>);
  }

  return(
    <View>
      {petals}
      <Circle cx={centerX} cy={centerY} r={radius / 3} fill={dark} onPress={() => pressHandler(data)}/>
    </View>
  )
}