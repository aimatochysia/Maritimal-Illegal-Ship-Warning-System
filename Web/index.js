const fetch = require('node-fetch');
const fs = require('fs');
const unzipper = require('unzipper');
const csv = require('csv-parser');

const url = 'https://gateway.api.globalfishingwatch.org/v2/4wings/report';
const params = new URLSearchParams({
    'spatial-resolution': 'low',
    'temporal-resolution': 'monthly',
    'group-by': 'gearType',
    'datasets[0]': 'public-global-fishing-effort:latest',
    'date-range': '2022-01-01,2022-05-01',
    'format': 'zip' // Requesting zip format
});

const headers = {
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiJJbGxlZ2FsIEZpc2hpbmcgQm9hdCBBbmFseXNlciIsInVzZXJJZCI6MzE3NDcsImFwcGxpY2F0aW9uTmFtZSI6IklsbGVnYWwgRmlzaGluZyBCb2F0IEFuYWx5c2VyIiwiaWQiOjEzNDMsInR5cGUiOiJ1c2VyLWFwcGxpY2F0aW9uIn0sImlhdCI6MTcxMDMwNTM1NywiZXhwIjoyMDI1NjY1MzU3LCJhdWQiOiJnZnciLCJpc3MiOiJnZncifQ.hjAzx39Mt1wIZunhRN6LgJ386Z1rZwcoazHpSnoRYF_oESeoREelVFS22GaXfqeoaI4VaQ_qorf6uHJyUPR4m7Mm7KIl1N6AuVQ8VLcaCRxg0RDLGGCmkBXRv15vVqXkDikIsa9Y3ctslkW3s1AmhinDSZgDCIbDJDHG4-j-iUovroNTRy1YY_wMSfY2lBSqoJdcWxmS3uR8ao5Z7Ag6fwoI_FRXRW59wEghq06M3v5poREs0t8lXuM7yAByg3OYwwHnFU9pGTY2ofbd4stPOqADisqeTkCwG2n68H7kZgCliTX4UYWAgFZWObR_Xn3sC4ZqGI2Oo9Y43Kvn8YWCEqEH75_Ii_eOCX75S-bNKdKeYAuM2u8yHjYNTynAyi4DqNpuAvJo4YLy4PpIQPCNFyy7g72xFUiVoyH0WIXSWH3s9PD3cp_6fquJWmSsGp60LEu3HK7sepovQqn4Z5D9gtLra3UnQSMuzcM6eK-RaruHqb1syvHBOPHkKCghrJRX',  // Replace with your actual token
    'Content-Type': 'application/json'
};

const data = {
    region: {
        dataset: 'public-eez-areas',
        id: 8492  // Replace with Indonesia region EEZ ID
    }
};
console.log("before fetch");
fetch(`${url}?${params}`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
})
console.log("after fetch");
    .then(response => {
        const zipStream = response.body.pipe(unzipper.Parse());
        zipStream.on('entry', entry => {
            if (entry.type === 'File' && entry.path.endsWith('.csv')) {
                const rows = [];
                entry.pipe(csv())
                    .on('data', row => {
                        rows.push(row);
                    })
                    .on('end', () => {
                        displayCSVData(rows);
                    });
            } else {
                entry.autodrain();
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });

function displayCSVData(data) {
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');

    // Create header row
    for (let header in data[0]) {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Create data rows
    data.forEach(rowData => {
        const row = document.createElement('tr');
        for (let value of Object.values(rowData)) {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        }
        table.appendChild(row);
    });

    // Display table on the webpage
    document.body.appendChild(table);
}
