import { AutoTokenizer, AutoModelForCausalLM, env, Tensor } from '@huggingface/transformers';

// Tell transformers.js to load from the local public/models directory
env.allowLocalModels = true;
env.useBrowserCache = false;
env.allowRemoteModels = false;
env.localModelPath = '/models/';

let tokenizer: any = null;
let model: any = null;
const modelId = 'Xenova/LaMini-GPT-124M';

self.addEventListener('message', async (event) => {
    const { action, text, max_new_tokens = 30 } = event.data;

    if (action === 'load') {
        try {
            if (!tokenizer) {
                tokenizer = await AutoTokenizer.from_pretrained(modelId, {
                    progress_callback: (x: any) => self.postMessage({ status: 'progress', type: 'tokenizer', ...x })
                });
            }
            if (!model) {
                model = await AutoModelForCausalLM.from_pretrained(modelId, {
                    dtype: 'fp32', // Matches decoder_model_merged_quantized.onnx directly without adding suffix
                    model_file_name: 'decoder_model_merged_quantized',
                    progress_callback: (x: any) => self.postMessage({ status: 'progress', type: 'model', ...x })
                });
            }
            self.postMessage({ status: 'ready' });
        } catch (e) {
            console.error('[WORKER LOAD ERROR]', e);
            self.postMessage({ status: 'error', error: String(e) });
        }
    } 
    
    else if (action === 'generate') {
        if (!tokenizer || !model) return;
        
        try {
            let prompt = text;
            if (modelId.includes('LaMini')) {
                prompt = `Below is an instruction that describes a task. Write a response that appropriately completes the request.\n\n### Instruction:\n${text}\n\n### Response:\n`;
            }
            const inputs = tokenizer(prompt);
            
            const initialTokens = Array.from(inputs.input_ids.data);
            const initialDecoded = initialTokens.map((id: any) => tokenizer.decode([id]));
            
            self.postMessage({ 
                status: 'init_context', 
                tokens: initialTokens.map((id: any, i: number) => ({ id, text: initialDecoded[i] }))
            });

            let input_ids = inputs.input_ids;
            let attention_mask = inputs.attention_mask;
            
            for (let i = 0; i < max_new_tokens; i++) {
                // 1. Run forward pass
                const outputs = await model({ input_ids, attention_mask });
                
                // 2. Extract logits for the last token
                const seq_len = outputs.logits.dims[1];
                const vocab_size = outputs.logits.dims[2];
                const last_logits = outputs.logits.data.slice((seq_len - 1) * vocab_size, seq_len * vocab_size);
                
                // 3. Apply Temperature and Compute Softmax
                const temperature = 0.7; // Adds creativity to prevent infinite loops
                let max_val = -Infinity;
                for (let j = 0; j < vocab_size; j++) {
                    last_logits[j] /= temperature;
                    if (last_logits[j] > max_val) max_val = last_logits[j];
                }
                
                let sum = 0;
                const probs = new Float32Array(vocab_size);
                for (let j = 0; j < vocab_size; j++) {
                    probs[j] = Math.exp(last_logits[j] - max_val);
                    sum += probs[j];
                }
                for (let j = 0; j < vocab_size; j++) {
                    probs[j] /= sum;
                }
                
                // 4. Extract Top-K (K=40) for Sampling Pool
                const K = 40;
                const topK = [];
                for (let j = 0; j < vocab_size; j++) {
                    if (topK.length < K) {
                        topK.push({ id: j, prob: probs[j] });
                        topK.sort((a, b) => b.prob - a.prob);
                    } else if (probs[j] > topK[K - 1].prob) {
                        topK[K - 1] = { id: j, prob: probs[j] };
                        topK.sort((a, b) => b.prob - a.prob);
                    }
                }
                
                // 5. Normalize Top-K Probabilities and Sample
                let topKSum = 0;
                for (let j = 0; j < K; j++) topKSum += topK[j].prob;
                
                let r = Math.random() * topKSum;
                let cumulative = 0;
                let next_token_id = topK[0].id;
                for (let j = 0; j < K; j++) {
                    cumulative += topK[j].prob;
                    if (r <= cumulative) {
                        next_token_id = topK[j].id;
                        break;
                    }
                }
                
                const decoded = tokenizer.decode([next_token_id]);
                
                // 6. UI Alternatives (Top 5 only)
                const alternatives = topK.slice(0, 5).map(alt => ({
                    token: tokenizer.decode([alt.id]),
                    probability: alt.prob,
                    logProbability: Math.log(alt.prob)
                }));
                
                // 6. Send to UI
                self.postMessage({
                    status: 'chunk',
                    token_id: next_token_id,
                    token_text: decoded,
                    alternatives
                });
                
                // 7. Stop on EOS (GPT-2 eos_token_id is 50256)
                if (next_token_id === 50256) break;
                
                // 8. Update inputs for next iteration
                const new_input_data = new BigInt64Array(input_ids.data.length + 1);
                new_input_data.set(input_ids.data);
                new_input_data[input_ids.data.length] = BigInt(next_token_id);
                
                const new_mask_data = new BigInt64Array(attention_mask.data.length + 1);
                new_mask_data.set(attention_mask.data);
                new_mask_data[attention_mask.data.length] = 1n;
                
                input_ids = new Tensor('int64', new_input_data, [1, input_ids.dims[1] + 1]);
                attention_mask = new Tensor('int64', new_mask_data, [1, attention_mask.dims[1] + 1]);
            }

            self.postMessage({ status: 'complete' });
        } catch (e) {
            console.error('[WORKER GENERATE ERROR]', e);
            self.postMessage({ status: 'error', error: String(e) });
        }
    }
});
