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


export default class FlowerGraph extends React.Component {

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
            tableHead: [' Column 1', ' Column 2',],
            tableData: [
            ['row 1', 'row 1',],
            ['row 2', 'row 2',],
            ],
        }
    }

    toBig=false;
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
        if(singleArray.length>250){
          console.log("Way too big: "+singleArray.length);
          this.toBig=true;
          this.quickSort(singleArray, 0 ,(singleArray.length-1));

          let dayArray = [];
          let allDays=[];
          let lastDay=new Date(singleArray[0].data);
          let tempDate;

          for (let i = 0; i<125; i++ ){
            tempDate = new Date(singleArray[i].data);
            if(tempDate.getDate()!==lastDay.getDate()){
              let temp = {
                title:lastDay,
                data:dayArray,
              };
              allDays.push(temp);
              dayArray=[];
              dayArray.push(singleArray[i]);
              lastDay=tempDate;
            }
            else{
              dayArray.push(singleArray[i]);
            }
          }
          let temp = {
            title:tempDate,
            data:dayArray,
          };
          allDays.push(temp);

          for (let i = singleArray.length-125; i<singleArray.length; i++ ){
            tempDate = new Date(singleArray[i].data);
            if(tempDate.getDate()!==lastDay.getDate()){
              let temp = {
                title:lastDay,
                data:dayArray,
              };
              allDays.push(temp);
              dayArray=[];
              dayArray.push(singleArray[i]);
              lastDay=tempDate;
            }
            else{
              dayArray.push(singleArray[i]);
            }
          }
          let temp1 = {
            title:tempDate,
            data:dayArray,
          };
          allDays.push(temp1);
          return allDays;
        }
        else if(singleArray.length>0){
          this.quickSort(singleArray, 0 ,(singleArray.length-1));

          let dayArray = [];
          let allDays=[];
          let lastDay=new Date(singleArray[0].data);
          let tempDate;

          for (let i = 0; i<singleArray.length; i++ ){
            tempDate = new Date(singleArray[i].data);
            if(tempDate.getDate()!==lastDay.getDate()){
              let temp = {
                title:lastDay,
                data:dayArray,
              };
              allDays.push(temp);
              dayArray=[];
              dayArray.push(singleArray[i]);
              lastDay=tempDate;
            }
            else{
              dayArray.push(singleArray[i]);
            }
          }
          let temp = {
            title:tempDate,
            data:dayArray,
          };
          allDays.push(temp);
          return allDays;
        }
        return [];
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

  onDayPressed = (rawData) => {
    let temp=this.state.showAlert;
    this.selectedData=rawData.data;
    let tempDate=rawData.title;
    this.selectedDate=(tempDate.getMonth()+1) + "/" + tempDate.getDate() + "/" + tempDate.getFullYear()+ " ";
    this.setState({
      showAlert:!temp,
    })
  }

  selectedDate;
  selectedData=[];

  dataToTable=(data)=>{
    let tempString="";
    let tempDate;
    for (let i =0; i<data.length;i++){
      tempString+=data[i].buttonName+", ";
    }
  
    return(tempString);
  }

  render() {
    return (
      <View style={this.props.styles.container}>
          <View>
          {this.toBig ? (
            <Text style={this.props.styles.subheader}> Data set is too big, so only some is displayed.</Text>
          ): null }
            <View style={this.props.styles.border}>
                <GetFlowers data={this.state.graphData} styles={this.props.styles} pressHandler={this.onDayPressed}></GetFlowers>
            </View>
            <Text style={this.props.styles.regularText}> Press on the flowers to see more information </Text>
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
            title={this.selectedDate}
            message= {this.dataToTable(this.selectedData)}
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

function GetFlowers({data, styles, pressHandler}){
  let toReturn=[];
  let width=Dimensions.get("window").width*.75;
  let height=(data.length+1)*width/3;
  let radius=width/6
  let whichSide=1;
  let strokeWidth=10;
  let stemStoke=darkGreen;
  toReturn.push(<Line x1={width/2} y1={radius*2*(1.95)} x2={width/2} y2={height} strokeWidth={strokeWidth} stroke={stemStoke} key={"Stem"}/>)
  for (let i = 0; i<data.length;i++){
    toReturn.push(<Line x1={width/2} y1={radius*2*(i+2)} x2={whichSide*width/4} y2={radius*2*(i+1)} strokeWidth={strokeWidth} stroke={stemStoke} key={i} />);
    toReturn.push(<Flower x={whichSide*width/4} y={radius*2*(i+1)} r={radius} data={data[i]} pressHandler={pressHandler} key={(whichSide*width/4) +","+(radius*2*(i+1))}/>);
    if(whichSide==1){
      whichSide=3;
    }
    else if(whichSide==3){
      whichSide=1;
    }
  }
  return(
    <View>
      <Svg height={height} width={width} key={"Flowers"}>
        {toReturn}
      </Svg>
    </View>
  )

}

function Flower ({data, x, y, r, pressHandler}) {
  let petals=[];
  let smallAngle=(2*Math.PI)/(data.data.length);
  let strokeWidth;
  let max=90;
  if(max/data.data.length>25){
    strokeWidth=25;
  }
  else if(max/data.data.length>1.5){
    strokeWidth=max/data.data.length;
  }
  else{
    strokeWidth=1.5;
  }
  for (let i =0; i<data.data.length; i++){
    let diffX=Math.sin(smallAngle*i)*r;
    let diffY=Math.cos(smallAngle*i)*r;
    //console.log("Petal Key: "+(x-diffX)+","+(y-diffY));
    petals.push(<Line x1={x} y1={y} x2={x-diffX} y2={y-diffY} strokeWidth={strokeWidth} stroke={colorArray[data.data[i].button]} key={(x+diffX)+","+(y+diffY)}/>);
  }

  return(
      <View>
        {petals}
        <Circle cx={x} cy={y} r={r/3} fill={dark} onPress={() => pressHandler(data)} key={x+","+y+","+r}/>
      </View>
  )
}

