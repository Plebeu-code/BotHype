export interface IRateLimit {
  limit: number
  readonly max_limit: number
  addLimit: number | Promise<unknown>
}