import joblib
import os

input_path = r"model\arogyanvesha_random_forest_final.joblib"
output_path = r"model\arogyanvesha_random_forest_compressed.joblib"

model = joblib.load(input_path)

joblib.dump(model, output_path, compress=("gzip", 3))

print("Original size:", round(os.path.getsize(input_path) / 1024**2, 2), "MB")
print("Compressed size:", round(os.path.getsize(output_path) / 1024**2, 2), "MB")