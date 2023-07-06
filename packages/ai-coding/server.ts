import { Configuration, OpenAIApi } from "openai";

import Fastify from "fastify";
const fastify = Fastify({
    logger: true,
});

const openaiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(openaiConfig);

fastify.get("/v1/coding", async (request, reply) => {
    const chat_completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello world" }],
    });

    reply.type("application/json").code(200);
    return { x: chat_completion.data };
});

const port = +(process.env.PORT ?? "0") || 3000;
fastify.listen({ port }, (err, address) => {
    if (err) throw err;
});
