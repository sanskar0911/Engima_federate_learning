"""
Flask Backend API for FraudShield AI Detection System

This is an example Flask backend that can be connected to the Next.js frontend.
Run with: uv run flask_api.py

The frontend settings page allows configuring the API URL to connect to this backend.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Mock data storage (in production, use a real database)
accounts = {
    "ACC001": {"id": "ACC001", "name": "Acme Corporation", "type": "business", "balance": 250000, "riskScore": 45, "country": "US", "isSuspicious": False},
    "ACC002": {"id": "ACC002", "name": "John Smith Holdings", "type": "shell", "balance": 180000, "riskScore": 85, "country": "CY", "isSuspicious": True},
    "ACC003": {"id": "ACC003", "name": "Global Trade Ltd", "type": "shell", "balance": 165000, "riskScore": 90, "country": "VG", "isSuspicious": True},
    "ACC004": {"id": "ACC004", "name": "Offshore Ventures", "type": "shell", "balance": 209000, "riskScore": 95, "country": "PA", "isSuspicious": True},
    "ACC005": {"id": "ACC005", "name": "Jane Doe", "type": "individual", "balance": 45000, "riskScore": 15, "country": "US", "isSuspicious": False},
}

transactions = []
alerts = []

# Generate initial mock transactions
def generate_transactions():
    global transactions
    transaction_types = ["wire", "ach", "internal", "card"]
    statuses = ["normal", "suspicious", "flagged"]
    
    for i in range(50):
        from_acc = random.choice(list(accounts.keys()))
        to_acc = random.choice([k for k in accounts.keys() if k != from_acc])
        amount = random.randint(1000, 50000)
        risk = random.randint(10, 100)
        status = "flagged" if risk > 75 else "suspicious" if risk > 50 else "normal"
        
        transactions.append({
            "id": f"TXN{str(i+1).zfill(3)}",
            "from": from_acc,
            "to": to_acc,
            "amount": amount,
            "timestamp": (datetime.now() - timedelta(hours=random.randint(0, 48))).isoformat(),
            "riskScore": risk,
            "status": status,
            "type": random.choice(transaction_types)
        })

generate_transactions()

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    """Get all accounts"""
    return jsonify(list(accounts.values()))

@app.route('/api/accounts/<account_id>', methods=['GET'])
def get_account(account_id):
    """Get a specific account by ID"""
    account = accounts.get(account_id.upper())
    if account:
        return jsonify(account)
    return jsonify({"error": "Account not found"}), 404

@app.route('/api/accounts/<account_id>/transactions', methods=['GET'])
def get_account_transactions(account_id):
    """Get all transactions for a specific account"""
    account_id = account_id.upper()
    account_transactions = [
        t for t in transactions 
        if t["from"] == account_id or t["to"] == account_id
    ]
    return jsonify(account_transactions)

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get all transactions with optional filtering"""
    status = request.args.get('status')
    risk_min = request.args.get('risk_min', type=int)
    
    filtered = transactions
    
    if status:
        filtered = [t for t in filtered if t["status"] == status]
    if risk_min:
        filtered = [t for t in filtered if t["riskScore"] >= risk_min]
    
    return jsonify(filtered)

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all fraud alerts"""
    return jsonify(alerts)

@app.route('/api/alerts', methods=['POST'])
def create_alert():
    """Create a new fraud alert"""
    data = request.json
    alert = {
        "id": f"ALT{str(len(alerts)+1).zfill(3)}",
        "type": data.get("type", "unknown"),
        "accountId": data.get("accountId"),
        "riskScore": data.get("riskScore", 50),
        "timestamp": datetime.now().isoformat(),
        "status": "open",
        "description": data.get("description", ""),
        "amount": data.get("amount")
    }
    alerts.append(alert)
    return jsonify(alert), 201

@app.route('/api/alerts/<alert_id>/status', methods=['PATCH'])
def update_alert_status(alert_id):
    """Update alert status"""
    data = request.json
    for alert in alerts:
        if alert["id"] == alert_id.upper():
            alert["status"] = data.get("status", alert["status"])
            return jsonify(alert)
    return jsonify({"error": "Alert not found"}), 404

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    suspicious_count = len([t for t in transactions if t["status"] in ["suspicious", "flagged"]])
    high_risk_accounts = len([a for a in accounts.values() if a["isSuspicious"]])
    open_alerts = len([a for a in alerts if a["status"] == "open"])
    
    return jsonify({
        "totalTransactions": len(transactions),
        "suspiciousTransactions": suspicious_count,
        "highRiskAccounts": high_risk_accounts,
        "fraudAlerts": open_alerts,
        "totalVolume": sum(t["amount"] for t in transactions),
        "avgRiskScore": sum(t["riskScore"] for t in transactions) // len(transactions) if transactions else 0
    })

@app.route('/api/graph/nodes', methods=['GET'])
def get_graph_nodes():
    """Get nodes for the fund flow graph"""
    nodes = []
    for i, (acc_id, acc) in enumerate(accounts.items()):
        nodes.append({
            "id": acc_id,
            "position": {"x": (i % 3) * 250 + 100, "y": (i // 3) * 200 + 100},
            "data": {"label": acc["name"], "account": acc},
            "type": "accountNode"
        })
    return jsonify(nodes)

@app.route('/api/graph/edges', methods=['GET'])
def get_graph_edges():
    """Get edges for the fund flow graph"""
    edges = []
    seen = set()
    
    for txn in transactions[:20]:  # Limit to avoid cluttering
        edge_key = f"{txn['from']}-{txn['to']}"
        if edge_key not in seen:
            seen.add(edge_key)
            is_suspicious = txn["riskScore"] > 60
            edges.append({
                "id": f"e-{edge_key}",
                "source": txn["from"],
                "target": txn["to"],
                "animated": is_suspicious,
                "style": {
                    "stroke": "#ef4444" if is_suspicious else "#22c55e"
                },
                "data": {
                    "amount": txn["amount"],
                    "suspicious": is_suspicious
                }
            })
    return jsonify(edges)

@app.route('/api/investigate/<account_id>', methods=['GET'])
def investigate_account(account_id):
    """Get full investigation data for an account"""
    account_id = account_id.upper()
    account = accounts.get(account_id)
    
    if not account:
        return jsonify({"error": "Account not found"}), 404
    
    account_transactions = [
        t for t in transactions 
        if t["from"] == account_id or t["to"] == account_id
    ]
    
    # Calculate risk factors
    risk_factors = []
    if account["type"] == "shell":
        risk_factors.append("Shell company structure")
    if account["country"] not in ["US", "UK", "DE"]:
        risk_factors.append(f"Offshore jurisdiction ({account['country']})")
    if len(account_transactions) < 10:
        risk_factors.append("Low transaction history")
    
    # Find connected accounts
    connected = set()
    for txn in account_transactions:
        connected.add(txn["from"])
        connected.add(txn["to"])
    connected.discard(account_id)
    
    return jsonify({
        "account": account,
        "transactions": account_transactions,
        "riskFactors": risk_factors,
        "connectedAccounts": list(connected),
        "transactionChain": account_transactions[:5]  # Simplified chain
    })

@app.route('/api/detect/circular', methods=['POST'])
def detect_circular_transactions():
    """AI-powered circular transaction detection"""
    # Simplified circular detection logic
    # In production, this would use graph algorithms and ML
    suspicious_patterns = []
    
    # Look for A -> B -> C -> A patterns
    for txn1 in transactions:
        for txn2 in transactions:
            if txn1["to"] == txn2["from"] and txn1["id"] != txn2["id"]:
                for txn3 in transactions:
                    if txn2["to"] == txn3["from"] and txn3["to"] == txn1["from"]:
                        suspicious_patterns.append({
                            "type": "circular",
                            "path": [txn1["from"], txn1["to"], txn2["to"], txn3["to"]],
                            "totalAmount": txn1["amount"] + txn2["amount"] + txn3["amount"],
                            "riskScore": 95
                        })
    
    return jsonify({"patterns": suspicious_patterns[:5]})  # Limit results

if __name__ == '__main__':
    print("Starting FraudShield Flask API...")
    print("API available at http://localhost:5000")
    print("\nAvailable endpoints:")
    print("  GET  /api/health - Health check")
    print("  GET  /api/accounts - List all accounts")
    print("  GET  /api/accounts/<id> - Get account details")
    print("  GET  /api/transactions - List transactions")
    print("  GET  /api/alerts - List alerts")
    print("  POST /api/alerts - Create alert")
    print("  GET  /api/stats - Dashboard statistics")
    print("  GET  /api/graph/nodes - Graph nodes")
    print("  GET  /api/graph/edges - Graph edges")
    print("  GET  /api/investigate/<id> - Investigation data")
    print("  POST /api/detect/circular - Detect circular patterns")
    
    app.run(debug=True, port=5000)
