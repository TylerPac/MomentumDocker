<%@ page import="dev.tylerpac.momentum.model.Users" %>
<%@ page import="java.util.List" %>
<%@ page import="java.lang.Float" %>
<%@ page import="java.sql.Date" %>
<%
  Users user = (Users) session.getAttribute("user");

  String username = user != null ? user.getUsername() : "Guest";
%>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Momentum - Dashboard</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="dashboard-body">

<div class="sidebar">
  <div class="sidebar-logo">
    <img src="${pageContext.request.contextPath}/images/momentum_logo.png" alt="Logo" class="sidebar-logo-img">
  </div>
  <nav class="sidebar-nav">
    <a href="${pageContext.request.contextPath}/dashboard">Dashboard</a>
    <a href="${pageContext.request.contextPath}/addWorkout">Add Workout</a>

    <a href="#">Progress</a>
    <a href="#">Profile</a>
    <a href="#">Settings</a>
    <div class="logout-form-container">
      <form action="logout" method="get">
        <button type="submit" class="logout-btn">Logout</button>
      </form>
    </div>
  </nav>
</div>

<div class="main-content">
  <div class="topbar">
    <input type="text" placeholder="Search..." class="search-box">
    <div class="profile">
      <span class="username"><%= username %></span>  <!-- Still displaying the session username -->
      <img src="${pageContext.request.contextPath}/images/momentum_logo.png" class="profile-pic" alt="Profile">
    </div>
  </div>

  <div class="dashboard-widgets">
    <div class="widget">Previous Workout<br><strong>5</strong></div>
    <div class="widget">Current Streak<br><strong>5</strong></div>
    <div class="widget">Total Workouts<br><strong>40,689</strong></div>
  </div>

  <div class="dashboard-chart">
    <canvas id="workoutChart" width="400" height="200"></canvas>
    <script>
      async function fetchWorkoutData() {
        try {
          // Step 1: Fetch LAST workout
          const lastWorkoutResponse = await fetch('/workouts/last');
          if (!lastWorkoutResponse.ok) {
            throw new Error("Failed to fetch last workout.");
          }
          const lastWorkout = await lastWorkoutResponse.json();

          if (!lastWorkout || !lastWorkout.workoutName || !lastWorkout.workoutType) {
            document.querySelector('.last-workout-info').innerText = "No last workout available.";
            console.log("Invalid lastWorkout response:", lastWorkout);
            return;
          }


          // Extract workoutName and workoutType from LAST workout
          const { workoutType, workoutName } = lastWorkout;
          console.log("Last workout type and name:", workoutType, workoutName);

          // Step 2: Fetch ALL workout data
          const response = await fetch('/workouts/data');
          if (!response.ok) {
            throw new Error("Failed to fetch all workout data.");
          }
          const workoutData = await response.json();


          // Step 3: Filter data to only include workouts of the same 'name' as the last workout
          const filteredWorkouts = workoutData.filter(workout => workout.workoutName === workoutName);
          if (filteredWorkouts.length === 0) {
            console.log("No matching workouts found.");
            document.querySelector('.last-workout-info').innerText = "No matching workouts found.";
            return;
          }

          // Step 4: Sort filtered workouts by `workoutDate` (ascending)
          filteredWorkouts.sort((a, b) => new Date(a.workoutDate) - new Date(b.workoutDate));


          // Extract dates and appropriate metric (`time` for Cardio, `reps` for Weightlifting)
          const workoutDates = filteredWorkouts.map(workout => workout.workoutDate);
          const workoutMetrics = filteredWorkouts.map(workout => {
            if (workout.workoutType === 'Cardio') {
              return workout.time; // Use time for Cardio
            } else if (workout.workoutType === 'Weightlifting') {
              return workout.reps; // Use reps for Weightlifting
            }
            return 0; // Default for unmatched types
          });

          // Debug log to verify the filtered data
          console.log("Filtered workout dates:", workoutDates);
          console.log("Filtered workout metrics:", workoutMetrics);
          console.log("Filtered workout workoutName:", workoutName);

          // Step 4: Render the chart using filtered data
          renderChart(workoutDates, workoutMetrics, workoutName);


        } catch (error) {
          console.error("Error fetching workout data:", error);
          document.querySelector('.last-workout-info').innerText = "Error fetching data.";
        }

      }


      // Function to render the chart
      function renderChart(labels, data, workoutName) {
        const ctx = document.getElementById('workoutChart').getContext('2d');
        new Chart(ctx, {
          type: 'line', // You can use 'line', 'bar', 'pie', etc.
          data: {
            labels: labels, // X-axis labels (e.g., Dates)
            datasets: [{
              label: workoutName,
              data: data, // Y-axis data (durations or reps)
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              tension: 0.4 // Add curve to the line
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: true // Show legend on the chart
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Date' // Label for X-axis
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Metric (Time / Reps)' // Label for Y-axis
                },
                beginAtZero: true
              }
            }
          }
        });
      }

      // Fetch last workout data and render the chart on page load
      fetchWorkoutData();
    </script>
  </div>
</div>

</body>
</html>
