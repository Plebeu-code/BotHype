import { IRateLimit } from "./IRateLimit";

export default class RateLimit implements IRateLimit {
  public limit: number = 0
  public reached_limits: number = 0
  public last_verification_timestamp: number = Date.now()

  constructor(
    public readonly max_limit: number,
    protected readonly reset_after: number
  ) { }

  get addLimit() {
    if (Math.floor((Date.now() - this.last_verification_timestamp) / 1000 ) > this.reset_after / 1000) {
      this.limit = 0
      this.last_verification_timestamp = Date.now()
      return this.limit += 1
    }

    this.last_verification_timestamp = Date.now()

    if (this.limit < this.max_limit) {
      this.limit += 1;
      return this.limit
    }

    return new Promise(
      (resolve) => {
        setTimeout(() => {
          this.reached_limits += 1
          this.limit = 0;
          resolve(this.limit);
        }, this.reset_after)
      }
    ); 
  }
}
