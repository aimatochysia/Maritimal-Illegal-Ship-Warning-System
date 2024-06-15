import requests
import io
import zipfile
import os
import pandas as pd

# Define the URL and parameters
url = 'https://gateway.api.globalfishingwatch.org/v2/4wings/report'
params = {
    'spatial-resolution': 'high',
    'temporal-resolution': 'daily',
    'group-by': 'mmsi',
    'datasets[0]': 'public-global-fishing-effort:latest',
    'date-range': '2022-01-01,2022-02-01',
    'format': 'csv'
}

# Define the headers
headers = {
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiJJbGxlZ2FsIEZpc2hpbmcgQm9hdCBBbmFseXNlciIsInVzZXJJZCI6MzE3NDcsImFwcGxpY2F0aW9uTmFtZSI6IklsbGVnYWwgRmlzaGluZyBCb2F0IEFuYWx5c2VyIiwiaWQiOjEzNDMsInR5cGUiOiJ1c2VyLWFwcGxpY2F0aW9uIn0sImlhdCI6MTcxMDMwNTM1NywiZXhwIjoyMDI1NjY1MzU3LCJhdWQiOiJnZnciLCJpc3MiOiJnZncifQ.hjAzx39Mt1wIZunhRN6LgJ386Z1rZwcoazHpSnoRYF_oESeoREelVFS22GaXfqeoaI4VaQ_qorf6uHJyUPR4m7Mm7KIl1N6AuVQ8VLcaCRxg0RDLGGCmkBXRv15vVqXkDikIsa9Y3ctslkW3s1AmhinDSZgDCIbDJDHG4-j-iUovroNTRy1YY_wMSfY2lBSqoJdcWxmS3uR8ao5Z7Ag6fwoI_FRXRW59wEghq06M3v5poREs0t8lXuM7yAByg3OYwwHnFU9pGTY2ofbd4stPOqADisqeTkCwG2n68H7kZgCliTX4UYWAgFZWObR_Xn3sC4ZqGI2Oo9Y43Kvn8YWCEqEH75_Ii_eOCX75S-bNKdKeYAuM2u8yHjYNTynAyi4DqNpuAvJo4YLy4PpIQPCNFyy7g72xFUiVoyH0WIXSWH3s9PD3cp_6fquJWmSsGp60LEu3HK7sepovQqn4Z5D9gtLra3UnQSMuzcM6eK-RaruHqb1syvHBOPHkKCghrJRX',
    'Content-Type': 'application/json'
}

# Define the data payload
data = {
    "region": {
        "dataset": "public-eez-areas",
        "id": 8492
    }
}

# Make the POST request
response = requests.post(url, headers=headers, params=params, json=data)

# Read the response content as a ZIP file in memory
zip_file = zipfile.ZipFile(io.BytesIO(response.content))

# Extract the CSV file to a pandas DataFrame
for file_name in zip_file.namelist():
    if file_name.endswith('.csv'):
        with zip_file.open(file_name) as csv_file:
            df = pd.read_csv(csv_file)

        # Select only specific columns (1st, 2nd, 3rd, 4th, and 7th columns)
        selected_columns = df.iloc[:, [0, 1, 2, 3, 6]]

        # Fill empty values in column 4 with 0 and convert to integer
        selected_columns.iloc[:, 3] = selected_columns.iloc[:, 3].fillna(0)
        # Save the selected columns to a new CSV file
        selected_columns.to_csv('selected_columns.csv', index=False)
        print(f"Selected columns have been saved to 'selected_columns.csv'.")
        break
