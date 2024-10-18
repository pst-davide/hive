import {Repository, SelectQueryBuilder} from 'typeorm';
import {buildQuery, QueryCondition} from '../utils/query-builder';
import {Branch} from '../entity/location.entity';

export class LocationRepository extends Repository<Branch> {

  /**********************************************************************************
   *
   * Select
   *
   * *******************************************************************************/

  public async findAll(): Promise<Branch[]> {
      return await this.find();
  }

  public async findByConditions(conditions: QueryCondition[]): Promise<Branch[]> {
    const queryBuilder: SelectQueryBuilder<Branch> = this.createQueryBuilder('room');
    return buildQuery(queryBuilder, conditions).getMany();
  }

  public async findById(id: string): Promise<Branch | null> {
    return await this.findOneBy({ id });
  }

  /**********************************************************************************
   *
   * Update
   *
   * *******************************************************************************/

  public async saveDoc(doc: Branch): Promise<Branch> {
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
