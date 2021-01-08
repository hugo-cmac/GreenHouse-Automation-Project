//################################### WIFI MANAGER AND DRT BUTTON #########################
#include <DNSServer.h>
#include <WiFi.h>
#include <WebServer.h>

#define ESP32_DRD_USE_RTC           false
#define ESP_DRD_USE_EEPROM          true
#define ESP_DRD_USE_SPIFFS          false
#define ESP_DRD_USE_LITTLEFS        false
#define DOUBLERESETDETECTOR_DEBUG   true

#include <ESP_WiFiManager.h>
#include <ESP_DoubleResetDetector.h>

#include <TOTP.h>

#include <NTPClient.h>
#include <WiFiUdp.h>

#include <HTTPClient.h>

#include <DHT.h>

#include <Stepper.h>

#define DRD_TIMEOUT     10 // Number of seconds after reset during which a subseqent reset will be considered a double reset.
#define DRD_ADDRESS     0 // RTC Memory Address for the DoubleResetDetector to use

#define LED_ON          HIGH
#define LED_OFF         LOW

// Onboard LED I/O pin on NodeMCU board
#define PIN_LED         2  // D4 on NodeMCU and WeMos. GPIO2/ADC12 of ESP32. Controls the onboard LED.
#define PIN_RELAY       5  // D1



static uint64_t ESP_UID = ESP.getEfuseMac();
char UID[16];
DoubleResetDetector* drd;

// SSID and PW for Config Portal
String ssid = "ESP_" + String((unsigned int)ESP_UID, HEX);
const char *password = "default";

TOTP *totp ;//= TOTP((uint8_t* )&ESP_UID, 8);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);// By default 'pool.ntp.org' is used with 60 seconds update interval and no offset
char* totpcode = NULL;

bool initialConfig = false; // Indicates whether ESP has WiFi credentials saved from previous session, or double reset detected
unsigned long ONStart;

unsigned int counter = 0;

unsigned int POSTTIME = 60000;  // 1min
unsigned int lastMillis = 0;



//trocar certificado
const char* root_ca = \ 
"-----BEGIN CERTIFICATE-----\n" \
"MIICiTCCAg+gAwIBAgIQH0evqmIAcFBUTAGem2OZKjAKBggqhkjOPQQDAzCBhTEL\n" \
"MAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UE\n" \
"BxMHU2FsZm9yZDEaMBgGA1UEChMRQ09NT0RPIENBIExpbWl0ZWQxKzApBgNVBAMT\n" \
"IkNPTU9ETyBFQ0MgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwHhcNMDgwMzA2MDAw\n" \
"MDAwWhcNMzgwMTE4MjM1OTU5WjCBhTELMAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdy\n" \
"ZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UEBxMHU2FsZm9yZDEaMBgGA1UEChMRQ09N\n" \
"T0RPIENBIExpbWl0ZWQxKzApBgNVBAMTIkNPTU9ETyBFQ0MgQ2VydGlmaWNhdGlv\n" \
"biBBdXRob3JpdHkwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQDR3svdcmCFYX7deSR\n" \
"FtSrYpn1PlILBs5BAH+X4QokPB0BBO490o0JlwzgdeT6+3eKKvUDYEs2ixYjFq0J\n" \
"cfRK9ChQtP6IHG4/bC8vCVlbpVsLM5niwz2J+Wos77LTBumjQjBAMB0GA1UdDgQW\n" \
"BBR1cacZSBm8nZ3qQUfflMRId5nTeTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/\n" \
"BAUwAwEB/zAKBggqhkjOPQQDAwNoADBlAjEA7wNbeqy3eApyt4jf/7VGFAkK+qDm\n" \
"fQjGGoe9GKhzvSbKYAydzpmfz1wPMOG+FDHqAjAU9JM8SaczepBGR7NjfRObTrdv\n" \
"GDeAU/7dIOA1mjbRxwG55tzd8/8dLDoWV9mSOdY=\n" \
"-----END CERTIFICATE-----\n";



class Motor {
    
    public:
        //    360 = 200        12        27        14        26
        Motor(int steps, int pin1, int pin2, int pin3, int pin4) {
            this->steps = steps;
            this->myStepper = new Stepper(steps, pin1, pin2, pin3, pin4);// initialize the stepper library on pins 
            this->myStepper->setSpeed(60);
        };

        boolean estado(){
            return aberto;
        }

        void abrir(){
            if(!aberto){
                aberto = true;
                for(int i = 0; i < 10; i++){
                    this->myStepper->step(steps);
                }
            }
        }

