package com.main_project.api_gateway.configuration.filter;

import com.main_project.api_gateway.client.AuthServiceClient;
import com.main_project.api_gateway.exceptions.enums.ErrorCode;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jwt.SignedJWT;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements WebFilter {

    @Autowired
    private AuthServiceClient authServiceClient;

    @NonFinal
    @Value("${publicKey}")
    String publicKey;

    private List<String> excludedPaths = List.of(
            "/auth/",
            "/users/register"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        if(true) return chain.filter(exchange);

        for (String excludedPath : excludedPaths) {
            if (path.startsWith(excludedPath)) {
                return chain.filter(exchange);
            }
        }

        if (exchange.getRequest().getMethod().name().equals("OPTIONS")) {
            return chain.filter(exchange);
        }

        List<String> authHeaders = exchange.getRequest().getHeaders().get("Authorization");
//        return chain.filter(exchange);

        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    boolean isValid = validate(token);
                    if (isValid) {
                        return chain.filter(exchange);
                    } else {
                        return sendError(exchange.getResponse(), ErrorCode.UNAUTHENTICATED);
                    }
                } catch (Exception e) {
                    return sendError(exchange.getResponse(), ErrorCode.UNAUTHENTICATED);
                }
            }
        }

        return sendError(exchange.getResponse(), ErrorCode.UNAUTHENTICATED);
    }

    private Mono<Void> sendError(ServerHttpResponse response, ErrorCode errorCode) {
        response.setStatusCode(HttpStatus.valueOf(errorCode.getHttpStatusCode().value()));
        response.getHeaders().add("Content-Type", "application/json");

        String body = String.format(
                "{\"code\": %d, \"message\": \"%s\"}",
                errorCode.getCode(),
                errorCode.getMessage());

        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

    public Boolean validate(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new RSASSAVerifier(loadPublicKey());

            Date expriredTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (!(signedJWT.verify(verifier) && expriredTime.after(new Date()))) {
                return false;
            }
            return true;

        } catch (Exception e) {
            return false;
        }
    }

    private RSAPublicKey loadPublicKey() throws Exception {
        byte[] encoded = Base64.getDecoder().decode(publicKey);

        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);

        return (RSAPublicKey) keyFactory.generatePublic(keySpec);
    }
}

