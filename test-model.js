import { AutoTokenizer } from '@huggingface/transformers';
async function test() {
  try {
    const tokenizer = await AutoTokenizer.from_pretrained('Xenova/gpt2');
    console.log("Success GPT-2!");
  } catch (e) {
    console.error("Failed:", e);
  }
}
test();
