<%@ page import="dev.tylerpac.model.Workout" %>
<%@ page import="java.util.List" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Workout History</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="dashboard-body">


<div class="sidebar">
    <div class="sidebar-logo">
        <img src="${pageContext.request.contextPath}/images/momentum_logo.png" alt="Logo" class="sidebar-logo-img">
    </div>
    <nav class="sidebar-nav">
        <a href="${pageContext.request.contextPath}/dashboard">Dashboard</a>
        <a href="${pageContext.request.contextPath}/addWorkout">Add Workout</a>

        <a href="${pageContext.request.contextPath}/workout_history">Workout History</a>
        <a href="#">Profile</a>
        <a href="#">Settings</a>
        <div class="logout-form-container">
            <form action="logout" method="post">
                <button type="submit" class="logout-btn">Logout</button>
            </form>
        </div>
    </nav>
</div>

<div class="main-content">
    <%
        String username = (String) session.getAttribute("username");
        // Retrieve the workouts list passed from the servlet
    %>
    <div class="topbar">
        <input type="text" placeholder="Search..." class="search-box">
        <div class="profile">
            <span class="username"><%= username %></span>  <!-- Still displaying the session username -->
            <img src="${pageContext.request.contextPath}/images/momentum_logo.png" class="profile-pic" alt="Profile">
        </div>
    </div>
    <%
        List<Workout> workouts = (List<Workout>) request.getAttribute("workouts");

        // Check if the workouts list exists and contains data
        if (workouts != null && !workouts.isEmpty()) {
    %>

    <div class="Workout-History-Table">
        <h2>Workout History</h2>
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
                        <button type="submit" class="edit-btn">Edit</button>
                    </form>

                    <!-- Delete Button -->
                    <form action="delete-workout" method="post" style="display:inline;">
                        <input type="hidden" name="workoutId" value="<%= workout.getWorkoutId() %>">
                        <button type="submit" class="delete-btn">Delete</button>
                    </form>
                </td>
            </tr>
            <%
                }
            %>
            </tbody>
        </table>
    </div>
<%
} else {
    // Show message when no workouts are available
%>
<p>No workout history available.</p>
<%
}
%>

</body>
</html>
