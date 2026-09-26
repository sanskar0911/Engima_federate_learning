import argparse
import torch
import torch.nn as nn
from collections import OrderedDict
import flwr as fl

from dataset import get_dataloader
from model import FraudMLP, train_one_epoch, evaluate, count_parameters, get_device

class BankClient(fl.client.NumPyClient):
    def __init__(self, node_csv, device, local_epochs=3):
        self.device = device
        self.local_epochs = local_epochs
        
        # Load local data using your optimized dataset.py pipeline
        self.train_loader, self.test_loader, self.input_dim = get_dataloader(node_csv)
        
        # Initialize your 37k-parameter model
        self.model = FraudMLP(input_dim=self.input_dim).to(self.device)
        
        # Loss function
        self.criterion = nn.BCEWithLogitsLoss()
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
        
        print(f"[Client Initialized] Model Parameters: {count_parameters(self.model):,}")

    def get_parameters(self, config):
        """Extracts model weights to send back to the central server."""
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        """Loads global weights received from the central server into the local model."""
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        """Performs local training rounds on the bank's private data."""
        self.set_parameters(parameters)
        
        epoch_loss = 0.0
        for epoch in range(self.local_epochs):
            epoch_loss = train_one_epoch(self.model, self.train_loader, self.optimizer, self.criterion, self.device)
            
        print(f"[Local Training] Completed {self.local_epochs} epochs | Final Loss: {epoch_loss:.4f}")
        
        return self.get_parameters(config={}), len(self.train_loader.dataset), {"loss": float(epoch_loss)}

    def evaluate(self, parameters, config):
        """Evaluates the model on the bank's local test partition."""
        self.set_parameters(parameters)
        metrics = evaluate(self.model, self.test_loader, self.criterion, self.device)
        
        print(f"[Local Evaluation] Acc: {metrics['accuracy']*100:.2f}% | Prec: {metrics['precision']:.4f} | Rec: {metrics['recall']:.4f} | F1: {metrics['f1']:.4f} | AUC: {metrics['auc']:.4f}")
        
        return float(metrics["loss"]), len(self.test_loader.dataset), {
            "accuracy": float(metrics["accuracy"]),
            "precision": float(metrics["precision"]),
            "recall": float(metrics["recall"]),
            "f1": float(metrics["f1"]),
            "auc": float(metrics["auc"])
        }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Federated Bank Node Client")
    parser.add_argument("--node_csv", type=str, required=True, help="Path to the bank CSV file")
    args = parser.parse_args()

    device = get_device()
    print(f"Client hardware device target: {device}")
    
    client = BankClient(args.node_csv, device)
    
    # Connect directly to the Flower server running on localhost:8080
    fl.client.start_client(server_address="127.0.0.1:8080", client=client.to_client())