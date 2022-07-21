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


export default class ChessClock extends React.Component {

    // State of the class, data stored in here
    // @param: props, the props passed in from the the parent class
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            numberOfDays:0,
            endDate:new Date("2017-04-01"),
            title:"Whatever you want",
            graphData: [
            ],
            showAlert:false,
            maxLength:0,
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
        let tempGraphData=this.DataProcessing(this.props.rawData);
        let newTableData=this.ChangeTableData(tempGraphData);
        this.setState({
          isLoading:false,
          graphData:tempGraphData,
          tableData:newTableData,
          title:this.props.rawData.Title,
        });
        this.previousProps=this.props;
      }
    }


    // called on load
    componentDidMount(){
      let tempGraphData=this.DataProcessing(GLOBAL.ITEM);
      let newTableData=this.ChangeTableData(tempGraphData);
      this.setState({
        isLoading:false,
        graphData:tempGraphData,
        tableData:newTableData,
        title:GLOBAL.ITEM.Title,
      });
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

descriptionList=[];

  DataProcessing = (rawJson) =>{
        let parsedJson=[
        ];
        let startDate;
        let endDate;
        let count=0;
        let maxLength=0;
        this.descriptionList=[];
        for(let i = 0 ; i < rawJson.Data.length;i++){
          for (let j = 0; j<rawJson.Data[i].data.length; j++){
            if(rawJson.Data[i].data[j].Description!=undefined){
              let temp={
                data:this.reformatToCorrect(rawJson.Data[i],i,j),
                buttonName:rawJson.Data[i].ButtonName,
                Description:rawJson.Data[i].data[j].Description,
              };
              this.descriptionList.push(temp);
            }

            if(count==0){
              count=1;
              startDate=Date.parse(this.reformatToCorrect(rawJson.Data[i],i,j));
            }
            else if(count==1){
              count=0;
              endDate=Date.parse(this.reformatToCorrect(rawJson.Data[i],i,j));
              let tempDuration=endDate-startDate;
              if(tempDuration>maxLength){
                maxLength=tempDuration;
              }
              startDate=undefined;
              endDate=undefined;
              parsedJson.push({
                duration:tempDuration,
                buttonPressed:i,
              })
            }
          }
          count=0;
        };
        this.setState({
          maxLength:maxLength,
        })
        return parsedJson;
    }

    reformatToCorrect=(rawJson,i,j)=>{
      let tempJson="";
      tempJson+=rawJson.data[j].Year+"-";
      if(rawJson.data[j].Month<10){
        tempJson+="0";
      }
        tempJson+=(rawJson.data[j].Month+1)+"-";

      if(rawJson.data[j].Day<10){
        tempJson+="0";
      }
      tempJson+=(rawJson.data[j].Day)+"T";

      if(rawJson.data[j].Hour<10){
        tempJson+="0";
      }
      tempJson+=(rawJson.data[j].Hour)+":";

      if(rawJson.data[j].Minutes<10){
        tempJson+="0";
      }
      tempJson+=(rawJson.data[j].Minutes)+":";

      if(rawJson.data[j].Seconds<10){
        tempJson+="0";
      }
      tempJson+=(rawJson.data[j].Seconds);
      return tempJson;
    }

    whenPressed = (data) => {
      let tempString="Button: "+data.buttonPressed+"\nDuration: "+(data.duration/1000)+" seconds";
      this.setState({
        showAlert:true,
        selectedData:tempString});
    }

    render() {
      const state = this.state;
        return (
          <View style={this.props.styles.container}>
              <View>
                <View style={this.props.styles.border}>
                    <Lines rawData={this.state.graphData} maxLength={this.state.maxLength} pressHandler={this.whenPressed}></Lines>
                </View>
              <Text style={this.props.styles.regularText}> Press on the lines to see more information </Text>
              </View>
              {this.descriptionList.length >0 ? (
                <View style={this.props.styles.container}>
                <Table borderStyle={{borderWidth: 2, borderColor:{dark}}}>
                    <Row data={this.state.tableHead} style={this.props.styles.tableHead} textStyle={this.props.styles.tableHead}/>
                    <Rows data={this.state.tableData} textStyle={this.props.styles.tableText}/>
                </Table>
              </View>
              ): null}
              <AwesomeAlert
                show={this.state.showAlert}
                showProgress={false}
                title={"Data"}
                message= {this.state.selectedData}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                confirmText="Okay"
                confirmButtonColor="#63ba83"
                contentContainerStyle={this.props.styles.alert}
                messageStyle={this.props.styles.alertBody}
                titleStyle={this.props.styles.alertText}
                onConfirmPressed={() => {
                  this.setState({showAlert:false});
              }}/>
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

function Lines({rawData, maxLength, pressHandler}){
  let toReturn=[];
  let width=Dimensions.get("window").width*.75;
  let height=(width*.1)*(rawData.length+1);
  let curHeight=width*.1;
  let scale=(width*.9)/maxLength;
  for(let i =0; i<rawData.length;i++){
    let temp=(rawData[i].duration*scale)/2;
    if(temp<5){temp=5}
    //toReturn.push(<Line x1={width/2-temp} y1={curHeight} x2={width/2+temp} y2={curHeight} stroke={colorArray[rawData[i].buttonPressed]} strokeWidth={width*.075} onPress={()=>pressHandler(rawData[i])}/> )
    toReturn.push(<Rect x={width/2-temp} y={curHeight-(width*.075)} width={temp*2} height={width*.075} fill={colorArray[rawData[i].buttonPressed]} onPress={()=>pressHandler(rawData[i])}></Rect>)
    curHeight+=width*.1;
  }
  return(
    <Svg width={width} height={height}>
      {toReturn}
    </Svg>
  )
}