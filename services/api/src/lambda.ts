import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { appRouter } from "./router";
import { createContext } from "./trpc";
import { auth } from "./lib/auth";
import { handleChatInternal } from "./lib/chat-internal";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";

const trpcHandler = awsLambdaRequestHandler({
  router: appRouter,
  createContext,
});

// Convert Lambda proxy event (v2) to Web Request for Better Auth
function lambdaEventToRequest(event: APIGatewayProxyEventV2): Request {
  const host = event.requestContext?.domainName ?? "localhost";
  const url = `https://${host}${event.rawPath}${event.rawQueryString ? `?${event.rawQueryString}` : ""}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(event.headers)) {
    if (value) headers.set(key, value);
  }
  return new Request(url, {
    method: event.requestContext?.http?.method ?? "GET",
    headers,
    body: event.body
      ? event.isBase64Encoded
        ? Buffer.from(event.body, "base64")
        : event.body
      : undefined,
  });
}

// Convert Web Response back to Lambda proxy result
async function responseToLambdaResult(
  response: Response,
): Promise<APIGatewayProxyResultV2> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return {
    statusCode: response.status,
    headers,
    body: await response.text(),
  };
}

// Routes:
//   /auth/*           → Better Auth
//   /internal/chat/*  → chat-ws Worker callbacks (HMAC-gated, never client-callable)
//   everything else   → tRPC
export async function handler(
  event: APIGatewayProxyEventV2,
  context: unknown,
): Promise<APIGatewayProxyResultV2> {
  const path = event.rawPath ?? "";

  if (path.startsWith("/auth")) {
    const request = lambdaEventToRequest(event);
    const response = await auth.handler(request);
    return responseToLambdaResult(response);
  }

  if (path.startsWith("/internal/chat/")) {
    const request = lambdaEventToRequest(event);
    const response = await handleChatInternal(request, path);
    if (response) return responseToLambdaResult(response);
  }

  // tRPC handles everything else. Strip the /trpc mount prefix so the Lambda
  // adapter sees procedure paths at the root.
  let trpcEvent = event;
  if (path.startsWith("/trpc/")) {
    trpcEvent = { ...event, rawPath: path.slice("/trpc".length) };
  } else if (path === "/trpc") {
    trpcEvent = { ...event, rawPath: "/" };
  }

  return trpcHandler(
    trpcEvent,
    context as never,
  ) as Promise<APIGatewayProxyResultV2>;
}
