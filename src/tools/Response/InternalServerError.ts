export const InternalServerError = (err: unknown): Response =>
  new Response(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err as any,
    {
      status: 500,
    });
