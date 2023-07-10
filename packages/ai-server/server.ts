import { Configuration, OpenAIApi } from "openai";

import Fastify from "fastify";
import cors from "@fastify/cors";

const fastify = Fastify({
    logger: true,
});
await fastify.register(cors, {});

await fastify.register(import("@fastify/rate-limit"), {
    max: 20,
    timeWindow: "1 minute",
});

const openaiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
});
const openai = new OpenAIApi(openaiConfig);

const cache = {};

fastify.post("/v1/coding", async (request, reply) => {
    const cacheKey = JSON.stringify({ body: request.body });
    // console.log(cacheKey);
    const cacheValue = cache[cacheKey];
    if (cacheValue) {
        return cacheValue;
    }

    const { systemPrompt, userPrompt, temperature, model } = request.body as any;

    const chat_completion = await openai.createChatCompletion({
        model,
        temperature,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
    });
    const result = { completion: chat_completion.data };
    cache[cacheKey] = result;

    reply.type("application/json").code(200);
    return result;
});

const port = +(process.env.PORT ?? "0") || 3000;
fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) throw err;
});
