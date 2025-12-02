package com.main_project.inventory_service.config;

import com.main_project.inventory_service.aggregate.InventoryAggregate;
import com.thoughtworks.xstream.XStream;
import org.axonframework.eventsourcing.EventSourcingRepository;
import org.axonframework.eventsourcing.eventstore.EventStore;
import org.axonframework.modelling.command.Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AxonConfig {
    @Autowired
    public void configureXStream(XStream xStream) {
        xStream.allowTypesByWildcard(new String[]{
            "com.do_an.**",
            "com.main_project.**"
        });
    }

    @Bean
    public Repository<InventoryAggregate> inventoryAggregateRepository(EventStore eventStore) {
        return EventSourcingRepository.builder(InventoryAggregate.class)
                .eventStore(eventStore)
                .build();
    }
}

