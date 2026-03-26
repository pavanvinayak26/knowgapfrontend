package com.knowgap.knowgap.service;

import com.knowgap.knowgap.model.Question;
import com.knowgap.knowgap.model.Subject;
import com.knowgap.knowgap.model.Topic;
import com.knowgap.knowgap.payload.request.AiTutorRequest;
import com.knowgap.knowgap.payload.response.AiTutorPlanResponse;
import com.knowgap.knowgap.payload.response.AiTutorTopicResponse;
import com.knowgap.knowgap.repository.QuestionRepository;
import com.knowgap.knowgap.repository.SubjectRepository;
import com.knowgap.knowgap.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class AiTutorServiceImpl implements AiTutorService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Override
    @Transactional
    public AiTutorPlanResponse prepareLearningPlan(AiTutorRequest request) {
        String subjectName = normalizeSubject(request.getSubjectName());
        String learnerGoal = defaultIfBlank(request.getLearnerGoal(), "Build complete practical understanding");
        String level = defaultIfBlank(request.getCurrentLevel(), "beginner");
        int topicTarget = clamp(request.getTopicsCount(), 4, 8);
        int questionTarget = clamp(request.getQuestionsPerTopic(), 5, 8);

        Subject subject = subjectRepository.findByNameIgnoreCase(subjectName)
                .orElseGet(() -> {
                    Subject s = new Subject();
                    s.setName(subjectName);
                    s.setDescription(buildSubjectSummary(subjectName, learnerGoal, level));
                    return subjectRepository.save(s);
                });

        if (subject.getDescription() == null || subject.getDescription().isBlank()) {
            subject.setDescription(buildSubjectSummary(subjectName, learnerGoal, level));
            subject = subjectRepository.save(subject);
        }

        Subject subjectRef = subject;
        List<String> topicNames = generateTopicNames(subjectName, learnerGoal, level, topicTarget);
        List<AiTutorTopicResponse> topicResponses = new ArrayList<>();

        int moduleIndex = 1;
        for (String topicName : topicNames) {
            Topic topic = topicRepository.findBySubjectIdAndNameIgnoreCase(subjectRef.getId(), topicName)
                    .orElseGet(() -> {
                        Topic t = new Topic();
                        t.setName(topicName);
                        t.setSubject(subjectRef);
                        return topicRepository.save(t);
                    });

            long existingCount = questionRepository.countByTopicId(topic.getId());
            int toGenerate = questionTarget - (int) existingCount;
            if (toGenerate > 0) {
                List<Question> generated = generateQuestions(subjectName, topicName, learnerGoal, level, moduleIndex, toGenerate);
                for (Question q : generated) {
                    q.setTopic(topic);
                }
                questionRepository.saveAll(generated);
            }

            String overview = buildTopicOverview(topicName, learnerGoal, moduleIndex);
            long finalCount = questionRepository.countByTopicId(topic.getId());
            topicResponses.add(new AiTutorTopicResponse(topic.getId(), topic.getName(), overview, (int) finalCount));
            moduleIndex++;
        }

        String path = buildLearningPath(topicResponses, learnerGoal, level);
        return new AiTutorPlanResponse(subject.getId(), subject.getName(), subject.getDescription(), path, topicResponses);
    }

    private String normalizeSubject(String name) {
        String value = defaultIfBlank(name, "General Studies").trim();
        if (value.length() == 1) {
            return value.toUpperCase(Locale.ROOT);
        }
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
    }

    private String defaultIfBlank(String text, String fallback) {
        return text == null || text.isBlank() ? fallback : text;
    }

    private int clamp(Integer value, int min, int max) {
        if (value == null) {
            return min;
        }
        return Math.max(min, Math.min(max, value));
    }

    private String buildSubjectSummary(String subjectName, String learnerGoal, String level) {
        return "AI-generated learning track for " + subjectName + " (" + level + ") with focus on: " + learnerGoal + ".";
    }

    private String buildTopicOverview(String topicName, String learnerGoal, int moduleIndex) {
        return "Module " + moduleIndex + ": " + topicName + " mapped to learner objective: " + learnerGoal + ".";
    }

    private String buildLearningPath(List<AiTutorTopicResponse> topics, String learnerGoal, String level) {
        StringBuilder sb = new StringBuilder();
        sb.append("Start at ").append(level).append(" level. Goal: ").append(learnerGoal).append(". ");
        sb.append("Recommended sequence: ");
        for (int i = 0; i < topics.size(); i++) {
            if (i > 0) {
                sb.append(" -> ");
            }
            sb.append(topics.get(i).getTopicName());
        }
        sb.append(". After each module, take quiz and revise weak areas.");
        return sb.toString();
    }

    private List<String> generateTopicNames(String subjectName, String learnerGoal, String level, int target) {
        Set<String> topics = new LinkedHashSet<>();
        topics.add(subjectName + " Foundations");
        topics.add("Core Concepts of " + subjectName);
        topics.add(subjectName + " Practical Problem Solving");
        topics.add(subjectName + " Applied Projects");

        String goalLower = learnerGoal.toLowerCase(Locale.ROOT);
        if (goalLower.contains("exam") || goalLower.contains("interview")) {
            topics.add(subjectName + " Interview & Exam Strategy");
        }
        if (goalLower.contains("job") || goalLower.contains("career")) {
            topics.add(subjectName + " Industry Use Cases");
        }

        if ("intermediate".equalsIgnoreCase(level) || "advanced".equalsIgnoreCase(level)) {
            topics.add("Advanced " + subjectName + " Techniques");
        }
        if ("advanced".equalsIgnoreCase(level)) {
            topics.add(subjectName + " Optimization and Expert Patterns");
        }

        topics.addAll(Arrays.asList(
                subjectName + " Troubleshooting",
                subjectName + " Best Practices"
        ));

        List<String> topicList = new ArrayList<>(topics);
        if (topicList.size() > target) {
            return topicList.subList(0, target);
        }
        return topicList;
    }

    private List<Question> generateQuestions(
            String subjectName,
            String topicName,
            String learnerGoal,
            String level,
            int moduleIndex,
            int count
    ) {
        List<Question> questions = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            int type = (i - 1) % 4;
            String text;
            String a;
            String b;
            String c;
            String d;
            String correct;

            if (type == 0) {
                text = "In " + topicName + ", what is the strongest first step for a " + level + " learner?";
                a = "Ignore fundamentals and jump to advanced modules";
                b = "Understand key concepts and map them to simple examples";
                c = "Only memorize definitions";
                d = "Skip practice tasks";
                correct = "B";
            } else if (type == 1) {
                text = "Which approach best supports the goal: " + learnerGoal + "?";
                a = "One-time reading without review";
                b = "Practice, feedback, and topic-wise revision";
                c = "Random topic switching";
                d = "Studying without quizzes";
                correct = "B";
            } else if (type == 2) {
                text = "Which statement is most accurate for module " + moduleIndex + " of " + subjectName + "?";
                a = "Concepts should be learned in progressive sequence";
                b = "The sequence is irrelevant to mastery";
                c = "No need for practical exercises";
                d = "Only final tests matter";
                correct = "A";
            } else {
                text = "What is the most effective way to retain " + topicName + " long-term?";
                a = "Read once and move on";
                b = "Use spaced revision and mixed quizzes";
                c = "Avoid applied questions";
                d = "Rely only on video watching";
                correct = "B";
            }

            Question q = new Question();
            q.setText(text);
            q.setOptionA(a);
            q.setOptionB(b);
            q.setOptionC(c);
            q.setOptionD(d);
            q.setCorrectOption(correct);
            questions.add(q);
        }
        return questions;
    }
}
