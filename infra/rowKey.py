import pandas as pd


df = pd.read_csv('data.csv')

df['row_key'] = df['COUNTRY'] + "#" + df['WEEK'] + "#" + df['ID'].astype(str)


cols = ['row_key'] + [c for c in df.columns if c != 'row_key']
df = df[cols]


df.to_csv('data.csv', index=False)
print("Done! First column is now row_key.")