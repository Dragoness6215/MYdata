import React,{Component, useState, useEffect} from 'react';
import {Node} from 'react';
import {ScrollView, SafeAreaView, StyleSheet, View, Text, StatusBar, NativeModules, NativeEventEmitter, Button, Platform, PermissionsAndroid, FlatList, TouchableHighlight } from 'react-native';
import BleManager, { start } from 'react-native-ble-manager';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import AsyncCode from './asyncStorage.js';
import GLOBAL from './global';
const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

import { stringToBytes } from 'convert-string';
import { Console } from 'console';
const Buffer = require('buffer/').Buffer;

// This class permits the switching between various graph types.
class BleManagerCode {
    //stored map of all peripherals
    peripherals = new Map();
    // checking if the app is scanning or not
    isScanning=false;
    // list of all 
    list=[];
    connectedTo=null;
    oldKeys=[];
    dateAtRecieving;
    dateStored=false;
    
  
    // start to scan peripherals
    startScan = async () => {
      console.log("Starting to Scan");
      
      // first, clear existing peripherals
      this.peripherals.clear();
      this.list=Array.from(this.peripherals.values());
      
      
      // then re-scan it
      await BleManager.scan([], 1, true).then(() => {
        // Success code
        console.log("Scan started");
      }).catch((error)=>{
        console.error(error);
      });
      
    };
  
    // adds new peripheral to the list of peripherals
    handleDiscoverPeripheral = (peripheral) => {
      if (peripheral.name==undefined) {
        peripheral.name = 'NO NAME';
      }
      if(peripheral.id == undefined){
        peripheral.id="00:00:00:00:00:00";
      }
      this.peripherals.set(peripheral.id, peripheral);

      this.list=(Array.from(this.peripherals.values()));
    };
  
    // handle stop scan event
    handleStopScan = () => {
      console.log('Scan has stopped');
      this.isScanning=false;
    };
  
    // handle disconnected peripheral
    handleDisconnectedPeripheral = (data) => {
      console.log('Disconnected from ' + data.peripheral);
      this.connectedTo=null;
      let peripheral = this.peripherals.get(data.peripheral);
      if (peripheral) {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        this.list=(Array.from(this.peripherals.values()));
      }
    };
  
    // handle update value for characteristic
    handleUpdateValueForCharacteristic = (data) => {
      console.log(
        'Received data from: ' + data.peripheral,
        'Characteristic: ' + data.characteristic,
        'Data: ' + data.value,
      );
    };
  
    // updates the peripheral information
    updatePeripheral = (peripheral, callback) => {
      let p = this.peripherals.get(peripheral.id);
      if(!p){
        return;
      }
  
      p = callback(p);
      peripherals.set(peripheral.id,p);
      this.list=(Array.from(this.peripherals.values()));
    }
  
    // connects and tests connection to peripheral
    connectAndTestPeripheral = async (peripheral) => {
      const serviceUUID = '181C';
      const characteristicUUID1 = '2AEA';
      const characteristicUUID2='00002ac4-0000-1000-8000-00805f9b34fb';
      let success=true;
  
      // Connect to device
      await BleManager.connect(peripheral.id).catch((error)=>{
        console.error(error);
        success = false;
      });
      console.log("Connected");
      this.connectedTo=peripheral;
      console.log(this.connectedTo);

      this.oldKeys[0]=GLOBAL.BUTTON0KEY;
      this.oldKeys[1]=GLOBAL.BUTTON1KEY;
      this.oldKeys[2]=GLOBAL.BUTTON2KEY;
      console.log(this.oldKeys);

      // Before startNotification you need to call retrieveServices
      let temp = await BleManager.retrieveServices(peripheral.id);
      console.log(temp);

      await BleManager.startNotification(peripheral.id, serviceUUID, characteristicUUID1)
      .catch((error) => {
        // Failure code
        console.error(error);
        success = false;
      });
      await BleManager.startNotification(peripheral.id, serviceUUID, characteristicUUID2)
      .catch((error) => {
        // Failure code
        console.error(error);
        success = false;
      });
      bleEmitter.addListener("BleManagerDidUpdateValueForCharacteristic", ({ value, peripheral, characteristic, service }) => {this.onDataReceived(value,characteristic)});
      return success;
    }
  
