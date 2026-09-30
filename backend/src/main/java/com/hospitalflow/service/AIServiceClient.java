package com.hospitalflow.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIServiceClient {

    @Value("${ai-service.url:http://localhost:8000/api/v1}")
    private String aiServiceUrl;

    @Autowired
    private RuleEngineFallbackService fallbackService;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> orchestrate(Map<String, Object> statePayload) {
        String url = aiServiceUrl + "/orchestrate";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(statePayload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (Map<String, Object>) response.getBody();
            }
        } catch (Exception e) {
            System.err.println("[AIServiceClient] FastAPI AI Service unreachable: " + e.getMessage() + ". Executing Spring Boot Fallback Rule Engine.");
        }
        return fallbackService.executeFallbackRuleEngine(statePayload);
    }

    public Map<String, Object> replan(Map<String, Object> statePayload) {
        String url = aiServiceUrl + "/replan";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(statePayload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (Map<String, Object>) response.getBody();
            }
        } catch (Exception e) {
            System.err.println("[AIServiceClient] FastAPI AI Service unreachable during replan. Running Fallback Rule Engine.");
        }
        return fallbackService.executeFallbackRuleEngine(statePayload);
    }

    public Map<String, Object> runWhatIfSimulation(Map<String, Object> scenarioPayload) {
        String url = aiServiceUrl + "/what-if";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(scenarioPayload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (Map<String, Object>) response.getBody();
            }
        } catch (Exception e) {
            System.err.println("[AIServiceClient] FastAPI AI Service unreachable during what-if. Generating Fallback Simulation Response.");
        }
        return fallbackService.generateFallbackWhatIfResponse(scenarioPayload);
    }
}
