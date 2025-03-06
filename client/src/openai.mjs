// test.js
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: 'sk-xxxA' });

const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
        { role: "developer", content: "You are a helpful assistant." },
        {
            role: "user",
            content: "Write a haiku about recursion in programming.",
        },
    ],
    store: true,
});

console.log(completion.choices[0].message);