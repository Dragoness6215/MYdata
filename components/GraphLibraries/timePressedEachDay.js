// default imports
import React, {useEffect, useState, Suspense } from 'react'
import {View,Text, Dimensions,TouchableWithoutFeedback,SectionList,FlatList} from 'react-native';
// standard graph stuff
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
// custom shape stuff
import Svg, {Circle,Ellipse,G,TSpan,TextPath,Path,Polygon,Polyline,Line,Rect,Use,Image,Symbol,Defs,LinearGradient,RadialGradient,Stop,ClipPath,Pattern,Mask,} from 'react-native-svg';
// Table stuff
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
// Global Variables
import GLOBAL from "../global.js";
import darkStyles from '../darkStyles.js';
let styles=darkStyles;
import AwesomeAlert from 'react-native-awesome-alerts';


export default class TimesPerDay extends React.Component {

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
            tableHead: [' Button', ' Date'],
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
          console.log(allDays);
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
      tempDate=data[i].data.split("T")[1];
      tempDate=tempDate.split(":")[0]+":"+tempDate.split(":")[1];
      tempString+=data[i].buttonName+" at "+tempDate+",\t";
    }
  
    return(tempString);
  }

  render() {
        return (
          <View style={this.props.styles.container}>
              <View>
                <View style={this.props.styles.border}>
                    <TopGraph graphData={this.state.graphData}></TopGraph>
                    <FlatList
                      data={this.state.graphData}
                      renderItem={({ item }) =>
                        <TouchableWithoutFeedback onPress={()=>this.onDayPressed(item)}>
                          <View style={this.props.styles.fixToText}>
                            <GetDay data={item.data} styles={this.props.styles}/>
                            <EachDataPoint dayData={item.data}/>
                          </View>                            
                        </TouchableWithoutFeedback>
                      }/>
                </View>
                {this.descriptionList.length >0 ? (
                  <View style={this.props.styles.container}>
                    <Table borderStyle={{borderWidth: 2, borderColor:{dark}}}>
                        <Row data={this.state.tableHead} style={this.props.styles.tableHead} textStyle={this.props.styles.tableHead}/>
                        <Rows data={this.state.tableData} textStyle={this.props.styles.tableText}/>
                    </Table>
                  </View>
                  ): null}
              </View>
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

function TopGraph({graphData}){
  return(
    <View>
      <Svg height="50" width={Dimensions.get("window").width*.7}>
      <Line x1={Dimensions.get("window").width*.7*.5} y1="10" x2={Dimensions.get("window").width*.7*.5} y2="40" stroke={teal} strokeWidth="5" />
      <Line x1={Dimensions.get("window").width*.7*.25} y1="10" x2={Dimensions.get("window").width*.7*.25} y2="40" stroke={teal} strokeWidth="3" />
      <Line x1={Dimensions.get("window").width*.7*.75} y1="10" x2={Dimensions.get("window").width*.7*.75} y2="40" stroke={teal} strokeWidth="3" />
      <Line x1={Dimensions.get("window").width*.7*.125} y1="15" x2={Dimensions.get("window").width*.7*.125} y2="35" stroke={teal} strokeWidth="2" />
      <Line x1={Dimensions.get("window").width*.7*.375} y1="15" x2={Dimensions.get("window").width*.7*.375} y2="35" stroke={teal} strokeWidth="2" />
      <Line x1={Dimensions.get("window").width*.7*.625} y1="15" x2={Dimensions.get("window").width*.7*.625} y2="35" stroke={teal} strokeWidth="2" />
      <Line x1={Dimensions.get("window").width*.7*.875} y1="15" x2={Dimensions.get("window").width*.7*.875} y2="35" stroke={teal} strokeWidth="2" />
      <Line x1="0" y1="25" x2={Dimensions.get("window").width*.7} y2="25" stroke={teal} strokeWidth="5" />
      </Svg>
    </View>
  )
} 

function GetDay({data, styles}){
  let tempDate=new Date(data[0].data);
  let day=(tempDate.getMonth()+1) + "/" + tempDate.getDate();
  return(
    <Text style={styles.tinyText}> {day} </Text>
  );
}

function EachDataPoint({dayData}){
  let options = [];
  let maxPossible=((23*60)+59)*60+59;
  for(let i =0; i<dayData.length;i++){
    console.log(i);
    console.log(dayData[i])
    let day=new Date(dayData[i].data);
    if(day != NaN){
      let tempX=(((((day.getHours()+4)*60)+day.getMinutes())*60+day.getSeconds())/maxPossible)*(Dimensions.get("window").width*.7);
      console.log(tempX);
      options.push(<Line x1={tempX} y1="5" x2={tempX} y2="15" stroke={colorArray[dayData[i].button]} strokeWidth="1.5" />);
    }
    else{
      console.log("Bad Date");
    }
  }
  return(
    <View>
      <Svg height="15" width={Dimensions.get("window").width*.7}>
        {options}
      </Svg>
    </View>
  )
}