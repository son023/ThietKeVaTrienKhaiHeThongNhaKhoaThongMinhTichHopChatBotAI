package com.auth_service.auth_service.service;

import com.auth_service.auth_service.client.UserServiceClient;
import com.auth_service.auth_service.exceptions.AppException;
import com.auth_service.auth_service.exceptions.enums.ErrorCode;
import com.auth_service.auth_service.model.UserDTO;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthService {

    @NonFinal
    @Value("${privateKey}")
    String privateKey;

    UserServiceClient userServiceClient;

    public ResponseEntity<UserDTO> login(Map<String, String> credentials) {
        try {
            Map<String, String> validationCredentials = Map.of(
                    "username", credentials.get("username"),
                    "password", credentials.get("password") // Plain text password
            );
            
            UserDTO existedUser = userServiceClient.valid(validationCredentials).getBody();
            log.info("User authenticated successfully: {}", existedUser.getUsername());
            String token = this.generate(existedUser);

            return ResponseEntity.ok()
                    .header("Authorization", token)
                    .body(existedUser);

        } catch (Exception e) {
            log.error("Login failed for user: {}", credentials.get("username"), e);
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

    public String generate(UserDTO user) {
        try {
            JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.RS256);
            
            JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                    .issuer("dev")
                    .issueTime(new Date())
                    .expirationTime(new Date(
                            Instant.now()
                                    .plus(1, ChronoUnit.DAYS)
                                    .toEpochMilli()
                    ))
                    .subject(user.getUsername())
                    .claim("user_id", user.getId().toString())
                    .claim("full_name", user.getFullName())
                    .jwtID(UUID.randomUUID().toString());
            
            // Thêm primary_role vào claims
            if (user.getPrimaryRole() != null) {
                claimsBuilder.claim("primary_role", user.getPrimaryRole());
            }
            
            // Thêm profile_id vào claims
            if (user.getProfileId() != null) {
                claimsBuilder.claim("profile_id", user.getProfileId().toString());
            }
            
            // Thêm roles vào claims (nếu cần)
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                claimsBuilder.claim("roles", user.getRoles());
            }
            
            JWTClaimsSet jwtClaimsSet = claimsBuilder.build();

            SignedJWT signedJWT = new SignedJWT(jwsHeader, jwtClaimsSet);
            signedJWT.sign(new RSASSASigner(loadPrivateKey()));

            return signedJWT.serialize();
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNCATEGORIED);
        }
    }

    private RSAPrivateKey loadPrivateKey() throws Exception {
        byte[] encoded = Base64.getDecoder().decode(privateKey);

        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(encoded);

        return (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
    }

}
