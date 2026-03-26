package com.knowgap.knowgap.controller;

import com.knowgap.knowgap.model.Topic;
import com.knowgap.knowgap.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    @Autowired
    private TopicRepository topicRepository;

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Topic>> getTopicsBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(topicRepository.findBySubjectId(subjectId));
    }

    @PostMapping
    public ResponseEntity<Topic> addTopic(@RequestBody Topic topic) {
        return ResponseEntity.ok(topicRepository.save(topic));
    }
}
