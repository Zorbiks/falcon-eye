import pandas as pd


df_africa = pd.read_csv('./africa_data.csv')
df_meast = pd.read_csv('./middleeast_data.csv')


combined_df = pd.concat([df_africa, df_meast], ignore_index=True)


combined_df.to_csv('combined_falcon_data.csv', index=False)
print(f"Total rows: {len(combined_df)}")