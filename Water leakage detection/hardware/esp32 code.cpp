#define BLYNK_TEMPLATE_ID "TMPL3hNyJQbX9"
#define BLYNK_TEMPLATE_NAME "Water leak detection"
#define BLYNK_AUTH_TOKEN "wPaVxr9FGkL0_lwRzcSqKPYOUtxSiPWN"

#include <WiFi.h>
#include <BlynkSimpleEsp32.h>

char ssid[] = "Airtel_smit_0476";
char pass[] = "air65831";

// ---------------- PINS ----------------
int flow1Pin = 22;
int flow2Pin = 23;

int relayPin  = 18;   // Pump Relay
int buzzerPin = 21;   // Buzzer

// ------------- VARIABLES --------------
volatile int count1 = 0;
volatile int count2 = 0;

bool pumpState     = false;
bool leakActive    = false;
bool manualBuzzer  = false;

unsigned long lastCheck = 0;
unsigned long leakTime  = 0;

// ----------- FLOW INTERRUPTS ----------
void IRAM_ATTR flow1_ISR() {
  count1++;
}

void IRAM_ATTR flow2_ISR() {
  count2++;
}

// ------------ BLYNK PUMP --------------
BLYNK_WRITE(V0)
{
  int state = param.asInt();

  pumpState = state;

  Serial.print("Pump Button: ");
  Serial.println(state);

  // ACTIVE LOW RELAY
  if(state == 1)
  {
    digitalWrite(relayPin, LOW);   // Pump ON
    Serial.println("✅ Pump ON");
  }
  else
  {
    digitalWrite(relayPin, HIGH);  // Pump OFF
    Serial.println("⛔ Pump OFF");
  }
}

// ----------- MANUAL BUZZER ------------
BLYNK_WRITE(V3)
{
  manualBuzzer = param.asInt();

  // Manual buzzer only when no leak
  if(!leakActive)
  {
    digitalWrite(buzzerPin, manualBuzzer ? HIGH : LOW);
  }
}

// ---------------- SETUP ----------------
void setup()
{
  Serial.begin(115200);

  pinMode(flow1Pin, INPUT);
  pinMode(flow2Pin, INPUT);

  pinMode(relayPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  // Initial OFF state
  digitalWrite(relayPin, HIGH);   // Pump OFF
  digitalWrite(buzzerPin, LOW);

  // WiFi
  Serial.println("Connecting WiFi...");
  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi Connected");

  // Blynk
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);

  Serial.println("✅ Blynk Connected");

  // Flow interrupts
  attachInterrupt(digitalPinToInterrupt(flow1Pin), flow1_ISR, RISING);
  attachInterrupt(digitalPinToInterrupt(flow2Pin), flow2_ISR, RISING);
}

// ---------------- LOOP ----------------
void loop()
{
  Blynk.run();

  // Every 1 second
  if(millis() - lastCheck >= 1000)
  {
    lastCheck = millis();

   float f1 = count1 / 7.5;
   float f2 = count2 / 7.5;

    count1 = 0;
    count2 = 0;

   float diff = abs(f1 - f2);
    // Serial Monitor
    Serial.print("F1: ");
    Serial.print(f1);

    Serial.print(" | F2: ");
    Serial.print(f2);

    Serial.print(" | Diff: ");
    Serial.println(diff);

    // Send to Blynk
    Blynk.virtualWrite(V1, f1);
    Blynk.virtualWrite(V2, f2);
    Blynk.virtualWrite(V4, diff);

    // -------- LEAK DETECTION --------
    if(pumpState == true && diff > 2 && !leakActive)
    {
      Serial.println("⚠️ LEAK DETECTED!");

      leakActive = true;
      leakTime = millis();

      // Buzzer ON
      digitalWrite(buzzerPin, HIGH);
      Blynk.virtualWrite(V3, 1);
    }
  }

  // -------- AUTO PUMP OFF --------
  if(leakActive && millis() - leakTime >= 3000)
  {
    // Pump OFF
    digitalWrite(relayPin, HIGH);

    pumpState = false;

    // Blynk button OFF
    Blynk.virtualWrite(V0, 0);

    Serial.println("⛔ Pump OFF (Leak)");

    // Buzzer OFF
    digitalWrite(buzzerPin, LOW);
    Blynk.virtualWrite(V3, 0);

    // Reset leak mode
    leakActive = false;
  }
}