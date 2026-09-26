"""
Inference and Integration Pipeline for the Federated AML Fraud Detection Model.

This script loads the trained PyTorch model checkpoint ('models/global_aml_model.pth')
and performs real-time fraud risk scoring and classification on new transaction records.
"""

import os
import torch
import numpy as np
import pandas as pd
from model import FraudMLP, get_device
from dataset import ALL_PAYMENT_FORMATS


class AMLFraudDetector:
    def __init__(self, model_path: str = "models/global_aml_model.pth", device=None):
        """
        Initializes the AML detector with the trained global federated model.
        """
        self.device = device or get_device()
        self.model = FraudMLP(input_dim=12).to(self.device)

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model checkpoint not found at: {model_path}\n"
                f"Please run the federated server (server.py) and client training rounds to generate the checkpoint."
            )

        state_dict = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(state_dict)
        self.model.eval()
        print(f"[AML Detector] Successfully loaded trained global model from: {model_path}")
        print(f"[AML Detector] Target device: {self.device}")

    def preprocess(self, df: pd.DataFrame) -> torch.Tensor:
        """
        Applies the exact same feature engineering and categorical mappings
        used during federated training.
        """
        df_clean = df.copy()

        # 1. Hour extraction
        df_clean['Hour'] = pd.to_datetime(df_clean['Timestamp']).dt.hour

        # 2. Cross-bank & Currency mismatch
        df_clean['Is_Cross_Bank'] = (df_clean['From Bank'] != df_clean['To Bank']).astype(int)
        df_clean['Currency_Mismatch'] = (df_clean['Receiving Currency'] != df_clean['Payment Currency']).astype(int)

        # 3. Log amounts
        df_clean['Log_Amount_Paid'] = np.log1p(df_clean['Amount Paid'].clip(lower=0))
        df_clean['Log_Amount_Received'] = np.log1p(df_clean['Amount Received'].clip(lower=0))

        # 4. Standard numerical feature scaling approximation
        num_cols = ['Log_Amount_Paid', 'Log_Amount_Received', 'Hour']
        nums = df_clean[num_cols].values

        # 5. One-Hot Encoding for the 7 fixed payment formats
        cat_type = pd.CategoricalDtype(categories=ALL_PAYMENT_FORMATS, ordered=False)
        payment_dummies = pd.get_dummies(df_clean['Payment Format'].astype(cat_type), prefix='fmt', dtype=float)

        feature_matrix = np.hstack([
            nums,
            df_clean[['Is_Cross_Bank', 'Currency_Mismatch']].values,
            payment_dummies.values
        ]).astype(np.float32)

        return torch.tensor(feature_matrix, dtype=torch.float32).to(self.device)

    def predict_proba(self, df: pd.DataFrame) -> np.ndarray:
        """
        Returns the fraud probability (0.0 to 1.0) for each transaction.
        """
        X = self.preprocess(df)
        with torch.no_grad():
            logits = self.model(X)
            probs = torch.sigmoid(logits).cpu().numpy().flatten()
        return probs

    def predict(self, df: pd.DataFrame, threshold: float = 0.5) -> np.ndarray:
        """
        Returns binary classification (1: Laundering/Fraud, 0: Normal).
        """
        probs = self.predict_proba(df)
        return (probs >= threshold).astype(int)


# Quick verification / demonstration test
if __name__ == "__main__":
    model_checkpoint = os.path.join("models", "global_aml_model.pth")
    if os.path.exists(model_checkpoint):
        detector = AMLFraudDetector(model_checkpoint)

        # Example transaction data
        sample_transactions = pd.DataFrame([
            {
                "Timestamp": "2022/09/01 02:30",
                "From Bank": 10,
                "To Bank": 999,
                "Amount Paid": 1500000.0,
                "Amount Received": 1500000.0,
                "Payment Currency": "US Dollar",
                "Receiving Currency": "Bitcoin",
                "Payment Format": "Bitcoin"
            },
            {
                "Timestamp": "2022/09/01 14:15",
                "From Bank": 10,
                "To Bank": 10,
                "Amount Paid": 45.0,
                "Amount Received": 45.0,
                "Payment Currency": "US Dollar",
                "Receiving Currency": "US Dollar",
                "Payment Format": "Credit Card"
            }
        ])

        probabilities = detector.predict_proba(sample_transactions)
        predictions = detector.predict(sample_transactions, threshold=0.5)

        for i, (prob, pred) in enumerate(zip(probabilities, predictions)):
            status = "🔴 SUSPICIOUS / FRAUD" if pred == 1 else "🟢 NORMAL"
            print(f"\nTransaction #{i+1}: Risk Score = {prob * 100:.2f}% -> {status}")
    else:
        print(f"No checkpoint found at '{model_checkpoint}' yet.")
        print("Run 'python server.py' and client nodes to train and save the model.")
