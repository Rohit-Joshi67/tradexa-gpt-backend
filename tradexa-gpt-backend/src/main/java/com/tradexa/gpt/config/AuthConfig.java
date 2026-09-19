package com.tradexa.gpt.config;

import com.tradexa.gpt.copilot.LlmProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({EmailProperties.class, AuthProperties.class, LlmProperties.class})
public class AuthConfig {
}
