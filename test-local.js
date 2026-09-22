import { AutoModelForCausalLM, env } from '@huggingface/transformers';
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = './public/models/';
async function test() {
  try {
    const model = await AutoModelForCausalLM.from_pretrained('Xenova/gpt2', { model_file_name: 'decoder_model_merged_quantized' });
    console.log("Success local load!");
  } catch(e) {
    console.error("Failed local load:", e);
  }
}
test();
