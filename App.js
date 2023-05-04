// React Native Imports
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ImageBackground, LogBox, Text, View, FlatList, TouchableWithoutFeedback, TouchableOpacity, ScrollView, StyleSheet, Image, NativeModules, NativeEventEmitter, SectionList, TextInput, Appearance, Dimensions, Linking, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PermissionsAndroid, Platform, BackHandler } from "react-native";

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
import HeatMap from './components/GraphLibraries/heatGraph.js';
import ButtonOrder from "./components/GraphLibraries/buttonOrderPressed.js"
import TimesPerDay from './components/GraphLibraries/timePressedEachDay.js';
import FlowerGraph from './components/GraphLibraries/FlowerGraph.js';
import Triskelion from './components/GraphLibraries/triskelion.js';
import ChessClock from './components/GraphLibraries/chessClock.js';
import ButtonPressedPerDay from './components/GraphLibraries/EachButtonPressedPerDay.js';
import Dandelion from "./components/GraphLibraries/dandelion.js";
 
const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

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
  { name: "Stock Market", image: require('./assets/TotalButtons.png'), description: "Displays the number of times each button was pressed each day" },
  { name: "Timeline", image: require('./assets/Timeline.png'), description: "Displays when buttons are pressed each day." },
  { name: "Triskelion", image: require('./assets/Knot.png'), description: "Displays the number of button pairs pressed." },
]

//List of graphs for dropdowns
const graphOptions = [
];
const graphOptionsNew = [
  <Picker.Item label={"Set Graph Type"} value={null} style={styles.pickerDropdown}/>
];

//List of graph descriptions
const graphDescriptions = [
];

//Populates graphoptions and graphdescriptions from initial list
for (let i = 0; i < graphLibrary.length; i++) {
  let graph = graphLibrary[i];
  graphOptions.push(<Picker.Item label={graph.name} value={graph.name} style={styles.pickerDropdown}/>);
  graphOptionsNew.push(<Picker.Item label={graph.name} value={graph.name} style={styles.pickerDropdown}/>);
  graphDescriptions.push(<Text style={styles.tinyText} name={graph.name}> {graph.description} </Text>);
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
      styles=darkStyles;
    }

    // AsyncCode.addBigData();
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
          <Stack.Screen name="Graph Library"  component={GraphLibrary}    options={backgroundDefault}/>
          <Stack.Screen name="My Graphs"      component={SelectData}      options={backgroundDefault}/>
          <Stack.Screen name="New Graph"      component={NewGraph}        options={backgroundDefault} initialParams={{ typeParam: null }}/>
          <Stack.Screen name="Settings"       component={Settings}        options={backgroundDefault}/>
          <Stack.Screen name="Select Device"  component={SelectDevice}    options={backgroundDefault}/>
          <Stack.Screen name="Data Inputs"    component={ButtonSelection} options={backgroundDefault}/>
          <Stack.Screen name="Graph"          component={Graph}           options={backgroundDefault}/>
          <Stack.Screen name="Graph Settings" component={GraphSettings}   options={backgroundDefault}/>
          <Stack.Screen name="Edit Data"      component={EditData}        options={backgroundDefault}/>
          <Stack.Screen name="About"          component={About}           options={backgroundDefault}/>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

