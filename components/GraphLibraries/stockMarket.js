// default imports
import React from 'react'
import {View, Text, Dimensions, TouchableWithoutFeedback} from 'react-native';
// standard graph stuff
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
// custom shape stuff
import Svg, {Circle,Ellipse,G,TSpan,TextPath,Path,Polygon,Polyline,Line,Rect,Use,Image,Symbol,Defs,LinearGradient,RadialGradient,Stop,ClipPath,Pattern,Mask,} from 'react-native-svg';
// Table stuff
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import AwesomeAlert from 'react-native-awesome-alerts';
// Global Variables
import GLOBAL from "../global.js";


export default class StockMarket extends React.Component {

  // State of the class, data stored in here
  // @param: props, the props passed in from the the parent class
  constructor(props) {
    super(props);
    this.state = {
      showAlert:false,
      alertTitle: "",
      alertMessage: "",
      buttons: [],
      isLoading: true,
      maxCount: 0,
      numberOfDays:0,
      endDate:new Date("2017-04-01"),
      title:"Whatever you want",
      graphData: [],
      maxCount:0,
      tableHead: [' Column 1', ' Column 2',],
      tableData: [
      ['row 1', 'row 1',],
      ['row 2', 'row 2',],
      ],
    }
  }

  previousProps;
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
    this.setState({ isLoading:true });
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

  descriptionList=[];

  DataProcessing = (graph) =>{
    let dataArray = graph.NewData;
    
    this.quickSort(dataArray, 0, (dataArray.length - 1));

    let TempDates = [];
    for (let i = 0; i < dataArray.length; i++) {
      TempDates.push(dataArray[i].Date.toDateString());
    }

    let dates = [...new Set(TempDates)];
    let currDay = new Date(dates[0]);
    let dayCount = new Array(graph.TempButtons.length).fill(0);
    let maxCount = 0;
    let allDays = [];

    for (let i = 0; i < dataArray.length; i++) {
      if (currDay.toDateString() != dataArray[i].Date.toDateString()) {
        allDays.push({Date: currDay, Counts: dayCount});
        if (Math.max(...dayCount) > maxCount) {
          maxCount = Math.max(...dayCount);
        }

        dayCount = new Array(graph.TempButtons.length).fill(0);
        currDay = dataArray[i].Date;
      }
      dayCount[dataArray[i].ButtonID] += 1;
    }
    
    if (Math.max(...dayCount) > 0) {
      allDays.push({Date: currDay, Counts: dayCount});
      if (Math.max(...dayCount) > maxCount) {
        maxCount = Math.max(...dayCount);
      }
    }
    console.log(allDays);

    this.setState({
      isLoading: false,
      graphData: allDays,
      maxCount: maxCount,
      buttons: graph.TempButtons,
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

  onPress = (data, buttonNum) => {
    let title = this.state.buttons[buttonNum].ButtonName;
    let message = "";
    for (let i = 0; i < data.length; i++) {
      message += `${data[i].Date.toLocaleDateString()}: Button Pressed ${data[i].Counts[buttonNum]} Times`;
    }

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
          <EachDataPoint data={this.state.graphData} maxCount={this.state.maxCount} buttons={this.state.buttons} onPress={this.onPress}/>
        </View>
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

function EachDataPoint({data, maxCount, buttons, onPress}) {
  let width = Dimensions.get("window").width * .7;
  let height = (width * .1) * (data.length + 2);
  let addHeight = width * .1;
  let scale = (width * (7 / 8)) / maxCount;

  let lines = [];
  for (let i = 0; i < buttons.length; i++) {
    let curHeight = addHeight;
    let coordinates = `${width / 16} ${curHeight} `;

    for (let j = 0; j < data.length; j++) {
      curHeight += addHeight;
      coordinates += `${(data[j].Counts[i] * scale) + (width / 16)} ${curHeight} `;
      console.log(`${(data[j].Counts[i] * scale) + (width / 16)} ${curHeight} `);
    }
    lines.push(<Polyline points={coordinates} fill={"none"} stroke={colorArray[i]} strokeWidth={5} strokeLinecap={"round"} onPress={() => onPress(data, i)} key={i}/>)
  }

  return(
    <View>
      <Svg height={height} width={width}>
        {lines}
        <Line x1={width / 16} y1={addHeight} x2={width * (15 / 16)} y2={addHeight} stroke={teal} strokeWidth={10} strokeLinecap={"round"}/>
      </Svg>
    </View>
  )
}