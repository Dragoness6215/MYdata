#include <Adafruit_NeoPixel.h>
#include <bluefruit.h>

BLEService bles = BLEService(UUID16_SVC_USER_DATA);
BLECharacteristic blec = BLECharacteristic(UUID16_CHR_COUNT_16);
BLECharacteristic blecDump = BLECharacteristic("00002ac4-0000-1000-8000-00805f9b34fb");

BLEDis bledis;
BLEBas blebas;

Adafruit_NeoPixel onePixel = Adafruit_NeoPixel(1, PIN_NEOPIXEL, NEO_GRB + NEO_KHZ800);

bool success = false;
int delayTimer=2000;
// Variables will change:
String dataStorageString="";
char dataStorage[10000];
uint8_t index1=0;
uint8_t index2=0;
bool updated=false;

uint8_t toSend = 0;
const int numButtons=3;
int buttonState[numButtons]={0,0,0};
int lastButtonState[numButtons]={0,0,0};
const int buttonPins[numButtons]={A0,A4};
const int buttonDesignation[numButtons]={1,2,4};//ALGORITHIM THIS

const int vibrationMotor=A5;
const int motorPower=255;
bool isVibrating=false;

void setup() {
  //setting up the pins
  for(int i =0; i<numButtons;i++){
    pinMode(buttonPins[i],INPUT);
  }
  pinMode(vibrationMotor,OUTPUT);

  onePixel.begin();             // Start the NeoPixel object
  onePixel.clear();             // Set NeoPixel color to black (0,0,0)
  onePixel.setBrightness(20);   // Affects all subsequent settings
  onePixel.show();              // Update the pixel state

  //onePixel.setPixelColor(0, 0, 255, 0);
  onePixel.show();

  Bluefruit.begin();

  // Set the connect/disconnect callback handlers
  Bluefruit.Periph.setConnectCallback(connect_callback);
  Bluefruit.Periph.setDisconnectCallback(disconnect_callback);

  Bluefruit.setName("Mydata Device");
  
  bledis.setManufacturer("Adafruit Industries");
  bledis.setModel("MYdata Device");
  bledis.begin();
  
  blebas.begin();
  blebas.write(100);
  setupBLE();
  startAdv();
}

void startAdv(void){
  // Advertising packet
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();

  // Include HRM Service UUID
  Bluefruit.Advertising.addService(bles);

  // Include Name
  Bluefruit.Advertising.addName();
  
  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244);    // in unit of 0.625 ms
  Bluefruit.Advertising.setFastTimeout(30);      // number of seconds in fast mode
  Bluefruit.Advertising.start(0);                // 0 = Don't stop advertising after n seconds  
}

void setupBLE(void){
  //analogWrite(P1.10,0);
  bles.begin();
  blec.setProperties(CHR_PROPS_NOTIFY);
  blec.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  blec.setFixedLen(2);
  blec.setCccdWriteCallback(cccd_callback);  // Optionally capture CCCD updates
  blec.begin();
  blecDump.setProperties(CHR_PROPS_NOTIFY);
  blecDump.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  blecDump.setFixedLen(1);
  blecDump.setCccdWriteCallback(cccd_callback);  // Optionally capture CCCD updates
  blecDump.begin();
}

void connect_callback(uint16_t conn_handle)
{
  BLEConnection* connection = Bluefruit.Connection(conn_handle);
  char central_name[32] = { 0 };
  connection->getPeerName(central_name, sizeof(central_name));
}

void disconnect_callback(uint16_t conn_handle, uint8_t reason)
{
  (void) conn_handle;
  (void) reason;
}

void cccd_callback(uint16_t conn_hdl, BLECharacteristic* chr, uint16_t cccd_value)
{
}

void loop(){
  //analogWrite(P1.10,0);
  if(Bluefruit.connected()){
      //onePixel.setPixelColor(0, 0, 255, 0);
      onePixel.show();
       if(delayTimer<0){
         if(index2<dataStorageString.length()){
            if(index2==0){
              Serial.print("Dump Start");
              dataStorageString+="-"+String(millis());
              Serial.print(dataStorageString);
              dataStorageString.toCharArray(dataStorage,10000);
              }
            uint8_t temp[1]={dataStorage[index2]};
            blecDump.notify(temp,sizeof(temp));
            index2+=1;
         }
         else{
            //Serial.println("dump end");
            uint8_t temp[1]={'e'};
            blecDump.notify(temp,sizeof(temp));
            dataStorageString="";
         }
       }
       else{
        Serial.print("Delayed: ");
        Serial.println(delayTimer);
        delayTimer-=1;
       }
      toSend=000;
      for(int i =0; i<numButtons;i++){
        buttonState[i]=digitalRead(buttonPins[i]);
        if(buttonState[i]!=lastButtonState[i]){
          if(buttonState[i]==HIGH){
            analogWrite(vibrationMotor,motorPower);
            toSend+=buttonDesignation[i];
          }
        }
        lastButtonState[i]=buttonState[i];
      }
    
    uint8_t buttondata[1] = {toSend};           // Sensor connected, increment toSend value
    
    // Note: We use .notify instead of .write!
    // If it is connected but CCCD is not enabled
    // The characteristic's value is still updated although notification is not sent
    blec.notify(buttondata, sizeof(buttondata));
    // save the current state as the last state, for next time through the loop
    //delay(100);
    analogWrite(vibrationMotor,0);
  }
  else{
    if(isVibrating){
      analogWrite(vibrationMotor,0);
    }
    else{
       analogWrite(vibrationMotor,motorPower);
    }
    //onePixel.setPixelColor(0, 255, 0, 0);
    onePixel.show();
    isVibrating = !isVibrating;
    updated=false;
    index2=0;
    delayTimer=2000;
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
