"""Evaluation metrics and script."""
import torch
import yaml
import sys
from pathlib import Path
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

sys.path.append(str(Path(__file__).parent.parent))

from app.models.wav2vec_classifier import VoiceCloningClassifier

def evaluate():
    with open("training/config.yaml") as f:
        config = yaml.safe_load(f)
        
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = VoiceCloningClassifier(
        model_name=config["model"]["name"],
        num_classes=config["model"]["num_classes"]
    ).to(device)
    
    checkpoint_path = Path(config["checkpoint"]["save_dir"]) / "best_checkpoint.pt"
    if checkpoint_path.exists():
        checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=True)
        model.load_state_dict(checkpoint["model_state_dict"])
        print(f"Loaded checkpoint from {checkpoint_path}")
    else:
        print("No checkpoint found.")
        return
        
    model.eval()
    
    # Placeholder for dataloader and evaluation loop
    print("Evaluation loop goes here...")
    
    # Example metrics output
    print("\\nEvaluation Results:")
    print("-" * 40)
    print(f"EER:       {0.0:.4f}")
    print(f"Accuracy:  {0.0:.4f}")
    print(f"Precision: {0.0:.4f}")
    print(f"Recall:    {0.0:.4f}")
    print(f"F1 Score:  {0.0:.4f}")
    print("-" * 40)

if __name__ == "__main__":
    evaluate()
