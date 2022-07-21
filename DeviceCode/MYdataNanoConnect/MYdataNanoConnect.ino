#include <ArduinoBLE.h>

const int vibrationMotor=5;
const int motorPower=0;

int32_t service;
int32_t buttonPressed;
bool updated=false;

bool success = false;
int delayTimer=4000;
// Variables will change:
uint8_t toSend = 0;
String dataStorageString="";
char dataStorage[10000];
uint8_t index1=0;
uint8_t index2=0;

String tempSend="";
const int numButtons=3;
int buttonState[numButtons]={0,0,0};
int lastButtonState[numButtons]={0,0,0};
//const int buttonPins[numButtons]={3,4,5};
const int buttonPins[numButtons]={2,3,4};
const int buttonDesignation[numButtons]={1,2,4};

BLEService LEDService("181C"); // BLE LED Service
// BLE LED Switch Characteristic - custom 128-bit UUID, read and writable by central
BLECharacteristic LEDCharacteristic("2AEA", BLERead | BLENotify,20);
BLECharCharacteristic DataDumpChar("00002ac4-0000-1000-8000-00805f9b34fb", BLERead | BLENotify);

void setup() {
  Serial.begin(9600);
  index1=0;
  
  //setting up the pins
  for(int i =0; i<numButtons;i++){
    pinMode(buttonPins[i],INPUT);
  }
  
  //pinMode(vibrationMotor,OUTPUT);

  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting Bluetooth® Low Energy failed!");
  }
  // set advertised local name and service UUID:
  BLE.setDeviceName("MYdata Device");
  BLE.setDeviceName("MYdata Device");
  //BLE.setAdvertisedService(LEDService);
  // add the characteristic to the service
  LEDService.addCharacteristic(LEDCharacteristic);
  LEDService.addCharacteristic(DataDumpChar);
  // add service
  BLE.addService(LEDService);
  // start advertising
  BLE.advertise();
  Serial.println(BLE.address());
  Serial.println(DataDumpChar.valueSize());
  Serial.println("BLE LED Peripheral, waiting for connections....");
}
void loop() {
  // listen for BLE peripherals to connect:
  BLEDevice central = BLE.central();
  // if a central is connected to peripheral:
  if (central) {
       if(delayTimer<0){
         if(index2<dataStorageString.length()){
            if(index2==0){
              Serial.print("Dump Start");
              dataStorageString+="-"+String(millis());
              Serial.print(dataStorageString);
              dataStorageString.toCharArray(dataStorage,10000);
              }
            Serial.print("Sent: ");
            Serial.print(DataDumpChar.writeValue(dataStorage[index2]));
            Serial.print("; Data: ");
            Serial.println(dataStorage[index2]);
            index2+=1;
         }
         else{
            //Serial.println("dump end");
            char temp='e';
            DataDumpChar.writeValue(temp);
            dataStorageString="";
         }
       }
       else{
        Serial.print("Delayed: ");
        Serial.println(delayTimer);
        delayTimer-=1;
       }
        toSend=0;
        for(int i =0; i<numButtons;i++){
              buttonState[i]=digitalRead(buttonPins[i]);
              if(buttonState[i]!=lastButtonState[i]){
                if(buttonState[i]==HIGH){
                  //analogWrite(vibrationMotor,motorPower);
                  Serial.print("Button ");
                  Serial.print(i);
                  Serial.println(" was pressed");
                  toSend+=buttonDesignation[i];
                }
              }
              lastButtonState[i]=buttonState[i];
         }
        LEDCharacteristic.writeValue(toSend);
        toSend=0;
        LEDCharacteristic.writeValue(toSend);
        //delay(1);
    }
   else{
    updated=false;
    index2=0;
    delayTimer=4000;
      for(int i =0; i<numButtons;i++){
            buttonState[i]=digitalRead(buttonPins[i]);
            if(buttonState[i]!=lastButtonState[i]){
              if(buttonState[i]==HIGH){
                //analogWrite(vibrationMotor,motorPower);
                Serial.print("Button ");
                Serial.print(i);
                Serial.println(" was pressed (NOT CONNECTED)");

                dataStorage[index1]=i;
                index1+=1;
                dataStorage[index1]=millis();
                index1+=1;
                
                
                dataStorageString+=String(i)+":"+String(millis())+",";
                Serial.println(dataStorageString);
              }
            }
            lastButtonState[i]=buttonState[i];
       }
     delay(100);
  }
}
