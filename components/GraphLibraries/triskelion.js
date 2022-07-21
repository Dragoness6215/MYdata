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


export default class Triskelion extends React.Component {

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
            alertText:"",
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

        this.quickSort(singleArray,0,(singleArray.length-1));

        let buttonFollowed=[[0,0,0],[0,0,0],[0,0,0]];
        let buttonNames=[];
        let lastButton=-1;
        for(let i =0; i<singleArray.length;i++){
          if(lastButton!=-1){
            buttonFollowed[lastButton][singleArray[i].button]+=1
          }
          if(buttonNames[singleArray[i].button]==undefined){
            buttonNames[singleArray[i].button]=singleArray[i].buttonName;
          }
          lastButton=singleArray[i].button;
        }
        return buttonFollowed;
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
    
  swap=(arr,xp, yp)=>{
    var temp = arr[xp];
    arr[xp] = arr[yp];
    arr[yp] = temp;
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

  whenPressed = (data, buttonNumber) => {
    console.log(data);
    let tempString="";
    for (let i =0; i<data.length;i++){
      tempString+="Button " + buttonNumber + " then Button " + i;
      tempString+=" : " + data[i] + "\n";
    }
    console.log(tempString);
    this.setState({
      showAlert:true,
      alertText:tempString,
    })
  }

    render() {
      const state = this.state;
        return (
          <View style={this.props.styles.container}>
              <View>
              <View style={this.props.styles.border}>
                    <Dot data={this.state.graphData} pressHandler={this.whenPressed}></Dot>
                </View>
                <Text style={this.props.styles.regularText}> Press on the dots to see more information </Text>
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
                title={"Point Data"}
                message= {this.state.alertText}
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

function Dot ({data, pressHandler}) {
  let smallAngle=(2*Math.PI)/(data.length);
  let width=Dimensions.get("window").width*.75;
  let height=width;
  let items=[]
  let r = width/15;
  let outerTriangle=[];
  let innerTriangle=[];
  let strokeWidth=2;
  let alreadyAdded=[[0,0,0],[0,0,0],[0,0,0]];
  let circles=[];

  for (let i =0; i<data.length; i++){
    let diffX=Math.sin(smallAngle*i)*(width*(1/3));
    let diffY=Math.cos(smallAngle*i)*(width*(1/3));

    let diffXL=Math.sin(smallAngle*i)*(width*(14/36));
    let diffYL=Math.cos(smallAngle*i)*(width*(14/36));
    let diffXS=Math.sin(smallAngle*i)*(width*(11/36));
    let diffYS=Math.cos(smallAngle*i)*(width*(11/36));

    outerTriangle.push([width/2-diffXL,height/2-diffYL]);
    innerTriangle.push([width/2-diffXS,height/2-diffYS]);

    circles.push(<Circle cx={width/2-diffX} cy={height/2-diffY} r={r} fill={colorArray[i]} onPress={()=>pressHandler(data[i],i)}/>)
  }

  for(let i =0; i<data.length;i++){
    for(let j = 0; j<data[i].length;j++){
      if(i==j){
        items.push(<Circle cx={outerTriangle[i][0]} cy={outerTriangle[i][1]} r={r} strokeWidth={strokeWidth*data[i][j]} stroke={colorArray[i]}></Circle>)
      }
      if(data[i][j]>0){
        if(alreadyAdded[j][i]==0){
          //there hasn't been anything added to there, use outer
          items.push(<Line x1={outerTriangle[i][0]} y1={outerTriangle[i][1]} x2={outerTriangle[j][0]} y2={outerTriangle[j][1]} strokeWidth={strokeWidth*data[i][j]} stroke={colorArray[i]} strokeLinecap={"round"}></Line>)
          alreadyAdded[i][j]=1;
        }
        else{
          //something has been added, use inner
          items.push(<Line x1={innerTriangle[i][0]} y1={innerTriangle[i][1]} x2={innerTriangle[j][0]} y2={innerTriangle[j][1]} strokeWidth={strokeWidth*data[i][j]} stroke={colorArray[i]} strokeLinecap={"round"}></Line>)
        }
      }
    }
  }

  return(
    <Svg height={height} width={width}>
      {items}
      {circles}
    </Svg>
  )
}
