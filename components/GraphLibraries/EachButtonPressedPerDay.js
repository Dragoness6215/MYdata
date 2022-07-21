// default imports
import React, {useEffect, useState, Suspense } from 'react'
import {View,Text, Dimensions,TouchableWithoutFeedback} from 'react-native';
// standard graph stuff
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
// custom shape stuff
import Svg, {Circle,Ellipse,G,TSpan,TextPath,Path,Polygon,Polyline,Line,Rect,Use,Image,Symbol,Defs,LinearGradient,RadialGradient,Stop,ClipPath,Pattern,Mask,} from 'react-native-svg';
// Table stuff
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import AwesomeAlert from 'react-native-awesome-alerts';
// Global Variables
import GLOBAL from "../global.js";


export default class ButtonPressedPerDay extends React.Component {

    // State of the class, data stored in here
    // @param: props, the props passed in from the the parent class
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
            maxCount:0,
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
        if(singleArray.length>0){
          this.quickSort(singleArray, 0 ,(singleArray.length-1));

          let dayArray = [];
          let allDays=[];
          let lastDay=new Date(singleArray[0].data);
          let tempDate;
          let pressCount=[0,0,0];
          let maxCount=0;

          for (let i = 0; i<singleArray.length; i++ ){
            tempDate = new Date(singleArray[i].data);
            if(tempDate.getDate()!==lastDay.getDate()){
              pressCount[singleArray[i].button]+=1;
              let temp = {
                title:lastDay,
                data:pressCount,
              };
              for (let k=0;k<pressCount.length;k++){
                if(maxCount<pressCount[k]){
                  maxCount=pressCount[k];
                }
              }
              allDays.push(temp);
              pressCount=[0,0,0];
              lastDay=tempDate;
            }
            else{
              pressCount[singleArray[i].button]+=1;
            }
          }
          for (let k=0;k<pressCount.length;k++){
            if(maxCount<pressCount[k]){
              maxCount=pressCount[k];
            }
          }
          let temp = {
                title:lastDay,
                data:pressCount,
          };
          allDays.push(temp);
          this.setState({
            maxCount:maxCount,
          });
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

  onPress = (data) => {
    console.log(data);
    let temp=data.split(" ")
    let finalString="";
    for(let i =0; i<temp.length;i++){
      console.log(temp[i]);
      finalString+=temp[i]+"\n"
    }
    this.alertText=finalString;
    this.setState({
      showAlert:true
    })
  }
  
  alertText="";

    render() {
      const state = this.state;
        return (
          <View style={this.props.styles.container}>
            <View>
              <Text style ={this.props.styles.header}> {this.state.title  + " Graph"} </Text>
              <View style={this.props.styles.border}>
                    <EachDataPoint dayData={this.state.graphData} maxCount={this.state.maxCount} onPress={this.onPress}/>
                </View>
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
                title="Change over Time"
                message= {this.alertText}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                confirmText="Close"
                confirmButtonColor="#E07A5F"
                contentContainerStyle={this.props.styles.alert}
                messageStyle={this.props.styles.alertBody}
                titleStyle={this.props.styles.alertText}
                onConfirmPressed={() => {
                  this.setState({
                    showAlert:false,
                  })
                }}
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

function EachDataPoint({dayData,maxCount,onPress}){
  let options = [];
  let lineX=[];
  let curLineX=[];
  
  let width=Dimensions.get("window").width*.75;
  let height=(width*.1)*(dayData.length+2);
  let curHeight=width*.1;
  let scale=(width*.75)/maxCount;
  let maxLength=0;

  options.push(<Line x1={width*(.25/2)} y1={curHeight} x2={width-(width*(.25/2))} y2={curHeight} stroke={teal} strokeWidth="5" ></Line>);
  curHeight+=width*.1;

  for(let i =0; i<dayData.length;i++){
    if(dayData[i].data.length>maxLength){maxLength=dayData[i].data.length}
    for(let j=0;j<dayData[i].data.length;j++){
      curLineX.push(dayData[i].data[j]*scale+(width*(.25/2)));
    }
    lineX.push(curLineX);
    curLineX=[];
  }

  let lines=["","",""];
  for(let i =0; i<maxLength;i++){
    curHeight=2*(width*.1);
    for(let j =0; j<lineX.length;j++){
      lines[i]+=lineX[j][i]+","+curHeight+" ";
      curHeight+=width*.1;
    }
  }

  for(let i =0;i<lines.length;i++){
    options.push(<Polyline points={lines[i]} fill="none" stroke={colorArray[i]} strokeWidth="5" onPress={()=>onPress(lines[i])}></Polyline>)
  }
  

  return(
    <View>
      <Svg height={height} width={width}>
        {options}
      </Svg>
    </View>
  )
}