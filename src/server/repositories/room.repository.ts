import {Repository, SelectQueryBuilder} from 'typeorm';
import {Room} from '../entity/room.entity';
import {buildQuery, QueryCondition} from '../utils/query-builder';

export class RoomRepository extends Repository<Room> {

  /**********************************************************************************
   *
   * Select
   *
   * *******************************************************************************/

  public async findAll(): Promise<Room[]> {
      return await this.find();
  }

  public async findByConditions(conditions: QueryCondition[]): Promise<Room[]> {
    const queryBuilder: SelectQueryBuilder<Room> = this.createQueryBuilder('room');
    return buildQuery(queryBuilder, conditions).getMany();
  }

  public async findById(id: string): Promise<Room | null> {
    return await this.findOneBy({ id });
  }

  /**********************************************************************************
   *
   * Update
   *
   * *******************************************************************************/

  public async saveDoc(doc: Room): Promise<Room> {
    return await this.save(doc);
  }

  /**********************************************************************************
   *
   * Delete
   *
   * *******************************************************************************/

  public async deleteDoc(id: number): Promise<void> {
    await this.delete(id);
  }

}
