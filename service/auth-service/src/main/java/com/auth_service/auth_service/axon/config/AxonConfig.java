package com.auth_service.auth_service.axon.config;

import org.axonframework.config.EventProcessingConfigurer;
import org.axonframework.eventhandling.PropagatingErrorHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AxonConfig {

    @Autowired
    public void configure(EventProcessingConfigurer configurer) {
        // Cấu hình error handling cho event processing
        configurer.registerDefaultListenerInvocationErrorHandler(
                configuration -> PropagatingErrorHandler.instance()
        );
    }
}

