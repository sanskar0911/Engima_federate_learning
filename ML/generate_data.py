import os
import numpy as np
import pandas as pd

def generate_bank_datasets(data_dir: str = "./data", num_banks: int = 5, samples_per_bank: int = 2000):
    """
    Generates realistic synthetic tabular financial datasets for 5 distinct banking institutions.
    Simulates cross-institution financial transaction risk where individual bank silos
    have incomplete views of distributed money-laundering rings, while federated aggregation
    captures the global fraud distribution.
    """
    os.makedirs(data_dir, exist_ok=True)
    np.random.seed(42)

    feature_cols = [
        "amount",
        "oldbalanceOrg",
        "newbalanceOrig",
        "oldbalanceDest",
        "newbalanceDest",
        "is_cross_bank",
        "channel_risk",
        "velocity_score"
    ]

    for bank_id in range(1, num_banks + 1):
        # Generate baseline normal banking transactions
        n_normal = int(samples_per_bank * 0.88)
        n_fraud = samples_per_bank - n_normal

        # Normal transactions: moderate amounts, consistent balances, low velocity
        norm_amounts = np.random.exponential(scale=3500, size=n_normal)
        norm_old_orig = np.random.uniform(5000, 150000, size=n_normal)
        norm_new_orig = np.maximum(0, norm_old_orig - norm_amounts)
        norm_old_dest = np.random.uniform(1000, 100000, size=n_normal)
        norm_new_dest = norm_old_dest + norm_amounts
        norm_cross_bank = np.random.binomial(1, p=0.25, size=n_normal)
        norm_channel_risk = np.random.uniform(0.05, 0.35, size=n_normal)
        norm_velocity = np.random.uniform(0.1, 0.4, size=n_normal)
        norm_labels = np.zeros(n_normal, dtype=int)

        # Fraud / Money laundering transactions:
        # High cross-bank layering, rapid fund velocity, rapid account drainage
        fraud_amounts = np.random.uniform(45000, 250000, size=n_fraud)
        fraud_old_orig = fraud_amounts + np.random.uniform(100, 500, size=n_fraud)
        fraud_new_orig = np.random.uniform(0, 100, size=n_fraud) # Near 0 remaining balance
        fraud_old_dest = np.random.uniform(0, 5000, size=n_fraud)
        fraud_new_dest = fraud_old_dest + fraud_amounts
        fraud_cross_bank = np.random.binomial(1, p=0.85, size=n_fraud)
        fraud_channel_risk = np.random.uniform(0.70, 0.99, size=n_fraud)
        fraud_velocity = np.random.uniform(0.75, 1.0, size=n_fraud)
        fraud_labels = np.ones(n_fraud, dtype=int)

        # Bank-specific bias / distribution shift (Non-IID realism)
        bank_bias = (bank_id - 1) * 0.05
        fraud_channel_risk = np.clip(fraud_channel_risk + bank_bias, 0, 1)

        amounts = np.concatenate([norm_amounts, fraud_amounts])
        old_orig = np.concatenate([norm_old_orig, fraud_old_orig])
        new_orig = np.concatenate([norm_new_orig, fraud_new_orig])
        old_dest = np.concatenate([norm_old_dest, fraud_old_dest])
        new_dest = np.concatenate([norm_new_dest, fraud_new_dest])
        cross_bank = np.concatenate([norm_cross_bank, fraud_cross_bank])
        channel_risk = np.concatenate([norm_channel_risk, fraud_channel_risk])
        velocity = np.concatenate([norm_velocity, fraud_velocity])
        labels = np.concatenate([norm_labels, fraud_labels])

        df = pd.DataFrame({
            "amount": amounts,
            "oldbalanceOrg": old_orig,
            "newbalanceOrig": new_orig,
            "oldbalanceDest": old_dest,
            "newbalanceDest": new_dest,
            "is_cross_bank": cross_bank,
            "channel_risk": channel_risk,
            "velocity_score": velocity,
            "is_fraud": labels
        })

        # Shuffle
        df = df.sample(frac=1.0, random_state=42 + bank_id).reset_index(drop=True)

        file_path = os.path.join(data_dir, f"bank_{bank_id}.csv")
        df.to_csv(file_path, index=False)
        print(f"✅ Generated local dataset for Bank {bank_id}: {file_path} ({len(df)} samples)")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    generate_bank_datasets(data_dir=os.path.join(current_dir, "data"), num_banks=5)
