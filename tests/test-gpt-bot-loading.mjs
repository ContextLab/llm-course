#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TestRunner {
    constructor(name) {
        this.name = name;
        this.passed = 0;
        this.failed = 0;
        this.errors = [];
    }

    assert(condition, message) {
        if (condition) {
            this.passed++;
            console.log(`  ✓ ${message}`);
        } else {
            this.failed++;
            this.errors.push(message);
            console.log(`  ✗ ${message}`);
        }
    }

    assertEqual(actual, expected, message) {
        const condition = actual === expected;
        if (!condition) {
            message = `${message} (expected: ${expected}, got: ${actual})`;
        }
        this.assert(condition, message);
    }

    summary() {
        console.log(`\n${this.name}: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

async function testGPTBotStructure() {
    const runner = new TestRunner('GPT Bot Structure Tests');
    console.log('\n' + runner.name);
    console.log('='.repeat(50));

    const botPath = join(__dirname, '../demos/chatbot-evolution/js/gpt-bot.js');
    const botCode = readFileSync(botPath, 'utf-8');

    runner.assert(
        botCode.includes('export class GPTBot'),
        'GPTBot class is exported'
    );

    runner.assert(
        botCode.includes('SmolLM2-135M-Instruct'),
        'SmolLM2 135M is configured as smallest model'
    );

    runner.assert(
        botCode.includes('SmolLM2-360M-Instruct'),
        'SmolLM2 360M is configured as medium model'
    );

    runner.assert(
        botCode.includes('SmolLM2-1.7B-Instruct'),
        'SmolLM2 1.7B is configured as largest model'
    );

    runner.assert(
        botCode.includes('@huggingface/transformers@3'),
        'Uses Transformers.js v3'
    );

    runner.assert(
        botCode.includes('dtype: \'q4\''),
        'Uses q4 quantization for smaller model size'
    );

    runner.assert(
        botCode.includes('async loadModel()'),
        'Has loadModel method'
    );

    runner.assert(
        botCode.includes('async getResponse('),
        'Has getResponse method'
    );

    runner.assert(
        botCode.includes('getModelInfo()'),
        'Has getModelInfo method'
    );

    runner.assert(
        botCode.includes('getArchitectureInfo()'),
        'Has getArchitectureInfo method'
    );

    runner.assert(
        botCode.includes('cleanResponse('),
        'Has cleanResponse method'
    );

    runner.assert(
        botCode.includes('for (let i = this.selectedModelIndex; i >= 0; i--)'),
        'Iterates through model fallback chain (largest to smallest)'
    );

    runner.assert(
        botCode.includes('catch (modelError)'),
        'Has error handling for individual model loads'
    );

    runner.assert(
        botCode.includes('throw new Error(\'All models failed to load\')'),
        'Throws error when all models fail'
    );

    return runner.summary();
}

async function testModelConfigurations() {
    const runner = new TestRunner('Model Configuration Tests');
    console.log('\n' + runner.name);
    console.log('='.repeat(50));

    const botPath = join(__dirname, '../demos/chatbot-evolution/js/gpt-bot.js');
    const botCode = readFileSync(botPath, 'utf-8');

    const modelsMatch = botCode.match(/this\.models = \[([\s\S]*?)\];/);
    runner.assert(modelsMatch !== null, 'Models array is defined');

    if (modelsMatch) {
        const modelsSection = modelsMatch[1];
        
        const modelCount = (modelsSection.match(/name:/g) || []).length;
        runner.assertEqual(modelCount, 3, 'Has exactly 3 models configured');

        runner.assert(
            modelsSection.includes('HuggingFaceTB/'),
            'Uses HuggingFaceTB models (Transformers.js compatible)'
        );

        runner.assert(
            modelsSection.includes('displayName:'),
            'Models have display names for UI'
        );

        runner.assert(
            modelsSection.includes('params:'),
            'Models have parameter counts'
        );

        runner.assert(
            modelsSection.includes('year: 2024'),
            'Models are from 2024 (SmolLM2 release)'
        );
    }

    return runner.summary();
}

async function testArchitectureInfo() {
    const runner = new TestRunner('Architecture Info Tests');
    console.log('\n' + runner.name);
    console.log('='.repeat(50));

    const botPath = join(__dirname, '../demos/chatbot-evolution/js/gpt-bot.js');
    const botCode = readFileSync(botPath, 'utf-8');

    runner.assert(
        botCode.includes('SmolLM2-135M'),
        'Has SmolLM2-135M architecture info'
    );

    runner.assert(
        botCode.includes('SmolLM2-360M'),
        'Has SmolLM2-360M architecture info'
    );

    runner.assert(
        botCode.includes('SmolLM2-1.7B'),
        'Has SmolLM2-1.7B architecture info'
    );

    runner.assert(
        botCode.includes('keyFeatures:'),
        'Includes key features for educational display'
    );

    runner.assert(
        botCode.includes('Optimized for browser/edge deployment'),
        'Documents browser optimization'
    );

    runner.assert(
        botCode.includes('RoPE'),
        'Documents position encoding (RoPE)'
    );

    return runner.summary();
}

async function testResponseHandling() {
    const runner = new TestRunner('Response Handling Tests');
    console.log('\n' + runner.name);
    console.log('='.repeat(50));

    const botPath = join(__dirname, '../demos/chatbot-evolution/js/gpt-bot.js');
    const botCode = readFileSync(botPath, 'utf-8');

    runner.assert(
        botCode.includes('max_new_tokens: 256'),
        'Limits response length'
    );

    runner.assert(
        botCode.includes('temperature: 0.7'),
        'Uses moderate temperature for variety'
    );

    runner.assert(
        botCode.includes('repetition_penalty: 1.1'),
        'Has repetition penalty'
    );

    runner.assert(
        botCode.includes('/<\\|.*?\\|>/g'),
        'Cleans special tokens from response'
    );

    runner.assert(
        botCode.includes('/<think>[\\s\\S]*?<\\/think>/g'),
        'Removes thinking blocks from response'
    );

    runner.assert(
        botCode.includes('fallbacks'),
        'Has fallback responses for empty generations'
    );

    return runner.summary();
}

async function main() {
    console.log('GPT Bot Loading Tests');
    console.log('='.repeat(60));

    const results = await Promise.all([
        testGPTBotStructure(),
        testModelConfigurations(),
        testArchitectureInfo(),
        testResponseHandling()
    ]);

    const allPassed = results.every(r => r);

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        console.log('All GPT Bot tests passed!');
        process.exit(0);
    } else {
        console.log('Some tests failed.');
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
