package com.main_project.notification_service.configuration;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String TICKET_SUMARY_TOPIC = "ticket-sumary";

    @Bean
    public NewTopic ticketSumaryTopic() {
        return TopicBuilder.name(TICKET_SUMARY_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}