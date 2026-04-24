import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY;

const MODELS_TO_TEST = [
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "google/gemma-3-12b-it:free",
  "google/gemma-3-4b-it:free",
  "google/gemma-3n-e4b-it:free",
  "google/gemma-3n-e2b-it:free",
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
  "liquid/lfm-2.5-1.2b-thinking:free",
  "nvidia/llama-nemotron-embed-vl-1b-v2:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free"
];

async function testModels() {
  console.log("🔍 Starting Model Diagnostics...\n");
  const working = [];
  const failing = [];

  for (const model of MODELS_TO_TEST) {
    try {
      process.stdout.write(`Testing ${model}... `);
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      console.log("✅ WORKING");
      working.push(model);
    } catch (err) {
      const status = err.response?.status;
      const errorMsg = err.response?.data?.error?.message || err.message;
      console.log(`❌ FAILED (${status || "Timeout"}): ${errorMsg.slice(0, 50)}...`);
      failing.push({ model, error: errorMsg });
    }
  }

  console.log("\n--- FINAL REPORT ---");
  console.log(`\n✅ WORKING MODELS (${working.length}):`);
  working.forEach(m => console.log(` - ${m}`));

  console.log(`\n❌ FAILING MODELS (${failing.length}):`);
  failing.forEach(f => console.log(` - ${f.model}`));
}

testModels();
