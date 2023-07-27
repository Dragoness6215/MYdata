// default imports
import React from 'react'
import {View, Text, Dimensions, TouchableWithoutFeedback} from 'react-native';
import {Svg, Line} from 'react-native-svg';
import AwesomeAlert from 'react-native-awesome-alerts';


export default class Timeline extends React.Component {

  // State of the class, data stored in here
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showAlert: false,
      alertTitle: "",
      alertMessage: "",
      graphData: [],
      buttonNames: [],
      tableHead: [],
      tableData: [],
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
  updateData(){
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

  DataProcessing = (graph) =>{
    let dataArray = graph.NewData;
    this.quickSort(dataArray, 0, (dataArray.length - 1));

    let TempDates = [];
    for (let i = 0; i < dataArray.length; i++) {
      TempDates.push(dataArray[i].Date);
    }

    let dates = [...new Set(TempDates)];
    let currDay = new Date(dates[0]);
    let dayEntries = [];
    let allDays = [];

    for (let i = 0; i < dataArray.length; i++) {
      if (currDay.toLocaleDateString() != dataArray[i].Date.toLocaleDateString()) {
        allDays.push({Date: currDay, Data: dayEntries});
        dayEntries = [];
        currDay = dataArray[i].Date;
      }
      dayEntries.push(dataArray[i]);
    }
    allDays.push({Date: currDay, Data: dayEntries});

    this.setState({
      isLoading: false,
      graphData: allDays,
      buttonNames: graph.TempButtons,
      // tableData:newTableData,
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
    let alertText = "";
    for (let i = 0; i < day.Data.length; i++) {
      alertText += `\n${this.state.buttonNames[day.Data[i].ButtonID].ButtonName} at ${day.Data[i].Date.toLocaleTimeString()}`;
    }
    
    this.setState({
      showAlert: true,
      alertTitle: day.Date.toLocaleDateString(),
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
              <TouchableWithoutFeedback onPress={() => this.onDayPressed(day)} key={i}>
                <View>
                  <Text style={this.props.styles.timelineText}> {day.Date.toLocaleDateString()} </Text>
                  <GetDays day={day}/>
                </View>
              </TouchableWithoutFeedback>
            );
          })}
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

function TopGraph() {
  let lines = [];
  let width = Dimensions.get("window").width * .7;
  let height = 25;

  let amplitude = 10;
  let change = 5;
  let strokes = [0, 2, 3, 2, 5, 2, 3, 2];
  for (let i = 1; i < 8; i++) {
    lines.push(<Line x1={width * (i / 8)} y1={height + amplitude} x2={width * (i / 8)} y2={height - amplitude} stroke={teal} strokeWidth={strokes[i]} />);
    amplitude += change;
    change *= -1;
  }
  lines.push(<Line x1={0} y1={height} x2={width} y2={height} stroke={teal} strokeWidth={5} />);

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

  let midnight = new Date(day.Date.getTime());
  midnight.setHours(0, 0, 0, 1);

  let ticks = [];
  ticks.push(<Line x1={0} y1={10} x2={width} y2={10} stroke={teal} strokeWidth={1} strokeLinecap={"round"}/>);
  for (let i = 0; i < day.Data.length; i++) {
    let tempX = (((day.Data[i].Date.getTime() - midnight.getTime()) / 1000) / 86400) * width;
    ticks.push(<Line x1={tempX} y1={5} x2={tempX} y2={15} stroke={colorArray[day.Data[i].ButtonID]} strokeWidth={1.5} strokeLinecap={"round"} key={i}/>);
  }

  return (
    <View>
      <Svg width={width} height={height}>
        {ticks}
      </Svg>
    </View>
  );
}