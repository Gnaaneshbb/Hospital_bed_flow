package com.hospitalflow.controller;

import com.hospitalflow.service.AIServiceClient;
import com.hospitalflow.service.EventSimulatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/simulations")
@CrossOrigin(origins = "*")
public class SimulationController {

    @Autowired
    private EventSimulatorService simulatorService;
    @Autowired
    private AIServiceClient aiServiceClient;

    @PostMapping("/crisis")
    public ResponseEntity<Map<String, Object>> runCrisisScenario() {
        return ResponseEntity.ok(simulatorService.triggerScenario("SURGE_12_EMERGENCY"));
    }

    @PostMapping("/scenario")
    public ResponseEntity<Map<String, Object>> runScenario(@RequestParam String name) {
        return ResponseEntity.ok(simulatorService.triggerScenario(name));
    }

    @PostMapping("/what-if")
    public ResponseEntity<Map<String, Object>> runWhatIfSimulation(@RequestBody Map<String, Object> scenario) {
        return ResponseEntity.ok(aiServiceClient.runWhatIfSimulation(scenario));
    }
}
