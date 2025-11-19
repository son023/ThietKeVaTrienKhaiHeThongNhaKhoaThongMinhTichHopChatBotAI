package com.main_project.labtest_service.config;

import com.thoughtworks.xstream.XStream;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AxonConfig {
    @Autowired
    private XStream xStream;

    @PostConstruct
    public void configureXStreamSecurity(){
        xStream.allowTypesByWildcard(new String[]{ "com.do_an.common.**"});
    }
}