// Home Screen
// Navigates to the other pages, and starts loading
function HomeScreen({navigation}) {
  const [stateSwitch, updateStateSwitch] = useState(false);
  const switchState = () => {updateStateSwitch(previousState => !previousState);}
  
  // this ensures that the async will be loaded in time for other pages to ensure.
  // Happens on page load
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', (e) => {
      switchState();
      AsyncCode.restoreFromAsync();
    });
    return unsubscribe;
  }, [navigation]);

  //checks if a device is connected before deciding which page between Data Inputs and Select Device
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
      //TODO: THrow alert
    }
  }

  React.useEffect( () => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableWithoutFeedback onPress={() => {checkAndNavigate()}}>
          <Image
            source={require('./assets/SettingsIcon.png')}
            style={styles.headerIcon}
          />
        </TouchableWithoutFeedback>
      ),
      headerRight: () => (
        <TouchableWithoutFeedback onPress={() => navigation.navigate('About')}>
          <Image
            source={require('./assets/InfoIcon.png')}
            style={styles.headerIcon}
          />
        </TouchableWithoutFeedback>
      )
    })
  }, [navigation]);

  // returns the visualizations.
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
function SelectDevice({navigation}) {
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
  const buttonInputSet = (buttonNumber,buttonKey) => {
    let tempSelected = selectedOptions;
    if(buttonNumber == 0) {
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

function GraphLibrary({navigation}) {
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
    navigation.navigate("New Graph", { typeParam: graphType });
  }

  const customAlert = () => {
    return (
      <View>
        <Image
          source={alertImage}
          style={styles.graphIconBig}
        />
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
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
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
  const [tempkey, setKey] = useState("");
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
    GLOBAL.ITEM = item;
    GLOBAL.KEY = item.Key;
    GLOBAL.TITLES = item.Title;
    if(BleCode.isConnected()) {
      navigation.navigate('Graph');
    }
    else {
      throwConnectionAlert(true);
    }
  }

  //updates the data of the list of graphs, specifically removes items
  // if toDo = "Remove", removes the alert. otherwise dismisses the alert
  const updateData = async(toDo) => {
    if(toDo == "remove") {
      AsyncCode.removeItem(tempkey);
      if(GLOBAL.BUTTON0KEY == tempkey) {
        Console.log("Same Key");
        GLOBAL.BUTTON0KEY == null;
      }
      if(GLOBAL.BUTTON1KEY == tempkey) {
        Console.log("Same Key");
        GLOBAL.BUTTON0KEY == null;
      }
      if(GLOBAL.BUTTON2KEY == tempkey) {
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
                  <TouchableWithoutFeedback onPress={() => {navigateAndSendDataGraph(graph);}}>
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
          message= {"Are you sure you wish to delete the graph?"}
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
          onConfirmPressed={() => { throwConnectionAlert(false); navigation.navigate('Graph', {keyParam: GLOBAL.KEY}) ; }}
          onDismiss={() => { throwConnectionAlert(false); }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

//New Graph Screen Code
function NewGraph({ route, navigation }) {
  //Updates variables with entered data
  const {typeParam} = route.params;
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState(typeParam);
  const [butt0, setButt0] = useState("Button 0");
  const [butt1, setButt1] = useState("Button 1");
  const [butt2, setButt2] = useState("Button 2");

  //States for the alerts
  const [alertText, setAlertText] = useState("");
  const [alert, throwAlert] = useState(false);
  const [alertConfirm, throwAlertConfirm] = useState(false);

  const [thisState, setThisState]= useState({textArray: []});
  
  //On load, restore data from storage
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      AsyncCode.restoreFromAsync();
      setThisState({textArray:AsyncCode.getTextArray()});
    });
    return unsubscribe;
  }, [navigation]);

  //Updates the data in the storage 
  const updateData = async() => {
    AsyncCode.restoreFromAsync();
    setThisState({showAlert:false, textArray:AsyncCode.getTextArray()});
  }

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
    
    for (let i = 0; i < thisState.textArray.length; i++) {
      console.log(thisState.textArray[i].Title);
      if(name == thisState.textArray[i].Title) {
        setAlertText("Graph Title Already In Use");
        throwAlert(true);
        console.log("Same Name");
        return;
      }
    }
    
    throwAlertConfirm(true);
  }

  //Adds the new graph to storage and sends user back to graph list
  const addGraph = () => {
    let buttons = [butt0, butt1, butt2];
    AsyncCode.submitHandler(name, desc, type, buttons);
    updateData();
    navigation.navigate('My Graphs');
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <Text style={styles.title}> New Graph </Text>
          
          <Text style={styles.subheader}> Graph Name </Text>
          <TextInput multiline numberOfLines={1} placeholder="Graph Name" style={styles.input} onChangeText={setName} value={name} editable maxLength={100}/>
          
          <Text style={styles.subheader}> Graph Description </Text>
          <TextInput multiline numberOfLines={4} placeholder="Graph Description" style={styles.input} onChangeText={setDesc} value={desc} editable maxLength={1000}/>

          <Text style={styles.subheader}> Graph Type </Text>
          <Picker style={styles.picker} selectedValue={type} mode="dropdown" onValueChange={(item) => (setType(item))}>
            {graphOptionsNew}
          </Picker>

          <Text style={styles.subheader}> Button Names </Text>
          <TextInput multiline numberOfLines={1} placeholder={"Button 0"} style={styles.input} onChangeText={setButt0} editable maxLength={50}/>
          <TextInput multiline numberOfLines={1} placeholder={"Button 1"} style={styles.input} onChangeText={setButt1} editable maxLength={50}/>
          <TextInput multiline numberOfLines={1} placeholder={"Button 2"} style={styles.input} onChangeText={setButt2} editable maxLength={50}/>
          
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
          closeOnHardwareBackPress={true}
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
          showProgress = {false}
          title = "Confirm Submission"
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
          onConfirmPressed= {() => { throwAlertConfirm(false); addGraph(); }}
          onCancelPressed= {()=> { throwAlertConfirm(false); }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

// Displays a graph.
// Allows for the export of graphs
// 
function Graph({ route, navigation }) {
  // put the json data in here
  const { keyParam } = route.params;


  const [RawData, setRawData] = useState({ Data:[
    { ButtonName:"Button0", data:[0] },
    { ButtonName:"Button1", data:[0,1] },
    { ButtonName:"Button2", data:[0,1,2] },
  ]});
  const [activePage, setActiveComponent] = useState("NoDataYet")
  const [selectedOption, setSelected] = useState();
  const [textValue, setTextValue] = useState("Put the new text here");
  const [refreshChild, setRefreshChild] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDescription, setDescription] = useState("");
  const [currentGraph, setCurGraph ] = useState("");
  const [showAlert, setAlert] = useState(false);
  const [alertFailed, setFailedAlert] = useState(false);
  let buttonList = [];

  //States for the alerts
  const [alertText, setAlertText] = useState("");
  const [alertMenu, throwAlertMenu] = useState(false);
  const [alertDelete, throwAlertDelete] = useState(false);

  const [thisState, setThisState] = useState({textArray:[], showAlert:false});
  const [tempkey, setKey] = useState("");

  // this automatically checks the data every <MINUTE_MS> milliseconds.
  const MINUTE_MS = 250;
  useEffect(() => {
    const interval = setInterval(() => {checkIfAsyncChanged(); }, MINUTE_MS);
    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [])

  // Stuff done on page load.
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', (e) => {
      setRawData(GLOBAL.ITEM);
      console.log(GLOBAL.ITEM);
      setActiveComponent(GLOBAL.ITEM.GraphType);
      toggleRefreshChild();
    });
    return unsubscribe;
  }, [navigation]);

  // triggers a rerender for the child components
  const toggleRefreshChild = () => {
    // attempting to trigger re-render
    console.log("start refreshing");
    setRefreshing(true);
    wait(25).then(() => {setRefreshing(false), console.log("Done Refreshing")});
  };

  // waits x milliseconds then calls a function. Used for refreshing
  const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  //exports async data to an email
  const exportData = async () => {
    console.log("Called");
    let tempString = RawData.Title + "\n";
    let tempSubject = RawData.Title + "'s Data";
    for(let i = 0; i < RawData.Data.length; i++){
      tempString += RawData.Data[i].ButtonName + " \n"
      for(let j = 0; j < RawData.Data[i].data.length; j++){
        let tempDate = "Date: " + RawData.Data[i].data[j].Day + "/" + RawData.Data[i].data[j].Month + "/" + RawData.Data[i].data[j].Year + "\t";
        tempString += tempDate;
        let tempTime = "Time: " + RawData.Data[i].data[j].Hour + ":" + RawData.Data[i].data[j].Minutes + "." + RawData.Data[i].data[j].Seconds + "." + RawData.Data[i].data[j].Milliseconds + "\n";
        tempString+=tempTime;
      }
    }
    console.log("parsed");
    const to = [] // string or array of email addresses
      email(to, {
        // Optional additional arguments
        subject: tempSubject,
        body: tempString,
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
    if(GLOBAL.BUTTONPRESSED){
      checking = true;
      let key = GLOBAL.ITEM.Key;
      let temp1 = AsyncCode.getTextArray();
      const temp2 = temp1.filter(textArray => textArray.Key == key);
      setRawData(temp2[0]);
      checking = false;
      GLOBAL.BUTTONPRESSED = false;
      console.log("done");
      toggleRefreshChild();
      //this.forceUpdate();
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

  // used to update GLOBAL data and navigate to alter data
  const navigateGraphSettings = (item) => {
    // GLOBAL.ITEM = item;
    // GLOBAL.KEY = item.Key;
    // GLOBAL.TITLES = item.Title;
    navigation.navigate('Graph Settings', { keyParam: item.Key });
  }

  const navigateEditData = (item) => {
    GLOBAL.ITEM = item;
    GLOBAL.KEY = item.Key;
    GLOBAL.TITLES = item.Title;
    navigation.navigate('Edit Data');
  }

  const deleteGraph = () => {
    AsyncCode.removeItem(tempkey);
    if(GLOBAL.BUTTON0KEY == tempkey) {
      Console.log("Same Key");
      GLOBAL.BUTTON0KEY == null;
    }
    if(GLOBAL.BUTTON1KEY == tempkey) {
      Console.log("Same Key");
      GLOBAL.BUTTON0KEY == null;
    }
    if(GLOBAL.BUTTON2KEY == tempkey) {
      Console.log("Same Key");
      GLOBAL.BUTTON0KEY == null;
    }
    AsyncCode.restoreFromAsync();
    setThisState({showAlert:false, textArray:AsyncCode.getTextArray()});
    navigation.navigate("My Graphs")
  }

  const buttonPush = async (buttonPushed) =>{
    console.log(buttonPushed + " was pushed");
    let key = RawData.Key;
    const date = new Date();
    const [month, day, year] = [date.getMonth(), date.getDate(), date.getFullYear()];
    const [hour, minutes, seconds, milliseconds] = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
    const tempJson = {Year:year, Month:month, Day:day, Hour:hour, Minutes:minutes, Seconds:seconds, Milliseconds:milliseconds};
    const tempDate = {Date: date, ButtonID: buttonPushed};
    AsyncCode.addToData(key, tempDate, tempJson, buttonPushed);
    GLOBAL.BUTTONPRESSED = true;
  }

  const customAlert = () => {
    return (
      <View>
        <TouchableOpacity opacity={0.5} onPress={() => { navigateGraphSettings(RawData); throwAlertMenu(false); }}>
          <Text style={styles.lightButton}> Graph Settings </Text>
        </TouchableOpacity>
        <TouchableOpacity opacity={0.5} onPress={() => { navigateEditData(RawData); throwAlertMenu(false); }}>
          <Text style={styles.lightButton}> Edit Data Points </Text>
        </TouchableOpacity>
        <TouchableOpacity opacity={0.5} onPress={() => { onImageLoad(); throwAlertMenu(false); }}>
          <Text style={styles.lightButton}> Export Data </Text>
        </TouchableOpacity>
        <View style={{marginVertical: 15}}/>
        <TouchableOpacity opacity={0.5} onPress={() => { setKey(GLOBAL.KEY); throwAlertMenu(false); throwAlertDelete(true); }}>
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
  }, [navigation, RawData]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ViewShot ref={ref}>
          <Text style={styles.title}>{RawData.Title}</Text>
          <Text style={styles.regularText}> {RawData.Description}</Text>
          
          <GraphSwitch active={activePage}>
            <HeatMap  rawData={RawData} key={refreshChild} styles={styles} name="Heat Map" /> 
            <BarGraph rawData={RawData} key={refreshChild} styles={styles} name="Bar Graph"  />
            <ButtonOrder rawData={RawData} key={refreshChild} styles={styles} name="Button Order"  />
            <TimesPerDay rawData={RawData} key={refreshChild} styles={styles} name="Timeline" />
            <FlowerGraph rawData={RawData} key={refreshChild} styles={styles} name="Flowers" />
            <Triskelion rawData={RawData} key={refreshChild} styles={styles} name="Triskelion" />
            <ChessClock rawData={RawData} key={refreshChild} styles={styles} name="Chess Clock"/>
            <ButtonPressedPerDay rawData={RawData} key={refreshChild} styles={styles} name="Stock Market"/>
            <Dandelion rawData={RawData} key={refreshChild} styles={styles} name="Dandelion" />
            {/* <View key={refreshChild} name="NoDataYet">{/* Change Graph Type }
              <Text style={styles.subheader}> Change Graph Type </Text>
              <Picker style={styles.picker} selectedValue={selectedOption} mode="dropdown"
                onValueChange={(itemValue, itemIndex) => (setCurGraph(itemValue), setSelected(itemValue))}>
                {graphOptions}
              </Picker>
              <GraphSwitch active={selectedOption}>
                <Text style={styles.tinyText} key={refreshChild} name="NoDataYet"> No Graph Selected. </Text>
                <Text style={styles.tinyText} key={refreshChild} name="Bar Graph"> Displays the number of times each button is pressed. </Text>
                <Text style={styles.tinyText} key={refreshChild} name="Heat Map"> Displays the number of times all buttons are pressed for each day. </Text>
                <Text style={styles.tinyText} key={refreshChild} name="Button Order"> Displays the order of button pushes. </Text>
                <Text style={styles.tinyText} key={refreshChild} name="Timeline"> Displays when buttons are pressed each day. </Text>
                <Text style={styles.tinyText} key={refreshChild} name="Flower"> Displays the buttons pressed each day. </Text>
                <Text style={styles.tinyText} key={refreshChild} name="Triskelion"> Displays the number of button pairs pressed. </Text>
                <Text style={styles.tinyText} key={refreshChild} name="Chess Clock"> Displays the duration between the same button being pressed.</Text>
                <Text style={styles.tinyText} key={refreshChild} name="Stock Market"> Displays the number of times each button was pressed each day </Text>
                <Text style={styles.tinyText} key={refreshChild} name="Dandelion"> Displays the buttons pressed over a week. </Text>
              </GraphSwitch>
              <TouchableWithoutFeedback onPress={() => (setActiveComponent(currentGraph), AsyncCode.changeGraphType(currentGraph, RawData.Key), GLOBAL.ITEM.GraphType=currentGraph)}>
                <Text style={styles.smallButton}> Change Graph Type </Text>
              </TouchableWithoutFeedback>
            </View> */}
          </GraphSwitch>
        </ViewShot>
        
        <View>
          <View style={styles.barLine}></View>
          <Text style={styles.header}> Add Data </Text>

          {GLOBAL.ITEM.TempButtons.map((button, ButtonID) => {
            return (
              <View>
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
  const [buttons, setButtons] = useState(graph.TempButtons);

  const [alert, throwAlert] = useState(false);
  const [alertConfirm, throwAlertConfirm] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertText, setAlertText]=useState("");

  const [asyncStorage, setAsyncStorage]= useState([]);

  // Used to save the data to asnyc when the page is left
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {});
    return unsubscribe;
  }, [navigation]);

  // Stuff done on page load.
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', (e) => {
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
          <Picker style={styles.picker} selectedValue={type} mode="dropdown" onValueChange={(item) => (setType(item))}>
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
          closeOnHardwareBackPress={true}
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

function EditData({navigation}) {
  const [RawData, setRawData] = useState({});
  const [curData, setCurData] = useState([
    { ButtonName:"Button0", data:[0] },
    { ButtonName:"Button1", data:[0,1] },
    { ButtonName:"Button2", data:[0,1,2] },
  ]); 
  const [filteredData,setFilteredData] = useState([
    { ButtonName:"Button0", data:[0] },
    { ButtonName:"Button1", data:[0,1] },
    { ButtonName:"Button2", data:[0,1,2] },
  ]);

  const [showError, setShowError] = useState(false);
  const [showAlert, setAlert] = useState(false);
  const [alertSuccess, throwSuccessAlert] = useState(false);

  const [dataOnTrial, setTrial] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({});
  const [dataPointValue, setDataPointValue] = useState("");

  let searchDate = ["","",""];

  // Used to save the data to asnyc when the page is left
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {});
    return unsubscribe;
  }, [navigation]);

  // Stuff done on page load.
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', (e) => {
      changeData(GLOBAL.ITEM);
      setCurData(GLOBAL.ITEM.Data);
      setFilteredData(GLOBAL.ITEM.Data);
    });
    return unsubscribe;
  }, [navigation]);

  // changes the rawData
  // params data is the data the raw data will be set too
  const changeData = (data) => {
    setRawData(data);
  }

  // flags a point to be deleted
  const doDeleteThisPoint = () => {
    let temp = AsyncCode.removeDataPoint(RawData.Key, dataOnTrial);
    //console.log(temp.Data);
    throwAlert(null);
    changeData(temp);
    setCurData(temp.Data);
    setFilteredData(temp.Data);
    GLOBAL.ITEM = temp;
    GLOBAL.BUTTONPRESSED = true;
  }

  // this throws the Alert
  const throwAlert = (item) => {
    setTrial(item);
    if(showAlert) {
      setAlert(false);
    }
    else {
      setAlert(true);
    }
  };

  const updateSearch= async() => {
    let replaceData = [];
    console.log(searchDate);
    for(let i = 0; i < curData.length; i++) {
      let buttonJson = {};
      let buttonData = [];
      buttonJson.ButtonName = curData[i].ButtonName;
      for(let j = 0; j < curData[i].data.length; j++){
        let matchSearch = false;
        if(searchDate[0] != "") {
          if(curData[i].data[j].Day == searchDate[0]) {
            matchSearch = true;
          }
        }
        if(searchDate[1] != "") {
          if(curData[i].data[j].Month == searchDate[1]) {
            matchSearch = true;
          }
        }
        if(searchDate[2] != "") {
          if(curData[i].data[j].Year == searchDate[2]) {
            matchSearch = true;
          }
        }
        if(matchSearch) {
          buttonData.push(curData[i].data[j]);
          console.log("Match Found: " + curData[i].data[j]);
        }
      }
      buttonJson.data = buttonData;
      replaceData.push(buttonJson);
    }
    if(searchDate[0] != "" || searchDate[1] != "" || searchDate[2] != "") {
      setFilteredData(replaceData);
    }
    else {
      setFilteredData(curData);
    }
  }

  const addDataPointDescription= async(item, description) => {
    console.log(item);
    console.log(description);
    if(description.length >= 1) {
      setModalVisible(false);
      setShowError(false);
      let temp = AsyncCode.changeDataPointDescription(RawData.Key, item, description);
      setCurData(temp.Data);
      setFilteredData(temp.Data);
      GLOBAL.ITEM = temp;
      throwSuccessAlert(true);
    }
    else {
      setShowError(true);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <Text style={styles.title}> Edit Data </Text>
          <Text style={styles.subheader}> Date Filter </Text>
          <View style={styles.fixToText}>
            <TextInput onChangeText={text => (searchDate[0] = text, updateSearch())} placeholder="Day" style={styles.dayInput} editable maxLength={2}/>
            <TextInput onChangeText={text => (searchDate[1] = text, updateSearch())} placeholder="Month" style={styles.dayInput} editable maxLength={2}/>
            <TextInput onChangeText={text => (searchDate[2] = text, updateSearch())} placeholder="Year" style={styles.dayInput} editable maxLength={4}/>
          </View>
          <View style={styles.barLine}></View>

          <SectionList
            sections={filteredData}
            renderItem={({item}) => (
              <View style={styles.barLine}>
              <View style={styles.fixToText}>
                <Text style={styles.tinyText}> {item.Day + "-" + item.Month + "-" + item.Year + ", " + String(item.Hour).padStart(2, "0") + ":" + String(item.Minutes).padStart(2, "0") + ":" + String(item.Seconds).padStart(2, "0")} </Text>
                <TouchableWithoutFeedback onPress={() => {setModalData(item), setModalVisible(true)}}>
                  <Text style={styles.lightButton}> Add Description </Text>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => {throwAlert(item)}}>
                  <Text style={styles.warningButton}> Delete </Text>
                </TouchableWithoutFeedback>
              </View>
              </View>
            )}
            renderSectionHeader={({section}) => (
              <View>
                <Text style={styles.taskTitle}> {section.ButtonName} </Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            stickySectionHeadersEnabled
          />
          
          <AwesomeAlert
            show={showAlert}
            showProgress={false}
            title="Delete Data"
            message= {"Are you sure you want to delete this data point?"}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            confirmText="Delete"
            confirmButtonColor="#E07A5F"
            contentContainerStyle={styles.alert}
            messageStyle={styles.alertBody}
            titleStyle={styles.alertText}
            onConfirmPressed={() => { doDeleteThisPoint(); }}
            onCancelPressed={()=> { throwAlert(null); }}
          />
        
          <AwesomeAlert
            show={alertSuccess}
            showProgress={false}
            title="Success"
            message= {"Graph Changed"}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={true}
            confirmText="Okay"
            confirmButtonColor="#E07A5F"
            contentContainerStyle={styles.alert}
            messageStyle={styles.alertBody}
            titleStyle={styles.alertText}
            onConfirmPressed={() => { throwSuccessAlert(false); }}
          />

          <Modal animationType="Slide" transparent={true} visible={modalVisible} onRequestClose={() => { Alert.alert("Modal has been closed."); {/*setModalVisible(false);*/} }}>
            <View style={styles.modalBox}>
              <Text style={styles.header}> {modalData.Day + "-" + modalData.Month + "-" + modalData.Year + ", " + modalData.Hour + ":" + modalData.Minutes + ":" + modalData.Seconds} </Text>
              <Text style={styles.subheader}> Change Description </Text>
              {showError ? ( <Text style={styles.regularText}> Please add a description</Text> ): null}
              
              <TextInput multiline numberOfLines={5} onChangeText={text => setDataPointValue(text)} placeholder="New Description Here" style={styles.input} editable maxLength={5000}/>

              <View style={styles.fixToText}>
                <TouchableWithoutFeedback onPress={() => (addDataPointDescription(modalData, dataPointValue))}>
                  <Text style={styles.smallButton}> Submit </Text>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => (setModalVisible(false))}>
                  <Text style={styles.warningButton}> Cancel </Text>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </Modal>
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