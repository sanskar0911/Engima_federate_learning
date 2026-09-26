"""
Federated Learning Data Preparation for Anti-Money Laundering (AML)
Dataset: IBM Synthetic AML Dataset (HI-Small_Trans.csv / LI-Small_Trans.csv)

This script analyzes transaction data and partitions it across the top 5 most active
banks to simulate isolated client nodes in a federated learning network.
"""

import os
import sys
import pandas as pd


def prepare_federated_nodes(
    dataset_path: str,
    output_dir: str = "federated_nodes",
    top_n_banks: int = 5
) -> dict:
    """
    Loads AML transaction data, analyzes fraud statistics, identifies top active banks,
    and splits the dataset into isolated node datasets for federated learning.

    Parameters:
        dataset_path (str): Path to the transaction CSV file.
        output_dir (str): Directory where federated node CSVs will be saved.
        top_n_banks (int): Number of top banks to partition into client nodes.

    Returns:
        dict: Summary metadata containing top bank IDs and statistics.
    """
    print("=" * 70)
    print(f"[Step 1] Loading Dataset: {dataset_path}")
    print("=" * 70)

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset file not found at: {dataset_path}")

    df = pd.read_csv(dataset_path)
    total_transactions = len(df)
    print(f"Successfully loaded {total_transactions:,} transactions.\n")

    print("-" * 70)
    print("[Step 2] Dataset Head (First 5 Rows):")
    print("-" * 70)
    pd.set_option("display.max_columns", None)
    pd.set_option("display.width", 1000)
    print(df.head(5))
    print("\nColumns present in dataset:")
    print(list(df.columns))
    print()

    print("-" * 70)
    print("[Step 3] Fraud / Laundering Transaction Statistics:")
    print("-" * 70)
    target_col = "Is Laundering"
    if target_col not in df.columns:
        raise KeyError(f"Target column '{target_col}' not found in dataset columns.")

    total_fraud = int((df[target_col] == 1).sum())
    total_legit = total_transactions - total_fraud
    fraud_rate = (total_fraud / total_transactions) * 100 if total_transactions > 0 else 0.0

    print(f"Total Transactions:         {total_transactions:,}")
    print(f"Legitimate Transactions (0): {total_legit:,} ({100 - fraud_rate:.3f}%)")
    print(f"Fraudulent Transactions (1): {total_fraud:,} ({fraud_rate:.3f}%)\n")

    print("-" * 70)
    print(f"[Step 4] Top {top_n_banks} Most Frequent Banks (by 'From Bank'):")
    print("-" * 70)
    bank_col = "From Bank"
    if bank_col not in df.columns:
        raise KeyError(f"Column '{bank_col}' not found in dataset columns.")

    bank_counts = df[bank_col].value_counts()
    top_banks = bank_counts.head(top_n_banks).index.tolist()

    for rank, bank_id in enumerate(top_banks, start=1):
        count = bank_counts[bank_id]
        print(f"  Rank {rank}: Bank ID '{bank_id}' with {count:,} outgoing transactions")
    print(f"\nTop {top_n_banks} Bank IDs: {top_banks}\n")

    print("-" * 70)
    print(f"[Step 5 & 6] Creating Federated Client Node Partitions in '{output_dir}':")
    print("-" * 70)

    os.makedirs(output_dir, exist_ok=True)

    summary_stats = []

    for rank, bank_id in enumerate(top_banks, start=1):
        node_df = df[df[bank_col] == bank_id].copy()

        node_total_rows = len(node_df)
        node_fraud_rows = int((node_df[target_col] == 1).sum())
        node_fraud_pct = (node_fraud_rows / node_total_rows) * 100 if node_total_rows > 0 else 0.0

        node_filename = f"bank_{rank}_node.csv"
        node_filepath = os.path.join(output_dir, node_filename)
        node_df.to_csv(node_filepath, index=False)

        print(f"[Node {rank}] Saved: {node_filepath}")
        print(f"         Bank ID:           {bank_id}")
        print(f"         Total Rows:        {node_total_rows:,}")
        print(f"         Fraud Cases:       {node_fraud_rows:,} ({node_fraud_pct:.3f}%)\n")

        summary_stats.append({
            "node_rank": rank,
            "filename": node_filename,
            "bank_id": bank_id,
            "total_rows": node_total_rows,
            "fraud_rows": node_fraud_rows,
            "fraud_pct": node_fraud_pct
        })

    print("=" * 70)
    print("Federated Node Creation Completed Successfully!")
    print(f"All {top_n_banks} node datasets are saved in: {os.path.abspath(output_dir)}")
    print("=" * 70)

    return {
        "total_transactions": total_transactions,
        "total_fraud": total_fraud,
        "top_banks": top_banks,
        "nodes": summary_stats
    }


if __name__ == "__main__":
    default_paths = [
        os.path.join("ibmfraud", "HI-Small_Trans.csv"),
        "HI-Small_Trans.csv",
        os.path.join("..", "ibmfraud", "HI-Small_Trans.csv"),
    ]

    selected_path = None
    if len(sys.argv) > 1:
        selected_path = sys.argv[1]
    else:
        for path in default_paths:
            if os.path.exists(path):
                selected_path = path
                break

    if not selected_path:
        print("Error: Could not locate 'HI-Small_Trans.csv'.")
        print("Please provide the file path as an argument:")
        print("    python prepare_federated_data.py <path_to_HI-Small_Trans.csv>")
        sys.exit(1)

    prepare_federated_nodes(dataset_path=selected_path, output_dir="federated_nodes")
