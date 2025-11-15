const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const userRoutes = require("./src/routes/userRoutes");
const taskRoutes = require("./src/routes/taskRoutes");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
