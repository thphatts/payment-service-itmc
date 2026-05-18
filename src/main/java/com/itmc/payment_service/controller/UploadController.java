package com.itmc.payment_service.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/uploads")
@CrossOrigin(origins = "*")
public class UploadController {

    private final Path rootLocation = Paths.get("uploads");

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, contentType)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "File is empty"));
        }
        try {
            java.io.File dir = new java.io.File(rootLocation.toString());
            if (!dir.exists()) dir.mkdirs();

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = java.util.UUID.randomUUID().toString() + extension;
            
            Path filePath = rootLocation.resolve(filename);
            Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            // Return relative path, which can be used by frontend
            String fileUrl = "http://localhost:8080/api/v1/uploads/" + filename;
            return ResponseEntity.ok(java.util.Map.of("url", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("message", "Could not upload file: " + e.getMessage()));
        }
    }
}
