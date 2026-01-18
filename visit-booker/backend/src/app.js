import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import session from "express-session";

const app = express();

app.use(cors());
app.use(express.json());


app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 30,
    },
  })
);
app.use("/api", router);

export default app;
