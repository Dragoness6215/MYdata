// default imports
import React from 'react'
import {View, Text, Dimensions, TouchableWithoutFeedback} from 'react-native';
import {Svg, Line} from 'react-native-svg';
import AwesomeAlert from 'react-native-awesome-alerts';

export default class Timeline extends React.Component {
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

    let dates = [];
    let dayData = [];
    
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
  pressHandler = (day) => {
    let alertText = "";
    for (let i = 0; i < day.Data.length; i++) {
      alertText += `\n${this.state.buttonNames[day.Data[i].ButtonID].ButtonName} at ${day.Data[i].Date.toLocaleTimeString()}`;
    }
    
    this.setState({
      showAlert: true,
      alertTitle: day.Date,
      alertMessage: alertText,
    });
  }

  render() {
    return (
      <View style={this.props.styles.container}>
        <View style={this.props.styles.border}>
          <TopGraph/>
          {this.state.graphData.map((day, i) => {
            return (
              <TouchableWithoutFeedback onPress={() => this.pressHandler(day)} key={i}>
                <View>
                  <Text style={this.props.styles.timelineText}> {day.Date} </Text>
                  <GetDays day={day}/>
                </View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>
        <Text style={this.props.styles.regularText}> Tap the days to see more information </Text>

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

//Displays the timeline diagram at the top of the graph
function TopGraph() {
  let lines = [];
  let width = Dimensions.get("window").width * .7;
  let height = 25;

  let amplitude = 10;
  let strokes = [0, 2, 3, 2, 5, 2, 3, 2];
  for (let i = 1; i < 8; i++) {
    lines.push(<Line key={i} x1={width * (i / 8)} y1={height + amplitude} x2={width * (i / 8)} y2={height - amplitude} stroke={teal} strokeWidth={strokes[i]}/>);
    amplitude += ((i % 2) * 10) - 5;
  }
  lines.push(<Line key={-1} x1={0} y1={height} x2={width} y2={height} stroke={teal} strokeWidth={5} />);

  return(
    <View>
      <Svg height={50} width={width}>
        {lines}
      </Svg>
    </View>
  )
} 

function GetDays({day}) {
  let width = Dimensions.get("window").width * .7;
  let height = 25;

  let midnight = new Date(day.Date);

  let ticks = [];
  ticks.push(<Line key={-1} x1={0} y1={10} x2={width} y2={10} stroke={teal} strokeWidth={1} strokeLinecap={"round"}/>);
  for (let i = 0; i < day.Data.length; i++) {
    let tempX = ((day.Data[i].Date.getTime() - midnight.getTime()) / 86400000) * width;
    ticks.push(<Line key={i} x1={tempX} y1={5} x2={tempX} y2={15} stroke={colorArray[day.Data[i].ButtonID]} strokeWidth={1.5} strokeLinecap={"round"}/>);
  }

  return (
    <View>
      <Svg width={width} height={height}>
        {ticks}
      </Svg>
    </View>
  );
}