package com.knowgap.knowgap.repository;

import com.knowgap.knowgap.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByName(String name);
    Optional<Subject> findByNameIgnoreCase(String name);
}
