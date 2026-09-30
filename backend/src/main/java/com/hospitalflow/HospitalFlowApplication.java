package com.hospitalflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HospitalFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalFlowApplication.class, args);
    }
}
