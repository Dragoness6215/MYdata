// React Native Imports
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ImageBackground, LogBox, Text, View, FlatList, TouchableWithoutFeedback, TouchableOpacity, ScrollView, StyleSheet, Image, NativeModules, NativeEventEmitter, SectionList, TextInput, Appearance, Dimensions, Linking, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PermissionsAndroid, Platform, BackHandler } from "react-native";
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

import {ImageResizeMode} from 'react-native/Libraries/Image/ImageResizeMode'

// External Library
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import ViewShot from "react-native-view-shot";
import CameraRoll from "@react-native-community/cameraroll";
import email from 'react-native-email'
import BleManager, { start } from 'react-native-ble-manager';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';

// User Defined Components
import GLOBAL from './components/global.js';
import lightStyles from "./components/lightStyles.js";
import darkStyles from './components/darkStyles.js';
import GraphSwitch from './components/GraphLibraries/graphSwitch.js';
import AsyncCode from './components/asyncStorage.js';
import ImageSwitch from './components/imageSwitch.js';
import BleCode from './components/BleCode.js';

// User Graph Imports
import BarGraph from "./components/GraphLibraries/barGraph.js";
import HeatMap from './components/GraphLibraries/heatMap.js';
import ButtonOrder from "./components/GraphLibraries/buttonOrder.js"
import Timeline from './components/GraphLibraries/timeline.js';
import Flowers from './components/GraphLibraries/flowers.js';
import Triskelion from './components/GraphLibraries/triskelion.js';
import ChessClock from './components/GraphLibraries/chessClock.js';
import StockMarket from './components/GraphLibraries/stockMarket.js';
import Dandelion from "./components/GraphLibraries/dandelion.js";
 
// const BleManagerModule = NativeModules.BleManager;
// const bleEmitter = new NativeEventEmitter(BleManagerModule);

let styles = darkStyles;

//List of all available graphs and associated attributes
//To add graph, add array with name, image, and description fields as shown below
const graphLibrary = [
  { name: "Bar Graph", image: require('./assets/BarGraph.png'), description: "Displays the number of times each button is pressed." },
  { name: "Button Order", image: require('./assets/ButtonOrder.png'), description: "Displays the order of button pushes." },
  { name: "Chess Clock", image: require('./assets/ChessClock.png'), description: "Displays the duration between the same button being pressed." },
  { name: "Dandelion", image: require('./assets/Dandelion.png'), description: "Displays the buttons pressed, separated by days." },
  { name: "Flowers", image: require('./assets/Flowers.png'), description: "Displays the buttons pressed each day." },
  { name: "Heat Map", image: require('./assets/HeatMap.png'), description: "Displays the number of times all buttons are pressed for each day." },
  { name: "Stock Market", image: require('./assets/StockMarket.png'), description: "Displays the number of times each button was pressed each day" },
  { name: "Timeline", image: require('./assets/Timeline.png'), description: "Displays when buttons are pressed each day." },
  { name: "Triskelion", image: require('./assets/Triskelion.png'), description: "Displays the number of button pairs pressed." },
]

//List of graphs for dropdowns
const graphOptions = [
];
const graphOptionsNew = [
  <Picker.Item key={-1} label={"Set Graph Type"} value={null} style={styles.pickerDropdown}/>
];

//List of graph descriptions
const graphDescriptions = [
];

//Populates graphoptions and graphdescriptions from initial list
for (let i = 0; i < graphLibrary.length; i++) {
  let graph = graphLibrary[i];
  graphOptions.push(<Picker.Item key={i} label={graph.name} value={graph.name} style={styles.pickerDropdown}/>);
  graphOptionsNew.push(<Picker.Item key={i} label={graph.name} value={graph.name} style={styles.pickerDropdown}/>);
  graphDescriptions.push(<Text key={i} style={styles.tinyText} name={graph.name}> {graph.description} </Text>);
};

// DON'T FORGET TO ADD TO GRAPHSWITCH IN GRAPHS AS WELL

// Manages pages and recalls the order
const Stack = createNativeStackNavigator();
//stylization for the header bar
const backgroundDefault = {
  headerStyle: { backgroundColor: '#343434' },
  headerTitle: (props) => <LogoTitle {...props} />,
  headerTintColor: '#faf5ef',
  headerTitleAlign: 'center',
  headerTitleStyle: { alignSelf: 'center' }
}

//Logo for the header bar
function LogoTitle() {
  return (
    <Image
      style={styles.titleLogo}
      source={require('./assets/TestLogoLight.png')}
    />
  );
}

// sets up the navigation
export default class App extends React.Component {
  // Tries to preloads everything
  async getStuff() {
    //await AsyncCode.resetDefaults();
    await AsyncCode.getDefaults();
  }

  // signals to load the fonts
  //Uncomment AsyncCode.addBigData() to add a large procedurally generated data set
  componentDidMount() {
    let temp = Appearance.getColorScheme();
    if(temp == 'light') {
      styles = lightStyles;
    }
    else {
      styles = darkStyles;
    }

    //AsyncCode.addBigData();
    this.getStuff();
    let defaults = AsyncCode.getAsyncDefaults();
    GLOBAL.BUTTON0KEY = defaults[0].button0Key;
    GLOBAL.BUTTON1KEY = defaults[0].button1Key;
    GLOBAL.BUTTON2KEY = defaults[0].button2Key;
    BleCode.checkPermissions();
  }

