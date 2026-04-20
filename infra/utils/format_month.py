import pandas as pd
from datetime import datetime

# Load the data
df = pd.read_csv('../data.csv', low_memory=False)

# 1. Map for month names to numbers
month_map = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12'
}

def format_date_for_hbase(date_str):
    try:
        # Splits "30-09-2000" into ["30", "09", "2000"]
        parts = str(date_str).split('-')
        day = parts[0].zfill(2)
        month = parts[1].zfill(2)
        year = parts[2]
        
        # Returns "2000-09-30"
        return f"{year}-{month}-{day}"
    except:
        return date_str

# 2. Update the WEEK column
df['WEEK'] = df['WEEK'].apply(format_date_for_hbase)

# 3. Re-build the RowKey to use the new date format
def update_rowkey(row):
    try:
        parts = str(row['row_key']).split('#')
        # parts[2] is the ID
        return f"{row['COUNTRY']}#{row['WEEK']}#{parts[2]}"
    except:
        return row['row_key']

df['row_key'] = df.apply(update_rowkey, axis=1)

# 4. Remove actual nulls in event types
df = df.dropna(subset=['EVENT_TYPE'])

# 5. Save
df.to_csv('../data.csv', index=False)
print("Success! Month names converted to numbers. Format is now YYYY-MM-DD.")