        void fechar(){
            if(aberto){
                aberto = false;
                for(int i = 0; i < 10; i++){
                    this->myStepper->step(-steps);
                }
            }
        }
  
    private:
    
        int steps=0; // change this to fit the number of steps per revolution
        
        Stepper* myStepper;
        
        boolean aberto = false;
    
};

class PhotoSensor {

    public:
        //               34
        PhotoSensor(int pin){
            this->pin = pin;
        };

        int estado(){
            return analogRead(pin); 
        }

    private:

        int pin = 0;
    
};

class MoisterSensor {
   
    public:
        //                 32
        MoisterSensor(int pin){
            this->pin = pin;
        };

        int estado(){
            return analogRead(pin);
        }
    private:

        int pin = 0;
};

class AirSensor {
   
    public:
        //             25      DHT11
        AirSensor(int pin, int type){
            this->pin = pin;
            this->type = type;
            this->mydht = new DHT(pin, type);
            this->mydht->begin();
        };

        float estadoTemperatura(){
            return mydht->readTemperature();
        }

        float estadoHumidade(){
            return mydht->readHumidity();
        }
    private:

        int pin = 0;
        int type = 0;

        DHT* mydht;

};


Motor* motor;
PhotoSensor* photo;
MoisterSensor* moisture;
AirSensor* air;

#include <PubSubClient.h>

const char *brokerUser = "augustocesarsilvamota@gmail.com";
const char *brokerPass = "323c0782";
const char *broker = "mqtt.dioty.co";

//TOPICOS
const char *outTopic = "/augustocesarsilvamota@gmail.com/value";
const char *inTopic = "/augustocesarsilvamota@gmail.com/ativar";  //abrir/fecharestufa topic

WiFiClient espClient;
PubSubClient client(espClient);

void reconnect(){ //connect
	while (!client.connected()){
        Serial.println("Broker");		
		if (client.connect("ESTUFA", brokerUser, brokerPass)){
			client.subscribe(inTopic);
		}else{
			delay(5000);
		}
	}
}

