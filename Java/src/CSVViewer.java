import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class CSVViewer extends JFrame {
    private static final String URL_STRING = "https://gateway.api.globalfishingwatch.org/v2/4wings/report";
    private static final String AUTH_TOKEN = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiJJbGxlZ2FsIEZpc2hpbmcgQm9hdCBBbmFseXNlciIsInVzZXJJZCI6MzE3NDcsImFwcGxpY2F0aW9uTmFtZSI6IklsbGVnYWwgRmlzaGluZyBCb2F0IEFuYWx5c2VyIiwiaWQiOjEzNDMsInR5cGUiOiJ1c2VyLWFwcGxpY2F0aW9uIn0sImlhdCI6MTcxMDMwNTM1NywiZXhwIjoyMDI1NjY1MzU3LCJhdWQiOiJnZnciLCJpc3MiOiJnZncifQ.hjAzx39Mt1wIZunhRN6LgJ386Z1rZwcoazHpSnoRYF_oESeoREelVFS22GaXfqeoaI4VaQ_qorf6uHJyUPR4m7Mm7KIl1N6AuVQ8VLcaCRxg0RDLGGCmkBXRv15vVqXkDikIsa9Y3ctslkW3s1AmhinDSZgDCIbDJDHG4-j-iUovroNTRy1YY_wMSfY2lBSqoJdcWxmS3uR8ao5Z7Ag6fwoI_FRXRW59wEghq06M3v5poREs0t8lXuM7yAByg3OYwwHnFU9pGTY2ofbd4stPOqADisqeTkCwG2n68H7kZgCliTX4UYWAgFZWObR_Xn3sC4ZqGI2Oo9Y43Kvn8YWCEqEH75_Ii_eOCX75S-bNKdKeYAuM2u8yHjYNTynAyi4DqNpuAvJo4YLy4PpIQPCNFyy7g72xFUiVoyH0WIXSWH3s9PD3cp_6fquJWmSsGp60LEu3HK7sepovQqn4Z5D9gtLra3UnQSMuzcM6eK-RaruHqb1syvHBOPHkKCghrJRX";

    private GeoJsonCanvas canvas;
    private String geoJsonContent;

    public CSVViewer() {
        setTitle("GeoJSON Viewer");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        canvas = new GeoJsonCanvas();
        getContentPane().add(canvas, BorderLayout.CENTER);

        JButton downloadButton = new JButton("Download GeoJSON");
        downloadButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                downloadGeoJson();
            }
        });
        getContentPane().add(downloadButton, BorderLayout.SOUTH);
    }

    private void downloadGeoJson() {
        SwingWorker<Void, Void> worker = new SwingWorker<>() {
            @Override
            protected Void doInBackground() {
                try {
                    String params = "spatial-resolution=low&temporal-resolution=monthly&group-by=gearType&datasets[0]=public-global-fishing-effort:latest&date-range=2022-01-01,2022-05-01&format=csv";
                    String payload = "{\"region\":{\"dataset\":\"public-eez-areas\",\"id\":8492}}";
                    URL url = new URL(URL_STRING + "?" + params);
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    connection.setRequestMethod("POST");
                    connection.setRequestProperty("Authorization", AUTH_TOKEN);
                    connection.setRequestProperty("Content-Type", "application/json");
                    connection.setDoOutput(true);

                    try (OutputStream os = connection.getOutputStream()) {
                        byte[] input = payload.getBytes("utf-8");
                        os.write(input, 0, input.length);
                    }

                    if (connection.getResponseCode() != 200) {
                        throw new RuntimeException("Failed : HTTP error code : " + connection.getResponseCode());
                    }

                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    try (InputStream is = connection.getInputStream()) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = is.read(buffer)) != -1) {
                            baos.write(buffer, 0, len);
                        }
                    }

                    geoJsonContent = extractGeoJsonFromZip(new ByteArrayInputStream(baos.toByteArray()));
                    canvas.setGeoJsonContent(geoJsonContent);
                    canvas.repaint();
                } catch (Exception e) {
                    e.printStackTrace();
                    SwingUtilities.invokeLater(() -> {
                        JOptionPane.showMessageDialog(CSVViewer.this, "An error occurred: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
                    });
                }
                return null;
            }
        };
        worker.execute();
    }

    private String extractGeoJsonFromZip(InputStream zipStream) throws IOException {
        String geoJsonContent = null;
        try (ZipInputStream zipInputStream = new ZipInputStream(zipStream)) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                if (entry.getName().endsWith(".geojson")) {
                    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zipInputStream.read(buffer)) > 0) {
                        outputStream.write(buffer, 0, len);
                    }
                    geoJsonContent = outputStream.toString("utf-8");
                    zipInputStream.closeEntry();
                    break;
                }
            }
        }
        return geoJsonContent != null ? geoJsonContent : "No GeoJSON file found in the ZIP.";
    }
}

class GeoJsonCanvas extends Canvas {
    private String geoJsonContent;

    public void setGeoJsonContent(String geoJsonContent) {
        this.geoJsonContent = geoJsonContent;
    }

    @Override
    public void paint(Graphics g) {
        super.paint(g);

        if (geoJsonContent != null) {
            Graphics2D g2d = (Graphics2D) g;

            // Define colors for rendering
            Color fillColor = new Color(30, 144, 255); // Dodger Blue

            // Parse GeoJSON content
            String[] lines = geoJsonContent.split("\n");
            for (String line : lines) {
                if (line.trim().startsWith("\"coordinates\":")) {
                    String coordsStr = line.trim().replace("\"coordinates\":", "").replace("[[", "").replace("]]", "");
                    String[] points = coordsStr.split("],\\[");
                    for (String point : points) {
                        String[] coord = point.split(",");
                        int x = (int) Double.parseDouble(coord[0]);
                        int y = (int) Double.parseDouble(coord[1]);
                        System.out.println(x);
                        // Draw a small circle for each point
                        g2d.setColor(fillColor);
                        g2d.fillOval(x, y, 3, 3);
                    }
                }
            }
        }
    }
}
