<%@ page import="dev.tylerpac.model.Workout" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="com.google.gson.Gson" %>

<%
  String username = (String) session.getAttribute("username");
  Workout latestWorkout = (Workout) request.getAttribute("latestWorkout");
  List<Workout> workoutDetails = (List<Workout>) request.getAttribute("workoutDetails");
  String jsonGraph1Values = (String) request.getAttribute("jsonGraph1Values");
  String jsonGraph2Values = (String) request.getAttribute("jsonGraph2Values");
  String jsonSortedDates = (String) request.getAttribute("jsonSortedDates");
%>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Momentum - Dashboard</title>
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
  <div class="topbar">
    <!--
        <input type="text" placeholder="Search..." class="search-box">
        -->
    <div class="profile">
      <span class="username"><%= username %></span>  <!-- Still displaying the session username -->
      <img src="${pageContext.request.contextPath}/images/momentum_logo.png" class="profile-pic" alt="Profile">
    </div>
  </div>

  <div class="dashboard-widgets">
    <div class="widget">Workout Name<br><strong><%= latestWorkout != null ? latestWorkout.getWorkoutName() : "None" %></strong></div>
    <div class="widget">Workout Type<br><strong><%= latestWorkout != null ? latestWorkout.getWorkoutType() : "None" %></strong></div>
    <div class="widget">Total Workouts<br><strong><%= request.getAttribute("totalWorkouts") %></strong></div>
  </div>



  <div class="form-container">
    <h2>Update Graphs</h2>
    <form action="dashboard" method="post" id="updateWorkoutForm">
      <label for="workoutType">Workout Type:</label>
      <select id="workoutType" name="workoutType" onchange="updateWorkoutNames()" required>
        <option value="">Select Workout Type</option>
        <option value="Cardio" <%= "Cardio".equals(request.getParameter("workoutType")) ? "selected" : "" %>>Cardio</option>
        <option value="Weightlifting" <%= "Weightlifting".equals(request.getParameter("workoutType")) ? "selected" : "" %>>Weightlifting</option>
      </select>

      <label for="workoutName">Workout Name:</label>
      <select id="workoutName" name="workoutName" required>
        <option value="">Select Workout Name</option>
      </select>

      <button type="submit" class="btn-create">Update</button>

      <script>
        // Preloaded workout data from the server (retrieved dynamically in JSP)
        const workoutData = {
          <%
            // Fetch the data for all workout types from the database
            Map<String, List<String>> workoutMap = (Map<String, List<String>>) request.getAttribute("workoutMap");
            for (Map.Entry<String, List<String>> entry : workoutMap.entrySet()) {
              String workoutType = entry.getKey();
              List<String> workoutNames = entry.getValue();

              // Render JavaScript-compatible JSON
          %>
          "<%= workoutType %>": <%= new Gson().toJson(workoutNames) %>,
          <% } %>
        };

        function updateWorkoutNames() {
          const workoutTypeSelect = document.getElementById('workoutType');
          const workoutNameSelect = document.getElementById('workoutName');

          // Get the selected workout type
          const selectedWorkoutType = workoutTypeSelect.value;

          // Clear existing options in the workoutName dropdown
          workoutNameSelect.innerHTML = '<option value="">Select Workout Name</option>';

          // Populate the dropdown with workout names corresponding to the selected type
          if (selectedWorkoutType && workoutData[selectedWorkoutType]) {
            workoutData[selectedWorkoutType].forEach(name => {
              const option = document.createElement('option');
              option.value = name;
              option.textContent = name;
              workoutNameSelect.appendChild(option);
            });
          }
        }
      </script>
    </form>
  </div>







  <div class="dashboard-chart">
    <h2><%= request.getAttribute("workoutType") != null ? request.getAttribute("workoutType") + " - Progress" : "Workouts Progress" %></h2>

    <% if (workoutDetails != null && !workoutDetails.isEmpty()) { %>
    <canvas id="workoutChart1"></canvas>
    <canvas id="workoutChart2"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      // Coordinates and Labels
      const labels = <%= jsonSortedDates %>;
      const graph1Data = <%= jsonGraph1Values %>;
      const graph2Data = <%= jsonGraph2Values %>;

      // Set dynamic graph labels for Cardio/Weightlifting
      let graph1Label = "";
      let graph2Label = "";

      <% if ("Cardio".equals(request.getAttribute("workoutType"))) { %>
      graph1Label = "Time (minutes)";
      graph2Label = "Distance (miles)";
      <% } else if ("Weightlifting".equals(request.getAttribute("workoutType"))) { %>
      graph1Label = "Weight (lbs)";
      graph2Label = "Reps";
      <% } %>

      // Graph 1
      const ctx1 = document.getElementById('workoutChart1').getContext('2d');
      new Chart(ctx1, {
        type: 'line',
        data: {
          labels: labels, // Dates
          datasets: [{
            label: graph1Label,
            data: graph1Data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true } }
        }
      });

      // Graph 2
      const ctx2 = document.getElementById('workoutChart2').getContext('2d');
      new Chart(ctx2, {
        type: 'line',
        data: {
          labels: labels, // Dates
          datasets: [{
            label: graph2Label,
            data: graph2Data,
            borderColor: 'rgba(153, 102, 255, 1)',
            tension: 0.1,
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true } }
        }
      });
    </script>
    <% } else { %>
    <p>No data available for the selected workout.</p>
    <% } %>
  </div>
</div>

</body>
</html>
