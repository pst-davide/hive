import {Repository, SelectQueryBuilder} from 'typeorm';
import {Room} from '../entity/room.entity';
import {buildQuery, QueryCondition} from '../core/query-builder';

export class RoomRepository extends Repository<Room> {

  /**********************************************************************************
   *
   * Select
   *
   * *******************************************************************************/

  public async findAllRooms(): Promise<Room[]> {
      return await this.find();
  }

  public async findRoomsByConditions(conditions: QueryCondition[]): Promise<Room[]> {
    const queryBuilder: SelectQueryBuilder<Room> = this.createQueryBuilder('room');
    return buildQuery(queryBuilder, conditions).getMany();
  }

  public async findRoomById(id: string): Promise<Room | null> {
    return await this.findOneBy({ id });
  }

  /**********************************************************************************
   *
   * Update
   *
   * *******************************************************************************/

  public async saveRoom(room: Room): Promise<Room> {
    return await this.save(room);
  }

  /**********************************************************************************
   *
   * Delete
   *
   * *******************************************************************************/

  public async deleteRoom(id: number): Promise<void> {
    await this.delete(id);
  }

}
