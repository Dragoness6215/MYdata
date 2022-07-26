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

  //hello, world
    previousProps;
    // when passed in json changes, this is called
    //updates the state for the graph
    componentDidUpdate(prevProps, prevState) {
      if (this.previousProps !== this.props || this.state.isLoading) {
        let tempGraphData=this.timesPerDay(this.props.rawData);
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

    componentDidMount(){
      let tempGraphData=this.timesPerDay(GLOBAL.ITEM);
      let newTableData=this.ChangeTableData(tempGraphData);
      this.setState({
        isLoading:false,
        graphData:tempGraphData,
        tableData:newTableData,
        title:GLOBAL.ITEM.Title,
      });
    }

    updateData(){
        this.setState({
          isLoading:true,
        });
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

    GetDate = (rawString) => {
      let tempString=rawString.split("-");
      let finalString="";
      for(let i =0; i<tempString.length-1; i++){
        if(tempString[i].length==1){
          tempString[i]="0"+tempString[i];
        }
        finalString+=tempString[i]+"-";
      }
      if(tempString[tempString.length-1].length==1){
        tempString[tempString.length-1]="0"+tempString[tempString.length-1];
      }
      finalString+=tempString[tempString.length-1];
      return (new Date(finalString));
    }
 
    swap=(arr,xp, yp)=>{
      var temp = arr[xp];
      arr[xp] = arr[yp];
      arr[yp] = temp;
    }
  
    selectionSort = (arr,  n) =>{
      var i, j, min_idx;
  
      // One by one move boundary of unsorted subarray
      for (i = 0; i < n-1; i++)
      {
          // Find the minimum element in unsorted array
          min_idx = i;
          for (j = i + 1; j < n; j++){
            if (this.GetDate(arr[j][0]) < this.GetDate(arr[min_idx][0])){
                min_idx = j;
            }
          }
          // Swap the found minimum element with the first element
          this.swap(arr,min_idx, i);
      }
    }
    
    descriptionList=[];

    // treats all buttons as the same
    timesPerDay = (rawJson) =>{
        let parsedJson=[
        ];
        this.descriptionList=[];
        //pulls the data into a formatable form.
        let dataArray = rawJson.Data;
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
          numberOfDays:totalNumOfDates,
          endDate:lastDate,
        })
        return parsedJson;
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
      const state = this.state;
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
                onConfirmPressed={() => {
                  this.setState({showAlert:false});
              }}/>
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