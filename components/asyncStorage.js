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
      
      TextArray = parsedText;

      for (let i = 0; i < TextArray.length; i++) {
        for (let j = 0; j < TextArray[i].Data.length; j++) {
          let date = new Date(TextArray[i].Data[j].Date);
          TextArray[i].Data[j].Date = date;
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
    for (let i = 0; i < TextArray.length; i++){
      if (item.Key == TextArray[i].Key) {
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
    graph.Buttons = buttons;

    this.setAllData();
  };

  //prepare to put it into the place by storing in the text array
  submitHandler = (Title, Description, Type, ButtonNames) =>{
    const Key = Math.random().toString();

    if (Description.length === 0) {
      Description = "No Description... Yet";
    }

    let TempDataNew = [];
    let Buttons = [];
    for (let i = 0; i < ButtonNames.length; i++) {
      Buttons.push({ButtonID:i, ButtonName:ButtonNames[i]});
    }

    let GraphType = Type;
    let Data = TempDataNew;
    const newItem = [{ Key, Title, Description, GraphType, Buttons, Data}, ...TextArray];
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
    for (let i = 0; i < graph.Data.length; i++) {
      if (graph.Data[i].Date.getTime() == dataPoint.Date.getTime()) {
        console.log("Match Found.");
        graph.Data.splice(i, 1);
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
    for (let i = 0; i < graph.Data.length; i++) {
      if (graph.Data[i].Date.getTime() == dataPoint.Date.getTime()) {
        console.log("Match Found.");
        graph.Data[i].Description = description;
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
  addToData(key, entry){
    let graph = this.getGraph(key);
    graph.Data.push(entry);

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

    let maxLength = 50;

    const Key = Math.random().toString();
    
    let Description = "No Description Yet";
    let GraphType = "Dandelion";
    let Title = "Big Data Set"
    let Data = [];

    for (let i = 0; i < maxLength; i++) {
      let refDate = new Date();
      let buttonNum = Math.floor(Math.random() * 3);

      let year = refDate.getFullYear();
      let month = refDate.getMonth();
      let day = refDate.getDate() - Math.floor(Math.random() * 7);
      let hour = Math.floor(Math.random() * 24);
      let minute = Math.floor(Math.random() * 60);
      let second = Math.floor(Math.random() * 60);
      let millisecond = Math.floor(Math.random() * 1000);

      let date = new Date(year, month, day, hour, minute, second, millisecond);

      Data.push({ButtonID: buttonNum, Date: date});
    }

    let Buttons = [
      {ButtonID:0, ButtonName:"Button 0"},
      {ButtonID:1, ButtonName:"Button 1"},
      {ButtonID:2, ButtonName:"Button 2"},
    ];

    const newItem = [{ Title, Key, Description, GraphType, Data, Buttons}, ...TextArray];
    TextArray = (newItem);
    this.storeInAsync(newItem);
  }
}

const AsyncCode = new AsyncStorageCode();
export default AsyncCode;