    // disconnects from peripherals
    disconnectFromPeripheral = () => {
      if(this.connectedTo !== null){
        BleManager.disconnect(this.connectedTo.id)
          .then(() => {
            // Success code
            console.log("Disconnected");
            this.connectedTo=null;
            this.firstTime=true;
            bleEmitter.removeListener("BleManagerDidUpdateValueForCharacteristic", ({ value, peripheral, characteristic, service }) => {this.onDataReceived(value)});
          })
          .catch((error) => {
            // Failure code
            console.log(error);
          });
      }
    }
  
     // get advertised peripheral local name (if exists). default to peripheral name
    getPeripheralName = (item) => {
      if (item.advertising) {
        if (item.advertising.localName) {
          return item.advertising.localName;
        }
      }
  
      return item.name;
    };
  
    // checks connectability
    getConnectability = (item) => {
      if (item.advertising) {
        if (item.advertising.isConnectable) {
          return item.advertising.isConnectable;
        }
      }
  
      return "false";
    }
  
    dataBuffer="";
    firstTime=true;
    acceptPress=true;
    //when data is received
    onDataReceived = async (value,characteristic) => {
      if(characteristic=='00002aea-0000-1000-8000-00805f9b34fb'){
        //console.log("Button Push stuff");
        let temp1 = parseInt(value,16);
        //console.log("Button Pushed: " + temp1);

        if(temp1==0){
          //console.log("accept presses");
          this.acceptPress=true;
        }
        else if(this.acceptPress){
          console.log("press accepted");
          this.acceptPress=false;
          if(temp1==1){
            console.log("button 0")
            await this.buttonPush(0);
          }
          else if(temp1==2){
            console.log("button 1");
            await this.buttonPush(1);
          }
          else if(temp1==4){
            console.log("button 2");
            await this.buttonPush(2);
          }
          else if(temp1==3){
            console.log("Button 0 and 1");
            await this.buttonPush(0);
            await this.buttonPush(1);
          }
          else if(temp1==5){
            console.log("button 0 and 2");
            await this.buttonPush(0);
            await this.buttonPush(2);
          }
          else if(temp1==6){
            console.log("button 1 and 2");
            await this.buttonPush(1);
            await this.buttonPush(2);
          }
        }
      }
      else if (characteristic=='00002ac4-0000-1000-8000-00805f9b34fb'){
        let temp1=String.fromCharCode(value);
        if(!this.dateStored){
          this.dateAtRecieving=Date.now();
          console.log(this.dateAtRecieving);
          this.dateStored=true;
        }
        //console.log(temp1);
        if(temp1=="e" && this.firstTime){
            console.log("Updating Async Data");
            this.firstTime=false;
            let data=this.dataBuffer.split("-")[0];
            let lastTime=(parseInt(this.dataBuffer.split("-")[1]));
            let startTimeRelative=this.dateAtRecieving-lastTime;
            let dataSplit=data.split(",");
            for(let i =0; i<dataSplit.length;i++){
              let temp2=dataSplit[i].split(":");
              if(temp2.length>1){
                let key=this.oldKeys[temp2[0]];
                let buttonPushed=parseInt(temp2[0]);
                let tempmilliseconds=parseInt(temp2[1]);
                let temp=startTimeRelative+tempmilliseconds;
                let date= new Date(temp);
                const [month, day, year]       = [date.getMonth(), date.getDate(), date.getFullYear()];
                const [hour, minutes, seconds, milliseconds] = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
                const tempJson =
                  {Year:year,
                    Month:month,
                    Day:day,
                    Hour:hour,
                    Minutes:minutes,
                    Seconds:seconds,
                    Milliseconds:milliseconds,
                  };
                AsyncCode.addToData(key,tempJson,buttonPushed);
                GLOBAL.BUTTONPRESSED=true; // should reflag
              }
            }
            this.dataBuffer="";
        }
        else{
          this.dataBuffer+=temp1;
        }
      }
    }

