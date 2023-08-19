import React from 'react'
import { View, Text, Dimensions } from 'react-native';
import { Svg, Polyline, Line } from 'react-native-svg';
import AwesomeAlert from 'react-native-awesome-alerts';

export default class StockMarket extends React.Component {
  //State of the class, data stored in here
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showAlert: false,
      alertTitle: "",
      alertMessage: "",
      graphData: [],
      buttons: [],
      maxCount: 0,
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
    let maxCount = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      if (!dates.includes(dataArray[i].Date.toLocaleDateString())) {
        dates.push(dataArray[i].Date.toLocaleDateString());
      }
    }

    //For each day, filter out the entries for that day
    //Then, group entries for each day by button
    for (let i = 0; i < dates.length; i++) {
      let dayCounts = new Array(graph.Buttons.length).fill(0);
      let filterArray = dataArray.filter((entry) => (entry.Date.toLocaleDateString() == dates[i]));
      for (let j = 0; j < filterArray.length; j++) {
        dayCounts[filterArray[j].ButtonID] += 1;
      }
      maxCount = Math.max(...dayCounts, maxCount);
      dayData.push({Date: dates[i], Counts: dayCounts});
    }

    this.setState({
      isLoading: false,
      graphData: dayData,
      maxCount: maxCount,
      buttons: graph.Buttons,
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
  pressHandler = (data, buttonNum) => {
    let title = this.state.buttons[buttonNum].ButtonName;
    let message = "";
    for (let i = 0; i < data.length; i++) {
      message += `\n${data[i].Date}: Button Pressed ${data[i].Counts[buttonNum]} Times`;
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
          <EachDataPoint data={this.state.graphData} maxCount={this.state.maxCount} buttons={this.state.buttons} pressHandler={this.pressHandler}/>
        </View>
        <Text style={this.props.styles.regularText}> Tap the lines to see more information </Text>
        
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

function EachDataPoint({data, maxCount, buttons, pressHandler}) {
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
    }
    lines.push(<Polyline points={coordinates} fill={"none"} stroke={colorArray[i]} strokeWidth={5} strokeLinecap={"round"} onPress={() => pressHandler(data, i)} key={i}/>)
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