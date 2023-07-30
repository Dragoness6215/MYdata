// default imports
import React from 'react';
import {View, Dimensions} from 'react-native';
// custom shape stuff
import {Svg, Circle, Line} from 'react-native-svg';
// Table stuff
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
// Global Variables
import GLOBAL from "../global.js";
import AsyncCode from '../asyncStorage.js';
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

export default class Dandelion extends React.Component {

  // State of the class, data stored in here
  constructor(props) {
    super(props);
    this.state = {
      showAlert: false,
      alertTitle: "",
      alertMessage: "",
      isLoading: true,
      graphData: [],
      dates: [],
      dateTotals: [],
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
  }

  DataProcessing = (graph) =>{
    dataArray = graph.NewData;
    this.quickSort(dataArray, 0, (dataArray.length - 1));

    let newArray = [];
    let dates = [];
    for (let i = 0; i < dataArray.length; i++) {
      if (!dates.includes(dataArray[i].Date.toLocaleDateString())) {
        dates.push(dataArray[i].Date.toLocaleDateString());
      }
      newArray.push(dataArray[i]);
    }

    let dateTotals = [];
    for (let i = 0; i < dates.length; i++) {
      dateTotals.push(dataArray.filter((entry) => (entry.Date.toLocaleDateString() == dates[i])).length);
    }

    this.setState({
      isLoading: false,
      graphData: newArray,
      dates: dates,
      dateTotals: dateTotals,
      buttonNames: graph.TempButtons,
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

  onPress = (day, data, buttons) => {
    let description = "";
    for (let i = 0; i < buttons.length; i++) {
      description += `\n${buttons[i].ButtonName}: ${data.filter((entry) => (entry.Date.toLocaleDateString() == day && entry.ButtonID == i)).length}`;
    }
    
    this.setState({
      showAlert: true,
      alertTitle: day,
      alertMessage: description,
    });
  }

  render() {
    return (
      <View style={this.props.styles.container}>
        <View style={this.props.styles.border}>
          <GetDandelion 
            data={this.state.graphData} 
            dates={this.state.dates} 
            dateTotals={this.state.dateTotals} 
            colors={colorArray} 
            buttons={this.state.buttonNames} 
            pressHandler={this.onPress}>
          </GetDandelion>
        </View>
        
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

function GetDandelion({data, dates, dateTotals, colors, buttons, pressHandler}) {
  let days = [];
  let spokes = [];
  let entries = [];
  let width = Dimensions.get("window").width*.75;
  let height = width;

  let circleX = width/2;
  let circleY = height/2;

  let radiusInner = width * .15;
  let radiusOuter = width * .45;
  let dateLocations = [];

  let prev = -1;
  for (let i = 0; i < dates.length; i++) {
    let min = prev + 1;
    let max = prev + dateTotals[i];

    let minAngle = min * ((2 * Math.PI) / data.length);
    let maxAngle = max * ((2 * Math.PI) / data.length);
    let finalAngle = ((maxAngle - minAngle) / 2) + minAngle;

    let dayX = (Math.sin(finalAngle) * radiusInner) + circleX;
    let dayY = (-Math.cos(finalAngle) * radiusInner) + circleY;

    if (dates.length === 1) {
      dayX = circleX;
      dayY = circleY;
    }

    dateLocations.push([dayX, dayY]);
    days.push(<Circle key={i} cx={dayX} cy={dayY} r={width*0.02} fill={dark} onPress={() => pressHandler(dates[i], data, buttons)}/>)

    prev = max;
  }

  for (let i = 0; i < data.length; i++) {
    let angle = i * ((2 * Math.PI) / data.length);
    let dataX = (Math.sin(angle) * radiusOuter) + circleX;
    let dataY = (-Math.cos(angle) * radiusOuter) + circleY;

    entries.push(<Circle key={i} cx={dataX} cy={dataY} r={width*0.01} fill={colors[data[i].ButtonID]}/>);

    const dateMatch = (element) => element === date;
    let date = data[i].Date.toLocaleDateString();
    let index = dates.findIndex(dateMatch);
    let dateCoordinates = dateLocations[index];

    let dayX = dateCoordinates[0];
    let dayY = dateCoordinates[1];

    spokes.push(<Line key={i} x1={dataX} y1={dataY} x2={dayX} y2={dayY} strokeWidth={1.5} stroke={colors[data[i].ButtonID]}/>);
  }

  return(
    <View>
      <Svg height={height} width={width}>
        {entries}
        {spokes}
        <Circle cx={circleX} cy={circleY} r={width*.04} fill={dark}/>
        {days}
      </Svg>
    </View>
  )
}