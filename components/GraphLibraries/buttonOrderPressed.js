// default imports
import React, {useEffect, useState, Suspense } from 'react'
import {View,Text, FlatList, Dimensions,TouchableWithoutFeedback,Modal} from 'react-native';
// standard graph stuff
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
// custom shape stuff
import Svg, {Circle,Ellipse,G,TSpan,TextPath,Path,Polygon,Polyline,Line,Rect,Use,Image,Symbol,Defs,LinearGradient,RadialGradient,Stop,ClipPath,Pattern,Mask,} from 'react-native-svg';
// Table stuff
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
// Stylization, use styles.NAME
import AwesomeAlert from 'react-native-awesome-alerts';
// Global Variables
import GLOBAL from "../global.js";
import { sin } from 'react-native/Libraries/Animated/Easing.js';
import { runInThisContext } from 'vm';


export default class ButtonOrderGraph extends React.Component {

    // State of the class, data stored in here
    constructor(props) {
        super(props);
        this.state = {
            showAlert:false,
            isLoading: true,
            numberOfDays:0,
            endDate:new Date("2017-04-01"),
            title:"Whatever you want",
            graphData: [
            ],
            tableHead: [' Button', ' Description',],
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
      if (this.previousProps !== this.props || this.state.isLoading) {
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
        let parsedJson=[];
        let dataArray = rawJson.Data;
        let singleArray=[];
        this.descriptionList=[];
        for(let i = 0 ; i < dataArray.length;i++){
          for(let j=0; j<dataArray[i].data.length;j++){
            singleArray.push(this.reformatToCorrect(dataArray[i],i,j));
            if(dataArray[i].data[j].Description!=undefined){
              let temp=(this.reformatToCorrect(dataArray[i],i,j));
              temp.Description=dataArray[i].data[j].Description;
              this.descriptionList.push(temp);
            }
          }
        };
        this.quickSort(singleArray,0,(singleArray.length-1));
        return singleArray;
  }

  reformatToCorrect=(rawJson,i,j)=>{
            let tempJson={};
            tempJson.data=rawJson.data[j].Year+"-";
            if(rawJson.data[j].Month<10){
              tempJson.data+="0";
            }
              tempJson.data+=(rawJson.data[j].Month+1)+"-";

            if(rawJson.data[j].Day<10){
              tempJson.data+="0";
            }
            tempJson.data+=(rawJson.data[j].Day)+"T";

            if(rawJson.data[j].Hour<10){
              tempJson.data+="0";
            }
            tempJson.data+=(rawJson.data[j].Hour)+":";

            if(rawJson.data[j].Minutes<10){
              tempJson.data+="0";
            }
            tempJson.data+=(rawJson.data[j].Minutes)+":";

            if(rawJson.data[j].Seconds<10){
              tempJson.data+="0";
            }
            tempJson.data+=(rawJson.data[j].Seconds);

            tempJson.button=i;
            tempJson.buttonName=rawJson.ButtonName;
            return tempJson;
  }
    
 
  // Algorithim Implementation modified from : https://www.geeksforgeeks.org/quick-sort/ 
  swap=(arr,xp, yp)=>{
    var temp = arr[xp];
    arr[xp] = arr[yp];
    arr[yp] = temp;
  }

  partition = (arr, low, high) => {
  
    // pivot
    let pivot = arr[high];

    // Index of smaller element and
    // indicates the right position
    // of pivot found so far
    let i = (low - 1);

    for (let j = low; j <= high - 1; j++) {
        // If current element is smaller
        // than the pivot
        if (new Date(arr[j].data) < new Date(pivot.data)) {
            // Increment index of
            // smaller element
            i++;
            this.swap(arr, i, j);
        }
    }
    this.swap(arr, i + 1, high);
    return (i + 1);
  }

  quickSort = (arr, low, high) => {
    if (low < high) {

        // pi is partitioning index, arr[p]
        // is now at right place
        let pi = this.partition(arr, low, high);

        // Separately sort elements before
        // partition and after partition
        this.quickSort(arr, low, pi - 1);
        this.quickSort(arr, pi + 1, high);
    }
  }

  onDotPressed = (item) => {
    let selectedDate=item.data.split("T")[0];
    let selectedTime=item.data.split("T")[1];
    this.description="Date: "+selectedDate+"\nTime: "+selectedTime;
    for(let i =0; i<this.descriptionList.length;i++){
      if(item.data==this.descriptionList[i].data){
        this.description+="\n Description: "+this.descriptionList[i].Description;
      }
    }
    this.selectedButtonNumber=item.buttonName;
    this.setState({showAlert:true});
  }

  description
  selectedButtonNumber;

  render() {
      const state = this.state;
        return (
          <View>
            <AwesomeAlert
              show={this.state.showAlert}
              showProgress={false}
              title={this.selectedButtonNumber}
              message= {this.description}
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
            <View style={this.props.styles.container}>
              <View style={this.props.styles.border}>
              <Dot data={this.state.graphData} onDotPressed={this.onDotPressed} styles={this.props.styles}></Dot>
              </View>
              <Text style={this.props.styles.regularText}> Press a data point to learn about the time and date </Text>
              </View>
              {/*
              <View style={this.props.styles.container}>
                <Table borderStyle={{borderWidth: 2, borderColor:{dark}}}>
                    <Row data={this.state.tableHead} style={this.props.styles.tableHead} textStyle={this.props.styles.tableHead}/>
                    <Rows data={this.state.tableData} textStyle={this.props.styles.tableText}/>
                </Table>
              </View>
              */}
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

function Dot ({data, onDotPressed, styles}){
  let toReturn=[];
  let width=Dimensions.get("window").width*.75;
  let radius=width/10;
  let height=Math.ceil(data.length/5)*(radius*2);
  let currentX=radius;
  let currentY=radius
  for(let i =0; i<data.length;i++){
    toReturn.push(<Circle cx={currentX} cy={currentY} r={radius} onPress={()=>onDotPressed(data[i])} fill={colorArray[data[i].button]}/>);
    currentX+=radius*2;
    if(currentX>width){
      currentX=radius;
      currentY+=radius*2;
    }
  }
  return(
    <Svg width={width} height={height}>
      {toReturn}
    </Svg>
  )
} 