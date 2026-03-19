## Molty.pet

Meet Molty, a 3D-printed OpenClaw robot that lives on your desk and cares way too much about your crypto.

Molty isn’t just another screen with charts. It’s a digital pet with claws, attitude, and opinions about your portfolio. Powered by a Raspberry Pi and an emotional voice AI, Molty reacts to what’s happening in real time.

Your bet is winning? It gets hyped.

Your trade nukes itself? Molty looks genuinely heartbroken.

You win big? It celebrates like you just changed its life.

The animated face shifts expressions, the voice adapts its tone, and the personality evolves with context. It whispers bad news, shouts in triumph, and cracks lobster puns when things get painfully awkward. Somehow, it actually feels like it care*.

Under the hood, Molty is quietly doing real DeFi work. It pulls live crypto prices, lets you create and settle prediction bets, and executes cross-chain swaps , all through voice. No dashboards. No tabs. No “connect wallet” PTSD. Just talk to it.

Say what you want to do. Molty handles the rest.

We built Molty because DeFi has a massive UX problem. Most people don’t want to juggle five dApps just to check prices or place a bet. They don’t want tutorials. They don’t want friction. They just want to ask.

Molty is our answer:

A physical robot that makes DeFi feel alive, emotional, and stupidly easy.

Think Alexa  but with claws and unlike Alexa, Molty can actually place bets and swap tokens and it also has claws. 🦞🔥


### How is is made

### The Robot (Hardware Brain & Body)

At the core of Molty is a **Raspberry Pi Pi Zero W**, acting as the robot’s brain. A **3.5-inch TFT LCD** renders Molty’s animated face, updating expressions instantly as market events unfold.

Movement and personality come from motors:

- A **DRV8233 motor driver** controls two DC motors for wheeled motion
- Two **SG90 servo motors** animate the claws, letting Molty physically react , cheering, slumping, or losing its mind

Voice input is handled by an **INMP441 I2S MEMS microphone**, wired directly to the Pi’s PCM pins for low-latency audio capture.

Everything lives inside a fully **3D-printed chassis**, with custom STL parts for the claws, wheels, and Pi mount. The result is a desk-friendly robot that doesn’t just *show* emotions,  it moves with them.

### The Robot Screen (Face + Voice Loop)

Molty’s screen runs an **Electron + React** app in kiosk mode.

It’s split into two parts:

**Main process**

- Streams your voice to **AssemblyAI** for transcription
- Sends the text to the OpenClaw agent
- Converts the agent’s reply into expressive speech using **Hume AI**

Hume returns audio in small chunks, and Molty plays them as they arrive — so it starts talking almost instantly instead of waiting for the full response.

**Renderer (screen)**

- Draws Molty’s animated face using CSS
- Plays the incoming audio
- Reacts instantly to interruptions: if you speak mid-sentence, the audio stops, the AI is cut off, and Molty listens again

This makes conversations feel fluid, not robotic.

### The AI Agent (OpenClaw)

The OpenClaw agent runs on a server and is built around small, focused “skills.” Each skill does one thing — no bloated logic, no guessing.

- Live price checks via **Stork**
- Prediction market creation and resolution through **Yellow Network**
- Cross-chain swaps and bridging using **LI.FI**
- Treasury management (USDC / USYC yield) via **Arc**
- Wallet balance checks across chains
- Market-aware emotional reactions (bullish, nervous, devastated, euphoric)

Based on what you say, the agent selects the right skill, executes it, and responds with:

1. A short spoken reply
2. A **face tag** (e.g. *celebrating*, *panicking*, *dying inside*)

Molty’s screen and voice immediately reflect that mood.

### The Backend (Where DeFi Actually Happens)

Molty’s backend is a simple **Express server** that handles all interaction with Yellow.

The flow looks like this:

1. **Custody on-chain**
    
    The user deposits USDC into Yellow’s custody contract (the backend can assist with approve + deposit).
    
2. **Markets off-chain**
    
    When Molty creates a bet, the backend opens a Yellow app session and submits the prediction state — market creation and betting all happen off-chain for speed.
    
3. **Resolution & settlement**
    
    When the outcome is decided, the backend fetches live prices from Stork, determines WIN or LOSS, closes the session, and Yellow settles everything back on-chain.
    

**In short:**

On-chain custody → off-chain betting → oracle-based resolution → on-chain settlement.

The agent calls this backend whenever it needs to create or resolve a bet — no user dashboards, no manual steps.

Molty is what happens when robotics, emotional AI, and real DeFi infrastructure stop living in separate worlds and start talking to each other.