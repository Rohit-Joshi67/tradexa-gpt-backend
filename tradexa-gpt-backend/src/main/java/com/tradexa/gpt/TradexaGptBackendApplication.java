package com.tradexa.gpt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TradexaGptBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TradexaGptBackendApplication.class, args);
	}

}
