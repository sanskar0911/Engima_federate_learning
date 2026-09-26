# Federated Banking Analytics & AI Decision Support System

## Overview

The **Federated Banking Analytics & AI Decision Support System** is a privacy-aware multi-bank analytics platform designed to analyze banking transactions, detect suspicious activities, generate AI-powered recommendations, visualize fund flows, and perform federated machine learning across multiple participating banks.

The system simulates **five independent banks**. Each bank processes its data locally and generates model updates. Instead of sharing raw banking data with a central system, the model updates are sent to a **Federated Coordinator**, which aggregates them to create a global model.

### Core Workflow

```text
Bank A ── Local ML ──┐
Bank B ── Local ML ──┤
Bank C ── Local ML ──┤
Bank D ── Local ML ──┤──> Federated Coordinator
Bank E ── Local ML ──┘             │
                                   ▼
                             Global Model
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
               Fraud/Risk     Recommendations   Analytics
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
                              Dashboard
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
                Transactions    Fund Flow       Reports
