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
import AwesomeAlert from 'react-native-awesome-alerts';


export default class Triskelion extends React.Component {

  // State of the class, data stored in here
  // @param: props, the props passed in from the the parent class
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showAlert:false,
      alertTitle:"",
      alertMessage:"",
      graphData: [],
      buttonNames: [],
      tableHead: [],
      tableData: [],
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
  componentDidMount(){
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

  DataProcessing = (graph) =>{
    let dataArray = graph.NewData;
    this.quickSort(dataArray, 0, (dataArray.length - 1));

    let buttonFollowed=[[0,0,0],[0,0,0],[0,0,0]];
    for(let i = 1; i < dataArray.length; i++) {
      buttonFollowed[dataArray[i - 1].ButtonID][dataArray[i].ButtonID] += 1;
    }

    this.setState({
      isLoading: false,
      graphData: buttonFollowed,
      buttonNames: graph.TempButtons,
      // tableData:newTableData,
    });
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

  whenPressed = (data, buttons, number) => {
    let message = "";
    for (let i = 0; i < buttons.length; i++){
      message += buttons[number].ButtonName + " then " + buttons[i].ButtonName + " : " + data[i] + "\n";
    }
    this.setState({
      showAlert: true,
      alertTitle: buttons[number].ButtonName,
      alertMessage: message,
    })
  }

  render() {
    return (
      <View>
        <View style={this.props.styles.container}>        
          <View style={this.props.styles.border}>
            <Dot data={this.state.graphData} buttons={this.state.buttonNames} pressHandler={this.whenPressed}></Dot>
          </View>
          <Text style={this.props.styles.regularText}> Press on the dots to see more information </Text>
        {/* {this.descriptionList.length >0 ? (
          <View style={this.props.styles.container}>
            <Table borderStyle={{borderWidth: 2, borderColor:{dark}}}>
                <Row data={this.state.tableHead} style={this.props.styles.tableHead} textStyle={this.props.styles.tableHead}/>
                <Rows data={this.state.tableData} textStyle={this.props.styles.tableText}/>
            </Table>
          </View>
        ): null} */}
        </View>

        <AwesomeAlert
          show={this.state.showAlert}
          title={this.state.alertTitle}
          message={this.state.alertMessage}
          contentContainerStyle={this.props.styles.alert}
          messageStyle={this.props.styles.alertBody}
          titleStyle={this.props.styles.alertText}
          onDismiss={() => { this.setState({showAlert:false}); }}
        />
      </View>
    );
  }
}

let backgroundColor="#faf5ef";
let highlight="#97deb1";
let midtone = "#489c66";
let dark="#343434";
let pink="#c740d6";
let red="#d64040";
let yellow="#d6b640";
let green="#4ea66d";
let blue="#438ab0";
let teal="#43b0a9";
let indigo="#6243b0";
let colorArray=[red,yellow,blue];

function Dot ({data, buttons, pressHandler}) {
  let width = Dimensions.get("window").width * .75;
  let height = width;
  let center = width/2;

  let radius = width / 3;
  let r = width / 15;
  let radiusOuter = radius + (r * .75);
  let radiusInner = radius - (r * .75);
  let links = [];
  let selfLinks = [];
  let outerTriangle = [];
  let innerTriangle = [];
  let strokeWidth = 2;
  let alreadyAdded = [[0,0,0],[0,0,0],[0,0,0]];
  let circles = [];

  for (let i = 0; i < buttons.length; i++) {
    let angle = i * ((2 * Math.PI) / buttons.length);
    let diffX = center - (Math.sin(angle) * radius);
    let diffY = center - (Math.cos(angle) * radius);

    let diffXL = center - (Math.sin(angle) * radiusOuter);
    let diffYL = center - (Math.cos(angle) * radiusOuter);
    let diffXS = center - (Math.sin(angle) * radiusInner);
    let diffYS = center - (Math.cos(angle) * radiusInner);

    outerTriangle.push([diffXL, diffYL]);
    innerTriangle.push([diffXS, diffYS]);

    circles.push(<Circle key={i} cx={diffX} cy={diffY} r={r} fill={colorArray[i]} onPress={() => pressHandler(data[i], buttons, i)}/>)
  }

  for(let i = 0; i < buttons.length; i++){
    for(let j = 0; j < buttons.length; j++) {
      if (i == j) {
        selfLinks.push(<Circle key={`${i}${j}`} cx={outerTriangle[i][0]} cy={outerTriangle[i][1]} r={r} strokeWidth={strokeWidth * data[i][j]} stroke={colorArray[i]}/>)
        if (data[i][j] > 20) {
          selfLinks.push(<Circle key={`${i}${j}+`} cx={outerTriangle[i][0]} cy={outerTriangle[i][1]} r={r + ((strokeWidth * data[i][j]) / 2)} fill={colorArray[i]}/>)
        }
      }
      else if (data[i][j] > 0){
        if(alreadyAdded[j][i] == 0){
          //there hasn't been anything added to there, use outer
          links.push(<Line key={`${i}${j}`} x1={outerTriangle[i][0]} y1={outerTriangle[i][1]} x2={outerTriangle[j][0]} y2={outerTriangle[j][1]} strokeWidth={strokeWidth * data[i][j]} stroke={colorArray[i]} strokeLinecap={"round"}/>)
          alreadyAdded[i][j]=1;
        }
        else {
          //something has been added, use inner
          links.push(<Line key={`${i}${j}`} x1={innerTriangle[i][0]} y1={innerTriangle[i][1]} x2={innerTriangle[j][0]} y2={innerTriangle[j][1]} strokeWidth={strokeWidth * data[i][j]} stroke={colorArray[i]} strokeLinecap={"round"}/>)
        }
      }
    }
  }

  return(
    <Svg height={height} width={width}>
      {selfLinks}
      {links}
      {circles}
    </Svg>
  )
}
