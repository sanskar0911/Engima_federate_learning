import torch
import torch.nn as nn

class FinancialRiskMLP(nn.Module):
    """
    Multilayer Perceptron (MLP) for Tabular Financial Risk Assessment & Fraud Detection.
    Architecture designed to be fully compatible with Opacus Differential Privacy (DP-SGD)
    by avoiding batch normalization layers and using standard Linear + ReLU layers.
    """
    def __init__(self, input_dim: int = 8, hidden_dim1: int = 64, hidden_dim2: int = 32, num_classes: int = 2):
        super(FinancialRiskMLP, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim1),
            nn.ReLU(),
            nn.Linear(hidden_dim1, hidden_dim2),
            nn.ReLU(),
            nn.Linear(hidden_dim2, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)
