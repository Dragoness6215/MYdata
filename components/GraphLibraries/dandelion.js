import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Svg, Circle, Line } from 'react-native-svg';
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
  //State of the class, data stored in here
  constructor(props) {
    super(props);
    this.state = {
      showAlert: false,
      alertTitle: "",
      alertMessage: "",
      isLoading: true,
      graphData: [],
      dataLength: 0,
      buttonNames: [],
    }
  }
  
  //Called on load
  componentDidMount() {
    this.DataProcessing(this.props.rawData);
  }

  //Called when the data changes and updates the state for the graph
  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props || this.state.isLoading) {
      this.DataProcessing(this.props.rawData);
    }
  }

  //Processes the incoming data as needed for the graph
  DataProcessing = (graph) =>{
    let dataArray = graph.Data;
    this.quickSort(dataArray, 0, (dataArray.length - 1));

    let dayData = [];
    let dates = [];
    for (let i = 0; i < dataArray.length; i++) {
      if (!dates.includes(dataArray[i].Date.toLocaleDateString())) {
        dates.push(dataArray[i].Date.toLocaleDateString());
      }
    }

    //For each day, filter out the entries for that day
    for (let i = 0; i < dates.length; i++) {
      let filterArray = dataArray.filter((entry) => (entry.Date.toLocaleDateString() == dates[i]));
      dayData.push({Date: dates[i], Data: filterArray});
    }

    this.setState({
      isLoading: false,
      graphData: dayData,
      dataLength: dataArray.length,
      buttonNames: graph.Buttons,
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

  //Displays additional info when user interacts with graph
  pressHandler = (day, buttons) => {
    let description = "";
    for (let i = 0; i < buttons.length; i++) {
      description += `\n${buttons[i].ButtonName}: ${day.Data.filter((entry) => (entry.Date.toLocaleDateString() == day.Date && entry.ButtonID == i)).length}`;
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
        <View style={this.props.styles.border}>
          <GetDandelion 
            data={this.state.graphData}
            length={this.state.dataLength}
            colors={colorArray} 
            buttons={this.state.buttonNames} 
            pressHandler={this.pressHandler}>
          </GetDandelion>
        </View>
        <Text style={this.props.styles.regularText}> Tap the inner dots to see more information </Text>
        
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

function GetDandelion({data, length, colors, buttons, pressHandler}) {
  let days = [];
  let spokes = [];
  let entries = [];
  let width = Dimensions.get("window").width*.75;
  let height = width;

  let circleX = width/2;
  let circleY = height/2;
  let radiusInner = width * .15;
  let radiusOuter = width * .45;
  let angleIncrement = (2 * Math.PI) / length;

  let angle = -angleIncrement;
  let curCount = 0;
  for (let i = 0; i < data.length; i++) {
    let day = data[i];
    let finalAngle = (((day.Data.length - 1) / 2) + curCount) * angleIncrement;

    let dayX = (Math.sin(finalAngle) * radiusInner) + circleX;
    let dayY = (-Math.cos(finalAngle) * radiusInner) + circleY;

    if (data.length == 1) {
      dayX = circleX;
      dayY = circleY;
    }

    days.push(<Circle key={i} cx={dayX} cy={dayY} r={width*0.03} fill={dark} onPress={() => pressHandler(day, buttons)}/>)

    for (let j = 0; j < day.Data.length; j++) {
      angle += angleIncrement;
      let dataX = (Math.sin(angle) * radiusOuter) + circleX;
      let dataY = (-Math.cos(angle) * radiusOuter) + circleY;

      entries.push(<Circle key={`${i}${j}`} cx={dataX} cy={dataY} r={width*0.01} fill={colors[data[i].Data[j].ButtonID]}/>);
      spokes.push(<Line key={`${i}${j}`} x1={dataX} y1={dataY} x2={dayX} y2={dayY} strokeWidth={1.5} stroke={colors[data[i].Data[j].ButtonID]}/>);
    }

    curCount += day.Data.length;
  }

  return(
    <View>
      <Svg height={height} width={width}>
        {entries}
        {spokes}
        <Circle cx={circleX} cy={circleY} r={width*.05} fill={dark}/>
        {days}
      </Svg>
    </View>
  )
}