<%@ page import="dev.tylerpac.model.Workout" %>
<%@ page import="java.util.List" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <title>Workout History</title>
</head>
<body>
<h1>Workout History</h1>

<%
    // Retrieve the workouts list passed from the servlet
    List<Workout> workouts = (List<Workout>) request.getAttribute("workouts");

    // Check if the workouts list exists and contains data
%>if (workouts != null && !workouts.isEmpty()) {

<table>
    <thead>
    <tr>
        <th>Workout ID</th>
        <th>Date</th>
        <th>Workout Type</th>
        <th>Workout Name</th>
        <th>Details</th>
        <th>Actions</th>
    </tr>
    </thead>
    <tbody>
    <%
        // Iterate over the workouts and display the data
        for (Workout workout : workouts) {
    %>
    <tr>
        <td><%= workout.getWorkoutId() %></td>
        <td><%= workout.getWorkoutDate() %></td>
        <td><%= workout.getWorkoutType() %></td>
        <td><%= workout.getWorkoutName() %></td>
        <td>
            <%
                if ("Cardio".equalsIgnoreCase(workout.getWorkoutType())) {
            %>
            Distance: <%= workout.getDistance() %> m, Time: <%= workout.getTime() %> minutes
            <%
            } else if ("Weightlifting".equalsIgnoreCase(workout.getWorkoutType())) {
            %>
            Reps: <%= workout.getReps() %>, Weight: <%= workout.getWeight() %> lbs
            <%
            } else {
            %>
            -
            <%
                }
            %>
        </td>
        <td>
            <!-- Edit Button -->
            <form action="add-edit-workout" method="get" style="display:inline;">
                <input type="hidden" name="workoutId" value="<%= workout.getWorkoutId() %>">
                <button type="submit">Edit</button>
            </form>

            <!-- Delete Button -->
            <form action="delete-workout" method="post" style="display:inline;">
                <input type="hidden" name="workoutId" value="<%= workout.getWorkoutId() %>">
                <button type="submit">Delete</button>
            </form>
        </td>
    </tr>
    <%
        }
    %>
    </tbody>
</table>

} else {
    // Show message when no workouts are available

<p>No workout history available.</p>

}<%
%>

</body>
</html>
