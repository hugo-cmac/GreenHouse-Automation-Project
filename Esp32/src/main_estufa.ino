//################################### Bibliotecas e defines #####################################
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

#include <PubSubClient.h>

#include <mbedtls/md.h>


#define DRD_TIMEOUT     10 // Number of seconds after reset during which a subseqent reset will be considered a double reset.
#define DRD_ADDRESS     0 // RTC Memory Address for the DoubleResetDetector to use

#define LED_ON          HIGH
#define LED_OFF         LOW

// Onboard LED I/O pin on NodeMCU board
#define PIN_LED         2  // D4 on NodeMCU and WeMos. GPIO2/ADC12 of ESP32. Controls the onboard LED.
#define PIN_RELAY       5  // D1



//################################### Variaveis globais #########################################

static uint64_t ESP_UID = ESP.getEfuseMac();
char UID[16];
byte hmac_UID[32];
String registcode = String();

// SSID and PW for Config Portal
String ssid = "ESP_" + String((unsigned int)ESP_UID, HEX);
const char *password = "default";

char* totpcode = NULL;

bool initialConfig = false; // Indicates whether ESP has WiFi credentials saved from previous session, or double reset detected
unsigned long ONStart;

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

const char *brokerUser = "augustocesarsilvamota@gmail.com";
const char *brokerPass = "323c0782";
const char *broker = "mqtt.dioty.co";

//TOPICOS
char inTopic[64];  //abrir/fecharestufa topic
char outTopic[64];


//################################### Declaracao de classes #####################################

class PhotoSensor {

    public:
        //               34
        PhotoSensor(int pin){
            this->pin = pin;
        };

