package dev.tylerpac.momentum.repository;

import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.model.Workout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout, Integer> {
    long countByUser(Users user);

    List<Workout> findByUserOrderByWorkoutDateDesc(Users user);

    Optional<Workout> findFirstByUserOrderByWorkoutDateDesc(Users user);

    Optional<Workout> findFirstByUserAndWorkoutNameOrderByWorkoutDateDescWorkoutIdDesc(Users user, String workoutName);

    List<Workout> findByUserAndWorkoutTypeAndWorkoutNameOrderByWorkoutDateAsc(Users user, String workoutType, String workoutName);

    @Query("select w from Workout w where w.user = :user " +
           "and (:search is null or lower(w.workoutName) like lower(concat('%', :search, '%'))) " +
           "and (:workoutType is null or w.workoutType = :workoutType) " +
           "and (:dateFrom is null or w.workoutDate >= :dateFrom) " +
           "and (:dateTo is null or w.workoutDate <= :dateTo)")
    Page<Workout> findHistoryFiltered(
            @Param("user") Users user,
            @Param("search") String search,
            @Param("workoutType") String workoutType,
            @Param("dateFrom") Date dateFrom,
            @Param("dateTo") Date dateTo,
            Pageable pageable
    );

    @Query("select distinct w.workoutName from Workout w where w.user = :user and w.workoutName is not null order by w.workoutName")
    List<String> findDistinctWorkoutNamesByUser(@Param("user") Users user);

    @Query("select distinct w.workoutType, w.workoutName from Workout w where w.user = :user and w.workoutType is not null and w.workoutName is not null")
    List<Object[]> findDistinctTypeNamePairsByUser(@Param("user") Users user);
}

