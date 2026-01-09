package com.main_project.api_gateway.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/booking-websocket/**",
                                "/booking-websocket/info",
                                "/booking-websocket/info/**",
                                "/booking-websocket/websocket/**",
                                "/booking-websocket/sockjs-websocket/**").permitAll()
                        .pathMatchers("/auth/**").permitAll()
                       .pathMatchers("/users/register").permitAll()
                        .pathMatchers("/chatbot-service/**").permitAll()
                        .pathMatchers("/doctor-service/doctors/**").permitAll()
                        .pathMatchers("/user-service/users/**").permitAll()
                        .anyExchange().permitAll()
                )
                .build();
    }
}