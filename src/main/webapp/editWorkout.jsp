<%@ page import="dev.tylerpac.model.Workout" %>
<jsp:useBean id="workout" class="dev.tylerpac.model.Workout" scope="request" />
<!DOCTYPE html>
<html>
<head>
    <title>Edit Workout</title>
</head>
<body>
<form action="workout_history" method="post">
    <input type="hidden" name="action" value="update">
    <input type="hidden" name="workoutId" value="<%= workout.getWorkoutId() %>">
    <label>Workout Type:</label>
    <input type="text" name="workoutType" value="<%= workout.getWorkoutType() %>" required>
    <label>Workout Name:</label>
    <input type="text" name="workoutName" value="<%= workout.getWorkoutName() %>" required>
    <label>Workout Date:</label>
    <input type="date" name="workoutDate" value="<%= workout.getWorkoutDate() %>" required>
    <!-- Add other fields as necessary -->
    <button type="submit">Update Workout</button>
</form>
</body>
</html>