import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score

class FraudMLP(nn.Module):
    def __init__(self, input_dim=12):
        super(FraudMLP, self).__init__()
        # Architecture tuned for ~37,000 parameters (192 -> 128 -> 64 -> 1)
        # Using LayerNorm for better stability across Federated non-IID nodes
        self.network = nn.Sequential(
            nn.Linear(input_dim, 192),
            nn.LayerNorm(192),
            nn.ReLU(),
            nn.Dropout(0.3),
            
            nn.Linear(192, 128),
            nn.LayerNorm(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            
            nn.Linear(128, 64),
            nn.LayerNorm(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            
            nn.Linear(64, 1)  # Raw logit output
        )

    def forward(self, x):
        return self.network(x)


def count_parameters(model):
    """Returns the total number of trainable parameters."""
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


def train_one_epoch(model, dataloader, optimizer, criterion, device):
    """Trains the model for a single local epoch."""
    model.train()
    total_loss = 0.0
    
    for X_batch, y_batch in dataloader:
        X_batch, y_batch = X_batch.to(device), y_batch.to(device)
        
        optimizer.zero_grad()
        preds = model(X_batch)
        loss = criterion(preds, y_batch)
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
        
    return total_loss / len(dataloader)


def evaluate(model, dataloader, criterion, device):
    """
    Evaluates the model and computes comprehensive AML metrics:
    Loss, Accuracy, Precision, Recall, F1-Score, and ROC-AUC.
    """
    model.eval()
    total_loss = 0.0
    all_preds = []
    all_targets = []
    
    with torch.no_grad():
        for X_batch, y_batch in dataloader:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            preds = model(X_batch)
            
            total_loss += criterion(preds, y_batch).item()
            probs = torch.sigmoid(preds)
            
            all_preds.extend(probs.cpu().numpy().flatten())
            all_targets.extend(y_batch.cpu().numpy().flatten())
            
    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)
    binary_preds = (all_preds > 0.5).astype(int)
    
    acc = (binary_preds == all_targets).mean()
    prec = precision_score(all_targets, binary_preds, zero_division=0)
    rec = recall_score(all_targets, binary_preds, zero_division=0)
    f1 = f1_score(all_targets, binary_preds, zero_division=0)
    try:
        auc = roc_auc_score(all_targets, all_preds)
    except ValueError:
        auc = 0.5
        
    metrics = {
        "loss": total_loss / len(dataloader),
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "auc": auc
    }
    return metrics


def get_device():
    """
    Selects CUDA if supported and compatible; otherwise falls back gracefully to CPU.
    Handles newer GPUs (e.g. Blackwell sm_120) when PyTorch lacks precompiled kernels.
    """
    if torch.cuda.is_available():
        try:
            # Test a minimal CUDA kernel operation to verify architecture compatibility
            test_tensor = torch.zeros(1, device="cuda") + 1
            return torch.device("cuda")
        except RuntimeError:
            print("[Warning] CUDA is detected but incompatible with this PyTorch build. Falling back to CPU.")
            return torch.device("cpu")
    return torch.device("cpu")


# Quick local test to verify model compilation, parameter count, and training
if __name__ == "__main__":
    from dataset import get_dataloader

    device = get_device()
    print(f"Using device: {device}")

    # Load Bank 1 node data
    train_loader, test_loader, input_dim = get_dataloader('./federated_nodes/bank_1_node.csv')

    # Initialize model
    model = FraudMLP(input_dim=input_dim).to(device)
    total_params = count_parameters(model)
    print(f"Model Architecture Initialized! Total Trainable Parameters: {total_params:,}")

    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.BCEWithLogitsLoss()

    print("\nStarting local test training for 1 epoch on Node 1...")
    train_loss = train_one_epoch(model, train_loader, optimizer, criterion, device)
    metrics = evaluate(model, test_loader, criterion, device)

    print("\n--- Model Evaluation Results (1 Epoch) ---")
    print(f"Train Loss:  {train_loss:.4f}")
    print(f"Val Loss:    {metrics['loss']:.4f}")
    print(f"Accuracy:    {metrics['accuracy'] * 100:.2f}%")
    print(f"Precision:   {metrics['precision']:.4f}")
    print(f"Recall:      {metrics['recall']:.4f}")
    print(f"F1-Score:    {metrics['f1']:.4f}")
    print(f"ROC-AUC:     {metrics['auc']:.4f}")


