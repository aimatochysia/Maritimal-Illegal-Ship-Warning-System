import requests

url = 'https://gateway.api.globalfishingwatch.org/v2/4wings/report'
params = {
    'spatial-resolution': 'low',
    'temporal-resolution': 'monthly',
    'group-by': 'gearType',
    'datasets[0]': 'public-global-fishing-effort:latest',
    'date-range': '2022-01-01,2022-05-01',
    'format': 'csv'
}
headers = {
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiJJbGxlZ2FsIEZpc2hpbmcgQm9hdCBBbmFseXNlciIsInVzZXJJZCI6MzE3NDcsImFwcGxpY2F0aW9uTmFtZSI6IklsbGVnYWwgRmlzaGluZyBCb2F0IEFuYWx5c2VyIiwiaWQiOjEzNDMsInR5cGUiOiJ1c2VyLWFwcGxpY2F0aW9uIn0sImlhdCI6MTcxMDMwNTM1NywiZXhwIjoyMDI1NjY1MzU3LCJhdWQiOiJnZnciLCJpc3MiOiJnZncifQ.hjAzx39Mt1wIZunhRN6LgJ386Z1rZwcoazHpSnoRYF_oESeoREelVFS22GaXfqeoaI4VaQ_qorf6uHJyUPR4m7Mm7KIl1N6AuVQ8VLcaCRxg0RDLGGCmkBXRv15vVqXkDikIsa9Y3ctslkW3s1AmhinDSZgDCIbDJDHG4-j-iUovroNTRy1YY_wMSfY2lBSqoJdcWxmS3uR8ao5Z7Ag6fwoI_FRXRW59wEghq06M3v5poREs0t8lXuM7yAByg3OYwwHnFU9pGTY2ofbd4stPOqADisqeTkCwG2n68H7kZgCliTX4UYWAgFZWObR_Xn3sC4ZqGI2Oo9Y43Kvn8YWCEqEH75_Ii_eOCX75S-bNKdKeYAuM2u8yHjYNTynAyi4DqNpuAvJo4YLy4PpIQPCNFyy7g72xFUiVoyH0WIXSWH3s9PD3cp_6fquJWmSsGp60LEu3HK7sepovQqn4Z5D9gtLra3UnQSMuzcM6eK-RaruHqb1syvHBOPHkKCghrJRX',  # Replace [TOKEN] with your actual token
    'Content-Type': 'application/json'
}
data = {
    "region": {
        "dataset": "public-eez-areas",
        "id": 8492 #replace with Indonesia region EEZ ID
    }
}

response = requests.post(url, params=params, headers=headers, json=data)

with open('report-indonesia.zip', 'wb') as f:
    f.write(response.content)
