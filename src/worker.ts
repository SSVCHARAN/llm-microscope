import { AutoTokenizer, AutoModelForCausalLM, env } from '@huggingface/transformers';

// Tell transformers.js to load from the local public/models directory!
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = '/models/'; // This points to localhost:5173/models/

let tokenizer: any = null;
let model: any = null;
const modelId = 'Xenova/gpt2';

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
                    model_file_name: 'decoder_model_merged_quantized',
                    progress_callback: (x: any) => self.postMessage({ status: 'progress', type: 'model', ...x })
                });
            }
            self.postMessage({ status: 'ready' });
        } catch (e) {
            self.postMessage({ status: 'error', error: String(e) });
        }
    } 
    
    else if (action === 'generate') {
        if (!tokenizer || !model) return;
        
        try {
            const prompt = text;
            const inputs = tokenizer(prompt);
            
            const initialTokens = Array.from(inputs.input_ids.data);
            const initialDecoded = initialTokens.map((id: any) => tokenizer.decode([id]));
            
            self.postMessage({ 
                status: 'init_context', 
                tokens: initialTokens.map((id: any, i: number) => ({ id, text: initialDecoded[i] }))
            });

            let tokenCount = 0;
            const output = await model.generate({
                ...inputs,
                max_new_tokens,
                temperature: 0.1,
                do_sample: true,
                callback_function: (beams: any) => {
                    const token_id = beams[0].output_token_ids[beams[0].output_token_ids.length - 1];
                    const decoded = tokenizer.decode([token_id]);
                    self.postMessage({
                        status: 'chunk',
                        token_id,
                        token_text: decoded
                    });
                    tokenCount++;
                }
            });

            self.postMessage({ status: 'complete' });
        } catch (e) {
            self.postMessage({ status: 'error', error: String(e) });
        }
    }
});
