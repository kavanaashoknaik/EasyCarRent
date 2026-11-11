package com.carrental.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.carrental.exception.BadRequestException;
import com.carrental.exception.ResourceNotFoundException;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "pdf");
    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "application/pdf");

    private final Path licenseDir;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.licenseDir = Paths.get(uploadDir, "licenses").toAbsolutePath().normalize();
    }

    public String storeLicense(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please choose a license file to upload");
        }

        String extension = getExtension(file.getOriginalFilename());
        String contentType = file.getContentType();

        if (!ALLOWED_EXTENSIONS.contains(extension)
                || contentType == null
                || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Only JPG, PNG or PDF files are allowed");
        }

        // We never use the user's file name. A random name is safer.
        String storedName = UUID.randomUUID() + "." + extension;

        try {
            Files.createDirectories(licenseDir);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, licenseDir.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Could not save the uploaded file", ex);
        }

        return storedName;
    }

    public Resource loadAsResource(String storedName) {
        Path file = licenseDir.resolve(storedName).normalize();

        if (!file.startsWith(licenseDir)) {
            throw new BadRequestException("Invalid file name");
        }

        Resource resource = new FileSystemResource(file);
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResourceNotFoundException("License file not found");
        }
        return resource;
    }

    public MediaType detectMediaType(String storedName) {
        String extension = getExtension(storedName);
        return switch (extension) {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "png" -> MediaType.IMAGE_PNG;
            default -> MediaType.IMAGE_JPEG;
        };
    }

    public void deleteQuietly(String storedName) {
        try {
            Path file = licenseDir.resolve(storedName).normalize();
            if (file.startsWith(licenseDir)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException ex) {
            // If an old file cannot be deleted, we simply leave it. It is not an error for the user.
        }
    }

    private String getExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int dot = filename.lastIndexOf('.');
        return (dot < 0) ? "" : filename.substring(dot + 1).toLowerCase();
    }
}
