package com.example.carrentalbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
public class RateLimitService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration BLOCK_DURATION = Duration.ofMinutes(15);

    public boolean isBlocked(String key) {
        try {
            String blockKey = "blocked:" + key;
            return Boolean.TRUE.equals(redisTemplate.hasKey(blockKey));
        } catch (Exception e) {
            return false;
        }
    }

    public void recordFailedAttempt(String key) {
        try {
            String attemptKey = "attempts:" + key;
            Long attempts = redisTemplate.opsForValue().increment(attemptKey);

            if (attempts == 1) {
                redisTemplate.expire(attemptKey, Duration.ofMinutes(15));
            }

            if (attempts >= MAX_ATTEMPTS) {
                String blockKey = "blocked:" + key;
                redisTemplate.opsForValue().set(blockKey, "blocked", BLOCK_DURATION);
                redisTemplate.delete(attemptKey);
            }
        } catch (Exception e) {
            // Redis unavailable, skip rate limiting
        }
    }

    public void resetAttempts(String key) {
        try {
            String attemptKey = "attempts:" + key;
            redisTemplate.delete(attemptKey);
        } catch (Exception e) {
            // Redis unavailable, skip
        }
    }

    public Long getRemainingAttempts(String key) {
        try {
            String attemptKey = "attempts:" + key;
            Long attempts = (Long) redisTemplate.opsForValue().get(attemptKey);
            return attempts == null ? Long.valueOf(MAX_ATTEMPTS) : MAX_ATTEMPTS - attempts;
        } catch (Exception e) {
            return Long.valueOf(MAX_ATTEMPTS);
        }
    }
}