  // Renders
  render() {
    return (
      <NavigationContainer animationEnabled={true} animationTypeForReplace={"push"}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home"           component={HomeScreen}      options={backgroundDefault}/>
          <Stack.Screen name="Select Device"  component={SelectDevice}    options={backgroundDefault}/>
          <Stack.Screen name="Data Inputs"    component={ButtonSelection} options={backgroundDefault}/>
          <Stack.Screen name="Graph Library"  component={GraphLibrary}    options={backgroundDefault}/>
          <Stack.Screen name="My Graphs"      component={SelectData}      options={backgroundDefault}/>
          <Stack.Screen name="New Graph"      component={NewGraph}        options={backgroundDefault} initialParams={{ typeParam: null }}/>
          <Stack.Screen name="Graph"          component={Graph}           options={backgroundDefault}/>
          <Stack.Screen name="Graph Settings" component={GraphSettings}   options={backgroundDefault}/>
          <Stack.Screen name="Edit Data"      component={EditData}        options={backgroundDefault}/>
          <Stack.Screen name="Data Info"      component={DataInfo}        options={backgroundDefault}/>
          <Stack.Screen name="About"          component={About}           options={backgroundDefault}/>
          <Stack.Screen name="Settings"       component={Settings}        options={backgroundDefault}/>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

// Home Screen: Navigates to the other pages, and starts loading
function HomeScreen({navigation}) {
  //Loads in async storage on page load
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', (e) => { 
      AsyncCode.restoreFromAsync();
    });
    return unsubscribe;
  }, [navigation]);

  //Checks if a bluetooth device is connected and decides where to go next
  const checkAndNavigate = () => {
    if(BleCode.checkPermissions()) {
      if(BleCode.isConnected()) {
        navigation.navigate('Data Inputs');
      }
      
      else {
        navigation.navigate('Select Device');
      }
    }

    else {
      console.log("Wrong permissions");
    }
  }

  React.useEffect( () => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableWithoutFeedback onPress={() => {checkAndNavigate()}}>
          <Image source={require('./assets/SettingsIcon.png')} style={styles.headerIcon}/>
        </TouchableWithoutFeedback>
      ),
      headerRight: () => (
        <TouchableWithoutFeedback onPress={() => navigation.navigate('About')}>
          <Image source={require('./assets/InfoIcon.png')} style={styles.headerIcon}/>
        </TouchableWithoutFeedback>
      )
    })
  }, [navigation]);
  
  return (
    <View style={styles.container}>
      <ImageSwitch styles={styles}/>
      {/* <ImageBackground  //controls the graph displayed in the background, future implementation: randomize graph that is displayed
        style={styles.backgroundImage}
        source={require('./assets/buttonbackground.png')}
      > */}
      <View style={styles.bottomLine}></View>
      <TouchableWithoutFeedback onPress={() => navigation.navigate('My Graphs')}>
        <Text style={styles.bigButton}> My Graphs </Text>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => navigation.navigate('Graph Library')}>
        <Text style={styles.bigButton}> Graph Library </Text>
      </TouchableWithoutFeedback>
    </View>
  );
}

// --------------------------- Ble Pages --------------------------- \\

