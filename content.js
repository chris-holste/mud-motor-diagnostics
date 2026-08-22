/* ==========================================================================
   Mud Motor Diagnostics — Content Data
   Engine: Briggs & Stratton Vanguard 810 EFI "Big Block" (40 HP)
           as installed on the 2026 Mud Buddy HDR 40 EFI
   Motor:  Same 40 EFI powerhead used across Mud Buddy AND Gator Tail rigs —
           this content applies to both brands regardless of gear-down/direct
           drive or drive length, since none of that changes the engine.

   SOURCING:
   - "manual" tagged content is transcribed from Briggs & Stratton's official
     "Electronic Fuel Injection Service & Diagnostics — Vanguard 810 EFI /
     Big Block EFI" repair manual, published by Mud Buddy at
     mudbuddy.com/wp-content/uploads/2024/02/40-efi-diagnostics-and-repair-manual.pdf
     This covers the ENGINE only (the 40 HP Vanguard powerhead itself).
   - "rig" tagged content is transcribed from Mud Buddy's own HD/HDR Owner's
     Manual (2024/25 ed.) and their official HDR EFI 2019 harness wiring
     diagram — mudbuddy.com/resources/manuals/ and /resources/wire-diagrams/.
     This covers the BOAT/RIG side: battery, breakers, key switch, shift,
     trim, and belt-housing wiring that the engine manual doesn't touch.
   - "field" tagged content is community/forum-reported (Southern Airboat,
     Michigan Sportsman, Lawnsite, etc.) — real-world failure patterns that
     are NOT in any OEM manual. Treat as "worth checking first" hints, not
     verified OEM procedures.
   - Confirmed from the manuals: this engine is Briggs Model 610000, marked
     "M61 Marine" in the component diagrams — the same physical layout shown
     in componentLocations.images below. Model 610000 does NOT get the HO2
     (oxygen) sensor (that's Turf-trim only) but DOES get IAC and TPS.
   - All manual PDFs (both engine and rig) are bundled in /manuals for full
     offline reference.
   - "notes" is your own field-tested knowledge, editable in the app and
     stored locally on your phone (never uploaded anywhere).
   ========================================================================== */

