import pandas as pd

# 1. Load the data
df = pd.read_csv('../data.csv', low_memory=False)

# 2. Filter out rows where EVENT_TYPE or SUB_EVENT_TYPE are truly missing
df = df.dropna(subset=['EVENT_TYPE', 'SUB_EVENT_TYPE'])

# 3. Date Formatting
def reformat_date(date_str):
    try:
        parts = str(date_str).split('-')
        if len(parts) == 3:
            # Reorder: Year (2), Month (1), Day (0)
            return f"{parts[2]}-{parts[1]}-{parts[0]}"
        return date_str
    except:
        return date_str

df['WEEK'] = df['WEEK'].apply(reformat_date)

# 4. Update the RowKey to match the new date format
# Old: Algeria#23-October-2004#47.0 -> New: Algeria#2004-October-23#47.0
def update_rowkey(row):
    try:
        parts = str(row['row_key']).split('#')
        if len(parts) == 3:
            return f"{row['COUNTRY']}#{row['WEEK']}#{parts[2]}"
        return row['row_key']
    except:
        return row['row_key']

df['row_key'] = df.apply(update_rowkey, axis=1)

# 5. Save the cleaned data
df.to_csv('../data.csv', index=False)
print("Success! 145k rows processed. Cleaned file: cleaned_data.csv")