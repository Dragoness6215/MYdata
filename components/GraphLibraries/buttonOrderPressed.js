// default imports
import React, {useEffect, useState, Suspense } from 'react'
import {View,Text, FlatList, Dimensions,TouchableWithoutFeedback,Modal} from 'react-native';
// standard graph stuff
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
// custom shape stuff
import Svg, {Circle,Ellipse,G,TSpan,TextPath,Path,Polygon,Polyline,Line,Rect,Use,Image,Symbol,Defs,LinearGradient,RadialGradient,Stop,ClipPath,Pattern,Mask,} from 'react-native-svg';
// Table stuff
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
// Stylization, use styles.NAME
import AwesomeAlert from 'react-native-awesome-alerts';
// Global Variables
import GLOBAL from "../global.js";
import { sin } from 'react-native/Libraries/Animated/Easing.js';
import { runInThisContext } from 'vm';

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

let colorArray=[red,yellow,blue];

export default class ButtonOrder extends React.Component {

  // State of the class, data stored in here
  constructor(props) {
    super(props);
    this.state = {
      showAlert:false,
      alertTitle:"",
      alertMessage:"",
      isLoading: true,
      numberOfDays:0,
      endDate:new Date("2017-04-01"),
      title:"Whatever you want",
      graphData: [],
      tableHead: [' Button', ' Description',],
      tableData: [
      ['row 1', 'row 1',],
      ['row 2', 'row 2',],
      ],
    }
  }

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
  updateData() {
      this.setState({
        isLoading:true,
      });
  }

  //Changes TableData for BarGraph
  ChangeTableData = (tempData) => {
    let tableDataClone = [];
    for (let i = 0; i < this.descriptionList.length; i++){
      let date = this.descriptionList[i].buttonName + "\n" + this.descriptionList[i].data.replace('T', '\n');
      let temp = [date, this.descriptionList[i].Description];
      tableDataClone.push(temp);
    }
    return tableDataClone;
  }

  descriptionList=[];

  DataProcessing = (graph) => {
    let dataArray = graph.NewData;

    this.quickSort(dataArray, 0, (dataArray.length - 1));

    this.setState({
      isLoading: false,
      graphData: dataArray,
      // tableData:newTableData,
      title: graph.Title,
    });

    // this.descriptionList=[];
    // for(let i = 0 ; i < dataArray.length;i++){
    //   for(let j=0; j<dataArray[i].data.length;j++){
    //     singleArray.push(this.reformatToCorrect(dataArray[i],i,j));
    //     if(dataArray[i].data[j].Description!=undefined){
    //       let temp=(this.reformatToCorrect(dataArray[i],i,j));
    //       temp.Description=dataArray[i].data[j].Description;
    //       this.descriptionList.push(temp);
    //     }
    //   }
    // };
    // this.quickSort(singleArray,0,(singleArray.length-1));
  } 
 
  // Algorithim Implementation modified from : https://www.geeksforgeeks.org/quick-sort/ 
  swap=(arr,xp, yp)=>{
    var temp = arr[xp];
    arr[xp] = arr[yp];
    arr[yp] = temp;
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

  quickSort = (arr, low, high) => {
    if (low < high) {
      let pi = this.partition(arr, low, high);
      this.quickSort(arr, low, pi - 1);
      this.quickSort(arr, pi + 1, high);
    }
  }

  onDotPressed = (item) => {
    let description = "Date: " + item.Date.toDateString() + "\nTime: " + item.Date.toTimeString();
    let button = this.props.rawData.TempButtons[item.ButtonID].ButtonName;
    // for(let i =0; i<this.descriptionList.length;i++){
    //   if(item.data==this.descriptionList[i].data){
    //     this.description+="\n Description: "+this.descriptionList[i].Description;
    //   }
    // }
    this.setState({
      showAlert: true,
      alertTitle: button,
      alertMessage: description,
    });
  }

  render() {
    return (
      <View>
        <View style={this.props.styles.container}>
          <View style={this.props.styles.border}>
            <GetDots data={this.state.graphData} onDotPressed={this.onDotPressed}/>
          </View>
          <Text style={this.props.styles.regularText}> Tap an entry for more info </Text>
          {/*
          <Table borderStyle={{borderWidth: 2, borderColor:{dark}}}>
            <Row data={this.state.tableHead} style={this.props.styles.tableHead} textStyle={this.props.styles.tableHead}/>
            <Rows data={this.state.tableData} textStyle={this.props.styles.tableText}/>
          </Table>
          */}
        </View>
        
        <AwesomeAlert
          show={this.state.showAlert}
          title={this.state.alertTitle}
          message= {this.state.alertMessage}
          contentContainerStyle={this.props.styles.alert}
          messageStyle={this.props.styles.alertBody}
          titleStyle={this.props.styles.alertText}
          onDismiss={() => { this.setState({showAlert:false}); }}
        />
      </View>
    );
  }
}

function GetDots ({data, onDotPressed}) {
  let dots = [];
  let width = Dimensions.get("window").width * .75;
  let height = Math.ceil(data.length / 5)*(width / 5);
  
  let radius = width/10;
  let currentX = radius;
  let currentY = radius;
  for(let i = 0; i < data.length; i++){
    dots.push(<Circle key={i} cx={currentX} cy={currentY} r={radius} onPress={()=>onDotPressed(data[i])} fill={colorArray[data[i].ButtonID]}/>);
    currentX += radius * 2;
    if(currentX > width){
      currentX = radius;
      currentY += radius*2;
    }
  }
  return(
    <Svg width={width} height={height}>
      {dots}
    </Svg>
  )
} 