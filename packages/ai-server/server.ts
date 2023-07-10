import { Configuration, OpenAIApi } from "openai";

import Fastify from "fastify";
import cors from "@fastify/cors";

const fastify = Fastify({
    logger: true,
});
await fastify.register(cors, {});

await fastify.register(import("@fastify/rate-limit"), {
    max: 60,
    timeWindow: "1 minute",
});

const openaiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(openaiConfig);

fastify.post("/v1/coding", async (request, reply) => {
    console.log({ body: request.body });
    const { systemPrompt, userPrompt } = request.body as any;

    const chat_completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
    });

    reply.type("application/json").code(200);
    return { completion: chat_completion.data };
});

const port = +(process.env.PORT ?? "0") || 3000;
fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) throw err;
});
