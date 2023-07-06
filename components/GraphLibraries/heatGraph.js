import React, {useEffect, useState, Suspense } from 'react'
import {View,Text, Dimensions,TouchableWithoutFeedback} from 'react-native';
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import GLOBAL from "../global.js";
import AwesomeAlert from 'react-native-awesome-alerts';


let backgroundColor="#faf5ef";
let highlight="#97deb1";
let midtone = "#489c66";
let dark="#343434";

const chartConfig = {
  backgroundColor: backgroundColor,
    backgroundGradientFrom: backgroundColor,
    backgroundGradientTo: backgroundColor,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(52, 52, 52, ${opacity})`,
};

export default class HeatMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        showAlert:false,
        isLoading: true,
        numberOfDays:0,
        endDate:new Date("2017-04-01"),
        title:"Whatever you want",
        graphData: [],
        tableHead: [' Date', ' Description',],
        tableData: [
          ['1', '2',],
        ],
    }
  }

  // when passed in json changes, this is called
  //updates the state for the graph
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

  updateData() {
    this.setState({ isLoading:true });
  }

  //Changes TableData for BarGraph
  ChangeTableData = (tempData) => {
        let tableDataClone=[];
        for(let i = 0 ; i< this.descriptionList.length;i++){
          let temp=[];
          temp.push(this.descriptionList[i][0]);
          temp.push(this.descriptionList[i][1]);
          tableDataClone.push(temp);
        }
        return tableDataClone;
  }

  // GetDate = (rawString) => {
  //   let tempString=rawString.split("-");
  //   let finalString="";
  //   for(let i =0; i<tempString.length-1; i++){
  //     if(tempString[i].length==1){
  //       tempString[i]="0"+tempString[i];
  //     }
  //     finalString+=tempString[i]+"-";
  //   }
  //   if(tempString[tempString.length-1].length==1){
  //     tempString[tempString.length-1]="0"+tempString[tempString.length-1];
  //   }
  //   finalString+=tempString[tempString.length-1];
  //   return (new Date(finalString));
  // }

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
  
  descriptionList=[];

  // treats all buttons as the same
  DataProcessing = (graph) => {
    let dataArray = graph.NewData;

    let parsedJson=[];
    this.descriptionList=[];
    //pulls the data into a formatable form.
    let dataArray1 = rawJson.Data;
    let allDateCount=[];
    let lastDate=new Date("1000-01-01");
    let firstDay= new Date();

    for(let i = 0 ; i < dataArray.length;i++){
      let temp1=dataArray[i].data;
      for (let j = 0; j<temp1.length; j++){
        let day = temp1[j].Day;
        let year = temp1[j].Year;
        let month= temp1[j].Month;
        const temp2=""+year+"-";
        if(month<10){
          temp2+="0"+month+"-";
        }
        else{
          temp2+=month+"-";
        }
        if(day<10){
          temp2+="0"+day;
        }
        else{
          temp2+=day;
        }
        //temp2+="T";
        let curDate=new Date(temp2);
        if(curDate>lastDate){
          lastDate=curDate;
        }
        if(curDate<firstDay){
          firstDay=curDate;
        }
        if(temp1[j].Description!=undefined){
          this.descriptionList.push([temp2,temp1[j].Description]);
        }
        allDateCount.push((temp2));
      }
    };
    console.log(this.descriptionList);
    //counting and adding to the array
    const loggedDates=[];
    let totalNumOfDates=0;
    for (const element of allDateCount) {
      if(! loggedDates.includes(element)){
        loggedDates.push(element);
        let numOf = allDateCount.filter(function(item){ return item === element; }).length
        parsedJson.push({date:element, count:numOf});
      }
    }
    totalNumOfDates=((lastDate-firstDay)/86400000)+1;
    
    this.setState({
      numberOfDays: totalNumOfDates,
      graphData: parsedJson,
      endDate: lastDate,
      title: graph.Title,
      // tableData:newTableData,
    });
  }

  dayDetails = (data) => {
    this.chosenCount=data.count;
    if(data.date.getDay){
      let tempDate=data.date;
      let year=tempDate.getFullYear();
      let month=tempDate.getMonth();
      let day=tempDate.getDate();
      let temp2=""+year+"-";
          if(month<10){
            temp2+="0"+month+"-";
          }
          else{
            temp2+=month+"-";
          }
          if(day<10){
            temp2+="0"+day;
          }
          else{
            temp2+=day;
          }
      this.chosenDate=temp2;
    }
    else{
      this.chosenDate=data.date;
    }
    this.setState({
      showAlert:true,
    })
  }

    chosenCount;
    chosenDate;

  render() {
    // since we're now referencing this.state.data, its value 
    // will be updated directly when we update the state
    return (
      <View style={this.props.styles.container}>
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={false}
          title={this.chosenDate}
          message= {"There were " + this.chosenCount + " button presses"}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="Okay"
          confirmButtonColor="#63ba83"
          contentContainerStyle={this.props.styles.alert}
          messageStyle={this.props.styles.alertBody}
          titleStyle={this.props.styles.alertText}
          onConfirmPressed={() => { this.setState({showAlert:false}); }}/>
        <View>
        <View style={this.props.styles.border}>
          {(this.state.graphData.length<1)? <Text style={this.props.styles.regularText}></Text>:
            <ContributionGraph
                endDate={this.state.endDate}
                numDays={this.state.numberOfDays}
                values={this.state.graphData}
                width={Dimensions.get("window").width*.75}
                height={(Math.ceil(this.state.numberOfDays/7+2)*(Dimensions.get("window").width*.075))}
                onDayPress={(testVar)=>this.dayDetails(testVar)}
                squareSize={Dimensions.get("window").width*.075}
                //showOutOfRangeDays={true}
                horizontal={false}
                accessor={"count"}
                chartConfig={chartConfig}
              />}
          </View>
          <Text style={this.props.styles.regularText}> Click on each day to see more information </Text>
          {this.descriptionList.length >0 ? (
          <View style={this.props.styles.container}>
          <Table borderStyle={{borderWidth: 2, borderColor:{dark}}}>
              <Row data={this.state.tableHead} style={this.props.styles.tableHead} textStyle={this.props.styles.tableHead}/>
              <Rows data={this.state.tableData} textStyle={this.props.styles.tableText}/>
          </Table>
        </View>
        ): null}
        </View>
      </View>
    );
  }
}