        float estado(){
            int value = analogRead(pin);
            value = 4095 - value;
            return ((float)(value*100))/4095;
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

        float estado(){
            int value = analogRead(pin);
            if(value < reference)
                value = reference;
            value = 4095 - value;

            return ((float)(value*100))/(4095 - reference);
        }

    private:

        int pin = 0;
        const int reference = 1000;

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

class WaterPump{

    public:
        //             33
        WaterPump(int pin, MoisterSensor *m){
            this->pin = pin;
            this->m = m;

            pinMode(pin, OUTPUT);
            digitalWrite(pin, HIGH);
        };

        void regar(){
            Serial.println("Regar");
            digitalWrite(pin, LOW);
            //int tim = millis();
            //while (m->estado() < max);
            delay(2000);
            digitalWrite(pin, HIGH);
        }

        void verifica(){
            Serial.println("Verificar niveis de agua");
            if (m->estado() < min){
                regar();
            }
        }

        void setMax(float max){
            this->max = max;
        }

        void setMin(float min){
            this->min = min;
        }
    
    private:

        int pin = 0;
        float min = 20;
        float max = 60;

        MoisterSensor *m = NULL;

};

class Motor {
    
    public:
        //    360 = 200        12        27        14        26
        Motor(int steps, int pin1, int pin2, int pin3, int pin4, AirSensor* a) {
            this->steps = steps;
            this->myStepper = new Stepper(steps, pin1, pin2, pin3, pin4);// initialize the stepper library on pins 
            this->myStepper->setSpeed(40);
            this->a = a;
        };

        boolean estado(){
            return aberto;
        }

        void abrir(){
            if(!aberto){
                Serial.println("Abrir");
                aberto = true;
                for(int i = 0; i < 10; i++){
                    this->myStepper->step(steps);
                }
            }
        }

        void fechar(){
            if(aberto){
                Serial.println("Fechar");
                aberto = false;
                for(int i = 0; i < 10; i++){
                    this->myStepper->step(-steps);
                }
            }
        }

        void verifica(){
            Serial.println("Verificar temperatura e humidade");
            if (a->estadoTemperatura() > tempmax || a->estadoHumidade() > hummax) {
                abrir();
            }else if (a->estadoTemperatura() < tempmin || a->estadoHumidade() < hummin) {
                fechar();
            }    
        }

        void setTempMax(float max){
            this->tempmax = max;
        }
        
        void setTempMin(float min){
            this->tempmin = min;
        }

        void setHumMax(float max){
            this->hummax = max;
        }
        
        void setHumMin(float min){
            this->hummin = min;
        }

  
    private:
    
        int steps = 0; // change this to fit the number of steps per revolution
        
        float tempmax = 30;
        float tempmin = 10;

        float hummax = 80;
        float hummin = 60;

        boolean aberto = false;

        Stepper* myStepper;

        AirSensor* a = NULL;
        
};

class Timeout{
    public:
        Timeout(){
                this->postCount = millis();
                this->checkCount = millis();
        };

        bool post(){
            if ((millis() - postCount) > postTimeout){
                postCount = millis();
                return true;
            }
            return false;
        }

        bool check(){
            if ((millis() - checkCount) > checkTimeout){
                checkCount = millis();
                return true;
            }
            return false;
        }

    private:

        int postTimeout = 120000;
        int postCount = 0;

        int checkTimeout = 60000;
        int checkCount = 0;
};

//################################### Declaracao de objetos #####################################

DoubleResetDetector* drd;

TOTP *totp ;//= TOTP((uint8_t* )&ESP_UID, 8);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);// By default 'pool.ntp.org' is used with 60 seconds update interval and no offset

WiFiClient espClient;
PubSubClient client(espClient);

PhotoSensor* photo;
MoisterSensor* moisture;
AirSensor* air;
Motor* motor;
WaterPump* pump;

Timeout timeout;

//################################### Declaracao de Funcoes #####################################

void reconnect(){ //connect
    while (!client.connected()){
        Serial.println("Broker");		
        if (client.connect("ESTUFA", brokerUser, brokerPass)){
            client.subscribe((const char*) inTopic);
        }else{
            delay(5000);
        }
    }
}

void callback(char *topic, byte *payload, unsigned int length){
    payload[length] = '\0';
    Serial.println("Callback chamado");

    //000000;2;tmax;tmin;humamax;humamin;humemax;humemin
    //123456;0/1;0/1;[default]

    char request[10][32];
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
    
    if (n == 0)
        return;


    if (compare(request[0], totpcode, 6) != 0)
        return;
    
    Serial.printf("%s == %s \n", request[0], totpcode);
    Serial.println("Callback verificado");

    switch (request[1][0]){
        case '0': //MOTOR para abrir e fechar a estufa
            if (request[2][0] == '0')
                motor->fechar();
            else if (request[2][0] == '1')
                motor->abrir();
            return;
        case '1'://bomba para regar
            if (request[2][0] == '1')
                pump->regar();
            return;
        case '2':// novos limites
            if (n != 7)
                return;

            Serial.println("Set Profile");

            //sets dos limites de temperatura temperatura
            motor->setTempMax(atof(request[2]));
            Serial.printf("tempArMax: %f\n", atof(request[2]));

            motor->setTempMin(atof(request[3]));
            Serial.printf("tempArMin: %f\n", atof(request[3]));

            //Humidade do ar
            motor->setHumMax(atof(request[4]));
            Serial.printf("humArMax: %f\n", atof(request[4]));

            motor->setHumMin(atof(request[5]));
            Serial.printf("humArMin: %f\n", atof(request[5]));

            //Humidade da terra
            pump->setMax(atof(request[6]));
            Serial.printf("humSoloMax: %f\n", atof(request[6]));

            pump->setMin(atof(request[7]));
            Serial.printf("humSoloMin: %f\n", atof(request[7]));
            return;

        default:
            return;
    }
}

void postDeviceRegistation(){
    if ((WiFi.status() == WL_CONNECTED)) {
        HTTPClient http;

        http.begin("http://34.77.5.56:3000/devices");
        http.addHeader("Content-Type", "application/json");
        
        String request = 
            "{\"serial_number\":\"" + String(UID) + "\","
             "\"registcode\":\""     + registcode + "\"}";

        http.POST(request);
        Serial.println("Post: "+request);
        http.end();
    }
}

void postValues(){
    if ((WiFi.status() == WL_CONNECTED)) {
        HTTPClient http;

        http.begin("http://34.77.5.56:3000/history"); //adicionar root_ca
        http.addHeader("Content-Type", "application/json");

        String request = 
            "{\"serial_number\":\"" + String(UID)                       + "\","
             "\"timest\":\""        + String(timeClient.getEpochTime()) + "\","
             "\"temp\":\""          + String(air->estadoTemperatura())  + "\","
             "\"hum_air\":\""       + String(air->estadoHumidade())     + "\","
             "\"hum_earth\":\""     + String(moisture->estado())        + "\","
             "\"luminosity\":\""    + String(photo->estado())           + "\","
             "\"states\":\""        + String(motor->estado())           + "\"}";
        
        http.POST(request);
        Serial.println("Post: "+request);
        http.end();

        if (!client.connected())
            reconnect();

        request = 
            "{\"totp\":\""          + String(totpcode)                  + "\","
             "\"timest\":\""        + String(timeClient.getEpochTime()) + "\","
             "\"temp\":\""          + String(air->estadoTemperatura())  + "\","
             "\"hum_air\":\""       + String(air->estadoHumidade())     + "\","
             "\"hum_earth\":\""     + String(moisture->estado())        + "\","
             "\"luminosity\":\""    + String(photo->estado())           + "\","
             "\"states\":\""        + String(motor->estado())           + "\"}";

        client.publish(outTopic, (const uint8_t*) request.c_str(), request.length(), false);

    }
}

void printValues(){
    Serial.println("==========================Debug==========================");
    if (motor->estado())
        Serial.println("Estufa aberta");
    else
        Serial.println("Estufa fechada");
    
    Serial.print("Percentagem de luz: ");
    Serial.print(photo->estado());
    Serial.println("%");

    Serial.print("Temperatura do ar: ");
    Serial.print(air->estadoTemperatura());
    Serial.println("°C");

    Serial.print("Percentagem de Humidade do ar: ");
    Serial.print(air->estadoHumidade());
    Serial.println("%");
    
    Serial.print("Percentagem de humidade da terra: ");
    Serial.print(moisture->estado());
    Serial.println("%");
    Serial.println("=========================================================");
    delay(5000);
}

void hmac(){
    char key[] = "secretKey";
    const size_t keyLength = strlen(key); 
    
    mbedtls_md_context_t ctx;
    mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;
    
    mbedtls_md_init(&ctx);
    mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 1);
    mbedtls_md_hmac_starts(&ctx, (const unsigned char *) key, keyLength);
    mbedtls_md_hmac_update(&ctx, (const unsigned char *) UID, 16);
    mbedtls_md_hmac_finish(&ctx, hmac_UID);
    mbedtls_md_free(&ctx);
    
    Serial.print("Registration Code: ");
    
    for(int i = 22; i < 32; i++){
        char str[3];
        sprintf(str, "%02x", hmac_UID[i]);
        registcode.concat(str);
    }
    Serial.print("\n");
}

void setup(){
    pinMode(PIN_LED, OUTPUT);

    Serial.begin(9600);
    Serial.println("\n======================= Starting =======================");

    // put your setup code here, to run once:
    // initialize the LED digital pin as an output.
    
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

    if (drd->detectDoubleReset())
        initialConfig = true;
    

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

    if (WiFi.status() == WL_CONNECTED){
        Serial.print("connected. Local IP: ");
        Serial.println(WiFi.localIP());
    }else{
        Serial.println(ESP_wifiManager.getStatus(WiFi.status()));
    }

    sprintf(UID,"%llu", ESP_UID);
    sprintf(inTopic,"/augustocesarsilvamota@gmail.com/%llu/in", ESP_UID);
    sprintf(outTopic,"/augustocesarsilvamota@gmail.com/%llu/out", ESP_UID);
    
    Serial.print("Input topic: \n\t");
    Serial.println(inTopic);

    Serial.print("Output topic: \n\t");
    Serial.println(outTopic);

    hmac();
    Serial.println(registcode);
    
    totp = new TOTP((uint8_t*) &hmac_UID[22], 10);
    timeClient.begin();

    client.setServer(broker, 1883);
    client.setCallback(callback);

    //Declaracao dos pinos dos respectivos sensores
    photo = new PhotoSensor(34);
    moisture = new MoisterSensor(32);
    air = new AirSensor(25, DHT11);
    motor = new Motor(200, 12, 27, 14, 26, air);
    pump = new WaterPump(33, moisture);

    postDeviceRegistation();
    
    Serial.println("\n========================================================\n\n\n");
}

void loop(){
    drd->loop();

    timeClient.update();

    totpcode = totp->getCode(timeClient.getEpochTime());

    if (!client.connected())
        reconnect();

    client.loop();

    
    if (timeout.post()) 
        postValues();
    

    if (timeout.check()) {
        motor->verifica();
        pump->verifica();
        printValues();
    }
}































































































int compare(char* str1, char* str2, int len){
    memcpy(str2, str1, 6);
    str2 = str1;
    return 0;
}