void callback(char *topic, byte *payload, unsigned int length){
    payload[length] = '\0';
    //123456;0/1;0/1;[default]

    char request[4][8];
    memset(request, 0, sizeof(request));
    int n = 0, c = 0;
    for (int i = 0; i < length; i++){
        if (payload[i] == '\0'){
            break;
        }else{
            if(payload[i] == ';'){
                n++;
                c = 0;
            }else{
                request[n][c] = payload[i];
                c++;
            }
        }
    }

    if (n == 0){
        return;
    }

    if (memcmp(request[0], totpcode, 6) != 0){
        return;
    }
    switch (request[1][0]){
        case '0':
            if (request[2][0] == '0'){
                //motor->fechar();
            } else if (request[2][0] == '1') {
                //motor->abrir();
            }
            if (n == 3){
                // set new default
            }
            return;
        case '1':
            if (request[2][0] == '0'){
                //motor fechar
            } else if (request[2][0] == '1') {
                //motor abrir
            }
            if (n == 3){
                // set new default
            }
            return;
    
        default:
            return;
    }
}
/*
void printValues(){

    if ((WiFi.status() == WL_CONNECTED)) {
        //Serial.println("Online");
        // HTTPClient http;

        // http.begin("https://jsonplaceholder.typicode.com/posts?userId=1", root_ca); //Specify the URL and certificate
        //http.addHeader("Content-Type", "application/x-www-form-urlencoded");
        // http.POST(""api_key=tPmAT5Ab3j7F9&sensor=BME280&value1=24.25&value2=49.54&value3=1005.14"");
        
        // If you need an HTTP request with a content type: application/json, use the following:
        //http.addHeader("Content-Type", "application/json");
        //int httpResponseCode = http.POST("{\"api_key\":\"tPmAT5Ab3j7F9\",\"sensor\":\"BME280\",\"value1\":\"24.25\",\"value2\":\"49.54\",\"value3\":\"1005.14\"}");

        // If you need an HTTP request with a content type: text/plain
        //http.addHeader("Content-Type", "text/plain");
        //int httpResponseCode = http.POST("Hello, World!");
            
        // http.end();
    }
    Serial.print("Estufa aberta: ");
    Serial.println(motor->estado());

    Serial.print("Indice de luz: ");
    Serial.println(photo->estado());

    Serial.print("Temperatura do ar: ");
    Serial.print(air->estadoTemperatura());
    Serial.println("°C");

    Serial.print("Percentagem de Humidade do ar: ");
    Serial.print(air->estadoHumidade());
    Serial.println("%");

    Serial.print("Humidade da terra: ");
    Serial.println(moisture->estado());
}
*/
//############################################################################################
void setup(){
    sprintf(UID,"%llu", ESP_UID);
    totp = new TOTP((uint8_t*) UID, 16);

    // put your setup code here, to run once:
    // initialize the LED digital pin as an output.
    pinMode(PIN_LED, OUTPUT);
    pinMode(PIN_RELAY, OUTPUT);
        
    digitalWrite(PIN_RELAY, LOW);

    Serial.begin(9600);
    Serial.println("\nStarting");

    drd = new DoubleResetDetector(DRD_TIMEOUT, DRD_ADDRESS);

    //Local intialization. Once its business is done, there is no need to keep it around
    ESP_WiFiManager ESP_wifiManager;

    // SSID and PW for your Router
    String Router_SSID = ESP_wifiManager.WiFi_SSID();
    String Router_Pass = ESP_wifiManager.WiFi_Pass();

    //Remove this line if you do not want to see WiFi password printed
    Serial.println("Stored: SSID = " + Router_SSID + ", Pass = " + Router_Pass);

    // SSID to uppercase
    ssid.toUpperCase();

    if (Router_SSID != ""){
        ESP_wifiManager.setConfigPortalTimeout(60); //If no access point name has been previously entered disable timeout.
        Serial.println("Got stored Credentials. Timeout 60s");
    }else{
        Serial.println("No stored Credentials. No timeout");
        initialConfig = true;
    }

    if (drd->detectDoubleReset()){
        Serial.println("Double Reset Detected");
        initialConfig = true;
    }

    if (initialConfig){
        Serial.println("Starting configuration portal @ 192.168.4.1");
        Serial.println("Using SSID = " + ssid + " and password = " + String(password));

        digitalWrite(PIN_LED, LED_ON);  // turn the LED on by making the voltage LOW to tell us we are in configuration mode.
        if (!ESP_wifiManager.startConfigPortal((const char *) ssid.c_str(), password)){
            Serial.println("Not connected to WiFi but continuing anyway.");
        }else{
            Serial.println("WiFi connected...yeey :)");
        }
    }

    digitalWrite(PIN_LED, LED_OFF); // Turn led off as we are not in configuration mode.

    #define WIFI_CONNECT_TIMEOUT        30000L
    #define WHILE_LOOP_DELAY            200L
    #define WHILE_LOOP_STEPS            (WIFI_CONNECT_TIMEOUT / ( 3 * WHILE_LOOP_DELAY ))

    unsigned long startedAt = millis();

    while ((WiFi.status() != WL_CONNECTED) && (millis() - startedAt < WIFI_CONNECT_TIMEOUT)){
        WiFi.mode(WIFI_STA);
        WiFi.persistent(true);

        // We start by connecting to a WiFi network
        Serial.print("Connecting to ");
        Serial.println(Router_SSID);
        WiFi.begin(Router_SSID.c_str(), Router_Pass.c_str());

        int i = 0;
        while ((!WiFi.status() || WiFi.status() >= WL_DISCONNECTED) && (i++ < WHILE_LOOP_STEPS)){
            delay(WHILE_LOOP_DELAY);
        }
    }

    // Serial.print("After waiting ");
    // Serial.print((millis() - startedAt) / 1000);
    // Serial.print(" secs more in setup(), connection result is ");

    if (WiFi.status() == WL_CONNECTED){
        Serial.print("connected. Local IP: ");
        Serial.println(WiFi.localIP());
    }else{
        Serial.println(ESP_wifiManager.getStatus(WiFi.status()));
    }

    timeClient.begin();

    client.setServer(broker, 1883);
    client.setCallback(callback);

    //Declaracao dos pinos dos respectivos sensores
    photo = new PhotoSensor(34);
    moisture = new MoisterSensor(32);
    air = new AirSensor(25, DHT11);
    motor = new Motor(200, 12, 27, 14, 26);
    Serial.println("Setup done");
    
}

void loop(){
	drd->loop();
    
  	timeClient.update();
    
    totpcode = totp->getCode(timeClient.getEpochTime());

    if (counter == 160000){
        Serial.println(totpcode);
        counter = 0;
    }else{
        counter++;
    }

	if (!client.connected()){
		reconnect();
	}

    client.loop();
	
	if (ONStart > 0 && (millis() - ONStart) > 1000){
		digitalWrite(PIN_RELAY, LOW); // Turn the LED off by making the voltage HIGH
	}

    Serial.printf("ESP_UID: %s\n", UID);
    Serial.println(totpcode);
    if ((millis() - lastMillis) > POSTTIME){ //PASSOU um minuto
        printValues();
        delay(5000);
        lastMillis = millis();
    }
}