// Connect With a Bluetooth Device Page
// Navigate to buttonSelection when done or if it's already connected
function SelectDevice({ navigation }) {
  const [textArray, setTextArray] = useState([]);
  const [activeComponent, setActiveComponent] = useState("Scanning");
  const [selectedDevice, setSelectedDevice] = useState();
  const [showAlert, setAlert] = useState(false);

  // mount and unmount event handler
  useEffect( () => {
    console.log('Mount');
    asyncStartup();
    return () => {
      console.log('Unmount');
      BleCode.cleanUp();
    };
  }, []);

  // Start scanning all devices
  const asyncStartup = async () => {
    await AsyncCode.getDefaults();
    let defaults = AsyncCode.getAsyncDefaults();
    GLOBAL.BUTTON0KEY = defaults[0].button0Key;
    GLOBAL.BUTTON1KEY = defaults[0].button1Key;
    GLOBAL.BUTTON2KEY = defaults[0].button2Key;
    await BleCode.startUp();
    console.log("done");
  }

  // called every few seconds, gets the list of devices found
  const MINUTE_MS = 500;
  useEffect(() => {
    const interval = setInterval(() => {
      //updateTextArray")
      if(!BleCode.isScanning) {
        setTextArray(BleCode.getList());
        setActiveComponent("List");
      }
    }, MINUTE_MS);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [])

  // connects to a device and navigates to the data inputs page
  const connectAndChangePage = async(item) => {
    setActiveComponent("Loading");
    setSelectedDevice(item);
    let temp = await BleCode.connectAndTestPeripheral(item);
    console.log(temp);
    if(temp) {
      navigation.navigate('Data Inputs');
    }
    else {
      setAlert(true);
      BleCode.disconnectFromPeripheral();
    }
  }

  //Initiates the sorting problem.
  //TODO: occasionally causes a null item which crashes the app. Inconsistant; no clear clause
  const sortList = (list) => {
    const tempList = [];
    const noNameList = [];
    for(let i = 0; i < list.length; i++) {
      if(BleCode.getPeripheralName(list[i]) !== 'NO NAME') {
        tempList.push(list[i]);
      }
      else {
        noNameList.push(list[i]);
      }
    }
    if(tempList.length > 1) {
      quickSort(tempList, 0, tempList.length);
    }
    for(let i = 0; i < noNameList.length; i++) {
      tempList.push(noNameList[i]);
    }
    console.log(tempList);
    return tempList;
  }

  // Quicksort Algorithim Implementation modified from : https://www.geeksforgeeks.org/quick-sort/ 
  const swap = (arr,xp, yp)=>{
    var temp = arr[xp];
    arr[xp] = arr[yp];
    arr[yp] = temp;
  }

  function partition(arr, low, high) {
    // pivot
    let pivot = arr[high];

    // Index of smaller element and indicates the right position of pivot found so far
    let i = (low - 1);

    for (let j = low; j <= high - 1; j++) {
      // If current element is smaller than the pivot
      if (arr[j] < pivot) {
        // Increment index of smaller element
        i++;
        swap(arr, i, j);
      }
    }
    swap(arr, i + 1, high);
    return (i + 1);
  }

  function quickSort(arr, low, high) {
    if (low < high) {
      // pi is partitioning index, arr[p] is now at right place
      let pi = partition(arr, low, high);

      // Separately sort elements before partition and after partition
      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}> Select a BLE Device </Text>
        {activeComponent === 'List' ? (
          <View>
            <TouchableWithoutFeedback onPress={() => (BleCode.startScan(), setActiveComponent('Scanning'))}>
              <Text style={styles.button}> Refresh </Text>
            </TouchableWithoutFeedback>
            <View style={styles.bottomLine}></View>
            <FlatList name="List" data={textArray} renderItem={({item}) => 
              <TouchableWithoutFeedback onPress={() => connectAndChangePage(item)}>
                <View>
                  <View style={styles.buttonTask}>
                    <Text style={styles.smallLightText}> {BleCode.getPeripheralName(item)} </Text>
                    <Text style={styles.tinyLightText}> {item.id} </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>}
              keyExtractor={(item) => item.id}
            />
          </View>
        ) : activeComponent === 'Loading' ? (
          <Text name="Loading" style={styles.regularText}> {"Connecting to "+ BleCode.getPeripheralName(selectedDevice)} </Text>
        ) : activeComponent === 'Scanning' ? (
          <Text name="Loading" style={styles.regularText}> Scanning all nearbly Bluetooth Devices... </Text>
        ): null}
        
        <AwesomeAlert
          show={showAlert}
          showProgress={false}
          title="Connection Failure"
          message= {"Cannot connect to a device"}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="Okay"
          confirmButtonColor="#63ba83"
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed={() => { setAlert(false); }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Indicate which of the Device buttons maps to which graph.
function ButtonSelection({ navigation }) {
  // all the states to store the relevent information
  const [selectedOption0, setSelectedOption0] = useState();
  const [selectedOption1, setSelectedOption1] = useState();
  const [selectedOption2, setSelectedOption2] = useState();
  const [textArray, setTextArray] = useState([]);
  const [selectedOptions, setSelected]= useState();
  // button alert states for reference
  const [showAlert, setAlert] = useState(false);
  const [buttonText, setText] = useState("null");

  //on Load; restore stuff from Async Storage
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', (e) => {
      AsyncCode.restoreFromAsync();
      let textArray = AsyncCode.getTextArray();
      setTextArray(textArray);
      //enable if you butcher the defaults and need to reset them.
      //AsyncCode.resetDefaults();
      getStuff();
    });
    return unsubscribe;
  }, [navigation]);

  // Updates the defaults, needed to be async
  async function getStuff(){
    await AsyncCode.getDefaults();
    let defaults = AsyncCode.getAsyncDefaults();
    
    GLOBAL.BUTTON0KEY = defaults[0].button0Key;
    GLOBAL.BUTTON1KEY = defaults[0].button1Key;
    GLOBAL.BUTTON2KEY = defaults[0].button2Key;
    
    setSelectedOption0(defaults[0].button0Key);
    setSelectedOption1(defaults[0].button1Key);
    setSelectedOption2(defaults[0].button2Key);
    
    setSelected(defaults);
  }

  //Set up the items for the list
  const loadTypes = () => {
    return textArray.map(item => (
      <Picker.Item label={item.Title} value={item.Key} key={item.Key} style={styles.pickerDropdown}/>
    ))
  }

  // Sets the button inputs based on selected drop downs
  const buttonInputSet = (buttonNumber, buttonKey) => {
    let tempSelected = selectedOptions;
    if (buttonNumber == 0) {
      GLOBAL.BUTTON0KEY = buttonKey;
      tempSelected[0].button0Key = buttonKey;
    }
    else if (buttonNumber == 1) {
      GLOBAL.BUTTON1KEY = buttonKey;
      tempSelected[0].button1Key = buttonKey;
    }
    else if (buttonNumber == 2) {
      GLOBAL.BUTTON2KEY = buttonKey;
      tempSelected[0].button2Key = buttonKey;
    }
    setSelected(tempSelected);
    AsyncCode.updateDefaults(tempSelected);
  }

  // this throws the Alert
  const throwAlert = (clickedButton) => {
    setText(clickedButton);
    if(showAlert) {
      setAlert(false);
    }
    else {
      setAlert(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}> Buttons </Text>
        <TouchableWithoutFeedback onPress={() => (BleCode.disconnectFromPeripheral(), navigation.navigate('Home'))}>
          <View>
            <Text style={styles.button}> Disconnect from Connected Device</Text>
          </View>
        </TouchableWithoutFeedback>   
        <Text style={styles.header}> Graph Selection </Text>
        
        <View>
          <Text style={styles.regularText}> Button 0's data corresponds to: </Text>
          <Picker
            style={styles.picker}
            selectedValue={selectedOption0}
            mode="dropdown" // Android only
            onValueChange={(itemValue, itemIndex) => (setSelectedOption0(itemValue))}>
            <Picker.Item label="Pick One" value="null" style={styles.pickerDropdown}/>
            {loadTypes()}
          </Picker>
        </View>
        
        <View>
          <Text style={styles.regularText}> Button 1's data corresponds to: </Text>
          <Picker
            style={styles.picker}
            selectedValue={selectedOption1}
            mode="dropdown" // Android only
            onValueChange={(itemValue, itemIndex) => (setSelectedOption1(itemValue))}>
            <Picker.Item label="Pick One" value="null" style={styles.pickerDropdown}/>
            {loadTypes()}
          </Picker>
        </View>
        
        <View>
          <Text style={styles.regularText}> Button 2's data corresponds to: </Text>
          <Picker
            style={styles.picker}
            selectedValue={selectedOption2}
            mode="dropdown" // Android only
            onValueChange={(itemValue, itemIndex) => (setSelectedOption2(itemValue))}>
            <Picker.Item label="Pick One" value="null" style={styles.pickerDropdown}/>
            {loadTypes()}
          </Picker>
        </View>
        
        <View>
          <TouchableWithoutFeedback onPress={() => (navigation.navigate('Home'), buttonInputSet(0, selectedOption0), buttonInputSet(1, selectedOption1), buttonInputSet(2, selectedOption2))}>
              <Text style={styles.button}> Submit and Navigate to Homepage </Text>
          </TouchableWithoutFeedback>
        </View>
        
        <AwesomeAlert
          show={showAlert}
          showProgress={false}
          title="No Graph Detected"
          message= {"Select a graph for button " + buttonText}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="Okay"
          confirmButtonColor="#63ba83"
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed={() => { throwAlert(null); }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// --------------------------- Graph Library --------------------------- \\

function GraphLibrary({ navigation }) {
  //Code to display all the various graphs that can be selected
  const [alertText, setAlertText] = useState();
  const [alertTitle, setAlertTitle] = useState();
  const [alertImage, setAlertImage] = useState();
  
  const [alert, throwAlert] = useState(false);
  const [alertConfirm, throwAlertConfirm] = useState(false);

  const [graphType, setGraphType] = useState();

  const showAlert = (graph) => {
    setGraphType(graph.name);
    setAlertTitle(graph.name);
    setAlertText(graph.description);
    setAlertImage(graph.image);
    throwAlert(true);
  }

  const toNewGraph = () => {
    throwAlertConfirm(false); 
    throwAlert(false);
    navigation.replace("New Graph", { typeParam: graphType });
  }

  const customAlert = () => {
    return (
      <View>
        <Image source={alertImage} style={styles.graphIconBig}/>
        <Text style={styles.alertBody}> {alertText} </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <Text style={styles.title}> Graph Library </Text>
          <View style={styles.barLine}/>
          <View style={styles.fixToText}>
            {graphLibrary.map((graph, i) => {
              return (
                <View key={i}>
                  <TouchableWithoutFeedback onPress={() => showAlert(graph)}>
                    <Image source={graph.image} style={styles.graphIcon}/>
                  </TouchableWithoutFeedback>
                  <Text style={styles.regularText}> {graph.name} </Text>
                </View>
              );
            })}
          </View>
        </View>

        <AwesomeAlert
          show={alert}
          title={alertTitle}
          showConfirmButton={true}
          confirmText={"Use This Graph"}
          confirmButtonColor="#63ba83"
          contentContainerStyle={styles.alert}
          titleStyle={styles.alertText}
          customView={ customAlert() }
          onConfirmPressed={() => { throwAlertConfirm(true); }}
          onDismiss={() => { throwAlert(false); }}
        />

        <AwesomeAlert
          show = {alertConfirm}
          showProgress = {false}
          title = "Confirm Submission"
          message= "Do You Want to Make a New Graph?"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showConfirmButton={true}
          showCancelButton={true}
          confirmButtonColor="#63ba83"
          cancelButtonColor="#E07A5F"
          confirmText="Confirm"
          cancelText="Cancel"
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed= {() => { toNewGraph(); }}
          onCancelPressed= {()=> { throwAlertConfirm(false); }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}


// --------------------------- Graph Pages --------------------------- \\

// used to detect if an alert is thrown
let refresh = false;

// Displays a list of graphs based off of what you have in Async Storage.
// Allows you to add to the storage
// Pulls data from Async Storage
function SelectData({navigation}) {
  // stores all the array objects
  const [asyncStorage, setAsyncStorage] = useState([]);
  const [alert, throwAlert] = useState(false);
  const [connectionAlert, throwConnectionAlert] = useState(false);
  
  // states for the alerts
  const [key, setKey] = useState("");
  const [text, setText]= useState('');

  //on Load; restore stuff from Async Storage
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', (e) => {
      AsyncCode.restoreFromAsync();
      setAsyncStorage(AsyncCode.getTextArray());
    });
    return unsubscribe;
  }, [navigation]);

  // used to change pages and pass the appropriate information to the graph page.
  // Param, the raw file of the graph being navigated too
  const navigateAndSendDataGraph = (item) =>{
    if(BleCode.isConnected()) {
      navigation.navigate("Graph", { keyParam: item.Key });
    }
    else {
      setKey(item.Key);
      throwConnectionAlert(true);
    }
  }

  //updates the data of the list of graphs, specifically removes items
  // if toDo = "Remove", removes the alert. otherwise dismisses the alert
  const updateData = async(toDo) => {
    if(toDo == "remove") {
      AsyncCode.removeItem(key);
      if(GLOBAL.BUTTON0KEY == key) {
        Console.log("Same Key");
        GLOBAL.BUTTON0KEY == null;
      }
      if(GLOBAL.BUTTON1KEY == key) {
        Console.log("Same Key");
        GLOBAL.BUTTON0KEY == null;
      }
      if(GLOBAL.BUTTON2KEY == key) {
        Console.log("Same Key");
        GLOBAL.BUTTON0KEY == null;
      }
    }
    AsyncCode.restoreFromAsync();
    setAsyncStorage(AsyncCode.getTextArray());
    throwAlert(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <Text style={styles.title}> Graphs </Text>
          {asyncStorage.map((graph, i) => {
            return (
              <View key={i} style={styles.bottomLine}>
                <View style={styles.buttonBox}>
                  <TouchableWithoutFeedback onPress={() => { navigateAndSendDataGraph(graph); }}>
                    <Text style={styles.button}> {graph.Title} </Text>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={() => {setKey(graph.Key); throwAlert(true); setAsyncStorage(AsyncCode.getTextArray()); refresh=false;}}>
                    <Text style={styles.warningButton}> {"Delete " + graph.Title} </Text>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            );
          })}

          <Text style={styles.header}> Add Graph </Text>
          <TouchableWithoutFeedback onPress={() => {navigation.navigate('New Graph');}}>
            <Text style={styles.smallButton}> Create New Graph </Text>
          </TouchableWithoutFeedback>
        </View>
          
        {/* Delete Graph */}
        <AwesomeAlert
          show={alert}
          showProgress={false}
          title="Delete Graph"
          message= {"Confirm Deletion For This Graph?"}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={true}
          showCancelButton={true}
          showConfirmButton={true}
          confirmText="Delete"
          confirmButtonColor="#E07A5F"
          cancelButtonColor='#63ba83'
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed={() => { updateData("remove"); }}
          onCancelPressed={()=> { setAsyncStorage(AsyncCode.getTextArray()); throwAlert(false); }}
        />
        
        {/* Not Connected */}
        <AwesomeAlert
          show={connectionAlert}
          showProgress={false}
          title="Unconnected to a Device"
          message= {"Not connected to a device"}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="Continue"
          confirmButtonColor="#63ba83"
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed={() => { throwConnectionAlert(false); navigation.navigate('Graph', {keyParam: key}) ; }}
          onDismiss={() => { throwConnectionAlert(false); }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

//New Graph Screen Code
function NewGraph({ route, navigation }) {
  const { typeParam } = route.params;
  
  //Updates variables with entered data
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState(typeParam);
  const [buttons, setButtons] = useState(["Button 0", "Button 1", "Button 2"]);

  //States for the alerts
  const [alertText, setAlertText] = useState("");
  const [alert, throwAlert] = useState(false);
  const [alertConfirm, throwAlertConfirm] = useState(false);

  const [asyncStorage, setAsyncStorage] = useState();
  
  //On load, restore data from storage
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      AsyncCode.restoreFromAsync();
      setAsyncStorage(AsyncCode.getTextArray());
    });
    return unsubscribe;
  }, [navigation]);

  //Checks if the entered title is valid
  const checkGraph = () => {
    if(!name) {
      setAlertText("Please Enter A Graph Title");
      throwAlert(true);
      console.log("No Name");
      return;
    }
    
    if (!type) {
      setAlertText("Please Select A Graph Type");
      throwAlert(true);
      console.log("No Type");
      return;
    }
    
    for (let i = 0; i < asyncStorage.length; i++) {
      console.log(asyncStorage[i].Title);
      if(name == asyncStorage[i].Title) {
        setAlertText("Graph Title Already In Use");
        throwAlert(true);
        console.log("Same Name");
        return;
      }
    }
    
    throwAlertConfirm(true);
  }

  const updateButtons = (text, index) => {
    let tempButtons = buttons;
    tempButtons[index] = text;
    setButtons(tempButtons);
  }

  const addButtons = () => {
    //Code to be added to allow adding/removing buttons
  }

  //Adds the new graph to storage and sends user back to graph list
  const addGraph = () => {
    AsyncCode.submitHandler(name, desc, type, buttons);
    navigation.replace('My Graphs');
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <Text style={styles.title}> New Graph </Text>
          
          <Text style={styles.subheader}> Graph Name </Text>
          <TextInput placeholder="Graph Name" style={styles.input} onChangeText={setName} value={name} editable maxLength={100}/>
          
          <Text style={styles.subheader}> Graph Description </Text>
          <TextInput multiline numberOfLines={4} placeholder="Graph Description" style={styles.input} onChangeText={setDesc} value={desc} editable maxLength={1000}/>

          <Text style={styles.subheader}> Graph Type </Text>
          <Picker style={styles.picker} selectedValue={type} mode="dropdown" onValueChange={(item) => (setType(item))}>
            {graphOptionsNew}
          </Picker>

          <Text style={styles.subheader}> Button Names </Text>
          {buttons.map((button, i) => {
            return (
              <View key={i}>
                <TextInput placeholder={`Button ${i}`} style={styles.input} onChangeText={(text) => updateButtons(text, i)} editable maxLength={50}/>
              </View>
            );
          })}
          
          <TouchableWithoutFeedback onPress={() => { checkGraph() }}>
            <Text style={styles.smallButton}> Submit </Text>
          </TouchableWithoutFeedback>
        </View>

        {/*Invalid Title Error*/}
        <AwesomeAlert
          show={alert}
          showProgress={false}
          title="New Graph Error"
          message= {alertText}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showConfirmButton={true}
          confirmButtonColor="#63ba83"
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed= {() => { throwAlert(false); }}
          onCancelPressed= {()=> { throwAlert(false); }}
        />

        {/*Confirmation of All Data Fields*/}
        <AwesomeAlert
          show = {alertConfirm}
          title = "Confirm Submission"
          message= "Are All Fields Correct?"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showConfirmButton={true}
          showCancelButton={true}
          confirmButtonColor="#63ba83"
          cancelButtonColor="#E07A5F"
          confirmText="Confirm"
          cancelText="Cancel"
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed= {() => { throwAlertConfirm(false); addGraph(); }}
          onCancelPressed= {()=> { throwAlertConfirm(false); }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

// Displays a graph
function Graph({ route, navigation }) {
  // put the json data in here
  const { keyParam } = route.params;
  let graphParam = AsyncCode.getGraph(keyParam);

  const [graph, setGraph] = useState(graphParam);
  const [graphType, setGraphType] = useState(graphParam.GraphType);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlert, setAlert] = useState(false);
  const [alertFailed, setFailedAlert] = useState(false);

  //States for the alerts
  const [alertMenu, throwAlertMenu] = useState(false);
  const [alertDelete, throwAlertDelete] = useState(false);

  // this automatically checks the data every <MINUTE_MS> milliseconds.
  const MINUTE_MS = 250;
  useEffect(() => {
    const interval = setInterval(() => { checkIfAsyncChanged(); }, MINUTE_MS);
    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [])

  // Stuff done on page load.
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', (e) => {
      setGraph(AsyncCode.getGraph(keyParam));
      setGraphType(AsyncCode.getGraph(keyParam).GraphType);
      toggleRefreshChild();
    });
    return unsubscribe;
  }, [navigation]);

  // triggers a rerender for the child components
  const toggleRefreshChild = () => {
    // attempting to trigger re-render
    console.log("start refreshing");
    setRefreshing(true);
    wait(25).then(() => { setRefreshing(false), console.log("Done Refreshing") });
  };

  // waits x milliseconds then calls a function. Used for refreshing
  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  //exports async data to an email
  const exportData = async () => {
    console.log("Called");
    let subject = `${graph.Title}'s Data`;
    let message = `"Graph Name: ${graph.Title}`;
    message += "\n\nButtons"
    for (let i = 0; i < graph.Buttons.length; i++) {
      message += `\nButton ${graph.Buttons[i].ButtonID}: '${graph.Buttons[i].ButtonName}'`;
    }
    message += "\n\nData Entries"
    for (let i = 0; i < graph.Data.length; i++) {
      message += `"\nData Point: ${graph.Data[i].Date.toLocaleString()} | Button: ${graph.Data[i].ButtonID}`;
    }
    console.log("parsed");
    
    const to = [] // string or array of email addresses
      email(to, {
        // Optional additional arguments
        subject: subject,
        body: message,
        checkCanOpen: false // Call Linking.canOpenURL prior to Linking.openURL
      }).catch(() => {
        setFailedAlert(true);
      })
  }

  let checking = false;
  //checks if Async has been flagged as changed and refreshes info and children
  const checkIfAsyncChanged = async() => {
    if (checking) {
      console.log("already checking");
      return;
    }
    if(GLOBAL.BUTTONPRESSED) {
      checking = true;
      setGraph(AsyncCode.getGraph(keyParam));
      checking = false;
      GLOBAL.BUTTONPRESSED = false;
      console.log("done");
      toggleRefreshChild();
      // this.forceUpdate();
    }
  }

  const ref = useRef();
  //Checks for permissions for the saving to Camera roll
  const checkPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((r1) => {
        if (r1) {
          console.log('Write External Storage permission is OK');
          return;
        }
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((r2) => {
          if (r2) {
            console.log('User accept');
            return
          }
          console.log('User refuse');
          setFailedAlert(true);
        });
      });
    }
  }

  //when an image is captures this is called. 
  // it checks permissions then saves to the camera roll
  const onImageLoad = useCallback(() => {
    checkPermissions();
    ref.current.capture().then(uri => {
      CameraRoll.save(uri);
      setAlert(true);
    }).catch(() => {
      setFailedAlert(true);
    })
  }, []);

  const deleteGraph = () => {
    AsyncCode.removeItem(keyParam);
    if(GLOBAL.BUTTON0KEY == keyParam) {
      Console.log("Same Key");
      GLOBAL.BUTTON0KEY == null;
    }
    if(GLOBAL.BUTTON1KEY == keyParam) {
      Console.log("Same Key");
      GLOBAL.BUTTON0KEY == null;
    }
    if(GLOBAL.BUTTON2KEY == keyParam) {
      Console.log("Same Key");
      GLOBAL.BUTTON0KEY == null;
    }
    AsyncCode.restoreFromAsync();
    navigation.pop();
  }

  const buttonPush = async (buttonPushed) =>{
    console.log(buttonPushed + " was pushed");
    let date = new Date();
    let entry = {Date: date, ButtonID: buttonPushed};
    AsyncCode.addToData(keyParam, entry);
    GLOBAL.BUTTONPRESSED = true;
  }

  const customAlert = () => {
    return (
      <View>
        <TouchableOpacity opacity={0.5} onPress={() => { navigation.navigate('Graph Settings', { keyParam: keyParam }); throwAlertMenu(false); }}>
          <Text style={styles.lightButton}> Graph Settings </Text>
        </TouchableOpacity>
        <TouchableOpacity opacity={0.5} onPress={() => { navigation.navigate('Edit Data', { keyParam: keyParam }); throwAlertMenu(false); }}>
          <Text style={styles.lightButton}> Edit Data Points </Text>
        </TouchableOpacity>
        <TouchableOpacity opacity={0.5} onPress={() => { navigation.navigate('Data Info', { keyParam: keyParam }); throwAlertMenu(false); }}>
          <Text style={styles.lightButton}> Data Info </Text>
        </TouchableOpacity>
        <TouchableOpacity opacity={0.5} onPress={() => { exportData(); throwAlertMenu(false); }}>
          <Text style={styles.lightButton}> Export Data </Text>
        </TouchableOpacity>
        <View style={{marginVertical: 15}}/>
        <TouchableOpacity opacity={0.5} onPress={() => { throwAlertMenu(false); throwAlertDelete(true); }}>
          <Text style={styles.warningButton}> Delete Graph </Text>
        </TouchableOpacity>
      </View>
    )
  }

  React.useEffect( () => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableWithoutFeedback onPress={() => { throwAlertMenu(true); }}>
          <Image
            source={require('./assets/SettingsIcon.png')}
            style={styles.headerIcon}
          />
        </TouchableWithoutFeedback>
      )
    })
  }, [navigation, graph]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ViewShot ref={ref}>
          <Text style={styles.title}>{graph.Title}</Text>
          <Text style={styles.regularText}> {graph.Description}</Text>
          
          <GraphSwitch active={graphType}>
            <HeatMap rawData={graph} styles={styles} name="Heat Map" /> 
            <BarGraph rawData={graph} styles={styles} name="Bar Graph"  />
            <ButtonOrder rawData={graph} styles={styles} name="Button Order"  />
            <Timeline rawData={graph} styles={styles} name="Timeline" />
            <Flowers rawData={graph} styles={styles} name="Flowers" />
            <Triskelion rawData={graph} styles={styles} name="Triskelion" />
            <ChessClock rawData={graph} styles={styles} name="Chess Clock"/>
            <StockMarket rawData={graph} styles={styles} name="Stock Market"/>
            <Dandelion rawData={graph} styles={styles} name="Dandelion" />
          </GraphSwitch>
        </ViewShot>
        
        <View>
          <View style={styles.barLine}></View>
          <Text style={styles.header}> Add Data </Text>

          {graph.Buttons.map((button, i) => {
            return (
              <View key={i}>
                <TouchableOpacity opacity={0.5} onPress={() => buttonPush(button.ButtonID)}>
                  <Text style={styles.lightButton}> {button.ButtonName} </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        
          {/* <Text style={styles.subheader}> Export Data</Text>
          <TouchableWithoutFeedback onPress={()=>(exportData())}>
          <Text style={styles.smallButton}> Export Data to Email </Text>
            </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={onImageLoad}>
            <Text style={styles.smallButton}>Export to Camera Roll</Text>
          </TouchableWithoutFeedback>*/}
          
        </View>

        <AwesomeAlert
          show={alertMenu}
          title={"Graph Options"}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={false}
          contentContainerStyle={styles.alert}
          titleStyle={styles.alertText}
          customView={ customAlert() }
          onDismiss={() => { throwAlertMenu(false); }}
        />

        <AwesomeAlert
          show={alertDelete}
          title={"Delete Graph"}
          message= {"Are You Sure You Want to Delete This Graph?"}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={true}
          showConfirmButton={true}
          showCancelButton={true}
          confirmText="Delete"
          confirmButtonColor="#E07A5F"
          cancelButtonColor='#63ba83'
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed={() => { deleteGraph(); throwAlertDelete(false); }}
          onCancelPressed={()=> { throwAlertDelete(false); }}
        />
          
        <AwesomeAlert
          show={showAlert}
          showProgress={false}
          title={"Graph Saved"}
          message={"Graph Saved to Camera Roll"}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="Okay"
          confirmButtonColor="#63ba83"
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed={() => { setAlert(false); }}
        />

        <AwesomeAlert
          show={alertFailed}
          showProgress={false}
          title={"Failure"}
          message= {"Graph Saved to Camera Roll"}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="Okay"
          confirmButtonColor="#63ba83"
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed={() => { setFailedAlert(false); }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Alters the data set and some graph settings
function GraphSettings({ route, navigation }) {
  const { keyParam } = route.params;
  let graph = AsyncCode.getGraph(keyParam);

  const [name, setName] = useState(graph.Title);
  const [desc, setDesc] = useState(graph.Description);
  const [type, setType] = useState(graph.GraphType);
  const [buttons, setButtons] = useState(graph.Buttons);

  const [alert, throwAlert] = useState(false);
  const [alertConfirm, throwAlertConfirm] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertText, setAlertText] = useState("");

  const [asyncStorage, setAsyncStorage] = useState([]);

  // Stuff done on page load.
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', (e) => {
      AsyncCode.restoreFromAsync();
      setAsyncStorage(AsyncCode.getTextArray());
    });
    return unsubscribe;
  }, [navigation]);

  const editButtons = (text, id) => {
    let ButtonsTemp = buttons;
    ButtonsTemp[id].ButtonName = text;
    setButtons(ButtonsTemp);
  }

  const checkGraph = () => {
    if (graph.Title != name) {
      setAlertTitle("Invalid Title");
      if(!name) {
        setAlertText("Please Enter A Graph Title");
        throwAlert(true);
        console.log("No Name");
        return;
      }
  
      for (let i = 0; i < asyncStorage.length; i++) {
        console.log(asyncStorage[i].Title);
        if(name == asyncStorage[i].Title) {
          setAlertText("Graph Title Already In Use");
          throwAlert(true);
          console.log("Same Name");
          return;
        }
      }
    }

    for (let i = 0; i < buttons.length; i++) {
      if (!buttons[i].ButtonName) {
        setAlertTitle("Invalid Button Name");
        setAlertText("Please Enter A Button Name");
        throwAlert(true);
        console.log("No Button Name")
        return;
      }
    }

    throwAlertConfirm(true);
  }

  const submitChanges = () => {
    AsyncCode.updateGraph(name, desc, type, buttons, keyParam);
    navigation.pop();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <Text style={styles.title}> Graph Settings </Text>
          
          <Text style={styles.subheader}> Graph Name </Text>
          <TextInput numberOfLines={1} defaultValue={name} style={styles.input} onChangeText={setName} value={name} editable maxLength={100}/>
          
          <Text style={styles.subheader}> Graph Description </Text>
          <TextInput multiline numberOfLines={4} defaultValue={desc} style={styles.input} onChangeText={setDesc} value={desc} editable maxLength={1000}/>

          <Text style={styles.subheader}> Graph Type </Text>
          <Picker style={styles.picker} selectedValue={type} mode="dropdown" onValueChange={setType}>
            {graphOptions}
          </Picker>

          <Text style={styles.subheader}> Button Names </Text>
          {buttons.map((button, i) => {
            return (
              <View key={i}>
                <TextInput numberOfLines={1} defaultValue={button.ButtonName} style={styles.input} onChangeText={(text) => (editButtons(text, button.ButtonID))} editable maxLength={50}/>
              </View>
            );
          })}
          
          <TouchableOpacity opacity={0.2} onPress={() => { checkGraph() }}>
            <Text style={styles.smallButton}> Submit </Text>
          </TouchableOpacity>
        </View>

        <AwesomeAlert
          show={alert}
          showProgress={false}
          title={alertTitle}
          message= {alertText}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showConfirmButton={true}
          confirmButtonColor="#63ba83"
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed= {() => { throwAlert(false); }}
          onCancelPressed= {()=> { throwAlert(false); }}
        />
        
        <AwesomeAlert
          show = {alertConfirm}
          showProgress = {false}
          title = "Confirm Changes"
          message= "Are All Fields Correct?"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={true}
          showConfirmButton={true}
          showCancelButton={true}
          confirmButtonColor="#63ba83"
          cancelButtonColor="#E07A5F"
          confirmText="Confirm"
          cancelText="Cancel"
          contentContainerStyle={styles.alert}
          messageStyle={styles.alertBody}
          titleStyle={styles.alertText}
          onConfirmPressed= {() => { throwAlertConfirm(false); submitChanges(); }}
          onCancelPressed= {()=> { throwAlertConfirm(false); }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

//Allows the user to modify specific data entries
function EditData({ route, navigation }) {
  const { keyParam } = route.params;
  let graph = AsyncCode.getGraph(keyParam);

  const [curData, setCurData] = useState(graph.Data);
  const [filteredData, setFilteredData] = useState(graph.Data);

  const [alertDelete, throwAlertDelete] = useState(false);
  const [alertSuccess, throwAlertSuccess] = useState(false);

  const [dataDelete, setDataDelete] = useState();
  const [modal, throwModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [dataPoint, setDataPoint] = useState();
  const [dataDesc, setDataDesc] = useState("");

  const [searchDate, setSearchDate] = useState(["", "", ""]);
  let placeholders = ["Day", "Month", "Year"];
  let lengths = [2, 2, 4];

  //Updates the search parameters
  const updateSearch = (date, index) => {
    let tempSearch = searchDate;
    tempSearch[index] = date;
    setSearchDate(tempSearch);
  }

  //Filters out data points based on the current search parameters
  const filterData = async() => {
    let filter = [];
    for (let i = 0; i < curData.length; i++) {
      let matchSearch = true;
      let dateValues = [curData[i].Date.getDate(), curData[i].Date.getMonth() + 1, curData[i].Date.getFullYear()];
      
      for (let j = 0; j < searchDate.length; j++) {
        if (searchDate[j] && searchDate[j] != dateValues[j]) {
          matchSearch = false;
        }
      }
      
      if (matchSearch) {
        filter.push(curData[i]);
      }

      setFilteredData(filter);
    }
  }

  // flags a point to be deleted
  const deleteDataPoint = () => {
    AsyncCode.removeDataPoint(keyParam, dataDelete);
    throwAlertDelete(false);
    setCurData(AsyncCode.getGraph(keyParam).Data);
    filterData();
  }

  //Adds a description to a data entry
  const addDataPointDescription = async(item, description) => {
    throwAlertSuccess(true);
    AsyncCode.changeDataPointDescription(keyParam, item, description);
    setCurData(AsyncCode.getGraph(keyParam).Data);
    filterData();
    // if(description.length >= 1) {
    //   setModalVisible(false);
    //   setShowError(false);
    //   let temp = AsyncCode.changeDataPointDescription(RawData.Key, item, description);
    //   setCurData(temp.Data);
    //   setFilteredData(temp.Data);
    //   GLOBAL.ITEM = temp;
    //   throwSuccessAlert(true);
    // }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <Text style={styles.title}> Edit Data </Text>
          <Text style={styles.subheader}> Date Filter </Text>
          <View style={styles.fixToText}>
            {searchDate.map((element, i) => {
              return (
                <TextInput key={i} onChangeText={text => (updateSearch(text, i), filterData())} placeholder={placeholders[i]} style={styles.dayInput} editable maxLength={lengths[i]}/>
              );
            })}
          </View>
          <View style={styles.barLine}></View>

          {filteredData.map((entry, i) => {
            return (
              <View key={i} style={styles.barLine}>
                <Text style={styles.tinyText}> {entry.Date.toLocaleString()} </Text>
                <Text style={styles.tinyText}> {"Button: " + graph.Buttons[entry.ButtonID].ButtonName} </Text>
                <View style={styles.fixToText}>
                  <TouchableWithoutFeedback onPress={() => { setDataPoint(entry); setModalTitle(entry.Date.toLocaleString()); throwModal(true); }}>
                    <Text style={styles.lightButton}> Add Description </Text>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={() => { setDataDelete(entry); throwAlertDelete(true); }}>
                    <Text style={styles.warningButton}> Delete </Text>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            );
          })}
          
          <AwesomeAlert
            show={alertDelete}
            title="Delete Data"
            message= {"Delete This Data Point?"}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            confirmText="Delete"
            confirmButtonColor="#63ba83"
            contentContainerStyle={styles.alert}
            messageStyle={styles.alertBody}
            titleStyle={styles.alertText}
            onConfirmPressed={() => { deleteDataPoint(); }}
            onCancelPressed={()=> { throwAlertDelete(false); }}
          />
        
          <AwesomeAlert
            show={alertSuccess}
            showProgress={false}
            title={"Action Successful"}
            message= {"Description Added"}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showConfirmButton={true}
            confirmText="Okay"
            confirmButtonColor="#63ba83"
            contentContainerStyle={styles.alert}
            messageStyle={styles.alertBody}
            titleStyle={styles.alertText}
            onConfirmPressed={() => { throwAlertSuccess(false); throwModal(false); }}
          />

          <Modal animationType="Slide" transparent={true} visible={modal}>
            <View style={styles.modalBox}>
              <Text style={styles.header}> {modalTitle} </Text>
              <Text style={styles.subheader}> Set Description </Text>
              
              <TextInput multiline numberOfLines={4} onChangeText={text => setDataDesc(text)} placeholder="Data Description" style={styles.input} editable maxLength={5000}/>

              <View style={styles.fixToText}>
                <TouchableOpacity onPress={() => (addDataPointDescription(dataPoint, dataDesc))}>
                  <Text style={styles.smallButton}> Submit </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => (throwModal(false))}>
                  <Text style={styles.warningButton}> Cancel </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

//Displays any data descriptions present in the current graph
function DataInfo({ route, navigation }) {
  const { keyParam } = route.params;
  let graph = AsyncCode.getGraph(keyParam);
  const [tableData, setTableData] = useState([]);
  
  // Stuff done on page load.
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', (e) => {
      //Gathers any descriptions in the dataset
      let descriptions = [];
      for (let i = 0; i < graph.Data.length; i++) {
        let entry = graph.Data[i];
        if (entry.Description) {
          descriptions.push([entry.Date.toLocaleDateString(), graph.Buttons[entry.ButtonID].ButtonName, entry.Description]);
        }
      }
      setTableData(descriptions);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <Text style={styles.title}> Data Info </Text>
          <Table borderStyle={{borderWidth: 2, borderColor:"#343434"}}>
            <Row data={["Date", "Button", "Description"]} style={styles.tableHead} textStyle={styles.tableHeadText}/>
            <Rows data={tableData} textStyle={styles.tableText}/>
          </Table>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --------------------------- Information Pages --------------------------- \\

// About page
// Links to COMSCI and CAT Lab website
function About({navigation}) {
  const ref = useRef();

  // navigates to the CAT lab website
  const sendToCATWebsite = async () => {
    //TODO: when website's live add a link to it
  }

  // navigates to the Comsci website
  const sendToCSCIWebsite = async () => {
    console.log("Called");
    let uri = "https://compsci.cofc.edu/"
    const supported = await Linking.canOpenURL(uri);

    if (supported) {
      await Linking.openURL(uri);
    } 
    else {
      console.log(`Don't know how to open the URL`);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}> About </Text>
      <Text style={styles.regularText}> MYdata was developed as wearable technology to empower people to collect data about their daily lives and an accompanying application to process that data. </Text>
      <Text style={styles.regularText}> This application was developed as a summer research project at the College of Charleston's CAT Lab by Professor Schoeman and Jo Jackley. </Text>
      <Text style={styles.regularText}> Thank you to the School of Science and Mathmatics and the Computer Science Department of the College of Charleston! </Text>
      <TouchableWithoutFeedback onPress={() => sendToCSCIWebsite()}>
        <Text style={styles.blueButton}>CSCI Website</Text>
      </TouchableWithoutFeedback>
      {/*
      <TouchableWithoutFeedback onPress={() => sendToCATWebsite()}>
        <Text style={styles.blueButton}>CAT Lab Website</Text>
      </TouchableWithoutFeedback>
      */}
    </View>
  );
}

// Settings Page
// Disabled and currently unused
function Settings({navigation}) {

  return (
    <View style={styles.background}>
      <Text style={styles.header}>More to Come! </Text>
    </View>
  );
}