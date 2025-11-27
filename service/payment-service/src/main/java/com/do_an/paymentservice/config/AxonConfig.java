package com.do_an.paymentservice.config;

import com.thoughtworks.xstream.XStream;
import org.axonframework.serialization.xml.XStreamSerializer;
import org.springframework.beans.factory.annotation.Autowired;
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
}

