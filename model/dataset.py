import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from sklearn.preprocessing import StandardScaler

# Standard list of all payment formats in the dataset to guarantee consistent feature dimension across all federated nodes
ALL_PAYMENT_FORMATS = ['ACH', 'Bitcoin', 'Cash', 'Cheque', 'Credit Card', 'Reinvestment', 'Wire']

class AMLDataset(Dataset):
    def __init__(self, X: torch.Tensor, y: torch.Tensor):
        self.X = X
        self.y = y

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


def process_aml_data(csv_file: str):
    """
    Loads and processes raw transaction data, extracting engineered features
    and returning train and test PyTorch tensors.
    """
    print(f"Loading data from {csv_file}...")
    df = pd.read_csv(csv_file)

    # --- 1. Feature Engineering ---
    # Extract Time Behavior (Fraud often happens at strange hours)
    df['Hour'] = pd.to_datetime(df['Timestamp']).dt.hour

    # Extract Cross-Bank Risk (Money crossing borders is riskier)
    df['Is_Cross_Bank'] = (df['From Bank'] != df['To Bank']).astype(int)

    # Currency mismatch (e.g. paying in USD but receiving in Yuan)
    df['Currency_Mismatch'] = (df['Receiving Currency'] != df['Payment Currency']).astype(int)

    # Handle Massive Amounts (Log-Transform to squish massive dollar values into a usable scale)
    df['Log_Amount_Paid'] = np.log1p(df['Amount Paid'].clip(lower=0))
    df['Log_Amount_Received'] = np.log1p(df['Amount Received'].clip(lower=0))

    # One-Hot Encoding for the categorical Payment Format (ACH, Cheque, etc.) with fixed categories
    cat_type = pd.CategoricalDtype(categories=ALL_PAYMENT_FORMATS, ordered=False)
    payment_dummies = pd.get_dummies(df['Payment Format'].astype(cat_type), prefix='fmt', dtype=float)

    # --- 2. Scaling & Assembly ---
    # Neural networks perform best when numerical data is scaled to have a mean of 0 and variance of 1
    num_cols = ['Log_Amount_Paid', 'Log_Amount_Received', 'Hour']
    scaler = StandardScaler()
    scaled_nums = scaler.fit_transform(df[num_cols])

    # Merge all clean features together
    feature_matrices = [
        scaled_nums,
        df[['Is_Cross_Bank', 'Currency_Mismatch']].values,
        payment_dummies.values
    ]

    X = np.hstack(feature_matrices).astype(np.float32)
    y = df['Is Laundering'].values.astype(np.float32)

    # --- 3. Splitting (80% Train, 20% Test) ---
    split_idx = int(0.8 * len(X))
    
    X_train = torch.tensor(X[:split_idx], dtype=torch.float32)
    y_train = torch.tensor(y[:split_idx], dtype=torch.float32).unsqueeze(1)
    
    X_test = torch.tensor(X[split_idx:], dtype=torch.float32)
    y_test = torch.tensor(y[split_idx:], dtype=torch.float32).unsqueeze(1)

    return (X_train, y_train), (X_test, y_test)


def get_dataloader(csv_file, batch_size=512):
    (X_train, y_train), (X_test, y_test) = process_aml_data(csv_file)
    
    train_ds = AMLDataset(X_train, y_train)
    test_ds = AMLDataset(X_test, y_test)

    # --- 4. HANDLING EXTREME CLASS IMBALANCE ---
    # Count how many normal (0) and fraud (1) cases we have in the training set
    y_train_np = y_train.numpy().flatten()
    class_counts = np.bincount(y_train_np.astype(int), minlength=2)

    # Assign a weight to each class (Inverse of their frequency)
    # Using a small epsilon to avoid division by zero just in case a node has 0 fraud cases initially
    epsilon = 1e-8
    class_weights = 1.0 / (class_counts + epsilon)

    # Assign a weight to every single sample in the dataset based on its class
    sample_weights = np.array([class_weights[int(label)] for label in y_train_np])
    sample_weights = torch.from_numpy(sample_weights).float()

    # Create the Sampler (This guarantees a balanced 50/50 batch during training)
    sampler = WeightedRandomSampler(weights=sample_weights, num_samples=len(sample_weights), replacement=True)

    # Apply the sampler to the Train Loader (Do NOT shuffle when using a sampler)
    train_loader = DataLoader(train_ds, batch_size=batch_size, sampler=sampler)

    # Test Loader stays normal (we want to test on the real-world imbalanced distribution)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)

    input_dim = X_train.shape[1]
    return train_loader, test_loader, input_dim


# Quick local test to verify across nodes
if __name__ == "__main__":
    for i in range(1, 6):
        node_file = f"./federated_nodes/bank_{i}_node.csv"
        train_loader, test_loader, input_dim = get_dataloader(node_file)
        print(f"[Node {i}] Data processed | Input Dim: {input_dim} | Train Batches: {len(train_loader)} | Test Batches: {len(test_loader)}")