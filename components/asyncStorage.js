import AsyncStorage from '@react-native-async-storage/async-storage';
import { kMaxLength } from 'buffer';
import { keyExtractor } from 'react-native/Libraries/Lists/VirtualizeUtils';

import GLOBAL from './global.js';

const asyncStorageKeyGraphs = '@text';
const asyncStorageKeyDefaults="@defaults";
let asyncStorageKey='@text';
let TextArray=[{}];
let AsyncDefaults=[{}];

//Storage for Async code and access it from anywhere, to make code cleaner
class AsyncStorageCode {

  //put all items into async
  storeInAsync = (newItem) => {
    const stringifiedText = JSON.stringify(newItem);

    AsyncStorage.setItem(asyncStorageKey, stringifiedText).catch(err => {
      console.warn(err);
    });
  };
  
  //get data from async storage
  restoreFromAsync = () => {
    AsyncStorage.getItem(asyncStorageKey)//get the stuff stored at the key
    .then(stringifiedText => {

      let parsedText = JSON.parse(stringifiedText); //parsing the data object

      if (!parsedText || typeof parsedText !== 'object') return;
      
      TextArray=parsedText;

      for (let i = 0; i < TextArray.length; i++) {
        for (let j = 0; j < TextArray[i].NewData.length; j++) {
          let date = new Date(TextArray[i].NewData[j].Date);
          TextArray[i].NewData[j].Date = date;
        }
      }

    })
    .catch(err => {
      console.warn('Error restoring from async');
      console.warn(err);
    });
  };

  getGraph = (key) => {
    this.restoreFromAsync;
    for (let i = 0; i < TextArray.length; i++) {
      if (TextArray[i].Key == key) {
        return TextArray[i];
      }
    }
    return;
  }

  //alters async storage when given an item's data and the item's key
  alterAsyncItem = (item) => {
    for (let i =0; i<TextArray.length;i++){
        if(item.Key==TextArray[i].Key){
          TextArray[i]=item;
        }
    }
    this.setAllData();
  };

  // changes the graph's type
  changeGraphType = (type, key) => {
    for (let i = 0; i < TextArray.length; i++){
      if(key == TextArray[i].Key){
        TextArray[i].GraphType = type;
      }
    }
  this.setAllData();
  };

  updateGraph = (name, desc, type, buttons, key) => {
    let graph = this.getGraph(key);
    graph.Title = name;
    graph.Description = desc;
    graph.GraphType = type;
    graph.TempButtons = buttons;
    console.log(this.getGraph(key));

    this.setAllData();
  };

  //prepare to put it into the place by storing in the text array
  submitHandler = (Title, Description, Type, Buttons) =>{
    if (Description.length === 0) {
      Description = "No Description... Yet";
    }
    
    const Key = Math.random().toString();
    let TempData = [
      {ButtonName:Buttons[0], data:[]},
      {ButtonName:Buttons[1], data:[]},
      {ButtonName:Buttons[2], data:[]},
    ];

    let TempDataNew = [];

    let TempButtons = [];
    for (let i = 0; i < Buttons.length; i++) {
      TempButtons.push({ButtonID:i, ButtonName:Buttons[i]});
    }

    let Data = TempData;
    let GraphType = Type;
    let NewData = TempDataNew;
    const newItem = [{ Key, Title, Description, GraphType, Data, TempButtons, NewData}, ...TextArray];
    TextArray = (newItem);
    this.storeInAsync(newItem);
  };

  //when an item is pressed, fetch it and set it's info. 
  removeItem = (key) => {
    //cut out the one item.
    const newItem = TextArray.filter(textArray => textArray.Key !== key);
    //change the rest
    TextArray=(newItem);
    this.storeInAsync(newItem);
  };

  // deletes a data point
  removeDataPoint = (key, dataPoint) => {
    let graph = this.getGraph(key);
    for (let i = 0; i < graph.NewData.length; i++) {
      if (graph.NewData[i].Date.getTime() == dataPoint.Date.getTime()) {
        console.log("Match Found.");
        graph.NewData.splice(i, 1);
        this.setAllData;
      }
    }


    // for (let i =0; i<TextArray.length;i++){
    //   if(key==TextArray[i].Key){
    //     console.log("Found matching Key");
    //     for(let j=0;j<TextArray[i].Data.length;j++){
    //       for(let k=0;k<TextArray[i].Data[j].data.length;k++){
    //         if( TextArray[i].Data[j].data[k].Year==dataPoint.Year &&
    //             TextArray[i].Data[j].data[k].Month==dataPoint.Month &&
    //             TextArray[i].Data[j].data[k].Day==dataPoint.Day &&
    //             TextArray[i].Data[j].data[k].Hour==dataPoint.Hour &&
    //             TextArray[i].Data[j].data[k].Minutes==dataPoint.Minutes &&
    //             TextArray[i].Data[j].data[k].Seconds==dataPoint.Seconds &&
    //             TextArray[i].Data[j].data[k].Milliseconds==dataPoint.Milliseconds){
              
    //           console.log("Match Found");
    //           let temp=TextArray[i].Data[j].data;
    //           temp.splice(k,1);
    //           this.setAllData();
    //           return TextArray[i];
    //         }
    //       }
    //     }
    //   }
    // }
  }

