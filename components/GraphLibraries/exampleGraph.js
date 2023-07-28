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

  //State Variables: //Initialize any variables that need to be passed to the render here
  //Modify them by calling setState in DataProcessing as needed
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      showAlert: false,
      alertTitle: "",
      alertMessage: "",
      graphData: [],
      tableHead: [],
      tableData: [],
    }
  }

  //Called on load and sets the state variables
  componentDidMount() {
    this.DataProcessing(this.props.rawData);
  }

  //Called when the graph data is changed and updates the state variables
  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props || this.state.isLoading) {
      this.DataProcessing(this.props.rawData);
    }
  }

  //Processes the data and updates any necessary variables for the render
  DataProcessing = (graph) =>{
    let dataArray = graph.NewData;

    //Add code to process and manipulate the data here
    //Any additional variables must be included in the set state call

    this.setState({
      isLoading: false,
      graphData: dataArray,
    });
  }

  pressHandler = (data) => {
    let title = "";
    let message = "";
    
    this.setState({
      showAlert: true,
      alertTitle: title,
      alertMessage: message,
    });
  }

  render() {
    return (
      <View style={this.props.styles.container}>
        <View style={this.props.styles.border}>
          {/*Insert Code to Display Graph Here*/}
        </View>
        
        {/*Alert to Display Further Info on Tap*/}
        <AwesomeAlert
          show={this.state.showAlert}
          title={this.state.alertTitle}
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