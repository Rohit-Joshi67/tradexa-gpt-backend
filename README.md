<div align="center">
  <br />
  <img src="https://raw.githubusercontent.com/Rohit-Joshi67/tradexa-gpt-backend/main/tradexa-gpt-frontend/public/vite.svg" alt="Tradexa Logo" width="80" />
  <br />

  # ✦ TheFinanceWorld | Tradexa-GPT ✦
  
  <p align="center">
    <b>The Intelligence Layer for Disciplined Traders.</b>
  </p>
  
  <p align="center">
    Trading is Math, Not Magic. Tradexa equips retail traders with institutional-grade risk management tools, real-time exposure tracking, and AI-driven journal analysis.
  </p>

  <p align="center">
    <a href="https://tradexa-gpt-frontend.vercel.app"><img src="https://img.shields.io/badge/Live_Preview-Emerald?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
    <a href="#features"><img src="https://img.shields.io/badge/Features-Indigo?style=for-the-badge" alt="Features" /></a>
    <a href="#architecture"><img src="https://img.shields.io/badge/Architecture-Purple?style=for-the-badge" alt="Architecture" /></a>
  </p>
</div>

---

<br />

## ❖ The Philosophy

> *"The first rule of trading isn't finding the opportunity. It's surviving long enough to find the next one."*

Tradexa is built around a singular philosophy: **Discipline Compounds**. We remove the emotion from trading by enforcing strict mathematical rules. 

<br />

## ❖ Core Features

<table align="center" width="100%">
  <tr>
    <td width="33%">
      <h3>🛡️ Risk Calculator</h3>
      Calculate exact position sizing, exposure, and stop-loss distances in seconds before entering a trade.
    </td>
    <td width="33%">
      <h3>🧠 Tradexa-GPT</h3>
      A specialized financial AI model that analyzes your risk and finds mathematical leaks in your strategy.
    </td>
    <td width="33%">
      <h3>📊 Journal Analytics</h3>
      Upload CSV execution logs directly from brokers (like Dhan) and let Tradexa automatically pair your buys and sells via FIFO matching.
    </td>
  </tr>
</table>

<br />

## ❖ Architecture Flow

The system is built on a high-performance **Java 21 Spring Boot Backend** and a beautiful **React (Vite) + Tailwind CSS Frontend**. 

`mermaid
graph TD
    %% Styling
    classDef client fill:#10b981,stroke:#064e3b,stroke-width:2px,color:#fff;
    classDef api fill:#6366f1,stroke:#312e81,stroke-width:2px,color:#fff;
    classDef database fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef ai fill:#8b5cf6,stroke:#4c1d95,stroke-width:2px,color:#fff;

    Client[Frontend UI Client]:::client --> |JWT Authenticated Requests| Gateway[Spring Boot API]:::api
    
    subgraph Spring Boot Backend Environment
        Gateway --> |Multipart Upload| Parser[CSV Trade Parser Engine]
        Gateway --> |REST Calls| AIController[Tradexa-GPT Controller]
        Parser --> |FIFO Execution Matching| TradeLogic[Trade PNL Calculator]
        TradeLogic --> DB[(MySQL Relational Database)]:::database
    end

    AIController --> |LLM Prompts| LLM[Generative AI Provider]:::ai
    DB --> |Analytics Aggregation| Gateway
    Gateway --> |JSON Response| Client
`

<br />

## ❖ Technical Stack

### **Frontend (TheFinanceWorld UI)**
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS v4, Framer Motion
- **Icons:** Lucide React
- **Deployment:** Vercel

### **Backend (Tradexa Core)**
- **Framework:** Java 21 / Spring Boot 3
- **Security:** Spring Security & JWT Token Authentication
- **Data Persistence:** Spring Data JPA / Hibernate
- **Database:** MySQL
- **Build Tool:** Maven

<br />

## ❖ Broker Integrations

Tradexa features a custom-built Java parsing engine that processes raw execution logs.
- **Dhan (Active):** Custom FIFO algorithm correctly pairs individual BUY and SELL execution rows into grouped Trade entities with Entry, Exit, and Net P&L.
- **Generic CSV:** Fallback parser for standard grouped trade rows.

<br />

## ❖ Running Locally

### 1. Backend Setup
\\\ash
cd tradexa-gpt-backend
# Ensure MySQL is running on localhost:3306 with user 'root', password 'root'
mvn clean install
mvn spring-boot:run
\\\

### 2. Frontend Setup
\\\ash
cd tradexa-gpt-frontend
npm install
npm run dev
\\\

<br />

<div align="center">
  <p>Built for the disciplined generation of traders.</p>
</div>
