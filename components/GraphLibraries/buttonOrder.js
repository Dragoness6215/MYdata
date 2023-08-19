import React from 'react'
import { View, Text, Dimensions } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import AwesomeAlert from 'react-native-awesome-alerts';

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
  //State of the class, data stored in here
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showAlert: false,
      alertTitle: "",
      alertMessage: "",
      graphData: [],
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

    this.setState({
      isLoading: false,
      graphData: dataArray,
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
  pressHandler = (item) => {
    let description = "Date: " + item.Date.toDateString() + "\nTime: " + item.Date.toLocaleTimeString();
    let button = this.props.rawData.Buttons[item.ButtonID].ButtonName;
    
    this.setState({
      showAlert: true,
      alertTitle: button,
      alertMessage: description,
    });
  }

  render() {
    return (
      <View style={this.props.styles.container}>
        <View style={this.props.styles.border}>
          <GetDots data={this.state.graphData} pressHandler={this.pressHandler}/>
        </View>
        <Text style={this.props.styles.regularText}> Tap the entries to see more information </Text>
        
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

function GetDots ({data, pressHandler}) {
  let dots = [];
  let width = Dimensions.get("window").width * .75;
  let height = Math.ceil(data.length / 5)*(width / 5);
  
  let radius = width/10;
  let currentX = radius;
  let currentY = radius;

  //For each entry, creates a circle object and gradually fills the screen from left to right, top to bottom
  for(let i = 0; i < data.length; i++){
    dots.push(<Circle key={i} cx={currentX} cy={currentY} r={radius} onPress={() => pressHandler(data[i])} fill={colorArray[data[i].ButtonID]}/>);
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