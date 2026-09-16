<div align="center">
  
  <img src="https://media.giphy.com/media/Y2ZUWLrTy63j9T6qrK/giphy.gif" width="120" />

  <h1>🚀 TheFinanceWorld | Tradexa-GPT 🚀</h1>

  <a href="https://tradexa-gpt-frontend.vercel.app">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=24&pause=1000&color=10B981&center=true&vCenter=true&width=600&lines=Trading+is+Math%2C+Not+Magic.;Stop+letting+emotions+liquidate+you.;The+Intelligence+Layer+for+Traders." alt="Typing SVG" />
  </a>

  <br/><br/>

  <p>
    <a href="https://tradexa-gpt-frontend.vercel.app"><img src="https://img.shields.io/badge/Live_App-Online-10B981?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
    <img src="https://img.shields.io/badge/Vibe-Immaculate-6366F1?style=for-the-badge" alt="Vibe" />
    <img src="https://img.shields.io/badge/Tech_Stack-Java_21_|_React_18-0F172A?style=for-the-badge" alt="Tech Stack" />
  </p>

</div>

---

<div align="center">
  <img src="https://media.giphy.com/media/JtBZm3Getg3dqxEXvX/giphy.gif" width="300" />
  <p><i>When you enter a trade without calculating your risk... 💀</i></p>
</div>

<br/>

## 🧊 The Product

Bro, we built the ultimate quantitative co-pilot. **Tradexa-GPT** isn't just a basic CRUD app; it's a full-stack **Trading Intelligence Platform** designed to fix your broken trading psychology using raw mathematics.

*   **Risk Calculator Engine:** Instantly calculates position sizes. Enter your risk %, stop loss, and let the backend do the math. 
*   **Journal Analytics:** Direct CSV uploads for **Dhan** and Generic formats. Our backend literally FIFO-matches your raw executions.
*   **AI Co-Pilot:** Talk to the market. Let the LLM analyze your stats and tell you why you're losing money on Fridays.

---

## ⚡ The Architecture (Real-Time Data Flow)

*Follow the data from the client, through the cloud, to the database, and back.*

`mermaid
graph LR
    %% GEN-Z HACKER STYLING
    classDef frontend fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#38bdf8,stroke-dasharray: 5 5;
    classDef backend fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#818cf8;
    classDef db fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#34d399;
    classDef ai fill:#4c1d95,stroke:#c084fc,stroke-width:2px,color:#c084fc;
    classDef dataFlow color:#ef4444, font-weight:bold;

    Client(["💻 React / Vite<br/>(Client Browser)"]):::frontend
    
    subgraph Cloud [AWS / Vercel Edge]
        Gateway{"🛡️ Spring Security<br/>(JWT Filter)"}:::backend
        API["⚡ Spring Boot REST<br/>(Java 21)"]:::backend
        Parser["⚙️ FIFO Matcher<br/>(CSV Engine)"]:::backend
    end
    
    DB[("💽 MySQL<br/>(Persistent Data)")]:::db
    LLM{{"🧠 Tradexa-GPT<br/>(AI Model)"}}:::ai

    %% THE ACTUAL FLOW
    Client -->|1. POST /api/upload<br/>(Raw CSV Data)| Gateway
    Gateway -->|2. Validates JWT Token| API
    API -->|3. Streams File Data| Parser
    Parser -.->|4. Pairs BUY & SELL| Parser
    Parser -->|5. Hibernate ORM Save| DB
    
    Client -->|6. Ask Chatbot| LLM
    LLM -->|7. Streams Financial Advice| Client
    
    DB -->|8. Fetch Analytics Dashboard| API
    API -->|9. JSON Response (200 OK)| Client
`

---

## 🏎️ Features That Actually Matter

### 1. The Dhan FIFO Engine
Unlike basic platforms that need formatted trade data, we take raw **Dhan execution logs**. Our custom Java algorithm (DhanCsvTradeParser.java) queues up every individual BUY execution, waits for the SELL, matches them using First-In-First-Out, calculates your entry/exit averages, and saves the final Trade to the database.

### 2. JWT Stateless Auth
No sessions. Pure speed. Your identity is cryptographically signed and stored in local storage, passed in the Authorization: Bearer header on every request.

### 3. Glassmorphic UI
We ditched the boring corporate dashboards. Built with **Tailwind CSS v4** and **Framer Motion**, the frontend uses blur effects, glowing 3D orbs, animated candlesticks, and a dark mode that looks like a high-end quant terminal.

<div align="center">
  <img src="https://media.giphy.com/media/Lp9011J5lHqVy5U4bC/giphy.gif" width="300" />
  <p><i>Live look at the backend processing your 1000-row CSV 🚀</i></p>
</div>

---

## 🛠️ Dev Setup (Run it on your machine)

You want to run this beast locally? Easy.

### Start the Java Backend
`ash
git clone https://github.com/Rohit-Joshi67/tradexa-gpt-backend.git
cd tradexa-gpt-backend
# Ensure MySQL is running on port 3306 (root/root)
mvn clean install
mvn spring-boot:run
`
*(Backend fires up on localhost:8080)*

### Start the React Frontend
`ash
cd tradexa-gpt-frontend
npm install
npm run dev
`
*(Frontend spins up on localhost:5173)*

---

<div align="center">
  <p><b>Built by 10x Developers for 10x Traders.</b></p>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=10B981&height=100&section=footer" width="100%" />
</div>
