<%@ page import="dev.tylerpac.model.Workout" %>
<jsp:useBean id="workout" class="dev.tylerpac.model.Workout" scope="request" />
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit Workout</title>
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
        <a href="${pageContext.request.contextPath}/settings">Settings</a>
        <div class="logout-form-container">
            <form action="logout" method="post">
                <button type="submit" class="logout-btn">Logout</button>
            </form>
        </div>
    </nav>
</div>

<div class="main-content">
    <div class="form-container">
        <h2>Edit Workout</h2>
        <form action="${pageContext.request.contextPath}/editWorkout" method="post" class="workout-form">

            <!-- Hidden fields -->
            <%--@declare id="workoutname"--%><input type="hidden" name="workoutId" value="<%= workout.getWorkoutId() %>">

            <label>Workout Type:</label>
            <select id="workoutType" name="workoutType" onchange="updateForm()" required>
                <option value="Cardio" <%= "Cardio".equalsIgnoreCase(workout.getWorkoutType()) ? "selected" : "" %>>Cardio</option>
                <option value="Weightlifting" <%= "Weightlifting".equalsIgnoreCase(workout.getWorkoutType()) ? "selected" : "" %>>Weightlifting</option>
            </select>

            <label>Workout Date:</label>
            <input type="date" name="workoutDate" value="<%= workout.getWorkoutDate() != null ? workout.getWorkoutDate().toString() : "" %>" required>

            <label>Workout Name:</label>
            <input type="text" name="workoutName" value="<%= workout.getWorkoutName() != null ? workout.getWorkoutName() : "" %>" placeholder="Enter or pick a name" required>


            <!-- Dynamic fields (metricsSection) -->
            <div id="metricsSection">
                <% if ("Cardio".equalsIgnoreCase(workout.getWorkoutType())) { %>
                <label>Distance (Miles):</label>
                <input type="number" name="distance" step="any" value="<%= workout.getDistance() %>" required>

                <label>Time (Minutes):</label>
                <input type="number" name="time" step="any" value="<%= workout.getTime() %>" required>
                <% } else if ("Weightlifting".equalsIgnoreCase(workout.getWorkoutType())) { %>
                <label>Weight (Pounds):</label>
                <input type="number" name="weight" step="any" value="<%= workout.getWeight() %>" required>

                <label>Reps:</label>
                <input type="number" name="reps" value="<%= workout.getReps() %>" required>
                <% } %>
            </div>

            <button type="submit" class="btn-create">Update Workout</button>
        </form>
    </div>
</div>

<script>
    function updateForm() {
        const type = document.getElementById("workoutType").value;
        const metricsSection = document.getElementById("metricsSection");
        metricsSection.innerHTML = "";  // Clear previous fields

        if (type === "Cardio") {
            metricsSection.innerHTML = `
      <label>Distance (Miles):</label>
      <input type="number" name="distance" step="any" placeholder="Enter distance" required>

      <label>Time (Minutes):</label>
      <input type="number" name="time" step="any" placeholder="Enter time" required>
    `;
        } else if (type === "Weightlifting") {
            metricsSection.innerHTML = `
      <label>Weight (Pounds):</label>
      <input type="number" name="weight" step="any" placeholder="Enter weight" required>

      <label>Reps:</label>
      <input type="number" name="reps" placeholder="Enter reps" required>
    `;
        }
    }
</script>

</body>
</html>