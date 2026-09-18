import { AutoTokenizer } from '@huggingface/transformers';
async function test() {
  try {
    const tokenizer = await AutoTokenizer.from_pretrained('Xenova/Qwen1.5-0.5B-Chat');
    console.log("Success Qwen1.5-0.5B-Chat!");
  } catch (e) {
    console.error("Failed:", e);
  }
}
test();
