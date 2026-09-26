# 🛡️ FedShield: Federated Banking Analytics & Multi-Bank AML Fraud Detection Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Federated Learning](https://img.shields.io/badge/FL-FedAvg%20%7C%20DP--SGD-blue.svg)](#federated-learning-engine)
[![Apache Kafka](https://img.shields.io/badge/Streaming-Apache%20Kafka%203.7-black?logo=apachekafka)](https://kafka.apache.org/)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014%20(App%20Router)-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20Socket.io-green?logo=nodedotjs)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/AI%20Engine-PyTorch%20%7C%20NumPy-red?logo=pytorch)](https://pytorch.org/)

> **An Institutional-Grade, Privacy-Preserving Collaborative Anti-Money Laundering (AML) & Fraud Intelligence Platform built on Federated Machine Learning, Differential Privacy (DP-SGD), and Real-Time Distributed Event Streaming with Apache Kafka.**

---

## 👥 Team: Metamorphosis

Developed with ❤️ by **Team Metamorphosis**:
- **Om Kadam**
- **Kunal Chaudhari**
- **Sanskar Gharal**
- **Jason Immanuel**

---

## 📋 Table of Contents
- [Executive Overview](#-executive-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Federated Learning & Privacy Mathematics](#-federated-learning--privacy-mathematics)
- [Participating Bank Nodes (IBM AML Dataset)](#-participating-bank-nodes-ibm-aml-dataset)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites & Setup Guide](#-prerequisites--setup-guide)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Docker Stack (Kafka + Zookeeper + Kafka UI)](#2-docker-stack-kafka--zookeeper--kafka-ui)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Frontend Setup](#4-frontend-setup)
  - [5. Python Federated Learning Cluster (Optional ML Training Demo)](#5-python-federated-learning-cluster)
- [Kafka Stream & Inspection](#-kafka-stream--inspection)
- [Regulatory Compliance](#-regulatory-compliance)
- [License](#-license)

---

## 🏛️ Executive Overview

Modern financial institutions face a critical dilemma: **Money laundering syndicates exploit multi-bank boundaries** by structuring and smurfing transactions across multiple disconnected banking corridors. However, **banking confidentiality laws, GDPR Art. 25, and the DPDP Act 2023 strictly prohibit sharing raw customer transaction logs between banks.**

**FedShield** resolves this dilemma through **Federated Learning with Differential Privacy (DP-SGD)**:
1. **Zero Raw Data Exchange**: Raw transaction data never leaves on-premise bank silos.
2. **Collaborative Model Intelligence**: Banks locally train deep neural networks and transmit only mathematical gradient weights ($W_k$).
3. **Federated Coordinator**: Aggregates gradients using weighted **FedAvg** to build a global AML defense model ($W_{\text{global}}$).
4. **Real-Time Stream Processing**: Uses **Apache Kafka** to ingest, evaluate, and broadcast transactions and SAR alerts with sub-second latency.

---

## ✨ Key Features

- **🌐 5-Bank Federated Mesh Topology**: Seamlessly represents 5 independent institutional banks (Oasis Thrift, Laramie, East, Arbor, Japan Bank #0) with isolated local datasets.
- **🔒 Differential Privacy ($\varepsilon = 1.25, \delta = 10^{-5}$)**: Strict Gaussian noise injection and gradient clipping preventing model inversion attacks.
- **⚡ Distributed Event Streaming with Apache Kafka**: Real-time distributed pub/sub pipeline streaming transactions, ML metrics, and fraud alerts across isolated topics.
- **🧠 Multi-Layer Explainable Decision Engine**: Combines Federated AI inference, behavioral profiling, graph topological cycle analysis, and rule-based checks.
- **📊 Interactive Fund Flow Graph**: Real-time canvas visualizing multi-hop laundering pathways, cross-bank velocity hops, and cyclic transactions.
- **👤 User-Isolated Analysis Sessions**: Multi-tenant task execution workspace (`/tasks`) allowing compliance analysts to create, run, and review tasks in isolated sessions.
- **📥 On-Premise Dataset Ingestion**: 3-step CSV upload wizard (`/import`) that validates column schemas and partitions records into on-premise bank nodes.
- **📧 Automated Executive SAR Email Reports**: Generates cryptographic audit summaries and sends compliance PDF/HTML digests via Nodemailer with Gmail SMTP.
- **🎛️ Kafka UI Management Console**: Web-based broker and topic telemetry running out-of-the-box at `http://localhost:8080`.

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             FEDSHIELD ARCHITECTURE                               │
└──────────────────────────────────────────────────────────────────────────────────┘

   [ Bank 1: Oasis Thrift ]     [ Bank 2: Laramie ]     [ Bank 3: Bank of the East ]
      (449k Local Txs)            (81k Local Txs)             (79k Local Txs)
             │                           │                           │
      Local DP-SGD Train          Local DP-SGD Train          Local DP-SGD Train
             │                           │                           │
             └───────────────────┬───────┴───────────────────────────┘
                                 │
                   (Model Weights / Gradients Only)
                                 ▼
               ┌───────────────────────────────────┐
               │    FEDERATED COORDINATOR (Py)     │
               │   • FedAvg Aggregation (5 Nodes)  │
               │   • Global AML MLP (models/.pth)  │
               └─────────────────┬─────────────────┘
                                 │
                    (Broadcasts Global Model)
                                 ▼
               ┌───────────────────────────────────┐
               │       APACHE KAFKA BROKER         │
               │  Topics:                          │
               │   ├── 'transactions'              │
               │   ├── 'fraud-alerts'              │
               │   └── 'MODEL_METRICS'             │
               └─────────────────┬─────────────────┘
                                 │
             ┌───────────────────┴───────────────────┐
             ▼                                       ▼
 ┌───────────────────────┐               ┌───────────────────────┐
 │   NODE.JS BACKEND     │               │   KAFKA UI (Port 8080)│
 │ • Kafka Consumers     │               │ • Topic Inspector     │
 │ • Decision Engine     │               │ • Message Streaming   │
 │ • Socket.io Broadcast │               │ • Broker Health       │
 └───────────┬───────────┘               └───────────────────────┘
             │ (WebSockets / REST)
             ▼
 ┌───────────────────────────────────────────────────────────────┐
 │                  NEXT.JS 14 FINTECH DASHBOARD                 │
 │  ├── 5-Bank Comparative Analytics & FedAvg Provenance        │
 │  ├── Interactive Multi-Hop Fund Flow Graph Canvas            │
 │  ├── Real-Time Transaction Stream & Laundering Filters       │
 │  ├── User-Isolated Analysis Task Manager (/tasks)            │
 │  ├── On-Premise CSV Dataset Importer (/import)               │
 │  └── Automated Regulatory Email Report Generator             │
 └───────────────────────────────────────────────────────────────┘
```

---

## 📐 Federated Learning & Privacy Mathematics

### 1. Federated Averaging (FedAvg)
The global model parameter vector $W_{\text{global}}$ at communication round $t+1$ is aggregated across $K = 5$ participating banking nodes:

$$W_{\text{global}}^{(t+1)} = \sum_{k=1}^{K} \frac{n_k}{N} W_k^{(t+1)}$$

Where $n_k$ is the local transaction volume of Bank $k$, and $N = \sum n_k = 725,964$:

$$W_{\text{global}} = 0.620\,W_{70} + 0.112\,W_{10} + 0.110\,W_{12} + 0.086\,W_1 + 0.072\,W_{15}$$

### 2. Differential Privacy (DP-SGD)
To guarantee that individual transaction identities cannot be reconstructed via model extraction attacks, local bank gradients are bounded and perturbed:

$$\bar{g}_k = \frac{g_k}{\max\left(1, \frac{\|g_k\|_2}{C}\right)}$$

$$\tilde{g}_k = \bar{g}_k + \mathcal{N}\left(0, \sigma^2 C^2 \mathbf{I}\right)$$

- **Clipping Threshold ($C$)**: $1.0$
- **Noise Multiplier ($\sigma$)**: $0.85$
- **Privacy Budget**: $\varepsilon = 1.25, \delta = 10^{-5}$ (Meets DPDP Act 2023 & GDPR standards).

---

## 🏦 Participating Bank Nodes (IBM AML Dataset)

The platform is pre-loaded with **725,964 real banking records** and **856 verified laundering operations** partitioned across 5 institutional nodes derived from the Kaggle IBM AML benchmark:

| Node ID | Bank Code | Institution Name | Local Dataset Path | Total Records | Laundering Ops | FedAvg Weight |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Node 1** | `BANK-70` | **Oasis Thrift Bank** | `model/federated_nodes/bank_1_node.csv` | **449,859** | **633** | **62.0%** |
| **Node 2** | `BANK-10` | **National Bank of Laramie** | `model/federated_nodes/bank_2_node.csv` | **81,629** | **51** | **11.2%** |
| **Node 3** | `BANK-12` | **National Bank of the East** | `model/federated_nodes/bank_3_node.csv` | **79,754** | **76** | **11.0%** |
| **Node 4** | `BANK-1` | **Arbor Savings Bank** | `model/federated_nodes/bank_4_node.csv` | **62,211** | **50** | **8.6%** |
| **Node 5** | `BANK-15` | **Japan Bank #0** | `model/federated_nodes/bank_5_node.csv` | **52,511** | **46** | **7.2%** |
| **Total** | — | **5-Bank Federated Coalition** | — | **725,964** | **856** | **100.0%** |

---

## 💻 Tech Stack

| Domain | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend UI** | Next.js 14 (App Router), React 18, TypeScript | Institutional Banking Dashboard |
| **Styling & Charts** | Tailwind CSS, Lucide React, Recharts, React Flow | High-density financial UI & Graph Visualizer |
| **Backend API** | Node.js (ESM), Express.js | Microservice API & Event Orchestrator |
| **Live Comm** | Socket.io (v4) | Real-time bidirectional telemetry streaming |
| **Event Streaming** | Apache Kafka (v3.7), Zookeeper, KafkaJS | Distributed pub/sub streaming pipeline |
| **Stream Telemetry** | Provectus Kafka-UI | Web GUI for viewing Kafka topics and messages |
| **Database** | MongoDB / In-Memory Adaptive Store | Cache for transactions, decisions, and tasks |
| **AI / Machine Learning** | Python 3.10+, PyTorch, NumPy, Pandas | Federated MLP with FedAvg and DP-SGD |
| **Email Services** | Nodemailer, Gmail SMTP | Cryptographic SAR report dispatcher |
| **Containerization** | Docker, Docker Compose | Multi-container orchestration |

---

## 📁 Project Directory Structure

```text
enigma/
├── Backend/
│   ├── src/
│   │   ├── controllers/         # REST API route controllers
│   │   ├── kafka/               # Kafka producers, consumers, and stream handlers
│   │   │   ├── client.js        # KafkaJS client instance
│   │   │   ├── producer.js      # Message publishers for txs & alerts
│   │   │   └── consumer.js      # Consumers & decision evaluation pipeline
│   │   ├── models/              # Data schemas (Transaction, Alert, Task, etc.)
│   │   ├── routes/              # Express API endpoints
│   │   ├── services/            # Domain logic (Dataset, Decision Engine, Email)
│   │   │   ├── datasetService.js        # IBM AML dataset loader (5 nodes)
│   │   │   ├── decisionEngine.js        # Multi-tiered risk decision engine
│   │   │   ├── fraudDetectionService.js # Explainable scoring algorithm
│   │   │   └── emailService.js          # Nodemailer Gmail SAR dispatcher
│   │   ├── socket/              # Socket.io server configuration
│   │   └── server.js            # Node backend entry point
│   ├── .env                     # Server environment variables
│   └── package.json
│
├── Frontend/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx                 # Main Federated Command Center
│   │   │   ├── tasks/                   # User-Isolated Task Execution Manager
│   │   │   ├── transactions/            # 5-Bank Transaction Explorer & Filter
│   │   │   ├── fund-flow/               # Multi-Hop Fund Flow Network Canvas
│   │   │   ├── alerts/                  # AML SAR Alerts & Investigation Cases
│   │   │   ├── banks/                   # 5-Bank Node Deep-Dive Inspector
│   │   │   ├── import/                  # 3-Step CSV Ingestion & Partitioning
│   │   │   ├── email-reports/           # SAR Executive Report Dispatcher
│   │   │   ├── live-events/             # Real-Time Telemetry Stream
│   │   │   └── settings/                # DPDP Act Privacy Budget Controls
│   │   └── layout.tsx
│   ├── components/dashboard/    # Modular UI widgets, charts, and tables
│   ├── contexts/TaskContext.tsx # User session and task state management
│   ├── lib/banks-config.ts      # Bank metadata, weights, and FedAvg constants
│   └── package.json
│
├── model/
│   └── federated_nodes/         # 5 Real Partitioned IBM Bank Node Datasets
│       ├── bank_1_node.csv      # Bank-70 (449k txs)
│       ├── bank_2_node.csv      # Bank-10 (81k txs)
│       ├── bank_3_node.csv      # Bank-12 (79k txs)
│       ├── bank_4_node.csv      # Bank-1 (62k txs)
│       └── bank_5_node.csv      # Bank-15 (52k txs)
│
├── client.py                    # PyTorch Federated Client Node
├── server.py                    # PyTorch Federated Aggregator (FedAvg)
├── model.py                     # Deep Neural Network (MLP) Architecture
├── dataset.py                   # PyTorch Dataset Loader
├── docker-compose.yml           # Kafka, Zookeeper, and Kafka UI containers
└── README.md
```

---

## 🚀 Prerequisites & Setup Guide

### System Requirements
- **Node.js**: `v18.x` or `v20.x`
- **Python**: `3.9+` (with PyTorch and NumPy)
- **Docker & Docker Compose**: Installed and running
- **Git**: Installed

---

### 1. Clone Repository

```bash
git clone https://github.com/sanskar0911/Engima_federate_learning.git
cd Engima_federate_learning
```

---

### 2. Docker Stack (Kafka + Zookeeper + Kafka UI)

Launch the complete event streaming cluster in one command:

```bash
docker-compose up -d
```

Verify containers are running:
```bash
docker ps
```
*You will see `fedshield-zookeeper` (2181), `fedshield-kafka` (9092, 29092), and `fedshield-kafka-ui` (8080) running.*

---

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment (`Backend/.env`):
   ```env
   PORT=5000
   KAFKA_BROKERS=localhost:9092
   EMAIL_USER=fedshiled@gmail.com
   EMAIL_PASS=dmmxxamzxsjmrlzf
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```
   *The backend will automatically start streaming transactions from the 5 bank nodes into Kafka and WebSockets.*

---

### 4. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open **`http://localhost:3000`** in your browser to access the FedShield Dashboard.

---

### 5. Python Federated Learning Cluster

To simulate actual PyTorch Federated Training across all 5 bank nodes:

1. **Terminal 1 - Start the Aggregator Server**:
   ```bash
   python server.py
   ```
   *Listens on port `8080` (or configured FL port) for client gradient submissions.*

2. **Terminals 2 through 6 - Launch the 5 Local Bank Clients**:
   ```bash
   python client.py --bank 1
   python client.py --bank 2
   python client.py --bank 3
   python client.py --bank 4
   python client.py --bank 5
   ```
   *Each client trains on its local node CSV, applies DP-SGD noise, and uploads weights to the server for FedAvg aggregation.*

---

## 📡 Kafka Stream & Inspection

FedShield comes configured with **Provectus Kafka UI** for visual real-time inspection.

1. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```
2. Available Topics:
   - **`transactions`**: High-throughput live stream of transactions across all 5 banks.
   - **`fraud-alerts`**: Critical AML / Laundering alerts ($\text{Risk Score} \ge 75$) flagged by the Federated Decision Engine.
   - **`MODEL_METRICS`**: Real-time communication round metrics, loss gradients, and accuracy scores from the Python FL coordinator.

---

## ⚖️ Regulatory Compliance

| Standard | Implementation in FedShield |
| :--- | :--- |
| **DPDP Act 2023 (India)** | Raw financial customer data remains siloed on-premise within each bank's node boundary. |
| **GDPR Art. 25 (Privacy by Design)** | Mathematical Differential Privacy ($\varepsilon = 1.25$) guarantees zero reconstruction of individual identity records. |
| **FINCEN / FATF AML Guidelines** | Automated Suspicious Activity Report (SAR) generation with graph explainability and rapid email dispatch. |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with pride by <b>Team Metamorphosis</b> (Om Kadam, Kunal Chaudhari, Sanskar Gharal, Jason Immanuel)</sub>
</div>
