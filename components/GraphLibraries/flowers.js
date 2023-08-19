import React from 'react'
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

export default class Flowers extends React.Component {
  //State of the class, data stored in here
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showAlert: false,
      alertTitle: "",
      alertMessage: "",
      graphData: [],
      buttonNames: [],
      tooBig: false,
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
  DataProcessing = (graph) => {
    let dataArray = graph.Data;
    this.quickSort(dataArray, 0, (dataArray.length - 1));
    let index = Math.max(dataArray.length - 250, 0);

    let dates = [];
    let dayData = [];
    for (let i = index; i < dataArray.length; i++) {
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
      description += `${buttons[i].ButtonName}: ${day.Data.filter((entry) => (entry.ButtonID === i)).length}\n`;
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
        {/* {this.toBig ? (<Text style={this.props.styles.subheader}> Data Limit Exceeded, Some Data Will Be Omitted. </Text>): null } */}
        <View style={this.props.styles.border}>
          <GetFlowers data={this.state.graphData} buttons={this.state.buttonNames} pressHandler={this.pressHandler}></GetFlowers>
        </View>
        <Text style={this.props.styles.regularText}> Tap the flowers to see more information </Text>
        
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

function GetFlowers({data, buttons, pressHandler}) {
  let flowers = [];
  let stems = [];
  let width = Dimensions.get("window").width*.75;
  let height = (data.length + 1) * (width / 3);
  let radius = width / 6;

  let whichSide = -1;
  let strokeWidth = 10;

  for (let i = 0; i < data.length; i++) {
    stems.push(<Line key={i} x1={width / 2} y1={((width / 3) * (i + 2))} x2={(width * (whichSide + 2)) / 4} y2={((width / 3) * (i + 1))} strokeWidth={strokeWidth} stroke={darkGreen} strokeLinecap={"round"}/>);
    flowers.push(<Flower key={i} data={data[i]} centerX={(width * (whichSide + 2)) / 4} centerY={((width / 3) * (i + 1))} radius={radius} buttons={buttons} pressHandler={pressHandler}/>);
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

function Flower({data, centerX, centerY, radius, buttons, pressHandler}) {
  let petals = [];
  let strokeWidth = Math.max(1.5, Math.min(90 / (data.Data.length + 1), 20));
  
  for (let i = 0; i < data.Data.length; i++) {
    let angle = i * ((2 * Math.PI) / data.Data.length);
    
    let petalX = Math.sin(angle) * radius;
    let petalY = Math.cos(angle) * radius;
    
    petals.push(<Line key={i} x1={centerX} y1={centerY} x2={centerX + petalX} y2={centerY - petalY} strokeWidth={strokeWidth} stroke={colorArray[data.Data[i].ButtonID]}/>);
  }

  return(
    <View>
      {petals}
      <Circle cx={centerX} cy={centerY} r={radius / 3} fill={dark} onPress={() => pressHandler(data, buttons)}/>
    </View>
  )
}