const CONTENT = {

  meta: {
    engine: "Briggs & Stratton Vanguard 810 EFI (Big Block EFI), 40 HP",
    motor: "2026 Mud Buddy HDR 40 EFI",
    fuelPressureSpec: "38–43 psi (262–296 kPa) at the fuel rail, key ON",
    batteryVoltageSpec: "12.2–13.5 V DC (engine off) / 12.2–14.5 V DC (key on, at ECM)",
    fuelPumpPrimeSpec: "Pump should prime ~2 seconds when ECM powers up. If it only primes ~0.5 sec, suspect the Safety (interrupt) Circuit.",
    ecmGroundSpec: "1.0 ohm or less, ECM ground pin (J2-02) to known good ground",
    onPlaneRpmSpec: "4100–4300 RPM on plane (per Mud Buddy owner's manual)",
    batteryPhysicalSpec: "Group 24 or larger battery, 550+ cranking amps. Motor ships with 9 ft of 4-gauge wire and a 120A main breaker. If you relocate the battery to the front of the boat, use 4-gauge cable for the run.",
    shiftCurrentSpec: "Normal current draw at the 20A accessory breaker: ~6A in forward, ~10A in reverse. Breaker self-resets when it cools.",
  },

  // ------------------------------------------------------------------------
  // Tool checklist
  // ------------------------------------------------------------------------
  tools: [
    { name: "Digital multimeter (DVOM)", why: "Battery, ECM power/ground, sensor & wiring circuit checks. Get one that reads DC volts, resistance (ohms), and ideally has a back-probe-friendly needle-tip lead.", required: true },
    { name: "Fuel pressure gauge, 0–100 psi, w/ Schrader fitting", why: "Confirms fuel rail pressure (spec 38–43 psi). OEM uses B&S part #19627 + #19624 adapter — a generic EFI fuel pressure test kit from an auto parts store works too.", required: true },
    { name: "Spark tester (inline/inductive type)", why: "Confirms each cylinder is getting spark without guessing from a pulled plug.", required: true },
    { name: "Basic hand tools", why: "Spark plug socket, flare-nut/open wrenches for fuel fittings, screwdrivers, pliers, dielectric grease, shop towels.", required: true },
    { name: "Spare fuses & fuel pump relay (same spec)", why: "Cheapest, most common failure points. Swap-testing a relay takes 10 seconds and rules out a huge category of no-start/stall problems.", required: true },
    { name: "Electrical contact cleaner + dielectric grease", why: "Corrosion at connectors (salt/marsh spray) is a very common field failure. Clean, dry, and protect after inspecting.", required: false },
    { name: "Spare spark plugs (gapped, correct type)", why: "Fouled/worn plugs are a common low-power/hard-start cause.", required: false },
    { name: "Fire extinguisher (dry chemical) + shop towels", why: "Required by the OEM manual any time you relieve fuel system pressure. Fuel rail is HIGH PRESSURE — treat it with respect.", required: true },
    { name: "Flashlight / headlamp", why: "You will be doing this at a bad time, in bad light.", required: false },
    { name: "DIY fused jumper wire (build it — see DIY Tools)", why: "Bypass-test a component (like the fuel pump) directly off the battery to tell in seconds whether the part or its wiring/relay is at fault. The single most useful homemade tool for chasing electrical gremlins.", required: true },
    { name: "Inline blade-fuse holder + assorted fuses", why: "For building the fused jumper, and as spares for the boat's own fuse panel.", required: true },
    { name: "12V test light", why: "Faster than a multimeter for a quick 'is there power here' check — no dial to set, easy one-handed on a moving boat. ~$8 at any auto parts store.", required: false },
    { name: "A few feet of 16-18 AWG wire + 2 alligator clips", why: "Raw materials for the fused jumper (and general on-the-water wiring repairs).", required: false },
    { name: "Heat-shrink butt connectors (assorted, marine-grade) + crimper", why: "Proper permanent-enough splice for a chafed or broken wire — see Field Wiring Repair. Far more reliable than tape once you're back in spray/vibration.", required: true },
    { name: "Lighter or small heat gun", why: "To shrink and seal butt connectors after crimping.", required: false },
    { name: "Self-fusing silicone tape", why: "Backup splice sealant if you have no heat source for shrink connectors — bonds to itself, seals better than plain electrical tape.", required: false },
    { name: "Spare ring/spade terminals", why: "For reattaching a ground wire to a stud properly instead of twisting it around the bolt.", required: false },
  ],

  // ------------------------------------------------------------------------
  // Multimeter Basics — zero-assumption primer. Every other page in this app
  // says "check voltage" or "check continuity" like that's self-explanatory.
  // This is the page that actually teaches it.
  // ------------------------------------------------------------------------
  multimeterBasics: {
    title: "How to Use a Multimeter (Start Here)",
    source: "field",
    images: [{ file: "images/multimeter-basics-diagram.png", caption: "Where the probes plug in, and which dial setting to use for a voltage test." }],
    intro: "Every test in this app assumes you know how to hold a multimeter. This page is that missing step — five minutes here saves a lot of confusion later. If you already know this, skip it.",
    parts: [
      "The dial (usually in the middle) — turns to pick what you're measuring.",
      "Two probes on wires — one red, one black.",
      "Two (or more) ports on the meter body where the probes plug in.",
    ],
    plugging: [
      "Black probe ALWAYS plugs into the port labeled COM (common/ground). This never changes, no matter what you're measuring.",
      "Red probe plugs into the port labeled VΩmA (volts/ohms/milliamps) for everything in this app — voltage and resistance/continuity both use this same port. (Some meters have a separate high-current \"10A\" port — you won't need that one here.)",
    ],
    dialSettings: [
      { setting: "DC Volts — look for V with a straight/dashed line (V⎓ or V---), NOT the V with a squiggly line (that's AC, for household outlets, never used on this motor)", use: "Battery voltage, ECM power checks, anything where you're measuring \"how many volts is here.\" On an auto-ranging meter it may just say V — make sure it's in DC mode, not AC." },
      { setting: "Resistance / Ohms — the Ω symbol", use: "Checking a fuse, checking a ground connection, checking a relay coil — anything where you're asking \"is there a complete path here, and how much does it resist.\"" },
      { setting: "Continuity — often the same dial spot as Ohms, marked with a sound-wave/diode symbol", use: "Same idea as resistance, but the meter beeps if the path is complete. Fastest way to check a fuse or a wire for a break." },
    ],
    takingReadings: [
      "Voltage: touch the BLACK probe to a known ground (battery negative, or a clean metal ground point), touch the RED probe to the point you want to test, read the number. Polarity matters for the reading to make sense, but on DC volts most meters just show a negative sign if you have them backwards — it won't hurt anything or the meter.",
      "Resistance/Continuity: touch a probe to each end of what you're testing — order doesn't matter here. KEY OFF / CIRCUIT DEAD before you do this. Measuring resistance on a live/powered circuit gives you a meaningless reading and can damage the meter.",
      "Back-probing a connector (what the manual asks for repeatedly): instead of jamming the probe into the front of a plugged-in connector, gently slide the probe tip in from the BACK, alongside the wire, until it touches the metal terminal inside. This lets you test a live, connected circuit without unplugging anything or damaging the connector.",
    ],
    reading: [
      "A normal number: that's your reading — compare it to the spec you're checking against (e.g. \"12.2–13.5V\" or \"1.0 ohm or less\").",
      "\"OL\", \"1\", or a blank/dashes on the screen (in resistance mode): means Open — no path, infinite resistance. For a fuse, that means it's blown. For continuity mode, no beep means the same thing.",
      "0 (or very close to it) in resistance mode: a complete, low-resistance path — good for a ground check or a good fuse.",
    ],
    cautions: [
      "Never measure resistance/continuity on a live circuit — key OFF first, every time.",
      "Don't touch the two probe tips together while measuring voltage on a circuit you don't fully understand — on most circuits here it's harmless, but it's a habit worth having anyway.",
      "If the screen shows nothing at all, check first that the meter is actually ON, and that the probes are in the right ports — this trips people up more than any actual circuit problem.",
    ],
  },

  // ------------------------------------------------------------------------
  // MIL blink-code procedure — read DTCs with ZERO scan tool
  // (manual, Section 1)
  // ------------------------------------------------------------------------
  milBlinkProcedure: {
    title: "Check for a Warning Light",
    subtitle: "Start here first if something's wrong — fastest way to find out exactly what, no tools needed.",
    source: "manual",
    whatIsThis: "Your motor has a small warning light — Briggs calls it the \"MIL\" (Malfunction Indicator Lamp), which is the exact same idea as the check-engine light in a car. When something's wrong, the engine's onboard computer turns that light on and remembers a short code describing the problem. You can make the light blink that code back out to you, using nothing but the ignition key — no scan tool, no laptop, no signal required.",
    images: [
      { file: "images/mil-flash-diagram.png", caption: "The OEM manual's own worked example: this exact blink pattern reads out as P0337." },
      { file: "images/dlc-connector-photo.png", caption: "The Data Link Connector (DLC) — the orange 6-pin plug you'd use IF you ever get access to a scan tool. Not needed for the blink method above." },
    ],
    intro: "This is the single most useful no-signal diagnostic trick this engine has. Mud Buddy's own owner's manual describes the same trick in simpler terms, quoted below alongside Briggs' more precise version — they agree, just worded differently.",
    prereqs: [
      "Battery voltage must be above 12V.",
      "You need to watch the warning light closely and count flashes.",
    ],
    quickVersion: "Mud Buddy's version (owner's manual): Turn the key from OFF to RUN 5 times within 5 seconds, ending with the key in the RUN position. The MIL then blinks out each stored code, with \"0\" shown as 10 quick blinks. Code \"061\" marks the end of the list — if that's the only thing that flashes, there are no active faults.",
    steps: [
      "Turn ignition key OFF for 10 seconds.",
      "Cycle the key ON‑OFF‑ON‑OFF‑ON, but do NOT start the engine. No more than 2.5 seconds between each ON/OFF click or the routine aborts and you must start over. (This is the same physical action as Mud Buddy's \"5 times within 5 seconds\" — just described more precisely.)",
      "Done correctly, the MIL begins flashing 4 digits, one digit at a time, with a 1-second pause between digits.",
      "The first digit is always 0 — shown as a fast series of ~10 flashes before the first pause. Ignore it; every code starts with P0.",
      "Count the flashes after pause 1 = 2nd digit. Count flashes after pause 2 = 3rd digit. Count flashes after pause 3 = 4th digit.",
      "Write down the 4-digit code as P0-XXX (e.g. 3 blinks, 3 blinks, 7 blinks after the pauses = P0337).",
      "If more than one code is stored, the next code starts flashing after a 3-second pause. Keep writing them down.",
      "When all codes have been shown, the engine flashes \"61\" as an end-of-list marker, then restarts the sequence so you can re-verify.",
      "IMPORTANT: If \"61\" is the very FIRST thing flashed, there are NO active codes stored — your problem may be intermittent or non-electrical. Use the symptom checklists on the home screen instead.",
    ],
    vocabDtc: "Each code you just read out is called a DTC — \"Diagnostic Trouble Code.\" It's just a short label like P0230 that points at a specific part or circuit. Now that you've got yours written down, look it up below to see what it means and what to actually do about it.",
    warning: "If you fix something on the water, the light may stay on until the codes are actually cleared — that's normal and doesn't mean the fix didn't work. See Clear Trouble Codes below, or confirm by re-running this read procedure after a fresh start: if the same code doesn't come back, you're good.",
  },

  // ------------------------------------------------------------------------
  // Clear trouble codes — no scan tool needed either. Sourced from Mud
  // Buddy's owner's manual; the Briggs engine manual only documents clearing
  // via the Tiny Scan Code Reader or ETA software.
  // ------------------------------------------------------------------------
  clearCodesProcedure: {
    title: "Clear Trouble Codes (No Scan Tool)",
    source: "rig",
    intro: "Once you've actually fixed the problem, this clears the stored code(s) and turns off the MIL without needing a scan tool or code reader.",
    steps: [
      "Turn the key from STOP to RUN 5 times within 5 seconds.",
      "End the sequence with the key in the STOP position.",
      "Wait 10 seconds.",
      "Start the engine normally — ECM memory is now cleared.",
    ],
    warning: "Only clear codes after you've actually addressed the problem. Clearing a code doesn't fix anything by itself, and it erases the evidence of what was wrong if you need to think it through again.",
  },

  // ------------------------------------------------------------------------
  // Diagnostic Trouble Codes — full list (manual, Section 2 index)
  // ------------------------------------------------------------------------
  dtcCodes: [
    { code: "P0031", title: "O2 Sensor Heater — Signal Voltage Low", note: "Confirmed from the component diagrams: the HO2 sensor is Turf-trim only on this engine family — your Marine (610000/M61) engine likely doesn't have one, so this code probably doesn't apply to you.", priority: "low" },
    { code: "P0032", title: "O2 Sensor Heater — Signal Voltage High", note: "Same as above — Turf-only, likely not applicable to your Marine engine.", priority: "low" },
    { code: "P0107", title: "MAP Sensor — Signal Voltage Low or Open", note: "Check MAP sensor connector and vacuum hose/port for leaks or a split line.", priority: "medium" },
    { code: "P0108", title: "MAP Sensor — Signal Voltage High", note: "Check for a pinched/blocked vacuum reference or a shorted signal wire.", priority: "medium" },
    { code: "P0112", title: "MAT Sensor — Signal Voltage Low", note: "Manifold Air Temp sensor circuit shorted low.", priority: "low" },
    { code: "P0113", title: "MAT Sensor — Signal Voltage High or Open", note: "Check connector for corrosion/open circuit.", priority: "low" },
    { code: "P0117", title: "EHT Sensor — Signal Voltage Low", note: "Engine Head Temp sensor circuit shorted low.", priority: "low" },
    { code: "P0118", title: "EHT Sensor — Signal Voltage High or Open", note: "Check connector for corrosion/open circuit.", priority: "low" },
    { code: "P0122", title: "TPS — Signal Voltage Low or Open", note: "Throttle Position Sensor — confirmed equipped on your Marine (610000/M61) engine. Check connector, and check for binding/worn throttle linkage.", priority: "medium" },
    { code: "P0123", title: "TPS — Signal Voltage High", note: "Same circuit, opposite fault direction. Confirmed equipped on Marine engines.", priority: "medium" },
    { code: "P0131", title: "O2 Sensor — Signal Voltage Low", note: "Turf-trim only per the component diagrams — likely not applicable to your Marine engine.", priority: "low" },
    { code: "P0132", title: "O2 Sensor — Signal Voltage High", note: "Turf-trim only per the component diagrams — likely not applicable to your Marine engine.", priority: "low" },
    { code: "P0174", title: "Power Enrichment (PE) — Lean Fuel Condition", note: "Often a fuel delivery issue (low pressure/weak lift pump — see fuel pump field notes) or an unmetered air leak at the throttle body/intake.", priority: "high" },
    { code: "P0201", title: "Cylinder 1 Fuel Injector Fault", note: "Check injector connector and wiring first — often cheaper than the injector itself.", priority: "medium" },
    { code: "P0202", title: "Cylinder 2 Fuel Injector Fault", note: "Check injector connector and wiring first.", priority: "medium" },
    { code: "P0230", altCode: "P0231 (per Mud Buddy owner's manual)", title: "Fuel Pump Relay Fault — Low or Open Circuit", note: "★ Matches the #1 field-reported failure on these motors (see Fuel Pump field notes). Source conflict: Briggs' official manual lists this as P0230; Mud Buddy's own owner's manual lists the same fault as P0231. If your MIL blinks either one, treat it the same — check the fuel pump relay and fuel pump module wiring/connector before condemning the pump.", priority: "high", relatedTest: "fuel-pressure" },
    { code: "P0232", title: "Fuel Pump Relay Fault — High Voltage", note: "★ Same circuit as P0230/P0231, opposite fault direction. Both manuals agree on this code number.", priority: "high", relatedTest: "fuel-pressure" },
    { code: "P0336", title: "Crankshaft Position (CKP) Sensor — Signal Noisy", note: "Intermittent — check connector and wiring routing near the flywheel for chafing.", priority: "medium" },
    { code: "P0337", title: "Crankshaft Position (CKP) Sensor — Signal Absent", note: "Classic no-start / no-crank-signal code. Check sensor air gap and connector.", priority: "high" },
    { code: "P0351", title: "Cylinder 1 Ignition Coil Fault", note: "Rough idle / lack of power / stalling on that cylinder.", priority: "medium", relatedTest: "spark-check" },
    { code: "P0352", title: "Cylinder 2 Ignition Coil Fault", note: "Rough idle / lack of power / stalling on that cylinder.", priority: "medium", relatedTest: "spark-check" },
    { code: "P0505", title: "Idle Air Control (IAC) Malfunction", note: "Confirmed equipped on your Marine (610000/M61) engine — labeled \"Marine Only\" on the component diagram. Rough/unstable/incorrect idle.", priority: "low" },
    { code: "P0562", title: "System Voltage Low", note: "Check battery, charging system, and — very common on marsh/marine rigs — vibration-loosened battery or ground connections. Also check the 120A main breaker at the battery (see Component Locations).", priority: "high", relatedTest: "ecm-power-ground" },
    { code: "P0563", title: "System Voltage High", note: "Charging system / regulator issue.", priority: "medium", relatedTest: "ecm-power-ground" },
    { code: "P0650", title: "MIL Circuit Malfunction", note: "The check-light circuit itself has a fault — ironic, but check MIL wiring/bulb.", priority: "low" },
    { code: "P1500", title: "Safety Interrupt Sensor Malfunction", note: "★ Not in the Briggs engine manual — this is Mud Buddy's own rig-level code for the neutral/safety-lanyard interlock system. If your engine won't crank, check this before anything else: confirm the shift is in Neutral and the safety lanyard is properly seated (see Won't Crank).", priority: "high" },
  ],

  // ------------------------------------------------------------------------
  // ECM Connector pinouts (manual, Section 4 — ECM Connector Symptoms)
  // ------------------------------------------------------------------------
  wiring: {
    intro: "Use these tables with a DVOM and back-probe pins (never force a probe into the front of a connector — you'll deform the terminal). Compare live readings against the specs above. This is the manual's last-resort table when a symptom doesn't point to one clean cause.",
    connectors: [
      {
        name: "ECM Connector J1 (Grey)",
        pins: [
          { pin: "J1-07/08", func: "MIL (Malfunction Indicator Lamp)", color: "Orange/Black", symptom: "MIL inoperative" },
          { pin: "J1-10", func: "Tachometer", color: "Black/Red", symptom: "Tachometer inoperative" },
          { pin: "J1-11", func: "CAN Low", color: "Green", symptom: "No CAN signal" },
          { pin: "J1-13", func: "CAN High", color: "Yellow", symptom: "No CAN signal" },
          { pin: "GROUND", func: "ECM Ground", color: "Black", symptom: "Open ground or high resistance ground — can cause ANY/ALL symptoms. Check this first." },
          { pin: "IGN COIL CYL 2", func: "Engine Spark Timing Coil Cyl 2", color: "Blue/Red", symptom: "Rough, unstable, or incorrect idle" },
          { pin: "—", func: "Various IAC High/Low A & B (if equipped)", color: "Violet/White, Blue/Green, Blue/Grey", symptom: "Rough idle, lack of power, stalling; no-start" },
          { pin: "MPR", func: "Main Power Relay", color: "Red", symptom: "An open B+ circuit or high resistance in the B+ circuit — can cause ANY/ALL symptoms." },
        ],
      },
      {
        name: "ECM Connector J2 (Black)",
        pins: [
          { pin: "J2-01", func: "Ignition Coil Cyl 1", color: "Violet/Black", symptom: "Rough idle, lack of power, stalling" },
          { pin: "J2-02", func: "Ground", color: "Black", symptom: "Open ground or high resistance — can cause ANY/ALL symptoms. Spec: 1.0 ohm or less to a known-good ground." },
          { pin: "J2-03", func: "K-LINE (serial diagnostic data)", color: "Pink", symptom: "No diagnostic data" },
          { pin: "J2-04", func: "CKP High", color: "Black/White", symptom: "No start" },
          { pin: "J2-05", func: "Fuel Injector Cyl 1", color: "Lt.Blue/Black", symptom: "Rough idle, lack of power, stalling" },
          { pin: "J2-06", func: "Fuel Injector Cyl 2", color: "Lt.Blue/White", symptom: "Rough idle, lack of power, stalling" },
          { pin: "J2-07", func: "HO2S Heater Control (if equipped)", color: "White/Green", symptom: "Lack of power, surge, rough idle, exhaust odor" },
          { pin: "J2-08", func: "MAT Sensor", color: "Tan/Black", symptom: "Rough idle" },
          { pin: "J2-09", func: "High Pressure Fuel Pump Module", color: "Blue/Yellow", symptom: "No start — ★ check this first for fuel-related no-start" },
          { pin: "J2-10", func: "5V Return", color: "Brown", symptom: "Lack of performance, stalling, exhaust odor" },
          { pin: "J2-11", func: "MAP Sensor", color: "White/Red", symptom: "Poor performance, surge, poor fuel economy, exhaust odor" },
          { pin: "J2-12", func: "TPS (if equipped)", color: "Pink/Black", symptom: "Rough idle" },
          { pin: "J2-13", func: "CKP Low", color: "Green/White", symptom: "No start" },
          { pin: "J2-14", func: "EHT Sensor", color: "Tan", symptom: "Poor performance, exhaust odor, rough idle" },
          { pin: "J2-15", func: "IGN (switched ignition power)", color: "Red", symptom: "No start, MIL inoperative" },
          { pin: "J2-16", func: "5V Reference", color: "Red/White", symptom: "Lack of power, surge, rough idle, exhaust odor" },
          { pin: "J2-17", func: "HO2S Signal", color: "Grey/Black", symptom: "Lack of power, surge, rough idle, exhaust odor" },
          { pin: "J2-18", func: "Battery Voltage +12V — HOT AT ALL TIMES with battery connected", color: "Red", symptom: "No start. Spec: 12.2–14.5V DC key ON." },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------------
  // Component Locations — real diagrams pulled directly from the Briggs
  // manual, confirmed to match your engine (Model 610000 / "M61 Marine").
  // ------------------------------------------------------------------------
  componentLocations: {
    title: "Where Things Actually Are",
    source: "manual",
    intro: "This is the exact component diagram for your engine — confirmed by matching the \"M61 Marine\" labels in the manual against the service bulletin that names Model 610000 as the marine variant. This is inferred, not read off your actual engine's tag (you don't have the motor in hand yet) — worth a 10-second check against the model sticker once you do.",
    images: [
      {
        file: "images/efi-wire-harness-diagram.png",
        caption: "The full EFI wire harness, every connector labeled — the single clearest picture of how everything connects.",
        callouts: [
          "Orange section (A): Fuse/Relay Block, ECM J2, Ignition Coil Cyl 2, MAP/MAT Sensor, Fuel Injector Cyl 2 — all clustered together.",
          "Blue section (B): ECM J1, ECM Ground Wire, CKP Sensor, Fuel Injector Cyl 1, Ignition Coil Cyl 1, IAC.",
          "Green section (C): Fuel Pump Module, TPS, EHT Sensor, DLC, and the Starter Solenoid connections down at the far end.",
          "The Fuse/Relay Block (far left) and ECM sit right next to each other — that's the cluster to find first.",
        ],
      },
      {
        file: "images/component-locations-marine-610000.png",
        caption: "Same information, laid over an actual engine photo/drawing — Models 540000/610000 (your engine — Marine).",
        callouts: [
          "Fuse/Relay Block sits right at the top of the engine, immediately next to the ECM — they share a common mounting bracket.",
          "ECM is top-center, the block with the wire connectors (J1/J2) plugged into it.",
          "DLC (diagnostic port, for a scan tool) is lower-right, near the CKP sensor by the flywheel end.",
          "CKP (crank position) sensor is bottom-right, close to the flywheel.",
          "MAP/MAT sensor is top-left area, right next to the fuse/relay block.",
        ],
      },
    ],
    fallbackNote: "If your engine's tag says Model 490000 instead of 540000/610000, the layout is different (Fuse/Relay Block sits lower-left instead of top-center) — see Section 2 of the bundled Full Manual PDF for that diagram.",
  },

  // ------------------------------------------------------------------------
  // Power Path — "walk from the battery." Sourced from Mud Buddy's own HDR
  // EFI harness diagram + HD/HDR owner's manual (rig-level, not engine).
  // ------------------------------------------------------------------------
  powerPath: {
    title: "Walk the Power From the Battery",
    source: "rig",
    images: [{ file: "images/control-harness-diagram.png", caption: "Mud Buddy's own HDR EFI harness diagram — battery, breakers, key switch, relays, and the starter solenoid, all in one picture." }],
    intro: "The engine manual only covers wiring on the engine itself. This is the boat/rig side — from the battery to the engine — sourced from Mud Buddy's own harness diagram and owner's manual. Use this as your map when you're tracing power with a test light or multimeter: start at the battery, work outward, find where it stops.",
    hops: [
      { title: "1. Battery", detail: "Group 24 or larger, 550+ cranking amps. This is your starting point for every voltage check — battery negative is your \"known good ground\" for most tests in this app." },
      { title: "2. 120A main circuit breaker", detail: "Mounted right at/near the battery, inline on the positive cable. The motor ships with 9 ft of 4-gauge wire and this breaker as a factory-installed pair — if you relocated the battery, this is where that run starts. This is a manual-reset breaker, not a fuse — if it's tripped, it can usually be reset by hand once you've found and fixed the cause." },
      { title: "3. Key/ignition switch", detail: "Located on the front of the engine itself (not on the boat's console/handle on this rig). Power from the battery/breaker reaches here first." },
      { title: "4. 20A accessory circuit breaker", detail: "Protects the shift/forward-reverse circuit downstream of the key switch. Normal draw is ~6A in forward, ~10A in reverse — over 20A means a genuine short, under 20A but still tripping means just replace the breaker. Self-resets when it cools." },
      { title: "5. Engine-mounted Fuse/Relay Block", detail: "This is the block shown in Component Locations, up by the ECM — handles the EFI side (fuel pump relay, main power relay for the ECM itself). Different from the 20A accessory breaker above, which is a rig-level part, not engine-level." },
      { title: "6. Grounding lug (near the belt housing)", detail: "A separate, known trouble spot per Mud Buddy's own troubleshooting guide — a loose or corroded connection here specifically causes shifting problems (forward works but not reverse, or vice versa). Worth checking any time you have an electrical-feeling fault that isn't explained by the engine-side checks." },
      { title: "7. Everything else", detail: "ECM, relays (trim up/down, in-gear protection), starter solenoid (protected by its own 40A breaker), shift/trim actuators — all fed from the paths above. If you've confirmed good voltage through steps 1-4 and still have a problem, it's isolated to one of these end components or their specific wiring." },
    ],
  },

  // ------------------------------------------------------------------------
  // Rig-specific troubleshooting — transcribed directly from Mud Buddy's own
  // HD/HDR owner's manual troubleshooting table. This is the manufacturer's
  // own guidance for THIS boat, not the generic engine manual — covers shift,
  // trim, and drops-out-of-gear problems the Briggs manual doesn't address.
  // ------------------------------------------------------------------------
  rigTroubleshooting: [
    {
      id: "wont-start-rig",
      title: "Engine Won't Start (rig-level checks)",
      checks: [
        "Check the safety lanyard is properly seated.",
        "Confirm the shift switch is in Neutral — the engine won't crank if it isn't.",
        "Check the main circuit breaker at the battery (120A).",
        "Check battery voltage: 12.2-13.5V.",
        "Turn the key to run and listen for the fuel pump to initialize (prime) — if you hear it, the ECU is getting power.",
        "Does the MIL light turn on when the key is turned to run? If not, check power to the MIL/ECM circuit.",
      ],
    },
    {
      id: "shifts-one-way",
      title: "Shifts Forward But Not Reverse (or vice versa)",
      checks: [
        "Check electrical ground connections coming from the belt housing — look for a loose or corroded connection at the grounding lug. (If it engages in one direction but not the other, the positive circuit is already known good at least up to the shift switch — so suspect the ground first.)",
        "Check the electrical connector behind the handle: position 10 (Red) is Forward, position 11 (Gray) is Reverse. Look for contacts not fully seated, or broken/damaged wires.",
        "Check the electrical 2-pin connector inside the belt housing — confirm contacts are fully seated with no broken/damaged wires.",
      ],
    },
    {
      id: "rough-idle-rig",
      title: "Starts, But Rough Idle/Run",
      checks: [
        "Turn key to ON — does the lift pump sound loud/strong? If it sounds weak, check fuel delivery (see Fuel Pump field notes).",
        "Check the air filter and fuel filter are in good shape with no obstructions.",
        "Check connections at the battery, the 120A breaker, and all grounds.",
        "Double check the gap between the CKP sensor and flywheel, reset if necessary.",
        "Try an ECM memory reset (see Clear Trouble Codes).",
      ],
    },
    {
      id: "drops-out-of-gear",
      title: "Forward or Reverse Drops Out Under Power",
      checks: [
        "Check the 20A accessory power circuit breaker. If it's tripped: measure current. Over 20A means look for a short circuit; under 20A means just replace the breaker (it's not the wiring, the breaker itself is weak).",
        "Normal current draw for reference: ~6A in forward, ~10A in reverse. A tripped breaker will block forward/reverse until it resets (it self-resets once it cools).",
      ],
    },
    {
      id: "no-forward-reverse",
      title: "No Forward or Reverse At All",
      checks: [
        "Check for a loose/intermittent ground at the grounding lug.",
        "Check the accessory power lug at the key switch (it's a red wire spade connector).",
        "Check for voltage at the 20A circuit breaker.",
        "Check all grounding connections at the grounding lug.",
        "Check connections at the handle and inside the belt cover.",
      ],
    },
  ],

  // ------------------------------------------------------------------------
  // Field tests (manual-sourced step-by-step procedures)
  // ------------------------------------------------------------------------
  fieldTests: [
    {
      id: "ecm-power-ground",
      title: "ECM Power & Ground Test",
      source: "manual",
      why: "The ECM is the little computer that runs the engine. Like anything electronic, it needs two things to work: power coming in, and a good \"ground\" connection going back out. If either one is bad, you get weird, hard-to-explain problems — random stalling, things that don't match any single trouble code. This test checks both in a few minutes.",
      tools: ["Multimeter"],
      gearNote: [
        "Haven't used a multimeter before? Go read \"How to Use a Multimeter\" first (from the home screen) — it walks through the basics this test assumes you already know.",
      ],
      vocab: [
        "\"Ground\" just means the return path electricity flows through to get back to the battery's negative side — think of it like a drain that water flows back out through, instead of the pipe (\"power\") that brings water in.",
        "\"Back-probing\" means sliding your meter's probe in from behind a connector that's still plugged in, so you can test a live wire without unplugging anything.",
      ],
      steps: [
        "Turn the ignition key all the way OFF.",
        "Find the ECM — it's the small black computer box near the engine (see Component Locations & Power Path in this app for a picture of exactly where it sits). It has two plugs coming out of it, called J1 (grey) and J2 (black).",
        "You're going to back-probe pin J2-18, which has a red wire. Gently slide your multimeter's red probe tip in along the back of that wire, right next to the connector, until it just touches the metal pin inside. Don't unplug anything, and don't force the probe — if it doesn't slide in easily, back off and try again at a slightly different angle.",
        "Clip your multimeter's black lead to a \"known good ground\" — the easiest spot is the battery's negative (-) terminal.",
        "Turn the multimeter's dial to DC volts (the symbol is a V with a straight or dashed line — not the V with a squiggly line, that's AC and you won't use it here).",
        "Turn the ignition key to ON, but don't start the engine. Read the number on the meter's screen.",
        "GOOD result: 12.2 to 14.5 volts. That wire's fine — skip to the next pin below.",
        "BAD result (no reading, or way lower): there's a broken wire or a blown fuse between here and the battery. Check the 15-amp fuse labeled \"Ignition\" (Blue) first — that's the cheap, easy thing to check before you go hunting for a broken wire.",
        "Now move your red probe over to pin J2-15 — also a red wire, same connector. Repeat the exact same voltage check with the key ON.",
        "GOOD: 12.2 to 14.5 volts again. BAD: there's a break somewhere in the ECM's power wiring — this one may need a shop's help to chase down.",
        "One more: move your probe to pin J2-02, which has a black wire. This time, turn your multimeter's dial to resistance/ohms instead of volts (look for the Ω symbol).",
        "Touch your black lead to a known-good ground again (battery negative works), and read the number.",
        "GOOD: 1.0 ohm or less — the display should show a number close to zero. BAD: a higher number means a bad or corroded ground connection. This is one of the single most common causes of weird, hard-to-pin-down electrical problems on these motors — cleaning and tightening that ground connection fixes a lot of \"impossible to diagnose\" issues.",
      ],
    },
    {
      id: "fuel-pressure",
      title: "Fuel Rail Pressure Test",
      source: "manual",
      images: [
        { file: "images/fuel-pump-module-diagram.png", caption: "The fuel pump module — port C is where the fuel rail's quick-disconnect fitting attaches. This is what you're looking for near the engine." },
        { file: "images/fuel-rail-diagram.png", caption: "The fuel rail assembly — this is the \"quick disconnect fitting\" mentioned in the steps below, and roughly where the Schrader test valve lives." },
      ],
      why: "This checks whether fuel is actually reaching the engine at the right pressure. Think of it like checking the water pressure in a garden hose — if the pressure's too low, nothing downstream works right, no matter how good everything else is. Weak fuel pressure is the single most common reason this motor won't start or stalls a lot.",
      tools: ["Fuel pressure gauge kit with a hose/screw-on fitting", "shop towels", "a small container for spilled fuel"],
      gearNote: [
        "This is NOT your tire pressure gauge — you need an actual EFI fuel pressure test kit, which has a hose and a fitting that screws onto the fuel line. Auto parts stores (AutoZone, O'Reilly, Advance Auto, etc.) sell these for roughly $20-40, and some will loan one out for free with a deposit — just ask for an \"EFI fuel pressure test kit.\"",
        "Any old rags or paper shop towels work fine.",
        "For the container: an empty cup, a cut-open water bottle, anything that can catch a little spilled gas works.",
        "Wear some kind of eye protection — real safety glasses are best, but sunglasses beat nothing.",
      ],
      caution: "The fuel in this line is under real pressure — kind of like a soda can that's been shaken. When you open the connection, a small squirt of fuel is normal. That's why you wear eye protection, keep it away from anything that could spark (no smoking, no running engines nearby), and have a towel ready. Gasoline is flammable, so treat it with respect — but this is a standard, safe test as long as you follow the steps below in order.",
      steps: [
        "Turn the ignition key all the way OFF.",
        "Open the gas cap, then close it again. This lets built-up pressure out of the tank first so nothing surprises you later.",
        "Find the Schrader valve — this is a small valve that looks and works just like the valve stem on a car or bike tire, except it's on the fuel line near the engine (on the metal fitting between the fuel pump and the fuel rail). See Component Locations & Power Path in this app if you're not sure where to look — it's a small brass fitting, easy to miss the first time.",
        "There's a small plastic or rubber cap covering the valve. Twist or pull it off and set it somewhere you won't lose it.",
        "Wrap a shop towel loosely around the valve before you do anything else — a small squirt of fuel here is normal, the towel just catches it.",
        "Screw your fuel pressure gauge's hose fitting onto the valve — same idea as screwing a garden hose onto an outdoor spigot. Turn it clockwise until snug. Don't overtighten, just snug is enough.",
        "Turn the ignition key to ON, but don't start the engine yet. You should hear a brief hum for a couple seconds — that's the fuel pump priming the system. Watch the gauge's needle move.",
        "Once the needle settles, read the number. This engine's normal range is 38 to 43 PSI. (PSI is just a unit of pressure — for a rough feel of the number, that's in the same ballpark as the air pressure in a full-size truck tire, even though it's measuring something totally different.)",
        "Turn the ignition key back OFF.",
        "Before you unscrew anything: relieve the pressure first. Most gauges have a small bleed button or valve on the hose — point it into your container and press/open it until the needle drops all the way to zero. This lets the trapped fuel out safely instead of spraying when you disconnect.",
        "Once the gauge reads zero, unscrew it from the valve (counter-clockwise) and put the little protective cap back on.",
      ],
      interpret: [
        "Steady 38-43 PSI: fuel delivery is working fine — the problem is somewhere else (spark, sensors, or something mechanical). Move on to the next check.",
        "Low pressure, or the needle creeps up slowly instead of jumping to a number: the fuel pump is weak, the fuel filter is clogged, or a line is pinched/kinked somewhere. See the Fuel Pump section under Known Issues.",
        "Pressure looks fine but drops fast right after you turn the key off: could be a leaking injector or a bad check valve in the pump. Worth a shop visit if you can't spot an obvious leak yourself.",
        "No pressure at all, needle doesn't move: the fuel pump probably isn't getting power at all — check the fuel pump fuse and relay first. Those are the cheapest, easiest things to check before assuming the pump itself is dead.",
      ],
    },
    {
      id: "fuel-contamination",
      title: "Check Fuel for Water & Air",
      source: "field",
      why: "Water in the fuel and air trapped in the lines cause symptoms that look a lot like a dying engine — power fading while running, stalling, refusing to restart — but the fix has nothing to do with the engine itself. This is a very common, well-documented issue on ethanol gas in marine use, and it happens even on brand-new motors: one owner's brand-new 40 EFI lost power mid-run and died: turned out to be water in the tank, found in about 10 minutes once someone knew to check for it.",
      tools: ["A clear container (cup, jar, or a clear inline water separator if you have one)", "Basic hand tools for a hose clamp/fitting"],
      gearNote: [
        "If you don't already run a water-separating fuel filter with a clear bowl, it's worth adding — auto/marine parts stores sell drainable clear-bowl water separator kits for $15-30, and they let you SEE a water problem building up before it strands you, instead of finding out the hard way.",
        "Ethanol (the \"E10\" on the pump) is the root cause here — it absorbs moisture out of the air. Non-ethanol/ethanol-free gas avoids this problem entirely if it's available near you, and marine-specific fuel stabilizer with an ethanol treatment added at every fill-up (not just before storage) slows it down a lot.",
      ],
      steps: [
        "Water sinks — it's denser than gasoline, so it collects at the very bottom of whatever it's in (tank, filter bowl, a sample container).",
        "If you have a clear-bowl water separator: look at it in decent light. Water shows up as a distinct layer or bubble at the bottom, usually with a visible line between it and the gas above. Drain it via the petcock/drain valve if there's any water at all.",
        "No separator installed: turn the ignition OFF, relieve fuel pressure (see the Fuel Rail Pressure Test caution steps), then disconnect the fuel line at the lowest accessible point — often right at the fuel filter — and catch a small sample in your clear container. Let it sit a minute and look for a layer at the bottom.",
        "For air in the lines: with the engine running or cranking, look at any clear/translucent sections of fuel hose for bubbles moving through — that's air being pulled into the system instead of solid fuel.",
        "Running the tank completely dry is the single most common way air gets into an EFI fuel system. The electric pump usually clears this itself — cycle the key ON-OFF a few times to let it re-prime (you should hear it hum each time) before assuming something's actually broken.",
        "If cycling the key doesn't clear it, or it keeps coming back, look for the actual air leak: a loose fitting, a cracked line, or a connector that isn't fully seated between the tank and the pump.",
      ],
      interpret: [
        "Water found: there's no fixing contaminated fuel — drain the tank and any water that made it past the tank into the lines/filter, replace the fuel filter, and refill with fresh fuel. Don't just top off on top of bad fuel.",
        "No water, but the filter looks dark, gunked up, or has visible debris: replace it. A clogged filter starves the engine under load even when it flows fine sitting at idle.",
        "Air confirmed but clears with key-cycling and doesn't return: you were just out of gas or had just refueled — not an ongoing problem.",
        "Air keeps coming back after priming: there's a real leak somewhere between the tank and the pump — inspect every fitting and hose clamp along that run.",
      ],
    },
    {
      id: "spark-check",
      title: "Spark Check (per cylinder)",
      source: "manual",
      images: [{ file: "images/ignition-coil-photo.png", caption: "One of the two ignition coil assemblies — this is what you're unplugging the spark plug wire from." }],
      why: "This tells you whether each spark plug is actually getting the spark it needs to fire. You can have perfect fuel pressure and a perfectly good engine, but if there's no spark, it will never start.",
      tools: ["Inline or inductive spark tester"],
      gearNote: [
        "Don't just pull a spark plug and hold it near metal to \"see if it sparks\" — that old trick can actually damage this engine's electronics. Buy a real inline spark tester (looks like a spark plug with a little window in it) for about $10-15 at any auto parts store, or an inductive clamp-style tester if you already have one.",
      ],
      steps: [
        "Turn the ignition OFF before you touch anything.",
        "Find one of the two spark plug wires — the thick rubber-coated wires running from the ignition coils down to the spark plugs.",
        "Unplug that wire from the spark plug by pulling on the rubber boot at the end, not the wire itself.",
        "Connect your inline spark tester in between the wire and the plug — it just clips in, following whatever instructions came with the tester.",
        "Have someone crank the engine (or do it yourself if you can reach both the key and see the tester) while you watch the tester's window.",
        "You're looking for a bright blue spark jumping across the tester every time the engine turns over. A weak orange/yellow spark, or nothing at all, means a problem on that cylinder.",
        "Reconnect that wire, then repeat the exact same test on the other cylinder's spark plug wire.",
        "Both cylinders show a strong, consistent blue spark: ignition's fine — the problem is somewhere else (fuel delivery or a sensor).",
        "One cylinder is weak or has no spark: that cylinder's ignition coil or its wiring is the suspect — see the Wiring Reference page for that coil's connector pin.",
      ],
    },
  ],

  // ------------------------------------------------------------------------
  // 5-Minute Electrical Triage — a fast path, not a replacement for the full
  // symptom trees. Ordered by how often each item turns out to be the actual
  // cause on this powerhead family, cheapest/fastest checks first.
  // ------------------------------------------------------------------------
  electricalTriage: {
    title: "5-Minute Electrical Triage",
    source: "field",
    intro: "Most of the no-start / stalls-randomly / dies-under-load complaints on this powerhead family (Mud Buddy and Gator Tail both) turn out to be electrical — a fuse, a relay, a corroded ground or connector — not the fuel system or the engine itself. Before you work through the full symptom checklists, run this order with just a multimeter and whatever spares are in your bag. It catches the majority of on-the-water failures fast.",
    order: [
      {
        title: "1. Fuses",
        detail: "Pull every fuse in the EFI/fuel pump circuit and check it. Don't just eyeball it — a hairline-blown fuse can look fine. Set the multimeter to resistance (ohms): a good fuse reads ~0 ohms, a blown one reads OL (open/infinite). Replace with a same-amp spare, never a higher rating.",
      },
      {
        title: "2. Fuel pump relay / main power relay",
        detail: "The single most failure-prone part in this whole system, and the fastest to check: swap in a spare of the same type. If that fixes it, you're done — see Relay Swap & Bench Test if you don't have a spare.",
        relatedDiy: "relay-swap-test",
      },
      {
        title: "3. Battery & main connections",
        detail: "Check terminals for corrosion/looseness, and confirm battery voltage is 12.2-13.5V. A weak or undercharged battery causes symptoms that look like they're coming from everywhere else in the system.",
      },
      {
        title: "4. ECM power & ground",
        detail: "Run the ECM Power & Ground Test (back-probe J2-18, J2-15, J2-02 with the multimeter). This one test catches a huge share of intermittent 'everything is weird' faults.",
        relatedTest: "ecm-power-ground",
      },
      {
        title: "5. Key connectors",
        detail: "Unplug and inspect the ECM connectors (J1/J2) and the fuel pump module connector for green/white corrosion or a backed-out pin. Clean with contact cleaner and reseat.",
      },
      {
        title: "6. Bypass-test the fuel pump directly",
        detail: "Still not sure if it's the pump or the wiring/relay feeding it? Use a fused jumper wire to power the pump module directly from the battery. If it runs strong on direct power, the pump's fine and the fault is upstream.",
        relatedDiy: "fused-jumper",
      },
    ],
  },

  // ------------------------------------------------------------------------
  // DIY diagnostic tools — build/use guides for the physical tools this
  // engine's electrical faults actually call for. "field"-sourced practical
  // technique, not OEM procedure.
  // ------------------------------------------------------------------------
  diyTools: [
    {
      id: "fused-jumper",
      title: "Fused Jumper Wire (Bypass Tester)",
      icon: "🔧",
      why: "Lets you power a component — most usefully the fuel pump — directly from the battery, bypassing its relay/switch/wiring, to find out in seconds whether the component itself is bad or the fault is upstream. This is the single most useful 5-minute DIY tool for chasing an electrical gremlin on the water.",
      materials: [
        "About 3 ft of 16-18 AWG stranded wire",
        "2 automotive alligator clips (crimp-on or solder-on)",
        "1 inline blade-fuse holder + a fuse — match the amp rating to the circuit you're testing (check the fuse already protecting that circuit, don't exceed it)",
        "Wire crimpers or a soldering iron + heat shrink/electrical tape",
      ],
      build: [
        "Cut one ~3 ft length of wire.",
        "Splice the inline fuse holder into the middle of it — this protects both the wire and whatever you're testing from a dead short.",
        "Attach an alligator clip to each end.",
        "Label it and leave it in your tool bag permanently — you'll use this constantly.",
      ],
      use: [
        "Ignition OFF. Unplug the component's normal connector first (e.g. the fuel pump module connector) — never back-feed power into the harness while it's still connected.",
        "Clip one end to a good battery positive (+) point.",
        "Clip the other end (through the fuse) to the component's power pin. For the fuel pump module that's the Blue/Yellow wire (ECM pin J2-09 — see Wiring Reference), but it's easiest to identify right at the pump module connector itself.",
        "Make the connection briefly and watch/listen for the component to activate (pump should prime/run).",
        "Runs strong on direct power: the component's fine — the fault is in the relay, wiring, connector, or switch that normally feeds it. Go check those next.",
        "Doesn't run at all: the component itself is likely bad — but double-check you have a good ground on your jumper setup before condemning the part.",
      ],
      cautions: [
        "ALWAYS include the inline fuse. A bare jumper with no fuse protection turns a simple test into a fire risk the moment anything shorts.",
        "Never use this to bypass a safety interlock (kill switch, neutral safety switch) — those exist to keep the prop from spinning unexpectedly.",
        "This is a diagnostic test, not a repair. Don't run the motor with a bypass jumper left in place.",
        "Keep spark-prone connect/disconnect moments away from open fuel fittings or spilled fuel.",
      ],
    },
    {
      id: "relay-swap-test",
      title: "Relay Swap & Bench Test",
      icon: "🔁",
      why: "Relays fail constantly and cheaply on marine rigs — vibration plus corrosion is a bad combination. The fastest test is swapping in a known-good spare of the same type. No spare? You can bench-test the suspect relay with just a multimeter.",
      materials: [
        "Multimeter",
        "A spare relay of the same type — this is the best 'tool' you can carry. Buy two, keep one in the bag.",
        "A fused jumper (see above) to energize the coil for the click test, optional",
      ],
      build: [],
      use: [
        "Easiest test: pull the suspect relay and plug in an identical spare. (Fuel pump relay and main power relay are often the same physical part on these rigs — check before assuming.) Problem goes away → you found it.",
        "No spare on hand? Pull the relay and read the pin diagram molded into its case. Standard automotive mini relays have 4-5 pins: 30 (power in), 87 (switched output), 85/86 (coil).",
        "Multimeter to resistance (ohms). Check across the coil pins (85/86) — you should read a real resistance value, not a dead short and not OL/open. Either extreme means a bad coil.",
        "Check across the switch contacts (30/87) with the relay NOT energized — should read open (OL). Confirms the contacts aren't welded shut.",
        "To confirm it actually switches: briefly energize the coil (85/86) with 12V via a fused jumper and listen for a click while watching continuity across 30/87 — it should snap from open to near-0 ohms the instant the coil is powered.",
      ],
      cautions: [
        "Relay pinouts aren't perfectly universal — if the case has no diagram, don't guess blindly at which pins are the coil vs. the switched circuit.",
        "A clean bench test proves the relay CAN switch — it doesn't rule out an intermittent fault that only shows up under heat/vibration. If it bench-tests fine but you still suspect it, swap it anyway if you have a spare.",
      ],
    },
    {
      id: "test-light",
      title: "Test Light (a real \"power detector\")",
      icon: "💡",
      why: "A 12V test light is faster than a multimeter for a quick go/no-go 'is there power here' check — no dial to set, no risk of it being on the wrong setting, easy to use one-handed on a rocking boat. A decent one is $5-10 at any auto parts store.",
      materials: [
        "Bought: a 12V automotive test light (recommended — durable, ready to go)",
        "DIY: a small 12V bulb or LED (+ resistor if LED) + wire + an alligator clip + a sharp probe tip",
      ],
      build: [
        "Buying one is genuinely the better call here — an $8 test light is worth it over building one when you're troubleshooting on a wet, moving boat.",
        "If you do build one: wire the bulb/LED in series between the probe tip and the alligator clip lead.",
      ],
      use: [
        "Clip the lead to a known-good ground (battery negative or a clean chassis ground point).",
        "Touch the probe tip to whatever point you want to check for power.",
        "Light glows → power's present at that point. No light → power's missing upstream — work backward toward the battery/fuse/relay until you find where it stops.",
        "This is a presence/absence check, not a voltage reading — grab the multimeter when you need an actual number (like confirming the 12.2-14.5V ECM spec).",
      ],
      cautions: [
        "A basic test light draws a small load — fine for power/ground/relay/fuse circuits, but NOT safe to use on sensitive low-current sensor signal wires (MAP, TPS, etc.). Use the multimeter (high impedance) for those instead.",
        "Important myth-buster: the pen-style \"non-contact voltage detectors\" sold as general-purpose \"power detectors\" are built for AC household wiring and are unreliable on low-voltage DC automotive/marine circuits. Don't count on one here — a contact test light or multimeter is the right tool for 12V DC work.",
      ],
    },
  ],

  // ------------------------------------------------------------------------
  // Field Wiring Repair — how to actually fix a wire on the water once
  // you've found the fault. "field"-sourced practical technique, not OEM
  // procedure. Deliberately steers away from piercing/vampire taps, since
  // the OEM manual explicitly warns that punctured insulation lets water in
  // and causes exactly the corrosion failures this whole app is full of.
  // ------------------------------------------------------------------------
  wireRepair: {
    title: "Field Wiring Repair",
    source: "field",
    intro: "Finding the fault is half the job — this is how to actually fix a chafed, corroded, or broken wire on the water so it survives the ride home instead of failing again in an hour. Do this right and it'll outlast a lot of factory splices; do it with just electrical tape and it'll be back to haunt you by your next trip.",
    materials: [
      "Heat-shrink butt connectors (adhesive-lined / marine-grade), assorted sizes for 14-18 AWG",
      "Wire strippers/crimpers (a combo tool is fine)",
      "Lighter or small heat gun/torch to shrink the connectors",
      "A few feet of spare primary wire, 16-18 AWG (matches most of this engine's harness — see Wiring Reference)",
      "Self-fusing silicone tape (a solid backup if you have no heat source)",
      "Spare ring/spade terminals + a crimper, for reattaching to studs/grounds",
      "Dielectric grease",
      "Multimeter, to confirm continuity after the repair",
    ],
    caution: "Never puncture wire insulation to \"tap\" a test point (vampire/scotch-lock taps included) — the OEM manual calls this out specifically because the tiny holes let water in, which corrodes the wire from the inside out and causes exactly the intermittent failures covered in Known Issues. Back-probe connectors to test, and only cut wire when you're doing a real splice you're going to seal properly.",
    cases: [
      {
        title: "Splicing a broken or chafed wire",
        steps: [
          "Confirm the exact break location — wiggle-test the harness section while watching continuity on the multimeter, or visually trace for chafe/green corrosion.",
          "Cut back to clean, undamaged copper on both sides of the break — if the wire is green/corroded inside the insulation, keep cutting back until it isn't.",
          "Strip about 3/8\" of insulation from each end.",
          "Slide on a heat-shrink butt connector sized to the wire gauge, crimp one side, then the other. A solid crimp is more important than a perfect one — tug-test it.",
          "Heat the connector evenly until the adhesive glue visibly oozes out both ends — that glue bead is what actually keeps water out, not just the shrunk tubing.",
          "No heat source available? Wrap the splice tightly with self-fusing silicone tape instead — it bonds to itself and seals reasonably well without heat. Plain electrical tape alone is a temporary-only fix; it will not survive spray and vibration.",
          "Confirm continuity through the repair with the multimeter before buttoning the harness back up.",
          "Re-route and secure the repaired section away from moving parts, sharp edges, and exhaust heat — zip-tie it clear rather than leaving it loose.",
        ],
      },
      {
        title: "Repairing a bad ground connection",
        steps: [
          "A high-resistance ground causes symptoms all over the map (see ECM Power & Ground Test) — don't just twist wires together and call it fixed.",
          "If the ground wire itself is damaged, splice it per the steps above — don't downsize the gauge.",
          "If the ground point (a bolt/stud to the block or frame) is the problem, disconnect it, and sand/scrape the mounting surface back to clean bare metal — paint, primer, and surface corrosion all kill a ground connection even with a tight bolt.",
          "Use a proper ring terminal crimped onto the wire, not a wire wrapped around a bolt. Dielectric grease on the terminal before reassembly helps it survive the next season of spray.",
          "Re-torque the bolt snug, then re-check resistance with the multimeter (spec: 1.0 ohm or less) before calling it done.",
        ],
      },
      {
        title: "Reseating or replacing a connector pin",
        steps: [
          "A pin that's backed out or bent looks fine at a glance but won't make contact. Release the pin's locking tab (small flat pick or dedicated terminal release tool) and gently remove it from the connector body.",
          "Inspect the pin — if it's just backed out, straighten if bent and reinsert until it clicks fully home.",
          "If the pin itself is corroded or the crimp has failed, cut it off, strip the wire, and crimp on a spare terminal of the matching type/size if you carry them. This is a \"nice to have\" spare part, not essential — most field fixes are reseating, not replacing.",
          "Clean the connector body's mating surfaces with contact cleaner, apply a small amount of dielectric grease, and reassemble.",
        ],
      },
    ],
  },

  // ------------------------------------------------------------------------
  // Symptom decision trees (manual, Section 4)
  // Each step: id, text, yes {label, action}, no {next or action}
  // action values starting with "repair:" render as a plain-text fix tip.
  // action "dtc" routes to the DTC list. action "end-mfr" is the manual's
  // own "contact engine manufacturer" terminal step.
  // ------------------------------------------------------------------------
  decisionTrees: {
    "no-crank": {
      title: "Engine Does Not Crank",
      subtitle: "Starter doesn't turn the engine over at all",
      source: "manual",
      start: "s1",
      steps: {
        s1: { text: "Check your warning light for a stored trouble code first (tap below for how). Is one stored?", linkMil: true, yes: { action: "dtc" }, no: { next: "s2" } },
        s2: { text: "Do a careful visual check: battery cables, all visible EFI wiring/connectors, fuel lines for obvious damage, kinks, corrosion, or disconnects. Find a problem?", yes: { action: "repair:Fix whatever you found — loose/corroded connector, chafed wire, disconnected plug — then retry start." }, no: { next: "s3" } },
        s3: { text: `Check the battery: look for loose or corroded terminals, and verify battery voltage is ${"12.2–13.5 V"}. Problem found?`, yes: { action: "repair:Clean/tighten terminals, or charge/jump/replace the battery. This is the #1 cause of a true no-crank." }, no: { next: "s4" } },
        s4: { text: "Verify the PTO clutch (prop clutch/gear engagement) is NOT engaged — many of these motors have a safety interlock that blocks the starter if it thinks the prop is engaged. Is it engaged?", yes: { action: "repair:Disengage the clutch/shift to neutral, then retry start." }, no: { next: "s5" } },
        s5: { text: "Verify any safety interrupt switch (kill switch/lanyard, neutral safety switch) isn't active or faulty. Problem found?", yes: { action: "repair:Reset/replace the safety switch or reconnect the kill-switch lanyard." }, no: { next: "s6" } },
        s6: { text: "Verify the ignition/key switch is working properly (continuity through its positions). Problem found?", yes: { action: "repair:Repair or replace the ignition switch." }, no: { next: "s7" } },
        s7: { text: "Verify the starter is operating properly (power at the starter solenoid when cranking, starter spins freely on the bench if pulled). Problem found?", yes: { action: "repair:Repair/replace the starter or starter solenoid/relay." }, no: { next: "s8" } },
        s8: { text: "Repeat the visual check, and carefully check every electrical connection in the starting circuit (battery, solenoid, ignition switch, safety switches). Problem found?", yes: { action: "repair:Fix the connection you found." }, no: { next: "s9" } },
        s9: { text: "Review the ECM Connector wiring reference (J1/J2 pin symptoms) for anything matching a no-crank pattern. Problem found?", yes: { action: "repair:Repair the wiring/connector issue identified." }, no: { action: "end-mfr" } },
      },
    },

    "cranks-no-start": {
      title: "Engine Cranks But Does Not Start",
      subtitle: "Starter spins the engine, but it never fires",
      source: "manual",
      start: "s1",
      steps: {
        s1: { text: "Check your warning light for a stored trouble code first (tap below for how). Is one stored?", linkMil: true, yes: { action: "dtc" }, no: { next: "s2" } },
        s2: { text: "Do a careful visual check. NOTE: listen for the fuel pump — it should prime for about 2 seconds when you turn the key ON. If it only primes for about 1/2 second, that points straight at the safety interrupt circuit. Problem found?", yes: { action: "repair:Fix what you found. If the pump only half-primes, check the kill-switch/lanyard and safety interrupt wiring." }, no: { next: "s3" } },
        s3: { text: "Verify there's actually enough fuel in the tank(s). Insufficient fuel?", yes: { action: "repair:Add fuel. (Yes, check this before anything else — it happens to everyone.)" }, no: { next: "s4" } },
        s4: { text: "Check the fuel shut-off valve, if equipped. Is it closed?", yes: { action: "repair:Open the fuel shut-off valve." }, no: { next: "s5" } },
        s5: { text: "Check fuel tank(s), fuel filter, fuel lines, and fuel pump(s) for dirt, water, or other contamination. Problem found?", linkTest: "fuel-contamination", yes: { action: "repair:Drain/replace contaminated fuel, replace the fuel filter, clean or replace affected lines. Water in the tank is common after sitting or in humid marsh storage." }, no: { next: "s6" } },
        s6: { text: `Run the Fuel Rail Pressure Test. Spec is ${"38–43 psi"}. Problem found?`, linkTest: "fuel-pressure", yes: { action: "repair:See Fuel Pump field notes — weak lift pump, clogged internal filter, bad relay, or a failing high-pressure pump module are the most common causes." }, no: { next: "s7" } },
        s7: { text: "Verify the safety interrupt circuit is NOT active or faulty (kill switch/lanyard fully seated and working). Problem found?", yes: { action: "repair:Reset/reseat/replace the safety switch or lanyard clip." }, no: { next: "s8" } },
        s8: { text: `Check the battery: loose/corroded terminals, voltage ${"12.2–13.5 V"}. Problem found?`, yes: { action: "repair:Clean/tighten terminals, charge or replace the battery." }, no: { next: "s9" } },
        s9: { text: "Run the Spark Check on both cylinders. Problem found?", linkTest: "spark-check", yes: { action: "repair:Replace/repair the faulty ignition coil, plug, or wiring on that cylinder (see wiring reference for coil pin symptoms)." }, no: { next: "s10" } },
        s10: { text: "Run the ECM Power & Ground Test. Problem found?", linkTest: "ecm-power-ground", yes: { action: "repair:Fix the power/ground fault identified — this is a common root cause of a hard-to-diagnose no-start." }, no: { next: "s11" } },
        s11: { text: "Check basic engine mechanicals: compression, leaking head gasket, valve setup (needs the base engine manual and tools — likely not a dockside fix). Problem found?", yes: { action: "repair:This is a mechanical engine repair, not an EFI issue — you're probably not fixing this on the water. Get it to a shop." }, no: { next: "s12" } },
        s12: { text: "Repeat the visual check, and check all electrical connections again. Problem found?", yes: { action: "repair:Fix the connection you found." }, no: { next: "s13" } },
        s13: { text: "Review the ECM Connector wiring reference for a matching pattern. Problem found?", yes: { action: "repair:Repair the wiring/connector issue identified." }, no: { action: "end-mfr" } },
      },
    },

    "hard-start": {
      title: "Engine Exhibits Hard Start Symptoms",
      subtitle: "Cranks fine, but takes a long time to start — or starts, then immediately dies",
      source: "manual",
      start: "s1",
      steps: {
        s1: { text: "Check your warning light for a stored trouble code first (tap below for how). Is one stored?", linkMil: true, yes: { action: "dtc" }, no: { next: "s2" } },
        s2: { text: "Do a careful visual check of wiring, connectors, and fuel lines. Problem found?", yes: { action: "repair:Fix what you found." }, no: { next: "s3" } },
        s3: { text: "Check fuel tank(s), filter, lines, and pumps for dirt, water, or contamination. Problem found?", linkTest: "fuel-contamination", yes: { action: "repair:Drain/replace contaminated fuel, replace filter, clean/replace lines." }, no: { next: "s4" } },
        s4: { text: `Run the Fuel Rail Pressure Test (spec ${"38–43 psi"}). Problem found?`, linkTest: "fuel-pressure", yes: { action: "repair:See Fuel Pump field notes." }, no: { next: "s5" } },
        s5: { text: `Check the battery (terminals, voltage ${"12.2–13.5 V"}). Problem found?`, yes: { action: "repair:Clean/tighten terminals, charge or replace the battery." }, no: { next: "s6" } },
        s6: { text: "Check for an intermittent open or short-to-ground in the MAP sensor circuit (wiggle-test the harness while watching a DVOM on the signal wire). Problem found?", yes: { action: "repair:Repair the MAP sensor wiring/connector." }, no: { next: "s7" } },
        s7: { text: "Check TPS operation and verify the throttle linkage isn't sticking, binding, or worn (which can cause high TPS voltage). Problem found?", yes: { action: "repair:Free up/lubricate the linkage, or repair the TPS/connector." }, no: { next: "s8" } },
        s8: { text: "Check IAC (idle air control) operation, if equipped. Problem found?", yes: { action: "repair:Clean or replace the IAC valve/connector." }, no: { next: "s9" } },
        s9: { text: "Check basic engine mechanicals (compression, head gasket, valves). Problem found?", yes: { action: "repair:Mechanical repair — not a dockside fix, get it to a shop." }, no: { next: "s10" } },
        s10: { text: "Repeat visual check and re-check all electrical connections. Problem found?", yes: { action: "repair:Fix the connection you found." }, no: { next: "s11" } },
        s11: { text: "Review the ECM Connector wiring reference for a matching pattern. Problem found?", yes: { action: "repair:Repair the wiring/connector issue identified." }, no: { action: "end-mfr" } },
      },
    },

    "low-power": {
      title: "Engine Power Output Low",
      subtitle: "Runs, but noticeably down on power",
      source: "manual",
      start: "s1",
      steps: {
        s1: { text: "Check your warning light for a stored trouble code first (tap below for how). Is one stored?", linkMil: true, yes: { action: "dtc" }, no: { next: "s2" } },
        s2: { text: "Do a careful visual check. Problem found?", yes: { action: "repair:Fix what you found." }, no: { next: "s3" } },
        s3: { text: "Check fuel tank(s), filter, lines, and pumps for dirt, water, or contamination. Problem found?", linkTest: "fuel-contamination", yes: { action: "repair:Drain/replace contaminated fuel, replace filter, clean/replace lines." }, no: { next: "s4" } },
        s4: { text: `Run the Fuel Rail Pressure Test (spec ${"38–43 psi"}). Problem found?`, linkTest: "fuel-pressure", yes: { action: "repair:See Fuel Pump field notes — a weak pump often shows up as flat power under load before it ever causes a full stall." }, no: { next: "s5" } },
        s5: { text: "Verify crankcase oil is at the correct level. Low?", yes: { action: "repair:Add crankcase oil to spec — low oil can trigger power-limiting protection." }, no: { next: "s6" } },
        s6: { text: "Verify the air filter element is clean and dry. Dirty?", yes: { action: "repair:Replace/clean the air filter element. Marsh dust and spray load these up fast." }, no: { next: "s7" } },
        s7: { text: "Verify the engine isn't being asked to carry more load than it should — check for a damaged drive belt (if equipped) or a faulty pulley/gearbox bearing binding things up. Problem found?", yes: { action: "repair:Repair the mechanical drag source — see Drivetrain section for gearbox/prop-side causes too." }, no: { next: "s8" } },
        s8: { text: "Check spark plugs: gapped properly, not gas-fouled, not excessively worn. Problem found?", yes: { action: "repair:Regap or replace the spark plugs." }, no: { next: "s9" } },
        s9: { text: "Verify the exhaust isn't restricted (packed mud/debris in the muffler/outlet — surprisingly common on these rigs). Problem found?", yes: { action: "repair:Clear the exhaust restriction." }, no: { next: "s10" } },
        s10: { text: "Check basic engine mechanicals (compression, head gasket, valves). Problem found?", yes: { action: "repair:Mechanical repair — not a dockside fix." }, no: { next: "s11" } },
        s11: { text: "Repeat visual check and re-check all electrical connections. Problem found?", yes: { action: "repair:Fix the connection you found." }, no: { next: "s12" } },
        s12: { text: "Review the ECM Connector wiring reference for a matching pattern. Problem found?", yes: { action: "repair:Repair the wiring/connector issue identified." }, no: { action: "end-mfr" } },
      },
    },

    "hunts-surges": {
      title: "Engine Hunts and Surges",
      subtitle: "RPM wanders up and down on its own, especially at idle/light load",
      source: "manual",
      start: "s1",
      steps: {
        s1: { text: "Check your warning light for a stored trouble code first (tap below for how). Is one stored?", linkMil: true, yes: { action: "dtc" }, no: { next: "s2" } },
        s2: { text: "Do a careful visual check. Problem found?", yes: { action: "repair:Fix what you found." }, no: { next: "s3" } },
        s3: { text: "Check fuel tank(s), filter, lines, and pumps for dirt, water, or contamination. Problem found?", linkTest: "fuel-contamination", yes: { action: "repair:Drain/replace contaminated fuel, replace filter, clean/replace lines." }, no: { next: "s4" } },
        s4: { text: `Run the Fuel Rail Pressure Test (spec ${"38–43 psi"}). Problem found?`, linkTest: "fuel-pressure", yes: { action: "repair:See Fuel Pump field notes." }, no: { next: "s5" } },
        s5: { text: `Check the battery (terminals, voltage ${"12.2–13.5 V"}). Problem found?`, yes: { action: "repair:Clean/tighten terminals, charge or replace the battery." }, no: { next: "s6" } },
        s6: { text: "Verify crankcase oil is at the correct level. Low?", yes: { action: "repair:Add crankcase oil to spec." }, no: { next: "s7" } },
        s7: { text: "Verify air filter element is clean and dry. Dirty?", yes: { action: "repair:Replace/clean the air filter element." }, no: { next: "s8" } },
        s8: { text: "Verify the governor is set up properly (requires base engine manual/tools). Problem found?", yes: { action: "repair:Governor adjustment — follow base Intek OHV manual procedure. Not usually a dockside fix." }, no: { next: "s9" } },
        s9: { text: "Inspect the governor link/spring for damage or improper installation. Problem found?", yes: { action: "repair:Repair/reinstall the governor spring/link correctly." }, no: { next: "s10" } },
        s10: { text: "Disconnect the governor spring and check for binding or uneven resistance through the governor arm's full travel. Problem found?", yes: { action: "repair:Free up/repair the governor arm — binding here directly causes hunting/surging." }, no: { next: "s11" } },
        s11: { text: "Inspect the governor spring and controls for damage or improper installation. Problem found?", yes: { action: "repair:Repair/replace the governor spring or controls." }, no: { next: "s12" } },
        s12: { text: "Repeat visual check and re-check all electrical connections. Problem found?", yes: { action: "repair:Fix the connection you found." }, no: { next: "s13" } },
        s13: { text: "Review the ECM Connector wiring reference for a matching pattern. Problem found?", yes: { action: "repair:Repair the wiring/connector issue identified." }, no: { action: "end-mfr" } },
      },
    },
  },

  // ------------------------------------------------------------------------
  // Field-reported common failures (NOT from the OEM manual — labeled as such)
  // ------------------------------------------------------------------------
  fieldNotes: [
    {
      id: "fuel-pump-family",
      title: "Fuel Pump / Fuel Delivery — the #1 field complaint",
      priority: "high",
      body: [
        "This powerhead uses a two-stage fuel system: a low-pressure mechanical/electric LIFT pump moves fuel from the tank to a HIGH-PRESSURE fuel pump module near the engine, which then feeds the rail at the 38–43 psi spec. A weak link in EITHER stage causes the same symptoms: stalling, dying under load, hard restart when hot, or a slow limp that gets worse the longer you run.",
        "Owners have reported OEM lift pumps that pulse weakly and can't keep up — one documented fix was swapping to an aftermarket 38 GPH / 4-7 psi inline lift pump (OEM spec is roughly 2-3 psi / 30 GPH), which resolved stalling after about 1.5 hrs of running.",
        "The internal filter/strainer sock inside the lift pump or the high-pressure module can 'gloss over' with fine debris and choke fuel flow enough to drop rail pressure under load, even though it flows fine at idle. If your fuel pressure test passes at idle but the boat still dies under load, suspect this before condemning the whole pump.",
        "There are also reports of the high-pressure fuel pump MODULE itself failing — visibly pitted/corroded housings, and pinhole leaks spraying fuel where the module meets the rigid fuel line. ALWAYS visually inspect the module and its fittings for wetness/staining, not just test pressure.",
        "Fuel pump relays are cheap and fail often. If you carry one spare part for this motor, make it the fuel pump relay — swap-testing it takes 10 seconds and rules out a huge chunk of no-start/dies-randomly complaints.",
      ],
      relatedTests: ["fuel-pressure"],
      relatedDtcs: ["P0230", "P0232", "P0174"],
    },
    {
      id: "fuel-water-contamination",
      title: "Water & Air in Fuel — the other #1 field complaint",
      priority: "high",
      body: [
        "Just as common as pump problems, and easy to blame on the engine instead: ethanol gas (the standard \"E10\" at most pumps) absorbs moisture out of the air over time. Once it's absorbed all it can hold, the water separates back out — and because water is denser than gas, it sinks to the bottom of the tank, right where the fuel pickup lives. Humid marsh storage and a boat getting bounced around on the water both make this worse.",
        "This isn't a hypothetical: a documented case of a brand-new 40 EFI motor (same powerhead family) losing power mid-run and dying turned out to be water in the tank — diagnosed in about 10 minutes once someone knew to check for it, on a motor that even had a water separator installed.",
        "Symptoms overlap heavily with a failing fuel pump: gradual power loss while running, stalling, sputtering, hard/no restart. The difference is there's nothing wrong with the pump or engine at all — the fix is draining contaminated fuel, not chasing electrical faults.",
        "Air in the lines is a separate but related issue, most often from running the tank dry. The EFI electric pump usually self-primes if you just cycle the key a few times — a real leak (loose fitting, cracked line) is the only case where it doesn't clear on its own.",
        "Best prevention: keep the tank topped off to reduce condensation room, use ethanol-free fuel where you can get it, and add a marine ethanol fuel treatment at every fill-up — not just before winter storage.",
      ],
      relatedTests: ["fuel-contamination"],
      relatedDtcs: ["P0174"],
    },
    {
      id: "connector-corrosion",
      title: "Connector & Wiring Corrosion",
      priority: "high",
      body: [
        "These motors live in salt/brackish spray, mud, and humidity — connector corrosion is one of the most common causes of intermittent, hard-to-reproduce faults (the kind that vanish by the time you get home and can't set a stored DTC).",
        "Look for green or white powdery deposits inside connector shells, especially at ECM connectors (J1/J2), ground points, and the fuel pump module connector.",
        "A bent or backed-out pin looks fine visually but won't make good contact — check that every pin is fully seated and straight.",
        "Clean with electrical contact cleaner, not water or WD-40. Re-seat, and consider dielectric grease on connectors you re-open, to slow future corrosion.",
        "If you have an intermittent problem with NO stored DTC, the manual explicitly says: don't bother with the DTC tables, the fault has to be actively present. Wiggle-test connectors with a DVOM connected while the engine runs, watching for a voltage glitch when you flex a specific harness section.",
      ],
      relatedTests: ["ecm-power-ground"],
      relatedDtcs: [],
    },
    {
      id: "ckp-sensor",
      title: "Crankshaft Position (CKP) Sensor",
      priority: "medium",
      body: [
        "Reported as a cause of cranking/no-start issues on Vanguard EFI engines in other applications (mowers). Worth checking the CKP connector and sensor air gap if you get a P0336/P0337 or an unexplained crank-but-no-start with good fuel pressure and spark.",
      ],
      relatedTests: [],
      relatedDtcs: ["P0336", "P0337"],
    },
  ],

  // ------------------------------------------------------------------------
  // Drivetrain / Gear-Down / Prop — general knowledge, NOT from the EFI
  // manual (Briggs manual only covers the engine). Lighter content by design;
  // meant to be filled in with your own field experience via My Notes.
  // ------------------------------------------------------------------------
  drivetrain: {
    intro: "The Briggs EFI manual only covers the engine (powerhead). The gear-down drive, clutch, and prop are Mud Buddy's own mechanical design. The notes below are general surface-drive/gear-down mud motor knowledge, not an OEM Mud Buddy procedure.",
    topics: [
      {
        title: "Engine runs fine, but little or no thrust / prop doesn't spin",
        checks: [
          "Confirm the clutch is actually engaging — listen/feel for the clutch dog or centrifugal clutch taking up.",
          "Check for a sheared prop hub/shear pin if your prop uses one — this is a deliberate weak point to protect the gearbox, and it WILL happen eventually if you hit something solid.",
          "Check drive shaft coupling/set screws haven't backed out from vibration.",
        ],
      },
      {
        title: "Loss of thrust / boat won't get 'on plane' like it used to",
        checks: [
          "Prop condition — check for bent blades, cupped/worn edges, or heavy debris (grass, rope, wire) wrapped at the hub.",
          "Cavitation — running the prop too shallow or with excess ventilation plate exposure. Check drive angle/jack plate height.",
          "Confirm you're on the right prop pitch for load — an overpitched prop on a heavy load bogs the engine down, and that shows up looking exactly like a low-power engine problem instead of the prop mismatch it actually is.",
          "What pitch actually does: it's the distance the prop would travel forward in one full rotation if it were driving through a solid, like a screw thread — measured in inches. Mud props typically run 9 to 12 pitch. Lower pitch = less distance per rotation = more torque and pulling power, better for heavy loads and thick grass/mud, but a lower top speed. Higher pitch = more distance per rotation = higher potential top speed, but it needs more power/RPM to turn under load. If the engine seems to lack power only when the boat's loaded down (but revs fine light or empty), suspect the prop pitch before assuming it's an engine problem.",
        ],
      },
      {
        title: "Grinding, whining, or knocking noise from the gearbox",
        checks: [
          "Stop running it. A grinding/whining gearbox noise is a bearing or gear-tooth wear symptom, and continuing to run it risks turning a repair into a rebuild.",
          "Check gear case oil level and condition (milky oil = water intrusion — a common issue on any submerged gear case, from seal wear over time).",
          "Check for excess play/slop in the drive shaft when the engine is off.",
        ],
      },
      {
        title: "Overheating gear case",
        checks: [
          "Check gear oil level and condition first — low or contaminated oil is the most common cause.",
          "Confirm you're not running at sustained high RPM in a no-load condition (prop out of the water) — this can overspeed and overheat a gear-down unit fast.",
        ],
      },
      {
        title: "Excess vibration",
        checks: [
          "Prop damage/imbalance is the most common cause — inspect blades closely, even small dings can cause noticeable vibration at speed.",
          "Check drive shaft straightness and motor mount bolts for looseness — mounts backing out from constant vibration is common on hard-running rigs.",
        ],
      },
    ],
  },

  // ------------------------------------------------------------------------
  // Multi-motor equivalence, for context
  // ------------------------------------------------------------------------
  contextNote: "Works for Gator Tail 40 EFI motors too: this is the exact same Briggs & Stratton Vanguard 40 EFI 'Big Block' powerhead used in Gator Tail's 40 EFI long-tail mud motors, not just Mud Buddy's. All the engine content (fuel, ignition, sensors, DTCs, ECM wiring) applies directly regardless of brand. Only the drivetrain/housing differs — gear-down vs. direct drive and drive length don't change any of the engine-side troubleshooting either.",

  // ------------------------------------------------------------------------
  // Legal disclaimer — shown prominently on the home screen.
  // ------------------------------------------------------------------------
  disclaimer: "Use this app at your own risk. This is unofficial, community-assembled reference material built from public manuals and field reports — not a substitute for a qualified mechanic. We are not liable for any damage, injury, or loss resulting from following this guidance.",
};
