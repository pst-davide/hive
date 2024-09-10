import {Repository, SelectQueryBuilder} from 'typeorm';
import {buildQuery, QueryCondition} from '../utils/query-builder';
import {Location} from '../entity/location.entity';

export class LocationRepository extends Repository<Location> {

  /**********************************************************************************
   *
   * Select
   *
   * *******************************************************************************/

  public async findAll(): Promise<Location[]> {
      return await this.find();
  }

  public async findByConditions(conditions: QueryCondition[]): Promise<Location[]> {
    const queryBuilder: SelectQueryBuilder<Location> = this.createQueryBuilder('room');
    return buildQuery(queryBuilder, conditions).getMany();
  }

  public async findById(id: string): Promise<Location | null> {
    return await this.findOneBy({ id });
  }

  /**********************************************************************************
   *
   * Update
   *
   * *******************************************************************************/

  public async saveDoc(doc: Location): Promise<Location> {
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