  changeDataPointDescription = (key, dataPoint, description) => {
    let graph = this.getGraph(key);
    for (let i = 0; i < graph.NewData.length; i++) {
      if (graph.NewData[i].Date.getTime() == dataPoint.Date.getTime()) {
        console.log("Match Found.");
        graph.NewData[i].Description = description;
        this.setAllData();
      }
    }
  }

  //moves the data in TempArray into the async storage.
  setAllData(){
    const stringifiedText = JSON.stringify(TextArray);
    AsyncStorage.setItem(asyncStorageKey, stringifiedText).catch(err => {
      console.warn(err);
    });
  }
  
  // getter for TextArray
  getTextArray() {
    this.restoreFromAsync;
    return TextArray;
  }

  // adds data to a prexisting graph
  addToData(key, tempDate, newData, buttonNumber){
    let graph = this.getGraph(key);
    graph.Data[buttonNumber].data.push(newData);
    graph.NewData.push(tempDate);

    this.setAllData();
  }

  // gets the defaults
  getDefaults = async () => {
    AsyncStorage.getItem(asyncStorageKeyDefaults)//get the stuff stored at the key
    .then(stringifiedText => {
      let parsedText = JSON.parse(stringifiedText); //parsing the data object

      if (!parsedText || typeof parsedText !== 'object') return;
      AsyncDefaults=parsedText;
    })
    .catch(err => {
      console.warn('Error restoring from async');
      console.warn(err);
    });
  }

  //returns the async defaults after loaded
  getAsyncDefaults(){
    return AsyncDefaults;
  }

  //updates the defaults
  updateDefaults(newItem){
    const stringifiedText = JSON.stringify(newItem);

    AsyncStorage.setItem(asyncStorageKeyDefaults, stringifiedText).catch(err => {
      console.warn(err);
    });
  }

  //resets the stored graphs
  resetGraphs(){
    let newItem=[];
    const stringifiedText = JSON.stringify(newItem);
    
    AsyncStorage.setItem(asyncStorageKey, stringifiedText).catch(err => {
      console.warn(err);
    });
    console.log("Graphs Reset");
  }

  //resets the stored defaults
  resetDefaults(){
    let newItem=[{
      button0Key:0,
      button1Key:0,
      button2Key:0,
    }]
    const stringifiedText = JSON.stringify(newItem);
    AsyncStorage.setItem(asyncStorageKeyDefaults, stringifiedText).catch(err => {
      console.warn(err);
    });
    console.log("Defaults Reset");
  }

  // adds a randomly generated big data point
  addBigData(){
    console.log("Adding Big Data");

    let maxLength=100;

    const Key = Math.random().toString();
    let TempData={Data:[
      {ButtonName:"Button0", data:[]},
      {ButtonName:"Button1", data:[]},
      {ButtonName:"Button2", data:[]},
    ]};
    let Description="No Description Yet";
    let Data=TempData.Data;
    let GraphType='NoDataYet';
    let Title="Big Data Set"

    for(let i = 0; i < maxLength; i++){
      let day=Math.floor(Math.random()*(6) + 10);
      let month=4;
      let year=2023;
      let hour=Math.floor(Math.random()*24);
      let minutes=Math.floor(Math.random()*60);
      let seconds=Math.floor(Math.random()*60);
      let milliseconds=Math.floor(Math.random()*60);
      let buttonNum=Math.floor(Math.random()*3);
      TempData.Data[buttonNum].data.push({Year:year,
        Month:month,
        Day:day,
        Hour:hour,
        Minutes:minutes,
        Seconds:seconds,
        Milliseconds:milliseconds,
      });
    }

    const newItem = [{ Title, Data, Key, Description, GraphType}, ...TextArray];
    TextArray=(newItem);
    this.storeInAsync(newItem);
  }
}

const AsyncCode = new AsyncStorageCode();
export default AsyncCode;