import { env } from "./config/env";
import { app } from "./app";

app.listen(env.PORT, () => {
  console.log(`WellGym API listening on http://localhost:${env.PORT}`);
});
