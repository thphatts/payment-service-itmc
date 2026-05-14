package com.itmc.payment_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import java.io.BufferedReader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoogleSheetsService {
    private static final String SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1LDNTHP3Wne0wSw4xCT4ssvKbjl1o0yQKCZeM85-5M0M/export?format=csv&gid=0";
    
    private final RestTemplate restTemplate;

    public GoogleSheetsService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
    }

    public boolean isStudentValid(String studentId) {
        System.out.println("Validating studentId: " + studentId);
        try {
            String csvData = restTemplate.getForObject(SPREADSHEET_URL, String.class);
            if (csvData == null) return false;

            BufferedReader reader = new BufferedReader(new StringReader(csvData));
            String line;
            while ((line = reader.readLine()) != null) {
                String[] columns = line.split(",");
                if (columns.length >= 3) {
                    String mssv = columns[2].trim().replaceAll("\"", "");
                    if (mssv.equalsIgnoreCase(studentId)) {
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error reading Google Sheet: " + e.getMessage());
        }
        return false;
    }

    public List<String[]> getAllStudents() {
        List<String[]> students = new ArrayList<>();
        try {
            String csvData = restTemplate.getForObject(SPREADSHEET_URL, String.class);
            if (csvData == null) return students;

            BufferedReader reader = new BufferedReader(new StringReader(csvData));
            String line;
            while ((line = reader.readLine()) != null) {
                String[] columns = line.split(",");
                if (columns.length >= 3) {
                    students.add(columns);
                }
            }
        } catch (Exception e) {
            System.err.println("Error reading Google Sheet: " + e.getMessage());
        }
        return students;
    }
}
