import { AutoModelForCausalLM, env } from '@huggingface/transformers';
import path from 'path';

// Disable remote models and set local path
env.allowRemoteModels = false;
env.localModelPath = path.resolve('./public/models');

console.log('Local model path:', env.localModelPath);

async function main() {
    try {
        console.log('Loading AutoModelForCausalLM from Xenova/gpt2...');
        const model = await AutoModelForCausalLM.from_pretrained('Xenova/gpt2');
        console.log('Model loaded successfully!');
    } catch (e) {
        console.error('Error loading model:', e);
    }
}

main();
