import os
import torch
from collections import OrderedDict
from typing import List, Tuple, Union, Optional, Dict
import flwr as fl
from flwr.common import Metrics, Parameters, Scalar
from flwr.server.client_proxy import ClientProxy

from model import FraudMLP

def aggregate_metrics(metrics: List[Tuple[int, Metrics]]) -> Metrics:
    """
    Aggregates evaluation metrics (accuracy, precision, recall, f1, auc) 
    from all participating bank nodes, weighted by their dataset size.
    """
    if not metrics:
        return {}

    num_total_examples = sum(num_examples for num_examples, _ in metrics)
    if num_total_examples == 0:
        return {}

    aggregated_metrics = {}
    metric_keys = metrics[0][1].keys()

    for key in metric_keys:
        weighted_sum = sum(num_examples * float(m[key]) for num_examples, m in metrics if key in m)
        aggregated_metrics[key] = weighted_sum / num_total_examples

    print("\n" + "=" * 60)
    print("  >>> GLOBAL FEDERATED EVALUATION AGGREGATE <<<")
    print("=" * 60)
    for k, v in aggregated_metrics.items():
        if k == "accuracy":
            print(f"  - {k.upper():<12}: {v * 100:.2f}%")
        else:
            print(f"  - {k.upper():<12}: {v:.4f}")
    print("=" * 60 + "\n")

    return aggregated_metrics


class SaveModelStrategy(fl.server.strategy.FedAvg):
    """
    Custom FedAvg strategy that automatically converts aggregated global weights
    into a PyTorch state_dict and saves them to disk at models/global_aml_model.pth
    """
    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, fl.common.FitRes]],
        failures: List[Union[Tuple[ClientProxy, fl.common.FitRes], BaseException]],
    ) -> Tuple[Optional[Parameters], Dict[str, Scalar]]:
        aggregated_parameters, aggregated_metrics = super().aggregate_fit(server_round, results, failures)

        if aggregated_parameters is not None:
            # Convert Flower Parameters to numpy ndarrays
            aggregated_ndarrays = fl.common.parameters_to_ndarrays(aggregated_parameters)

            # Build PyTorch model state_dict
            global_model = FraudMLP(input_dim=12)
            params_dict = zip(global_model.state_dict().keys(), aggregated_ndarrays)
            state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
            global_model.load_state_dict(state_dict, strict=True)

            # Ensure models directory exists
            os.makedirs("models", exist_ok=True)

            # Save round-specific checkpoint and latest global model
            save_path_latest = os.path.join("models", "global_aml_model.pth")
            save_path_round = os.path.join("models", f"global_aml_model_round_{server_round}.pth")

            torch.save(global_model.state_dict(), save_path_latest)
            torch.save(global_model.state_dict(), save_path_round)

            print(f"[Model Checkpoint] Global model successfully saved:")
            print(f"  -> Latest:  {os.path.abspath(save_path_latest)}")
            print(f"  -> Round {server_round}: {os.path.abspath(save_path_round)}\n")

        return aggregated_parameters, aggregated_metrics


if __name__ == "__main__":
    # Define the Federated Learning Strategy with Automatic Model Saving
    strategy = SaveModelStrategy(
        fraction_fit=1.0,               # Use all connected clients for training (100%)
        fraction_evaluate=1.0,          # Use all connected clients for evaluation (100%)
        min_fit_clients=5,              # Minimum 5 banks required to start a round
        min_available_clients=5,        # Wait for all 5 banks to connect before launching
        fit_metrics_aggregation_fn=aggregate_metrics,
        evaluate_metrics_aggregation_fn=aggregate_metrics,
    )

    print("==================================================")
    print("  CENTRAL FEDERATED AGGREGATOR SERVER STARTED     ")
    print("  Listening on port 8080... Waiting for 5 banks   ")
    print("==================================================")
    
    # Run the server for 5 global federation rounds
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=fl.server.ServerConfig(num_rounds=5),
        strategy=strategy,
    )
