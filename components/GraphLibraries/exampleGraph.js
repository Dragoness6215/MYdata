// default imports
import React, {useEffect, useState, Suspense } from 'react'
import {View,Text, Dimensions,TouchableWithoutFeedback} from 'react-native';
// React-Native-Chart-Kit import; simple graphs
import {LineChart,BarChart,PieChart,ProgressChart,ContributionGraph,StackedBarChart,} from "react-native-chart-kit";
// React-Native-Svg import
import Svg, {Circle,Ellipse,G,TSpan,TextPath,Path,Polygon,Polyline,Line,Rect,Use,Image,Symbol,Defs,LinearGradient,RadialGradient,Stop,ClipPath,Pattern,Mask,} from 'react-native-svg';
// Table stuff
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
// Global Variables
import GLOBAL from "../global.js";

// all colors
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


export default class ExampleGraph extends React.Component {

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

    // used to check if props have updated
    previousProps;
    // if you integrate data point descriptions, you may use this to store the descriptionData
    descriptionList=[];

    // When the passed in value changes, this is called
    // Updates the state for the graph
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


    // This is Called on load
    // Updates the state for the graph
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

    // This is used to manually reload the state
    updateData(){
        this.setState({
          isLoading:true,
        });
    }

    // processes the data 
    DataProcessing = (rawJson) =>{
      //TODO: Write code to parse the data
      let parsedJson=[];

      return parsedJson;
    }

    // Changes TableData for BarGraph
    // tempData by default is the parsed data from DataProcessing
    ChangeTableData = (tempData) => {
        let tableDataClone=[];
        // TODO: write the code to return the table's data
        return tableDataClone;
    }

    render() {
        return (
          <View style={this.props.styles.container}>
              <View>
              <Text style ={this.props.styles.header}> {this.state.title  + " Graph"} </Text>
              <View style={this.props.styles.border}>
                    <Text> TODO: GRAPH CODE GOES HERE </Text>
              </View>
              <Text style ={this.props.styles.header}> {this.state.title  + " Table"} </Text>
                <Table borderStyle={{borderWidth: 2, borderColor:{dark}}}>
                  <Row data={this.state.tableHead} style={this.props.styles.tableHead} textStyle={this.props.styles.tableHead}/>
                  <Rows data={this.state.tableData} textStyle={this.props.styles.tableText}/>
                </Table>
              </View>
          </View>
        );
    }
}