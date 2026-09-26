import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Avoid Windows CP1252 stdout encoding errors
def log(msg: str):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'))

BANKS_CONFIG = [
    {
        "bankId": "BANK-A",
        "bankName": "Apex National Bank",
        "shortCode": "ANB",
        "region": "IN-MH",
        "sampleCount": 12500,
        "fraudRate": 0.084,
        "primaryCities": ["Mumbai, IN", "Pune, IN", "Nagpur, IN"],
        "channelBias": {"UPI": 0.45, "IMPS": 0.25, "NEFT": 0.20, "RTGS": 0.10}
    },
    {
        "bankId": "BANK-B",
        "bankName": "Bharat Financial Corp",
        "shortCode": "BFC",
        "region": "IN-DL",
        "sampleCount": 9800,
        "fraudRate": 0.062,
        "primaryCities": ["New Delhi, IN", "Noida, IN", "Gurugram, IN"],
        "channelBias": {"UPI": 0.50, "IMPS": 0.30, "NEFT": 0.15, "RTGS": 0.05}
    },
    {
        "bankId": "BANK-C",
        "bankName": "Coastal Trust Bank",
        "shortCode": "CTB",
        "region": "IN-KA",
        "sampleCount": 11200,
        "fraudRate": 0.071,
        "primaryCities": ["Bengaluru, IN", "Mangaluru, IN", "Mysuru, IN"],
        "channelBias": {"UPI": 0.40, "IMPS": 0.35, "NEFT": 0.15, "RTGS": 0.10}
    }
]

MERCHANTS = [
    "Amazon Pay India", "Flipkart Payments", "Swiggy UPI", "Zomato Orders",
    "Reliance Retail", "Indian Oil Fuel", "D-Mart Supermarket", "IRCTC Ticketing",
    "Razorpay Gateway", "Offshore Wire Services", "Crypto P2P Merchant", "Bullion Gold Traders"
]

FRAUD_PATTERNS = [
    "STRUCTURING_SMURFING",
    "RAPID_VELOCITY_DRAIN",
    "CROSS_BANK_MULE_HOP",
    "HIGH_VALUE_OFFSHORE_SPIKE",
    "CREDENTIAL_STUFFING_ATM"
]

