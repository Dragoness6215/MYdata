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


export default class ChessClock extends React.Component {
  // State of the class, data stored in here
  // @param: props, the props passed in from the the parent class
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      endDate:new Date("2017-04-01"),
      title:"Whatever you want",
      graphData: [],
      showAlert: false,
      alertMessage: "",
      maxLength:0,
      tableHead: [' Column 1', ' Column 2',],
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

  // descriptionList=[];

  DataProcessing = (graph) =>{
    let dataArray = graph.NewData;
    let buttons = graph.TempButtons;
    let finalArray = [];
    let maxLength = 0;
    let checked = [];
    for (let i = 0; i < dataArray.length; i++) {
      if (checked.includes(i)) {
        continue;
      }
      for (let j = i + 1; j < dataArray.length; j++) {
        let start = dataArray[i];
        let end = dataArray[j];
        if (start.ButtonID == end.ButtonID) {
          let duration = end.Date.getTime() - start.Date.getTime();
          if (duration > maxLength) {
            maxLength = duration;
          }

          finalArray.push({
            ButtonID: start.ButtonID,
            ButtonName: buttons[start.ButtonID].ButtonName,
            Duration: duration,
          });
          checked.push(j);
          break;
        }
      }
    }

    this.setState({
      isLoading: false,
      maxLength: maxLength,
      graphData: finalArray,
      // tableData:newTableData,
      title:graph.Title,
    });

    // this.descriptionList=[];
    // if(rawJson.Data[i].data[j].Description!=undefined){
    //   let temp={
    //     data:this.reformatToCorrect(rawJson.Data[i],i,j),
    //     buttonName:rawJson.Data[i].ButtonName,
    //     Description:rawJson.Data[i].data[j].Description,
    //   };
    //   this.descriptionList.push(temp);
    // }
  }

  whenPressed = (item) => {
    console.log(item);
    let message = `Button: ${item.ButtonName}\nDuration: ${(item.Duration / 1000).toFixed(3)} seconds`;
    this.setState({
      showAlert: true,
      alertMessage: message});
  }

  render() {
    return (
      <View>
        <View style={this.props.styles.container}>
          <View style={this.props.styles.border}>
            <Lines data={this.state.graphData} maxLength={this.state.maxLength} pressHandler={this.whenPressed}></Lines>
          </View>
          <Text style={this.props.styles.regularText}> Press on the lines to see more information </Text>
        {/* {this.descriptionList.length > 0 ? (
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
          title={"Data"}
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

function Lines({data, maxLength, pressHandler}) {
  let toReturn = [];
  let width = Dimensions.get("window").width * .75;
  let height = ((width * .1) * (data.length + 1)) + (data.length * .075);
  let scale = (width * .9) / maxLength;
  let curHeight = width * .1;

  for(let i = 0; i < data.length; i++) {
    let temp = (data[i].Duration * scale) / 2;
    if (temp < 5) {
      temp = 5;
    }
    //toReturn.push(<Line x1={width/2-temp} y1={curHeight} x2={width/2+temp} y2={curHeight} stroke={colorArray[rawData[i].buttonPressed]} strokeWidth={width*.075} onPress={()=>pressHandler(rawData[i])}/> )
    toReturn.push(<Rect key={i} x={width / 2 - temp} y={curHeight - (width * .075)} width={temp * 2} height={width * .075} fill={colorArray[data[i].ButtonID]} onPress={() => pressHandler(data[i])}></Rect>)
    curHeight += width * .1;
  }

  return (
    <Svg width={width} height={height}>
      {toReturn}
    </Svg>
  )
}