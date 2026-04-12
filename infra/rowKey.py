import pandas as pd

# 1. Load your merged file
df = pd.read_csv('data.csv')

# 2. Create the Row Key (Combining Country, Date, and ID to make it unique)
# We use # as a separator so we can split it later if needed
df['row_key'] = df['COUNTRY'] + "#" + df['WEEK'] + "#" + df['ID'].astype(str)

# 3. Move 'row_key' to the very first column position
cols = ['row_key'] + [c for c in df.columns if c != 'row_key']
df = df[cols]

# 4. Save it as data.csv
df.to_csv('data.csv', index=False)
print("Done! First column is now row_key.")