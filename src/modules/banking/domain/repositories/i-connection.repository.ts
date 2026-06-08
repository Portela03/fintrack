import { PluggyConnection } from '../entities/pluggy-connection.entity';

export interface IConnectionRepository {
  findById(id: string): Promise<PluggyConnection | null>;
  findByItemId(itemId: string): Promise<PluggyConnection | null>;
  findAllByUserId(userId: string): Promise<PluggyConnection[]>;
  save(connection: PluggyConnection): Promise<void>;
  update(connection: PluggyConnection): Promise<void>;
}

export const CONNECTION_REPOSITORY = Symbol('IConnectionRepository');
