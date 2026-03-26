package com.knowgap.knowgap.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowgap.knowgap.payload.request.AiChatRequest;
import com.knowgap.knowgap.payload.response.AiChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class HuggingFaceChatService {

    private static final String PROVIDER = "Hugging Face";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${knowgap.ai.huggingface.token:}")
    private String token;

    @Value("${knowgap.ai.huggingface.model:mistralai/Mistral-7B-Instruct-v0.2}")
    private String model;

    @Value("${knowgap.ai.huggingface.url:https://api-inference.huggingface.co/models}")
    private String baseUrl;

    public HuggingFaceChatService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public AiChatResponse chat(AiChatRequest request) {
        String message = safe(request.getMessage());
        if (message.isBlank()) {
            return new AiChatResponse("Please enter a message to chat.", PROVIDER, model);
        }

        if (safe(token).isBlank()) {
            return new AiChatResponse(
                    "Hugging Face token is not configured. Set knowgap.ai.huggingface.token in application.properties.",
                    PROVIDER,
                    model
            );
        }

        String prompt = buildPrompt(request, message);

        try {
            String requestBody = objectMapper.createObjectNode()
                    .put("inputs", prompt)
                    .set("parameters", objectMapper.createObjectNode()
                            .put("max_new_tokens", 180)
                            .put("temperature", 0.7)
                            .put("return_full_text", false))
                    .toString();

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/" + model))
                    .timeout(Duration.ofSeconds(35))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + token.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                return new AiChatResponse(
                        "Hugging Face API error (" + response.statusCode() + "). Please verify token/model and retry.",
                        PROVIDER,
                        model
                );
            }

            String generated = extractGeneratedText(response.body());
            if (generated.isBlank()) {
                generated = "I could not generate a response right now. Please try again.";
            }

            return new AiChatResponse(generated.trim(), PROVIDER, model);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return new AiChatResponse("Unable to reach Hugging Face right now. Please retry.", PROVIDER, model);
        } catch (IOException ex) {
            return new AiChatResponse("Unable to reach Hugging Face right now. Please retry.", PROVIDER, model);
        }
    }

    private String buildPrompt(AiChatRequest request, String message) {
        String subject = safe(request.getSubjectName());
        String level = safe(request.getCurrentLevel());

        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a concise and practical study tutor.");
        if (!subject.isBlank()) {
            prompt.append(" Subject: ").append(subject).append('.');
        }
        if (!level.isBlank()) {
            prompt.append(" Learner level: ").append(level).append('.');
        }
        prompt.append(" Answer with clear steps and short explanations.\n");
        prompt.append("Student message: ").append(message);

        return prompt.toString();
    }

    private String extractGeneratedText(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);

        if (root.isArray() && !root.isEmpty()) {
            JsonNode first = root.get(0);
            if (first.has("generated_text")) {
                return first.get("generated_text").asText("");
            }
        }

        if (root.isObject()) {
            if (root.has("generated_text")) {
                return root.get("generated_text").asText("");
            }
            if (root.has("error")) {
                return "Hugging Face returned: " + root.get("error").asText();
            }
        }

        return "";
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
