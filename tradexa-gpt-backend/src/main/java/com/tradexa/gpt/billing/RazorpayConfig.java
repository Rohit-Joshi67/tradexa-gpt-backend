package com.tradexa.gpt.billing;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(RazorpayProperties.class)
public class RazorpayConfig {

    @Bean
    public RazorpayClient razorpayClient(RazorpayProperties properties) throws RazorpayException {
        // The client is always created; BillingService refuses to act until
        // real keys are configured (503 with a clear message).
        String keyId = properties.getKeyId() == null ? "" : properties.getKeyId();
        String keySecret = properties.getKeySecret() == null ? "" : properties.getKeySecret();
        return new RazorpayClient(keyId, keySecret);
    }
}
