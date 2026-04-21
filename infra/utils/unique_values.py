import pandas as pd
import json

input_csv = "../data.csv"
output_json = "output.json"

# Load CSV
df = pd.read_csv(input_csv)

# Clean columns (optional but recommended)
df["EVENT_TYPE"] = df["EVENT_TYPE"].astype(str).str.strip()
df["SUB_EVENT_TYPE"] = df["SUB_EVENT_TYPE"].astype(str).str.strip()

# Drop rows with missing values (optional)
df = df.dropna(subset=["EVENT_TYPE", "SUB_EVENT_TYPE"])

# Get unique combinations
unique_pairs = df[["EVENT_TYPE", "SUB_EVENT_TYPE"]].drop_duplicates()

# Convert to list of dicts
result = unique_pairs.to_dict(orient="records")

# Save to JSON
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=4)

print(f"Unique combinations saved to {output_json}")