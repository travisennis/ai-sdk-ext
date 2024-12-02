import fs from "node:fs";
import {
	Experimental_LanguageModelV1Middleware as LanguageModelV1Middleware,
	LanguageModelV1StreamPart,
} from "ai";

export const auditMessage: LanguageModelV1Middleware = {
	wrapGenerate: async ({ doGenerate, params }) => {
		console.log("audit message middleware");
		const result = await doGenerate();

		const msg = {
			prompt: params.prompt,
			response: result.text,
		};

		const writeStream = fs.createWriteStream("messages.jsonl", { flags: "a" });
		writeStream.write(`${JSON.stringify(msg)}\n`);

		return result;
	},

	wrapStream: async ({ doStream, params }) => {
		const { stream, ...rest } = await doStream();

		let generatedText = "";

		const transformStream = new TransformStream<
			LanguageModelV1StreamPart,
			LanguageModelV1StreamPart
		>({
			transform(chunk, controller) {
				if (chunk.type === "text-delta") {
					generatedText += chunk.textDelta;
				}

				controller.enqueue(chunk);
			},

			flush() {
				const msg = {
					prompt: params.prompt,
					response: generatedText,
				};

				const writeStream = fs.createWriteStream("messages.jsonl", {
					flags: "a",
				});
				writeStream.write(`${JSON.stringify(msg)}\n`);
			},
		});

		return {
			stream: stream.pipeThrough(transformStream),
			...rest,
		};
	},
};