def generate_datasets(output_dirs):
    for out_dir in output_dirs:
        os.makedirs(out_dir, exist_ok=True)

    np.random.seed(42)
    now = datetime.now()

    all_banks_summary = {}
    aggregated_records = []

    for b_idx, b_cfg in enumerate(BANKS_CONFIG):
        bank_id = b_cfg["bankId"]
        short_code = b_cfg["shortCode"]
        total_samples = b_cfg["sampleCount"]
        fraud_ratio = b_cfg["fraudRate"]
        n_fraud = int(total_samples * fraud_ratio)
        n_normal = total_samples - n_fraud

        # --- NORMAL TRANSACTIONS ---
        norm_amounts = np.random.exponential(scale=3200, size=n_normal) + 50
        norm_amounts = np.clip(norm_amounts, 10, 45000)

        norm_old_orig = np.random.uniform(5000, 200000, size=n_normal)
        norm_new_orig = np.maximum(0, norm_old_orig - norm_amounts)
        norm_old_dest = np.random.uniform(2000, 150000, size=n_normal)
        norm_new_dest = norm_old_dest + norm_amounts

        norm_cross_bank = np.random.binomial(1, p=0.28, size=n_normal)
        norm_channel_risk = np.random.uniform(0.04, 0.32, size=n_normal)
        norm_velocity = np.random.uniform(0.05, 0.40, size=n_normal)
        norm_is_fraud = np.zeros(n_normal, dtype=int)
        norm_patterns = ["NORMAL"] * n_normal

        # --- FRAUDULENT TRANSACTIONS ---
        fraud_amounts = np.random.uniform(35000, 480000, size=n_fraud)
        fraud_old_orig = fraud_amounts + np.random.uniform(50, 400, size=n_fraud)
        fraud_new_orig = np.random.uniform(0, 150, size=n_fraud) # Account drained
        fraud_old_dest = np.random.uniform(0, 3000, size=n_fraud)
        fraud_new_dest = fraud_old_dest + fraud_amounts

        fraud_cross_bank = np.random.binomial(1, p=0.88, size=n_fraud)
        fraud_channel_risk = np.random.uniform(0.72, 0.99, size=n_fraud)
        fraud_velocity = np.random.uniform(0.78, 1.0, size=n_fraud)
        fraud_is_fraud = np.ones(n_fraud, dtype=int)
        fraud_patterns = np.random.choice(FRAUD_PATTERNS, size=n_fraud)

        # Concatenate
        amounts = np.concatenate([norm_amounts, fraud_amounts])
        old_orig = np.concatenate([norm_old_orig, fraud_old_orig])
        new_orig = np.concatenate([norm_new_orig, fraud_new_orig])
        old_dest = np.concatenate([norm_old_dest, fraud_old_dest])
        new_dest = np.concatenate([norm_new_dest, fraud_new_dest])
        cross_bank = np.concatenate([norm_cross_bank, fraud_cross_bank])
        channel_risk = np.concatenate([norm_channel_risk, fraud_channel_risk])
        velocity = np.concatenate([norm_velocity, fraud_velocity])
        is_fraud = np.concatenate([norm_is_fraud, fraud_is_fraud])
        patterns = np.concatenate([norm_patterns, fraud_patterns])

        # Metadata generation
        channels = list(b_cfg["channelBias"].keys())
        channel_probs = list(b_cfg["channelBias"].values())
        assigned_channels = np.random.choice(channels, size=total_samples, p=channel_probs)

        cities = b_cfg["primaryCities"]
        assigned_locations = np.random.choice(cities, size=total_samples)

        merchants = np.random.choice(MERCHANTS, size=total_samples)
        device_ids = [f"DEV-{np.random.choice(['iOS', 'Android', 'Web'])}-{np.random.randint(100, 999)}" for _ in range(total_samples)]

        account_ids = [f"ACC-{short_code}-{np.random.randint(1000, 9999)}" for _ in range(total_samples)]
        dest_banks = [b["shortCode"] for b in BANKS_CONFIG if b["shortCode"] != short_code]
        dest_banks.append(short_code)
        dest_accounts = [f"ACC-{np.random.choice(dest_banks)}-{np.random.randint(1000, 9999)}" for _ in range(total_samples)]

        time_offsets = np.random.uniform(0, 30 * 24 * 3600, size=total_samples)
        timestamps = [(now - timedelta(seconds=int(offset))).isoformat() for offset in time_offsets]

        txn_ids = [f"TXN-{short_code}-{100000 + i}" for i in range(total_samples)]

        # Calculate composite risk score (0 - 100)
        risk_scores = np.clip(
            (channel_risk * 35) + (velocity * 35) + (cross_bank * 15) + (is_fraud * 25) + np.random.uniform(-5, 5, size=total_samples),
            2, 99
        ).astype(int)

        df = pd.DataFrame({
            "transactionId": txn_ids,
            "timestamp": timestamps,
            "bankId": bank_id,
            "bankName": b_cfg["bankName"],
            "accountId": account_ids,
            "receiverId": dest_accounts,
            "merchant": merchants,
            "location": assigned_locations,
            "deviceId": device_ids,
            "channel": assigned_channels,
            "amount": np.round(amounts, 2),
            "oldbalanceOrg": np.round(old_orig, 2),
            "newbalanceOrig": np.round(new_orig, 2),
            "oldbalanceDest": np.round(old_dest, 2),
            "newbalanceDest": np.round(new_dest, 2),
            "is_cross_bank": cross_bank,
            "channel_risk": np.round(channel_risk, 4),
            "velocity_score": np.round(velocity, 4),
            "riskScore": risk_scores,
            "fraudPattern": patterns,
            "is_fraud": is_fraud
        })

        # Shuffle
        df = df.sample(frac=1.0, random_state=42 + b_idx).reset_index(drop=True)

        # Write to all requested output directories
        for out_dir in output_dirs:
            csv_path = os.path.join(out_dir, f"{bank_id.lower().replace('-', '_')}.csv")
            df.to_csv(csv_path, index=False)
            # Also keep bank_1.csv format for compatibility with flower clients
            alt_path = os.path.join(out_dir, f"bank_{b_idx + 1}.csv")
            df.to_csv(alt_path, index=False)

        log(f"[OK] Generated {len(df)} records for {bank_id} ({b_cfg['bankName']})")

        # Bank summary metrics
        bank_summary = {
            "bankId": bank_id,
            "bankName": b_cfg["bankName"],
            "shortCode": short_code,
            "region": b_cfg["region"],
            "totalTransactions": int(len(df)),
            "totalVolumeINR": float(np.round(df["amount"].sum(), 2)),
            "avgTransactionAmount": float(np.round(df["amount"].mean(), 2)),
            "fraudCount": int(df["is_fraud"].sum()),
            "fraudRatio": float(np.round(df["is_fraud"].mean(), 4)),
            "avgRiskScore": float(np.round(df["riskScore"].mean(), 1)),
            "channelBreakdown": df["channel"].value_counts().to_dict(),
            "fraudPatternBreakdown": df[df["is_fraud"] == 1]["fraudPattern"].value_counts().to_dict(),
            "crossBankCount": int(df["is_cross_bank"].sum()),
            "crossBankRatio": float(np.round(df["is_cross_bank"].mean(), 4)),
            "generatedAt": now.isoformat()
        }
        all_banks_summary[bank_id] = bank_summary

        # Sample for global test set
        sampled = df.sample(n=min(2000, len(df)), random_state=42)
        aggregated_records.append(sampled)

    # Global summary and global test set
    global_df = pd.concat(aggregated_records).sample(frac=1.0, random_state=42).reset_index(drop=True)
    for out_dir in output_dirs:
        global_df.to_csv(os.path.join(out_dir, "global_test_data.csv"), index=False)
        summary_path = os.path.join(out_dir, "dataset_summary.json")
        with open(summary_path, "w") as f:
            json.dump({
                "banks": all_banks_summary,
                "global": {
                    "totalBankNodes": len(BANKS_CONFIG),
                    "totalFederatedRecords": sum(b["totalTransactions"] for b in all_banks_summary.values()),
                    "totalFederatedVolumeINR": float(np.round(sum(b["totalVolumeINR"] for b in all_banks_summary.values()), 2)),
                    "totalFraudRecords": sum(b["fraudCount"] for b in all_banks_summary.values()),
                    "globalFraudRatio": float(np.round(sum(b["fraudCount"] for b in all_banks_summary.values()) / sum(b["totalTransactions"] for b in all_banks_summary.values()), 4)),
                    "testSetSize": len(global_df),
                    "featureColumns": [
                        "amount", "oldbalanceOrg", "newbalanceOrig", "oldbalanceDest",
                        "newbalanceDest", "is_cross_bank", "channel_risk", "velocity_score"
                    ],
                    "generatedAt": now.isoformat()
                }
            }, f, indent=2)

    log(f"[SUCCESS] Synthetic financial datasets generated across {len(BANKS_CONFIG)} bank partitions.")

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dirs_to_write = [
        os.path.join(base_dir, "data"),
        os.path.join(base_dir, "ML", "data"),
        os.path.join(base_dir, "Backend", "data")
    ]
    generate_datasets(dirs_to_write)
