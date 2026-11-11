package com.carrental.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.dto.MessageResponse;

@RestController
public class PingController {

    @GetMapping("/api/public/ping")
    public MessageResponse publicPing() {
        return new MessageResponse("Public endpoint works. No login needed.");
    }

    @GetMapping("/api/customer/ping")
    public MessageResponse customerPing() {
        return new MessageResponse("Hello Customer! Your token works.");
    }

    @GetMapping("/api/admin/ping")
    public MessageResponse adminPing() {
        return new MessageResponse("Hello Admin! Your token works.");
    }
}