    //handles a button push
    buttonPush = async (buttonPushed) =>{
      let key;
      if(buttonPushed==0){
        if(GLOBAL.BUTTON0KEY==null){
          Console.log("No Key");
          return;
        }
        key=GLOBAL.BUTTON0KEY;
      }
      else if(buttonPushed==1){
        if(GLOBAL.BUTTON1KEY==null){
          Console.log("No Key");
          return;
        }
        key=GLOBAL.BUTTON1KEY;
      }
      else if(buttonPushed==2){
        if(GLOBAL.BUTTON2KEY==null){
          Console.log("No Key");
          return;
        }
        key=GLOBAL.BUTTON2KEY;
      }
      const date = new Date();
      const [month, day, year]       = [date.getMonth(), date.getDate(), date.getFullYear()];
      const [hour, minutes, seconds, milliseconds] = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
      const tempJson =
        {Year:year,
          Month:month,
          Day:day,
          Hour:hour,
          Minutes:minutes,
          Seconds:seconds,
          Milliseconds:milliseconds,
        };
      AsyncCode.addToData(key,tempJson,buttonPushed);
      GLOBAL.BUTTONPRESSED=true; // should reflag
    }
  
    //starts up ble stuff
    startUp = async () => {
      
        // initialize BLE modules
      await BleManager.start({ showAlert: false, forceLegacy: true}).then(() => {
        // Success code
        console.log("Module initialized");
      });
      
      await this.startScan();
      
      // add ble listeners on mount
      bleEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
      bleEmitter.addListener('BleManagerStopScan', this.handleStopScan);
      bleEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
      bleEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);
    }
    
    checkPermissions = () => {
      if (Platform.OS === 'android') {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r1) => {
          if (r1) {
            console.log('Fine location permission is OK');
          }
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r2) => {
            if (r2) {
              console.log('User accept fine location');
              return;
            }
            else{
            console.log('User refused fine location');
            return false;}
          });
        });
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((r1) => {
          if (r1) {
            console.log('Coarse location permission is OK');
          }
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((r2) => {
            if (r2) {
              console.log('User accept corse location');
            }
            else{
              console.log('User refused corse location');
              return false;
            }
          });
        });
        
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN).then((r1) => {
          if (r1) {
            console.log('Bluetooth permission is OK');
          }
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN).then((r2) => {
            if (r2) {
              console.log('User accept scanning');
            }
            else{
              console.log('User refused scanning ');
              return false;
            }
          });
        });
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT).then((r1) => {
          if (r1) {
            console.log('Bluetooth permission is OK');
          }
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT).then((r2) => {
            if (r2) {
              console.log('User accept connection');
            }
            else{
              console.log('User refused connection ');
              return false;
            }
          });
        });
  
        BleManager.enableBluetooth()
          .then(() => {
            // Success code
            console.log("The bluetooth is already enabled or the user confirm");
          })
          .catch((error) => {
            // Failure code
            console.log("The user refused to enable bluetooth");
            return false;
          });
        return true;
      }
      return false;
    }
    

    //cleans up the ble stuff
    cleanUp = () => {
      //this.disconnectFromPeripheral();
      bleEmitter.removeListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
      bleEmitter.removeListener('BleManagerStopScan', this.handleStopScan);
      bleEmitter.removeListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
      bleEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);
      //bleEmitter.removeListener("BleManagerDidUpdateValueForCharacteristic", ({ value, peripheral, characteristic, service }) => {this.onDataReceived(value, characteristic)});
        
    };

    //checks if there is a connected device
    isConnected = () => {
      if(this.connectedTo !== null){
        return true;
      }
      else{
        return false;
      }
    }

    //returns all of the listed ble peripherals
    getList= () => {
      return this.list;
    }
}

const BleCode = new BleManagerCode();
export default BleCode;
