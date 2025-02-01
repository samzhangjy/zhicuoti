import { defineConfig } from "@hey-api/openapi-ts";
import { apiConfig } from "./config";

export default defineConfig({
  input: `${apiConfig.baseUrl}/openapi.json`,
  output: "client",
  plugins: ['@hey-api/client-next'],
});
