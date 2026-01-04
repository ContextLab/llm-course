/**
 * Debug script to test GPT bot model loading with Transformers.js v3
 * Tests the EXACT models from gpt-bot.js:
 *   1. DeepSeek-R1-Distill-Qwen-1.5B-ONNX
 *   2. Gemma 3 1B IT
 *   3. Gemma 3 270M IT
 * 
 * Run: node tests/test-gpt-bot-debug.mjs
 */

console.log('=== GPT Bot Debug Test ===');
console.log('Testing exact models from gpt-bot.js\n');

const models = [
    {
        name: 'onnx-community/Qwen2.5-0.5B-Instruct',
        displayName: 'Qwen 2.5 0.5B',
        dtype: 'q4',
    },
    {
        name: 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX',
        displayName: 'DeepSeek-R1 1.5B',
        dtype: 'q4',
    },
    {
        name: 'onnx-community/Qwen2.5-Coder-0.5B-Instruct',
        displayName: 'Qwen 2.5 Coder 0.5B',
        dtype: 'q4',
    }
];

async function testModel(modelConfig, pipeline) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${modelConfig.displayName}`);
    console.log(`Model ID: ${modelConfig.name}`);
    console.log(`Dtype: ${modelConfig.dtype}`);
    console.log('='.repeat(60));
    
    try {
        const startTime = Date.now();
        
        console.log('\n[1] Creating pipeline...');
        const generator = await pipeline('text-generation', modelConfig.name, {
            dtype: modelConfig.dtype,
            progress_callback: (progress) => {
                if (progress.status === 'downloading' || progress.status === 'progress') {
                    const pct = progress.progress || 0;
                    const file = progress.file || 'unknown';
                    process.stdout.write(`\r    Downloading ${file}: ${pct.toFixed(1)}%    `);
                } else if (progress.status === 'loading' || progress.status === 'initiate') {
                    console.log(`    Status: ${progress.status}`);
                } else if (progress.status === 'ready' || progress.status === 'done') {
                    console.log(`    Status: ${progress.status}`);
                }
            }
        });
        
        const loadTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✓ Pipeline created in ${loadTime}s`);
        
        console.log('\n[2] Testing text generation...');
        
        // Test with chat messages format (what gpt-bot.js uses)
        const messages = [
            { role: 'user', content: 'Hello! How are you?' }
        ];
        
        console.log('    Input:', JSON.stringify(messages));
        
        const genStartTime = Date.now();
        const result = await generator(messages, {
            max_new_tokens: 50,
            temperature: 0.7,
            do_sample: true,
            top_k: 40,
            top_p: 0.9,
            repetition_penalty: 1.1
        });
        
        const genTime = ((Date.now() - genStartTime) / 1000).toFixed(1);
        console.log(`    Generation took ${genTime}s`);
        
        console.log('\n[3] Parsing result...');
        console.log('    Result type:', typeof result);
        console.log('    Is array:', Array.isArray(result));
        
        if (result && result[0]) {
            console.log('    result[0] keys:', Object.keys(result[0]));
            
            if (result[0].generated_text) {
                const generated = result[0].generated_text;
                console.log('    generated_text type:', typeof generated);
                console.log('    generated_text is array:', Array.isArray(generated));
                
                let response = '';
                if (Array.isArray(generated)) {
                    console.log('    generated_text length:', generated.length);
                    const lastMessage = generated[generated.length - 1];
                    console.log('    lastMessage:', JSON.stringify(lastMessage));
                    response = lastMessage?.content || '';
                } else {
                    response = generated;
                }
                
                console.log('\n✓ Response extracted:', response.slice(0, 200));
            }
        }
        
        console.log('\n[4] Full result structure:');
        console.log(JSON.stringify(result, null, 2).slice(0, 1000));
        
        // Cleanup
        if (generator.dispose) {
            generator.dispose();
        }
        
        console.log(`\n✓✓✓ ${modelConfig.displayName} WORKS! ✓✓✓`);
        return { success: true, model: modelConfig.displayName };
        
    } catch (error) {
        console.log(`\n✗ FAILED: ${error.message}`);
        console.log('\nFull error:');
        console.log(error);
        if (error.stack) {
            console.log('\nStack trace:');
            console.log(error.stack);
        }
        return { success: false, model: modelConfig.displayName, error: error.message };
    }
}

async function main() {
    console.log('Importing @huggingface/transformers v3...');
    
    try {
        const transformers = await import('@huggingface/transformers');
        console.log('✓ Import successful');
        console.log('  Version info: @huggingface/transformers@3.x');
        
        const { pipeline, env } = transformers;
        
        // Configure environment
        env.allowLocalModels = false;
        
        const results = [];
        
        // Test each model
        for (const model of models) {
            const result = await testModel(model, pipeline);
            results.push(result);
            
            if (result.success) {
                console.log('\n>>> First working model found, stopping tests <<<');
                break;
            }
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY');
        console.log('='.repeat(60));
        for (const r of results) {
            const status = r.success ? '✓ PASS' : '✗ FAIL';
            console.log(`${status}: ${r.model}${r.error ? ` (${r.error.slice(0, 50)}...)` : ''}`);
        }
        
    } catch (error) {
        console.log('✗ Failed to import transformers:', error.message);
        console.log(error);
    }
}

main().catch(console.error);
