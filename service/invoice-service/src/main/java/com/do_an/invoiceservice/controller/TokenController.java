package com.do_an.invoiceservice.controller;


import org.axonframework.eventhandling.TrackingToken;
import org.axonframework.eventhandling.tokenstore.TokenStore;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class TokenController {

    private final TokenStore tokenStore;

    public TokenController(TokenStore tokenStore) {
        this.tokenStore = tokenStore;
    }

    /**
     * Lấy token của một processor cụ thể và segment
     */
    @GetMapping("/axon/token/{processor}/{segment}")
    @Transactional
    public Map<String, Object> getToken(
            @PathVariable String processor,
            @PathVariable int segment
    ) {
        TrackingToken token = tokenStore.fetchToken(processor, segment);

        Map<String, Object> result = new HashMap<>();
        if (token != null) {
            result.put("processor", processor);
            result.put("segment", segment);
            result.put("tokenClass", token.getClass().getSimpleName());
            result.put("token", token.toString());
        } else {
            result.put("processor", processor);
            result.put("segment", segment);
            result.put("token", "null");
        }

        return result;
    }
}

