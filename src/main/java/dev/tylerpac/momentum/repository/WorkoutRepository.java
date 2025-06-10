package dev.tylerpac.momentum.repository;

import dev.tylerpac.momentum.model.Workout;
import dev.tylerpac.momentum.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findByUser(Users user);
    Workout findFirstByUserOrderByIdDesc(Users user);


}
