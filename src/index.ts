import { ApolloLink, Operation, NextLink, Observable, FetchResult } from 'apollo-link';
import { ApolloCache } from 'apollo-cache';
import { getMainDefinition } from 'apollo-utilities';
import { OperationDefinitionNode } from 'graphql';

// turns 10d into number of ms
function msTime(str: string): number {
  const types: any = { ms: 1 };
  types.s = types.ms * 1000;
  types.m = types.s * 60;
  types.h = types.m * 60;
  types.d = types.h * 24;
  types.w = types.d * 7;

  const num = parseInt(str.replace(/[a-z]+/i, ''), 10);
  const type = str.replace(/[0-9]+/, '');

  return num * types[type];
}

export interface MaxAgeOptions {
  cache: ApolloCache<any>;
  toKey?: (op: Operation) => string;
}

export class MaxAgeLink extends ApolloLink {
  scheduled: Map<string, Date> = new Map();

  constructor(private options: MaxAgeOptions) {
    super();
  }

  public request(op: Operation, forward: NextLink): Observable<FetchResult> | null {
    const ctx = op.getContext();
    const isQuery = (getMainDefinition(op.query) as OperationDefinitionNode).operation === 'query';

    if (!isQuery || !ctx.maxAge) {
      return forward(op);
    }

    const key = this.toKey(op);

    if (this.shouldUseNetwork(key)) {
      const now = new Date();
      const maxAge: number = typeof ctx.maxAge === 'string' ? msTime(ctx.maxAge) : ctx.maxAge;
      const expirationDate = new Date(now.getTime() + maxAge);

      this.schedule(key, expirationDate);

      return forward(op);
    }

    return new Observable(observer => {
      try {
        const data = this.options.cache.readQuery({
          query: op.query,
          variables: op.variables,
        });

        observer.next({ data });
        observer.complete();
      } catch (e) {
        observer.error(e);
      }
    });
  }

  private shouldUseNetwork(key: string): boolean {
    return this.isExpired(key) || !this.scheduled.has(key);
  }

  private isExpired(key: string): boolean {
    return this.scheduled.get(key) < new Date();
  }

  private schedule(key: string, date: Date): void {
    this.scheduled.set(key, date);
  }

  private toKey(op: Operation): string {
    return this.options.toKey ? this.options.toKey(op) : op.toKey();
  }
}